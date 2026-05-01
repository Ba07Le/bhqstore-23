import * as XLSX from "xlsx";

const INVENTORY_SHEET_NAME = "TonKho";
const GUIDE_SHEET_NAME = "HuongDan";
const SNAPSHOT_HEADERS = [
  "productId",
  "title",
  "brand",
  "category",
  "price",
  "currentStock",
  "status",
  "importQuantity",
  "exportQuantity",
  "setStockQuantity",
  "note",
];

const GUIDE_ROWS = [
  {
    field: "productId",
    meaning: "Bat buoc. Ma san pham trong he thong.",
  },
  {
    field: "currentStock",
    meaning: "Chi de tham chieu, khong duoc dung de cap nhat.",
  },
  {
    field: "importQuantity",
    meaning: "So luong nhap them vao kho. Dung so nguyen >= 0.",
  },
  {
    field: "exportQuantity",
    meaning: "So luong xuat kho. Dung so nguyen >= 0.",
  },
  {
    field: "setStockQuantity",
    meaning: "Dat ton kho chinh xac. Neu dung cot nay thi de trong import/export.",
  },
  {
    field: "note",
    meaning: "Ghi chu cho dot cap nhat.",
  },
];

const EXAMPLE_ROWS = [
  {
    productId: "65b8e564ea5ce114184ccb96",
    title: "Vi du san pham",
    brand: "Thuong hieu",
    category: "Danh muc",
    price: 100000,
    currentStock: 25,
    status: "Dang ban",
    importQuantity: 10,
    exportQuantity: "",
    setStockQuantity: "",
    note: "Nhap them cho tuan moi",
  },
];

const COLUMN_WIDTHS = [
  { wch: 28 },
  { wch: 32 },
  { wch: 20 },
  { wch: 20 },
  { wch: 14 },
  { wch: 14 },
  { wch: 14 },
  { wch: 16 },
  { wch: 16 },
  { wch: 18 },
  { wch: 28 },
];

const createWorkbook = (rows, fileName) => {
  const workbook = XLSX.utils.book_new();
  const inventorySheet = XLSX.utils.json_to_sheet(rows, {
    header: SNAPSHOT_HEADERS,
  });

  inventorySheet["!cols"] = COLUMN_WIDTHS;

  const guideSheet = XLSX.utils.json_to_sheet(GUIDE_ROWS, {
    header: ["field", "meaning"],
  });
  guideSheet["!cols"] = [
    { wch: 20 },
    { wch: 80 },
  ];

  XLSX.utils.book_append_sheet(workbook, inventorySheet, INVENTORY_SHEET_NAME);
  XLSX.utils.book_append_sheet(workbook, guideSheet, GUIDE_SHEET_NAME);
  XLSX.writeFile(workbook, fileName);
};

const sanitizeNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const normalized = String(value).replace(/,/g, "").trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
    return Number.NaN;
  }

  return parsed;
};

const normalizeText = (value) => String(value ?? "").trim();

const hasRowContent = (row = {}) =>
  Object.values(row).some((value) => normalizeText(value) !== "");

export const downloadInventorySnapshotWorkbook = (products = []) => {
  const rows = products.map((product) => ({
    productId: product._id,
    title: product.title || "",
    brand: product.brand || "",
    category: product.category || "",
    price: product.price ?? "",
    currentStock: product.stockQuantity ?? 0,
    status: product.isDeleted ? "Tam an" : "Dang ban",
    importQuantity: "",
    exportQuantity: "",
    setStockQuantity: "",
    note: "",
  }));

  const dateStamp = new Date().toISOString().slice(0, 10);
  createWorkbook(rows, `inventory_snapshot_${dateStamp}.xlsx`);
};

export const downloadInventoryTemplateWorkbook = () => {
  createWorkbook(EXAMPLE_ROWS, "inventory_template.xlsx");
};

export const parseInventoryWorkbook = async (file) => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", raw: false });
  const worksheet =
    workbook.Sheets[INVENTORY_SHEET_NAME] || workbook.Sheets[workbook.SheetNames[0]];

  if (!worksheet) {
    throw new Error("Khong tim thay sheet TonKho trong file Excel.");
  }

  const rawRows = XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
    raw: false,
  });

  const rows = [];
  const previewRows = [];
  const issues = [];
  let totalRows = 0;
  let importedUnits = 0;
  let exportedUnits = 0;
  let setStockRows = 0;

  rawRows.forEach((rawRow, index) => {
    if (!hasRowContent(rawRow)) {
      return;
    }

    totalRows += 1;

    const rowNumber = index + 2;
    const productId = normalizeText(rawRow.productId);
    const title = normalizeText(rawRow.title);
    const note = normalizeText(rawRow.note);
    const currentStock = normalizeText(rawRow.currentStock);
    const importQuantity = sanitizeNumber(rawRow.importQuantity);
    const exportQuantity = sanitizeNumber(rawRow.exportQuantity);
    const setStockQuantity = sanitizeNumber(rawRow.setStockQuantity);

    if (!productId) {
      issues.push(`Dong ${rowNumber}: thieu productId.`);
      return;
    }

    if (Number.isNaN(importQuantity)) {
      issues.push(`Dong ${rowNumber}: importQuantity phai la so nguyen >= 0.`);
      return;
    }

    if (Number.isNaN(exportQuantity)) {
      issues.push(`Dong ${rowNumber}: exportQuantity phai la so nguyen >= 0.`);
      return;
    }

    if (Number.isNaN(setStockQuantity)) {
      issues.push(`Dong ${rowNumber}: setStockQuantity phai la so nguyen >= 0.`);
      return;
    }

    const normalizedImportQuantity = importQuantity ?? 0;
    const normalizedExportQuantity = exportQuantity ?? 0;

    if (
      setStockQuantity !== null &&
      (normalizedImportQuantity > 0 || normalizedExportQuantity > 0)
    ) {
      issues.push(
        `Dong ${rowNumber}: chi duoc dung setStockQuantity hoac import/export trong cung mot dong.`
      );
      return;
    }

    if (
      setStockQuantity === null &&
      normalizedImportQuantity === 0 &&
      normalizedExportQuantity === 0
    ) {
      issues.push(`Dong ${rowNumber}: khong co thay doi ton kho de ap dung.`);
      return;
    }

    importedUnits += normalizedImportQuantity;
    exportedUnits += normalizedExportQuantity;

    if (setStockQuantity !== null) {
      setStockRows += 1;
    }

    rows.push({
      rowNumber,
      productId,
      importQuantity: normalizedImportQuantity,
      exportQuantity: normalizedExportQuantity,
      setStockQuantity,
      note,
    });

    previewRows.push({
      rowNumber,
      productId,
      title,
      currentStock,
      importQuantity: normalizedImportQuantity,
      exportQuantity: normalizedExportQuantity,
      setStockQuantity,
      note,
    });
  });

  return {
    rows,
    previewRows,
    issues,
    stats: {
      totalRows,
      validRows: rows.length,
      importedUnits,
      exportedUnits,
      setStockRows,
    },
  };
};
