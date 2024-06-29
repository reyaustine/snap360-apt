import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const ProtectedRoute = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setIsLoading(false); // Update loading state once authentication check is complete
      if (!user) {
        navigate('/login'); // Redirect to login if not authenticated
      }
    });

    return unsubscribe;
  }, [navigate]);

  // Render loading indicator while authentication check is in progress
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render children only if user is logged in
  return currentUser ? children : null;
};

export default ProtectedRoute;
