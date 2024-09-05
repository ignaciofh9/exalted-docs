'use client';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { GameData, AffinityType } from '@/app/types';
import { transformGameData } from '../utils/versionedProcessor';

type GameDataContextType = {
  gameData: GameData | null;
  currentVersion: AffinityType;
  setCurrentVersion: (version: AffinityType) => void;
  isLoading: boolean;
  error: string | null;
};

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'currentAffinityVersion';

export const GameDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentVersion, setCurrentVersion] = useState<AffinityType>(AffinityType.Dark);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedVersion = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedVersion) {
      setCurrentVersion(savedVersion as AffinityType);
    }
  }, []);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch('/api/gameData');
        if (!response.ok) {
          throw new Error('Failed to fetch game data');
        }
        const rawGameData = await response.json();
        const transformedGameData = transformGameData(rawGameData);
        setGameData(transformedGameData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, []);

  const setPersistedCurrentVersion = (version: AffinityType) => {
    setCurrentVersion(version);
    localStorage.setItem(LOCAL_STORAGE_KEY, version);
  };

  return (
    <GameDataContext.Provider 
      value={{ 
        gameData, 
        currentVersion, 
        setCurrentVersion: setPersistedCurrentVersion, 
        isLoading, 
        error 
      }}
    >
      {children}
    </GameDataContext.Provider>
  );
};

export const useGameData = () => {
  const context = useContext(GameDataContext);
  if (context === undefined) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
};