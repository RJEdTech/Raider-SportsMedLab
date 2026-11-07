/* Raider SportsMedLab: course order comes from the course's Canvas modules. */
BioLab.COURSES = [
 {
  "id": "spat",
  "name": "Scientific Principles of Athletic Training",
  "blurb": "Tools in the order SPAT covers them: foundations, then upper body, then lower body.",
  "further": [
   "contraction"
  ],
  "units": [
   {
    "n": "Unit 1",
    "t": "Body terms and movement",
    "ids": [
     "bodymap",
     "movements",
     "skeleton",
     "muscles"
    ]
   },
   {
    "n": "Unit 1",
    "t": "The kinetic chain",
    "ids": [
     "kineticchain"
    ]
   },
   {
    "n": "Unit 1",
    "t": "Injury basics, healing and rehabilitation",
    "ids": [
     "injury"
    ]
   },
   {
    "n": "Unit 2",
    "t": "Head, face and concussion",
    "ids": [
     "concussion",
     "neuroexam",
     "clinic"
    ],
    "note": "Cranial nerve lab and the myotome and dermatome practical."
   },
   {
    "n": "Unit 2",
    "t": "Shoulder, elbow and hand",
    "ids": [
     "joints",
     "mmt",
     "clinic"
    ],
    "note": "Shoulder MMT practical. Taping check-offs stay hands-on in class."
   },
   {
    "n": "Unit 3",
    "t": "Hip, thigh and knee",
    "ids": [
     "joints",
     "mmt",
     "clinic"
    ],
    "note": "Lower body MMT practical."
   },
   {
    "n": "Unit 3",
    "t": "Ankle and foot",
    "ids": [
     "joints",
     "clinic"
    ]
   }
  ]
 }
];
BioLab.TOPIC_ORDER = {"0": ["bodymap", "movements", "skeleton", "muscles"], "1": ["kineticchain", "injury"], "2": ["concussion", "neuroexam", "racenorm"], "3": ["joints", "mmt", "clinic"], "11": ["contraction"]};
BioLab.setSections({units:{},extra:{"0": "Body basics", "1": "Injury and rehabilitation", "2": "Head and neuro", "3": "Joints and evaluation", "11": "Go further"},order:[0, 1, 2, 3, 11],further:11,unitPrefix:''});
(function(){const P={"bodymap": 0, "movements": 0, "skeleton": 0, "muscles": 0, "kineticchain": 1, "injury": 1, "concussion": 2, "neuroexam": 2, "joints": 3, "mmt": 3, "clinic": 3, "contraction": 11, "racenorm": 2};BioLab.defs.forEach(d=>{if(P[d.id]!==undefined)d.apUnit=P[d.id];});
const keep=new Set(BioLab.defs.map(d=>d.id));BioLab.defs.forEach(d=>{['prereq','next'].forEach(k=>{if(d[k])d[k]=d[k].filter(i=>keep.has(i));});});})();
