import * as React from "react"
import { Link, navigate } from "gatsby"

const target = "/ivory-under-amber/"

const TheAcrosticRedirect = () => {
  React.useEffect(() => {
    navigate(target, { replace: true })
  }, [])

  return (
    <main className="main-content">
      <div className="container">
        <p>
          Redirecting to <Link to={target}>Ivory Under Amber</Link>.
        </p>
      </div>
    </main>
  )
}

export const Head = () => (
  <>
    <title>Ivory Under Amber</title>
    <meta httpEquiv="refresh" content={`0;url=${target}`} />
    <link rel="canonical" href="https://bdteo.com/ivory-under-amber/" />
  </>
)

export default TheAcrosticRedirect
