import React from "react"
import { Link } from "gatsby"

const Breadcrumb = ({ title }) => (
  <nav className="breadcrumb" aria-label="Breadcrumb">
    <ol itemScope itemType="https://schema.org/BreadcrumbList">
      <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
        <Link to="/" itemProp="item">
          <span className="breadcrumb-back">←</span>
          <span itemProp="name">Home</span>
        </Link>
        <meta itemProp="position" content="1" />
      </li>
      <li className="breadcrumb-separator" aria-hidden="true">/</li>
      <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
        <span itemProp="name" className="breadcrumb-current">{title}</span>
        <meta itemProp="position" content="2" />
      </li>
    </ol>
  </nav>
)

export default Breadcrumb
