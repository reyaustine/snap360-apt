// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth } from "../firebase";
// import Login from './Login'; // Import the Login component

// const ProtectedRoute = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const navigate = useNavigate(); // Move useNavigate inside the component

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(user => {
//       setCurrentUser(user);
//       if (!user) {
//         navigate("/login"); // Redirect to login if not authenticated
//       }
//     });

//     return unsubscribe;
//   }, [navigate]);

//   return currentUser ? children : null; // Render children only if user is logged in
// };

// export default ProtectedRoute;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Login from './Login'; // Import the Login component

const ProtectedRoute = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Move useNavigate inside the component

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setIsLoading(false); // Update loading state once authentication check is complete
      if (!user) {
        navigate("/login"); // Redirect to login if not authenticated
      }
    });

    return unsubscribe;
  }, [navigate]);

  // Render loading indicator while authentication check is in progress
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render children only if user is logged in
  return currentUser ? children : <Login/>;
};

export default ProtectedRoute;
