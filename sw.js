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
    "revision": "42f55ee317695b2e05c6981641e15f89"
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
    "url": "1943edf48358ec375759a10206b57d36c98a5e6d-4bc46cd4619ccce7ab9b.js"
  },
  {
    "url": "1943edf48358ec375759a10206b57d36c98a5e6d-4bc46cd4619ccce7ab9b.js.map",
    "revision": "fcbe61a5748485d1de75ee6acfd8ee17"
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
    "revision": "be56a1df8e0a5206fec96478d5b4b42a"
  },
  {
    "url": "404/index.html",
    "revision": "041b72edeaaceb8c76a9c69c2457bf8f"
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
    "revision": "b333efe7c32bae3baa71dbc2a86ae803"
  },
  {
    "url": "app-2fa4c9b50f1f19e91984.js"
  },
  {
    "url": "app-2fa4c9b50f1f19e91984.js.LICENSE.txt",
    "revision": "217285521ecff3d6462c9f8ca0625666"
  },
  {
    "url": "app-2fa4c9b50f1f19e91984.js.map",
    "revision": "0f6dcaf9fb1024bf7f10d404d9ca99fa"
  },
  {
    "url": "bluez-pairing-python-agent-workaround-authentication-failed/index.html",
    "revision": "75fae97dde5f011ae1f42ba6b40a2283"
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
    "url": "cd7d5f864fc9e15ed8adef086269b0aeff617554-412c30df55fbe7fc74bb.js"
  },
  {
    "url": "cd7d5f864fc9e15ed8adef086269b0aeff617554-412c30df55fbe7fc74bb.js.map",
    "revision": "f2e31cb8e025541533ec3c698d454376"
  },
  {
    "url": "chunk-map.json",
    "revision": "b66a59df64a2fa94019973a3a1669c60"
  },
  {
    "url": "claude-code-transformed-my-blog-design-in-minutes/index.html",
    "revision": "37c02fd3fec9e9e83fec048ac2b95b18"
  },
  {
    "url": "component---cache-caches-gatsby-plugin-offline-app-shell-js-2059730493c4287dab27.js"
  },
  {
    "url": "component---cache-caches-gatsby-plugin-offline-app-shell-js-2059730493c4287dab27.js.map",
    "revision": "dbdee58dc14ca9afd1e085c9ad16c3df"
  },
  {
    "url": "component---src-pages-404-js-585d58ed261e84efc975.js"
  },
  {
    "url": "component---src-pages-404-js-585d58ed261e84efc975.js.map",
    "revision": "64fe243b28fa49471b2716efa4f61487"
  },
  {
    "url": "component---src-pages-index-js-34223943920145036148.js"
  },
  {
    "url": "component---src-pages-index-js-34223943920145036148.js.map",
    "revision": "a89c958f99e27babc47d38515191d6c6"
  },
  {
    "url": "component---src-pages-using-typescript-tsx-eb892d7bbcecf86c290c.js"
  },
  {
    "url": "component---src-pages-using-typescript-tsx-eb892d7bbcecf86c290c.js.map",
    "revision": "2fbf64441b5619e5add98c187bc1f75d"
  },
  {
    "url": "component---src-templates-blog-post-js-e17edb78643a1178d66c.js"
  },
  {
    "url": "component---src-templates-blog-post-js-e17edb78643a1178d66c.js.map",
    "revision": "55598f3a69ff755a8605366b0da09074"
  },
  {
    "url": "discrete-representations-reinforcement-learning-insights/index.html",
    "revision": "3be851de71aac80553d881470a144069"
  },
  {
    "url": "docker-compose-major-changes-since-october-2023/index.html",
    "revision": "341740fd2d9748074ba7b0b5dba8782d"
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
    "revision": "6b27a18083e412dcfeb3ea0c3d1d34f4"
  },
  {
    "url": "huawei-watch-d2-proprietary-protocol-vendor-lockin/index.html",
    "revision": "27d1535aacad0411d2fe8e2ae5e4cfe4"
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
    "revision": "d43f8f7e5044aec42b9089cc31ece3a7"
  },
  {
    "url": "installing-php-8-3-6-with-imap-on-macos-using-phpenv/index.html",
    "revision": "22d294614d1ca81fe24456a7a3440c84"
  },
  {
    "url": "laravel-sail-vs-laradock-choosing-right-docker-solution/index.html",
    "revision": "361ab546da4f68e7c0f8d186f9607499"
  },
  {
    "url": "m1-mac-android-emulator-bluetooth-passthrough-bumble/index.html",
    "revision": "07491755e449aa8992e1f838c2d322c1"
  },
  {
    "url": "manifest.webmanifest",
    "revision": "217898b89af0c46bfba80747bc28200c"
  },
  {
    "url": "offline-plugin-app-shell-fallback/index.html",
    "revision": "35c874e2a019c6edb8faabc43d8b6c73"
  },
  {
    "url": "page-data/404.html/page-data.json",
    "revision": "e4017e17e0c406e5f082c622d99c0c00"
  },
  {
    "url": "page-data/404/page-data.json",
    "revision": "79c2cf93de815e1bcec08d7b5cbef530"
  },
  {
    "url": "page-data/about/page-data.json",
    "revision": "b5d4e9b68b0b486c72be7c852f2fcc87"
  },
  {
    "url": "page-data/app-data.json",
    "revision": "4458f373954013b65a1989a67adb439f"
  },
  {
    "url": "page-data/bluez-pairing-python-agent-workaround-authentication-failed/page-data.json",
    "revision": "e8aaa167a83a77adbd5c25895e049c0c"
  },
  {
    "url": "page-data/claude-code-transformed-my-blog-design-in-minutes/page-data.json",
    "revision": "d1b065ac92748f1e22b5e751b6f808c0"
  },
  {
    "url": "page-data/discrete-representations-reinforcement-learning-insights/page-data.json",
    "revision": "15e1bd22412f1d4675a5fb4eedded5c8"
  },
  {
    "url": "page-data/docker-compose-major-changes-since-october-2023/page-data.json",
    "revision": "ee1ef6ce31b4634a43418df82507a237"
  },
  {
    "url": "page-data/google-ai-ambitions-historical-analysis-promises-stock-market-impact/page-data.json",
    "revision": "2d725ef133e6137491e2c10feba79e54"
  },
  {
    "url": "page-data/huawei-watch-d2-proprietary-protocol-vendor-lockin/page-data.json",
    "revision": "b087122edb1d8f6f0557e28538e777b9"
  },
  {
    "url": "page-data/index/page-data.json",
    "revision": "b879147ea2484dc88bd6ec62d4a16aa8"
  },
  {
    "url": "page-data/installing-php-8-3-6-with-imap-on-macos-using-phpenv/page-data.json",
    "revision": "d803d06f95cab9b50544e37f17c57772"
  },
  {
    "url": "page-data/laravel-sail-vs-laradock-choosing-right-docker-solution/page-data.json",
    "revision": "77a6d42e253aa262be75218bffa48b0f"
  },
  {
    "url": "page-data/m1-mac-android-emulator-bluetooth-passthrough-bumble/page-data.json",
    "revision": "361aaba1fe30a5deb30ba8216b48532c"
  },
  {
    "url": "page-data/offline-plugin-app-shell-fallback/page-data.json",
    "revision": "d22fedc5f9585423cf2e45d46cac048f"
  },
  {
    "url": "page-data/pushing-the-stable-diffussion-limits/page-data.json",
    "revision": "a54949cfe3f796403f4411a91639bb32"
  },
  {
    "url": "page-data/shadow-weaver-redemption-journey/page-data.json",
    "revision": "1129a9cd3d053e170b74800116154b2e"
  },
  {
    "url": "page-data/sq/d/2923011943.json",
    "revision": "901eb800ab5d7123f3a8277d846bf103"
  },
  {
    "url": "page-data/sq/d/3464938722.json",
    "revision": "9ab0fa07788b16e30a8c1d4788dbccc5"
  },
  {
    "url": "page-data/stable-difussion-cheat-sheet/page-data.json",
    "revision": "c7af0584e6ca64bccb790d2fa45ac972"
  },
  {
    "url": "page-data/the-sorceress-and-the-forgotten-stardust/page-data.json",
    "revision": "2b096681e595c15e3450903e2f46db61"
  },
  {
    "url": "page-data/understanding-class-namespace-changes-shopware-6-5-developers-guide/page-data.json",
    "revision": "fee0b1b23f9955e9f97154c299a5dfe1"
  },
  {
    "url": "page-data/unlocking-the-power-of-git-grep/page-data.json",
    "revision": "ad93742e25b863511bde170dc5bb6064"
  },
  {
    "url": "page-data/using-typescript/page-data.json",
    "revision": "5a8c763620d97048ee04cf70f1c6e8aa"
  },
  {
    "url": "page-data/worst-hypocrite-rubber-duck-tale/page-data.json",
    "revision": "08f61fa4493c4b2522b198f6c7d3527c"
  },
  {
    "url": "pushing-the-stable-diffussion-limits/index.html",
    "revision": "b5dd4f91c0084ce0faeb1a2dcdbe49cb"
  },
  {
    "url": "robots.txt",
    "revision": "b6216d61c03e6ce0c9aea6ca7808f7ca"
  },
  {
    "url": "rss.xml",
    "revision": "00bca7e00b55a37426d6b81f7c8f3dbf"
  },
  {
    "url": "shadow-weaver-redemption-journey/index.html",
    "revision": "8a837e5c5c5c7183a9678d02c492dd28"
  },
  {
    "url": "stable-difussion-cheat-sheet/index.html",
    "revision": "a5576740dc04089547a67853f75954e5"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/16947/featured.jpg"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/29ba9/featured.jpg"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/2fa07/featured.webp"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/36f66/featured.jpg"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/460bb/featured.jpg"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/4a276/featured.webp"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/57584/featured.webp"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/7284f/featured.jpg"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/7db9c/featured.webp"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/83638/featured.jpg"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/8dc98/featured.jpg"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/9285b/featured.webp"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/984df/featured.webp"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/b979a/featured.webp"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/c8896/featured.jpg"
  },
  {
    "url": "static/168463a17f9c2441d153dcee3bdf8990/f9756/featured.webp"
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
    "url": "static/cd1aa56ebd8947295c8b2ab1adab5b06/0ede0/featured-2.jpg"
  },
  {
    "url": "static/cd1aa56ebd8947295c8b2ab1adab5b06/3ac88/featured-2.jpg"
  },
  {
    "url": "static/cd1aa56ebd8947295c8b2ab1adab5b06/828fb/featured-2.jpg"
  },
  {
    "url": "static/cd1aa56ebd8947295c8b2ab1adab5b06/a6688/featured-2.jpg"
  },
  {
    "url": "static/cd1aa56ebd8947295c8b2ab1adab5b06/ac99c/featured-2.jpg"
  },
  {
    "url": "static/cd1aa56ebd8947295c8b2ab1adab5b06/ff44c/featured-2.jpg"
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
    "url": "styles.b905c3a74402109d7e58.css"
  },
  {
    "url": "the-sorceress-and-the-forgotten-stardust/index.html",
    "revision": "a43da141b6773cb966bafa97299ef3ba"
  },
  {
    "url": "understanding-class-namespace-changes-shopware-6-5-developers-guide/index.html",
    "revision": "e05d56ee73d7bf70b40b5f8caeb2de59"
  },
  {
    "url": "unlocking-the-power-of-git-grep/index.html",
    "revision": "6014d769a23ed30cd6d861e62e228567"
  },
  {
    "url": "using-typescript/index.html",
    "revision": "8449a955ce8a6162b2e249e2ab8da618"
  },
  {
    "url": "webpack-runtime-3139becc3adc5c32613a.js"
  },
  {
    "url": "webpack-runtime-3139becc3adc5c32613a.js.map",
    "revision": "a8465942bde27218a737dbf662c05878"
  },
  {
    "url": "webpack.stats.json",
    "revision": "5df1de077e14bdd4a4728192530ecfb6"
  },
  {
    "url": "worst-hypocrite-rubber-duck-tale/index.html",
    "revision": "75bd493dc243540f4b71833ee35060bf"
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
  if (!resources || !(await caches.match(`https://bdteo.github.io/app-2fa4c9b50f1f19e91984.js`))) {
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
