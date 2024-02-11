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
              <input
                placeholder="Email"
                className="bg-gray-100 shadow-inner focus:outline-none border-2 focus:border-opacity-50 focus:border-green-600 mb-3 py-3 px-5 rounded-lg"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <input
                placeholder="Password"
                className="bg-gray-100 shadow-inner focus:outline-none border-2 focus:border-opacity-50 focus:border-green-600 mb-3 py-3 px-5 rounded-lg"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
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
