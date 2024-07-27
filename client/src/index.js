import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import Homepage from './components/homepage';
import SignUp from './components/SignUp';
import Login from './components/Login';
import NavbarF from './components/Navbar';
import Hotels from './components/Hotels';
import Profile from './components/Profile';

const App = () => {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    // Check for token in localStorage when the app loads
    const token = localStorage.getItem('token');
    if (token) {
      setAuth(true);
    }
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Homepage />,
    },
    {
      path: "/signup",
      element: <SignUp setAuth={setAuth} />,
    },
    {
      path: "/login",
      element: <Login setAuth={setAuth} />,
    },
    {
      path: "/hotels",
      element: <Hotels /> 
    },
    {
      path: "/profile",
      element: <Profile />
    }
  ]);

  return (
    <>
      <NavbarF auth={auth} setAuth={setAuth} />
      <RouterProvider router={router} />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
