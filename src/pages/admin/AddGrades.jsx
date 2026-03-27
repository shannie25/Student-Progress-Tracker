import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddGrades = () => {
  const { users, addGrade } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ studentId: '', subject: '', score: '', feedback: '' });

  const students = users.filter(u => u.role === 'student');

  const handleSubmit = (e) => {
    e.preventDefault();
    addGrade({ ...formData, studentId: parseInt(formData.studentId), score: parseInt(formData.score) });
    alert("Grade successfully saved!");
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: '500px', background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h3>Assign Student Grade</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <select required onChange={e => setFormData({...formData, studentId: e.target.value})} style={{ padding: '8px' }}>
          <option value="">-- Select Student --</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="text" placeholder="Subject Name" required onChange={e => setFormData({...formData, subject: e.target.value})} style={{ padding: '8px' }} />
        <input type="number" placeholder="Grade (0-100)" required onChange={e => setFormData({...formData, score: e.target.value})} style={{ padding: '8px' }} />
        <textarea placeholder="Feedback/Comments" onChange={e => setFormData({...formData, feedback: e.target.value})} style={{ padding: '8px', height: '80px' }} />
        <button type="submit" style={{ padding: '10px', background: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Save Data</button>
      </form>
    </div>
  );
};

export default AddGrades;