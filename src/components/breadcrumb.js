import React from "react"
import { Link } from "gatsby"

import { DEFAULT_LANGUAGE, buildIndexPath, getChrome } from "../../i18n.config"

const Breadcrumb = ({ title, lang = DEFAULT_LANGUAGE }) => {
  const chrome = getChrome(lang)

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol itemScope itemType="https://schema.org/BreadcrumbList">
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link to={buildIndexPath(lang)} itemProp="item">
            <span className="breadcrumb-back">←</span>
            <span itemProp="name">{chrome.breadcrumbHome}</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        <li className="breadcrumb-separator" aria-hidden="true">
          /
        </li>
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <span itemProp="name" className="breadcrumb-current">
            {title}
          </span>
          <meta itemProp="position" content="2" />
        </li>
      </ol>
    </nav>
  )
}

export default Breadcrumb
