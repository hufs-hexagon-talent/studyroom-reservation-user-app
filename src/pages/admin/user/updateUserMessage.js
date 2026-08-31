// [관리자] 회원 정보 수정 실패를 관리자용 문구로 바꾼다. 서버 원문(data.message)은 띄우지 않는다.
// 아이디·학번·이메일은 서버가 중복을 미리 검사하지 않고 DB 유니크 제약이 잡는다. 그 충돌은
// 코드가 붙은 응답으로 오지 않으므로 아래 409 분기가 대신 겹침을 먼저 의심하게 안내한다.

const UPDATE_USER_NETWORK_MESSAGE =
  '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.';

export const UPDATE_USER_FAILED_MESSAGE =
  '유저 정보를 수정하지 못했습니다. 잠시 뒤 다시 시도해 주세요.';

export const UPDATE_USER_DUPLICATED_MESSAGE =
  '이미 다른 계정이 쓰고 있는 값입니다. 아이디·학번·이메일을 다시 확인해 주세요.';

// 403 은 AUTH-002(권한 없음)다. 세션 만료가 아니라 권한 문제라 다시 로그인해도 풀리지 않는다.
export const UPDATE_USER_FORBIDDEN_MESSAGE =
  '이 작업을 수행할 권한이 없습니다. 관리자 계정인지 확인해 주세요.';

// 담당 호실·학과처럼 이 화면에서만 나오는 업무 규칙 코드를 문구로 바꾼다.
const UPDATE_USER_ERROR_MESSAGES = {
  'USER-001': '해당 사용자를 찾을 수 없습니다. 목록을 새로 고쳐 주세요.',
  'USER-013': '관리실 계정으로 바꾸려면 담당 호실을 함께 지정해 주세요.',
  'USER-014': '담당 호실은 관리실 계정에만 지정할 수 있습니다.',
  'USER-015': '담당 호실은 계정과 같은 부서의 호실만 지정할 수 있습니다.',
  'DEPARTMENT-001':
    '선택한 학과를 찾을 수 없습니다. 목록을 새로 고친 뒤 다시 선택해 주세요.',
  'ROOM-001':
    '선택한 호실을 찾을 수 없습니다. 목록을 새로 고친 뒤 다시 선택해 주세요.',
};

// 400 CLIENT-001 은 @Valid 바인딩 검증이고 errors[].field 로 어떤 칸이 걸렸는지 알려준다.
// roomId 는 @ExistRoom 이 Bean Validation 제약이라 '없는 호실' 도 404 가 아니라 이 코드로 온다.
// 학과에는 그런 제약이 없어 없는 학과는 404 DEPARTMENT-001 로 온다(위 맵에서 다룬다).
// username·serial·name·departmentId 키는 지금 도달하지 않는다. DTO 의 @Unique* 제약이
// 주석으로 남아 있어 되살릴 때를 대비해 둔다.
const FIELD_MESSAGES = {
  username: '아이디를 다시 확인해 주세요.',
  serial: '학번을 다시 확인해 주세요.',
  name: '이름을 다시 확인해 주세요.',
  email: '이메일 주소 형식을 다시 확인해 주세요.',
  departmentId:
    '선택한 학과를 찾을 수 없습니다. 화면을 새로 고친 뒤 다시 선택해 주세요.',
  roomId:
    '선택한 호실을 찾을 수 없습니다. 화면을 새로 고친 뒤 다시 선택해 주세요.',
};

// 서버가 errors 배열 순서를 보장하지 않으므로 첫 항목만 보면 매번 다른 칸만 알려주게 된다.
// 걸린 칸을 모두 모으되 문구 순서는 FIELD_MESSAGES 선언 순서로 고정한다.
const fieldMessages = errors => {
  const fields = new Set((errors || []).map(item => item?.field));
  return Object.keys(FIELD_MESSAGES)
    .filter(field => fields.has(field))
    .map(field => FIELD_MESSAGES[field]);
};

// 인터셉터가 세션 만료로 확정한 오류는 SessionExpiryWatcher 가 안내하므로 null 을 돌려
// 스낵바를 생략하게 한다. 401 을 상태 코드로 따로 보지 않는 것은 passwordChangeErrorMessage
// 와 같은 판정 기준을 쓰기 위해서다.
// 서버 코드 문자열에 앞뒤 공백이 섞여 오는 경우가 있어 정리해서 비교한다.
export const updateUserErrorMessage = error => {
  if (error?.sessionExpired) return null;
  if (!error?.response) return UPDATE_USER_NETWORK_MESSAGE;

  const { status, data } = error.response;

  if (status === 403) return UPDATE_USER_FORBIDDEN_MESSAGE;
  if (status === 409) return UPDATE_USER_DUPLICATED_MESSAGE;
  // 5xx 로 겹침을 안내하지 않는다. 유니크 충돌은 이제 409 로 오고(위 분기),
  // 반대로 DB 순단이 503 SYS-002 로 여기에 도달하는데 그때 학번·이메일을 의심하게 하면
  // 관리자가 멀쩡한 값을 계속 고쳐 보게 된다.
  if (status >= 500) return UPDATE_USER_FAILED_MESSAGE;

  const code = data?.code;
  const normalized = typeof code === 'string' ? code.trim() : null;

  if (normalized === 'CLIENT-001') {
    const messages = fieldMessages(data?.errors);
    return messages.length
      ? messages.join(' ')
      : '입력한 값의 형식을 확인해 주세요.';
  }
  return UPDATE_USER_ERROR_MESSAGES[normalized] || UPDATE_USER_FAILED_MESSAGE;
};
