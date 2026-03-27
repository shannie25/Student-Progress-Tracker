import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, grades, users } = useAuth();

  const studentGrades = user.role === 'student' 
    ? grades.filter(g => g.studentId === user.id) 
    : grades;

  const headingStyle = { color: '#1f2937', marginBottom: '24px' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'white', color: '#1f2937' };
  const thStyle = { padding: '10px', border: '1px solid #ddd', color: '#1e293b', fontWeight: 600 };
  const tdStyle = { padding: '10px', border: '1px solid #ddd', color: '#1f2937' };

  return (
    <div>
      <h1 style={headingStyle}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</h1>
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
            {user.role !== 'student' && <th style={thStyle}>Student</th>}
            <th style={thStyle}>Subject</th>
            <th style={thStyle}>Score</th>
            <th style={thStyle}>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {studentGrades.map((g) => (
            <tr key={g.id}>
              {user.role !== 'student' && <td style={tdStyle}>{users.find(u => u.id === g.studentId)?.name}</td>}
              <td style={tdStyle}>{g.subject}</td>
              <td style={tdStyle}>{g.score}%</td>
              <td style={tdStyle}>{g.feedback}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;