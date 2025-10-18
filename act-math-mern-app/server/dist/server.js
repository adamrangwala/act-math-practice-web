"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("./config/firebase"); // Initialize Firebase Admin SDK
require("./routes/api"); // Force import for debugging
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("./routes/api"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('ACT Math Practice App Server is running!');
});
// Add a simple test route for debugging
app.get('/api/test', (req, res) => {
    res.status(200).send('Test route is working!');
});
app.use('/api', api_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
