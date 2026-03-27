import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ManageUsers = () => {
  const { users } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#1e40af' }}>User Management Portal</h2>
      <p>System Administrator View: All Registered Accounts</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'white' }}>
        <thead>
          <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
            <th style={styles.th}>ID Number</th>
            <th style={styles.th}>Full Name</th>
            <th style={styles.th}>Email Address</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={styles.td}>{u.id}</td>
              <td style={styles.td}>{u.name}</td>
              <td style={styles.td}>{u.email}</td>
              <td style={styles.td}>
                <span style={{...styles.badge, background: u.role === 'admin' ? '#dcfce7' : '#fef9c3'}}>
                  {u.role}
                </span>
              </td>
              <td style={styles.td}>
                <button style={styles.editBtn}>Edit</button>
                <button style={styles.delBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  th: { padding: '12px', borderBottom: '2px solid #ddd' },
  td: { padding: '12px' },
  badge: { padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  editBtn: { marginRight: '10px', padding: '5px 10px', cursor: 'pointer', background: '#e5e7eb', border: 'none', borderRadius: '4px' },
  delBtn: { padding: '5px 10px', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px' }
};

export default ManageUsers;