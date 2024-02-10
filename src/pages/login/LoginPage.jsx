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
          <div className="relative w-full h-12 mx-0 my-1.75">
            <label>Email : </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="relative w-full h-12 mx-0 my-1.75">
            <label>Password : </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
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
