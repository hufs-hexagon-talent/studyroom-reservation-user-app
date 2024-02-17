import React from 'react';

const Button = ({ text, onClick }) => {
  return (
    <div className="w-80 py-3.5 mx-auto">
      {/* margin left, right auto */}
      <p
        className="h-20 text-center py-5 align-middle text-white 
          bg-gray-800 text-2xl rounded-full 
          focus:outline-none cursor-pointer hover:opacity-90"
        onClick={onClick}>
        {text}
      </p>
    </div>
  );
};

export default Button;
