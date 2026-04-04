import React, { useState, useEffect, useCallback, useRef } from 'react';

const MOMENTS = [
  {
    id: 1,
    label: 'BEFORE Touching a Patient',
    when: 'Before touching a patient when approaching',
    why: 'To protect the patient against harmful germs on your hands',
    angle: 198,
  },
  {
    id: 2,
    label: 'BEFORE Clean/Aseptic Procedure',
    when: 'Immediately before performing a clean/aseptic procedure',
    why: 'To protect the patient against harmful germs, including the patient\'s own',
    angle: 126,
  },
  {
    id: 3,
    label: 'AFTER Body Fluid Exposure Risk',
    when: 'Immediately after exposure risk to body fluids (and after glove removal)',
    why: 'To protect yourself and the health care environment from harmful patient germs',
    angle: 270,
  },
  {
    id: 4,
    label: 'AFTER Touching a Patient',
    when: 'After touching a patient and her/his immediate surroundings, when leaving patient\'s side',
    why: 'To protect yourself and the health care environment from harmful patient germs',
    angle: 342,
  },
  {
    id: 5,
    label: 'AFTER Touching Patient Surroundings',
    when: 'After touching any object or furniture in the patient\'s immediate surroundings, even if patient not touched',
    why: 'To protect yourself and the health care environment from harmful patient germs',
    angle: 54,
  },
];

const ORANGE = '#ea580c';
const GRAY = '#9ca3af';
const LIGHT_GRAY = '#e5e7eb';
const DARK = '#374151';

function HandIcon({ type, color, cx, cy, size }) {
  const s = size || 18;
  const c = color || ORANGE;
  if (type === 1) {
    return (
      <g transform={`translate(${cx - s / 2},${cy - s / 2})`}>
        <path d={`M${s * 0.3},${s * 0.9} L${s * 0.3},${s * 0.4} Q${s * 0.3},${s * 0.1} ${s * 0.5},${s * 0.1} Q${s * 0.7},${s * 0.1} ${s * 0.7},${s * 0.4} L${s * 0.7},${s * 0.9}`} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <line x1={s * 0.5} y1={s * 0.1} x2={s * 0.8} y2={s * 0.0} stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      </g>
    );
  }
  if (type === 2) {
    return (
      <g transform={`translate(${cx - s / 2},${cy - s / 2})`}>
        <path d={`M${s * 0.3},${s * 0.9} L${s * 0.3},${s * 0.4} Q${s * 0.3},${s * 0.1} ${s * 0.5},${s * 0.1} Q${s * 0.7},${s * 0.1} ${s * 0.7},${s * 0.4} L${s * 0.7},${s * 0.9}`} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <line x1={s * 0.5} y1={s * 0.1} x2={s * 0.5} y2={-s * 0.3} stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={s * 0.5} cy={-s * 0.35} r={2} fill={c} />
      </g>
    );
  }
  if (type === 3) {
    return (
      <g transform={`translate(${cx - s / 2},${cy - s / 2})`}>
        <path d={`M${s * 0.3},${s * 0.9} L${s * 0.3},${s * 0.4} Q${s * 0.3},${s * 0.1} ${s * 0.5},${s * 0.1} Q${s * 0.7},${s * 0.1} ${s * 0.7},${s * 0.4} L${s * 0.7},${s * 0.9}`} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={s * 0.8} cy={s * 0.6} r={3} fill={c} opacity="0.7" />
      </g>
    );
  }
  if (type === 4) {
    return (
      <g transform={`translate(${cx - s / 2},${cy - s / 2})`}>
        <path d={`M${s * 0.3},${s * 0.9} L${s * 0.3},${s * 0.4} Q${s * 0.3},${s * 0.1} ${s * 0.5},${s * 0.1} Q${s * 0.7},${s * 0.1} ${s * 0.7},${s * 0.4} L${s * 0.7},${s * 0.9}`} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <line x1={s * 0.8} y1={s * 0.5} x2={s * 1.1} y2={s * 0.4} stroke={c} strokeWidth="1.2" strokeLinecap="round" markerEnd="" />
        <polygon points={`${s * 1.1},${s * 0.35} ${s * 1.0},${s * 0.5} ${s * 1.2},${s * 0.5}`} fill={c} />
      </g>
    );
  }
  return (
    <g transform={`translate(${cx - s / 2},${cy - s / 2})`}>
      <path d={`M${s * 0.3},${s * 0.9} L${s * 0.3},${s * 0.4} Q${s * 0.3},${s * 0.1} ${s * 0.5},${s * 0.1} Q${s * 0.7},${s * 0.1} ${s * 0.7},${s * 0.4} L${s * 0.7},${s * 0.9}`} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <rect x={s * 0.75} y={s * 0.5} width={s * 0.3} height={s * 0.15} rx={1} fill={c} opacity="0.6" />
    </g>
  );
}

function WashingHands({ active }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setFrame(f => (f + 1) % 20), 100);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;
  const offset = Math.sin(frame * 0.6) * 3;
  return (
    <g>
      <path d={`M-8,${-2 + offset} Q-8,${-10 + offset} 0,${-10 + offset} Q8,${-10 + offset} 8,${-2 + offset} L8,${8 + offset} Q8,${12 + offset} 0,${12 + offset} Q-8,${12 + offset} -8,${8 + offset} Z`} fill={ORANGE} opacity="0.15" stroke={ORANGE} strokeWidth="0.5" />
      <path d={`M-5,${offset} C-5,${-4 + offset} -2,${-6 + offset} 0,${-6 + offset} C2,${-6 + offset} 5,${-4 + offset} 5,${offset} L5,${6 + offset} C5,${9 + offset} 2,${10 + offset} 0,${10 + offset} C-2,${10 + offset} -5,${9 + offset} -5,${6 + offset} Z`} fill="none" stroke={ORANGE} strokeWidth="1.5" />
      <path d={`M-3,${-offset * 0.5} C-3,${-3 - offset * 0.5} -1,${-5 - offset * 0.5} 0,${-5 - offset * 0.5} C1,${-5 - offset * 0.5} 3,${-3 - offset * 0.5} 3,${-offset * 0.5} L3,${5 - offset * 0.5} C3,${7 - offset * 0.5} 1,${9 - offset * 0.5} 0,${9 - offset * 0.5} C-1,${9 - offset * 0.5} -3,${7 - offset * 0.5} -3,${5 - offset * 0.5} Z`} fill="none" stroke={ORANGE} strokeWidth="1.5" />
      {[...Array(3)].map((_, i) => {
        const bx = -2 + i * 2;
        const by = 2 + Math.sin(frame * 0.8 + i) * 1.5;
        return <circle key={i} cx={bx} cy={by} r="0.8" fill={ORANGE} opacity="0.5" />;
      })}
    </g>
  );
}

export function HandHygieneAnimator() {
  const [activeMoment, setActiveMoment] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [traceProgress, setTraceProgress] = useState(0);
  const timerRef = useRef(null);
  const pulseRef = useRef(null);

  const CX = 200;
  const CY = 190;
  const RADIUS = 140;

  const getMomentPos = useCallback((angle) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: CX + RADIUS * Math.cos(rad), y: CY + RADIUS * Math.sin(rad) };
  }, []);

  useEffect(() => {
    pulseRef.current = setInterval(() => {
      setPulsePhase(p => (p + 1) % 60);
      setTraceProgress(tp => Math.min(tp + 0.025, 1));
    }, 50);
    return () => clearInterval(pulseRef.current);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setActiveMoment(m => (m + 1) % 5);
      setTraceProgress(0);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [playing]);

  const stepForward = () => {
    setActiveMoment(m => (m + 1) % 5);
    setTraceProgress(0);
  };
  const stepBack = () => {
    setActiveMoment(m => (m - 1 + 5) % 5);
    setTraceProgress(0);
  };
  const selectMoment = (i) => {
    setActiveMoment(i);
    setTraceProgress(0);
  };

  const active = MOMENTS[activeMoment];
  const pulseScale = 1 + Math.sin(pulsePhase * 0.2) * 0.12;

  const containerStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: 520,
    margin: '0 auto',
    padding: 16,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 700,
    color: DARK,
    margin: '0 0 4px',
  };

  const subtitleStyle = {
    textAlign: 'center',
    fontSize: 12,
    color: GRAY,
    margin: '0 0 12px',
  };

  const btnBase = {
    border: 'none',
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.2s',
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>WHO 5 Moments of Hand Hygiene</h2>
      <p style={subtitleStyle}>Animated Visualizer</p>

      <svg viewBox="0 0 400 380" style={{ width: '100%', maxHeight: 380 }}>
        {/* Dashed connecting circle */}
        <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke={LIGHT_GRAY} strokeWidth="1.5" strokeDasharray="6 4" />

        {/* Patient zone - lighter inner circle */}
        <circle cx={CX} cy={CY} r={55} fill="#fef3c7" opacity="0.4" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" />
        <text x={CX} y={CY - 42} textAnchor="middle" fontSize="7" fill="#92400e" fontWeight="600">PATIENT ZONE</text>

        {/* Hospital bed */}
        <rect x={CX - 30} y={CY - 12} width={60} height={35} rx={3} fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
        <rect x={CX - 32} y={CY - 14} width={4} height={50} rx={1} fill="#d1d5db" />
        <rect x={CX + 28} y={CY - 14} width={4} height={50} rx={1} fill="#d1d5db" />
        {/* Pillow */}
        <rect x={CX - 22} y={CY - 8} width={16} height={10} rx={3} fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.5" />
        {/* Patient stick figure */}
        <circle cx={CX - 14} cy={CY - 2} r={5} fill="none" stroke="#6b7280" strokeWidth="1.2" />
        <line x1={CX - 14} y1={CY + 3} x2={CX - 14} y2={CY + 16} stroke="#6b7280" strokeWidth="1.2" />
        <line x1={CX - 14} y1={CY + 16} x2={CX - 8} y2={CY + 22} stroke="#6b7280" strokeWidth="1.2" />
        <line x1={CX - 14} y1={CY + 16} x2={CX - 20} y2={CY + 22} stroke="#6b7280" strokeWidth="1.2" />
        <line x1={CX - 14} y1={CY + 8} x2={CX - 4} y2={CY + 6} stroke="#6b7280" strokeWidth="1.2" />
        <line x1={CX - 14} y1={CY + 8} x2={CX - 24} y2={CY + 6} stroke="#6b7280" strokeWidth="1.2" />
        {/* IV pole */}
        <line x1={CX + 18} y1={CY - 30} x2={CX + 18} y2={CY + 5} stroke="#9ca3af" strokeWidth="1.5" />
        <line x1={CX + 12} y1={CY - 28} x2={CX + 24} y2={CY - 28} stroke="#9ca3af" strokeWidth="1.5" />
        <circle cx={CX + 12} cy={CY - 28} r={1.5} fill="#9ca3af" />
        <circle cx={CX + 24} cy={CY - 28} r={1.5} fill="#9ca3af" />
        {/* IV bag */}
        <rect x={CX + 9} y={CY - 40} width={6} height={10} rx={2} fill="#bfdbfe" stroke="#93c5fd" strokeWidth="0.5" />

        {/* Trace path from current to next */}
        {(() => {
          const curr = getMomentPos(active.angle);
          const nextM = MOMENTS[(activeMoment + 1) % 5];
          const next = getMomentPos(nextM.angle);
          const startAngle = (active.angle - 90) * (Math.PI / 180);
          const endAngle = (nextM.angle - 90) * (Math.PI / 180);
          let sweep = endAngle - startAngle;
          if (sweep < 0) sweep += 2 * Math.PI;
          const midAngle = startAngle + sweep * traceProgress;
          const midX = CX + RADIUS * Math.cos(midAngle);
          const midY = CY + RADIUS * Math.sin(midAngle);
          const largeArc = sweep * traceProgress > Math.PI ? 1 : 0;
          if (traceProgress <= 0) return null;
          return (
            <path
              d={`M ${curr.x} ${curr.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${midX} ${midY}`}
              fill="none"
              stroke={ORANGE}
              strokeWidth="2"
              strokeDasharray="4 3"
              opacity="0.6"
            />
          );
        })()}

        {/* Moment nodes */}
        {MOMENTS.map((m, i) => {
          const pos = getMomentPos(m.angle);
          const isActive = i === activeMoment;
          const color = isActive ? ORANGE : GRAY;
          const scale = isActive ? pulseScale : 1;
          const isBefore = m.label.startsWith('BEFORE');
          return (
            <g key={m.id} onClick={() => selectMoment(i)} style={{ cursor: 'pointer' }}>
              {/* Glow behind active */}
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r={28 * pulseScale} fill={ORANGE} opacity={0.1} />
              )}
              {/* Number circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={20 * scale}
                fill={isActive ? ORANGE : '#f3f4f6'}
                stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14 * scale}
                fontWeight="700"
                fill={isActive ? '#fff' : GRAY}
              >
                {m.id}
              </text>
              {/* Label */}
              <text
                x={pos.x}
                y={pos.y + 28}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="600"
                fill={color}
              >
                {isBefore ? 'BEFORE' : 'AFTER'}
              </text>
              <text
                x={pos.x}
                y={pos.y + 37}
                textAnchor="middle"
                fontSize="6.5"
                fill={isActive ? DARK : GRAY}
              >
                {m.label.replace(/^(BEFORE |AFTER )/, '')}
              </text>
              {/* Hand icon */}
              <HandIcon type={m.id} color={color} cx={pos.x} cy={pos.y - 28} size={16} />
            </g>
          );
        })}

        {/* Washing hands animation in center */}
        <g transform={`translate(${CX + 10},${CY - 28})`}>
          <WashingHands active={playing} />
        </g>

        {/* YOUR 5 MOMENTS label */}
        <text x={CX} y={370} textAnchor="middle" fontSize="9" fill={GRAY} fontWeight="500">
          YOUR 5 MOMENTS FOR HAND HYGIENE
        </text>
      </svg>

      {/* Active moment info */}
      <div style={{
        background: activeMoment !== null ? '#fff7ed' : '#f9fafb',
        border: `1px solid ${activeMoment !== null ? '#fed7aa' : LIGHT_GRAY}`,
        borderRadius: 10,
        padding: '10px 14px',
        marginTop: 8,
        minHeight: 70,
        transition: 'all 0.3s',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: ORANGE, marginBottom: 4 }}>
          {active.id}. {active.label}
        </div>
        <div style={{ fontSize: 12, color: DARK, marginBottom: 3 }}>
          <strong>WHEN:</strong> {active.when}
        </div>
        <div style={{ fontSize: 12, color: DARK }}>
          <strong>WHY:</strong> {active.why}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button
          onClick={stepBack}
          style={{ ...btnBase, background: LIGHT_GRAY, color: DARK }}
        >
          ◀
        </button>
        <button
          onClick={() => setPlaying(p => !p)}
          style={{ ...btnBase, background: ORANGE, color: '#fff', minWidth: 70 }}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={stepForward}
          style={{ ...btnBase, background: LIGHT_GRAY, color: DARK }}
        >
          ▶
        </button>
      </div>

      {/* Moment selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
        {MOMENTS.map((m, i) => (
          <button
            key={m.id}
            onClick={() => selectMoment(i)}
            style={{
              ...btnBase,
              width: 36,
              height: 36,
              borderRadius: '50%',
              padding: 0,
              background: i === activeMoment ? ORANGE : '#f3f4f6',
              color: i === activeMoment ? '#fff' : GRAY,
              border: `2px solid ${i === activeMoment ? ORANGE : LIGHT_GRAY}`,
              fontSize: 14,
            }}
          >
            {m.id}
          </button>
        ))}
      </div>
    </div>
  );
}
