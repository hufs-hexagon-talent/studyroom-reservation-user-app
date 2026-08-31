import React, { useRef, useState } from 'react';
import { Label, TextInput } from 'flowbite-react';
import { useSignUp } from '../../../api/user.api';
import { useDepartmets } from '../../../api/department.api';
import { useCustomSnackbars } from '../../../components/snackbar/SnackBar';
import { signUpErrorMessage } from './signUpMessages';
import Create from '../../../assets/icons/create.png';

const SignUp = () => {
  const [name, setName] = useState('');
  const [serial, setSerial] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();
  const { mutateAsync: doSignUp } = useSignUp();
  const { data: departments, isError: departmentsFailed } = useDepartmets();
  // 상태는 다음 렌더에서야 바뀐다. 같은 tick 의 두 번째 클릭까지 막으려면 동기 값이어야 한다.
  const submittingRef = useRef(false);

  const handleName = e => {
    setName(e.target.value);
  };

  const handleSerial = e => {
    setSerial(e.target.value);
  };

  const handleUserName = e => {
    setUsername(e.target.value);
  };

  const handlePassword = e => {
    setPassword(e.target.value);
  };

  const handleEmail = e => {
    setEmail(e.target.value);
  };

  // 빈 값을 Number 로 바꾸면 0 이 되어 존재하지 않는 학과 ID 를 보내게 된다.
  const handleDepartment = e => {
    const value = e.target.value;
    setDepartmentId(value === '' ? null : Number(value));
  };

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (submittingRef.current) return;

    // 가드와 전송이 같은 값을 보게 먼저 다듬는다. 원본으로 검사하면 앞뒤 공백이 붙은
    // 이메일을 붙여넣었을 때 보낼 값은 멀쩡한데도 형식 오류로 되튕긴다.
    const trimmedName = name.trim();
    const trimmedSerial = serial.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    // 이 화면은 <form> 이 아니라서 TextInput 의 required 가 아무것도 막지 못한다.
    if (!trimmedName || !trimmedSerial || !trimmedUsername || !password) {
      openErrorSnackbar('이름·학번·아이디·비밀번호를 모두 입력해주세요.', 3000);
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      openErrorSnackbar('유효한 이메일을 입력해주세요.', 5000);
      return;
    }
    if (departmentId === null) {
      openErrorSnackbar('학과를 선택해주세요.', 3000);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await doSignUp({
        username: trimmedUsername,
        password,
        serial: trimmedSerial,
        name: trimmedName,
        email: trimmedEmail,
        departmentId,
      });
      openSuccessSnackbar('회원 가입이 완료 되었습니다.', 3000);
      // 관리자는 계정을 연달아 만든다. 화면에 남고 입력만 비운다.
      setName('');
      setSerial('');
      setUsername('');
      setPassword('');
      setEmail('');
      setDepartmentId(null);
    } catch (error) {
      // 서버 원문 대신 어느 칸을 고쳐야 하는지 알려주는 문구로 바꾼다.
      // 세션 만료는 null 이 와서 스낵바를 건너뛴다.
      const message = signUpErrorMessage(error);
      if (message) openErrorSnackbar(message, 3000);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center">
        <div className="font-bold text-3xl text-black p-8">Sign Up</div>
        <button
          type="button"
          onClick={handleSignUp}
          disabled={submitting}
          aria-label="회원 생성"
          title="회원 생성"
          className="rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50">
          <img
            src={Create}
            alt=""
            aria-hidden
            className="w-7 h-7 hover:scale-125"
          />
        </button>
      </div>
      <div className="px-6 lg:w-1/2 xl:w-1/3 space-y-4">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="name" value="이름" />
          </div>
          <TextInput
            id="name"
            value={name}
            onChange={handleName}
            type="text"
            placeholder="이름을 입력해주세요"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="serial" value="학번" />
          </div>
          <TextInput
            id="serial"
            value={serial}
            onChange={handleSerial}
            type="text"
            placeholder="학번을 입력해주세요"
            maxLength={9}
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="username" value="아이디" />
          </div>
          <TextInput
            id="username"
            value={username}
            onChange={handleUserName}
            type="id"
            placeholder="아이디를 입력해주세요"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password" value="비밀번호" />
          </div>
          <TextInput
            id="password"
            value={password}
            onChange={handlePassword}
            type="password"
            placeholder="비밀번호를 입력해주세요"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email" value="이메일" />
          </div>
          <TextInput
            id="email"
            value={email}
            onChange={handleEmail}
            type="email"
            placeholder="이메일을 입력해주세요"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="departmentId" value="학과" />
          </div>
          <select
            id="departmentId"
            className="w-full border border-gray-300 rounded-md px-2 py-1"
            value={departmentId ?? ''}
            onChange={handleDepartment}>
            <option value="" disabled>
              학과를 선택하세요
            </option>
            {departments?.map(dept => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.departmentName}
              </option>
            ))}
          </select>
          {/* 목록을 못 불러오면 고를 수 있는 항목이 하나도 없다. 원인을 짚을 단서는 남긴다. */}
          {departmentsFailed && (
            <p className="mt-1 text-sm text-red-500">
              학과 목록을 불러오지 못했습니다. 새로 고친 뒤 다시 시도해 주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
