import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import {
  bulkUpdateInventory,
  fetchInventoryHistory,
  fetchInventorySnapshot,
} from "../../products/ProductApi";
import {
  downloadInventorySnapshotWorkbook,
  downloadInventoryTemplateWorkbook,
  parseInventoryWorkbook,
} from "../inventoryExcel";
import { AdminSurface } from "./AdminSurface";

const getHistoryMeta = (changeType, quantityChange) => {
  if (changeType === "import" || quantityChange > 0) {
    return { label: "Nhập kho", color: "success" };
  }

  if (changeType === "export" || quantityChange < 0) {
    return { label: "Xuất kho", color: "warning" };
  }

  return { label: "Điều chỉnh", color: "info" };
};

const formatDateTime = (value) =>
  new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatSignedNumber = (value = 0) => (value > 0 ? `+${value}` : `${value}`);

const buildInventoryFilters = ({
  filters,
  sort,
  searchQuery,
  stockStatus,
  deleteStatus,
}) => {
  const payload = {
    ...filters,
    sort,
  };

  if (searchQuery.trim()) {
    payload.search = searchQuery.trim();
  }

  if (stockStatus !== "all") {
    payload.stockStatus = stockStatus;
  }

  if (deleteStatus === "active") {
    payload.isDeleted = false;
  } else if (deleteStatus === "deleted") {
    payload.isDeleted = true;
  }

  return payload;
};

const getErrorMessage = (error, fallbackMessage) => {
  if (Array.isArray(error?.errors) && error.errors.length) {
    return error.errors
      .slice(0, 3)
      .map((item) => item.message)
      .join(" | ");
  }

  return error?.message || fallbackMessage;
};

export const InventoryExcelCenter = ({
  filters,
  sort,
  searchQuery,
  stockStatus,
  deleteStatus,
  onInventoryChanged,
}) => {
  const fileInputRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isApplyingImport, setIsApplyingImport] = useState(false);
  const [historyStatus, setHistoryStatus] = useState("idle");
  const [history, setHistory] = useState([]);
  const [preview, setPreview] = useState(null);

  const inventoryFilters = useMemo(
    () =>
      buildInventoryFilters({
        filters,
        sort,
        searchQuery,
        stockStatus,
        deleteStatus,
      }),
    [deleteStatus, filters, searchQuery, sort, stockStatus]
  );

  const loadHistory = useCallback(async () => {
    setHistoryStatus("pending");

    try {
      const data = await fetchInventoryHistory(8);
      setHistory(data);
      setHistoryStatus("fulfilled");
    } catch (error) {
      console.error("loadHistory error:", error);
      setHistoryStatus("rejected");
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const resetPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadSnapshot = async () => {
    setIsExporting(true);

    try {
      const products = await fetchInventorySnapshot(inventoryFilters);
      downloadInventorySnapshotWorkbook(products);
      toast.success(`Đã xuất ${products.length} sản phẩm ra file Excel`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xuất file tồn kho"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadInventoryTemplateWorkbook();
    toast.success("Đã tải file mẫu nhập/xuất kho");
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsParsingFile(true);

    try {
      const parsed = await parseInventoryWorkbook(file);

      if (!parsed.stats.totalRows) {
        resetPreview();
        toast.error("File Excel không có dòng dữ liệu hợp lệ");
        return;
      }

      setPreview({
        ...parsed,
        fileName: file.name,
      });

      if (parsed.issues.length) {
        toast.warning(`File có ${parsed.issues.length} dòng cần sửa trước khi áp dụng`);
      } else {
        toast.success(`Đã đọc ${parsed.stats.validRows} dòng tồn kho từ Excel`);
      }
    } catch (error) {
      console.error("handleFileChange error:", error);
      resetPreview();
      toast.error(error.message || "Không đọc được file Excel");
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleApplyImport = async () => {
    if (!preview || preview.issues.length || !preview.rows.length) {
      return;
    }

    setIsApplyingImport(true);

    try {
      const result = await bulkUpdateInventory({
        rows: preview.rows,
        sourceFileName: preview.fileName,
      });

      await Promise.all([loadHistory(), onInventoryChanged?.()]);
      resetPreview();

      const updatedRows = result?.summary?.updatedRows ?? 0;
      const skippedRows = result?.summary?.skippedRows ?? 0;
      toast.success(`Đã cập nhật ${updatedRows} dòng tồn kho${skippedRows ? `, bỏ qua ${skippedRows} dòng` : ""}`);
    } catch (error) {
      console.error("handleApplyImport error:", error);
      toast.error(getErrorMessage(error, "Không thể áp dụng file Excel vào tồn kho"));
    } finally {
      setIsApplyingImport(false);
    }
  };

  const canApplyImport =
    Boolean(preview?.rows?.length) &&
    !preview?.issues?.length &&
    !isApplyingImport &&
    !isParsingFile;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} xl={7}>
        <AdminSurface
          title="Trung tâm Excel kho"
          description="Xuất tồn kho hiện tại, tải file mẫu và áp dụng nhập/xuất kho hàng loạt từ Excel."
          actions={
            <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<DescriptionRoundedIcon fontSize="small" />}
                onClick={handleDownloadTemplate}
              >
                Tải file mẫu
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadRoundedIcon fontSize="small" />}
                onClick={handleDownloadSnapshot}
                disabled={isExporting}
              >
                Xuất tồn kho
              </Button>
            </Stack>
          }
        >
          {(isExporting || isParsingFile || isApplyingImport) && (
            <LinearProgress sx={{ borderRadius: 999, mb: 2 }} />
          )}

          <Stack gap={1.5}>
            <Alert severity="info">
              Dùng một trong hai cách cập nhật: nhập/xuất theo chênh lệch bằng{" "}
              <strong>importQuantity / exportQuantity</strong> hoặc đặt tồn kho chính xác bằng{" "}
              <strong>setStockQuantity</strong>.
            </Alert>

            <Stack direction={{ xs: "column", md: "row" }} gap={1} flexWrap="wrap">
              <Button
                component="label"
                variant="outlined"
                color="inherit"
                startIcon={<FileUploadRoundedIcon fontSize="small" />}
              >
                Chọn file Excel
                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<TaskAltRoundedIcon fontSize="small" />}
                onClick={handleApplyImport}
                disabled={!canApplyImport}
              >
                Áp dụng vào kho
              </Button>

              {preview ? (
                <Button size="small" color="inherit" onClick={resetPreview}>
                  Xóa file
                </Button>
              ) : null}
            </Stack>

            {preview ? (
              <Stack gap={1.5}>
                <Alert severity={preview.issues.length ? "warning" : "success"}>
                  File: <strong>{preview.fileName}</strong>
                  {" - "}
                  {preview.stats.validRows} dòng hợp lệ / {preview.stats.totalRows} dòng dữ liệu
                </Alert>

                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Chip size="small" label={`Nhập: ${preview.stats.importedUnits}`} color="success" variant="outlined" />
                  <Chip size="small" label={`Xuất: ${preview.stats.exportedUnits}`} color="warning" variant="outlined" />
                  <Chip size="small" label={`Đặt lại tồn: ${preview.stats.setStockRows}`} color="info" variant="outlined" />
                  <Chip size="small" label={`Lỗi: ${preview.issues.length}`} color={preview.issues.length ? "error" : "default"} variant="outlined" />
                </Stack>

                {preview.issues.length ? (
                  <Stack gap={0.75}>
                    <Typography variant="body2" fontWeight={700}>
                      Cần sửa trước khi áp dụng
                    </Typography>
                    {preview.issues.slice(0, 5).map((issue) => (
                      <Typography key={issue} variant="caption" color="error.main">
                        {issue}
                      </Typography>
                    ))}
                    {preview.issues.length > 5 ? (
                      <Typography variant="caption" color="text.secondary">
                        ... và {preview.issues.length - 5} lỗi khác trong file.
                      </Typography>
                    ) : null}
                  </Stack>
                ) : null}

                <Divider />

                <Stack gap={1}>
                  <Typography variant="body2" fontWeight={700}>
                    Xem trước các dòng sắp cập nhật
                  </Typography>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Dòng</TableCell>
                          <TableCell>Sản phẩm</TableCell>
                          <TableCell>Tồn hiện tại</TableCell>
                          <TableCell>Nhập</TableCell>
                          <TableCell>Xuất</TableCell>
                          <TableCell>Đặt lại</TableCell>
                          <TableCell align="right">Sửa</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {preview.previewRows.slice(0, 6).map((row) => (
                          <TableRow key={`${row.rowNumber}-${row.productId}`}>
                            <TableCell>{row.rowNumber}</TableCell>
                            <TableCell>
                              <Stack>
                                <Typography variant="body2" fontWeight={700}>
                                  {row.title || row.productId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {row.productId}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>{row.currentStock || "-"}</TableCell>
                            <TableCell>{row.importQuantity || 0}</TableCell>
                            <TableCell>{row.exportQuantity || 0}</TableCell>
                            <TableCell>{row.setStockQuantity ?? "-"}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Sửa sản phẩm">
                                <IconButton
                                  size="small"
                                  component={Link}
                                  to={`/admin/product-update/${row.productId}`}
                                  color="primary"
                                >
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có file nào được chọn. Hãy xuất tồn kho hiện tại, chỉnh sửa cột import/export,
                sau đó tải lên lại để áp dụng.
              </Typography>
            )}
          </Stack>
        </AdminSurface>
      </Grid>

      <Grid item xs={12} xl={5}>
        <AdminSurface
          title="Lịch sử biến động kho"
          description="Các đợt nhập/xuất kho gần đây từ công cụ Excel."
          actions={
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<HistoryRoundedIcon fontSize="small" />}
              onClick={loadHistory}
              disabled={historyStatus === "pending"}
            >
              Làm mới
            </Button>
          }
        >
          {historyStatus === "pending" ? <LinearProgress sx={{ borderRadius: 999, mb: 2 }} /> : null}

          <Stack gap={1}>
            {history.length ? (
              history.map((entry) => {
                const meta = getHistoryMeta(entry.changeType, entry.quantityChange);

                return (
                  <Stack
                    key={entry._id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap={1}
                    py={1}
                    borderBottom="1px solid"
                    borderColor="divider"
                  >
                    <Stack minWidth={0}>
                      <Typography variant="body2" fontWeight={700}>
                        {entry.productTitle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(entry.createdAt)}
                        {entry.actor?.email ? ` • ${entry.actor.email}` : ""}
                      </Typography>
                      {entry.note ? (
                        <Typography variant="caption" color="text.secondary">
                          Ghi chú: {entry.note}
                        </Typography>
                      ) : null}
                    </Stack>

                    <Stack alignItems="flex-end" gap={0.5}>
                      {entry.product ? (
                        <Tooltip title="Sửa sản phẩm">
                          <IconButton
                            size="small"
                            component={Link}
                            to={`/admin/product-update/${entry.product}`}
                            color="primary"
                            sx={{ p: 0.25 }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      <Chip size="small" label={meta.label} color={meta.color} />
                      <Typography variant="body2" fontWeight={700}>
                        {formatSignedNumber(entry.quantityChange)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.previousStock} → {entry.nextStock}
                      </Typography>
                    </Stack>
                  </Stack>
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có giao dịch kho nào từ file Excel.
              </Typography>
            )}
          </Stack>
        </AdminSurface>
      </Grid>
    </Grid>
  );
};