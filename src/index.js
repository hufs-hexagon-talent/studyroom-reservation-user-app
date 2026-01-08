import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';
const packagejson = require('../package.json');

import SnackbarProvider from 'react-simple-snackbar';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import './index.css';

import reportWebVitals from './reportWebVitals';
import Router from './router';
import { DomainProvider } from './contexts/DomainContext';

localStorage.removeItem('authState');
localStorage.removeItem('refreshToken');
localStorage.removeItem('accessToken');

export const queryClient = new QueryClient();

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

reportWebVitals();
