import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './GenerateReport.css';

const registryRows = [
  { rank: '#1', name: 'Alessa Arong', score: '95.00', grade: 'A', status: 'Excellent' },
  { rank: '#2', name: 'Annie Mamitag', score: '91.40', grade: 'A-', status: 'Distinction' },
  { rank: '#3', name: 'Alphonsus Jose Credo', score: '88.50', grade: 'B+', status: 'Above Avg' },
  { rank: '#40', name: 'Juffiea Visitacion', score: '72.00', grade: 'C-', status: 'Warning' },
];

const distributionRows = [
  { grade: 'A', count: 10, width: '56%' },
  { grade: 'B', count: 15, width: '82%' },
  { grade: 'C', count: 8, width: '46%' },
  { grade: 'D', count: 5, width: '28%' },
  { grade: 'F', count: 2, width: '12%', danger: true },
];

const GenerateReport = () => {
  const reportRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const options = {
      margin: 8,
      filename: 'Class_Report_BSIT_1A_Math.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="class-report-page">
      <div className="class-report-header">
        <h1>Reports</h1>
        <div className="class-report-actions">
          <button type="button" onClick={handlePrint}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <path d="M6 14h12v8H6z" />
            </svg>
            Print
          </button>
          <button type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            Export Excel
          </button>
          <button type="button" className="download-pdf-btn" onClick={handleDownloadPDF}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      <div className="class-report-layout" ref={reportRef}>
        <aside className="report-filter-card">
          <div className="filter-title">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
              <path d="M2 14h4M10 8h4M18 16h4" />
            </svg>
            <h2>Filter<br />Options</h2>
          </div>

          <label>
            <span>Class</span>
            <select defaultValue="BSIT - 1A">
              <option>BSIT - 1A</option>
              <option>BSIT - 1B</option>
              <option>BSCS - 2A</option>
            </select>
          </label>

          <label>
            <span>Subject</span>
            <select defaultValue="Mathematics">
              <option>Mathematics</option>
              <option>English</option>
              <option>Science</option>
            </select>
          </label>

          <label>
            <span>Semester</span>
            <select defaultValue="Spring 2024">
              <option>Spring 2024</option>
              <option>Fall 2024</option>
            </select>
          </label>

          <label>
            <span>Report Type</span>
            <select defaultValue="Class Summary">
              <option>Class Summary</option>
              <option>Grade Registry</option>
              <option>Performance Review</option>
            </select>
          </label>

          <button type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m21 21-4.35-4.35" />
              <circle cx="11" cy="11" r="7" />
            </svg>
            Generate Report
          </button>
        </aside>

        <main className="class-report-main">
          <h2>Class Report: BSIT - 1A (Math)</h2>

          <div className="report-stat-grid">
            <section>
              <span>Total Students</span>
              <strong>40</strong>
              <small>Enrolled</small>
            </section>
            <section>
              <span>Average Score</span>
              <strong>88%</strong>
              <small>+2.4% vs LY</small>
            </section>
          </div>

          <section className="grade-distribution-card">
            <h3>Grade Distribution</h3>
            {distributionRows.map((row) => (
              <div className="distribution-row" key={row.grade}>
                <span>{row.grade}</span>
                <div className="distribution-track">
                  <div className={row.danger ? 'danger' : ''} style={{ width: row.width }}>
                    {row.count} Students
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="grade-registry-card">
            <h3>Detailed Grade Registry</h3>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registryRows.map((row) => (
                  <tr key={row.rank}>
                    <td>{row.rank}</td>
                    <td>
                      <span className="registry-avatar">{row.name[0]}</span>
                      {row.name}
                    </td>
                    <td>{row.score}</td>
                    <td><span className={`registry-grade ${row.grade.includes('C') ? 'warning' : ''}`}>{row.grade}</span></td>
                    <td className={row.status === 'Warning' ? 'status-warning' : ''}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button">View All 40 Students</button>
          </section>
        </main>

        <aside className="class-report-side">
          <section className="passing-rate-card">
            <span>Passing Rate</span>
            <strong>92%</strong>
            <small>Target Met</small>
          </section>

          <section className="performers-card">
            <h3>
              <span aria-hidden="true">*</span>
              Top Performers
            </h3>
            <article>
              <span className="side-avatar">A</span>
              <strong>Alessa<br />Arong</strong>
              <em>95%</em>
            </article>
            <article>
              <span className="side-avatar">A</span>
              <strong>Annie<br />Mamitag</strong>
              <em>94%</em>
            </article>
          </section>

          <section className="improvement-card">
            <h3>Needs<br />Improvement</h3>
            <article>
              <span className="side-avatar">J</span>
              <strong>Juffiea<br />Visitacion</strong>
              <em>72%</em>
            </article>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default GenerateReport;
