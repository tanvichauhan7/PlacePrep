import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar } from 'recharts';

export default function OverviewPanel({ subjects, reminders }) {
  const barData = subjects.map(s => ({
    name: s.name.split(' ')[0],
    pct: s.totalTopics ? Math.round((s.completedTopics / s.totalTopics) * 100) : 0,
    color: s.color,
    done: s.completedTopics,
    total: s.totalTopics,
  }));

  const totalTopics = subjects.reduce((a, s) => a + s.totalTopics, 0);
  const completedTopics = subjects.reduce((a, s) => a + s.completedTopics, 0);
  const overallPct = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const pendingReminders = reminders.filter(r => !r.isDone).length;
  const doneReminders = reminders.filter(r => r.isDone).length;

  const radialData = [{ name: 'Progress', value: overallPct, fill: '#3266ad' }];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{d.name}</div>
          <div style={{ color: 'var(--muted)' }}>{d.done}/{d.total} topics · {d.pct}%</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3 style={styles.title}>Your Progress Overview</h3>

      {/* Top stats */}
      <div style={styles.statsGrid}>
        <StatBox label="Overall completion" value={`${overallPct}%`} sub={`${completedTopics} of ${totalTopics} topics`} color="#3266ad" />
        <StatBox label="Tasks pending" value={pendingReminders} sub={`${doneReminders} completed`} color="#BA7517" />
        <StatBox label="Subjects tracked" value={subjects.length} sub="with topic checklists" color="#1D9E75" />
      </div>

      {/* Bar chart */}
      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>Subject-wise progress</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-subject breakdown */}
      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>Detailed breakdown</div>
        {subjects.map(s => {
          const pct = s.totalTopics ? Math.round((s.completedTopics / s.totalTopics) * 100) : 0;
          return (
            <div key={s._id} style={styles.row}>
              <div style={{ ...styles.dot, background: s.color }} />
              <div style={styles.rowLabel}>{s.name}</div>
              <div style={styles.rowBar}>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: s.color }} />
                </div>
              </div>
              <div style={styles.rowPct}>{pct}%</div>
              <div style={styles.rowCount}>{s.completedTopics}/{s.totalTopics}</div>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      {overallPct < 30 && (
        <div style={styles.tip}>
          💡 <strong>Tip:</strong> Start with DSA and Computer Networks — they carry the most weight in most placement tests.
        </div>
      )}
      {overallPct >= 30 && overallPct < 70 && (
        <div style={styles.tip}>
          🔥 You're making good progress! Focus on completing DBMS and OS to strengthen your core CS fundamentals.
        </div>
      )}
      {overallPct >= 70 && (
        <div style={{ ...styles.tip, background: 'var(--success-light)', borderColor: 'var(--success)', color: 'var(--success)' }}>
          🎉 Amazing! You're {overallPct}% done. Start practicing mock interviews and solving previous placement papers!
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.25rem' }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>
    </div>
  );
}

const styles = {
  title: { fontSize: 15, fontWeight: 600, marginBottom: '1rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '1.25rem' },
  chartCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem' },
  chartTitle: { fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  row: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  rowLabel: { fontSize: 13, fontWeight: 500, minWidth: 130 },
  rowBar: { flex: 1 },
  rowPct: { fontSize: 13, fontWeight: 600, minWidth: 36, textAlign: 'right', color: 'var(--muted)' },
  rowCount: { fontSize: 12, color: 'var(--muted)', minWidth: 45, textAlign: 'right' },
  tip: { background: 'var(--warning-light)', border: '1px solid #e6c07b', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#7a4e0d' },
};
