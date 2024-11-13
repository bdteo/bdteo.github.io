// src/components/layout.js

import * as React from "react";
import { Link } from "gatsby";
import { BThemeToggler } from "./BThemeToggler";

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;
  const isRootPath = location.pathname === rootPath;
  let header;

  header = (
    <div className="header-inner">
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
      <div className="theme-toggler">
        <BThemeToggler />
      </div>
    </div>
  );

  return (
    <>
      <header className="global-header" data-is-root-path={isRootPath}>
        {header}
      </header>
      <div className="global-wrapper" data-is-root-path={isRootPath}>
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
