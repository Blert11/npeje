import { useState } from 'react';
import './OpeningHoursEditor.css';

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export default function OpeningHoursEditor({ value, onChange }) {
  // value is an object like { mon: ["09:00","23:00"], tue: null, ... }
  const hours = value || {};

  const setDay = (key, open, close) => {
    const next = { ...hours };
    if (open && close) {
      next[key] = [open, close];
    } else {
      delete next[key];
    }
    onChange(next);
  };

  const toggleDay = (key) => {
    const next = { ...hours };
    if (next[key]) {
      delete next[key];
    } else {
      next[key] = ['09:00', '22:00'];
    }
    onChange(next);
  };

  const copyToAll = (key) => {
    if (!hours[key]) return;
    const next = {};
    DAYS.forEach(d => { next[d.key] = [...hours[key]]; });
    onChange(next);
  };

  return (
    <div className="oh-editor">
      {DAYS.map(({ key, label }) => {
        const isOpen = !!hours[key];
        const [open, close] = hours[key] || ['09:00', '22:00'];
        return (
          <div key={key} className={`oh-row ${isOpen ? '' : 'oh-row--closed'}`}>
            <label className="oh-row__toggle">
              <input type="checkbox" checked={isOpen}
                onChange={() => toggleDay(key)} />
              <span className="oh-row__day">{label}</span>
            </label>
            {isOpen ? (
              <div className="oh-row__times">
                <input type="time" value={open}
                  onChange={(e) => setDay(key, e.target.value, close)} />
                <span>—</span>
                <input type="time" value={close}
                  onChange={(e) => setDay(key, open, e.target.value)} />
                <button type="button" className="oh-row__copy"
                  onClick={() => copyToAll(key)}
                  title="Copy to all days">
                  ↓ All
                </button>
              </div>
            ) : (
              <span className="oh-row__closed-label">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
