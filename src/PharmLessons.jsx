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
      // MOA (3)
      {
        q: 'How do opioids produce their therapeutic effect?',
        options: ['Inhibit COX enzymes peripherally', 'Bind to mu, kappa, and delta receptors in the CNS', 'Block sodium channels in peripheral nerves', 'Inhibit serotonin reuptake in the brain'],
        correct: 1,
        cat: 'moa',
        explanation: 'Opioids bind to opioid receptors (mu, kappa, delta) in the CNS, mimicking endorphins to produce analgesic, sedative, and euphoric effects.',
      },
      {
        q: 'Why does the mnemonic say "Opioids slow down everything"?',
        options: ['They speed up metabolism', 'They depress the CNS broadly — slowing GI, respirations, heart rate, and BP', 'They only affect pain perception', 'They increase neurotransmitter release'],
        correct: 1,
        cat: 'moa',
        explanation: 'Opioids are CNS depressants that slow GI motility (constipation), respiratory rate, heart rate, and blood pressure.',
      },
      {
        q: 'Naloxone reverses opioid effects by:',
        options: ['Stimulating dopamine release', 'Competing for opioid receptor binding sites as an antagonist', 'Increasing hepatic metabolism of opioids', 'Blocking calcium channels'],
        correct: 1,
        cat: 'moa',
        explanation: 'Naloxone is a competitive opioid antagonist that displaces opioids from receptor sites, reversing their effects. It has a short half-life and may need repeat doses.',
      },
      // Classification (2)
      {
        q: 'Which of the following is NOT an opioid agonist?',
        options: ['Morphine', 'Naloxone', 'Fentanyl', 'Hydromorphone'],
        correct: 1,
        cat: 'classification',
        explanation: 'Naloxone is an opioid ANTAGONIST (reversal agent). Morphine, fentanyl, and hydromorphone are all opioid agonists.',
      },
      {
        q: 'Which opioid is available as a transdermal patch for chronic pain?',
        options: ['Morphine', 'Codeine', 'Fentanyl', 'Hydromorphone'],
        correct: 2,
        cat: 'classification',
        explanation: 'Fentanyl is available as a transdermal patch for chronic pain management, providing 72 hours of relief.',
      },
      // Uses (3)
      {
        q: 'Opioids are indicated for all of the following EXCEPT:',
        options: ['Severe post-operative pain', 'Mild headache', 'MI-related chest pain', 'End-of-life palliative care'],
        correct: 1,
        cat: 'uses',
        explanation: 'Opioids are reserved for severe pain, post-op pain, MI pain, and palliative care. Mild headaches should be treated with non-opioid analgesics.',
      },
      {
        q: 'In palliative care, opioids may be used to manage:',
        options: ['Only pain', 'Pain, anxiety, and dyspnea', 'Only dyspnea', 'Fever and inflammation'],
        correct: 1,
        cat: 'uses',
        explanation: 'In end-of-life care, opioids address pain, anxiety, and dyspnea (air hunger), improving comfort.',
      },
      // Side Effects (3)
      {
        q: 'Which is the MOST common side effect of opioids?',
        options: ['Diarrhea', 'Hypertension', 'Constipation', 'Tachycardia'],
        correct: 2,
        cat: 'side_effects',
        explanation: 'Opioids slow down everything including the GI tract, making constipation the most common side effect. Prophylactic stool softeners are recommended.',
      },
      {
        q: 'Which opioid side effect is LIFE-THREATENING and requires immediate intervention?',
        options: ['Constipation', 'Nausea', 'Respiratory depression', 'Urinary retention'],
        correct: 2,
        cat: 'side_effects',
        explanation: 'Respiratory depression is the most dangerous opioid side effect. Monitor RR and hold medication if RR < 12.',
      },
      {
        q: 'A patient on morphine has a heart rate of 54 and BP of 88/56. These findings reflect:',
        options: ['Expected therapeutic effects', 'Opioid side effects — decreased HR and BP', 'Allergic reaction', 'Opioid withdrawal'],
        correct: 1,
        cat: 'side_effects',
        explanation: '"Opioids slow everything" — this includes heart rate (bradycardia) and blood pressure (hypotension).',
      },
      // Contraindications (2)
      {
        q: 'A patient on morphine has a respiratory rate of 10. What is the priority nursing action?',
        options: ['Administer the next dose on schedule', 'Hold the medication and notify the provider', 'Encourage deep breathing', 'Document and continue monitoring'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'RR < 12 indicates respiratory depression — hold opioids and notify the provider immediately.',
      },
      {
        q: 'Opioids should be AVOIDED in a patient with a head injury because they:',
        options: ['Cause seizures', 'Mask neurological symptoms needed for assessment', 'Increase intracranial pressure directly', 'Cause cerebral hemorrhage'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Opioids cause sedation, pupil changes, and altered LOC that mask critical neurological signs needed to monitor head injury patients.',
      },
      // Patient Education (3)
      {
        q: 'A patient with a fentanyl patch wants to use a heating pad on the patch site. The nurse should:',
        options: ['Allow it for comfort', 'Instruct patient to avoid heat near the patch', 'Move the patch first', 'Apply a second patch'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Heat increases fentanyl absorption from the patch, risking overdose. Never apply heat (heating pads, hot tubs, saunas) near a fentanyl patch.',
      },
      {
        q: 'How often should a transdermal fentanyl patch be replaced?',
        options: ['Every 24 hours', 'Every 48 hours', 'Every 72 hours', 'Every 96 hours'],
        correct: 2,
        cat: 'patient_ed',
        explanation: 'Fentanyl patches provide 72 hours (3 days) of pain relief. Rotate application sites and ensure skin is clean, dry, and hair-free.',
      },
      {
        q: 'What should the nurse teach an opioid patient about preventing constipation?',
        options: ['Take laxatives only when symptomatic', 'Increase fiber intake and fluid consumption prophylactically', 'Reduce food intake to decrease stool', 'Constipation resolves on its own'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Patients should increase fiber and fluids proactively, as opioid-induced constipation is nearly universal and does not resolve without intervention.',
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
      // MOA (3)
      {
        q: 'How does acetaminophen reduce pain and fever?',
        options: ['Blocks COX-2 enzymes peripherally', 'Inhibits the COX pathway centrally, reducing prostaglandin synthesis', 'Binds to opioid receptors in the CNS', 'Blocks sodium channels in pain fibers'],
        correct: 1,
        cat: 'moa',
        explanation: 'Acetaminophen inhibits the COX pathway centrally in the brain, decreasing prostaglandin synthesis to reduce pain and fever.',
      },
      {
        q: 'Unlike NSAIDs, acetaminophen does NOT:',
        options: ['Reduce fever', 'Reduce pain', 'Reduce inflammation', 'Come in oral form'],
        correct: 2,
        cat: 'moa',
        explanation: 'Acetaminophen has NO anti-inflammatory properties because it works centrally, not peripherally. It does not affect platelet function either.',
      },
      {
        q: 'The antidote acetylcysteine (Mucomyst) works by:',
        options: ['Blocking acetaminophen absorption', 'Replenishing glutathione to protect the liver', 'Increasing renal excretion of the drug', 'Neutralizing the drug in the stomach'],
        correct: 1,
        cat: 'moa',
        explanation: 'Acetylcysteine replenishes glutathione stores, which are needed to safely metabolize acetaminophen\'s toxic metabolites. Must be given within 8-10 hours.',
      },
      // Classification (2)
      {
        q: 'Acetaminophen is classified as a:',
        options: ['NSAID', 'Opioid analgesic', 'Non-opioid analgesic and antipyretic', 'Corticosteroid'],
        correct: 2,
        cat: 'classification',
        explanation: 'Acetaminophen is a non-opioid analgesic (pain reliever) and antipyretic (fever reducer). It is NOT an NSAID and has no anti-inflammatory action.',
      },
      {
        q: 'What is the antidote for acetaminophen overdose?',
        options: ['Naloxone', 'Acetylcysteine (Mucomyst)', 'Vitamin K', 'Flumazenil'],
        correct: 1,
        cat: 'classification',
        explanation: 'Acetylcysteine (Mucomyst) is the specific antidote. Memory aid: both start with "Acet-". It smells like rotten eggs!',
      },
      // Uses (2)
      {
        q: 'Acetaminophen is preferred over aspirin for treating fever in children because:',
        options: ['It is more effective', 'Aspirin carries a risk of Reye\'s syndrome in children', 'It also reduces inflammation', 'It has no side effects'],
        correct: 1,
        cat: 'uses',
        explanation: 'Aspirin is linked to Reye\'s syndrome in children with viral infections. Acetaminophen is the safe alternative for pediatric fever and flu symptoms.',
      },
      {
        q: 'Acetaminophen is appropriate for all of the following EXCEPT:',
        options: ['Mild-to-moderate pain', 'Fever reduction', 'Inflammatory joint swelling', 'Osteoarthritis pain'],
        correct: 2,
        cat: 'uses',
        explanation: 'Acetaminophen has NO anti-inflammatory effect. Inflammatory conditions like joint swelling require NSAIDs or other anti-inflammatory drugs.',
      },
      // Side Effects (3)
      {
        q: 'The most serious adverse effect of acetaminophen is:',
        options: ['GI bleeding', 'Hepatotoxicity', 'Nephrotoxicity', 'Ototoxicity'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'Hepatotoxicity (liver damage) is the most dangerous effect. High doses produce toxic metabolites that overwhelm glutathione stores and destroy liver cells.',
      },
      {
        q: 'Which signs indicate possible acetaminophen-induced liver damage?',
        options: ['Tinnitus and hearing loss', 'Jaundice, dark urine, and RUQ pain', 'Hematuria and flank pain', 'Petechiae and bruising'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'Jaundice (yellowing skin/eyes), dark urine, and right upper quadrant pain are classic signs of hepatotoxicity. Report immediately.',
      },
      {
        q: 'Why does chronic alcohol use increase acetaminophen toxicity risk?',
        options: ['Alcohol increases absorption', 'Alcohol depletes glutathione stores in the liver', 'Alcohol blocks renal excretion', 'Alcohol converts acetaminophen to aspirin'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'Chronic alcohol use depletes glutathione, which is essential for metabolizing acetaminophen\'s toxic metabolites safely.',
      },
      // Contraindications (2)
      {
        q: 'Acetaminophen is CONTRAINDICATED in a patient with:',
        options: ['Asthma', 'Liver disease', 'Diabetes', 'Hypertension'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Patients with liver disease cannot safely metabolize acetaminophen, dramatically increasing the risk of fatal hepatotoxicity.',
      },
      {
        q: 'What is the maximum recommended daily dose of acetaminophen?',
        options: ['1,000 mg', '2,000 mg', '3,000 mg', '5,000 mg'],
        correct: 2,
        cat: 'contraindications',
        explanation: 'The safe maximum is 3,000 mg/day (some sources say 4g, but 3g is the safer recommendation). Exceeding this risks hepatotoxicity.',
      },
      // Patient Education (3)
      {
        q: 'What is the MOST important teaching point for a patient taking acetaminophen?',
        options: ['Take on an empty stomach', 'Check ALL OTC medications for hidden acetaminophen', 'Take with grapefruit juice', 'Double the dose if pain persists'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Many OTC cold, flu, and sleep medications contain hidden acetaminophen. Taking multiple products can easily exceed the 3,000 mg/day limit.',
      },
      {
        q: 'A patient asks if they can have a glass of wine while taking Tylenol. The nurse should say:',
        options: ['"That\'s fine in moderation"', '"Avoid alcohol — it increases liver damage risk"', '"Only drink red wine"', '"Wait 30 minutes after taking Tylenol"'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Alcohol combined with acetaminophen significantly increases hepatotoxicity risk. Patients consuming >3 drinks/day should avoid acetaminophen.',
      },
      {
        q: 'Which patient statement shows understanding of acetaminophen safety?',
        options: ['"I can take as much as I need for pain"', '"I\'ll check my cold medicine to see if it already has Tylenol"', '"Tylenol is safe because it\'s over the counter"', '"I\'ll take it with my evening beer"'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Checking for hidden acetaminophen in combination products shows the patient understands the risk of unintentional overdose.',
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
      // MOA (3)
      {
        q: 'How do loop diuretics like furosemide produce their effect?',
        options: ['Block potassium channels in collecting duct', 'Inhibit Na+/Cl- reabsorption in the ascending loop of Henle', 'Inhibit carbonic anhydrase in proximal tubule', 'Block aldosterone receptors'],
        correct: 1,
        cat: 'moa',
        explanation: 'Loop diuretics inhibit Na+/Cl- reabsorption in the ascending loop of Henle, affecting 3 parts of the nephron. They are the most potent diuretics.',
      },
      {
        q: 'Where do thiazide diuretics act in the nephron?',
        options: ['Loop of Henle', 'Proximal convoluted tubule', 'Distal convoluted tubule', 'Collecting duct'],
        correct: 2,
        cat: 'moa',
        explanation: 'Thiazides inhibit Na+/Cl- reabsorption in the distal convoluted tubule. They are less potent than loop diuretics.',
      },
      {
        q: 'Which diuretic class is the MOST potent?',
        options: ['Thiazide diuretics', 'Potassium-sparing diuretics', 'Loop diuretics', 'Osmotic diuretics'],
        correct: 2,
        cat: 'moa',
        explanation: 'Loop diuretics are the most potent because they act on the loop of Henle, which handles a large percentage of sodium reabsorption.',
      },
      // Classification (2)
      {
        q: 'The suffix -mide (as in furosemide) identifies which drug class?',
        options: ['Thiazide diuretics', 'Loop diuretics', 'ACE inhibitors', 'Potassium-sparing diuretics'],
        correct: 1,
        cat: 'classification',
        explanation: 'The -mide/-nide suffix identifies loop diuretics: furosemide, bumetanide, torsemide. The -thiazide suffix identifies thiazides.',
      },
      {
        q: 'Which of the following is a thiazide diuretic?',
        options: ['Furosemide', 'Bumetanide', 'Hydrochlorothiazide (HCTZ)', 'Torsemide'],
        correct: 2,
        cat: 'classification',
        explanation: 'Hydrochlorothiazide (HCTZ) and chlorothiazide are thiazide diuretics, identified by the -thiazide suffix.',
      },
      // Uses (2)
      {
        q: 'Loop diuretics are the drug of choice for:',
        options: ['Mild hypertension alone', 'Acute pulmonary edema', 'Anxiety', 'Chronic pain'],
        correct: 1,
        cat: 'uses',
        explanation: 'Loop diuretics are the most potent and are first-line for acute pulmonary edema, heart failure, and severe fluid overload.',
      },
      {
        q: 'Diuretics are indicated for all of the following EXCEPT:',
        options: ['Heart failure', 'Hypertension', 'Peripheral edema', 'Hyperkalemia'],
        correct: 3,
        cat: 'uses',
        explanation: 'Loop and thiazide diuretics CAUSE hypokalemia (waste potassium). They are used for HTN, HF, edema, renal disease, and cirrhosis.',
      },
      // Side Effects (3)
      {
        q: 'A patient on furosemide has a K+ of 3.2 mEq/L. This indicates:',
        options: ['Normal potassium', 'Hyperkalemia', 'Hypokalemia', 'Hypernatremia'],
        correct: 2,
        cat: 'side_effects',
        explanation: 'Normal K+ is 3.5-5.0 mEq/L. A level of 3.2 indicates hypokalemia, a common and dangerous side effect of loop and thiazide diuretics.',
      },
      {
        q: '"Fast Furosemide = Fuzzy Hearing" refers to which side effect?',
        options: ['Nephrotoxicity', 'Hepatotoxicity', 'Ototoxicity', 'Cardiotoxicity'],
        correct: 2,
        cat: 'side_effects',
        explanation: 'Rapid IV administration of furosemide can cause ototoxicity (hearing loss/tinnitus). Always infuse slowly!',
      },
      {
        q: 'Which side effect is specific to thiazide diuretics?',
        options: ['Ototoxicity', 'Hyperuricemia leading to gout', 'Red Man Syndrome', 'QT prolongation'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'Thiazides can cause hyperuricemia (elevated uric acid) leading to gout, as well as photosensitivity and Stevens-Johnson Syndrome risk.',
      },
      // Contraindications (2)
      {
        q: 'Which patient should AVOID thiazide diuretics?',
        options: ['Patient with diabetes', 'Patient with sulfa allergy', 'Patient with obesity', 'Patient with anxiety'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Thiazides are sulfonamide derivatives. Patients with sulfa allergies should avoid them due to cross-reactivity risk.',
      },
      {
        q: 'Diuretics should be held if the patient has:',
        options: ['Mild edema', 'Severe hypokalemia (K+ < 3.0)', 'A normal blood pressure', 'Mild headache'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Severe hypokalemia is dangerous (cardiac arrhythmias). Diuretics that waste potassium should be held and the provider notified.',
      },
      // Patient Education (3)
      {
        q: 'When should diuretics be administered?',
        options: ['At bedtime', 'In the morning', 'With dinner', 'At midnight'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Give diuretics in the morning to avoid nocturia (excessive nighttime urination) that disrupts sleep.',
      },
      {
        q: 'What should the nurse teach a patient on furosemide about diet?',
        options: ['Avoid all fruits', 'Eat potassium-rich foods like bananas, oranges, and spinach', 'Restrict fluid intake severely', 'Increase sodium intake'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Loop and thiazide diuretics waste potassium. Patients should eat K+-rich foods (bananas, oranges, potatoes, spinach) to help prevent hypokalemia.',
      },
      {
        q: 'A patient on a thiazide diuretic asks about sun exposure. The nurse should advise:',
        options: ['"Sun exposure is fine"', '"Use sunscreen — thiazides cause photosensitivity"', '"Only avoid the sun if you have a rash"', '"Wear sunscreen only on cloudy days"'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Thiazide diuretics cause photosensitivity. Patients should use sunscreen and protective clothing when outdoors.',
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
      // MOA (3)
      {
        q: 'How does vancomycin kill bacteria?',
        options: ['Inhibits protein synthesis at 50S ribosome', 'Inhibits bacterial cell wall synthesis', 'Disrupts cell membrane permeability', 'Blocks folic acid synthesis'],
        correct: 1,
        cat: 'moa',
        explanation: 'Vancomycin is a glycopeptide antibiotic that inhibits bacterial cell wall synthesis, making it effective against gram-positive organisms.',
      },
      {
        q: 'Macrolide antibiotics work by:',
        options: ['Inhibiting cell wall synthesis', 'Inhibiting protein synthesis by binding to the 50S ribosomal subunit', 'Blocking DNA replication', 'Inhibiting folic acid synthesis'],
        correct: 1,
        cat: 'moa',
        explanation: 'Macrolides bind to the 50S ribosomal subunit, inhibiting bacterial protein synthesis. They are bacteriostatic at normal doses.',
      },
      {
        q: 'Red Man Syndrome is caused by:',
        options: ['Allergic reaction to vancomycin', 'Histamine release from too-rapid vancomycin infusion', 'Macrolide liver toxicity', 'Drug-drug interaction'],
        correct: 1,
        cat: 'moa',
        explanation: 'Red Man Syndrome is a histamine-mediated reaction from rapid vancomycin infusion — it is NOT a true allergy. Slow the infusion rate.',
      },
      // Classification (2)
      {
        q: 'The suffix -MYCIN indicates which drug class?',
        options: ['ACE inhibitors', 'Beta blockers', 'Macrolide antibiotics', 'Loop diuretics'],
        correct: 2,
        cat: 'classification',
        explanation: 'The -MYCIN suffix identifies macrolide antibiotics: azithromycin, clarithromycin, erythromycin.',
      },
      {
        q: 'Vancomycin belongs to which antibiotic class?',
        options: ['Macrolides', 'Fluoroquinolones', 'Glycopeptides', 'Aminoglycosides'],
        correct: 2,
        cat: 'classification',
        explanation: 'Vancomycin is a glycopeptide antibiotic, distinct from macrolides. It is the drug of choice for MRSA and C. diff (oral route).',
      },
      // Uses (2)
      {
        q: 'Vancomycin is the drug of choice for:',
        options: ['Urinary tract infections', 'MRSA and C. difficile infections', 'Viral pneumonia', 'Fungal skin infections'],
        correct: 1,
        cat: 'uses',
        explanation: 'Vancomycin is first-line for MRSA (IV) and C. difficile (oral). It is also used for serious bone and skin infections.',
      },
      {
        q: 'Macrolide antibiotics are commonly prescribed for:',
        options: ['MRSA infections', 'Upper respiratory tract infections and community-acquired pneumonia', 'Fungal infections', 'Tuberculosis'],
        correct: 1,
        cat: 'uses',
        explanation: 'Macrolides are used for URTI, community-acquired pneumonia, skin infections, ear/eye infections, and some cases of C. diff.',
      },
      // Side Effects (3)
      {
        q: 'A patient receiving IV vancomycin develops facial flushing, redness on the neck, and itching. The nurse should FIRST:',
        options: ['Administer epinephrine', 'Stop the infusion and notify the provider', 'Increase the infusion rate', 'Document as an expected finding'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'This describes Red Man Syndrome. Stop the infusion immediately — the infusion rate was likely too fast. It can be restarted at a slower rate.',
      },
      {
        q: 'Which serious side effect is associated with macrolide antibiotics?',
        options: ['Red Man Syndrome', 'Ototoxicity', 'QT prolongation and cardiac arrhythmias', 'Hypokalemia'],
        correct: 2,
        cat: 'side_effects',
        explanation: 'Macrolides can cause hepatotoxicity and QT prolongation leading to cardiac arrhythmias. Monitor ECG and report irregular heartbeats.',
      },
      {
        q: 'Vancomycin can cause nephrotoxicity. Which lab values should the nurse monitor?',
        options: ['AST and ALT', 'BUN and creatinine', 'INR and PT', 'WBC and platelets'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'Vancomycin is nephrotoxic. Monitor BUN and creatinine, along with peak (20-40) and trough (5-15) drug levels.',
      },
      // Contraindications (2)
      {
        q: 'Macrolide antibiotics should be used with CAUTION in patients with:',
        options: ['Diabetes', 'Liver disease and QT prolongation', 'Hypertension', 'Obesity'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Macrolides are hepatotoxic and can prolong the QT interval. They should be avoided or used cautiously in liver disease and cardiac conduction disorders.',
      },
      {
        q: 'Vancomycin dosing must be adjusted in patients with:',
        options: ['Hypertension', 'Renal impairment', 'Diabetes', 'Obesity'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Vancomycin is nephrotoxic and excreted by the kidneys. Dose adjustment is required in renal impairment to prevent toxicity.',
      },
      // Patient Education (3)
      {
        q: 'Vancomycin > 1 gm should be infused over at least:',
        options: ['30 minutes', '60 minutes', '100 minutes', '120 minutes'],
        correct: 2,
        cat: 'patient_ed',
        explanation: 'Vancomycin > 1 gm should be infused over at least 100 minutes. Doses < 1 gm require at least 60 minutes to prevent Red Man Syndrome.',
      },
      {
        q: 'The therapeutic trough level for vancomycin is:',
        options: ['1-5 mcg/mL', '5-15 mcg/mL', '20-40 mcg/mL', '40-60 mcg/mL'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Vancomycin trough should be 5-15 mcg/mL (drawn 30 min before next dose). Peak should be 20-40 mcg/dL.',
      },
      {
        q: 'What should the nurse teach a patient about antibiotic therapy?',
        options: ['Stop when symptoms improve', 'Complete the full course even if feeling better', 'Take only when in pain', 'Skip doses if side effects occur'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Completing the full course prevents antibiotic resistance and ensures the infection is fully eradicated.',
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
      // MOA (2)
      {
        q: 'Heparin produces its anticoagulant effect by:',
        options: ['Inhibiting vitamin K-dependent clotting factors', 'Activating antithrombin III to prevent thrombin activation', 'Dissolving existing blood clots', 'Blocking platelet aggregation'],
        correct: 1,
        cat: 'moa',
        explanation: 'Heparin activates antithrombin III, which prevents thrombin activation and clot formation. It does NOT dissolve existing clots.',
      },
      {
        q: 'Warfarin works by:',
        options: ['Activating antithrombin III', 'Inhibiting vitamin K-dependent clotting factors (II, VII, IX, X)', 'Dissolving existing clots directly', 'Blocking platelet receptors'],
        correct: 1,
        cat: 'moa',
        explanation: 'Warfarin inhibits synthesis of vitamin K-dependent clotting factors II, VII, IX, and X. Memory aid: "1972" for the factor numbers.',
      },
      // Classification (2)
      {
        q: 'Which lab value monitors heparin therapy?',
        options: ['PT/INR', 'aPTT', 'CBC', 'BMP'],
        correct: 1,
        cat: 'classification',
        explanation: 'Heparin is monitored by aPTT (activated Partial Thromboplastin Time). Therapeutic range: 47-70 seconds. Remember: H before W, a before I (alphabetical).',
      },
      {
        q: 'Warfarin therapy is monitored by:',
        options: ['aPTT', 'PT/INR', 'CBC', 'D-dimer'],
        correct: 1,
        cat: 'classification',
        explanation: 'Warfarin is monitored by PT/INR. Therapeutic INR: 2-3 (or 2.5-3.5 for mechanical heart valves).',
      },
      // Uses (2)
      {
        q: 'Anticoagulants are used for all of the following EXCEPT:',
        options: ['DVT prevention', 'A-fib prophylaxis', 'Dissolving existing clots', 'PE prevention'],
        correct: 2,
        cat: 'uses',
        explanation: 'Anticoagulants prevent NEW clot formation and stop existing clots from growing, but they do NOT dissolve existing clots. Thrombolytics do that.',
      },
      {
        q: 'A patient with a mechanical heart valve requires which INR range?',
        options: ['1.0-1.5', '2.0-3.0', '2.5-3.5', '4.0-5.0'],
        correct: 2,
        cat: 'uses',
        explanation: 'Mechanical heart valve patients need a higher INR target of 2.5-3.5 due to increased clot risk. Standard INR target is 2-3.',
      },
      // Side Effects (3)
      {
        q: 'A patient on warfarin has an INR of 5.2. The nurse should:',
        options: ['Administer the next dose', 'Hold warfarin and notify provider immediately', 'Increase the dose', 'Give vitamin K foods'],
        correct: 1,
        cat: 'side_effects',
        explanation: '"Numbers HIGH = Patients DIE." An INR of 5.2 is critically elevated (normal therapeutic: 2-3), indicating high bleeding risk.',
      },
      {
        q: 'Which finding indicates a patient on anticoagulants is BLEEDING internally?',
        options: ['Elevated temperature', 'Coffee-ground emesis and melena (black tarry stool)', 'Increased appetite', 'Joint stiffness'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'Coffee-ground emesis (GI bleeding) and melena (blood in stool) are signs of internal bleeding. Also watch for hematuria, petechiae, and bruising.',
      },
      {
        q: 'Heparin-Induced Thrombocytopenia (HIT) is characterized by:',
        options: ['Elevated platelet count', 'Dangerously low platelet count triggered by heparin', 'Elevated INR', 'Liver failure'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'HIT is a serious immune reaction to heparin causing platelet count to drop, paradoxically increasing clot risk. Stop heparin immediately.',
      },
      // Contraindications (2)
      {
        q: 'Anticoagulants are CONTRAINDICATED in a patient with:',
        options: ['A-fib', 'Active GI bleeding', 'DVT', 'Mechanical heart valve'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Active bleeding is an absolute contraindication for anticoagulants. Other contraindications include thrombocytopenia and recent surgery.',
      },
      {
        q: 'A patient scheduled for surgery in 2 days is on warfarin. The nurse anticipates:',
        options: ['Continuing warfarin as usual', 'Holding warfarin due to surgical bleeding risk', 'Doubling the warfarin dose', 'Adding heparin on top of warfarin'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Warfarin is typically held before surgery to reduce bleeding risk. The surgeon will specify when to stop based on INR.',
      },
      // Patient Education (4)
      {
        q: 'When administering heparin SubQ, the nurse should:',
        options: ['Massage the site after injection', 'Inject 2 inches from umbilicus at 90°, do NOT massage', 'Inject in the deltoid at 45°', 'Apply heat to the injection site'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Heparin SubQ is given in the abdomen, 2 inches from the umbilicus, at a 90° angle. Never massage — this causes bruising and hematoma.',
      },
      {
        q: 'A patient on warfarin asks about diet. The correct advice is:',
        options: ['Avoid all vitamin K foods', 'Eat as much vitamin K as desired', 'Maintain CONSISTENT vitamin K intake', 'Take vitamin K supplements'],
        correct: 2,
        cat: 'patient_ed',
        explanation: 'Patients don\'t need to avoid vitamin K — they need to keep intake CONSISTENT so warfarin dosing remains stable.',
      },
      {
        q: 'Which statement indicates a patient understands bleeding precautions?',
        options: ['"I\'ll use my regular razor"', '"I can take ibuprofen for headaches"', '"I\'ll use a soft toothbrush and electric razor"', '"I\'ll continue playing football"'],
        correct: 2,
        cat: 'patient_ed',
        explanation: 'Soft toothbrush and electric razor reduce bleeding risk. Avoid blade razors, NSAIDs/aspirin, alcohol, flossing, and contact sports.',
      },
      {
        q: 'A patient on heparin develops bruising, petechiae, and blood in the urine. The nurse interprets this as:',
        options: ['Normal side effects that require monitoring only', 'Signs of over-anticoagulation requiring immediate intervention', 'An allergic reaction to heparin', 'Heparin-Induced Thrombocytopenia'],
        correct: 1,
        cat: 'side_effects',
        explanation: '"Numbers HIGH = Patients DIE." Bruising, petechiae, and hematuria indicate excessive anticoagulation and bleeding. Hold the drug and notify the provider.',
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
      // MOA (3)
      {
        q: 'How do ACE inhibitors lower blood pressure?',
        options: ['Block beta-adrenergic receptors', 'Block conversion of angiotensin I to angiotensin II', 'Inhibit Na+/Cl- reabsorption in the nephron', 'Block calcium channels in smooth muscle'],
        correct: 1,
        cat: 'moa',
        explanation: 'ACE inhibitors block angiotensin-converting enzyme, preventing formation of angiotensin II (a potent vasoconstrictor), reducing BP and aldosterone.',
      },
      {
        q: 'How do ARBs differ from ACE inhibitors in their mechanism?',
        options: ['ARBs block the ACE enzyme', 'ARBs block angiotensin II at the receptor site', 'ARBs inhibit renin release', 'ARBs block aldosterone synthesis'],
        correct: 1,
        cat: 'moa',
        explanation: 'ARBs block angiotensin II at its receptor, achieving the same effect as ACE inhibitors but without affecting bradykinin — so no dry cough.',
      },
      {
        q: 'Why do ACE inhibitors cause a dry cough but ARBs do not?',
        options: ['ACE inhibitors cause bradykinin accumulation in the lungs', 'ARBs are stronger drugs', 'ACE inhibitors irritate the stomach', 'ARBs block cough receptors'],
        correct: 0,
        cat: 'moa',
        explanation: 'ACE inhibitors prevent breakdown of bradykinin, which accumulates in the lungs and triggers a dry cough. ARBs don\'t affect bradykinin metabolism.',
      },
      // Classification (2)
      {
        q: 'The suffix -PRIL indicates which drug class?',
        options: ['ARBs', 'Beta blockers', 'ACE inhibitors', 'Diuretics'],
        correct: 2,
        cat: 'classification',
        explanation: 'The -PRIL suffix identifies ACE inhibitors: captopril, enalapril, lisinopril, ramipril, fosinopril.',
      },
      {
        q: 'Which suffix identifies ARBs?',
        options: ['-pril', '-olol', '-sartan', '-mide'],
        correct: 2,
        cat: 'classification',
        explanation: 'The -SARTAN suffix identifies ARBs: losartan, valsartan, olmesartan, candesartan, azilsartan.',
      },
      // Uses (2)
      {
        q: 'ACE inhibitors provide renal protection in patients with:',
        options: ['Asthma', 'Diabetic nephropathy', 'GERD', 'Migraines'],
        correct: 1,
        cat: 'uses',
        explanation: 'ACE inhibitors (and ARBs) are renoprotective in diabetes. They reduce intraglomerular pressure and slow progression of diabetic kidney disease.',
      },
      {
        q: 'A patient on lisinopril reports a persistent dry cough. The nurse should:',
        options: ['Administer cough suppressant', 'Notify provider — may switch to an ARB', 'Tell patient it will resolve', 'Discontinue the medication'],
        correct: 1,
        cat: 'uses',
        explanation: 'Dry cough is a common ACE side effect. The provider may switch to an ARB (-sartan), which has similar benefits but doesn\'t cause cough.',
      },
      // Side Effects (3)
      {
        q: 'A patient on enalapril has facial and tongue swelling. This is:',
        options: ['An expected side effect', 'Angioedema — an emergency', 'Allergic rhinitis', 'Normal first-dose reaction'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'Angioedema (swelling of face/mouth/throat) is a life-threatening emergency. Stop the medication immediately and ensure airway protection.',
      },
      {
        q: 'Which electrolyte imbalance is associated with ACE inhibitors?',
        options: ['Hypokalemia', 'Hyperkalemia', 'Hyponatremia', 'Hypercalcemia'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'ACE inhibitors reduce aldosterone secretion, which decreases potassium excretion → hyperkalemia. The mnemonic: A-C-E = Angioedema, Cough, Elevate K+.',
      },
      {
        q: 'The ACE inhibitor side effect mnemonic "A-C-E" stands for:',
        options: ['Anxiety, Constipation, Edema', 'Angioedema, Cough, Elevate K+', 'Anemia, Cramps, Exhaustion', 'Appetite loss, Chills, Epistaxis'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'A = Angioedema (emergency), C = Cough (dry, persistent), E = Elevate K+ (hyperkalemia). These are the key side effects to monitor.',
      },
      // Contraindications (2)
      {
        q: 'ACE inhibitors and ARBs are absolutely contraindicated in:',
        options: ['Diabetes', 'Heart failure', 'Pregnancy', 'Hypertension'],
        correct: 2,
        cat: 'contraindications',
        explanation: 'ACE inhibitors and ARBs are TERATOGENIC — they can cause severe fetal harm and are absolutely contraindicated in pregnancy.',
      },
      {
        q: 'A patient with bilateral renal artery stenosis should NOT receive ACE inhibitors because:',
        options: ['They cause renal stones', 'They can cause acute renal failure in this condition', 'They increase urine output too much', 'They cause bladder spasms'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'In bilateral renal artery stenosis, the kidneys depend on angiotensin II to maintain filtration. Blocking it with ACE/ARBs can cause acute renal failure.',
      },
      // Patient Education (3)
      {
        q: 'What should the nurse teach about stopping ACE inhibitors?',
        options: ['Stop whenever you feel better', 'Do NOT stop suddenly — rebound hypertension can occur', 'Only take when blood pressure is high', 'Stop if you get a cough'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Abrupt discontinuation can cause dangerous rebound hypertension. Always taper under provider guidance.',
      },
      {
        q: 'A patient on lisinopril should be taught to avoid:',
        options: ['Bananas and orange juice', 'Potassium salt substitutes and K+ supplements', 'Calcium-rich foods', 'Iron supplements'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'ACE inhibitors elevate potassium levels. Adding K+ supplements or salt substitutes (which contain KCl) can cause dangerous hyperkalemia.',
      },
      {
        q: 'Which lab values should be monitored for a patient on ACE inhibitors?',
        options: ['INR and PT', 'BUN (7-20), Creatinine (0.6-1.2), and K+ levels', 'AST and ALT', 'TSH and T4'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Monitor renal function (BUN, creatinine) and potassium levels. ACE inhibitors affect the kidneys and can cause hyperkalemia.',
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
      // MOA (3)
      {
        q: 'How does heparin differ from warfarin in onset of action?',
        options: ['Both have slow onset', 'Heparin = rapid onset (minutes); Warfarin = slow onset (24-72 hours)', 'Warfarin acts faster than heparin', 'Both act within minutes'],
        correct: 1,
        cat: 'moa',
        explanation: '"Heparin is in a Hurry" (rapid, minutes) vs "Warfarin makes you Wait" (slow, 24-72 hours for full effect).',
      },
      {
        q: 'Warfarin interferes with which clotting factors?',
        options: ['I, III, V, VIII', 'II, VII, IX, X', 'XI, XII, XIII', 'All clotting factors'],
        correct: 1,
        cat: 'moa',
        explanation: 'Warfarin inhibits vitamin K-dependent clotting factors: II, VII, IX, and X. Memory aid: "1972" (10, 9, 7, 2).',
      },
      {
        q: 'What is bridge therapy?',
        options: ['Using two antibiotics simultaneously', 'Starting heparin and warfarin together, then stopping heparin once INR is therapeutic', 'Switching from one anticoagulant to another abruptly', 'Using anticoagulants only during hospitalization'],
        correct: 1,
        cat: 'moa',
        explanation: 'Bridge therapy starts heparin (fast-acting) while beginning warfarin (slow onset). Once the INR reaches therapeutic range, heparin is discontinued.',
      },
      // Classification (2)
      {
        q: 'What is the antidote for heparin?',
        options: ['Vitamin K', 'Naloxone', 'Protamine sulfate', 'Acetylcysteine'],
        correct: 2,
        cat: 'classification',
        explanation: 'Protamine sulfate binds to heparin and neutralizes it. Memory: "P for P" (Protamine for... well, Protamine for heparin).',
      },
      {
        q: 'What is the antidote for warfarin?',
        options: ['Protamine sulfate', 'Vitamin K (phytonadione)', 'Naloxone', 'Flumazenil'],
        correct: 1,
        cat: 'classification',
        explanation: 'Vitamin K restores the clotting factors that warfarin blocks. It is the specific reversal agent for warfarin toxicity.',
      },
      // Uses (2)
      {
        q: 'Which anticoagulant is used for LONG-TERM outpatient therapy?',
        options: ['Heparin IV', 'Heparin SubQ', 'Warfarin (oral)', 'Both equally'],
        correct: 2,
        cat: 'uses',
        explanation: 'Warfarin is oral and used long-term (outpatient). Heparin is IV/SubQ and used short-term (inpatient) or as a bridge to warfarin.',
      },
      {
        q: 'Bridge therapy is used because:',
        options: ['Heparin is cheaper', 'Warfarin takes 24-72 hours to become effective, so heparin covers the gap', 'Both drugs treat different clots', 'Warfarin cannot be given in the hospital'],
        correct: 1,
        cat: 'uses',
        explanation: 'Warfarin\'s slow onset means the patient is unprotected for 24-72 hours. Heparin provides immediate anticoagulation during this gap.',
      },
      // Side Effects (2)
      {
        q: 'Which complication is unique to heparin therapy?',
        options: ['Skin necrosis', 'Heparin-Induced Thrombocytopenia (HIT)', 'Teratogenicity', 'Vitamin K depletion'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'HIT is a serious immune-mediated reaction specific to heparin that causes paradoxical clotting despite low platelets. Monitor platelet counts.',
      },
      {
        q: 'Which statement about warfarin and pregnancy is correct?',
        options: ['Warfarin is safe in pregnancy', 'Warfarin is TERATOGENIC and must be avoided in pregnancy', 'Warfarin is preferred over heparin in pregnancy', 'Both drugs are equally safe'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'Warfarin crosses the placenta and is teratogenic. Heparin does NOT cross the placenta and is safe in pregnancy.',
      },
      // Contraindications (2)
      {
        q: 'Which anticoagulant is SAFE to use during pregnancy?',
        options: ['Warfarin', 'Heparin', 'Both are safe', 'Neither is safe'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Heparin does not cross the placenta and is safe in pregnancy. Warfarin is TERATOGENIC and absolutely contraindicated.',
      },
      {
        q: 'A patient on warfarin is found to have an active GI bleed. The nurse should anticipate:',
        options: ['Continuing warfarin at a lower dose', 'Holding warfarin and administering vitamin K', 'Increasing the warfarin dose', 'Switching to heparin'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Active bleeding requires stopping the anticoagulant and giving the antidote (vitamin K for warfarin) to restore clotting ability.',
      },
      // Patient Education (4)
      {
        q: '"Heparin is in a Hurry" means:',
        options: ['It should be given quickly', 'It has a rapid onset of action (minutes)', 'It wears off slowly', 'It should be rushed to the patient'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Heparin has a rapid onset (minutes) via IV/SubQ. "Hurry" = fast acting. Compare: "Warfarin makes you Wait" (24-72 hours, PO).',
      },
      {
        q: 'When giving heparin SubQ, the correct technique is:',
        options: ['Inject in the deltoid and massage afterward', 'Inject in the abdomen, 2 inches from umbilicus, at 90° — do NOT massage', 'Inject in the thigh at 45° and massage', 'Inject anywhere convenient'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Heparin SubQ goes in the belly, 2 inches from the umbilicus, at 90°. Never massage the site — it causes bruising and hematoma.',
      },
      {
        q: 'A patient asks why they need to wear a medical alert bracelet while on warfarin. The best response is:',
        options: ['"It helps us track your medication"', '"In an emergency, providers need to know you\'re on a blood thinner to manage bleeding risk"', '"It\'s optional, really"', '"It reminds you to take your medication"'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'In emergencies, knowing a patient is anticoagulated is critical for managing bleeding and making surgical decisions.',
      },
      {
        q: 'Heparin is given IV/SubQ while warfarin is given PO. Which statement about their routes is correct?',
        options: ['Warfarin can also be given IV', 'Heparin is destroyed by gastric acid and cannot be given orally', 'Both can be given by any route', 'Heparin is only given IV, never SubQ'],
        correct: 1,
        cat: 'classification',
        explanation: 'Heparin is a large molecule destroyed by the GI tract, so it must be given parenterally (IV or SubQ). Warfarin is well-absorbed orally.',
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
      // MOA (3)
      {
        q: 'How do beta blockers produce their therapeutic effects?',
        options: ['Block calcium channels in smooth muscle', 'Block beta-adrenergic receptors, reducing HR, BP, and myocardial O2 demand', 'Inhibit ACE enzyme', 'Stimulate alpha receptors'],
        correct: 1,
        cat: 'moa',
        explanation: 'Beta blockers block adrenaline/norepinephrine at beta-adrenergic receptors → ↓HR, ↓BP, ↓cardiac workload and oxygen demand.',
      },
      {
        q: 'What is the difference between selective (B1) and non-selective beta blockers?',
        options: ['Selective only affect the kidneys', 'Selective primarily affect the heart (B1); non-selective also affect lungs (B2)', 'Non-selective are safer for asthmatics', 'There is no clinical difference'],
        correct: 1,
        cat: 'moa',
        explanation: 'B1-selective (AMEN) mainly affect the heart. Non-selective (PTN) also block B2 in the lungs → risk of bronchoconstriction in asthmatics.',
      },
      {
        q: 'Mixed alpha-beta blockers (carvedilol, labetalol) provide additional:',
        options: ['Bronchodilation', 'Vasodilation through alpha-1 blockade', 'Increased heart rate', 'Diuretic effect'],
        correct: 1,
        cat: 'moa',
        explanation: 'Mixed blockers (CL = Carvedilol, Labetalol) block alpha-1 receptors in addition to beta receptors, providing additional vasodilation.',
      },
      // Classification (2)
      {
        q: 'The suffix -OLOL indicates which drug class?',
        options: ['ACE inhibitors', 'ARBs', 'Beta blockers', 'Calcium channel blockers'],
        correct: 2,
        cat: 'classification',
        explanation: 'The -OLOL suffix identifies beta blockers: metoprolol, atenolol, propranolol, carvedilol, labetalol, etc.',
      },
      {
        q: 'The mnemonic "AMEN" for selective B1 beta blockers stands for:',
        options: ['Aspirin, Metformin, Enalapril, Naproxen', 'Atenolol, Metoprolol, Esmolol, Nebivolol', 'Amiodarone, Morphine, Epinephrine, Nifedipine', 'Acebutolol, Metoprolol, Esmolol, Nadolol'],
        correct: 1,
        cat: 'classification',
        explanation: 'AMEN = Atenolol, Metoprolol, Esmolol, Nebivolol. These are B1-selective (cardioselective) beta blockers.',
      },
      // Uses (2)
      {
        q: 'Beta blockers are used for all of the following EXCEPT:',
        options: ['Hypertension and tachycardia', 'Asthma and COPD', 'Angina and A-fib', 'Migraine prophylaxis'],
        correct: 1,
        cat: 'uses',
        explanation: 'Beta blockers are CONTRAINDICATED in asthma (non-selective cause bronchoconstriction). They are used for HTN, tachycardia, angina, A-fib, HF, anxiety, and migraines.',
      },
      {
        q: 'A patient with performance anxiety may be prescribed a beta blocker because it:',
        options: ['Causes euphoria', 'Reduces physical symptoms of anxiety (racing heart, tremor)', 'Increases serotonin', 'Sedates the patient'],
        correct: 1,
        cat: 'uses',
        explanation: 'Beta blockers reduce the physical manifestations of anxiety (tachycardia, tremor, sweating) by blocking adrenergic stimulation.',
      },
      // Side Effects (3)
      {
        q: 'The "4 B\'s" of beta blocker side effects are:',
        options: ['Bleeding, Bruising, Burns, Blisters', 'Bradycardia, Breathing problems, Blood sugar masking, BP drop', 'Bradycardia, Bloating, Blurred vision, Bone loss', 'Burning, Bleeding, Bronchitis, Baldness'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'The 4 B\'s: Bradycardia, Breathing problems (bronchoconstriction), Blood sugar masking (hides hypoglycemia in diabetics), Blood pressure drop.',
      },
      {
        q: 'Why are beta blockers dangerous for diabetic patients?',
        options: ['They cause hyperglycemia', 'They mask signs of hypoglycemia (tachycardia, tremor)', 'They increase insulin resistance', 'They interact with metformin'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'Beta blockers mask the early warning signs of hypoglycemia (tachycardia, tremor, sweating), so diabetics may not recognize dangerously low blood sugar.',
      },
      {
        q: 'Why is abrupt discontinuation of beta blockers dangerous?',
        options: ['Causes liver failure', 'Causes rebound hypertension and tachycardia', 'Causes kidney damage', 'Causes allergic reaction'],
        correct: 1,
        cat: 'side_effects',
        explanation: 'Stopping beta blockers suddenly can cause rebound hypertension, tachycardia, and even angina or MI. Always taper gradually.',
      },
      // Contraindications (2)
      {
        q: 'Beta blockers are CONTRAINDICATED in patients with:',
        options: ['Hypertension', 'Atrial fibrillation', 'Asthma (non-selective)', 'Anxiety'],
        correct: 2,
        cat: 'contraindications',
        explanation: 'Non-selective beta blockers block B2 in lungs → bronchoconstriction. BAN for asthmatics: Beta blockers, Aspirin, NSAIDs.',
      },
      {
        q: 'Before administering a beta blocker, the nurse should hold the medication if:',
        options: ['Temperature > 100.4°F', 'Heart rate < 60 bpm or systolic BP < 90 mmHg', 'Respiratory rate > 20', 'Blood glucose > 200 mg/dL'],
        correct: 1,
        cat: 'contraindications',
        explanation: 'Hold beta blockers if HR < 60 (risk of severe bradycardia) or SBP < 90 (risk of dangerous hypotension). Notify the provider.',
      },
      // Patient Education (3)
      {
        q: 'What should the nurse teach a patient starting a beta blocker?',
        options: ['Stop the medication if side effects occur', 'Do NOT stop suddenly — taper gradually to prevent rebound HTN/tachycardia', 'Take double doses if you miss one', 'Only take when blood pressure is high'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Abrupt discontinuation causes dangerous rebound effects. Patients must taper the dose under provider supervision.',
      },
      {
        q: 'A diabetic patient on metoprolol should be taught to:',
        options: ['Stop checking blood glucose', 'Monitor blood glucose closely — beta blockers mask hypoglycemia signs', 'Increase carbohydrate intake', 'Take extra insulin with each dose'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'Beta blockers mask tachycardia and tremor (early signs of hypoglycemia). Diabetic patients must monitor glucose more frequently.',
      },
      {
        q: 'The "BAN" mnemonic for asthmatics means avoid:',
        options: ['Benzodiazepines, Acetaminophen, Nitrates', 'Beta blockers, Aspirin, NSAIDs', 'Barbiturates, Antihistamines, Narcotics', 'Blood thinners, Antibiotics, Nasal sprays'],
        correct: 1,
        cat: 'patient_ed',
        explanation: 'BAN = Beta blockers (bronchoconstriction), Aspirin (bronchospasm), NSAIDs (bronchospasm). All can worsen asthma symptoms.',
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

const CAT_LABELS = {
  moa: { label: 'Mechanism of Action', icon: '⚙️', short: 'MOA' },
  classification: { label: 'Classification', icon: '📋', short: 'Class' },
  uses: { label: 'Therapeutic Uses', icon: '💊', short: 'Uses' },
  side_effects: { label: 'Side Effects', icon: '⚠️', short: 'Side Fx' },
  contraindications: { label: 'Contraindications', icon: '🚫', short: 'Contra' },
  patient_ed: { label: 'Patient Education', icon: '📚', short: 'Pt Ed' },
};

const CAT_COLORS = {
  moa: '#6366f1',
  classification: '#8b5cf6',
  uses: '#3b82f6',
  side_effects: '#ef4444',
  contraindications: '#f59e0b',
  patient_ed: '#10b981',
};

function Quiz({ lesson, onComplete }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [catScores, setCatScores] = useState({});
  const [finished, setFinished] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const allQuestions = lesson.quiz;
  const questions = useMemo(() => {
    if (filterCat === 'all') return allQuestions;
    return allQuestions.filter((q) => q.cat === filterCat);
  }, [allQuestions, filterCat]);

  const current = questions[qIdx];

  const handleSelect = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === current.correct) {
      setScore((s) => s + 1);
      setCatScores((prev) => ({ ...prev, [current.cat]: (prev[current.cat] || 0) + 1 }));
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
    setCatScores({});
    setFinished(false);
  }, []);

  const handleFilterChange = useCallback((cat) => {
    setFilterCat(cat);
    setQIdx(0);
    setSelected(null);
    setScore(0);
    setCatScores({});
    setFinished(false);
  }, []);

  const catFilterBtns = useMemo(() => {
    const cats = ['all', ...Object.keys(CAT_LABELS)];
    return cats.map((cat) => {
      const isActive = filterCat === cat;
      const label = cat === 'all' ? 'All' : CAT_LABELS[cat].short;
      const catColor = cat === 'all' ? lesson.color : CAT_COLORS[cat];
      return (
        <button
          key={cat}
          onClick={() => handleFilterChange(cat)}
          style={{
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 600,
            border: `1.5px solid ${catColor}`,
            borderRadius: 14,
            background: isActive ? catColor : 'transparent',
            color: isActive ? '#fff' : catColor,
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {cat !== 'all' && CAT_LABELS[cat].icon + ' '}{label}
        </button>
      );
    });
  }, [filterCat, lesson.color, handleFilterChange]);

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    // Category breakdown
    const catCounts = {};
    questions.forEach((q) => { catCounts[q.cat] = (catCounts[q.cat] || 0) + 1; });
    return (
      <div style={styles.quizContainer}>
        <div style={styles.scoreBox(lesson.color)}>
          <div style={styles.scoreNum(lesson.color)}>{score}/{questions.length}</div>
          <div style={{ fontSize: 16, color: '#475569', fontWeight: 600 }}>
            {pct >= 80 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good job!' : '📖 Keep studying!'}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{pct}% correct</div>
          <div style={{ marginTop: 12, textAlign: 'left' }}>
            {Object.entries(catCounts).map(([cat, total]) => {
              const got = catScores[cat] || 0;
              const c = CAT_COLORS[cat] || lesson.color;
              return (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', fontSize: 12 }}>
                  <span style={{ color: c, fontWeight: 600 }}>{CAT_LABELS[cat]?.icon} {CAT_LABELS[cat]?.short || cat}</span>
                  <span style={{ fontWeight: 700, color: got === total ? '#10b981' : '#475569' }}>{got}/{total}</span>
                </div>
              );
            })}
          </div>
          {pct < 100 && (
            <button style={{ ...styles.nextBtn(lesson.color), marginTop: 12 }} onClick={handleRetry}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={styles.quizContainer}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>{catFilterBtns}</div>
        <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No questions in this category.</div>
      </div>
    );
  }

  const catInfo = current.cat && CAT_LABELS[current.cat];
  const catColor = current.cat && CAT_COLORS[current.cat];

  return (
    <div style={styles.quizContainer}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>{catFilterBtns}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={styles.questionNum(lesson.color)}>
          Question {qIdx + 1} of {questions.length}
        </div>
        {catInfo && (
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 10,
            background: catColor + '20',
            color: catColor,
            border: `1px solid ${catColor}40`,
          }}>
            {catInfo.icon} {catInfo.short}
          </span>
        )}
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

/* ───────────────────────── Flashcards ───────────────────────── */

function buildFlashcards(lesson) {
  const cards = [];
  const title = lesson.title;
  // 1. MOA
  cards.push({
    cat: 'moa',
    front: `How does ${title} work?`,
    back: lesson.moa,
  });
  // 2. Classification
  const classInfo = lesson.classification;
  cards.push({
    cat: 'classification',
    front: `What class is ${title}? Suffix?`,
    back: classInfo.drugs.join('\n') + (classInfo.suffix ? `\n\nSuffix: ${classInfo.suffix}` : '') + `\n\n${classInfo.note}`,
  });
  // 3. Uses
  cards.push({
    cat: 'uses',
    front: `When do you give ${title}?`,
    back: lesson.uses.map((u) => `• ${u}`).join('\n'),
  });
  // 4. Side Effects
  cards.push({
    cat: 'side_effects',
    front: `What are ${title}'s side effects?`,
    back: lesson.sideEffects.map((s) => `${s.highlight ? '⚡ ' : '• '}${s.text}`).join('\n'),
  });
  // 5. Contraindications
  const contraItems = lesson.nursing.filter((n) =>
    /contraindicated|avoid|hold|allerg|do not|don't/i.test(n)
  );
  const contraText = contraItems.length > 0
    ? contraItems.map((c) => `• ${c}`).join('\n')
    : lesson.nursing.slice(0, 3).map((c) => `• ${c}`).join('\n');
  cards.push({
    cat: 'contraindications',
    front: `Who should NOT get ${title}?`,
    back: contraText,
  });
  // 6. Patient Education
  let peText = lesson.patientEd.map((p) => `• ${p}`).join('\n');
  if (lesson.antidote) {
    peText += `\n\n💉 Antidote: ${lesson.antidote.name}\n${lesson.antidote.note}`;
  }
  cards.push({
    cat: 'patient_ed',
    front: `What do you teach about ${title}?`,
    back: peText,
  });
  return cards;
}

function Flashcards({ lesson }) {
  const allCards = useMemo(() => buildFlashcards(lesson), [lesson]);
  const [deck, setDeck] = useState(() => [...allCards]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [reviewOnly, setReviewOnly] = useState(false);
  const [autoFlip, setAutoFlip] = useState(false);

  // Shuffle utility
  const shuffle = useCallback((arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);

  const activeDeck = useMemo(() => {
    if (reviewOnly) return deck.filter((_, i) => !known.has(i));
    return deck;
  }, [deck, known, reviewOnly]);

  // Map active index back to deck index for known tracking
  const activeToDeckIdx = useMemo(() => {
    if (reviewOnly) {
      return deck.map((_, i) => i).filter((i) => !known.has(i));
    }
    return deck.map((_, i) => i);
  }, [deck, known, reviewOnly]);

  const current = activeDeck[idx];
  const deckIdx = activeToDeckIdx[idx];

  // Auto-flip timer
  React.useEffect(() => {
    if (!autoFlip || !current) return;
    const timer = setInterval(() => {
      setFlipped((f) => {
        if (f) {
          // Was showing back, go to next card
          setIdx((i) => (i + 1 < activeDeck.length ? i + 1 : 0));
          return false;
        }
        return true;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [autoFlip, current, activeDeck.length]);

  const handleKnow = useCallback(() => {
    setKnown((prev) => { const n = new Set(prev); n.add(deckIdx); return n; });
    setFlipped(false);
    if (idx + 1 >= activeDeck.length) {
      // If review mode and all done or last card
      setIdx(0);
    } else {
      setIdx((i) => i);
    }
    // Small delay to let state settle
    setTimeout(() => {
      setIdx((i) => (i < activeDeck.length - 1 ? i : 0));
    }, 50);
  }, [deckIdx, idx, activeDeck.length]);

  const handleStudyAgain = useCallback(() => {
    setKnown((prev) => { const n = new Set(prev); n.delete(deckIdx); return n; });
    setFlipped(false);
    setIdx((i) => (i + 1 < activeDeck.length ? i + 1 : 0));
  }, [deckIdx, activeDeck.length]);

  const handleShuffle = useCallback(() => {
    setDeck(shuffle(allCards));
    setIdx(0);
    setFlipped(false);
    setKnown(new Set());
  }, [allCards, shuffle]);

  const handleReset = useCallback(() => {
    setDeck([...allCards]);
    setIdx(0);
    setFlipped(false);
    setKnown(new Set());
    setReviewOnly(false);
  }, [allCards]);

  if (activeDeck.length === 0) {
    return (
      <div style={styles.quizContainer}>
        <div style={styles.scoreBox(lesson.color)}>
          <div style={styles.scoreNum(lesson.color)}>🎉</div>
          <div style={{ fontSize: 16, color: '#475569', fontWeight: 600 }}>All cards mastered!</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{known.size}/{allCards.length} cards known</div>
          <button style={{ ...styles.nextBtn(lesson.color), marginTop: 12 }} onClick={handleReset}>Start Over</button>
        </div>
      </div>
    );
  }

  const catInfo = current && CAT_LABELS[current.cat];
  const catColor = current && CAT_COLORS[current.cat];

  return (
    <div style={styles.quizContainer}>
      {/* Controls row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{known.size}/{allCards.length} mastered</span>
        <div style={{ flex: 1 }} />
        <button onClick={handleShuffle} style={{ fontSize: 11, padding: '3px 8px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', cursor: 'pointer', color: '#475569' }}>🔀 Shuffle</button>
        <button onClick={() => setReviewOnly(!reviewOnly)} style={{ fontSize: 11, padding: '3px 8px', border: `1px solid ${reviewOnly ? '#ef4444' : '#e2e8f0'}`, borderRadius: 6, background: reviewOnly ? '#fef2f2' : '#f8fafc', cursor: 'pointer', color: reviewOnly ? '#ef4444' : '#475569' }}>
          {reviewOnly ? '📖 Review Mode' : '📖 Review Difficult'}
        </button>
        <button onClick={() => setAutoFlip(!autoFlip)} style={{ fontSize: 11, padding: '3px 8px', border: `1px solid ${autoFlip ? '#10b981' : '#e2e8f0'}`, borderRadius: 6, background: autoFlip ? '#ecfdf5' : '#f8fafc', cursor: 'pointer', color: autoFlip ? '#10b981' : '#475569' }}>
          {autoFlip ? '⏸ Auto' : '▶ Auto'}
        </button>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          perspective: 800,
          cursor: 'pointer',
          marginBottom: 12,
          height: 220,
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.4s ease',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            boxSizing: 'border-box',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: catColor || lesson.color,
              borderRadius: '12px 12px 0 0',
            }} />
            {catInfo && (
              <span style={{ fontSize: 11, fontWeight: 700, color: catColor, marginBottom: 8, padding: '2px 10px', borderRadius: 10, background: catColor + '18' }}>
                {catInfo.icon} {catInfo.label}
              </span>
            )}
            <div style={{ fontSize: 17, fontWeight: 600, textAlign: 'center', color: '#1e293b' }}>
              {current.front}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>Tap to flip</div>
          </div>
          {/* Back */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 12,
            border: `1px solid ${(catColor || lesson.color) + '40'}`,
            background: (catColor || lesson.color) + '08',
            padding: 20,
            boxSizing: 'border-box',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            overflowY: 'auto',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: catColor || lesson.color,
              borderRadius: '12px 12px 0 0',
            }} />
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-line', marginTop: 4 }}>
              {current.back}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={(e) => { e.stopPropagation(); handleStudyAgain(); }}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: 14,
            fontWeight: 700,
            border: '2px solid #ef4444',
            borderRadius: 8,
            background: '#fff',
            color: '#ef4444',
            cursor: 'pointer',
          }}
        >
          ❌ Study Again
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleKnow(); }}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: 14,
            fontWeight: 700,
            border: '2px solid #10b981',
            borderRadius: 8,
            background: '#10b981',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          ✅ Know It
        </button>
      </div>

      {/* Navigation dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {activeDeck.map((card, i) => {
          const di = activeToDeckIdx[i];
          const cc = CAT_COLORS[card.cat] || lesson.color;
          return (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); setFlipped(false); }}
              style={{
                width: i === idx ? 18 : 10,
                height: 10,
                borderRadius: 5,
                background: known.has(di) ? '#10b981' : i === idx ? cc : '#e2e8f0',
                border: i === idx ? `2px solid ${cc}` : '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title={`${CAT_LABELS[card.cat]?.short || card.cat}${known.has(di) ? ' ✓' : ''}`}
            />
          );
        })}
      </div>

      {/* Card counter */}
      <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
        Card {idx + 1} of {activeDeck.length}
      </div>
    </div>
  );
}

function LessonCard({ lesson, completed, onComplete }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // null | 'quiz' | 'flashcards'
  const [fullImg, setFullImg] = useState(null);

  const { color } = lesson;

  return (
    <>
      <ImageOverlay src={fullImg} onClose={() => setFullImg(null)} />
      <div style={styles.card(color)}>
        <div style={styles.cardAccent(color)} />
        <div
          style={styles.cardHeader}
          onClick={() => { setExpanded(!expanded); setActiveTab(null); }}
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

            {/* Interactive Section: Quiz & Flashcards */}
            {!activeTab ? (
              <div style={{ display: 'flex', gap: 8, padding: '0 20px 16px' }}>
                <button
                  style={{ ...styles.quizBtn(color), flex: 1, margin: 0 }}
                  onClick={() => setActiveTab('quiz')}
                >
                  📝 Quiz
                </button>
                <button
                  style={{ ...styles.quizBtn(color), flex: 1, margin: 0, background: '#475569' }}
                  onClick={() => setActiveTab('flashcards')}
                >
                  🃏 Flashcards
                </button>
              </div>
            ) : (
              <>
                {/* Tab switcher */}
                <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', margin: '0 20px 4px' }}>
                  <button
                    onClick={() => setActiveTab('quiz')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      fontSize: 14,
                      fontWeight: 700,
                      border: 'none',
                      borderBottom: activeTab === 'quiz' ? `3px solid ${color}` : '3px solid transparent',
                      background: 'transparent',
                      color: activeTab === 'quiz' ? color : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    📝 Quiz
                  </button>
                  <button
                    onClick={() => setActiveTab('flashcards')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      fontSize: 14,
                      fontWeight: 700,
                      border: 'none',
                      borderBottom: activeTab === 'flashcards' ? `3px solid ${color}` : '3px solid transparent',
                      background: 'transparent',
                      color: activeTab === 'flashcards' ? color : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    🃏 Flashcards
                  </button>
                </div>
                {activeTab === 'quiz' ? (
                  <Quiz lesson={lesson} onComplete={onComplete} />
                ) : (
                  <Flashcards lesson={lesson} />
                )}
              </>
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
