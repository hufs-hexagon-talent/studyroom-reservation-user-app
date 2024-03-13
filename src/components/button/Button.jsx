import React from 'react';

('use client');

import { HiOutlineArrowRight } from 'react-icons/hi';
import { Button } from 'flowbite-react';

const Btn = () => {
  return (
    <div>
      <Button className="ml-5" size="sm" color="dark">
        예약하러 가기
        <HiOutlineArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

export default Btn;
