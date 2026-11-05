# Raider SportsMedLab

Interactive sports medicine simulations, virtual labs and learning tools for Regis Jesuit Scientific Principles of Athletic Training.

**Live site:** https://rjedtech.github.io/Raider-SportsMedLab/

Part of the Raider Labs suite with BioLab, ChemLab, PhysLab, ForensicsLab, AnatomyLab and SportsMedLab.

## Course order
From the course's Canvas modules:

- **Unit 1:** Body terms and movement
- **Unit 1:** The kinetic chain
- **Unit 1:** Injury basics, healing and rehabilitation
- **Unit 2:** Head, face and concussion
- **Unit 2:** Shoulder, elbow and hand
- **Unit 3:** Hip, thigh and knee
- **Unit 3:** Ankle and foot

## How it is built
Static site with no build step: `index.html`, `engine.js` and `biolab.css` (shared with the other Raider Labs sites), one file per tool in `sims/`, and `courses.js` for the course order. Everything runs in the browser; no student data leaves the device. See `ENGINE.md` to author a tool.
