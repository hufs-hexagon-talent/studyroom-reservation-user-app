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
    <div className="flex items-center py-0 px-4 min-h-screen justify-center bg-gray-200">
      <div className="flex items-center max-w-5xl w-full">
        <div className="mb-2.5 text-center w-1/2 p-5">
          <h1 className="text-2xl font-semibold">LOGIN</h1>
          <p className="text-lg whitespace-nowrap">
            이용하시기 전에 먼저 로그인해주세요
          </p>
        </div>
        <div className="w-1/2 p-5">
          <form className="flex flex-col rounded-lg p-10 max-w-sm w-full focus:outline-none bg-gray-800">
            <input
              className="text-gray-400 text-xl mb-5 h-10"
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="text-gray-400 text-xl mb-5 h-10"
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div className="flex flex-col text-center gap-4">
              <button
                className="border-none outline-none cursor-pointer bg-blue-200 py-4 px-0 rounded-md text-white text-lg font-semibold hover:opacity-90"
                type="button"
                onClick={handleSignIn}>
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
