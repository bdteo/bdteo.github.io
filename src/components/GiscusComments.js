// src/components/GiscusComments.js
import React, { useState, useEffect } from 'react';
import Giscus from '@giscus/react';
import { useStaticQuery, graphql } from 'gatsby';

const GiscusComments = () => {
  const [giscusThemeSetting, setGiscusThemeSetting] = useState('preferred_color_scheme');

  // Get siteUrl for constructing absolute CSS paths in production
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `);
  const productionSiteUrl = site.siteMetadata.siteUrl;

  useEffect(() => {
    const getThemeSetting = () => {
      // Ensure we are in a browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return 'preferred_color_scheme';
      }

      const isDarkMode = document.documentElement.classList.contains('dark-mode') ||
        document.body.classList.contains('dark-mode');
      const isLightMode = document.documentElement.classList.contains('light-mode') ||
        document.body.classList.contains('light-mode');

      let themeBaseUrl = '';
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (isDevelopment) {
        // In development, use relative paths or localhost.
        // Giscus iframe might still have CORS issues loading from localhost if dev server
        // doesn't set 'Access-Control-Allow-Origin'.
        // For robust local dev, we might fall back to Giscus internal themes.
        // However, let's try constructing a localhost URL first.
        // Gatsby dev server usually runs on window.location.origin
        themeBaseUrl = window.location.origin;
      } else {
        // In production, use the siteUrl from gatsby-config.js
        themeBaseUrl = productionSiteUrl;
      }

      // Ensure no double slashes if themeBaseUrl ends with one.
      const normalizedBaseUrl = themeBaseUrl.endsWith('/') ? themeBaseUrl.slice(0, -1) : themeBaseUrl;

      let cssPath = '/css/giscus/light-theme.css'; // Default path
      if (isDarkMode) {
        cssPath = '/css/giscus/dark-theme.css';
      }

      // OPTION 1: Always try custom CSS URL
      return `${normalizedBaseUrl}${cssPath}`;

      // OPTION 2: Use custom CSS in production, Giscus themes in development (safer for CORS)
      if (isDevelopment) {
        // Fallback to Giscus internal themes for development to avoid CORS with localhost
        if (isDarkMode) return 'dark_dimmed';
        if (isLightMode) return 'light';
        return 'preferred_color_scheme';
      } else {
        // Production: use custom theme URLs
        return `${normalizedBaseUrl}${cssPath}`;
      }
    };

    setGiscusThemeSetting(getThemeSetting());

    if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => {
        setGiscusThemeSetting(getThemeSetting());
      });
      if (document.documentElement) observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, [productionSiteUrl]); // Re-run if productionSiteUrl changes (unlikely)

  // --- YOUR CONFIGURED GISCUS VALUES ---
  const giscusRepo = "bdteo/bdteo.com";
  const giscusRepoId = "R_kgDOOpaGqQ";
  const giscusCategory = "Blog Comments";
  const giscusCategoryId = "DIC_kwDOOpaGqc4CqGt8";
  // --- END OF CONFIGURED VALUES ---

  if (!giscusThemeSetting) {
    // Avoid rendering Giscus if theme setting is not yet determined
    // or return a loading state.
    return <div style={{ minHeight: '200px' /* Placeholder height */ }}>Loading comments...</div>;
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
        color: 'var(--color-text)'
      }}>
        Comments
      </h2>
      <Giscus
        id="comments"
        repo={giscusRepo}
        repoId={giscusRepoId}
        category={giscusCategory}
        categoryId={giscusCategoryId}
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={giscusThemeSetting} // Use the determined theme setting
        lang="en"
        loading="lazy"
      />
    </div>
  );
};

export default GiscusComments;
