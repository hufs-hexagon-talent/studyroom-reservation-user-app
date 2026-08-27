import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

import { STATUS_PAGE_URL } from '../api/serviceStatus.api';
import booDown from '../assets/boo/down.png';
import booGlitch from '../assets/boo/glitch.png';
import booGreet from '../assets/boo/greet.png';
import booHood from '../assets/boo/hood.png';
import useConnectionDiagnosis from '../hooks/useConnectionDiagnosis';

// 진단은 어느 문장을 보여줄지 고르는 데만 쓴다. 판단 근거를 화면에 펼치지 않는다.
// 예약하러 온 학생에게 필요한 것은 무슨 일인지 한 줄과 지금 할 수 있는 것 하나다.
//
// showStatus 는 상태 페이지 링크를 띄울지 정한다. 우리 서비스가 문제일 때만 쓸모가
// 있고, 학생 네트워크가 문제일 때는 눌러도 정상이라고만 나오며, 오프라인이면
// 그 페이지 자체가 안 열린다.
const describe = result => {
  if (!result) {
    return {
      art: booGreet,
      title: '연결 상태를 확인하고 있어요',
      body: '잠시만 기다려 주세요.',
      showStatus: false,
    };
  }

  if (result.internet === 'down') {
    return {
      art: booHood,
      title: '인터넷이 연결되어 있지 않아요',
      body: '와이파이나 데이터를 확인해 주세요. 연결되면 자동으로 다시 시도할게요.',
      showStatus: false,
    };
  }

  if (result.api === 'error') {
    return {
      art: booGlitch,
      title: '예약 서버가 응답을 제대로 못 하고 있어요',
      body: '저희 쪽 문제예요. 잠시 뒤에 다시 시도해 주세요.',
      showStatus: true,
    };
  }

  if (result.service === 'down') {
    return {
      art: booDown,
      title: '지금 예약이 안 되고 있어요',
      body: '저희 쪽 문제예요. 고치는 중이니 조금 뒤에 다시 들러 주세요.',
      showStatus: true,
    };
  }

  if (result.service === 'up') {
    return {
      art: booHood,
      title: '예약 서버에 연결하지 못했어요',
      body: '서버는 켜져 있는데 지금 쓰는 네트워크에서만 닿지 않아요. 다른 와이파이나 데이터로 바꿔서 시도해 보세요.',
      showStatus: false,
    };
  }

  if (result.internet === 'unknown') {
    return {
      art: booHood,
      title: '네트워크에 연결하지 못했어요',
      body: '어디에도 닿지 못하고 있어요. 인터넷 연결을 확인해 주세요.',
      showStatus: false,
    };
  }

  return {
    art: booHood,
    title: '예약 서버에 연결하지 못했어요',
    body: '잠시 뒤에 다시 시도해 주세요.',
    showStatus: true,
  };
};

// 학생이 문의를 넣을 때 그대로 적어 보낼 수 있게 남기는 한 줄이다.
// 눈에 먼저 들어오면 안 되므로 맨 아래에 작게 둔다.
const buildTrace = (result, checkedAt) => {
  const parts = [];
  if (result?.httpStatus) parts.push(`HTTP ${result.httpStatus}`);
  if (checkedAt) {
    parts.push(
      new Date(checkedAt).toLocaleTimeString('ko-KR', { hour12: false }),
    );
  }
  return parts.join(' · ');
};

// 이 화면은 라우터가 뜨기 전에 단독으로 렌더된다. 네비게이션 바도 푸터도 없어서
// 화면 높이를 스스로 채운다.
const ConnectionError = ({ error, onRetry }) => {
  const { result, checking, checkedAt, recheck } = useConnectionDiagnosis(
    error,
    onRetry,
  );

  const { art, title, body, showStatus } = describe(checking ? null : result);

  // 이 화면이 뜨는 상황 자체가 네트워크가 불안한 때다. 그림을 못 받아오면
  // 깨진 이미지 아이콘이 남는데, 그 자리를 비우는 편이 낫다.
  const [artBroken, setArtBroken] = useState(false);

  const trace = checking ? '' : buildTrace(result, checkedAt);

  const handleRetry = () => {
    recheck();
    onRetry?.();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md text-center">
        {!artBroken && (
          <img
            src={art}
            alt=""
            width={176}
            height={176}
            onError={() => setArtBroken(true)}
            className="mx-auto mb-8 block h-44 w-44 object-contain"
          />
        )}

        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">{body}</p>

        <div className="mt-8 flex items-center justify-center gap-x-5">
          <button
            type="button"
            onClick={handleRetry}
            disabled={checking}
            className="inline-flex items-center gap-x-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-300">
            <RotateCw
              aria-hidden
              size={16}
              className={checking ? 'animate-spin' : ''}
            />
            {checking ? '확인 중' : '다시 시도'}
          </button>

          {showStatus && (
            <a
              href={STATUS_PAGE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700">
              복구 상황 보기
            </a>
          )}
        </div>

        {/* 인증 문제로 이 화면에 들어온 경우 다시 시도만으로는 빠져나갈 수 없다.
            라우터 밖에서 렌더되므로 링크로 새로 열어 앱을 다시 띄운다. */}
        <p className="mt-6">
          <a
            href="/login"
            className="text-sm text-gray-400 hover:text-gray-600">
            로그인 화면으로
          </a>
        </p>

        {trace && (
          <p className="mt-10 font-mono text-xs text-gray-300">{trace}</p>
        )}
      </div>
    </div>
  );
};

export default ConnectionError;
