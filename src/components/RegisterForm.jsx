import React, { useState } from 'react';

const RegisterForm = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      // Placeholder for registration logic
      // In a real app, this would call your backend API
      console.log('Registration data:', formData);
      setSuccess('Account created successfully! Redirecting to login...');
      
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="register-container">
      <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>Create Your Account</h2>

      {error && (
        <div style={{
          color: '#dc2626',
          backgroundColor: '#fee2e2',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px',
          fontSize: '14px',
          border: '1px solid #fca5a5'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          color: '#059669',
          backgroundColor: '#ecfdf5',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px',
          fontSize: '14px',
          border: '1px solid #6ee7b7'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Middle Name</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        
        <div className="form-row-wide">
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="submit"
            className="login-btn"
            style={{ width: '48%', marginRight: '10px' }}
            disabled={loading}
          >
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
          <button
            type="button"
            className="forgot-btn"
            onClick={onBackToLogin}
            style={{ display: 'inline-block', marginLeft: '10px', padding: '10px 20px' }}
            disabled={loading}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;