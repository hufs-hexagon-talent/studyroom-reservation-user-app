// 서버가 새 비밀번호에 요구하는 규칙(8자 이상, 영문·숫자 포함)과 같은 검사.
// 기본 비밀번호가 학번(숫자만 9자리)이라 최초 변경 화면에서 규칙에 걸리는 학생이 많다.
// 규칙을 화면에 미리 알려 주고 보내기 전에 걸러, 이유 모를 실패를 반복하지 않게 한다.
export const PASSWORD_RULE_TEXT = '8자 이상, 영문과 숫자를 포함해 주세요.';

export const PASSWORD_RULE_MESSAGE =
  '새 비밀번호는 8자 이상이고 영문과 숫자를 포함해야 합니다.';

// 규칙에 맞으면 null, 어긋나면 학생용 문구를 돌려준다.
export const validateNewPassword = password => {
  const value = typeof password === 'string' ? password : '';
  const isValid =
    value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
  return isValid ? null : PASSWORD_RULE_MESSAGE;
};
