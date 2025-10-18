import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// --- Explicitly load service account and project ID ---
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
const projectId = serviceAccount.project_id;

if (!projectId) {
  console.error('Project ID not found in service account key file.');
  process.exit(1);
}
// --- End of new section ---

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: projectId, // Explicitly set the project ID
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = admin.firestore();

const seedDatabase = async () => {
  try {
    const questionsPath = path.join(__dirname, '../../seed-data/questions.json');
    const questionsJson = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsJson);

    const questionsCollection = db.collection('questions');

    console.log('Starting to seed questions...');

    for (const question of questions) {
      // Use the custom questionId as the document ID
      const docRef = questionsCollection.doc(question.questionId);
      await docRef.set(question);
      console.log(`Added question: ${question.questionId}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
