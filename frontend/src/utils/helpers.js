export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const formatNum = (n) =>
  typeof n === 'number' ? n.toLocaleString() : n;

export const truncate = (str, len = 120) =>
  str?.length > len ? str.slice(0, len) + '…' : str;

export const starsFromRating = (rating) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return {
    full:  Array.from({ length: full }),
    half:  Array.from({ length: half }),
    empty: Array.from({ length: empty }),
  };
};

// Categories — `iconName` matches keys in Icon.js
export const CATEGORIES = [
  { id: 'hotels',      iconName: 'hotels',      color: '#3b82f6' },
  { id: 'restaurants', iconName: 'restaurants', color: '#f97316' },
  { id: 'fast_food',   iconName: 'fast_food',   color: '#ef4444' },
  { id: 'cafes',       iconName: 'cafes',       color: '#a855f7' },
  { id: 'villas',      iconName: 'villas',      color: '#22c55e' },
  { id: 'activities',  iconName: 'activities',  color: '#ec4899' },
  { id: 'nightlife',   iconName: 'nightlife',   color: '#6366f1' },
  { id: 'transport',   iconName: 'transport',   color: '#14b8a6' },
  { id: 'shops',       iconName: 'shops',       color: '#f59e0b' },
];

export const getCategoryConfig = (id) =>
  CATEGORIES.find(c => c.id === id) || { iconName: 'map_pin', color: '#71717a' };

export const PRICE_LABELS = { 1: '€', 2: '€€', 3: '€€€', 4: '€€€€' };

export const directionsUrl = (lat, lng, title) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(title)}`;

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const isOpenNow = (openingHours) => {
  if (!openingHours || typeof openingHours !== 'object') return null;
  const days  = ['sun','mon','tue','wed','thu','fri','sat'];
  const now   = new Date();
  const today = days[now.getDay()];
  const hours = openingHours[today];
  if (!Array.isArray(hours) || hours.length !== 2) return false;

  const [openStr, closeStr] = hours;
  const [oh, om] = openStr.split(':').map(Number);
  const [ch, cm] = closeStr.split(':').map(Number);
  const nowMin   = now.getHours() * 60 + now.getMinutes();
  const openMin  = oh * 60 + om;
  let   closeMin = ch * 60 + cm;
  if (closeMin <= openMin) closeMin += 24 * 60;
  const adjusted = nowMin < openMin ? nowMin + 24 * 60 : nowMin;
  return adjusted >= openMin && adjusted < closeMin;
};

export const getOpenStatus = (openingHours) => {
  const open = isOpenNow(openingHours);
  if (open === null) return null;
  return open ? { label: 'open', className: 'open' }
              : { label: 'closed', className: 'closed' };
};
