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
      <div className="h-screen flex items-center justify-center bg-gray-800">
        <div className="bg-white w-full max-w-lg py-10 rounded-lg text-center">
          <h3 className="text-3xl text-gray-800">Log In</h3>
          <div>
            <form className="flex flex-col mt-5 px-5">
              <div>
                <input
                  placeholder="Email"
                  className="bg-gray-100 shadow-inner focus:outline-none border-2 focus:border-opacity-50 focus:border-yellow-400 mb-3 py-3 px-5 rounded-lg"
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
                  className="w-6 h-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>
              <div>
                <input
                  placeholder="Password"
                  className="bg-gray-100 shadow-inner focus:outline-none border-2 focus:border-opacity-50 focus:border-yellow-400 mb-3 py-3 px-5 rounded-lg"
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

            <button
              className="py-3 px-5 bg-gray-800 text-white mt-3 text-lg rounded-lg focus:outline-none hover:opacity-90"
              type="button"
              onClick={handleSignIn}>
              Log In
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
