import dotenv from 'dotenv';
dotenv.config();
import './config/firebase'; // Initialize Firebase Admin SDK
import './routes/api'; // Force import for debugging

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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
