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
    "revision": "a7411eb03c2539124f989ce62205b321"
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
    "url": "108-122352206d4634a5bce7.js"
  },
  {
    "url": "108-122352206d4634a5bce7.js.LICENSE.txt",
    "revision": "b2a938793c03a627bef3e9442ddf9200"
  },
  {
    "url": "108-122352206d4634a5bce7.js.map",
    "revision": "8d88bf4033c585ad8240de2d52541bd6"
  },
  {
    "url": "2cca2479-9e48fa65067cbe590036.js"
  },
  {
    "url": "2cca2479-9e48fa65067cbe590036.js.LICENSE.txt",
    "revision": "a3b5c6613e3595a1b5e50b4a4c176119"
  },
  {
    "url": "2cca2479-9e48fa65067cbe590036.js.map",
    "revision": "7048a4b1a1a8ee04de638914fb8fc248"
  },
  {
    "url": "404.html",
    "revision": "98e26be8ba348a43ee2aabcc8635d50e"
  },
  {
    "url": "404/index.html",
    "revision": "73911cb5ee5041545fbb6af6f815df19"
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
    "revision": "1c0f20d57a3f4ab646b0ede46a7ffcd3"
  },
  {
    "url": "app-64c195ea601e8783c9a1.js"
  },
  {
    "url": "app-64c195ea601e8783c9a1.js.LICENSE.txt",
    "revision": "217285521ecff3d6462c9f8ca0625666"
  },
  {
    "url": "app-64c195ea601e8783c9a1.js.map",
    "revision": "eaf411304c6d292884c2682aefe0e0cb"
  },
  {
    "url": "bluez-pairing-python-agent-workaround-authentication-failed/index.html",
    "revision": "ce2e6168a71e0f08a7e520e9a76095d3"
  },
  {
    "url": "c16184b3-b645e587e93f02336fdc.js"
  },
  {
    "url": "c16184b3-b645e587e93f02336fdc.js.LICENSE.txt",
    "revision": "a3b5c6613e3595a1b5e50b4a4c176119"
  },
  {
    "url": "c16184b3-b645e587e93f02336fdc.js.map",
    "revision": "a00d3672f6d41d69e2401a3c6f32479c"
  },
  {
    "url": "cd7d5f864fc9e15ed8adef086269b0aeff617554-18c5d48620e7e19d9878.js"
  },
  {
    "url": "cd7d5f864fc9e15ed8adef086269b0aeff617554-18c5d48620e7e19d9878.js.map",
    "revision": "5e87eaa1c86f15a856fe809c952dce79"
  },
  {
    "url": "chunk-map.json",
    "revision": "680cf212e3578f794f00df12232b2500"
  },
  {
    "url": "claude-code-transformed-my-blog-design-in-minutes/index.html",
    "revision": "d807880a94bfdb60fe25166d069a43f8"
  },
  {
    "url": "component---cache-caches-gatsby-plugin-offline-app-shell-js-2059730493c4287dab27.js"
  },
  {
    "url": "component---cache-caches-gatsby-plugin-offline-app-shell-js-2059730493c4287dab27.js.map",
    "revision": "dbdee58dc14ca9afd1e085c9ad16c3df"
  },
  {
    "url": "component---src-pages-404-js-e5658834fd18b7481c8c.js"
  },
  {
    "url": "component---src-pages-404-js-e5658834fd18b7481c8c.js.map",
    "revision": "98485448f921971958d6900fb6e9c891"
  },
  {
    "url": "component---src-pages-index-js-e472d4a28d855db7e924.js"
  },
  {
    "url": "component---src-pages-index-js-e472d4a28d855db7e924.js.map",
    "revision": "0f7f47fd00ea2b6dc0299bc6b529dc01"
  },
  {
    "url": "component---src-pages-using-typescript-tsx-ea631f2eb1874f3638a7.js"
  },
  {
    "url": "component---src-pages-using-typescript-tsx-ea631f2eb1874f3638a7.js.map",
    "revision": "d4bd99709a24b26c97447fc763c76446"
  },
  {
    "url": "component---src-templates-blog-post-js-e3d718079108cfd26cad.js"
  },
  {
    "url": "component---src-templates-blog-post-js-e3d718079108cfd26cad.js.map",
    "revision": "e0599fdcf342729a0fb52678e408172f"
  },
  {
    "url": "discrete-representations-reinforcement-learning-insights/index.html",
    "revision": "e1d5278cdf595a7600fd6fbfc4c744ed"
  },
  {
    "url": "docker-compose-major-changes-since-october-2023/index.html",
    "revision": "d606a31f3ff8fbd8a9f64e6c65073039"
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
    "revision": "d6a92fbaca57ccd982b43bf2b1cf6559"
  },
  {
    "url": "huawei-watch-d2-proprietary-protocol-vendor-lockin/index.html",
    "revision": "8daa086158891ef4889ddfabb13fbb50"
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
    "revision": "6b24307ba60d2b01610459681fd9435d"
  },
  {
    "url": "installing-php-8-3-6-with-imap-on-macos-using-phpenv/index.html",
    "revision": "167a790c1f3d00b1ff3b366f3617d420"
  },
  {
    "url": "laravel-sail-vs-laradock-choosing-right-docker-solution/index.html",
    "revision": "e931eba84611672563906fff1c7e4c3a"
  },
  {
    "url": "manifest.webmanifest",
    "revision": "217898b89af0c46bfba80747bc28200c"
  },
  {
    "url": "offline-plugin-app-shell-fallback/index.html",
    "revision": "9d4b0b46d28b531886639d7c58ff7235"
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
    "revision": "9333035965f1c9aa6a39d3237b422673"
  },
  {
    "url": "page-data/bluez-pairing-python-agent-workaround-authentication-failed/page-data.json",
    "revision": "18d8ebd8b990bdc721edbe0e9a4a86d8"
  },
  {
    "url": "page-data/claude-code-transformed-my-blog-design-in-minutes/page-data.json",
    "revision": "30ef7248d67d637c809f6aa9da345eb6"
  },
  {
    "url": "page-data/discrete-representations-reinforcement-learning-insights/page-data.json",
    "revision": "a018c9081f5c94ecc478b17ead18e4e2"
  },
  {
    "url": "page-data/docker-compose-major-changes-since-october-2023/page-data.json",
    "revision": "632e7f4a16fef6ef0e4f5a083faebf41"
  },
  {
    "url": "page-data/google-ai-ambitions-historical-analysis-promises-stock-market-impact/page-data.json",
    "revision": "b53696faf9009deb0f40012908654e86"
  },
  {
    "url": "page-data/huawei-watch-d2-proprietary-protocol-vendor-lockin/page-data.json",
    "revision": "8872e178cd59d6495089b0d175f8a036"
  },
  {
    "url": "page-data/index/page-data.json",
    "revision": "a7c38e6e629b64d1ce5ab22e4690449d"
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
    "url": "page-data/understanding-class-namespace-changes-shopware-6-5-developers-guide/page-data.json",
    "revision": "b077eaf81d895ca1f8921faf62c33803"
  },
  {
    "url": "page-data/unlocking-the-power-of-git-grep/page-data.json",
    "revision": "8e77179a2c81ade44c759e97d8dc1015"
  },
  {
    "url": "page-data/using-typescript/page-data.json",
    "revision": "6ced5eb08d3710405ab6cb0306a2e0c0"
  },
  {
    "url": "page-data/worst-hypocrite-rubber-duck-tale/page-data.json",
    "revision": "61ae26ee4aaa979259d20e89fbea1b91"
  },
  {
    "url": "pushing-the-stable-diffussion-limits/index.html",
    "revision": "3abaf2ebcd73ba7cada402740f4d3c64"
  },
  {
    "url": "robots.txt",
    "revision": "b6216d61c03e6ce0c9aea6ca7808f7ca"
  },
  {
    "url": "rss.xml",
    "revision": "eaf015700fbc3217b8504dddbfafdee1"
  },
  {
    "url": "shadow-weaver-redemption-journey/index.html",
    "revision": "03a7851b47f3242afc3d0fa48a2a288f"
  },
  {
    "url": "stable-difussion-cheat-sheet/index.html",
    "revision": "7ff2ca77a0259af39f85aaa227cffe88"
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
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/0a429/profile-pic.webp"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/1096c/profile-pic.png"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/7ddcc/profile-pic.webp"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/a18cc/profile-pic.webp"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/c0d5f/profile-pic.png"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/c16ee/profile-pic.png"
  },
  {
    "url": "static/2fb36df54ab973fa2cb65e0e16381c11/dd79f/profile-pic.webp"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/1574e/featured.webp"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/16947/featured.jpg"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/2fa07/featured.webp"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/36f66/featured.jpg"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/460bb/featured.jpg"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/53961/featured.webp"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/55d8f/featured.webp"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/59596/featured.webp"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/84519/featured.jpg"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/8dc98/featured.jpg"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/9285b/featured.webp"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/a9630/featured.jpg"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/aa504/featured.jpg"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/b979a/featured.webp"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/ca6b2/featured.jpg"
  },
  {
    "url": "static/37cd6485e3c91973140c6bd0485036dc/f9756/featured.webp"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/09f70/featured.jpg"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/16947/featured.jpg"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/2de93/featured.webp"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/2fa07/featured.webp"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/354f9/featured.jpg"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/36f66/featured.jpg"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/45939/featured.webp"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/460bb/featured.jpg"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/59596/featured.webp"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/84519/featured.jpg"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/8dc98/featured.jpg"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/9285b/featured.webp"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/ace28/featured.jpg"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/b979a/featured.webp"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/c8710/featured.webp"
  },
  {
    "url": "static/3d7b20a023738c7080543f0f9a0334fe/f9756/featured.webp"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/16947/featured.jpg"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/29ba9/featured.jpg"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/2fa07/featured.webp"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/36f66/featured.jpg"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/460bb/featured.jpg"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/4a276/featured.webp"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/57584/featured.webp"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/7284f/featured.jpg"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/7db9c/featured.webp"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/83638/featured.jpg"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/8dc98/featured.jpg"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/9285b/featured.webp"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/984df/featured.webp"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/b979a/featured.webp"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/c8896/featured.jpg"
  },
  {
    "url": "static/56a37a7145ca6dc6c4bdab99200fced4/f9756/featured.webp"
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
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/16947/featured.jpg"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/29ba9/featured.jpg"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/2fa07/featured.webp"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/36f66/featured.jpg"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/460bb/featured.jpg"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/4a276/featured.webp"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/57584/featured.webp"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/7284f/featured.jpg"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/7db9c/featured.webp"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/83638/featured.jpg"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/8dc98/featured.jpg"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/9285b/featured.webp"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/984df/featured.webp"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/b979a/featured.webp"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/c8896/featured.jpg"
  },
  {
    "url": "static/a273d3d9bb3291a37734d59b57d590c2/f9756/featured.webp"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/16947/featured.jpg"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/29ba9/featured.jpg"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/2fa07/featured.webp"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/36f66/featured.jpg"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/460bb/featured.jpg"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/4a276/featured.webp"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/57584/featured.webp"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/7284f/featured.jpg"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/7db9c/featured.webp"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/83638/featured.jpg"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/8dc98/featured.jpg"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/9285b/featured.webp"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/984df/featured.webp"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/b979a/featured.webp"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/c8896/featured.jpg"
  },
  {
    "url": "static/a8ccc4ccaff8c3c18cd064980ca93442/f9756/featured.webp"
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
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/09f70/featured.jpg"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/0e818/featured.webp"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/16947/featured.jpg"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/2de93/featured.webp"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/2fa07/featured.webp"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/36f66/featured.jpg"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/37d92/featured.jpg"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/45939/featured.webp"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/460bb/featured.jpg"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/59596/featured.webp"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/84519/featured.jpg"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/8dc98/featured.jpg"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/9285b/featured.webp"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/ace28/featured.jpg"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/b979a/featured.webp"
  },
  {
    "url": "static/b221e1e70a22bbcdc8f3cb3dc8461360/f9756/featured.webp"
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
    "url": "static/bc3877daf612bce2d881507119f045a5/0f5ce/featured.jpg"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/16947/featured.jpg"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/26222/featured.webp"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/2fa07/featured.webp"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/36f66/featured.jpg"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/460bb/featured.jpg"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/4f03f/featured.webp"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/4f506/featured.webp"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/6e2bb/featured.jpg"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/869a6/featured.jpg"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/8dc98/featured.jpg"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/9285b/featured.webp"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/b74b1/featured.jpg"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/b979a/featured.webp"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/f0a0a/featured.webp"
  },
  {
    "url": "static/bc3877daf612bce2d881507119f045a5/f9756/featured.webp"
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
    "url": "styles.0ee147cc2b1ed3dc707c.css"
  },
  {
    "url": "the-sorceress-and-the-forgotten-stardust/index.html",
    "revision": "884ac24461cd7194cb7e6be168ecb369"
  },
  {
    "url": "understanding-class-namespace-changes-shopware-6-5-developers-guide/index.html",
    "revision": "4a107f071adfd246049fe6a1b9bc4d98"
  },
  {
    "url": "unlocking-the-power-of-git-grep/index.html",
    "revision": "2082da7859484c1e072fa1566251a2af"
  },
  {
    "url": "using-typescript/index.html",
    "revision": "de332b653d58d380b68c300a0dc68c5d"
  },
  {
    "url": "webpack-runtime-f5ee07138aec35b952df.js"
  },
  {
    "url": "webpack-runtime-f5ee07138aec35b952df.js.map",
    "revision": "01eb58a2e5383acad7e89f653946f9ef"
  },
  {
    "url": "webpack.stats.json",
    "revision": "eea8519eae5b2be6ebbf79930a70d17e"
  },
  {
    "url": "worst-hypocrite-rubber-duck-tale/index.html",
    "revision": "31c0c6ee4227014e0283bb94ae7e4058"
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
  if (!resources || !(await caches.match(`https://bdteo.github.io/app-64c195ea601e8783c9a1.js`))) {
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
