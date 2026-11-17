/* Myth or fact (idea from Dr. Sandy Robertson's ENSO Explorer, Nov 17, 2026). See ENGINE.md.
   BioLab.addMyths({toolId:[{k,s,fact,why,lvl}]}): one graded try, then why. Mix in real facts. */
BioLab.addMyths({
concussion:[
 {k:'ko',s:'You have to be knocked out to have a concussion.',fact:false,why:'Most concussions happen without losing consciousness. Headache, dizziness, confusion or feeling foggy can all be signs.'},
 {k:'sit',s:'An athlete with a suspected concussion should sit out the rest of that game or practice.',fact:true,why:'“When in doubt, sit them out.” A second hit before the brain heals can be much more dangerous. Colorado law (Jake Snakenberg Act) requires removal and clearance by a health care provider before returning.'},
 {k:'helmet',s:'A good helmet prevents concussions.',fact:false,why:'Helmets prevent skull fractures and serious bleeding, but the brain can still move inside the skull. Technique and rules matter too.'}
]
});

/* Batch 2 (Nov 17, 2026): the rest of SportsMedLab. */
BioLab.addMyths({
bodymap:[
 {k:'anat',s:'Anatomical position means standing, facing forward, palms facing forward.',fact:true,why:'Every direction term (left, right, anterior, proximal) is described from this position.'},
 {k:'left',s:'On a diagram of a person facing you, the patient’s left is on your left.',fact:false,why:'Their left is on your right. Left and right are always the patient’s.'},
 {k:'sag',s:'A sagittal plane divides the body into left and right parts.',fact:true,why:'A frontal (coronal) plane divides front from back; a transverse plane divides top from bottom.'}
],
skeleton:[
 {k:'206',s:'Adults have about 206 bones.',fact:true,why:'Babies are born with closer to 300; many fuse as they grow.'},
 {k:'dead',s:'Bones are dead, dry structures.',fact:false,why:'Bones are living tissue with blood vessels and cells that constantly rebuild them.'},
 {k:'femur',s:'The femur is the longest bone in the body.',fact:true,why:'It is about a quarter of a person’s height.'}
],
movements:[
 {k:'flex',s:'Bending your elbow is flexion.',fact:true,why:'Flexion decreases the angle at a joint; extension increases it.'},
 {k:'abd',s:'Abduction moves a limb toward the midline of the body.',fact:false,why:'Abduction moves it away (“abduct” = take away). Adduction moves it toward the midline.'},
 {k:'ball',s:'The shoulder is a ball-and-socket joint.',fact:true,why:'That is why it moves in more directions than any other joint, and dislocates more often.'}
],
muscles:[
 {k:'push',s:'Muscles can push as well as pull.',fact:false,why:'Muscles only pull. That is why they work in opposing pairs, like the biceps and triceps.'},
 {k:'heart',s:'The heart is made of a special kind of muscle.',fact:true,why:'Cardiac muscle contracts on its own rhythm and doesn’t tire like skeletal muscle.'},
 {k:'quad',s:'The quadriceps straighten the knee.',fact:true,why:'The hamstrings, on the back of the thigh, bend it.'}
],
contraction:[
 {k:'atp',s:'Muscles need ATP both to contract and to relax.',fact:true,why:'ATP lets myosin let go of actin. Without it, muscles lock, as in rigor mortis.'},
 {k:'lactic',s:'Lactic acid is the cause of next-day muscle soreness.',fact:false,why:'Lactate clears within about an hour. Next-day soreness comes from small muscle fiber damage.'},
 {k:'slide',s:'A muscle shortens when thin filaments slide past thick ones.',fact:true,why:'That is the sliding filament model. The filaments don’t get shorter themselves.'}
],
clinic:[
 {k:'hops',s:'An injury evaluation usually starts with history, then observation, then hands-on tests.',fact:true,why:'HOPS: History, Observation, Palpation, Special tests. Asking what happened often tells you the most.'},
 {k:'good',s:'You should test the injured side before the uninjured side.',fact:false,why:'Test the uninjured side first, so you know what normal is for that athlete.'},
 {k:'refer',s:'Knowing when to refer an athlete to a doctor is part of the job.',fact:true,why:'Signs like deformity, numbness or severe pain need a physician.'}
],
injury:[
 {k:'ice',s:'Heat is the best first treatment for a fresh sprain.',fact:false,why:'Heat increases swelling early on. Ice, protection and elevation are usual in the first day or two.'},
 {k:'phases',s:'Healing goes through inflammation, repair and remodeling.',fact:true,why:'Rehab is matched to each phase: protect early, then load gradually.'},
 {k:'pain',s:'If it doesn’t hurt anymore, the injury is fully healed.',fact:false,why:'Tissue keeps remodeling for weeks to months after pain fades. Returning too soon risks reinjury.'}
],
joints:[
 {k:'acl',s:'Many ACL tears happen without contact with another player.',fact:true,why:'Most come from landing, cutting or stopping suddenly.'},
 {k:'pop',s:'A painful pop in the knee during a pivot can be a sign of an ACL tear.',fact:true,why:'It is a classic description, often followed by quick swelling.'},
 {k:'menisc',s:'The meniscus is a ligament.',fact:false,why:'It is a C-shaped cartilage pad that cushions the knee. Ligaments connect bone to bone.'}
],
kineticchain:[
 {k:'link',s:'A problem at one joint can cause pain at another.',fact:true,why:'Weak hips can let the knee cave in, which strains the knee.'},
 {k:'iso',s:'Every joint should be trained only for stability.',fact:false,why:'The joint-by-joint idea says some joints (like hips) need mobility and others (like knees) need stability.'},
 {k:'throw',s:'A throw gets much of its speed from the legs and hips.',fact:true,why:'Force builds from the ground up through the trunk to the arm.'}
],
mmt:[
 {k:'five',s:'Manual muscle tests are often graded on a 0 to 5 scale.',fact:true,why:'5 is normal strength; 3 moves the limb against gravity only.'},
 {k:'same',s:'Muscle testing gives the same result no matter who does it.',fact:false,why:'It depends on the tester’s judgment, so technique and practice matter.'},
 {k:'compare',s:'Comparing both sides helps find weakness.',fact:true,why:'Each athlete’s normal is different.'}
],
neuroexam:[
 {k:'twelve',s:'There are 12 pairs of cranial nerves.',fact:true,why:'They control things like eye movement, facial expression and swallowing.'},
 {k:'derm',s:'A dermatome is an area of skin served by one spinal nerve.',fact:true,why:'Numbness in a pattern can point to which nerve root is affected.'},
 {k:'skip',s:'If an athlete can walk, a neuro check isn’t needed after a neck injury.',fact:false,why:'Nerve injuries can be subtle. Strength, sensation and reflexes need checking.'}
],
racenorm:[
 {k:'baseline',s:'A baseline test before the season helps judge recovery after a concussion.',fact:true,why:'It shows what normal looks like for that athlete.'},
 {k:'one',s:'One set of “normal” scores fits every athlete.',fact:false,why:'Scores vary by person and by test. Comparing against your own baseline is more reliable.'},
 {k:'norms',s:'Who is in the comparison group affects what counts as normal.',fact:true,why:'Norms built from one group may not fit another.'}
],
paceload:[
 {k:'spike',s:'A sudden jump in training load raises injury risk.',fact:true,why:'Tissues adapt gradually. Ramping up slowly gives them time.'},
 {k:'more',s:'More training always means fewer injuries.',fact:false,why:'Too much too fast raises risk; rest and recovery are part of training.'},
 {k:'sleep',s:'Athletes who sleep less are more likely to get hurt.',fact:true,why:'Studies of teen athletes found higher injury rates with under 8 hours a night.'}
]
});
