import React from 'react';

('use client');

import { HiOutlineArrowRight } from 'react-icons/hi';
import { Button } from 'flowbite-react';

const Btn = ({ text, onClick }) => {
  return (
    <div>
      <Button className="ml-5" size="sm" color="dark" onClick={onClick}>
        {text}
        <HiOutlineArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

export default Btn;
