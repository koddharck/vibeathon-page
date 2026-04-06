import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import type { StorySummary } from "../services/gemini";

interface StoryCardProps {
  story: StorySummary;
  featured?: boolean;
}

export function StoryCard({ story, featured = false }: StoryCardProps) {
  // Use a reliable placeholder image service based on the imageQuery
  const imageUrl = `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80`; // Fallback
  // In a real app, we'd use a real image search API. For now, we'll use a generic news image or picsum.
  const dynamicImageUrl = `https://picsum.photos/seed/${encodeURIComponent(story.imageQuery)}/800/600`;

  if (featured) {
    return (
      <Link to={`/article/${story.id}`} state={{ story }} className="group block">
        <article className="relative overflow-hidden rounded-2xl bg-gray-900">
          <div className="aspect-[16/9] w-full sm:aspect-[2/1] lg:aspect-[21/9]">
            <img
              src={dynamicImageUrl}
              alt={story.headline}
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 lg:p-12">
            <div className="mb-3 flex items-center gap-3 text-sm text-gray-300">
              <span className="font-medium uppercase tracking-wider text-white">{story.category}</span>
              <span>&bull;</span>
              <span>{formatDistanceToNow(new Date(story.timestamp))} ago</span>
            </div>
            <h2 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {story.headline}
            </h2>
            <p className="mt-4 hidden max-w-3xl text-lg text-gray-300 sm:block">
              {story.summary}
            </p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/article/${story.id}`} state={{ story }} className="group block">
      <article className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-xl sm:w-64 lg:w-72">
          <img
            src={dynamicImageUrl}
            alt={story.headline}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col justify-center py-1">
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium uppercase tracking-wider text-gray-900">{story.category}</span>
            <span>&bull;</span>
            <span>{formatDistanceToNow(new Date(story.timestamp))} ago</span>
          </div>
          <h3 className="font-serif text-xl font-bold leading-snug text-gray-900 group-hover:text-blue-700 sm:text-2xl">
            {story.headline}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-gray-600 sm:text-base">
            {story.summary}
          </p>
        </div>
      </article>
    </Link>
  );
}
