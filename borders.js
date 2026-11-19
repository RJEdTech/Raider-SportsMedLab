/* Where science meets philosophy + How exact does it need to be? (Nov 19, 2026; follows the BioLab/PhysLab pilot of Nov 17)
   One entry per tool. Rendered by the engine below the stage in Full lab and at the end of Learn it.
   Standard: teach, don't preach. Name each view fairly, state definitive Church teaching as the Church's teaching,
   and leave open questions open (no answer key). Every number has a source and a year. */
BioLab.addBorder({
concussion: {
  q: 'When an athlete says “I’m fine,” who decides whether they go back in?',
  saw: 'The brain moved inside the skull, balance errors rose above the athlete’s own baseline, and the call came from a person weighing tests, symptoms and what the athlete reported.',
  assumes: [
    'The athlete’s preseason baseline is a fair picture of their normal.',
    'What the athlete reports about headaches, fog or dizziness is honest, even though no one else can feel it.',
    'Symptoms that fade mean the brain is healing, though no scan can yet show a concussion directly.'
  ],
  stops: 'Sports medicine can measure balance, memory and symptoms, and it can lay out a safe return plan. It cannot decide how much risk is worth taking for a game, or what a season is worth compared with a brain. Those are judgments about value, made by people.',
  church: 'The Church teaches that life and health are gifts entrusted to us, to be cared for reasonably (Catechism no. 2288). It also warns against idolizing physical perfection and success at sports, which can lead us to prefer the strong over the weak (no. 2289). The body shares in the dignity of being made in God’s image: an athlete is a person, not a piece of equipment (nos. 364–365).',
  faith: { items: [
    { who: 'St. Pier Giorgio Frassati', when: 'mountaineer, 1901–1925; canonized September 7, 2025', says: 'A climber and athlete who loved the mountains and cared for the poor of Turin. His motto, “Verso l’alto” (“to the heights”), is about aiming high in faith as well as on the trail.' },
    { who: 'Giving the Best of Yourself', when: 'the Vatican’s first document on sport, 2018', says: 'It says the Church cares about sport because it cares about the whole person, and it warns against pressure to win “at all costs” that treats athletes as less than persons.' }
  ] },
  views: [
    { who: 'The athlete', when: 'any sideline', says: 'It is my body and my team. I know how I feel, and I should get a say in whether I play.' },
    { who: 'The Athletic Trainer', when: 'the professional on the sideline', says: 'When in doubt, sit them out. My job is to protect the person even when they are pushing to go back in.' },
    { who: 'Aristotle', when: '4th century BC', says: 'Courage is the middle between cowardice and recklessness. Playing hurt is not brave if it risks what you cannot replace.' },
    { who: 'John Stuart Mill', when: '<i>On Liberty</i>, 1859', says: 'Adults may take risks with their own lives. Others may warn and persuade, but should not force them for their own good.' },
    { who: 'Thomas Aquinas', when: '13th century', says: 'Prudence is right reason applied to action: weighing the real goods at stake, here a game and a lifetime, and choosing well.' }
  ],
  margin: {
    lead: 'Concussion recovery comes as a range, and the range is why every athlete gets an individual plan.',
    rows: [
      { what: 'Full return to sport', value: 'Usually within about 1 month', range: 'Some athletes are back sooner; some have symptoms longer than 4 weeks', how: 'Amsterdam 2022 consensus statement (Br J Sports Med, 2023), built on 10 systematic reviews', enough: 'Planning a season. Not for promising one athlete a return date.' },
      { what: 'Symptoms past 4 weeks', value: 'Referral to a team of specialists', range: 'Depends on the athlete: migraine, anxiety and other history can slow recovery', how: 'Same consensus statement', enough: 'Knowing when to ask for more help.' },
      { what: 'Light activity early', value: 'Within the first 48 hours', range: 'Light activity, not full rest in a dark room', how: 'Stronger evidence in the 2022 review than in earlier statements', enough: 'Guiding the first days after an injury.' }
    ],
    note: 'Every athlete’s brain is different, so the plan is personal. That is a reason to trust the process, not to rush it.'
  }
}
});
