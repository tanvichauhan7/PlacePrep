import { useState } from 'react';
import useAuthStore from '../../context/authStore';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function StreakCalendar() {
  const { user } = useAuthStore();
  const [monthOffset, setMonthOffset] = useState(0);

  const studyLog = new Set(user?.studyLog || []);
  const streak = user?.streak || 0;
  const maxStreak = user?.maxStreak || 0;

  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today.toISOString().split('T')[0];

  const getDateStr = (day) => new Date(year, month, day).toISOString().split('T')[0];
  const isFuture = (day) => { const d = new Date(year, month, day); d.setHours(0,0,0,0); const t = new Date(); t.setHours(0,0,0,0); return d > t; };
  const isToday = (day) => getDateStr(day) === todayStr;
  const studied = (day) => studyLog.has(getDateStr(day));

  const getEmoji = (day) => {
    if (isFuture(day)) return null;
    if (studied(day)) return '🔥';
    if (isToday(day)) return '⏰';
    return '😭';
  };

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const thisMonthStudied = Array.from({length: daysInMonth}, (_,i) => i+1).filter(d => studied(d)).length;

  return (
    <div style={styles.card}>
      <div style={styles.title}>Study Streak</div>

      <div style={styles.header}>
        <button onClick={() => setMonthOffset(o => o - 1)} style={styles.navBtn}>‹</button>
        <span style={styles.monthLabel}>{MONTHS[month].slice(0,3)} {year}</span>
        <button onClick={() => setMonthOffset(o => o + 1)} style={styles.navBtn} disabled={monthOffset >= 0} style={{ ...styles.navBtn, opacity: monthOffset >= 0 ? 0.3 : 1 }}>›</button>
      </div>

      <div style={styles.grid}>
        {DAYS.map(d => <div key={d} style={styles.dayLabel}>{d[0]}</div>)}
        {cells.map((day, i) => (
          <div key={i} style={{ ...styles.cell, ...(day && isToday(day) ? styles.todayCell : {}) }}>
            {day ? (
              <>
                <div style={{ fontSize: 14, lineHeight: 1 }}>{getEmoji(day)}</div>
                <div style={{ ...styles.dayNum, ...(isToday(day) ? styles.todayNum : {}) }}>{day}</div>
              </>
            ) : null}
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <div style={styles.stat}>
          <div style={styles.statVal}>{streak}</div>
          <div style={styles.statLabel}>🔥 Current</div>
        </div>
        <div style={styles.divider} />
        <div style={styles.stat}>
          <div style={styles.statVal}>{maxStreak}</div>
          <div style={styles.statLabel}>🏆 Best</div>
        </div>
        <div style={styles.divider} />
        <div style={styles.stat}>
          <div style={styles.statVal}>{thisMonthStudied}</div>
          <div style={styles.statLabel}>📅 Month</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  title: { fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer', padding: '0 6px', lineHeight: 1 },
  monthLabel: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 14 },
  dayLabel: { textAlign: 'center', fontSize: 11, fontWeight: 500, color: 'var(--muted)', paddingBottom: 6 },
  cell: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px 0', borderRadius: 7, minHeight: 42 },
  todayCell: { background: 'var(--accent-light)', outline: '1.5px solid var(--accent)' },
  dayNum: { fontSize: 10, color: 'var(--muted)', marginTop: 2 },
  todayNum: { color: 'var(--accent)', fontWeight: 700 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: 'var(--bg)', borderRadius: 10, padding: '12px 0', marginTop: 4 },
  stat: { textAlign: 'center', flex: 1 },
  statVal: { fontSize: 20, fontWeight: 700, color: 'var(--text)' },
  statLabel: { fontSize: 11, color: 'var(--muted)', marginTop: 3 },
  divider: { width: 1, height: 32, background: 'var(--border)' },
};