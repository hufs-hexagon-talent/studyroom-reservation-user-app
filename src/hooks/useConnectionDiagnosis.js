import { useCallback, useEffect, useState } from 'react';

import { fetchServiceStatus } from '../api/serviceStatus.api';

// 우리 API 에 닿지 못했을 때, 학생 네트워크 문제인지 우리 서비스 장애인지를 가른다.
//
// 브라우저가 쓸 수 있는 신호는 셋이다.
//  1. navigator.onLine 이 false 면 기기가 어떤 네트워크에도 안 붙어 있다. 확정이다.
//     true 는 확정이 아니다. 와이파이에 붙었지만 인터넷이 안 될 때도 true 다.
//  2. 오류에 response 가 있으면 서버가 응답은 한 것이다. 네트워크는 멀쩡하다.
//  3. response 조차 없으면 우리 서버 문제인지 학생 네트워크 문제인지 모른다.
//     그때 우리 서버와 다른 호스트인 상태 페이지를 한 번 불러 본다.
//     닿으면 학생 인터넷은 살아 있는 것이고, 그 응답 안에 장애 여부까지 들어 있다.
//
// 진단 결과를 화면이 그대로 쓰도록 세 줄로 정규화해서 돌려준다.
const UNKNOWN = 'unknown';

const buildResult = ({ internet, api, service, httpStatus = null, counts = null }) => ({
  internet,
  api,
  service,
  httpStatus,
  counts,
});

const diagnose = async error => {
  // 신호 1. 기기가 오프라인이면 더 물어볼 것이 없다.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return buildResult({ internet: 'down', api: UNKNOWN, service: UNKNOWN });
  }

  // 신호 2. 서버가 응답을 줬다면 네트워크는 멀쩡하고 서버 안쪽이 아픈 것이다.
  if (error?.response) {
    return buildResult({
      internet: 'up',
      api: 'error',
      service: UNKNOWN,
      httpStatus: error.response.status,
    });
  }

  // 신호 3. 응답조차 없다. 제3의 호스트에 닿는지로 가른다.
  try {
    const status = await fetchServiceStatus();
    const { down, total, up } = status.counts;

    // 감시가 장애를 잡아 뒀다면 우리 서비스 장애로 확정할 수 있다.
    if (down > 0) {
      return buildResult({
        internet: 'up',
        api: 'down',
        service: 'down',
        counts: status.counts,
      });
    }

    // 밖에서는 정상으로 보이는데 이 기기만 못 닿는 상태다.
    // 감시는 미국에서 확인하므로, 학교 네트워크나 이 기기 환경 문제일 수 있다.
    if (total > 0 && up === total) {
      return buildResult({
        internet: 'up',
        api: 'down',
        service: 'up',
        counts: status.counts,
      });
    }

    return buildResult({
      internet: 'up',
      api: 'down',
      service: UNKNOWN,
      counts: status.counts,
    });
  } catch {
    // 우리 서버도, 상태 페이지도 못 부른다. 밖으로 아무 데도 못 나가는 상태다.
    return buildResult({ internet: UNKNOWN, api: 'down', service: UNKNOWN });
  }
};

// 진단은 외부 호출을 한 번 더 하므로 결과가 나오기까지 시간이 걸린다.
// 그동안 틀린 문구를 잠깐 보여주지 않도록 확인 중 상태를 따로 둔다.
const useConnectionDiagnosis = (error, onRetry) => {
  const [result, setResult] = useState(null);
  const [checkedAt, setCheckedAt] = useState(null);
  const [checking, setChecking] = useState(true);

  const run = useCallback(async () => {
    setChecking(true);
    const next = await diagnose(error);
    setResult(next);
    setCheckedAt(Date.now());
    setChecking(false);
  }, [error]);

  useEffect(() => {
    let alive = true;
    setChecking(true);
    diagnose(error).then(next => {
      if (!alive) return;
      setResult(next);
      setCheckedAt(Date.now());
      setChecking(false);
    });
    return () => {
      alive = false;
    };
  }, [error]);

  // 네트워크가 돌아온 순간 학생이 버튼을 찾지 않아도 되게 한 번 다시 시도한다.
  useEffect(() => {
    const handleOnline = () => onRetry?.();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [onRetry]);

  return { result, checking, checkedAt, recheck: run };
};

export default useConnectionDiagnosis;
