import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';

export const wrapRootElement = ({ element }) => {
  return <ThemeProvider>{element}</ThemeProvider>;
};

const MagicScriptTag = () => {
  const codeToRunOnClient = `
(function() {
  function getInitialTheme() {
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        return storedTheme;
      }
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark-mode';
      }
    } catch (e) {
      // ignore
    }
    return 'light-mode';
  }

  const theme = getInitialTheme();
  document.body.className = theme;
})();
`;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />;
};

export const onRenderBody = ({ setHtmlAttributes, setPreBodyComponents }) => {
  setHtmlAttributes({ lang: 'en' });
  setPreBodyComponents(<MagicScriptTag key="theme-script" />);
};
