'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export type DataMode = 'live' | 'demo' | 'sim' | 'all';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isSimulated: boolean;
  setIsSimulated: (val: boolean) => void;
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  activeRole: string;
  setActiveRole: (role: string) => void;
  audioActive: boolean;
  toggleAudio: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [dataMode, setDataModeState] = useState<DataMode>('demo');
  const [activeRole, setActiveRoleState] = useState<string>('Incident Officer');
  const [audioActive, setAudioActive] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('nagarnetra-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    const savedMode = localStorage.getItem('nagarnetra-data-mode') as DataMode;
    if (savedMode) setDataModeState(savedMode);
    const savedRole = localStorage.getItem('nagarnetra_auth_role');
    if (savedRole) setActiveRoleState(savedRole);
  }, []);

  const setDataMode = (mode: DataMode) => {
    setDataModeState(mode);
    localStorage.setItem('nagarnetra-data-mode', mode);
  };

  const setActiveRole = (role: string) => {
    setActiveRoleState(role);
    localStorage.setItem('nagarnetra_auth_role', role);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('nagarnetra-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const toggleAudio = () => {
    setAudioActive(!audioActive);
  };

  const isSimulated = dataMode === 'sim';
  const setIsSimulated = (val: boolean) => {
    setDataMode(val ? 'sim' : 'live');
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      isSimulated,
      setIsSimulated,
      dataMode,
      setDataMode,
      activeRole,
      setActiveRole,
      audioActive,
      toggleAudio
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
