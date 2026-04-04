import { useState, useEffect, useRef, useCallback } from "react";
import { QUESTIONS_EXAM3, SECTIONS_EXAM3, COLORS_EXAM3 } from "./questions_exam3.js";
import { QUESTIONS_CH28, SECTIONS_CH28, COLORS_CH28 } from "./questions_ch28.js";
import { QUESTIONS_CH29, SECTIONS_CH29, COLORS_CH29 } from "./questions_ch29.js";
import { QUESTIONS_CH30, SECTIONS_CH30, COLORS_CH30 } from "./questions_ch30.js";
import { QUESTIONS_CH31, SECTIONS_CH31, COLORS_CH31 } from "./questions_ch31.js";
import { QUESTIONS_LAB, SECTIONS_LAB, COLORS_LAB } from "./questions_lab.js";
import { QUESTIONS_MOBILITY, SECTIONS_MOBILITY, COLORS_MOBILITY } from "./questions_exam4_mobility.js";
import { QUESTIONS_INFECTION, SECTIONS_INFECTION, COLORS_INFECTION } from "./questions_exam4_infection.js";
import { QUESTIONS_PHARM, SECTIONS_PHARM, COLORS_PHARM } from "./questions_exam4_pharm.js";

const TABS = [
  { key: "exam3", label: "Exam 3 Study Guide", short: "Exam 3", questions: QUESTIONS_EXAM3, sections: SECTIONS_EXAM3, colors: COLORS_EXAM3, accent: "#8b5cf6" },
  { key: "ch28", label: "Ch 28: Head & Neck", short: "Ch 28", questions: QUESTIONS_CH28, sections: SECTIONS_CH28, colors: COLORS_CH28, accent: "#3b82f6" },
  { key: "ch29", label: "Ch 29: Thorax, Heart, Abdomen", short: "Ch 29", questions: QUESTIONS_CH29, sections: SECTIONS_CH29, colors: COLORS_CH29, accent: "#e91e63" },
  { key: "ch30", label: "Ch 30: Integumentary & PV", short: "Ch 30", questions: QUESTIONS_CH30, sections: SECTIONS_CH30, colors: COLORS_CH30, accent: "#ff9800" },
  { key: "ch31", label: "Ch 31: MSK & Neuro", short: "Ch 31", questions: QUESTIONS_CH31, sections: SECTIONS_CH31, colors: COLORS_CH31, accent: "#2ecc71" },
  { key: "lab", label: "MSK Worksheet Lab", short: "🧪 Lab", questions: QUESTIONS_LAB, sections: SECTIONS_LAB, colors: COLORS_LAB, accent: "#f59e0b" },
  { key: "exam4_mob", label: "Exam 4: Mobility & Assistive Devices", short: "🦵 Mobility", questions: QUESTIONS_MOBILITY, sections: SECTIONS_MOBILITY, colors: COLORS_MOBILITY, accent: "#8b5cf6" },
  { key: "exam4_inf", label: "Exam 4: Infection Control & SBAR", short: "🦠 Infection", questions: QUESTIONS_INFECTION, sections: SECTIONS_INFECTION, colors: COLORS_INFECTION, accent: "#ef4444" },
  { key: "exam4_ph", label: "Exam 4: Pharmacology & Documentation", short: "💊 Pharm", questions: QUESTIONS_PHARM, sections: SECTIONS_PHARM, colors: COLORS_PHARM, accent: "#f59e0b" },
];

/* ── palette ── */
const P = {
  bg: "#f8fafc",
  white: "#ffffff",
  text: "#1e293b",
  textMuted: "#64748b",
  textLight: "#94a3b8",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  primary: "#4f46e5",
  primaryLight: "#eef2ff",
  primaryDark: "#4338ca",
  success: "#10b981",
  successLight: "#ecfdf5",
  successBorder: "#a7f3d0",
  error: "#f43f5e",
  errorLight: "#fff1f2",
  errorBorder: "#fecdd3",
  shadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
  shadowLg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
  radius: 12,
  radiusSm: 8,
  font: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  transition: "all 0.2s ease",
};

const TAB_EMOJIS = {
  exam3: "📝", ch28: "🧠", ch29: "❤️", ch30: "🩹", ch31: "💪",
  lab: "🧪", exam4_mob: "🦵", exam4_inf: "🦠", exam4_ph: "💊",
};

/* ── localStorage hook ── */
function useStorage(key, def) {
  const [v, setV] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; } });
  const save = useCallback((nv) => { const r = typeof nv === "function" ? nv(v) : nv; setV(r); try { localStorage.setItem(key, JSON.stringify(r)); } catch {} }, [key, v]);
  return [v, save];
}

/* ── circular progress ring ── */
function ScoreRing({ pct, size = 140, stroke = 10, color = P.primary }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={P.border} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   QuizEngine — all quiz logic lives here
   ══════════════════════════════════════════════════════════ */
function QuizEngine({ tab, onBack }) {
  const { questions: ALL_Q, sections: SECTIONS, colors: SECTION_COLORS, accent } = tab;
  const TOTAL = ALL_Q.length;

  const [history, setHistory] = useStorage(`nurs_${tab.key}_history`, []);
  const [missedMap, setMissedMap] = useStorage(`nurs_${tab.key}_missed`, {});
  const [bestScore, setBestScore] = useStorage(`nurs_${tab.key}_best`, 0);

  const [mode, setMode] = useState("start");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [dragIdx, setDragIdx] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [filterSection, setFilterSection] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(ALL_Q);
  const [quizMode, setQuizMode] = useState("full");
  const [expandedReview, setExpandedReview] = useState({});
  const timerRef = useRef(null);

  useEffect(() => { if (timerActive) timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(timerRef.current); }, [timerActive]);
  useEffect(() => { setMode("start"); setAnswers({}); setCurrentQ(0); setTimerActive(false); clearInterval(timerRef.current); }, [tab.key]);

  const q = quizQuestions[currentQ];
  const quizSize = quizQuestions.length;

  const initOrder = (idx) => { const qn = quizQuestions[idx]; if (qn?.type === "order") setOrderItems(answers[qn.id]?.order || [...qn.options]); };

  const startQuiz = (qMode) => {
    let qs = ALL_Q;
    if (qMode === "missed") { const ids = Object.entries(missedMap).sort((a, b) => b[1] - a[1]).slice(0, 100).map(e => parseInt(e[0])); qs = ALL_Q.filter(q => ids.includes(q.id)); if (!qs.length) { alert("No missed questions yet!"); return; } }
    else if (qMode === "section") { qs = ALL_Q.filter(q => q.section === filterSection); if (!qs.length) return; }
    else if (qMode === "random") { qs = [...ALL_Q].sort(() => Math.random() - 0.5).slice(0, Math.min(50, ALL_Q.length)); }
    setQuizQuestions(qs); setQuizMode(qMode); setMode("quiz"); setCurrentQ(0); setAnswers({}); setSubmitted(false); setShowResult(false); setReviewMode(false); setElapsed(0); setTimerActive(true);
    if (qs[0]?.type === "order") setOrderItems([...qs[0].options]);
  };

  const handleSelect = (oi) => { if (submitted) return; const prev = answers[q.id]?.selected || []; const next = q.type === "sata" ? (prev.includes(oi) ? prev.filter(i => i !== oi) : [...prev, oi]) : [oi]; setAnswers({ ...answers, [q.id]: { ...answers[q.id], selected: next } }); };
  const handleFib = (v) => setAnswers({ ...answers, [q.id]: { ...answers[q.id], fibAnswer: v } });
  const moveOrder = (from, to) => { if (submitted) return; const items = [...orderItems]; const [m] = items.splice(from, 1); items.splice(to, 0, m); setOrderItems(items); setAnswers({ ...answers, [q.id]: { ...answers[q.id], order: items } }); };

  const checkAnswer = (qn, ans) => {
    if (!ans) return false;
    if (qn.type === "fib") return qn.correct.some(c => (ans.fibAnswer || "").trim().toLowerCase() === c.toLowerCase());
    if (qn.type === "order") return qn.correct.every((ci, pos) => (ans.order || [])[pos] === qn.options[ci]);
    if (qn.type === "label" && qn.correct && typeof qn.correct === "object" && !Array.isArray(qn.correct)) {
      const labels = ans.labels || {};
      const keys = Object.keys(qn.correct);
      return keys.length > 0 && keys.every(k => labels[k] === qn.correct[k]);
    }
    const sel = ans.selected || [];
    return sel.length === qn.correct.length && qn.correct.every(c => sel.includes(c));
  };

  const handleSubmit = () => { setSubmitted(true); setShowResult(true); };
  const goTo = (idx) => { setCurrentQ(idx); setSubmitted(false); setShowResult(false); initOrder(idx); };
  const goNext = () => { if (currentQ < quizSize - 1) goTo(currentQ + 1); };
  const goPrev = () => { if (currentQ > 0) goTo(currentQ - 1); };

  const totalCorrect = quizQuestions.filter(qn => checkAnswer(qn, answers[qn.id])).length;
  const formatTime = (s) => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const isCorrectQ = (qn) => checkAnswer(qn, answers[qn.id]);

  const finishExam = () => {
    setTimerActive(false); clearInterval(timerRef.current);
    setHistory(h => [...h, { date: new Date().toISOString(), score: totalCorrect, total: quizSize, time: elapsed, mode: quizMode }]);
    if (quizMode === "full" && totalCorrect > bestScore) setBestScore(totalCorrect);
    const nm = { ...missedMap }; quizQuestions.forEach(qn => { if (!checkAnswer(qn, answers[qn.id])) nm[qn.id] = (nm[qn.id] || 0) + 1; }); setMissedMap(nm);
    setMode("results");
  };

  const sectionStats = SECTIONS.map(s => { const qs = quizQuestions.filter(qn => qn.section === s); if (!qs.length) return null; const c = qs.filter(qn => checkAnswer(qn, answers[qn.id])).length; return { section: s, total: qs.length, correct: c, pct: Math.round((c / qs.length) * 100) }; }).filter(Boolean);
  const weakSections = sectionStats.filter(s => s.pct < 70).sort((a, b) => a.pct - b.pct);
  const getFiltered = () => { let f = quizQuestions; if (filterSection !== "all") f = f.filter(qn => qn.section === filterSection); if (filterResult === "correct") f = f.filter(isCorrectQ); if (filterResult === "incorrect") f = f.filter(qn => !isCorrectQ(qn)); return f; };

  const bestPct = TOTAL > 0 ? Math.round(bestScore / TOTAL * 100) : 0;

  /* ── button helper ── */
  const btn = (bg, color, border, extra = {}) => ({
    background: bg, color, border: border || "none", borderRadius: P.radiusSm, padding: "11px 24px",
    fontSize: 14, fontWeight: 600, cursor: "pointer", transition: P.transition, fontFamily: P.font, ...extra,
  });

  /* ══════════════ START SCREEN ══════════════ */
  if (mode === "start") {
    const recent = [...history].reverse().slice(0, 5);
    const missedCount = Object.keys(missedMap).length;
    return (
      <div style={{ fontFamily: P.font, color: P.text }}>
        {/* Back button */}
        <button onClick={onBack} style={{ background: "none", border: "none", color: P.textMuted, fontSize: 14, cursor: "pointer", padding: "4px 0", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, fontFamily: P.font, fontWeight: 500 }}>
          <span style={{ fontSize: 18 }}>←</span> All Study Sets
        </button>

        {/* Header card */}
        <div style={{ background: P.white, borderRadius: P.radius, padding: "28px 24px", boxShadow: P.shadowMd, marginBottom: 24, borderTop: `4px solid ${accent}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: P.radius, background: accent + "14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
              {TAB_EMOJIS[tab.key] || "📚"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: P.text }}>{tab.label}</h2>
              <p style={{ margin: "4px 0 0", color: P.textMuted, fontSize: 14 }}>
                {TOTAL} questions · {SECTIONS.length} sections
                {bestScore > 0 && <span style={{ color: P.success, fontWeight: 600 }}> · Best: {bestPct}%</span>}
                {history.length > 0 && <span> · {history.length} attempts</span>}
              </p>
            </div>
          </div>

          {/* Section chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {SECTIONS.map(s => {
              const c = ALL_Q.filter(qn => qn.section === s).length;
              const sc = SECTION_COLORS[s] || accent;
              return (
                <div key={s} style={{ background: sc + "0c", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500, color: sc, border: `1px solid ${sc}22` }}>
                  {s} <span style={{ opacity: 0.7 }}>({c})</span>
                </div>
              );
            })}
          </div>

          {/* Quiz mode buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <button onClick={() => startQuiz("full")} style={btn(accent, "#fff", undefined, { padding: "13px 32px", fontSize: 15, fontWeight: 700, borderRadius: 10, boxShadow: `0 4px 14px ${accent}33` })}>
              Start Full Quiz ({TOTAL})
            </button>
            <button onClick={() => startQuiz("random")} style={btn(P.white, accent, `2px solid ${accent}22`, { fontWeight: 600 })}>
              🎲 Random {Math.min(50, TOTAL)}
            </button>
            <button onClick={() => startQuiz("missed")} style={btn(missedCount > 0 ? P.errorLight : P.borderLight, missedCount > 0 ? P.error : P.textLight, `1px solid ${missedCount > 0 ? P.errorBorder : P.border}`, { fontWeight: 600 })}>
              🔥 Weak Areas ({missedCount})
            </button>
          </div>

          {/* Section drill */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={{
              background: P.white, color: P.text, border: `1px solid ${P.border}`, borderRadius: P.radiusSm,
              padding: "9px 14px", fontSize: 13, fontFamily: P.font, cursor: "pointer", minWidth: 200,
            }}>
              <option value="all">📂 Section Drill...</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s} ({ALL_Q.filter(qn => qn.section === s).length})</option>)}
            </select>
            {filterSection !== "all" && (
              <button onClick={() => startQuiz("section")} style={btn(accent + "14", accent, `1px solid ${accent}33`, { padding: "9px 18px", fontSize: 13 })}>
                Start Section →
              </button>
            )}
          </div>
        </div>

        {/* Recent history */}
        {recent.length > 0 && (
          <div style={{ background: P.white, borderRadius: P.radius, padding: 20, boxShadow: P.shadow }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: P.text, display: "flex", alignItems: "center", gap: 8 }}>
              <span>📊</span> Recent Attempts
            </h3>
            {recent.map((a, i) => {
              const apct = Math.round(a.score / a.total * 100);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < recent.length - 1 ? `1px solid ${P.borderLight}` : "none" }}>
                  <div>
                    <span style={{ fontSize: 13, color: P.text, fontWeight: 500 }}>{new Date(a.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span style={{ fontSize: 11, color: P.textLight, marginLeft: 8 }}>{a.mode}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 60, height: 6, background: P.borderLight, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, width: `${apct}%`, background: apct >= 70 ? P.success : P.error, transition: "width 0.6s" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: apct >= 70 ? P.success : P.error, minWidth: 55, textAlign: "right" }}>
                      {a.score}/{a.total} ({apct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ══════════════ RESULTS SCREEN ══════════════ */
  if (mode === "results") {
    const pct = Math.round((totalCorrect / quizSize) * 100);
    const grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    const ringColor = pct >= 70 ? P.success : P.error;
    const filtered = getFiltered();

    return (
      <div style={{ fontFamily: P.font, color: P.text }}>
        {!reviewMode ? (
          <>
            {/* Score ring */}
            <div style={{ background: P.white, borderRadius: P.radius, padding: "36px 24px", boxShadow: P.shadowMd, textAlign: "center", marginBottom: 24 }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                <ScoreRing pct={pct} size={150} stroke={12} color={ringColor} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(0deg)" }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: ringColor }}>{pct}%</div>
                  <div style={{ fontSize: 12, color: P.textMuted, fontWeight: 600 }}>Grade: {grade}</div>
                </div>
              </div>
              <div style={{ fontSize: 15, color: P.textMuted, marginBottom: 4 }}>
                <b style={{ color: P.text }}>{totalCorrect}</b> of <b style={{ color: P.text }}>{quizSize}</b> correct
              </div>
              <div style={{ fontSize: 13, color: P.textLight }}>⏱ {formatTime(elapsed)}</div>
            </div>

            {/* Section breakdown */}
            <div style={{ background: P.white, borderRadius: P.radius, padding: 20, boxShadow: P.shadow, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Section Breakdown</h3>
              {sectionStats.map(s => {
                const sc = SECTION_COLORS[s.section] || accent;
                const barColor = s.pct >= 70 ? P.success : P.error;
                return (
                  <div key={s.section} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, color: P.text }}>{s.section}</span>
                      <span style={{ color: barColor, fontWeight: 700 }}>{s.correct}/{s.total} ({s.pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: P.borderLight, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, width: `${s.pct}%`, background: barColor, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weak sections */}
            {weakSections.length > 0 && (
              <div style={{ background: P.errorLight, border: `1px solid ${P.errorBorder}`, borderRadius: P.radius, padding: 18, marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: P.error, marginBottom: 8 }}>⚠️ Priority Review</div>
                {weakSections.map(s => (
                  <div key={s.section} style={{ fontSize: 13, color: "#b91c1c", marginBottom: 4 }}>
                    {s.section} — <b>{s.pct}%</b>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setReviewMode(true)} style={btn(accent, "#fff", undefined, { padding: "13px 28px", fontWeight: 700, borderRadius: 10 })}>
                📝 Review Answers
              </button>
              <button onClick={() => startQuiz(quizMode)} style={btn(P.white, accent, `2px solid ${accent}22`, { padding: "13px 28px" })}>
                🔄 Try Again
              </button>
              <button onClick={() => setMode("start")} style={btn(P.borderLight, P.textMuted, `1px solid ${P.border}`, { padding: "13px 28px" })}>
                ← Back to Menu
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Review mode header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <button onClick={() => setReviewMode(false)} style={btn(P.white, P.textMuted, `1px solid ${P.border}`, { padding: "8px 16px", fontSize: 13 })}>
                ← Back to Results
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={{
                  background: P.white, color: P.text, border: `1px solid ${P.border}`, borderRadius: P.radiusSm,
                  padding: "8px 12px", fontSize: 13, fontFamily: P.font,
                }}>
                  <option value="all">All Sections</option>
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterResult} onChange={e => setFilterResult(e.target.value)} style={{
                  background: P.white, color: P.text, border: `1px solid ${P.border}`, borderRadius: P.radiusSm,
                  padding: "8px 12px", fontSize: 13, fontFamily: P.font,
                }}>
                  <option value="all">All Results</option>
                  <option value="correct">✅ Correct</option>
                  <option value="incorrect">❌ Incorrect</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: 13, color: P.textMuted, marginBottom: 12 }}>
              Showing {filtered.length} question{filtered.length !== 1 ? "s" : ""}
            </div>

            {/* Review question list */}
            {filtered.map(qn => {
              const right = isCorrectQ(qn);
              const ans = answers[qn.id];
              const isExpanded = expandedReview[qn.id];
              return (
                <div key={qn.id} style={{
                  background: P.white, borderRadius: P.radius, marginBottom: 10, boxShadow: P.shadow,
                  borderLeft: `4px solid ${right ? P.success : P.error}`, overflow: "hidden",
                }}>
                  {/* Clickable header */}
                  <div onClick={() => setExpandedReview(prev => ({ ...prev, [qn.id]: !prev[qn.id] }))}
                    style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{right ? "✅" : "❌"}</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>Q{qn.id}. {qn.q || qn.stem}</span>
                    <span style={{ color: P.textLight, fontSize: 18, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ padding: "0 18px 16px", borderTop: `1px solid ${P.borderLight}` }}>
                      <div style={{ paddingTop: 12 }}>
                        {qn.type !== "fib" && qn.type !== "order" && qn.type !== "label" && qn.options.map((opt, oi) => {
                          const isC = qn.correct.includes(oi);
                          const wasSel = (ans?.selected || []).includes(oi);
                          let bg = "transparent", borderColor = P.borderLight;
                          if (isC) { bg = P.successLight; borderColor = P.successBorder; }
                          else if (wasSel) { bg = P.errorLight; borderColor = P.errorBorder; }
                          return (
                            <div key={oi} style={{ padding: "8px 12px", borderRadius: P.radiusSm, marginBottom: 4, fontSize: 13, background: bg, border: `1px solid ${borderColor}`, display: "flex", gap: 8, alignItems: "flex-start" }}>
                              <span style={{ fontWeight: 700, color: P.textMuted, minWidth: 20 }}>{String.fromCharCode(65 + oi)}.</span>
                              <span style={{ flex: 1 }}>{opt}</span>
                              {isC && <span style={{ color: P.success, fontWeight: 700, fontSize: 12 }}>✓</span>}
                              {wasSel && !isC && <span style={{ color: P.error, fontWeight: 700, fontSize: 12 }}>✗</span>}
                            </div>
                          );
                        })}
                        {qn.type === "fib" && (
                          <div style={{ fontSize: 13, marginBottom: 8 }}>
                            Your answer: <b style={{ color: right ? P.success : P.error }}>{ans?.fibAnswer || "(blank)"}</b>
                            {!right && <span style={{ color: P.success, marginLeft: 8 }}>Correct: <b>{qn.correct[0]}</b></span>}
                          </div>
                        )}
                        {qn.type === "order" && (
                          <div style={{ fontSize: 13, marginBottom: 8 }}>
                            <div style={{ color: P.textMuted, marginBottom: 4 }}>Your order: {(ans?.order || []).join(" → ")}</div>
                            <div style={{ color: P.success }}>Correct order: {qn.correct.map(ci => qn.options[ci]).join(" → ")}</div>
                          </div>
                        )}
                        {qn.type === "label" && (
                          <div style={{ fontSize: 13, marginBottom: 8, color: P.textMuted }}>
                            (Label question — see full details above)
                          </div>
                        )}
                        <div style={{ marginTop: 10, padding: 14, borderRadius: P.radiusSm, background: P.primaryLight, fontSize: 13, lineHeight: 1.7, color: P.text }}>
                          {qn.e || qn.explanation}
                          <div style={{ marginTop: 6, fontSize: 11, color: P.textMuted, fontStyle: "italic" }}>📖 {qn.r || qn.ref}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  }

  /* ══════════════ QUIZ SCREEN ══════════════ */
  if (!q) return null;
  const isCorrect = showResult && checkAnswer(q, answers[q.id]);
  const sColor = SECTION_COLORS[q.section] || accent;
  const progressPct = ((currentQ + 1) / quizSize) * 100;

  return (
    <div style={{ fontFamily: P.font, color: P.text }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 14, color: P.textMuted }}>
          Question <b style={{ color: P.text }}>{currentQ + 1}</b> of {quizSize}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, color: P.textMuted }}>⏱ {formatTime(elapsed)}</span>
          <span style={{ fontSize: 13, color: P.success, fontWeight: 600 }}>{totalCorrect} ✓</span>
          <button onClick={finishExam} style={{
            background: P.errorLight, color: P.error, border: `1px solid ${P.errorBorder}`,
            borderRadius: P.radiusSm, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: P.font,
          }}>
            End Quiz
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: P.borderLight, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progressPct}%`, background: P.primary, transition: "width 0.3s ease", borderRadius: 2 }} />
      </div>

      {/* Question card */}
      <div style={{ background: P.white, borderRadius: P.radius, padding: "24px 22px", boxShadow: P.shadowMd, marginBottom: 16 }}>
        {/* Tags */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: sColor + "14", color: sColor }}>
            {q.section}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: P.borderLight, color: P.textMuted }}>
            {q.type === "sata" ? "SATA" : q.type === "fib" ? "FILL IN" : q.type === "order" ? "ORDER" : q.type === "tf" ? "T/F" : q.type === "label" ? "🏷️ LABEL" : "MC"}
          </span>
        </div>

        {/* Question text */}
        <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 20, color: P.text }}>
          {q.q || q.stem}
        </div>

        {/* MC / SATA / TF options */}
        {(q.type === "mc" || q.type === "sata" || q.type === "tf") && q.options.map((opt, oi) => {
          const sel = (answers[q.id]?.selected || []).includes(oi);
          const isC = q.correct.includes(oi);
          let bg = sel ? P.primaryLight : P.white;
          let bd = sel ? `2px solid ${P.primary}44` : `1px solid ${P.border}`;
          if (showResult) {
            if (isC) { bg = P.successLight; bd = `2px solid ${P.successBorder}`; }
            else if (sel) { bg = P.errorLight; bd = `2px solid ${P.errorBorder}`; }
          }
          return (
            <div key={oi} onClick={() => handleSelect(oi)} style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 8, background: bg, border: bd,
              cursor: submitted ? "default" : "pointer", display: "flex", alignItems: "flex-start", gap: 12,
              fontSize: 14, transition: P.transition,
            }}>
              <div style={{
                minWidth: 28, height: 28, borderRadius: q.type === "sata" ? 6 : 14,
                border: `2px solid ${sel ? P.primary : P.border}`,
                background: sel ? P.primary : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: sel ? "#fff" : P.textMuted, fontSize: 12, fontWeight: 700, flexShrink: 0,
                transition: P.transition,
              }}>
                {sel ? (q.type === "sata" ? "✓" : String.fromCharCode(65 + oi)) : String.fromCharCode(65 + oi)}
              </div>
              <div style={{ flex: 1, lineHeight: 1.5, paddingTop: 3 }}>{opt}</div>
              {showResult && isC && <span style={{ color: P.success, fontWeight: 700, fontSize: 14, paddingTop: 4 }}>✓</span>}
              {showResult && sel && !isC && <span style={{ color: P.error, fontWeight: 700, fontSize: 14, paddingTop: 4 }}>✗</span>}
            </div>
          );
        })}

        {/* FIB */}
        {q.type === "fib" && (
          <input type="text" value={answers[q.id]?.fibAnswer || ""} onChange={e => handleFib(e.target.value)}
            disabled={submitted} placeholder="Type your answer..."
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 10,
              background: P.white, border: `2px solid ${P.border}`, color: P.text,
              fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: P.font,
              transition: P.transition,
            }}
            onFocus={e => { e.target.style.borderColor = P.primary; }}
            onBlur={e => { e.target.style.borderColor = P.border; }}
          />
        )}

        {/* ORDER */}
        {q.type === "order" && orderItems.map((item, idx) => {
          let bg = P.white;
          if (showResult) bg = item === q.options[q.correct[idx]] ? P.successLight : P.errorLight;
          return (
            <div key={idx} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              borderRadius: P.radiusSm, marginBottom: 6, background: bg, border: `1px solid ${P.border}`,
              transition: P.transition,
            }}
              draggable={!submitted}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragIdx !== null) moveOrder(dragIdx, idx); setDragIdx(null); }}
            >
              <span style={{ fontWeight: 700, color: P.textMuted, minWidth: 24, fontSize: 13 }}>{idx + 1}.</span>
              <span style={{ flex: 1, fontSize: 14 }}>{item}</span>
              {!submitted && (
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => idx > 0 && moveOrder(idx, idx - 1)} style={{
                    background: P.borderLight, border: `1px solid ${P.border}`, borderRadius: 6,
                    color: P.textMuted, cursor: "pointer", padding: "4px 8px", fontSize: 14, fontFamily: P.font,
                  }}>↑</button>
                  <button onClick={() => idx < orderItems.length - 1 && moveOrder(idx, idx + 1)} style={{
                    background: P.borderLight, border: `1px solid ${P.border}`, borderRadius: 6,
                    color: P.textMuted, cursor: "pointer", padding: "4px 8px", fontSize: 14, fontFamily: P.font,
                  }}>↓</button>
                </div>
              )}
            </div>
          );
        })}

        {/* FIB result */}
        {showResult && q.type === "fib" && (
          <div style={{ marginTop: 10, fontSize: 14, fontWeight: 600 }}>
            Correct answer: <span style={{ color: P.success }}>{q.correct[0]}</span>
          </div>
        )}

        {/* Order result */}
        {showResult && q.type === "order" && (
          <div style={{ marginTop: 10, fontSize: 13, color: P.success, fontWeight: 600 }}>
            Correct: {q.correct.map(ci => q.options[ci]).join(" → ")}
          </div>
        )}

        {/* LABEL type */}
        {q.type === "label" && q.svg && (() => {
          const svgD = q.svg;
          const labelAnswers = answers[q.id]?.labels || {};
          const handleLabelChange = (arrowId, val) => { if (submitted) return; setAnswers({ ...answers, [q.id]: { ...answers[q.id], labels: { ...labelAnswers, [arrowId]: val } } }); };
          return (
            <div>
              <svg viewBox={svgD.vb} style={{ width: "100%", maxHeight: 280, marginBottom: 14 }} xmlns="http://www.w3.org/2000/svg">
                <defs><marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#94a3b8" /></marker></defs>
                {(svgD.body || []).map((s, i) => {
                  const st = { fill: "none", stroke: "#94a3b8", strokeWidth: s.sw || 2 };
                  if (s.t === "ellipse") return <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...st} />;
                  if (s.t === "circle") return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#94a3b8" />;
                  if (s.t === "line") return <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} {...st} />;
                  if (s.t === "rect") return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx || 0} {...st} />;
                  return null;
                })}
                {(svgD.arrows || []).map((a, i) => {
                  const userAns = labelAnswers[a.id]; const isRight = showResult && userAns === q.correct[a.id]; const isWrong = showResult && userAns && userAns !== q.correct[a.id];
                  const col = isRight ? P.success : isWrong ? P.error : P.primary;
                  return <g key={i}><line x1={a.x1} y1={a.y1} x2={a.lx} y2={a.ly} stroke={col} strokeWidth={2} markerEnd="url(#ah)" />
                    <circle cx={a.x1} cy={a.y1} r={12} fill={col + "33"} stroke={col} strokeWidth={1.5} />
                    <text x={a.x1} y={a.y1 + 4} textAnchor="middle" fill={col} fontSize={11} fontWeight={700}>{a.id}</text>
                    {showResult && <text x={a.lx + (a.lx > 250 ? 5 : -5)} y={a.ly + 4} textAnchor={a.lx > 250 ? "start" : "end"} fill={isRight ? P.success : P.error} fontSize={9} fontWeight={600}>{q.correct[a.id]}</text>}
                  </g>;
                })}
              </svg>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
                {(svgD.arrows || []).map(a => {
                  const userAns = labelAnswers[a.id]; const isRight = showResult && userAns === q.correct[a.id]; const isWrong = showResult && userAns && userAns !== q.correct[a.id];
                  return (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        minWidth: 26, height: 26, borderRadius: 13,
                        background: isRight ? P.successLight : isWrong ? P.errorLight : P.primaryLight,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700,
                        color: isRight ? P.success : isWrong ? P.error : P.primary,
                      }}>{a.id}</span>
                      <select value={userAns || ""} onChange={e => handleLabelChange(a.id, e.target.value)} disabled={submitted}
                        style={{
                          flex: 1, background: P.white, color: P.text,
                          border: `1px solid ${isRight ? P.successBorder : isWrong ? P.errorBorder : P.border}`,
                          borderRadius: P.radiusSm, padding: "8px 10px", fontSize: 13, fontFamily: P.font,
                        }}>
                        <option value="">— Select —</option>
                        {q.choices.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {isRight && <span style={{ color: P.success, fontSize: 14 }}>✓</span>}
                      {isWrong && <span style={{ color: P.error, fontSize: 14 }}>✗</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Explanation card */}
      {showResult && (
        <div style={{
          background: isCorrect ? P.successLight : P.errorLight,
          border: `1px solid ${isCorrect ? P.successBorder : P.errorBorder}`,
          borderRadius: P.radius, padding: 18, marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{isCorrect ? "✅" : "❌"}</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: isCorrect ? "#047857" : "#be123c" }}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </span>
            {!isCorrect && <span style={{ fontSize: 13, color: P.textMuted }}>· {q.a || q.correctAnswer}</span>}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: P.text }}>{q.e || q.explanation}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: P.textMuted, fontStyle: "italic" }}>📖 {q.r || q.ref}</div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={goPrev} disabled={currentQ === 0} style={{
          background: currentQ === 0 ? P.borderLight : P.white,
          color: currentQ === 0 ? P.textLight : P.text,
          border: `1px solid ${P.border}`, borderRadius: P.radiusSm, padding: "11px 20px",
          fontSize: 14, fontWeight: 600, cursor: currentQ === 0 ? "not-allowed" : "pointer", fontFamily: P.font,
        }}>
          ← Previous
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {!submitted && (
            <button onClick={handleSubmit} style={btn(P.primary, "#fff", undefined, { padding: "11px 28px", fontWeight: 700, borderRadius: 10 })}>
              Check Answer
            </button>
          )}
          {submitted && currentQ < quizSize - 1 && (
            <button onClick={goNext} style={btn(P.primary, "#fff", undefined, { padding: "11px 28px", fontWeight: 700, borderRadius: 10 })}>
              Next →
            </button>
          )}
          {submitted && currentQ === quizSize - 1 && (
            <button onClick={finishExam} style={btn(P.success, "#fff", undefined, { padding: "11px 28px", fontWeight: 700, borderRadius: 10 })}>
              🎉 Finish Quiz
            </button>
          )}
        </div>
        <button onClick={goNext} disabled={currentQ === quizSize - 1} style={{
          background: currentQ === quizSize - 1 ? P.borderLight : P.white,
          color: currentQ === quizSize - 1 ? P.textLight : P.text,
          border: `1px solid ${P.border}`, borderRadius: P.radiusSm, padding: "11px 20px",
          fontSize: 14, fontWeight: 600, cursor: currentQ === quizSize - 1 ? "not-allowed" : "pointer", fontFamily: P.font,
        }}>
          Next →
        </button>
      </div>

      {/* Question navigator */}
      <div style={{ marginTop: 20, background: P.white, borderRadius: P.radius, padding: 16, boxShadow: P.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: P.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Question Navigator</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {quizQuestions.map((qn, idx) => {
            const ans = !!answers[qn.id];
            const cur = idx === currentQ;
            let bg = P.borderLight, color = P.textMuted, border = "2px solid transparent";
            if (cur) { bg = P.primary; color = "#fff"; border = `2px solid ${P.primary}`; }
            else if (ans) { bg = P.primaryLight; color = P.primary; border = `2px solid ${P.primary}33`; }
            return (
              <button key={idx} onClick={() => goTo(idx)} style={{
                width: 32, height: 30, borderRadius: 6, background: bg, border, color,
                fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: P.font,
                transition: P.transition,
              }}>{idx + 1}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   App — Landing Page + Study Set Grid + Quiz
   ══════════════════════════════════════════════════════════ */
export default function App() {
  const [activeTab, setActiveTab] = useState(null);
  const [showSets, setShowSets] = useState(false);
  const setsRef = useRef(null);
  const totalQs = TABS.reduce((sum, t) => sum + t.questions.length, 0);

  const scrollToSets = () => {
    setShowSets(true);
    setTimeout(() => {
      setsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  /* reading best scores from localStorage for cards */
  const getTabStats = (tab) => {
    try {
      const best = JSON.parse(localStorage.getItem(`nurs_${tab.key}_best`) || "0");
      const hist = JSON.parse(localStorage.getItem(`nurs_${tab.key}_history`) || "[]");
      return { best, attempts: hist.length, lastPct: hist.length ? Math.round(hist[hist.length - 1].score / hist[hist.length - 1].total * 100) : null };
    } catch { return { best: 0, attempts: 0, lastPct: null }; }
  };

  /* ── Quiz is active ── */
  if (activeTab !== null) {
    return (
      <div style={{ minHeight: "100vh", background: P.bg, fontFamily: P.font }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 16px" }}>
          <QuizEngine key={TABS[activeTab].key} tab={TABS[activeTab]} onBack={() => setActiveTab(null)} />
        </div>
      </div>
    );
  }

  /* ── Home: Landing + Study Sets ── */
  return (
    <div style={{ minHeight: "100vh", background: P.bg, fontFamily: P.font, color: P.text }}>

      {/* ═══ HERO / LANDING ═══ */}
      <div style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a78bfa 100%)",
        padding: "60px 20px 70px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
            NURS 1000
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
            Fundamentals of Nursing
          </h1>
          <p style={{ fontSize: "clamp(15px, 2.5vw, 18px)", color: "rgba(255,255,255,0.85)", margin: "0 0 32px", lineHeight: 1.6, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            Master {totalQs.toLocaleString()}+ practice questions across {TABS.length} study sets for your nursing exams
          </p>

          <button onClick={scrollToSets} style={{
            background: "#fff", color: "#4f46e5", border: "none", borderRadius: 12,
            padding: "16px 40px", fontSize: 17, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)", transition: P.transition,
            fontFamily: P.font, letterSpacing: 0.3,
          }}>
            Start Studying →
          </button>

          {/* Quick stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(16px, 4vw, 40px)", marginTop: 36, flexWrap: "wrap" }}>
            {[
              { num: TABS.length, label: "Study Sets" },
              { num: totalQs.toLocaleString(), label: "Questions" },
              { num: "6", label: "Question Types" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#fff" }}>{s.num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <div style={{ maxWidth: 800, margin: "-30px auto 0", padding: "0 16px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { icon: "📊", title: "Track Progress", desc: "See your scores, history, and improvement over time" },
            { icon: "🎯", title: "Focus on Weak Areas", desc: "Retake missed questions and drill problem sections" },
            { icon: "⏱️", title: "Timed Quizzes", desc: "Simulate real exam conditions with built-in timer" },
          ].map((f, i) => (
            <div key={i} style={{
              background: P.white, borderRadius: P.radius, padding: "22px 20px",
              boxShadow: P.shadowMd, textAlign: "center", transition: P.transition,
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: P.text, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: P.textMuted, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ STUDY SET CARDS ═══ */}
      <div ref={setsRef} style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px 60px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.text, marginBottom: 6 }}>
          📚 Study Sets
        </h2>
        <p style={{ fontSize: 14, color: P.textMuted, marginBottom: 24 }}>
          Choose a study set to begin practicing
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {TABS.map((tab, i) => {
            const stats = getTabStats(tab);
            const bestPct = tab.questions.length > 0 ? Math.round(stats.best / tab.questions.length * 100) : 0;
            return (
              <div key={tab.key} onClick={() => setActiveTab(i)} style={{
                background: P.white, borderRadius: P.radius, padding: "20px 22px",
                boxShadow: P.shadow, cursor: "pointer", transition: "all 0.2s ease",
                border: `1px solid ${P.border}`, position: "relative", overflow: "hidden",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = P.shadowLg; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = P.shadow; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Accent top bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: tab.accent }} />

                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10, background: tab.accent + "14",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
                  }}>
                    {TAB_EMOJIS[tab.key] || "📚"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: P.text, marginBottom: 4, lineHeight: 1.3 }}>
                      {tab.label}
                    </div>
                    <div style={{ fontSize: 13, color: P.textMuted }}>
                      {tab.questions.length} questions · {tab.sections.length} sections
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                {stats.attempts > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${P.borderLight}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: P.textMuted }}>{stats.attempts} attempt{stats.attempts !== 1 ? "s" : ""}</span>
                      {stats.lastPct !== null && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: stats.lastPct >= 70 ? P.success : P.error }}>
                          Last: {stats.lastPct}%
                        </span>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 6, background: P.borderLight, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 3,
                        width: `${bestPct}%`,
                        background: bestPct >= 70 ? P.success : bestPct > 0 ? "#f59e0b" : P.borderLight,
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                    {bestPct > 0 && (
                      <div style={{ fontSize: 11, color: P.textLight, marginTop: 4 }}>
                        🏆 Best: {stats.best}/{tab.questions.length} ({bestPct}%)
                      </div>
                    )}
                  </div>
                )}

                {/* Start arrow */}
                {stats.attempts === 0 && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${P.borderLight}`, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, color: tab.accent, fontWeight: 600 }}>Start studying</span>
                    <span style={{ color: tab.accent }}>→</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total footer */}
        <div style={{ textAlign: "center", marginTop: 32, padding: "16px 0", color: P.textLight, fontSize: 13, borderTop: `1px solid ${P.border}` }}>
          {totalQs.toLocaleString()} total questions across {TABS.length} study sets · NURS 1000 Fundamentals
        </div>
      </div>
    </div>
  );
}
