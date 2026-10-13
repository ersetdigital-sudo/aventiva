(function(){
const C=typeof SITE!=='undefined'?SITE:{waNumber:'',waDisplay:'-',email:'',hours:'',social:{instagram:'#',facebook:'#',tiktok:'#'}};
const S=(p,w=20)=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I={
 tag:'<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
 zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
 lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 ig:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
 fb:'<path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z"/>',
 tt:'<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3a5 5 0 0 0 5 5"/>',
 wa:'<path d="M3 21l1.7-4.6A9 9 0 1 1 8 19.6z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2.3-2.3l.8-1-1-2z"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 chev:'<path d="m6 9 6 6 6-6"/>', up:'<path d="m6 15 6-6 6 6"/>'};
const cols=[
 ['Produk',[['Pulsa','/layanan?c=pulsa'],['Paket Data','/layanan?c=data'],['Token PLN','/layanan?c=pln'],['E-Wallet','/layanan?c=ewallet'],['Internet','/layanan?c=internet'],['BPJS','/layanan?c=bpjs'],['PDAM','/layanan?c=pdam'],['Multifinance','/layanan?c=multifinance']]],
 ['Bantuan',[['Cara Transaksi','/bantuan?k=cara'],['Cek Transaksi','/cek-transaksi'],['FAQ','/bantuan#faq'],['Hubungi Kami','/bantuan#kontak'],['Pusat Bantuan','/bantuan']]],
 ['Perusahaan',[['Tentang Kami','#'],['Syarat & Ketentuan','#'],['Kebijakan Privasi','#'],['Kemitraan/Reseller','#']]]];
const trust=[['tag','Harga Transparan','Biaya admin terlihat sebelum bayar'],['zap','Transaksi Cepat','Proses otomatis 24/7'],['lock','Pembayaran Aman','Berbagai metode pembayaran resmi']];
const pays=[['QRIS','#E4002B'],['BCA','#0060AF'],['Mandiri','#003D79'],['BNI','#F15A23'],['BRI','#00529C'],['GoPay','#00AED6'],['OVO','#4C2A86'],['DANA','#118EEA'],['ShopeePay','#EE4D2D']];
const f=document.createElement('footer');f.className='ft';
f.innerHTML=`
<div class="ft-trust"><div class="ft-wrap ft-trust-g">${trust.map(([i,t,d])=>`<div class="ft-tr"><span class="ft-tri">${S(I[i],32)}</span><div><b>${t}</b><p>${d}</p></div></div>`).join('')}</div></div>
<div class="ft-wrap ft-main">
 <div class="ft-brand">
  <a href="/" class="ft-logo">aventiva<span>.</span></a>
  <p>Platform pembelian pulsa, paket data, token PLN, e-wallet, dan pembayaran tagihan dengan harga jelas dan proses otomatis.</p>
  <div class="ft-soc">${[['ig','Instagram',C.social.instagram],['fb','Facebook',C.social.facebook],['tt','TikTok',C.social.tiktok],['wa','WhatsApp','https://wa.me/'+C.waNumber]].map(([i,l,u])=>`<a href="${u}" aria-label="${l}" target="_blank" rel="noopener">${S(I[i])}</a>`).join('')}</div>
 </div>
 ${cols.map(([h,ls],n)=>`<div class="ft-col"><button class="ft-h" aria-expanded="false" aria-controls="ftc${n}">${h}<span class="ft-chev">${S(I.chev,18)}</span></button><ul id="ftc${n}">${ls.map(([t,u])=>`<li><a href="${u}">${t}</a></li>`).join('')}</ul></div>`).join('')}
</div>
<div class="ft-wrap ft-cp">
 <div class="ft-contact">
  <a href="https://wa.me/${C.waNumber}" target="_blank" rel="noopener">${S(I.wa,18)}<span>WhatsApp CS: <b>${C.waDisplay}</b></span></a>
  <a href="mailto:${C.email}">${S(I.mail,18)}<span>${C.email}</span></a>
  <span>${S(I.clock,18)}<span>CS: ${C.hours}</span></span>
 </div>
 <div class="ft-pay"><span class="ft-pl">Metode pembayaran</span><div>${pays.map(([n,c])=>`<span class="ft-chip" style="--c:${c}">${n}</span>`).join('')}</div></div>
</div>
<div class="ft-bot"><div class="ft-wrap ft-bot-in"><span>© 2026 Aventiva Digital. Seluruh hak dilindungi.</span><nav><a href="#">Syarat &amp; Ketentuan</a><span aria-hidden="true">|</span><a href="#">Kebijakan Privasi</a></nav></div></div>`;
const old=document.querySelector('footer');old?old.replaceWith(f):document.body.appendChild(f);
f.querySelectorAll('.ft-h').forEach(b=>b.addEventListener('click',()=>{if(innerWidth>=768)return;const o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',!o);b.parentElement.classList.toggle('open',!o)}));
const up=document.createElement('button');up.className='ft-up';up.setAttribute('aria-label','Kembali ke atas');up.innerHTML=S(I.up,22);
up.onclick=()=>scrollTo({top:0,behavior:'smooth'});document.body.appendChild(up);
const chk=()=>up.classList.toggle('show',scrollY>400);addEventListener('scroll',chk,{passive:true});chk();
})();
