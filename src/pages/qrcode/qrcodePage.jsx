import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';

import { useMe } from '../../api/user.api';

const TimerCircularProgressBar = ({ radius, strokeWidth, progress }) => {
  const center = radius + strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke="#E0E0E0"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke="#002D56"
        strokeDasharray={circumference}
        strokeDashoffset={progressOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
    </svg>
  );
};

const Qrcode = () => {
  const [qrValue, setQrValue] = useState('');
  const [timer, setTimer] = useState(30);
  const [radius, setRadius] = useState(170);

  const { me } = useMe();

  useEffect(() => {
    const generateQrValue = () => {
      const newValue = me;
      setQrValue(newValue);
      setTimer(30);
    };

    generateQrValue();

    const intervalId = setInterval(() => {
      generateQrValue();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [me]);

  useEffect(() => {
    const handleResize = () => {
      const newRadius = window.innerWidth <= 320 ? 140 : 170;
      setRadius(newRadius);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer(prevTimer => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  return (
    <div>
      <div className="text-center font-bold text-3xl mt-20">내 QR 코드</div>
      <div className="flex justify-center mt-10 relative">
        <TimerCircularProgressBar
          radius={radius}
          strokeWidth={15}
          progress={(timer / 30) * 100}
        />
        <QRCode
          value={qrValue}
          size={140}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <div className="flex justify-center p-10 mb-5 first:ml-10 selection:p-10 items-center">
        <span className="ml-2">{timer}초 남았습니다</span>
      </div>
    </div>
  );
};

export default Qrcode;
