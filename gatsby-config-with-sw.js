// Alternative configuration if you want to keep the service worker
// Replace the gatsby-plugin-offline section with this:

{
  resolve: `gatsby-plugin-offline`,
  options: {
    workboxConfig: {
      // Only cache essential files, not everything
      globPatterns: [
        '**/*.{js,css,html,png,jpg,jpeg,gif,svg,woff,woff2,eot,ttf}',
      ],
      // Exclude blog posts and dynamic content from precaching
      globIgnores: [
        '**/page-data/**/*',
        '**/static/**/*',
      ],
      // Use network-first strategy for HTML files
      runtimeCaching: [
        {
          urlPattern: /^https?:.*\/page-data\/.*\.json$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'page-data',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 1 day
            },
          },
        },
        {
          urlPattern: /\.(?:html)$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'html-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24, // 1 day
            },
          },
        },
      ],
      cacheId: `gatsby-blog-${Date.now()}`, // Force cache invalidation on each build
      skipWaiting: true,
      clientsClaim: true,
    },
  },
},