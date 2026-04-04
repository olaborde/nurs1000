import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Gait Data ──────────────────────────────────────────────────────────────────
const GAITS = {
  twoPoint: {
    name: 'Two-Point Gait',
    facts: 'Partial weight bearing on both feet • Faster, less support than 4-point',
    hasAffected: false,
    steps: [
      {
        label: 'Beginning Stance',
        desc: 'Both feet and both crutches on the ground, side by side.',
        positions: {
          leftFoot:   { x: 120, y: 220, weight: true },
          rightFoot:  { x: 200, y: 220, weight: true },
          leftCrutch: { x: 100, y: 210, weight: true },
          rightCrutch:{ x: 220, y: 210, weight: true },
        },
        moving: [],
      },
      {
        label: 'Step 1: Right Foot + Left Crutch',
        desc: 'Advance right foot and left crutch together (opposite limbs).',
        positions: {
          leftFoot:   { x: 120, y: 220, weight: true },
          rightFoot:  { x: 200, y: 170, weight: false },
          leftCrutch: { x: 100, y: 160, weight: false },
          rightCrutch:{ x: 220, y: 210, weight: true },
        },
        moving: ['rightFoot', 'leftCrutch'],
      },
      {
        label: 'Step 2: Left Foot + Right Crutch',
        desc: 'Advance left foot and right crutch together (opposite limbs).',
        positions: {
          leftFoot:   { x: 120, y: 170, weight: false },
          rightFoot:  { x: 200, y: 170, weight: true },
          leftCrutch: { x: 100, y: 160, weight: true },
          rightCrutch:{ x: 220, y: 160, weight: false },
        },
        moving: ['leftFoot', 'rightCrutch'],
      },
    ],
  },
  threePoint: {
    name: 'Three-Point Gait',
    facts: 'Non-weight bearing on affected (left) foot • Requires good balance & arm strength',
    hasAffected: true,
    affectedSide: 'left',
    steps: [
      {
        label: 'Beginning Stance',
        desc: 'Weight on right (good) leg. Both crutches and affected foot forward.',
        positions: {
          leftFoot:   { x: 120, y: 220, weight: false },
          rightFoot:  { x: 200, y: 220, weight: true },
          leftCrutch: { x: 100, y: 210, weight: true },
          rightCrutch:{ x: 220, y: 210, weight: true },
        },
        moving: [],
      },
      {
        label: 'Step 1: Affected Foot + Both Crutches',
        desc: 'Advance affected (left) foot and both crutches together.',
        positions: {
          leftFoot:   { x: 120, y: 165, weight: false },
          rightFoot:  { x: 200, y: 220, weight: true },
          leftCrutch: { x: 100, y: 155, weight: false },
          rightCrutch:{ x: 220, y: 155, weight: false },
        },
        moving: ['leftFoot', 'leftCrutch', 'rightCrutch'],
      },
      {
        label: 'Step 2: Good Foot Forward',
        desc: 'Advance right (good) foot past crutches, bearing weight.',
        positions: {
          leftFoot:   { x: 120, y: 165, weight: false },
          rightFoot:  { x: 200, y: 160, weight: false },
          leftCrutch: { x: 100, y: 155, weight: true },
          rightCrutch:{ x: 220, y: 155, weight: true },
        },
        moving: ['rightFoot'],
      },
    ],
  },
  fourPoint: {
    name: 'Four-Point Gait',
    facts: 'Partial weight bearing on both feet • Maximum support, 3 points always on floor',
    hasAffected: false,
    steps: [
      {
        label: 'Beginning Stance',
        desc: 'Both feet and both crutches on the ground. Most stable position.',
        positions: {
          leftFoot:   { x: 120, y: 220, weight: true },
          rightFoot:  { x: 200, y: 220, weight: true },
          leftCrutch: { x: 100, y: 210, weight: true },
          rightCrutch:{ x: 220, y: 210, weight: true },
        },
        moving: [],
      },
      {
        label: 'Step 1: Right Crutch',
        desc: 'Advance right crutch forward.',
        positions: {
          leftFoot:   { x: 120, y: 220, weight: true },
          rightFoot:  { x: 200, y: 220, weight: true },
          leftCrutch: { x: 100, y: 210, weight: true },
          rightCrutch:{ x: 220, y: 175, weight: false },
        },
        moving: ['rightCrutch'],
      },
      {
        label: 'Step 2: Left Foot',
        desc: 'Advance left foot forward.',
        positions: {
          leftFoot:   { x: 120, y: 185, weight: false },
          rightFoot:  { x: 200, y: 220, weight: true },
          leftCrutch: { x: 100, y: 210, weight: true },
          rightCrutch:{ x: 220, y: 175, weight: true },
        },
        moving: ['leftFoot'],
      },
      {
        label: 'Step 3: Left Crutch',
        desc: 'Advance left crutch forward.',
        positions: {
          leftFoot:   { x: 120, y: 185, weight: true },
          rightFoot:  { x: 200, y: 220, weight: true },
          leftCrutch: { x: 100, y: 175, weight: false },
          rightCrutch:{ x: 220, y: 175, weight: true },
        },
        moving: ['leftCrutch'],
      },
      {
        label: 'Step 4: Right Foot',
        desc: 'Advance right foot forward.',
        positions: {
          leftFoot:   { x: 120, y: 185, weight: true },
          rightFoot:  { x: 200, y: 185, weight: false },
          leftCrutch: { x: 100, y: 175, weight: true },
          rightCrutch:{ x: 220, y: 175, weight: true },
        },
        moving: ['rightFoot'],
      },
    ],
  },
  swingThrough: {
    name: 'Swing-Through Gait',
    facts: 'Weight bearing with braces • Requires arm strength & coordination • Most advanced',
    hasAffected: false,
    steps: [
      {
        label: 'Beginning Stance',
        desc: 'Both feet together, both crutches at sides. Tripod position.',
        positions: {
          leftFoot:   { x: 140, y: 220, weight: true },
          rightFoot:  { x: 180, y: 220, weight: true },
          leftCrutch: { x: 105, y: 210, weight: true },
          rightCrutch:{ x: 215, y: 210, weight: true },
        },
        moving: [],
      },
      {
        label: 'Step 1: Both Crutches Forward',
        desc: 'Advance both crutches together ahead of the body.',
        positions: {
          leftFoot:   { x: 140, y: 220, weight: true },
          rightFoot:  { x: 180, y: 220, weight: true },
          leftCrutch: { x: 105, y: 155, weight: false },
          rightCrutch:{ x: 215, y: 155, weight: false },
        },
        moving: ['leftCrutch', 'rightCrutch'],
      },
      {
        label: 'Step 2: Swing Both Feet Through',
        desc: 'Lift both feet and swing forward, landing in front of crutches.',
        positions: {
          leftFoot:   { x: 140, y: 140, weight: false },
          rightFoot:  { x: 180, y: 140, weight: false },
          leftCrutch: { x: 105, y: 155, weight: true },
          rightCrutch:{ x: 215, y: 155, weight: true },
        },
        moving: ['leftFoot', 'rightFoot'],
      },
    ],
  },
};

const GAIT_KEYS = ['twoPoint', 'threePoint', 'fourPoint', 'swingThrough'];
const TAB_LABELS = ['2-Point', '3-Point', '4-Point', 'Swing-Through'];

const COLORS = {
  affected: '#f59e0b',
  good: '#374151',
  crutchFill: '#6b7280',
  crutchBorder: '#374151',
  indigo: '#4f46e5',
  lightIndigo: '#c7d2fe',
  white: '#ffffff',
  floorLine: '#d1d5db',
  bg: '#f9fafb',
};

// ── SVG sub-components ─────────────────────────────────────────────────────────

function Foot({ x, y, isAffected, weight, isMoving, label }) {
  const fill = isAffected ? COLORS.affected : COLORS.good;
  const glowFilter = isMoving ? 'url(#movingGlow)' : undefined;
  return (
    <g filter={glowFilter} style={{ transition: 'transform 0.5s ease-in-out' }}>
      {/* shoe body */}
      <rect
        x={x - 13} y={y - 22} width={26} height={44} rx={6}
        fill={weight ? fill : 'none'}
        stroke={fill}
        strokeWidth={2}
        strokeDasharray={weight ? 'none' : '4 3'}
        opacity={isMoving ? 1 : 0.85}
      />
      {/* toe bump */}
      <ellipse
        cx={x} cy={y - 24} rx={10} ry={6}
        fill={weight ? fill : 'none'}
        stroke={fill}
        strokeWidth={2}
        strokeDasharray={weight ? 'none' : '4 3'}
      />
      {/* label */}
      <text x={x} y={y + 4} textAnchor="middle" fontSize={9} fill={COLORS.white} fontWeight="bold">
        {label}
      </text>
      {/* movement arrow */}
      {isMoving && (
        <g>
          <line x1={x} y1={y - 34} x2={x} y2={y - 46} stroke={COLORS.indigo} strokeWidth={2} markerEnd="url(#arrowHead)" />
        </g>
      )}
    </g>
  );
}

function CrutchTip({ x, y, weight, isMoving }) {
  const glowFilter = isMoving ? 'url(#movingGlow)' : undefined;
  return (
    <g filter={glowFilter}>
      <circle
        cx={x} cy={y} r={7}
        fill={weight ? COLORS.crutchFill : 'none'}
        stroke={COLORS.crutchBorder}
        strokeWidth={2}
        strokeDasharray={weight ? 'none' : '4 3'}
      />
      {/* small + inside to indicate crutch */}
      <line x1={x - 3} y1={y} x2={x + 3} y2={y} stroke={weight ? COLORS.white : COLORS.crutchBorder} strokeWidth={1.5} />
      <line x1={x} y1={y - 3} x2={x} y2={y + 3} stroke={weight ? COLORS.white : COLORS.crutchBorder} strokeWidth={1.5} />
      {isMoving && (
        <line x1={x} y1={y - 14} x2={x} y2={y - 24} stroke={COLORS.indigo} strokeWidth={2} markerEnd="url(#arrowHead)" />
      )}
    </g>
  );
}

function StepNumber({ x, y, num }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill={COLORS.indigo} />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize={10} fill={COLORS.white} fontWeight="bold">{num}</text>
    </g>
  );
}

// ── Legend ──────────────────────────────────────────────────────────────────────

function Legend({ hasAffected }) {
  return (
    <g transform="translate(10, 10)">
      <rect x={0} y={0} width={hasAffected ? 310 : 250} height={22} rx={4} fill="rgba(255,255,255,0.9)" stroke="#e5e7eb" strokeWidth={1} />
      {hasAffected && (
        <>
          <rect x={6} y={5} width={12} height={12} rx={3} fill={COLORS.affected} />
          <text x={22} y={14} fontSize={9} fill="#374151">Affected</text>
        </>
      )}
      <rect x={hasAffected ? 72 : 6} y={5} width={12} height={12} rx={3} fill={COLORS.good} />
      <text x={hasAffected ? 88 : 22} y={14} fontSize={9} fill="#374151">Good foot</text>
      <circle cx={hasAffected ? 145 : 80} cy={11} r={5} fill={COLORS.crutchFill} stroke={COLORS.crutchBorder} strokeWidth={1.5} />
      <text x={hasAffected ? 155 : 90} y={14} fontSize={9} fill="#374151">Crutch</text>
      <rect x={hasAffected ? 195 : 130} y={5} width={12} height={12} rx={3} fill="none" stroke="#374151" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={hasAffected ? 212 : 147} y={14} fontSize={9} fill="#374151">Lifted / moving</text>
    </g>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function CrutchGaitAnimator() {
  const [gaitKey, setGaitKey] = useState('twoPoint');
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const timerRef = useRef(null);

  const gait = GAITS[gaitKey];
  const step = gait.steps[stepIdx];
  const totalSteps = gait.steps.length;

  // animated positions
  const [positions, setPositions] = useState(step.positions);
  const [movingSet, setMovingSet] = useState(new Set());

  // Update positions when step changes
  useEffect(() => {
    setPositions(step.positions);
    setMovingSet(new Set(step.moving));
  }, [stepIdx, gaitKey]);

  // Reset step when gait changes
  useEffect(() => {
    setStepIdx(0);
  }, [gaitKey]);

  // Auto-play timer
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(() => {
      setStepIdx(prev => {
        if (prev >= totalSteps - 1) {
          // pause longer before restarting
          setTimeout(() => setStepIdx(0), 800);
          return prev;
        }
        return prev + 1;
      });
    }, stepIdx === 0 ? 1800 : 1400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, stepIdx, totalSteps]);

  const goStep = useCallback((dir) => {
    setStepIdx(prev => {
      const next = prev + dir;
      if (next < 0) return totalSteps - 1;
      if (next >= totalSteps) return 0;
      return next;
    });
  }, [totalSteps]);

  const isAffectedFoot = (key) => {
    if (!gait.hasAffected) return false;
    return key === (gait.affectedSide === 'left' ? 'leftFoot' : 'rightFoot');
  };

  // ── Styles ─────────────────────────────────────────────────────
  const S = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: COLORS.white,
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      maxWidth: 480,
      margin: '0 auto',
    },
    header: {
      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
      padding: '14px 16px 10px',
      color: COLORS.white,
    },
    title: { margin: 0, fontSize: 17, fontWeight: 700 },
    facts: { margin: '4px 0 0', fontSize: 11, opacity: 0.9 },
    tabs: {
      display: 'flex',
      gap: 0,
      borderBottom: '1px solid #e5e7eb',
    },
    tab: (active) => ({
      flex: 1,
      padding: '8px 4px',
      fontSize: 12,
      fontWeight: active ? 700 : 500,
      background: active ? '#eef2ff' : COLORS.white,
      color: active ? COLORS.indigo : '#6b7280',
      border: 'none',
      borderBottom: active ? `2px solid ${COLORS.indigo}` : '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    svgWrap: {
      background: COLORS.bg,
      padding: '4px 0',
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '8px 16px',
      borderTop: '1px solid #f3f4f6',
    },
    btn: (variant) => ({
      padding: variant === 'icon' ? '6px 10px' : '6px 14px',
      fontSize: 13,
      fontWeight: 600,
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: COLORS.white,
      color: '#374151',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      transition: 'all 0.15s',
    }),
    dots: {
      display: 'flex',
      gap: 5,
      alignItems: 'center',
    },
    dot: (active) => ({
      width: active ? 10 : 7,
      height: active ? 10 : 7,
      borderRadius: '50%',
      background: active ? COLORS.indigo : '#d1d5db',
      transition: 'all 0.2s',
    }),
    stepDesc: {
      padding: '8px 16px 6px',
      fontSize: 13,
      color: '#374151',
      textAlign: 'center',
      minHeight: 38,
      lineHeight: 1.4,
    },
    stepLabel: {
      fontWeight: 700,
      color: COLORS.indigo,
      fontSize: 12,
      display: 'block',
      marginBottom: 2,
    },
    chartToggle: {
      textAlign: 'center',
      padding: '0 16px 12px',
    },
    chartBtn: {
      background: 'none',
      border: 'none',
      color: COLORS.indigo,
      fontSize: 12,
      cursor: 'pointer',
      textDecoration: 'underline',
      fontWeight: 600,
    },
    chartImg: {
      maxWidth: '100%',
      borderRadius: 8,
      margin: '8px 16px 12px',
      display: 'block',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    },
  };

  return (
    <div style={S.container}>
      {/* Header */}
      <div style={S.header}>
        <h3 style={S.title}>{gait.name}</h3>
        <p style={S.facts}>{gait.facts}</p>
      </div>

      {/* Gait tabs */}
      <div style={S.tabs}>
        {GAIT_KEYS.map((k, i) => (
          <button
            key={k}
            style={S.tab(k === gaitKey)}
            onClick={() => { setGaitKey(k); setPlaying(true); }}
          >
            {TAB_LABELS[i]}
          </button>
        ))}
      </div>

      {/* SVG Canvas */}
      <div style={S.svgWrap}>
        <svg viewBox="0 0 320 260" style={{ width: '100%', maxHeight: 280, display: 'block' }}>
          <defs>
            <filter id="movingGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feColorMatrix in="blur" type="matrix"
                values="0.3 0 0 0 0.3  0 0.27 0 0 0.27  0 0 0.9 0 0.9  0 0 0 0.5 0" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={COLORS.indigo} />
            </marker>
          </defs>

          {/* Floor line */}
          <line x1={30} y1={248} x2={290} y2={248} stroke={COLORS.floorLine} strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={160} y={258} textAnchor="middle" fontSize={8} fill="#9ca3af">floor</text>

          {/* Legend */}
          <Legend hasAffected={gait.hasAffected} />

          {/* Labels */}
          <text x={positions.leftCrutch.x} y={42} textAnchor="middle" fontSize={8} fill="#9ca3af">L crutch</text>
          <text x={positions.leftFoot.x} y={42} textAnchor="middle" fontSize={8} fill="#9ca3af">L foot</text>
          <text x={positions.rightFoot.x} y={42} textAnchor="middle" fontSize={8} fill="#9ca3af">R foot</text>
          <text x={positions.rightCrutch.x} y={42} textAnchor="middle" fontSize={8} fill="#9ca3af">R crutch</text>

          {/* Crutch tips */}
          <CrutchTip x={positions.leftCrutch.x} y={positions.leftCrutch.y}
            weight={positions.leftCrutch.weight} isMoving={movingSet.has('leftCrutch')} />
          <CrutchTip x={positions.rightCrutch.x} y={positions.rightCrutch.y}
            weight={positions.rightCrutch.weight} isMoving={movingSet.has('rightCrutch')} />

          {/* Feet */}
          <Foot x={positions.leftFoot.x} y={positions.leftFoot.y}
            isAffected={isAffectedFoot('leftFoot')} weight={positions.leftFoot.weight}
            isMoving={movingSet.has('leftFoot')} label="L" />
          <Foot x={positions.rightFoot.x} y={positions.rightFoot.y}
            isAffected={isAffectedFoot('rightFoot')} weight={positions.rightFoot.weight}
            isMoving={movingSet.has('rightFoot')} label="R" />

          {/* Step number badge */}
          {stepIdx > 0 && (
            <StepNumber x={280} y={55} num={stepIdx} />
          )}
        </svg>
      </div>

      {/* Step description */}
      <div style={S.stepDesc}>
        <span style={S.stepLabel}>{step.label}</span>
        {step.desc}
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 6px' }}>
        <div style={S.dots}>
          {gait.steps.map((_, i) => (
            <div key={i} style={S.dot(i === stepIdx)} onClick={() => setStepIdx(i)} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={S.controls}>
        <button style={S.btn('icon')} onClick={() => goStep(-1)} title="Previous step">◀</button>
        <button
          style={{ ...S.btn('icon'), background: playing ? '#eef2ff' : COLORS.white, color: playing ? COLORS.indigo : '#374151' }}
          onClick={() => setPlaying(p => !p)}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <button style={S.btn('icon')} onClick={() => goStep(1)} title="Next step">▶</button>
        <button style={S.btn('icon')} onClick={() => { setStepIdx(0); setPlaying(true); }} title="Restart">↺</button>
      </div>

      {/* Reference chart toggle */}
      <div style={S.chartToggle}>
        <button style={S.chartBtn} onClick={() => setShowChart(v => !v)}>
          {showChart ? 'Hide Reference Chart ▲' : 'Show Reference Chart ▼'}
        </button>
        {showChart && (
          <img
            src="/crutch_gaits_chart.jpg"
            alt="Crutch Gaits Reference Chart"
            style={S.chartImg}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
      </div>
    </div>
  );
}

export default CrutchGaitAnimator;
