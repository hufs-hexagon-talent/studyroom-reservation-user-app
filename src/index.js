import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';
const packagejson = require('../package.json');

import SnackbarProvider from 'react-simple-snackbar';
import './index.css';

import reportWebVitals from './reportWebVitals';
import Router from './router';
import { DomainProvider } from './contexts/DomainContext';

export const queryClient = new QueryClient();

console.log('[Version]', packagejson.version);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DomainProvider>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <Router />
          </SnackbarProvider>
        </QueryClientProvider>
      </RecoilRoot>
    </DomainProvider>
  </React.StrictMode>,
);

//console.log('REACT_APP_API_URL', process.env.REACT_APP_API_URL);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
