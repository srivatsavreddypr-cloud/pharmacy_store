import React, { useEffect, useState } from "react";
import "./GenerateReport.css";
import { fetchAdminReport } from "./lib/store";

export default function GenerateReport() {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("pdf");
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    async function initialLoad() {
      setGenerating(true);
      try {
        const data = await fetchAdminReport({
          reportType,
          dateRange,
          startDate,
          endDate,
          format,
        });
        setReportData(data);
      } catch (error) {
        console.error("Report load failed:", error);
      } finally {
        setGenerating(false);
      }
    }

    initialLoad();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const data = await fetchAdminReport({
        reportType,
        dateRange,
        startDate,
        endDate,
        format,
      });
      setReportData(data);
    } catch (error) {
      console.error("Report load failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  const exportRows = () => {
    if (!reportData?.rows?.length) return;

    const headers = Object.keys(reportData.rows[0]);
    const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      headers.join(","),
      ...reportData.rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
    ].join("\n");

    if (format === "pdf") {
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (!printWindow) return;
      printWindow.document.write(`
        <html>
          <head><title>${title}</title></head>
          <body>
            <h1>${title}</h1>
            <p>Generated on ${new Date(reportData.generatedOn).toLocaleString()}</p>
            <table border="1" cellspacing="0" cellpadding="8">
              <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
              <tbody>
                ${reportData.rows
                  .map(
                    (row) =>
                      `<tr>${headers.map((header) => `<td>${String(row[header] ?? "")}</td>`).join("")}</tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      return;
    }

    let blob;
    let extension;

    if (format === "excel") {
      const table = `
        <table>
          <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
          <tbody>
            ${reportData.rows
              .map(
                (row) =>
                  `<tr>${headers.map((header) => `<td>${String(row[header] ?? "")}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      `;
      blob = new Blob([table], { type: "application/vnd.ms-excel;charset=utf-8;" });
      extension = "xls";
    } else {
      blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      extension = format;
    }

    const fileName = `${reportType}-report-${dateRange}.${extension}`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const title = reportData?.title || "Report";

  return (
    <div className="generate-report-container">
      <div className="report-header">
        <h1>Generate Report</h1>
        <p>Create report previews from current MySQL data</p>
      </div>

      <div className="report-content">
        <div className="report-form">
          <h2>Report Settings</h2>

          <div className="form-group">
            <label>Report Type:</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="report-select">
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="orders">Orders Report</option>
              <option value="customers">Customer Report</option>
              <option value="expiry">Expiry Style Inventory Report</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date Range:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="report-select">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="quarterly">Last 3 Months</option>
              <option value="yearly">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <div className="date-range">
              <div className="form-group">
                <label>Start Date:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
              </div>
              <div className="form-group">
                <label>End Date:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Export Format:</label>
            <div className="format-buttons">
              {["pdf", "excel", "csv"].map((value) => (
                <button key={value} className={`format-btn ${format === value ? "active" : ""}`} onClick={() => setFormat(value)}>
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerateReport} className="generate-btn" disabled={generating}>
            {generating ? "Generating..." : `Generate ${title}`}
          </button>
          <button
            onClick={exportRows}
            className="generate-btn"
            disabled={generating || !reportData?.rows?.length}
            style={{ marginTop: 10 }}
          >
            Export {format.toUpperCase()}
          </button>
        </div>

        <div className="report-preview">
          <h2>Report Preview</h2>
          <div className="preview-content">
            <h3>{title}</h3>
            <p className="preview-date">Generated on {reportData ? new Date(reportData.generatedOn).toLocaleString() : "..."}</p>
            <div className="preview-stats">
              <div className="stat">
                <span>Total Records:</span>
                <strong>{reportData?.totalRecords || 0}</strong>
              </div>
            </div>

            <div className="preview-table">
              <table>
                <thead>
                  <tr>
                    {reportData?.rows?.[0]
                      ? Object.keys(reportData.rows[0]).map((key) => <th key={key}>{key}</th>)
                      : <th>No data</th>}
                  </tr>
                </thead>
                <tbody>
                  {reportData?.rows?.length ? (
                    reportData.rows.slice(0, 8).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex}>{String(value)}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>No report data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
