/* Links to related tools on the sister site. */
(function(){const X={"skeleton": [["heart", "Heart and circulation"]], "contraction": [["reaction", "Reaction time"]], "neuroexam": [["nsmap", "Nervous system map"]], "injury": [["skin", "Skin and touch"]], "concussion": [["nsmap", "Nervous system map"]], "joints": [["skeleton", "Skeleton"]]},SITE="https://rjedtech.github.io/Raider-AnatomyLab/",NAME="AnatomyLab";
function put(){const id=location.hash.slice(1).split('@')[0],L=X[id],S=BioLab.sims&&BioLab.sims[id];if(!L||!S||!S.ui||!S.ui.sec)return;const r=S.ui.sec.querySelector('.related');if(!r||S.ui.sec.querySelector('.xsite'))return;
const p=document.createElement('p');p.className='rel-row xsite';p.innerHTML='<span class="rel-l">On '+NAME+'</span>'+L.map(a=>'<a class="chip" href="'+SITE+'#'+a[0]+'" target="_top">'+a[1]+'</a>').join('');r.after(p);}
addEventListener('hashchange',()=>setTimeout(put,60));addEventListener('load',()=>setTimeout(put,200));})();
