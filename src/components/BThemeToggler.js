import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const BThemeToggler = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  if (!theme) {
    return null;
  }

  const isDarkTheme = theme === 'dark-mode';

  return (
    <div className="theme-toggle-wrapper">
      <button
        className="theme-toggle-button"
        onClick={toggleTheme}
        aria-label={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="toggle-icon-container">
          <svg
            className={`toggle-icon toggle-icon--sun ${isDarkTheme ? 'is-active' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
            <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
            <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
          </svg>
          <svg
            className={`toggle-icon toggle-icon--moon ${!isDarkTheme ? 'is-active' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </button>
    </div>
  );
};
