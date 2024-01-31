import React from 'react';

import '../components/Button.css';

const Button = ({ text, onClick }) => {
  return (
    <div className='boxSize'>
      <p className="btn"
      onClick={onClick}
      >
        {text}
      </p>
    </div>
  );
};

export default Button;
