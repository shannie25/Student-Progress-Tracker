import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Layout from '../components/Layout';
import studentIcons from '../assets/icon.png';

const StudentLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(await login(idNumber, password, 'student'))) {
      setError('Invalid ID Number or Password');
      return;
    }

    navigate('/dashboard');
  };

  return (
    <>
      <Header title="Student Login - Performance Tracker" />
      <Layout leftImage={studentIcons} showImage={true}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.header}>
              <h2 style={styles.title}>Student Login</h2>
              <p style={styles.subtitle}>Enter your credentials to access your account</p>
            </div>
            
            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>ID Number</label>
                <input 
                  type="text"
                  placeholder="Enter your ID number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.passwordInput}
                  />
                  
                  {password.length > 0 && (
                    <div onClick={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
                      {showPassword ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.formOptions} className="form-options">
                <label style={styles.rememberLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="remember-checkbox"
                  />
                  Remember Me
                </label>
                <button type="button" className="forgot-btn" onClick={() => alert('Redirecting to password recovery...')}>
                  Forgot Password?
                </button>
              </div>
              <button type="submit" style={styles.button}>Log In</button>
              <div style={styles.signUpText}>
                Don't have an account? <Link to="/register" style={styles.signUpLink}>Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
  card: { background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' },
  header: { textAlign: 'center', marginBottom: '25px' },
  title: { margin: '0', fontSize: '24px', color: '#111827', fontWeight: '700' },
  subtitle: { color: '#6b7280', fontSize: '14px', marginTop: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  input: { padding: '14px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '12px', fontSize: '16px', outline: 'none', color: '#111827', caretColor: '#111827', WebkitTextFillColor: '#111827' },
  passwordWrapper: { position: 'relative', width: '100%' },
  passwordInput: { width: '100%', padding: '14px 16px', paddingRight: '45px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '12px', fontSize: '16px', outline: 'none', boxSizing: 'border-box', color: '#111827', caretColor: '#111827', WebkitTextFillColor: '#111827' },
  eyeIconContainer: { position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' },
  formOptions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  rememberLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer' },
  rememberCheckbox: { width: '16px', height: '16px', accentColor: '#2563eb', backgroundColor: 'white', border: '1px solid #ffffff', borderRadius: '4px' },
  forgotPasswordButton: { background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: '600', padding: '0' },
  signUpText: { display: 'flex', justifyContent: 'center', width: '100%', marginTop: '16px', color: '#374151', fontSize: '14px' },
  signUpLink: { color: '#2563eb', textDecoration: 'none', fontWeight: '600' },
  button: { padding: '14px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  errorBox: { color: '#b91c1c', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px', border: '1px solid #fecaca', fontSize: '14px' }
};

export default StudentLogin;
