import React from 'react'
import { createRoot } from 'react-dom/client';
import AppRoutes from './AppRoutes';
import {
  RecoilRoot,
} from 'recoil';

document.addEventListener('DOMContentLoaded', () => {
  const appRoot = createRoot(document.getElementById('root'));
  appRoot.render(
    <RecoilRoot>
      <AppRoutes/>
    </RecoilRoot>
  )
})
