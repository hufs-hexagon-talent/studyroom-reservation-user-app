import { PASSWORD_RULE_MESSAGE, validateNewPassword } from './passwordRule';

// 검사에 쓸 값은 파일에 적어 두지 않고 만들어 쓴다.
// 비밀번호처럼 보이는 문자열을 레포에 남기면 비밀 스캐너가 실제 자격 증명으로 잡는다.
const letters = length => 'abcdefghijklmnopqrstuvwxyz'.slice(0, length);
const digits = length => '0123456789'.slice(0, length);
const lettersAndDigits = length => letters(length - 4) + digits(4);

describe('validateNewPassword', () => {
  it('8자 이상이고 영문과 숫자를 모두 포함하면 통과한다', () => {
    expect(validateNewPassword(lettersAndDigits(8))).toBeNull();
    expect(validateNewPassword(lettersAndDigits(12))).toBeNull();
  });

  it('기본 비밀번호인 학번처럼 숫자만 있으면 규칙을 알려 준다', () => {
    expect(validateNewPassword(digits(9))).toBe(PASSWORD_RULE_MESSAGE);
  });

  it('영문만 있거나 8자 미만이면 규칙을 알려 준다', () => {
    expect(validateNewPassword(letters(8))).toBe(PASSWORD_RULE_MESSAGE);
    expect(validateNewPassword(lettersAndDigits(7))).toBe(
      PASSWORD_RULE_MESSAGE,
    );
    expect(validateNewPassword('')).toBe(PASSWORD_RULE_MESSAGE);
    expect(validateNewPassword(undefined)).toBe(PASSWORD_RULE_MESSAGE);
  });

  it('규칙 문구에 영문 용어나 대괄호를 쓰지 않는다', () => {
    expect(PASSWORD_RULE_MESSAGE).not.toMatch(/[A-Za-z[\]]/);
  });
});
