import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import '../../firebase.js';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = () => {
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
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

  return (
    <div className="m-0 p-0 box-border flex items-center pt-0 pb-4 min-h-screen justify-center bg-gray-100">
      <div className="justify-between max-w-5xl w-full">
        <div className="mb-2.5">
          <h1>LOGIN</h1>
          <p className="text-lg whitespace-nowrap">
            이용하시기 전에 먼저 로그인해주세요
          </p>
        </div>
        <form className="flex flex-col bg-white rounded-lg p-5 max-w-sm w-full focus:outline-none bg-blue-500">
          <input
            className="text-gray-400 text-base"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <div>
            <button type="button" onClick={handleSignIn}>
              Login
            </button>
          </div>
          <hr />
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
