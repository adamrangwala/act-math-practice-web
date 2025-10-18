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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSettings = exports.getUserSettings = exports.initUser = void 0;
const firebase_1 = require("../config/firebase");
const initUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const { uid, email, name, picture } = req.user;
    try {
        const userRef = firebase_1.db.collection('users').doc(uid);
        const doc = yield userRef.get();
        if (!doc.exists) {
            yield userRef.set({
                email,
                displayName: name,
                photoURL: picture,
                dailyQuestionLimit: 10, // Default value
                createdAt: new Date(),
                lastActiveAt: new Date(),
            });
            res.status(201).send({ message: 'User profile created.' });
        }
        else {
            yield userRef.update({ lastActiveAt: new Date() });
            res.status(200).send({ message: 'User profile updated.' });
        }
    }
    catch (error) {
        console.error('Error initializing user:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
exports.initUser = initUser;
const getUserSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    try {
        const userRef = firebase_1.db.collection('users').doc(req.user.uid);
        const doc = yield userRef.get();
        if (!doc.exists) {
            return res.status(404).send({ message: 'User not found' });
        }
        const data = doc.data();
        // Ensure we send a plain object, not a complex Firestore type
        res.status(200).json({
            dailyQuestionLimit: data === null || data === void 0 ? void 0 : data.dailyQuestionLimit,
            displayName: data === null || data === void 0 ? void 0 : data.displayName,
            email: data === null || data === void 0 ? void 0 : data.email,
        });
    }
    catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
exports.getUserSettings = getUserSettings;
const updateUserSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const { dailyQuestionLimit } = req.body;
    if (typeof dailyQuestionLimit !== 'number' || dailyQuestionLimit < 5) {
        return res.status(400).send({ message: 'Invalid daily question limit.' });
    }
    try {
        const userRef = firebase_1.db.collection('users').doc(req.user.uid);
        yield userRef.update({ dailyQuestionLimit });
        res.status(200).send({ message: 'Settings updated successfully.' });
    }
    catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
exports.updateUserSettings = updateUserSettings;
