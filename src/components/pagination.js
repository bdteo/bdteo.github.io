import * as React from "react"
import { Link } from "gatsby"

const Pagination = ({ currentPage, numPages, hasNextPage, hasPreviousPage }) => {
  const isFirst = currentPage === 1
  const isLast = currentPage === numPages
  const prevPage = currentPage - 1 === 1 ? "/" : `/page/${currentPage - 1}`
  const nextPage = `/page/${currentPage + 1}`

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const showPages = 5 // Show 5 page numbers at most
    
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    let endPage = Math.min(numPages, startPage + showPages - 1)
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1)
    }
    
    // Always show first page
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push('...')
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    // Always show last page
    if (endPage < numPages) {
      if (endPage < numPages - 1) {
        pages.push('...')
      }
      pages.push(numPages)
    }
    
    return pages
  }

  if (numPages <= 1) return null

  return (
    <nav className="pagination" role="navigation" aria-label="Pagination Navigation">
      <div className="pagination-container">
        {/* Previous Button */}
        {hasPreviousPage ? (
          <Link to={prevPage} className="pagination-button pagination-prev" rel="prev" aria-label="Previous page">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.78 2.97a.75.75 0 0 0-1.06 0L2.47 7.22a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 0 0 1.06-1.06L4.56 8.5h8.69a.75.75 0 0 0 0-1.5H4.56l3.22-2.97a.75.75 0 0 0 0-1.06Z"/>
            </svg>
          </Link>
        ) : (
          <span className="pagination-button pagination-prev pagination-disabled" aria-label="Previous page (disabled)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.78 2.97a.75.75 0 0 0-1.06 0L2.47 7.22a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 0 0 1.06-1.06L4.56 8.5h8.69a.75.75 0 0 0 0-1.5H4.56l3.22-2.97a.75.75 0 0 0 0-1.06Z"/>
            </svg>
          </span>
        )}

        {/* Page Numbers */}
        <div className="pagination-numbers">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              )
            }
            
            const pageUrl = page === 1 ? "/" : `/page/${page}`
            const isCurrentPage = page === currentPage
            
            return isCurrentPage ? (
              <span key={page} className="pagination-number pagination-current" aria-current="page">
                {page}
              </span>
            ) : (
              <Link key={page} to={pageUrl} className="pagination-number">
                {page}
              </Link>
            )
          })}
        </div>

        {/* Next Button */}
        {hasNextPage ? (
          <Link to={nextPage} className="pagination-button pagination-next" rel="next" aria-label="Next page">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8.5H2.75a.75.75 0 0 1 0-1.5h8.69L8.22 4.03a.75.75 0 0 1 0-1.06Z"/>
            </svg>
          </Link>
        ) : (
          <span className="pagination-button pagination-next pagination-disabled" aria-label="Next page (disabled)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8.5H2.75a.75.75 0 0 1 0-1.5h8.69L8.22 4.03a.75.75 0 0 1 0-1.06Z"/>
            </svg>
          </span>
        )}
      </div>
    </nav>
  )
}

export default Pagination