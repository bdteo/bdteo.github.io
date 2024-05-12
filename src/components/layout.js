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
      <header className="global-header row align-items-start"
        data-is-root-path={isRootPath}
      >
        <div className="col"></div>
        <div className="col-auto global-wrapper">
          <div className="mb-2">{header}</div>
          <main>{children}</main>
          <footer>
            © {new Date().getFullYear()}, Built with
            {` `}
            <a href="https://www.gatsbyjs.com">Gatsby</a>
          </footer>
        </div>
        <div className="col text-end">
          <div className="d-inline-block mx-3 my-4 py-2">
            <BThemeToggler />
          </div>
        </div>
      </header>
    </div>
  );
}

export default Layout;
