import * as React from "react"
import { Link } from "gatsby"

import {
  DEFAULT_LANGUAGE,
  getChrome,
  getLanguage,
  getLanguageCodes,
} from "../../i18n.config"

const ArticleLanguageLinks = ({
  currentLang = DEFAULT_LANGUAGE,
  alternatePaths = {},
}) => {
  const exactAlternates = getLanguageCodes().filter(
    code => alternatePaths[code],
  )
  const chrome = getChrome(currentLang)

  if (exactAlternates.length < 2) {
    return null
  }

  return (
    <nav
      className="article-language-links"
      aria-label={chrome.articleLanguageLabel}
    >
      <span className="article-language-links__label">
        {chrome.articleLanguageLabel}
      </span>
      <div className="article-language-links__list">
        {exactAlternates.map(code => {
          const language = getLanguage(code)
          const isCurrent = code === currentLang

          return (
            <Link
              key={code}
              className={`article-language-links__item${
                isCurrent ? " article-language-links__item--active" : ""
              }`}
              to={alternatePaths[code]}
              lang={language.hreflang}
              aria-current={isCurrent ? "page" : undefined}
            >
              <span className="article-language-links__code">
                {language.shortLabel}
              </span>
              <span>{language.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default ArticleLanguageLinks
