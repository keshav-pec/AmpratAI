import { notFound } from 'next/navigation';
import TopicView from '@/components/TopicView';
import { crumbFor, navFor, topicById, topics } from '@/lib/content';

export function generateStaticParams() {
  return topics.map((t) => ({ id: t.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = topicById(id);
  if (!topic) notFound();

  // Animations carry functions (knob readouts), which cannot cross the
  // server/client boundary — so the client resolves them from their ids.
  return <TopicView topic={topic} crumb={crumbFor(topic)} nav={navFor(topic.id)} />;
}
