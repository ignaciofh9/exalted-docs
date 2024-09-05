'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useGameData } from '@/app/GameDataContext/GameDataContext';
import { AffinityType } from '@/app/types';
import ImageIcon from '@/app/components/imageIcon';

const AffinitySelector: React.FC = () => {
  const { currentVersion: currentAffinity, setCurrentVersion: setCurrentAffinity } = useGameData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAffinityChange = (affinity: AffinityType) => {
    setCurrentAffinity(affinity);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentAffinity) {
    return null; // or return a loading state
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-[0.47em] text-sm font-medium border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-300 transition-colors duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        <div className="flex items-center">
          <ImageIcon
            iconPath={`affinities/${currentAffinity.toLowerCase()}`}
            title={currentAffinity}
            size={1.4}
            className="mr-2"
          />
          <span>{currentAffinity}</span>
        </div>
        <svg
          className={`h-4 w-4 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg">
          {Object.values(AffinityType).map((affinity) => (
            <button
              key={affinity}
              onClick={() => handleAffinityChange(affinity)}
              className={`flex items-center w-full px-3 py-[0.35em] text-sm ${
                affinity === currentAffinity
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-700 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              } transition-colors duration-150`}
            >
              <ImageIcon
                iconPath={`affinities/${affinity.toLowerCase()}`}
                title={affinity}
                size={1.4}
                className="w-4 h-4 mr-2"
              />
              {affinity}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AffinitySelector;