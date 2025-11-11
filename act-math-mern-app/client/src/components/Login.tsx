import React, { useEffect } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Button, Container, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const Login = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get the currentUser from context

  // This effect will run whenever the currentUser state changes.
  useEffect(() => {
    // If the currentUser exists, it means login was successful and the context is updated.
    // Now it's safe to navigate away from the login page.
    if (currentUser) {
      navigate('/'); // Navigate to the root, App.tsx will handle the rest.
    }
  }, [currentUser, navigate]); // Dependencies for the effect

  const signInWithGoogle = async () => {
    try {
      // We just need to trigger the sign-in, the useEffect will handle the redirect.
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <Container className="d-flex vh-100 justify-content-center align-items-center">
      <Card style={{ width: '24rem' }} className="text-center p-4">
        <Card.Body>
          <Card.Title as="h1" className="mb-4">Welcome!</Card.Title>
          <Card.Text className="mb-4">
            Let's get started on your ACT Math journey. Sign in to begin practicing.
          </Card.Text>
          <Button variant="primary" size="lg" onClick={signInWithGoogle}>
            Sign in with Google
          </Button>
          <p className="mt-3 text-muted" style={{ fontSize: '0.8rem' }}>
            By signing in, you agree to our <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;