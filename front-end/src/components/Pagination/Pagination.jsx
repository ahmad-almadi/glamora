import React from "react";
import "./Pagination.css";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null; //If there is only one page, pagination is pointless → render nothing.

  const generateSmartPageNumbers = (current, total) => {
    //This function decides which page numbers to show.
    if (total <= 7) {
      //When total pages are small <=7 , Show everything , No dots needed
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //Array This is the built-in JavaScript Array constructor.
      //Array.from(arrayLike, mapFunction) [it creates an array FROM something else] arrayLike → an object that has a length /mapFunction → a function that runs for each index
      //Because Array.from always passes two arguments to the map function  / (_, i) _ is useless (empty slot)
      return Array.from({ length: total }, (_, i) => i + 1); //creates a new array from something that looks like an array.
    }

    const pages = [];

    pages.push(1); //users should always see the first page.

    if (current > 3) {
      pages.push("..."); // If current page is far from start, add dots
    }

  
    //Decide which pages to show around current page / Show current page / One page before / One page after
    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);

    // Adjust if we are at the very beginning (show 1, 2, 3, 4 , ... )
    if (current <= 3) {
      end = 4;
      start = 2;
    }

    // Adjust if we are at the very end (show ... 5, 6, 7, 8 )
    if (current >= total - 2) {
      start = total - 3;
      end = total - 1;
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < total) { // prevent add the first and the last page 
        pages.push(i);
      }
    }

    // If current page is far from end, add dots
    if (current < total - 2) {
      pages.push("...");
    }

    // Always add last page
    pages.push(total);

    return pages;
  };

  const pages = generateSmartPageNumbers(currentPage, totalPages);

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn control-btn"
        disabled={currentPage === 1} //Disabled on first page
        onClick={() => onPageChange(currentPage - 1)} //goes to previous page
        aria-label="Previous Page"
      >
        <i className="fas fa-chevron-left"></i>
      </button>

      <div className="pagination-numbers">
        {pages.map((page, index) => (
          <React.Fragment key={index}> {/*React.Fragment is a wrapper that lets you return multiple elements without adding an extra DOM node. [invisible container] */}
            {page === "..." ? ( // Inside .map(), you must return exactly ONE parent element.
              <span className="pagination-ellipsis">...</span>
            ) : (
              <button
                className={`pagination-btn number-btn ${
                  currentPage === page ? "active" : "" //Active page gets special styling
                }`}
                onClick={() => onPageChange(page)} //Clicking changes page
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        className="pagination-btn control-btn"
        disabled={currentPage === totalPages} //Disabled on last page
        onClick={() => onPageChange(currentPage + 1)} //goes to next page
        aria-label="Next Page"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
}
