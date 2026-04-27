import { useState } from 'react';

export default function TopicExplainer({ topicName, subjectName, onClose }) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const explain = async () => {
    setLoading(true);
    setError('');
    setExplanation('');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a placement prep tutor. Explain "${topicName}" from ${subjectName} for Indian campus placements. Include:
1. What it is (2-3 lines)
2. Key points to remember (3-5 bullet points)  
3. One common interview question with a short answer

Keep it concise and exam-focused. Plain text only, no markdown.`
          }]
        })
      });
      const data = await response.json();
      if (data.content?.[0]?.text) {
        setExplanation(data.content[0].text);
      } else {
        setError('Could not get explanation. Try again.');
      }
    } catch (e) {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>🤖 AI Explainer</div>
            <div style={styles.subtitle}>{topicName} · {subjectName}</div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {!explanation && !loading && !error && (
          <div style={styles.startBox}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16, textAlign: 'center' }}>
              Get a quick placement-focused explanation of <strong>{topicName}</strong> with key points and a sample interview question.
            </p>
            <button className="btn btn-primary" onClick={explain}>Explain this topic</button>
          </div>
        )}

        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12 }}>Generating explanation...</p>
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: 8, fontSize: 13 }}>{error}</div>
        )}

        {explanation && (
          <div style={styles.explanationBox}>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{explanation}</div>
            <button className="btn btn-secondary btn-sm" onClick={explain} style={{ marginTop: 16 }}>Regenerate</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '80vh', overflow: 'auto', padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' },
  title: { fontSize: 16, fontWeight: 600 },
  subtitle: { fontSize: 13, color: 'var(--muted)', marginTop: 2 },
  closeBtn: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--muted)', padding: '2px 6px' },
  startBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0' },
  loadingBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' },
  spinner: { width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  explanationBox: { background: 'var(--bg)', borderRadius: 10, padding: '1rem' },
};