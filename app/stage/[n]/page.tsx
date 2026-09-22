import { notFound } from 'next/navigation';
import StageView from '@/components/StageView';
import { projectById, stageOf, stages, topicsOfModule } from '@/lib/content';

export function generateStaticParams() {
  return stages.map((s) => ({ n: String(s.n) }));
}

export default async function Page({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const stage = stageOf(Number(n));
  if (!stage) notFound();

  const topicsByModule = Object.fromEntries(
    stage.modules.map((m) => [
      m.id,
      topicsOfModule(m.id).map((t) => ({ id: t.id, title: t.title, minutes: t.minutes })),
    ]),
  );
  const projects = stage.projects
    .map(projectById)
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map(({ id, title, size, flagship, optional }) => ({ id, title, size, flagship, optional }));

  return <StageView stage={stage} topicsByModule={topicsByModule} projects={projects} />;
}
