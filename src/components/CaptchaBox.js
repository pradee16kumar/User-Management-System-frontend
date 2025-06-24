import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CaptchaBox = ({ onAnswer }) => {
  const [question, setQuestion] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/captcha')
      .then(res => {
        setQuestion(res.data.question);
      });
  }, []);

  return (
    <div className="mb-3">
      <label className="form-label">Captcha: {question}</label>
      <input
        type="number"
        className="form-control"
        onChange={(e) => onAnswer(e.target.value)}
      />
    </div>
  );
};

export default CaptchaBox;
