import React, { useState } from 'react';
import './Calculator.css';

interface CalculatorProps {
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [mode, setMode] = useState<'Degrees' | 'Radians'>('Degrees');

  const handleButtonClick = (value: string) => {
    if (value === 'C') {
      setDisplay('0');
      setExpression('');
    } else if (value === 'Deg/Rad') {
      setMode(currentMode => currentMode === 'Degrees' ? 'Radians' : 'Degrees');
    } else if (value === '=') {
      try {
        const result = eval(expression.replace('^', '**'));
        setDisplay(result.toString());
        setExpression(result.toString());
      } catch (error) {
        setDisplay('Error');
        setExpression('');
      }
    } else if (['sqrt', 'sin', 'cos', 'tan'].includes(value)) {
      try {
        const currentNum = parseFloat(display);
        let result;
        if (value === 'sqrt') {
          result = Math.sqrt(currentNum);
        } else {
          const angle = mode === 'Degrees' ? currentNum * (Math.PI / 180) : currentNum;
          if (value === 'sin') result = Math.sin(angle);
          if (value === 'cos') result = Math.cos(angle);
          if (value === 'tan') result = Math.tan(angle);
        }
        const finalResult = parseFloat(result.toFixed(10));
        setDisplay(finalResult.toString());
        setExpression(finalResult.toString());
      } catch (error) {
        setDisplay('Error');
        setExpression('');
      }
    } else {
      if (display === '0' || display === 'Error' || expression === display) {
        setDisplay(value);
        setExpression(value);
      } else {
        setDisplay(display + value);
        setExpression(expression + value);
      }
    }
  };

  const renderButton = (value: string, className = '') => (
    <button onClick={() => handleButtonClick(value)} className={`calc-btn ${className}`}>
      {value}
    </button>
  );

  return (
    <div className="calculator-overlay" onClick={onClose}>
      <div className="calculator" onClick={(e) => e.stopPropagation()}>
        <div className="calculator-display">
          <span className="mode-indicator">{mode.substring(0, 3).toUpperCase()}</span>
          {display}
        </div>
        <div className="calculator-buttons">
          {renderButton('C', 'function')}
          {renderButton('^', 'operator')}
          {renderButton('sqrt', 'operator')}
          {renderButton('/', 'operator')}
          {renderButton('7')}
          {renderButton('8')}
          {renderButton('9')}
          {renderButton('*', 'operator')}
          {renderButton('4')}
          {renderButton('5')}
          {renderButton('6')}
          {renderButton('-', 'operator')}
          {renderButton('1')}
          {renderButton('2')}
          {renderButton('3')}
          {renderButton('+', 'operator')}
          {renderButton('0')}
          {renderButton('.')}
          {renderButton('Deg/Rad', 'function')}
          {renderButton('=', 'operator')}
          {renderButton('sin', 'function')}
          {renderButton('cos', 'function')}
          {renderButton('tan', 'function')}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
