import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// --- Environment-aware setup ---
const getEnv = () => {
  const arg = process.argv.find(arg => arg.startsWith('--env='));
  if (!arg) {
    console.error('Error: Missing environment argument. Please specify --env=dev, --env=staging, or --env=prod.');
    process.exit(1);
  }
  return arg.split('=')[1];
};

const env = getEnv();
const serviceAccountName = `serviceAccountKey-${env}.json`;
const serviceAccountPath = path.join(__dirname, `../config/${serviceAccountName}`);

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Error: Service account key not found for environment '${env}'. Expected to find ${serviceAccountName} in server/config/`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
const projectId = serviceAccount.project_id;

if (!projectId) {
  console.error('Project ID not found in service account key file.');
  process.exit(1);
}
// --- End of environment-aware setup ---

// Initialize a dedicated Firebase Admin SDK instance for the script
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: projectId,
  });
  console.log(`Firebase Admin SDK initialized for project: ${projectId}`);
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

const seedDatabase = async () => {
  try {
    const questionsPath = path.join(__dirname, '../../seed-data/questions.json');
    const questionsJson = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsJson);

    const questionsCollection = db.collection('questions');

    console.log(`Starting to seed ${questions.length} questions to '${env}' environment...`);

    for (const question of questions) {
      const docRef = questionsCollection.doc(question.questionId);
      await docRef.set(question);
      console.log(`Upserted question: ${question.questionId}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();