import * as React from "react";
import { Link } from "gatsby";
import { BThemeToggler } from "./BThemeToggler";

const Layout = ({ location, title, children }) => {
  // noinspection JSUnresolvedReference
  const rootPath = `${__PATH_PREFIX__}/`;
  const isRootPath = location.pathname === rootPath;
  let header;

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    );
  } else {
    header = (
     <div>
       <Link className="header-link-home" to="/"
         style={{ opacity: 0.9 }}
       >
         {title}
       </Link>
       <hr/>
     </div>
    );
  }

  return (
    <div className="super-global-wrapper">
      <header className="global-header row align-items-start mx-0"
        data-is-root-path={isRootPath}
      >
        <div className="col d-none d-lg-block"></div>
        <div className="col-auto global-wrapper flex-shrink-1">
          <div className="mb-2">{header}</div>
          <main>{children}</main>
          <footer>
            © {new Date().getFullYear()}, Built with
            {` `}
            <a href="https://www.gatsbyjs.com">Gatsby</a>
          </footer>
        </div>
        <div className="col-12 col-lg text-end order-first order-lg-last">
          <div className="d-inline-block mx-3 mt-3 mb-0 mb-lg-4 mt-lg-4 py-2">
            <BThemeToggler />
          </div>
        </div>
      </header>
    </div>
  );
}

export default Layout;
