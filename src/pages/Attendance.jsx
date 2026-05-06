import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Attendance.css';

const monthName = (dateValue) => new Date(dateValue).toLocaleString('en-US', { month: 'long' });

const Attendance = () => {
  const { attendance, user, users } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const records = useMemo(() => attendance.filter((record) => {
    const year = new Date(record.date).getFullYear().toString();
    return (selectedYear === 'All' || year === selectedYear) && selectedSemester;
  }), [attendance, selectedSemester, selectedYear]);
  const years = [...new Set(attendance.map((record) => new Date(record.date).getFullYear().toString()))];
  const totalDays = records.length;
  const presentDays = records.filter((record) => record.status === 'present').length;
  const absentDays = records.filter((record) => record.status === 'absent').length;
  const lateDays = records.filter((record) => record.status === 'late').length;
  const attendanceRate = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;
  const monthlySummary = Object.values(records.reduce((groups, record) => {
    const month = monthName(record.date);
    const currentGroup = groups[month] || { month, present: 0, absent: 0, late: 0 };

    currentGroup[record.status] += 1;
    groups[month] = currentGroup;
    return groups;
  }, {}));
  const trendMonths = monthlySummary.map((item) => {
    const total = item.present + item.absent + item.late || 1;
    return {
      month: item.month.slice(0, 3),
      present: Math.round((item.present / total) * 100),
      late: Math.round((item.late / total) * 100),
    };
  });
  const recentRecords = records.slice(0, 6);
  const studentName = (studentId) => users.find((currentUser) => currentUser.id === studentId)?.name || user.name;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const header = ['Student ID', 'Student Name', 'Date', 'Status'];
    const body = records.map((record) => [record.studentId, studentName(record.studentId), record.date, record.status]);
    const csvContent = [header, ...body]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `attendance-report-${user.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="attendance-page">
      <div className="attendance-toolbar">
        <h1>Attendance</h1>

        <div className="attendance-filters">
          <label>
            <span>Semester</span>
            <select value={selectedSemester} onChange={(event) => setSelectedSemester(event.target.value)}>
              <option value="All">All</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
            </select>
          </label>
          <label>
            <span>Year</span>
            <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
              <option value="All">All</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="attendance-stats">
        <section className="attendance-stat-card">
          <h2>Total Days</h2>
          <p>{totalDays}</p>
        </section>
        <section className="attendance-stat-card">
          <h2>Present</h2>
          <p>{presentDays}</p>
        </section>
        <section className="attendance-stat-card">
          <h2>Absent</h2>
          <p className="danger">{absentDays}</p>
        </section>
        <section className="attendance-stat-card rate-card">
          <h2>Attendance Rate</h2>
          <p>{attendanceRate}%</p>
        </section>
      </div>

      <div className="attendance-grid">
        <main className="attendance-main">
          <section className="trend-card">
            <div className="trend-header">
              <h2>Attendance Trends</h2>
              <div className="trend-legend">
                <span><b className="present-dot" />Present</span>
                <span><b className="late-dot" />Late</span>
              </div>
            </div>

            <div className="trend-chart" aria-label="Attendance trends by month">
              {(trendMonths.length ? trendMonths : [{ month: 'N/A', present: 0, late: 0 }]).map((item) => (
                <div className="trend-column" key={item.month}>
                  <div className="bar-track">
                    <span className="late-bar" style={{ height: `${item.late}%` }} />
                    <span className="present-bar" style={{ height: `${item.present}%` }} />
                  </div>
                  <small>{item.month}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="monthly-summary-card">
            <h2>Monthly Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((item) => (
                  <tr key={item.month}>
                    <td>{item.month}</td>
                    <td>{item.present}</td>
                    <td>{item.absent}</td>
                    <td>{item.late}</td>
                    <td>
                      <span className={item.absent === 0 ? 'perfect-status' : ''}>{item.absent === 0 ? 'Perfect' : 'Recorded'}</span>
                    </td>
                  </tr>
                ))}
                {monthlySummary.length === 0 && (
                  <tr>
                    <td colSpan="5">No attendance records yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </main>

        <aside className="attendance-side">
          <section className="calendar-card">
            <div className="calendar-header">
              <h2>Recent Records</h2>
            </div>

            <div className="calendar-legend">
              <span><b className="present-dot" />Present: {presentDays}</span>
              <span><b className="absent-dot" />Absent: {absentDays}</span>
              <span><b className="late-dot" />Late: {lateDays}</span>
            </div>
          </section>

          <section className="daily-records">
            <h2>Daily Records</h2>
            <div className="daily-record-list">
              {recentRecords.map((record) => (
                <article key={record.id}>
                  <time>{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}</time>
                  <div>
                    <strong>{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</strong>
                    <span>{studentName(record.studentId)}</span>
                  </div>
                  <b className={record.status}>
                    {record.status === 'present' ? 'P' : record.status === 'absent' ? 'A' : 'L'}
                  </b>
                </article>
              ))}
              {recentRecords.length === 0 && (
                <article>
                  <time>N/A</time>
                  <div>
                    <strong>No records</strong>
                    <span>Attendance will appear here once recorded.</span>
                  </div>
                  <b>N</b>
                </article>
              )}
            </div>
          </section>
        </aside>
      </div>

      <div className="attendance-actions">
        <button className="attendance-print-btn" type="button" onClick={handlePrint}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 14h12v8H6z" />
          </svg>
          Print
        </button>
        <button className="attendance-download-btn" type="button" onClick={handleDownload}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
          </svg>
          Download Attendance Report
        </button>
      </div>
    </div>
  );
};

export default Attendance;
