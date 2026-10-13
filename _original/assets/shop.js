const ICONS={"phone": "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"/><path d=\"M11 18h2\"/>", "signal": "<path d=\"M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16\"/>", "zap": "<path d=\"M13 2 3 14h9l-1 8 10-12h-9l1-8z\"/>", "wallet": "<path d=\"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\"/><path d=\"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4\"/>", "globe": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20\"/>", "shield": "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/><path d=\"M12 8v6M9 11h6\"/>", "drop": "<path d=\"M12 2.7s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z\"/>", "car": "<path d=\"M5 17h14M3 13l2-6h14l2 6v4H3z\"/><circle cx=\"7\" cy=\"17\" r=\"2\"/><circle cx=\"17\" cy=\"17\" r=\"2\"/>", "cart": "<circle cx=\"8\" cy=\"21\" r=\"1\"/><circle cx=\"19\" cy=\"21\" r=\"1\"/><path d=\"M2 2h3l2.7 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6\"/>", "receipt": "<path d=\"M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .7V2l-1 .7-3-2-3 2-3-2-3 2-3-2z\"/><path d=\"M8 8h8M8 12h8M8 16h5\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/>", "chat": "<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/>", "check": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m8 12 3 3 5-6\"/>"};
const ic=(n,c='w-6 h-6')=>`<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const rp=n=>'Rp'+n.toLocaleString('id-ID');
const CATS={
 pulsa:{name:'Pulsa',ico:'phone',label:'Nomor HP',admin:0,filters:['Telkomsel','Indosat','XL','Tri','Smartfren'],
  items:[5,10,20,25,50,100].flatMap(v=>['Telkomsel','Indosat','XL','Tri','Smartfren'].map((o,i)=>({n:`Pulsa ${v}.000`,b:o,f:o,d:'Masa aktif ikut operator',p:v*1000+1500+i*250,o:v*1000+3000,soldout:v===5&&o==='Tri'})))},
 data:{name:'Paket Data',ico:'signal',label:'Nomor HP',admin:0,filters:['Telkomsel','Indosat','XL','Tri'],
  items:[['3 GB',7],['10 GB',30],['25 GB',30],['50 GB',30]].flatMap(([g,h])=>['Telkomsel','Indosat','XL','Tri'].map((o,i)=>{const p=Math.round((parseInt(g)*2600+12000)*(1-i*.05)/100)*100;return{n:`Kuota ${g}`,b:o,f:o,d:`${h} hari`,p,o:Math.round(p*1.15/100)*100}}))},
 pln:{name:'Token PLN',ico:'zap',label:'No. Meter / ID Pelanggan',admin:2500,filters:['Token','Tagihan'],
  items:[20,50,100,200,500,1000].map(v=>({n:`Token ${v}.000`,b:'PLN',f:'Token',d:'Token langsung dikirim',p:v*1000})).concat([{n:'Tagihan Listrik',b:'PLN',f:'Tagihan',d:'Pascabayar',p:0,bill:1}])},
 ewallet:{name:'E-Wallet',ico:'wallet',label:'Nomor Akun',admin:1000,filters:['GoPay','OVO','DANA','ShopeePay'],
  items:[25,50,100,200].flatMap(v=>['GoPay','OVO','DANA','ShopeePay'].map(o=>({n:`Saldo ${v}.000`,b:o,f:o,d:'Top up instan',p:v*1000})))},
 internet:{name:'Internet',ico:'globe',label:'ID Pelanggan',admin:2500,filters:['IndiHome','Biznet','MyRepublic','First Media'],
  items:['IndiHome','Biznet','MyRepublic','First Media'].map(o=>({n:'Tagihan Bulanan',b:o,f:o,d:'Sesuai tagihan',p:0,bill:1}))},
 bpjs:{name:'BPJS',ico:'shield',label:'Nomor VA',admin:2500,filters:['Kesehatan','Ketenagakerjaan'],
  items:[{n:'Iuran Kesehatan',b:'BPJS Kesehatan',f:'Kesehatan',d:'Sesuai kelas',p:0,bill:1},{n:'Iuran Ketenagakerjaan',b:'BPJS Ketenagakerjaan',f:'Ketenagakerjaan',d:'Peserta mandiri',p:0,bill:1}]},
 pdam:{name:'PDAM',ico:'drop',label:'ID Pelanggan',admin:2500,filters:['Jawa','Sumatra','Kalimantan','Sulawesi'],
  items:[['Kota Bandung','Jawa'],['Surabaya','Jawa'],['PAM Jaya Jakarta','Jawa'],['Tirtanadi Medan','Sumatra'],['Banjarmasin','Kalimantan'],['Makassar','Sulawesi']].map(([n,f])=>({n:'Tagihan Air',b:n,f,d:'Sesuai tagihan',p:0,bill:1}))},
 finance:{name:'Multifinance',ico:'car',label:'Nomor Kontrak',admin:5000,filters:['Motor','Mobil','Elektronik'],
  items:[['Adira Finance','Motor'],['FIF Group','Motor'],['BAF','Mobil'],['Mandiri Tunas','Mobil'],['Home Credit','Elektronik']].map(([n,f])=>({n:'Angsuran',b:n,f,d:'Sesuai jadwal',p:0,bill:1}))}
};
const BC={Telkomsel:'#E11D2A',Indosat:'#F5B800',XL:'#1C4FA1',Tri:'#6D28D9',Smartfren:'#E4007F',GoPay:'#00AED6',OVO:'#4C2A86',DANA:'#118EEA',ShopeePay:'#EE4D2D',PLN:'#0B7FB0'};
const LOGO={Biznet:1,FirstMedia:1,BPJSKesehatan:1,BPJSKetenagakerjaan:1,AdiraFinance:1,FIFGroup:1,MandiriTunas:1,Telkomsel:1,Indosat:1,XL:1,Smartfren:1,GoPay:1,OVO:1,DANA:1,ShopeePay:1,PLN:1};
function card(k,i,idx){
  const INI={Telkomsel:'TS',Indosat:'IM3',XL:'XL',Tri:'3',Smartfren:'SF',GoPay:'GP',OVO:'OVO',DANA:'DN',ShopeePay:'SP',PLN:'PLN'};
  const BADGE={Telkomsel:'#DC2626',Indosat:'#FDB022',XL:'#1D4ED8',Tri:'#7C3AED',Smartfren:'#DB2777',GoPay:'#0284C7',OVO:'#4C1D95',DANA:'#0369A1',ShopeePay:'#EA580C',PLN:'#0E7490'};
  const CHK='<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>';
  
  const bg=BADGE[i.b]||'#4338CA',dark=i.b==='Indosat';
  const ini=INI[i.b]||i.b.replace(/[^A-Z0-9]/g,'').slice(0,3)||i.b.slice(0,2).toUpperCase();
  const disc=!i.bill&&i.o&&i.o>i.p?Math.round((1-i.p/i.o)*100):0, out=!!i.soldout;
  const price=i.bill?`<div class="pc-price">Cek tagihan</div><div class="pc-note">Nominal sesuai tagihan</div>`
   :`<div class="pc-row"><span class="pc-price">${rp(i.p)}</span>${i.o?`<s class="pc-old">${rp(i.o)}</s>`:''}</div>${i.o&&i.o>i.p?`<span class="pc-save">Hemat ${rp(i.o-i.p)}</span>`:'<span class="pc-save pc-save--ghost">&nbsp;</span>'}`;
  return `<article class="pc${out?' pc--out':''}">
   <div class="pc-head"><span class="pc-logo" style="background:${bg};color:${dark?'#1B1B4B':'#fff'}">${ini}</span><span class="pc-op">${i.b}</span>${disc?`<span class="pc-disc">-${disc}%</span>`:''}${out?'<span class="pc-disc pc-disc--out">Habis</span>':''}</div>
   <h3 class="pc-name">${i.n.replace('Saldo','Saldo').replace(/^Kuota/,'Kuota')}</h3>
   <div class="pc-sub">${CHK}<span>${i.d}</span></div>
   <hr class="pc-hr">
   <div class="pc-pb">${price}</div>
   <button class="pc-btn" ${out?'disabled aria-disabled="true"':''} onclick="openBuy('${k}',${idx})">${out?'Stok habis':'Beli'}</button>
  </article>`;
}
function skel(n){return Array.from({length:n},()=>`<div class="pc pc--skel" aria-hidden="true"><div class="pc-head"><span class="sk sk-c"></span><span class="sk" style="width:60px;height:12px"></span></div><span class="sk" style="width:75%;height:20px"></span><span class="sk" style="width:60%;height:12px;margin-top:8px"></span><hr class="pc-hr"><span class="sk" style="width:55%;height:22px"></span><span class="sk" style="width:40%;height:18px;margin-top:8px"></span><span class="sk" style="height:44px;margin-top:auto;border-radius:10px"></span></div>`).join('')}
function openBuy(k,idx){
  const i=CATS[k].items[idx],m=document.getElementById('buy');
  m.innerHTML=`<form method="dialog" class="p-6" onsubmit="return buyNow(event,'${k}',${idx})">
   <div class="flex justify-between items-start"><div><div class="text-sm text-slate-500">${i.b}</div><h3 class="text-xl font-bold">${CATS[k].name} — ${i.n}</h3></div><button type="button" onclick="buy.close()" class="text-2xl leading-none" aria-label="Tutup">×</button></div>
   <label class="block mt-5 text-sm font-medium" for="tgt">${CATS[k].label}</label>
   <input id="tgt" required inputmode="numeric" class="inp" placeholder="Masukkan ${CATS[k].label.toLowerCase()}">
   <div class="mt-4 text-sm flex justify-between"><span class="text-slate-500">Harga</span><span>${i.bill?'Dicek saat bayar':rp(i.p)}</span></div>
   <div class="text-sm flex justify-between mt-1"><span class="text-slate-500">Biaya admin</span><span>${rp(CATS[k].admin)}</span></div>
   <div class="text-sm flex justify-between mt-2 pt-2 border-t font-bold"><span>Total</span><span>${i.bill?'Sesuai tagihan':rp(i.p+CATS[k].admin)}</span></div>
   <p id="berr" class="text-sm text-red-600 mt-2" role="alert"></p>
   <button class="btn-primary w-full mt-3">Lanjut ke Pembayaran</button></form>`;
  m.showModal();
}
const PAY=[
 ['QRIS','qris','Scan dari semua e-wallet & m-banking',0],
 ['Virtual Account','va','BCA, Mandiri, BNI, BRI',[['BCA','va-bca'],['Mandiri','va-mandiri'],['BNI','va-bni'],['BRI','va-bri']]],
 ['E-Wallet','ew','Bayar langsung dari aplikasi',[['GoPay','gopay'],['OVO','ovo'],['DANA','dana'],['ShopeePay','shopeepay']]]];
const FEE={qris:0,'va-bca':1000,'va-mandiri':1000,'va-bni':1000,'va-bri':1000,gopay:0,ovo:0,dana:0,shopeepay:0};
let PEND=null;
function buyNow(e,k,idx){
  e.preventDefault();const t=document.getElementById('tgt').value.replace(/\D/g,'');
  if(t.length<8){document.getElementById('berr').textContent='Nomor minimal 8 digit.';return false}
  PEND={k,idx,t};payStep();return false;
}
function payStep(){
  const {k,idx,t}=PEND,i=CATS[k].items[idx],sub=i.bill?0:i.p+CATS[k].admin;
  const opt=(v,l,d)=>`<label class="pm"><input type="radio" name="pm" value="${v}" onchange="payTot(${sub})"><span class="pm-b"><b>${l}</b>${d?`<small>${d}</small>`:''}</span><span class="pm-f">${FEE[v]?'+'+rp(FEE[v]):'Gratis'}</span></label>`;
  document.getElementById('buy').innerHTML=`<form class="p-6" onsubmit="return placeOrder(event)">
   <div class="flex justify-between items-start"><div><button type="button" class="text-sm font-semibold text-indigo-700" onclick="openBuy('${k}',${idx})">← Ubah nomor</button><h3 class="text-xl font-bold mt-1">Pilih Metode Pembayaran</h3></div><button type="button" onclick="buy.close()" class="text-2xl leading-none" aria-label="Tutup">×</button></div>
   <div class="pm-sum"><span>${CATS[k].name} ${i.b} – ${i.n}</span><span>Tujuan: ${t}</span></div>
   <fieldset class="pm-list"><legend class="sr-only">Metode pembayaran</legend>
    ${PAY.map(([g,v,d,sub2])=>`<div class="pm-g">${g}</div>${Array.isArray(sub2)?sub2.map(([l,vv])=>opt(vv,l,'')).join(''):opt(v,g,d)}`).join('')}
   </fieldset>
   <div class="text-sm flex justify-between mt-4"><span class="text-slate-500">Harga + admin</span><span>${i.bill?'Sesuai tagihan':rp(sub)}</span></div>
   <div class="text-sm flex justify-between mt-1"><span class="text-slate-500">Biaya layanan pembayaran</span><span id="pfee">–</span></div>
   <div class="flex justify-between mt-2 pt-2 border-t font-bold"><span>Total bayar</span><span id="ptot">${i.bill?'Sesuai tagihan':rp(sub)}</span></div>
   <p id="perr" class="text-sm text-red-600 mt-2" role="alert"></p>
   <button class="btn-primary w-full mt-3" id="pbtn">Bayar Sekarang</button></form>`;
}
function payTot(sub){const v=document.querySelector('[name=pm]:checked').value,f=FEE[v];document.getElementById('pfee').textContent=f?rp(f):'Gratis';if(sub)document.getElementById('ptot').textContent=rp(sub+f);document.getElementById('perr').textContent=''}
function placeOrder(e){
  e.preventDefault();const c=document.querySelector('[name=pm]:checked');
  if(!c){document.getElementById('perr').textContent='Pilih metode pembayaran dulu.';return false}
  const b=document.getElementById('pbtn');b.disabled=true;b.textContent='Memproses…';
  const {k,idx,t}=PEND,i=CATS[k].items[idx],m=c.value,lbl=c.closest('label').querySelector('b').textContent;
  setTimeout(()=>{
  const ref='AVD-'+Date.now().toString(36).toUpperCase(),tot=i.bill?0:i.p+CATS[k].admin+FEE[m];
  const tx={id:ref,k,n:`${CATS[k].name} ${i.b} – ${i.n}`,t,p:tot,d:Date.now(),s:'pending',pm:lbl};
  try{const l=JSON.parse(localStorage.getItem('avd_tx')||'[]');l.unshift(tx);localStorage.setItem('avd_tx',JSON.stringify(l.slice(0,20)))}catch(_){}
  const va=m.startsWith('va-')?'8808 '+String(Date.now()).slice(-10).replace(/(\d{4})(\d{4})(\d{2})/,'$1 $2 $3'):'';
  const how=m==='qris'?`<div class="pm-qr" aria-label="Kode QR contoh">${Array.from({length:49},(_,j)=>`<i style="background:${(j*7+j%3)%3?'#1B1B4B':'#fff'}"></i>`).join('')}</div><p class="text-sm text-slate-500 mt-2">Scan QRIS ini dengan aplikasi e-wallet atau m-banking.</p>`
   :va?`<p class="text-sm text-slate-500">Nomor Virtual Account ${lbl}</p><p class="font-mono font-bold text-xl mt-1">${va}</p>`
   :`<p class="text-sm text-slate-500">Kamu akan diarahkan ke aplikasi ${lbl} untuk menyelesaikan pembayaran.</p>`;
  document.getElementById('buy').innerHTML=`<div class="p-8 text-center"><h3 class="text-2xl font-bold">Selesaikan Pembayaran</h3>
   <p class="text-slate-500 mt-1">Total <b class="text-[color:var(--brand-d)]">${tot?rp(tot):'sesuai tagihan'}</b> · bayar sebelum <b>${new Date(Date.now()+864e5).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</b></p>
   <div class="mt-5">${how}</div>
   <p class="text-slate-500 mt-5 text-sm">ID transaksi</p><p class="font-mono font-bold text-lg">${ref}</p>
   <p class="text-xs text-slate-500 mt-3">Mode pratinjau: tidak ada pembayaran nyata yang diproses.</p>
   <a class="btn-primary w-full mt-5 inline-block" href="/cek-transaksi?id=${ref}">Cek Status</a><button class="w-full mt-3 text-sm font-semibold text-slate-600" onclick="buy.close()">Tutup</button></div>`;
  },600);return false;
}
function toast(s){const t=document.getElementById('toast');if(!t)return;t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
