import React, { useState } from 'react';
import api from '../utils/api';
import CaptchaBox from '../components/CaptchaBox';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/login.module.css';
import '../styles/global.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const res = await api.post('/login', {
        email,
        password,
        captcha_answer: captcha,
        remember_me: rememberMe,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Login successful! Redirecting...');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials and captcha.');
    }
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={`d-flex shadow rounded-5 ${styles.loginCard}`}>
        <div className={styles.leftPanel}>
          <h2 className="fw-bold">Welcome</h2>
          <p>Join Our Unique Platform, Explore a New Experience</p>
          <Link to="/register" className={`btn mt-4 ${styles.registerButton}`}>
            REGISTER
          </Link>
        </div>

        <div className={styles.rightPanel}>
          <h4 className={styles.signInTitle}>Sign In</h4>

          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {success && <div className="alert alert-success mb-3">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className={`form-control ${styles.formControl}`}
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                className={`form-control ${styles.formControl}`}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <CaptchaBox onAnswer={setCaptcha} className={styles.formControl} />
            </div>

            <div className={`d-flex justify-content-between align-items-center ${styles.rememberMeSection}`}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMeCheckbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className={`form-check-label ${styles.rememberMeLabel}`} htmlFor="rememberMeCheckbox">
                  Remember me
                </label>
              </div>
            </div>

            <button type="submit" className={`btn w-100 mt-2 ${styles.loginButton}`}>
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
