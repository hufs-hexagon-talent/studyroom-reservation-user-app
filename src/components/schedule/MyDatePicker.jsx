import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import './MyDatePicker.css';

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
      {/* <div className="text-sm mb-2">
        선택된 날짜 :{' '}
        {selectedDates
          .sort((a, b) => a - b)
          .map(d => format(d, 'yyyy-MM-dd'))
          .join(', ')}
      </div> */}
      <DatePicker
        locale="ko"
        dateFormat="yyyy.MM.dd"
        selected={null}
        onChange={handleDateChange}
        highlightDates={selectedDates}
        inline
        calendarClassName="custom-calendar"
        dayClassName={date =>
          selectedDates.some(
            d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
          )
            ? 'selected-day'
            : ''
        }
      />
    </div>
  );
};

export default MyDatePicker;
