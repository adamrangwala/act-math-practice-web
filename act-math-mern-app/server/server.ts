import dotenv from 'dotenv';
dotenv.config();
import './config/firebase'; // Initialize Firebase Admin SDK
import './routes/api'; // Force import for debugging

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';
// Trivial change to force redeploy
const app: Express = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000', // Your local dev frontend
  'https://act-math-app-staging.vercel.app',
  'https://act-math-app-staging-git-develop-adamrangwalas-projects.vercel.app',
  'https://act-math-app-production.vercel.app',
  'https://actmathsprint.com',
  'https://www.actmathsprint.com'
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use((req, res, next) => {
  console.log('Incoming request origin:', req.headers.origin);
  next();
});

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('ACT Math Practice App Server is running!');
});

// Add a simple test route for debugging
app.get('/api/test', (req: Request, res: Response) => {
  res.status(200).send('Test route is working!');
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
