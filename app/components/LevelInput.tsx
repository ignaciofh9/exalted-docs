import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface LevelInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const LevelInput = ({ value, onChange, min = 1, max = 20 }: LevelInputProps): JSX.Element => {
  const increment = () => onChange(Math.min(value + 1, max));
  const decrement = () => onChange(Math.max(value - 1, min));

  return (
    <div className="inline-flex items-center bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-opacity-50">
      <input
        type="number"
        title='Level'
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          if (newValue >= min && newValue <= max) {
            onChange(newValue);
          }
        }}
        min={min}
        max={max}
        className="w-8 bg-transparent text-center text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="flex flex-col -my-px">
        <button 
          title='Increase Level'
          onClick={increment} 
          disabled={value >= max}
          className="p-px hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        >
          <ChevronUp size={12} className="text-neutral-600 dark:text-neutral-400" />
        </button>
        <button 
          title='Decrease Level'
          onClick={decrement} 
          disabled={value <= min}
          className="p-px hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        >
          <ChevronDown size={12} className="text-neutral-600 dark:text-neutral-400" />
        </button>
      </div>
    </div>
  );
};

export default LevelInput;