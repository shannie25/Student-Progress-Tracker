import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginForm = ({ onRegister }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    idNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
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
    setLoading(true);
    setError('');

    const success = login(formData.idNumber, formData.password);
    if (!success) {
      setError('Invalid ID Number or Password');
    }
    setLoading(false);
  };

  const handleForgotPassword = () => {
    alert("Redirecting to the password recovery page...");
  };

  return (
    <div className="login-container">
      <h2>Login to your Account</h2>
      
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

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="idNumber">ID Number</label>
          <input
            type="text"
            id="idNumber"
            name="idNumber"
            placeholder="Enter your ID number"
            value={formData.idNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-options">
          <label>
            <input type="checkbox" /> Remember Me
          </label>
          <button type="button" className="forgot-btn" onClick={handleForgotPassword}>
            Forgot Password?
          </button>
        </div>

        <div className="form-buttons">
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
          <button type="button" className="register-btn" onClick={onRegister} disabled={loading}>
            REGISTER
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;