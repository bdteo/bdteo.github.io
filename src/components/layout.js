// src/components/layout.js

import * as React from "react";
import { Link } from "gatsby";
import { BThemeToggler } from "./BThemeToggler";
import Logo from "../images/bd-icon@4x.png"; // Import your logo

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;
  const isRootPath = location.pathname === rootPath;

  const header = (
    <div className="header-inner">
      <div className="site-logo">
        <Link to="/" className="header-logo">
          <img src={Logo} alt={title} />
        </Link>
      </div>
      <div className="header-spacer" />
      <div className="theme-toggler">
        <BThemeToggler />
      </div>
    </div>
  );

  return (
    <>
      <header className="global-header">{header}</header>
      <div className="global-wrapper">
        <main className="main-content">{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with{" "}
          <a href="https://www.gatsbyjs.com">Gatsby</a>
        </footer>
      </div>
    </>
  );
};

export default Layout;
