(function(){
'use strict';
const {clamp,rng,rr,txt,pill,atLeast,PAL,FONT,axes,legend,fmtNum}=BioLab.h;

/* Pace, minutes and injuries. ILLUSTRATIVE season model, anchored to one verified rate.
   Exposures: possessions a player is on the court for. A game at pace P has about 2P possessions (P each way),
   so a player who plays M of 48 minutes is on the court for E = 2 × P × M ÷ 48 possessions.
   Risk per possession: r = r0 × F × Rest.
     r0 is set so a 34-minute player at pace 100 with no rest games has 15.95 injuries per 1,000 games played
     (Bullock et al. 2021: 17.80 injuries and illnesses per 1,000 athlete game-exposures, minus 1.85 for illness).
     F (fatigue) = (M ÷ 34)^beta, or (E ÷ 141.7)^beta at Deep dive. beta = 1 unless changed. ASSUMPTION.
     Rest = 0.8404^(extra days off): 15.96% lower odds per extra day of rest (Lewis 2018), used as an illustration.
     Schedule: 82 games in about 164 days, so about 1 day off between games. ASSUMPTION.
   Each injury costs 3 games (Bullock et al. 2021 median). Games played G = A ÷ (1 + 3λ), A = 82 − rest games, λ = r × E. */
const SEASON=82,DAYS=164,GPI=3,M0=34,P0=100,E0=2*P0*M0/48,ANCHOR=0.01595,R0=ANCHOR/E0,RESTF=1-0.1596;
const REF={pace:90,min:40,rest:0};
const beta=sim=>atLeast('ap')?sim.p.beta:1;
const fat=sim=>atLeast('ap')?sim.p.fat:'min';
const view=sim=>atLeast('ap')&&sim.p.view==='acwr'?'acwr':'season';
function model(sim,pl){pl=pl||{pace:sim.p.pace,min:sim.p.min,rest:sim.p.rest};const b=beta(sim),A=SEASON-pl.rest,E=2*pl.pace*pl.min/48,dOff=DAYS/A-1,rest=Math.pow(RESTF,dOff-1);
  const F=fat(sim)==='poss'?Math.pow(E/E0,b):Math.pow(pl.min/M0,b),r=R0*F*rest,lam=r*E,Gp=A/(1+GPI*lam),inj=lam*Gp,ig=GPI*inj;
  return {E,r,lam,Gp,inj,ig,missed:pl.rest+ig,rest:pl.rest,F,restM:rest,seasonPoss:E*Gp};}
const mine=sim=>model(sim),ref=sim=>model(sim,REF);
const ratio=sim=>mine(sim).inj/ref(sim).inj;
const truth=sim=>{const q=ratio(sim);return q>1.05?'more':q<0.95?'fewer':'same';};
const key=sim=>[sim.p.pace,sim.p.min,sim.p.rest,beta(sim),fat(sim)].join('|');
const BTN=[['more','More injuries'],['same','About the same'],['fewer','Fewer injuries']];
const CALLW={more:'more injuries',same:'about the same',fewer:'fewer injuries'};
const shown=sim=>!!(sim.st&&sim.st.revealed);
const fresh=sim=>{sim.st.revealed=false;sim.st.call=null;sim.st.yt=null;};
const callNow=sim=>{const c=sim.st&&sim.st.call;return c&&c.key===key(sim)?c:null;};
const f0=v=>fmtNum(v,0),f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2),f3=v=>fmtNum(v,3);
const acC=sim=>4*sim.p.wkNow/(sim.p.wkNow+3*sim.p.wkPrev);
const acU=sim=>sim.p.wkNow/sim.p.wkPrev;
const btnRect=(i,sY,sH,X0,X1)=>{const gp=10,w=(X1-X0-2*gp)/3;return [X0+i*(w+gp),sY+4,w,sH-8];};
function fitTxt(ctx,cands,w,size,wt){ctx.font=(wt||400)+' '+size+'px '+FONT;for(const s of cands){if(ctx.measureText(s).width<=w)return s;}return cands[cands.length-1];}
function wrap(ctx,s,x,y,w,o){o=o||{};const size=o.s||13,lh=o.lh||size*1.3;ctx.font=(o.w||400)+' '+size+'px '+FONT;let line='',yy=y;
  String(s).split(' ').forEach(word=>{const t=line?line+' '+word:word;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,yy,{s:size,w:o.w,c:o.c,a:o.a});yy+=lh;line=word;}else line=t;});
  if(line){txt(ctx,line,x,yy,{s:size,w:o.w,c:o.c,a:o.a});yy+=lh;}return yy;}
const geo=k=>{const sH=Math.max(46,30*k+16);return {sH,sY:450-12-sH};};
/* ---------- Your turn: possessions your player is on the court for, E = 2 × pace × minutes ÷ 48 ---------- */
const eLine=pl=>'2 × '+pl.pace+' × '+pl.min+' ÷ 48 = '+f1(2*pl.pace*pl.min/48);
const YT={
  key:sim=>key(sim),
  ans:sim=>2*sim.p.pace*sim.p.min/48,
  tol:()=>0.6,
  fmt:v=>v.toFixed(1),
  line:sim=>eLine(sim.p),
  wrong:sim=>{const P=sim.p.pace,M=sim.p.min;return [P*M/48,2*P*48/M,2*P,2*P*M/60,P*M/24/2];}
};
/* ---------- Your turn, shared machinery: the student computes one number for this case before the call ----------
   YT (defined above) gives the key, answer, tolerance, format and common-slip choices. Canvas buttons are bare numbers;
   they set the `ans` control and submit it. One retry after a wrong answer; a second wrong answer shows the worked math.
   Then the call, then the reveal with the formula and this case's numbers. */
const hashS=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))%2147483647;return h||1;};
const ytNow=sim=>{const y=sim.st&&sim.st.yt;return y&&y.key===YT.key(sim)?y:null;};
const ytDone=sim=>{const y=ytNow(sim);return !!(y&&y.done);};
function ytChoices(sim){const a=YT.ans(sim),t=YT.tol(sim),f=YT.fmt,seen=new Set([f(a)]),out=[a];
  const add=v=>{if(out.length<4&&Number.isFinite(v)&&(YT.neg||v>0)&&!seen.has(f(v))&&Math.abs(v-a)>t*1.5){seen.add(f(v));out.push(v);}};
  YT.wrong(sim).forEach(add);[1.25,0.8,1.5,0.6,2,0.5].forEach(m=>add(a*m));[1,-1,2,-2,3].forEach(d=>add(a+d*Math.max(t*4,0.5)));
  const r=rng(hashS(YT.key(sim)));for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function ytSubmit(sim,v){let y=ytNow(sim);if(!y){y={key:YT.key(sim),tries:[],done:false,ok:false};sim.st.yt=y;}if(y.done)return;
  y.tries.push(v);if(Math.abs(v-YT.ans(sim))<=YT.tol(sim)+1e-9){y.ok=true;y.done=true;}else if(y.tries.length>=2)y.done=true;}
function ytVerdict(sim){const y=ytNow(sim);if(!y||!y.tries.length)return '';const last=y.tries[y.tries.length-1];
  return 'Your answer: '+YT.fmt(last)+(YT.unit||'')+'. '+(y.ok?'Correct: ':'The math: ')+YT.line(sim)+'.';}
function ytShort(sim){const y=ytNow(sim);if(!y||!y.tries.length)return '';const last=y.tries[y.tries.length-1];return 'Your answer: '+YT.fmt(last)+(YT.unit||'')+(y.ok?', correct.':'; the math gives '+YT.fmt(YT.ans(sim))+(YT.unit||'')+'.');}
/* bottom strip: lines of text, then a row of buttons. Measured first so the drawing above can make room. */
function nLines(ctx,s,w,size,wt){ctx.font=(wt||400)+' '+size+'px '+FONT;let n=0,line='';String(s).split(' ').forEach(word=>{const t=line?line+' '+word:word;if(ctx.measureText(t).width>w&&line){n++;line=word;}else line=t;});return n+(line?1:0);}
function stripPlan(ctx,k,w,parts,btns){let h=10;parts=parts.filter(p=>p&&p.t);parts.forEach(p=>{p.n=nLines(ctx,p.t,w-24,p.s,p.w);h+=p.n*p.s*1.3;});const bh=btns&&btns.length?Math.min(44,24*k+12):0;if(bh)h+=bh+8;return {parts,btns:btns||[],bh,h:h+8};}
function stripDraw(ctx,sim,P,x0,x1,y0,k){ctx.fillStyle=PAL['card2'];rr(ctx,x0,y0,x1-x0,P.h,10);ctx.fill();let y=y0+10;
  P.parts.forEach(p=>{y=wrap(ctx,p.t,x0+12,y+p.s,x1-x0-24,{s:p.s,w:p.w,c:p.c})-p.s;});
  sim.vis.ytR=[];sim.vis.callR=[];if(!P.btns.length)return;const g=8,n=P.btns.length,bw=(x1-x0-24-g*(n-1))/n,by=y+6;
  P.btns.forEach((b,i)=>{const bx=x0+12+i*(bw+g);ctx.fillStyle=PAL[b.off?'card2':'card'];rr(ctx,bx,by,bw,P.bh,9);ctx.fill();ctx.strokeStyle=b.off?PAL['line']:PAL['rj'];ctx.lineWidth=2;ctx.stroke();
    ctx.font='700 '+(12*k)+'px '+FONT;let l=b.l;if(b.short&&ctx.measureText(l).width>bw-10)l=b.short;
    txt(ctx,l,bx+bw/2,by+P.bh/2+1,{s:(b.kind==='yt'?13:12)*k,w:b.kind==='yt'?800:700,a:'center',b:'middle',c:b.off?PAL['cv-soft']:PAL['cv-ink']});
    if(!b.off)(b.kind==='yt'?sim.vis.ytR:sim.vis.callR).push([bx,by,bw,P.bh,b.v]);});}
function ytButtons(sim){const y=ytNow(sim);return ytChoices(sim).map(v=>({l:YT.fmt(v),v,kind:'yt',off:!!(y&&y.tries.some(t=>Math.abs(t-v)<1e-9))}));}
function stripClick(sim,x,y){const hit=R=>(R||[]).find(r=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]-4&&y<=r[1]+r[3]+4);
  const a=hit(sim.vis&&sim.vis.ytR);if(a){BioLab.setValues(sim,{ans:a[4]});ytSubmit(sim,a[4]);sim.vis.ytR=null;return true;}
  const c=hit(sim.vis&&sim.vis.callR);if(c){BioLab.setValues(sim,{call:c[4]});SIM.actions.find(a=>a.id==='lock').run(sim);sim.vis.callR=null;return true;}return false;}


/* Verified league averages (Basketball-Reference). [season end year, pace, 3PA share of FGA] */
const PACE=[[1962,126.2],[1966,121.4],[1971,115.1],[1974,107.8],[1975,104.5],[1976,105.5],[1977,106.5],[1978,106.7],[1979,105.8],[1980,103.1],[1981,101.8],[1982,100.9],[1983,103.1],[1984,101.4],[1985,102.1],[1986,102.1],[1987,100.8],[1988,99.6],[1989,100.6],[1990,98.3],[1991,97.8],[1992,96.6],[1993,96.8],[1994,95.1],[1995,92.9],[1996,91.8],[1997,90.1],[1998,90.3],[1999,88.9],[2000,93.1],[2001,91.3],[2002,90.7],[2003,91.0],[2004,90.1],[2005,90.9],[2006,90.5],[2007,91.9],[2008,92.4],[2009,91.7],[2010,92.7],[2011,92.1],[2012,91.3],[2013,92.0],[2014,93.9],[2015,93.9],[2016,95.8],[2017,96.4],[2018,97.3],[2019,100.0],[2020,100.3],[2021,99.2],[2022,98.2],[2023,99.2],[2024,98.5],[2025,98.8],[2026,99.4]];
const THREE=[[1980,2.8,90.6],[1981,2.0,88.4],[1982,2.3,88.2],[1983,2.3,89.7],[1984,2.4,88.4],[1985,3.1,89.1],[1986,3.3,88.6],[1987,4.7,88.8],[1988,5.0,87.7],[1989,6.6,89.0],[1990,6.6,87.2],[1991,7.1,87.2],[1992,7.6,87.3],[1993,9.0,86.0],[1994,9.9,84.4],[1995,15.3,81.5],[1996,16.0,80.2],[1997,16.8,79.3],[1998,12.7,79.7],[1999,13.2,78.2],[2000,13.7,82.1],[2001,13.7,80.6],[2002,14.7,81.3],[2003,14.7,80.8],[2004,14.9,79.8],[2005,15.8,80.3],[2006,16.0,79.0],[2007,16.9,79.7],[2008,18.1,81.5],[2009,18.1,80.9],[2010,18.1,81.7],[2011,18.0,81.2],[2012,18.4,81.4],[2013,20.0,82.0],[2014,21.5,83.0],[2015,22.4,83.6],[2016,24.1,84.6],[2017,27.0,85.4],[2018,29.0,86.1],[2019,32.0,89.2],[2020,34.1,88.8],[2021,34.6,88.4],[2022,35.2,88.1],[2023,34.2,88.3],[2024,35.1,88.9],[2025,37.6,89.2],[2026,37.0,89.1]];
const COLREF='s2',COLME='s6';

function plan(sim,ctx,k,w){const y=ytNow(sim),c=callNow(sim),big=k>1.3,S=12*k,M=13*k,p=sim.p;
  if(!shown(sim)&&!ytDone(sim)){const retry=y&&y.tries.length;
    if(big)return stripPlan(ctx,k,w,[{t:'Your turn: possessions = 2 × '+p.pace+' × '+p.min+' ÷ 48 = ?',s:M,w:800},{t:retry?'Not quite. Multiply, then ÷ 48.':'',s:S,w:600,c:PAL['s1']}],ytButtons(sim));
    return stripPlan(ctx,k,w,[{t:'Your turn: your plan is pace '+p.pace+' with '+p.min+' minutes a game. A game has about 2 × pace possessions, and your player is out there minutes ÷ 48 of it.',s:M,w:800},
      {t:retry?'Not quite. Multiply 2 × pace × minutes, then divide by 48.':'Possessions on the court = 2 × pace × minutes ÷ 48. The slow plan: '+eLine(REF)+'. What is yours?',s:S,w:600,c:retry?PAL['s1']:PAL['cv-soft']}],ytButtons(sim));}
  if(!shown(sim)){const yy=ytNow(sim);return stripPlan(ctx,k,w,[{t:ytVerdict(sim),s:S,w:700,c:yy.ok?PAL['s3']:PAL['s1']},{t:'Now your call: compared with the slow plan, your plan causes…',s:S,w:800}],BTN.map(b=>({l:b[1],v:b[0],kind:'call'})));}
  const a=ref(sim),m=mine(sim),d=a.missed-m.missed;
  const l1='Possessions: yours '+eLine(p)+'; slow plan '+eLine(REF)+'.';
  const l2='Injuries a game = risk per possession × possessions: ×'+f2(m.r/R0)+' × '+f1(m.E)+' vs. ×'+f2(a.r/R0)+' × '+f1(a.E)+' (risk relative to a 34-minute player).';
  const l3=(ytShort(sim)&&!big?ytShort(sim)+' ':'')+(c?('Your call: '+CALLW[c.pick]+'. '+(c.pick===c.truth?'That matches the model. ':'Not quite. ')):'')+'Your plan: '+f2(m.inj)+' injuries vs. '+f2(a.inj)+'. Games missed: '+f1(m.missed)+' vs. '+f1(a.missed)+(Math.abs(d)<0.05?', the same.':d>0?', '+f1(d)+' fewer.':', '+f1(-d)+' more.');
  if(big)return stripPlan(ctx,k,w,[{t:'Yours: '+eLine(p),s:S,w:800,c:PAL[COLME]},{t:(c?(c.pick===c.truth?'Your call matches. ':'Not quite. '):'')+'Games missed: '+f1(m.missed)+' vs. '+f1(a.missed)+'.',s:S,w:700,c:c&&c.pick!==c.truth?PAL['s1']:PAL['cv-ink']}],null);
  return stripPlan(ctx,k,w,[{t:l1,s:S,w:800,c:PAL[COLME]},{t:l2,s:S,w:600,c:PAL['cv-soft']},{t:l3,s:S,w:700,c:c&&c.pick!==c.truth?PAL['s1']:PAL['cv-ink']}],null);}

const SIM={
 id:'paceload',hash:'paceload',yt:YT,apUnit:1,order:3,kind:'Simulation',tab:'Pace, minutes and injuries',prereq:['injury'],
 card:'Plan a season: set the pace and a top player’s minutes, guess the injury cost, then count exposures to see who really misses more games.',
 title:'Pace, minutes and injuries',
 lede:{bio:'The math: rates per exposure, exposures = 2 × pace × minutes ÷ 48 (Sports Medicine: injury prevention and workload). People say today’s basketball is faster and harder on bodies than ever. Set your team’s pace and your best player’s minutes, guess whether that plan causes more or fewer injuries than a slow, long-minutes plan, then count the games missed.',
  honors:'An injury count depends on how many exposures a player gets. Compare injuries per season with injuries per 1,000 games and per 1,000 possessions, and see why a faster pace can raise the count without making any single play riskier.',
  ap:'Injuries per season = risk per possession × possessions per game × games played. Change how fatigue enters the risk function, then test the acute:chronic workload ratio and why researchers argue about it.'},
 scale:'One 82-game season for one player. A possession is one trip down the floor by one team; pace is possessions per team per 48 minutes.',
 aspect:16/9,timeless:true,trials:true,graph:true,controlsTitle:'The season plan',
 controls:[
  {id:'pace',label:'Your team’s pace (possessions per 48 minutes)',type:'range',min:85,max:130,step:1,def:100,help:'The league average was 99.4 in 2025-26 and 90.1 in 2003-04.'},
  {id:'min',label:'Your top player’s minutes per game',type:'range',min:20,max:48,step:1,def:34,unit:'min',help:'A game is 48 minutes. The league’s minutes leader averaged 38.0 in 2025-26.'},
  {id:'rest',label:'Healthy rest games (sits out to rest)',type:'range',min:0,max:20,step:1,def:0,help:'Rest games count as games missed, too.'},
  {id:'ans',label:'Your answer: possessions your player is on the court for each game (Your turn on the canvas)',type:'range',min:0,max:260,step:0.1,def:100,d:1,noTrial:true,help:'2 × pace × minutes ÷ 48. Set it, then press Lock in my answer.'},
  {id:'call',label:'Your call: compared with the slow plan (pace 90, 40 minutes), your plan causes…',type:'seg',def:'more',noTrial:true,options:BTN.map(b=>({v:b[0],l:b[1]})),help:'Make your call before you look, then press Lock in my call.'},
  {id:'view',label:'Show',type:'seg',def:'season',lvl:'ap',noTrial:true,options:[{v:'season',l:'Season plans'},{v:'acwr',l:'Workload ratio'}]},
  {id:'beta',label:'How strongly fatigue raises risk per possession (assumption)',type:'range',min:0,max:2,step:0.25,def:1,d:2,lvl:'ap',help:'0 means every possession is equally risky. 1 means 10% more fatigue makes each possession 10% riskier.'},
  {id:'fat',label:'Fatigue builds with',type:'seg',def:'min',lvl:'ap',options:[{v:'min',l:'Minutes played'},{v:'poss',l:'Possessions played'}],help:'Nobody knows which is closer to the truth. Try both.'},
  {id:'wkPrev',label:'Your average weekly training, the 3 weeks before (minutes)',type:'range',min:30,max:600,step:10,def:300,lvl:'ap',help:'Your own numbers stay in this browser tab.'},
  {id:'wkNow',label:'Your training this week (minutes)',type:'range',min:0,max:900,step:10,def:450,lvl:'ap',help:'Your own numbers stay in this browser tab.'}
 ],
 actions:[
  {id:'ytlock',label:'Lock in my answer',run(sim){ytSubmit(sim,sim.p.ans);}},
  {id:'lock',label:'Lock in my call',primary:true,run(sim){sim.st.call={pick:sim.p.call,key:key(sim),truth:truth(sim)};sim.st.revealed=true;}},
  {id:'show',label:'Show the math',run(sim){sim.st.revealed=true;}},
  {id:'hide',label:'New call: hide the results',run(sim){fresh(sim);}},
  {id:'today',label:'Case: today’s pace, shorter minutes',run(sim){BioLab.setValues(sim,{pace:99,min:34,rest:0,view:'season'});fresh(sim);}},
  {id:'sixties',label:'Case: 1960s pace, nearly full games',run(sim){BioLab.setValues(sim,{pace:126,min:46,rest:0,view:'season'});fresh(sim);}},
  {id:'resting',label:'Case: rest 10 healthy games',run(sim){BioLab.setValues(sim,{pace:100,min:34,rest:10,view:'season'});fresh(sim);}}
 ],
 init(){return {revealed:false,call:null,yt:null};},step(){},
 metrics:[
  {id:'gm',label:'Games missed per season, your plan',unit:'games',d:1,min:0,max:null,get:sim=>mine(sim).missed},
  {id:'gmRef',label:'Games missed per season, slow plan',unit:'games',d:1,min:0,max:null,get:sim=>ref(sim).missed},
  {id:'inj',label:'Injuries per season, your plan',unit:'',d:2,min:0,max:null,get:sim=>mine(sim).inj},
  {id:'injRef',label:'Injuries per season, slow plan',unit:'',d:2,min:0,max:null,get:sim=>ref(sim).inj},
  {id:'poss',label:'Possessions played per game, your plan',unit:'',d:1,min:0,max:null,get:sim=>shown(sim)?mine(sim).E:null},
  {id:'ig',label:'Games missed to injury, your plan',unit:'games',d:1,lvl:'honors',min:0,max:null,get:sim=>mine(sim).ig},
  {id:'per1000g',label:'Injuries per 1,000 games played',unit:'',d:1,lvl:'honors',min:0,max:null,get:sim=>mine(sim).lam*1000},
  {id:'per1000p',label:'Injuries per 1,000 possessions',unit:'',d:3,lvl:'honors',min:0,max:null,get:sim=>mine(sim).r*1000},
  {id:'per1000m',label:'Injuries per 1,000 minutes',unit:'',d:3,lvl:'honors',min:0,max:null,get:sim=>mine(sim).lam/sim.p.min*1000},
  {id:'seasonPoss',label:'Possessions played per season',unit:'',d:0,lvl:'honors',min:0,max:null,get:sim=>mine(sim).seasonPoss},
  {id:'acwrC',label:'Coupled ratio: this week ÷ 4-week average',unit:'',d:2,lvl:'ap',min:0,max:4,get:sim=>acC(sim)},
  {id:'acwrU',label:'Uncoupled ratio: this week ÷ 3 weeks before',unit:'',d:2,lvl:'ap',min:0,max:null,get:sim=>acU(sim)}
 ],
 graphs:[{id:'gmg',label:'Games missed vs. minutes per game',custom:true},{id:'paceg',label:'League pace by season',custom:true},{id:'threeg',label:'Share of shots that are 3s',lvl:'honors',custom:true},{id:'acwrg',label:'Coupled vs. uncoupled ratio',lvl:'ap',custom:true}],defaultGraph:'gmg',
 plot(sim,ctx,box,id){
  if(id==='paceg'){const ax=axes(ctx,box,{xmin:1960,xmax:2027,ymin:80,ymax:130,xl:'Season (year it ended)',yl:'Pace'});
   ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.beginPath();PACE.forEach(([y,v],i)=>{i===0?ctx.moveTo(ax.X(y),ax.Y(v)):ctx.lineTo(ax.X(y),ax.Y(v));});ctx.stroke();
   ctx.fillStyle=PAL['s2'];PACE.forEach(([y,v])=>{ctx.beginPath();ctx.arc(ax.X(y),ax.Y(v),y<1974?4:2.5,0,7);ctx.fill();});
   ctx.strokeStyle=PAL['s6'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(ax.X(1960),ax.Y(sim.p.pace));ctx.lineTo(ax.X(2027),ax.Y(sim.p.pace));ctx.stroke();ctx.setLineDash([]);
   legend(ctx,box.L+12,box.T+box.H-32,[{label:'League average (big dots: season pages)',color:PAL['s2']}]);legend(ctx,box.L+12,box.T+box.H-12,[{label:'Your pace: '+sim.p.pace,color:PAL['s6'],dash:true}]);return;}
  if(id==='threeg'){const ax=axes(ctx,box,{xmin:1979,xmax:2027,ymin:0,ymax:50,xl:'Season (year it ended)',yl:'3-point tries, % of shots'});
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();THREE.forEach(([y,a,f],i)=>{const v=100*a/f;i===0?ctx.moveTo(ax.X(y),ax.Y(v)):ctx.lineTo(ax.X(y),ax.Y(v));});ctx.stroke();
   legend(ctx,box.L+12,box.T+12,[{label:'3-point attempts ÷ all field goal attempts',color:PAL['s4']}]);return;}
  if(id==='acwrg'){const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:3,xl:'Uncoupled ratio (this week ÷ 3 weeks before)',yl:'Coupled ratio'});
   ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.12;ctx.fillRect(ax.X(0),ax.Y(3),ax.X(3)-ax.X(0),ax.Y(1.5)-ax.Y(3));ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(3),ax.Y(3));ctx.stroke();ctx.setLineDash([]);
   ctx.strokeStyle=PAL['s2'];ctx.lineWidth=3;ctx.beginPath();for(let u=0;u<=3.0001;u+=0.05){const c=4*u/(u+3);u===0?ctx.moveTo(ax.X(u),ax.Y(c)):ctx.lineTo(ax.X(u),ax.Y(c));}ctx.stroke();
   const u=Math.min(3,acU(sim));ctx.fillStyle=PAL['s6'];ctx.beginPath();ctx.arc(ax.X(u),ax.Y(4*u/(u+3)),6,0,7);ctx.fill();
   txt(ctx,'“Danger zone” ≥ 1.5 (Gabbett 2016)',ax.X(0.06),ax.Y(1.5)-8,{s:12,c:PAL['s1'],w:700});
   legend(ctx,box.L+12,box.T+12,[{label:'Coupled = 4u ÷ (u + 3)',color:PAL['s2']}]);legend(ctx,box.L+12,box.T+32,[{label:'If both were equal',color:PAL['cv-soft'],dash:true}]);return;}
  /* games missed vs minutes */
  const mx=[],ry=[],my=[];for(let m=20;m<=48;m+=1){mx.push(m);my.push(model(sim,{pace:sim.p.pace,min:m,rest:sim.p.rest}).missed);ry.push(model(sim,{pace:REF.pace,min:m,rest:0}).missed);}
  const ymax=Math.max(8,Math.ceil(Math.max(...my,...ry)+1));const ax=axes(ctx,box,{xmin:20,xmax:48,ymin:0,ymax,xl:'Top player’s minutes per game',yl:'Games missed per season'});
  [[ry,COLREF,'Pace 90, no rest games'],[my,COLME,'Your pace '+sim.p.pace+(sim.p.rest?', '+sim.p.rest+' rest games':'')]].forEach(([ys,c])=>{ctx.strokeStyle=PAL[c];ctx.lineWidth=2.5;ctx.beginPath();ys.forEach((v,i)=>{i===0?ctx.moveTo(ax.X(mx[i]),ax.Y(v)):ctx.lineTo(ax.X(mx[i]),ax.Y(v));});ctx.stroke();});
  const a=ref(sim),b=mine(sim);ctx.fillStyle=PAL[COLREF];ctx.beginPath();ctx.arc(ax.X(REF.min),ax.Y(a.missed),6,0,7);ctx.fill();ctx.fillStyle=PAL[COLME];ctx.beginPath();ctx.arc(ax.X(sim.p.min),ax.Y(b.missed),6,0,7);ctx.fill();
  legend(ctx,box.L+12,box.T+12,[{label:'Your plan: pace '+sim.p.pace+(sim.p.rest?', '+sim.p.rest+' rest games':''),color:PAL[COLME]}]);legend(ctx,box.L+12,box.T+32,[{label:'Slow plan: pace 90, no rest',color:PAL[COLREF]}]);},
 draw(sim,ctx,vdt,k){const W=800,H=450;sim.vis.k=k;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  if(view(sim)==='acwr'){drawACWR(sim,ctx,k);return;}
  const sh=shown(sim),big=k>1.3,X0=16,X1=784,PS=plan(sim,ctx,k,X1-X0),sY=450-12-PS.h;
  const ty=16+13*k;txt(ctx,fitTxt(ctx,['Two season plans for a top player: 82 games each','Two plans, 82 games each','Two plans'],X1-X0,13*k,800),X0,ty,{s:13*k,w:800});
  const cT=ty+10,cB=sY-10,cw=(X1-X0-16)/2,plans=[{nm:'Slow plan',pl:REF,m:ref(sim),col:COLREF,x:X0},{nm:'Your plan',pl:{pace:sim.p.pace,min:sim.p.min,rest:sim.p.rest},m:mine(sim),col:COLME,x:X0+cw+16}];
  plans.forEach(P=>{const x0=P.x+12,x1=P.x+cw-12,iw=x1-x0,col=PAL[P.col];ctx.fillStyle=PAL['card'];rr(ctx,P.x,cT,cw,cB-cT,10);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
   let y=cT+14*k+8;
   /* abstract ball icon */
   const ir=7*k;ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x1-ir,y-5*k,ir,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(x1-2*ir,y-5*k);ctx.lineTo(x1,y-5*k);ctx.moveTo(x1-ir,y-5*k-ir);ctx.lineTo(x1-ir,y-5*k+ir);ctx.stroke();
   txt(ctx,P.nm,x0,y,{s:14*k,w:800,c:col});y+=16*k+6;
   const pl=P.pl;txt(ctx,fitTxt(ctx,['Pace '+pl.pace+' · '+pl.min+' minutes a game · '+(pl.rest?pl.rest+' rest games':'no rest games'),'Pace '+pl.pace+' · '+pl.min+' min · '+pl.rest+' rest','Pace '+pl.pace+' · '+pl.min+' min'],iw,12*k,600),x0,y,{s:12*k,w:600,c:PAL['cv-ink']});y+=16*k+8;
   const hideE=!sh&&P.nm==='Your plan',Et=hideE?'?':f0(P.m.E);
   txt(ctx,fitTxt(ctx,['Possessions on the court a game: '+Et,'Possessions a game: '+Et,'Possessions: '+Et],iw,12*k,hideE?700:400),x0,y,{s:12*k,w:hideE?700:400,c:hideE?PAL['rj']:PAL['cv-soft']});y+=8;
   ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x0,y,iw,10,5);ctx.fill();if(!hideE){ctx.fillStyle=col;rr(ctx,x0,y,Math.max(4,iw*Math.min(1,P.m.E/260)),10,5);ctx.fill();}y+=22;
   if(atLeast('honors')||sh){txt(ctx,fitTxt(ctx,['Risk per possession: ×'+f2(P.m.r/R0)+' the baseline','Risk per possession ×'+f2(P.m.r/R0),'Risk ×'+f2(P.m.r/R0)],iw,12*k,400),x0,y+10*k,{s:12*k,c:PAL['cv-soft']});y+=14*k+10;}
   /* season strip: 82 games in 2 rows of 41 */
   const cs=iw/41,ch=big?Math.min(12,cs+2):16,inj=sh?Math.round(P.m.ig):0,rest=pl.rest;
   /* spread rest games evenly, then place injury games deterministically on played games */
   const cells=[];for(let i=0;i<SEASON;i++)cells.push(Math.floor((i+1)*rest/SEASON)>Math.floor(i*rest/SEASON)?'rest':'x');
   let placed=0;for(let j=0;j<SEASON&&placed<inj;j++){const i=Math.floor((j*37+60)%SEASON);if(cells[i]==='x'){cells[i]='inj';placed++;}}
   for(let i=0;i<SEASON;i++){const r=Math.floor(i/41),c=i%41,cx=x0+c*cs,cy=y+r*(ch+3);ctx.fillStyle=cells[i]==='inj'?PAL['s1']:cells[i]==='rest'?PAL['cv-soft']:col;ctx.globalAlpha=cells[i]==='x'?.45:1;ctx.fillRect(cx+.5,cy,cs-1.5,ch);}
   ctx.globalAlpha=1;y+=2*ch+3+12*k+6;
   const LG=[[col,.45,'played'],[PAL['cv-soft'],1,'rested'],[PAL['s1'],1,'injured']];let lx=x0;ctx.font='400 '+(12*k)+'px '+FONT;
   LG.forEach(([cc,al,lb])=>{const sq=10*k;ctx.fillStyle=cc;ctx.globalAlpha=al;ctx.fillRect(lx,y-sq+1,sq,sq);ctx.globalAlpha=1;txt(ctx,lb,lx+sq+4,y,{s:12*k,c:PAL['cv-soft']});lx+=sq+4+ctx.measureText(lb).width+12;});
   y+=16*k+10;
   if(!sh){txt(ctx,'Games missed: ?',x0,y,{s:16*k,w:800,c:PAL['cv-ink']});y+=14*k+8;if(y<cB-8)txt(ctx,fitTxt(ctx,['Make your call below to see the season.','Make your call below.'],iw,12*k,400),x0,y,{s:12*k,c:PAL['cv-soft']});return;}
   txt(ctx,'Games missed: '+f1(P.m.missed),x0,y,{s:16*k,w:800,c:PAL['cv-ink']});y+=14*k+8;
   txt(ctx,fitTxt(ctx,[f2(P.m.inj)+' injuries · '+f1(P.m.ig)+' games hurt · '+pl.rest+' rested',f2(P.m.inj)+' injuries a season',f2(P.m.inj)+' injuries'],iw,12*k,400),x0,y,{s:12*k,c:PAL['cv-ink']});y+=14*k+6;
   if(atLeast('honors')&&y<cB-6){txt(ctx,fitTxt(ctx,[f1(P.m.lam*1000)+' per 1,000 games · '+f3(P.m.r*1000)+' per 1,000 possessions',f1(P.m.lam*1000)+' per 1,000 games'],iw,12*k,400),x0,y,{s:12*k,c:PAL['cv-soft']});y+=14*k+6;}
   if(atLeast('honors')&&y<cB-6)txt(ctx,fitTxt(ctx,['Possessions played in the season: '+Math.round(P.m.seasonPoss).toLocaleString('en-US'),'Season possessions: '+Math.round(P.m.seasonPoss).toLocaleString('en-US')],iw,12*k,400),x0,y,{s:12*k,c:PAL['cv-soft']});});
  stripDraw(ctx,sim,PS,X0,X1,sY,k);},
 onClick(sim,x,y){if(shown(sim)||view(sim)!=='season')return;stripClick(sim,x,y);},
 narrate(sim){
  if(view(sim)==='acwr'){const c=acC(sim),u=acU(sim);return 'This week is '+sim.p.wkNow+' minutes against an average of '+sim.p.wkPrev+' the 3 weeks before. <b>The coupled ratio is '+f2(c)+'; the uncoupled ratio is '+f2(u)+'.</b> Same training, two answers, because the coupled version puts this week inside its own average. Researchers still argue about whether either one predicts injury.';}
  const m=mine(sim),a=ref(sim);
  if(!shown(sim)&&!ytDone(sim)){const y=ytNow(sim);return (y&&y.tries.length?'<b>Not quite.</b> ':'<b>Your turn:</b> ')+'the slow plan’s player is on the court for 2 × 90 × 40 ÷ 48 = 150 possessions a game. Compute yours: <b>2 × '+sim.p.pace+' × '+sim.p.min+' ÷ 48</b>, and click your answer at the bottom.';}
  if(!shown(sim))return ytVerdict(sim)+' <b>Make your call:</b> your player is on the court for about '+f0(m.E)+' possessions a game; the slow plan’s player, '+f0(a.E)+'. Does your plan cause more or fewer injuries over a season? Click your pick at the bottom.';
  const c=callNow(sim),lead=c?(c.pick===c.truth?'<b>Your call matched the model.</b> ':'<b>Not quite.</b> '):'';
  const why='Injuries per game = risk per possession × possessions. Yours: ×'+f2(m.r/R0)+' risk × '+f0(m.E)+' possessions; the slow plan: ×'+f2(a.r/R0)+' × '+f0(a.E)+'.';
  const rest=sim.p.rest?' Your '+sim.p.rest+' rest games cut injuries a little but count as '+sim.p.rest+' games missed.':'';
  const era=sim.p.pace>=115?' This what-if applies today’s risk per possession to a 1960s-style workload; the game, shoes and medicine were different then.':'';
  return lead+why+' <b>Your plan: '+f1(m.missed)+' games missed a season; the slow plan: '+f1(a.missed)+'.</b>'+rest+era;},
 challenges:[
  {lvl:'bio',instant:true,q:'A team plays at pace 110 and its star plays 30 minutes a game. About how many possessions is the star on the court for each game?',choices:['137.5','68.8','352','220'],correct:0,explain:'2 × 110 × 30 ÷ 48 = 6,600 ÷ 48 = 137.5. Forgetting the 2 (both teams’ possessions) gives 68.8; dividing the wrong way gives 352.'},
  {lvl:'bio',instant:true,q:'In 1961-62 the league pace was 126.2 possessions per 48 minutes. In 2025-26 it was 99.4. Which is true?',choices:['The 1960s game had about 27% more possessions','Today’s game is the fastest ever','They are about the same'],correct:0,explain:'126.2 ÷ 99.4 = 1.27, so the 1960s game had about 27% more possessions. Pace hit its lowest listed value, 88.9, in 1998-99, and has climbed back to about 99 since 2019.'},
  {lvl:'bio',instant:true,q:'Same pace (100), but your player goes from 34 to 40 minutes a game, about 18% more. In this model, how much do injuries per game played rise?',choices:['About 38%','About 18%','0%'],correct:0,explain:'40 ÷ 34 = 1.18. Possessions rise 18%, and with tired legs each possession is 18% riskier: 1.18 × 1.18 = 1.38. Injuries per 1,000 games go from 16.0 to 22.1.'},
  {lvl:'bio',instant:true,q:'Your player rests 10 healthy games (pace 100, 34 minutes). Injuries fall from 1.25 to 1.05 a season. What happens to total games missed?',choices:['About 13 games','About 3 games','About 3.7 games'],correct:0,explain:'Injury games fall from 3.7 to 3.1, but the 10 rest games are missed too: 3.1 + 10 = 13.1. This is the trade the NBA’s Player Participation Policy is about.'},
  {lvl:'honors',instant:true,q:'Your team speeds up from pace 92 to 100. Your player still plays 34 minutes. What happens to injuries per 1,000 possessions and per 1,000 games?',choices:['Per possession stays the same; per game rises about 9%','Both rise about 9%','Both stay the same'],correct:0,explain:'In this model risk per possession depends on minutes, which did not change, so it stays at 0.113 per 1,000. But there are 100 ÷ 92 = 1.087 times as many possessions, so injuries per 1,000 games rise from 14.7 to 16.0. The count rose; no play got riskier.'},
  {lvl:'honors',instant:true,q:'In the 17.80 study, exposure was counted by games played, not minutes. Player A plays 12 minutes a game and Player B plays 40. What does a per-game rate hide?',choices:['B is on the court more than 3 times as long','Nothing: a game is a game','A is more likely to get hurt'],correct:0,explain:'40 ÷ 12 = 3.3. Both count as one exposure per game, so per-game rates mix very different workloads. The authors noted that exposure could only be counted by games.'},
  {lvl:'ap',instant:true,q:'You trained an average of 300 minutes a week for 3 weeks, then 450 this week. What is the coupled acute:chronic ratio (this week ÷ the 4-week average)?',choices:['1.33','1.50','0.75','2.00'],correct:0,explain:'4-week average = (450 + 3 × 300) ÷ 4 = 337.5. 450 ÷ 337.5 = 1.33. The uncoupled ratio, 450 ÷ 300, is 1.50.'},
  {lvl:'ap',instant:true,q:'Gabbett (2016) called a ratio of 1.5 or more a “danger zone.” With the coupled ratio, a 1.5 matches what uncoupled ratio?',choices:['1.8','1.5','1.2','4.0'],correct:0,explain:'Coupled = 4u ÷ (u + 3). Set it to 1.5: 4u = 1.5u + 4.5, so u = 1.8. The two ways of computing the same idea put the cutoff in different places.'},
  {lvl:'ap',instant:true,q:'Suppose every week’s training were random and unrelated to other weeks. How correlated would this week be with the 4-week average that includes it?',choices:['About 0.5, from the shared week alone','0, since the weeks are unrelated','1, since they are the same data'],correct:0,explain:'This week is one quarter of the average. With equal, independent weeks, the correlation is (σ² ÷ 4) ÷ (σ × σ ÷ 2) = 0.5. That built-in link is the “mathematical coupling” critics point to.'}
 ],
 tour:[
  {title:'The debate',text:'People say today’s game is faster and harder on bodies. Pace counts possessions per team per 48 minutes: 99.4 in 2025-26, 90.1 in 2003-04, and 126.2 in 1961-62. The 1960s were faster.',pause:true,setup(sim){BioLab.setValues(sim,{pace:100,min:34,rest:0,beta:1,fat:'min',view:'season'});fresh(sim);}},
  {title:'Two plans',text:'Left: a slow plan, pace 90, with your top player on the court 40 minutes a game. Right: your plan, pace 100 and 34 minutes. Each strip is an 82-game season.',focus:[10,30,780,330],pause:true},
  {title:'Count the exposures',text:'Every possession on the court is one exposure: one chance to get hurt. A game at pace 90 has about 2 × 90 = 180 possessions, 90 each way. The slow plan’s player is out there 40 of 48 minutes: 2 × 90 × 40 ÷ 48 = 150 possessions a game.',focus:[10,30,780,330],pause:true},
  {title:'Tired legs',text:'In this model each possession gets riskier as minutes pile up: 40 minutes makes each one 40 ÷ 34 = 1.18 times as risky as 34 minutes. That size is an assumption for illustration.',pause:true},
  {title:'Your turn',text:'Your plan: pace 100, 34 minutes a game. First compute your player’s possessions, <b>2 × pace × minutes ÷ 48</b>, and click your answer at the bottom. Then make your call: does your plan cause more or fewer injuries than the slow plan? Or press Next to see the math.',pause:true,setup(sim){fresh(sim);}},
  {title:'The reveal',text:'Your plan: 2 × 100 × 34 ÷ 48 = 141.7 possessions, each 34 ÷ 40 = 0.85 times as risky as in the slow plan. That gives 1.25 injuries and 3.7 games missed a season. The slow plan: 1.54 injuries and 4.6 games. The faster pace adds plays, but fewer tired minutes more than make up for it here.',pause:true,setup(sim){sim.st.revealed=true;}},
  {title:'Resting healthy games',text:'Now your player sits 10 healthy games. Injuries fall to 1.05, but total games missed jumps to 13.1, because rest games are missed games too. An NBA-commissioned review of 10 seasons did not find that rest clearly lowered later injury risk.',pause:true,setup(sim){BioLab.setValues(sim,{rest:10});sim.st.revealed=true;}},
  {lvl:'ap',title:'The workload ratio',text:'Teams also watch the acute:chronic workload ratio: this week’s load ÷ recent weeks. Here 450 minutes after three 300-minute weeks gives 1.33 coupled or 1.50 uncoupled. Researchers dispute whether it predicts injury at all.',pause:true,setup(sim){BioLab.setValues(sim,{rest:0,view:'acwr',wkPrev:300,wkNow:450});}}
 ],
 onTourExit(sim){BioLab.setValues(sim,{view:'season'});},
 lab:{bio:'<p><b>Question:</b> Which raises injuries more: faster pace or more minutes?</p><ol><li>Press Show the math. Keep minutes at 34 and set pace to 90, 100, 110 and 120. Record a trial at each.</li><li>Set pace back to 100 and set minutes to 28, 34, 40 and 46. Record a trial at each.</li></ol><p>Write one sentence: which change raised games missed faster, and why (count possessions and risk per possession)?</p>',
  honors:'<p><b>Question:</b> When does an injury count rise while the rate per exposure stays flat?</p><ol><li>Press Show the math. Hold minutes at 34 and set pace to 90, 100 and 120.</li><li>Record <b>Injuries per season</b>, <b>Injuries per 1,000 games played</b> and <b>Injuries per 1,000 possessions</b>.</li><li>Repeat with pace 100 and minutes 28, 34 and 40.</li></ol><p>Explain which rate a headline should use to say “the game is getting more dangerous.”</p>',
  ap:'<p><b>Question:</b> How much does the answer depend on the risk function?</p><ol><li>For fatigue strength 0, 1 and 2, and for both “Minutes played” and “Possessions played,” record games missed for the slow plan and for a plan at pace 110 and 32 minutes.</li><li>Switch Show to Workload ratio. Enter a 4-week pattern of your own training and record both ratios.</li></ol><p><b>CER:</b> Claim whether this model can tell a coach how to set minutes. Use evidence from your table and reasoning about which parts are measured and which are assumed.</p>'},
 terms:[
  {t:'Pace',d:'Possessions per team per 48 minutes. A faster pace means more trips down the floor in the same time.'},
  {t:'Possession',d:'One team’s turn with the ball. It ends when the other team gets the ball.'},
  {t:'Exposure',d:'One chance to get hurt. Studies often count one athlete in one game or practice as one athlete-exposure.'},
  {t:'Load management',d:'Planning minutes, practices and rest to keep an athlete healthy and fresh over a season.'},
  {t:'Injury rate',d:'Injuries divided by exposures, often given per 1,000 exposures. A count can rise just because exposures rise.',lvl:'honors'},
  {t:'Player Participation Policy',d:'NBA rules adopted in 2023 that limit resting healthy star players, with fines for teams that break them.',lvl:'honors'},
  {t:'Acute:chronic workload ratio',d:'This week’s training load divided by the average of recent weeks. Proposed as an injury warning sign; its value is debated.',lvl:'ap'},
  {t:'Mathematical coupling',d:'When the same data sit in both parts of a ratio or comparison, which builds in a correlation that has nothing to do with biology.',lvl:'ap'}
 ],
 about:'<p><b>Illustrative model, not a real prediction.</b> One 82-game season for one player, computed as expected values. Exposures are possessions on the court: a game at pace P has about 2P possessions (P each way), so a player who plays M minutes is on the court for 2 × P × M ÷ 48. Risk per possession is anchored so that a 34-minute player at pace 100 with no rest games has 15.95 injuries per 1,000 games played: Bullock et al. reported 17.80 injuries and illnesses per 1,000 athlete game-exposures, and 1.85 of those were illness. The 34-minute anchor player is an assumption. Fatigue makes each possession riskier in proportion to (minutes ÷ 34) raised to a power, 1 unless you change it at Deep dive; that function is an assumption for illustration, not a measured curve. Rest games spread the schedule (82 games in about 164 days is an approximation), and each extra day off lowers risk by 15.96%, borrowed from one study’s odds estimate as an illustration. Each injury costs 3 games, the median in Bullock et al.; real injuries range from no games to a full season. The model ignores contact, injury history, age, travel and practice load, and it assumes faster pace does not make a single possession riskier. Nobody has measured that.</p>'+
 '<p><b>Facts and sources.</b> League averages, Basketball-Reference (<a href="https://www.basketball-reference.com/leagues/NBA_stats_per_game.html" target="_blank" rel="noopener">league averages table</a>, read Nov 2026): pace 99.4 and 115.6 points per game in 2025-26; pace 90.1 and 93.4 points in 2003-04; lowest listed pace 88.9 in 1998-99; 107.8 in 1973-74, the first season in that table. 3-point attempts were 2.8 of 90.6 shots (3.1%) in 1979-80, 37.6 of 89.2 (42.2%) in 2024-25 and 37.0 of 89.1 (41.5%) in 2025-26. Earlier pace values are from Basketball-Reference season pages: 126.2 and 118.8 points in <a href="https://www.basketball-reference.com/leagues/NBA_1962.html" target="_blank" rel="noopener">1961-62</a>, 121.4 in <a href="https://www.basketball-reference.com/leagues/NBA_1966.html" target="_blank" rel="noopener">1965-66</a>, 115.1 in <a href="https://www.basketball-reference.com/leagues/NBA_1971.html" target="_blank" rel="noopener">1970-71</a>. League leaders in minutes per game (<a href="https://www.basketball-reference.com/leaders/mp_per_g_yearly.html" target="_blank" rel="noopener">Basketball-Reference</a>): 48.5 in 1961-62, 45.4 in 1970-71, 42.7 in 1980-81, 40.4 in 1990-91, 42.0 in 2000-01, 40.3 in 2010-11, 37.6 in 2020-21 and 38.0 in 2025-26.</p>'+
 '<p><b>Rest rules.</b> The NBA board of governors adopted the Player Participation Policy for the 2023-24 season. It limits resting more than one star in the same game, requires stars to be available for national TV and in-season tournament games, and sets fines of $100,000, $250,000 and then $1.25 million for repeat violations. Most major awards now require 65 games, counted at 20 or more minutes with small exceptions (ESPN’s Bobby Marks, Oct 10, 2023, via <a href="https://abc7news.com/post/how-the-nbas-new-rules-on-resting-stars-will-work/13777093/" target="_blank" rel="noopener">ABC7</a>).</p>'+
 '<p><b>What studies found.</b> Known: Bullock et al. (2021, <i>Orthopaedic Journal of Sports Medicine</i> 9(6), <a href="https://research.birmingham.ac.uk/en/publications/temporal-trends-and-severity-in-injury-and-illness-incidence-in-t/" target="_blank" rel="noopener">record</a>) studied 2008-09 to 2018-19: 17.80 injuries and illnesses per 1,000 athlete game-exposures, a median of 3 games missed, a rate that was similar across seasons except the lockout-shortened 2012 season (21.68), and a rate that rose as each season went on. Morikawa et al. (2022, <i>Orthopaedic Journal of Sports Medicine</i> 10(9), <a href="https://doi.org/10.1177/23259671221121116" target="_blank" rel="noopener">doi</a>) found the condensed 2020 season had 39.97 injuries per 1,000 game-exposures (excluding COVID-19) against 28.20 in 2015 to 2018, with one of the largest rises in players averaging 30 or more minutes (1.67 times the earlier rate). Lewis (2018, <i>Journal of Athletic Training</i> 53(5), <a href="https://doi.org/10.4085/1062-6050-243-17" target="_blank" rel="noopener">doi</a>) found injury odds rose 2.87% for every 96 minutes played and fell 15.96% for each extra day of rest. Debated: Teramoto et al. (2017, <i>Journal of Science and Medicine in Sport</i> 20(3), <a href="https://oasis.library.unlv.edu/som_fac_articles/207/" target="_blank" rel="noopener">record</a>) found back-to-backs alone were not linked to a higher game-injury rate, while away games were. A 2024 NBA-commissioned IQVIA review of 10 seasons did not find that resting players lowered later injury risk, or more injuries in dense stretches, but it could not rule out benefits for some players (<a href="https://www.cbssports.com/nba/news/what-the-nbas-load-management-report-didnt-say-about-rest-and-injuries" target="_blank" rel="noopener">CBS Sports, Jan 12, 2024</a>). The two rates above differ partly because the studies used different data and definitions.</p>'+
 '<p><b>The workload ratio, a contested model.</b> Gabbett (2016, <i>British Journal of Sports Medicine</i> 50(5):273-280, <a href="https://europepmc.org/articles/PMC4789704" target="_blank" rel="noopener">full text</a>) proposed the acute:chronic workload ratio, with a “sweet spot” of 0.8 to 1.3 and a “danger zone” at 1.5 or more, and argued that well-built high loads can protect athletes. Lolli et al. (2019, <i>BJSM</i> 53(15):921-922, <a href="https://bjsm.bmj.com/content/53/15/921" target="_blank" rel="noopener">article</a>) showed that putting this week inside the chronic average couples the two numbers and creates spurious correlation. Impellizzeri et al. (2020, <i>International Journal of Sports Physiology and Performance</i> 15(6):907-913, <a href="https://doi.org/10.1123/ijspp.2019-0864" target="_blank" rel="noopener">doi</a>) argued the ratio has not been shown to cause injury, adds noise and statistical artifacts, and has no evidence behind using it to set training loads. Supporters say sudden spikes in training are still worth watching.</p>'+
 '<p><b>This is a teaching model, not medical or training advice for any athlete.</b> For your own minutes, practices or a nagging pain, talk to your athletic trainer. Training minutes you enter stay in this browser tab.</p>',
 thumbSetup(sim){sim.st.revealed=true;}
};

function drawACWR(sim,ctx,k){const X0=16,X1=784,big=k>1.3,p=sim.p,c=acC(sim),u=acU(sim);
  const ty=16+13*k;txt(ctx,fitTxt(ctx,['Your training load: one week, two ways to compute the ratio','Your load: two ratios','Two ratios'],X1-X0,13*k,800),X0,ty,{s:13*k,w:800});
  /* left: four weekly bars */
  const bL=X0+40,bR=big?X0+300:X0+330,bT=ty+30+12*k,bB=big?250:320,ymax=1.18*Math.max(900,p.wkNow,p.wkPrev),Y=v=>bB-(bB-bT)*v/ymax;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bL,bB);ctx.lineTo(bR,bB);ctx.stroke();
  const vals=[p.wkPrev,p.wkPrev,p.wkPrev,p.wkNow],labs=big?['W1','W2','W3','Now']:['Week 1','Week 2','Week 3','This week'],bw=(bR-bL)/4;
  vals.forEach((v,i)=>{const x=bL+i*bw+bw*0.15,w=bw*0.7;ctx.fillStyle=PAL[i===3?'s6':'s2'];rr(ctx,x,Y(v),w,bB-Y(v),4);ctx.fill();
   const inBar=bB-Y(v)>18*k;txt(ctx,String(v),x+w/2,inBar?Y(v)+14*k:Y(v)-5,{s:12*k,w:700,a:'center',c:inBar?'#fff':PAL['cv-ink']});txt(ctx,labs[i],x+w/2,bB+14*k+2,{s:12*k,a:'center',c:PAL['cv-soft']});});
  const cAvg=(p.wkNow+3*p.wkPrev)/4;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(bL,Y(cAvg));ctx.lineTo(bR,Y(cAvg));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,fitTxt(ctx,['Dashed line: 4-week average, '+f0(cAvg),'Dashed: 4-week avg '+f0(cAvg),'Avg '+f0(cAvg)],bR-X0,12*k,700),X0,bT-4,{s:12*k,w:700,c:PAL['s4']});
  /* right: the ratio scale */
  const sL=big?X0+330:X0+380,sR=X1-20,sY=bT+30+20*k,SX=v=>sL+(sR-sL)*clamp(v,0,3)/3;
  ctx.fillStyle=PAL['s3'];ctx.globalAlpha=.25;ctx.fillRect(SX(0.8),sY-14,SX(1.3)-SX(0.8),28);ctx.fillStyle=PAL['s1'];ctx.fillRect(SX(1.5),sY-14,SX(3)-SX(1.5),28);ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(sL,sY);ctx.lineTo(sR,sY);ctx.stroke();
  for(let v=0;v<=3.001;v+=(big?1:0.5))txt(ctx,fmtNum(v,v%1?1:0),SX(v),sY+16+12*k,{s:12*k,a:'center',c:PAL['cv-soft']});
  txt(ctx,big?'0.8 to 1.3':'“Sweet spot” 0.8 to 1.3',(SX(0.8)+SX(1.3))/2,sY-20,{s:12*k,a:'center',w:700,c:PAL['cv-ink']});
  txt(ctx,big?'≥ 1.5':'“Danger zone” ≥ 1.5',(SX(1.5)+SX(3))/2,sY-20,{s:12*k,a:'center',w:700,c:PAL['s1']});
  const mk=(v,col,lab,dy)=>{ctx.fillStyle=PAL[col];ctx.beginPath();ctx.arc(SX(v),sY,7,0,7);ctx.fill();ctx.font='700 '+(12*k)+'px '+FONT;const lw=ctx.measureText(lab).width;pill(ctx,lab,clamp(SX(v),sL+lw/2+8,sR-lw/2+8),sY+dy,PAL[col],'#fff',12*k);};
  mk(c,'s2','Coupled '+f2(c),44+12*k);mk(u,'s6','Uncoupled '+(u>3?'3+':f2(u)),50+36*k);
  let y=Math.max(bB+30+14*k,sY+90+40*k);
  y=wrap(ctx,big?'The coupled ratio puts this week inside its own average, so it can never pass 4.':'Coupled: this week ÷ the average of all 4 weeks, including this one. It can never pass 4. Uncoupled: this week ÷ the 3 weeks before.',X0+8,y,X1-X0-16,{s:12*k,c:PAL['cv-ink']});
  wrap(ctx,big?'Zones from Gabbett (2016). Critics say the ratio has not been shown to predict or prevent injury.':'Zones from Gabbett (2016). Critics (Lolli 2019, Impellizzeri 2020) say the ratio builds in a false correlation and has not been shown to predict or prevent injury.',X0+8,y+4,X1-X0-16,{s:12*k,c:PAL['cv-soft']});}

BioLab.register(SIM);

BioLab.addPractical({paceload:{
 hook:'People say today’s NBA is faster and rougher on bodies than ever, and that’s why stars sit out. But in 1961-62 teams averaged 126.2 possessions per 48 minutes, against 99.4 in 2025-26, and the minutes leader averaged 48.5 minutes a game, against 38.0 now. If your team plays faster but your best player plays fewer minutes, do they get hurt more or less?',
 answer:'Count exposures, not just pace. At pace 100 and 34 minutes, your player is on the court for about 142 possessions a game; at pace 90 and 40 minutes, 150. If each possession gets riskier as minutes pile up, the faster, shorter plan costs about 3.7 games a season to injury against 4.6 for the slow plan. Resting 10 healthy games cuts injuries a little but raises total games missed to about 13. Real studies still disagree about how much rest and crowded schedules matter.',
 uses:['Your own team: when a coach sets minutes, rotations and practice length, the question is the same: how many hard exposures each player gets, and how tired they are for them. Your athletic trainer can help you think about your own load, so ask them.','The NBA’s Player Participation Policy (2023): teams can be fined $100,000, then $250,000, then $1.25 million for resting healthy stars against the rules, and major awards such as MVP need 65 games of 20 or more minutes.','Injury headlines: studies report injuries per 1,000 exposures. One NBA study found 17.80 injuries and illnesses per 1,000 player-games over 11 seasons. Before you believe “injuries are up,” ask: per what?'],
 takeaway:'An injury count rises when exposures rise, even if no single play got riskier. Compare rates per exposure first, then ask what makes each exposure riskier, and how sure anyone is.'}});

BioLab.addReview({paceload:{questions:[
 {id:'poss',kind:'test',lvl:'bio',q:'Your team plays at pace 100. Your player plays 36 of 48 minutes. About how many possessions is the player on the court for in a game?',num:{ans:150,tol:0.5,unit:'possessions'},
  steps:['A game at pace 100 has about 2 × 100 = 200 possessions, 100 each way.','The player is on the court 36 ÷ 48 = 0.75 of the game.','200 × 0.75 = 150 possessions.'],
  lab:{set:{pace:100,min:36,rest:0},act:'show',look:'Read <b>Possessions played per game, your plan</b>.'},verify:[['poss',150,0.01]]},
 {id:'era',kind:'real',lvl:'bio',q:'League pace was 126.2 in 1961-62 and 99.4 in 2025-26. By what percent was the 1961-62 pace higher?',num:{ans:27,tol:0.5,unit:'%'},
  steps:['Divide: 126.2 ÷ 99.4 = 1.270.','1.270 − 1 = 0.270, so about 27% higher.','Faster pace means more possessions per game, not a more dangerous possession.']},
 {id:'rest',kind:'real',lvl:'bio',q:'At pace 100 and 34 minutes, your player rests 10 healthy games. In this model, about how many total games does the player miss?',choices:['About 13','About 3','About 10','About 1'],correct:0,
  steps:['Rest games: 10.','Injuries fall to about 1.05, at 3 games each: about 3.1 games.','10 + 3.1 = 13.1 games missed, against 3.7 with no rest games.'],
  lab:{set:{pace:100,min:34,rest:10},act:'show',look:'Read <b>Games missed per season, your plan</b>.'},verify:[['gm',13.14,0.05],['inj',1.047,0.005]]},
 {id:'defs',kind:'real',lvl:'honors',q:'One NBA study found 17.80 injuries and illnesses per 1,000 athlete game-exposures (2008-09 to 2018-19). Another found 28.20 per 1,000 game-exposures (2015 to 2018). How can both be right?',choices:['They counted injuries and exposures differently','One of them must be a mistake','Injuries rose 58% in a few years','Rates cannot be compared'],correct:0,
  steps:['Different data sources and definitions give different rates.','28.20 ÷ 17.80 = 1.58, so a reader who ignored the definitions would see a 58% jump.','Before comparing two rates, check what each one counts as an injury and as an exposure.']},
 {id:'ae',kind:'test',lvl:'honors',q:'A team has 15 injuries in 840 athlete-exposures. What is the rate per 1,000 athlete-exposures?',num:{ans:17.86,tol:0.02,unit:'per 1,000'},
  steps:['Rate = injuries ÷ exposures × 1,000.','15 ÷ 840 = 0.01786.','× 1,000 = 17.86 per 1,000 athlete-exposures.']},
 {id:'rate',kind:'real',lvl:'honors',q:'Your team speeds up from pace 92 to 100 with your player at 34 minutes. By what percent do injuries per 1,000 games rise, and what happens per 1,000 possessions?',choices:['About 9% per game; no change per possession','About 9% for both','No change for either','About 18% per game; 9% per possession'],correct:0,
  steps:['Possessions per game rise by 100 ÷ 92 = 1.087, about 9%.','Risk per possession depends on minutes in this model, and minutes did not change: 0.113 per 1,000 both times.','Per game: 14.7 → 16.0 per 1,000 games.'],
  lab:{set:{pace:100,min:34,rest:0},act:'show',look:'Read <b>Injuries per 1,000 games played</b> and <b>Injuries per 1,000 possessions</b>, then try pace 92.'},verify:[['per1000g',15.95,0.01],['per1000p',0.1126,0.0005]]},
 {id:'acwr',kind:'real',lvl:'ap',q:'You trained 300 minutes a week for 3 weeks, then 450 this week. Find the coupled and uncoupled acute:chronic ratios.',choices:['1.33 coupled, 1.50 uncoupled','1.50 coupled, 1.33 uncoupled','1.50 for both','1.33 for both'],correct:0,
  steps:['Coupled chronic load = (450 + 300 + 300 + 300) ÷ 4 = 337.5.','Coupled ratio = 450 ÷ 337.5 = 1.33.','Uncoupled ratio = 450 ÷ 300 = 1.50. The same week lands in a different zone depending on the formula.'],
  lab:{set:{view:'acwr',wkPrev:300,wkNow:450},look:'Read both ratio tiles.'},verify:[['acwrC',1.3333,0.001],['acwrU',1.5,0.001]]},
 {id:'couple',kind:'test',lvl:'ap',q:'For the coupled ratio a ÷ ((a + 3c) ÷ 4), what is the largest value possible, no matter how much you train this week?',num:{ans:4,tol:0.01,unit:''},
  steps:['Rewrite: coupled = 4a ÷ (a + 3c).','As c gets close to 0, this approaches 4a ÷ a = 4.','So the coupled ratio can never pass 4, because this week sits inside its own denominator. That is mathematical coupling.']}
]}});
})();
