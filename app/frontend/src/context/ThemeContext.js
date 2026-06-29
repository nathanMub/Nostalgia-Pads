import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // INIT THEME ON LOAD
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');

      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    } catch (err) {
      console.error('Theme init error:', err);
    }
  }, []);

  const toggleTheme = () => {
    try {
      setIsDarkMode(prev => {
        const newMode = !prev;

        if (newMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }

        return newMode;
      });
    } catch (err) {
      console.error('Theme toggle error:', err);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
