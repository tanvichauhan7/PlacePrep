import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function SubjectCard({ subject, onDelete, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [addingTopic, setAddingTopic] = useState(false);

  const pct = subject.totalTopics
    ? Math.round((subject.completedTopics / subject.totalTopics) * 100)
    : 0;

  useEffect(() => {
    if (open && topics.length === 0) fetchTopics();
  }, [open]);

  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const { data } = await api.get(`/topics/${subject._id}`);
      setTopics(data);
    } catch (e) { console.error(e); }
    finally { setLoadingTopics(false); }
  };

  const toggleTopic = async (topic) => {
    try {
      const { data } = await api.patch(`/topics/${topic._id}/toggle`);
      const updated = topics.map(t => t._id === data._id ? data : t);
      setTopics(updated);
      const done = updated.filter(t => t.isCompleted).length;
      onUpdate({ ...subject, completedTopics: done, totalTopics: updated.length });
    } catch (e) { console.error(e); }
  };

  const addTopic = async () => {
    if (!newTopic.trim()) return;
    try {
      const { data } = await api.post(`/topics/${subject._id}`, { name: newTopic.trim() });
      const updated = [...topics, data];
      setTopics(updated);
      onUpdate({ ...subject, totalTopics: subject.totalTopics + 1 });
      setNewTopic('');
    } catch (e) { console.error(e); }
  };

  const deleteTopic = async (topicId) => {
    try {
      await api.delete(`/topics/${topicId}`);
      const topic = topics.find(t => t._id === topicId);
      const updated = topics.filter(t => t._id !== topicId);
      setTopics(updated);
      onUpdate({
        ...subject,
        totalTopics: subject.totalTopics - 1,
        completedTopics: topic?.isCompleted ? subject.completedTopics - 1 : subject.completedTopics,
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header} onClick={() => setOpen(!open)}>
        <div style={styles.left}>
          <div style={{ ...styles.dot, background: subject.color }} />
          <div>
            <div style={styles.name}>{subject.name}</div>
            <div style={styles.meta}>{subject.completedTopics}/{subject.totalTopics} topics done</div>
          </div>
        </div>
        <div style={styles.right}>
          <span style={styles.pct}>{pct}%</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(subject._id); }}
            className="btn btn-danger btn-sm"
            style={{ padding: '3px 8px' }}
            title="Delete subject"
          >✕</button>
          <span style={styles.chevron}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginTop: 10 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: subject.color }} />
      </div>

      {/* Topics */}
      {open && (
        <div style={styles.topicArea}>
          {loadingTopics && <div style={styles.loading}>Loading topics...</div>}

          {topics.map(topic => (
            <div key={topic._id} style={styles.topicRow}>
              <input
                type="checkbox"
                checked={topic.isCompleted}
                onChange={() => toggleTopic(topic)}
                style={{ accentColor: subject.color, width: 15, height: 15, cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ ...styles.topicName, ...(topic.isCompleted ? styles.done : {}) }}>
                {topic.name}
              </span>
              {topic.isCompleted && (
                <span className="badge badge-done" style={{ marginLeft: 'auto', marginRight: 4 }}>Done</span>
              )}
              <button
                onClick={() => deleteTopic(topic._id)}
                style={styles.delBtn}
                title="Remove topic"
              >✕</button>
            </div>
          ))}

          {/* Add topic */}
          {addingTopic ? (
            <div style={styles.addTopic}>
              <input
                type="text" placeholder="New topic name..."
                value={newTopic} onChange={e => setNewTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTopic()}
                style={{ flex: 1, fontSize: 13, padding: '6px 10px' }}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" onClick={addTopic}>Add</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setAddingTopic(false)}>Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingTopic(true)}
              style={styles.addTopicBtn}
            >
              + Add topic
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: 12 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  left: { display: 'flex', alignItems: 'center', gap: 10 },
  dot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  name: { fontSize: 14, fontWeight: 500 },
  meta: { fontSize: 12, color: 'var(--muted)', marginTop: 1 },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  pct: { fontSize: 13, fontWeight: 600, color: 'var(--muted)', minWidth: 35, textAlign: 'right' },
  chevron: { fontSize: 11, color: 'var(--muted)' },
  topicArea: { marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 },
  topicRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--bg)' },
  topicName: { fontSize: 13, color: 'var(--text)', flex: 1 },
  done: { textDecoration: 'line-through', color: 'var(--muted)' },
  delBtn: { background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 11, padding: '2px 4px', borderRadius: 4, opacity: 0.6 },
  addTopic: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 },
  addTopicBtn: { background: 'none', border: '1px dashed var(--border)', borderRadius: 6, color: 'var(--muted)', fontSize: 13, padding: '6px 12px', marginTop: 10, cursor: 'pointer', width: '100%', textAlign: 'left' },
  loading: { color: 'var(--muted)', fontSize: 13, padding: '8px 0' },
};
