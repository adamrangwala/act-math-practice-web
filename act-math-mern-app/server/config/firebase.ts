import admin from 'firebase-admin';
import path from 'path';

const env = process.env.NODE_ENV || 'development';

try {
  let serviceAccount;

  // Production/Staging on Render: credentials are in an env variable
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    console.log(`Firebase Admin SDK initialized for '${env}' via environment variable.`);
  } 
  // Local Development: credentials are in a file
  else {
    const serviceAccountName = `serviceAccountKey-dev.json`;
    const serviceAccountPath = path.join(__dirname, `./${serviceAccountName}`);
    serviceAccount = require(serviceAccountPath);
    console.log(`Firebase Admin SDK initialized for local development from file.`);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
