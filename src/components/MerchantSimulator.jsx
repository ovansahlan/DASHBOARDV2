// src/components/MerchantSimulator.jsx
import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { 
  Calculator, ShoppingCart, TrendingUp, Megaphone, 
  DollarSign, List, Activity, Info, Zap, Ticket, 
  AlertCircle, ArrowRight, Minus, Plus, ChevronDown, Check, Users, Settings, Target, MousePointer, Eye, X, BarChart2, Tags
} from 'lucide-react';

// Import data statis dan fungsi helper dari file utils
import { STRATEGY, VOUCHERS, METRICS_GUIDE, fNum, pNum, pFloat } from '../utils.jsx';

const SimLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
      {Icon && <Icon size={16} />}
    </div>
    <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
      {children}
    </span>
  </div>
);

const SimInputGroup = ({ label, prefix, suffix, value, onChange, type = "text", inputMode }) => (
  <div className="w-full">
    {label && <div className="mb-1.5"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p></div>}
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center transition-all focus-within:border-[#00B14F] focus-within:bg-white focus-within:ring-2 focus-within:ring-green-100 h-10 md:h-12 shadow-sm">
      {prefix && <span className="text-xs font-bold text-slate-400 mr-2">{prefix}</span>}
      <input 
        type={type}
        inputMode={inputMode || (type === 'number' ? 'decimal' : 'numeric')}
        className="w-full bg-transparent outline-none font-bold text-slate-700 text-sm tabular-nums placeholder:text-slate-300"
        value={value}
        onChange={onChange}
      />
      {suffix && <span className="text-xs font-bold text-slate-400 ml-2">{suffix}</span>}
    </div>
  </div>
);

const SimKpiCard = ({ title, value, sub, valueColor = "text-slate-800", isClickable, onClick, isEditing, editValue, onEditChange, onEditFocus, onEditBlur, icon: Icon, iconColorClass = "text-slate-500", bgBlob = "bg-slate-100" }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-center relative overflow-hidden ${isClickable ? 'cursor-pointer hover:border-[#00B14F] group hover:-translate-y-1 transition-all duration-300' : ''}`}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-40 -mr-4 -mt-4 transition-transform duration-700 ${bgBlob} ${isClickable ? 'group-hover:scale-125' : ''}`}></div>
    
    <div className="flex justify-between items-start mb-3 relative z-10">
       <div className="flex items-center gap-2">
          {Icon && <div className={`p-1.5 rounded-xl bg-slate-50 border border-slate-100 ${iconColorClass}`}><Icon size={16}/></div>}
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
             {title} {isClickable && <MousePointer size={12} className="text-slate-300 group-hover:text-[#00B14F] ml-1"/>}
          </p>
       </div>
    </div>
    
    <div className="mb-2 relative z-10">
      {isEditing !== undefined ? (
         <input 
            className={`w-full bg-transparent border-none outline-none font-black text-2xl md:text-3xl ${valueColor} tabular-nums p-0 focus:ring-0 leading-none`}
            value={isEditing ? editValue : value}
            onChange={(e) => onEditChange(e.target.value)}
            onFocus={onEditFocus}
            onBlur={onEditBlur}
            inputMode="numeric"
            placeholder="0"
          />
      ) : (
         <div className={`text-2xl md:text-3xl font-black tracking-tight leading-none ${valueColor}`}>
           {value}
         </div>
      )}
    </div>
    
    {sub && (
      <div className="mt-auto pt-3 relative z-10">
        <div className="bg-slate-50 inline-block px-2.5 py-1 rounded-lg border border-slate-100">
           <p className="text-[10px] font-bold text-slate-500">{sub}</p>
        </div>
      </div>
    )}
  </div>
);

const MerchantSimulator = () => {
  const [page, setPage] = useState('calc'); 
  const [scheme, setScheme] = useState('normal');
  const [tier, setTier] = useState('hemat');
  const [subMode, setSubMode] = useState('val'); 
  const [activeModal, setActiveModal] = useState(null); 

  const [inputs, setInputs] = useState({
    mainVal: "25.000", subVal: "0", menuName: "Menu Baru", kPct: 20, vDisk: 0, mDisk: "0", minO: "0", mShare: 50
  });

  const [histData, setHistData] = useState({ omset: "50.000.000", orders: "1000", aov: "50.000", invest: "5" });
  const [growthProj, setGrowthProj] = useState(20);
  const [futureCostPct, setFutureCostPct] = useState(5); 

  const [adsBudget, setAdsBudget] = useState("30.000"); 
  const [adsType, setAdsType] = useState('keyword'); 
  const [cpcBid, setCpcBid] = useState("2.500");
  const [adsCvr, setAdsCvr] = useState("15"); 
  const [adsCtr, setAdsCtr] = useState("3.5");

  const [localAppPrice, setLocalAppPrice] = useState("");
  const [isEditingAppPrice, setIsEditingAppPrice] = useState(false);

  const [cart, setCart] = useState([]);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [deliveryType, setDeliveryType] = useState('prioritas');
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);

  const calc = useMemo(() => {
    const off = pNum(inputs.mainVal); const subRaw = pNum(inputs.subVal); const actSub = subMode === 'val' ? subRaw : (off * subRaw / 100);
    const k = pNum(inputs.kPct); const v = pNum(inputs.vDisk); const md = pNum(inputs.mDisk) || Infinity; const s = pNum(inputs.mShare);

    const list = Math.ceil(((off - actSub) / (1 - k / 100)) / 100) * 100;
    const disc = Math.round(Math.min(list * v / 100, md));
    const pay = list - disc;
    let mPromoCost = 0; if (scheme === 'cofund') mPromoCost = Math.round((s / 100) * (v / 100) * list);
    
    const commAmount = (list - mPromoCost) * (k/100); 
    const net = Math.round(list - commAmount - mPromoCost);
    const totalCut = list - net;
    const mexInvestPct = list > 0 ? (totalCut / list) * 100 : 0;
    
    return { list, pay, net, mPromoCost, totalDisc: disc, mexInvestPct };
  }, [inputs, subMode, scheme]);

  useEffect(() => {
    const conf = STRATEGY[scheme];
    setInputs(prev => ({ ...prev, kPct: conf.k, vDisk: conf.v, mDisk: conf.tiers ? fNum(conf.tiers[tier].max) : "0", minO: conf.tiers ? fNum(conf.tiers[tier].min) : "0" }));
  }, [scheme, tier]);

  useEffect(() => {
    if (adsType === 'keyword') { setCpcBid("2.500"); setAdsCvr("15"); setAdsCtr("3.5"); } 
    else if (adsType === 'banner') { setCpcBid("800"); setAdsCvr("5"); setAdsCtr("1.2"); } 
    else if (adsType === 'cpo') { setCpcBid("8.000"); setAdsCvr("100"); setAdsCtr("2.0"); }
  }, [adsType]);

  const handleInputChange = (key, value) => {
    let cleanVal = value;
    if (['mainVal', 'subVal', 'mDisk', 'minO'].includes(key)) cleanVal = fNum(pNum(value));
    setInputs(prev => ({ ...prev, [key]: cleanVal }));
  };

  const handleHistChange = (key, value) => {
    if (key === 'invest') { setHistData(prev => ({ ...prev, [key]: value.replace(/[^0-9.,]/g, '') })); return; }
    const rawVal = pNum(value);
    setHistData(prev => {
      const curOrders = pNum(prev.orders); const curAov = pNum(prev.aov);
      let newData = { ...prev, [key]: fNum(rawVal) };
      if (key === 'omset') { if (curOrders > 0) newData.aov = fNum(rawVal / curOrders); } 
      else if (key === 'orders') { newData.omset = fNum(rawVal * curAov); } 
      else if (key === 'aov') { newData.omset = fNum(curOrders * rawVal); }
      return newData;
    });
  };

  const handleAppPriceManual = (val) => {
    const rawVal = parseInt(val.replace(/[^0-9]/g, '') || '0', 10);
    setLocalAppPrice(fNum(rawVal));
    const k = pNum(inputs.kPct); const subRaw = pNum(inputs.subVal); const actSub = subMode === 'val' ? subRaw : (pNum(inputs.mainVal) * subRaw / 100);
    setInputs(prev => ({ ...prev, mainVal: fNum(Math.round(rawVal * (1 - k / 100) + actSub)) }));
  };

  const handleTargetOrderChange = (val) => {
    const rawVal = pNum(val); const baseOrders = pNum(histData.orders);
    if (baseOrders > 0) setGrowthProj(((rawVal - baseOrders) / baseOrders) * 100);
  };

  const addToCart = () => {
    const priceToCart = pNum(isEditingAppPrice ? localAppPrice : calc.list);
    const newItem = { id: Date.now(), name: inputs.menuName, price: priceToCart, qty: 1 };
    setCart(prev => {
      const idx = prev.findIndex(i => i.name === newItem.name && i.price === newItem.price);
      if (idx > -1) { const next = [...prev]; next[idx].qty += 1; return next; }
      return [...prev, newItem];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, qty: Math.max(1, item.qty + delta) };
      return item;
    }));
  };

  const selectVoucher = (v) => { setActiveVoucher(v); setShowVoucherDropdown(false); };

  const checkout = useMemo(() => {
    const baseOngkir = { prioritas: 15000, standar: 10000, hemat: 5000 }[deliveryType];
    let subtotal = cart.reduce((a, b) => a + (b.price * b.qty), 0);
    let totalPotDisc = 0, schemeKey = 'normal', totalMerchantCost = 0, limitMin = 0, limitMax = Infinity, thresholdMet = true;

    if (activeVoucher) {
      schemeKey = activeVoucher.scheme; const conf = STRATEGY[schemeKey];
      if (conf.tiers && conf.tiers[tier]) { limitMin = conf.tiers[tier].min; limitMax = conf.tiers[tier].max; } 
      else if (schemeKey === 'cofund') { limitMin = pNum(inputs.minO); limitMax = pNum(inputs.mDisk) || Infinity; }

      if (subtotal >= limitMin) {
        totalPotDisc = Math.min(Math.round(subtotal * (activeVoucher.disc / 100)), limitMax);
        if (schemeKey === 'cofund') totalMerchantCost = Math.round(totalPotDisc * (inputs.mShare / 100));
      } else { thresholdMet = false; }
    }
    const ongkirDisc = (schemeKey !== 'normal') ? 10000 : 0;
    return { subtotal, finalDisc: totalPotDisc, finalOngkir: Math.max(0, baseOngkir - ongkirDisc), total: subtotal - totalPotDisc + Math.max(0, baseOngkir - ongkirDisc) + 1500, ongkirDisc, totalMerchantCost, schemeKey, limitMin, limitMax, thresholdMet };
  }, [cart, activeVoucher, deliveryType, inputs.mShare, inputs.minO, inputs.mDisk, tier]);

  const projection = useMemo(() => {
    const hOmset = pNum(histData.omset); const hOrders = pNum(histData.orders); const hAOV = pNum(histData.aov); const hInvestPct = pFloat(histData.invest); 
    const pOrders = Math.round(hOrders * (1 + growthProj / 100));
    const newAOV = checkout.subtotal > 0 ? checkout.subtotal : hAOV;
    const pOmset = pOrders * newAOV;
    const futureInvestPct = pFloat(futureCostPct);
    const pInvestTotal = Math.round(pOmset * (futureInvestPct / 100));
    return { 
      hOmset, hOrders, hDailyOrders: hOrders > 0 ? Math.round(hOrders / 30) : 0, hInvestAmount: Math.round(hOmset * (hInvestPct / 100)), hInvestPct, hNet: hOmset - Math.round(hOmset * (hInvestPct / 100)), hAOV, 
      pOmset, pOrders, pDailyOrders: Math.round(pOrders / 30), pInvestTotal, pNet: pOmset - pInvestTotal, newAOV, futureInvestPct 
    };
  }, [histData, growthProj, checkout, futureCostPct]);

  const adsSim = useMemo(() => {
    const budget = pNum(adsBudget); const costUnit = pNum(cpcBid) || 0; const cvrVal = pNum(adsCvr) || 0; const ctrVal = pNum(adsCtr) || 0.1; 
    const cvr = cvrVal / 100; const ctr = ctrVal / 100; const baseAOV = pNum(histData.aov) || 40000;
    let estClicks, estOrders, estGrossSales, roas, actualCost, estImpressions;

    if (adsType === 'cpo') {
       estOrders = Math.floor(budget / (costUnit || 10000)); actualCost = estOrders * (costUnit || 10000); estGrossSales = estOrders * baseAOV;
       estClicks = cvr > 0 ? Math.round(estOrders / (cvrVal > 99 ? 0.2 : cvr)) : 0; estImpressions = ctr > 0 ? Math.round(estClicks / ctr) : 0;
       roas = actualCost > 0 ? (estGrossSales / actualCost) : 0;
    } else {
       const cpc = costUnit || (adsType === 'keyword' ? 2500 : 800);
       estClicks = Math.floor(budget / cpc); estOrders = Math.floor(estClicks * cvr); actualCost = estClicks * cpc; estGrossSales = estOrders * baseAOV;
       roas = budget > 0 ? (estGrossSales / budget) : 0; estImpressions = ctr > 0 ? Math.round(estClicks / ctr) : 0;
    }
    return { cpc: costUnit, estClicks, cvr, ctrVal, estImpressions, estOrders, estGrossSales, roas, baseAOV, actualCost };
  }, [adsBudget, adsType, histData.aov, cpcBid, adsCvr, adsCtr]);

  return (
    <div className="animate-in fade-in duration-500 relative z-10">
        
        {/* MODAL BREAKDOWN */}
        {activeModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                 <h3 className="font-bold text-sm uppercase tracking-widest text-slate-800">
                   {activeModal === 'cust' ? 'Payment Breakdown' : 'Revenue Breakdown'}
                 </h3>
                 <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Harga Aplikasi</span>
                  <span className="font-bold text-slate-800">Rp {fNum(calc.list)}</span>
                </div>
                {activeModal === 'cust' ? (
                  <div className="flex justify-between text-sm text-rose-500 font-medium">
                    <span>Diskon Campaign</span>
                    <span className="font-bold">- Rp {fNum(calc.list - calc.pay)}</span>
                  </div>
                ) : (
                  <Fragment>
                    <div className="flex justify-between text-sm text-slate-500 font-medium">
                      <span>Komisi Grab ({inputs.kPct}%)</span>
                      <span className="font-bold text-slate-800">- Rp {fNum((calc.list - calc.mPromoCost) * (pNum(inputs.kPct)/100))}</span>
                    </div>
                    {scheme === 'cofund' && (
                      <div className="flex justify-between text-sm text-blue-600 font-medium">
                        <span>Beban Toko</span>
                        <span className="font-bold">- Rp {fNum(calc.mPromoCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-amber-600 pt-2 border-t border-slate-100 font-medium">
                      <span>Mex Investment</span>
                      <span className="font-bold">{calc.mexInvestPct.toFixed(1)}%</span>
                    </div>
                  </Fragment>
                )}
                <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {activeModal === 'cust' ? 'Total Bayar' : 'Net Bersih'}
                  </span>
                  <span className={`text-2xl font-black tracking-tight ${activeModal === 'cust' ? 'text-[#00B14F]' : 'text-blue-600'}`}>
                    Rp {fNum(activeModal === 'cust' ? calc.pay : calc.net)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOP SUB-NAVIGATION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 drop-shadow-md">
                 <Calculator className="w-6 h-6 text-emerald-500"/> Merchant Simulator
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Simulasikan margin, harga coret, ongkir, hingga ROAS Ads.</p>
            </div>
            
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto w-full sm:w-auto custom-scrollbar">
               <button onClick={() => setPage('calc')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${page === 'calc' ? 'bg-[#00B14F] text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                   <Calculator className="w-4 h-4" /> Margin
               </button>
               <button onClick={() => setPage('checkout')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${page === 'checkout' ? 'bg-[#00B14F] text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                   <ShoppingCart className="w-4 h-4" /> Checkout {cart.length > 0 && <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] ml-1">{cart.length}</span>}
               </button>
               <button onClick={() => setPage('prospect')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${page === 'prospect' ? 'bg-[#00B14F] text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                   <TrendingUp className="w-4 h-4" /> Proyeksi
               </button>
               <button onClick={() => setPage('ads')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${page === 'ads' ? 'bg-[#00B14F] text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                   <Megaphone className="w-4 h-4" /> Ads
               </button>
            </div>
        </div>

        {/* DYNAMIC TOP PANELS (SIMULATOR) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8">
            {page === 'prospect' ? (
              <Fragment>
                <SimKpiCard title="AOV Lama" icon={ShoppingBag} iconColorClass="text-slate-500" bgBlob="bg-slate-100" value={`Rp ${fNum(projection.hAOV)}`} sub={`${fNum(projection.hOrders)} Order/Bulan`} valueColor="text-slate-700" />
                <SimKpiCard title="AOV Baru (Est)" icon={TrendingUp} iconColorClass="text-emerald-500" bgBlob="bg-gradient-to-br from-emerald-100 to-transparent" value={`Rp ${fNum(projection.newAOV)}`} sub={`${fNum(projection.pOrders)} Order/Bulan`} valueColor="text-emerald-600" />
                <SimKpiCard title="Selisih Profit" icon={DollarSign} iconColorClass={projection.pNet >= projection.hNet ? 'text-blue-500' : 'text-rose-500'} bgBlob={projection.pNet >= projection.hNet ? 'bg-gradient-to-br from-blue-100 to-transparent' : 'bg-gradient-to-br from-rose-100 to-transparent'} value={`${projection.pNet >= projection.hNet ? '+' : ''}Rp ${fNum(projection.pNet - projection.hNet)}`} valueColor={projection.pNet >= projection.hNet ? 'text-blue-600' : 'text-rose-500'} />
              </Fragment>
            ) : page === 'checkout' ? (
               <Fragment>
                <SimKpiCard title="Subtotal Cart" icon={ShoppingCart} iconColorClass="text-slate-500" bgBlob="bg-slate-100" value={`Rp ${fNum(checkout.subtotal)}`} valueColor="text-slate-700" />
                <SimKpiCard title="Promo Terpakai" icon={Zap} iconColorClass={activeVoucher ? "text-emerald-500" : "text-slate-400"} bgBlob={activeVoucher ? "bg-gradient-to-br from-emerald-100 to-transparent" : "bg-slate-100"} value={activeVoucher ? activeVoucher.code : 'NORMAL'} valueColor={activeVoucher ? 'text-emerald-600' : 'text-slate-400'} />
                <SimKpiCard title="Total Diskon" icon={Ticket} iconColorClass="text-rose-500" bgBlob="bg-gradient-to-br from-rose-100 to-transparent" value={checkout.finalDisc > 0 ? `- Rp ${fNum(checkout.finalDisc)}` : '-'} valueColor="text-rose-500" />
               </Fragment>
            ) : page === 'ads' ? (
               <Fragment>
                <SimKpiCard title="Model Ads" icon={Megaphone} iconColorClass="text-slate-500" bgBlob="bg-slate-100" value={adsType === 'cpo' ? 'Pesanan' : adsType.toUpperCase()} valueColor="text-slate-700" />
                <SimKpiCard title={adsType === 'cpo' ? 'Biaya/Order' : 'Bid CPC'} icon={DollarSign} iconColorClass="text-slate-500" bgBlob="bg-slate-100" value={`Rp ${fNum(pNum(cpcBid))}`} valueColor="text-slate-700" />
                <SimKpiCard title="Target ROAS" icon={Target} iconColorClass={adsSim.roas >= 5 ? 'text-emerald-500' : adsSim.roas >= 3 ? 'text-blue-500' : 'text-rose-500'} bgBlob={adsSim.roas >= 5 ? 'bg-gradient-to-br from-emerald-100 to-transparent' : adsSim.roas >= 3 ? 'bg-gradient-to-br from-blue-100 to-transparent' : 'bg-gradient-to-br from-rose-100 to-transparent'} value={`${adsSim.roas.toFixed(1)}x`} valueColor={adsSim.roas >= 5 ? 'text-emerald-600' : adsSim.roas >= 3 ? 'text-blue-500' : 'text-rose-500'} />
               </Fragment>
            ) : (
              <Fragment>
                <SimKpiCard title="Harga Aplikasi" icon={List} iconColorClass="text-slate-500" bgBlob="bg-slate-100" value={`Rp ${fNum(calc.list)}`} valueColor="text-slate-800"
                   isEditing={isEditingAppPrice} editValue={localAppPrice} 
                   onEditChange={handleAppPriceManual} onEditFocus={() => { setIsEditingAppPrice(true); setLocalAppPrice(fNum(calc.list)); }} onEditBlur={() => { setIsEditingAppPrice(false); setLocalAppPrice(fNum(calc.list)); }}
                />
                <SimKpiCard title="Pax Pays (Bayar)" icon={ShoppingCart} iconColorClass="text-emerald-500" bgBlob="bg-gradient-to-br from-emerald-100 to-transparent" value={`Rp ${fNum(calc.pay)}`} sub={calc.list > calc.pay ? `Coret dari Rp ${fNum(calc.list)}` : 'Harga Normal'} valueColor="text-[#00B14F]" isClickable onClick={() => setActiveModal('cust')} />
                <SimKpiCard title="Net Rev (Bersih)" icon={Activity} iconColorClass="text-blue-500" bgBlob="bg-gradient-to-br from-blue-100 to-transparent" value={`Rp ${fNum(calc.net)}`} sub={`Mex Inv: ${calc.mexInvestPct.toFixed(1)}%`} valueColor="text-blue-600" isClickable onClick={() => setActiveModal('net')} />
              </Fragment>
            )}
        </div>

        {/* TAB CONTENTS */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8 mb-10 relative z-10">
          
          {/* TAB 1: MARGIN CALC */}
          {page === 'calc' && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-8">
                <SimLabel icon={Tags}>1. Strategi Campaign</SimLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {Object.keys(STRATEGY).map(k => {
                    const isActive = scheme === k;
                    return (
                      <button 
                        key={k} onClick={() => setScheme(k)} 
                        className={`py-4 rounded-2xl text-xs font-black uppercase transition-all duration-200 border-2 relative
                          ${isActive ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-500/10' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                      >
                        {k === 'normal' ? 'Normal' : k === 'puas-cuan' ? 'Cuan 32%' : k === 'booster' ? 'Boost 38%' : 'CoFund'}
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex-1">
                    <h2 className="font-black text-sm md:text-base text-slate-800 tracking-tight mb-3">{STRATEGY[scheme].title}</h2>
                    <div className="flex flex-col gap-2">
                      {STRATEGY[scheme].benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="text-emerald-500 mt-0.5 shrink-0"><Check size={14} strokeWidth={4}/></div>
                          <span className="text-xs md:text-sm font-bold text-slate-600 leading-snug">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {STRATEGY[scheme].tiers && (
                    <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm self-start">
                      {['hemat', 'ekstra'].map(t => (
                        <button key={t} onClick={() => setTier(t)} className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase transition-all ${tier === t ? 'bg-[#00B14F] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>{t}</button>
                      ))}
                    </div>
                  )}
                </div>

                {scheme === 'cofund' && (
                  <div className="mt-5 bg-blue-50/80 rounded-2xl p-5 border border-blue-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-blue-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-blue-800">Mex Promo Share</span>
                      </div>
                      <span className="text-sm font-black bg-white text-blue-600 px-3 py-1 rounded-lg border border-blue-200 shadow-sm">{inputs.mShare}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="5" value={inputs.mShare} onChange={(e) => setInputs(prev => ({ ...prev, mShare: parseInt(e.target.value) }))} className="w-full h-2.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-4" />
                    <div className="flex justify-between items-end bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                      <div className="text-left"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Beban Toko</p><p className="font-black text-base text-slate-800">Rp {fNum(calc.mPromoCost)}</p></div>
                      <div className="text-right"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Beban Grab</p><p className="font-black text-base text-blue-600">Rp {fNum(calc.totalDisc - calc.mPromoCost)}</p></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <div>
                   <SimLabel icon={List}>2. Harga Menu</SimLabel>
                   <div className="space-y-5 mb-6">
                      <SimInputGroup label="Harga Jual Offline" prefix="Rp" value={inputs.mainVal} onChange={(e) => handleInputChange('mainVal', e.target.value)} />
                      
                      <div>
                        <div className="mb-2"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subsidi Toko / Mark-up</p></div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center transition-all focus-within:border-[#00B14F] focus-within:bg-white focus-within:ring-2 focus-within:ring-green-100 h-12 shadow-sm">
                          <input type="text" inputMode="numeric" className="w-full bg-transparent outline-none font-bold text-slate-700 text-base tabular-nums placeholder:text-slate-300" value={inputs.subVal} onChange={(e) => handleInputChange('subVal', e.target.value)} />
                          <div className="flex bg-slate-200/60 rounded-lg p-1 ml-3 shrink-0 gap-1 border border-slate-200">
                            <button onClick={() => setSubMode('val')} className={`w-10 h-7 flex items-center justify-center text-xs font-black rounded-md transition-all ${subMode === 'val' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Rp</button>
                            <button onClick={() => setSubMode('pct')} className={`w-10 h-7 flex items-center justify-center text-xs font-black rounded-md transition-all ${subMode === 'pct' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>%</button>
                          </div>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-4 items-end pt-5 border-t border-slate-100">
                      <SimInputGroup label="Nama Menu" value={inputs.menuName} onChange={(e) => handleInputChange('menuName', e.target.value)} inputMode="text" />
                      <button onClick={addToCart} className="h-12 px-6 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 shrink-0">Add <ArrowRight size={16} strokeWidth={3}/></button>
                   </div>
                </div>

                <div>
                  <SimLabel icon={Settings}>3. Aturan Skema</SimLabel>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                    <SimInputGroup label="Komisi" suffix="%" value={inputs.kPct} type="number" onChange={(e) => handleInputChange('kPct', e.target.value)} />
                    <SimInputGroup label="Diskon" suffix="%" value={inputs.vDisk} type="number" onChange={(e) => handleInputChange('vDisk', e.target.value)} />
                    <SimInputGroup label="Min. Order" prefix="Rp" value={inputs.minO} onChange={(e) => handleInputChange('minO', e.target.value)} />
                    <SimInputGroup label="Max. Disk" prefix="Rp" value={inputs.mDisk} onChange={(e) => handleInputChange('mDisk', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHECKOUT */}
          {page === 'checkout' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
               <div className="space-y-6">
                  <div className="border border-slate-200 rounded-2xl p-5 md:p-6 bg-slate-50/50">
                    <SimLabel icon={Info}>1. Pengiriman</SimLabel>
                    <div className="space-y-3">
                      {['prioritas', 'standar', 'hemat'].map(id => (
                        <div key={id} onClick={() => setDeliveryType(id)} className={`p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${deliveryType === id ? 'bg-emerald-50 border-emerald-400 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryType === id ? 'border-emerald-500' : 'border-slate-300'}`}>
                              {deliveryType === id && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"/>}
                            </div>
                            <div>
                              <p className={`font-black text-xs md:text-sm uppercase tracking-wider ${deliveryType === id ? 'text-emerald-800' : 'text-slate-700'}`}>{id}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Est. {id === 'prioritas' ? '20' : id === 'standar' ? '30' : '45'} mnt</p>
                            </div>
                          </div>
                          <div className="text-right">
                             {checkout.ongkirDisc > 0 ? (
                               <Fragment>
                                 <span className="block text-[10px] text-slate-400 line-through font-medium">Rp {fNum(id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000)}</span>
                                 <span className="block font-black text-base text-emerald-600">Rp {fNum(Math.max(0, (id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000) - checkout.ongkirDisc))}</span>
                               </Fragment>
                             ) : (
                               <span className="font-black text-base text-slate-700">Rp {fNum(id === 'prioritas' ? 15000 : id === 'standar' ? 10000 : 5000)}</span>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-5 md:p-6 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-100 p-2 rounded-xl text-slate-500"><ShoppingCart size={18} /></div>
                        <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">2. Rincian Item</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 text-[11px] font-black px-3 py-1 rounded-lg border border-emerald-200 shadow-sm">{cart.reduce((a,b)=>a+b.qty,0)} Item</span>
                    </div>
                    <div className="space-y-4">
                      {cart.length === 0 ? (
                         <div className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-2xl bg-white">Keranjang Kosong</div>
                      ) : cart.map(item => {
                        return (
                          <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black flex items-center justify-center text-sm border border-emerald-100">{item.qty}</div>
                              <div>
                                <p className="font-black text-xs text-slate-800 mb-1">{item.name}</p>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"><Minus size={12} strokeWidth={3} /></button>
                                  <span className="text-xs font-black text-slate-800 w-3 text-center">{item.qty}</span>
                                  <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-emerald-100 rounded-lg text-emerald-700 hover:bg-emerald-200"><Plus size={12} strokeWidth={3} /></button>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-slate-800 text-sm md:text-base">Rp {fNum(item.price * item.qty)}</p>
                              <button onClick={() => setCart(prev => prev.filter(i=>i.id!==item.id))} className="text-[10px] text-red-500 font-bold hover:text-red-700 uppercase tracking-widest mt-1.5">Hapus</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
               </div>

               <div className="space-y-6 flex flex-col">
                   <div className="border border-slate-200 rounded-2xl p-5 md:p-6 bg-slate-50/50 h-full flex flex-col">
                      <SimLabel icon={Ticket}>3. Voucher & Promo</SimLabel>
                      <div className="relative mb-6">
                        <button onClick={() => setShowVoucherDropdown(!showVoucherDropdown)} className={`w-full p-4 md:p-5 rounded-2xl border-2 flex justify-between items-center transition-all bg-white shadow-sm ${activeVoucher ? 'border-emerald-400 ring-4 ring-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeVoucher ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><Ticket size={20} /></div>
                            <div className="text-left">
                              <p className={`text-xs md:text-sm font-black uppercase tracking-wider ${activeVoucher ? 'text-emerald-800' : 'text-slate-600'}`}>{activeVoucher ? activeVoucher.code : 'Pilih Voucher'}</p>
                              <p className={`text-[10px] md:text-xs font-bold mt-1 ${activeVoucher ? 'text-emerald-500' : 'text-slate-400'}`}>{activeVoucher ? activeVoucher.label : 'Makin hemat pakai promo'}</p>
                            </div>
                          </div>
                          <ChevronDown size={20} className={`transition-transform duration-300 ${showVoucherDropdown ? 'rotate-180' : ''} ${activeVoucher ? 'text-emerald-600' : 'text-slate-400'}`}/>
                        </button>

                        {showVoucherDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100" onClick={() => selectVoucher(null)}>
                              <div className="flex justify-between items-center">
                                <div><p className="text-xs font-black text-slate-700">NORMAL</p><p className="text-[10px] text-slate-500 font-medium">Tanpa Voucher (Harga Normal)</p></div>
                                {!activeVoucher && <Check size={18} className="text-[#00B14F]" />}
                              </div>
                            </div>
                            {VOUCHERS.map((v, i) => (
                              <div key={i} className="p-4 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors" onClick={() => selectVoucher(v)}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-xs font-black text-[#00B14F]">{v.code}</p>
                                    <p className="text-[10px] font-bold text-slate-700 mt-1">{v.label}</p>
                                  </div>
                                  {activeVoucher?.code === v.code && <Check size={18} className="text-[#00B14F]" />}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {activeVoucher && (
                        <div className="mb-6 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                          <div className="flex justify-between text-xs mb-2"><span className="text-slate-500 font-bold">Min. Order</span><span className="font-black text-slate-800">Rp {fNum(checkout.limitMin)}</span></div>
                          <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Max. Diskon</span><span className="font-black text-slate-800">{checkout.limitMax === Infinity ? 'Tanpa Batas' : `Rp ${fNum(checkout.limitMax)}`}</span></div>
                          {!checkout.thresholdMet && (<div className="mt-4 text-[10px] text-rose-600 font-bold flex items-center gap-2 bg-rose-50 p-3 rounded-xl border border-rose-100"><AlertCircle size={14} /> Belum memenuhi minimum order</div>)}
                        </div>
                      )}

                      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200 mt-auto">
                        <div className="space-y-4 mb-5">
                            <div className="flex justify-between text-xs md:text-sm font-bold text-slate-600"><span>Subtotal</span><span>Rp {fNum(checkout.subtotal)}</span></div>
                            <div className="flex justify-between text-xs md:text-sm font-bold text-slate-600"><span>Ongkos Kirim</span><span>Rp {fNum(checkout.finalOngkir)}</span></div>
                            <div className="flex justify-between text-xs md:text-sm font-bold text-slate-600"><span>Biaya Layanan</span><span>Rp 1.500</span></div>
                            {checkout.finalDisc > 0 && (<div className="flex justify-between text-xs md:text-sm font-black text-emerald-600 pt-4 border-t border-slate-100"><span className="flex items-center gap-1.5"><Zap size={14}/> Promo Aktif</span><span>- Rp {fNum(checkout.finalDisc)}</span></div>)}
                            
                            {checkout.schemeKey === 'cofund' && checkout.totalMerchantCost > 0 && (
                              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mt-3">
                                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">Rincian Patungan (Cofund)</p>
                                <div className="flex justify-between text-[11px] mb-1.5"><span className="text-slate-600 font-medium">Beban Toko</span><span className="font-bold text-slate-800">Rp {fNum(checkout.totalMerchantCost)}</span></div>
                                <div className="flex justify-between text-[11px]"><span className="text-slate-600 font-medium">Beban Grab</span><span className="font-bold text-slate-800">Rp {fNum(checkout.finalDisc - checkout.totalMerchantCost)}</span></div>
                              </div>
                            )}
                        </div>

                        <div className="pt-5 mt-3 border-t-2 border-slate-100 border-dashed">
                          <div className="flex justify-between items-end mb-6">
                              <div>
                                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                                  <p className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Rp {fNum(checkout.total)}</p>
                              </div>
                          </div>
                          <button className="w-full bg-[#00B14F] hover:bg-emerald-600 text-white p-4 md:p-5 rounded-2xl font-black text-sm md:text-base uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-3 group">
                              Simulasi Pesan <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform"/>
                          </button>
                        </div>
                      </div>
                   </div>
               </div>
            </div>
          )}

          {/* TAB 3: PROSPECT */}
          {page === 'prospect' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6">
                <div className="border border-slate-200 rounded-2xl p-5 md:p-6 bg-slate-50/50">
                  <SimLabel icon={BarChart2}>1. Data Historis (Bulan Lalu)</SimLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SimInputGroup label="Omset Penjualan" prefix="Rp" value={histData.omset} onChange={(e) => handleHistChange('omset', e.target.value)} />
                    <SimInputGroup label="Jumlah Order" value={histData.orders} onChange={(e) => handleHistChange('orders', e.target.value)} />
                    <SimInputGroup label="AOV (Rata2 Order)" prefix="Rp" value={histData.aov} onChange={(e) => handleHistChange('aov', e.target.value)} />
                    <SimInputGroup label="Beban Promo/Ads" suffix="%" value={histData.invest} onChange={(e) => handleHistChange('invest', e.target.value)} />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-5 md:p-6 bg-slate-50/50">
                  <SimLabel icon={TrendingUp}>2. Target Proyeksi Baru</SimLabel>
                  <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kenaikan Order</span>
                      <span className="text-2xl font-black text-[#00B14F] bg-green-50 px-3 py-1 rounded-xl border border-green-100">+{growthProj}%</span>
                    </div>
                    <input type="range" min="0" max="200" step="5" value={growthProj} onChange={(e) => setGrowthProj(Number(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00B14F]" />
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Est. Total Order Baru</div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                        <input type="text" inputMode="numeric" className="bg-transparent outline-none font-black text-slate-800 text-lg tabular-nums w-20 text-right" value={fNum(Math.round(pNum(histData.orders) * (1 + growthProj/100)))} onChange={(e) => handleTargetOrderChange(e.target.value)} />
                        <span className="text-xs font-bold text-slate-400">Trx</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 relative z-10">Ringkasan Bulan Lalu</p>
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end"><p className="text-xs font-bold text-slate-500 uppercase">Omset</p><p className="text-xl font-black text-slate-800">Rp {fNum(projection.hOmset)}</p></div>
                    <div className="flex justify-between items-end"><p className="text-xs font-bold text-slate-500 uppercase">Orders</p><p className="text-lg font-black text-slate-700">{fNum(projection.hOrders)} <span className="text-[11px] font-medium text-slate-400 ml-1">({fNum(projection.hDailyOrders)}/hr)</span></p></div>
                    <div className="flex justify-between items-end"><p className="text-xs font-bold text-slate-500 uppercase">AOV</p><p className="text-lg font-black text-slate-700">Rp {fNum(projection.hAOV)}</p></div>
                    <div className="flex justify-between items-end"><p className="text-xs font-bold text-slate-500 uppercase">Beban ({projection.hInvestPct}%)</p><p className="text-lg font-black text-rose-500">Rp {fNum(projection.hInvestAmount)}</p></div>
                    <div className="flex justify-between items-end pt-4 border-t border-slate-100 mt-2"><p className="text-sm font-black text-slate-800 uppercase">Net Profit</p><p className="text-2xl font-black text-blue-600">Rp {fNum(projection.hNet)}</p></div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-3xl p-6 md:p-8 border border-emerald-200 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>
                  <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-5 relative z-10">Simulasi Masa Depan</p>
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end"><p className="text-xs font-bold text-emerald-800 uppercase">Est. Omset</p><p className="text-2xl font-black text-emerald-900 tracking-tight">Rp {fNum(projection.pOmset)}</p></div>
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col"><p className="text-xs font-bold text-emerald-800 uppercase">Est. Orders</p><span className="text-[10px] font-black text-emerald-600 mt-1">+{growthProj.toFixed(0)}% Kenaikan</span></div>
                       <p className="text-lg font-black text-emerald-800">{fNum(projection.pOrders)} <span className="text-[11px] font-medium text-emerald-600/70 ml-1">({fNum(projection.pDailyOrders)}/hr)</span></p>
                    </div>
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col"><p className="text-xs font-bold text-emerald-800 uppercase">Est. AOV</p><span className="text-[10px] font-bold text-emerald-600/70 mt-1">Diambil dari Cart</span></div>
                       <p className="text-lg font-black text-emerald-800">Rp {fNum(projection.newAOV)}</p>
                    </div>
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col gap-1.5"><p className="text-xs font-bold text-emerald-800 uppercase">Est. Beban</p><div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-emerald-200 w-fit shadow-sm"><input type="number" value={futureCostPct} onChange={(e) => setFutureCostPct(e.target.value)} className="bg-transparent text-emerald-800 font-black text-sm w-10 outline-none text-center" /><span className="text-[10px] font-black text-emerald-500">%</span></div></div>
                       <p className="text-lg font-black text-rose-500">Rp {fNum(projection.pInvestTotal)}</p>
                    </div>
                    <div className="flex justify-between items-end pt-5 border-t border-emerald-200/50 mt-2"><p className="text-sm font-black text-emerald-900 uppercase">Est. Net Profit</p><p className="text-3xl font-black text-[#00B14F] tracking-tight">Rp {fNum(projection.pNet)}</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADS */}
          {page === 'ads' && (
            <div className="space-y-8 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-6">
                  <div className="border border-slate-200 rounded-2xl p-5 md:p-6 bg-slate-50/50">
                    <SimLabel icon={Megaphone}>1. Pilih Jenis Iklan</SimLabel>
                    <div className="space-y-3">
                      <div onClick={() => setAdsType('keyword')} className={`p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all bg-white ${adsType === 'keyword' ? 'border-[#00B14F] shadow-lg shadow-emerald-500/10 ring-1 ring-green-100' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex justify-between items-start mb-2"><h4 className="font-black text-sm text-slate-800">Pencarian (Keyword)</h4>{adsType === 'keyword' && <Check size={18} className="text-[#00B14F]" />}</div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Tampil di hasil pencarian. Bayar per klik (CPC). Sangat cocok menangkap niat beli tinggi.</p>
                      </div>
                      <div onClick={() => setAdsType('banner')} className={`p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all bg-white ${adsType === 'banner' ? 'border-[#00B14F] shadow-lg shadow-emerald-500/10 ring-1 ring-green-100' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex justify-between items-start mb-2"><h4 className="font-black text-sm text-slate-800">Jelajah (Banner)</h4>{adsType === 'banner' && <Check size={18} className="text-[#00B14F]" />}</div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Tampil di halaman utama. Cocok untuk membangun brand awareness toko Anda.</p>
                      </div>
                      <div onClick={() => setAdsType('cpo')} className={`p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all bg-white ${adsType === 'cpo' ? 'border-[#00B14F] shadow-lg shadow-emerald-500/10 ring-1 ring-green-100' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex justify-between items-start mb-2"><h4 className="font-black text-sm text-slate-800">Pesanan (CPO)</h4>{adsType === 'cpo' && <Check size={18} className="text-[#00B14F]" />}</div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Hanya bayar ketika terjadi order. Resiko sangat rendah dan garansi ROAS.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-5 md:p-6 bg-slate-50/50">
                    <SimLabel icon={Target}>2. Budget & Performa</SimLabel>
                    <div className="space-y-5">
                      <SimInputGroup label="Budget Harian" prefix="Rp" value={adsBudget} onChange={(e) => setAdsBudget(e.target.value)} />
                      <div className="flex gap-4">
                        <div className="flex-1"><SimInputGroup label={adsType === 'cpo' ? "Biaya per Order" : "Max CPC (Bid)"} prefix="Rp" value={cpcBid} onChange={(e) => setCpcBid(e.target.value)} inputMode="numeric"/></div>
                      </div>
                      {adsType !== 'cpo' && (
                        <div className="flex gap-4">
                          <div className="flex-1"><SimInputGroup label="Est. CTR (%)" suffix="%" value={adsCtr} onChange={(e) => setAdsCtr(e.target.value)} inputMode="decimal"/></div>
                          <div className="flex-1"><SimInputGroup label="Est. CVR (%)" suffix="%" value={adsCvr} onChange={(e) => setAdsCvr(e.target.value)} inputMode="decimal"/></div>
                        </div>
                      )}
                      <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                          {adsType === 'cpo' ? <span>Anda hanya akan ditagih <b className="font-black">Rp {cpcBid}</b> saat order masuk.</span> : <span>Default rekomendasi sistem: CPC <b className="font-black">Rp {adsType === 'keyword' ? '2.500' : '800'}</b>, CTR <b className="font-black">{adsType === 'keyword' ? '3.5' : '1.2'}%</b>.</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-full">
                  <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 h-full flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                    
                    <div className="flex items-center gap-3 mb-8 pb-5 border-b border-slate-100 relative z-10">
                      <div className="bg-green-50 p-2 rounded-xl text-[#00B14F]"><Activity size={20} /></div>
                      <span className="text-sm md:text-base font-black uppercase tracking-widest text-slate-800">Estimasi Hasil Harian</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-8 mb-8 relative z-10">
                      <div>
                         <p className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Est. Tayangan</p>
                         <p className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{fNum(adsSim.estImpressions)}</p>
                         {adsType !== 'cpo' && (<p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2"><Eye size={12} className="text-[#00B14F]"/> CTR {adsSim.ctrVal}%</p>)}
                      </div>
                      <div>
                         <p className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Est. Klik Traffic</p>
                         <p className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{fNum(adsSim.estClicks)}</p>
                         {adsType !== 'cpo' && (<p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2"><MousePointer size={12} className="text-[#00B14F]"/> Bayar jika diklik</p>)}
                      </div>
                      <div className="pt-5 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Biaya Iklan</p>
                        <p className="text-xl md:text-2xl font-black text-rose-500 tracking-tight">Rp {fNum(adsSim.actualCost)}</p>
                      </div>
                      <div className="pt-5 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Est. Order</p>
                        <p className="text-xl md:text-2xl font-black text-[#00B14F] tracking-tight">{fNum(adsSim.estOrders)}</p>
                        {adsType !== 'cpo' && (<p className="text-[10px] text-slate-500 font-bold mt-2">CVR {(adsSim.cvr * 100).toFixed(0)}%</p>)}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t-2 border-slate-100 border-dashed relative z-10">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Potensi Omset</span>
                        <span className="text-3xl md:text-4xl font-black text-[#00B14F] tracking-tight">Rp {fNum(adsSim.estGrossSales)}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">ROAS</span>
                        <span className={`text-base md:text-lg font-black ${adsSim.roas >= 5 ? 'text-emerald-600' : adsSim.roas >= 3 ? 'text-blue-600' : 'text-rose-600'}`}>{adsSim.roas.toFixed(1)}x</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-4 text-center italic font-medium">*Diestimasi dengan AOV Rp {fNum(adsSim.baseAOV)}. Aktual dapat berbeda.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABEL METRIK */}
              <div className="border border-slate-200 rounded-[32px] p-5 md:p-8 bg-white shadow-xl shadow-slate-200/40 overflow-hidden mb-10">
                <SimLabel icon={Activity}>Panduan Kesehatan Metrik</SimLabel>
                <div className="overflow-x-auto custom-scrollbar pb-2 mt-4">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[160px]">Metrik</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[100px]">Status</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[120px]">Target</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Analisis & Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {METRICS_GUIDE.map((metricItem, mIdx) => (
                        <Fragment key={mIdx}>
                          {metricItem.rows.map((row, rIdx) => (
                            <tr key={`${mIdx}-${rIdx}`} className="hover:bg-slate-50/80 transition-colors">
                              {rIdx === 0 && (<td rowSpan={3} className="py-4 px-4 align-top border-r border-slate-50"><span className="text-sm font-black text-slate-800">{metricItem.metric}</span></td>)}
                              <td className="py-4 px-4 align-top"><span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border shadow-sm ${row.bg} ${row.color}`}>{row.status}</span></td>
                              <td className="py-4 px-4 align-top"><span className="text-xs font-bold text-slate-600">{row.range}</span></td>
                              <td className="py-4 px-4 align-top"><p className="text-xs text-slate-500 leading-relaxed font-medium">{row.desc}</p></td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default MerchantSimulator;
