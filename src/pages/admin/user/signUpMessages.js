// [관리자] 회원 생성 실패를 관리자용 문구로 바꾼다. 서버 원문(data.message)은 띄우지 않는다.
// 이 요청에서 오는 400 원문은 "잘못된 요청입니다. 요청 내용을 다시 확인해주세요." 하나뿐이라
// 여섯 칸 중 무엇이 걸렸는지 알 수 없다.

const NETWORK_MESSAGE =
  '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.';

// 400 CLIENT-001 은 컨트롤러의 @Valid 바인딩 검증 실패이고, errors[].field 로 어떤 칸이
// 걸렸는지 알려준다. 필수·형식은 화면이 먼저 막으므로 아이디·학번·이메일이 여기 걸리면
// 사실상 중복이다. departmentId 는 @ExistDepartment 도 Bean Validation 제약이라
// '없는 학과' 까지 404 가 아니라 이 코드로 온다. 미선택은 화면 가드가 이미 막으므로,
// 여기 오는 departmentId 는 목록이 오래돼 지워진 학과를 고른 경우다.
const FIELD_MESSAGES = {
  username: '이미 등록된 아이디입니다. 다른 아이디를 입력해주세요.',
  serial: '이미 등록된 학번입니다. 학번을 다시 확인해주세요.',
  email: '이미 등록된 이메일 주소이거나 형식이 올바르지 않습니다.',
  departmentId:
    '선택한 학과를 찾을 수 없습니다. 화면을 새로 고친 뒤 다시 선택해주세요.',
};

// 이미 있는 사람을 다시 만들면 아이디·학번·이메일 검증이 한꺼번에 터진다. 서버가
// errors 배열 순서를 보장하지 않으므로 첫 항목만 보면 매번 다른 칸만 알려주게 된다.
// 걸린 칸을 모두 모으되 문구 순서는 FIELD_MESSAGES 선언 순서로 고정한다.
const fieldMessages = errors => {
  const fields = new Set((errors || []).map(item => item?.field));
  return Object.keys(FIELD_MESSAGES)
    .filter(field => fields.has(field))
    .map(field => FIELD_MESSAGES[field]);
};

const retryAfterSeconds = error => {
  const raw = error?.response?.headers?.['retry-after'];
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
};

// 404 DEPARTMENT-001 분기는 두지 않는다. 그 예외는 @Valid 를 통과한 뒤 학과를 다시 읽는
// 사이에 학과가 지워진 경합에서만 나오고, 실제로 관리자가 보는 '없는 학과' 는 위의
// CLIENT-001 + field=departmentId 로 온다.
// 인터셉터가 세션 만료로 확정한 오류는 SessionExpiryWatcher 가 같은 문구를 띄우고
// 로그인 화면으로 옮기므로 null 을 돌려 스낵바를 생략하게 한다. 여기서 또 띄우면
// 같은 안내가 두 번 겹친다. 같은 디렉토리의 updateUserMessage 와 판정 기준이 같다.
export const signUpErrorMessage = error => {
  if (error?.sessionExpired) return null;
  if (!error?.response) return NETWORK_MESSAGE;

  const { status, data } = error.response;
  const code = data?.code;

  if (status >= 500) {
    return '서버에 문제가 있어 계정을 만들지 못했습니다. 잠시 뒤 다시 시도해 주세요.';
  }
  if (status === 401 || status === 403) {
    return '계정 생성 권한이 없습니다. 관리자 계정으로 다시 로그인해 주세요.';
  }
  // /users/sign-up 에는 분당 요청 제한이 걸려 있고, 서버가 Retry-After 로 남은 초를 준다.
  if (status === 429) {
    const seconds = retryAfterSeconds(error);
    return seconds
      ? `요청이 많아 잠시 막혔습니다. ${seconds}초 뒤 다시 시도해 주세요.`
      : '요청이 많아 잠시 막혔습니다. 잠시 뒤 다시 시도해 주세요.';
  }
  if (code === 'CLIENT-001') {
    const messages = fieldMessages(data?.errors);
    return messages.length ? messages.join(' ') : '입력값을 다시 확인해주세요.';
  }
  return '계정을 만들지 못했습니다. 다시 시도해 주세요.';
};
