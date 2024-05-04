import React from 'react';
import PropTypes from 'prop-types';
import { ThemeToggler } from 'gatsby-plugin-dark-mode';

export class BThemeToggler extends React.Component {
  render() {
    return (
      <ThemeToggler>
        {({ theme, toggleTheme }) => (
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="darkModeSwitch"
              onChange={e => {
                const newTheme = e.target.checked ? 'dark' : 'light';
                toggleTheme(newTheme);
                this.props.themeControl.setTheme(newTheme);
              }}
              checked={theme === 'dark'}
            />
            <label className="form-check-label" htmlFor="darkModeSwitch">
              <small>Dark Mode</small>
            </label>
          </div>
        )}
      </ThemeToggler>
    );
  }
}

BThemeToggler.propTypes = {
  themeControl: PropTypes.shape({
    theme: PropTypes.string.isRequired,
    setTheme: PropTypes.func.isRequired
  }).isRequired
};
