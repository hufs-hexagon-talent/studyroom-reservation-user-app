import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import '../../firebase.js';

import login_boo from '../../assets/login_boo.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setError] = useState(null);
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
    <div className="flex p-0 bg-gray-200">
      <div className="flex max-w-5xl w-full">
        <div className="ml-0 w-full h-full">
          <img src={login_boo} alt="boo" />
        </div>
        <div className="w-1/2 p-5 items-center">
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
