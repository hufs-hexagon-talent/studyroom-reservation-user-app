import React from 'react';

const Button = ({ text, onClick }) => {
  return (
    <div className="w-60 py-4 mx-auto">
      {/* margin left, right auto */}
      <p
        className="h-20 text-center py-5 align-middle text-white 
          bg-blue-300 hover:bg-gray-400 text-2xl rounded-full 
          focus:outline-none cursor-pointer"
        onClick={onClick}>
        {text}
      </p>
    </div>
  );
};

export default Button;
