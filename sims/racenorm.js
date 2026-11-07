(function(){
'use strict';
const {clamp,rr,txt,pill,atLeast,PAL,FONT,axes,legend,fmtNum}=BioLab.h;

/* Who is "normal" after a concussion? A neurocognitive score compared with three norm tables.
   ILLUSTRATIVE scale: standard scores, population mean 100, SD 15.
   Race-adjusted table (the practice the NFL settlement used until 2021): in this illustration, players recorded as Black are compared with a mean 10 points lower.
   Own baseline: today's score minus the athlete's preseason score, with a test-retest SD of 8 points.
   Impaired when z ≤ −cutoff (1.5 unless changed at Deep dive). */
const POP={m:100,sd:15},RACE_SHIFT=10,RETEST=8;
const TABLES={pop:'Population norm',race:'Race-adjusted norm',base:'Own preseason baseline'};
const B=sim=>sim.p.black==='yes';
const cut=sim=>atLeast('ap')?sim.p.cut:1.5;
function ref(sim,t){t=t||sim.p.table;if(t==='pop')return {m:POP.m,sd:POP.sd};if(t==='race')return {m:POP.m-(B(sim)?RACE_SHIFT:0),sd:POP.sd};return {m:sim.p.base,sd:RETEST};}
const zOf=(sim,t)=>{const r=ref(sim,t);return (sim.p.score-r.m)/r.sd;};
const imp=(sim,t)=>zOf(sim,t)<=-cut(sim)+1e-9;
/* highest whole score that still counts as impaired */
const cutScore=(sim,t)=>{const r=ref(sim,t);return Math.floor(r.m-cut(sim)*r.sd+1e-9);};
function phi(z){const x=z/Math.SQRT2,t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return 0.5*(1+(x>=0?y:-y));}
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const pctTxt=z=>{const p=100*phi(z);return p<1?'below the 1st':p>99?'above the 99th':Math.round(p)+(Math.round(p)%10===1&&Math.round(p)!==11?'st':Math.round(p)%10===2&&Math.round(p)!==12?'nd':Math.round(p)%10===3&&Math.round(p)!==13?'rd':'th');};
const key=sim=>[sim.p.score,sim.p.table,sim.p.black,sim.p.base,sim.p.cut].join('|');
const BTN=[['yes','Impaired'],['no','Not impaired']];
const truth=sim=>imp(sim)?'yes':'no';
const shown=sim=>sim.st&&sim.st.revealed;
const callNow=sim=>{const c=sim.st&&sim.st.call;return c&&c.key===key(sim)?c:null;};
const btnRect=(i,sY,sH,X0,X1)=>{const gp=12,w=(X1-X0-gp)/2;return [X0+i*(w+gp),sY+4,w,sH-8];};
function wrap(ctx,s,x,y,w,o){o=o||{};const size=o.s||13,lh=o.lh||size*1.3;ctx.font=(o.w||400)+' '+size+'px '+FONT;let line='',yy=y;
  String(s).split(' ').forEach(word=>{const t=line?line+' '+word:word;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,yy,{s:size,w:o.w,c:o.c,a:o.a});yy+=lh;line=word;}else line=t;});
  if(line){txt(ctx,line,x,yy,{s:size,w:o.w,c:o.c,a:o.a});yy+=lh;}return yy;}
const TCOL={pop:'s2',race:'s4',base:'s3'};

const SIM={
 id:'racenorm',hash:'racenorm',apUnit:2,order:3,kind:'Learning tool',tab:'Who is “normal” after a concussion?',prereq:['concussion'],
 card:'Score a thinking test against three norm tables, and see why the athlete’s own preseason baseline is the fair comparison.',
 title:'Who is “normal” after a concussion?',
 lede:{bio:'A thinking test after a head injury gives a raw score. Whether that score counts as “impaired” depends on who you compare it with. Change the comparison and the same score gets a different answer.',
  honors:'Scores are turned into z-scores and percentiles against a norm table. The NFL concussion settlement once used race-adjusted norms that assumed lower starting scores for Black players. Compare those with population norms and with the athlete’s own baseline.',
  ap:'Impairment is z ≤ −1.5 against a reference mean and SD. Find the cutoff score under each table, and use the test-retest spread to judge a change from baseline.'},
 scale:'One test session, about 20 to 30 minutes. Scores here are on a standard scale: average 100, and most healthy people score between 85 and 115.',
 aspect:16/9,timeless:true,trials:true,graph:true,controlsTitle:'The test',
 controls:[
  {id:'score',label:'Today’s score',type:'range',min:40,max:130,step:1,def:74,help:'What you enter stays in this browser tab.'},
  {id:'table',label:'Compare with',type:'seg',def:'race',options:[{v:'pop',l:'Population norm'},{v:'race',l:'Race-adjusted norm'},{v:'base',l:'Own baseline'}]},
  {id:'black',label:'Player recorded as (only the race-adjusted norm uses it)',type:'seg',def:'yes',options:[{v:'yes',l:'Black'},{v:'no',l:'Not Black'}]},
  {id:'base',label:'Preseason baseline score',type:'range',min:60,max:130,step:1,def:112,help:'The same test taken before the season, when the athlete was healthy.'},
  {id:'call',label:'Your call: impaired or not, against this table?',type:'seg',def:'yes',noTrial:true,options:BTN.map(b=>({v:b[0],l:b[1]})),help:'Make your call before you look, then press Lock in my call.'},
  {id:'cut',label:'Impairment cutoff (standard deviations below)',type:'range',min:1,max:2,step:0.1,def:1.5,d:1,lvl:'ap',help:'1.5 is an assumption for illustration. Different programs use different cutoffs.'}
 ],
 actions:[
  {id:'lock',label:'Lock in my call',primary:true,run(sim){sim.st.call={pick:sim.p.call,key:key(sim),truth:truth(sim)};sim.st.revealed=true;}},
  {id:'show',label:'Show the math',run(sim){sim.st.revealed=true;}},
  {id:'hide',label:'New call: hide the results',run(sim){sim.st.revealed=false;sim.st.call=null;}},
  {id:'retiree',label:'Case: retired player',run(sim){BioLab.setValues(sim,{score:74,table:'race',black:'yes'});sim.st.revealed=false;sim.st.call=null;}},
  {id:'teammate',label:'Case: your teammate after a hit',run(sim){BioLab.setValues(sim,{score:96,table:'pop',base:112});sim.st.revealed=false;sim.st.call=null;}}
 ],
 init(){return {revealed:false,call:null};},step(){},
 metrics:[
  {id:'z',label:'z-score against this table',unit:'',d:2,min:-5,max:3,get:sim=>zOf(sim)},
  {id:'pct',label:'Percentile against this table',unit:'',d:1,min:0,max:100,get:sim=>100*phi(zOf(sim))},
  {id:'dec',label:'Decision under each table',text:true,noTrial:true,get:sim=>['pop','race','base'].map(t=>({pop:'Population',race:'Race-adjusted',base:'Baseline'})[t]+': '+(imp(sim,t)?'impaired':'not')).join(' · ')},
  {id:'cutS',label:'Impaired at or below (this table)',unit:'points',d:0,lvl:'honors',min:0,max:null,get:sim=>cutScore(sim)},
  {id:'zPop',label:'z, population norm',unit:'',d:2,lvl:'honors',min:-5,max:3,get:sim=>zOf(sim,'pop')},
  {id:'zRace',label:'z, race-adjusted norm',unit:'',d:2,lvl:'honors',min:-5,max:3,get:sim=>zOf(sim,'race')},
  {id:'zBase',label:'z, change from own baseline',unit:'',d:2,lvl:'honors',min:-8,max:5,get:sim=>zOf(sim,'base')},
  {id:'gap',label:'Points still to fall before this table says impaired',unit:'points',d:0,lvl:'ap',min:0,max:null,get:sim=>Math.max(0,sim.p.score-cutScore(sim))}
 ],
 graphs:[{id:'pctg',label:'Percentile vs. score',custom:true}],defaultGraph:'pctg',
 plot(sim,ctx,box){const ax=axes(ctx,box,{xmin:40,xmax:130,ymin:0,ymax:100,xl:'Today’s score',yl:'Percentile'});
  const pc=100*phi(-cut(sim));ctx.strokeStyle=PAL['s1'];ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(ax.X(40),ax.Y(pc));ctx.lineTo(ax.X(130),ax.Y(pc));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Impaired below this line',ax.X(130)-4,ax.Y(pc)-6,{s:12,c:PAL['s1'],a:'right',w:700});
  const L=[];['pop','race','base'].forEach(t=>{if(t==='race'&&!B(sim))return;const r=ref(sim,t);ctx.strokeStyle=PAL[TCOL[t]];ctx.lineWidth=t===sim.p.table?3.5:2;ctx.beginPath();for(let s=40;s<=130;s+=1){const px=ax.X(s),py=ax.Y(100*phi((s-r.m)/r.sd));s===40?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();L.push({label:TABLES[t],color:PAL[TCOL[t]]});});
  if(shown(sim)){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(sim.p.score),ax.Y(0));ctx.lineTo(ax.X(sim.p.score),ax.Y(100));ctx.stroke();}
  legend(ctx,box.L+12,box.T+12,L);},
 draw(sim,ctx,vdt,k){const W=800,H=450,p=sim.p,sh=shown(sim),big=k>1.3,t=p.table,r=ref(sim),col=PAL[TCOL[t]];sim.vis.k=k;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const X0=24,X1=776,SMIN=40,SMAX=140,X=s=>X0+(clamp(s,SMIN,SMAX)-SMIN)/(SMAX-SMIN)*(X1-X0);
  const sH=Math.max(46,30*k+16),sY=H-12-sH;
  /* the three tables as number lines */
  const rowsTop=Math.max(232,sY-12-3*(16*k+22)),rh=(sY-12-rowsTop)/3;
  /* top: the selected table as a bell curve */
  const ty=20+12*k,SHORT={pop:'Population norm',race:'Race-adjusted',base:'Own baseline'};txt(ctx,big?SHORT[t]+(t==='race'?(B(sim)?' (Black)':' (not Black)'):''):'Healthy players: '+TABLES[t].toLowerCase()+(t==='race'?(B(sim)?' (Black players)':' (not Black)'):''),X0,ty,{s:13*k,w:800,c:col});
  const base=rowsTop-16*k-18,top=ty+12,peak=base-top,yAt=s=>base-peak*Math.exp(-0.5*Math.pow((s-r.m)/r.sd,2)),cS=r.m-cut(sim)*r.sd;
  if(sh){ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(X(SMIN),base);for(let s=SMIN;s<=cS;s+=0.5)ctx.lineTo(X(s),yAt(s));ctx.lineTo(X(cS),yAt(cS));ctx.lineTo(X(cS),base);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
  ctx.fillStyle=col;ctx.globalAlpha=.15;ctx.beginPath();ctx.moveTo(X(SMIN),base);for(let s=SMIN;s<=SMAX;s+=0.5)ctx.lineTo(X(s),yAt(s));ctx.lineTo(X(SMAX),base);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();for(let s=SMIN;s<=SMAX;s+=0.5){s===SMIN?ctx.moveTo(X(s),yAt(s)):ctx.lineTo(X(s),yAt(s));}ctx.stroke();
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X0,base);ctx.lineTo(X1,base);ctx.stroke();
  for(let s=40;s<=140;s+=(big?20:10))txt(ctx,String(s),X(s),base+14*k+2,{s:12*k,c:PAL['cv-soft'],a:'center'});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(r.m),base);ctx.lineTo(X(r.m),base-peak);ctx.stroke();
  txt(ctx,(t==='base'?'baseline ':'average ')+Math.round(r.m),X(r.m)+6,base-0.3*peak,{s:12*k,c:PAL['cv-soft']});
  if(sh){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(cS),base);ctx.lineTo(X(cS),yAt(cS)-10);ctx.stroke();
   txt(ctx,(big?'Impaired: ':'Impaired at or below ')+cutScore(sim)+(big?' or lower':''),X1,ty,{s:12*k,w:700,c:PAL['s1'],a:'right'});}
  const sx=X(p.score);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx,base);ctx.lineTo(sx,top+18*k+8);ctx.stroke();
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(sx,base,6,0,7);ctx.fill();
  const lab='Score '+p.score+(sh?', '+pctTxt(zOf(sim))+' percentile':'');ctx.font='700 '+(12*k)+'px '+FONT;const lw=ctx.measureText(lab).width;
  pill(ctx,lab,clamp(sx,X0+lw/2+10,X1-lw/2-10),top+18*k,PAL['rj'],'#fff',12*k);
  /* rows: every table at once */
  const RX0=big?X0:200;
  ['pop','race','base'].forEach((tt,i)=>{const y=rowsTop+i*rh,mid=y+rh/2,rr0=ref(sim,tt),cs=cutScore(sim,tt),on=tt===t;
   if(on){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,X0-10,y+2,X1-X0+20,rh-4,8);ctx.fill();}
   const name=TABLES[tt]+(tt==='race'?(B(sim)?' (Black)':' (not Black)'):'');
   if(!big)txt(ctx,name,X0,mid+4*k,{s:12*k,w:on?800:600,c:PAL[TCOL[tt]]});
   const lx0=big?X0:RX0,lx1=X1-(big?0:150),LX=s=>lx0+(clamp(s,SMIN,SMAX)-SMIN)/(SMAX-SMIN)*(lx1-lx0),ly=big?mid+6*k:mid;
   if(big)txt(ctx,name,X0,y+12*k+2,{s:12*k,w:on?800:600,c:PAL[TCOL[tt]]});
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(lx0,ly);ctx.lineTo(lx1,ly);ctx.stroke();
   if(sh){ctx.strokeStyle=PAL['s1'];ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(lx0,ly);ctx.lineTo(LX(cs),ly);ctx.stroke();ctx.globalAlpha=1;}
   ctx.lineCap='butt';ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(LX(p.score),ly,6,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();
   if(!big||sh){const im=imp(sim,tt),tx=sh?(im?'Impaired':'Not impaired'):'?';
    if(big){txt(ctx,tx,X1,y+12*k+2,{s:12*k,w:700,c:sh&&im?PAL['s1']:PAL['cv-soft'],a:'right'});}
    else pill(ctx,tx,X1-70,mid,sh&&im?PAL['s1']:PAL['card2'],sh&&im?'#fff':PAL['cv-ink'],12*k);}});
  /* the call */
  const c=callNow(sim);
  if(!sh){BTN.forEach((b,i)=>{const q=btnRect(i,sY,sH,X0,X1);ctx.fillStyle=PAL['card'];rr(ctx,q[0],q[1],q[2],q[3],9);ctx.fill();ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.stroke();txt(ctx,b[1]+(big?'':' against the '+TABLES[t].toLowerCase()),q[0]+q[2]/2,q[1]+q[3]/2+1,{s:12*k,w:700,a:'center',b:'middle'});});return;}
  ctx.fillStyle=PAL['card2'];rr(ctx,X0,sY,X1-X0,sH,10);ctx.fill();
  const msg=(c?('Your call: '+(c.pick==='yes'?'impaired':'not impaired')+'. '+(c.pick===c.truth?'That matches the math. ':'Not quite. ')):'')+'Against the '+TABLES[t].toLowerCase()+', a '+p.score+' is z = '+f2(zOf(sim))+': '+(imp(sim)?'impaired.':'not impaired.');
  ctx.font='700 '+(12*k)+'px '+FONT;const two=ctx.measureText(msg).width>X1-X0-24;
  wrap(ctx,msg,X0+12,sY+sH/2+4*k-(two?7*k:0),X1-X0-24,{s:12*k,w:700,c:c&&c.pick!==c.truth?PAL['s1']:PAL['cv-ink']});},
 onClick(sim,x,y){if(shown(sim))return;const k=sim.vis&&sim.vis.k||1,sH=Math.max(46,30*k+16),sY=450-12-sH;
  BTN.forEach((b,i)=>{const q=btnRect(i,sY,sH,24,776);if(x>=q[0]&&x<=q[0]+q[2]&&y>=q[1]-4&&y<=q[1]+q[3]+4){BioLab.setValues(sim,{call:b[0]});SIM.actions[0].run(sim);}});},
 narrate(sim){const p=sim.p,t=p.table,z=zOf(sim);
  if(!shown(sim))return '<b>Make your call:</b> against the '+TABLES[t].toLowerCase()+', is a score of '+p.score+' impaired? Click your pick under the chart. The red cutoff appears after you choose.';
  const c=callNow(sim),lead=c?(c.pick===c.truth?'<b>Your call matched the math.</b> ':'<b>Not quite.</b> '):'';
  if(t==='race'&&B(sim))return lead+'The race-adjusted table assumes Black players start '+RACE_SHIFT+' points lower, so '+p.score+' is z = '+f2(z)+' ('+pctTxt(z)+' percentile). '+(imp(sim)?'Impaired even here.':'<b>He would have to score '+cutScore(sim)+' or lower, '+(p.score-cutScore(sim))+' points worse,</b> to count as impaired. Against the population norm the same '+p.score+' is '+(imp(sim,'pop')?'already impaired':'not impaired')+'.');
  if(t==='base'){const d=p.score-p.base;return lead+'Compared with his own preseason score of '+p.base+', today is '+(d<0?'a drop of '+(-d):'a gain of '+d)+' points, z = '+f2(z)+'. '+(imp(sim)?'<b>That drop is too big to be normal test-to-test wobble.</b>':'That change is within normal test-to-test wobble.')+(imp(sim)!==imp(sim,'pop')?' The population norm gives the opposite answer.':'');}
  return lead+'Against the population norm, '+p.score+' is z = '+f2(z)+' ('+pctTxt(z)+' percentile): '+(imp(sim)?'impaired.':'not impaired.')+(imp(sim,'base')&&!imp(sim)?' <b>His own baseline says otherwise:</b> he was a '+p.base+' before the season.':'');},
 challenges:[
  {lvl:'bio',instant:true,q:'Two retired players both score 74. Against the population norm, 74 counts as impaired. The race-adjusted table assumed Black players start 10 points lower. Does the Black player count as impaired under it?',choices:['No: he would have to score 67 or lower','Yes: 74 is impaired for everyone','Yes, and even more so'],correct:0,explain:'Against a mean of 90, a 74 is z = −1.07, about the 14th percentile, so it is not impaired. He would have to score 67 or lower, 7 points worse, to qualify. After the practice ended in 2021, rescoring approved about 650 Black retirees.'},
  {lvl:'bio',instant:true,q:'Your teammate scored 112 on his preseason baseline. After a hit he scores 96. Against the population norm that is normal. What does his own baseline say?',choices:['A 16-point drop: flagged as impaired','Normal: 96 is close to average','You can’t compare a player with himself'],correct:0,explain:'96 is near the population average (z = −0.27), so the population norm misses it. Against his own baseline it is a 16-point drop. With normal test-to-test wobble of about 8 points, that is z = −2.0: flagged. This is why programs test athletes before the season.'},
  {lvl:'honors',instant:true,q:'Against the race-adjusted table, the retired player’s 74 is z = −1.07. About what percentile is that?',choices:['About the 14th percentile','About the 4th percentile','About the 50th percentile'],correct:0,explain:'z = −1.07 is about the 14th percentile: roughly 1 in 7 healthy players scores that low. Against the population norm the same 74 is z = −1.73, about the 4th percentile.'},
  {lvl:'honors',instant:true,q:'Why can a population norm miss a concussion in a player who usually scores high?',choices:['His drop can leave him near average, which looks normal','Population norms are always wrong','High scorers can’t get concussions'],correct:0,explain:'A player whose normal is 112 can lose 16 points and still sit near the population average. Only his own baseline shows the drop.'},
  {lvl:'ap',instant:true,q:'With impairment at z ≤ −1.5 and the race-adjusted table (mean 90, SD 15), what is the highest whole score that counts as impaired?',choices:['67','77','75','60'],correct:0,explain:'90 − 1.5 × 15 = 67.5, so 67 or lower. Under the population table it is 100 − 22.5 = 77.5, so 77 or lower. The 10-point shift in the mean moves the cutoff by the same 10 points.'},
  {lvl:'ap',instant:true,q:'Repeat tests on healthy athletes wobble with an SD of about 8 points in this model. At a cutoff of z ≤ −1.5, how big a drop from baseline is flagged?',choices:['12 points or more','8 points or more','22.5 points or more','Any drop at all'],correct:0,explain:'1.5 × 8 = 12. Because a player’s own retest spread (8) is much smaller than the spread between players (15), a baseline comparison catches smaller real changes.'}
 ],
 tour:[
  {title:'The test',text:'After a possible concussion, an athlete can take a thinking test: memory, attention, reaction time. The score here is on a standard scale, where the average healthy player scores 100.',pause:true,setup(sim){BioLab.setValues(sim,{score:74,table:'pop',black:'yes',base:112,cut:1.5});sim.st.revealed=false;sim.st.call=null;}},
  {title:'A norm table',text:'A score means nothing alone. It is compared with a norm table: scores from healthy players. This curve is the population norm. Most players land between 85 and 115.',focus:[10,10,780,230],pause:true},
  {title:'Make your call',text:'A retired player scores 74, the red marker. Against the population norm, is that impaired? Click Impaired or Not impaired at the bottom, or press Next.',pause:true},
  {title:'The population norm',text:'The red tail is the cutoff: 1.5 standard deviations below average, so 77 or lower. A 74 is z = −1.73, about the 4th percentile: impaired.',focus:[10,10,780,230],pause:true,setup(sim){sim.st.revealed=true;}},
  {title:'The race-adjusted norm',text:'The NFL concussion settlement once scored Black players against a table that assumed lower starting scores. Here that table’s average is 90, so the cutoff falls to 67. The same 74 is now “not impaired.”',pause:true,setup(sim){BioLab.setValues(sim,{table:'race'});sim.st.revealed=true;}},
  {title:'What changed',text:'Race-norming in the settlement ended in 2021. After the tests were rescored, about 650 Black retired players qualified for payments (reported August 2022).',pause:true},
  {title:'The fair comparison: you',text:'Now your teammate after a hit. He scores 96, near the population average, so the population norm calls him fine. But his preseason baseline was 112. A 16-point drop is z = −2.0 against his own normal: flagged.',pause:true,setup(sim){BioLab.setValues(sim,{score:96,table:'base',base:112});sim.st.revealed=true;}},
  {lvl:'ap',title:'Why baselines are sharper',text:'Healthy players differ from each other by about 15 points (SD), but one player retested wobbles by about 8 here. A smaller spread means a smaller change stands out: 12 points from baseline versus 22.5 from the average.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> For which scores do the population and race-adjusted norms disagree?</p><ol><li>Set Compare with to Population norm, recorded as Black. Press Show the math.</li><li>Set the score to 80, 77, 74, 70, 67 and 64. Record a trial at each, and note the decision under each table.</li></ol><p>Write one sentence: which scores were impaired under one table but not the other?</p>',
  honors:'<p><b>Question:</b> When does a baseline catch what a population norm misses?</p><ol><li>Choose Own baseline. Set the baseline to 90, 100, 112 and 125.</li><li>For each, find the highest score that is still flagged (read <b>Impaired at or below</b>).</li><li>Record whether the population norm flags that same score.</li></ol><p>Explain who benefits most from preseason baseline testing.</p>',
  ap:'<p><b>Question:</b> How does the cutoff choice trade missed injuries against false alarms?</p><ol><li>For cutoffs 1.0, 1.5 and 2.0, record the cutoff score under each table.</li><li>Use the percentile tile to find what share of healthy players each cutoff would flag.</li></ol><p><b>CER:</b> Claim which comparison is fairest for a high school program, with evidence from your table and reasoning about what a missed concussion costs.</p>'},
 terms:[
  {t:'Norm table',d:'Scores from a group of healthy people that a new score is compared with.'},
  {t:'Percentile',d:'The percent of the norm group that scored at or below a score.'},
  {t:'Baseline test',d:'The same test taken before the season, while healthy, to use as that athlete’s own normal.'},
  {t:'z-score',d:'How many standard deviations a score is from the norm’s average. Here, impaired means z ≤ −1.5.',lvl:'honors'},
  {t:'Race-norming',d:'Scoring people against separate norm tables by race. The NFL concussion settlement used it until 2021.',lvl:'honors'},
  {t:'Test-retest reliability',d:'How closely a person’s score repeats when they take the test again while healthy. Better reliability means a smaller change can be trusted.',lvl:'ap'}
 ],
 about:'<p><b>Illustrative scale, not a real test.</b> Scores are standard scores with a population mean of 100 and SD of 15. The race-adjusted table in this tool assumes players recorded as Black start 10 points lower; that size is an assumption for illustration, not the settlement’s actual tables. The baseline comparison uses a test-retest SD of 8 points, also an assumption. Impaired means z ≤ −1.5 unless you change it at Deep dive; real programs and the settlement used their own criteria.</p><p><b>Facts.</b> In the NFL concussion settlement, neuropsychological scoring used race-based norms that assumed lower baseline thinking scores for Black players, so Black players had to score worse to qualify as impaired. The practice ended in 2021, and a claims report released August 12, 2022 said about 650 Black retired players qualified after rescoring (Audacy, <a href="https://www.audacy.com/national/sports/650-black-nfl-retirees-qualify-for-payouts-post-race-norming" target="_blank" rel="noopener">audacy.com</a>).</p><p><b>Both sides.</b> Supporters of demographically adjusted norms say they reduce false alarms for people whose scores reflect schooling or test familiarity rather than injury. Critics say race is a poor stand-in for those things and that the practice denied injured players help. Comparing an athlete with their own preseason score sidesteps the question for athletes who have a baseline.</p><p>Scores also move with sleep, effort and stress, which is one more reason a single score is never a diagnosis. <b>This is a teaching model, not medical advice.</b> A possible concussion needs an athletic trainer or a doctor. What you enter stays in this browser tab.</p>',
 thumbSetup(sim){sim.st.revealed=true;}
};
BioLab.register(SIM);

BioLab.addPractical({racenorm:{
 hook:'Two retired players both score 74 on the same thinking test. Against the population norm, 74 counts as impaired. Under the NFL concussion settlement’s original scoring, the Black player was compared with a table that assumed he started lower. Does he count as impaired, and what comparison would be fair?',
 answer:'Against the population norm, 74 is z = −1.73 (4th percentile): impaired. Against a race-adjusted table with an average of 90, the same 74 is z = −1.07 (14th percentile): not impaired, and he would have to score 67 or lower to qualify. The fairest comparison is the athlete’s own preseason baseline, which is why high school programs test before the season.',
 uses:['Preseason baseline testing: many high school sports programs have athletes take a thinking test before the season so a later score can be compared with that athlete’s own normal.','The NFL concussion settlement: race-norming ended in 2021, and after rescoring about 650 Black retired players qualified for payments (reported August 2022).','Grades and percentiles everywhere: a percentile on a standardized test or a growth chart only means something once you know which group it compares you with.'],
 takeaway:'“Normal” is always normal compared with someone. Pick the wrong comparison group and an injured person looks fine. The fairest comparison is often yourself, before the injury.'}});

BioLab.addReview({racenorm:{questions:[
 {id:'popz',kind:'test',lvl:'bio',q:'On a scale with average 100 and SD 15, what is the z-score of a 70?',num:{ans:-2,tol:0.01,unit:''},
  steps:['z = (score − average) ÷ SD.','(70 − 100) ÷ 15 = −30 ÷ 15 = −2.0.','That is about the 2nd percentile.'],
  lab:{set:{score:70,table:'pop'},act:'show',look:'Read <b>z-score against this table</b>.'},verify:[['z',-2,0.01]]},
 {id:'race',kind:'real',lvl:'bio',q:'A retired player recorded as Black scores 74. Under the race-adjusted table (average 90), is he impaired, and what score would he need?',choices:['Not impaired; he would need 67 or lower','Impaired, because 74 is below 77','Impaired, because 74 is below 90','Not impaired; no score would qualify'],correct:0,
  steps:['Cutoff = 90 − 1.5 × 15 = 67.5, so 67 or lower.','74 is above that: z = (74 − 90) ÷ 15 = −1.07. Not impaired.','Against the population norm (cutoff 77), the same 74 is impaired.'],
  lab:{set:{score:74,table:'race',black:'yes'},act:'show',look:'Read <b>Impaired at or below</b> and <b>z-score against this table</b>.'},verify:[['cutS',67,0.5],['z',-1.067,0.005]]},
 {id:'base',kind:'real',lvl:'honors',q:'Your teammate’s baseline is 104. After a hit he scores 90. With a retest SD of 8, what is his z-score against his own baseline, and is he flagged at z ≤ −1.5?',choices:['z = −1.75: flagged','z = −0.67: not flagged','z = −0.93: not flagged','z = −1.75: not flagged'],correct:0,
  steps:['Change = 90 − 104 = −14 points.','z = −14 ÷ 8 = −1.75.','−1.75 ≤ −1.5, so he is flagged. Against the population norm, 90 is z = −0.67, not flagged.'],
  lab:{set:{score:90,table:'base',base:104},act:'show',look:'Read <b>z-score against this table</b> and <b>z, population norm</b>.'},verify:[['z',-1.75,0.01],['zPop',-0.667,0.005]]},
 {id:'pct',kind:'test',lvl:'honors',q:'About what percent of healthy players score at or below z = −1.5?',choices:['About 7%','About 15%','About 1.5%','About 50%'],correct:0,
  steps:['For a normal distribution, z = −1.5 is about the 6.7th percentile.','So a cutoff of −1.5 would flag about 7 of every 100 healthy players by chance, which is why one low score is a reason to look further, not a diagnosis.']},
 {id:'shift',kind:'test',lvl:'ap',q:'A table’s average moves down by 10 points and its SD stays 15. How does the impairment cutoff score move?',choices:['Down by 10 points','Down by 15 points','Down by 1.5 points','It doesn’t move'],correct:0,
  steps:['Cutoff = average − 1.5 × SD.','Lower the average by 10 with the same SD, and the cutoff drops by exactly 10: from 77.5 to 67.5.']},
 {id:'gap',kind:'real',lvl:'ap',q:'A Black retiree scores 72. Under the race-adjusted table, how many more points must he fall before he counts as impaired?',num:{ans:5,tol:0.01,unit:'points'},
  steps:['Race-adjusted cutoff: 67 or lower.','72 − 67 = 5 points.','Under the population norm he is already impaired: 72 is below 77.'],
  lab:{set:{score:72,table:'race',black:'yes'},act:'show',look:'Read <b>Points still to fall before this table says impaired</b>.'},verify:[['gap',5,0.01]]}
]}});
})();
