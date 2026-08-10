import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, Legend } from 'recharts';
import axios from '../../api/axios';
import useAuthStore from '../../context/authStore';

export default function OverviewPanel({ subjects, reminders }) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
        Loading statistics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
        Unable to load statistics. Please try again.
      </div>
    );
  }

  const { overview, questions: questionsStats, reminders: remindersStats, recentActivity } = stats;

  // Subject-wise progress
  const barData = subjects.map(s => ({
    name: s.name.split(' ')[0],
    pct: s.totalTopics ? Math.round((s.completedTopics / s.totalTopics) * 100) : 0,
    color: s.color,
    done: s.completedTopics,
    total: s.totalTopics,
  }));

  // Difficulty distribution for pie chart
  const difficultyData = [
    { name: 'Easy', value: questionsStats.byDifficulty.Easy, practiced: questionsStats.practicedByDifficulty.Easy, color: '#1D9E75' },
    { name: 'Medium', value: questionsStats.byDifficulty.Medium, practiced: questionsStats.practicedByDifficulty.Medium, color: '#BA7517' },
    { name: 'Hard', value: questionsStats.byDifficulty.Hard, practiced: questionsStats.practicedByDifficulty.Hard, color: '#dc2626' },
  ];

  // Calculate days to target
  let targetMessage = 'No target date set';
  let targetColor = 'var(--muted)';
  if (overview.daysToTarget !== null) {
    if (overview.daysToTarget < 0) {
      targetMessage = 'Target date passed';
      targetColor = '#dc2626';
    } else if (overview.daysToTarget === 0) {
      targetMessage = 'Target is today!';
      targetColor = '#BA7517';
    } else {
      targetMessage = `${overview.daysToTarget} days remaining`;
      targetColor = overview.daysToTarget < 30 ? '#BA7517' : '#1D9E75';
    }
  }

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

  const DifficultyTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{d.name}</div>
          <div style={{ color: 'var(--muted)' }}>Total: {d.value} questions</div>
          <div style={{ color: 'var(--success)' }}>Practiced: {d.practiced} ({d.value > 0 ? Math.round((d.practiced / d.value) * 100) : 0}%)</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Performance Overview</h3>
          <p style={styles.subtitle}>Comprehensive view of your placement preparation</p>
        </div>
        <div style={styles.userInfo}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user?.email}</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={styles.statsGrid}>
        <StatBox 
          label="Overall Completion" 
          value={`${overview.completionPercentage}%`} 
          sub={`${overview.completedTopics} of ${overview.totalTopics} topics`} 
          color="#3266ad"
          icon="🎯"
        />
        <StatBox 
          label="Current Streak" 
          value={overview.currentStreak} 
          sub={`Best: ${overview.maxStreak} days`} 
          color="#1D9E75"
          icon="🔥"
        />
        <StatBox 
          label="Questions Practiced" 
          value={`${questionsStats.practiced}/${questionsStats.total}`} 
          sub={`${questionsStats.practicedPercentage}% completed`} 
          color="#BA7517"
          icon="📝"
        />
        <StatBox 
          label="Target Date" 
          value={overview.daysToTarget !== null && overview.daysToTarget >= 0 ? overview.daysToTarget : '-'} 
          sub={targetMessage} 
          color={targetColor}
          icon="📅"
        />
      </div>

      {/* Recent Activity */}
      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>📊 Recent Activity (Last 7 Days)</div>
        <div style={styles.activityGrid}>
          <ActivityStat label="Topics Completed" value={recentActivity.topicsCompleted} color="#3266ad" />
          <ActivityStat label="Questions Added" value={recentActivity.questionsAdded} color="#1D9E75" />
          <ActivityStat label="Questions Practiced" value={recentActivity.questionsPracticed} color="#BA7517" />
        </div>
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Subject Progress */}
        <div style={{ ...styles.chartCard, flex: 1 }}>
          <div style={styles.chartTitle}>📚 Subject-wise Progress</div>
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

        {/* Question Difficulty Distribution */}
        <div style={{ ...styles.chartCard, flex: 1 }}>
          <div style={styles.chartTitle}>🎯 Questions by Difficulty</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<DifficultyTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={styles.legendContainer}>
            {difficultyData.map(item => (
              <div key={item.name} style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: item.color }} />
                <span style={{ fontSize: 12 }}>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Subject Breakdown */}
      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>📋 Detailed Subject Breakdown</div>
        {subjects.map(s => {
          const pct = s.totalTopics ? Math.round((s.completedTopics / s.totalTopics) * 100) : 0;
          const questionsInSubject = questionsStats.bySubject[s.name] || 0;
          const practicedInSubject = questionsStats.practicedBySubject[s.name] || 0;
          
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
              <div style={styles.questionCount}>
                📝 {practicedInSubject}/{questionsInSubject}
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Insights */}
      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>💡 Performance Insights</div>
        <div style={styles.insightsGrid}>
          {overview.completionPercentage < 30 && (
            <InsightCard 
              icon="🎯" 
              title="Getting Started" 
              message="You're in the early stages. Focus on DSA and Computer Networks first — they're crucial for placements!"
              type="info"
            />
          )}
          {overview.completionPercentage >= 30 && overview.completionPercentage < 70 && (
            <InsightCard 
              icon="🔥" 
              title="Great Progress!" 
              message="You're making solid progress! Now strengthen your fundamentals with DBMS and Operating Systems."
              type="success"
            />
          )}
          {overview.completionPercentage >= 70 && (
            <InsightCard 
              icon="🎉" 
              title="Almost There!" 
              message={`Amazing! You're ${overview.completionPercentage}% done. Start practicing mock interviews and company-specific questions!`}
              type="success"
            />
          )}
          
          {overview.currentStreak === 0 && (
            <InsightCard 
              icon="⚡" 
              title="Build Your Streak" 
              message="Complete a topic today to start your study streak! Consistency is key for placement preparation."
              type="warning"
            />
          )}
          {overview.currentStreak >= 7 && (
            <InsightCard 
              icon="🏆" 
              title="Streak Master!" 
              message={`${overview.currentStreak} days streak! Your consistency is impressive. Keep it up!`}
              type="success"
            />
          )}

          {questionsStats.practicedPercentage < 50 && questionsStats.total > 0 && (
            <InsightCard 
              icon="📚" 
              title="Practice More" 
              message={`You've only practiced ${questionsStats.practicedPercentage}% of your questions. Regular practice is essential!`}
              type="warning"
            />
          )}

          {remindersStats.pending > 5 && (
            <InsightCard 
              icon="⏰" 
              title="Pending Reminders" 
              message={`You have ${remindersStats.pending} pending reminders. Check them to stay on track!`}
              type="info"
            />
          )}

          {overview.daysToTarget !== null && overview.daysToTarget > 0 && overview.daysToTarget < 30 && (
            <InsightCard 
              icon="⚠️" 
              title="Target Approaching!" 
              message={`Only ${overview.daysToTarget} days until your target date! Focus on high-priority topics.`}
              type="warning"
            />
          )}
        </div>
      </div>

      {/* Study Summary */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryTitle}>📈 Overall Summary</div>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Subjects Tracked</div>
            <div style={styles.summaryValue}>{overview.totalSubjects}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Total Topics</div>
            <div style={styles.summaryValue}>{overview.totalTopics}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Completed Topics</div>
            <div style={styles.summaryValue}>{overview.completedTopics}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Total Questions</div>
            <div style={styles.summaryValue}>{questionsStats.total}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Practiced Questions</div>
            <div style={styles.summaryValue}>{questionsStats.practiced}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Total Reminders</div>
            <div style={styles.summaryValue}>{remindersStats.total}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color, icon }) {
  return (
    <div style={styles.statBox}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>
    </div>
  );
}

function ActivityStat({ label, value, color }) {
  return (
    <div style={styles.activityStat}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function InsightCard({ icon, title, message, type }) {
  const bgColors = {
    info: 'var(--accent-light)',
    success: 'var(--success-light)',
    warning: 'var(--warning-light)',
  };
  
  const borderColors = {
    info: 'var(--accent)',
    success: 'var(--success)',
    warning: '#e6c07b',
  };

  return (
    <div style={{ ...styles.insightCard, background: bgColors[type], borderColor: borderColors[type] }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text)', opacity: 0.8 }}>{message}</div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'var(--muted)' },
  userInfo: { textAlign: 'right' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: '1.5rem' },
  statBox: { 
    background: 'var(--surface)', 
    border: '1px solid var(--border)', 
    borderRadius: 12, 
    padding: '1.25rem', 
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  chartCard: { 
    background: 'var(--surface)', 
    border: '1px solid var(--border)', 
    borderRadius: 12, 
    padding: '1.25rem', 
    marginBottom: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  chartTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', letterSpacing: '0.03em' },
  chartsRow: { display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  legendContainer: { display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: '50%' },
  row: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' },
  dot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  rowLabel: { fontSize: 13, fontWeight: 500, minWidth: 150 },
  rowBar: { flex: 1 },
  rowPct: { fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: 'right', color: 'var(--text)' },
  rowCount: { fontSize: 12, color: 'var(--muted)', minWidth: 50, textAlign: 'right' },
  questionCount: { fontSize: 11, color: 'var(--muted)', minWidth: 60, textAlign: 'right' },
  activityGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  activityStat: { textAlign: 'center', padding: '1rem', background: 'var(--bg)', borderRadius: 8 },
  insightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 },
  insightCard: { 
    border: '1px solid', 
    borderRadius: 10, 
    padding: '1rem 1.25rem',
    transition: 'transform 0.2s',
  },
  summaryCard: {
    background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--success-light) 100%)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.5rem',
    marginTop: '1.5rem',
  },
  summaryTitle: { fontSize: 15, fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 },
  summaryItem: { textAlign: 'center' },
  summaryLabel: { fontSize: 11, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  summaryValue: { fontSize: 24, fontWeight: 700, color: 'var(--accent)' },
};

