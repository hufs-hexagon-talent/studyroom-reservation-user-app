import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button';

const SelectRoom = () => {
  const navigate = useNavigate();

  return (
    <>
      <div>
        <h2>호실을 선택하세요.</h2>
        <Button
          text="306호"
          onClick={() => {
            console.log('select 306');
            navigate('/rooms/306');
          }}
        />
        <br />
        <Button
          text="428호"
          onClick={() => {
            console.log('select 428');
            navigate('/rooms/428');
          }}
        />
        <br />
        <br />
      </div>
      <br />
    </>
  );
};

export default SelectRoom;
