import React from 'react';

const Button = ({ text, onClick }) => {
  return (
    <div className="w-40 py-1 mx-auto">
      {/* margin left, right auto */}
      <p
        className="text-center text-white bg-yellow-400 hover:bg-red-700 text-base px-4 py-2 rounded-full focus:outline-none"
        onClick={onClick}>
        {text}
      </p>
    </div>
  );
};

export default Button;
