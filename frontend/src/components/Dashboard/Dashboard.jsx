import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import SubjectPanel from '../Subjects/SubjectPanel';
import RemindersPanel from '../Reminders/RemindersPanel';
import OverviewPanel from '../Overview/OverviewPanel';
import api from '../../api/axios';
import useAuthStore from '../../context/authStore';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Subjects');
  const [subjects, setSubjects] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, r] = await Promise.all([api.get('/subjects'), api.get('/reminders')]);
      setSubjects(s.data);
      setReminders(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalTopics = subjects.reduce((a, s) => a + s.totalTopics, 0);
  const completedTopics = subjects.reduce((a, s) => a + s.completedTopics, 0);
  const overallPct = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem' }}>
        {/* Stats row */}
        <div style={styles.statsRow}>
          <div style={styles.greeting}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Hey, {user?.name?.split(' ')[0]} 👋</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</p>
          </div>
          <div style={styles.metricCards}>
            <MetricCard label="Overall progress" value={`${overallPct}%`} color="var(--accent)" />
            <MetricCard label="Topics done" value={completedTopics} color="var(--success)" />
            <MetricCard label="Remaining" value={totalTopics - completedTopics} color="var(--warning)" />
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${overallPct}%`, background: 'var(--accent)' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading...</div>
        ) : (
          <>
            {activeTab === 'Subjects' && <SubjectPanel subjects={subjects} setSubjects={setSubjects} />}
            {activeTab === 'Reminders' && <RemindersPanel reminders={reminders} setReminders={setReminders} />}
            {activeTab === 'Overview' && <OverviewPanel subjects={subjects} reminders={reminders} />}
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', minWidth: 110 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

const styles = {
  statsRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: '1rem' },
  greeting: { flex: 1 },
  metricCards: { display: 'flex', gap: 10, flexWrap: 'wrap' },
};
