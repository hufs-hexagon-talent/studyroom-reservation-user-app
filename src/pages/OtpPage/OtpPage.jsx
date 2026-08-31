import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { Button } from 'flowbite-react';
import { RotateCw } from 'lucide-react';

import { useMyInfo } from '../../api/user.api';
import { useOtp } from '../../api/checkin.api';
import {
  getOtpView,
  getRemainingSeconds,
  isOtpExpired,
  OTP_TTL_MS,
} from './otpTimer';

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
  const [now, setNow] = useState(() => Date.now());
  const [radius, setRadius] = useState(170);

  const { data: me } = useMyInfo();
  const {
    data: otp,
    refetch,
    dataUpdatedAt,
    isPending,
    isError,
    isFetching,
  } = useOtp();

  // 값이 없거나 만료된 QR 은 대봐야 출석이 되지 않는다. 정상처럼 보이는 QR 을
  // 그려두면 학생이 그대로 대다가 출석 시간을 넘기므로 아예 그리지 않는다.
  // 다만 30초 카운트다운이 끝나 재조회하는 동안에는 이전 QR 이 아직 유효하므로
  // 새 QR 이 올 때까지 그대로 보여 준다.
  const otpValue = otp?.verificationCode;
  const hasOtp = Boolean(otpValue);
  const timer = getRemainingSeconds(dataUpdatedAt, now);
  // 만료는 기기 시계끼리 비교한다(받은 시각 + 서버 유효 시간). 서버가 준 expiresAt 을
  // 기기 시계와 비교하면 기기 시계가 앞서 있을 때 받자마자 만료로 보여 QR 을 영영 못 본다.
  const isExpired = hasOtp && isOtpExpired(dataUpdatedAt + OTP_TTL_MS, now);
  const view = getOtpView({
    hasOtp,
    isPending,
    isFetching,
    isError,
    isExpired,
  });
  const showQr = view === 'ready';
  const isLoadingOtp = view === 'loading';
  const statusMessage = isLoadingOtp
    ? 'QR 을 불러오는 중입니다'
    : view === 'error'
      ? 'QR 을 불러오지 못했습니다'
      : 'QR 이 만료되었습니다. 다시 발급받아 주세요.';

  useEffect(() => {
    const handleResize = () => {
      const newRadius = window.innerWidth <= 320 ? 140 : 170;
      setRadius(newRadius);
    };

    handleResize(1162);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1초 시계는 QR 을 받은 시각에 맞춰 다시 시작한다. 그래야 카운트다운과 재조회
  // 시점이 어긋나지 않는다.
  useEffect(() => {
    if (!dataUpdatedAt) return undefined;

    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(tick);
  }, [dataUpdatedAt]);

  // 카운트다운이 끝나면 새 QR 을 받아온다. 실패했을 때는 학생이 다시 시도 버튼을
  // 누르게 두고 자동으로 반복하지 않는다.
  useEffect(() => {
    if (timer > 0 || !hasOtp || isFetching || isError) return;

    refetch({ cancelRefetch: false });
  }, [timer, hasOtp, isFetching, isError, refetch]);

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
          <span className="ml-2">
            {timer > 0
              ? `${timer}초 남았습니다`
              : 'QR 을 다시 발급하는 중입니다'}
          </span>
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
