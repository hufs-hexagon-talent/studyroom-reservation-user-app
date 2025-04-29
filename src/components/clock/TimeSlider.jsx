import React from 'react';
import { Slider } from '@mui/material';

const TimeSlider = ({ value, onChange }) => {
  const marks = Array.from({ length: 11 }, (_, i) => ({
    value: i * 30,
    label: `${i * 30}`,
  }));

  const handleSliderChange = (e, newValue) => {
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="px-4">
        <Slider
          value={value}
          onChange={handleSliderChange}
          step={30}
          marks={marks}
          min={0}
          max={300}
          valueLabelDisplay="on"
          sx={{
            color: '#495057',
            height: 8,
            padding: '15px 0',
            '& .MuiSlider-thumb': {
              width: 20,
              height: 20,
              backgroundColor: '#495057',
              border: '2px solid white',
              '&:hover': {
                boxShadow: '0px 0px 0px 8px rgba(59, 130, 246, 0.16)',
              },
            },
            '& .MuiSlider-track': {
              height: 8,
              borderRadius: 4,
            },
            '& .MuiSlider-rail': {
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e5e7eb',
            },
            '& .MuiSlider-mark': {
              backgroundColor: '#d1d5db',
              height: 8,
              width: 2,
            },
            '& .MuiSlider-markLabel': {
              fontSize: '12px',
              color: '#6b7280',
            },
          }}
        />
      </div>
    </div>
  );
};

export default TimeSlider;
