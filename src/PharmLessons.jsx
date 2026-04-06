import React, { useState, useCallback, useMemo } from 'react';

/* ───────────────────────── Drug Lesson Data ───────────────────────── */
const DRUG_LESSONS = [
  {
    id: 'opioids',
    title: 'Opioids',
    color: '#e11d48',
    image: '/nurs1000/pharm/opioids.jpg',
    mnemonic: '"OPIOIDS SLOW DOWN EVERYTHING"',
    classification: {
      drugs: ['Hydromorphone', 'Codeine', 'Oxycodone', 'Fentanyl', 'Morphine sulfate (most common)'],
      suffix: null,
      note: 'Opioid agonists — bind to opioid receptors in the CNS',
    },
    moa: 'Binds to opioid receptors (mu, kappa, delta) in the CNS → produces analgesic, sedative, and euphoric effects. Mimics endorphins. "OPIOIDS SLOW DOWN EVERYTHING" — they depress the central nervous system broadly.',
    uses: ['Anxiety & dyspnea reduction', 'Post-operative sedation/pain', 'MI pain management', 'End-of-life/palliative care', 'Chronic pain (transdermal fentanyl)'],
    sideEffects: [
      { text: 'SLOW GI — constipation (most common)', highlight: true },
      { text: 'SLOW CNS — weakness, dizziness, sedation', highlight: true },
      { text: 'SLOW vitals — ↓HR, ↓BP, ↓RR', highlight: true },
      { text: 'Nausea/vomiting' },
      { text: 'Urinary retention' },
      { text: 'Respiratory depression (life-threatening)', highlight: true },
    ],
    nursing: [
      'Monitor RR — hold if RR < 12 (respiratory depression)',
      'Assess pain level before and after administration',
      'Monitor bowel function — administer stool softeners prophylactically',
      'Transdermal Fentanyl Patch: chronic pain, 72hr relief, rotate site',
      'Patch site must be clean, dry, hair-free — NO heat exposure',
      "DON'Ts: no new patch over old, don't cut/alter patch, no heat (fever, hot tubs, saunas)",
      'Keep naloxone at bedside for high-risk patients',
    ],
    patientEd: [
      'RR < 12 = respiratory depression — call nurse immediately',
      'Take fiber and increase fluids to prevent constipation',
      'Change positions slowly (orthostatic hypotension)',
      'Do not drive or operate heavy machinery',
      'Avoid alcohol and other CNS depressants',
      'Fentanyl patch: avoid heat sources (heating pads, hot tubs, saunas)',
    ],
    antidote: { name: 'NALOXONE (Narcan)', note: 'Reverses opioid effects — may need repeat doses; monitor for re-sedation' },
    memoryHooks: [
      '"OPIOIDS SLOW DOWN EVERYTHING" — slow GI, slow CNS, slow vitals',
      'RR < 12 = RED FLAG for respiratory depression',
      'Fentanyl patch + heat = DANGER (increased absorption → overdose)',
      'Naloxone = Narcan = opioid antidote',
    ],
    quiz: [
      {
        q: 'What is the antidote for opioid overdose?',
        options: ['Acetylcysteine', 'Naloxone', 'Protamine sulfate', 'Vitamin K'],
        correct: 1,
        explanation: 'Naloxone (Narcan) is the specific opioid antagonist that reverses respiratory depression and other opioid effects.',
      },
      {
        q: 'A patient on morphine has a respiratory rate of 10. What is the priority nursing action?',
        options: ['Administer the next dose on schedule', 'Hold the medication and notify the provider', 'Encourage deep breathing', 'Document and continue monitoring'],
        correct: 1,
        explanation: 'RR < 12 indicates respiratory depression — hold opioids and notify the provider immediately.',
      },
      {
        q: 'Which is the MOST common side effect of opioids?',
        options: ['Diarrhea', 'Hypertension', 'Constipation', 'Tachycardia'],
        correct: 2,
        explanation: 'Opioids slow down everything including the GI tract, making constipation the most common side effect.',
      },
      {
        q: 'A patient with a fentanyl patch wants to use a heating pad on the patch site. The nurse should:',
        options: ['Allow it for comfort', 'Instruct patient to avoid heat near the patch', 'Move the patch first', 'Apply a second patch'],
        correct: 1,
        explanation: 'Heat increases fentanyl absorption from the patch, risking overdose. Never apply heat near a fentanyl patch.',
      },
      {
        q: 'How often should a transdermal fentanyl patch be replaced?',
        options: ['Every 24 hours', 'Every 48 hours', 'Every 72 hours', 'Every 96 hours'],
        correct: 2,
        explanation: 'Fentanyl patches provide 72 hours (3 days) of pain relief. Rotate application sites.',
      },
    ],
  },
  {
    id: 'acetaminophen',
    title: 'Acetaminophen',
    color: '#f59e0b',
    image: '/nurs1000/pharm/acetaminophen.jpg',
    mnemonic: 'Max 3,000mg/day — Liver killer!',
    classification: {
      drugs: ['Acetaminophen (Tylenol)'],
      suffix: null,
      note: 'Non-opioid analgesic & antipyretic — NOT an anti-inflammatory',
    },
    moa: 'Inhibits the COX pathway → ↓prostaglandin synthesis → reduces pain and fever. Key difference from NSAIDs: NO anti-inflammatory effect and NO effect on platelet clumping. Works centrally in the brain, not peripherally.',
    uses: ['Mild to moderate pain', 'Fever reduction', 'Flu symptoms in children (aspirin substitute)', 'Aspirin-sensitive patients', 'Osteoarthritis pain'],
    sideEffects: [
      { text: 'HEPATOTOXICITY (impaired liver function)', highlight: true },
      { text: 'GI upset, nausea/vomiting' },
      { text: 'Anorexia' },
      { text: 'High dose/long-term → liver cannot metabolize → toxic metabolites accumulate', highlight: true },
    ],
    nursing: [
      'Limit to 3,000 mg/day (some sources say 4g, but 3g is safer)',
      'Assess alcohol use — chronic drinkers at HIGH risk for hepatotoxicity',
      'Monitor liver function tests (AST/ALT)',
      'Check ALL medications for hidden acetaminophen (combination products!)',
      'At-risk patients: chronic alcohol users, malnourished patients',
      'Assess for signs of liver damage: jaundice, RUQ pain, dark urine',
    ],
    patientEd: [
      'Do NOT exceed 3,000 mg per day',
      'Avoid alcohol while taking acetaminophen',
      'Read labels — many OTC meds contain acetaminophen (cold meds, sleep aids)',
      'Report any signs of liver problems: yellowing skin/eyes, dark urine, RUQ pain',
    ],
    antidote: { name: 'ACETYLCYSTEINE (Mucomyst)', note: 'Smells like rotten eggs! Replenishes glutathione to protect the liver. Must be given within 8-10 hours of overdose for best effect.' },
    memoryHooks: [
      'Acetaminophen → Acetylcysteine (both start with "Acet-")',
      'Acetylcysteine smells like rotten eggs 🥚',
      '3,000 mg/day max — "Three is the key"',
      'NO inflammation reduction — it\'s NOT an NSAID',
      'Liver + Alcohol + Acetaminophen = DISASTER',
    ],
    quiz: [
      {
        q: 'What is the antidote for acetaminophen overdose?',
        options: ['Naloxone', 'Acetylcysteine', 'Vitamin K', 'Flumazenil'],
        correct: 1,
        explanation: 'Acetylcysteine (Mucomyst) is the antidote — it replenishes glutathione to protect the liver from toxic metabolites.',
      },
      {
        q: 'What is the maximum recommended daily dose of acetaminophen?',
        options: ['1,000 mg', '2,000 mg', '3,000 mg', '5,000 mg'],
        correct: 2,
        explanation: 'The safe maximum is 3,000 mg/day. Exceeding this risks hepatotoxicity.',
      },
      {
        q: 'Which patient is at HIGHEST risk for acetaminophen toxicity?',
        options: ['A teenager with acne', 'A chronic alcohol user', 'A patient with asthma', 'A patient with diabetes'],
        correct: 1,
        explanation: 'Chronic alcohol use depletes glutathione stores, making the liver unable to safely metabolize acetaminophen.',
      },
      {
        q: 'Unlike NSAIDs, acetaminophen does NOT:',
        options: ['Reduce fever', 'Reduce pain', 'Reduce inflammation', 'Come in oral form'],
        correct: 2,
        explanation: 'Acetaminophen has NO anti-inflammatory properties. It reduces pain and fever but does not affect inflammation or platelet function.',
      },
      {
        q: 'The most serious adverse effect of acetaminophen is:',
        options: ['GI bleeding', 'Hepatotoxicity', 'Nephrotoxicity', 'Ototoxicity'],
        correct: 1,
        explanation: 'Hepatotoxicity (liver damage) is the most dangerous effect. High doses produce toxic metabolites that destroy liver cells.',
      },
    ],
  },
  {
    id: 'diuretics',
    title: 'Diuretics',
    color: '#8b5cf6',
    image: '/nurs1000/pharm/diuretics.jpg',
    mnemonic: '"Fast Furosemide = Fuzzy Hearing"',
    classification: {
      drugs: [
        'LOOP: Furosemide (-mide), Bumetanide (-nide), Torsemide',
        'THIAZIDE: Hydrochlorothiazide, Chlorothiazide (-thiazide)',
      ],
      suffix: '-mide / -nide (loop) • -thiazide (thiazide)',
      note: 'Both types are K+ wasting diuretics. Loop diuretics are the most POTENT.',
    },
    moa: 'LOOP: Inhibit Na+/Cl⁻ reabsorption in the ascending loop of Henle (3 parts of nephron). Most potent diuretics — produce large volume urine output.\n\nTHIAZIDE: Inhibit Na+/Cl⁻ reabsorption in the distal convoluted tubule. Less potent than loop but still effective. Both waste potassium.',
    uses: ['Hypertension (HTN)', 'Heart failure (HF)', 'Renal disease', 'Peripheral edema', 'Pulmonary edema', 'Cirrhosis (thiazides)'],
    sideEffects: [
      { text: 'HYPOKALEMIA (K+ < 3.5 mEq/L) — both types', highlight: true },
      { text: 'OTOTOXICITY — "Fast Furosemide = Fuzzy Hearing"', highlight: true },
      { text: 'Hypotension & dehydration' },
      { text: 'Hyperglycemia' },
      { text: 'Hyponatremia' },
      { text: 'Photosensitivity' },
      { text: 'Thiazide-specific: Hyperuricemia (gout)', highlight: true },
      { text: 'Thiazide-specific: SJS risk (Stevens-Johnson Syndrome)', highlight: true },
    ],
    nursing: [
      'Monitor K+ levels — risk for HYPOKALEMIA (< 3.5 mEq/L)',
      'Monitor I&O, daily weights, BP',
      'Administer in the morning (avoid nocturia)',
      'Loop: Infuse IV furosemide slowly to prevent ototoxicity',
      'Thiazide: ASK about SULFA allergies — patients with sulfa allergy AVOID thiazides',
      'Encourage potassium-rich foods: bananas, oranges, potatoes',
      'Monitor for signs of dehydration: dry mucous membranes, poor skin turgor',
    ],
    patientEd: [
      'Take in the morning to avoid nighttime urination',
      'Eat potassium-rich foods (bananas, oranges, spinach)',
      'Report muscle weakness, cramps, irregular heartbeat (signs of low K+)',
      'Use sunscreen — photosensitivity risk',
      'Weigh yourself daily — report gain > 2 lbs/day',
      'Change positions slowly (orthostatic hypotension)',
    ],
    antidote: null,
    memoryHooks: [
      '"Fast Furosemide = Fuzzy Hearing" — ototoxicity!',
      'Loop = most potent = "Loop de Loop" (big effect)',
      'Both types WASTE potassium → hypokalemia',
      'Thiazide + Sulfa allergy = NO GO',
      'K+ < 3.5 = hypokalemia danger zone',
      '-mide/-nide = loop | -thiazide = thiazide',
    ],
    quiz: [
      {
        q: '"Fast Furosemide = Fuzzy Hearing" refers to which side effect?',
        options: ['Nephrotoxicity', 'Hepatotoxicity', 'Ototoxicity', 'Cardiotoxicity'],
        correct: 2,
        explanation: 'Rapid IV administration of furosemide can cause ototoxicity (hearing loss/tinnitus). Infuse slowly!',
      },
      {
        q: 'A patient on furosemide has a K+ of 3.2 mEq/L. This indicates:',
        options: ['Normal potassium', 'Hyperkalemia', 'Hypokalemia', 'Hypernatremia'],
        correct: 2,
        explanation: 'Normal K+ is 3.5-5.0 mEq/L. A level of 3.2 indicates hypokalemia, a common side effect of loop and thiazide diuretics.',
      },
      {
        q: 'Which patient should AVOID thiazide diuretics?',
        options: ['Patient with diabetes', 'Patient with sulfa allergy', 'Patient with obesity', 'Patient with anxiety'],
        correct: 1,
        explanation: 'Thiazides are sulfonamide derivatives. Patients with sulfa allergies should avoid them due to cross-reactivity risk.',
      },
      {
        q: 'Which diuretic class is the MOST potent?',
        options: ['Thiazide diuretics', 'Potassium-sparing diuretics', 'Loop diuretics', 'Osmotic diuretics'],
        correct: 2,
        explanation: 'Loop diuretics (furosemide, bumetanide) are the most potent diuretics, acting on the loop of Henle.',
      },
      {
        q: 'When should diuretics be administered?',
        options: ['At bedtime', 'In the morning', 'With dinner', 'At midnight'],
        correct: 1,
        explanation: 'Give diuretics in the morning to avoid nocturia (excessive nighttime urination) that disrupts sleep.',
      },
    ],
  },
  {
    id: 'vancomycin-macrolides',
    title: 'Vancomycin & Macrolides',
    color: '#10b981',
    image: '/nurs1000/pharm/vancomycin_macrolides.jpg',
    mnemonic: 'Red Man Syndrome — Slow the infusion!',
    classification: {
      drugs: [
        'VANCOMYCIN: Vancomycin',
        'MACROLIDES: Azithromycin, Clarithromycin, Erythromycin',
      ],
      suffix: '-MYCIN (macrolides)',
      note: 'Vancomycin = glycopeptide antibiotic. Macrolides = bacteriostatic antibiotics.',
    },
    moa: 'VANCOMYCIN: Inhibits bacterial cell wall synthesis. Effective against gram-positive organisms including MRSA and C. diff.\n\nMACROLIDES: Inhibit protein synthesis by binding to the 50S ribosomal subunit. Bacteriostatic at normal doses.',
    uses: [
      'Vancomycin: Skin/bone infections, C. diff (PO), MRSA',
      'Macrolides: Skin infections, ear/eye infections, C. diff, URTI',
      'Macrolides: Community-acquired pneumonia, pharyngitis',
    ],
    sideEffects: [
      { text: 'Vancomycin Flushing Syndrome (Red Man/Red Neck Syndrome)', highlight: true },
      { text: 'Vancomycin: ↑BP, rash, nephrotoxicity' },
      { text: 'Macrolides: HEPATOTOXICITY', highlight: true },
      { text: 'Macrolides: Cardiac arrhythmia / QT prolongation', highlight: true },
      { text: 'GI upset (both)' },
    ],
    nursing: [
      'Vancomycin: Infuse over 60 min (< 1 gm) or 100 min (> 1 gm)',
      'Vancomycin: Monitor peak (20-40 mcg/dL) and trough (5-15 mcg/mL)',
      'Vancomycin: STOP infusion if flushing/Red Man Syndrome occurs',
      'Macrolides: Monitor liver function (AST/ALT)',
      'Macrolides: Monitor for signs of liver damage — jaundice, itchy skin, pale stools',
      'Macrolides: Monitor ECG for QT prolongation',
      'Both: Monitor renal function (vancomycin is nephrotoxic)',
    ],
    patientEd: [
      'Report flushing, redness, or rash during vancomycin infusion immediately',
      'Complete the full course of antibiotics even if feeling better',
      'Report signs of liver problems: yellowing skin, itchy skin, pale stools',
      'Report irregular heartbeat or palpitations (macrolides)',
    ],
    antidote: null,
    memoryHooks: [
      'Red Man Syndrome = too-fast vancomycin infusion → SLOW IT DOWN',
      'Vancomycin: peak 20-40, trough 5-15 (remember the ranges!)',
      '-MYCIN suffix = macrolide antibiotic',
      'Macrolides + Liver = watch those LFTs',
      '60 min for < 1 gm, 100 min for > 1 gm (vancomycin infusion times)',
    ],
    quiz: [
      {
        q: 'Red Man Syndrome is associated with which medication?',
        options: ['Azithromycin', 'Vancomycin', 'Erythromycin', 'Furosemide'],
        correct: 1,
        explanation: 'Vancomycin Flushing Syndrome (Red Man Syndrome) occurs when vancomycin is infused too rapidly, causing histamine release.',
      },
      {
        q: 'Vancomycin > 1 gm should be infused over at least:',
        options: ['30 minutes', '60 minutes', '100 minutes', '120 minutes'],
        correct: 2,
        explanation: 'Vancomycin > 1 gm should be infused over at least 100 minutes. Doses < 1 gm require at least 60 minutes.',
      },
      {
        q: 'The suffix -MYCIN indicates which drug class?',
        options: ['ACE inhibitors', 'Beta blockers', 'Macrolide antibiotics', 'Loop diuretics'],
        correct: 2,
        explanation: 'The -MYCIN suffix identifies macrolide antibiotics: azithromycin, clarithromycin, erythromycin.',
      },
      {
        q: 'Which serious side effect is associated with macrolide antibiotics?',
        options: ['Red Man Syndrome', 'Ototoxicity', 'QT prolongation', 'Hypokalemia'],
        correct: 2,
        explanation: 'Macrolides can cause cardiac arrhythmias and QT prolongation — monitor ECG and report irregular heartbeats.',
      },
      {
        q: 'The therapeutic trough level for vancomycin is:',
        options: ['1-5 mcg/mL', '5-15 mcg/mL', '20-40 mcg/mL', '40-60 mcg/mL'],
        correct: 1,
        explanation: 'Vancomycin trough level should be 5-15 mcg/mL. Peak level should be 20-40 mcg/dL. Draw trough 30 min before next dose.',
      },
    ],
  },
  {
    id: 'anticoagulants-monitoring',
    title: 'Anticoagulants — Monitoring',
    color: '#6366f1',
    image: '/nurs1000/pharm/anticoagulants_monitoring.jpg',
    mnemonic: '"Numbers HIGH = Patients DIE" / "Numbers LOW = Clots GROW"',
    classification: {
      drugs: ['Heparin (unfractionated)', 'Warfarin (Coumadin)'],
      suffix: null,
      note: 'Both prevent clot formation but through different mechanisms. Major risk: BLEEDING.',
    },
    moa: 'Both drugs prevent clot formation/extension but do NOT dissolve existing clots.\n\nHeparin → monitored by aPTT (47-70 sec)\nWarfarin → monitored by PT/INR (2-3, or 2.5-3.5 for mechanical heart valve)\n\n"Numbers HIGH = Patients DIE" (over-anticoagulated → bleeding)\n"Numbers LOW = Clots GROW" (under-anticoagulated → clot risk)',
    uses: ['Prevent DVT/PE', 'A-fib prophylaxis', 'Post-surgical clot prevention', 'Mechanical heart valve patients (warfarin)'],
    sideEffects: [
      { text: 'BLEEDING — bruising, petechiae, bloody stool, coffee-ground vomiting', highlight: true },
      { text: 'Heparin-Induced Thrombocytopenia (HIT)', highlight: true },
      { text: 'Hemorrhage (life-threatening)', highlight: true },
    ],
    nursing: [
      'Heparin: Monitor aPTT (therapeutic: 47-70 seconds)',
      'Warfarin: Monitor PT/INR (therapeutic: 2-3; heart valve: 2.5-3.5)',
      'Heparin admin: SubQ in belly, 2 inches from umbilicus, 90° angle',
      'Do NOT massage injection site after heparin SubQ',
      'Warfarin diet: Maintain CONSISTENT vitamin K intake',
      'Vitamin K foods: liver, green leafy vegetables (kale, spinach, broccoli)',
      'Bleeding precautions: soft toothbrush, electric razor, no flossing',
      'Avoid NSAIDs, aspirin, and alcohol (increase bleeding risk)',
    ],
    patientEd: [
      '"Numbers HIGH = Patients DIE" — report signs of bleeding immediately',
      '"Numbers LOW = Clots GROW" — take medication consistently',
      'Warfarin: Keep vitamin K intake CONSISTENT (don\'t suddenly eat more or less)',
      'Use electric razor instead of blade razor',
      'Use soft toothbrush, avoid flossing',
      'No contact sports',
      'Avoid NSAIDs, aspirin, and alcohol',
      'Wear a medical alert bracelet',
      'Report: unusual bruising, blood in urine/stool, nosebleeds, coffee-ground vomit',
    ],
    antidote: null,
    memoryHooks: [
      '"Numbers HIGH = Patients DIE" (bleeding risk)',
      '"Numbers LOW = Clots GROW" (clot risk)',
      'Heparin = aPTT | Warfarin = INR (alphabetical order! H before W, a before I)',
      'aPTT 47-70 | INR 2-3 (or 2.5-3.5 for valves)',
      'Heparin SubQ: 2 inches from belly button, 90° angle, NO massage',
      'Warfarin + Vitamin K = CONSISTENT (not avoid — consistent!)',
    ],
    quiz: [
      {
        q: 'Which lab value monitors heparin therapy?',
        options: ['PT/INR', 'aPTT', 'CBC', 'BMP'],
        correct: 1,
        explanation: 'Heparin is monitored by aPTT (activated Partial Thromboplastin Time). Therapeutic range: 47-70 seconds.',
      },
      {
        q: 'A patient on warfarin has an INR of 5.2. The nurse should:',
        options: ['Administer the next dose', 'Hold warfarin and notify provider immediately', 'Increase the dose', 'Give vitamin K foods'],
        correct: 1,
        explanation: '"Numbers HIGH = Patients DIE." An INR of 5.2 is critically elevated (normal therapeutic: 2-3), indicating high bleeding risk.',
      },
      {
        q: 'When administering heparin SubQ, the nurse should:',
        options: ['Massage the site after injection', 'Inject 2 inches from umbilicus at 90°, do NOT massage', 'Inject in the deltoid at 45°', 'Apply heat to the injection site'],
        correct: 1,
        explanation: 'Heparin SubQ is given in the abdomen, 2 inches from the umbilicus, at a 90° angle. Never massage — this causes bruising.',
      },
      {
        q: 'A patient on warfarin asks about diet. The correct advice is:',
        options: ['Avoid all vitamin K foods', 'Eat as much vitamin K as desired', 'Maintain CONSISTENT vitamin K intake', 'Take vitamin K supplements'],
        correct: 2,
        explanation: 'Patients don\'t need to avoid vitamin K — they need to keep intake CONSISTENT so warfarin dosing remains stable.',
      },
      {
        q: 'Which statement indicates a patient understands bleeding precautions?',
        options: ['"I\'ll use my regular razor"', '"I can take ibuprofen for headaches"', '"I\'ll use a soft toothbrush and electric razor"', '"I\'ll continue playing football"'],
        correct: 2,
        explanation: 'Soft toothbrush and electric razor reduce bleeding risk. Avoid blade razors, NSAIDs, and contact sports.',
      },
    ],
  },
  {
    id: 'ace-arbs',
    title: 'ACE Inhibitors & ARBs',
    color: '#3b82f6',
    image: '/nurs1000/pharm/ace_inhibitors_arbs.jpg',
    mnemonic: 'ACE = Angioedema, Cough, Elevate K+',
    classification: {
      drugs: [
        'ACE: Captopril, Enalapril, Fosinopril, Lisinopril, Ramipril',
        'ARBs: Losartan, Olmesartan, Valsartan, Azilsartan, Candesartan',
      ],
      suffix: '-PRIL (ACE) / -SARTAN (ARBs)',
      note: 'ACE inhibitors block angiotensin-converting enzyme. ARBs block angiotensin II receptors. Both target the RAAS system.',
    },
    moa: 'Both drug classes block the Renin-Angiotensin-Aldosterone System (RAAS):\n\nACE Inhibitors: Block ACE → prevent conversion of angiotensin I to angiotensin II → ↓vasoconstriction, ↓aldosterone → ↓blood volume and pressure.\n\nARBs: Block angiotensin II at the receptor → same end result but fewer side effects (no dry cough because bradykinin isn\'t affected).',
    uses: ['Hypertension (HTN)', 'Myocardial infarction (MI)', 'Heart failure (HF)', 'Diabetic nephropathy (renal protection)', 'Stroke prevention'],
    sideEffects: [
      { text: 'Angioedema (swelling of face/mouth/throat) — EMERGENCY', highlight: true },
      { text: 'Cough — dry, persistent (ACE only, not ARBs)', highlight: true },
      { text: 'Elevated K+ (hyperkalemia)', highlight: true },
      { text: 'Orthostatic hypotension' },
      { text: 'Dizziness' },
      { text: 'Teratogenic — NOT SAFE in pregnancy', highlight: true },
    ],
    nursing: [
      'Monitor BUN (7-20 mg/dL) and Creatinine (0.6-1.2 mg/dL)',
      'Monitor potassium levels — risk for hyperkalemia',
      'AVOID potassium salt substitutes and K+ supplements',
      'Report angioedema IMMEDIATELY (swelling of face/mouth)',
      'Teratogenic → contraindicated in pregnancy',
      'ACE vs ARBs: If patient develops dry cough on ACE, switch to ARB',
      'ARBs have fewer side effects overall, may also ↓HR',
      'Monitor BP — first-dose hypotension possible',
    ],
    patientEd: [
      'Do NOT stop suddenly — rebound hypertension can occur',
      'Change positions slowly (sit → stand) to prevent orthostatic hypotension',
      'Avoid potassium-rich salt substitutes',
      'Report swelling of face, lips, tongue, throat IMMEDIATELY (angioedema)',
      'Dry cough is a known ACE side effect — report but don\'t stop without provider order',
      'NOT SAFE in pregnancy — use reliable contraception',
      'Take as prescribed even if feeling well (HTN is "silent")',
    ],
    antidote: null,
    memoryHooks: [
      'ACE side effects mnemonic: A-C-E = Angioedema, Cough, Elevate K+',
      '-PRIL = ACE inhibitor | -SARTAN = ARB',
      'ARBs = "A Really Better Substitute" (fewer side effects)',
      'Cough? Switch from ACE (-pril) to ARB (-sartan)',
      'RAAS blockers + Pregnancy = NEVER (teratogenic)',
      'Don\'t stop suddenly → rebound HTN!',
    ],
    quiz: [
      {
        q: 'The suffix -PRIL indicates which drug class?',
        options: ['ARBs', 'Beta blockers', 'ACE inhibitors', 'Diuretics'],
        correct: 2,
        explanation: 'The -PRIL suffix identifies ACE inhibitors: captopril, enalapril, lisinopril, ramipril, etc.',
      },
      {
        q: 'A patient on lisinopril reports a persistent dry cough. The nurse should:',
        options: ['Administer cough suppressant', 'Notify provider — may switch to an ARB', 'Tell patient it will resolve', 'Discontinue the medication'],
        correct: 1,
        explanation: 'Dry cough is a common ACE inhibitor side effect (due to bradykinin accumulation). Provider may switch to an ARB, which doesn\'t cause cough.',
      },
      {
        q: 'Which electrolyte imbalance is associated with ACE inhibitors?',
        options: ['Hypokalemia', 'Hyperkalemia', 'Hyponatremia', 'Hypercalcemia'],
        correct: 1,
        explanation: 'ACE inhibitors reduce aldosterone secretion, which decreases potassium excretion → hyperkalemia. Avoid K+ supplements.',
      },
      {
        q: 'ACE inhibitors are contraindicated in:',
        options: ['Diabetes', 'Heart failure', 'Pregnancy', 'Hypertension'],
        correct: 2,
        explanation: 'ACE inhibitors and ARBs are TERATOGENIC — they can cause fetal harm and are absolutely contraindicated in pregnancy.',
      },
      {
        q: 'A patient on enalapril has facial and tongue swelling. This is:',
        options: ['An expected side effect', 'Angioedema — an emergency', 'Allergic rhinitis', 'Normal first-dose reaction'],
        correct: 1,
        explanation: 'Angioedema (swelling of face/mouth/throat) is a life-threatening emergency. Stop the medication and ensure airway protection.',
      },
    ],
  },
  {
    id: 'anticoagulants-comparison',
    title: 'Anticoagulants — Comparison',
    color: '#6366f1',
    image: '/nurs1000/pharm/anticoagulants_comparison.jpg',
    mnemonic: '"Heparin is in a Hurry" / "Warfarin makes you Wait"',
    classification: {
      drugs: ['Heparin (IV/SubQ)', 'Warfarin (Coumadin — PO)'],
      suffix: null,
      note: 'Heparin = rapid onset, short-term. Warfarin = slow onset, long-term.',
    },
    moa: 'HEPARIN: Activates antithrombin III → prevents thrombin activation → immediate anticoagulant effect. Rapid onset (minutes). Given IV or SubQ.\n\nWARFARIN: Interferes with vitamin K-dependent clotting factor synthesis → ↓factors II, VII, IX, X. Slow onset (24-72 hours). Given orally (PO).\n\nNeither drug dissolves existing clots — they prevent NEW clots and stop CURRENT clots from growing.',
    uses: ['Prevent new clot formation', 'A-fib prophylaxis', 'Prevent current clots from growing (DVT/PE)', 'Bridge therapy: start heparin → overlap with warfarin → discontinue heparin'],
    sideEffects: [
      { text: 'BLEEDING — the major risk for both', highlight: true },
      { text: 'Heparin: HIT (Heparin-Induced Thrombocytopenia)', highlight: true },
      { text: 'Warfarin: Teratogenic — NOT safe in pregnancy', highlight: true },
      { text: 'Warfarin: Skin necrosis (rare)' },
    ],
    nursing: [
      'Heparin: Monitor aPTT | Warfarin: Monitor PT/INR',
      'Heparin antidote: PROTAMINE SULFATE',
      'Warfarin antidote: VITAMIN K (phytonadione)',
      'Heparin: SAFE in pregnancy | Warfarin: TERATOGENIC',
      'Bridge therapy: Start both → wait for INR to be therapeutic → stop heparin',
      'Heparin: Short-term use | Warfarin: Long-term use',
      'Monitor for signs of bleeding with both drugs',
    ],
    patientEd: [
      '"Heparin is in a Hurry" — works in minutes (IV/SubQ)',
      '"Warfarin makes you Wait" — takes 24-72 hours to work (PO)',
      'Heparin: hospital-based (IV/SubQ), short-term',
      'Warfarin: home-based (oral), long-term, regular INR checks',
      'Both: watch for bleeding signs',
      'Warfarin: consistent vitamin K diet',
    ],
    antidote: {
      name: 'Heparin → PROTAMINE SULFATE | Warfarin → VITAMIN K',
      note: 'Protamine binds to heparin to neutralize it. Vitamin K restores clotting factor production blocked by warfarin.',
    },
    memoryHooks: [
      '"Heparin is in a Hurry" — rapid onset, H for Hurry',
      '"Warfarin makes you Wait" — slow onset, W for Wait',
      'Heparin = aPTT | Warfarin = PT/INR',
      'Heparin antidote = Protamine sulfate (P for P)',
      'Warfarin antidote = Vitamin K',
      'Heparin = Safe in pregnancy | Warfarin = Teratogenic',
      'Warfarin blocks factors 2, 7, 9, 10 (1972 — "the year warfarin was important")',
    ],
    quiz: [
      {
        q: 'What is the antidote for heparin?',
        options: ['Vitamin K', 'Naloxone', 'Protamine sulfate', 'Acetylcysteine'],
        correct: 2,
        explanation: 'Protamine sulfate is the specific antidote for heparin. It binds to heparin and neutralizes its anticoagulant effect.',
      },
      {
        q: '"Heparin is in a Hurry" means:',
        options: ['It should be given quickly', 'It has a rapid onset of action', 'It wears off slowly', 'It should be rushed to the patient'],
        correct: 1,
        explanation: 'Heparin has a rapid onset (minutes) compared to warfarin (24-72 hours). "Hurry" = fast acting.',
      },
      {
        q: 'Which anticoagulant is SAFE to use during pregnancy?',
        options: ['Warfarin', 'Heparin', 'Both are safe', 'Neither is safe'],
        correct: 1,
        explanation: 'Heparin does not cross the placenta and is safe in pregnancy. Warfarin is TERATOGENIC and must be avoided.',
      },
      {
        q: 'What is the antidote for warfarin?',
        options: ['Protamine sulfate', 'Vitamin K', 'Naloxone', 'Flumazenil'],
        correct: 1,
        explanation: 'Vitamin K (phytonadione) is the antidote for warfarin. Warfarin works by inhibiting vitamin K-dependent clotting factors.',
      },
      {
        q: 'Warfarin interferes with which clotting factors?',
        options: ['I, III, V, VIII', 'II, VII, IX, X', 'XI, XII, XIII', 'All clotting factors'],
        correct: 1,
        explanation: 'Warfarin inhibits vitamin K-dependent clotting factors: II, VII, IX, and X. Memory aid: "1972" (factors 10, 9, 7, 2).',
      },
    ],
  },
  {
    id: 'beta-blockers',
    title: 'Beta Blockers',
    color: '#ef4444',
    image: '/nurs1000/pharm/beta_blockers.jpg',
    mnemonic: '4 B\'s: Bradycardia, Breathing, Blood sugar, BP drop',
    classification: {
      drugs: [
        'Selective (B1/heart) "AMEN": Atenolol, Metoprolol, Esmolol, Nebivolol',
        'Non-selective (B1+B2) "PTN": Propranolol, Timolol, Nadolol',
        'Mixed (α1+β1+β2) "CL": Carvedilol, Labetalol',
        'ISA "AP": Acebutolol, Pindolol',
      ],
      suffix: '-OLOL',
      note: 'Block adrenaline/norepinephrine at beta-adrenergic receptors.',
    },
    moa: 'Block adrenaline (epinephrine) and norepinephrine at beta-adrenergic receptors → ↓heart rate, ↓blood pressure, ↓cardiac workload.\n\nB1 (heart) selective: Primarily affect the heart → ↓HR, ↓contractility\nNon-selective (B1+B2): Also affect lungs (B2) → can cause bronchoconstriction\nMixed (α+β): Also block alpha receptors → additional vasodilation',
    uses: ['Hypertension (HTN)', 'Tachycardia / SVT', 'Anxiety (performance anxiety)', 'Stable angina', 'Atrial fibrillation (A-fib)', 'Chronic heart failure (HF)', 'Migraine prophylaxis'],
    sideEffects: [
      { text: 'Bradycardia — the "B" everyone remembers', highlight: true },
      { text: 'Breathing problems — bronchoconstriction (non-selective)', highlight: true },
      { text: 'Blood sugar masking — masks hypoglycemia signs in diabetics', highlight: true },
      { text: 'Blood pressure drop — hypotension', highlight: true },
      { text: 'Fatigue, weakness, cold extremities' },
    ],
    nursing: [
      'Check HR before administering — hold if HR < 60 bpm',
      'Monitor BP — hold if systolic < 90 mmHg',
      'Contraindicated in asthma patients (bronchoconstriction risk)',
      'BAN for asthmatics: Beta blockers, Aspirin, NSAIDs',
      'Contraindicated in acute/decompensated heart failure',
      'Monitor blood glucose in diabetic patients (masks hypoglycemia)',
      'Do NOT stop abruptly — taper to prevent rebound HTN/tachycardia',
      'Selective (B1) preferred for patients with lung disease (if absolutely necessary)',
    ],
    patientEd: [
      'Do NOT stop suddenly — rebound hypertension and tachycardia can occur',
      'Check pulse daily — report if < 60 bpm',
      'Change positions slowly (orthostatic hypotension)',
      'Diabetics: monitor blood sugar closely — beta blockers mask hypoglycemia signs (tachycardia, tremor)',
      'Report shortness of breath, wheezing, or difficulty breathing',
      'Avoid in asthma — "BAN" = Beta blockers, Aspirin, NSAIDs',
      'May cause fatigue and cold extremities',
    ],
    antidote: null,
    memoryHooks: [
      '4 B\'s of beta blocker side effects: Bradycardia, Breathing problems, Blood sugar masking, Blood pressure drop',
      '-OLOL suffix = beta blocker',
      'Selective B1 "AMEN" = Atenolol, Metoprolol, Esmolol, Nebivolol',
      'Non-selective "PTN" = Propranolol, Timolol, Nadolol',
      'BAN for asthmatics: Beta blockers, Aspirin, NSAIDs',
      'Hold if HR < 60 or SBP < 90',
      'NEVER stop abruptly → rebound HTN',
    ],
    quiz: [
      {
        q: 'The suffix -OLOL indicates which drug class?',
        options: ['ACE inhibitors', 'ARBs', 'Beta blockers', 'Calcium channel blockers'],
        correct: 2,
        explanation: 'The -OLOL suffix identifies beta blockers: metoprolol, atenolol, propranolol, carvedilol, etc.',
      },
      {
        q: 'Before administering a beta blocker, the nurse should check:',
        options: ['Blood glucose only', 'Heart rate and blood pressure', 'Respiratory rate only', 'Temperature'],
        correct: 1,
        explanation: 'Always check HR (hold if < 60) and BP (hold if systolic < 90) before giving beta blockers.',
      },
      {
        q: 'Beta blockers are CONTRAINDICATED in patients with:',
        options: ['Hypertension', 'Atrial fibrillation', 'Asthma', 'Anxiety'],
        correct: 2,
        explanation: 'Non-selective beta blockers block B2 receptors in the lungs → bronchoconstriction. BAN for asthmatics: Beta blockers, Aspirin, NSAIDs.',
      },
      {
        q: 'The "4 B\'s" of beta blocker side effects are:',
        options: ['Bleeding, Bruising, Burns, Blisters', 'Bradycardia, Breathing problems, Blood sugar masking, BP drop', 'Bradycardia, Bloating, Blurred vision, Bone loss', 'Burning, Bleeding, Bronchitis, Baldness'],
        correct: 1,
        explanation: 'The 4 B\'s: Bradycardia, Breathing problems (bronchoconstriction), Blood sugar masking (in diabetics), Blood pressure drop.',
      },
      {
        q: 'Why is abrupt discontinuation of beta blockers dangerous?',
        options: ['Causes liver failure', 'Causes rebound hypertension and tachycardia', 'Causes kidney damage', 'Causes allergic reaction'],
        correct: 1,
        explanation: 'Stopping beta blockers suddenly can cause rebound hypertension, tachycardia, and even angina or MI. Always taper gradually.',
      },
    ],
  },
];

/* ───────────────────────── Styles ───────────────────────── */
const styles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1e293b',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    margin: '0 0 4px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: 0,
  },
  progressBar: {
    display: 'flex',
    gap: 6,
    justifyContent: 'center',
    margin: '16px 0',
    flexWrap: 'wrap',
  },
  progressDot: (color, completed) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: completed ? color : '#e2e8f0',
    border: `2px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    color: completed ? '#fff' : color,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380, 1fr))',
    gap: 16,
  },
  // Card styles
  card: (color) => ({
    borderRadius: 12,
    border: `1px solid #e2e8f0`,
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    transition: 'box-shadow 0.2s',
  }),
  cardAccent: (color) => ({
    height: 4,
    background: color,
  }),
  cardHeader: {
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  cardTitle: (color) => ({
    fontSize: 20,
    fontWeight: 700,
    color: color,
    margin: 0,
  }),
  cardMnemonic: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    margin: '2px 0 0',
  },
  badge: (color) => ({
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 12,
    background: color + '18',
    color: color,
  }),
  thumbnail: {
    width: '100%',
    maxHeight: 200,
    objectFit: 'cover',
    cursor: 'pointer',
    borderTop: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
  },
  // Accordion
  section: {
    borderTop: '1px solid #f1f5f9',
  },
  sectionHeader: {
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontSize: 15,
    fontWeight: 600,
    color: '#334155',
  },
  sectionContent: {
    padding: '0 20px 16px',
    fontSize: 14,
    lineHeight: 1.6,
    color: '#475569',
  },
  list: {
    margin: '4px 0',
    paddingLeft: 20,
  },
  highlightItem: (color) => ({
    background: color + '15',
    borderLeft: `3px solid ${color}`,
    padding: '4px 8px',
    margin: '4px 0',
    borderRadius: '0 6px 6px 0',
    fontWeight: 600,
    fontSize: 13,
  }),
  normalItem: {
    padding: '2px 0',
    fontSize: 13,
  },
  moaText: {
    whiteSpace: 'pre-line',
    fontSize: 13,
    lineHeight: 1.7,
  },
  suffixBadge: (color) => ({
    display: 'inline-block',
    background: color,
    color: '#fff',
    padding: '1px 8px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    marginLeft: 6,
  }),
  antidoteBox: (color) => ({
    background: color + '12',
    border: `1px solid ${color}40`,
    borderRadius: 8,
    padding: '10px 14px',
    marginTop: 4,
  }),
  antidoteName: (color) => ({
    fontWeight: 700,
    color: color,
    fontSize: 15,
  }),
  antidoteNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  hookBadge: (color) => ({
    display: 'inline-block',
    background: color + '12',
    border: `1px solid ${color}30`,
    borderRadius: 8,
    padding: '6px 10px',
    margin: '3px 0',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box',
  }),
  // Quiz styles
  quizBtn: (color) => ({
    display: 'block',
    width: 'calc(100% - 40px)',
    margin: '0 20px 16px',
    padding: '12px',
    background: color,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  }),
  quizContainer: {
    padding: '0 20px 20px',
  },
  questionNum: (color) => ({
    fontSize: 12,
    fontWeight: 700,
    color: color,
    marginBottom: 4,
  }),
  questionText: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 10,
    color: '#1e293b',
  },
  optionBtn: (state) => ({
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    marginBottom: 6,
    border: state === 'correct' ? '2px solid #10b981' : state === 'wrong' ? '2px solid #ef4444' : '1px solid #e2e8f0',
    borderRadius: 8,
    background: state === 'correct' ? '#ecfdf5' : state === 'wrong' ? '#fef2f2' : '#fff',
    textAlign: 'left',
    fontSize: 14,
    cursor: state === 'default' ? 'pointer' : 'default',
    color: '#334155',
    transition: 'all 0.15s',
  }),
  explanation: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: 8,
    padding: '10px 14px',
    marginTop: 8,
    fontSize: 13,
    color: '#0c4a6e',
    lineHeight: 1.5,
  },
  scoreBox: (color) => ({
    textAlign: 'center',
    padding: '20px',
    background: color + '10',
    borderRadius: 12,
    border: `1px solid ${color}30`,
  }),
  scoreNum: (color) => ({
    fontSize: 40,
    fontWeight: 800,
    color: color,
  }),
  nextBtn: (color) => ({
    display: 'inline-block',
    padding: '8px 20px',
    background: color,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 10,
  }),
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    color: '#475569',
    marginBottom: 16,
  },
  // Fullscreen image overlay
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    cursor: 'pointer',
    padding: 20,
  },
  overlayImg: {
    maxWidth: '95%',
    maxHeight: '95vh',
    borderRadius: 8,
    objectFit: 'contain',
  },
  studyAllBtn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
};

/* ───────────────────────── Sub-components ───────────────────────── */

function ImageOverlay({ src, onClose }) {
  if (!src) return null;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <img src={src} alt="Full size notes" style={styles.overlayImg} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function Accordion({ icon, title, children, defaultOpen = false, color }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={styles.section}>
      <button
        style={styles.sectionHeader}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{icon} {title}</span>
        <span style={{ color: color || '#94a3b8', fontSize: 18, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
      </button>
      {open && <div style={styles.sectionContent}>{children}</div>}
    </div>
  );
}

function SideEffectList({ items, color }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={item.highlight ? styles.highlightItem(color) : styles.normalItem}>
          {item.highlight ? '⚡ ' : '• '}{item.text}
        </div>
      ))}
    </div>
  );
}

function Quiz({ lesson, onComplete }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = lesson.quiz;
  const current = questions[qIdx];

  const handleSelect = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === current.correct) {
      setScore((s) => s + 1);
    }
  }, [selected, current]);

  const handleNext = useCallback(() => {
    if (qIdx + 1 >= questions.length) {
      setFinished(true);
      onComplete();
    } else {
      setQIdx((q) => q + 1);
      setSelected(null);
    }
  }, [qIdx, questions.length, onComplete]);

  const handleRetry = useCallback(() => {
    setQIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }, []);

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div style={styles.quizContainer}>
        <div style={styles.scoreBox(lesson.color)}>
          <div style={styles.scoreNum(lesson.color)}>{score}/{questions.length}</div>
          <div style={{ fontSize: 16, color: '#475569', fontWeight: 600 }}>
            {pct >= 80 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good job!' : '📖 Keep studying!'}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{pct}% correct</div>
          {pct < 100 && (
            <button style={styles.nextBtn(lesson.color)} onClick={handleRetry}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.quizContainer}>
      <div style={styles.questionNum(lesson.color)}>
        Question {qIdx + 1} of {questions.length}
      </div>
      <div style={styles.questionText}>{current.q}</div>
      {current.options.map((opt, i) => {
        let state = 'default';
        if (selected !== null) {
          if (i === current.correct) state = 'correct';
          else if (i === selected) state = 'wrong';
        }
        return (
          <button
            key={i}
            style={styles.optionBtn(state)}
            onClick={() => handleSelect(i)}
          >
            {String.fromCharCode(65 + i)}. {opt}
            {selected !== null && i === current.correct && ' ✓'}
            {selected !== null && i === selected && i !== current.correct && ' ✗'}
          </button>
        );
      })}
      {selected !== null && (
        <>
          <div style={styles.explanation}>
            💡 {current.explanation}
          </div>
          <div style={{ textAlign: 'right', marginTop: 10 }}>
            <button style={styles.nextBtn(lesson.color)} onClick={handleNext}>
              {qIdx + 1 >= questions.length ? 'See Score' : 'Next →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LessonCard({ lesson, completed, onComplete }) {
  const [expanded, setExpanded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [fullImg, setFullImg] = useState(null);

  const { color } = lesson;

  return (
    <>
      <ImageOverlay src={fullImg} onClose={() => setFullImg(null)} />
      <div style={styles.card(color)}>
        <div style={styles.cardAccent(color)} />
        <div
          style={styles.cardHeader}
          onClick={() => { setExpanded(!expanded); setShowQuiz(false); }}
        >
          <div>
            <h3 style={styles.cardTitle(color)}>{lesson.title}</h3>
            <p style={styles.cardMnemonic}>{lesson.mnemonic}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {completed && <span style={styles.badge('#10b981')}>✓ Done</span>}
            <span style={{ fontSize: 20, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block', color: '#94a3b8' }}>▾</span>
          </div>
        </div>

        {expanded && (
          <>
            <img
              src={lesson.image}
              alt={`${lesson.title} notes`}
              style={styles.thumbnail}
              onClick={() => setFullImg(lesson.image)}
              loading="lazy"
            />

            {/* Classification */}
            <Accordion icon="📋" title="Classification & Names" defaultOpen={true} color={color}>
              {lesson.classification.drugs.map((d, i) => (
                <div key={i} style={{ padding: '3px 0', fontSize: 13 }}>• {d}</div>
              ))}
              {lesson.classification.suffix && (
                <div style={{ marginTop: 6 }}>
                  Suffix: <span style={styles.suffixBadge(color)}>{lesson.classification.suffix}</span>
                </div>
              )}
              <div style={{ marginTop: 6, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                {lesson.classification.note}
              </div>
            </Accordion>

            {/* MOA */}
            <Accordion icon="⚙️" title="Mechanism of Action" color={color}>
              <div style={styles.moaText}>{lesson.moa}</div>
            </Accordion>

            {/* Therapeutic Uses */}
            <Accordion icon="💊" title="Therapeutic Uses" color={color}>
              <ul style={styles.list}>
                {lesson.uses.map((u, i) => <li key={i} style={{ fontSize: 13, marginBottom: 3 }}>{u}</li>)}
              </ul>
            </Accordion>

            {/* Side Effects */}
            <Accordion icon="⚠️" title="Side Effects" color={color}>
              <SideEffectList items={lesson.sideEffects} color={color} />
            </Accordion>

            {/* Nursing */}
            <Accordion icon="🏥" title="Nursing Considerations" color={color}>
              <ul style={styles.list}>
                {lesson.nursing.map((n, i) => <li key={i} style={{ fontSize: 13, marginBottom: 3 }}>{n}</li>)}
              </ul>
            </Accordion>

            {/* Patient Ed */}
            <Accordion icon="📚" title="Patient Education" color={color}>
              <ul style={styles.list}>
                {lesson.patientEd.map((p, i) => <li key={i} style={{ fontSize: 13, marginBottom: 3 }}>{p}</li>)}
              </ul>
            </Accordion>

            {/* Antidote */}
            {lesson.antidote && (
              <Accordion icon="🧪" title="Antidote" color={color}>
                <div style={styles.antidoteBox(color)}>
                  <div style={styles.antidoteName(color)}>💉 {lesson.antidote.name}</div>
                  <div style={styles.antidoteNote}>{lesson.antidote.note}</div>
                </div>
              </Accordion>
            )}

            {/* Memory Hooks */}
            <Accordion icon="💡" title="Memory Hooks & Mnemonics" color={color}>
              {lesson.memoryHooks.map((h, i) => (
                <div key={i} style={styles.hookBadge(color)}>💡 {h}</div>
              ))}
            </Accordion>

            {/* Quiz */}
            {!showQuiz ? (
              <button
                style={styles.quizBtn(color)}
                onClick={() => setShowQuiz(true)}
              >
                🧪 Test Your Knowledge
              </button>
            ) : (
              <Quiz lesson={lesson} onComplete={onComplete} />
            )}
          </>
        )}
      </div>
    </>
  );
}

/* ───────────────────────── Main Component ───────────────────────── */
export function PharmLessons() {
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [studyMode, setStudyMode] = useState(false);
  const [studyIdx, setStudyIdx] = useState(0);

  const handleComplete = useCallback((id) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const totalQuestions = useMemo(() => DRUG_LESSONS.reduce((sum, l) => sum + l.quiz.length, 0), []);

  // Study All sequential mode
  if (studyMode) {
    const lesson = DRUG_LESSONS[studyIdx];
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => setStudyMode(false)}>
          ← Back to All Lessons
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
            Lesson {studyIdx + 1} of {DRUG_LESSONS.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              style={{ ...styles.nextBtn('#64748b'), opacity: studyIdx === 0 ? 0.4 : 1 }}
              disabled={studyIdx === 0}
              onClick={() => setStudyIdx((i) => i - 1)}
            >
              ← Prev
            </button>
            <button
              style={{ ...styles.nextBtn(lesson.color), opacity: studyIdx >= DRUG_LESSONS.length - 1 ? 0.4 : 1 }}
              disabled={studyIdx >= DRUG_LESSONS.length - 1}
              onClick={() => setStudyIdx((i) => i + 1)}
            >
              Next →
            </button>
          </div>
        </div>
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          completed={completedLessons.has(lesson.id)}
          onComplete={() => handleComplete(lesson.id)}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>💊 Pharmacology Drug Lessons</h1>
        <p style={styles.subtitle}>
          {DRUG_LESSONS.length} drug classes • {totalQuestions} quiz questions • {completedLessons.size}/{DRUG_LESSONS.length} completed
        </p>
      </div>

      {/* Progress dots */}
      <div style={styles.progressBar}>
        {DRUG_LESSONS.map((l) => (
          <div
            key={l.id}
            style={styles.progressDot(l.color, completedLessons.has(l.id))}
            title={l.title}
          >
            {completedLessons.has(l.id) ? '✓' : l.title[0]}
          </div>
        ))}
      </div>

      {/* Study All Button */}
      <button
        style={styles.studyAllBtn}
        onClick={() => { setStudyMode(true); setStudyIdx(0); }}
      >
        📖 Study All Lessons Sequentially
      </button>

      {/* Lesson Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {DRUG_LESSONS.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            completed={completedLessons.has(lesson.id)}
            onComplete={() => handleComplete(lesson.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default PharmLessons;
