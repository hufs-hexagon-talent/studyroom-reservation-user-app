import React from 'react';
import { Button, Label, TextInput } from 'flowbite-react';

const SignUp = () => {
  return (
    <div>
      <h1 className="flex justify-center w-screen text-xl font-bold text-center mt-10 mb-5">
        회원가입
      </h1>
      <form id="form" className="flex flex-col max-w-md w-full gap-4">
        <div>
          <div className="mb-2 block">
            <Label value="아이디" />
          </div>
          <TextInput type="id" placeholder="아이디를 입력해주세요" required />
        </div>
        <div>
          <div className="mb-2 block">
            <Label value="비밀번호" />
          </div>
          <TextInput
            type="password"
            placeholder="비밀번호를 입력해주세요"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label value="이메일" />
          </div>
          <TextInput
            type="email"
            placeholder="이메일을 입력해주세요"
            required
          />
        </div>
        <Button className="mt-10 mb-10" color="dark" type="submit">
          회원 가입
        </Button>
      </form>
    </div>
  );
};

export default SignUp;
