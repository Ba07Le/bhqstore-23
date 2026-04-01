const crypto = require("crypto");
const https = require("https");
const { URL } = require("url");

const MOMO_SUCCESS_CODE = 0;
const VNPAY_SUCCESS_CODE = "00";

const normalizeBaseUrl = (value = "") => String(value || "").replace(/\/+$/, "");

const getRequestHost = (req) =>
  req?.headers?.["x-forwarded-host"] || req?.get?.("host") || "";

const getRequestProtocol = (req) =>
  req?.headers?.["x-forwarded-proto"] || req?.protocol || "http";

const getOriginFromReferer = (referer) => {
  if (!referer) {
    return "";
  }

  try {
    return new URL(referer).origin;
  } catch (error) {
    return "";
  }
};

const getFrontendBaseUrl = (req) =>
  normalizeBaseUrl(
    process.env.FRONTEND_URL ||
      process.env.ORIGIN ||
      req?.headers?.origin ||
      getOriginFromReferer(req?.headers?.referer)
  );

const getBackendBaseUrl = (req) =>
  normalizeBaseUrl(
    process.env.BACKEND_BASE_URL ||
      (getRequestHost(req)
        ? `${getRequestProtocol(req)}://${getRequestHost(req)}`
        : "")
  );

const isMockPaymentsEnabled = () =>
  process.env.ALLOW_MOCK_PAYMENTS === "true" ||
  (process.env.ALLOW_MOCK_PAYMENTS !== "false" &&
    process.env.PRODUCTION !== "true");

const getMomoConfig = () => ({
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  partnerName: process.env.MOMO_PARTNER_NAME || "BHQ Store",
  storeId: process.env.MOMO_STORE_ID || "BHQStore",
  endpoint:
    process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create",
  requestType: process.env.MOMO_REQUEST_TYPE || "captureWallet",
});

const getVnpayConfig = () => ({
  tmnCode: process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  paymentUrl:
    process.env.VNPAY_PAYMENT_URL ||
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
});

const ensureMomoConfig = () => {
  const config = getMomoConfig();

  if (!config.partnerCode || !config.accessKey || !config.secretKey) {
    throw new Error("MOMO_CONFIG_MISSING");
  }

  return config;
};

const ensureVnpayConfig = () => {
  const config = getVnpayConfig();

  if (!config.tmnCode || !config.hashSecret) {
    throw new Error("VNPAY_CONFIG_MISSING");
  }

  return config;
};

const createRequestId = (orderId, gateway) =>
  `${gateway}_${orderId}_${Date.now()}`;

const createHmacSha256 = (secret, rawSignature) =>
  crypto.createHmac("sha256", secret).update(rawSignature).digest("hex");

const createHmacSha512 = (secret, rawSignature) =>
  crypto.createHmac("sha512", secret).update(rawSignature).digest("hex");

const postJson = (endpoint, payload) =>
  new Promise((resolve, reject) => {
    const targetUrl = new URL(endpoint);
    const requestBody = JSON.stringify(payload);

    const request = https.request(
      {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port || 443,
        path: `${targetUrl.pathname}${targetUrl.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
      },
      (response) => {
        let responseData = "";

        response.on("data", (chunk) => {
          responseData += chunk;
        });

        response.on("end", () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};

            if (response.statusCode >= 200 && response.statusCode < 300) {
              resolve(parsed);
              return;
            }

            reject(parsed);
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);
    request.write(requestBody);
    request.end();
  });

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    return String(forwarded).split(",")[0].trim();
  }

  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    "127.0.0.1"
  );
};

const buildMomoReturnUrl = (req, orderId) =>
  `${getFrontendBaseUrl(req)}/order-success/${orderId}?gateway=momo`;

const buildMomoIpnUrl = (req) =>
  `${getBackendBaseUrl(req)}/orders/payment/momo/ipn`;

const buildMomoExtraData = (orderId) =>
  Buffer.from(JSON.stringify({ orderId, source: "bhqstore" })).toString("base64");

const createMomoPayment = async ({ order, req, customerName, customerPhone }) => {
  const config = ensureMomoConfig();
  const requestId = createRequestId(order._id.toString(), "MOMO");
  const redirectUrl = buildMomoReturnUrl(req, order._id);
  const ipnUrl = buildMomoIpnUrl(req);
  const amount = Number(order.total || 0);
  const extraData = buildMomoExtraData(order._id.toString());

  const rawSignature =
    `accessKey=${config.accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${order._id}` +
    `&orderInfo=Thanh toan don hang ${order._id}` +
    `&partnerCode=${config.partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${config.requestType}`;

  const signature = createHmacSha256(config.secretKey, rawSignature);

  const payload = {
    partnerCode: config.partnerCode,
    partnerName: config.partnerName,
    storeId: config.storeId,
    requestId,
    amount,
    orderId: order._id.toString(),
    orderInfo: `Thanh toan don hang ${order._id}`,
    redirectUrl,
    ipnUrl,
    requestType: config.requestType,
    extraData,
    lang: "vi",
    autoCapture: true,
    orderGroupId: "",
    signature,
    ...(customerName || customerPhone
      ? {
          userInfo: {
            name: customerName || "Khach hang",
            phoneNumber: customerPhone || "",
          },
        }
      : {}),
  };

  const response = await postJson(config.endpoint, payload);

  return {
    gateway: "MOMO",
    requestId,
    payUrl: response.payUrl,
    redirectUrl,
    ipnUrl,
    deeplink: response.deeplink,
    qrCodeUrl: response.qrCodeUrl,
    rawResponse: response,
  };
};

const buildMomoResultSignature = (payload) => {
  const config = ensureMomoConfig();
  const rawSignature =
    `accessKey=${config.accessKey}` +
    `&amount=${payload.amount}` +
    `&extraData=${payload.extraData || ""}` +
    `&message=${payload.message}` +
    `&orderId=${payload.orderId}` +
    `&orderInfo=${payload.orderInfo}` +
    `&orderType=${payload.orderType}` +
    `&partnerCode=${payload.partnerCode}` +
    `&payType=${payload.payType}` +
    `&requestId=${payload.requestId}` +
    `&responseTime=${payload.responseTime}` +
    `&resultCode=${payload.resultCode}` +
    `&transId=${payload.transId}`;

  return createHmacSha256(config.secretKey, rawSignature);
};

const verifyMomoSignature = (payload) => {
  const signature = payload.signature;

  if (!signature) {
    return false;
  }

  const expectedSignature = buildMomoResultSignature(payload);
  return signature === expectedSignature;
};

const encodeVnpValue = (value) =>
  encodeURIComponent(String(value)).replace(/%20/g, "+");

const buildVnpQuery = (params) =>
  Object.keys(params)
    .sort()
    .map((key) => `${encodeVnpValue(key)}=${encodeVnpValue(params[key])}`)
    .join("&");

const buildVnpayReturnUrl = (req, orderId) =>
  `${getFrontendBaseUrl(req)}/order-success/${orderId}?gateway=vnpay`;

const buildVnpayIpnUrl = (req) =>
  `${getBackendBaseUrl(req)}/orders/payment/vnpay/ipn`;

const createMockPaymentUrl = ({ order, gateway, req }) => ({
  gateway,
  requestId: createRequestId(order._id.toString(), `${gateway}_MOCK`),
  payUrl: `${getFrontendBaseUrl(req)}/mock-payment/${order._id}?gateway=${String(
    gateway || ""
  ).toLowerCase()}`,
  ipnUrl: null,
  isMock: true,
});

const createVnpayPaymentUrl = ({ order, req }) => {
  const config = ensureVnpayConfig();
  const createDate = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const baseParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: order._id.toString(),
    vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
    vnp_OrderType: "other",
    vnp_Amount: Number(order.total || 0) * 100,
    vnp_ReturnUrl: buildVnpayReturnUrl(req, order._id),
    vnp_IpAddr: getClientIp(req),
    vnp_CreateDate: createDate,
  };

  const signData = buildVnpQuery(baseParams);
  const secureHash = createHmacSha512(config.hashSecret, signData);
  const query = `${signData}&vnp_SecureHash=${secureHash}`;

  return {
    gateway: "VNPAY",
    payUrl: `${config.paymentUrl}?${query}`,
    requestId: order._id.toString(),
    ipnUrl: buildVnpayIpnUrl(req),
  };
};

const verifyVnpaySignature = (params = {}) => {
  const config = ensureVnpayConfig();
  const clonedParams = Object.keys(params).reduce((accumulator, key) => {
    if (key.startsWith("vnp_")) {
      accumulator[key] = params[key];
    }

    return accumulator;
  }, {});
  const secureHash = clonedParams.vnp_SecureHash;

  delete clonedParams.vnp_SecureHash;
  delete clonedParams.vnp_SecureHashType;

  const signData = buildVnpQuery(clonedParams);
  const expectedHash = createHmacSha512(config.hashSecret, signData);

  return secureHash === expectedHash;
};

const isMomoSuccess = (payload = {}) => Number(payload.resultCode) === MOMO_SUCCESS_CODE;

const isVnpaySuccess = (payload = {}) =>
  payload.vnp_ResponseCode === VNPAY_SUCCESS_CODE &&
  payload.vnp_TransactionStatus === VNPAY_SUCCESS_CODE;

module.exports = {
  buildMomoIpnUrl,
  buildVnpayIpnUrl,
  createMomoPayment,
  createMockPaymentUrl,
  createRequestId,
  createVnpayPaymentUrl,
  ensureMomoConfig,
  ensureVnpayConfig,
  getBackendBaseUrl,
  getClientIp,
  getFrontendBaseUrl,
  isMockPaymentsEnabled,
  isMomoSuccess,
  isVnpaySuccess,
  verifyMomoSignature,
  verifyVnpaySignature,
};
