import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import Modal from '../../components/Modal';
import jsPDF from 'jspdf';
import { FileText, Download, Eye, Award } from 'lucide-react';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/certificates');
      if (res.success) setCertificates(res.certificates || []);
    } catch (err) {}
  };

  const generatePDFCertificate = (cert) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Certificate Border & Styling
    doc.setLineWidth(4);
    doc.setDrawColor(30, 58, 138); // Deep Navy
    doc.rect(8, 8, 281, 194);

    doc.setLineWidth(1);
    doc.setDrawColor(217, 119, 6); // Gold
    doc.rect(12, 12, 273, 186);

    // Title & Emblem Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138);
    doc.text('NATIONAL SERVICE SCHEME', 148, 32, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(217, 119, 6);
    doc.text('Ministry of Youth Affairs & Sports, Government of India', 148, 42, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('Motto: "Not Me But You"', 148, 48, { align: 'center' });

    doc.setFontSize(28);
    doc.setTextColor(15, 23, 42);
    doc.text('CERTIFICATE OF APPRECIATION', 148, 70, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('This is to certify that Volunteer', 148, 88, { align: 'center' });

    // Student Name & ID
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(cert.full_name.toUpperCase(), 148, 102, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`(NSS ID: ${cert.nss_id} | Reg No: ${cert.register_number})`, 148, 110, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`has successfully completed active service and participation in`, 148, 124, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6);
    doc.text(`"${cert.certificate_name}"`, 148, 136, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Certificate No: ${cert.certificate_number} | Issue Date: ${cert.issue_date}`, 148, 148, { align: 'center' });

    // Signatures
    doc.line(40, 175, 90, 175);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NSS Programme Officer', 65, 180, { align: 'center' });

    doc.line(200, 175, 250, 175);
    doc.text('Principal / Chairman', 225, 180, { align: 'center' });

    doc.save(`${cert.certificate_number}_${cert.full_name}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My NSS Certificates</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Official government-recognized NSS appreciation certificates & badges</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {certificates.map(cert => (
          <div key={cert.id} className="card" style={{ padding: '1.5rem', borderTop: '5px solid #d97706', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="badge badge-warning" style={{ fontWeight: 700 }}>🏆 Official Certificate</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cert.issue_date}</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>{cert.certificate_name}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Cert No: {cert.certificate_number}</p>
            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => setPreviewCert(cert)} style={{ flex: 1, fontSize: '0.8rem' }}>
                <Eye size={14} /> Preview
              </button>
              <button className="btn btn-primary" onClick={() => generatePDFCertificate(cert)} style={{ flex: 1, fontSize: '0.8rem' }}>
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <Modal isOpen={!!previewCert} onClose={() => setPreviewCert(null)} title="Certificate Preview">
        {previewCert && (
          <div style={{ textAlign: 'center', padding: '1.5rem', border: '3px double #d97706', borderRadius: '0.5rem', background: '#fff' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e3a8a' }}>NATIONAL SERVICE SCHEME</h2>
            <p style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700 }}>Ministry of Youth Affairs & Sports, Govt. of India</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '1rem 0' }}>CERTIFICATE OF APPRECIATION</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>Awarded to Volunteer <strong>{previewCert.full_name}</strong> ({previewCert.nss_id})</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', margin: '0.5rem 0' }}>For "{previewCert.certificate_name}"</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Issue Date: {previewCert.issue_date} | No: {previewCert.certificate_number}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
