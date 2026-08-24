import { useQuery } from '@tanstack/react-query';

// UptimeRobot 공개 상태 페이지가 화면을 그릴 때 쓰는 데이터 경로다.
// 문서로 공개된 API 가 아니라 상태 페이지 내부 경로라서 예고 없이 바뀔 수 있고,
// 그때는 화면이 상태 페이지 링크만 남기고 물러나도록 만들어 두었다.
// 인증이 없고 응답에 access-control-allow-origin: * 이 있어 브라우저가 직접 부를 수 있다.
// 덕분에 API 키도, 우리 서버의 프록시 엔드포인트도 필요 없다(2026-08-24 실측).
const STATUS_PAGE_ID = 'K7B0haZ5yp';

export const STATUS_PAGE_URL = `https://stats.uptimerobot.com/${STATUS_PAGE_ID}`;

const MONITOR_LIST_URL = `https://stats.uptimerobot.com/api/getMonitorList/${STATUS_PAGE_ID}`;

// 상태 페이지의 모니터 이름은 영어다. 화면에는 우리가 부르는 이름으로 보여주되,
// UptimeRobot 쪽에서 이름을 바꾸면 매핑이 빠지므로 없으면 원래 이름을 그대로 쓴다.
const MONITOR_LABELS = {
  'API Server for Reservation System': 'API 서버',
  'Web Client for Reservation System': '예약 웹',
  'Checkin Client for Reservation System': '출석 체크 화면',
};

// statusClass 는 정상일 때 오는 success 만 실측으로 확인했다.
// 장애나 일시 중지일 때 어떤 문자열이 오는지 모르는 채로 라벨을 추측해 붙이면
// 둘을 뒤바꿔 보여줄 수 있다. 그래서 모니터별로는 정상 여부만 판정하고,
// 장애인지 중지인지는 상태 페이지가 함께 주는 집계로 구분한다.
const isUp = monitor => monitor?.statusClass === 'success';

// 가동률은 { ratio: "100.000", label, color } 모양으로 온다. 숫자만 꺼내 쓴다.
const toRatio = value => {
  const parsed = Number.parseFloat(value?.ratio);
  return Number.isNaN(parsed) ? null : parsed;
};

// color 가 grey 인 날은 아직 감시하지 않던 날이다.
// 비율이 0 으로 오지만 장애가 아니므로 빨간 칸으로 그리면 안 된다.
const toDayCell = day => {
  const ratio = Number.parseFloat(day?.ratio);
  if (day?.color === 'grey' || Number.isNaN(ratio)) {
    return { date: day?.date, ratio: null, level: 'none' };
  }
  if (ratio >= 99.9) return { date: day.date, ratio, level: 'up' };
  if (ratio >= 95) return { date: day.date, ratio, level: 'warn' };
  return { date: day.date, ratio, level: 'down' };
};

const normalize = body => {
  const monitors = (body?.data ?? []).map(monitor => ({
    id: monitor.monitorId,
    name: MONITOR_LABELS[monitor.name] ?? monitor.name,
    up: isUp(monitor),
    ratio30d: toRatio(monitor['30dRatio']),
    ratio90d: toRatio(monitor['90dRatio']),
    days: (monitor.dailyRatios ?? []).map(toDayCell),
  }));

  const counts = body?.statistics?.counts ?? {};

  return {
    monitors,
    counts: {
      up: counts.up ?? 0,
      down: counts.down ?? 0,
      paused: counts.paused ?? 0,
      total: counts.total ?? monitors.length,
    },
  };
};

const fetchServiceStatus = async () => {
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

export const useServiceStatus = () =>
  useQuery({
    queryKey: ['serviceStatus'],
    queryFn: fetchServiceStatus,
    // 감시 자체가 분 단위로 돌기 때문에 더 자주 물어도 값이 바뀌지 않는다.
    // 탭이 뒤에 있는 동안에는 react-query 가 이 주기를 멈춰 둔다.
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
    // 외부 서비스라 순단이 있을 수 있으니 한 번은 다시 물어본다.
    retry: 1,
  });

// 배지와 상세 화면이 같은 기준으로 말하도록 판정을 한 곳에 둔다.
export const summarizeStatus = status => {
  if (!status) return { level: 'unknown', text: '상태 확인 불가' };

  const { up, down, paused, total } = status.counts;

  if (down > 0) return { level: 'down', text: `장애 ${down}건` };
  if (paused > 0) return { level: 'warn', text: `일시 중지 ${paused}건` };
  if (total > 0 && up === total) return { level: 'up', text: '전체 정상' };

  return { level: 'unknown', text: '상태 확인 불가' };
};
