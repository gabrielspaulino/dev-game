import { notFound } from "next/navigation";
import { getTopic, getLesson } from "@/lib/game-data";
import { LessonFlow } from "@/components/lesson/LessonFlow";

interface Props {
  params: Promise<{ topicId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { topicId, lessonId } = await params;
  const topic = getTopic(topicId);
  const lesson = getLesson(topicId, lessonId);

  if (!topic || !lesson) notFound();

  return <LessonFlow topic={topic} lesson={lesson} />;
}

export async function generateStaticParams() {
  const { TOPICS } = await import("@/lib/game-data");
  return TOPICS.flatMap((topic) =>
    topic.lessons.map((lesson) => ({
      topicId: topic.id,
      lessonId: lesson.id,
    }))
  );
}
