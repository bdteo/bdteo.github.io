// src/components/layout.js

import * as React from "react"
import { Link } from "gatsby"
import { BThemeToggler } from "./BThemeToggler"
import LanguageSwitcher from "./LanguageSwitcher"
import Logo from "../images/bd-icon.svg"
import useScrollDirection from "../hooks/useScrollDirection"
import {
  DEFAULT_LANGUAGE,
  buildIndexPath,
  buildLocalizedPath,
  getChrome,
} from "../../i18n.config"

const Layout = ({
  title,
  children,
  lang = DEFAULT_LANGUAGE,
  alternatePaths = {},
  activeLanguages = [],
}) => {
  const { scrollDirection, isAtTop } = useScrollDirection()
  const chrome = getChrome(lang)
  const homePath = buildIndexPath(lang)
  const aboutPath = buildLocalizedPath("about", lang)

  return (
    <>
      <a href="#main-content" className="skip-to-main-content">
        {chrome.skipToContent}
      </a>

      <header
        className={`global-header no-print ${scrollDirection === "down" && !isAtTop ? "header-hidden" : "header-visible"}`}
      >
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <div className="site-logo">
                <Link to={homePath} className="header-logo" aria-label={title}>
                  <img src={Logo} alt={title} width="40" height="40" />
                  <span className="site-title" aria-hidden="true">
                    {title}
                  </span>
                </Link>
              </div>

              <nav className="site-nav">
                <ul className="nav-list">
                  <li className="nav-item">
                    <Link
                      to={homePath}
                      className="nav-link"
                      activeClassName="active"
                      partiallyActive={false}
                    >
                      <span className="nav-text">{chrome.navHome}</span>
                      <div className="indicator-container">
                        <span className="nav-indicator"></span>
                      </div>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to={aboutPath}
                      className="nav-link"
                      activeClassName="active"
                      partiallyActive={false}
                    >
                      <span className="nav-text">{chrome.navAbout}</span>
                      <div className="indicator-container">
                        <span className="nav-indicator"></span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="header-right">
              <LanguageSwitcher
                currentLang={lang}
                alternatePaths={alternatePaths}
                activeLanguages={activeLanguages}
              />
              <div className="theme-toggle-container">
                <BThemeToggler />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="main-content">
        <div className="container">{children}</div>
      </main>

      <footer className="site-footer no-print">
        <div className="container">
          <hr />
          <div className="footer-content">
            <div className="footer-copyright">
              © {new Date().getFullYear()}, {chrome.footerBuiltWith}{" "}
              <a
                href="https://www.gatsbyjs.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Gatsby
              </a>
            </div>
            <div className="footer-links">
              <a
                href="https://github.com/bdteo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
              >
                GitHub
              </a>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={chrome.rssFeed}
              >
                RSS
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Layout
