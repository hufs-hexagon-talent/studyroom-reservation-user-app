import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import '../../firebase.js';

const LoginPage = () => {
  const [studentId, setStudentId] = useState('');
  const [userName, setUserName] = useState('');
  const [setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = () => {
    const auth = getAuth();

    signInWithEmailAndPassword(auth, studentId, userName)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('login');
        navigate('/rooms');
        return user;
      })
      .catch(error => {
        const errorMessage = error.message;
        setError(errorMessage);
      });
  };

  // 취소를 누르면 데이터 삭제되는 함수 구현해야함
  // 확인 누르면 Reservation.jsx로 가야함 데이터랑 같이 !!!

  return (
    <>
      <h1 className="text-3xl text-center mt-10">예약자 정보 기입</h1>
      <div className="flex justify-center min-h-screen">
        <div className="items-center mt-10 w-1/2">
          <div>
            <form
              style={{ border: '1px solid #666666' }}
              className="flex flex-col p-10 w-50 focus:outline-none">
              <div className="mb-3">학번</div>
              <input
                style={{ border: '1px solid #666666', borderRadius: '5px' }}
                className="text-black text-xl mb-5 h-10 pl-3"
                placeholder="ex)2022xxxxx"
                type="studentId"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
              />
              <div className="mb-3">이름</div>
              <input
                className="text-black text-xl mb-5 h-10 pl-3"
                style={{ border: '1px solid #666666', borderRadius: '5px' }}
                placeholder="ex)홍길동"
                type="userName"
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
              <div className="flex mt-5 gap-4 justify-center">
                <button
                  style={{ backgroundColor: '#D9D9D9' }}
                  className="w-24 h-10 mr-3 cursor-pointer text-black text-lg hover:opacity-90 flex items-center justify-center"
                  type="button">
                  취소
                </button>
                <button
                  style={{ backgroundColor: '#002D56' }}
                  className="w-24 h-10 ml-3 cursor-pointer text-white text-lg hover:opacity-90 flex items-center justify-center"
                  type="button"
                  onClick={handleSignIn}>
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
