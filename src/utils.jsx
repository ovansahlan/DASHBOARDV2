// src/utils.jsx

export const cleanNumber = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  let str = String(val).trim().replace(/[▲▼%\s]/g, ''); 
  if (!str) return 0;
  const commaCount = (str.match(/,/g) || []).length;
  const dotCount = (str.match(/\./g) || []).length;
  
  if (commaCount > 0 && dotCount > 0) {
     if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
         str = str.replace(/\./g, '').replace(',', '.');
     } else {
         str = str.replace(/,/g, '');
     }
  } else if (commaCount > 0) {
     if (commaCount > 1) {
         str = str.replace(/,/g, ''); 
     } else {
         const parts = str.split(',');
         if (parts[1] && parts[1].length === 3) {
             str = str.replace(',', ''); 
         } else {
             str = str.replace(',', '.'); 
         }
     }
  } else if (dotCount > 0) {
     if (dotCount > 1) {
         str = str.replace(/\./g, ''); 
     } else {
         const parts = str.split('.');
         if (parts[1] && parts[1].length === 3) {
             str = str.replace(/\./g, ''); 
         } 
     }
  }
  str = str.replace(/[^0-9.-]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

export const formatCurrency = (val) => {
  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(2)}B`;
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}K`;
  return `Rp ${val}`;
};

export const formatMonth = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
};

export const COLORS = {
  primary: '#00B14F',   
  growth: '#0ea5e9',    
  decline: '#ef4444',   
  finance: '#f59e0b',   
  lastMonth: '#fb923c', 
  white: '#ffffff',
  slate900: '#0f172a',
  slate500: '#64748b',
  netSales: '#10b981', 
  basketSize: '#3b82f6' 
};

export const getMerchantSegment = (campaignsStr) => {
  const c = campaignsStr ? String(campaignsStr).trim().toLowerCase() : '';
  if (!c || c === '-' || c === '0' || c.includes('no campaign')) return '0 Invest';
  
  const camps = c.split(/[|,]/).map(x => x.trim()).filter(Boolean);
  let hasGMS = false, hasBoosterPlus = false, hasLocal = false;
  
  camps.forEach(camp => {
    if (camp.includes('gms')) hasGMS = true;
    else if (camp.includes('booster+')) hasBoosterPlus = true;
    else hasLocal = true;
  });
  
  if (hasBoosterPlus) return 'Booster+';
  if (hasGMS && hasLocal) return 'GMS & Local';
  if (hasGMS && !hasLocal) return 'GMS Only';
  return 'Local Only';
};

const DB_NAME = 'AmDashboardDB';
const STORE_NAME = 'merchantsStore';
const DB_VERSION = 1;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (e) => reject(e.target.error);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveToIndexedDB = async (key, data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, key);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
};

export const loadFromIndexedDB = async (key) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const STRATEGY = {
  'normal': { k: 20, v: 0, tiers: null, title: 'NORMAL', benefits: ['Margin Aman 100%', 'Kestabilan Brand Jangka Panjang'] },
  'puas-cuan': { k: 32, v: 30, tiers: { hemat: { max: 45000, min: 15000 }, ekstra: { max: 80000, min: 35000 } }, title: 'CUAN 32%', benefits: ['Diskon Didukung Grab', 'Volume Penjualan Meningkat Drastis'] },
  'booster': { k: 38, v: 35, tiers: { hemat: { max: 55000, min: 15000 }, ekstra: { max: 100000, min: 35000 } }, title: 'BOOSTER 38%', benefits: ['Prioritas Pencarian Utama', 'Slot Banner Flash Sale Eksklusif'] },
  'cofund': { k: 20, v: 40, tiers: null, title: 'COFUND', benefits: ['Sharing Cost Promo', 'Akses ke Pengguna Baru'] }
};

export const VOUCHERS = [
  { code: 'PUAS30', scheme: 'puas-cuan', label: 'Diskon Puas 30%', desc: 'Potongan 30%', disc: 30 },
  { code: 'PUAS35', scheme: 'booster', label: 'Diskon Puas 35%', desc: 'Potongan 35%', disc: 35 },
  { code: 'MITRA50', scheme: 'cofund', label: 'Diskon 40% (Patungan)', desc: 'Sharing Cost', disc: 40 }
];

export const METRICS_GUIDE = [
  { metric: "CTR (Click-Through Rate)", rows: [ { status: "Buruk", range: "< 1%", desc: "Daya tarik visual rendah.", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" }, { status: "Sehat", range: "1.5% - 2.5%", desc: "Cukup relevan.", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" }, { status: "Ideal", range: "> 3.5%", desc: "Sangat Menarik.", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" } ] },
  { metric: "CVR (Conversion Rate)", rows: [ { status: "Buruk", range: "< 5%", desc: "Ada hambatan di menu.", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" }, { status: "Sehat", range: "8% - 12%", desc: "Menu meyakinkan.", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" }, { status: "Ideal", range: "> 15%", desc: "Promo dalam toko sangat efektif.", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" } ] },
  { metric: "ROAS (Return on Ad Spend)", rows: [ { status: "Buruk", range: "< 2.5x", desc: "Bakar duit. Pendapatan tidak cukup menutupi biaya.", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" }, { status: "Sehat", range: "4x - 6x", desc: "Operasional aman.", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" }, { status: "Ideal", range: "> 8x", desc: "Sangat Profitabel.", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" } ] }
];

export const fNum = (n) => Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const pNum = (n) => typeof n === 'number' ? n : parseFloat((n||'').toString().replace(/[^0-9]/g, '')) || 0;
export const pFloat = (n) => typeof n === 'number' ? n : parseFloat((n||'').toString().replace(/,/g, '.').replace(/[^0-9.]/g, '')) || 0;
