import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isStudent = location.pathname.includes('student');
  const roleLabel = isStudent ? 'ID Number' : 'Email Address';
  const roleTitle = isStudent ? 'Student' : (location.pathname.includes('admin') ? 'Admin' : 'Teacher');
  const placeholderText = isStudent ? "Enter ID Number" : "Enter Email Address";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!login(identifier, password)) setError(`Invalid ${roleLabel} or Password`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>{roleTitle} Login</h2>
          <p style={styles.subtitle}>Enter your credentials to access your account</p>
        </div>
        
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{roleLabel}</label>
            <input 
              type={isStudent ? "text" : "email"}
              placeholder={placeholderText}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required style={styles.input}
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
                required style={styles.passwordInput}
              />
              
              {password.length > 0 && (
                <div onClick={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
                  {showPassword ? (
                    /* PHOTO 2: PASSWORD IS SHOWN (Open Eye) -> Clicking hides it */
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    /* PHOTO 1: PASSWORD IS HIDDEN (Crossed Eye) -> Clicking shows it */
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>
          <button type="submit" style={styles.button}>Log In</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' },
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
  button: { padding: '14px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  errorBox: { color: '#b91c1c', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px', border: '1px solid #fecaca', fontSize: '14px' }
};

export default Login;
