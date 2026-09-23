import Home from '@/components/Home';
import { projects, stages, topicsOfModule } from '@/lib/content';

export default function Page() {
  const ordered = stages.flatMap((s) =>
    s.modules.flatMap((m) =>
      topicsOfModule(m.id).map((t) => ({
        id: t.id,
        title: t.title,
        outcome: t.outcome,
        moduleTitle: m.title,
        stage: s.n,
        practiceCount: t.practice.length,
      })),
    ),
  );
  const projectList = projects.map(({ id, stage, title, optional }) => ({ id, stage, title, optional }));
  return <Home stages={stages} ordered={ordered} projects={projectList} />;
}
