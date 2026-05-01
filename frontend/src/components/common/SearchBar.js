import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingService } from '../../services/api';
import { getCategoryConfig, debounce } from '../../utils/helpers';
import { resolveUrl } from './ImageUpload';
import Icon from './Icon';
import './SearchBar.css';

export default function SearchBar({ className = '', placeholder = 'Search…' }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const [highlighted, setHl]  = useState(-1);
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

  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHl(h => Math.min(h + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHl(h => Math.max(h - 1, -1)); }
    if (e.key === 'Enter') {
      if (highlighted >= 0 && results[highlighted]) {
        navigate(`/listings/${results[highlighted].slug}`);
        setOpen(false); setQuery('');
      } else { handleSearch(); }
    }
    if (e.key === 'Escape') setOpen(false);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/listings?search=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  return (
    <div
      className={`searchbar ${open ? 'searchbar--open' : ''} ${className}`}
      ref={wrapRef}>
      <div className="searchbar__input-wrap">
        <Icon name="search" size={18} className="searchbar__icon" />
        <input
          ref={inputRef}
          type="text"
          className="searchbar__input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setHl(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length && setOpen(true)}
          autoComplete="off"
        />
        {loading && <span className="searchbar__spinner" />}
        {query && (
          <button type="button" className="searchbar__clear"
            onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus(); }}>
            <Icon name="close" size={14} />
          </button>
        )}
        <button type="button" className="searchbar__btn" onClick={handleSearch}>Search</button>
      </div>

      {open && results.length > 0 && (
        <ul className="searchbar__dropdown">
          {results.map((r, i) => {
            const c = getCategoryConfig(r.category);
            return (
              <li key={r.id}
                className={`searchbar__result ${highlighted === i ? 'highlighted' : ''}`}
                onMouseEnter={() => setHl(i)}
                onClick={() => { navigate(`/listings/${r.slug}`); setOpen(false); setQuery(''); }}>
                <div className="searchbar__result-img">
                  {r.cover_image
                    ? <img src={resolveUrl(r.cover_image)} alt={r.title} loading="lazy" />
                    : <Icon name={c.iconName} size={20} style={{ color: c.color }} />}
                </div>
                <div className="searchbar__result-info">
                  <strong>{r.title}</strong>
                  <span><Icon name={c.iconName} size={12} style={{ color: c.color }} /> {r.category.replace('_',' ')}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
