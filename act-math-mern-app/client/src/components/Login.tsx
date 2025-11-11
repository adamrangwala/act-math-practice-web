import React from 'react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Button, Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link

const Login = () => {
  const signInWithGoogle = async () => {
    try {
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
