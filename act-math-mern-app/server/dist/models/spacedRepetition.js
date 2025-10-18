"use strict";
// Spaced Repetition Model (SM-2 Algorithm)
Object.defineProperty(exports, "__esModule", { value: true });
exports.sm2 = void 0;
const sm2 = (progress, quality) => {
    if (quality < 0 || quality > 5) {
        throw new Error("Quality must be between 0 and 5.");
    }
    // 1. Calculate new ease factor
    let newEaseFactor = progress.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) {
        newEaseFactor = 1.3;
    }
    // 2. Calculate new repetitions and interval
    let newRepetitions;
    let newInterval;
    if (quality < 3) {
        newRepetitions = 0;
        newInterval = 1;
    }
    else {
        newRepetitions = progress.repetitions + 1;
        if (newRepetitions === 1) {
            newInterval = 1;
        }
        else if (newRepetitions === 2) {
            newInterval = 6;
        }
        else {
            newInterval = Math.round(progress.interval * newEaseFactor);
        }
    }
    return {
        repetitions: newRepetitions,
        easeFactor: newEaseFactor,
        interval: newInterval,
    };
};
exports.sm2 = sm2;
