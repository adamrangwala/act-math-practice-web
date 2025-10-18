"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// --- Explicitly load service account and project ID ---
const serviceAccountPath = path_1.default.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(fs_1.default.readFileSync(serviceAccountPath, 'utf8'));
const projectId = serviceAccount.project_id;
if (!projectId) {
    console.error('Project ID not found in service account key file.');
    process.exit(1);
}
// --- End of new section ---
// Initialize Firebase Admin SDK
try {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
        projectId: projectId, // Explicitly set the project ID
    });
    console.log('Firebase Admin SDK initialized successfully.');
}
catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
}
const db = firebase_admin_1.default.firestore();
const seedDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questionsPath = path_1.default.join(__dirname, '../../seed-data/questions.json');
        const questionsJson = fs_1.default.readFileSync(questionsPath, 'utf8');
        const questions = JSON.parse(questionsJson);
        const questionsCollection = db.collection('questions');
        console.log('Starting to seed questions...');
        for (const question of questions) {
            // Use the custom questionId as the document ID
            const docRef = questionsCollection.doc(question.questionId);
            yield docRef.set(question);
            console.log(`Added question: ${question.questionId}`);
        }
        console.log('Seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
});
seedDatabase();
