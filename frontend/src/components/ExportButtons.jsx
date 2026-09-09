import React from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ExportButtons({ data = [], filename = 'NSS_Report', title = 'NSS Report' }) {

  const exportCSV = () => {
    if (!data.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    if (!data.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportPDF = () => {
    if (!data.length) return;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text('NATIONAL SERVICE SCHEME', 14, 15);
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(title, 14, 23);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 29);

    const headers = Object.keys(data[0]);
    const rows = data.map((row) => Object.values(row).map(val => val !== null && val !== undefined ? String(val) : ''));

    doc.autoTable({
      startY: 34,
      head: [headers],
      body: rows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button className="btn btn-outline" onClick={exportCSV} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
        <FileText size={14} className="text-emerald-600" />
        CSV
      </button>
      <button className="btn btn-outline" onClick={exportExcel} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
        <FileSpreadsheet size={14} className="text-emerald-700" />
        Excel
      </button>
      <button className="btn btn-outline" onClick={exportPDF} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
        <Download size={14} className="text-rose-600" />
        PDF
      </button>
    </div>
  );
}
