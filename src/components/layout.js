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
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    );
  }

  // Using React useState hook to manage theme state
  const [theme, setTheme] = React.useState('dark-mode');

  const themeControl = {
    theme: theme, // use the state variable here
    setTheme: setTheme // use the state updating function here
  };

  return (
    <div className="super-global-wrapper" data-bs-theme={theme}>
      <header className="global-header row align-items-start"
        data-is-root-path={isRootPath}
      >
        <div className="col"></div>
        <div className="col-auto global-wrapper">
          <div class="mb-2">{header}</div>
          <main>{children}</main>
          <footer>
            © {new Date().getFullYear()}, Built with
            {` `}
            <a href="https://www.gatsbyjs.com">Gatsby</a>
          </footer>
        </div>
        <div className="col text-end">
          <div className="d-inline-block mx-3 my-4 py-2">
            <BThemeToggler themeControl={themeControl} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default Layout;
