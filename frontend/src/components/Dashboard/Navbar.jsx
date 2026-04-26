import useAuthStore from '../../context/authStore';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuthStore();
  const tabs = ['Subjects', 'Reminders', 'Overview'];

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.brand}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <span style={styles.brandText}>PlacePrep</span>
        </div>

        <div style={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={styles.user}>
          <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
          <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 },
  inner: { maxWidth: 960, margin: '0 auto', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', gap: 24 },
  brand: { display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 },
  brandText: { fontWeight: 600, fontSize: 16 },
  tabs: { display: 'flex', gap: 2, flex: 1 },
  tab: { padding: '6px 14px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 14, fontWeight: 500, color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.15s' },
  tabActive: { background: 'var(--accent-light)', color: 'var(--accent)' },
  user: { display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' },
  userName: { fontSize: 13, color: 'var(--muted)', fontWeight: 500 },
};
