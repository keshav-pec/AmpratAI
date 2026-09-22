import Home from '@/components/Home';
import { authoredCount, stages, topicsOfModule } from '@/lib/content';

export default function Page() {
  const ordered = stages.flatMap((s) =>
    s.modules.flatMap((m) =>
      topicsOfModule(m.id).map((t) => ({
        id: t.id,
        title: t.title,
        moduleTitle: m.title,
        stage: s.n,
      })),
    ),
  );
  const counts = Object.fromEntries(stages.map((s) => [s.n, authoredCount(s)]));
  return <Home stages={stages} ordered={ordered} counts={counts} />;
}
