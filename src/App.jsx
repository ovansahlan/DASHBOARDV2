// src/App.jsx
import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  ComposedChart, Line, Cell, Area, PieChart, Pie, LabelList
} from 'recharts';
import { 
  UploadCloud, TrendingUp, Database, Filter, Megaphone,
  Search, CheckCircle, AlertCircle, DollarSign, Activity, X,
  Store, ArrowUpRight, ArrowDownRight, Users, Info, ArrowLeft, Zap, MapPin, Phone, Smartphone, Mail, Award, LayoutDashboard, Table, Target, Percent, ExternalLink, Calculator,
  RefreshCw, FileText, MessageCircle, Clock, BarChart2, ShoppingBag, ShoppingCart
} from 'lucide-react';

// Import fungsi dan data dari file utils
import {
  cleanNumber, formatCurrency, formatMonth, COLORS, getMerchantSegment,
  saveToIndexedDB, loadFromIndexedDB, fNum
} from './utils';

// Import komponen Merchant Simulator
import MerchantSimulator from './components/MerchantSimulator';

export default function App() {
  const [data, setData] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isForceUpload, setIsForceUpload] = useState(false);
  const [globalLastUpdate, setGlobalLastUpdate] = useState('');
  
  const [fileMaster, setFileMaster] = useState(null);
  const [fileHistory, setFileHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMex, setSelectedMex] = useState(null);
  
  const [selectedAM, setSelectedAM] = useState('All'); 
  const [selectedPriority, setSelectedPriority] = useState('All');
  
  const [activeTab, setActiveTab] = useState('overview'); 
  const [activeSegmentModal, setActiveSegmentModal] = useState(null);
  const [showWaModal, setShowWaModal] = useState(false);
  const [showMcaModal, setShowMcaModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const [showMiModal, setShowMiModal] = useState(false);
  const [showOutletsModal, setShowOutletsModal] = useState(false);
  const [showAdsModal, setShowAdsModal] = useState(false);
  const [outletModalTab, setOutletModalTab] = useState('inactive'); 
  
  const [compareMonths, setCompareMonths] = useState(['', '', '']);

  // --- LOGIKA TEMPLATE WHATSAPP ---
  const handleSendWA = (templateType) => {
      if (!selectedMex || !selectedMex.phone) return;
      
      const phone = selectedMex.phone.replace(/\D/g, ''); 
      const owner = selectedMex.ownerName !== '-' ? selectedMex.ownerName : 'Mitra Grab';
      
      const amFull = (selectedMex.amName || 'AM').trim();
      const amFullLower = amFull.toLowerCase();
      
      let amShort = amFull.split(' ')[0]; 

      if (amFullLower.includes('novan')) {
          amShort = 'Novan';
      } else if (amFullLower.includes('reginaldo') || amFullLower.includes('aldo')) {
          amShort = 'Aldo';
      } else if (amFullLower.includes('dadan')) {
          amShort = 'Dadan';
      } else if (amFullLower.includes('hikam')) {
          amShort = 'Hikam';
      }

      const mexName = selectedMex.name;
      
      let mcaLimit = '';
      if (selectedMex.mcaWlLimit >= 1000000) {
          const valJuta = selectedMex.mcaWlLimit / 1000000;
          mcaLimit = `Rp ${Number.isInteger(valJuta) ? valJuta : valJuta.toFixed(1).replace('.', ',')} Juta`;
      } else {
          mcaLimit = `Rp ${fNum(selectedMex.mcaWlLimit)}`;
      }

      let templates = [];

      switch(templateType) {
          case 'promo':
              templates = [
                  `Halo kak ${owner}! Saya ${amShort} dari Grab.\n\nAda program Promo spesial nih yang pas banget buat naikin orderan di *${mexName}*. Boleh kita bahas via telpon kak?`,
                  `Selamat pagi/siang kak ${owner}, saya ${amShort} (Grab).\n\nKhusus untuk *${mexName}*, kita ada kuota promo eksklusif loh. Mau saya bantu jelaskan detailnya?`,
                  `Halo kak ${owner}, dengan ${amShort} dari Grab.\n\nYuk boost lagi penjualan *${mexName}* pakai promo terbaru dari Grab! Kalau kakak berminat, boleh kita ngobrol sebentar?`,
                  `Permisi kak ${owner}! Saya ${amShort} (Grab).\n\nSayang banget nih kalau *${mexName}* kelewatan campaign promo bulan ini. Ada waktu luang buat saya jelasin untungnya kak?`,
                  `Halo kak ${owner}! ${amShort} dari Grab.\n\nMau nawarin join promo nih buat *${mexName}* biar makin ramai pembeli. Bisa telpon sebentar untuk detailnya kak?`
              ];
              break;
          case 'mca':
              templates = [
                  `Halo kak ${owner}!\nSaya ${amShort} dari Grab.\n\nRamadan dan Lebaran sering menjadi periode dengan potensi peningkatan penjualan.\n\nUntuk mendukung kesiapan usaha *${mexName}* di momen ini, tersedia program *Grab Modal Mantul* dengan detail:\n- Estimasi pendanaan hingga *${mcaLimit}*\n- Penyesuaian dengan evaluasi dan ketentuan yang berlaku.\n\nSilakan cek detail penawaran yang tersedia melalui aplikasi GrabMerchant ya kak!`,
                  `Halo kak ${owner}!\nDengan ${amShort} dari Grab.\n\nMemasuki bulan Ramadan hingga Lebaran, banyak usaha mempersiapkan tambahan stok dan operasional.\n\nSaat ini tersedia program *Grab Modal Mantul* untuk *${mexName}* dengan:\n- Limit hingga *${mcaLimit}*\n- Menyesuaikan profil mitra.\n\nInformasi lengkap dapat dilihat langsung di aplikasi GrabMerchant ya kak.`,
                  `Selamat siang kak ${owner}!\nSaya ${amShort} dari Grab.\n\nPeriode Ramadan dan Lebaran dapat menjadi momentum pertumbuhan usaha.\n\nUntuk mendukung kebutuhan *${mexName}*, tersedia program *Grab Modal Mantul*:\n- Estimasi pendanaan hingga *${mcaLimit}*\n- Nominal mengikuti hasil evaluasi sistem.\n\nSilakan cek ketersediaannya di aplikasi GrabMerchant sekarang juga.`,
                  `Halo kak ${owner},\nSaya ${amShort} (Grab).\n\nMenjelang Lebaran, kesiapan stok dan kelancaran operasional *${mexName}* menjadi hal penting untuk mengoptimalkan peluang penjualan.\n\nProgram *Grab Modal Mantul* menyediakan opsi tambahan modal:\n- Hingga *${mcaLimit}* (sesuai ketentuan yang berlaku).\n\nSilakan cek detail penawaran melalui aplikasi GrabMerchant ya kak.`,
                  `Halo kak ${owner},\n${amShort} dari Grab di sini.\n\nRamadan hingga Lebaran sering menjadi periode dengan aktivitas penjualan yang lebih tinggi.\n\nUntuk mendukung kelancaran usaha *${mexName}*, tersedia program *Grab Modal Mantul* dengan:\n- Estimasi pendanaan hingga *${mcaLimit}*\n\nSilakan melihat informasi lengkapnya langsung di aplikasi GrabMerchant kak.`
              ];
              break;
          case 'inactive':
              templates = [
                  `Halo kak ${owner}! Saya ${amShort} dari Grab.\n\nSaya cek *${mexName}* lagi offline nih. Apakah ada kendala operasional atau di aplikasinya kak? Biar saya bantu.`,
                  `Selamat siang kak ${owner}, saya ${amShort} (Grab).\n\nNotis *${mexName}* belum aktif nih kak. Kalau ada masalah sama device/aplikasi, kabarin saya ya.`,
                  `Halo kak ${owner}, dengan ${amShort} dari Grab.\n\nSayang banget pesanan berpotensi miss karena *${mexName}* lagi offline. Ada yang bisa saya bantu supaya toko online lagi kak?`,
                  `Permisi kak ${owner}, saya ${amShort} dari Grab.\n\n*${mexName}* statusnya offline terus nih belakangan ini. Apakah tokonya sedang libur atau ada kendala teknis kak?`,
                  `Halo kak ${owner}! ${amShort} dari Grab.\n\nMau make sure aja, *${mexName}* lagi offline karena kendala resto/aplikasi nggak ya? Kalau butuh bantuan, saya siap support kak.`
              ];
              break;
          default:
              templates = [
                  `Halo kak ${owner}, saya ${amShort} dari Grab.\n\nBoleh minta waktunya sebentar untuk ngobrolin performa *${mexName}* belakangan ini?`,
                  `Selamat siang kak ${owner}! Saya ${amShort} (AM Grab).\n\nIngin diskusi sedikit tentang penjualan *${mexName}*. Kapan sekiranya kakak ada waktu luang?`,
                  `Halo kak ${owner}, dengan ${amShort} dari Grab.\n\nSaya lihat ada potensi nih untuk *${mexName}*, boleh kita telepon sebentar kak?`,
                  `Permisi kak ${owner}, saya ${amShort} (Grab).\n\nMau update seputar performa toko *${mexName}* nih kak, apakah berkenan untuk telpon hari ini?`,
                  `Halo kak ${owner}! ${amShort} dari Grab di sini.\n\nSaya mau share insight performa *${mexName}* bulan ini. Enaknya kita diskusi jam berapa ya kak?`
              ];
      }

      const randomText = templates[Math.floor(Math.random() * templates.length)];
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(randomText)}`, '_blank');
      setShowWaModal(false);
  };

  // --- MEMUAT DATA DARI LOCAL STORAGE (INDEXEDDB) ---
  useEffect(() => {
    const loadLocalData = async () => {
        try {
            const saved = await loadFromIndexedDB('am_dashboard_data');
            if (saved && saved.length > 0) {
                saved.sort((a, b) => a.name.localeCompare(b.name));
                setData(saved);
                setIsForceUpload(false);
                
                const savedUpdate = localStorage.getItem('am_dashboard_last_update');
                if (savedUpdate) setGlobalLastUpdate(savedUpdate);
            }
        } catch (e) {
            console.error("Gagal memuat data lokal", e);
        }
        setIsInitializing(false);
    };
    loadLocalData();
  }, []);

  // --- SIMPAN KE LOCAL STORAGE ---
  const saveToLocal = async (finalData) => {
      setLoading(true);
      try {
          await new Promise(resolve => setTimeout(resolve, 500));
          await saveToIndexedDB('am_dashboard_data', finalData);
          setData(finalData);
          setIsForceUpload(false);
      } catch (e) {
          setErrorMsg("Gagal menyimpan data (File terlalu besar/Error): " + e.message);
      }
      setLoading(false);
  };

  // --- PARSERS ---
  const parseCSVString = (str) => {
    const firstLine = str.split('\n')[0] || '';
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ';' : ',';

    const arr = []; let quote = false; let row = 0, col = 0;
    for (let c = 0; c < str.length; c++) {
      let cc = str[c], nc = str[c+1];
      arr[row] = arr[row] || []; arr[row][col] = arr[row][col] || '';
      if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
      if (cc === '"') { quote = !quote; continue; }
      if (cc === delimiter && !quote) { ++col; continue; }
      if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }
      if ((cc === '\n' || cc === '\r') && !quote) { ++row; col = 0; continue; }
      arr[row][col] += cc;
    }
    return arr;
  };

  const parseAndSave = async (masterText, histText) => {
    try {
        const masterLines = parseCSVString(masterText);
        
        const firstRow = masterLines[0] || [];
        let extractedDate = '';
        let extractedMonth = '';
        if (String(firstRow[45]).trim().toUpperCase() === 'MTD') {
            extractedDate = String(firstRow[46]).trim(); 
            extractedMonth = String(firstRow[47]).trim(); 
        } else {
            const fallbackIdx = firstRow.lastIndexOf('MTD');
            if (fallbackIdx !== -1) {
                extractedDate = String(firstRow[fallbackIdx + 1]).trim();
                extractedMonth = String(firstRow[fallbackIdx + 2]).trim();
            }
        }
        
        if (extractedDate) {
            const updateStr = `${extractedDate} ${extractedMonth || 'Feb'}`.trim();
            localStorage.setItem('am_dashboard_last_update', updateStr);
            setGlobalLastUpdate(updateStr);
        }
        
        let masterHeaderIdx = -1; let masterRawHeaders = [];
        for (let i = 0; i < Math.min(20, masterLines.length); i++) {
          const test = (masterLines[i] || []).map(h => h ? String(h).trim().replace(/[\r\n]+/g, ' ') : '');
          if (test.includes('Mex ID')) { masterRawHeaders = test; masterHeaderIdx = i; break; }
        }

        if (masterHeaderIdx === -1) throw new Error("Kolom 'Mex ID' tidak ditemukan di data Master Outlet."); 

        const masterHeaders = []; const mCounts = {};
        masterRawHeaders.forEach(h => {
          if (!h) { masterHeaders.push(''); return; }
          if (mCounts[h]) { masterHeaders.push(`${h}.${mCounts[h]}`); mCounts[h]++; }
          else { masterHeaders.push(h); mCounts[h] = 1; }
        });

        const mIdx = masterHeaders.indexOf('Mex ID');
        const mtdBIdx = masterHeaders.findIndex(h => h.includes('MTD (BS)') || h.includes('MTD\n(BS)'));
        const lmBIdx = mtdBIdx > 0 ? mtdBIdx - 1 : -1;
        const mtdAIdx = masterHeaders.findIndex(h => h.includes('Total MTD (Ads)') || h.includes('Total MTD\n(Ads)'));
        const lmAIdx = mtdAIdx > 0 ? mtdAIdx - 1 : -1;
        
        const mtdMiIdx = masterHeaders.findIndex(h => h.includes('MTD (MI)') || h.includes('MTD\n(MI)'));
        const lmMiIdx = mtdMiIdx > 0 ? mtdMiIdx - 1 : -1;

        const prioHeader = masterHeaders.find(h => {
            const lh = h.toLowerCase();
            return lh.includes('priority') || lh.includes('prio') || lh.includes('framework');
        });

        const pointHeader = masterHeaders.find(h => {
            const lh = h.toLowerCase();
            return lh.includes('total point') || lh.includes('point');
        });

        let parsedDataMap = new Map();

        for (let i = masterHeaderIdx + 1; i < masterLines.length; i++) {
          const vals = masterLines[i];
          if (!vals || !vals[mIdx] || vals[mIdx].toLowerCase() === 'mex id') continue;
          let obj = {};
          masterHeaders.forEach((h, idx) => { if(h) obj[h] = vals[idx] !== undefined ? String(vals[idx]).trim() : ''; });
          
          const mexId = obj['Mex ID'];
          let prioVal = (prioHeader && obj[prioHeader]) ? String(obj[prioHeader]).trim() : '-';
          if (!prioVal || prioVal === '') prioVal = '-';
          
          const lmBsVal = cleanNumber(vals[lmBIdx]);
          const mtdBsVal = cleanNumber(obj['MTD (BS)'] || obj['MTD\n(BS)']);
          const rrBsVal = cleanNumber(obj['RR (BS)'] || obj['RR\n(BS)']);
          
          let calcRrVsLm = 0;
          if (lmBsVal > 0) {
              calcRrVsLm = ((rrBsVal - lmBsVal) / lmBsVal) * 100;
          } else if (rrBsVal > 0) {
              calcRrVsLm = 100;
          }
          
          const lmMiVal = cleanNumber(vals[lmMiIdx]);
          const mtdMiVal = cleanNumber(obj['MTD (MI)'] || obj['MTD\n(MI)']);
          const rrMiVal = cleanNumber(obj['RR (MI)'] || obj['RR\n(MI)']);
          
          parsedDataMap.set(mexId, {
            id: mexId,
            name: obj['Mex Name'],
            amName: obj['AM Name'] || 'Unassigned',
            ownerName: vals[10] !== undefined && String(vals[10]).trim() !== '' ? String(vals[10]).trim() : '-',
            lmBs: lmBsVal,
            mtdBs: mtdBsVal,
            rrBs: rrBsVal,
            rrVsLm: calcRrVsLm,
            lmMi: lmMiVal,
            mtdMi: mtdMiVal,
            rrMi: rrMiVal,
            adsLM: cleanNumber(vals[lmAIdx]),
            adsTotal: cleanNumber(obj['Total MTD (Ads)'] || obj['Total MTD\n(Ads)']),
            adsRR: cleanNumber(obj['RR (Ads)']),
            adsMob: cleanNumber(obj['Ads Mobile'] || obj['Ads mobile'] || obj['MTD Ads Mobile'] || obj['Ads Mob']),
            adsWeb: cleanNumber(obj['Ads Web'] || obj['Ads web'] || obj['MTD Ads Web']),
            adsDir: cleanNumber(obj['Ads Direct'] || obj['Ads direct'] || obj['MTD Ads Direct'] || obj['Ads Dir']),
            mcaAmount: cleanNumber(obj['MCA Amount']),
            mcaWlLimit: cleanNumber(obj['MCA WL']),
            mcaWlClass: obj['MCA WL Classification'] || '-Not in WL',
            mcaPriority: prioVal,
            mcaDropOff: obj['Drop Off Screen'] && String(obj['Drop Off Screen']).trim().toUpperCase() !== 'FALSE' ? String(obj['Drop Off Screen']).trim() : '-',
            mcaDisburseStatus: obj['Disburse Status'] || '',
            disbursedDate: obj['Disbursed date'],
            zeusStatus: obj['Zeus'],
            joinDate: obj['Join Date'],
            campaigns: obj['Campaign'] || '',
            commission: obj['Base Commission'],
            city: obj['City Mex'],
            address: obj['Adress'] || obj['Address'],
            phone: obj['Phone zeus'],
            email: obj['Email zeus'],
            latitude: obj['Latitude'] || obj['Lat'] || (vals[14] !== undefined ? String(vals[14]).trim() : ''), 
            longitude: obj['Longitude'] || obj['Long'] || obj['Lng'] || (vals[15] !== undefined ? String(vals[15]).trim() : ''),
            lastUpdate: '', 
            campaignPoint: cleanNumber(pointHeader ? obj[pointHeader] : 0), 
            history: [] 
          });
        }

        if (histText) {
            const histLines = parseCSVString(histText);
            const histHeaders = (histLines[0] || []).map(h => h ? String(h).trim() : '');
            
            const hMexIdx = histHeaders.indexOf('merchant_id');
            const hMonthIdx = histHeaders.indexOf('first_day_of_month');
            const hBsIdx = histHeaders.indexOf('basket_size');
            const hTotalOrdersIdx = histHeaders.indexOf('total_orders');
            const hCompletedOrdersIdx = histHeaders.indexOf('completed_orders');
            const hPromoOrdersIdx = histHeaders.indexOf('orders_with_promo_mfp_gms');
            const hAovIdx = histHeaders.indexOf('aov');
            const hMfcIdx = histHeaders.indexOf('mfc_mex_spend');
            const hMfpIdx = histHeaders.indexOf('mfp_mex_spend');
            const hCpoIdx = histHeaders.indexOf('cpo');
            const hGmsIdx = histHeaders.indexOf('gms');
            const hCommIdx = histHeaders.indexOf('basic_commission');
            const hAdsWebIdx = histHeaders.indexOf('ads_web');
            const hAdsMobIdx = histHeaders.indexOf('ads_mobile');
            const hAdsDirIdx = histHeaders.indexOf('ads_direct');

            if (hMexIdx !== -1 && hMonthIdx !== -1) {
                for (let i = 1; i < histLines.length; i++) {
                    const vals = histLines[i];
                    if (!vals || !vals[hMexIdx]) continue;
                    const mexId = String(vals[hMexIdx]).trim();
                    
                    if (parsedDataMap.has(mexId)) {
                        if (vals[0] && String(vals[0]).trim() !== '') {
                            parsedDataMap.get(mexId).lastUpdate = String(vals[0]).trim();
                        }
                        
                        const baseBs = cleanNumber(vals[hBsIdx]);
                        const totalOrders = cleanNumber(vals[hTotalOrdersIdx]);
                        const completedOrders = hCompletedOrdersIdx !== -1 ? cleanNumber(vals[hCompletedOrdersIdx]) : totalOrders;
                        const promoOrders = cleanNumber(vals[hPromoOrdersIdx]);
                        const promoPct = totalOrders > 0 ? ((promoOrders / totalOrders) * 100).toFixed(1) : 0;
                        
                        const mfc = cleanNumber(vals[hMfcIdx]);
                        const mfp = cleanNumber(vals[hMfpIdx]);
                        const cpoVal = cleanNumber(vals[hCpoIdx]);
                        const gmsVal = cleanNumber(vals[hGmsIdx]);
                        const basicComm = cleanNumber(vals[hCommIdx]);
                        const adsWeb = cleanNumber(vals[hAdsWebIdx]);
                        const adsMob = cleanNumber(vals[hAdsMobIdx]);
                        const adsDir = cleanNumber(vals[hAdsDirIdx]);
                        const adsTotalHist = adsWeb + adsMob + adsDir;
                        
                        const totalInvestment = mfc + mfp + cpoVal + gmsVal + basicComm + adsTotalHist;
                        const netSales = baseBs - totalInvestment;
                        const miPercentage = baseBs > 0 ? ((totalInvestment / baseBs) * 100).toFixed(1) : 0;

                        parsedDataMap.get(mexId).history.push({
                            month: vals[hMonthIdx],
                            basket_size: baseBs,
                            net_sales: netSales,
                            total_orders: totalOrders,
                            completed_orders: completedOrders,
                            orders_with_promo: promoOrders,
                            promo_order_pct: parseFloat(promoPct),
                            aov: cleanNumber(vals[hAovIdx]),
                            mfc: mfc,
                            mfp: mfp,
                            cpo: cpoVal,
                            gms: gmsVal,
                            basic_commission: basicComm,
                            ads_total_hist: adsTotalHist,
                            mi_percentage: parseFloat(miPercentage),
                            total_investment: totalInvestment
                        });
                    }
                }
            }
        }

        const finalData = Array.from(parsedDataMap.values()).map(merchant => {
            if (merchant.history.length > 0) merchant.history.sort((a, b) => new Date(a.month) - new Date(b.month));
            return merchant;
        });

        await saveToLocal(finalData);

    } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Gagal memproses data. Pastikan format benar.");
        setLoading(false);
    }
  };

  const handleProcessFiles = async () => {
    setLoading(true); setErrorMsg('');
    try {
        const masterText = await fileMaster.text();
        let histText = null;
        if (fileHistory) {
            histText = await fileHistory.text();
        }
        await parseAndSave(masterText, histText);
    } catch (err) {
        setErrorMsg("Gagal membaca file dari komputer Anda.");
        setLoading(false);
    }
  };

  const loadDemo = () => { 
     setLoading(true); 
     setTimeout(() => { 
        const amNames = ['Muhamad Novan Nufulfattah Sahlan', 'Mohammad Reginaldo', 'Dadan Nurdiansyah', 'Saeful Hikam'];
        const possibleCampaigns = ['GMS Booster', 'GMS Cuan', 'Free Ongkir', 'WEEKENDFEST', 'Booster+'];
        const months = ['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01','2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01','2026-01-01','2026-02-01'];

        const genData = Array.from({ length: 150 }).map((_, i) => {
          const isGrowing = Math.random() > 0.4;
          const lm = Math.floor(Math.random() * 50000000) + 5000000;
          const rr = isGrowing ? lm * (1 + Math.random() * 0.5) : lm * (1 - Math.random() * 0.3);
          const mtd = rr * 0.7;
          
          const lmMiGen = Math.floor(Math.random() * 5000000);
          const rrMiGen = isGrowing ? lmMiGen * (1 + Math.random() * 0.5) : lmMiGen * (1 - Math.random() * 0.3);
          const mtdMiGen = rrMiGen * 0.7;

          const mca = Math.random() > 0.8 ? Math.floor(Math.random() * 50000000) + 10000000 : 0;
          const mcaLimit = mca > 0 ? mca * 1.5 : (Math.random() > 0.85 ? 25000000 : 0);
          
          const pRoll = Math.random();
          const mcaPriority = mcaLimit > 0 ? (pRoll > 0.7 ? 'P1' : pRoll > 0.3 ? 'P2' : 'P3') : '-';
          const dropOffScenarios = ['-', '-', '-', 'Term & Condition', 'KYC Verification', 'Review Plan'];

          let assignedCampaigns = [];
          const campaignRoll = Math.random();
          if (campaignRoll < 0.2) assignedCampaigns = ['No Campaign'];
          else if (campaignRoll < 0.35) assignedCampaigns = [possibleCampaigns[0]]; 
          else if (campaignRoll < 0.5) assignedCampaigns = [possibleCampaigns[4]];  
          else if (campaignRoll < 0.7) assignedCampaigns = [possibleCampaigns[1], possibleCampaigns[3]]; 
          else assignedCampaigns = [possibleCampaigns[2], possibleCampaigns[3]]; 

          const adsTotalGenerated = Math.floor(Math.random() * 8000000);
          const adsMobGenerated = Math.floor(adsTotalGenerated * 0.55);
          const adsWebGenerated = Math.floor(adsTotalGenerated * 0.25);
          const adsDirGenerated = adsTotalGenerated - adsMobGenerated - adsWebGenerated;

          let baseBs = Math.floor(Math.random() * 15000000) + 5000000;
          const history = months.map(m => {
              const trend = 1 + (Math.random() * 0.4 - 0.2); 
              baseBs = Math.max(1000000, baseBs * trend);
              const totalOrders = Math.floor(baseBs / (30000 + Math.random() * 50000));
              const completedOrders = Math.floor(totalOrders * (0.8 + Math.random() * 0.2)); 
              const promoOrders = Math.floor(totalOrders * (Math.random() * 0.8)); 
              
              const mfc = baseBs * (Math.random() * 0.03);
              const mfp = baseBs * (Math.random() * 0.04);
              const cpoVal = baseBs * (Math.random() * 0.02);
              const gmsVal = baseBs * (Math.random() * 0.02);
              const basicComm = baseBs * 0.20; 
              const adsWeb = baseBs * (Math.random() * 0.015);
              const adsMob = baseBs * (Math.random() * 0.015);
              const adsDir = baseBs * (Math.random() * 0.01);
              const adsTotalHist = adsWeb + adsMob + adsDir;
              
              const totalInvestment = mfc + mfp + cpoVal + gmsVal + basicComm + adsTotalHist;
              const netSales = baseBs - totalInvestment;
              const miPercentage = baseBs > 0 ? ((totalInvestment / baseBs) * 100).toFixed(1) : 0;

              return {
                  month: m,
                  basket_size: baseBs,
                  net_sales: netSales,
                  total_orders: totalOrders,
                  completed_orders: completedOrders,
                  orders_with_promo: promoOrders,
                  promo_order_pct: totalOrders > 0 ? parseFloat(((promoOrders / totalOrders) * 100).toFixed(1)) : 0,
                  aov: totalOrders > 0 ? Math.floor(baseBs / totalOrders) : 0,
                  mfc: mfc,
                  mfp: mfp,
                  cpo: cpoVal,
                  gms: gmsVal,
                  basic_commission: basicComm,
                  ads_total_hist: adsTotalHist,
                  mi_percentage: parseFloat(miPercentage),
                  total_investment: totalInvestment
              };
          });

          return {
            id: `6-C${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            name: `Merchant ${String.fromCharCode(65 + (i % 26))} - ${['Bandung', 'Jakarta', 'Sukabumi', 'Bali'][i % 4]}`,
            amName: amNames[i % 4],
            ownerName: `Ona ${String.fromCharCode(65 + (i % 26))}`,
            lmBs: lm, mtdBs: mtd, rrBs: rr, rrVsLm: ((rr - lm) / lm) * 100,
            lmMi: lmMiGen, mtdMi: mtdMiGen, rrMi: rrMiGen,
            adsLM: Math.floor(Math.random() * 12000000), 
            adsTotal: adsTotalGenerated,
            adsMob: adsMobGenerated,
            adsWeb: adsWebGenerated,
            adsDir: adsDirGenerated,
            adsRR: Math.floor(Math.random() * 15000000),
            mcaAmount: mca, 
            mcaWlLimit: mcaLimit, 
            mcaWlClass: mcaLimit > 0 ? 'Repeat' : '-Not in WL',
            mcaPriority: mcaPriority,
            mcaDropOff: dropOffScenarios[Math.floor(Math.random() * dropOffScenarios.length)],
            mcaDisburseStatus: mca > 0 ? (Math.random() > 0.5 ? 'Disbursed' : 'Pending Disbursed') : '',
            disbursedDate: mca > 0 ? `15-Feb-26` : '',
            zeusStatus: Math.random() > 0.15 ? 'ACTIVE' : 'INACTIVE',
            joinDate: `12-Jan-22`,
            campaigns: assignedCampaigns.join(' | '),
            commission: '20%',
            city: ['Bandung', 'Jakarta', 'Sukabumi', 'Bali'][i % 4],
            address: `Jl. Jend. Sudirman No. ${Math.floor(Math.random() * 100)}`,
            phone: `+62 812-${Math.floor(Math.random() * 9000)}-${Math.floor(Math.random() * 9000)}`,
            email: `contact@merchant${i}.com`,
            latitude: (-6.2 + Math.random() * 0.5).toFixed(6),
            longitude: (106.8 + Math.random() * 0.5).toFixed(6),
            lastUpdate: '22 Feb 2026',
            campaignPoint: Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0,
            history: history 
          };
        });
        
        saveToLocal(genData); 
     }, 600); 
  };

  const amOptions = useMemo(() => ['All', ...Array.from(new Set(data.map(d => d.amName).filter(Boolean))).sort()], [data]);
  const priorityOptions = useMemo(() => ['All', ...Array.from(new Set(data.map(d => d.mcaPriority).filter(p => p && p !== '-'))).sort()], [data]);

  const activeData = useMemo(() => {
     let filtered = data;
     if (selectedAM !== 'All') filtered = filtered.filter(d => d.amName === selectedAM);
     return filtered;
  }, [data, selectedAM]);

  const campaignStats = useMemo(() => {
    let zeroInvest = 0, gmsOnly = 0, gmsLocal = 0, boosterPlus = 0, localOnly = 0;
    let joiners = 0;
    const counts = {};

    activeData.forEach(d => {
      const segment = getMerchantSegment(d.campaigns);
      
      if (segment === '0 Invest') {
        zeroInvest++;
      } else {
        joiners++;
        const c = d.campaigns ? String(d.campaigns).trim().toLowerCase() : '';
        const camps = c.split(/[|,]/).map(x => x.trim()).filter(Boolean);
        camps.forEach(camp => {
          counts[camp] = (counts[camp] || 0) + 1;
        });
      }

      if (segment === 'Booster+') boosterPlus++;
      else if (segment === 'GMS & Local') gmsLocal++;
      else if (segment === 'GMS Only') gmsOnly++;
      else if (segment === 'Local Only') localOnly++;
    });

    const classification = [
      { name: 'GMS Only', count: gmsOnly, fill: '#0ea5e9' },       
      { name: 'GMS & Local', count: gmsLocal, fill: '#8b5cf6' },  
      { name: 'Booster+', count: boosterPlus, fill: '#f59e0b' },  
      { name: 'Local Only', count: localOnly, fill: '#10b981' },  
      { name: '0 Invest', count: zeroInvest, fill: '#cbd5e1' }   
    ];

    return { 
      joiners, 
      zeroInvest, 
      classification, 
      list: Object.entries(counts).map(([name, count]) => ({ name, count })) 
    };
  }, [activeData]);

  const filteredSegmentMerchants = useMemo(() => {
     if (!activeSegmentModal) return [];
     return activeData.filter(m => getMerchantSegment(m.campaigns) === activeSegmentModal)
                      .sort((a, b) => b.mtdBs - a.mtdBs); 
  }, [activeData, activeSegmentModal]);

  const disbursedMerchants = useMemo(() => {
     return activeData
         .filter(m => m.mcaAmount > 0 && (
             (m.disbursedDate && String(m.disbursedDate).trim() !== '-') || 
             (m.mcaDisburseStatus && String(m.mcaDisburseStatus).toLowerCase().includes('pending'))
         ))
         .sort((a, b) => {
             const dateA = new Date(a.disbursedDate);
             const dateB = new Date(b.disbursedDate);
             if (!isNaN(dateA) && !isNaN(dateB)) {
                 return dateB - dateA; 
             }
             return String(b.disbursedDate || '').localeCompare(String(a.disbursedDate || ''));
         });
  }, [activeData]);

  const inactiveMerchants = useMemo(() => {
     return activeData.filter(m => !m.zeusStatus || m.zeusStatus.toUpperCase() !== 'ACTIVE').sort((a,b) => b.lmBs - a.lmBs);
  }, [activeData]);

  const zeroTrxMerchants = useMemo(() => {
     return activeData.filter(m => m.mtdBs <= 0).sort((a,b) => b.lmBs - a.lmBs);
  }, [activeData]);

  const kpi = useMemo(() => {
    if (!activeData.length) return null;
    let activeMex = 0; let inactiveMex = 0; let zeroTrxMex = 0;
    activeData.forEach(d => { 
        if (d.zeusStatus && d.zeusStatus.toUpperCase() === 'ACTIVE') { activeMex++; } else { inactiveMex++; } 
        if (d.mtdBs <= 0) { zeroTrxMex++; }
    });
    const totalPts = activeData.reduce((a, c) => a + (c.campaignPoint || 0), 0);

    const disbursedFeb = activeData.filter(c => c.mcaAmount > 0 && String(c.disbursedDate).toLowerCase().includes('feb'));

    return {
      lm: activeData.reduce((a, c) => a + c.lmBs, 0), rr: activeData.reduce((a, c) => a + c.rrBs, 0), mtd: activeData.reduce((a, c) => a + c.mtdBs, 0),
      miLm: activeData.reduce((a, c) => a + (c.lmMi || 0), 0), miRr: activeData.reduce((a, c) => a + (c.rrMi || 0), 0), miMtd: activeData.reduce((a, c) => a + (c.mtdMi || 0), 0),
      adsLm: activeData.reduce((a, c) => a + c.adsLM, 0), adsMtd: activeData.reduce((a, c) => a + c.adsTotal, 0), adsRr: activeData.reduce((a, c) => a + c.adsRR, 0),
      adsMobMtd: activeData.reduce((a, c) => a + (c.adsMob || 0), 0), adsWebMtd: activeData.reduce((a, c) => a + (c.adsWeb || 0), 0), adsDirMtd: activeData.reduce((a, c) => a + (c.adsDir || 0), 0),
      mcaDis: disbursedFeb.reduce((a, c) => a + c.mcaAmount, 0), 
      mcaDisCount: disbursedFeb.length, 
      mcaEli: activeData.reduce((a, c) => a + (c.mcaWlLimit > 0 && !c.mcaWlClass.includes('Not') ? c.mcaWlLimit : 0), 0),
      joiners: campaignStats.joiners, totalMex: activeData.length, activeMex, inactiveMex, zeroTrxMex, totalPoints: totalPts, activeCampCount: campaignStats.list.length, avgPtsPerJoiner: campaignStats.joiners > 0 ? Math.round(totalPts / campaignStats.joiners) : 0
    };
  }, [activeData, campaignStats]);

  const chartsData = useMemo(() => {
    const mtd = [...activeData].sort((a, b) => b.mtdBs - a.mtdBs).slice(0, 10);
    const ads = [...activeData].sort((a, b) => b.adsLM - a.adsLM).slice(0, 10);
    let g = 0, d = 0, s = 0;
    activeData.forEach(x => { if (x.rrBs > x.lmBs * 1.05) g++; else if (x.rrBs < x.lmBs * 0.95) d++; else s++; });
    const total = Math.max(1, g + d + s);
    return { mtd, ads, health: [ { name: 'Growing', count: g, percentage: ((g / total) * 100).toFixed(0), color: '#00B14F' }, { name: 'Declining', count: d, percentage: ((d / total) * 100).toFixed(0), color: COLORS.decline }, { name: 'Stable', count: s, percentage: ((s / total) * 100).toFixed(0), color: COLORS.finance } ] };
  }, [activeData]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return activeData.filter(d => {
        const matchSearch = d.name.toLowerCase().includes(s) || d.id.toLowerCase().includes(s);
        const matchPriority = selectedPriority === 'All' || d.mcaPriority === selectedPriority;
        return matchSearch && matchPriority;
    });
  }, [activeData, searchTerm, selectedPriority]);

  const handleSearchChange = (e) => {
    const val = e.target.value; setSearchTerm(val);
    if (val && activeTab !== 'data' && !selectedMex) { setActiveTab('data'); }
  };

  const renderMerchantCampaigns = (campaignStr, hideEmpty = false) => {
    if (!campaignStr || campaignStr === '-' || campaignStr === '0' || campaignStr.toLowerCase().includes('no campaign')) { 
      if (hideEmpty) return null;
      return <span className="text-slate-400 text-[10px] font-semibold italic block mt-1">Tidak ada partisipasi campaign.</span>; 
    }
    const camps = campaignStr.split(/[|,]/).map(c => c.trim()).filter(Boolean);
    return (
        <div className="flex flex-wrap gap-1 mt-1.5">
            {camps.map((camp, idx) => ( 
              <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 shadow-[0_1px_2px_rgb(0,0,0,0.05)]">
                <Zap className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />{camp}
              </span> 
            ))}
        </div>
    );
  };

  const onChartClick = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      if (state.activePayload[0].payload.id) { setSelectedMex(state.activePayload[0].payload); setActiveTab('overview'); }
    }
  };

  if (isInitializing) {
     return (
       <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
         <div className="text-center animate-pulse flex flex-col items-center">
            <Activity className="w-12 h-12 text-[#00B14F] mb-4" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Dashboard...</h2>
         </div>
       </div>
     )
  }

  // --- RENDER SCREEN AWAL (UPLOAD) ---
  if (data.length === 0 || isForceUpload) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-800">
        
        {/* Background Accents */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[100%] bg-emerald-900/40 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center max-w-xl z-10 bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-[32px] shadow-2xl w-full mx-auto border border-white/20 animate-in fade-in zoom-in-95 relative">
          
          <div className="w-16 h-16 bg-gradient-to-br from-[#00B14F] to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 text-slate-900 tracking-tight uppercase">AM DASHBOARD <span className="text-[#00B14F]">PRO</span></h1>
          <p className="text-slate-500 mb-8 text-xs font-semibold tracking-wide">MERCHANT INTELLIGENCE PLATFORM</p>
          
          {errorMsg && <div className="mb-6 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex gap-2 border border-rose-100 items-center text-left leading-snug"><AlertCircle className="w-5 h-5 shrink-0" />{errorMsg}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col items-center justify-center p-5 border-2 border-slate-200 border-dashed rounded-2xl bg-slate-50 relative group hover:border-[#00B14F] hover:bg-emerald-50/50 transition-all cursor-pointer">
                <Store className={`w-7 h-7 mb-2 transition-colors ${fileMaster ? 'text-[#00B14F]' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                <p className="text-slate-800 font-bold text-xs mb-1">Master Outlet</p>
                <p className="text-[10px] text-slate-400 text-center px-2 line-clamp-2 leading-tight">{fileMaster ? fileMaster.name : 'Upload file utama (.csv)'}</p>
                <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFileMaster(e.target.files[0])} />
                {fileMaster && <div className="absolute top-3 right-3 bg-white rounded-full shadow-sm"><CheckCircle className="w-4 h-4 text-[#00B14F]" /></div>}
              </div>
              <div className="flex flex-col items-center justify-center p-5 border-2 border-slate-200 border-dashed rounded-2xl bg-slate-50 relative group hover:border-[#00B14F] hover:bg-emerald-50/50 transition-all cursor-pointer">
                <FileText className={`w-7 h-7 mb-2 transition-colors ${fileHistory ? 'text-[#00B14F]' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                <p className="text-slate-800 font-bold text-xs mb-1">Data Historis</p>
                <p className="text-[10px] text-slate-400 text-center px-2 line-clamp-2 leading-tight">{fileHistory ? fileHistory.name : 'Upload data bulanan (opsional)'}</p>
                <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFileHistory(e.target.files[0])} />
                {fileHistory && <div className="absolute top-3 right-3 bg-white rounded-full shadow-sm"><CheckCircle className="w-4 h-4 text-[#00B14F]" /></div>}
              </div>
          </div>

          <button onClick={handleProcessFiles} disabled={loading || !fileMaster} className={`w-full py-4 bg-slate-900 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 mb-4 text-sm hover:bg-slate-800 shadow-xl shadow-slate-900/20 ${!fileMaster ? 'opacity-50 cursor-not-allowed shadow-none' : 'active:scale-95'}`}>
            {loading ? <Activity className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />} {loading ? 'MEMPROSES DATA...' : 'MASUK KE DASHBOARD'}
          </button>
          
          <button onClick={loadDemo} disabled={loading} className="w-full py-3 bg-transparent text-slate-500 hover:text-slate-800 font-bold transition-all flex items-center justify-center gap-2 text-xs rounded-xl hover:bg-slate-50">
            <TrendingUp className="w-4 h-4" /> Eksplorasi dengan Data Dummy
          </button>

          {data.length > 0 && isForceUpload && (
             <button onClick={() => setIsForceUpload(false)} disabled={loading} className="w-full py-3 mt-2 bg-slate-100 text-slate-500 hover:text-slate-700 font-bold transition-all text-xs rounded-xl hover:bg-slate-200">
                Batal & Kembali
             </button>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD UTAMA ---
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans overflow-hidden relative">
      
      {/* DECORATIVE TOP BACKGROUND ANCHOR */}
      <div className="absolute top-0 left-0 right-0 h-[280px] md:h-[320px] bg-slate-900 z-0 rounded-b-[40px] shadow-lg">
         <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[200%] bg-emerald-900/30 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute top-[0%] right-[-10%] w-[50%] h-[150%] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      {/* ========================================================= */}
      {/* MODAL TEMPLATE WHATSAPP */}
      {/* ========================================================= */}
      {showWaModal && selectedMex && (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowWaModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white relative z-10">
               <div>
                  <h3 className="font-black text-lg md:text-xl text-slate-900 flex items-center gap-2">
                     <MessageCircle className="w-5 h-5 text-[#00B14F]"/>
                     Pesan WhatsApp
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-1.5 inline-block">
                     *Teks dipilih acak (Anti-Spam)
                  </p>
               </div>
               <button onClick={() => setShowWaModal(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-5 md:p-6 bg-[#f8fafc] space-y-3">
               <button onClick={() => handleSendWA('general')} className="w-full text-left p-4 bg-white border border-slate-200 hover:border-[#00B14F] hover:shadow-md rounded-2xl transition-all group">
                   <p className="font-bold text-sm text-slate-800 group-hover:text-[#00B14F] mb-1">Review Performa (General)</p>
                   <p className="text-xs text-slate-500 line-clamp-2">Ada 5 variasi pesan sapaan untuk diskusi performa secara umum dengan owner...</p>
               </button>
               
               <button onClick={() => handleSendWA('promo')} className="w-full text-left p-4 bg-white border border-slate-200 hover:border-[#00B14F] hover:shadow-md rounded-2xl transition-all group">
                   <p className="font-bold text-sm text-slate-800 group-hover:text-[#00B14F] mb-1 flex items-center gap-1.5"><Zap size={14} className="text-amber-500"/> Penawaran Promo</p>
                   <p className="text-xs text-slate-500 line-clamp-2">Ada 5 variasi pesan untuk mengajak merchant mengikuti program promo/campaign...</p>
               </button>
               
               {selectedMex.mcaWlLimit > 0 && !selectedMex.mcaWlClass.includes('Not') && (
                   <button onClick={() => handleSendWA('mca')} className="w-full text-left p-4 bg-blue-50 border border-blue-200 hover:border-blue-500 hover:shadow-md rounded-2xl transition-all group">
                       <p className="font-bold text-sm text-blue-800 group-hover:text-blue-600 mb-1 flex items-center gap-1.5"><Database size={14} className="text-blue-500"/> Info Limit MCA</p>
                       <p className="text-xs text-blue-600/80 line-clamp-2">Ada 5 variasi pesan untuk menginfokan fasilitas pinjaman senilai {formatCurrency(selectedMex.mcaWlLimit)}...</p>
                   </button>
               )}
               
               {selectedMex.zeusStatus !== 'ACTIVE' && (
                   <button onClick={() => handleSendWA('inactive')} className="w-full text-left p-4 bg-rose-50 border border-rose-200 hover:border-rose-500 hover:shadow-md rounded-2xl transition-all group">
                       <p className="font-bold text-sm text-rose-800 group-hover:text-rose-600 mb-1 flex items-center gap-1.5"><AlertCircle size={14} className="text-rose-500"/> Follow-up Toko Offline</p>
                       <p className="text-xs text-rose-600/80 line-clamp-2">Ada 5 variasi sapaan untuk menanyakan kendala toko yang sedang inactive/offline...</p>
                   </button>
               )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DAFTAR MERCHANT PER SEGMEN CAMPAIGN */}
      {/* ========================================================= */}
      {activeSegmentModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setActiveSegmentModal(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white relative z-10">
               <div>
                  <h3 className="font-black text-lg md:text-xl text-slate-900 flex items-center gap-2">
                     <Target className="w-5 h-5 text-[#00B14F]"/>
                     Segmen: <span className="text-[#00B14F]">{activeSegmentModal}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Daftar {filteredSegmentMerchants.length} merchant dalam kategori ini</p>
               </div>
               <button onClick={() => setActiveSegmentModal(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar bg-[#f8fafc]">
               {filteredSegmentMerchants.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Store className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-xs font-bold uppercase tracking-widest">Kosong</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-3">
                    {filteredSegmentMerchants.map((mex) => (
                       <div key={mex.id} onClick={() => { setSelectedMex(mex); setActiveSegmentModal(null); setActiveTab('overview'); }} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#00B14F] hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer transition-all duration-300 group">
                          <div className="min-w-0 pr-4">
                             <p className="font-bold text-sm md:text-base text-slate-800 group-hover:text-[#00B14F] truncate transition-colors">{mex.name}</p>
                             <div className="-mt-0.5">
                                {renderMerchantCampaigns(mex.campaigns)}
                             </div>
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end">
                             <p className="font-black text-sm md:text-base text-slate-800">{formatCurrency(mex.mtdBs)}</p>
                             <div className="flex items-center gap-1.5 mt-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MTD Sales</p>
                                <span className={`flex items-center gap-0.5 px-1 py-0.5 rounded-md text-[8px] font-black border ${mex.campaignPoint > 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`} title="Campaign Points">
                                   <Award size={10} /> {mex.campaignPoint || 0}
                                </span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
               )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DAFTAR MERCHANT PENCAIRAN MCA */}
      {/* ========================================================= */}
      {showMcaModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowMcaModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white relative z-10">
               <div>
                  <h3 className="font-black text-lg md:text-xl text-slate-900 flex items-center gap-2">
                     <Database className="w-5 h-5 text-amber-500"/>
                     Merchant Pencairan MCA
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Daftar {disbursedMerchants.length} merchant yang telah mencairkan dana</p>
               </div>
               <button onClick={() => setShowMcaModal(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar bg-[#f8fafc]">
               {disbursedMerchants.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Store className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-xs font-bold uppercase tracking-widest">Belum ada pencairan</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-3">
                    {disbursedMerchants.map((mex) => {
                       const isPending = mex.mcaDisburseStatus && String(mex.mcaDisburseStatus).toLowerCase().includes('pending');
                       return (
                       <div key={mex.id} onClick={() => { setSelectedMex(mex); setShowMcaModal(false); setActiveTab('overview'); }} className={`flex justify-between items-center p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer transition-all duration-300 group ${isPending ? 'hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10' : 'hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10'}`}>
                          <div className="min-w-0 pr-4 flex-1">
                             <div className="flex items-center gap-2 min-w-0">
                                {mex.mcaPriority && mex.mcaPriority !== '-' && (
                                   <span className={`px-1.5 py-0.5 rounded text-[9px] font-black shrink-0 ${isPending ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                                      {mex.mcaPriority}
                                   </span>
                                )}
                                <p className={`font-bold text-sm md:text-base text-slate-800 truncate transition-colors ${isPending ? 'group-hover:text-blue-600' : 'group-hover:text-amber-600'}`}>{mex.name}</p>
                             </div>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1"><Users size={10} /> {mex.amName}</span>
                                {mex.disbursedDate && String(mex.disbursedDate).trim() !== '-' && (
                                   <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${isPending ? 'text-blue-600 bg-blue-50 border border-blue-100' : 'text-amber-600 bg-amber-50 border border-amber-100'}`}>{mex.disbursedDate}</span>
                                )}
                             </div>
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end">
                             <p className={`font-black text-sm md:text-base ${isPending ? 'text-blue-600' : 'text-amber-600'}`}>{formatCurrency(mex.mcaAmount)}</p>
                             <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isPending ? 'text-blue-500' : 'text-slate-400'}`}>{isPending ? 'Pending' : 'Telah Cair'}</p>
                          </div>
                       </div>
                    )})}
                 </div>
               )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL MERCHANT INVESTMENT (MI) RATIO DETAIL */}
      {/* ========================================================= */}
      {showMiModal && kpi && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowMiModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white relative z-10">
               <div>
                  <h3 className="font-black text-lg md:text-xl text-slate-900 flex items-center gap-2">
                     <Percent className="w-5 h-5 text-teal-500"/>
                     Investment Ratio (MI/BS)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Detail persentase beban promo terhadap omset merchant</p>
               </div>
               <button onClick={() => setShowMiModal(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-4 md:p-6 bg-[#f8fafc] space-y-5 custom-scrollbar overflow-y-auto max-h-[75vh]">
               <div className="bg-white rounded-[28px] p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full opacity-50 -mr-8 -mt-8 pointer-events-none"></div>
                   
                   <div className="flex-1 w-full relative z-10 text-center md:text-left">
                       <p className="text-[11px] font-black text-teal-600 uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-1.5"><Activity size={14}/> Projected Ratio</p>
                       <div className="flex items-baseline justify-center md:justify-start gap-1 mb-2">
                           <span className="text-6xl font-black text-slate-800 tracking-tighter">
                               {kpi?.rr ? ((kpi.miRr / kpi.rr) * 100).toFixed(1) : 0}
                           </span>
                           <span className="text-3xl font-black text-slate-400">%</span>
                       </div>
                       <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                           Diproyeksikan bahwa beban investasi (MI) akan memakan <strong className="text-slate-700">{kpi?.rr ? ((kpi.miRr / kpi.rr) * 100).toFixed(1) : 0}%</strong> dari total Omset bulan ini.
                       </p>
                   </div>

                   <div className="flex-1 w-full flex flex-col gap-4 relative z-10 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6">
                       <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp size={12}/> Projected Sales (BS)</p>
                           <p className="text-xl md:text-2xl font-black text-slate-800">{formatCurrency(kpi.rr)}</p>
                       </div>
                       <div>
                           <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-1 flex items-center gap-1"><DollarSign size={12}/> Projected Invest (MI)</p>
                           <p className="text-xl md:text-2xl font-black text-teal-600">{formatCurrency(kpi.miRr)}</p>
                       </div>
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Last Month</p>
                       <div className="flex justify-between items-end mb-2">
                           <span className="text-4xl font-black text-slate-700 tracking-tight">{kpi?.lm ? ((kpi.miLm / kpi.lm) * 100).toFixed(1) : 0}%</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2.5 mb-5 overflow-hidden">
                           <div className="bg-slate-400 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, kpi?.lm ? ((kpi.miLm / kpi.lm) * 100) : 0)}%` }}></div>
                       </div>
                       <div className="space-y-2.5 pt-4 border-t border-slate-50">
                           <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-500 font-medium">Sales (BS)</span>
                               <span className="font-bold text-slate-800">{formatCurrency(kpi.lm)}</span>
                           </div>
                           <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-500 font-medium">Invest (MI)</span>
                               <span className="font-bold text-slate-600">{formatCurrency(kpi.miLm)}</span>
                           </div>
                       </div>
                   </div>

                   <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-teal-300 transition-colors">
                       <div className="flex justify-between items-center mb-3">
                          <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12}/> MTD Actual</p>
                       </div>
                       <div className="flex justify-between items-end mb-2">
                           <span className="text-4xl font-black text-teal-600 tracking-tight">{kpi?.mtd ? ((kpi.miMtd / kpi.mtd) * 100).toFixed(1) : 0}%</span>
                       </div>
                       <div className="w-full bg-teal-50 rounded-full h-2.5 mb-5 overflow-hidden">
                           <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, kpi?.mtd ? ((kpi.miMtd / kpi.mtd) * 100) : 0)}%` }}></div>
                       </div>
                       <div className="space-y-2.5 pt-4 border-t border-slate-50">
                           <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-500 font-medium">Sales (BS)</span>
                               <span className="font-bold text-slate-800">{formatCurrency(kpi.mtd)}</span>
                           </div>
                           <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-500 font-medium">Invest (MI)</span>
                               <span className="font-bold text-teal-600">{formatCurrency(kpi.miMtd)}</span>
                           </div>
                       </div>
                   </div>
               </div>
               
               <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
                   <Info className="w-5 h-5 text-blue-500 shrink-0" />
                   <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                       Rasio ini sangat penting untuk memantau efisiensi bakar uang toko. Rasio yang membengkak (naik drastis) bisa berarti merchant mengikuti terlalu banyak campaign diskon tinggi namun tidak berdampak signifikan ke volume penjualan (Basket Size).
                   </p>
               </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL ADS SPEND BREAKDOWN */}
      {/* ========================================================= */}
      {showAdsModal && kpi && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAdsModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white relative z-10">
               <div>
                  <h3 className="font-black text-lg md:text-xl text-slate-900 flex items-center gap-2">
                     <Megaphone className="w-5 h-5 text-rose-500"/>
                     Ads Spend Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Rincian alokasi biaya iklan berdasarkan platform</p>
               </div>
               <button onClick={() => setShowAdsModal(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-4 md:p-6 bg-[#f8fafc] space-y-5 custom-scrollbar overflow-y-auto max-h-[75vh]">
               <div className="bg-white rounded-[28px] p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full opacity-50 -mr-8 -mt-8 pointer-events-none"></div>
                   
                   <div className="flex-1 w-full relative z-10 text-center md:text-left">
                       <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-1.5"><Activity size={14}/> Total Ads (MTD)</p>
                       <p className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">
                           {formatCurrency(kpi.adsMtd)}
                       </p>
                       <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                           Total keseluruhan pengeluaran iklan di bulan ini yang telah didistribusikan ke 3 channel utama.
                       </p>
                   </div>
               </div>

               <div className="space-y-4">
                   {(() => {
                       const totalAds = kpi.adsMtd || 1; 
                       const mobPct = ((kpi.adsMobMtd / totalAds) * 100).toFixed(1);
                       const webPct = ((kpi.adsWebMtd / totalAds) * 100).toFixed(1);
                       const dirPct = ((kpi.adsDirMtd / totalAds) * 100).toFixed(1);

                       return (
                           <Fragment>
                               <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 group hover:border-blue-300 transition-colors">
                                   <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-100 transition-colors">
                                       <Smartphone size={24} />
                                   </div>
                                   <div className="flex-1 w-full">
                                       <div className="flex justify-between items-end mb-1">
                                           <div>
                                               <h4 className="font-black text-slate-800 text-sm md:text-base">Ads Mobile ( MSS )</h4>
                                               <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Marketing Self Serve</p>
                                           </div>
                                           <div className="text-right">
                                               <p className="font-black text-blue-600 text-lg md:text-xl leading-none">{formatCurrency(kpi.adsMobMtd)}</p>
                                               <p className="text-xs font-bold text-slate-500 mt-1">{kpi.adsMtd > 0 ? mobPct : 0}% Porsi</p>
                                           </div>
                                       </div>
                                       <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                                           <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, kpi.adsMtd > 0 ? mobPct : 0)}%` }}></div>
                                       </div>
                                   </div>
                               </div>

                               <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 group hover:border-amber-300 transition-colors">
                                   <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-amber-100 transition-colors">
                                       <ExternalLink size={24} />
                                   </div>
                                   <div className="flex-1 w-full">
                                       <div className="flex justify-between items-end mb-1">
                                           <div>
                                               <h4 className="font-black text-slate-800 text-sm md:text-base">Ads Web ( MM )</h4>
                                               <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Marketing Manager</p>
                                           </div>
                                           <div className="text-right">
                                               <p className="font-black text-amber-600 text-lg md:text-xl leading-none">{formatCurrency(kpi.adsWebMtd)}</p>
                                               <p className="text-xs font-bold text-slate-500 mt-1">{kpi.adsMtd > 0 ? webPct : 0}% Porsi</p>
                                           </div>
                                       </div>
                                       <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                                           <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, kpi.adsMtd > 0 ? webPct : 0)}%` }}></div>
                                       </div>
                                   </div>
                               </div>

                               <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 group hover:border-purple-300 transition-colors">
                                   <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-purple-100 transition-colors">
                                       <Zap size={24} />
                                   </div>
                                   <div className="flex-1 w-full">
                                       <div className="flex justify-between items-end mb-1">
                                           <div>
                                               <h4 className="font-black text-slate-800 text-sm md:text-base">Direct Ads</h4>
                                               <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Direct Placement</p>
                                           </div>
                                           <div className="text-right">
                                               <p className="font-black text-purple-600 text-lg md:text-xl leading-none">{formatCurrency(kpi.adsDirMtd)}</p>
                                               <p className="text-xs font-bold text-slate-500 mt-1">{kpi.adsMtd > 0 ? dirPct : 0}% Porsi</p>
                                           </div>
                                       </div>
                                       <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                                           <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, kpi.adsMtd > 0 ? dirPct : 0)}%` }}></div>
                                       </div>
                                   </div>
                               </div>
                           </Fragment>
                       );
                   })()}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL OUTLETS ATTENTION (INACTIVE & 0-TRX) */}
      {/* ========================================================= */}
      {showOutletsModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowOutletsModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white relative z-10 gap-4">
               <div>
                  <h3 className="font-black text-lg md:text-xl text-slate-900 flex items-center gap-2">
                     <Store className="w-5 h-5 text-blue-500"/>
                     Outlets Attention
                  </h3>
                  <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-1">Daftar merchant yang butuh penanganan segera</p>
               </div>
               <button onClick={() => setShowOutletsModal(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors absolute sm:relative right-4 top-4 sm:right-0 sm:top-0"><X size={20}/></button>
            </div>

            <div className="px-5 md:px-6 pt-4 pb-3 bg-[#f8fafc] shrink-0 border-b border-slate-100 flex gap-2">
                <button 
                   onClick={() => setOutletModalTab('inactive')} 
                   className={`flex-1 py-2.5 rounded-xl text-[11px] md:text-xs font-black uppercase tracking-widest transition-all ${outletModalTab === 'inactive' ? 'bg-slate-700 text-white shadow-md border border-slate-800' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                >
                   Inactive ({inactiveMerchants.length})
                </button>
                <button 
                   onClick={() => setOutletModalTab('zerotrx')} 
                   className={`flex-1 py-2.5 rounded-xl text-[11px] md:text-xs font-black uppercase tracking-widest transition-all ${outletModalTab === 'zerotrx' ? 'bg-rose-500 text-white shadow-md border border-rose-600' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                >
                   0-Trx MTD ({zeroTrxMerchants.length})
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar bg-[#f8fafc]">
               {(() => {
                   const displayList = outletModalTab === 'inactive' ? inactiveMerchants : zeroTrxMerchants;
                   if (displayList.length === 0) {
                       return (
                           <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                               <CheckCircle className="w-10 h-10 mb-3 opacity-30 text-emerald-500" />
                               <p className="text-[11px] font-bold uppercase tracking-widest">Semua Aman!</p>
                           </div>
                       );
                   }
                   return (
                       <div className="grid grid-cols-1 gap-3">
                          {displayList.map(mex => (
                              <div key={mex.id} onClick={() => { setSelectedMex(mex); setShowOutletsModal(false); setActiveTab('overview'); }} className={`flex justify-between items-center p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer transition-all duration-300 group hover:shadow-lg ${outletModalTab === 'inactive' ? 'hover:border-slate-400 hover:shadow-slate-500/10' : 'hover:border-rose-400 hover:shadow-rose-500/10'}`}>
                                  <div className="min-w-0 pr-4 flex-1">
                                      <p className={`font-bold text-sm md:text-base text-slate-800 truncate transition-colors ${outletModalTab === 'inactive' ? 'group-hover:text-blue-600' : 'group-hover:text-rose-600'}`}>{mex.name}</p>
                                      <div className="flex flex-wrap items-center gap-2 mt-1">
                                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1"><Users size={10} /> {mex.amName}</span>
                                          {outletModalTab === 'zerotrx' && (
                                              <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-widest" title="Omset Bulan Lalu">LM: {formatCurrency(mex.lmBs)}</span>
                                          )}
                                      </div>
                                      {renderMerchantCampaigns(mex.campaigns, true)}
                                  </div>
                                  <div className="text-right shrink-0 flex flex-col items-end justify-center">
                                      {outletModalTab === 'inactive' ? (
                                          <span className="bg-slate-100 border border-slate-200 text-slate-500 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider">{mex.zeusStatus || 'INACTIVE'}</span>
                                      ) : (
                                          <>
                                            <span className="text-sm md:text-base font-black text-rose-500 tracking-tight">{formatCurrency(mex.mtdBs)}</span>
                                            <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">MTD Sales</span>
                                          </>
                                      )}
                                  </div>
                              </div>
                          ))}
                       </div>
                   )
               })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL PERBANDINGAN 3 BULAN TERAKHIR */}
      {/* ========================================================= */}
      {showCompareModal && selectedMex && (
        <div className="fixed inset-0 z-[7500] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCompareModal(false)} />
            <div className="relative w-full max-w-6xl bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex justify-between items-start sm:items-center p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white relative z-10 flex-col sm:flex-row gap-4">
                    <div>
                        <h3 className="font-black text-lg md:text-xl text-slate-900 flex items-center gap-2">
                           <BarChart2 className="w-5 h-5 text-indigo-500"/>
                           Custom Performance Review
                        </h3>
                        <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-1">
                           Bandingkan data historis <strong className="text-slate-700">{selectedMex.name}</strong> secara komprehensif
                        </p>
                    </div>
                    <button onClick={() => setShowCompareModal(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors absolute sm:relative right-4 top-4 sm:right-0 sm:top-0"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-auto p-4 md:p-6 bg-[#f8fafc] custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                        {[0, 1, 2].map((colIdx) => {
                            const available = selectedMex.history || [];
                            const selectedMonthStr = compareMonths[colIdx];
                            const hist = available.find(h => h.month === selectedMonthStr);
                            const origIdx = available.findIndex(h => h.month === selectedMonthStr);
                            const prev = origIdx > 0 ? available[origIdx - 1] : null;

                            const handleSelectChange = (e) => {
                                const newArr = [...compareMonths];
                                newArr[colIdx] = e.target.value;
                                setCompareMonths(newArr);
                            };

                            const getGrowth = (curr, prv) => {
                                if (!prv || prv === 0) return null;
                                return ((curr - prv) / prv) * 100;
                            };

                            const renderGrowthBadge = (growth, isReverseColor = false) => {
                                if (growth === null) return null;
                                const isPositive = growth >= 0;
                                const colorClass = isReverseColor 
                                    ? (isPositive ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-[#00B14F] bg-emerald-50 border-emerald-100')
                                    : (isPositive ? 'text-[#00B14F] bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100');
                                const Arrow = isPositive ? ArrowUpRight : ArrowDownRight;
                                
                                return (
                                    <div className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md border ${colorClass}`} title="MoM Growth">
                                        <Arrow size={10} /> {Math.abs(growth).toFixed(1)}%
                                    </div>
                                );
                            };

                            return (
                                <div key={colIdx} className="bg-white rounded-[28px] p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all flex flex-col h-full">
                                    <div className="mb-5 relative z-10 w-full">
                                        <div className="relative inline-block w-full">
                                            <select 
                                                value={selectedMonthStr}
                                                onChange={handleSelectChange}
                                                className="appearance-none w-full text-xs font-black bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 pr-10 rounded-2xl focus:outline-none focus:bg-indigo-50 focus:border-indigo-300 focus:text-indigo-800 cursor-pointer shadow-sm transition-all uppercase tracking-widest text-center"
                                            >
                                                <option value="">-- PILIH BULAN --</option>
                                                {available.map((h, i) => (
                                                    <option key={i} value={h.month}>{formatMonth(h.month)}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {hist ? (
                                        <div className="relative z-10 flex flex-col mt-auto gap-4">
                                            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-bl-full opacity-50 -mr-2 -mt-2"></div>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity size={12}/> Gross Sales</p>
                                                <p className="text-2xl font-black text-slate-800 tracking-tight mb-2">{formatCurrency(hist.basket_size)}</p>
                                                {renderGrowthBadge(getGrowth(hist.basket_size, prev?.basket_size))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Net Sales</p>
                                                    <p className="text-sm font-black text-slate-800 truncate" title={formatCurrency(hist.net_sales)}>{formatCurrency(hist.net_sales)}</p>
                                                    <div className="mt-1">{renderGrowthBadge(getGrowth(hist.net_sales, prev?.net_sales))}</div>
                                                </div>
                                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><ShoppingCart size={10}/> Orders</p>
                                                    <p className="text-sm font-black text-slate-800 truncate">{fNum(hist.completed_orders)}</p>
                                                    <div className="mt-1">{renderGrowthBadge(getGrowth(hist.completed_orders, prev?.completed_orders))}</div>
                                                </div>
                                                <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 flex items-center gap-1"><Target size={10}/> AOV</p>
                                                        <p className="text-sm font-black text-slate-800">{formatCurrency(hist.aov)}</p>
                                                    </div>
                                                    <div>{renderGrowthBadge(getGrowth(hist.aov, prev?.aov))}</div>
                                                </div>
                                            </div>

                                            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4">
                                                <div>
                                                    <div className="flex justify-between items-end mb-1.5">
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Percent size={10}/> Promo Usage</span>
                                                        <div className="flex items-center gap-2">
                                                            {renderGrowthBadge(getGrowth(hist.promo_order_pct, prev?.promo_order_pct), false)}
                                                            <span className="text-xs font-black text-slate-800">{hist.promo_order_pct}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, hist.promo_order_pct)}%` }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-end mb-1.5">
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><PieChart size={10}/> MI / BS %</span>
                                                        <div className="flex items-center gap-2">
                                                            {renderGrowthBadge(getGrowth(hist.mi_percentage, prev?.mi_percentage), true)}
                                                            <span className="text-xs font-black text-slate-800">{hist.mi_percentage}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, hist.mi_percentage)}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex flex-col gap-3">
                                                <div className="flex justify-between items-center pb-3 border-b border-rose-100/60">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-0.5 flex items-center gap-1"><Zap size={10}/> Promo Invest</p>
                                                        <p className="text-sm font-black text-rose-700">{formatCurrency(hist.total_investment)}</p>
                                                    </div>
                                                    {renderGrowthBadge(getGrowth(hist.total_investment, prev?.total_investment), true)}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-0.5 flex items-center gap-1"><Megaphone size={10}/> Ads Spend</p>
                                                        <p className="text-sm font-black text-rose-700">{formatCurrency(hist.ads_total_hist)}</p>
                                                    </div>
                                                    {renderGrowthBadge(getGrowth(hist.ads_total_hist, prev?.ads_total_hist), true)}
                                                </div>
                                            </div>

                                        </div>
                                    ) : (
                                        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-slate-400 min-h-[250px] bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <Activity className="w-10 h-10 mb-3 opacity-30 animate-pulse" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-center">Pilih bulan di atas<br/>untuk memuat metrik</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ELEGAN & MODERN HEADER */}
      <header className="sticky top-0 z-40 transition-all pt-4 pb-2 md:py-4 px-4 md:px-6">
        <div className="flex items-center justify-between gap-3 md:gap-4 lg:gap-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-2xl shadow-black/20">
          
          <div className="flex items-center gap-3 lg:gap-6 shrink-0">
             <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setSelectedMex(null); setActiveTab('overview'); setSearchTerm(''); }}>
               <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-[#00B14F] to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300 shrink-0">
                 <Activity className="w-4 h-4 md:w-5 md:h-5 text-white" />
               </div>
               <h1 className="text-xl md:text-2xl font-black text-white tracking-tight hidden xl:block drop-shadow-sm whitespace-nowrap">
                 AM DASHBOARD <span className="text-emerald-400 ml-0.5">PRO</span>
               </h1>
             </div>

             {!selectedMex && (
               <Fragment>
                 <div className="hidden lg:block w-px h-8 bg-slate-700/50 mx-1"></div>
                 <div className="hidden lg:flex bg-slate-950/50 p-1.5 rounded-2xl shrink-0 border border-white/5">
                     <button onClick={() => { setActiveTab('overview'); setSearchTerm(''); }} className={`px-4 xl:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-[#00B14F] text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                         <LayoutDashboard className="w-4 h-4" /> Overview
                     </button>
                     <button onClick={() => setActiveTab('data')} className={`px-4 xl:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'data' ? 'bg-[#00B14F] text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                         <Table className="w-4 h-4" /> Master Data
                     </button>
                     <button onClick={() => setActiveTab('simulator')} className={`px-4 xl:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'simulator' ? 'bg-[#00B14F] text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                         <Calculator className="w-4 h-4" /> Simulator
                     </button>
                 </div>
               </Fragment>
             )}

             {selectedMex && (
                 <button onClick={() => setSelectedMex(null)} className="group flex items-center gap-2 text-slate-300 hover:text-white font-bold text-xs md:text-sm transition-all px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-white/10 ml-1 md:ml-2">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> <span className="hidden sm:inline">Kembali</span>
                 </button>
             )}
          </div>
          
          {!selectedMex && activeTab !== 'simulator' && (
            <div className="flex-1 min-w-[120px] max-w-md relative group hidden md:block px-2 lg:px-4">
               <div className="absolute inset-y-0 left-5 lg:left-7 flex items-center pointer-events-none">
                   <Search className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
               </div>
               <input 
                   type="text" 
                   value={searchTerm} 
                   onChange={handleSearchChange} 
                   placeholder="Cari nama atau ID..." 
                   className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl pl-10 pr-10 py-2.5 lg:py-3 text-xs lg:text-sm text-white font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner" 
               />
               {searchTerm && (
                   <button onClick={() => setSearchTerm('')} className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 p-1.5 lg:p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors">
                       <X className="w-4 h-4" />
                   </button>
               )}
            </div>
          )}

          {!selectedMex && activeTab !== 'simulator' && (
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
               <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl lg:rounded-2xl px-2.5 lg:px-3 py-2 lg:py-2.5 shadow-inner hover:border-slate-500 transition-colors shrink-0">
                   <Filter className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-400 hidden sm:block mr-1.5 lg:mr-2" />
                   
                   <select value={selectedAM} onChange={(e) => { setSelectedAM(e.target.value); setSelectedMex(null); }} className="bg-transparent text-slate-200 hover:text-white text-[11px] lg:text-xs font-bold focus:outline-none w-[70px] sm:w-[90px] lg:w-28 cursor-pointer appearance-none truncate">
                      {amOptions.map(am => <option key={am} value={am} className="text-slate-900">{am}</option>)}
                   </select>
                   <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block ml-1 shrink-0" />
               </div>

               <button onClick={() => setIsForceUpload(true)} className="group flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 w-9 h-9 sm:w-auto sm:px-3 lg:px-4 sm:h-9 lg:h-10 rounded-xl lg:rounded-2xl font-bold text-[11px] lg:text-xs transition-all shadow-lg shadow-black/20 shrink-0">
                   <RefreshCw className="w-3.5 h-3.5 lg:w-4 lg:h-4 sm:mr-1.5 lg:mr-2 group-hover:rotate-180 transition-transform duration-500" /> 
                   <span className="hidden sm:block">Update</span>
               </button>
            </div>
          )}

          {selectedMex && (
            <div className="flex items-center gap-1.5 lg:gap-2 bg-slate-800/80 border border-slate-700 rounded-xl lg:rounded-2xl px-2.5 lg:px-4 py-2 lg:py-2.5 shadow-inner ml-auto animate-in fade-in shrink-0">
               <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-400" />
               <span className="text-slate-300 text-[9px] lg:text-[10px] font-bold tracking-widest uppercase">AM <span className="text-white ml-1 lg:ml-2">{selectedMex.amName}</span></span>
            </div>
          )}
        </div>

        {!selectedMex && (
          <div className="lg:hidden flex justify-center mt-3 animate-in fade-in slide-in-from-top-2 relative z-40">
             <div className="flex bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                <button onClick={() => { setActiveTab('overview'); setSearchTerm(''); }} className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${activeTab === 'overview' ? 'bg-[#00B14F] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                    <LayoutDashboard className="w-3.5 h-3.5" /> Overview
                </button>
                <button onClick={() => setActiveTab('data')} className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${activeTab === 'data' ? 'bg-[#00B14F] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                    <Table className="w-3.5 h-3.5" /> Data
                </button>
                <button onClick={() => setActiveTab('simulator')} className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${activeTab === 'simulator' ? 'bg-[#00B14F] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                    <Calculator className="w-3.5 h-3.5" /> Simulator
                </button>
             </div>
          </div>
        )}
        
        {!selectedMex && activeTab !== 'simulator' && (
           <div className="md:hidden mt-3 px-4 animate-in fade-in slide-in-from-top-2 relative z-30">
               <div className="relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                       <Search className="w-4 h-4 text-slate-400" />
                   </div>
                   <input 
                       type="text" 
                       value={searchTerm} 
                       onChange={handleSearchChange} 
                       placeholder="Cari merchant..." 
                       className="w-full bg-white/95 backdrop-blur-lg border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-sm text-slate-800 font-bold focus:outline-none focus:border-[#00B14F] focus:ring-4 focus:ring-[#00B14F]/10 transition-all shadow-lg" 
                   />
                   {searchTerm && (
                       <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                           <X className="w-4 h-4" />
                       </button>
                   )}
               </div>
           </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative w-full hide-scrollbar z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto pb-safe">
          {!selectedMex ? (
            <Fragment>
              {/* ========================================================= */}
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {/* ========================================================= */}
              {activeTab === 'overview' && (
                <div className="space-y-5 md:space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                      
                      {/* Basketsize Card */}
                      <div className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-transparent rounded-bl-full opacity-40 -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="flex justify-between items-start mb-5 relative z-10">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-50 rounded-xl text-[#00B14F]"><Activity size={18} /></div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Basketsize</p>
                          </div>
                          {(() => {
                             let trend = 0;
                             if (kpi?.lm > 0) trend = ((kpi.rr - kpi.lm) / kpi.lm) * 100;
                             else if (kpi?.rr > 0) trend = 100;
                             const isUp = trend >= 0;
                             return (
                                 <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1.5 rounded-xl border-2 shadow-sm ${isUp ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                                     {isUp ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
                                     {Math.abs(trend).toFixed(1)}%
                                 </div>
                             );
                          })()}
                        </div>
                        <div className="relative z-10 flex flex-col gap-3 mb-2">
                           <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100/60">
                               <span className="text-[10px] font-black text-[#00B14F] uppercase tracking-widest block mb-1">MTD Sales</span>
                               <span className="text-2xl xl:text-3xl font-black text-[#00B14F] tracking-tight leading-none block">{formatCurrency(kpi?.mtd || 0)}</span>
                           </div>
                           <div className="px-3">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Projected Runrate</span>
                               <span className="text-2xl xl:text-3xl font-black text-emerald-900 tracking-tight leading-none block">{formatCurrency(kpi?.rr || 0)}</span>
                           </div>
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50 relative z-10">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">Last Month</span>
                           <span className="text-sm font-black text-slate-600">{formatCurrency(kpi?.lm || 0)}</span>
                        </div>
                      </div>

                      {/* Merchant Invest Card */}
                      <div onClick={() => setShowMiModal(true)} className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 hover:border-teal-400 cursor-pointer transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-100 to-transparent rounded-bl-full opacity-40 -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="flex justify-between items-start mb-5 relative z-10">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-teal-50 rounded-xl text-teal-500 group-hover:bg-teal-100 transition-colors"><DollarSign size={18} /></div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                               Merch. Invest <MousePointer size={12} className="text-slate-300 group-hover:text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"/>
                            </p>
                          </div>
                          {(() => {
                             let trend = 0;
                             if (kpi?.miLm > 0) trend = ((kpi.miRr - kpi.miLm) / kpi.miLm) * 100;
                             else if (kpi?.miRr > 0) trend = 100;
                             const isUp = trend > 0;
                             return (
                                 <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1.5 rounded-xl border-2 shadow-sm ${!isUp ? 'text-teal-600 bg-teal-50 border-teal-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                                     {isUp ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
                                     {Math.abs(trend).toFixed(1)}%
                                 </div>
                             );
                          })()}
                        </div>
                        <div className="relative z-10 flex flex-col gap-3 mb-2">
                           <div className="bg-teal-50/60 p-3 rounded-2xl border border-teal-100/60">
                               <div className="flex items-center gap-1.5 mb-1">
                                   <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">MTD Invest</span>
                                   <span className="text-[9px] font-bold bg-white text-teal-700 px-1.5 py-0.5 rounded-md border border-teal-200 leading-none">{kpi?.mtd ? ((kpi.miMtd / kpi.mtd) * 100).toFixed(1) : 0}%</span>
                               </div>
                               <span className="text-2xl xl:text-3xl font-black text-teal-600 tracking-tight leading-none block">{formatCurrency(kpi?.miMtd || 0)}</span>
                           </div>
                           <div className="px-3">
                               <div className="flex items-center gap-1.5 mb-1">
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected Cost</span>
                                   <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200 leading-none">{kpi?.rr ? ((kpi.miRr / kpi.rr) * 100).toFixed(1) : 0}%</span>
                               </div>
                               <span className="text-2xl xl:text-3xl font-black text-teal-900 tracking-tight leading-none block">{formatCurrency(kpi?.miRr || 0)}</span>
                           </div>
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50 relative z-10">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">Last Month</span>
                           <div className="flex items-center gap-1.5">
                               <span className="text-sm font-black text-slate-600">{formatCurrency(kpi?.miLm || 0)}</span>
                               <span className="text-[9px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 leading-none">{kpi?.lm ? ((kpi.miLm / kpi.lm) * 100).toFixed(1) : 0}%</span>
                           </div>
                        </div>
                      </div>

                      {/* Ads Spend Card */}
                      <div onClick={() => setShowAdsModal(true)} className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 hover:border-rose-400 cursor-pointer transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-100 to-transparent rounded-bl-full opacity-40 -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="flex justify-between items-start mb-5 relative z-10">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-rose-50 rounded-xl text-rose-500 group-hover:bg-rose-100 transition-colors"><Megaphone size={18} /></div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                               Ads Spend <MousePointer size={12} className="text-slate-300 group-hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"/>
                            </p>
                          </div>
                          {(() => {
                             let trend = 0;
                             if (kpi?.adsLm > 0) trend = ((kpi.adsRr - kpi.adsLm) / kpi.adsLm) * 100;
                             else if (kpi?.adsRr > 0) trend = 100;
                             const isUp = trend > 0;
                             return (
                                 <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1.5 rounded-xl border-2 shadow-sm ${!isUp ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                                     {isUp ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
                                     {Math.abs(trend).toFixed(1)}%
                                 </div>
                             );
                          })()}
                        </div>
                        <div className="relative z-10 flex flex-col gap-3 mb-2">
                           <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100/60">
                               <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-1">MTD Ads</span>
                               <span className="text-2xl xl:text-3xl font-black text-rose-600 tracking-tight leading-none block">{formatCurrency(kpi?.adsMtd || 0)}</span>
                           </div>
                           <div className="px-3">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Projected Cost</span>
                               <span className="text-2xl xl:text-3xl font-black text-rose-900 tracking-tight leading-none block">{formatCurrency(kpi?.adsRr || 0)}</span>
                           </div>
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50 relative z-10">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">Last Month</span>
                           <span className="text-sm font-black text-slate-600">{formatCurrency(kpi?.adsLm || 0)}</span>
                        </div>
                      </div>

                      {/* MCA Disbursed Card */}
                      <div onClick={() => setShowMcaModal(true)} className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 hover:border-amber-400 cursor-pointer transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-transparent rounded-bl-full opacity-40 -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className="flex items-center gap-2">
                             <div className="p-2 bg-amber-50 rounded-xl text-amber-500 group-hover:bg-amber-100 transition-colors"><Database size={18} /></div>
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                MCA Config <MousePointer size={12} className="text-slate-300 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"/>
                             </p>
                          </div>
                        </div>
                        <div className="relative z-10 mb-4">
                            <span className="text-3xl font-black text-amber-600 tracking-tight leading-none block mb-1">{formatCurrency(kpi?.mcaDis || 0)}</span>
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Total Disbursed</span>
                        </div>
                        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50 relative z-10">
                          <div className="flex-1 min-w-0 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex flex-col justify-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5 truncate">Eligibility</span>
                            <span className="text-xs font-black text-slate-600 truncate" title={formatCurrency(kpi?.mcaEli || 0)}>{formatCurrency(kpi?.mcaEli || 0)}</span>
                          </div>
                          <div className="w-16 min-w-0 bg-amber-50 p-2.5 rounded-2xl border border-amber-100 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[9px] font-bold text-amber-600 uppercase mb-0.5 truncate max-w-full">Toko</span>
                            <span className="text-xs font-black text-amber-700 truncate max-w-full" title={kpi?.mcaDisCount || 0}>{kpi?.mcaDisCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Campaign Pts Card */}
                      <div className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-transparent rounded-bl-full opacity-40 -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                           <div className="flex items-center gap-2">
                             <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500"><Award size={18} /></div>
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Campaign</p>
                           </div>
                        </div>
                        <div className="relative z-10 mb-4">
                            <span className="text-3xl font-black text-indigo-600 tracking-tight leading-none block mb-1">{(kpi?.totalPoints || 0).toLocaleString('id-ID')}</span>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Total Points</span>
                        </div>
                        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50 relative z-10">
                          <div className="flex-1 min-w-0 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex flex-col justify-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5 truncate">Joiners</span>
                            <span className="text-xs font-black text-slate-600 truncate" title={`${kpi?.joiners || 0} Toko`}>{kpi?.joiners || 0} Toko</span>
                          </div>
                          <div className="flex-1 min-w-0 bg-indigo-50 p-2.5 rounded-2xl border border-indigo-100 flex flex-col justify-center">
                            <span className="text-[9px] font-bold text-indigo-500 uppercase mb-0.5 truncate">Avg Pts</span>
                            <span className="text-xs font-black text-indigo-700 truncate" title={kpi?.avgPtsPerJoiner || 0}>{kpi?.avgPtsPerJoiner || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Outlets Card */}
                      <div onClick={() => setShowOutletsModal(true)} className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 hover:border-blue-400 cursor-pointer transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-40 -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                           <div className="flex items-center gap-2">
                             <div className="p-2 bg-blue-50 rounded-xl text-blue-500 group-hover:bg-blue-100 transition-colors"><Store size={18} /></div>
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                Outlets <MousePointer size={12} className="text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"/>
                             </p>
                           </div>
                        </div>
                        <div className="relative z-10 mb-4">
                            <span className="text-3xl font-black text-blue-600 tracking-tight leading-none block mb-1">{kpi?.totalMex || 0}</span>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Total Managed</span>
                        </div>
                        <div className="flex gap-1.5 mt-auto pt-4 border-t border-slate-50 relative z-10">
                          <div className="flex-1 min-w-0 bg-blue-50 p-2 rounded-xl border border-blue-100 flex flex-col items-center justify-center">
                            <span className="text-[8px] font-bold text-blue-500 uppercase truncate">Active</span>
                            <span className="text-xs font-black text-blue-700 truncate" title={kpi?.activeMex || 0}>{kpi?.activeMex || 0}</span>
                          </div>
                          <div className="flex-1 min-w-0 bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                            <span className="text-[8px] font-bold text-slate-500 uppercase truncate">Inactive</span>
                            <span className="text-xs font-black text-slate-600 truncate" title={kpi?.inactiveMex || 0}>{kpi?.inactiveMex || 0}</span>
                          </div>
                          <div className="flex-1 min-w-0 bg-rose-50 p-2 rounded-xl border border-rose-100 flex flex-col items-center justify-center">
                            <span className="text-[8px] font-bold text-rose-500 uppercase truncate">0-Trx</span>
                            <span className="text-xs font-black text-rose-700 truncate" title={kpi?.zeroTrxMex || 0}>{kpi?.zeroTrxMex || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CHARTS ROW 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mt-6">
                      <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 shrink-0 min-h-[44px]">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="text-[#00B14F] w-5 h-5"/> Top 10 Merchants <span className="text-slate-400 font-bold normal-case text-xs bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 hidden sm:inline-block">(MTD Sales)</span></h3>
                            
                            {globalLastUpdate && (
                                <div className="bg-slate-50 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black tracking-widest flex items-center gap-1.5 shadow-sm w-fit">
                                   <Clock size={14} className="text-[#00B14F]" /> LAST UPDATE : <span className="text-slate-800">{globalLastUpdate}</span>
                                </div>
                            )}
                        </div>
                        <div className="h-[280px] md:h-[360px] w-full mt-auto">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartsData.mtd} onClick={onChartClick} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="name" tick={{ fill: COLORS.slate500, fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.substring(0, 6)+'.'} height={20} dy={5} />
                              <YAxis tick={{ fill: COLORS.slate400, fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} width={65} />
                              <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border:'none', padding: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(v, name) => [formatCurrency(v), name]} />
                              <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '24px', paddingBottom: '0', fontSize: '11px', fontWeight: 'bold', width: '100%', left: 0, display: 'flex', justifyContent: 'center' }} iconType="circle"/>
                              <Bar dataKey="lmBs" name="LM Sales" fill={COLORS.slate500} radius={[6,6,0,0]} maxBarSize={28} cursor="pointer" />
                              <Bar dataKey="mtdBs" name="MTD Sales" fill={COLORS.primary} radius={[6,6,0,0]} maxBarSize={28} cursor="pointer" />
                              <Line type="monotone" dataKey="rrBs" name="Runrate" stroke={COLORS.growth} strokeWidth={4} dot={{r:4, fill: '#ffffff', strokeWidth: 3}} activeDot={{r: 6}} cursor="pointer">
                                  <LabelList 
                                      dataKey="rrVsLm" 
                                      position="top" 
                                      offset={12}
                                      content={(props) => {
                                          const { x, y, value } = props;
                                          if (value === undefined || value === null) return null;
                                          const numVal = parseFloat(value);
                                          const isPositive = numVal >= 0;
                                          const fill = isPositive ? '#10b981' : '#ef4444';
                                          return (
                                              <text x={x} y={y - 12} fill={fill} fontSize={10} fontWeight="900" textAnchor="middle">
                                                  {isPositive ? '+' : ''}{numVal.toFixed(0)}%
                                              </text>
                                          );
                                      }}
                                  />
                              </Line>
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-8 shrink-0 min-h-[44px]">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Target className="text-indigo-500 w-5 h-5"/> Campaign Segment</h3>
                            <span className="bg-indigo-50 text-indigo-700 font-black text-[10px] md:text-xs px-2.5 py-1 rounded-lg border border-indigo-100">
                                {(( (kpi?.joiners || 0) / Math.max(1, (kpi?.joiners || 0) + campaignStats.zeroInvest)) * 100).toFixed(0)}% Rate
                            </span>
                        </div>
                        
                        <div className="h-[250px] md:h-[320px] w-full mt-auto overflow-hidden">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={campaignStats.classification} 
                                layout="vertical" 
                                margin={{ top: 10, right: 40, left: 0, bottom: 5 }}
                                onClick={(state) => {
                                  if (state && state.activePayload && state.activePayload.length > 0) {
                                    setActiveSegmentModal(state.activePayload[0].payload.name);
                                  }
                                }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: COLORS.slate500, fontSize: 11, fontWeight: 700 }} width={90} />
                              <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border:'none', padding: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                              <Bar 
                                dataKey="count" 
                                name="Total Merchant" 
                                radius={[0, 8, 8, 0]} 
                                barSize={26} 
                                cursor="pointer"
                                label={{ position: 'right', fill: '#475569', fontSize: 12, fontWeight: 900 }}
                              >
                                {campaignStats.classification.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 text-center mt-4 bg-slate-50 py-2 rounded-xl">*Klik bar grafik untuk detail merchant</p>
                      </div>
                    </div>

                    {/* CHARTS ROW 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mt-6">
                      <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-8 shrink-0 min-h-[44px]">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Megaphone className="text-rose-500 w-5 h-5"/> Top 10 Ads Spender <span className="text-slate-400 font-bold normal-case text-xs bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">(vs LM & RR)</span></h3>
                        </div>
                        <div className="h-[280px] md:h-[360px] w-full mt-auto">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartsData.ads} onClick={onChartClick} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="name" tick={{ fill: COLORS.slate500, fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.substring(0, 8)+'.'} height={20} dy={5} />
                              <YAxis tick={{ fill: COLORS.slate400, fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} width={65} />
                              <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border:'none', padding:'12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(v) => formatCurrency(v)} />
                              <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '24px', paddingBottom: '0', fontSize: '11px', fontWeight: 'bold', width: '100%', left: 0, display: 'flex', justifyContent: 'center' }} iconType="circle" />
                              <Bar dataKey="adsLM" name="Ads LM" fill={COLORS.slate500} radius={[6,6,0,0]} maxBarSize={32} cursor="pointer" />
                              <Bar dataKey="adsTotal" name="Ads MTD" fill="#fb923c" radius={[6,6,0,0]} maxBarSize={32} cursor="pointer" />
                              <Line type="monotone" dataKey="adsRR" name="Ads RR" stroke="#2dd4bf" strokeWidth={4} dot={{r:4, fill: '#ffffff', strokeWidth: 3}} activeDot={{r: 6}} cursor="pointer">
                                 <LabelList 
                                      dataKey="adsTotal" 
                                      position="top" 
                                      offset={12}
                                      content={(props) => {
                                          const { x, y, index } = props;
                                          const item = chartsData.ads[index];
                                          if (!item) return null;
                                          
                                          let adsTrend = 0;
                                          if (item.adsLM > 0) {
                                              adsTrend = ((item.adsRR - item.adsLM) / item.adsLM) * 100;
                                          } else if (item.adsRR > 0) {
                                              adsTrend = 100;
                                          }
                                          
                                          const isPositive = adsTrend >= 0;
                                          const fill = isPositive ? '#ef4444' : '#10b981'; 
                                          
                                          return (
                                              <text x={x} y={y - 12} fill={fill} fontSize={10} fontWeight="900" textAnchor="middle">
                                                  {isPositive ? '+' : ''}{adsTrend.toFixed(0)}%
                                              </text>
                                          );
                                      }}
                                  />
                              </Line>
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-between h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full opacity-50 -mr-8 -mt-8 pointer-events-none"></div>
                        
                        <div className="flex justify-between items-end mb-4 relative z-10 shrink-0 min-h-[44px]">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Activity className="text-blue-500 w-5 h-5"/> Portfolio Health</h3>
                                <p className="text-[11px] font-bold text-slate-500 mt-1">Trend vs Last Month</p>
                            </div>
                        </div>

                        <div className="flex-1 w-full relative min-h-[180px] my-2">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={chartsData.health}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius="65%"
                                  outerRadius="90%"
                                  paddingAngle={5}
                                  dataKey="count"
                                  stroke="none"
                                >
                                  {chartsData.health.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} cursor="pointer" className="hover:opacity-80 transition-opacity" />
                                  ))}
                                </Pie>
                                <RechartsTooltip 
                                    cursor={{fill: '#f8fafc'}} 
                                    contentStyle={{ borderRadius: '12px', border:'none', padding: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value, name, props) => [`${value} Toko (${props.payload.percentage}%)`, name]}
                                />
                              </PieChart>
                           </ResponsiveContainer>
                           
                           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-3xl font-black text-[#00B14F] leading-none drop-shadow-sm">{chartsData.health[0].percentage}%</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Growing</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 relative z-10 mt-4 shrink-0">
                            {chartsData.health.map((h, i) => (
                                <div key={i} className="flex items-center justify-between text-sm bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3.5 h-3.5 rounded-md shadow-sm" style={{ backgroundColor: h.color }} />
                                        <span className="font-bold text-slate-700 text-xs">{h.name}</span>
                                    </div>
                                    <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{h.count} <span className="text-[10px] text-slate-400 font-bold ml-1.5">({h.percentage}%)</span></span>
                                </div>
                            ))}
                        </div>
                      </div>
                    </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: MASTER DATASET */}
              {/* ========================================================= */}
              {activeTab === 'data' && (
                <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden animate-in fade-in duration-500 flex flex-col h-[80vh]">
                  <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f8fafc] shrink-0">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Table className="w-5 h-5 text-indigo-500"/> Master Data Directory</h3>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm flex-1 sm:flex-none hover:border-indigo-400 transition-colors focus-within:ring-2 focus-within:ring-indigo-100">
                           <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
                           <select value={selectedPriority} onChange={(e) => { setSelectedPriority(e.target.value); setSelectedMex(null); }} className="bg-transparent text-slate-700 text-xs font-bold focus:outline-none w-full sm:w-32 cursor-pointer appearance-none">
                              {priorityOptions.map(p => <option key={p} value={p}>{p === 'All' ? 'Semua Priority' : `Priority: ${p}`}</option>)}
                           </select>
                           <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 pointer-events-none" />
                        </div>
                        
                        <div className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl text-xs font-black shadow-sm shrink-0">
                          {filtered.length} Toko
                        </div>
                    </div>
                  </div>
                  
                  <div className="overflow-auto flex-1 custom-scrollbar">
                    {filtered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Search className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">Data tidak ditemukan.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-sm relative">
                         <thead className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-100 sticky top-0 z-10">
                           <tr>
                             <th className="px-5 py-4">Merchant</th>
                             <th className="px-4 py-4 text-center hidden md:table-cell">Campaign</th>
                             <th className="px-4 py-4 text-center">Trend vs LM</th>
                             <th className="px-4 py-4 text-center hidden lg:table-cell">Priority</th>
                             <th className="px-5 py-4 text-right">MTD Sales</th>
                             <th className="px-5 py-4 text-center">Status</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {filtered.map((r) => (
                              <tr key={r.id} onClick={() => setSelectedMex(r)} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                                <td className="px-5 py-3 w-1/3">
                                  <p className="font-bold text-slate-800 text-xs md:text-sm group-hover:text-[#00B14F] truncate transition-colors">{r.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{r.id}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center hidden md:table-cell">
                                  <span className={`text-[10px] font-bold ${r.campaigns && r.campaigns !== '-' && !r.campaigns.toLowerCase().includes('no campaign') ? 'text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100' : 'text-slate-400 bg-slate-50 px-2 py-1 rounded-md'}`}>
                                    {r.campaigns && r.campaigns !== '-' && !r.campaigns.toLowerCase().includes('no campaign') ? 'Active' : '-'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                   <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black shadow-sm ${r.rrBs > r.lmBs ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                      {r.rrBs > r.lmBs ? <ArrowUpRight className="w-3.5 h-3.5"/> : <ArrowDownRight className="w-3.5 h-3.5"/>}
                                      {Math.abs(r.rrVsLm).toFixed(0)}%
                                   </span>
                                </td>
                                <td className="px-4 py-3 text-center hidden lg:table-cell">
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${r.mcaPriority !== '-' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-slate-400 bg-slate-50'}`}>
                                      {r.mcaPriority}
                                   </span>
                                </td>
                                <td className="px-5 py-3 font-mono text-slate-800 font-black text-right text-xs md:text-sm">{formatCurrency(r.mtdBs)}</td>
                                <td className="px-5 py-3 text-center">
                                   <div className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${r.zeusStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{r.zeusStatus}</div>
                                </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: MERCHANT SIMULATOR */}
              {/* ========================================================= */}
              {activeTab === 'simulator' && (
                <MerchantSimulator />
              )}
            </Fragment>
          ) : (
            // =========================================================
            // VIEW MERCHANT DETAIL
            // =========================================================
            <div className="animate-in slide-in-from-right-8 duration-500 space-y-5 md:space-y-6 pb-12">

               <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full opacity-50 -mr-8 -mt-8 pointer-events-none"></div>
                  <div className="relative z-10 w-full lg:w-auto">
                     <div className="flex items-center gap-3 mb-1.5">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">{selectedMex.name}</h2>
                        <span className={`hidden md:inline-flex px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${selectedMex.zeusStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{selectedMex.zeusStatus}</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <span className="font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold">{selectedMex.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-700 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Owner: <span className="text-slate-900">{selectedMex.ownerName !== '-' ? selectedMex.ownerName : 'Tidak Diketahui'}</span></span>
                     </div>
                  </div>
                  
                  <div className="relative z-10 shrink-0 w-full lg:w-auto flex items-center justify-start lg:justify-end gap-3 mt-2 lg:mt-0 pt-4 lg:pt-0 border-t border-slate-100 lg:border-none">
                      <span className={`md:hidden inline-flex px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${selectedMex.zeusStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{selectedMex.zeusStatus}</span>
                      
                      {selectedMex.history && selectedMex.history.length > 0 && (
                          <button 
                             onClick={() => {
                                 const hist = selectedMex.history || [];
                                 const defaultMonths = [
                                     hist.length > 2 ? hist[hist.length - 3].month : '',
                                     hist.length > 1 ? hist[hist.length - 2].month : '',
                                     hist.length > 0 ? hist[hist.length - 1].month : ''
                                 ];
                                 setCompareMonths(defaultMonths);
                                 setShowCompareModal(true);
                             }} 
                             className="flex-1 lg:flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-[11px] md:text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-indigo-200 shadow-sm group"
                          >
                             <BarChart2 size={16} className="group-hover:scale-110 transition-transform" /> Compare 3 Bln
                          </button>
                      )}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white rounded-[32px] shadow-lg shadow-slate-200/40 border border-slate-100 p-5 md:p-6 flex flex-col h-full group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-transparent rounded-bl-full opacity-40 -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700"></div>
                     <div className="flex justify-between items-start mb-5 relative z-10">
                         <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-50 rounded-xl text-[#00B14F]"><Activity size={16}/></div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sales</p>
                         </div>
                         <div className={`flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-lg border ${selectedMex.rrBs > selectedMex.lmBs ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                            {selectedMex.rrBs > selectedMex.lmBs ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                            {Math.abs(selectedMex.rrVsLm).toFixed(1)}%
                         </div>
                     </div>
                     
                     <div className="relative z-10 flex flex-col gap-3 mb-2">
                         <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100/60">
                             <span className="text-[10px] font-black text-[#00B14F] uppercase tracking-widest block mb-1">MTD Sales</span>
                             <span className="text-2xl md:text-3xl font-black text-[#00B14F] tracking-tight leading-none block">{formatCurrency(selectedMex.mtdBs)}</span>
                         </div>
                         <div className="px-3">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Projected Runrate</span>
                             <span className="text-2xl md:text-3xl font-black text-emerald-900 tracking-tight leading-none block">{formatCurrency(selectedMex.rrBs)}</span>
                         </div>
                     </div>
                     
                     <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50 relative z-10">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Last Month</span>
                         <span className="text-sm font-black text-slate-600">{formatCurrency(selectedMex.lmBs)}</span>
                     </div>
                  </div>

                  <div className="bg-white rounded-[32px] shadow-lg shadow-slate-200/40 border border-slate-100 p-5 md:p-6 flex flex-col h-full group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-transparent rounded-bl-full opacity-40 -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700"></div>
                     <div className="flex justify-between items-start mb-6 relative z-10">
                         <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><Zap size={16}/></div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Campaigns</p>
                         </div>
                     </div>
                     <div className="relative z-10 mb-4">
                         <span className="text-2xl md:text-3xl font-black text-amber-500 tracking-tight leading-none block mb-1 flex items-center gap-2">
                           {selectedMex.campaignPoint || 0} <Award className="w-6 h-6 text-amber-300" />
                         </span>
                         <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Campaign Points</span>
                     </div>
                     <div className="mt-auto pt-4 border-t border-slate-50 relative z-10">
                         <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1 truncate">Active List:</span>
                         {renderMerchantCampaigns(selectedMex.campaigns)}
                     </div>
                  </div>

                  <div className="bg-white rounded-[32px] shadow-lg shadow-slate-200/40 border border-slate-100 p-5 md:p-6 flex flex-col h-full group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-100 to-transparent rounded-bl-full opacity-40 -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700"></div>
                     <div className="flex justify-between items-start mb-6 relative z-10">
                         <div className="flex items-center gap-2">
                             <div className="p-2 bg-rose-50 rounded-xl text-rose-500"><Megaphone size={16}/></div>
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Marketing</p>
                         </div>
                         {(() => {
                            let adsTrend = 0;
                            if (selectedMex.adsLM > 0) {
                                adsTrend = ((selectedMex.adsRR - selectedMex.adsLM) / selectedMex.adsLM) * 100;
                            } else if (selectedMex.adsRR > 0) {
                                adsTrend = 100;
                            }
                            const isAdsUp = adsTrend > 0;
                            return (
                                <div className={`flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-lg border ${!isAdsUp ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                                   {isAdsUp ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                                   {Math.abs(adsTrend).toFixed(1)}%
                                </div>
                            );
                         })()}
                     </div>
                     <div className="relative z-10 mb-3">
                         <span className="text-2xl md:text-3xl font-black text-rose-500 tracking-tight leading-none block mb-1">{formatCurrency(selectedMex.adsTotal)}</span>
                         <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Ads Spend (MTD)</span>
                     </div>
                     
                     <div className="flex items-center justify-between bg-rose-50/60 rounded-xl p-2.5 mb-2 relative z-10 border border-rose-100/50 shadow-sm">
                         <div className="text-center flex-1 min-w-0 border-r border-rose-100/60 last:border-0">
                             <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">Mobile</p>
                             <p className="text-[10px] md:text-xs font-black text-rose-700 truncate px-1" title={formatCurrency(selectedMex.adsMob || 0)}>{formatCurrency(selectedMex.adsMob || 0)}</p>
                         </div>
                         <div className="text-center flex-1 min-w-0 border-r border-rose-100/60 last:border-0">
                             <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">Web</p>
                             <p className="text-[10px] md:text-xs font-black text-rose-700 truncate px-1" title={formatCurrency(selectedMex.adsWeb || 0)}>{formatCurrency(selectedMex.adsWeb || 0)}</p>
                         </div>
                         <div className="text-center flex-1 min-w-0 last:border-0">
                             <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">Direct</p>
                             <p className="text-[10px] md:text-xs font-black text-rose-700 truncate px-1" title={formatCurrency(selectedMex.adsDir || 0)}>{formatCurrency(selectedMex.adsDir || 0)}</p>
                         </div>
                     </div>

                     <div className="flex gap-2 mt-auto pt-3 border-t border-slate-50 relative z-10">
                         <div className="flex-1 min-w-0 bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col justify-center">
                           <span className="text-[9px] text-slate-400 font-bold uppercase mb-0.5 truncate">LM Ads</span>
                           <span className="text-xs font-black text-slate-700 truncate" title={formatCurrency(selectedMex.adsLM)}>{formatCurrency(selectedMex.adsLM)}</span>
                         </div>
                         <div className="w-16 min-w-0 bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center shrink-0">
                           <span className="text-[9px] text-slate-400 font-bold uppercase mb-0.5 truncate max-w-full">Komisi</span>
                           <span className="text-xs font-black text-slate-800 truncate max-w-full" title={selectedMex.commission || '-'}>{selectedMex.commission || '-'}</span>
                         </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-[32px] shadow-lg shadow-slate-200/40 border border-slate-100 p-5 md:p-6 flex flex-col h-full group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-40 -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700"></div>
                     <div className="flex justify-between items-start mb-6 relative z-10">
                         <div className="flex items-center gap-2">
                             <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><Database size={16}/></div>
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">MCA Config</p>
                         </div>
                         {selectedMex.mcaPriority && selectedMex.mcaPriority !== '-' && (
                             <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[9px] font-black uppercase shadow-sm border border-blue-100">
                                {selectedMex.mcaPriority}
                             </span>
                         )}
                     </div>
                     <div className="relative z-10 mb-4">
                         <span className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight leading-none block mb-1">{formatCurrency(selectedMex.mcaAmount)}</span>
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Dana Cair</span>
                     </div>
                     
                     <div className="mt-auto relative z-10 flex flex-col">
                         {selectedMex.mcaDropOff && selectedMex.mcaDropOff !== '-' && selectedMex.mcaDropOff !== '0' && (
                            <div className="mb-3 inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100/50 px-2 py-1 rounded-lg w-fit shadow-sm max-w-full">
                               <AlertCircle size={12} className="shrink-0" />
                               <span className="text-[9px] font-bold truncate">Drop Off: {selectedMex.mcaDropOff}</span>
                            </div>
                         )}
                         <div className="flex gap-2 pt-4 border-t border-slate-50">
                             <div className="flex-1 min-w-0 bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col justify-center">
                               <span className="text-[9px] text-slate-400 font-bold uppercase mb-0.5 truncate">Limit Tersedia</span>
                               <span className="text-xs font-black text-slate-700 truncate" title={selectedMex.mcaWlLimit > 0 ? formatCurrency(selectedMex.mcaWlLimit) : 'Rp 0'}>{selectedMex.mcaWlLimit > 0 ? formatCurrency(selectedMex.mcaWlLimit) : 'Rp 0'}</span>
                             </div>
                             <div className="flex items-center justify-center p-2 min-w-0 shrink-0">
                               <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border truncate ${selectedMex.mcaWlLimit > 0 && !selectedMex.mcaWlClass.includes('Not') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                   {selectedMex.mcaWlLimit > 0 && !selectedMex.mcaWlClass.includes('Not') ? 'Eligible' : 'Not Eligible'}
                               </span>
                             </div>
                         </div>
                     </div>
                  </div>
               </div>

               {selectedMex.history && selectedMex.history.length > 0 && (
                   <div className="space-y-5 md:space-y-6">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mt-2">
                           <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8 flex flex-col h-full">
                                <div className="flex justify-between items-start md:items-center mb-8 gap-2 shrink-0 min-h-[44px]">
                                   <div>
                                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="text-blue-500 w-5 h-5"/> 12-Month Review</h3>
                                   </div>
                                   {selectedMex.lastUpdate && (
                                       <div className="flex flex-col text-right justify-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm shrink-0">
                                           <span className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Last Update</span>
                                           <span className="text-[10px] md:text-xs font-black text-slate-700 leading-none">{selectedMex.lastUpdate}</span>
                                       </div>
                                   )}
                                </div>
                                <div className="h-[280px] md:h-[360px] w-full mt-auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <ComposedChart data={selectedMex.history.slice(-12)} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fill: COLORS.slate500, fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={formatMonth} height={20} dy={5} />
                                        <YAxis yAxisId="left" tick={{ fill: COLORS.slate500, fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} width={60} />
                                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: '#f97316', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={40} />
                                        <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border:'none', padding: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(v, n) => [n.includes('%') ? `${v}%` : formatCurrency(v), n]} labelFormatter={formatMonth}/>
                                        <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '24px', paddingBottom: '0', fontSize: '11px', fontWeight: 'bold', width: '100%', left: 0, display: 'flex', justifyContent: 'center' }} />
                                        
                                        <Bar yAxisId="left" dataKey="net_sales" stackId="a" name="Net Sales" fill={COLORS.netSales} maxBarSize={28} radius={[4,4,0,0]} />
                                        <Bar yAxisId="left" dataKey="total_investment" stackId="a" name="MI (Rp)" fill="#f43f5e" radius={[4,4,0,0]} maxBarSize={28} />
                                        <Line yAxisId="right" type="monotone" dataKey="mi_percentage" name="MI %" stroke="#f97316" strokeWidth={2} strokeDasharray="4 4" dot={{r:3, fill: '#ffffff', strokeWidth: 2}} activeDot={{r: 5}} />
                                        <Line yAxisId="left" type="monotone" dataKey="basket_size" name="Total Basket Size" stroke={COLORS.basketSize} strokeWidth={2} strokeDasharray="4 4" dot={{r:3, fill: '#ffffff', strokeWidth: 2}} activeDot={{r: 5}} />
                                      </ComposedChart>
                                    </ResponsiveContainer>
                                 </div>
                           </div>

                           <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-8 shrink-0 min-h-[44px]">
                                   <div className="flex items-center gap-2">
                                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><DollarSign className="text-rose-500 w-5 h-5"/> Investment (MI)</h3>
                                   </div>
                                   <div className="bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-1.5 shadow-sm">
                                      <Percent className="w-3.5 h-3.5 text-rose-500"/>
                                      <span className="text-[11px] font-black text-rose-700" title="MI % dari Basket Size Bulan Terakhir">
                                          {selectedMex.history[selectedMex.history.length-1].mi_percentage}%
                                      </span>
                                   </div>
                                </div>
                                <div className="h-[280px] md:h-[360px] w-full mt-auto">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={selectedMex.history.slice(-12)} margin={{ top: 20, right: 45, left: -5, bottom: 5 }}>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                          <XAxis dataKey="month" tick={{ fill: COLORS.slate500, fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={formatMonth} height={20} dy={5} />
                                          <YAxis tick={{ fill: COLORS.slate500, fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} width={60} />
                                          <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border:'none', padding: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(v) => formatCurrency(v)} labelFormatter={formatMonth}/>
                                          
                                          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '24px', paddingBottom: '0', fontSize: '11px', fontWeight: 'bold', width: '100%', left: 0, display: 'flex', justifyContent: 'center' }} iconType="circle" />
                                          
                                          <Bar dataKey="mfp" stackId="a" name="Local Promo" fill="#3b82f6" maxBarSize={32} />
                                          <Bar dataKey="mfc" stackId="a" name="Harga Coret" fill="#22c55e" maxBarSize={32} />
                                          <Bar dataKey="cpo" stackId="a" name="GMS" fill="#f97316" maxBarSize={32} />
                                          <Bar dataKey="ads_total_hist" stackId="a" name="Iklan" fill="#ef4444" radius={[6,6,0,0]} maxBarSize={32} />
                                      </BarChart>
                                  </ResponsiveContainer>
                                </div>
                           </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mt-2">
                            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8 flex flex-col h-full">
                                <div className="flex items-start gap-2 mb-8 shrink-0 min-h-[44px]">
                                   <ShoppingBag className="w-5 h-5 text-indigo-500 shrink-0"/>
                                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-tight">
                                       Completed Orders
                                   </h3>
                                </div>
                                <div className="h-[280px] md:h-[360px] w-full mt-auto">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={selectedMex.history.slice(-12)} margin={{ top: 30, right: 45, left: -5, bottom: 5 }}>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                          <XAxis dataKey="month" tick={{ fill: COLORS.slate500, fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={formatMonth} height={20} dy={5} />
                                          <YAxis tick={{ fill: COLORS.slate500, fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} width={45} />
                                          <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border:'none', padding: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} labelFormatter={formatMonth}/>
                                          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '24px', paddingBottom: '0', fontSize: '11px', fontWeight: 'bold', width: '100%', left: 0, display: 'flex', justifyContent: 'center' }} iconType="circle" />
                                          <Bar dataKey="completed_orders" name="Completed Orders" fill="#10b981" radius={[4,4,0,0]} maxBarSize={32}>
                                              <LabelList dataKey="completed_orders" position="top" offset={10} fontSize={10} fontWeight={800} fill="#10b981" />
                                          </Bar>
                                      </BarChart>
                                  </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8 flex flex-col h-full">
                                <div className="flex items-start gap-2 mb-8 shrink-0 min-h-[44px]">
                                   <Target className="w-5 h-5 text-teal-500 shrink-0"/>
                                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-tight">
                                       AOV & Promo Usage <span className="text-[10px] text-slate-400 font-bold normal-case tracking-normal block mt-0.5">(Gms & Cofund Only)</span>
                                   </h3>
                                </div>
                                <div className="h-[280px] md:h-[360px] w-full mt-auto">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <ComposedChart data={selectedMex.history.slice(-12)} margin={{ top: 30, right: 10, left: -5, bottom: 5 }}>
                                          <defs>
                                              <linearGradient id="colorAov" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                              </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                          <XAxis dataKey="month" tick={{ fill: COLORS.slate500, fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={formatMonth} height={20} dy={5} />
                                          <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fill: COLORS.slate500, fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} width={45} />
                                          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: COLORS.slate500, fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={40} />
                                          <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border:'none', padding: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(v, n) => [n.includes('%') ? `${v}%` : formatCurrency(v), n]} labelFormatter={formatMonth}/>
                                          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '24px', paddingBottom: '0', fontSize: '11px', fontWeight: 'bold', width: '100%', left: 0, display: 'flex', justifyContent: 'center' }} iconType="circle" />
                                          
                                          <Area yAxisId="left" type="monotone" dataKey="aov" name="AOV" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAov)">
                                              <LabelList dataKey="aov" position="top" offset={10} fontSize={9} fontWeight={800} fill="#6366f1" formatter={(v) => `${(v/1000).toFixed(0)}K`} />
                                          </Area>
                                          <Line yAxisId="right" type="monotone" dataKey="promo_order_pct" name="% Promo Usage" stroke="#14b8a6" strokeWidth={4} dot={{r:4, fill: '#ffffff', strokeWidth: 3}} activeDot={{r:6}} />
                                      </ComposedChart>
                                  </ResponsiveContainer>
                                </div>
                            </div>
                       </div>
                   </div>
               )}

               <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 p-5 md:p-8 mt-6">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                     <Info className="w-5 h-5 text-indigo-500"/>
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Informasi Kontak & Lokasi</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">

                      <div className="bg-gradient-to-br from-slate-50 to-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center gap-4">
                         <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5"/>
                            <div className="flex flex-col">
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</span>
                               {selectedMex.phone && selectedMex.phone !== '-' ? (
                                  <button 
                                     onClick={() => setShowWaModal(true)}
                                     className="text-sm md:text-base font-black text-slate-800 hover:text-[#00B14F] transition-colors flex items-center gap-1.5 group cursor-pointer text-left"
                                     title="Pilih Template Pesan WhatsApp"
                                  >
                                     {selectedMex.phone}
                                     <MessageCircle className="w-3.5 h-3.5 text-[#00B14F] opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </button>
                               ) : (
                                  <span className="text-sm md:text-base font-black text-slate-800">-</span>
                               )}
                            </div>
                         </div>
                         <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5"/>
                            <div className="flex flex-col">
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</span>
                               <span className="text-sm font-bold text-indigo-600 break-all">{selectedMex.email || '-'}</span>
                            </div>
                         </div>
                      </div>

                      <div className="bg-gradient-to-br from-slate-50 to-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center gap-4 lg:col-span-2">
                         <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5"/>
                            <div className="flex flex-col">
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Address</span>
                               <span className="text-sm font-semibold text-slate-700 leading-relaxed">{selectedMex.city ? `${selectedMex.address}, ${selectedMex.city}` : '-'}</span>
                            </div>
                         </div>
                         {(selectedMex.latitude || selectedMex.longitude) && (
                            <div className="flex items-start gap-3">
                               <ExternalLink className="w-5 h-5 text-slate-400 shrink-0 mt-0.5"/>
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Maps Coords</span>
                                  <a href={`https://maps.google.com/?q=${selectedMex.latitude},${selectedMex.longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-blue-500 hover:text-blue-700 transition-colors font-bold break-all">
                                      {selectedMex.latitude}, {selectedMex.longitude}
                                  </a>
                               </div>
                            </div>
                         )}
                      </div>
                  </div>
               </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
