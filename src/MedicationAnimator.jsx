import React, { useState, useEffect, useCallback, useRef } from 'react';

const CATEGORIES = {
  'Blood Pressure': '#3b82f6',
  'Urinary Output': '#8b5cf6',
  'Coagulation': '#ef4444',
  'Antibacterial': '#10b981',
  'Analgesics': '#f59e0b',
  'Opioids': '#e11d48',
};

const MEDICATIONS = [
  {
    id: 1,
    drugClass: 'ACE Inhibitor',
    name: 'Captopril',
    suffix: '-pril',
    category: 'Blood Pressure',
    mechanism: 'Inhibits angiotensin-converting enzyme, reducing angiotensin II production → vasodilation and decreased aldosterone',
    nursing: 'Monitor BP, potassium levels, renal function. First-dose hypotension risk. Dry cough is common side effect.',
    adverse: 'Dry cough, hyperkalemia, angioedema, hypotension',
    antidote: null,
    mnemonic: '-pril = ACE Inhibitor — "ACE the pril-iminary exam" (ACE + pril)',
  },
  {
    id: 2,
    drugClass: 'Beta Blocker',
    name: 'Metoprolol',
    suffix: '-olol',
    category: 'Blood Pressure',
    mechanism: 'Blocks beta-1 adrenergic receptors → decreases heart rate, contractility, and BP',
    nursing: 'Check HR before giving (hold if <60 bpm). Monitor BP. Do not stop abruptly.',
    adverse: 'Bradycardia, hypotension, fatigue, bronchospasm, masking hypoglycemia symptoms',
    antidote: null,
    mnemonic: '-olol = Beta Blocker — "Oh LOL, my heart is slow" (slows heart rate)',
  },
  {
    id: 3,
    drugClass: 'Loop Diuretic',
    name: 'Furosemide',
    suffix: '-mide',
    category: 'Urinary Output',
    mechanism: 'Inhibits Na/K/Cl cotransporter in Loop of Henle → potent diuresis',
    nursing: 'Monitor I&O, daily weights, electrolytes (K+, Na+). Give in AM to avoid nocturia. Ototoxicity risk.',
    adverse: 'Hypokalemia, dehydration, ototoxicity, hypotension',
    antidote: null,
    mnemonic: '-mide = Loop Diuretic — "Made to pee in the Loop" (mide + loop)',
  },
  {
    id: 4,
    drugClass: 'Anticoagulant',
    name: 'Heparin',
    suffix: null,
    category: 'Coagulation',
    mechanism: 'Enhances antithrombin III activity → inhibits thrombin and Factor Xa',
    nursing: 'Monitor aPTT. SubQ or IV only (never IM). Watch for HIT (heparin-induced thrombocytopenia).',
    adverse: 'Bleeding, HIT, osteoporosis with long-term use',
    antidote: 'Protamine sulfate',
    mnemonic: 'H before W alphabetically → Heparin\'s antidote is Protamine (P before V). "HP go together" like Harry Potter.',
  },
  {
    id: 5,
    drugClass: 'Vitamin K Inhibitor',
    name: 'Warfarin',
    suffix: null,
    category: 'Coagulation',
    mechanism: 'Inhibits vitamin K-dependent clotting factors (II, VII, IX, X)',
    nursing: 'Monitor INR (target 2-3). Many drug/food interactions (vitamin K foods). Takes 3-5 days for full effect.',
    adverse: 'Bleeding, skin necrosis, teratogenic',
    antidote: 'Vitamin K (phytonadione)',
    mnemonic: 'Warfarin = Vitamin K antidote. "W comes after V" — Warfarin is reversed by Vitamin K.',
  },
  {
    id: 6,
    drugClass: 'Antibacterial',
    name: 'Vancomycin',
    suffix: null,
    category: 'Antibacterial',
    mechanism: 'Inhibits bacterial cell wall synthesis by binding D-Ala-D-Ala',
    nursing: 'Monitor trough levels (15-20 mcg/mL). Infuse slowly (≥60 min). Monitor renal function and hearing.',
    adverse: 'Red Man Syndrome (histamine release from rapid infusion), nephrotoxicity, ototoxicity',
    antidote: null,
    mnemonic: 'Vancomycin: Red Man = too fast infusion, slow it down! "Van goes slow or you turn red"',
  },
  {
    id: 7,
    drugClass: 'Cyclooxygenase Inhibitor',
    name: 'Aspirin',
    suffix: null,
    category: 'Analgesics',
    mechanism: 'Irreversibly inhibits COX-1 and COX-2 → decreased prostaglandins and thromboxane A2',
    nursing: 'Monitor for bleeding, tinnitus. Avoid in children (Reye syndrome). Take with food.',
    adverse: 'Tinnitus, GI bleeding, Reye syndrome in children, prolonged bleeding time',
    antidote: null,
    mnemonic: 'Aspirin: if ears ring (tinnitus), stop the thing! 🔔',
  },
  {
    id: 8,
    drugClass: 'Non-Opioid Analgesic',
    name: 'Acetaminophen',
    suffix: null,
    category: 'Analgesics',
    mechanism: 'Inhibits prostaglandin synthesis in CNS. Analgesic and antipyretic (NOT anti-inflammatory)',
    nursing: 'Max 4g/day total (all sources). Monitor liver function. Many combo products contain it — check labels!',
    adverse: 'Hepatotoxicity (liver damage/failure at high doses)',
    antidote: 'N-acetylcysteine (NAC)',
    mnemonic: 'Acetaminophen max 4g/day — Liver Killer! "4 grams = Liver\'s funeral, NAC saves the day"',
  },
  {
    id: 9,
    drugClass: 'Opioid Agonist',
    name: 'Morphine',
    suffix: null,
    category: 'Opioids',
    mechanism: 'Binds mu-opioid receptors → analgesia, sedation, euphoria, respiratory depression',
    nursing: 'Monitor RR (hold if <12). Assess pain. Have Naloxone ready. Constipation prophylaxis.',
    adverse: 'Respiratory depression, constipation, pinpoint pupils (miosis), sedation, nausea, urinary retention',
    antidote: 'Naloxone',
    mnemonic: 'Morphine overdose triad: Pinpoint Pupils + Respiratory Depression + Unconsciousness → give Naloxone 💉',
  },
  {
    id: 10,
    drugClass: 'Opioid Antagonist',
    name: 'Naloxone',
    suffix: null,
    category: 'Opioids',
    mechanism: 'Competitive antagonist at opioid receptors → rapidly reverses opioid effects',
    nursing: 'Short half-life (30-90 min) — may need repeat doses! Monitor for re-sedation. Can precipitate withdrawal.',
    adverse: 'Acute opioid withdrawal symptoms, tachycardia, hypertension, pulmonary edema (rare)',
    antidote: null,
    mnemonic: 'Naloxone: short half-life = may need repeat doses. "NAL-one dose is rarely enough"',
  },
];

const QUIZ_TYPES = [
  { label: 'Name → Class', key: 'nameToClass' },
  { label: 'Class → Name', key: 'classToName' },
  { label: 'Suffix → Drug', key: 'suffixToDrug' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function DrugCard({ med, flipped, onFlip, highlight }) {
  const color = CATEGORIES[med.category];
  const cardStyle = {
    perspective: 800,
    cursor: 'pointer',
    minHeight: 180,
  };

  const innerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 180,
    transition: 'transform 0.6s',
    transformStyle: 'preserve-3d',
    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  const faceBase = {
    position: flipped ? 'absolute' : 'relative',
    width: '100%',
    minHeight: 180,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: 12,
    padding: '12px 14px',
    boxSizing: 'border-box',
    border: `2px solid ${highlight ? color : '#e5e7eb'}`,
    boxShadow: highlight ? `0 0 12px ${color}33` : '0 1px 4px rgba(0,0,0,0.06)',
  };

  const frontStyle = {
    ...faceBase,
    background: '#fff',
    display: flipped ? 'none' : 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const backStyle = {
    ...faceBase,
    background: '#fafafa',
    transform: 'rotateY(180deg)',
    display: flipped ? 'flex' : 'none',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    fontSize: 11,
    lineHeight: 1.5,
    overflowY: 'auto',
    top: 0,
    left: 0,
  };

  return (
    <div style={cardStyle} onClick={onFlip}>
      <div style={innerStyle}>
        <div style={frontStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%', background: color, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {med.id}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: color,
              background: color + '15', padding: '2px 8px', borderRadius: 10,
            }}>
              {med.category}
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>
            {med.drugClass}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
            {med.name}
            {med.suffix && (
              <span style={{ color: color, fontWeight: 800 }}> ({med.suffix})</span>
            )}
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
            Tap to flip →
          </div>
        </div>
        <div style={backStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: color, marginBottom: 6 }}>
            {med.name} — {med.drugClass}
          </div>
          <div style={{ marginBottom: 4 }}>
            <strong style={{ color: '#374151' }}>Mechanism:</strong>{' '}
            <span style={{ color: '#4b5563' }}>{med.mechanism}</span>
          </div>
          <div style={{ marginBottom: 4 }}>
            <strong style={{ color: '#374151' }}>Nursing:</strong>{' '}
            <span style={{ color: '#4b5563' }}>{med.nursing}</span>
          </div>
          <div style={{ marginBottom: 4 }}>
            <strong style={{ color: '#374151' }}>Adverse:</strong>{' '}
            <span style={{ color: '#dc2626' }}>{med.adverse}</span>
          </div>
          {med.antidote && (
            <div style={{ marginBottom: 4 }}>
              <strong style={{ color: '#374151' }}>Antidote:</strong>{' '}
              <span style={{ color: '#059669', fontWeight: 600 }}>{med.antidote}</span>
            </div>
          )}
          <div style={{
            marginTop: 6, padding: '6px 8px', background: '#fef3c7',
            borderRadius: 8, border: '1px solid #fde68a',
          }}>
            <strong style={{ color: '#92400e', fontSize: 10 }}>💡 MEMORY HOOK:</strong>{' '}
            <span style={{ color: '#92400e', fontSize: 11 }}>{med.mnemonic}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizMode({ onExit }) {
  const [quizType, setQuizType] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const generateQuestions = useCallback((typeIdx) => {
    const type = QUIZ_TYPES[typeIdx].key;
    let qs = [];
    if (type === 'nameToClass') {
      const shuffled = shuffle(MEDICATIONS);
      qs = shuffled.slice(0, 5).map(med => {
        const options = shuffle([
          med.drugClass,
          ...shuffle(MEDICATIONS.filter(m => m.id !== med.id)).slice(0, 3).map(m => m.drugClass),
        ].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4);
        if (!options.includes(med.drugClass)) options[0] = med.drugClass;
        return { question: `What class is ${med.name}?`, answer: med.drugClass, options: shuffle(options), explanation: med.mnemonic };
      });
    } else if (type === 'classToName') {
      const shuffled = shuffle(MEDICATIONS);
      qs = shuffled.slice(0, 5).map(med => {
        const options = shuffle([
          med.name,
          ...shuffle(MEDICATIONS.filter(m => m.id !== med.id)).slice(0, 3).map(m => m.name),
        ].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4);
        if (!options.includes(med.name)) options[0] = med.name;
        return { question: `Which drug is a ${med.drugClass}?`, answer: med.name, options: shuffle(options), explanation: med.mnemonic };
      });
    } else {
      const withSuffix = MEDICATIONS.filter(m => m.suffix);
      const shuffled = shuffle(withSuffix);
      qs = shuffled.map(med => {
        const options = shuffle([
          med.name,
          ...shuffle(MEDICATIONS.filter(m => m.id !== med.id)).slice(0, 3).map(m => m.name),
        ].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4);
        if (!options.includes(med.name)) options[0] = med.name;
        return { question: `Which drug has the suffix "${med.suffix}"?`, answer: med.name, options: shuffle(options), explanation: med.mnemonic };
      });
    }
    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setTotal(0);
    setShowResult(false);
  }, []);

  useEffect(() => { generateQuestions(quizType); }, [quizType, generateQuestions]);

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    setTotal(t => t + 1);
    if (opt === questions[currentQ].answer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setShowResult(true);
      return;
    }
    setCurrentQ(c => c + 1);
    setSelected(null);
  };

  const q = questions[currentQ];

  const containerStyle = {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    border: '2px solid #e5e7eb',
  };

  if (showResult) {
    return (
      <div style={containerStyle}>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, textAlign: 'center' }}>Quiz Complete! 🎉</h3>
        <p style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, color: score >= total * 0.7 ? '#059669' : '#dc2626' }}>
          {score} / {total}
        </p>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
          {score === total ? 'Perfect score! 💯' : score >= total * 0.7 ? 'Great job! Keep studying!' : 'Keep practicing — you\'ll get there!'}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          <button onClick={() => generateQuestions(quizType)} style={{
            border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
            background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 13,
          }}>
            Try Again
          </button>
          <button onClick={onExit} style={{
            border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
            background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13,
          }}>
            Back to Cards
          </button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {QUIZ_TYPES.map((qt, i) => (
            <button key={qt.key} onClick={() => setQuizType(i)} style={{
              border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              background: i === quizType ? '#3b82f6' : '#f3f4f6',
              color: i === quizType ? '#fff' : '#6b7280',
              fontSize: 11, fontWeight: 600,
            }}>
              {qt.label}
            </button>
          ))}
        </div>
        <button onClick={onExit} style={{
          border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af',
        }}>
          ✕
        </button>
      </div>

      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
        Question {currentQ + 1} of {questions.length} | Score: {score}/{total}
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>
        {q.question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.options.map((opt, i) => {
          let bg = '#f9fafb';
          let border = '#e5e7eb';
          let textColor = '#374151';
          if (selected !== null) {
            if (opt === q.answer) { bg = '#d1fae5'; border = '#059669'; textColor = '#059669'; }
            else if (opt === selected) { bg = '#fee2e2'; border = '#dc2626'; textColor = '#dc2626'; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(opt)} style={{
              border: `2px solid ${border}`, borderRadius: 10, padding: '10px 14px',
              background: bg, cursor: selected ? 'default' : 'pointer',
              textAlign: 'left', fontSize: 14, fontWeight: 600, color: textColor,
              transition: 'all 0.2s',
            }}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            padding: '8px 12px', borderRadius: 8,
            background: selected === q.answer ? '#d1fae5' : '#fee2e2',
            border: `1px solid ${selected === q.answer ? '#6ee7b7' : '#fca5a5'}`,
            fontSize: 12, color: '#374151', marginBottom: 8,
          }}>
            {selected === q.answer ? '✅ Correct!' : `❌ Incorrect — the answer is ${q.answer}`}
            <div style={{ marginTop: 4, fontSize: 11, color: '#6b7280' }}>💡 {q.explanation}</div>
          </div>
          <button onClick={nextQuestion} style={{
            border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer',
            background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 13,
          }}>
            {currentQ + 1 >= questions.length ? 'See Results' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}

export function MedicationAnimator() {
  const [flipped, setFlipped] = useState({});
  const [quizMode, setQuizMode] = useState(false);
  const [autoCycle, setAutoCycle] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [order, setOrder] = useState(MEDICATIONS.map((_, i) => i));
  const [cycleIndex, setCycleIndex] = useState(0);
  const cycleRef = useRef(null);

  useEffect(() => {
    if (!autoCycle) {
      if (cycleRef.current) clearInterval(cycleRef.current);
      return;
    }
    cycleRef.current = setInterval(() => {
      setCycleIndex(prev => {
        const next = (prev + 1) % order.length;
        const medIdx = order[next];
        setFlipped(f => {
          const newF = {};
          newF[medIdx] = true;
          return newF;
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(cycleRef.current);
  }, [autoCycle, order]);

  const toggleFlip = (id) => {
    setFlipped(f => ({ ...f, [id]: !f[id] }));
  };

  const toggleShuffle = () => {
    if (!shuffleMode) {
      setOrder(shuffle(MEDICATIONS.map((_, i) => i)));
    } else {
      setOrder(MEDICATIONS.map((_, i) => i));
    }
    setShuffleMode(s => !s);
    setFlipped({});
    setCycleIndex(0);
  };

  const flipAll = () => {
    const allFlipped = Object.values(flipped).filter(Boolean).length === MEDICATIONS.length;
    if (allFlipped) {
      setFlipped({});
    } else {
      const f = {};
      MEDICATIONS.forEach((_, i) => { f[i] = true; });
      setFlipped(f);
    }
  };

  const containerStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: 560,
    margin: '0 auto',
    padding: 16,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  };

  const btnBase = {
    border: 'none',
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.2s',
  };

  if (quizMode) {
    return (
      <div style={containerStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
          💊 Medication Quiz
        </h2>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', margin: '0 0 12px' }}>
          Test your knowledge!
        </p>
        <QuizMode onExit={() => setQuizMode(false)} />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
        💊 10 Key Medications
      </h2>
      <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', margin: '0 0 12px' }}>
        Interactive Drug Card Study Tool — tap cards to flip
      </p>

      {/* Category legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
        {Object.entries(CATEGORIES).map(([cat, col]) => (
          <span key={cat} style={{
            fontSize: 10, fontWeight: 600, color: col,
            background: col + '15', padding: '2px 8px', borderRadius: 10,
          }}>
            {cat}
          </span>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setQuizMode(true)} style={{ ...btnBase, background: '#3b82f6', color: '#fff' }}>
          🧠 Quiz Mode
        </button>
        <button onClick={() => { setAutoCycle(a => !a); }} style={{
          ...btnBase,
          background: autoCycle ? '#ef4444' : '#10b981',
          color: '#fff',
        }}>
          {autoCycle ? '⏸ Stop Auto' : '▶ Auto-Cycle'}
        </button>
        <button onClick={toggleShuffle} style={{
          ...btnBase,
          background: shuffleMode ? '#8b5cf6' : '#f3f4f6',
          color: shuffleMode ? '#fff' : '#6b7280',
        }}>
          🔀 Shuffle {shuffleMode ? 'ON' : 'OFF'}
        </button>
        <button onClick={flipAll} style={{ ...btnBase, background: '#f3f4f6', color: '#6b7280' }}>
          🔄 Flip All
        </button>
      </div>

      {/* Card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 12,
      }}>
        {order.map((medIdx) => {
          const med = MEDICATIONS[medIdx];
          return (
            <DrugCard
              key={med.id}
              med={med}
              flipped={!!flipped[medIdx]}
              onFlip={() => toggleFlip(medIdx)}
              highlight={autoCycle && order[cycleIndex] === medIdx}
            />
          );
        })}
      </div>

      {/* Quick reference footer */}
      <div style={{
        marginTop: 16, padding: '10px 14px', background: '#f0fdf4',
        borderRadius: 10, border: '1px solid #bbf7d0',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
          📝 Quick Suffix Guide
        </div>
        <div style={{ fontSize: 11, color: '#166534', lineHeight: 1.6 }}>
          <strong>-pril</strong> = ACE Inhibitor &nbsp;|&nbsp; <strong>-olol</strong> = Beta Blocker &nbsp;|&nbsp; <strong>-mide</strong> = Loop Diuretic
        </div>
        <div style={{ fontSize: 11, color: '#166534', lineHeight: 1.6, marginTop: 2 }}>
          <strong>Heparin → Protamine</strong> &nbsp;|&nbsp; <strong>Warfarin → Vitamin K</strong> &nbsp;|&nbsp; <strong>Acetaminophen → NAC</strong> &nbsp;|&nbsp; <strong>Opioids → Naloxone</strong>
        </div>
      </div>
    </div>
  );
}
