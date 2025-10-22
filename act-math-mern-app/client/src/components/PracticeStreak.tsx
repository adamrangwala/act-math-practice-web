import React from 'react';
import { Card } from 'react-bootstrap';

interface PracticeStreakProps {
  practiceDays: string[]; // Expecting dates in 'YYYY-MM-DD' format
}

const PracticeStreak: React.FC<PracticeStreakProps> = ({ practiceDays }) => {
  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date;
  }).reverse();

  const practiceSet = new Set(practiceDays);

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title className="text-center">Your 7-Day Practice Streak</Card.Title>
        <div className="d-flex justify-content-around text-center mt-3">
          {weekDays.map((date, i) => {
            const dateString = date.toISOString().split('T')[0];
            const hasPracticed = practiceSet.has(dateString);
            const dayInitial = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);

            return (
              <div key={i} className="d-flex flex-column align-items-center">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: hasPracticed ? 'var(--primary-green)' : '#e9ecef',
                    color: hasPracticed ? 'white' : 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {hasPracticed ? '🔥' : ''}
                </div>
                <small className="text-muted mt-2">{dayInitial}</small>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PracticeStreak;
