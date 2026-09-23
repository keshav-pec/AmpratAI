import Link from 'next/link';
import { notFound } from 'next/navigation';
import { md, mdInline } from '@/lib/md';
import { crumbFor, topicById, topics } from '@/lib/content';

export function generateStaticParams() {
  return topics.map((t) => ({ id: t.id }));
}

/** A clean one-page summary, sized for A4 — for writing on in a physical notebook. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = topicById(id);
  if (!topic) notFound();

  return (
    <div style={{ padding: '22px 0 40px', maxWidth: 760 }}>
      <div className="row noprint" style={{ marginBottom: 16 }}>
        <Link className="icon-btn" href={`/topic/${topic.id}`}>← back</Link>
        <span className="small muted">Use your browser&apos;s print dialog, or Ctrl/Cmd + P.</span>
      </div>

      <div className="small muted">{crumbFor(topic)}</div>
      <h1 style={{ margin: '2px 0 4px' }}>{topic.title}</h1>
      <p className="muted" style={{ marginTop: 0 }}
         dangerouslySetInnerHTML={{ __html: mdInline(topic.outcome) }} />
      <hr />

      <div dangerouslySetInnerHTML={{ __html: md(topic.notes.replace(/^\s*---\s*$/gm, '')) }} />

      <h2>Words used here</h2>
      <table>
        <tbody>
          {topic.glossary.map((g) => (
            <tr key={g.term}>
              <th style={{ width: '28%' }}>{g.term}</th>
              <td>{g.def}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Check yourself</h2>
      <ol>
        {topic.check.map((c) => <li key={c.q}>{c.q}</li>)}
      </ol>

      <h2>Practice</h2>
      <ol>
        {topic.practice.map((p) => <li key={p.title}>{p.title}</li>)}
      </ol>
    </div>
  );
}
