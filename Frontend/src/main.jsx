import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, RouterProvider } from 'react-router-dom';
import router from './routes';
import { Provider } from 'react-redux'
import { store } from './store/store.jsx';

//It renders the correct route (based on the current URL) -> <RouterProvider router = {router} /> 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router = {router} />
    </Provider> 
  </React.StrictMode>
);
