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
  const { user, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
    fetchAll();
  }, []);

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

  const daysLeft = user?.targetDate
    ? Math.max(0, Math.ceil((new Date(user.targetDate) - new Date()) / 86400000))
    : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem' }}>
        <div style={styles.statsRow}>
          <div style={styles.greeting}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Hey, {user?.name?.split(' ')[0]} 👋</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</p>
          </div>
          <div style={styles.metricCards}>
            <MetricCard label="Overall progress" value={`${overallPct}%`} color="var(--accent)" />
            <MetricCard label="Topics done" value={completedTopics} color="var(--success)" />
            <MetricCard label="Remaining" value={totalTopics - completedTopics} color="var(--warning)" />
            {user?.streak > 0 && (
              <MetricCard label="Day streak 🔥" value={user.streak} color="#e05c1a" />
            )}
            {daysLeft !== null && (
              <MetricCard label="Days to target" value={daysLeft} color="#993556" />
            )}
          </div>
        </div>

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
            {activeTab === 'Profile' && <ProfilePanel />}
          </>
        )}
      </div>
    </div>
  );
}

function ProfilePanel() {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [targetDate, setTargetDate] = useState(
    user?.targetDate ? new Date(user.targetDate).toISOString().split('T')[0] : ''
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const daysLeft = user?.targetDate
    ? Math.max(0, Math.ceil((new Date(user.targetDate) - new Date()) / 86400000))
    : null;

  const handleSave = async () => {
    setError('');
    if (password && password !== confirmPassword) { setError('Passwords do not match'); return; }
    setSaving(true);
    const fields = { name, targetDate };
    if (password) fields.password = password;
    const ok = await updateProfile(fields);
    setSaving(false);
    if (ok) { setSaved(true); setPassword(''); setConfirmPassword(''); setTimeout(() => setSaved(false), 2500); }
    else setError('Failed to save. Try again.');
  };

  const streakMsg = () => {
    const s = user?.streak || 0;
    if (s === 0) return 'No streak yet. Study something today to start!';
    if (s === 1) return 'Day 1 — great start! Come back tomorrow.';
    if (s < 5) return `${s} days in a row. Keep it going!`;
    if (s < 10) return `${s} days! You're on fire 🔥`;
    return `${s} days!!! Absolute beast mode 🏆`;
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>Your Profile</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'linear-gradient(135deg, #ff6b35, #e05c1a)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: 16, color: '#fff' }}>
        <div style={{ textAlign: 'center', minWidth: 60 }}>
          <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{user?.streak || 0}</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>day streak</div>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{streakMsg()}</div>
      </div>
      {daysLeft !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--accent-light)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: 20 }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{daysLeft} days to placement</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Target: {new Date(user.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
      )}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Account details</div>
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {saved && <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>Saved!</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>Full name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>Email</label>
          <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>Placement target date</label>
          <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Used for the countdown on your dashboard</span>
        </div>
        <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Change password</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>New password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>Confirm new password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: 8 }}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
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