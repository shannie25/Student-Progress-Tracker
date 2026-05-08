import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Layout from '../components/Layout';
import { LoadingSpinner, StatusMessage } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import studentIcons from '../assets/icon.png';
import type { UserRole } from '../types';

type RoleLoginProps = {
  role: UserRole;
  headerTitle: string;
  title: string;
  subtitle: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  identifierType: 'email' | 'text';
  invalidMessage: string;
  missingIdentifierMessage: string;
  buttonColor?: string;
  registerPath?: string;
  showRememberMe?: boolean;
  normalizeIdentifier?: (value: string) => string;
};

const eyeIconProps = {
  width: '26',
  height: '26',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: '#6b7280',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const VisiblePasswordIcon = () => (
  <svg {...eyeIconProps}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const HiddenPasswordIcon = () => (
  <svg {...eyeIconProps}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback;
};

const RoleLogin = ({
  role,
  headerTitle,
  title,
  subtitle,
  identifierLabel,
  identifierPlaceholder,
  identifierType,
  invalidMessage,
  missingIdentifierMessage,
  buttonColor = '#2563eb',
  registerPath,
  showRememberMe = true,
  normalizeIdentifier = (value) => value.trim(),
}: RoleLoginProps) => {
  const { login, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const success = await login(normalizeIdentifier(identifier), password, role, rememberMe);

      if (!success) {
        setError(invalidMessage);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, invalidMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const normalizedIdentifier = normalizeIdentifier(identifier);
    setError('');
    setSuccessMessage('');

    if (!normalizedIdentifier) {
      setError(missingIdentifierMessage);
      return;
    }

    try {
      setIsResetting(true);
      await requestPasswordReset(normalizedIdentifier, role);
      setSuccessMessage('Password reset request sent. Please use the reset link within 20 minutes.');
    } catch (err) {
      setError(getErrorMessage(err, 'We could not start the password reset. Check your details and try again.'));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Header title={headerTitle} />
      <Layout leftImage={studentIcons} showImage>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.header}>
              <h2 style={styles.title}>{title}</h2>
              <p style={styles.subtitle}>{subtitle}</p>
            </div>

            {error && <StatusMessage variant="error">{error}</StatusMessage>}
            {successMessage && <StatusMessage variant="success">{successMessage}</StatusMessage>}

            <form onSubmit={handleSubmit} style={styles.form} aria-busy={isSubmitting}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>{identifierLabel}</label>
                <input
                  type={identifierType}
                  placeholder={identifierPlaceholder}
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    style={styles.passwordInput}
                  />

                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((currentValue) => !currentValue)}
                      style={styles.eyeIconButton}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisiblePasswordIcon /> : <HiddenPasswordIcon />}
                    </button>
                  )}
                </div>
              </div>

              {showRememberMe ? (
                <div style={styles.formOptions} className="form-options">
                  <label style={styles.rememberLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="remember-checkbox"
                    />
                    Remember Me
                  </label>
                  <button type="button" className="forgot-btn" onClick={handleForgotPassword} disabled={isResetting || isSubmitting}>
                    <span className="button-content">
                      {isResetting && <LoadingSpinner label="Requesting password reset" size="small" />}
                      Forgot Password?
                    </span>
                  </button>
                </div>
              ) : (
                <button type="button" className="forgot-btn" onClick={handleForgotPassword} style={styles.forgotButton} disabled={isResetting || isSubmitting}>
                  <span className="button-content">
                    {isResetting && <LoadingSpinner label="Requesting password reset" size="small" />}
                    Forgot Password?
                  </span>
                </button>
              )}

              <button type="submit" style={{ ...styles.button, background: buttonColor }} disabled={isSubmitting || isResetting}>
                <span className="button-content">
                  {isSubmitting && <LoadingSpinner label="Signing in" size="small" />}
                  {isSubmitting ? 'Signing in...' : 'Log In'}
                </span>
              </button>

              {registerPath && (
                <div style={styles.signUpText}>
                  Don't have an account? <Link to={registerPath} style={styles.signUpLink}>Sign up</Link>
                </div>
              )}
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

const styles: Record<string, CSSProperties> = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' },
  card: { background: 'white', padding: '56px 52px', borderRadius: '22px', boxShadow: '0 18px 40px rgba(15,23,42,0.08)', width: '100%', maxWidth: '520px' },
  header: { textAlign: 'center', marginBottom: '34px' },
  title: { margin: '0', fontSize: '32px', color: '#111827', fontWeight: '800', lineHeight: '1.15' },
  subtitle: { color: '#4b5563', fontSize: '17px', marginTop: '12px', lineHeight: '1.35' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '11px' },
  label: { fontSize: '17px', fontWeight: '700', color: '#1f2937' },
  input: { minHeight: '58px', padding: '0 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '14px', fontSize: '18px', outline: 'none', color: '#111827', caretColor: '#111827', WebkitTextFillColor: '#111827', boxSizing: 'border-box' },
  passwordWrapper: { position: 'relative', width: '100%' },
  passwordInput: { width: '100%', minHeight: '58px', padding: '0 58px 0 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '14px', fontSize: '18px', outline: 'none', boxSizing: 'border-box', color: '#111827', caretColor: '#111827', WebkitTextFillColor: '#111827' },
  eyeIconButton: { position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', border: 'none', background: 'transparent', padding: '4px' },
  formOptions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontSize: '16px' },
  rememberLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', color: '#1f2937', cursor: 'pointer' },
  forgotButton: { alignSelf: 'flex-end', background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '16px', fontWeight: '700', padding: '0' },
  signUpText: { display: 'flex', justifyContent: 'center', width: '100%', marginTop: '22px', color: '#1f2937', fontSize: '16px' },
  signUpLink: { color: '#2563eb', textDecoration: 'none', fontWeight: '700' },
  button: { minHeight: '58px', padding: '0 18px', borderRadius: '14px', border: 'none', color: 'white', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' },
  errorBox: { color: '#b91c1c', backgroundColor: '#fef2f2', padding: '14px', borderRadius: '10px', textAlign: 'center', marginBottom: '18px', border: '1px solid #fecaca', fontSize: '15px' },
};

export default RoleLogin;
