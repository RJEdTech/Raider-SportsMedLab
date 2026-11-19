/* Learn it for SportsMedLab (Nov 18, 2026, helper I).
   One BioLab.addLearn block for 12 tools. Steps reuse each tool's own walkthrough setups (captured below before Learn it
   replaces the tour), mark the result on the picture with live numbers from the tool's metrics, and keep about 40 words a step.
   Every tool already has 6+ Test yourself questions, so no addReview here. movements and skeleton come from AnatomyLab's file. */
(function(){
'use strict';
const H=BioLab.h,PAL=H.PAL;
const RED='#b3261e',GREEN='#1b7a3a',BLUE='#1f5fbf',HI='#c8102e',AMBER='#a05a00';
const DEF=id=>BioLab.defs.find(d=>d.id===id);
/* the tool's own walkthrough steps, captured before Learn it replaces them */
const TOUR={};BioLab.defs.forEach(d=>{TOUR[d.id]=(d.tour||[]).slice();});
const TS=(id,title)=>{const s=(TOUR[id]||[]).find(x=>{const t=typeof x.title==='object'?Object.values(x.title).join('|'):String(x.title||'');return t.indexOf(title)>=0;});return s&&s.setup?s.setup.bind(s):null;};
/* run several walkthrough setups in order (a later step builds on an earlier one) */
const tour=(id,...titles)=>sim=>{titles.forEach(t=>{const f=TS(id,t);if(f)f(sim);});};
const met=(sim,id)=>(sim.def.metrics||[]).find(m=>m.id===id);
const M=(sim,id)=>{const m=met(sim,id);if(!m)return NaN;try{return m.get(sim);}catch(e){return NaN;}};
/* a metric for a what-if setting, without touching the running model (only for metrics that read sim.p alone) */
const MP=(sim,id,over)=>{const m=met(sim,id);if(!m)return NaN;try{return m.get({p:Object.assign({},sim.p,over),def:sim.def,st:sim.st,vis:{}});}catch(e){return NaN;}};
const pick=(v)=>{if(v&&typeof v==='object'){const L=H.level||'bio';return v[L]||(L==='ap'&&v.honors)||v.bio||Object.values(v)[0];}return v;};
const F=(sim,id,d)=>{const m=met(sim,id);if(!m)return '…';let v;try{v=m.get(sim);}catch(e){return '…';}
  if(v==null)return '…';if(typeof v==='string')return v;if(!isFinite(v))return '…';
  const dd=d!=null?d:(m.d!=null?m.d:1);let s=Math.abs(v)>=1e4&&dd===0?Math.round(v).toLocaleString('en-US'):v.toFixed(dd);
  const u=pick(m.unit);return s+(u&&u.length<14?(/^[°%]/.test(u)?'':' ')+u:'');};
const FL=(sim,id,d)=>{const m=met(sim,id);return (m?pick(m.label):id)+': '+F(sim,id,d);};
/* card: word-wrapped rows; o.up draws it upward from y */
function card(ctx,k,x,y,w,L,o){o=o||{};const kk=Math.min(k,1.35),pad=10*kk,rows=[];
  L.filter(r=>r!==''&&r!=null).forEach(r=>{const t=Array.isArray(r)?r:[r,{}],op=t[1]||{},sz=(op.s||13)*kk;ctx.font=(op.w||600)+' '+sz+'px '+H.FONT;
    const words=String(t[0]).split(' ');let cur='';words.forEach(wd=>{const tr=cur?cur+' '+wd:wd;if(cur&&ctx.measureText(tr).width>w-2*pad){rows.push([cur,op,sz]);cur=wd;}else cur=tr;});if(cur)rows.push([cur,op,sz]);});
  let h=pad*1.6;rows.forEach(r=>h+=r[2]*1.35);if(o.up)y-=h;
  ctx.save();H.rr(ctx,x,y,w,h,9);ctx.fillStyle=PAL['cv-sol']||PAL['card'];ctx.globalAlpha=0.96;ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=o.hi===false?1.2:2.5;ctx.strokeStyle=o.hi===false?PAL['cv-soft']:HI;ctx.stroke();
  let yy=y+pad*0.8;rows.forEach(([s,op,sz])=>{yy+=sz*1.1;H.txt(ctx,s,x+pad,yy,{s:sz,w:op.w||600,c:op.c||PAL['cv-ink']});yy+=sz*0.25;});ctx.restore();return h;}
/* dashed red ring around the part of the picture that matters */
function ring(ctx,k,r,tau){if(!r)return;const a=0.55+0.45*Math.sin((tau||0)*4);ctx.save();ctx.globalAlpha=a;ctx.lineWidth=3;ctx.strokeStyle=HI;ctx.setLineDash([7,5]);H.rr(ctx,r[0],r[1],r[2],r[3],10);ctx.stroke();ctx.restore();}
const L={};

/* ======================= kineticchain (800 × 520) ======================= */
/* cards sit low in the right-hand load panel, under the bars */
const kcCard=(ctx,k,LH,rows)=>card(ctx,k,512,LH-26,276,rows,{up:true});
const KC0={ankle:38,hip:120,glute:100,depth:90,sides:'both',thor:100,over:false,cs:'free',move:true};
const kcSet=o=>Object.assign({},KC0,o);
L.kineticchain={
  goals:{
    bio:['Why your joints work as a chain, not one at a time','How a stiff ankle makes the trunk lean and the knee cave in','How stiff hips load the low back','Why pain often shows up one joint away from the cause'],
    honors:['The joint-by-joint model: mobile and stable joints alternate','How to read the load at each joint','Why you evaluate both sides of the body'],
    ap:['The extended model: thoracic spine and shoulder blade','How joint moments move when one joint loses range']},
  matters:'Athletic trainers treat the cause, not just the sore spot. A knee that hurts on every squat may be paying for an ankle that lost its motion after a sprain. Fixing only the knee leaves the cause in place.',
  steps:[
    {key:'healthy',title:'A healthy squat',set:kcSet({}),fresh:true,speed:1,focus:[0,0,275,520],
     see:'A bodyweight squat. Side view left, front view middle, the load at each joint right. The dashed line is the balance line.',
     why:'Ankle, knee and hip bend together, and the trunk leans just enough to stay balanced over the middle of the foot.',
     overlay(sim,ctx,LH,k){kcCard(ctx,k,LH,[[FL(sim,'th',0),{w:700}],[FL(sim,'lean',0)]]);}},
    {key:'jobs',title:'Each joint has a job',set:kcSet({}),speed:1,focus:[505,0,295,520],
     see:'Each joint is marked M (mobile) or S (stable): ankle M, knee S, hip M, low back S.',
     why:'This is the <b>joint-by-joint model</b>. Mobile joints should bend fully. Stable joints should hold still and control motion.',
     overlay(sim,ctx,LH,k){kcCard(ctx,k,LH,[['M = mobile: ankle, hip',{w:700,c:BLUE}],['S = stable: knee, low back',{w:700,c:GREEN}]]);}},
    {key:'ankle',title:'Take away ankle range',set:kcSet({ankle:18}),speed:1,focus:[0,0,275,520],cause:{from:{ankle:38},delay:0.8,dur:1.6,label:'Ankle range'},
     see:'Ankle range drops from 38° to 18°. The shin can’t tip forward, so the trunk tips far forward and the squat stops short.',
     why:'To stay balanced over the foot, the trunk must lean more. Read the lean on the tag and the depth on the card.',
     overlay(sim,ctx,LH,k){kcCard(ctx,k,LH,[[FL(sim,'th',0),{w:700,c:RED}],[FL(sim,'lean',0),{w:700,c:RED}],['Healthy: 90° deep, 32° lean',{s:12}]]);}},
    {key:'knee',title:'Then the knee pays',set:kcSet({ankle:18}),speed:1,focus:[275,0,230,520],
     see:'Same stiff ankle, now the front view. The knees cave inward. That is <b>knee valgus</b>.',
     why:'The foot rolls in and the knee collapses to find motion the ankle can’t give. A stable joint is now moving, and it takes the extra load.',
     overlay(sim,ctx,LH,k){kcCard(ctx,k,LH,[[FL(sim,'val',0),{w:700,c:RED}],['Healthy: 3°',{s:12}]]);}},
    {key:'graph',title:'The graph: ankle range vs. squat',set:kcSet({}),speed:1,
     see:'This model’s squat at each ankle range, 5° to 45°. Red: depth reached. Amber: trunk lean.',
     why:'Below 22°, the squat can’t reach parallel and the trunk leans about 65°. From 22° to 36°, more range cuts the lean. Past 36°, more adds nothing.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,p=tau%12,B={x0:110,x1:720,y0:60,y1:400},xr=[5,45];K.dim(ctx,LH);
       K.axes(ctx,B,k,{xr,xt:[[5,'5°'],[15,'15°'],[25,'25°'],[35,'35°'],[45,'45°']],yt:[[0,'0°'],[0.25,'25°'],[0.5,'50°'],[0.75,'75°'],[1,'100°']],xl:'Ankle dorsiflexion range',yl:'Angle'});
       const th=a=>MP(sim,'th',{ankle:a,hip:120,glute:100,depth:90,sides:'both'})/100,ln=a=>MP(sim,'lean',{ankle:a,hip:120,glute:100,depth:90,sides:'both'})/100;
       const f=Math.min(1,p/4),to=5+40*f;K.curve(ctx,B,xr,th,to,HI);K.curve(ctx,B,xr,ln,to,AMBER,[8,6]);
       if(p>4.5){[18,38].forEach((a,i)=>{const x=K.X(B,xr,a);K.dot(ctx,x,K.Y(B,th(a)),HI,6);K.dot(ctx,x,K.Y(B,ln(a)),AMBER,6);});
         K.tagA(ctx,'18°: depth '+Math.round(th(18)*100)+'°, lean '+Math.round(ln(18)*100)+'°',K.X(B,xr,18)+10,K.Y(B,th(18))+34,k,{s:12.5},'l');
         K.tagA(ctx,'38° (typical): depth 90°, lean '+Math.round(ln(38)*100)+'°',K.X(B,xr,38)-10,K.Y(B,ln(38))+34,k,{s:12.5},'r');}
       K.tagA(ctx,'Depth reached',B.x0+14,B.y0+10,k,{s:12.5,c:HI},'l');K.tagA(ctx,'Trunk lean',B.x0+14,B.y0+42,k,{s:12.5,c:AMBER},'l');}},
    {key:'hips',title:'Stiff hips hit the low back',set:kcSet({hip:90}),speed:1,focus:[0,0,275,520],cause:{from:{hip:120},delay:0.8,dur:1.6,label:'Hip range'},
     see:'The ankle is fine again, but hip flexion drops to 90°. At the bottom, the pelvis tucks under and the low back rounds.',
     why:'The hip runs out of range, so the lumbar spine bends to finish. A joint built to be stable now moves under load.',
     overlay(sim,ctx,LH,k){kcCard(ctx,k,LH,[[FL(sim,'lam',0),{w:700,c:RED}],H.atLeast('honors')?[FL(sim,'backM',0)]:'',['Healthy: 2° of lumbar flexion',{s:12}]]);}},
    {key:'glute',title:'Strength counts too',set:kcSet({glute:40}),speed:1,focus:[275,0,230,520],cause:{from:{glute:100},delay:0.8,dur:1.6,label:'Glute strength'},
     see:'Full range, but the glutes drop to 40% strength. In the front view the knees still drift inward.',
     why:'The glutes hold the thigh bone out. A joint can fail the chain through weakness as well as stiffness.',
     overlay(sim,ctx,LH,k){kcCard(ctx,k,LH,[[FL(sim,'val',0),{w:700,c:RED}],H.atLeast('honors')?[FL(sim,'valM',0)]:'']);}},
    {key:'sides',lvl:'honors',title:'Compare both sides',set:kcSet({ankle:18,sides:'right'}),speed:1,focus:[275,0,230,520],
     see:'Only the right ankle is stiff now. In the front view, the left knee tracks straight and the right caves in.',
     why:'The healthy side shows what normal looks like for this athlete. That is why athletic trainers always evaluate both sides.',
     overlay(sim,ctx,LH,k){kcCard(ctx,k,LH,[[FL(sim,'val',0),{w:700,c:RED}],['Left side: about 3°',{s:12}]]);}},
    {key:'hook',title:'Your question: where should the athletic trainer look?',set:kcSet({ankle:38,sides:'right'}),speed:1,focus:[275,0,230,520],cause:{from:{ankle:18},delay:1,dur:1.8,label:'Right ankle range'},
     see:'The soccer player’s right ankle starts stiff, at 18°, from last season’s sprain. Now restore it to 38°.',
     why:'Right-knee valgus falls from about 9° to 3°. The knee was paying for the ankle. Look first at the sprained ankle, one joint below the pain.',
     overlay(sim,ctx,LH,k){kcCard(ctx,k,LH,[[FL(sim,'val',0),{w:800,c:GREEN}],['Before: about 9° with the stiff ankle',{s:12}]]);}},
    {key:'thor',lvl:'ap',title:'The extended model',set:kcSet({over:true,thor:0}),speed:1,focus:[505,0,295,520],
     see:'Arms overhead, with no thoracic spine extension. The arms drift forward of vertical.',
     why:'Up the chain the jobs keep alternating: thoracic spine mobile, shoulder blade stable. A stiff upper back makes the shoulder blade and low back work harder.',
     overlay(sim,ctx,LH,k){kcCard(ctx,k,LH,[[FL(sim,'drift',0),{w:700,c:RED}],[FL(sim,'backM',0)]]);}}
  ],
  useIt:[
    {do:'If your knee aches during squats or landings, ask whether an old ankle sprain got its full motion back.',why:'A stiff ankle pushes the knee inward to find motion. Treating only the knee leaves the cause in place.'},
    {do:'Before heavy squats, check your ankle range with a knee-to-wall test: toes 10 cm from a wall, can your knee touch it with the heel down?',why:'About 35 to 40° of ankle range lets the shin move forward, so the trunk and knee don’t have to make up for it.'},
    {do:'If you sit all day and your low back hurts at the bottom of a squat, work on hip mobility.',why:'When the hips run out of flexion, the lumbar spine bends under load to finish the movement.'}],
  tryIt:[{title:'the wall squat check (5 minutes)',steps:['Stand facing a wall, toes about 10 cm away. Squat slowly while a friend watches from the side and the front.','Now stand on a thin book under your heels and squat again.'],look:'With heels raised, the ankle needs less range. Most people squat deeper with less trunk lean. Your friend should see the knees track straighter too.'}]
};

/* ======================= injury (800 × 520) ======================= */
const injCard=(ctx,k,LH,rows)=>card(ctx,k,12,LH-16,380,rows,{up:true});   /* grades view: under the drawing */
const injFCard=(ctx,k,rows)=>card(ctx,k,12,512,420,rows,{up:true});
const injDay=d=>100*Math.log(d+1)/Math.log(1095+1);   /* the tool's day slider is a log scale */
L.injury={
  goals:{
    bio:['How tension, compression and shear injure tissue','Why a tissue first springs back, then is damaged, then fails','What grades I, II and III mean for a sprain or strain','The three phases of healing and how long each lasts','Why a ligament that stops hurting is still weak'],
    honors:['How repeated loads cause chronic injuries like stress fractures','Why controlled load lines collagen up and rest alone does not'],
    ap:['How the day you start controlled loading changes the final strength']},
  matters:'Pain fades long before tissue is strong again. Athletes who return when it “feels fine” reinjure most often in the repair phase. Knowing the healing timeline is how an athletic trainer plans a safe return.',
  steps:[
    {key:'forces',title:'Three forces',run:tour('injury','Three forces'),speed:1,focus:[0,0,800,520],
     see:'A ligament pulled from both ends: <b>tension</b>. The bar shows the load as a share of its limit, 40%.',
     why:'Injuries start with tension (pulling apart), compression (squeezing) or shear (sliding across), or a mix.',
     overlay(sim,ctx,LH,k){injFCard(ctx,k,[[FL(sim,'pct',0),{w:700}],[F(sim,'stateT'),{w:700,c:GREEN}]]);}},
    {key:'plastic',title:'Elastic, then damage',run:tour('injury','Three forces','Elastic, then damage'),speed:1,focus:[0,0,470,520],
     see:'The load rises to 70% of the limit. Some fibers turn pale: damaged. The ligament no longer springs all the way back.',
     why:'Small loads are elastic. Past about half the limit, tissue enters the plastic range: lasting stretch, but no tear.',
     overlay(sim,ctx,LH,k){injFCard(ctx,k,[[FL(sim,'pct',0),{w:700}],[F(sim,'stateT'),{w:700,c:AMBER}]]);}},
    {key:'sprain',title:'Failure: a sprain',run:tour('injury','Three forces','Failure: a sprain'),speed:1,focus:[0,0,470,520],
     see:'The load passes the limit, 110%. The ligament tears through.',
     why:'A torn ligament is a <b>sprain</b>. A torn muscle or tendon is a <b>strain</b>. Sprain: ligament, the one that connects bone to bone.',
     overlay(sim,ctx,LH,k){injFCard(ctx,k,[[FL(sim,'pct',0),{w:700,c:RED}],[F(sim,'stateT'),{w:700,c:RED}]]);}},
    {key:'grades',title:'Grades I, II and III',set:{view:'grades',kind:'sprain',grade:2},fresh:true,speed:1,focus:[0,0,800,330],cause:{from:{grade:1},delay:1,dur:1.5,label:'Grade'},
     see:'A grade II sprain: some fibers torn, a looser joint, an uneven walk. The card lists the findings.',
     why:'Grade I stretches fibers. Grade II tears some. Grade III tears all the way through, with the most swelling and looseness.',
     overlay(sim,ctx,LH,k){injCard(ctx,k,LH,[[FL(sim,'wb'),{w:700}],['Grade I: stretch · II: partial tear · III: complete tear',{s:12}]]);}},
    {key:'chronic',title:'Acute or chronic',run:tour('injury','Three forces','Acute or chronic'),speed:1,focus:[0,0,800,520],
     see:'Bone at 60% of its limit, repeated 100,000 times without enough rest. The limit falls to 55% and it cracks.',
     why:'One big load causes an <b>acute</b> injury. Small loads repeated faster than repair cause a <b>chronic</b> one, like a stress fracture.',
     overlay(sim,ctx,LH,k){injFCard(ctx,k,[[F(sim,'stateT')+(H.atLeast('honors')?' · '+FL(sim,'lim',0):''),{w:700,c:RED}]]);}},
    {key:'inflam',title:'Phase 1: inflammatory response',run:tour('injury','Inflammatory response'),speed:1,focus:[0,30,360,312],
     see:'Day 2 of a grade II ligament sprain. The close-up is red with cells clearing damage. On the graph, strength is falling.',
     why:'Days 0 to about 4: redness, heat, swelling, pain and loss of function. The goal is to decrease pain and swelling.'},
    {key:'repair',title:'Phase 2: repair and regeneration',run:tour('injury','Inflammatory response','Repair and regeneration'),speed:1,focus:[0,30,360,312],
     see:'Week 3. New collagen fibers (gold) arrive in a tangle. The green arrows are gentle, controlled load.',
     why:'From about 3 days to 6 weeks, new collagen needs enough tension to line up, but too much tears it. This is when most reinjuries happen.'},
    {key:'early',title:'Too much too early',run:tour('injury','Inflammatory response','Repair and regeneration','Too much too early'),speed:1,focus:[350,0,450,366],
     see:'Same injury, but full practice from week 1. Red X marks on the graph show each time the load passed the tissue’s strength.',
     why:'Each retear sends the tissue back to repair, so strength falls behind the controlled-load curve (solid green).'},
    {key:'remodel',title:'Phase 3: remodeling and maturation',run:tour('injury','Inflammatory response','Repair and regeneration','Too much too early','Remodeling and maturation'),speed:1,focus:[350,0,450,366],
     see:'One year, with controlled load. The fibers line up along the arrows, and the strength curve climbs.',
     why:'From about 4 weeks to 3 years, collagen remodels along the lines of load. Without load it stays tangled. A healed ligament may never reach 100%.'},
    {key:'rest',lvl:'honors',title:'Rest only',run:sim=>{tour('injury','Inflammatory response')(sim);BioLab.setValues(sim,{rehab:'rest',day:injDay(365)});},speed:1,focus:[350,0,450,366],
     see:'Same injury and the same one year, but rest only: no controlled load. Compare the blue dashed curve with the green one.',
     why:'Without tension the new collagen never lines up, so the ligament ends weaker. Protecting tissue is not the same as healing it.'},
    {key:'hook',title:'Your question: how strong is it at 3 weeks?',run:tour('injury','Inflammatory response','Repair and regeneration'),speed:1,focus:[350,0,450,366],
     see:'The athlete’s ankle at 3 weeks, pain gone. Find the dot on the strength curve.',
     why:'The ligament is at only about 29% of its uninjured strength, mid-repair. Feeling fine isn’t being strong. Return gradually, with controlled load.'},
    {key:'start',lvl:'ap',title:'When to start loading',run:sim=>{tour('injury','Inflammatory response')(sim);BioLab.setValues(sim,{rehab:'ctrl',start:21,day:injDay(365)});},speed:1,focus:[350,0,450,366],cause:{from:{start:5},delay:1,dur:1.5,label:'Start controlled load on day'},
     see:'Controlled load again, but starting on day 21 instead of day 5. Read the one-year strength.',
     why:'Collagen laid down without tension in the first weeks stays disorganized. Starting gentle loading early in repair, not waiting, gives the strongest scar.'}
  ],
  useIt:[
    {do:'After a sprain, don’t treat “it stopped hurting” as “it’s healed.” Follow the athletic trainer’s progression.',why:'At 3 weeks the ligament is in the repair phase at a fraction of its strength, the most common time to reinjure it.'},
    {do:'If you add running miles, add them gradually and build in rest days.',why:'Repeated loads without recovery lower bone’s limit until it cracks: a stress fracture.'},
    {do:'In rehab, do the gentle exercises even when they feel too easy.',why:'Controlled tension is what lines new collagen up. Rest alone leaves a weaker, tangled scar.'}],
  tryIt:[{title:'the paper clip test (5 minutes)',steps:['Bend a paper clip a little and let go. Bend it a lot and let go. Then bend it back and forth in the same spot.','Count the bends until it breaks.'],look:'A small bend springs back (elastic). A big bend stays bent (plastic). Many small bends break it (fatigue, like a stress fracture), even though one bend was safe.'}]
};

/* ======================= contraction (800 × 500) ======================= */
const ctCard=(ctx,k,rows)=>card(ctx,k,592,112,200,rows);          /* right margin beside the sarcomere */
const ctECard=(ctx,k,rows)=>card(ctx,k,470,172,322,rows);         /* energy scene: under the ATP and lactic acid bars */
const CT0={scene:'sarc',fiber:'slow',rate:0,L0:2.2,atpOn:true,caOn:true,effort:30,o2:true};
const ctSet=o=>Object.assign({},CT0,o);
L.contraction={
  goals:{
    bio:['How a muscle is built, down to the sarcomere','How a nerve signal and calcium start a contraction','How myosin pulls actin: the sliding filament model','Why ATP is needed to let go as well as to pull','Why a fast pace burns out in seconds and a slow one lasts minutes'],
    honors:['How signals add up to tetanus','Why force depends on sarcomere length: the length-tension curve','What rigor is'],
    ap:['How creatine phosphate, anaerobic and aerobic supply share the work over time']},
  matters:'Every rep, sprint and pinch runs on the same machinery. Knowing what runs out first, creatine phosphate, then fast anaerobic supply, tells a coach how to pace work and rest, and an athletic trainer what fatigue really is.',
  steps:[
    {key:'build',title:'From muscle to sarcomere',set:ctSet({}),fresh:true,speed:1,focus:[0,0,800,60],
     see:'Across the top: muscle → fascicle → muscle fiber → myofibril → sarcomere. The big picture below is one <b>sarcomere</b>, slowed 10 times.',
     why:'A muscle is bundles of fibers. Each fiber is packed with myofibrils, chains of sarcomeres. The sarcomere is the unit that actually shortens.'},
    {key:'rest',title:'At rest',set:ctSet({}),speed:1,focus:[0,105,800,215],
     see:'Blue chains of <b>actin</b> reach in from the dark Z discs. Red <b>myosin</b> sits in the middle with its heads cocked.',
     why:'A strand called tropomyosin covers the binding sites on actin, so the myosin heads can’t grab on. Nothing pulls, and force is zero.',
     overlay(sim,ctx,LH,k){ctCard(ctx,k,[[FL(sim,'F',0),{w:700}],[FL(sim,'L',2),{s:12}]]);}},
    {key:'calcium',title:'The signal releases calcium',set:ctSet({rate:2}),speed:1,focus:[0,55,800,265],
     see:'A nerve signal runs along the top. The sarcoplasmic reticulum releases calcium (teal dots), and the amber tropomyosin line slides off actin.',
     why:'Calcium binds to troponin, which pulls tropomyosin off the binding sites. Now the myosin heads can reach actin.',
     overlay(sim,ctx,LH,k){ctCard(ctx,k,[[FL(sim,'Ca',0),{w:700,c:BLUE}],[FL(sim,'F',0)]]);}},
    {key:'pull',title:'Cross-bridges pull',set:ctSet({rate:30}),speed:1,focus:[0,105,800,215],
     see:'Myosin heads grab actin and swing: the <b>power stroke</b>. The Z discs move closer together, and the sarcomere length drops.',
     why:'Each stroke pulls actin toward the middle. The filaments keep their length; they slide past each other. This is the <b>sliding filament model</b>.',
     overlay(sim,ctx,LH,k){ctCard(ctx,k,[[FL(sim,'L',2),{w:700,c:RED}],[FL(sim,'F',0)],['At rest: 2.20 µm',{s:12}]]);}},
    {key:'atp',title:'ATP lets go and recocks',set:ctSet({rate:30}),speed:0.5,focus:[0,350,380,140],
     see:'The close-up, bottom left: a new ATP binds, the head lets go of actin, and splitting the ATP cocks the head for the next stroke.',
     why:'Without ATP the head cannot let go. So ATP pays for releasing as well as for pulling.',
     overlay(sim,ctx,LH,k){ctCard(ctx,k,[['Bind → stroke → ATP binds, release → ATP splits, recock',{s:12.5,w:700}]]);}},
    {key:'rigor',lvl:'honors',title:'No ATP: rigor',set:ctSet({rate:30,atpOn:false}),speed:1,focus:[0,105,800,215],cause:{from:{atpOn:true},delay:1,dur:1.2,label:'ATP available'},
     see:'ATP is switched off while the muscle is contracting. The heads stay stuck to actin and the sarcomere stays short.',
     why:'With no ATP to release the heads, the muscle locks. That is <b>rigor</b>, and why muscles stiffen after death (rigor mortis).',
     overlay(sim,ctx,LH,k){ctCard(ctx,k,[[FL(sim,'state'),{w:700,c:RED}],[FL(sim,'L',2)]]);}},
    {key:'tetanus',title:'Signals add up',set:ctSet({rate:80}),speed:1,focus:[410,350,390,140],
     see:'Signals now arrive 80 times a second. On the force trace, bottom right, the twitches merge into one smooth, high line.',
     why:'Fast signals add up (summation) into a smooth, strong pull: <b>tetanus</b>. Muscles also grade force by recruiting more fibers.',
     overlay(sim,ctx,LH,k){ctCard(ctx,k,[[FL(sim,'F',0),{w:700,c:GREEN}],H.atLeast('honors')?[FL(sim,'state')]:'']);}},
    {key:'lt',lvl:'honors',title:'The graph: force vs. sarcomere length',set:ctSet({rate:80}),speed:1,
     see:'This model’s length-tension curve: how much filament overlap, and so force, each starting sarcomere length allows. The dot sweeps across.',
     why:'Too short, filaments crash into each other. Too long, few heads reach actin. Peak force comes at 2.0 to 2.25 µm, near resting length.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,p=tau%10,B={x0:120,x1:720,y0:60,y1:390},xr=[1.2,3.8];K.dim(ctx,LH);
       const T=[[1.27,0],[1.67,.84],[2,1],[2.25,1],[3.65,0]],ov=x=>{if(x<=T[0][0]||x>=T[4][0])return 0;for(let i=0;i<4;i++)if(x<=T[i+1][0])return T[i][1]+(T[i+1][1]-T[i][1])*(x-T[i][0])/(T[i+1][0]-T[i][0]);return 0;};
       K.axes(ctx,B,k,{xr,xt:[[1.5,'1.5'],[2,'2.0'],[2.5,'2.5'],[3,'3.0'],[3.5,'3.5']],yt:[[0,'0%'],[0.5,'50%'],[1,'100%']],xl:'Sarcomere length (µm)',yl:'Force, % of max'});
       K.curve(ctx,B,xr,ov,3.8,HI);const x=1.3+((p/8)%1)*2.4,X=K.X(B,xr,x),Y=K.Y(B,ov(x));K.dot(ctx,X,Y,HI,8);
       K.tagA(ctx,x.toFixed(2)+' µm: '+Math.round(ov(x)*100)+'%',X+(x>2.6?-12:12),Y-26<B.y0+30?Y+30:Y-26,k,{s:13,hi:true},x>2.6?'r':'l');
       K.tagA(ctx,'Best: 2.0 to 2.25 µm',K.X(B,xr,2.12),B.y0-14,k,{s:12.5,c:GREEN},'l');}},
    {key:'stop',title:'Stop the signal',set:ctSet({rate:0}),speed:1,focus:[0,55,800,265],
     see:'The signals stop. Calcium is pumped back into storage, tropomyosin covers actin again, and the sarcomere returns to resting length.',
     why:'The calcium pump also runs on ATP. Relaxing costs energy, just like pulling.',
     overlay(sim,ctx,LH,k){ctCard(ctx,k,[[FL(sim,'Ca',0)],[FL(sim,'F',0),{w:700}]]);}},
    {key:'slow',title:'Energy: an easy, steady pace',set:ctSet({scene:'energy',fiber:'mixed',effort:30}),fresh:true,speed:1,focus:[0,0,800,260],
     see:'The energy view. A mixed muscle holds 30% of its maximum. ATP stays full and lactic acid stays near zero.',
     why:'At an easy pace, aerobic respiration (with oxygen) makes ATP as fast as it’s used, so this can last for minutes.',
     overlay(sim,ctx,LH,k){ctECard(ctx,k,[[FL(sim,'eLac',1),{w:700,c:GREEN}],H.atLeast('honors')?[FL(sim,'aerShare',0)]:[FL(sim,'eATP',1)]]);}},
    {key:'fast',title:'Energy: as hard as you can',set:ctSet({scene:'energy',fiber:'mixed',effort:90}),fresh:true,speed:1,focus:[0,0,800,260],
     see:'The same muscle at 90% effort. Lactic acid climbs. After about 19 seconds the burn and fatigue badges light up.',
     why:'Oxygen supply can’t keep up, so fast fibers use anaerobic glycolysis: quick ATP plus lactic acid. Force falls.',
     overlay(sim,ctx,LH,k){ctECard(ctx,k,[[FL(sim,'eLac',1),{w:700,c:RED}],[FL(sim,'tf')],[FL(sim,'eF',0)]]);}},
    {key:'pcr',lvl:'ap',title:'Creatine phosphate goes first',set:ctSet({scene:'energy',fiber:'mixed',effort:90}),fresh:true,speed:1,focus:[0,0,800,260],
     see:'At 90% effort again, watch creatine phosphate. It covers the first seconds, then is gone, right before fatigue starts.',
     why:'Creatine phosphate refills ATP instantly but runs out in about 10 to 15 seconds. Then anaerobic glycolysis carries the load, and later aerobic supply.',
     overlay(sim,ctx,LH,k){ctECard(ctx,k,[[FL(sim,'ePCr',1),{w:700,c:RED}],[FL(sim,'eATP',1)],[FL(sim,'aerShare',0)]]);}},
    {key:'hook',title:'Your question: what runs out, and why does pace matter?',set:ctSet({scene:'energy',fiber:'mixed',effort:90}),fresh:true,speed:1,focus:[0,0,800,260],
     see:'The fast clothespin squeeze is this 90% run. Compare it with the 30% run.',
     why:'Squeezing fast uses ATP faster than oxygen can make it. Reserves run out, lactic acid builds, and you slow in about 20 seconds. A slow pace stays aerobic.',
     overlay(sim,ctx,LH,k){ctECard(ctx,k,[[FL(sim,'tb'),{w:800,c:RED}],[FL(sim,'eLac',1)],['At 30%: no burn after minutes',{s:12,c:GREEN}]]);}}
  ],
  useIt:[
    {do:'In a long run or ride, start at a pace you can talk at.',why:'At an easy pace aerobic supply keeps up, lactic acid stays low, and you can keep going for a long time.'},
    {do:'For sprints and heavy sets, rest 2 to 3 minutes between efforts.',why:'Creatine phosphate, the fast ATP reserve, refills only when oxygen supply has spare capacity, which takes a few minutes.'},
    {do:'Warm up before hard efforts.',why:'Warm, active muscle gets more oxygen, so the aerobic share rises sooner and fatigue comes later.'}],
  tryIt:[{title:'the clothespin test (5 minutes)',steps:['Squeeze a clothespin open and shut as fast as you can, counting squeezes every 10 seconds, until your hand burns.','Rest 3 minutes, then squeeze at an easy, steady pace and count for the same time.'],look:'The fast set slows within about half a minute and starts to burn. The easy pace keeps going. Try your other hand too, and compare.'}]
};

/* ======================= paceload (800 × 450) ======================= */
L.paceload={
  goals:{
    bio:['How to count exposures: possessions on the court','Why a faster pace can still mean fewer injuries for one player','Why resting healthy games is not free'],
    honors:['Why injury rates need the right denominator: per game, per possession or per minute'],
    ap:['What the acute:chronic workload ratio is, and why researchers dispute it']},
  matters:'Coaches and athletic trainers decide minutes and rest for every athlete. Counting exposures the right way, instead of trusting “the game is faster now,” is how you check whether a plan actually protects a player.',
  steps:[
    {key:'debate',title:'The debate',run:tour('paceload','The debate'),speed:1,
     see:'Two season plans for a top player. Pace counts possessions per team per 48 minutes.',
     why:'People say today’s game is faster and harder on bodies. But pace was 126.2 in 1961-62 and 99.4 in 2025-26. The 1960s were faster.'},
    {key:'plans',title:'Two plans',run:tour('paceload','The debate','Two plans'),speed:1,focus:[10,30,780,330],
     see:'Left: a slow plan, pace 90, the player on the court 40 minutes. Right: your plan, pace 100 and 34 minutes. Each strip is an 82-game season.',
     why:'A faster pace means more plays per game. Fewer minutes means fewer of them for your player.'},
    {key:'exposures',title:'Count the exposures',run:tour('paceload','The debate','Two plans','Count the exposures'),speed:1,focus:[10,30,780,330],
     see:'The slow plan’s bar: 150 possessions on the court a game.',
     why:'Each possession is one exposure, one chance to get hurt. A game has about 2 × pace possessions, and the player sees minutes ÷ 48 of them: 2 × 90 × 40 ÷ 48 = 150.'},
    {key:'tired',title:'Tired legs',run:tour('paceload','The debate','Two plans','Count the exposures','Tired legs'),speed:1,focus:[10,30,780,330],
     see:'Risk per possession: ×1.18 for the slow plan, ×1.00 for yours.',
     why:'In this model each possession gets riskier as minutes pile up: 40 ÷ 34 = 1.18. That size is an assumption, chosen for illustration.'},
    {key:'turn',title:'Your turn',run:tour('paceload','The debate','Two plans','Count the exposures','Tired legs','Your turn'),speed:1,pause:true,
     see:'Your plan: pace 100, 34 minutes. Click the possessions your player is on the court for, at the bottom. Then make your call in the controls.',
     why:'Use 2 × pace × minutes ÷ 48. Or press Next to see the math.'},
    {key:'reveal',title:'The reveal',run:tour('paceload','The debate','Two plans','Count the exposures','Tired legs','Your turn','The reveal'),speed:1,focus:[10,30,780,330],
     see:'Your plan: 141.7 possessions a game, each 0.85 times as risky. Red squares are injury games.',
     why:'Your plan: 1.25 injuries, 3.7 games missed. The slow plan: 1.54 and 4.6. Fewer tired minutes outweigh the extra plays.'},
    {key:'rates',lvl:'honors',title:'Pick the right denominator',run:tour('paceload','The debate','Two plans','Count the exposures','Tired legs','Your turn','The reveal'),speed:1,focus:[10,30,780,330],
     see:'Under each plan: injuries per 1,000 games and per 1,000 possessions.',
     why:'Per game hides how much each player was exposed. Per possession counts every chance to get hurt, so it compares plans fairly. Always ask “per what?”'},
    {key:'rest',title:'Resting healthy games',run:tour('paceload','The debate','Two plans','Count the exposures','Tired legs','Your turn','The reveal','Resting healthy games'),speed:1,focus:[10,30,780,330],
     see:'Your player now sits 10 healthy games. Gray squares are rest games.',
     why:'Injuries fall to 1.05, but games missed jump to 13.1, because rest games are missed games too. An NBA-commissioned review of 10 seasons didn’t find that rest clearly lowered later injury risk.'},
    {key:'hook',title:'Your question: faster game, fewer minutes: more or less hurt?',run:tour('paceload','The debate','Two plans','Count the exposures','Tired legs','Your turn','The reveal'),speed:1,focus:[10,30,780,330],
     see:'Back to your plan: a faster pace, fewer minutes, no rest games.',
     why:'Less hurt in this model: 1.25 injuries a season against 1.54. What counts is exposure: how many plays, and how tired. Pace alone doesn’t decide it.'},
    {key:'acwr',lvl:'ap',title:'The workload ratio',run:tour('paceload','The workload ratio'),speed:1,
     see:'This week’s training (450 minutes) against the three weeks before (300 each).',
     why:'Coupled ratio 1.33, uncoupled 1.50. Teams watch spikes above about 1.5, but researchers dispute whether this ratio predicts injury at all.'}
  ],
  useIt:[
    {do:'When someone says a sport is “harder on bodies now,” ask what was counted, and per what.',why:'Injuries per game and injuries per play can point opposite ways when minutes change.'},
    {do:'Track your own training in minutes per week, and raise it gradually.',why:'Big jumps in load over recent weeks are a warning sign trainers watch, even if the exact ratio is debated.'},
    {do:'In your own sport, notice how tired you are late in practice.',why:'Fatigue raises risk per play, which is why fewer, fresher minutes can protect a player.'}],
  tryIt:[{title:'count the exposures (20 minutes)',steps:['Watch one quarter or half of any game. Pick one player and tally each possession, rally or play they are on the field for.','Note their minutes played.'],look:'Use exposures ÷ minutes to compare two players. The one with more minutes isn’t always the one with more exposures, if the pace differs.'}]
};

/* ======================= racenorm (800 × 450) ======================= */
L.racenorm={
  goals:{
    bio:['What a norm table is, and how a score is compared with it','How to compute a z-score','How race-norming changed who counted as impaired in the NFL concussion settlement','Why an athlete’s own baseline is the fairest comparison'],
    honors:['How the cutoff in points depends on the table’s average and spread'],
    ap:['Why a smaller spread makes a baseline comparison sharper']},
  matters:'A test score means nothing without the table it is compared with. Choosing the table decided whether retired players were called impaired, and whether they were paid. The same math decides whether you are cleared after a concussion.',
  steps:[
    {key:'test',title:'The test',run:tour('racenorm','The test'),speed:1,
     see:'A thinking test after a possible concussion: memory, attention, reaction time. The red marker is a score of 74.',
     why:'The score is on a standard scale where the average healthy player scores 100.'},
    {key:'norm',title:'A norm table',run:tour('racenorm','The test','A norm table'),speed:1,focus:[10,10,780,230],
     see:'The blue curve is the <b>population norm</b>: scores of healthy players, average 100, standard deviation (SD) 15. Most land between 85 and 115.',
     why:'A score counts as impaired when its <b>z-score</b>, how many SDs it sits from the average, is −1.5 or lower.'},
    {key:'turn',title:'Your turn',run:tour('racenorm','The test','A norm table','Your turn'),speed:1,pause:true,
     see:'A retired player scores 74. Click his z-score against the population norm at the bottom, then make your call: impaired or not?',
     why:'z = (score − average) ÷ SD. Or press Next to see the math.'},
    {key:'pop',title:'The population norm',run:tour('racenorm','The test','A norm table','Your turn','The population norm'),speed:1,focus:[10,10,780,230],
     see:'The red tail is the impaired zone: 77 or lower. The marker sits inside it, at the 4th percentile.',
     why:'z = (74 − 100) ÷ 15 = −1.73. That is below −1.5, so he counts as impaired.'},
    {key:'race',title:'The race-adjusted norm',run:tour('racenorm','The test','A norm table','Your turn','The population norm','The race-adjusted norm'),speed:1,focus:[10,10,780,230],
     see:'The settlement once scored Black players against this amber table, which assumed lower starting scores: average 90.',
     why:'z = (74 − 90) ÷ 15 = −1.07, and the cutoff falls to 67. The same 74 is now “not impaired.”'},
    {key:'changed',title:'What changed',run:tour('racenorm','The test','A norm table','Your turn','The population norm','The race-adjusted norm','What changed'),speed:1,
     see:'The rows below the curve show the decision under each table.',
     why:'Race-norming in the settlement ended in 2021. After the tests were rescored, about 650 Black retired players qualified for payments (reported August 2022).'},
    {key:'cut',lvl:'honors',title:'The cutoff in points',run:tour('racenorm','The test','A norm table','Your turn','The population norm'),speed:1,focus:[10,10,780,230],
     see:'The cutoff line is drawn at 1.5 SDs below each table’s average.',
     why:'Cutoff = average − 1.5 × SD: 100 − 22.5 = 77.5 for the population table, 90 − 22.5 = 67.5 for the race-adjusted one. A lower average moves the line down.'},
    {key:'base',title:'Your own baseline',run:tour('racenorm','Your own baseline'),speed:1,focus:[10,10,780,230],
     see:'Your teammate after a hit scores 96. The green curve is his own preseason baseline, 112, with repeat tests wobbling by an SD of about 8.',
     why:'z = (96 − 112) ÷ 8 = −2.0: flagged. Against the population, 96 looks fine. His own baseline shows the drop.'},
    {key:'hook',title:'Your question: which comparison would you want?',run:tour('racenorm','Your own baseline'),speed:1,focus:[10,10,780,230],
     see:'Same score, three tables, three answers.',
     why:'Your own baseline. It compares you with yourself, not with a group average or an assumption about race. That is why athletes take a preseason baseline test.'},
    {key:'sharp',lvl:'ap',title:'Why baselines are sharper',run:tour('racenorm','Your own baseline','Why baselines are sharper'),speed:1,focus:[10,10,780,230],
     see:'The green curve is narrower than the population curve.',
     why:'Healthy players differ by about 15 points, but one player retested wobbles by about 8. With a smaller spread, a 12-point drop stands out, where the population table needs 22.5.'}
  ],
  useIt:[
    {do:'If your school offers a preseason baseline concussion test, take it seriously and do your best.',why:'After a hit, your own baseline is the comparison that can catch a real drop.'},
    {do:'When a news story says a score is “below normal,” ask what the norm table was.',why:'The same score can be impaired or not, depending on the average and spread it is compared with.'},
    {do:'Compare your own scores over time (a mile time, a test grade) with your past, not only with others.',why:'Your own spread is smaller, so real changes stand out sooner.'}],
  tryIt:[{title:'your own norm (10 minutes)',steps:['Time yourself 5 times on the same short task, like saying the alphabet backward.','Find your average and how much the times wobble.'],look:'Then try once after a hard workout. Compared with your own times, is the change bigger than your usual wobble?'}]
};

/* ======================= concussion (800 × 533) ======================= */
const ACT=(sim,id)=>{const a=(sim.def.actions||[]).find(x=>x.id===id);if(a)a.run(sim);};
const ccCard=(ctx,k,LH,rows)=>card(ctx,k,12,LH-12,300,rows,{up:true});
const ccHit=(o)=>sim=>{BioLab.setValues(sim,Object.assign({view:'mech'},o));ACT(sim,'hitrun');};
L.concussion={
  goals:{
    bio:['What happens to the brain in a concussion: coup and contrecoup','Why rotation and hits to the body matter too','What to do on the sideline: red flags, remove from play','How a BESS balance test is compared with a baseline','The six-step return to play'],
    honors:['Why a glancing blow stretches brain tissue more than a straight one','Colorado’s rule on written clearance'],
    ap:['How rotational acceleration relates to tissue stretch']},
  matters:'A concussion is a brain injury even when the athlete “seems fine.” Getting the sideline decision right, removing the athlete and keeping them out until cleared, prevents a second hit while the brain is still healing.',
  steps:[
    {key:'blow',title:'The blow',run:ccHit({hit:'front',g:95}),speed:0.6,focus:[20,40,430,480],
     see:'A 95 g blow to the front of the head. The skull moves first. The brain floats in fluid, so it lags and presses on the skull near the hit.',
     why:'Like a passenger in a car that stops suddenly.',
     overlay(sim,ctx,LH,k){ccCard(ctx,k,LH,[[FL(sim,'peakg',0),{w:700}],[FL(sim,'shift',1),{w:700,c:RED}]]);}},
    {key:'rebound',title:'The rebound: coup and contrecoup',run:ccHit({hit:'front',g:95}),speed:0.25,focus:[20,40,430,480],
     see:'Watch for two glows: one under the hit, then one on the opposite side as the brain swings back.',
     why:'Injury under the hit is <b>coup</b>. Injury on the opposite side is <b>contrecoup</b>. One blow can hurt two places.'},
    {key:'rotate',title:'Rotation and jolts',run:ccHit({hit:'jolt',g:60}),speed:0.6,focus:[0,0,800,533],
     see:'A hard hit to the body; nothing touches the head. The head whips, and the axon (top right) stretches until its membrane leaks.',
     why:'Twisting stretches brain tissue more than pushing. So a hit to the body can cause a concussion.',
     overlay(sim,ctx,LH,k){ccCard(ctx,k,LH,[[FL(sim,'peakg',0)],H.atLeast('honors')?[FL(sim,'strain',0),{w:700,c:RED}]:[FL(sim,'shift',1),{w:700,c:RED}]]);}},
    {key:'glance',lvl:'honors',title:'Straight vs. glancing',run:ccHit({hit:'side',g:95}),speed:0.6,focus:[0,0,800,533],
     see:'The same 95 g, but a glancing blow that turns the head.',
     why:'A straight blow stretches tissue about 13%. A glancing one stretches it about 28%. Rotation does the most damage.',
     overlay(sim,ctx,LH,k){ccCard(ctx,k,LH,[[FL(sim,'strain',0),{w:700,c:RED}],H.atLeast('ap')?[FL(sim,'alpha',0)]:'']);}},
    {key:'redflag',title:'Red flags: call EMS',run:tour('concussion','The sideline decision'),speed:1,
     see:'A player stays down: his arm is numb and one pupil is larger. Both are red flags.',
     why:'Red flags, like numbness, uneven pupils, a worsening headache or repeated vomiting, can mean a bleed or neck injury. Call EMS and protect the neck.'},
    {key:'remove',title:'Any sign: remove from play',set:{view:'side',scn:'a'},fresh:true,speed:1,pause:true,
     see:'The freshman: he says he’s fine but asks the score twice. Your call: EMS, remove from play, or keep watching? Decide, then press Next.',
     why:'Repeating a question is confusion, a concussion sign. Any sign means <b>remove from play</b>, with no return today.'},
    {key:'bess',title:'BESS: balance against baseline',run:tour('concussion','BESS: balance against baseline'),speed:1,
     see:'Eyes closed, hands on hips, one leg, 20 seconds. Press Count an error for each hand off the hip, eye opening or touchdown.',
     why:'Three stances, 20 seconds each. Compare with this athlete’s own preseason count.'},
    {key:'rtp',title:'The return: one step at a time',run:tour('concussion','The return'),speed:1,
     see:'The return staircase, Step 1 (No Activity) to Step 6 (Return to Play). The graph shows symptoms by day.',
     why:'Each step takes at least <b>24 hours</b>; symptoms back means a step back. In Colorado, written clearance comes before step 4.'},
    {key:'teen',lvl:'honors',title:'Why young athletes get extra care',run:tour('concussion','The return'),speed:1,
     see:'Same staircase. A teen brain is still developing.',
     why:'In a study of 2,716 children and teens, symptoms improved mostly in the first 4 weeks. Light activity soon after, less screen time, and more help if symptoms last past 30 days.'},
    {key:'hook',title:'Your question: what now, and when can he play?',set:{view:'side',scn:'a'},fresh:true,run:sim=>ACT(sim,'dremove'),speed:1,
     see:'The freshman again. The right call is marked: remove from play.',
     why:'His brain tissue was stretched. Remove him now, no return today. He comes back only through the six steps, a day or more each, with written clearance first.'}
  ],
  useIt:[
    {do:'If a teammate takes a hit and seems “off,” tell a coach or athletic trainer, even if they say they’re fine.',why:'Confusion, repeating questions or slow answers are signs of concussion, and athletes often hide them.'},
    {do:'Take your preseason baseline tests seriously.',why:'After a hit, your own baseline is what your BESS or thinking-test score is compared with.'},
    {do:'If you have a concussion, follow the return steps even when you feel better.',why:'A second hit before the brain heals can make the injury much worse.'}],
  tryIt:[{title:'a BESS trial (10 minutes)',steps:['With a partner spotting you, stand on one leg, hands on hips, eyes closed, for 20 seconds.','Your partner counts errors: hands off hips, eyes open, stepping or stumbling, lifting the front of the foot.'],look:'Do it three times. That’s your own baseline: how much your count varies when you’re healthy.'}]
};

/* ======================= neuroexam (800 × 533) ======================= */
const neCard=(ctx,k,LH,rows)=>card(ctx,k,492,LH-16,296,rows,{up:true});
const neTest=(test,supply,ath)=>sim=>{BioLab.setValues(sim,{view:'cn',ath:ath||'healthy',test,supply});ACT(sim,'run');};
L.neuroexam={
  goals:{
    bio:['How to test cranial nerves with a simple kit','What normal pupils look like: PEARL','Why you always compare the two sides','What a myotome and a dermatome are'],
    honors:['How weakness plus dull skin on one side points to one nerve root','How to find a hidden deficit with a systematic exam'],
    ap:['Which root matches each myotome and dermatome from C1 to L5']},
  matters:'After a hit to the head or neck, an athlete who “feels fine” can still have a nerve that isn’t working. A two-minute exam, done the same way every time and always comparing sides, is how an athletic trainer catches it.',
  steps:[
    {key:'kit',title:'Open the kit: nerve I',run:tour('neuroexam','Open the kit'),speed:1,focus:[20,40,440,480],
     see:'The kit: gum, a penlight, a pen, water and your hands. The athlete smells mint through one nostril at a time.',
     why:'This tests nerve I, the <b>olfactory</b> nerve, for smell. Test one side at a time, because the two sides can differ.',
     overlay(sim,ctx,LH,k){neCard(ctx,k,LH,[['Nerve I, olfactory: smell, each nostril',{w:700}]]);}},
    {key:'pupil',title:'Pupils: PEARL',run:tour('neuroexam','Pupils: PEARL'),speed:1,focus:[20,40,440,300],
     see:'A light crosses the eyes. Both pupils narrow, like a camera shutter, to the same size.',
     why:'Normal is <b>PEARL</b>: pupils equal and reactive to light. Nerve III, the oculomotor nerve, narrows them. One large, slow pupil is a red flag.',
     overlay(sim,ctx,LH,k){neCard(ctx,k,LH,[[FL(sim,'pupR',1)+' · '+FL(sim,'pupL',1),{w:700}],['Nerve III, oculomotor',{s:12}]]);}},
    {key:'sides',title:'Compare both sides',run:tour('neuroexam','Compare both sides'),speed:1,focus:[20,40,440,300],
     see:'Nerve VI on the athlete’s left isn’t working. As the pen moves left, the left eye stops at the middle.',
     why:'The right side shows normal for this athlete. A finding means something when one side differs.',
     overlay(sim,ctx,LH,k){neCard(ctx,k,LH,[['Nerve VI, abducens: left eye stops',{w:700,c:RED}]]);}},
    {key:'face',title:'Face: nerve VII',run:neTest('face','none'),speed:1,focus:[20,40,440,300],
     see:'The athlete looks surprised, then angry, then smiles. Both sides of the face move the same way.',
     why:'Nerve VII, the <b>facial</b> nerve, moves the muscles of expression. A droop on one side points to that side’s nerve.',
     overlay(sim,ctx,LH,k){neCard(ctx,k,LH,[['Nerve VII, facial: both sides move',{w:700}]]);}},
    {key:'shrug',title:'Shrug and turn: nerve XI',run:neTest('shrug','hands'),speed:1,focus:[0,0,480,533],
     see:'The athlete shrugs against your hands, then turns the head against resistance.',
     why:'Nerve XI, the <b>accessory</b> nerve, runs the trapezius and sternocleidomastoid. The 12 cranial nerves each get a quick test like this one.',
     overlay(sim,ctx,LH,k){neCard(ctx,k,LH,[['Nerve XI, accessory: shrug and turn',{w:700}]]);}},
    {key:'roots',title:'Spinal nerve roots',run:tour('neuroexam','Spinal nerve roots'),speed:1,focus:[0,0,800,533],
     see:'Below the head, spinal nerve roots take over. The blue areas on the body map belong to C5.',
     why:'Each root runs some muscles, its <b>myotome</b>, and feels some skin, its <b>dermatome</b>. C5 runs shoulder abduction and feels the outside of the shoulder.'},
    {key:'weak',title:'One root, two findings',run:tour('neuroexam','One root, two findings'),speed:1,focus:[286,8,510,517],
     see:'Push down on both arms the same way. The right arm holds. The left arm gives way.',
     why:'If one root is hurt, its muscles test weak on that side. Next, check its skin.'},
    {key:'skin',title:'The skin confirms it',run:tour('neuroexam','The skin confirms it'),speed:1,focus:[286,8,510,517],
     see:'Eyes closed, you touch the same spot on each shoulder. The left one feels dull.',
     why:'Weakness plus dull skin, on the same side and in the same root’s areas, points to one root: <b>C5</b> on the left.'},
    {key:'hidden',lvl:'honors',title:'Your turn: a hidden deficit',set:{view:'myo',ath:'hidden',mtest:'C5'},fresh:true,speed:1,pause:true,
     see:'This athlete has one root that isn’t working. Use Full lab to test strength and sensation root by root.',
     why:'Go top to bottom, compare sides each time, then pick the root and side and press Check my call.'},
    {key:'hook',title:'Your question: how do you check each nerve?',run:tour('neuroexam','Compare both sides'),speed:1,focus:[20,40,440,300],
     see:'The player from the question, after a knee to the helmet.',
     why:'Test each cranial nerve with the kit, then the roots with strength and touch, the same way each time. Trouble shows as one side doing less.'}
  ],
  useIt:[
    {do:'If a teammate’s pupils look different sizes after a head hit, get an adult and call for help.',why:'Unequal or non-reactive pupils are a red flag for a serious brain injury.'},
    {do:'If you have numbness or weakness down one arm after a neck hit, tell the athletic trainer.',why:'Weakness and dull skin in one root’s areas can mean a pinched or stretched nerve root.'},
    {do:'When something feels off on one side, compare it with your other side.',why:'Your own other side is the best picture of what normal is for you.'}],
  tryIt:[{title:'find your dermatomes (10 minutes)',steps:['With a partner, close your eyes. Your partner lightly touches the outside of each shoulder, the thumb, the middle finger and the big toe, both sides.','Say “same” or “different” each time.'],look:'Healthy sides feel the same. Those spots match the C5, C6, C7 and L4/L5 areas on the tool’s body map.'}]
};

/* ======================= joints (800 × 500) ======================= */
const jtCard=(ctx,k,LH,rows)=>card(ctx,k,494,LH-14,294,rows,{up:true});
const JT=o=>Object.assign({view:'stress',joint:'knee',fk:'ant',bone:'tibia',flex:30,F:55,fa:'inv',pf:20,fe:'val',fs:'ant'},o);
L.joints={
  goals:{
    bio:['The parts of the knee: bones, cruciate and collateral ligaments, menisci','Which ligament each force direction loads: ACL, PCL, MCL','How strain sets the grade of a sprain','Why a rolled ankle hurts the ATFL first'],
    honors:['Why the PCL reads less strain than the ACL for the same force','Why meniscus tears in the inner part heal poorly'],
    ap:['How the same idea applies to the elbow and shoulder']},
  matters:'Knowing which structure each force loads tells an athletic trainer which stress test to run first, and why the pain can be on the side that wasn’t hit.',
  steps:[
    {key:'parts',title:'Start with the structures',run:tour('joints','Start with the structures'),speed:1,focus:[0,0,800,500],
     see:'A right knee from the front; lateral is on your left. Two cruciate ligaments cross in the center, with a collateral ligament on each side.',
     why:'Ligaments join bone to bone. Each resists motion in one direction.'},
    {key:'acl',title:'Tibia forward: ACL',run:tour('joints','Tibia forward: ACL'),speed:1,focus:[0,0,484,500],
     see:'Side view, front of the knee on your right. The tibia is pushed forward under the femur. The ACL goes tight and its strain bar climbs.',
     why:'The anterior cruciate ligament stops the tibia sliding forward. The Lachman test checks exactly this motion.',
     overlay(sim,ctx,LH,k){jtCard(ctx,k,LH,[[FL(sim,'worst'),{w:700}],H.atLeast('honors')?[FL(sim,'strain',1)]:'',[FL(sim,'grade'),{w:700,c:AMBER}]]);}},
    {key:'pcl',title:'Tibia backward: PCL',run:tour('joints','Tibia forward: ACL','Tibia backward: PCL'),speed:1,focus:[0,0,484,500],
     see:'A bent knee hits a dashboard and the shin is pushed backward. Now the PCL takes the load.',
     why:'The posterior cruciate ligament stops the tibia sliding back. It is stronger than the ACL, so the same force reads less strain.',
     overlay(sim,ctx,LH,k){jtCard(ctx,k,LH,[[FL(sim,'worst'),{w:700}],H.atLeast('honors')?[FL(sim,'strain',1)]:'',[FL(sim,'grade'),{w:700,c:AMBER}]]);}},
    {key:'mcl',title:'A hit from the side: MCL',run:tour('joints','Tibia forward: ACL','Tibia backward: PCL','A hit from the side: MCL'),speed:1,focus:[0,0,484,500],
     see:'Foot planted, a blow lands on the outside of the knee. The knee bends inward (<b>valgus</b>) and the inside opens.',
     why:'When the medial side opens, the medial collateral ligament (MCL) stretches, opposite the hit.',
     overlay(sim,ctx,LH,k){jtCard(ctx,k,LH,[[FL(sim,'mech'),{w:700}],[FL(sim,'worst'),{w:700,c:RED}],[FL(sim,'grade')]]);}},
    {key:'pivot',title:'Pivot on a planted foot',run:tour('joints','Tibia forward: ACL','Tibia backward: PCL','A hit from the side: MCL','Pivot on a planted foot'),speed:1,focus:[0,0,484,500],
     see:'The knee bends and twists with the foot stuck. The femur grinds the menisci, and the ACL resists the twist.',
     why:'This is the classic non-contact ACL and meniscus injury. Only the outer 10 to 30% of the medial meniscus has a blood supply, so inner tears heal poorly.'},
    {key:'graph',title:'The graph: force vs. strain and grade',set:JT({fk:'fromlat',bone:'femur'}),speed:1,
     see:'This model’s MCL strain as a side force rises from 0 to 100, knee bent 30°. The bands are the grades.',
     why:'Under 4% strain it springs back. 4 to 6%: Grade I. 6 to 10%: Grade II, a partial tear. Over 10%: Grade III, complete.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,p=tau%12,B={x0:110,x1:720,y0:60,y1:380},xr=[0,100],ym=16;K.dim(ctx,LH);
       [[0,4,'#e9f3ec','Springs back'],[4,6,'#fff3d6','Grade I'],[6,10,'#fde2cf','Grade II'],[10,16,'#f8d3d3','Grade III']].forEach(([a,b,c,t])=>{const y0=K.Y(B,b/ym),y1=K.Y(B,a/ym);ctx.fillStyle=c;ctx.fillRect(B.x0,y0,B.x1-B.x0,y1-y0);H.txt(ctx,t,B.x1-8,(y0+y1)/2,{s:12*Math.min(k,1.25),a:'right',b:'middle',c:PAL['cv-soft']});});
       K.axes(ctx,B,k,{xr,xt:[[0,'0'],[25,'25'],[50,'50'],[75,'75'],[100,'100']],yt:[[0,'0%'],[4/ym,'4%'],[6/ym,'6%'],[10/ym,'10%'],[1,'16%']],xl:'Force level',yl:'Ligament strain'});
       const mcl=F=>MP(sim,'strain',{view:'stress',joint:'knee',fk:'fromlat',bone:'femur',flex:30,F})/ym,acl=F=>MP(sim,'strain',{view:'stress',joint:'knee',fk:'ant',bone:'tibia',flex:30,F})/ym;
       const to=100*Math.min(1,p/4);K.curve(ctx,B,xr,mcl,to,HI);
       if(p>4.5){[55,75].forEach(F=>{const x=K.X(B,xr,F),y=K.Y(B,mcl(F));K.dot(ctx,x,y,HI,6);K.tagA(ctx,'Force '+F+': '+(mcl(F)*ym).toFixed(1)+'%',x-10,y-24,k,{s:12.5},'r');});}
       K.tagA(ctx,'MCL, hit from the side',B.x0+12,B.y0+12,k,{s:12.5,c:HI},'l');}},
    {key:'grade',title:'The bars show the grade',run:tour('joints','Tibia forward: ACL','Tibia backward: PCL','A hit from the side: MCL','The bars show the grade'),speed:1,focus:[486,0,314,500],
     see:'The same hit from the side, harder: force 75. The MCL bar runs into the red: Grade III.',
     why:'More force, more strain, a higher grade. A Grade III MCL tear leaves the knee loose when it is pushed into valgus.',
     overlay(sim,ctx,LH,k){jtCard(ctx,k,LH,[[FL(sim,'grade'),{w:700,c:RED}],[FL(sim,'strain',1)]]);}},
    {key:'ankle',title:'Rolled ankle: ATFL first',set:JT({joint:'ankle',fa:'inv',pf:20,F:60}),fresh:true,speed:1,focus:[0,0,800,500],
     see:'The ankle rolls inward (<b>inversion</b>) with the toes pointed down. The ATFL, on the outside front of the ankle, goes red first.',
     why:'The anterior talofibular ligament is the weakest lateral ligament and is tightest with the toes down. Then the CFL, then the PTFL.',
     overlay(sim,ctx,LH,k){jtCard(ctx,k,LH,[[FL(sim,'worst'),{w:700,c:RED}],[FL(sim,'grade')]]);}},
    {key:'elbow',lvl:'ap',title:'Elbow: a pitcher’s UCL',set:JT({joint:'elbow',fe:'val',F:60}),fresh:true,speed:1,focus:[0,0,484,500],
     see:'The elbow is pushed into valgus, the forearm forced outward, like the late-cocking phase of a pitch.',
     why:'The ulnar collateral ligament on the inside of the elbow takes the load. Repeated throws strain it, which is why pitch counts exist.',
     overlay(sim,ctx,LH,k){jtCard(ctx,k,LH,[[FL(sim,'worst'),{w:700,c:RED}],[FL(sim,'strain',1)],[FL(sim,'grade')]]);}},
    {key:'hook',title:'Your question: why does the inside hurt?',run:tour('joints','Tibia forward: ACL','Tibia backward: PCL','A hit from the side: MCL'),speed:1,focus:[0,0,484,500],
     see:'The soccer player: foot planted, hit on the outside of the knee.',
     why:'The hit pushes the knee into valgus, which opens and stretches the inside of the joint. Check the MCL first, with a valgus stress test.',
     overlay(sim,ctx,LH,k){jtCard(ctx,k,LH,[[FL(sim,'worst'),{w:800,c:RED}],['First test: valgus stress test',{s:12.5}]]);}}
  ],
  useIt:[
    {do:'When you land or cut, keep your knees over your toes, not caving inward.',why:'Valgus loads the MCL and ACL. Landing with the knees in line protects them.'},
    {do:'After rolling an ankle, have it checked before you return.',why:'The ATFL usually tears first, and a loose ankle rolls again more easily.'},
    {do:'If you pitch, follow pitch-count limits.',why:'Each throw loads the elbow’s UCL. Repeated strain without recovery causes injury.'}],
  tryIt:[{title:'find your ligaments (5 minutes)',steps:['Sit with your knee bent 90°. Feel the inside and outside of the joint line for the firm collateral ligaments.','Point your toes and roll your foot inward gently. Feel just in front of the outer ankle bone.'],look:'That spot is where the ATFL runs. It tightens with the toes down, which is why that position sprains it.'}]
};

/* ======================= mmt (800 × 500) ======================= */
const mmCard=(ctx,k,rows)=>card(ctx,k,614,440,180,rows,{up:true});
const mmS=(sim,id,side)=>{const t=String(F(sim,id));const g=/maximal resistance$/.test(t)&&!/gives way/.test(t)?'holds maximal (5)':/gives way to maximal/.test(t)?'gives way at maximal (4)':/gives way as soon/.test(t)?'gives way when pressed (3)':t;return side+': '+g;};
const mmRun=(ai,ws)=>sim=>{sim.st.ai=ai;sim.st.ws=ws;sim.st.log={};ACT(sim,'both');};
L.mmt={
  goals:{
    bio:['How to set up a manual muscle test: position, two hands, a command','Why your resistance hand stays in the same spot on both sides','The 0 to 5 grading scale','Why a weak result only means something compared with the other side'],
    honors:['How the pattern of weak muscles points to a strain or a nerve'],
    ap:['Which nerve and root supply each tested muscle']},
  matters:'A manual muscle test takes about a minute and needs only your hands. Done the same way on both sides, it tells an athletic trainer whether weakness is real, and its pattern points to a strained muscle or an injured nerve.',
  steps:[
    {key:'position',title:'Position the patient',run:tour('mmt','Position the patient'),speed:1,focus:[186,60,614,380],
     see:'The test for the lateral deltoid: the athlete sits with the elbow bent 90°. The red patch on the small figure shows the muscle.',
     why:'Position decides which muscle does the work and how gravity loads it. Every test starts there.',
     overlay(sim,ctx,LH,k){mmCard(ctx,k,[[FL(sim,'setup'),{w:700}]]);}},
    {key:'hands',title:'Two hands: P and R',run:tour('mmt','Position the patient'),speed:1,focus:[186,60,614,380],
     see:'Blue P is your palpating hand, on the muscle. Red R is your resistance hand, just above the elbow.',
     why:'P feels the right muscle tighten; R pushes against the movement. Keep R in the same spot on both sides.'},
    {key:'command',title:'Tell the athlete what to do',run:tour('mmt','Position the patient'),speed:1,focus:[186,60,614,440],
     see:'The green arrow is the athlete’s movement: arm out to the side. The dashed red arrow is your push.',
     why:'One plain command, like “Lift your arm out to the side; don’t let me push it down,” the same on both sides.'},
    {key:'scale',title:'The 0 to 5 scale',set:{view:'learn',tm:'deltL',side:'R',load:'grav'},fresh:true,speed:1,focus:[186,60,614,380],
     see:'The athlete lifts against gravity only, with no push from you. That checks grade 3.',
     why:'5: holds maximal resistance. 4: holds moderate, gives way at maximal. 3: full range against gravity. 2: full range with gravity removed. 1: a flicker. 0: nothing.',
     overlay(sim,ctx,LH,k){mmCard(ctx,k,[['5 max · 4 moderate · 3 gravity · 2 gravity removed · 1 flicker · 0 none',{s:12,w:700}]]);}},
    {key:'both',title:'Grade it on both sides',run:tour('mmt','Grade it on both sides'),speed:1,focus:[186,60,614,380],
     see:'Now the test runs on one side, then the other. This athlete holds maximal resistance on both.',
     why:'Test the uninvolved side first, then the injured side. A weak finding only means something compared with the same athlete’s other side.',
     overlay(sim,ctx,LH,k){mmCard(ctx,k,[[mmS(sim,'lres','Left'),{w:700}],[mmS(sim,'rres','Right'),{w:700}]]);}},
    {key:'even',lvl:'honors',title:'Grade 4 can be normal',set:{view:'grade',tm:'deltL',load:'max'},fresh:true,run:mmRun(1,'L'),speed:1,focus:[186,60,614,380],
     see:'A first-year lifter, preseason. Both sides give way at maximal resistance.',
     why:'Grade 4 on both sides is this athlete’s normal. Only side-to-side differences point to an injury.',
     overlay(sim,ctx,LH,k){mmCard(ctx,k,[[mmS(sim,'lres','Left'),{w:700}],[mmS(sim,'rres','Right'),{w:700}]]);}},
    {key:'hook',title:'Your question: is the weakness real?',set:{view:'grade',tm:'deltL',load:'max'},fresh:true,run:mmRun(2,'L'),speed:1,focus:[186,60,614,380],
     see:'The goalkeeper, two weeks after a left shoulder dislocation. Same position, hands and command, both sides.',
     why:'Right: holds. Left: full range, then gives way when pressed: grade 3. A clear side-to-side difference means the weakness is real.',
     overlay(sim,ctx,LH,k){mmCard(ctx,k,[[mmS(sim,'rres','Right'),{w:700}],[mmS(sim,'lres','Left'),{w:700,c:RED}]]);}},
    {key:'nerve',lvl:'honors',title:'The pattern points to a nerve',set:{view:'grade',tm:'deltA',load:'max'},fresh:true,run:mmRun(2,'L'),speed:1,focus:[186,60,614,380],
     see:'Same goalkeeper, now the anterior deltoid. It is weak on the left too, and none of the tests hurt.',
     why:'All three parts of the deltoid weak with no pain points to the axillary nerve, which can be stretched when the shoulder dislocates forward.',
     overlay(sim,ctx,LH,k){mmCard(ctx,k,[[mmS(sim,'lres','Left'),{w:700,c:RED}],H.atLeast('ap')?[FL(sim,'root')]:'']);}}
  ],
  useIt:[
    {do:'If one arm or leg feels weak after an injury, compare it with the other side, not with a friend.',why:'Your own other side shows what normal strength is for you.'},
    {do:'When a trainer tests you, follow the command exactly and push steadily.',why:'The same position, hand spot and command on both sides is what makes the comparison fair.'},
    {do:'Weakness without pain after a dislocation or a neck hit is worth reporting.',why:'It can mean a stretched nerve rather than a strained muscle.'}],
  tryIt:[{title:'a side-by-side test (10 minutes)',steps:['Sit facing a partner. Lift one arm out to the side to shoulder height. Your partner presses down just above your elbow while you hold.','Repeat on the other side with the hand in exactly the same spot.'],look:'Healthy sides feel about the same. Then have your partner press near your wrist instead: the longer lever makes you much easier to push down.'}]
};

/* ======================= bodymap (800 × 600) ======================= */
const bmCard=(ctx,k,rows)=>card(ctx,k,292,588,250,rows,{up:true});
const BM=o=>Object.assign({view:'terms',a:'knee',b:'ankle',supine:false,plane:'sagittal',cut:50,cavity:'all',system:'respiratory'},o);
const bmRel=(ctx,k,sim)=>bmCard(ctx,k,[[F(sim,'sel'),{w:700}],[F(sim,'find'),{w:700,c:HI}]]);
L.bodymap={
  goals:{
    bio:['Anatomical position, the pose every term assumes','Superior/inferior, anterior/posterior, medial/lateral, proximal/distal','The three planes: sagittal, frontal, transverse','The body cavities and the organ systems'],
    honors:['How to describe one structure with several terms at once'],
    ap:['Superficial and deep, and same side or opposite side']},
  matters:'Injury notes, X-ray reports and handoffs to doctors all use these words. “Lateral ankle” means the same side to everyone, whether the athlete is standing, lying down or upside down, because every term starts from one pose.',
  steps:[
    {key:'pose',title:'Anatomical position',set:BM({}),fresh:true,speed:1,focus:[100,50,260,545],
     see:'Standing, facing forward, arms at the sides, palms forward. Front view left, side view right.',
     why:'Every direction term assumes this pose, even when the person is lying on a table.'},
    {key:'si',title:'Superior and inferior',set:BM({a:'kidneys',b:'heart'}),speed:1,
     see:'Point A is the kidneys and point B is the heart. The heading at the top and the card compare them.',
     why:'<b>Superior</b> means closer to the top of the head; <b>inferior</b> means closer to the feet. The kidneys are inferior to the heart.',
     overlay(sim,ctx,LH,k){bmRel(ctx,k,sim);}},
    {key:'ap',title:'Anterior and posterior',set:BM({a:'esophagus',b:'spinalcord'}),speed:1,focus:[480,50,310,545],
     see:'The side view shows the esophagus (A) just in front of the spinal cord (B).',
     why:'<b>Anterior</b> means toward the front; <b>posterior</b> means toward the back. The esophagus is anterior to the spinal cord.',
     overlay(sim,ctx,LH,k){bmRel(ctx,k,sim);}},
    {key:'ml',title:'Medial and lateral',set:BM({a:'sternum',b:'shoulder'}),speed:1,focus:[100,50,260,300],
     see:'The sternum (A) sits on the midline, an imaginary line down the center of the body. The shoulder (B) is out to the side.',
     why:'<b>Medial</b> means closer to the midline; <b>lateral</b> means farther from it. The sternum is medial to the shoulder.',
     overlay(sim,ctx,LH,k){bmRel(ctx,k,sim);}},
    {key:'pd',title:'Proximal and distal',set:BM({a:'elbow',b:'wrist'}),speed:1,focus:[60,150,300,300],
     see:'On the arm: the elbow (A) and the wrist (B).',
     why:'On a limb, <b>proximal</b> means closer to where the limb joins the trunk, and <b>distal</b> means farther. The elbow is proximal to the wrist.',
     overlay(sim,ctx,LH,k){bmRel(ctx,k,sim);}},
    {key:'multi',lvl:'honors',title:'More than one term at once',set:BM({a:'kidneys',b:'heart'}),speed:1,
     see:'Kidneys and heart again. The card lists every term that applies.',
     why:'The kidneys are inferior, posterior and lateral to the heart. Clinicians stack terms to pin down a spot exactly.',
     overlay(sim,ctx,LH,k){bmRel(ctx,k,sim);}},
    {key:'planes',title:'Planes',set:BM({view:'planes',plane:'transverse'}),fresh:true,speed:1,
     see:'A blue cut runs straight across the body: a transverse plane, splitting superior from inferior.',
     why:'Sagittal planes divide left from right, frontal planes front from back, transverse planes top from bottom. CT and MRI slice along them.'},
    {key:'cavities',title:'Cavities',set:BM({view:'cavities',cavity:'thoracic'}),fresh:true,speed:1,
     see:'The thoracic cavity is outlined, with the heart and lungs inside. The diaphragm is its floor.',
     why:'Cavities are protected spaces that hold organs. The diaphragm divides the thoracic cavity from the abdominal cavity below it.'},
    {key:'systems',title:'Organ systems',set:BM({view:'systems',system:'respiratory'}),fresh:true,speed:1,
     see:'The respiratory system: nose, trachea, lungs and diaphragm.',
     why:'Eleven organ systems share the body. Each part fits its job: the lungs’ tiny air sacs are thin with a huge surface, because gases must cross them fast.'},
    {key:'hook',title:'Your question: which side of her arm?',set:BM({a:'thumb',b:'pinky',supine:true}),fresh:true,speed:1,
     see:'The patient lies on her back. Compare the thumb (A) with the little finger (B).',
     why:'In anatomical position, lateral on the forearm is the thumb side. Look on the thumb side, 3 cm toward the elbow from the wrist, palms down or not.',
     overlay(sim,ctx,LH,k){bmRel(ctx,k,sim);}}
  ],
  useIt:[
    {do:'When you describe an injury to a coach or trainer, use the terms: “lateral ankle,” “just proximal to the knee.”',why:'Everyone pictures the same spot, no matter how the athlete was lying when it happened.'},
    {do:'Read an X-ray or MRI report and find the plane: sagittal, coronal (frontal) or axial (transverse).',why:'Scans are slices along these planes, and the report tells you which one you are looking at.'},
    {do:'Picture anatomical position before naming a side.',why:'With palms turned, the thumb can end up on the inside, but it is still lateral by the definition.'}],
  tryIt:[{title:'anatomical position check (5 minutes)',steps:['Stand in anatomical position: palms forward. Have a partner name a spot: “lateral side of the forearm, 3 cm proximal to the wrist.” Point to it.','Now turn your palms down and point again.'],look:'The spot didn’t move. It’s still on the thumb side, because the terms always refer to the standard pose.'}]
};

/* ======================= muscles (800 × 720) ======================= */
const MU=o=>Object.assign({act:'explore',muscle:'deltoid',view:'both',zoom:'whole',names:true,deep:false,pmode:'name',answer:'bank',scope:'all',root:'rectus',mtype:'skeletal',elbow:30},o);
L.muscles={
  goals:{
    bio:['Where the major muscles are, by their full anatomical names','How a muscle’s name describes what you can see','The three muscle types: skeletal, cardiac, smooth','Why muscles work in pairs: they can only pull'],
    honors:['Origin, insertion and action: predicting what a muscle does','Why a muscle that crosses two joints acts at both'],
    ap:['The deep layer under the surface muscles']},
  matters:'Naming the exact muscle, Biceps Femoris rather than “hamstring,” tells an athletic trainer which test to run and which tendon to check. Knowing where a muscle attaches tells you what it does, and what stops working if it tears.',
  steps:[
    {key:'map',title:'Front and back',set:MU({}),fresh:true,speed:1,
     see:'Front and back views. The highlighted muscle is the Deltoid, the cap over each shoulder.',
     why:'Each muscle has a location, a fiber direction and two attachments. Learn those, and the name and job follow.'},
    {key:'lats',title:'Latissimus Dorsi',set:MU({muscle:'lats',view:'back',zoom:'upper'}),fresh:true,speed:1,
     see:'The back, zoomed in. The Latissimus Dorsi fans across the lower and middle back up to the arm.',
     why:'Latissimus means widest; dorsi means of the back. It runs from the lower spine and hip to the upper humerus.'},
    {key:'decoder',title:'Names describe what you see',set:MU({act:'decoder',root:'rectus'}),fresh:true,speed:1,
     see:'The name decoder. Rectus means straight: the highlighted Rectus Abdominis and Rectus Femoris have fibers running straight up and down.',
     why:'Names usually describe something visible: fiber direction (rectus, oblique), size (maximus, minimus), heads (biceps, triceps) or shape (deltoid, triangle).'},
    {key:'types',title:'Three kinds of muscle',set:MU({act:'types',mtype:'cardiac'}),fresh:true,speed:1,
     see:'Three tissue samples. Skeletal: long striped fibers. Cardiac: branched striped cells, joined end to end. Smooth: spindle-shaped, no stripes.',
     why:'Only skeletal muscle is voluntary: it moves bones. Cardiac muscle pumps the heart on its own rhythm. Smooth muscle lines hollow organs and blood vessels.'},
    {key:'pull',title:'Muscles can only pull',set:MU({act:'pull',elbow:30}),fresh:true,run:sim=>ACT(sim,'flex'),speed:1,
     see:'The elbow bends. The Biceps Brachii shortens and bulges; the Triceps Brachii on the back of the arm stretches.',
     why:'A muscle can only pull. So every joint needs a pair: a <b>flexor</b> (Biceps Brachii) closes it and an <b>extensor</b> (Triceps Brachii) opens it.'},
    {key:'origin',title:'Origin and insertion',set:MU({act:'pull',elbow:145}),fresh:true,run:sim=>ACT(sim,'extend'),speed:1,
     see:'The elbow straightens. Blue dots mark each muscle’s <b>origin</b> (on the bone that stays still); orange dots its <b>insertion</b> (on the bone that moves).',
     why:'A muscle pulls its insertion toward its origin, so attachments predict its action.'},
    {key:'twojoint',lvl:'honors',title:'A muscle that crosses two joints',set:MU({muscle:'rectusfem',view:'front',zoom:'lower'}),fresh:true,speed:1,
     see:'Rectus Femoris, the middle quadriceps muscle, from the hip bone down over the knee.',
     why:'It crosses the hip and the knee, so it flexes the hip and extends the knee. The three vastus muscles start on the femur and act at the knee only.'},
    {key:'deep',lvl:'ap',title:'Lift the surface layer',set:MU({muscle:'rhomboids',view:'back',zoom:'upper',deep:true}),fresh:true,speed:1,
     see:'The Trapezius and Latissimus Dorsi are lifted away. Underneath, the Rhomboids run from the spine to the shoulder blade.',
     why:'The Rhomboids pull the shoulder blades together. Deep muscles are named and tested too, even though you can’t see them on the surface.'},
    {key:'practice',title:'Your turn: label practice',set:MU({act:'practice',pmode:'name'}),fresh:true,speed:1,pause:true,
     see:'One muscle is marked with a question mark. Say its full anatomical name to yourself, then press Next. In Full lab, Label practice checks your answers.',
     why:'Use the location and the fiber direction as clues. A labeling quiz wants Latissimus Dorsi, not “lats.”'},
    {key:'hook',title:'Your question: what if the lat tore?',set:MU({muscle:'lats',view:'back',zoom:'upper'}),fresh:true,speed:1,
     see:'Latissimus Dorsi again: lower spine and hip (origin) to the upper humerus (insertion).',
     why:'It pulls the arm down and back. If it tore, pull-ups, rowing and swimming would be weak.'}
  ],
  useIt:[
    {do:'Use full muscle names when you tell a trainer where it hurts.',why:'“Biceps Femoris” and “Semitendinosus” are both hamstrings, and they are tested differently.'},
    {do:'For calves, do raises with straight knees and with bent knees.',why:'Gastrocnemius crosses the knee and goes slack when it bends, so bent-knee raises train the Soleus.'},
    {do:'Train both muscles of a pair.',why:'Muscles only pull, so a strong flexor needs an equally trained extensor to balance the joint.'}],
  tryIt:[{title:'feel the pair (5 minutes)',steps:['Rest one hand on the front of your upper arm and bend the elbow slowly against a book. Then move your hand to the back of the arm and straighten it against the book.','Then press your arm down against a table edge, out to the side, and feel under your armpit.'],look:'The front muscle (Biceps Brachii) works to bend, the back one (Triceps Brachii) to straighten. Pressing down works the Latissimus Dorsi.'}]
};

/* ======================= clinic (800 × 500) ======================= */
/* One case all the way through: case 26 in the tool's list, the girls soccer defender who planted, cut and felt the knee give out. */
const CL_ACL=26;
const clCard=(ctx,k,rows)=>k>1.2?card(ctx,k,8,44,300,rows):card(ctx,k,486,322,302,rows);   /* phones: the point list fills the right side, so the card goes top-left */
const clRun=n=>sim=>{const w={step:n,asked:{},looked:false,moved:false,palp:{},tests:{},dx:null,dxSeen:false,care:null,ref:null,careSeen:false,rtp:null};
  w.asked={0:1,1:1,2:1,3:1,4:1};if(n>=1){w.looked=true;w.moved=true;}if(n>=2)w.palp={'ljl:R':1,'mjl:R':1,'patella:L':1,'mjl:L':1,'ljl:L':1};if(n>=3)w.tests={'lach:R':1,'lach:L':1,'lach':1};
  sim.st.ci=CL_ACL;sim._ci=CL_ACL;sim.st.w=w;sim.infoDirty=true;};
L.clinic={
  goals:{
    bio:['The order of an injury evaluation: history, observation, palpation, special tests','How each finding narrows down what is injured','Why you always compare with the uninjured side','When to refer, and what return to play takes'],
    honors:['How to choose special tests that match the history and palpation'],
    ap:['What finding would change a referral to same-day care']},
  matters:'In the two minutes after an injury, a calm, ordered evaluation keeps an athlete from going back in on an unstable knee. The same steps, done the same way every time, are how athletic trainers avoid guessing.',
  steps:[
    {key:'history',title:'Step 1: History',run:clRun(0),speed:1,
     see:'A soccer defender is down, holding her left knee. She planted to cut, nobody touched her, she heard a pop, and it swelled fast.',
     why:'Start with how it happened, the <b>mechanism of injury</b>. It tells you which structures took the load.',
     overlay(sim,ctx,LH,k){clCard(ctx,k,[['History',{w:800,c:HI}],['No contact · plant and cut · pop · fast swelling · feels unstable',{s:12.5}]]);}},
    {key:'look',title:'Step 2: Observation',run:clRun(1),speed:1,
     see:'The orange ring on the map marks swelling at her left knee. The right knee looks normal. She won’t put full weight on the leg.',
     why:'Look before you touch, and compare the two sides. Fast, large swelling suggests bleeding inside the joint.',
     overlay(sim,ctx,LH,k){clCard(ctx,k,[['Observation',{w:800,c:HI}],['Large swelling, left knee · won’t bear full weight',{s:12.5}]]);}},
    {key:'palp',title:'Step 3: Palpation',run:clRun(2),speed:1,
     see:'Points are pressed, right knee first. Red means tender, green means not. The left joint lines are mildly tender.',
     why:'Start away from the sore spot and check both sides. Mild joint-line tenderness doesn’t point to one ligament.',
     overlay(sim,ctx,LH,k){clCard(ctx,k,[['Palpation',{w:800,c:HI}],['Red = tender, green = not tender',{s:12.5}],['Mild tenderness at both left joint lines',{s:12.5}]]);}},
    {key:'tests',title:'Step 4: Special tests',run:clRun(3),speed:1,
     see:'The Lachman test. Right knee: a firm stop. Left: the tibia slides forward more, with a soft stop.',
     why:'A plant, a pop and fast swelling point to the ACL, so the Lachman comes first, compared side to side.',
     overlay(sim,ctx,LH,k){clCard(ctx,k,[['Lachman test',{w:800,c:HI}],['Right: firm stop · Left: extra forward slide, soft stop',{s:12.5,w:700}]]);}},
    {key:'dx',title:'Step 5: Working diagnosis',run:clRun(4),speed:1,
     see:'The choices: ACL sprain, PCL sprain, MCL sprain, patellar dislocation.',
     why:'No contact, a pop, fast swelling and a soft Lachman are the classic ACL picture. It is a working diagnosis: a physician and imaging confirm it.',
     overlay(sim,ctx,LH,k){clCard(ctx,k,[['Working diagnosis: ACL sprain',{w:800,c:HI}],['Not PCL (blow to the front of the shin), not MCL (hit from outside)',{s:12}]]);}},
    {key:'care',title:'Step 6: Care and referral',run:clRun(5),speed:1,
     see:'Choices: PRICE, an immobilizer, crutches and a physician; jog to test it; or tape it and go back in.',
     why:'Protect the unstable knee. PRICE means protection, rest, ice, compression, elevation. Then refer to a physician.',
     overlay(sim,ctx,LH,k){clCard(ctx,k,[['PRICE · immobilizer · crutches · physician',{w:800,c:GREEN}],['Never “jog it off” on an unstable knee',{s:12,c:RED}]]);}},
    {key:'rtp',title:'Step 7: Return to play',run:clRun(6),speed:1,
     see:'The last step: when, and how, she can play again.',
     why:'Only after physician clearance and full rehab, when strength, hop tests and sport movements match the other side. After ACL surgery that is often 9 months or more.'},
    {key:'flip',lvl:'ap',title:'What would change the referral?',run:clRun(5),speed:1,
     see:'Same case, at the care step. Imagine one more finding.',
     why:'A numb foot, a weak pulse below the knee or a knee locked in place moves this from a physician visit to same-day emergency care.'},
    {key:'hook',title:'Your question: what first, and can she go back in?',run:clRun(3),speed:1,
     see:'Back to the defender, two minutes after she went down.',
     why:'Ask first how it happened: a non-contact plant and cut. Look for swelling, palpate both sides, then run the Lachman on both knees. A soft, loose Lachman means no return today.',
     overlay(sim,ctx,LH,k){clCard(ctx,k,[['History → observation → palpation → special tests',{w:800}],['Return today: no',{w:800,c:RED}]]);}}
  ],
  useIt:[
    {do:'If you see a teammate go down without contact and hear a pop, keep them off the leg and get the athletic trainer.',why:'A non-contact plant-and-cut injury with a pop is the classic ACL story, and walking on it can make the damage worse.'},
    {do:'When you describe an injury, start with how it happened.',why:'The mechanism of injury tells a clinician which structures took the load.'},
    {do:'Expect to be checked on both sides.',why:'Your uninjured side is the normal that every finding is compared with.'}],
  tryIt:[{title:'run the steps (15 minutes)',steps:['With a partner, pick one case in the tool’s Full lab. One of you plays the athlete and answers from the case, the other runs the evaluation in order.','Swap roles for a second case.'],look:'Did you ask about how it happened first? Did you check both sides before choosing a test?'}]
};

BioLab.addLearn(L);
})();
