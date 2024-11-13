/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("workbox-v4.3.1/workbox-sw.js");
workbox.setConfig({modulePathPrefix: "workbox-v4.3.1"});

workbox.core.setCacheNameDetails({prefix: "gatsby-blog-v1"});

workbox.core.skipWaiting();

workbox.core.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "_gatsby/slices/_gatsby-scripts-1.html",
    "revision": "fc748a395fb717b9133cb8e284ad6313"
  },
  {
    "url": "~partytown/debug/partytown-atomics.js"
  },
  {
    "url": "~partytown/debug/partytown-media.js"
  },
  {
    "url": "~partytown/debug/partytown-sandbox-sw.js"
  },
  {
    "url": "~partytown/debug/partytown-sw.js"
  },
  {
    "url": "~partytown/debug/partytown-ww-atomics.js"
  },
  {
    "url": "~partytown/debug/partytown-ww-sw.js"
  },
  {
    "url": "~partytown/debug/partytown.js"
  },
  {
    "url": "~partytown/partytown-atomics.js"
  },
  {
    "url": "~partytown/partytown-media.js"
  },
  {
    "url": "~partytown/partytown-sw.js"
  },
  {
    "url": "~partytown/partytown.js"
  },
  {
    "url": "108-d2f135c5b479dc86f9d7.js"
  },
  {
    "url": "108-d2f135c5b479dc86f9d7.js.LICENSE.txt",
    "revision": "b2a938793c03a627bef3e9442ddf9200"
  },
  {
    "url": "108-d2f135c5b479dc86f9d7.js.map",
    "revision": "7da93e15c21c244bc496ee5aff090a8e"
  },
  {
    "url": "1943edf48358ec375759a10206b57d36c98a5e6d-fe1d0c364742b8ea6b4d.js"
  },
  {
    "url": "1943edf48358ec375759a10206b57d36c98a5e6d-fe1d0c364742b8ea6b4d.js.LICENSE.txt",
    "revision": "f7b599e3f88bf94d2af5d3f60873a311"
  },
  {
    "url": "1943edf48358ec375759a10206b57d36c98a5e6d-fe1d0c364742b8ea6b4d.js.map",
    "revision": "75154d676c45cc6a495dc041fb5245fa"
  },
  {
    "url": "2cca2479-40dc006f007d75b889eb.js"
  },
  {
    "url": "2cca2479-40dc006f007d75b889eb.js.map",
    "revision": "bb7bef123e606194024c93f2ea304122"
  },
  {
    "url": "404.html",
    "revision": "d52c141ac24c8f57cde477cbd973051b"
  },
  {
    "url": "404/index.html",
    "revision": "10f91e554896405de0d123449978fcb3"
  },
  {
    "url": "452-acf513f4b16bcb0a4e07.js"
  },
  {
    "url": "452-acf513f4b16bcb0a4e07.js.map",
    "revision": "f26670345e446b9376a4f466438e9bff"
  },
  {
    "url": "about/index.html",
    "revision": "b820aac356746d2b9fd2b48d5c2836c3"
  },
  {
    "url": "app-7ef6bd2eac106bfc9a1b.js"
  },
  {
    "url": "app-7ef6bd2eac106bfc9a1b.js.LICENSE.txt",
    "revision": "8fb505a0d15bd340a3f1f1c822e27e4a"
  },
  {
    "url": "app-7ef6bd2eac106bfc9a1b.js.map",
    "revision": "148182cb4169c2ba66d43d7ac76b34c6"
  },
  {
    "url": "c16184b3-12f5227575531e302f0f.js"
  },
  {
    "url": "c16184b3-12f5227575531e302f0f.js.map",
    "revision": "968d3f303f57f4f66c9f26921b437fa3"
  },
  {
    "url": "cd7d5f864fc9e15ed8adef086269b0aeff617554-5d96247f5e76a3d0c50c.js"
  },
  {
    "url": "cd7d5f864fc9e15ed8adef086269b0aeff617554-5d96247f5e76a3d0c50c.js.map",
    "revision": "d3db62b985f3fc66541d8070d5c285d4"
  },
  {
    "url": "chunk-map.json",
    "revision": "44b5f1f0985ba8f545096b3387ecea5e"
  },
  {
    "url": "component---cache-caches-gatsby-plugin-offline-app-shell-js-2059730493c4287dab27.js"
  },
  {
    "url": "component---cache-caches-gatsby-plugin-offline-app-shell-js-2059730493c4287dab27.js.map",
    "revision": "dbdee58dc14ca9afd1e085c9ad16c3df"
  },
  {
    "url": "component---src-pages-404-js-90d20c52b1ddefff1aa7.js"
  },
  {
    "url": "component---src-pages-404-js-90d20c52b1ddefff1aa7.js.map",
    "revision": "375bfad33210add7e85fe8a9a146a515"
  },
  {
    "url": "component---src-pages-index-js-656c9fefebc74f7876df.js"
  },
  {
    "url": "component---src-pages-index-js-656c9fefebc74f7876df.js.map",
    "revision": "af769875ca438341cba0bc1125bd6fef"
  },
  {
    "url": "component---src-pages-using-typescript-tsx-99e253d7264793a2c4dd.js"
  },
  {
    "url": "component---src-pages-using-typescript-tsx-99e253d7264793a2c4dd.js.map",
    "revision": "d98738c2c92f5f42816053c51be32c4a"
  },
  {
    "url": "component---src-templates-blog-post-js-18e500b9a7d9b75eda86.js"
  },
  {
    "url": "component---src-templates-blog-post-js-18e500b9a7d9b75eda86.js.map",
    "revision": "a656ef6c62cc449df9874318a579ad78"
  },
  {
    "url": "discrete-representations-reinforcement-learning-insights/index.html",
    "revision": "3ebb8aaad9b44e9f4863982f03b037b9"
  },
  {
    "url": "favicon-32x32.png",
    "revision": "63adac80d486dd237ea4305d89a67bac"
  },
  {
    "url": "favicon.ico",
    "revision": "c6acedaff906029fc5455d9ec52c7f42"
  },
  {
    "url": "framework-5585feef2812a02482ac.js"
  },
  {
    "url": "framework-5585feef2812a02482ac.js.LICENSE.txt",
    "revision": "60f6bf9e100e456690e9ab6c9a37bfc2"
  },
  {
    "url": "framework-5585feef2812a02482ac.js.map",
    "revision": "2436f0f06644838e567fe00ccba8f33b"
  },
  {
    "url": "google-ai-ambitions-historical-analysis-promises-stock-market-impact/index.html",
    "revision": "79aa874d02dde8834966d3e7f6aa45a6"
  },
  {
    "url": "icons/icon-144x144.png",
    "revision": "045b6e58a22a45dfad053073ec4f289d"
  },
  {
    "url": "icons/icon-192x192.png",
    "revision": "d78b7baf47214f21352991cf0f4997a5"
  },
  {
    "url": "icons/icon-256x256.png",
    "revision": "eeabc90f662eb070973a98fe8c8b286e"
  },
  {
    "url": "icons/icon-384x384.png",
    "revision": "6efd942cc1cb025be59d164ebb150aee"
  },
  {
    "url": "icons/icon-48x48.png",
    "revision": "fa50b1c131b24887f14f913b1791f335"
  },
  {
    "url": "icons/icon-512x512.png",
    "revision": "84f85594b9b322ffda8c8a9abdbaee06"
  },
  {
    "url": "icons/icon-72x72.png",
    "revision": "9e3b11f2d57efd5f5eb8df007a05640c"
  },
  {
    "url": "icons/icon-96x96.png",
    "revision": "9a3fb8138b7a3537b24d51de3703c67b"
  },
  {
    "url": "idb-keyval-3.2.0-iife.min.js"
  },
  {
    "url": "images/logo.png",
    "revision": "78794fa8039a0f12bcdebaa9c30fe559"
  },
  {
    "url": "index.html",
    "revision": "0ed138bf1fb794b1bc30d32d79f4a4c1"
  },
  {
    "url": "installing-php-8-3-6-with-imap-on-macos-using-phpenv/index.html",
    "revision": "df72cc71cfb13e1250e6178724d4e7a6"
  },
  {
    "url": "laravel-sail-vs-laradock-choosing-right-docker-solution/index.html",
    "revision": "78de281bded1d565112bfd92a5a3e516"
  },
  {
    "url": "manifest.webmanifest",
    "revision": "217898b89af0c46bfba80747bc28200c"
  },
  {
    "url": "offline-plugin-app-shell-fallback/index.html",
    "revision": "e90a4688b002e4a5213bfea2f9a2f5c5"
  },
  {
    "url": "page-data/404.html/page-data.json",
    "revision": "34222a5fe0aadce36e7a542b19f7f905"
  },
  {
    "url": "page-data/404/page-data.json",
    "revision": "62cccc5dd05e1630ef416db81de497fd"
  },
  {
    "url": "page-data/about/page-data.json",
    "revision": "47a11c53f150107f381080bcb46a3c57"
  },
  {
    "url": "page-data/app-data.json",
    "revision": "1b87cab7ec7fe426aa8a10cc5c29e2ea"
  },
  {
    "url": "page-data/discrete-representations-reinforcement-learning-insights/page-data.json",
    "revision": "a018c9081f5c94ecc478b17ead18e4e2"
  },
  {
    "url": "page-data/google-ai-ambitions-historical-analysis-promises-stock-market-impact/page-data.json",
    "revision": "b53696faf9009deb0f40012908654e86"
  },
  {
    "url": "page-data/index/page-data.json",
    "revision": "e874cd5ecfa1e4ec8a9b4e0b84c27177"
  },
  {
    "url": "page-data/installing-php-8-3-6-with-imap-on-macos-using-phpenv/page-data.json",
    "revision": "3418bc7c4401edde65be9675ea6bf00d"
  },
  {
    "url": "page-data/laravel-sail-vs-laradock-choosing-right-docker-solution/page-data.json",
    "revision": "4882674627b69991254e34b6764bc1aa"
  },
  {
    "url": "page-data/offline-plugin-app-shell-fallback/page-data.json",
    "revision": "d22fedc5f9585423cf2e45d46cac048f"
  },
  {
    "url": "page-data/pushing-the-stable-diffussion-limits/page-data.json",
    "revision": "ec4ea259ae8199e843e6e1260dac7989"
  },
  {
    "url": "page-data/shadow-weaver-redemption-journey/page-data.json",
    "revision": "fd8d0f1a07cec4577c23e856b98cf506"
  },
  {
    "url": "page-data/sq/d/2841359383.json",
    "revision": "0eed29d34e0df40e5c1e84697018af10"
  },
  {
    "url": "page-data/sq/d/2923011943.json",
    "revision": "901eb800ab5d7123f3a8277d846bf103"
  },
  {
    "url": "page-data/stable-difussion-cheat-sheet/page-data.json",
    "revision": "a2f740cb204d178c9d7a8394760ece4c"
  },
  {
    "url": "page-data/the-sorceress-and-the-forgotten-stardust/page-data.json",
    "revision": "b2af4496542e848ffed1904786796b3a"
  },
  {
    "url": "page-data/unlocking-the-power-of-git-grep/page-data.json",
    "revision": "0daad5c0fc73c5109706d3b7d2722cab"
  },
  {
    "url": "page-data/using-typescript/page-data.json",
    "revision": "91709af2313bf2485f4a34bc52ce030a"
  },
  {
    "url": "page-data/worst-hypocrite-rubber-duck-tale/page-data.json",
    "revision": "a799f33ac41c47d0f05ff8020d6d089b"
  },
  {
    "url": "pushing-the-stable-diffussion-limits/index.html",
    "revision": "1fedc372b0c000ba9cf1f1097f228594"
  },
  {
    "url": "robots.txt",
    "revision": "b6216d61c03e6ce0c9aea6ca7808f7ca"
  },
  {
    "url": "rss.xml",
    "revision": "28a754cf26ac55e8046d9dc9b735f8ad"
  },
  {
    "url": "shadow-weaver-redemption-journey/index.html",
    "revision": "b1d6aac3eca7ec418450b64b667a2d87"
  },
  {
    "url": "stable-difussion-cheat-sheet/index.html",
    "revision": "0741b6b7e4ac42a8a8bf1ae8bcd95b97"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/0f5ce/featured.jpg"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/16717/featured.webp"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/16947/featured.jpg"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/220a4/featured.jpg"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/2fa07/featured.webp"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/36f66/featured.jpg"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/460bb/featured.jpg"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/4f03f/featured.webp"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/4f506/featured.webp"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/6e2bb/featured.jpg"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/8dc98/featured.jpg"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/9285b/featured.webp"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/b74b1/featured.jpg"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/b979a/featured.webp"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/f0a0a/featured.webp"
  },
  {
    "url": "static/268bdf61f13fa4bae18593537451433a/f9756/featured.webp"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/01986/profile-pic.png"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/288e4/profile-pic.avif"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/7ddcc/profile-pic.webp"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/95309/profile-pic.avif"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/c0d5f/profile-pic.png"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/dd79f/profile-pic.webp"
  },
  {
    "url": "static/4183fe972bb1bad6032e194ae694d4d3/16947/featured.jpg"
  },
  {
    "url": "static/4183fe972bb1bad6032e194ae694d4d3/2fa07/featured.webp"
  },
  {
    "url": "static/4183fe972bb1bad6032e194ae694d4d3/4371c/featured.webp"
  },
  {
    "url": "static/4183fe972bb1bad6032e194ae694d4d3/460bb/featured.jpg"
  },
  {
    "url": "static/4183fe972bb1bad6032e194ae694d4d3/59596/featured.webp"
  },
  {
    "url": "static/4183fe972bb1bad6032e194ae694d4d3/5c90f/featured.jpg"
  },
  {
    "url": "static/4183fe972bb1bad6032e194ae694d4d3/84519/featured.jpg"
  },
  {
    "url": "static/4183fe972bb1bad6032e194ae694d4d3/8dc98/featured.jpg"
  },
  {
    "url": "static/4183fe972bb1bad6032e194ae694d4d3/9285b/featured.webp"
  },
  {
    "url": "static/4183fe972bb1bad6032e194ae694d4d3/b979a/featured.webp"
  },
  {
    "url": "static/53ac37ca2846e08b8da30a4b3cb4b8f1/2fa07/featured.webp"
  },
  {
    "url": "static/53ac37ca2846e08b8da30a4b3cb4b8f1/4f03f/featured.webp"
  },
  {
    "url": "static/53ac37ca2846e08b8da30a4b3cb4b8f1/59866/featured.png"
  },
  {
    "url": "static/53ac37ca2846e08b8da30a4b3cb4b8f1/62ea7/featured.png"
  },
  {
    "url": "static/53ac37ca2846e08b8da30a4b3cb4b8f1/67ded/featured.webp"
  },
  {
    "url": "static/53ac37ca2846e08b8da30a4b3cb4b8f1/9285b/featured.webp"
  },
  {
    "url": "static/53ac37ca2846e08b8da30a4b3cb4b8f1/b5658/featured.png"
  },
  {
    "url": "static/53ac37ca2846e08b8da30a4b3cb4b8f1/b979a/featured.webp"
  },
  {
    "url": "static/53ac37ca2846e08b8da30a4b3cb4b8f1/e20c6/featured.png"
  },
  {
    "url": "static/53ac37ca2846e08b8da30a4b3cb4b8f1/f054e/featured.png"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/2fa07/featured.webp"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/4c8c9/featured.webp"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/55813/featured.webp"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/596c0/featured.png"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/59866/featured.png"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/62ea7/featured.png"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/77779/featured.png"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/9285b/featured.webp"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/a6312/featured.png"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/a9997/featured.png"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/b979a/featured.webp"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/e20c6/featured.png"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/f9756/featured.webp"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/faa1e/featured.png"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/faf10/featured.webp"
  },
  {
    "url": "static/68fb593061ca71f29ec75358c0765893/fb23b/featured.webp"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/2fa07/featured.webp"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/40e61/featured.png"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/4f03f/featured.webp"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/4f506/featured.webp"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/52a60/featured.webp"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/59866/featured.png"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/62ea7/featured.png"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/9285b/featured.webp"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/a6312/featured.png"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/ae1c8/featured.png"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/b979a/featured.webp"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/d41bd/featured.png"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/e20c6/featured.png"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/f054e/featured.png"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/f0a0a/featured.webp"
  },
  {
    "url": "static/6a9e1dd6da692390b4bc0975056e06a0/f9756/featured.webp"
  },
  {
    "url": "static/74c512a4ea459157d8319ebeced56698/40601/tech_companies_ai_milestones.png"
  },
  {
    "url": "static/74c512a4ea459157d8319ebeced56698/6bdcf/tech_companies_ai_milestones.png"
  },
  {
    "url": "static/74c512a4ea459157d8319ebeced56698/78612/tech_companies_ai_milestones.png"
  },
  {
    "url": "static/74c512a4ea459157d8319ebeced56698/c26ae/tech_companies_ai_milestones.png"
  },
  {
    "url": "static/74c512a4ea459157d8319ebeced56698/f058b/tech_companies_ai_milestones.png"
  },
  {
    "url": "static/74c512a4ea459157d8319ebeced56698/f154a/tech_companies_ai_milestones.png"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/16947/featured.jpg"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/1e1dd/featured.webp"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/2fa07/featured.webp"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/36f66/featured.jpg"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/460bb/featured.jpg"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/53901/featured.webp"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/611c2/featured.webp"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/72db9/featured.jpg"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/768e5/featured.jpg"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/8dc98/featured.jpg"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/9285b/featured.webp"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/9ba5d/featured.jpg"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/a1264/featured.jpg"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/b979a/featured.webp"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/c23ad/featured.webp"
  },
  {
    "url": "static/8a20181260d78bc5afa16ab9c3cd36b2/f9756/featured.webp"
  },
  {
    "url": "static/ab6f0e497ea3ee100966d0f875eab63b/40601/google_stock_milestones.png"
  },
  {
    "url": "static/ab6f0e497ea3ee100966d0f875eab63b/56fb7/google_stock_milestones.png"
  },
  {
    "url": "static/ab6f0e497ea3ee100966d0f875eab63b/6bdcf/google_stock_milestones.png"
  },
  {
    "url": "static/ab6f0e497ea3ee100966d0f875eab63b/78612/google_stock_milestones.png"
  },
  {
    "url": "static/ab6f0e497ea3ee100966d0f875eab63b/c26ae/google_stock_milestones.png"
  },
  {
    "url": "static/ab6f0e497ea3ee100966d0f875eab63b/f058b/google_stock_milestones.png"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/2fa07/featured.webp"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/40e61/featured.png"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/4f03f/featured.webp"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/4f506/featured.webp"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/52a60/featured.webp"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/59866/featured.png"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/62ea7/featured.png"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/9285b/featured.webp"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/a6312/featured.png"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/ae1c8/featured.png"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/b979a/featured.webp"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/d41bd/featured.png"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/e20c6/featured.png"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/f054e/featured.png"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/f0a0a/featured.webp"
  },
  {
    "url": "static/b64408ad1c6d3aa6fe4f9ab50516674d/f9756/featured.webp"
  },
  {
    "url": "static/bd-icon@4x-f90cf1ce14d7a43ad732b9265abfdca5.png"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/2fa07/featured.webp"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/4c8c9/featured.webp"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/55813/featured.webp"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/596c0/featured.png"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/59866/featured.png"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/62ea7/featured.png"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/77779/featured.png"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/9285b/featured.webp"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/a6312/featured.png"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/a9997/featured.png"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/b979a/featured.webp"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/e20c6/featured.png"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/f9756/featured.webp"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/faa1e/featured.png"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/faf10/featured.webp"
  },
  {
    "url": "static/d1bab798fb7938d05ae9ec21ceadbb52/fb23b/featured.webp"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/2fa07/featured.webp"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/40e61/featured.png"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/4f03f/featured.webp"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/4f506/featured.webp"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/52a60/featured.webp"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/59866/featured.png"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/62ea7/featured.png"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/9285b/featured.webp"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/a6312/featured.png"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/ae1c8/featured.png"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/b979a/featured.webp"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/d41bd/featured.png"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/e20c6/featured.png"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/f054e/featured.png"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/f0a0a/featured.webp"
  },
  {
    "url": "static/e583ef503a1c6d64d355a983a224d218/f9756/featured.webp"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/2fa07/featured.webp"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/40e61/featured.png"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/4f03f/featured.webp"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/4f506/featured.webp"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/52a60/featured.webp"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/59866/featured.png"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/62ea7/featured.png"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/9285b/featured.webp"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/a6312/featured.png"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/ae1c8/featured.png"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/b979a/featured.webp"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/d41bd/featured.png"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/e20c6/featured.png"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/f054e/featured.png"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/f0a0a/featured.webp"
  },
  {
    "url": "static/ed48856a67e42120138d726a0cb9d79a/f9756/featured.webp"
  },
  {
    "url": "static/merriweather-cyrillic-400-normal-2e7c71643f6e0e4c1e73f28a7a1798e6.woff"
  },
  {
    "url": "static/merriweather-cyrillic-400-normal-fde0b55efc50742fb57fbebbb11c572f.woff2"
  },
  {
    "url": "static/merriweather-cyrillic-ext-400-normal-2a880e22b1b888ab54652a36d43b7f16.woff2"
  },
  {
    "url": "static/merriweather-cyrillic-ext-400-normal-7d8546944154663cc54693d15bb31721.woff"
  },
  {
    "url": "static/merriweather-latin-400-normal-2c455928024d0ee049d896a25f9e30e1.woff"
  },
  {
    "url": "static/merriweather-latin-400-normal-e009f21405b4d7e893674b69deb4cf4a.woff2"
  },
  {
    "url": "static/merriweather-latin-ext-400-normal-4657f5ab02d5923d223f96a9155a9bdc.woff2"
  },
  {
    "url": "static/merriweather-latin-ext-400-normal-7b1ee735b2541bc831bd57bacecc9d41.woff"
  },
  {
    "url": "static/montserrat-cyrillic-ext-wght-normal-e84e812b71d18e04e6928fb272665c53.woff2"
  },
  {
    "url": "static/montserrat-cyrillic-wght-normal-eb1783eb42487132539645641f761eb2.woff2"
  },
  {
    "url": "static/montserrat-latin-ext-wght-normal-82d636d9375dd92118fd22c818a99c24.woff2"
  },
  {
    "url": "static/montserrat-latin-wght-normal-5028c63f6a70ab0cf7cba9015ae04154.woff2"
  },
  {
    "url": "styles.7a0062ca9706aa730ccb.css"
  },
  {
    "url": "the-sorceress-and-the-forgotten-stardust/index.html",
    "revision": "0c9eb979478e68e838b5d67f65eb0c8a"
  },
  {
    "url": "unlocking-the-power-of-git-grep/index.html",
    "revision": "515d0aa2ee65b6b600fa0d6624e58166"
  },
  {
    "url": "using-typescript/index.html",
    "revision": "75600c1a96d2a9a77d9115f4f3c8c805"
  },
  {
    "url": "webpack-runtime-12bc4d4ad68540844d33.js"
  },
  {
    "url": "webpack-runtime-12bc4d4ad68540844d33.js.map",
    "revision": "ed33339553ac13ec489c397dfba628e3"
  },
  {
    "url": "webpack.stats.json",
    "revision": "48ed7b67f0f0e433382383894d09438f"
  },
  {
    "url": "worst-hypocrite-rubber-duck-tale/index.html",
    "revision": "d1b5ac393decf6aa303ee5d242a2581b"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/(\.js$|\.css$|static\/)/, new workbox.strategies.CacheFirst(), 'GET');
workbox.routing.registerRoute(/^https?:.*\/page-data\/.*\.json/, new workbox.strategies.StaleWhileRevalidate(), 'GET');
workbox.routing.registerRoute(/^https?:.*\.(png|jpg|jpeg|webp|avif|svg|gif|tiff|js|woff|woff2|json|css)$/, new workbox.strategies.StaleWhileRevalidate(), 'GET');
workbox.routing.registerRoute(/^https?:\/\/fonts\.googleapis\.com\/css/, new workbox.strategies.StaleWhileRevalidate(), 'GET');

/* global importScripts, workbox, idbKeyval */
importScripts(`idb-keyval-3.2.0-iife.min.js`)

const { NavigationRoute } = workbox.routing

let lastNavigationRequest = null
let offlineShellEnabled = true

// prefer standard object syntax to support more browsers
const MessageAPI = {
  setPathResources: (event, { path, resources }) => {
    event.waitUntil(idbKeyval.set(`resources:${path}`, resources))
  },

  clearPathResources: event => {
    event.waitUntil(idbKeyval.clear())

    // We detected compilation hash mismatch
    // we should clear runtime cache as data
    // files might be out of sync and we should
    // do fresh fetches for them
    event.waitUntil(
      caches.keys().then(function (keyList) {
        return Promise.all(
          keyList.map(function (key) {
            if (key && key.includes(`runtime`)) {
              return caches.delete(key)
            }

            return Promise.resolve()
          })
        )
      })
    )
  },

  enableOfflineShell: () => {
    offlineShellEnabled = true
  },

  disableOfflineShell: () => {
    offlineShellEnabled = false
  },
}

self.addEventListener(`message`, event => {
  const { gatsbyApi: api } = event.data
  if (api) MessageAPI[api](event, event.data)
})

function handleAPIRequest({ event }) {
  const { pathname } = new URL(event.request.url)

  const params = pathname.match(/:(.+)/)[1]
  const data = {}

  if (params.includes(`=`)) {
    params.split(`&`).forEach(param => {
      const [key, val] = param.split(`=`)
      data[key] = val
    })
  } else {
    data.api = params
  }

  if (MessageAPI[data.api] !== undefined) {
    MessageAPI[data.api]()
  }

  if (!data.redirect) {
    return new Response()
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: lastNavigationRequest,
    },
  })
}

const navigationRoute = new NavigationRoute(async ({ event }) => {
  // handle API requests separately to normal navigation requests, so do this
  // check first
  if (event.request.url.match(/\/.gatsby-plugin-offline:.+/)) {
    return handleAPIRequest({ event })
  }

  if (!offlineShellEnabled) {
    return await fetch(event.request)
  }

  lastNavigationRequest = event.request.url

  let { pathname } = new URL(event.request.url)
  pathname = pathname.replace(new RegExp(`^https://bdteo.github.io`), ``)

  // Check for resources + the app bundle
  // The latter may not exist if the SW is updating to a new version
  const resources = await idbKeyval.get(`resources:${pathname}`)
  if (!resources || !(await caches.match(`https://bdteo.github.io/app-7ef6bd2eac106bfc9a1b.js`))) {
    return await fetch(event.request)
  }

  for (const resource of resources) {
    // As soon as we detect a failed resource, fetch the entire page from
    // network - that way we won't risk being in an inconsistent state with
    // some parts of the page failing.
    if (!(await caches.match(resource))) {
      return await fetch(event.request)
    }
  }

  const offlineShell = `https://bdteo.github.io/offline-plugin-app-shell-fallback/index.html`
  const offlineShellWithKey = workbox.precaching.getCacheKeyForURL(offlineShell)
  return await caches.match(offlineShellWithKey)
})

workbox.routing.registerRoute(navigationRoute)

// this route is used when performing a non-navigation request (e.g. fetch)
workbox.routing.registerRoute(/\/.gatsby-plugin-offline:.+/, handleAPIRequest)
