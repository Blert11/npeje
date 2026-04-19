import { useState, useRef } from 'react';
import api from '../../services/api';
import './ImageUpload.css';

export default function ImageUpload({
  value,
  onChange,
  aspectRatio = '4/3',
  label,
  multiple = false,
  onMultiple,
}) {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState('');
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      if (multiple) {
        const form = new FormData();
        files.forEach(f => form.append('files', f));
        const { data } = await api.post('/upload/multiple', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (ev) => {
            if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
          },
        });
        onMultiple?.(data.data);
      } else {
        const form = new FormData();
        form.append('file', files[0]);
        const { data } = await api.post('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (ev) => {
            if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
          },
        });
        onChange?.(data.data.url);
      }
    } catch (err) {
      let msg = err.response?.data?.message || err.message || 'Upload failed';
      if (err.response?.status === 404) {
        msg = 'Upload endpoint missing. Check server.js has: app.use("/api/upload", uploadRouter)';
      }
      setError(msg);
      console.error('[ImageUpload]', err);
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.('');
  };

  return (
    <div className="image-upload">
      {label && <label className="form-label">{label}</label>}
      <div className={`image-upload__box ${value ? 'has-image' : ''}`}
        style={{ aspectRatio }}
        onClick={() => !uploading && inputRef.current?.click()}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFile}
          className="image-upload__input"
        />
        {value && !uploading && (
          <>
            <img src={resolveUrl(value)} alt="" className="image-upload__preview" />
            <button className="image-upload__remove" onClick={handleRemove} type="button" aria-label="Remove">×</button>
            <div className="image-upload__overlay"><span>Click to change</span></div>
          </>
        )}
        {!value && !uploading && (
          <div className="image-upload__empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{multiple ? 'Click to select images' : 'Click to upload image'}</span>
            <small>JPG, PNG, WebP — max 8MB</small>
          </div>
        )}
        {uploading && (
          <div className="image-upload__progress">
            <div className="image-upload__progress-bar" style={{ width: `${progress}%` }} />
            <span>{progress}%</span>
          </div>
        )}
      </div>
      {error && <div className="image-upload__error">{error}</div>}
    </div>
  );
}

export function resolveUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const backend = apiBase.replace(/\/api\/?$/, '');
  if (url.startsWith('/')) return backend + url;
  return backend + '/' + url;
}
