import admin from 'firebase-admin';
import path from 'path';

const env = process.env.NODE_ENV || 'development';

let serviceAccount;

if (env === 'production') {
  // In production (Render), rely on Google Application Credentials
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  console.log('Firebase Admin SDK initialized for production.');
} else {
  // For local development and staging, load the key file
  const serviceAccountName = `serviceAccountKey-${env === 'staging' ? 'staging' : 'dev'}.json`;
  const serviceAccountPath = path.join(__dirname, `./${serviceAccountName}`);
  
  try {
    serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log(`Firebase Admin SDK initialized for '${env}' environment.`);
  } catch (error) {
    console.error(`Error initializing Firebase for '${env}'. Make sure ${serviceAccountName} exists in server/config/`, error);
    process.exit(1);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();