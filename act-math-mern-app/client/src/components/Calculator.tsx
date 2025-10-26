import React, { useState } from 'react';
import './Calculator.css';

interface CalculatorProps {
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const handleButtonClick = (value: string) => {
    if (value === 'C') {
      setDisplay('0');
      setExpression('');
    } else if (value === '=') {
      try {
        // Note: eval() is used for simplicity here. For a production app, a safer parsing library would be better.
        const result = eval(expression.replace('^', '**'));
        setDisplay(result.toString());
        setExpression(result.toString());
      } catch (error) {
        setDisplay('Error');
        setExpression('');
      }
    } else {
      if (display === '0' || display === 'Error') {
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
        <div className="calculator-display">{display}</div>
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
          {renderButton('sin', 'function')}
          {renderButton('=', 'operator')}
          {renderButton('cos', 'function')}
          {renderButton('tan', 'function')}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
