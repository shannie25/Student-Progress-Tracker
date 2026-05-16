import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { PASSWORD_REQUIREMENTS } from '../constants/app';
import { useAuth } from '../hooks/useAuth';
import { useStatusToast } from '../hooks/useNotifications';
import { LoadingSpinner, StatusMessage } from './ui';

type RegistrationRole = 'student' | 'teacher';

type RegisterFormProps = {
  onBackToLogin: (role: RegistrationRole) => void;
};

type RegisterFormData = {
  firstName: string;
  middleName: string;
  lastName: string;
  studentId: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordError = (password: string) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must include at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character';
  return '';
};

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback;
};

const RegisterForm = ({ onBackToLogin }: RegisterFormProps) => {
  const { register } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const registrationRole: RegistrationRole = params.get('role') === 'teacher' ? 'teacher' : 'student';
  const idLabel = registrationRole === 'teacher' ? "Teacher's ID" : 'Student ID';
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  useStatusToast(error, 'error', 'Registration issue');
  useStatusToast(success, 'success', 'Account created');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previousFormData) => ({
      ...previousFormData,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedFormData = {
      ...formData,
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim(),
      lastName: formData.lastName.trim(),
      studentId: formData.studentId.trim(),
      email: formData.email.trim().toLowerCase(),
    };

    if (!emailPattern.test(trimmedFormData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (trimmedFormData.password !== trimmedFormData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = getPasswordError(trimmedFormData.password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      await register({ ...trimmedFormData, role: registrationRole });
      setSuccess('Account created successfully! Redirecting to login...');

      window.setTimeout(() => {
        onBackToLogin(registrationRole);
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">Register to ClassIQ</div>

        {error && <StatusMessage variant="error">{error}</StatusMessage>}
        {success && <StatusMessage variant="success">{success}</StatusMessage>}

        <form onSubmit={handleSubmit} aria-busy={loading}>
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
              <label>{idLabel}</label>
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
                minLength={PASSWORD_REQUIREMENTS.minLength}
                pattern={PASSWORD_REQUIREMENTS.pattern}
                title={PASSWORD_REQUIREMENTS.title}
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

          <div className="register-actions">
            <button
              type="submit"
              className="login-btn"
              style={{ minWidth: '180px' }}
            disabled={loading}
          >
              <span className="button-content">
                {loading && <LoadingSpinner label="Creating account" size="small" />}
                {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
              </span>
          </button>
            <button
              type="button"
              className="forgot-btn"
              onClick={() => onBackToLogin(registrationRole)}
              style={{ minWidth: '140px', padding: '10px 20px' }}
              disabled={loading}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
