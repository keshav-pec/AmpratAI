import Link from 'next/link';
import { notFound } from 'next/navigation';
import { md } from '@/lib/md';
import { projectById, projects } from '@/lib/content';

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projectById(id);
  if (!project) notFound();

  return (
    <div style={{ padding: '22px 0 60px', maxWidth: 780 }}>
      <Link className="small muted" href={`/stage/${project.stage}`}>← Stage {project.stage}</Link>
      <div className="row" style={{ marginTop: 10 }}>
        <span className="small muted" style={{ fontFamily: 'var(--mono)' }}>{project.id}</span>
        <span className="tag">{project.size}</span>
        {project.flagship && <span className="tag core">flagship</span>}
        {project.optional && <span className="tag">optional</span>}
      </div>
      <h1 style={{ marginTop: 8 }}>{project.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: md(project.body) }} />
      <div className="card" style={{ marginTop: 26 }}>
        <b>How this is meant to go</b>
        <p className="small" style={{ marginBottom: 0 }}>
          You architect it and direct the build; AI writes most of the lines; you review,
          debug and deploy. The test of whether it worked is not the code — it is whether
          you can walk someone through any part of it and say why it is that way.
        </p>
      </div>
    </div>
  );
}
