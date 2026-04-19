import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingService } from '../../services/api';
import { getCategoryConfig, debounce } from '../../utils/helpers';
import './SearchBar.css';

export default function SearchBar({ className = '', placeholder = 'Search hotels, restaurants, activities…' }) {
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef(null);
  const wrapRef  = useRef(null);
  const navigate = useNavigate();

  const fetchResults = useCallback(
    debounce(async (q) => {
      if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
      setLoading(true);
      try {
        const { data } = await listingService.autocomplete(q);
        setResults(data.data || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 280),
    []
  );

  useEffect(() => { fetchResults(query); }, [query, fetchResults]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, -1)); }
    if (e.key === 'Enter') {
      if (highlighted >= 0 && results[highlighted]) {
        navigate(`/listings/${results[highlighted].slug}`);
        setOpen(false); setQuery('');
      } else {
        handleSearch();
      }
    }
    if (e.key === 'Escape') setOpen(false);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/listings?search=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  const cat = (c) => getCategoryConfig(c);

  return (
    <div className={`searchbar ${className}`} ref={wrapRef}>
      <div className="searchbar__input-wrap">
        <svg className="searchbar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="searchbar__input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setHighlighted(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length && setOpen(true)}
          autoComplete="off"
        />
        {loading && <span className="searchbar__spinner" />}
        {query && (
          <button className="searchbar__clear" onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus(); }}>×</button>
        )}
        <button className="searchbar__btn btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      {open && results.length > 0 && (
        <ul className="searchbar__dropdown">
          {results.map((r, i) => {
            const c = cat(r.category);
            return (
              <li key={r.id}
                className={`searchbar__result ${highlighted === i ? 'highlighted' : ''}`}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => { navigate(`/listings/${r.slug}`); setOpen(false); setQuery(''); }}>
                <div className="searchbar__result-img">
                  {r.cover_image
                    ? <img src={r.cover_image} alt={r.title} loading="lazy" />
                    : <span style={{ fontSize: 20 }}>{c.icon}</span>}
                </div>
                <div className="searchbar__result-info">
                  <strong>{r.title}</strong>
                  <span>{c.icon} {c.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
