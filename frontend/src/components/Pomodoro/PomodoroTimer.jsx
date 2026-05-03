import { useState, useEffect, useRef } from 'react';

const MODES = {
  focus: { label: 'Focus session', color: '#3266ad' },
  short: { label: 'Short break', color: '#1D9E75' },
  long: { label: 'Long break', color: '#BA7517' },
};

const SUBJECTS = ['DSA', 'DBMS', 'OS', 'Computer Networks', 'OOPs / Java', 'Aptitude / Quant'];
const SUBJECT_COLORS = { DSA:'#3266ad', DBMS:'#1D9E75', OS:'#BA7517', 'Computer Networks':'#534AB7', 'OOPs / Java':'#993556', 'Aptitude / Quant':'#73726c' };
const CIRC = 2 * Math.PI * 88;

export default function PomodoroTimer() {
  const [mode, setMode] = useState('focus');
  const [customMins, setCustomMins] = useState({ focus: 25, short: 5, long: 15 });
  const [editingMode, setEditingMode] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [remaining, setRemaining] = useState(25 * 60);
  const [totalSecs, setTotalSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [subject, setSubject] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const switchMode = (m) => {
    if (running) return;
    setMode(m);
    const secs = customMins[m] * 60;
    setTotalSecs(secs);
    setRemaining(secs);
  };

  const startEdit = (m, e) => {
    e.stopPropagation();
    if (running) return;
    setEditingMode(m);
    setEditVal(String(customMins[m]));
  };

  const saveEdit = () => {
    const val = Math.min(120, Math.max(1, parseInt(editVal) || customMins[editingMode]));
    const updated = { ...customMins, [editingMode]: val };
    setCustomMins(updated);
    if (editingMode === mode) {
      setTotalSecs(val * 60);
      setRemaining(val * 60);
    }
    setEditingMode(null);
  };

  const toggleTimer = () => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleComplete = () => {
    if (mode === 'focus') {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSessions(prev => [{
        subject: subject || 'General',
        mins: customMins.focus,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }, ...prev]);
      const next = newStreak % 4 === 0 ? 'long' : 'short';
      setTimeout(() => switchMode(next), 800);
    } else {
      setTimeout(() => switchMode('focus'), 800);
    }
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setRemaining(totalSecs);
  };

  const skip = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const next = mode === 'focus' ? 'short' : 'focus';
    switchMode(next);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = remaining / totalSecs;
  const offset = CIRC * pct;
  const totalFocusMins = sessions.reduce((a, s) => a + s.mins, 0);

  return (
    <div>
      <h3 style={styles.title}>Pomodoro Timer</h3>

      <div style={styles.layout}>
        {/* Left — Timer */}
        <div style={styles.timerCard}>
          {/* Mode buttons */}
          <div style={styles.modeRow}>
            {Object.entries(MODES).map(([m, cfg]) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{ ...styles.modeBtn, ...(mode === m ? { background: cfg.color + '22', color: cfg.color, borderColor: cfg.color } : {}) }}
              >
                <span>{m === 'focus' ? 'Focus' : m === 'short' ? 'Short break' : 'Long break'}</span>
                {editingMode === m ? (
                  <input
                    type="number" value={editVal} min={1} max={120}
                    onChange={e => setEditVal(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    onClick={e => e.stopPropagation()}
                    autoFocus
                    style={styles.editInput}
                  />
                ) : (
                  <span
                    onClick={e => startEdit(m, e)}
                    style={styles.editableMin}
                    title="Click to edit duration"
                  >
                    {customMins[m]}m ✎
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Ring */}
          <div style={styles.ringWrap}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="88" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="100" cy="100" r="88" fill="none"
                stroke={MODES[mode].color} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC - offset}
                style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s' }}
              />
            </svg>
            <div style={styles.timeDisplay}>
              <div style={{ ...styles.timeText, color: MODES[mode].color }}>
                {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
              </div>
              <div style={styles.timeLabel}>{MODES[mode].label}</div>
            </div>
          </div>

          {/* Subject */}
          <select value={subject} onChange={e => setSubject(e.target.value)} style={styles.select}>
            <option value="">Select subject...</option>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Controls */}
          <div style={styles.controls}>
            <button onClick={reset} className="btn btn-secondary btn-sm">Reset</button>
            <button
              onClick={toggleTimer}
              style={{ ...styles.startBtn, background: MODES[mode].color }}
            >
              {running ? 'Pause' : remaining === totalSecs ? 'Start' : 'Resume'}
            </button>
            <button onClick={skip} className="btn btn-secondary btn-sm">Skip</button>
          </div>
        </div>

        {/* Right — Stats + Log */}
        <div style={styles.rightCol}>
          <div style={styles.statsGrid}>
            <StatCard label="Sessions" value={sessions.length} />
            <StatCard label="Focus time" value={totalFocusMins >= 60 ? `${Math.floor(totalFocusMins/60)}h ${totalFocusMins%60}m` : `${totalFocusMins}m`} />
            <StatCard label="Streak" value={`${streak} 🔥`} />
          </div>

          <div style={styles.logCard}>
            <div style={styles.logTitle}>Today's sessions</div>
            {sessions.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                No sessions yet. Start focusing!
              </div>
            ) : (
              sessions.map((s, i) => (
                <div key={i} style={styles.logItem}>
                  <div style={styles.logLeft}>
                    <div style={{ ...styles.logDot, background: SUBJECT_COLORS[s.subject] || '#3266ad' }} />
                    <span style={styles.logSubject}>{s.subject}</span>
                  </div>
                  <span style={styles.logMeta}>{s.mins} min · {s.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

const styles = {
  title: { fontSize: 15, fontWeight: 600, marginBottom: '1rem' },
  layout: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' },
  timerCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', flex: '0 0 320px', textAlign: 'center' },
  modeRow: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.5rem' },
  modeBtn: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', transition: 'all 0.15s' },
  editableMin: { fontSize: 12, cursor: 'pointer', opacity: 0.8, borderBottom: '1px dashed var(--muted)' },
  editInput: { width: 48, fontSize: 12, padding: '2px 4px', border: '1px solid var(--accent)', borderRadius: 4, textAlign: 'center', background: 'var(--surface)', color: 'var(--text)' },
  ringWrap: { position: 'relative', width: 200, height: 200, margin: '0 auto 1.5rem' },
  timeDisplay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' },
  timeText: { fontSize: 38, fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
  timeLabel: { fontSize: 12, color: 'var(--muted)', marginTop: 4 },
  select: { width: '100%', marginBottom: '1rem', fontSize: 13 },
  controls: { display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' },
  startBtn: { color: '#fff', border: 'none', borderRadius: 8, padding: '8px 32px', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  rightCol: { flex: 1, minWidth: 220 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 },
  logCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', maxHeight: 340, overflowY: 'auto' },
  logTitle: { fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 },
  logItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' },
  logLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  logDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  logSubject: { fontSize: 13, fontWeight: 500, color: 'var(--text)' },
  logMeta: { fontSize: 12, color: 'var(--muted)' },
};