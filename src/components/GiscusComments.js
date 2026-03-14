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

      // Always use production URL for custom CSS — the Giscus iframe (on giscus.app)
      // can't load localhost CSS due to CORS, but can load from the live domain.
      const baseUrl = productionSiteUrl.replace(/\/$/, '');
      const cssPath = isDarkMode ? '/css/giscus/dark-theme.css' : '/css/giscus/light-theme.css';
      return `${baseUrl}${cssPath}`;
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
  }, [productionSiteUrl]);

  // --- CONFIGURED GISCUS VALUES ---
  const giscusRepo = "bdteo/bdteo.com";
  const giscusRepoId = "R_kgDOOpaGqQ";
  const giscusCategory = "Blog Comments";
  const giscusCategoryId = "DIC_kwDOOpaGqc4CqGt8";

  if (!giscusThemeSetting) {
    return <div style={{ minHeight: '200px' }}>Loading comments...</div>;
  }

  return (
    <div className="comments-container" style={{
      paddingTop: 'var(--spacing-2)',
      borderTop: '1px solid var(--color-border)'
    }}>
      <h2 style={{
        marginTop: 'var(--spacing-8)',
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
        theme={giscusThemeSetting}
        lang="en"
        loading="lazy"
      />
    </div>
  );
};

export default GiscusComments;
