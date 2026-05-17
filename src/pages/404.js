import * as React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { getPathLanguage } from "../../i18n.config"

const NotFoundPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const lang = getPathLanguage(location.pathname)

  return (
    <Layout location={location} title={siteTitle} lang={lang}>
      <h1>404: Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Layout>
  )
}

export const Head = ({ location }) => (
  <Seo title="404: Not Found" lang={getPathLanguage(location.pathname)} />
)

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
