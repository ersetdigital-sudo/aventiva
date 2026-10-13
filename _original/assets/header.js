(function(){
const P={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',receipt:'<path d="M5 3v18l2.5-1.5L10 21l2-1.5 2 1.5 2.5-1.5L19 21V3l-2.5 1.5L14 3l-2 1.5L10 3 7.5 4.5z"/><path d="M9 9h6M9 13h6"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2M12 17h.01"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>'};
const sv=(d,c='w-5 h-5')=>`<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const path=location.pathname.replace(/\/$/,''),onCek=path==='/cek-transaksi',onHelp=path==='/bantuan';
const qs=new URLSearchParams(location.search),onCat=location.pathname.startsWith('/layanan'),act=onCat?(qs.get('c')||'pulsa'):'';
const cats=Object.entries(CATS).map(([k,c])=>`<a href="/layanan?c=${k}" class="hn-cat${k===act?' is-active':''}" ${k===act?'aria-current="page"':''}>${ic(c.ico,'w-5 h-5')}<span>${c.name}</span></a>`).join('');
const search=(id)=>`<form action="/layanan" role="search" class="hn-search"><span class="hn-sico">${sv(P.search)}</span><input id="${id}" name="q" value="${(qs.get('q')||'').replace(/"/g,'')}" placeholder="Cari pulsa, kuota, token PLN, BPJS…" aria-label="Cari produk" autocomplete="off"><button type="submit">Cari</button></form>`;
const h=document.getElementById('site-header');
h.className='hn';
h.innerHTML=`<div class="hn-wrap">
 <div class="hn-main">
  <a href="/" class="hn-logo">aventiva<span>.</span></a>
  <div class="hn-mid">${search('q')}</div>
  <div class="hn-right">
   <a href="/cek-transaksi" class="hn-link${onCek?' is-active':''}" ${onCek?'aria-current="page"':''}>${sv(P.receipt)}<span class="hn-lbl">Cek Transaksi</span></a>
   <a href="/bantuan" class="hn-link${onHelp?' is-active':''}" ${onHelp?'aria-current="page"':''}>${sv(P.help)}<span class="hn-lbl">Bantuan</span></a>
  </div>
  <div class="hn-mob">
   <button class="hn-ib" id="hnS" aria-label="Tampilkan pencarian" aria-expanded="false">${sv(P.search,'w-6 h-6')}</button>
   <button class="hn-ib" id="hnM" aria-label="Menu" aria-expanded="false">${sv(P.menu,'w-6 h-6')}</button>
  </div>
 </div>
 <div class="hn-msearch" id="hnMS">${search('q2')}</div>
 <nav class="hn-nav" aria-label="Kategori produk">${cats}</nav>
</div>
<div class="hn-drawer" id="hnD" hidden>
 <a href="/cek-transaksi" class="${onCek?'is-active':''}">${sv(P.receipt)} Cek Transaksi</a><a href="/bantuan" class="${onHelp?'is-active':''}">${sv(P.help)} Bantuan</a>
</div>`;
const tg=(b,el)=>{const o=el.classList.toggle('open');if(el.hidden!==undefined&&el.id==='hnD')el.hidden=!o;b.setAttribute('aria-expanded',o)};
document.getElementById('hnS').onclick=e=>tg(e.currentTarget,document.getElementById('hnMS'));
document.getElementById('hnM').onclick=e=>{const b=e.currentTarget,d=document.getElementById('hnD');d.hidden=!d.hidden;b.setAttribute('aria-expanded',!d.hidden);b.innerHTML=sv(d.hidden?P.menu:P.x,'w-6 h-6')};
const sh=()=>h.classList.toggle('scrolled',scrollY>4);addEventListener('scroll',sh,{passive:true});sh();
const a=h.querySelector('.is-active');if(a)a.scrollIntoView({inline:'center',block:'nearest'});
})();
