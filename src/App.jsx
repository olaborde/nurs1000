import { useState, useEffect, useRef, useCallback } from "react";
import { QUESTIONS_EXAM3, SECTIONS_EXAM3, COLORS_EXAM3 } from "./questions_exam3.js";
import { QUESTIONS_CH28, SECTIONS_CH28, COLORS_CH28 } from "./questions_ch28.js";
import { QUESTIONS_CH29, SECTIONS_CH29, COLORS_CH29 } from "./questions_ch29.js";
import { QUESTIONS_CH30, SECTIONS_CH30, COLORS_CH30 } from "./questions_ch30.js";
import { QUESTIONS_CH31, SECTIONS_CH31, COLORS_CH31 } from "./questions_ch31.js";
import { QUESTIONS_LAB, SECTIONS_LAB, COLORS_LAB } from "./questions_lab.js";

const TABS = [
  { key: "exam3", label: "Exam 3 Study Guide", short: "Exam 3", questions: QUESTIONS_EXAM3, sections: SECTIONS_EXAM3, colors: COLORS_EXAM3, accent: "#8b5cf6" },
  { key: "ch28", label: "Ch 28: Head & Neck", short: "Ch 28", questions: QUESTIONS_CH28, sections: SECTIONS_CH28, colors: COLORS_CH28, accent: "#3b82f6" },
  { key: "ch29", label: "Ch 29: Thorax, Heart, Abdomen", short: "Ch 29", questions: QUESTIONS_CH29, sections: SECTIONS_CH29, colors: COLORS_CH29, accent: "#e91e63" },
  { key: "ch30", label: "Ch 30: Integumentary & PV", short: "Ch 30", questions: QUESTIONS_CH30, sections: SECTIONS_CH30, colors: COLORS_CH30, accent: "#ff9800" },
  { key: "ch31", label: "Ch 31: MSK & Neuro", short: "Ch 31", questions: QUESTIONS_CH31, sections: SECTIONS_CH31, colors: COLORS_CH31, accent: "#2ecc71" },
  { key: "lab", label: "MSK Worksheet Lab", short: "🧪 Lab", questions: QUESTIONS_LAB, sections: SECTIONS_LAB, colors: COLORS_LAB, accent: "#f59e0b" },
];

function useStorage(key, def) {
  const [v, setV] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; } });
  const save = useCallback((nv) => { const r = typeof nv === "function" ? nv(v) : nv; setV(r); try { localStorage.setItem(key, JSON.stringify(r)); } catch {} }, [key, v]);
  return [v, save];
}

function QuizEngine({ tab }) {
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
  const goNext = () => { if (currentQ < quizSize - 1) { goTo(currentQ + 1); } };
  const goPrev = () => { if (currentQ > 0) { goTo(currentQ - 1); } };

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

  const S = { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: "#e2e8f0" };

  // START
  if (mode === "start") {
    const recent = [...history].reverse().slice(0, 5);
    return (
      <div style={{ ...S }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "clamp(20px,4vw,30px)", fontWeight: 800, color: accent, margin: "0 0 4px" }}>{tab.label}</h2>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>{TOTAL} NCLEX-style questions{bestScore > 0 ? ` · 🏆 Best: ${bestScore}/${TOTAL} (${Math.round(bestScore / TOTAL * 100)}%)` : ""}{history.length > 0 ? ` · ${history.length} attempts` : ""}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 6, marginBottom: 20 }}>
          {SECTIONS.map(s => { const c = ALL_Q.filter(qn => qn.section === s).length; return (<div key={s} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px", borderLeft: `3px solid ${SECTION_COLORS[s] || accent}`, fontSize: 11 }}><div style={{ fontWeight: 700, color: "#cbd5e1" }}>{s}</div><div style={{ color: "#64748b" }}>{c} Qs</div></div>); })}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
          <button onClick={() => startQuiz("full")} style={{ background: `linear-gradient(135deg,${accent},${accent}bb)`, color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Full ({TOTAL})</button>
          <button onClick={() => startQuiz("random")} style={{ background: "rgba(255,255,255,0.06)", color: accent, border: `1px solid ${accent}44`, borderRadius: 10, padding: "12px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Random {Math.min(50, TOTAL)}</button>
          <button onClick={() => startQuiz("missed")} style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "12px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🔥 Weak ({Object.keys(missedMap).length})</button>
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
            <option value="all">— Section Drill —</option>
            {SECTIONS.map(s => <option key={s} value={s}>{s} ({ALL_Q.filter(qn => qn.section === s).length})</option>)}
          </select>
          {filterSection !== "all" && <button onClick={() => startQuiz("section")} style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44`, borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Start</button>}
        </div>
        {recent.length > 0 && (<div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Recent</div>
          {recent.map((a, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}><span style={{ color: "#94a3b8" }}>{new Date(a.date).toLocaleDateString()}</span><span style={{ color: a.score / a.total >= 0.7 ? "#34d399" : "#f87171", fontWeight: 600 }}>{a.score}/{a.total} ({Math.round(a.score / a.total * 100)}%)</span></div>))}
        </div>)}
      </div>
    );
  }

  // RESULTS
  if (mode === "results") {
    const pct = Math.round((totalCorrect / quizSize) * 100);
    const grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    const filtered = getFiltered();
    return (
      <div style={{ ...S }}>
        {!reviewMode ? (<>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 60, fontWeight: 900, background: pct >= 70 ? "linear-gradient(135deg,#34d399,#60a5fa)" : "linear-gradient(135deg,#f87171,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{pct}%</div>
            <div style={{ fontSize: 15, color: "#94a3b8" }}>{totalCorrect}/{quizSize} · Grade: {grade} · {formatTime(elapsed)}</div>
          </div>
          {sectionStats.map(s => (<div key={s.section} style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}><span style={{ fontWeight: 600 }}>{s.section}</span><span style={{ color: s.pct >= 70 ? "#34d399" : "#f87171" }}>{s.correct}/{s.total} ({s.pct}%)</span></div><div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 3, width: `${s.pct}%`, background: s.pct >= 70 ? "linear-gradient(90deg,#34d399,#60a5fa)" : "linear-gradient(90deg,#f87171,#ef4444)", transition: "width 0.8s" }} /></div></div>))}
          {weakSections.length > 0 && (<div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: 14, margin: "16px 0" }}><div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>⚠ Priority Review</div>{weakSections.map(s => (<div key={s.section} style={{ fontSize: 12, color: "#fca5a5", marginBottom: 4 }}>{s.section} — {s.pct}%</div>))}</div>)}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
            <button onClick={() => setReviewMode(true)} style={{ background: `linear-gradient(135deg,${accent},${accent}bb)`, color: "#fff", border: "none", borderRadius: 9, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Review</button>
            <button onClick={() => setMode("start")} style={{ background: "rgba(255,255,255,0.06)", color: accent, border: `1px solid ${accent}44`, borderRadius: 9, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Menu</button>
          </div>
        </>) : (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
            <button onClick={() => setReviewMode(false)} style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>← Results</button>
            <div style={{ display: "flex", gap: 6 }}>
              <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "6px 10px", fontSize: 11 }}><option value="all">All</option>{SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
              <select value={filterResult} onChange={e => setFilterResult(e.target.value)} style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "6px 10px", fontSize: 11 }}><option value="all">All</option><option value="correct">✓</option><option value="incorrect">✗</option></select>
            </div>
          </div>
          {filtered.map(qn => { const right = isCorrectQ(qn); const ans = answers[qn.id]; return (<div key={qn.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, marginBottom: 10, borderLeft: `3px solid ${right ? "#34d399" : "#f87171"}` }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, lineHeight: 1.5 }}>{right ? "✅" : "❌"} Q{qn.id}. {qn.q || qn.stem}</div>{qn.type !== "fib" && qn.type !== "order" && qn.options.map((opt, oi) => { const isC = qn.correct.includes(oi); const wasSel = (ans?.selected || []).includes(oi); let bg = "transparent"; if (isC) bg = "rgba(52,211,153,0.08)"; else if (wasSel) bg = "rgba(248,113,113,0.08)"; return (<div key={oi} style={{ padding: "4px 8px", borderRadius: 5, marginBottom: 2, fontSize: 11, background: bg, display: "flex", gap: 4 }}><span style={{ fontWeight: 700, color: "#64748b", minWidth: 16 }}>{String.fromCharCode(65 + oi)}.</span><span style={{ flex: 1 }}>{opt}</span>{isC && <span style={{ color: "#34d399", fontSize: 10 }}>✓</span>}{wasSel && !isC && <span style={{ color: "#f87171", fontSize: 10 }}>✗</span>}</div>); })}{qn.type === "fib" && <div style={{ fontSize: 11 }}>Your: <b style={{ color: right ? "#34d399" : "#f87171" }}>{ans?.fibAnswer || "(blank)"}</b>{!right && <span style={{ color: "#34d399", marginLeft: 6 }}>Correct: {qn.correct[0]}</span>}</div>}{qn.type === "order" && <div style={{ fontSize: 11 }}><div style={{ color: "#64748b" }}>Yours: {(ans?.order || []).join(" → ")}</div><div style={{ color: "#34d399" }}>Correct: {qn.correct.map(ci => qn.options[ci]).join(" → ")}</div></div>}<div style={{ marginTop: 8, padding: 10, borderRadius: 6, background: "rgba(96,165,250,0.05)", fontSize: 11, lineHeight: 1.6, color: "#94a3b8" }}>{qn.e || qn.explanation}<div style={{ marginTop: 4, fontSize: 10, color: "#64748b", fontStyle: "italic" }}>📖 {qn.r || qn.ref}</div></div></div>); })}
        </>)}
      </div>
    );
  }

  // QUIZ
  if (!q) return null;
  const isCorrect = showResult && checkAnswer(q, answers[q.id]);
  const sColor = SECTION_COLORS[q.section] || accent;

  return (
    <div style={{ ...S }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: "#64748b" }}><b style={{ color: "#e2e8f0" }}>Q{currentQ + 1}</b>/{quizSize}</div>
        <div style={{ fontSize: 11, color: "#64748b" }}>⏱ {formatTime(elapsed)} · {totalCorrect}✓</div>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 14, overflow: "hidden" }}><div style={{ height: "100%", width: `${((currentQ + 1) / quizSize) * 100}%`, background: accent, transition: "width 0.3s", borderRadius: 2 }} /></div>
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 14px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: sColor + "18", color: sColor }}>{q.section}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>{q.type === "sata" ? "SATA" : q.type === "fib" ? "FILL IN" : q.type === "order" ? "ORDER" : q.type === "tf" ? "T/F" : q.type === "label" ? "🏷️ LABEL" : "MC"}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, marginBottom: 14 }}>{q.q || q.stem}</div>
        {(q.type === "mc" || q.type === "sata" || q.type === "tf") && q.options.map((opt, oi) => {
          const sel = (answers[q.id]?.selected || []).includes(oi); const isC = q.correct.includes(oi);
          let bg = sel ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.02)", bd = sel ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.07)";
          if (showResult) { if (isC) { bg = "rgba(52,211,153,0.1)"; bd = "rgba(52,211,153,0.3)"; } else if (sel) { bg = "rgba(248,113,113,0.1)"; bd = "rgba(248,113,113,0.3)"; } }
          return (<div key={oi} onClick={() => handleSelect(oi)} style={{ padding: "9px 12px", borderRadius: 8, marginBottom: 5, background: bg, border: `1px solid ${bd}`, cursor: submitted ? "default" : "pointer", display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
            <div style={{ minWidth: 22, height: 22, borderRadius: q.type === "sata" ? 5 : 11, border: `2px solid ${sel ? "#60a5fa" : "rgba(255,255,255,0.12)"}`, background: sel ? "#60a5fa" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{sel ? (q.type === "sata" ? "✓" : String.fromCharCode(65 + oi)) : <span style={{ color: "#64748b" }}>{String.fromCharCode(65 + oi)}</span>}</div>
            <div style={{ flex: 1, lineHeight: 1.4 }}>{opt}</div>
            {showResult && isC && <span style={{ color: "#34d399", fontSize: 10, fontWeight: 700 }}>✓</span>}
            {showResult && sel && !isC && <span style={{ color: "#f87171", fontSize: 10, fontWeight: 700 }}>✗</span>}
          </div>);
        })}
        {q.type === "fib" && (<input type="text" value={answers[q.id]?.fibAnswer || ""} onChange={e => handleFib(e.target.value)} disabled={submitted} placeholder="Type answer..." style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />)}
        {q.type === "order" && orderItems.map((item, idx) => {
          let bg = "rgba(255,255,255,0.04)"; if (showResult) bg = item === q.options[q.correct[idx]] ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)";
          return (<div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 6, marginBottom: 4, background: bg, border: "1px solid rgba(255,255,255,0.06)" }} draggable={!submitted} onDragStart={() => setDragIdx(idx)} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragIdx !== null) moveOrder(dragIdx, idx); setDragIdx(null); }}>
            <span style={{ fontWeight: 700, color: "#64748b", minWidth: 16, fontSize: 11 }}>{idx + 1}.</span><span style={{ flex: 1, fontSize: 12 }}>{item}</span>
            {!submitted && <><button onClick={() => idx > 0 && moveOrder(idx, idx - 1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 3, color: "#94a3b8", cursor: "pointer", padding: "1px 5px", fontSize: 12 }}>↑</button><button onClick={() => idx < orderItems.length - 1 && moveOrder(idx, idx + 1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 3, color: "#94a3b8", cursor: "pointer", padding: "1px 5px", fontSize: 12 }}>↓</button></>}
          </div>);
        })}
        {showResult && q.type === "fib" && <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600 }}>Correct: <span style={{ color: "#34d399" }}>{q.correct[0]}</span></div>}
        {showResult && q.type === "order" && <div style={{ marginTop: 6, fontSize: 11, color: "#34d399" }}>Correct: {q.correct.map(ci => q.options[ci]).join(" → ")}</div>}
        {q.type === "label" && q.svg && (() => {
          const svgD = q.svg; const labelAnswers = answers[q.id]?.labels || {};
          const handleLabelChange = (arrowId, val) => { if (submitted) return; setAnswers({...answers, [q.id]: {...answers[q.id], labels: {...labelAnswers, [arrowId]: val}}}); };
          return (<div>
            <svg viewBox={svgD.vb} style={{width:"100%",maxHeight:280,marginBottom:12}} xmlns="http://www.w3.org/2000/svg">
              <defs><marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/></marker></defs>
              {(svgD.body||[]).map((s,i) => {
                const st = {fill:"none",stroke:"#475569",strokeWidth:s.sw||2};
                if(s.t==="ellipse") return <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...st}/>;
                if(s.t==="circle") return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#475569"/>;
                if(s.t==="line") return <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} {...st}/>;
                if(s.t==="rect") return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx||0} {...st}/>;
                return null;
              })}
              {(svgD.arrows||[]).map((a,i) => {
                const userAns = labelAnswers[a.id]; const isRight = showResult && userAns === q.correct[a.id]; const isWrong = showResult && userAns && userAns !== q.correct[a.id];
                const col = isRight ? "#34d399" : isWrong ? "#f87171" : "#60a5fa";
                return <g key={i}><line x1={a.x1} y1={a.y1} x2={a.lx} y2={a.ly} stroke={col} strokeWidth={2} markerEnd="url(#ah)"/>
                  <circle cx={a.x1} cy={a.y1} r={12} fill={col+"33"} stroke={col} strokeWidth={1.5}/>
                  <text x={a.x1} y={a.y1+4} textAnchor="middle" fill={col} fontSize={11} fontWeight={700}>{a.id}</text>
                  {showResult && <text x={a.lx+(a.lx>250?5:-5)} y={a.ly+4} textAnchor={a.lx>250?"start":"end"} fill={isRight?"#34d399":"#f87171"} fontSize={9} fontWeight={600}>{q.correct[a.id]}</text>}
                </g>;
              })}
            </svg>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6}}>
              {(svgD.arrows||[]).map(a => {
                const userAns = labelAnswers[a.id]; const isRight = showResult && userAns === q.correct[a.id]; const isWrong = showResult && userAns && userAns !== q.correct[a.id];
                return (<div key={a.id} style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{minWidth:22,height:22,borderRadius:11,background:isRight?"#34d39933":isWrong?"#f8717133":"#60a5fa22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:isRight?"#34d399":isWrong?"#f87171":"#60a5fa"}}>{a.id}</span>
                  <select value={userAns||""} onChange={e=>handleLabelChange(a.id,e.target.value)} disabled={submitted} style={{flex:1,background:"rgba(255,255,255,0.04)",color:"#e2e8f0",border:`1px solid ${isRight?"rgba(52,211,153,0.4)":isWrong?"rgba(248,113,113,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:6,padding:"6px 8px",fontSize:11}}>
                    <option value="">— Select —</option>
                    {q.choices.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {isRight && <span style={{color:"#34d399",fontSize:12}}>✓</span>}
                  {isWrong && <span style={{color:"#f87171",fontSize:12}}>✗</span>}
                </div>);
              })}
            </div>
          </div>);
        })()}
      </div>
      {showResult && (<div style={{ background: isCorrect ? "rgba(52,211,153,0.05)" : "rgba(248,113,113,0.05)", border: `1px solid ${isCorrect ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)"}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}><span style={{ fontSize: 18 }}>{isCorrect ? "✅" : "❌"}</span><span style={{ fontWeight: 700, fontSize: 13, color: isCorrect ? "#34d399" : "#f87171" }}>{isCorrect ? "Correct!" : "Incorrect"}</span>{!isCorrect && <span style={{ fontSize: 11, color: "#94a3b8" }}>· {q.a || q.correctAnswer}</span>}</div>
        <div style={{ fontSize: 12, lineHeight: 1.6, color: "#cbd5e1" }}>{q.e || q.explanation}</div>
        <div style={{ marginTop: 6, fontSize: 10, color: "#64748b", fontStyle: "italic" }}>📖 {q.r || q.ref}</div>
      </div>)}
      <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
        <button onClick={goPrev} disabled={currentQ === 0} style={{ background: "rgba(255,255,255,0.06)", color: currentQ === 0 ? "#475569" : "#94a3b8", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: currentQ === 0 ? "not-allowed" : "pointer" }}>←</button>
        <div style={{ display: "flex", gap: 6 }}>
          {!submitted && <button onClick={handleSubmit} style={{ background: `linear-gradient(135deg,${accent},${accent}bb)`, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Check</button>}
          {submitted && currentQ < quizSize - 1 && <button onClick={goNext} style={{ background: `linear-gradient(135deg,${accent},${accent}bb)`, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Next →</button>}
          {submitted && currentQ === quizSize - 1 && <button onClick={finishExam} style={{ background: "linear-gradient(135deg,#34d399,#10b981)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Finish</button>}
        </div>
        <button onClick={goNext} disabled={currentQ === quizSize - 1} style={{ background: "rgba(255,255,255,0.06)", color: currentQ === quizSize - 1 ? "#475569" : "#94a3b8", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: currentQ === quizSize - 1 ? "not-allowed" : "pointer" }}>→</button>
      </div>
      <div style={{ marginTop: 16, background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Navigator</span>
          <button onClick={finishExam} style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "none", borderRadius: 5, padding: "3px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>End</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {quizQuestions.map((qn, idx) => { const ans = !!answers[qn.id]; const cur = idx === currentQ; let bg = "rgba(255,255,255,0.04)"; if (cur) bg = accent; else if (ans) bg = accent + "33"; return (<button key={idx} onClick={() => goTo(idx)} style={{ width: 24, height: 22, borderRadius: 4, background: bg, border: "none", color: cur ? "#fff" : ans ? accent : "#475569", fontSize: 9, fontWeight: 700, cursor: "pointer", padding: 0 }}>{idx + 1}</button>); })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const totalQs = TABS.reduce((sum, t) => sum + t.questions.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#0a0e17,#111827,#0f1729)", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#e2e8f0" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "12px 14px" }}>
        <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#64748b" }}>NURS 1000</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>Fundamentals of Nursing — {totalQs} Questions</h1>
        </div>
        {/* TAB BAR */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", padding: "8px 0 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
          {TABS.map((tab, i) => (<button key={tab.key} onClick={() => setActiveTab(i)} style={{
            background: activeTab === i ? tab.accent + "22" : "rgba(255,255,255,0.03)",
            border: activeTab === i ? `1px solid ${tab.accent}55` : "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8, padding: "8px 14px", fontSize: 11, fontWeight: activeTab === i ? 700 : 500,
            color: activeTab === i ? tab.accent : "#94a3b8", cursor: "pointer", whiteSpace: "nowrap",
            transition: "all 0.15s"
          }}>{tab.short} <span style={{ fontSize: 9, opacity: 0.7 }}>({tab.questions.length})</span></button>))}
        </div>
        <QuizEngine key={TABS[activeTab].key} tab={TABS[activeTab]} />
      </div>
    </div>
  );
}
