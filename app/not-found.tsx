import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '60px 0' }}>
      <h1>Not here</h1>
      <p className="muted">That page does not exist — or it has not been written yet.</p>
      <Link className="btn" href="/">Back to the stages</Link>
    </div>
  );
}
