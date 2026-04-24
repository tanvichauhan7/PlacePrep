import { useState } from 'react';
import api from '../../api/axios';

const SUBJECT_OPTIONS = ['', 'DSA', 'DBMS', 'OS', 'Computer Networks', 'OOPs / Java', 'Aptitude / Quant'];
const SUBJECT_COLORS = { DSA:'#3266ad', DBMS:'#1D9E75', OS:'#BA7517', 'Computer Networks':'#534AB7', 'OOPs / Java':'#993556', 'Aptitude / Quant':'#73726c' };

export default function RemindersPanel({ reminders, setReminders }) {
  const [form, setForm] = useState({ text: '', subject: '', dueDate: '' });
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all');

  const addReminder = async () => {
    if (!form.text.trim()) return;
    try {
      const { data } = await api.post('/reminders', { text: form.text.trim(), subject: form.subject, dueDate: form.dueDate || null });
      setReminders([data, ...reminders]);
      setForm({ text: '', subject: '', dueDate: '' });
      setAdding(false);
    } catch (e) { console.error(e); }
  };

  const toggle = async (id) => {
    try {
      const { data } = await api.patch(`/reminders/${id}/toggle`);
      setReminders(reminders.map(r => r._id === id ? data : r));
    } catch (e) { console.error(e); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      setReminders(reminders.filter(r => r._id !== id));
    } catch (e) { console.error(e); }
  };

  const filtered = reminders.filter(r => {
    if (filter === 'pending') return !r.isDone;
    if (filter === 'done') return r.isDone;
    return true;
  });

  const pending = reminders.filter(r => !r.isDone).length;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Reminders & Tasks</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{pending} task{pending !== 1 ? 's' : ''} pending</p>
        </div>
        {!adding && (
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>+ Add task</button>
        )}
      </div>

      {adding && (
        <div style={styles.addBox}>
          <input
            type="text" placeholder="What do you need to study or revise?"
            value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && addReminder()}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={{ flex: 1 }}>
              <option value="">All subjects</option>
              {SUBJECT_OPTIONS.filter(Boolean).map(s => <option key={s}>{s}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={addReminder}>Add reminder</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {['all', 'pending', 'done'].map(f => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={styles.empty}>
          {filter === 'done' ? 'No completed tasks yet. Keep going!' : 'No tasks here. Add one above!'}
        </div>
      )}

      {filtered.map(r => {
        const color = SUBJECT_COLORS[r.subject] || '#3266ad';
        const isOverdue = r.dueDate && !r.isDone && new Date(r.dueDate) < new Date();
        return (
          <div key={r._id} style={{ ...styles.item, opacity: r.isDone ? 0.65 : 1 }}>
            <div style={{ ...styles.colorBar, background: color }} />
            <input
              type="checkbox" checked={r.isDone} onChange={() => toggle(r._id)}
              style={{ accentColor: color, width: 15, height: 15, cursor: 'pointer', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.taskText, ...(r.isDone ? styles.done : {}) }}>{r.text}</div>
              <div style={styles.taskMeta}>
                {r.subject && <span style={{ ...styles.subjectTag, background: color + '22', color }}>{r.subject}</span>}
                {r.dueDate && (
                  <span style={{ fontSize: 12, color: isOverdue ? '#991b1b' : 'var(--muted)' }}>
                    {isOverdue ? '⚠ Overdue · ' : '📅 '}
                    {new Date(r.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
            {r.isDone && <span className="badge badge-done">Done</span>}
            <button onClick={() => remove(r._id)} style={styles.delBtn} title="Delete">✕</button>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  title: { fontSize: 15, fontWeight: 600 },
  addBox: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', marginBottom: '1rem' },
  filterRow: { display: 'flex', gap: 6, marginBottom: '1rem' },
  filterBtn: { padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 13, cursor: 'pointer', color: 'var(--muted)' },
  filterActive: { background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent)' },
  item: { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, position: 'relative', overflow: 'hidden' },
  colorBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  taskText: { fontSize: 14, fontWeight: 500, paddingLeft: 2 },
  taskMeta: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 },
  subjectTag: { fontSize: 11, fontWeight: 500, padding: '2px 6px', borderRadius: 4 },
  done: { textDecoration: 'line-through', color: 'var(--muted)' },
  delBtn: { background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 11, padding: '2px 4px', opacity: 0.6 },
  empty: { textAlign: 'center', color: 'var(--muted)', padding: '2rem', fontSize: 14 },
};
