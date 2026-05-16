import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStatusToast } from '../hooks/useNotifications';
import { LoadingSpinner, StatusMessage } from './ui';

type LoginFormProps = {
  onRegister: () => void;
};

type LoginFormData = {
  idNumber: string;
  password: string;
  rememberMe: boolean;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback;
};

const LoginForm = ({ onRegister }: LoginFormProps) => {
  const { login, requestPasswordReset } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    idNumber: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  useStatusToast(error, 'error', 'Login issue');
  useStatusToast(successMessage, 'success', 'Request sent');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previousFormData) => ({
      ...previousFormData,
      [name]: value,
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const success = await login(formData.idNumber.trim(), formData.password, 'student', formData.rememberMe);
    if (!success) {
      setError('Invalid ID Number or Password');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    const trimmedIdNumber = formData.idNumber.trim();

    if (!trimmedIdNumber) {
      setError('Enter your ID number first, then request a password reset.');
      return;
    }

    try {
      setIsResetting(true);
      await requestPasswordReset(trimmedIdNumber, 'student');
      setSuccessMessage('Password reset request sent. Please use the reset link within 20 minutes.');
    } catch (err) {
      setError(getErrorMessage(err, 'We could not start the password reset. Check your ID number and try again.'));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to your Account</h2>

      {error && <StatusMessage variant="error">{error}</StatusMessage>}
      {successMessage && <StatusMessage variant="success">{successMessage}</StatusMessage>}

      <form onSubmit={handleSubmit} aria-busy={loading}>
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

        <div className="forgot-password">
          <button type="button" className="forgot-btn" onClick={handleForgotPassword} disabled={loading || isResetting}>
            <span className="button-content">
              {isResetting && <LoadingSpinner label="Requesting password reset" size="small" />}
              Forgot Password?
            </span>
          </button>
        </div>

        <div className="form-options">
          <label>
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(event) => setFormData({ ...formData, rememberMe: event.target.checked })}
            /> Remember Me
          </label>
        </div>

        <div className="form-buttons">
          <button type="submit" className="login-btn" disabled={loading}>
            <span className="button-content">
              {loading && <LoadingSpinner label="Signing in" size="small" />}
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </span>
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
