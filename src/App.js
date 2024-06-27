import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login';
import { auth } from './firebase'; // Make sure to import auth
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginProtectedRoute />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

const LoginProtectedRoute = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setIsLoading(false);
      if (user) {
        navigate('/'); // Redirect to home if already authenticated
      }
    });

    return unsubscribe;
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return currentUser ? <Navigate to="/" /> : <Login />;
};

export default App;
