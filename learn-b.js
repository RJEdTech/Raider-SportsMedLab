/* Learn it for SportsMedLab movements and skeleton (Nov 18, 2026): the same entries as AnatomyLab learn-a.js
   (identical sims on both sites). Edit them there and copy here. */
(function(){
'use strict';
/* ---- shared helpers (same as the science sites' learn-more.js) ---- */
const H=BioLab.h,PAL=H.PAL;
const RED='#b3261e',GREEN='#1b7a3a',BLUE='#1f5fbf',HI='#c8102e',GOLD='#b8860b';
const DEF=id=>BioLab.defs.find(d=>d.id===id);
const TOUR={};BioLab.defs.forEach(d=>{TOUR[d.id]=(d.tour||[]).slice();});
const TS=(id,title)=>{const s=(TOUR[id]||[]).find(x=>{const t=typeof x.title==='object'?Object.values(x.title).join('|'):String(x.title||'');return t.indexOf(title)>=0;});return s&&s.setup?s.setup:null;};
const tour=(id,title)=>sim=>{const f=TS(id,title);if(f)f(sim);};
const met=(sim,id)=>(sim.def.metrics||[]).find(m=>m.id===id);
const pick=v=>{if(v&&typeof v==='object'){const L=H.level||'bio';return v[L]||(L==='ap'&&v.honors)||v.bio||Object.values(v)[0];}return v;};
const F=(sim,id,d)=>{const m=met(sim,id);if(!m)return '…';let v;try{v=m.get(sim);}catch(e){return '…';}
  if(v==null)return '…';if(typeof v==='string')return v;if(!isFinite(v))return '…';
  const dd=d!=null?d:(m.d!=null?m.d:1);const s=Math.abs(v)>=1e4&&dd===0?Math.round(v).toLocaleString('en-US'):v.toFixed(dd);
  const u=pick(m.unit);return s+(u&&!/^\(|^of /.test(u)&&u.length<14?' '+u:'');};
const FL=(sim,id,d)=>{const m=met(sim,id);return (m?pick(m.label):id)+': '+F(sim,id,d);};
/* card: word-wrapped rows at x,y (top-left); o.up draws it upward from y */
function card(ctx,k,x,y,w,L,o){o=o||{};const kk=Math.min(k,1.35),pad=10*kk,rows=[];
  L.filter(r=>r!==''&&r!=null).forEach(r=>{const t=Array.isArray(r)?r:[r,{}],op=t[1]||{},sz=(op.s||13)*kk;ctx.font=(op.w||600)+' '+sz+'px '+H.FONT;
    const words=String(t[0]).split(' ');let cur='';words.forEach(wd=>{const tr=cur?cur+' '+wd:wd;if(cur&&ctx.measureText(tr).width>w-2*pad){rows.push([cur,op,sz]);cur=wd;}else cur=tr;});if(cur)rows.push([cur,op,sz]);});
  let h=pad*1.6;rows.forEach(r=>h+=r[2]*1.35);if(o.up)y-=h;
  ctx.save();H.rr(ctx,x,y,w,h,9);ctx.fillStyle=PAL['cv-sol']||PAL['card'];ctx.globalAlpha=0.96;ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=o.hi===false?1.2:2.5;ctx.strokeStyle=o.hi===false?PAL['cv-soft']:HI;ctx.stroke();
  let yy=y+pad*0.8;rows.forEach(([s,op,sz])=>{yy+=sz*1.1;H.txt(ctx,s,x+pad,yy,{s:sz,w:op.w||600,c:op.c||PAL['cv-ink']});yy+=sz*0.25;});ctx.restore();return h;}
function ring(ctx,k,r,tau){if(!r)return;const a=0.55+0.45*Math.sin((tau||0)*4);ctx.save();ctx.globalAlpha=a;ctx.lineWidth=3;ctx.strokeStyle=HI;ctx.setLineDash([7,5]);H.rr(ctx,r[0],r[1],r[2],r[3],10);ctx.stroke();ctx.restore();}
/* run a tool's own model off-screen (fresh state, given controls) and sample it; used to draw graphs from the model */
function offline(id,p,setup,T,dt,every,f){const d=DEF(id),defs={};(d.controls||[]).forEach(c=>defs[c.id]=c.def);
  const sim={st:d.init(),p:Object.assign({},defs,p||{}),t:0,def:d,vis:{}};if(setup)setup(sim);const out=[];const n=Math.round(T/dt),e=Math.max(1,Math.round(every/dt));
  for(let i=0;i<=n;i++){if(i%e===0)out.push([i*dt,f(sim)]);d.step(sim,dt);sim.t+=dt;}return out;}
const L={};

const FEM=[2.32,65.53,3.94];
L.skeleton={
  goals:{
    bio:['The names and places of the major bones','Axial versus appendicular skeleton','The parts of a long bone and where bones grow','How one bone can estimate a person’s height'],
    honors:['Compact versus spongy bone, and red versus yellow marrow','Why the growth plate closes','Using a regression equation and its ± range'],
    ap:['The skeleton’s seven functions, including hormone production','Bone landmarks for muscle attachment','Limits of mid-20th-century reference data']},
  matters:'Every injury report, X-ray and forensic case names bones. Knowing the skeleton is also knowing your own frame: where growth happens, why bones heal, and how a single bone can identify a person.',
  steps:[
    {key:'whole',title:'The adult skeleton',set:{task:'explore',bone:'none',view:'front',zoom:'whole',labels:true},pause:true,
     see:'The adult skeleton from the front, with each bone group labeled. An adult has about 206 bones.',
     why:'Bones give the body its frame, protect organs, anchor muscles, store calcium and make blood cells. Each bone’s shape fits its job.'},
    {key:'groups',title:'Axial and appendicular',set:{task:'groups',sortMode:'show',view:'front',zoom:'whole',labels:true},pause:true,
     see:'Blue: the <b>axial skeleton</b>, 80 bones (skull, spine, ribs, sternum). Gold: the <b>appendicular skeleton</b>, 126 bones (the limbs and their girdles).',
     why:'Axial bones run down the body’s central axis and protect the brain, spinal cord and heart. Appendicular bones move you.'},
    {key:'femur',title:'The femur',set:{task:'explore',bone:'femur',view:'front',zoom:'whole',labels:true},pause:true,
     see:'The femur turns red: the thigh bone, from the hip socket to the knee. It is the longest and strongest bone in the body.',
     why:'Because the femur makes up so much of your leg, its length tracks your height closely. Forensic scientists use that.'},
    {key:'forearm',title:'Radius and ulna',set:{task:'explore',bone:'radius',zoom:'hand',view:'front',labels:true},pause:true,
     see:'Zoomed in on the forearm: the radius (red) runs on the thumb side, the ulna on the little-finger side.',
     why:'In anatomical position the thumb is lateral, so the radius is the lateral forearm bone. Bone names plus direction words pin down any spot.'},
    {key:'long',title:'Inside a long bone',set:{task:'long',part:'diaphysis',age:'adult'},pause:true,
     see:'A long bone opened up: a shaft (<b>diaphysis</b>) of hard compact bone around a hollow cavity, and wide ends (<b>epiphyses</b>) of spongy bone.',
     why:'Compact bone resists bending along the shaft. Spongy bone in the ends is light but strong, and holds red marrow.'},
    {key:'plate',title:'Where bones grow',set:{task:'long',part:'plate',age:'adult'},cause:{from:{age:'grow'},delay:3,dur:0.6,label:'Age'},
     see:'A teen’s bone has a red band of cartilage near each end: the <b>epiphyseal plate</b>. As an adult, the plate becomes a thin line.',
     why:'Bones grow longer at the plate. Once it turns to bone, usually by the early twenties, you stop getting taller.'},
    {key:'blood',title:'Bones make blood',set:{task:'func',fn:'blood'},pause:true,
     see:'Red shows where an adult makes blood cells: flat bones, the vertebrae, and the tops of the femur and humerus.',
     why:'Red marrow in these bones makes red blood cells, white blood cells and platelets: about 2 million red cells every second.'},
    {key:'height',title:'Height from one femur',set:{task:'explore',bone:'femur',view:'front',zoom:'whole',labels:true},speed:0.5,
     see:'The line is the lab’s formula for white males: height = 2.32 × femur + 65.53 cm. The dot: the 52.4 cm femur.',
     why:'Read across: about 187 cm (6 ft 2 in), give or take 4 cm. The band shows how real people scatter around the line.',
     so:{honors:'Mid-1900s data: use with caution.'},
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,B={x0:120,x1:720,y0:120,y1:640},xr=[35,60],ys=h=>(h-140)/70;K.dim(ctx,LH);
       K.axes(ctx,B,k,{xr,xt:[[35,'35'],[40,'40'],[45,'45'],[50,'50'],[55,'55'],[60,'60']],yt:[[ys(140),'140'],[ys(160),'160'],[ys(180),'180'],[ys(200),'200']],xl:'Femur length (cm)',yl:'Height (cm)'});
       const f=x=>FEM[0]*x+FEM[1],to=35+Math.min(25,tau*12);
       ctx.save();ctx.globalAlpha=0.18;ctx.fillStyle=GREEN;ctx.beginPath();ctx.moveTo(K.X(B,xr,35),K.Y(B,ys(f(35)+FEM[2])));ctx.lineTo(K.X(B,xr,60),K.Y(B,ys(f(60)+FEM[2])));ctx.lineTo(K.X(B,xr,60),K.Y(B,ys(f(60)-FEM[2])));ctx.lineTo(K.X(B,xr,35),K.Y(B,ys(f(35)-FEM[2])));ctx.closePath();ctx.fill();ctx.restore();
       K.curve(ctx,B,xr,x=>ys(f(x)),to,GREEN,null,4);
       if(to>=60){const x=K.X(B,xr,52.4),hh=f(52.4),y=K.Y(B,ys(hh));ctx.save();ctx.strokeStyle=RED;ctx.setLineDash([5,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,B.y1);ctx.lineTo(x,y);ctx.lineTo(B.x0,y);ctx.stroke();ctx.restore();
         K.dot(ctx,x,y,RED,8);K.tagA(ctx,'52.4 cm → '+hh.toFixed(0)+' ± '+FEM[2].toFixed(0)+' cm',x-14,y-34,k,{s:13.5,hi:true},'r');}}}],
  useIt:[
    {do:'If you get an X-ray after an injury, ask which bone and which part of it is hurt.',why:'“A crack near the growth plate of the tibia” means something different from a crack in the shaft, especially for a teen who is still growing.'},
    {do:'Get calcium, vitamin D and weight-bearing exercise while you are young.',why:'Bones store minerals and build most of their density by your mid-twenties. What you build now has to last.'},
    {do:'Watch for news stories about identifying remains and look for how height was estimated.',why:'Forensic anthropologists use long-bone formulas like the one here, always with a ± range.'}],
  tryIt:[{title:'measure and predict (15 minutes, a partner)',steps:['Measure your partner’s femur from the bony bump at the side of the hip to the outer knee joint, in cm.','Use height = 2.32 × femur + 65.53 (or the lab’s formula for your partner).','Compare the prediction with their real height.'],look:'Most predictions land within a few centimeters, but not all. That is what the ± in the formula means: real people scatter around the line.'}]};

/* ======================= muscles ======================= */

L.movements={
  goals:{
    bio:['Naming movements as pairs of opposites','Which plane each movement happens in','How to tell if a joint’s range of motion is normal'],
    honors:['Rotation, pronation and supination','The ankle’s own movement words','How joint shape limits movement'],
    ap:['Measuring range of motion with a goniometer','Describing a movement problem in one clinical line','Matching exercises to planes']},
  matters:'Coaches, trainers and therapists describe exercises and injuries by movement and plane. A shoulder that only flexes to 140° is something you can measure, write down and track as it heals.',
  steps:[
    {key:'start',title:'Start in anatomical position',run:tour('movements','Start in anatomical position'),pause:true,
     see:'The figure stands in anatomical position. The blue part moves, the dashed green arc is its normal range, and the red wedge shows how far it moved.',
     why:'Every movement is named from this starting pose, and each comes in a pair of opposites.'},
    {key:'flex',title:'Flexion in the sagittal plane',run:tour('movements','Flexion in the sagittal plane'),pause:true,
     see:'A biceps curl: the elbow bends to 110°. The plane picture shows the sagittal plane, splitting left from right.',
     why:'<b>Flexion</b> makes the angle at a joint smaller; <b>extension</b> opens it. Both happen in the sagittal plane, best seen from the side.'},
    {key:'abd',title:'Abduction in the frontal plane',run:tour('movements','Abduction in the frontal plane'),pause:true,
     see:'A lateral raise: the arm swings out to the side to 90°. The plane is now the frontal plane, seen from the front.',
     why:'<b>Abduction</b> moves a limb away from the midline; <b>adduction</b> brings it back. Both happen in the frontal plane.'},
    {key:'rot',title:'Rotation in the transverse plane',run:tour('movements','Rotation in the transverse plane'),pause:true,
     see:'Seen from above, with the elbow bent, the upper arm spins and the forearm swings out like a gate.',
     why:'Rotation turns a bone around its own long axis. It happens in the transverse plane, the same plane as a trunk twist.'},
    {key:'pro',lvl:'honors',title:'Pronation and supination',run:tour('movements','Pronation and supination'),pause:true,
     see:'The palm turns down: <b>pronation</b>. Turning it up is <b>supination</b>.',
     why:'The radius crosses over the ulna at a pivot joint near the elbow. The elbow’s hinge isn’t doing this.'},
    {key:'ankle',title:'The ankle has its own words',run:tour('movements','The ankle has its own words'),pause:true,
     see:'The sole turns inward: <b>inversion</b>. Pointing the toes is plantarflexion; pulling them up is dorsiflexion.',
     why:'Rolling the ankle inward is the most common ankle sprain. The ligaments on the outside get stretched.'},
    {key:'hook',title:'The hitter’s shoulder',set:{view:'move',joint:'shoulder',move:'flexion',angle:140,cam:'auto'},pause:true,
     see:'Shoulder flexion stops at 140°. The dashed green arc runs to 180°, the normal range. The red wedge stops 40° short.',
     why:'Write: “Limited shoulder flexion, 140° of 180°, sagittal plane.” Her other arm reaches 180°, so this is a real loss.',
     overlay(sim,ctx,LH,k){const K=BioLab.lg;K.tagA(ctx,'40° short of normal',20,LH-40,k,{s:13.5,hi:true},'l');}},
    {key:'types',title:'Structure limits movement',run:tour('movements','Structure limits movement'),pause:true,
     see:'A ball-and-socket joint, like the shoulder and hip: a round head in a cup.',
     why:'Shape sets what a joint can do. A ball and socket moves in every plane, a hinge in one, a pivot only spins, and a saddle rocks in two.'}],
  useIt:[
    {do:'When a trainer says an exercise is “frontal plane,” picture which way the arm or leg moves.',why:'Programs mix planes on purpose. Lateral raises and side lunges are frontal; curls and squats are sagittal; twists and throws are transverse.'},
    {do:'After an injury, ask what your range of motion is and what normal is.',why:'Range of motion in degrees is how recovery is tracked. Comparing with the uninjured side shows what is normal for you.'},
    {do:'Warm up through all three planes before a sport that twists, like tennis or volleyball.',why:'Many injuries happen in the plane you didn’t prepare: a twist or a side step after only forward-and-back warm-ups.'}],
  tryIt:[{title:'name that movement (5 minutes, a partner)',steps:['One partner does a movement: a wave, a kick, a head shake, a toe raise.','The other names the movement, the joint and the plane.','Switch, and try one that combines two movements.'],look:'Every everyday motion breaks down into named pairs in three planes. Combined motions, like throwing, use all three.'}]};

/* ======================= contraction ======================= */
const coFoc=n=>sim=>((sim.vis&&sim.vis.ly&&sim.vis.ly[n])||[0,0,800,500]);
/* length–tension table copied from sims/contraction.js LT: [sarcomere length µm, share of best overlap] */
const LT=[[1.27,0],[1.67,.84],[2,1],[2.25,1],[3.65,0]];
const ltF=x=>{if(x<=LT[0][0]||x>=LT[4][0])return 0;for(let i=0;i<4;i++)if(x<=LT[i+1][0])return LT[i][1]+(LT[i+1][1]-LT[i][1])*(x-LT[i][0])/(LT[i+1][0]-LT[i][0]);return 0;};

BioLab.addLearn(L);
})();
