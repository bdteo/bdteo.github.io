import React, { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark-mode'); // Default to dark-mode

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);

    // Swap favicon based on theme
    const isDark = theme === 'dark-mode';
    let faviconLink = document.querySelector('link[rel="icon"][data-theme-favicon]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/png';
      faviconLink.setAttribute('data-theme-favicon', 'true');
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = isDark ? '/images/favicon-dark.png' : '/images/favicon-light.png';
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light-mode' ? 'dark-mode' : 'light-mode';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider }; 