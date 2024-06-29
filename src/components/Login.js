import { useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setError(null); // Clear any previous errors
      navigate('/'); // Redirect to home or dashboard
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row>
        <form className="border p-4">
          <h3 className="text-center mb-4">SNAP360 APPOINTMENTS</h3>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary" onClick={handleLogin}>
              Login
            </button>
          </div>
          {error && <div className="text-danger mt-3">{error}</div>}
        </form>
      </Row>
    </Container>
  );
};

export default Login;
