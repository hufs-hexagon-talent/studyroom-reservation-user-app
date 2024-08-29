import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';  // Recoil 추가

import SnackbarProvider from 'react-simple-snackbar';
import './index.css';

import reportWebVitals from './reportWebVitals';
import Router from './router';

export const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <Router />
        </SnackbarProvider>
      </QueryClientProvider>
    </RecoilRoot>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
