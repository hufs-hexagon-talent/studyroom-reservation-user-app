import React, { useState } from 'react';

import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const MyDatePicker = ({ selectedDates, setSelectedDates }) => {
  registerLocale('ko', ko);

  const handleDateChange = date => {
    let updatedDates;
    if (
      selectedDates.some(
        d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
      )
    ) {
      updatedDates = selectedDates.filter(
        d => format(d, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd'),
      );
    } else {
      updatedDates = [...selectedDates, date];
    }
    setSelectedDates(updatedDates);
  };

  return (
    <div>
      <div className="pb-2">
        <div className="text-sm pb-3">
          선택된 날짜 :{' '}
          {selectedDates
            .sort((a, b) => a - b)
            .map(d => format(d, 'yyyy-MM-dd'))
            .join(', ')}
        </div>

        <div>
          <div className="w-full max-w-md md:max-w-xs">
            <DatePicker
              locale={ko}
              dateFormat="yyyy년 MM월 dd일"
              selected={null}
              onChange={handleDateChange}
              inline
              highlightDates={selectedDates}
              showIcon
              className="w-full p-2 text-sm md:text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDatePicker;
