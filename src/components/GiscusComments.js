// src/components/GiscusComments.js
import React, { useState, useEffect } from 'react';
import Giscus from '@giscus/react';

const GiscusComments = () => {
  const [giscusTheme, setGiscusTheme] = useState('preferred_color_scheme');

  useEffect(() => {
    // Function to determine Giscus theme based on <html> or <body> class
    // gatsby-plugin-dark-mode adds 'dark-mode' or 'light-mode' classes
    const getTheme = () => {
      // Ensure we are in a browser environment before accessing document
      if (typeof document === 'undefined') {
        return 'preferred_color_scheme'; // Default if not in browser
      }

      const isDarkMode = document.documentElement.classList.contains('dark-mode') ||
        document.body.classList.contains('dark-mode');
      const isLightMode = document.documentElement.classList.contains('light-mode') ||
        document.body.classList.contains('light-mode');

      if (isDarkMode) {
        return 'dark_dimmed'; // A nice dark theme from Giscus, or 'dark', 'transparent_dark'
      }
      if (isLightMode) {
        return 'light';
      }
      // Default if no specific theme class is found on html/body
      return 'preferred_color_scheme';
    };

    setGiscusTheme(getTheme());

    // Observe class changes on <html> and <body> to update Giscus theme dynamically
    // Ensure we are in a browser environment before setting up MutationObserver
    if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            setGiscusTheme(getTheme());
          }
        }
      });

      if (document.documentElement) {
        observer.observe(document.documentElement, { attributes: true });
      }
      if (document.body) {
        observer.observe(document.body, { attributes: true });
      }

      return () => observer.disconnect(); // Cleanup observer on component unmount
    }
  }, []);

  // --- THESE VALUES ARE NOW CONFIGURED WITH YOUR DETAILS ---
  const giscusRepo = "bdteo/bdteo.com";
  const giscusRepoId = "R_kgDOOpaGqQ";
  const giscusCategory = "Blog Comments"; // The name of the category you created
  const giscusCategoryId = "DIC_kwDOOpaGqc4CqGt8";
  // --- END OF CONFIGURED VALUES ---

  // Basic validation to guide the site owner during setup.
  // This check compares against the *original placeholder values*.
  // Since your values are now filled, this condition should be false,
  // and the warning message will not appear.
  if (
    giscusRepo === "YOUR_GITHUB_USERNAME/YOUR_REPO_NAME" || // Default check
    !giscusRepoId || giscusRepoId === "YOUR_REPO_ID" ||     // Default check
    !giscusCategory || // Added a check for giscusCategory itself being a placeholder if you had one
    !giscusCategoryId || giscusCategoryId === "YOUR_CATEGORY_ID" // Default check
  ) {
    const warningMessage =
      "Giscus comments are not fully configured. " +
      "Please update src/components/GiscusComments.js with your Giscus settings " +
      "(giscusRepo, giscusRepoId, giscusCategory, giscusCategoryId). " +
      "You can get these values from giscus.app after setting up your repository.";

    // Only show this detailed warning in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(warningMessage);
      return (
        <div style={{
          padding: 'var(--spacing-4)',
          border: '2px dashed var(--color-primary)',
          margin: 'var(--spacing-8) 0',
          backgroundColor: 'var(--color-background-soft)',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--color-text)' // Ensure text is visible
        }}>
          <p style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
            Note for site owner: Giscus Configuration Needed
          </p>
          <p style={{ color: 'var(--color-text-light)' }}>{warningMessage}</p>
          <p style={{ color: 'var(--color-text-light)' }}>Comments will not load until this component is correctly configured.</p>
        </div>
      );
    }
    // In production, don't show a broken component or error message to users
    return null;
  }

  return (
    <div className="comments-container" style={{
      paddingTop: 'var(--spacing-8)',
      marginTop: 'var(--spacing-8)',
      borderTop: '1px solid var(--color-border)'
    }}>
      <h2 style={{
        marginBottom: 'var(--spacing-6)',
        fontSize: 'var(--font-size-2xl)',
        color: 'var(--color-text)' // Ensure heading text is visible
      }}>
        Comments
      </h2>
      <Giscus
        id="comments" // Unique ID for the Giscus container
        repo={giscusRepo}
        repoId={giscusRepoId}
        category={giscusCategory}
        categoryId={giscusCategoryId}
        mapping="pathname"      // Maps comments to the page's pathname.
        reactionsEnabled="1"    // Enable reactions (👍, 👎, etc.)
        emitMetadata="0"        // Do not emit metadata to parent window
        inputPosition="top"     // Comment box appears above comments
        theme={giscusTheme}     // Dynamically set theme
        lang="en"               // Language for Giscus UI
        loading="lazy"          // Load Giscus script lazily for better performance
      />
    </div>
  );
};

export default GiscusComments;
