import * as React from "react";
import { Link } from "gatsby";
import { BThemeToggler } from "./BThemeToggler";

const Layout = ({ location, title, children }) => {
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
  const [theme, setTheme] = React.useState('dark');

  const themeControl = {
    theme: theme, // use the state variable here
    setTheme: setTheme // use the state updating function here
  };

  return (
    <div className="super-global-wrapper" data-bs-theme={theme}>
      <div className="row my-3 mx-3">
        <div className="col"></div>
        <div className="col-auto">
          <BThemeToggler themeControl={themeControl}/>
        </div>
      </div>
      <div className="global-wrapper" data-is-root-path={isRootPath}>
        <header className="global-header">{header}</header>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.com">Gatsby</a>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
