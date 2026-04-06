import { useState, useEffect } from "react";
import { getTopStories, type StorySummary } from "../services/gemini";
import { StoryCard } from "../components/StoryCard";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

export function Home() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const data = await getTopStories("Global News");
        setStories(data);
      } catch (err) {
        setError("Failed to load stories. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 text-gray-500"
        >
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="font-serif text-lg italic">Curating the latest stories...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="rounded-xl bg-red-50 p-6 text-red-800">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (stories.length === 0) return null;

  const [featured, ...rest] = stories;

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
    >
      <div className="mb-12">
        <StoryCard story={featured} featured />
      </div>
      
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Latest Reporting
          </h2>
          <div className="flex flex-col gap-8">
            {rest.map((story, i) => (
              <motion.div 
                key={story.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border-b border-gray-100 pb-8 last:border-0 last:pb-0"
              >
                <StoryCard story={story} />
              </motion.div>
            ))}
          </div>
        </div>
        
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl bg-gray-50 p-6 border border-gray-100">
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-4">
              About Chronicle AI
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Chronicle AI is an autonomous news surface. Our pipeline identifies the most critical global stories and synthesizes them into deep, authoritative reporting without human editorial intervention.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every article is generated on demand, grounded in real-time search data, and held to the highest journalistic standards.
            </p>
          </div>
        </aside>
      </div>
    </motion.main>
  );
}
