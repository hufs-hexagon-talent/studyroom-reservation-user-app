import React from 'react';

import MyDatePicker from './DatePicker';
import SelectRoom from './SelectRoom';
import CheckPolicy from './CheckPolicy';

const DashBoardSchedule = () => {
  return (
    <div>
      <div className="bg-white inline-block rounded-xl mb-8 shadow-xl">
        <div className="flex justify-center items-center font-bold py-4">
          스케줄 설정
        </div>
        <div className="px-4 pb-2">
          <SelectRoom />
          <MyDatePicker />
          <CheckPolicy />
        </div>
      </div>
    </div>
  );
};

export default DashBoardSchedule;
