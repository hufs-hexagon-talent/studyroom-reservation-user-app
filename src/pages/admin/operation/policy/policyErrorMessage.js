// [관리자] 운영 정책 생성·수정·삭제 실패를 관리자용 문구로 바꾼다.
// 서버 원문(data.message)은 어느 분기에서도 돌려주지 않는다. 401 은 인터셉터가 세션 만료로
// 확정하지 못한 경로(재시도 401, 갱신 대기 큐)로도 올라오는데 그 원문은
// '쿠키에 refreshToken 이 없습니다' 같은 개발용 문구이고, eachMaxMinute 의 @Positive 처럼
// message 를 붙이지 않은 제약은 'must be greater than 0' 을 그대로 내려보낸다.

export const POLICY_NETWORK_MESSAGE =
  '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.';

export const POLICY_SERVER_MESSAGE =
  '서버에 문제가 있어 처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요.';

export const POLICY_UNAUTHORIZED_MESSAGE =
  '로그인이 만료되었습니다. 다시 로그인해 주세요.';

export const POLICY_FORBIDDEN_MESSAGE =
  '이 작업을 수행할 권한이 없습니다. 관리자 계정인지 확인해 주세요.';

// 정책 화면에서만 나오는 업무 규칙 코드를 문구로 바꾼다.
const POLICY_ERROR_MESSAGES = {
  'POLICY-001': '해당 정책을 찾을 수 없습니다. 목록을 새로 고쳐 주세요.',
  'POLICY-002': '같은 조건의 정책이 이미 있습니다.',
  'POLICY-004': '시작 시각이 종료 시각보다 앞서야 합니다.',
  'CLIENT-001': '입력한 값의 형식을 확인해 주세요.',
  // 정책 삭제는 서버가 미리 막지 않고 DB FK 가 잡는다. 그 위반을 GlobalExceptionHandler 가
  // 409 CLIENT-009 로 내린다. status === 409 로 보면 안 된다 — POLICY-002 도 409 라 묻힌다.
  'CLIENT-009':
    '이 정책을 쓰는 운영 스케줄이 남아 있어 삭제할 수 없습니다. 스케줄을 먼저 정리해 주세요.',
};

// 400 CLIENT-001 의 errors[].field 로 어떤 칸이 걸렸는지 알린다.
// 시작 시각 하나에 두 규칙이 걸린다: 30분 격자(@SlotAlignedTime)와 시작<종료(@ChronologicalTime).
// 후자는 operationStartTime 노드만 붙이므로 종료 시각 문구에는 넣지 않는다.
const FIELD_MESSAGES = {
  operationStartTime:
    '시작 시각은 30분 단위(00분·30분)로, 종료 시각보다 앞서게 지정해 주세요.',
  operationEndTime: '종료 시각은 30분 단위(00분·30분)로 지정해 주세요.',
  eachMaxMinute: '최대 이용 시간은 1분 이상으로 지정해 주세요.',
  roomOperationPolicyId:
    '해당 정책을 찾을 수 없습니다. 목록을 새로 고쳐 주세요.',
};

// 경로 변수 검증(@ExistPolicy)은 field 가 'deletePolicy.roomOperationPolicyId' 처럼
// 메서드 경로로 온다(GlobalExceptionHandler.handleConstraintViolationException 이
// PropertyPath 를 그대로 쓴다). 마지막 세그먼트만 본다 — 메서드 이름이 화면에 새면 안 된다.
const fieldKey = field =>
  typeof field === 'string' ? field.split('.').pop() : null;

// 서버가 errors 배열 순서를 보장하지 않으므로 첫 항목만 보면 매번 다른 칸만 알려주게 된다.
// 걸린 칸을 모두 모으되 문구 순서는 FIELD_MESSAGES 선언 순서로 고정하고, 같은 칸이
// 여러 규칙에 걸려도 한 번만 나온다.
const fieldMessages = errors => {
  const fields = new Set((errors || []).map(item => fieldKey(item?.field)));
  return Object.keys(FIELD_MESSAGES)
    .filter(field => fields.has(field))
    .map(field => FIELD_MESSAGES[field]);
};

// 인터셉터가 세션 만료로 확정한 오류는 SessionExpiryWatcher 가 안내하므로 null 을 돌려
// 스낵바를 생략하게 한다.
// 서버 코드 문자열에 앞뒤 공백이 섞여 오는 경우가 있어 정리해서 비교한다.
export const policyErrorMessage = (error, fallback) => {
  if (error?.sessionExpired) return null;
  if (!error?.response) return POLICY_NETWORK_MESSAGE;

  const { status, data } = error.response;

  if (status >= 500) return POLICY_SERVER_MESSAGE;
  if (status === 401) return POLICY_UNAUTHORIZED_MESSAGE;
  if (status === 403) return POLICY_FORBIDDEN_MESSAGE;

  const messages = fieldMessages(data?.errors);
  if (messages.length) return messages.join(' ');

  const code = data?.code;
  const normalized = typeof code === 'string' ? code.trim() : null;
  return POLICY_ERROR_MESSAGES[normalized] || fallback;
};
