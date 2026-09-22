import { stages } from '@/content/curriculum';
import { topics } from '@/content/topics';
import { animations } from '@/content/animations';
import { projects } from '@/content/projects';
import type { Animation, Project, Stage, Topic } from './types';

export { stages, topics, animations, projects };

export const topicById = (id: string): Topic | undefined => topics.find((t) => t.id === id);

export const topicsOfModule = (moduleId: string): Topic[] =>
  topics.filter((t) => t.moduleId === moduleId);

export const stageOf = (n: number): Stage | undefined => stages.find((s) => s.n === n);

export const projectById = (id: string): Project | undefined =>
  projects.find((p) => p.id === id);

export const animationById = (id: string): Animation | undefined =>
  animations.find((a) => a.id === id);

/** Every authored topic, in path order. Used for prev/next and for "what's next". */
export const orderedTopics = (): Topic[] =>
  stages.flatMap((s) => s.modules.flatMap((m) => topicsOfModule(m.id)));

export function navFor(id: string) {
  const all = orderedTopics();
  const i = all.findIndex((t) => t.id === id);
  return {
    prev: i > 0 ? { id: all[i - 1].id, title: all[i - 1].title } : undefined,
    next: i >= 0 && i < all.length - 1 ? { id: all[i + 1].id, title: all[i + 1].title } : undefined,
  };
}

export function crumbFor(topic: Topic): string {
  const mod = stages.flatMap((s) => s.modules).find((m) => m.id === topic.moduleId);
  const stage = stages.find((s) => s.n === mod?.stage);
  return [`Stage ${stage?.n}`, mod?.title].filter(Boolean).join(' › ');
}

/** How much of each stage has been authored so far. */
export function authoredCount(stage: Stage): { authored: number; planned: number } {
  const authored = stage.modules.reduce((n, m) => n + topicsOfModule(m.id).length, 0);
  const planned = stage.modules.reduce(
    (n, m) => n + (topicsOfModule(m.id).length || m.topicCount || 0),
    0,
  );
  return { authored, planned };
}
