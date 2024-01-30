import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button';

const SelectRoom = () => {
  const navigate = useNavigate();

  return (
    <>
      <div>
        <p
          style={{
            backgroundColor: '#262424',
            color: 'white',
            marginBottom: '50px',
            marginTop: '50px',
            textAlign: 'center',
          }}>
          호실을<br></br> 선택하세요.<p></p>
          <br></br>
          <Button
            text="306호"
            onClick={() => {
              console.log('select 306');
              navigate('/rooms/306');
            }}
          />
          <br />
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
        </p>
      </div>
      <br />
    </>
  );
};

export default SelectRoom;
