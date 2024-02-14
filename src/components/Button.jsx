import React from 'react';

const Button = ({ text, onClick }) => {
  return (
    <div className="w-60 py-3 mx-auto">
      {/* margin left, right auto */}
      <p
        className="align-middle text-center text-white bg-yellow-400 hover:bg-red-700 text-2xl px-4 py-2 rounded-full focus:outline-none cursor-pointer"
        onClick={onClick}>
        {text}
      </p>
    </div>
  );
};

export default Button;
