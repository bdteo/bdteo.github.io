import * as React from "react"
import { Link } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobe } from "@fortawesome/free-solid-svg-icons"

import {
  DEFAULT_LANGUAGE,
  buildIndexPath,
  getChrome,
  getLanguage,
  getLanguageCodes,
} from "../../i18n.config"

const getLinks = ({
  currentLang,
  alternatePaths = {},
  activeLanguages = [],
}) => {
  const active = activeLanguages.length ? activeLanguages : [DEFAULT_LANGUAGE]

  return getLanguageCodes()
    .filter(code => active.includes(code))
    .map(code => {
      const exactPath = alternatePaths[code]

      return {
        code,
        exact: Boolean(exactPath),
        path: exactPath || buildIndexPath(code),
        language: getLanguage(code),
        isCurrent: code === currentLang,
      }
    })
}

const LanguageSwitcher = ({
  currentLang = DEFAULT_LANGUAGE,
  alternatePaths = {},
  activeLanguages = [],
}) => {
  const chrome = getChrome(currentLang)
  const links = getLinks({ currentLang, alternatePaths, activeLanguages })
  const wrapperRef = React.useRef(null)
  const buttonRef = React.useRef(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const currentLanguage = getLanguage(currentLang)

  React.useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const onPointerDown = event => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }
    const onKeyDown = event => {
      if (event.key === "Escape") {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  if (links.length < 2) {
    return null
  }

  return (
    <div className="language-switcher" ref={wrapperRef}>
      <button
        ref={buttonRef}
        className="language-switcher__button"
        type="button"
        aria-label={chrome.languageSwitcherLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={chrome.languageSwitcherLabel}
        onClick={() => setIsOpen(value => !value)}
      >
        <FontAwesomeIcon icon={faGlobe} />
        <span>{currentLanguage.shortLabel}</span>
      </button>

      {isOpen && (
        <div className="language-switcher__menu" role="menu">
          <p className="language-switcher__title">
            {chrome.languageSwitcherTitle}
          </p>
          {links.map(link => (
            <Link
              key={link.code}
              className={`language-switcher__option${
                link.isCurrent ? " language-switcher__option--active" : ""
              }`}
              to={link.path}
              role="menuitem"
              lang={link.language.hreflang}
              onClick={() => setIsOpen(false)}
            >
              <span className="language-switcher__code">
                {link.language.shortLabel}
              </span>
              <span className="language-switcher__label">
                {link.language.label}
                {!link.exact && (
                  <span className="language-switcher__hint">
                    {chrome.languageHomeSuffix}
                  </span>
                )}
              </span>
              {link.isCurrent && (
                <span className="sr-only"> {chrome.currentLanguage}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
