import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import '../../firebase.js';

// practice
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
    <>
      <div className="w-27 bg-red-200 text-white">
        <h1 className="w-2.25 text-center">Log In</h1>
        <form>
          <div className="relative w-full h-12 mx-0 my-1.75 border-2 border-solid border-white border-opacity-20 rounded-3xl w-full h-full bg-transparent border-none outline-none px-4">
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6 absolute right-5 top">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </div>
          <div className="relative w-full h-12 mx-0 my-1.75 border-2 border-solid border-white border-opacity-20 rounded-3xl w-full h-full bg-transparent border-none outline-none px-4">
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
        </form>

        <br />
        <button type="button" onClick={handleSignIn}>
          Log In
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </>
  );
};

export default LoginPage;
