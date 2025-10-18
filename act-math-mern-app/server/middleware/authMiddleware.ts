import { Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { DecodedIdToken } from 'firebase-admin/auth';
import { AuthRequest } from '../controllers/authController'; // Assuming AuthRequest is exported from authController

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Unauthorized: No token provided.' });
  }

  const idToken = authorization.split('Bearer ')[1];

  try {
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(403).send({ message: 'Forbidden: Invalid token.' });
  }
};

export default authMiddleware;
