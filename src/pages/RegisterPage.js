import React, { useState } from 'react';
import api from '../utils/api'; // ✅ Only once
import CaptchaBox from '../components/CaptchaBox';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/login.module.css';
import '../styles/global.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/register', {
        name,
        email,
        password,
        captcha_answer: captcha,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Registration successful!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={`d-flex shadow rounded-5 ${styles.loginCard}`}>
        <div className={styles.leftPanel}>
          <h2 className="fw-bold">Join Us Today!</h2>
          <p>Create your account to unlock exclusive features and connect with our community.</p>
          <Link to="/login" className={`btn mt-4 ${styles.registerButton}`}>
            LOGIN
          </Link>
        </div>

        <div className={styles.rightPanel}>
          <h4 className={styles.signInTitle}>Create Account</h4>

          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {success && <div className="alert alert-success mb-3">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className={`form-control ${styles.formControl}`}
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="email"
                className={`form-control ${styles.formControl}`}
                placeholder="Email Address"
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

            <button type="submit" className={`btn w-100 mt-2 ${styles.loginButton}`}>
              REGISTER
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
