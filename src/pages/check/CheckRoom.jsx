import React, { useState } from 'react';

const Check = () => {
  const [rooms, setRooms] = useState([]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  let monthFormatted = month < 10 ? `0${month}` : month;
  let dayFormatted = day < 10 ? `0${day}` : day;

  const currentDay = `${year}.${monthFormatted}.${dayFormatted}`;

  return (
    <div>
      <div className="felx text-center font-bold text-3xl mt-10">
        내 신청 현황
      </div>
    </div>
  );
};

export default Check;
