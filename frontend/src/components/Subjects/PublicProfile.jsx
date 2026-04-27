import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function PublicProfile() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/leaderboard/${userId}`);
        setData(res.data);
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (notFound) return <div style={styles.center}>User not found 😢</div>;

  const { user, subjects } = data;
  const totalTopics = subjects.reduce((a, s) => a + s.total, 0);
  const doneTopic = subjects.reduce((a, s) => a + s.done, 0);
  const overallPct = totalTopics ? Math.round((doneTopic / totalTopics) * 100) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.hero}>
          <div style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
          <h1 style={styles.name}>{user.name}</h1>
          <p style={styles.subtitle}>Placement Prep · PlacePrep</p>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.stat}><div style={styles.statVal}>{overallPct}%</div><div style={styles.statLabel}>Overall</div></div>
          <div style={styles.stat}><div style={styles.statVal}>{user.streak || 0}🔥</div><div style={styles.statLabel}>Streak</div></div>
          <div style={styles.stat}><div style={styles.statVal}>{doneTopic}/{totalTopics}</div><div style={styles.statLabel}>Topics</div></div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ height: 8, background: '#e5e4e0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${overallPct}%`, background: '#3266ad', borderRadius: 4, transition: 'width 0.4s' }} />
          </div>
        </div>

        {subjects.map(s => {
          const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
          return (
            <div key={s.name} style={styles.subjectRow}>
              <div style={{ ...styles.subjectDot, background: s.color }} />
              <div style={styles.subjectName}>{s.name}</div>
              <div style={styles.subjectBar}>
                <div style={{ height: 6, background: '#e5e4e0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 4 }} />
                </div>
              </div>
              <div style={styles.subjectPct}>{pct}%</div>
            </div>
          );
        })}

        <div style={styles.footer}>
          <a href="https://place-prep-sooty.vercel.app" style={styles.footerLink}>Track your own placement prep on PlacePrep 🎯</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f7f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6b6b67' },
  card: { background: '#fff', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  hero: { textAlign: 'center', marginBottom: '1.5rem' },
  avatar: { width: 64, height: 64, borderRadius: '50%', background: '#3266ad', color: '#fff', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  name: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6b6b67' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: '1.5rem' },
  stat: { background: '#f7f7f5', borderRadius: 10, padding: '12px', textAlign: 'center' },
  statVal: { fontSize: 22, fontWeight: 700, color: '#1a1a18' },
  statLabel: { fontSize: 12, color: '#6b6b67', marginTop: 2 },
  subjectRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  subjectDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  subjectName: { fontSize: 13, fontWeight: 500, minWidth: 130 },
  subjectBar: { flex: 1 },
  subjectPct: { fontSize: 12, color: '#6b6b67', minWidth: 32, textAlign: 'right' },
  footer: { textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e4e0' },
  footerLink: { fontSize: 13, color: '#3266ad', textDecoration: 'none' },
};