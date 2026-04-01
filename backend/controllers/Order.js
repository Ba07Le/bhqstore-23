const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  createMomoPayment,
  createMockPaymentUrl,
  createVnpayPaymentUrl,
  ensureMomoConfig,
  ensureVnpayConfig,
  isMockPaymentsEnabled,
  isMomoSuccess,
  isVnpaySuccess,
  verifyMomoSignature,
  verifyVnpaySignature,
} = require("../utils/paymentGateway");

const ORDER_STATUS = {
  PENDING: "Đang chờ xử lý",
  SHIPPED: "Đã gửi",
  DELIVERING: "Đang giao hàng",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

const RANGE_PRESETS = {
  "7d": { label: "7 ngày gần nhất", days: 7, groupBy: "day" },
  "30d": { label: "30 ngày gần nhất", days: 30, groupBy: "day" },
  "90d": { label: "90 ngày gần nhất", days: 90, groupBy: "day" },
  "12m": { label: "12 tháng gần nhất", days: 365, groupBy: "month" },
  all: { label: "Toàn thời gian", days: null, groupBy: "month" },
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

const endOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const startOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);

const endOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const addMonths = (date, amount) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
};

const getDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const formatDayLabel = (date) =>
  `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;

const formatMonthLabel = (date) =>
  `T${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`;

const roundStat = (value) => Number(Number(value || 0).toFixed(1));

const calculateChangePct = (currentValue, previousValue) => {
  if (!previousValue) {
    return currentValue ? 100 : 0;
  }

  return roundStat(((currentValue - previousValue) / previousValue) * 100);
};

const getCustomerKey = (order) => {
  if (order.user?._id) {
    return `user:${order.user._id.toString()}`;
  }

  const address = Array.isArray(order.address)
    ? order.address[0] || {}
    : order.address || {};

  return `guest:${address.phoneNumber || address.street || order._id.toString()}`;
};

const getSafeAddress = (address) => {
  if (Array.isArray(address)) {
    return address[0] || {};
  }

  return address || {};
};

const getOrderItemCount = (items = []) =>
  items.reduce((total, item) => total + (Number(item?.quantity) || 0), 0);

const getOrderWindow = (query, fallbackStartDate) => {
  const now = new Date();
  const range = query.range && RANGE_PRESETS[query.range] ? query.range : "30d";
  const preset = RANGE_PRESETS[range];

  const customFrom = query.from ? new Date(query.from) : null;
  const customTo = query.to ? new Date(query.to) : null;
  const hasCustomRange =
    customFrom instanceof Date &&
    !Number.isNaN(customFrom.getTime()) &&
    customTo instanceof Date &&
    !Number.isNaN(customTo.getTime());

  if (hasCustomRange) {
    const startDate = startOfDay(customFrom);
    const endDate = endOfDay(customTo);
    const diffDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
    );

    return {
      range: "custom",
      label: "Khoảng thời gian tùy chỉnh",
      startDate,
      endDate,
      previousStartDate: startOfDay(addDays(startDate, -diffDays)),
      previousEndDate: endOfDay(addDays(startDate, -1)),
      groupBy: diffDays > 92 ? "month" : "day",
    };
  }

  if (range === "all") {
    const startDate = fallbackStartDate
      ? startOfMonth(fallbackStartDate)
      : startOfMonth(addMonths(now, -11));

    return {
      range,
      label: preset.label,
      startDate,
      endDate: endOfDay(now),
      previousStartDate: null,
      previousEndDate: null,
      groupBy: preset.groupBy,
    };
  }

  if (range === "12m") {
    const startDate = startOfMonth(addMonths(now, -11));
    const endDate = endOfDay(now);
    const previousStartDate = startOfMonth(addMonths(startDate, -12));
    const previousEndDate = endOfDay(addDays(startDate, -1));

    return {
      range,
      label: preset.label,
      startDate,
      endDate,
      previousStartDate,
      previousEndDate,
      groupBy: preset.groupBy,
    };
  }

  const startDate = startOfDay(addDays(now, -(preset.days - 1)));
  const endDate = endOfDay(now);

  return {
    range,
    label: preset.label,
    startDate,
    endDate,
    previousStartDate: startOfDay(addDays(startDate, -preset.days)),
    previousEndDate: endOfDay(addDays(startDate, -1)),
    groupBy: preset.groupBy,
  };
};

const buildRevenueSeries = (orders, windowConfig) => {
  const seriesMap = new Map();
  const revenueOrders = orders.filter(
    (order) => order.status !== ORDER_STATUS.CANCELLED
  );

  const seriesStartDate =
    windowConfig.groupBy === "month"
      ? startOfMonth(windowConfig.startDate)
      : startOfDay(windowConfig.startDate);
  const seriesEndDate =
    windowConfig.groupBy === "month"
      ? endOfMonth(windowConfig.endDate)
      : endOfDay(windowConfig.endDate);

  if (windowConfig.groupBy === "month") {
    for (
      let cursor = new Date(seriesStartDate);
      cursor <= seriesEndDate;
      cursor = addMonths(cursor, 1)
    ) {
      const key = getMonthKey(cursor);
      seriesMap.set(key, {
        key,
        label: formatMonthLabel(cursor),
        revenue: 0,
        orders: 0,
      });
    }

    revenueOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = getMonthKey(date);
      const target = seriesMap.get(key);

      if (target) {
        target.revenue += Number(order.total) || 0;
        target.orders += 1;
      }
    });
  } else {
    for (
      let cursor = new Date(seriesStartDate);
      cursor <= seriesEndDate;
      cursor = addDays(cursor, 1)
    ) {
      const key = getDateKey(cursor);
      seriesMap.set(key, {
        key,
        label: formatDayLabel(cursor),
        revenue: 0,
        orders: 0,
      });
    }

    revenueOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = getDateKey(date);
      const target = seriesMap.get(key);

      if (target) {
        target.revenue += Number(order.total) || 0;
        target.orders += 1;
      }
    });
  }

  return Array.from(seriesMap.values()).map((point) => ({
    ...point,
    revenue: Number(point.revenue || 0),
  }));
};

const summarizeOrders = (orders) => {
  const customerKeys = new Set();

  const summary = {
    totalOrders: orders.length,
    grossRevenue: 0,
    deliveredRevenue: 0,
    cancelledRevenue: 0,
    averageOrderValue: 0,
    customersCount: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    cancelledOrders: 0,
    nonCancelledOrders: 0,
    cancellationRate: 0,
    fulfillmentRate: 0,
  };

  orders.forEach((order) => {
    customerKeys.add(getCustomerKey(order));

    const total = Number(order.total) || 0;
    const status = order.status;

    if (status === ORDER_STATUS.CANCELLED) {
      summary.cancelledOrders += 1;
      summary.cancelledRevenue += total;
      return;
    }

    summary.nonCancelledOrders += 1;
    summary.grossRevenue += total;

    if (status === ORDER_STATUS.DELIVERED) {
      summary.deliveredOrders += 1;
      summary.deliveredRevenue += total;
    }

    if (status === ORDER_STATUS.PENDING) {
      summary.pendingOrders += 1;
    }

    if (
      status === ORDER_STATUS.PENDING ||
      status === ORDER_STATUS.SHIPPED ||
      status === ORDER_STATUS.DELIVERING
    ) {
      summary.activeOrders += 1;
    }
  });

  summary.customersCount = customerKeys.size;
  summary.averageOrderValue = summary.nonCancelledOrders
    ? roundStat(summary.grossRevenue / summary.nonCancelledOrders)
    : 0;
  summary.cancellationRate = summary.totalOrders
    ? roundStat((summary.cancelledOrders / summary.totalOrders) * 100)
    : 0;
  summary.fulfillmentRate = summary.nonCancelledOrders
    ? roundStat((summary.deliveredOrders / summary.nonCancelledOrders) * 100)
    : 0;

  return summary;
};

const buildPaymentBreakdown = (orders) => {
  const paymentMap = new Map();

  orders.forEach((order) => {
    const paymentMode = order.paymentMode || "UNKNOWN";
    const current = paymentMap.get(paymentMode) || {
      label: paymentMode,
      count: 0,
      revenue: 0,
    };

    current.count += 1;

    if (order.status !== ORDER_STATUS.CANCELLED) {
      current.revenue += Number(order.total) || 0;
    }

    paymentMap.set(paymentMode, current);
  });

  return Array.from(paymentMap.values()).sort((a, b) => b.revenue - a.revenue);
};

const buildStatusBreakdown = (orders) => {
  const statusMap = new Map();

  Object.values(ORDER_STATUS).forEach((status) => {
    statusMap.set(status, { status, count: 0, revenue: 0 });
  });

  orders.forEach((order) => {
    const status = order.status || "Khác";
    const current = statusMap.get(status) || { status, count: 0, revenue: 0 };

    current.count += 1;
    current.revenue += Number(order.total) || 0;

    statusMap.set(status, current);
  });

  return Array.from(statusMap.values()).sort((a, b) => b.count - a.count);
};

const buildTopProducts = (orders) => {
  const productMap = new Map();

  orders
    .filter((order) => order.status !== ORDER_STATUS.CANCELLED)
    .forEach((order) => {
      (order.item || []).forEach((item) => {
        const product = item?.product || {};
        const productId = String(product._id || product.title || Math.random());
        const quantity = Number(item?.quantity) || 0;
        const revenue = quantity * (Number(product.price) || 0);

        const current = productMap.get(productId) || {
          productId,
          title: product.title || "Sản phẩm không xác định",
          brand: product.brand?.name || product.brand || "",
          thumbnail: product.thumbnail || "",
          quantity: 0,
          revenue: 0,
          orders: 0,
        };

        current.quantity += quantity;
        current.revenue += revenue;
        current.orders += 1;

        productMap.set(productId, current);
      });
    });

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);
};

const buildTopCustomers = (orders) => {
  const customerMap = new Map();

  orders
    .filter((order) => order.status !== ORDER_STATUS.CANCELLED)
    .forEach((order) => {
      const customerKey = getCustomerKey(order);
      const address = getSafeAddress(order.address);
      const current = customerMap.get(customerKey) || {
        customerKey,
        name: order.user?.name || address.type || "Khách vãng lai",
        email: order.user?.email || "",
        orders: 0,
        spent: 0,
        lastOrderAt: order.createdAt,
      };

      current.orders += 1;
      current.spent += Number(order.total) || 0;
      current.lastOrderAt =
        new Date(current.lastOrderAt) > new Date(order.createdAt)
          ? current.lastOrderAt
          : order.createdAt;

      customerMap.set(customerKey, current);
    });

  return Array.from(customerMap.values())
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6);
};

const buildRecentOrders = (orders) =>
  orders.slice(0, 6).map((order) => {
    const address = getSafeAddress(order.address);

    return {
      _id: order._id,
      status: order.status,
      total: Number(order.total) || 0,
      paymentMode: order.paymentMode,
      createdAt: order.createdAt,
      itemCount: getOrderItemCount(order.item),
      firstItemTitle:
        order.item?.[0]?.product?.title || "Sản phẩm đang cập nhật",
      city: address.city || "",
      customer: {
        name: order.user?.name || address.type || "Khách vãng lai",
        email: order.user?.email || "",
      },
    };
  });

const buildInventoryOverview = (products) => {
  const totalProducts = products.length;
  const activeProducts = products.filter((product) => !product.isDeleted);
  const deletedProducts = products.filter((product) => product.isDeleted).length;
  const lowStockProducts = activeProducts.filter(
    (product) => product.stockQuantity > 0 && product.stockQuantity <= 20
  );
  const outOfStockProducts = activeProducts.filter(
    (product) => product.stockQuantity <= 0
  );

  const alerts = [...lowStockProducts, ...outOfStockProducts]
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 6)
    .map((product) => ({
      _id: product._id,
      title: product.title,
      brand: product.brand?.name || "",
      thumbnail: product.thumbnail,
      stockQuantity: product.stockQuantity,
      price: product.price,
      isDeleted: product.isDeleted,
    }));

  return {
    metrics: {
      totalProducts,
      activeProducts: activeProducts.length,
      deletedProducts,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      inventoryValue: activeProducts.reduce(
        (total, product) =>
          total + (Number(product.price) || 0) * Math.max(Number(product.stockQuantity) || 0, 0),
        0
      ),
    },
    alerts,
  };
};

const getPaymentConfigErrorMessage = (gateway) =>
  gateway === "MOMO"
    ? "MoMo chua duoc cau hinh tren server."
    : "VNPAY chua duoc cau hinh tren server.";

const validateOrderPayload = (order = {}) => {
  if (!Array.isArray(order.item) || !order.item.length) {
    return "Gio hang dang trong.";
  }

  if (!order.address) {
    return "Chua co dia chi giao hang.";
  }

  if (!Number(order.total) || Number(order.total) <= 0) {
    return "Tong thanh toan khong hop le.";
  }

  return null;
};

const finalizePaymentOrder = async ({
  order,
  gateway,
  isSuccess,
  transactionId,
  payload,
}) => {
  const paymentStatus = isSuccess ? "paid" : "failed";
  const nextStatus = isSuccess ? ORDER_STATUS.PENDING : ORDER_STATUS.CANCELLED;

  if (
    order.paymentStatus === paymentStatus &&
    String(order.paymentTransactionId || "") === String(transactionId || "")
  ) {
    return order;
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    order._id,
    {
      paymentStatus,
      status: nextStatus,
      paymentTransactionId: transactionId ? String(transactionId) : order.paymentTransactionId,
      paidAt: isSuccess ? new Date() : order.paidAt,
      paymentMeta: {
        ...(order.paymentMeta || {}),
        gateway,
        lastPayload: payload,
        verifiedAt: new Date(),
      },
    },
    { new: true }
  )
    .populate("user", "name email")
    .lean();

  return updatedOrder;
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "name email").lean();

    if (!order) {
      return res.status(404).json({ message: "Khong tim thay don hang." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Loi khi tai don hang, vui long thu lai sau." });
  }
};

exports.createPaymentSession = async (req, res) => {
  let createdOrder = null;

  try {
    const { gateway, order } = req.body || {};
    const paymentGateway = String(gateway || "").toUpperCase();
    let useMockGateway = false;

    if (!["MOMO", "VNPAY"].includes(paymentGateway)) {
      return res.status(400).json({ message: "Cong thanh toan khong hop le." });
    }

    const payloadError = validateOrderPayload(order);

    if (payloadError) {
      return res.status(400).json({ message: payloadError });
    }

    try {
      if (paymentGateway === "MOMO") {
        ensureMomoConfig();
      } else {
        ensureVnpayConfig();
      }
    } catch (configError) {
      if (isMockPaymentsEnabled()) {
        useMockGateway = true;
      } else {
        return res
          .status(500)
          .json({ message: getPaymentConfigErrorMessage(paymentGateway) });
      }
    }

    createdOrder = new Order({
      ...order,
      user: order.user || null,
      paymentMode: paymentGateway,
      paymentStatus: "pending",
      paymentMeta: {
        gateway: paymentGateway,
        initializedAt: new Date(),
      },
    });

    await createdOrder.save();

    let updatedOrder = null;

    try {
      const safeAddress = getSafeAddress(order.address);
      const session =
        useMockGateway
          ? createMockPaymentUrl({
              order: createdOrder,
              gateway: paymentGateway,
              req,
            })
          : paymentGateway === "MOMO"
          ? await createMomoPayment({
              order: createdOrder,
              req,
              customerName: safeAddress.type,
              customerPhone: safeAddress.phoneNumber,
            })
          : createVnpayPaymentUrl({ order: createdOrder, req });

      updatedOrder = await Order.findByIdAndUpdate(
        createdOrder._id,
        {
          paymentMeta: {
            ...(createdOrder.paymentMeta || {}),
            gateway: paymentGateway,
            providerMode: session.isMock ? "mock" : "live",
            paymentRequestId: session.requestId,
            paymentInitAt: new Date(),
            payUrl: session.payUrl,
            ipnUrl: session.ipnUrl,
          },
        },
        { new: true }
      )
        .populate("user", "name email")
        .lean();

      return res.status(200).json({
        orderId: updatedOrder._id,
        gateway: paymentGateway,
        payUrl: session.payUrl,
        isMock: Boolean(session.isMock),
        order: updatedOrder,
      });
    } catch (sessionError) {
      await Order.findByIdAndUpdate(createdOrder._id, {
        paymentStatus: "failed",
        status: ORDER_STATUS.CANCELLED,
        paymentMeta: {
          ...(createdOrder.paymentMeta || {}),
          gateway: paymentGateway,
          failedAt: new Date(),
          sessionError:
            sessionError?.message ||
            sessionError?.localMessage ||
            sessionError?.errorCode ||
            "PAYMENT_SESSION_FAILED",
        },
      });

      console.log(sessionError);

      return res.status(500).json({
        message:
          paymentGateway === "MOMO"
            ? "Khong the khoi tao phien thanh toan MoMo, vui long thu lai sau."
            : "Khong the khoi tao lien ket thanh toan VNPAY, vui long thu lai sau.",
      });
    }
  } catch (error) {
    if (createdOrder?._id) {
      await Order.findByIdAndUpdate(createdOrder._id, {
        paymentStatus: "failed",
        status: ORDER_STATUS.CANCELLED,
        paymentMeta: {
          ...(createdOrder.paymentMeta || {}),
          gateway: createdOrder.paymentMode,
          failedAt: new Date(),
          sessionError: error?.message || "PAYMENT_SESSION_FAILED",
        },
      }).catch(() => null);
    }

    console.log(error);
    return res.status(500).json({
      message: "Khong the khoi tao phien thanh toan, vui long thu lai sau.",
    });
  }
};

exports.completeMockPayment = async (req, res) => {
  try {
    if (!isMockPaymentsEnabled()) {
      return res.status(403).json({
        message: "Che do mo phong thanh toan dang bi tat.",
      });
    }

    const { orderId, gateway, success } = req.body || {};
    const paymentGateway = String(gateway || "").toUpperCase();

    if (!orderId) {
      return res.status(400).json({ message: "Thieu ma don hang." });
    }

    if (!["MOMO", "VNPAY"].includes(paymentGateway)) {
      return res.status(400).json({ message: "Cong thanh toan khong hop le." });
    }

    const order = await Order.findById(orderId).populate("user", "name email").lean();

    if (!order) {
      return res.status(404).json({ message: "Khong tim thay don hang." });
    }

    const isSuccess = success !== false;
    const updatedOrder = await finalizePaymentOrder({
      order,
      gateway: paymentGateway,
      isSuccess,
      transactionId: isSuccess ? `MOCK_${paymentGateway}_${Date.now()}` : null,
      payload: {
        mock: true,
        success: isSuccess,
        completedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: isSuccess,
      gateway: paymentGateway,
      order: updatedOrder,
      message: isSuccess
        ? "Da mo phong thanh toan thanh cong."
        : "Da mo phong thanh toan that bai.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Khong the hoan tat thanh toan mo phong.",
    });
  }
};

exports.verifyPaymentReturn = async (req, res) => {
  try {
    const { gateway, params } = req.body || {};
    const paymentGateway = String(gateway || "").toUpperCase();
    const payload = params || {};

    if (!["MOMO", "VNPAY"].includes(paymentGateway)) {
      return res.status(400).json({ message: "Cong thanh toan khong hop le." });
    }

    const orderId =
      paymentGateway === "MOMO" ? payload.orderId : payload.vnp_TxnRef;

    if (!orderId) {
      return res.status(400).json({ message: "Thieu ma don hang de xac minh." });
    }

    const order = await Order.findById(orderId).populate("user", "name email").lean();

    if (!order) {
      return res.status(404).json({ message: "Khong tim thay don hang." });
    }

    const signatureValid =
      paymentGateway === "MOMO"
        ? verifyMomoSignature(payload)
        : verifyVnpaySignature(payload);

    if (!signatureValid) {
      return res.status(400).json({ message: "Chu ky thanh toan khong hop le." });
    }

    const isSuccess =
      paymentGateway === "MOMO"
        ? isMomoSuccess(payload)
        : isVnpaySuccess(payload);

    const amountFromGateway =
      paymentGateway === "MOMO"
        ? Number(payload.amount || 0)
        : Number(payload.vnp_Amount || 0) / 100;

    if (Number(order.total) !== amountFromGateway) {
      return res.status(400).json({ message: "So tien thanh toan khong khop." });
    }

    const updatedOrder = await finalizePaymentOrder({
      order,
      gateway: paymentGateway,
      isSuccess,
      transactionId:
        paymentGateway === "MOMO" ? payload.transId : payload.vnp_TransactionNo,
      payload,
    });

    res.status(200).json({
      success: isSuccess,
      gateway: paymentGateway,
      order: updatedOrder,
      message: isSuccess
        ? "Thanh toan thanh cong."
        : "Thanh toan khong thanh cong.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Khong the xac minh ket qua thanh toan.",
    });
  }
};

exports.handleMomoIpn = async (req, res) => {
  try {
    const payload = req.body || {};
    const orderId = payload.orderId;

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId." });
    }

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (!verifyMomoSignature(payload)) {
      return res.status(400).json({ message: "Invalid signature." });
    }

    await finalizePaymentOrder({
      order,
      gateway: "MOMO",
      isSuccess: isMomoSuccess(payload),
      transactionId: payload.transId,
      payload,
    });

    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "IPN processing failed." });
  }
};

exports.handleVnpayIpn = async (req, res) => {
  try {
    const payload = req.query || {};
    const orderId = payload.vnp_TxnRef;

    if (!orderId) {
      return res.status(200).json({ RspCode: "01", Message: "Order not found" });
    }

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return res.status(200).json({ RspCode: "01", Message: "Order not found" });
    }

    if (!verifyVnpaySignature(payload)) {
      return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
    }

    const gatewayAmount = Number(payload.vnp_Amount || 0) / 100;

    if (Number(order.total) !== gatewayAmount) {
      return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
    }

    await finalizePaymentOrder({
      order,
      gateway: "VNPAY",
      isSuccess: isVnpaySuccess(payload),
      transactionId: payload.vnp_TransactionNo,
      payload,
    });

    return res.status(200).json({ RspCode: "00", Message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

exports.create = async (req, res) => {
  try {
    const created = new Order(req.body);
    await created.save();
    const populatedOrder = await Order.findById(created._id)
      .populate("user", "name email")
      .lean();
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Lỗi khi tạo đơn hàng, vui lòng thử lại sau." });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const results = await Order.find({ user: id }).sort({ createdAt: -1 }).lean();
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Lỗi khi tải đơn hàng, vui lòng thử lại sau." });
  }
};

exports.getAll = async (req, res) => {
  try {
    let skip = 0;
    let limit = 0;

    if (req.query.page && req.query.limit) {
      const pageSize = parseInt(req.query.limit, 10);
      const page = parseInt(req.query.page, 10);
      skip = pageSize * (page - 1);
      limit = pageSize;
    }

    const totalDocs = await Order.countDocuments({});
    const results = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    res.header("X-Total-Count", totalDocs);
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Lỗi khi tải đơn hàng, vui lòng thử lại sau." });
  }
};

exports.getOverview = async (req, res) => {
  try {
    const oldestOrder = await Order.findOne({}).sort({ createdAt: 1 }).lean();
    const windowConfig = getOrderWindow(req.query, oldestOrder?.createdAt || null);

    const currentFilter = {
      createdAt: {
        $gte: windowConfig.startDate,
        $lte: windowConfig.endDate,
      },
    };

    const previousFilter =
      windowConfig.previousStartDate && windowConfig.previousEndDate
        ? {
            createdAt: {
              $gte: windowConfig.previousStartDate,
              $lte: windowConfig.previousEndDate,
            },
          }
        : null;

    const [orders, previousOrders, products] = await Promise.all([
      Order.find(currentFilter)
        .sort({ createdAt: -1 })
        .populate("user", "name email")
        .lean(),
      previousFilter
        ? Order.find(previousFilter).populate("user", "name email").lean()
        : Promise.resolve([]),
      Product.find({}).populate("brand", "name").lean(),
    ]);

    const currentSummary = summarizeOrders(orders);
    const previousSummary = summarizeOrders(previousOrders);
    const inventory = buildInventoryOverview(products);

    res.status(200).json({
      window: {
        range: windowConfig.range,
        label: windowConfig.label,
        startDate: windowConfig.startDate,
        endDate: windowConfig.endDate,
        previousStartDate: windowConfig.previousStartDate,
        previousEndDate: windowConfig.previousEndDate,
      },
      overview: {
        ...currentSummary,
        revenueChangePct: previousFilter
          ? calculateChangePct(
              currentSummary.grossRevenue,
              previousSummary.grossRevenue
            )
          : 0,
        orderChangePct: previousFilter
          ? calculateChangePct(
              currentSummary.totalOrders,
              previousSummary.totalOrders
            )
          : 0,
        customerChangePct: previousFilter
          ? calculateChangePct(
              currentSummary.customersCount,
              previousSummary.customersCount
            )
          : 0,
        averageOrderValueChangePct: previousFilter
          ? calculateChangePct(
              currentSummary.averageOrderValue,
              previousSummary.averageOrderValue
            )
          : 0,
        deliveredRevenueChangePct: previousFilter
          ? calculateChangePct(
              currentSummary.deliveredRevenue,
              previousSummary.deliveredRevenue
            )
          : 0,
      },
      revenueSeries: buildRevenueSeries(orders, windowConfig),
      paymentBreakdown: buildPaymentBreakdown(orders),
      orderStatusBreakdown: buildStatusBreakdown(orders),
      topProducts: buildTopProducts(orders),
      topCustomers: buildTopCustomers(orders),
      recentOrders: buildRecentOrders(orders),
      inventory,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Không thể tải thống kê doanh thu, vui lòng thử lại sau.",
    });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Order.findByIdAndUpdate(id, req.body, { new: true })
      .populate("user", "name email")
      .lean();
    res.status(200).json(updated);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật đơn hàng, vui lòng thử lại sau." });
  }
};
