import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { Button } from 'flowbite-react';
import { RotateCw } from 'lucide-react';

import { useMyInfo } from '../../api/user.api';
import { useOtp } from '../../api/checkin.api';

const TimerCircularProgressBar = ({ radius, strokeWidth, progress }) => {
  const center = radius + strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference + (progress / 100) * circumference;

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
  const [timer, setTimer] = useState(30);
  const [radius, setRadius] = useState(170);

  const { data: me } = useMyInfo();
  const {
    data: otpValue,
    refetch,
    dataUpdatedAt,
    isPending,
    isError,
    isFetching,
  } = useOtp();

  // 값이 없거나 만료된 QR 은 대봐야 출석이 되지 않는다. 정상처럼 보이는 QR 을
  // 그려두면 학생이 그대로 대다가 출석 시간을 넘기므로 아예 그리지 않는다.
  const hasOtp = Boolean(otpValue);
  const isExpired = hasOtp && timer === 0;
  const showQr = hasOtp && !isExpired;
  const isLoadingOtp = isPending || isFetching;
  const statusMessage = isLoadingOtp
    ? 'QR 을 불러오는 중입니다'
    : isError
      ? 'QR 을 불러오지 못했습니다'
      : 'QR 이 만료되었습니다. 다시 발급받아 주세요.';

  useEffect(() => {
    const intervalId = setInterval(refetch, 30000);

    return () => clearInterval(intervalId);
  }, [otpValue]);

  useEffect(() => {
    const handleResize = () => {
      const newRadius = window.innerWidth <= 320 ? 140 : 170;
      setRadius(newRadius);
    };

    handleResize(1162);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!hasOtp) return undefined;

    const timerInterval = setInterval(() => {
      setTimer(prevTimer => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [hasOtp]);

  useEffect(() => {
    if (!hasOtp) return;

    setTimer(30);
  }, [otpValue, dataUpdatedAt]);

  return (
    <div>
      <div className="text-center text-3xl mt-20">{me?.name}님의 QR 코드</div>
      <div className="flex justify-center mt-10 relative">
        <TimerCircularProgressBar
          radius={radius}
          strokeWidth={15}
          progress={showQr ? (timer / 30) * 100 : 0}
        />
        {showQr ? (
          <QRCode
            value={otpValue}
            level="H"
            size={140}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        ) : (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 text-center">
            {isLoadingOtp && (
              <RotateCw
                aria-hidden
                size={24}
                className="mx-auto mb-3 animate-spin text-gray-400"
              />
            )}
            <span className="text-gray-600">{statusMessage}</span>
          </div>
        )}
      </div>
      <div className="flex justify-center p-10 mb-5 first:ml-10 selection:p-10 items-center">
        {showQr ? (
          <span className="ml-2">{timer}초 남았습니다</span>
        ) : (
          (isError || isExpired) && (
            <Button
              size="sm"
              color="dark"
              onClick={() => refetch()}
              disabled={isFetching}>
              {isFetching ? '다시 발급하는 중' : '다시 시도'}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default Qrcode;
