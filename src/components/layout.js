// src/components/layout.js

import * as React from "react";
import { Link } from "gatsby";
import { BThemeToggler } from "./BThemeToggler";
import Logo from "../images/bd-icon@4x.png"; // Import your logo
import useScrollDirection from "../hooks/useScrollDirection";

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;
  const isRootPath = location.pathname === rootPath;
  const { scrollDirection, isAtTop } = useScrollDirection();

  return (
    <>
      <a href="#main-content" className="skip-to-main-content">
        Skip to main content
      </a>
      
      <header className={`global-header no-print ${scrollDirection === 'down' && !isAtTop ? 'header-hidden' : 'header-visible'}`}>
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <div className="site-logo">
                <Link to="/" className="header-logo" aria-label="Homepage">
                  <img src={Logo} alt="" width="40" height="40" />
                  <span className="site-title">{title}</span>
                </Link>
              </div>
              
              <nav className="site-nav">
                <ul className="nav-list">
                  <li className="nav-item">
                    <Link to="/" className="nav-link" activeClassName="active" partiallyActive={false}>
                      <span className="nav-text">Home</span>
                      <div className="indicator-container">
                        <span className="nav-indicator"></span>
                      </div>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/about" className="nav-link" activeClassName="active" partiallyActive={false}>
                      <span className="nav-text">About</span>
                      <div className="indicator-container">
                        <span className="nav-indicator"></span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            
            <div className="header-right">
              <div className="theme-toggle-container">
                <BThemeToggler />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main id="main-content" className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      
      <footer className="site-footer no-print">
        <div className="container">
          <div className="footer-content">
            <div className="footer-copyright">
              © {new Date().getFullYear()}, Built with{" "}
              <a href="https://www.gatsbyjs.com" target="_blank" rel="noopener noreferrer">Gatsby</a>
            </div>
            <div className="footer-links">
              <a href="https://github.com/bdteo" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
                GitHub
              </a>
              <a href="/rss.xml" target="_blank" rel="noopener noreferrer" aria-label="RSS Feed">
                RSS
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Layout;