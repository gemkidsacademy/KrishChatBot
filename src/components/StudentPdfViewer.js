import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function StudentPdfViewer() {
  const [searchParams] = useSearchParams();

  const studentId = searchParams.get("student_id") || "";
  const fileId = searchParams.get("file_id") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const scrollToPdfViewer = () => {
  if (pdfViewerRef.current) {
    pdfViewerRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

  const server =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://krishbackend-production-9603.up.railway.app";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalPages, setTotalPages] = useState(null);
  const [pageInput, setPageInput] = useState(String(initialPage));

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchResultIndex, setCurrentSearchResultIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const pdfViewerRef = useRef(null);

  // Step 1: fetch total pages from backend
  useEffect(() => {
    async function fetchPdfMeta() {
      try {
        const res = await fetch(
          `${server}/student-pdf-meta?student_id=${encodeURIComponent(
            studentId
          )}&file_id=${encodeURIComponent(fileId)}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch PDF meta: ${res.status}`);
        }

        const data = await res.json();
        setTotalPages(data.total_pages || 1);

        // clamp current page once total pages are known
        setCurrentPage((prev) => {
          if (prev < 1) return 1;
          if (data.total_pages && prev > data.total_pages) return data.total_pages;
          return prev;
        });
      } catch (err) {
        console.error(err);
        setTotalPages(1);
      }
    }

    if (studentId && fileId) {
      fetchPdfMeta();
    }
  }, [studentId, fileId, server]);

  const imageUrl = useMemo(() => {
    return `${server}/student-pdf-page?student_id=${encodeURIComponent(
      studentId
    )}&file_id=${encodeURIComponent(fileId)}&page=${currentPage}`;
  }, [server, studentId, fileId, currentPage]);

  const goToPage = (pageNumber) => {
    if (!totalPages) return;

    let target = parseInt(pageNumber, 10);
    if (Number.isNaN(target)) return;

    if (target < 1) target = 1;
    if (target > totalPages) target = totalPages;

    setCurrentPage(target);
    setPageInput(String(target));

    // after changing page, bring the PDF viewer into view
    setTimeout(() => {
      scrollToPdfViewer();
    }, 100);
  };

  const handleSearch = async () => {
  const q = searchTerm.trim();
  if (!q) return;

  setHasSearched(true);
  setIsSearching(true);
  setSearchError("");
  setSearchResults([]);
  setCurrentSearchResultIndex(0);

  try {
    const res = await fetch(
      `${server}/student-pdf-search?student_id=${encodeURIComponent(
        studentId
      )}&file_id=${encodeURIComponent(fileId)}&query=${encodeURIComponent(q)}`
    );

    if (!res.ok) {
      throw new Error(`Search failed with status ${res.status}`);
    }

    const data = await res.json();
    const matches = Array.isArray(data.matches) ? data.matches : [];
    setSearchResults(matches);
    setCurrentSearchResultIndex(0);
  } catch (err) {
    console.error(err);
    setSearchError("Could not search this booklet.");
  } finally {
    setIsSearching(false);
  }
};

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };
  const currentSearchResult =
  searchResults.length > 0 ? searchResults[currentSearchResultIndex] : null;

const goToPreviousSearchResult = () => {
  if (searchResults.length === 0) return;
  setCurrentSearchResultIndex((prev) => Math.max(prev - 1, 0));
};

const goToNextSearchResult = () => {
  if (searchResults.length === 0) return;
  setCurrentSearchResultIndex((prev) =>
    Math.min(prev + 1, searchResults.length - 1)
  );
};

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f7f7f7",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
  <div
  style={{
    maxWidth: "1100px",
    margin: "0 auto",
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "24px",
    height: "calc(100vh - 48px)",
    overflowY: "auto",
    overflowX: "hidden",
    boxSizing: "border-box",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "20px",
      paddingBottom: "16px",
      borderBottom: "1px solid #e5e7eb",
    }}
  >
    <img
      src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
      alt="Gem Kids Academy"
      style={{
        width: "180px",
        height: "auto",
        display: "block",
      }}
    />
  </div>

        

      

        {/* Controls + Search */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "nowrap",
    marginBottom: "16px",
    width: "100%",
  }}
>
  <button
    onClick={() => goToPage(currentPage - 1)}
    disabled={currentPage <= 1}
    style={{
      padding: "10px 18px",
      border: "none",
      borderRadius: "8px",
      background: currentPage <= 1 ? "#9ca3af" : "#2563eb",
      color: "white",
      cursor: currentPage <= 1 ? "not-allowed" : "pointer",
    }}
  >
    Previous
  </button>

  <span style={{ fontWeight: 600, color: "#222" }}>
    Page {currentPage} of {totalPages ?? "..."}
  </span>

  <button
    onClick={() => goToPage(currentPage + 1)}
    disabled={!!totalPages && currentPage >= totalPages}
    style={{
      padding: "10px 18px",
      border: "none",
      borderRadius: "8px",
      background:
        totalPages && currentPage >= totalPages ? "#9ca3af" : "#2563eb",
      color: "white",
      cursor:
        totalPages && currentPage >= totalPages ? "not-allowed" : "pointer",
    }}
  >
    Next
  </button>

  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginLeft: "auto",
    flexWrap: "nowrap",
    whiteSpace: "nowrap",
  }}
>
    <label htmlFor="pageInput">
      <b>Go to page:</b>
    </label>
    <input
      id="pageInput"
      type="number"
      min="1"
      max={totalPages || 1}
      value={pageInput}
      onChange={(e) => setPageInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          goToPage(pageInput);
        }
      }}
      style={{
        width: "90px",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        fontSize: "14px",
      }}
    />
    <button
      onClick={() => goToPage(pageInput)}
      style={{
        padding: "10px 16px",
        border: "none",
        borderRadius: "8px",
        background: "#16a34a",
        color: "white",
        cursor: "pointer",
      }}
    >
      Go
    </button>

    <input
      type="text"
      placeholder="Search text..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={handleSearchKeyDown}
      style={{
        width: "240px",
        padding: "10px 12px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        fontSize: "14px",
      }}
    />

    <button
      onClick={handleSearch}
      disabled={isSearching}
      style={{
        padding: "10px 16px",
        border: "none",
        borderRadius: "8px",
        background: "#f97316",
        color: "white",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {isSearching ? "Searching..." : "Search"}
    </button>
    


    
  </div>
</div>
{currentSearchResult && (
  <div
    style={{
      marginBottom: "16px",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "16px",
      background: "#fff",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "12px",
      }}
    >
      <div style={{ fontWeight: 700, color: "#111827" }}>
        Result {currentSearchResultIndex + 1} of {searchResults.length}
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={goToPreviousSearchResult}
          disabled={currentSearchResultIndex === 0}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: "8px",
            background:
              currentSearchResultIndex === 0 ? "#9ca3af" : "#2563eb",
            color: "white",
            cursor:
              currentSearchResultIndex === 0 ? "not-allowed" : "pointer",
          }}
        >
          Previous result
        </button>

        <button
          onClick={goToNextSearchResult}
          disabled={currentSearchResultIndex === searchResults.length - 1}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: "8px",
            background:
              currentSearchResultIndex === searchResults.length - 1
                ? "#9ca3af"
                : "#2563eb",
            color: "white",
            cursor:
              currentSearchResultIndex === searchResults.length - 1
                ? "not-allowed"
                : "pointer",
          }}
        >
          Next result
        </button>

        <button
          onClick={() => {
            goToPage(currentSearchResult.page);
            setSearchResults([]);
          }}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: "8px",
            background: "#16a34a",
            color: "white",
            cursor: "pointer",
          }}
        >
          Open page {currentSearchResult.page}
        </button>
      </div>
    </div>

    <div style={{ fontWeight: 700, marginBottom: "8px" }}>
      Page {currentSearchResult.page}
    </div>

    <div style={{ color: "#374151", lineHeight: 1.6, fontSize: "14px" }}>
      {currentSearchResult.snippet}
    </div>
  </div>
)}
{searchError && (
  <div style={{ color: "#dc2626", marginBottom: "12px" }}>
    {searchError}
  </div>
)}



{hasSearched &&
  searchResults.length === 0 &&
  !isSearching &&
  !searchError && (
    <div style={{ color: "#6b7280", marginBottom: "16px" }}>
      No matches found.
    </div>
  )}
        {/* Page image */}
        <div
          ref={pdfViewerRef}
          style={{
            marginTop: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
            overflowX: "auto",
            padding: "4px",
          }}
        >
          <img
            src={imageUrl}
            alt={`Booklet page ${currentPage}`}
            style={{
              display: "block",
              maxWidth: "100%",
              width: "auto",
              height: "auto",
              margin: "0 auto",
            }}
          />
        </div>
      </div>
    </div>
  );
}