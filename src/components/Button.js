import React from 'react';

import '../components/Button.css';

const Button = ({ text, onClick }) => {
  return (
    <p className="btn"
    onClick={onClick}
    >
      {text}
    </p>
  );
};

export default Button;
