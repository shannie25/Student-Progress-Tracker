import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import html2pdf from 'html2pdf.js';

const GenerateReport = () => {
  const { user, grades } = useAuth();
  const reportRef = useRef();

  const reportData = user?.role === 'student' 
    ? grades.filter(g => g.studentId === user.id) 
    : grades;

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `${user?.name}_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const headingStyle = { textAlign: 'center', color: '#1f2937', marginBottom: '18px' };
  const detailStyle = { color: '#1f2937', marginBottom: '12px' };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={handleDownloadPDF} style={styles.button}>
        Save as PDF
      </button>

      <div ref={reportRef} style={styles.paper}>
        <h2 style={headingStyle}>Academic Performance Report</h2>
        <p style={detailStyle}><strong>Name:</strong> {user?.name} ({user?.role})</p>
        <hr />
        <table style={styles.table}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={styles.th}>Subject</th>
              <th style={styles.th}>Grade</th>
              <th style={styles.th}>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((g) => (
              <tr key={g.id}>
                <td style={styles.td}>{g.subject}</td>
                <td style={styles.td}>{g.score}%</td>
                <td style={styles.td}>{g.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  button: { backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' },
  paper: { padding: '30px', backgroundColor: 'white', color: '#1f2937' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', border: '1px solid #ddd', color: '#1e293b', fontWeight: 600 },
  td: { padding: '12px', border: '1px solid #ddd', color: '#1f2937' }
};

export default GenerateReport;