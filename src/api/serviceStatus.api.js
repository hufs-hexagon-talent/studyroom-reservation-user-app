// UptimeRobot 공개 상태 페이지가 화면을 그릴 때 쓰는 데이터 경로다.
// 문서로 공개된 API 가 아니라 상태 페이지 내부 경로라서 예고 없이 바뀔 수 있다.
// HTTP 오류이거나 status 가 ok 가 아니면 이 함수가 던지고, 연결 진단(useConnectionDiagnosis)은
// 상태 페이지에 닿지 못한 것으로 본다. 응답은 왔는데 집계 필드가 빠졌으면 0 으로 채워 돌려준다.
// 인증이 없고 응답에 access-control-allow-origin: * 이 있어 브라우저가 직접 부를 수 있다.
// 덕분에 API 키도, 우리 서버의 프록시 엔드포인트도 필요 없다(2026-08-24 실측).
const STATUS_PAGE_ID = 'K7B0haZ5yp';

export const STATUS_PAGE_URL = `https://stats.uptimerobot.com/${STATUS_PAGE_ID}`;

const MONITOR_LIST_URL = `https://stats.uptimerobot.com/api/getMonitorList/${STATUS_PAGE_ID}`;

// 연결 진단은 상태 페이지가 함께 주는 집계에서 정상, 장애, 전체 수만 읽는다.
// 집계에 전체 수가 빠져 오면 응답에 실린 모니터 수로 대신한다.
const normalize = body => {
  const counts = body?.statistics?.counts ?? {};
  const monitorCount = Array.isArray(body?.data) ? body.data.length : 0;

  return {
    counts: {
      up: counts.up ?? 0,
      down: counts.down ?? 0,
      total: counts.total ?? monitorCount,
    },
  };
};

// 학생 오류 화면의 연결 진단이 이 호출을 쓴다.
// 우리 서버와 다른 호스트라, 이 호출이 되는지가 학생 인터넷이 살아 있는지를
// 가르는 신호가 된다.
export const fetchServiceStatus = async () => {
  // apiClient 는 baseURL 이 우리 API 서버이고 withCredentials 로 쿠키를 싣는다.
  // 외부 도메인에 그대로 쓰면 인증 쿠키가 밖으로 나가고, 401 인터셉터가
  // 남의 응답을 보고 토큰 갱신을 시도하게 된다. 그래서 fetch 로 직접 부른다.
  const response = await fetch(MONITOR_LIST_URL, {
    credentials: 'omit',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`상태 페이지 응답 오류 ${response.status}`);
  }

  const body = await response.json();

  if (body?.status !== 'ok') {
    throw new Error('상태 페이지가 정상 응답을 주지 않았습니다');
  }

  return normalize(body);
};
