import { useState } from 'react';
import SubjectCard from './SubjectCard';
import api from '../../api/axios';

export default function SubjectPanel({ subjects, setSubjects }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3266ad');
  const [adding, setAdding] = useState(false);

  const addSubject = async () => {
    if (!newName.trim()) return;
    try {
      const { data } = await api.post('/subjects', { name: newName.trim(), color: newColor });
      setSubjects([...subjects, { ...data, totalTopics: 0, completedTopics: 0 }]);
      setNewName(''); setAdding(false);
    } catch (e) { console.error(e); }
  };

  const deleteSubject = async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(subjects.filter(s => s._id !== id));
    } catch (e) { console.error(e); }
  };

  const updateSubject = (updated) => {
    setSubjects(subjects.map(s => s._id === updated._id ? updated : s));
  };

  return (
    <div>
      <div style={styles.header}>
        <h3 style={styles.title}>Subjects & Topics</h3>
        {!adding && (
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>+ Add subject</button>
        )}
      </div>

      {adding && (
        <div style={styles.addBox}>
          <input
            type="text" placeholder="Subject name (e.g. System Design)"
            value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSubject()}
            style={{ flex: 1 }} autoFocus
          />
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
            style={{ width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
          <button className="btn btn-primary btn-sm" onClick={addSubject}>Add</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}

      {subjects.length === 0 && !adding && (
        <div style={styles.empty}>No subjects yet. Add your first one!</div>
      )}

      {subjects.map(subject => (
        <SubjectCard
          key={subject._id}
          subject={subject}
          onDelete={deleteSubject}
          onUpdate={updateSubject}
        />
      ))}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: 15, fontWeight: 600 },
  addBox: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px' },
  empty: { textAlign: 'center', color: 'var(--muted)', padding: '2rem', fontSize: 14 },
};
