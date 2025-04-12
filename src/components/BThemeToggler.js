import React from 'react';
import { ThemeToggler } from 'gatsby-plugin-dark-mode';

const DARK_THEME = 'dark-mode';
const LIGHT_THEME = 'light-mode';

export const BThemeToggler = () => {
  return (
    <ThemeToggler>
      {({ theme, toggleTheme }) => {
        const isDarkTheme = theme === DARK_THEME;
        
        return (
          <div className="theme-toggle-wrapper">
            <button 
              className="theme-toggle-button"
              onClick={() => toggleTheme(isDarkTheme ? LIGHT_THEME : DARK_THEME)}
              aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div className="toggle-track">
                <div className={`toggle-icon ${isDarkTheme ? 'sun' : 'moon'}`}>
                  {isDarkTheme ? 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z" />
                    </svg> 
                    : 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M11.3807 2.01886C9.91573 3.38468 9 5.33897 9 7.49998C9 11.6421 12.3579 15 16.5 15C18.661 15 20.6153 14.0842 21.9811 12.6193C21.6613 17.8535 17.3149 22 12 22C6.47715 22 2 17.5228 2 12C2 6.68514 6.14648 2.33865 11.3807 2.01886Z" />
                    </svg>
                  }
                </div>
                <div className="toggle-thumb" style={{ transform: isDarkTheme ? 'translateX(22px)' : 'translateX(0)' }}></div>
              </div>
            </button>
          </div>
        );
      }}
    </ThemeToggler>
  );
};