const DEFAULT_LANGUAGE = "en"
const LANGUAGE_ORDER = ["en", "bg", "fr", "de", "zh-Hans"]

const LANGUAGES = {
  en: {
    code: "en",
    label: "English",
    shortLabel: "EN",
    pathPrefix: "",
    hreflang: "en",
    ogLocale: "en_US",
    schemaLanguage: "en",
    dateLocale: "en-US",
    giscusLang: "en",
    showWhenEmpty: true,
  },
  bg: {
    code: "bg",
    label: "Български",
    shortLabel: "BG",
    pathPrefix: "/bg",
    hreflang: "bg",
    ogLocale: "bg_BG",
    schemaLanguage: "bg",
    dateLocale: "bg-BG",
    giscusLang: "bg",
    showWhenEmpty: false,
  },
  fr: {
    code: "fr",
    label: "Français",
    shortLabel: "FR",
    pathPrefix: "/fr",
    hreflang: "fr",
    ogLocale: "fr_FR",
    schemaLanguage: "fr",
    dateLocale: "fr-FR",
    giscusLang: "fr",
    showWhenEmpty: false,
  },
  de: {
    code: "de",
    label: "Deutsch",
    shortLabel: "DE",
    pathPrefix: "/de",
    hreflang: "de",
    ogLocale: "de_DE",
    schemaLanguage: "de",
    dateLocale: "de-DE",
    giscusLang: "de",
    showWhenEmpty: false,
  },
  "zh-Hans": {
    code: "zh-Hans",
    label: "简体中文",
    shortLabel: "ZH",
    pathPrefix: "/zh",
    hreflang: "zh-Hans",
    ogLocale: "zh_CN",
    schemaLanguage: "zh-Hans",
    dateLocale: "zh-CN",
    giscusLang: "zh-CN",
    showWhenEmpty: false,
  },
}

const CHROME = {
  en: {
    skipToContent: "Skip to main content",
    navHome: "Home",
    navAbout: "About",
    recentPosts: "Recent Posts",
    morePosts: "More Posts",
    siteDescription:
      "Quiet essays on engineering, language, and what shows up at the edge of every honest inquiry. Written slowly, from Sofia.",
    noPosts:
      "No blog posts found. Add markdown posts to content/blog to publish here.",
    breadcrumbHome: "Home",
    comments: "Comments",
    footerBuiltWith: "Built with",
    rssFeed: "RSS Feed",
    languageSwitcherLabel: "Change language",
    languageSwitcherTitle: "Language",
    currentLanguage: "Current language",
    articleLanguageLabel: "Read this in",
    languageHomeSuffix: "home",
    bioKicker: "Author",
    bioName: "Hey, I'm Boris",
    bioSummary:
      "I am not a writer. I am not a philosopher. I am just a backend engineer from Bulgaria, sitting between Laravel queues and hundred-million-row indexes for a living. The rest of the time I read medicine I have no business reading, French novels I half-understand, and whatever else my small rubber head wants to chew on. Two rescued strays keep me honest.",
    articleAudio: {
      label: "Audio narration for",
      fallbackLabel: "English narration for",
      speedLegend: "Playback speed",
      play: "Play narration",
      pause: "Pause narration",
      title: "Listen to article",
      fallbackTitle: "Listen in English",
      progress: "Narration progress",
      error: "Audio could not be loaded from this page.",
    },
  },
  bg: {
    skipToContent: "Към основното съдържание",
    navHome: "Начало",
    navAbout: "За мен",
    recentPosts: "Нови текстове",
    morePosts: "Още текстове",
    siteDescription:
      "Тихи есета за инженерство, език и онова, което се появява на ръба на всяко честно питане. Писани бавно, от София.",
    noPosts: "Все още няма публикувани текстове на този език.",
    breadcrumbHome: "Начало",
    comments: "Коментари",
    footerBuiltWith: "Изградено с",
    rssFeed: "RSS емисия",
    languageSwitcherLabel: "Смяна на езика",
    languageSwitcherTitle: "Език",
    currentLanguage: "Текущ език",
    articleLanguageLabel: "Прочети този текст на",
    languageHomeSuffix: "начало",
    bioKicker: "Автор",
    bioName: "Здравей, аз съм Борис",
    bioSummary:
      "Не съм писател. Не съм философ. Просто съм backend инженер от България, който живее между Laravel опашки и индекси със стотици милиони редове. През останалото време чета медицина, която няма работа да чета, френски романи, които разбирам наполовина, и каквото още малката ми гумена глава реши да дъвче. Две спасени кучета ме държат честен.",
    articleAudio: {
      label: "Аудио прочит за",
      fallbackLabel: "Английски прочит за",
      speedLegend: "Скорост на възпроизвеждане",
      play: "Пусни прочита",
      pause: "Пауза",
      title: "Чуй текста",
      fallbackTitle: "Чуй английския прочит",
      progress: "Напредък на прочита",
      error: "Аудиото не може да бъде заредено от тази страница.",
    },
  },
  fr: {
    skipToContent: "Aller au contenu principal",
    navHome: "Accueil",
    navAbout: "À propos",
    recentPosts: "Articles récents",
    morePosts: "Autres articles",
    siteDescription:
      "Essais calmes sur l'ingénierie, la langue et ce qui apparaît au bord de toute recherche honnête. Écrits lentement, depuis Sofia.",
    noPosts: "Aucun article n'est encore publié dans cette langue.",
    breadcrumbHome: "Accueil",
    comments: "Commentaires",
    footerBuiltWith: "Construit avec",
    rssFeed: "Flux RSS",
    languageSwitcherLabel: "Changer de langue",
    languageSwitcherTitle: "Langue",
    currentLanguage: "Langue actuelle",
    articleLanguageLabel: "Lire ce texte en",
    languageHomeSuffix: "accueil",
    bioKicker: "Auteur",
    bioName: "Bonjour, je suis Boris",
    bioSummary:
      "Je ne suis pas écrivain. Je ne suis pas philosophe. Je suis simplement un ingénieur backend bulgare, quelque part entre des files Laravel et des index de centaines de millions de lignes.",
    articleAudio: {
      label: "Narration audio pour",
      fallbackLabel: "Narration anglaise pour",
      speedLegend: "Vitesse de lecture",
      play: "Lancer la narration",
      pause: "Mettre en pause",
      title: "Écouter l'article",
      fallbackTitle: "Écouter en anglais",
      progress: "Progression de la narration",
      error: "L'audio n'a pas pu être chargé depuis cette page.",
    },
  },
  de: {
    skipToContent: "Zum Hauptinhalt springen",
    navHome: "Start",
    navAbout: "Über mich",
    recentPosts: "Neue Texte",
    morePosts: "Weitere Texte",
    siteDescription:
      "Leise Essays über Engineering, Sprache und das, was am Rand jeder ehrlichen Frage auftaucht. Langsam geschrieben, aus Sofia.",
    noPosts: "In dieser Sprache sind noch keine Texte veröffentlicht.",
    breadcrumbHome: "Start",
    comments: "Kommentare",
    footerBuiltWith: "Gebaut mit",
    rssFeed: "RSS-Feed",
    languageSwitcherLabel: "Sprache wechseln",
    languageSwitcherTitle: "Sprache",
    currentLanguage: "Aktuelle Sprache",
    articleLanguageLabel: "Diesen Text lesen auf",
    languageHomeSuffix: "Startseite",
    bioKicker: "Autor",
    bioName: "Hallo, ich bin Boris",
    bioSummary:
      "Ich bin kein Schriftsteller. Ich bin kein Philosoph. Ich bin nur ein Backend-Engineer aus Bulgarien, irgendwo zwischen Laravel-Queues und Indizes mit Hunderten Millionen Zeilen.",
    articleAudio: {
      label: "Audiofassung für",
      fallbackLabel: "Englische Audiofassung für",
      speedLegend: "Wiedergabegeschwindigkeit",
      play: "Audio starten",
      pause: "Audio pausieren",
      title: "Artikel anhören",
      fallbackTitle: "Auf Englisch anhören",
      progress: "Fortschritt der Audiofassung",
      error: "Das Audio konnte von dieser Seite nicht geladen werden.",
    },
  },
  "zh-Hans": {
    skipToContent: "跳到主要内容",
    navHome: "首页",
    navAbout: "关于",
    recentPosts: "最新文章",
    morePosts: "更多文章",
    siteDescription:
      "关于工程、语言，以及每一次诚实追问边缘浮现之物的安静随笔。写得很慢，来自索菲亚。",
    noPosts: "这个语言还没有发布文章。",
    breadcrumbHome: "首页",
    comments: "评论",
    footerBuiltWith: "构建于",
    rssFeed: "RSS 订阅",
    languageSwitcherLabel: "切换语言",
    languageSwitcherTitle: "语言",
    currentLanguage: "当前语言",
    articleLanguageLabel: "阅读本文：",
    languageHomeSuffix: "首页",
    bioKicker: "作者",
    bioName: "你好，我是 Boris",
    bioSummary:
      "我不是作家，也不是哲学家。我只是一个来自保加利亚的后端工程师，靠在 Laravel 队列和上亿行索引之间讨生活。其余时间，我读一些本不该我读的医学资料，读一些半懂不懂的法国小说，也读我的小橡皮脑袋想咀嚼的别的东西。两只被救助的流浪狗让我保持诚实。",
    articleAudio: {
      label: "音频朗读：",
      fallbackLabel: "英文朗读：",
      speedLegend: "播放速度",
      play: "播放朗读",
      pause: "暂停朗读",
      title: "收听文章",
      fallbackTitle: "收听英文朗读",
      progress: "朗读进度",
      error: "无法从此页面加载音频。",
    },
  },
}

const trimSlashes = value => String(value || "").replace(/^\/+|\/+$/g, "")

const withTrailingSlash = value => {
  if (!value || value === "/") return "/"
  return value.endsWith("/") ? value : `${value}/`
}

const getLanguage = code => LANGUAGES[code] || LANGUAGES[DEFAULT_LANGUAGE]

const getChrome = code =>
  CHROME[getLanguage(code).code] || CHROME[DEFAULT_LANGUAGE]

const getLanguageCodes = () => LANGUAGE_ORDER.filter(code => LANGUAGES[code])

const buildIndexPath = code => {
  const language = getLanguage(code)
  return withTrailingSlash(language.pathPrefix || "/")
}

const buildLocalizedPath = (sourceSlug, code = DEFAULT_LANGUAGE) => {
  const slug = trimSlashes(sourceSlug)
  const language = getLanguage(code)
  const prefix = trimSlashes(language.pathPrefix)
  const segments = [prefix, slug].filter(Boolean)
  return withTrailingSlash(`/${segments.join("/")}`)
}

const getPathLanguage = pathname => {
  const normalized = withTrailingSlash(pathname || "/")
  const match = getLanguageCodes()
    .filter(code => code !== DEFAULT_LANGUAGE)
    .find(
      code =>
        normalized === buildIndexPath(code) ||
        normalized.startsWith(`${buildIndexPath(code)}`),
    )

  return match || DEFAULT_LANGUAGE
}

const formatDisplayDate = (value, code = DEFAULT_LANGUAGE) => {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat(getLanguage(code).dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

module.exports = {
  DEFAULT_LANGUAGE,
  LANGUAGE_ORDER,
  LANGUAGES,
  CHROME,
  buildIndexPath,
  buildLocalizedPath,
  getChrome,
  getLanguage,
  getLanguageCodes,
  getPathLanguage,
  formatDisplayDate,
  withTrailingSlash,
}
