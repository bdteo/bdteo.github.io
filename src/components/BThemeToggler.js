import React from 'react';
import { ThemeToggler } from 'gatsby-plugin-dark-mode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import classNames from 'classnames';


library.add(faSun, faMoon); // Make sure icons are added to the library

const DARK_THEME = 'dark-mode';
const LIGHT_THEME = 'light-mode';

export class BThemeToggler extends React.Component {
  render() {
    return (
      <ThemeToggler>
        {({ theme, toggleTheme }) => {
          const isDarkTheme = theme === DARK_THEME;
          return <div style={{ fontSize: '1.5em' }}>
            <div className="form-check form-switch position-relative d-block clearfix my-0"
              style={{ paddingLeft: '2em' }}
            >
              <input
                className="form-check-input my-0"
                type="checkbox"
                id="darkModeSwitch"
                style={{ width: '2em', marginLeft: '-2em' }}
                onChange={e => {
                  const newTheme = e.target.checked ? DARK_THEME : LIGHT_THEME;
                  toggleTheme(newTheme);
                }}
                checked={isDarkTheme}
              />
              <label className="form-check-label position-absolute d-inline-block"
                htmlFor="darkModeSwitch"
                style={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: isDarkTheme ? '0.55em' : null,
                  right: isDarkTheme ? null : '0.55em',
                  transition: 'all 0.5s ease',
                  fontSize: '0.5em',
                }}
              >
                {/* Position the icon based on theme */}
                <FontAwesomeIcon icon={isDarkTheme ? faSun : faMoon}
                  className={classNames({
                    'text-warning': isDarkTheme,
                    'text-info': !isDarkTheme,
                  })}
                  style={{ opacity: isDarkTheme ? 1 : 0.75 }}
                />
              </label>
            </div>
          </div>
        }}
      </ThemeToggler>
    );
  }
}
