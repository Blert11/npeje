import { useState, useRef } from 'react';
import api from '../../services/api';
import Icon from './Icon';
import './ImageUpload.css';

let idCounter = 0;

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

  // Unique ID per instance so <label for=...> works reliably
  const idRef = useRef(`iu-${++idCounter}`);

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
      // Reset so selecting the same file again still fires onChange
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.('');
  };

  // Use <label> pattern — NO onClick on the visual box. The input is
  // triggered ONLY by the label. This eliminates double-open entirely.
  return (
    <div className="image-upload">
      {label && <label className="form-label">{label}</label>}

      <input
        ref={inputRef}
        id={idRef.current}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFile}
        className="image-upload__input"
      />

      <label
        htmlFor={idRef.current}
        className={`image-upload__box ${value ? 'has-image' : ''} ${uploading ? 'uploading' : ''}`}
        style={{ aspectRatio }}
      >
        {value && !uploading && (
          <>
            <img src={resolveUrl(value)} alt="" className="image-upload__preview" />
            <button
              type="button"
              className="image-upload__remove"
              onClick={handleRemove}
              aria-label="Remove">
              <Icon name="close" size={16} />
            </button>
            <div className="image-upload__overlay">
              <Icon name="upload" size={20} />
              <span>Click to change</span>
            </div>
          </>
        )}

        {!value && !uploading && (
          <div className="image-upload__empty">
            <Icon name="image" size={32} strokeWidth={1.5} />
            <span>{multiple ? 'Click to select images' : 'Click to upload image'}</span>
            <small>JPG, PNG, WebP — max 8MB</small>
          </div>
        )}

        {uploading && (
          <div className="image-upload__progress">
            <div className="image-upload__progress-bar"
              style={{ width: `${progress}%` }} />
            <span>{progress}%</span>
          </div>
        )}
      </label>

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
