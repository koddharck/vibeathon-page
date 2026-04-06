import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Loader2, Send, Bot, User } from "lucide-react";
import { generateArticle, askArticleQuestion, type StorySummary, type Article } from "../services/gemini";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export function ArticleView() {
  const location = useLocation();
  const navigate = useNavigate();
  const story = location.state?.story as StorySummary | undefined;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!story) {
      navigate("/");
      return;
    }

    async function fetchArticle() {
      try {
        const data = await generateArticle(story!.headline, story!.summary);
        setArticle(data);
      } catch (err) {
        setError("Failed to generate article. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [story, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !article || chatLoading) return;

    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setChatLoading(true);

    try {
      const answer = await askArticleQuestion(article.content, question);
      setMessages(prev => [...prev, { role: 'ai', content: answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error answering that." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!story) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 text-gray-500"
        >
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          <div className="space-y-2">
            <p className="font-serif text-xl italic text-gray-900">Synthesizing reporting...</p>
            <p className="text-sm">Our AI is gathering facts and writing the article.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="rounded-xl bg-red-50 p-6 text-red-800">
          <p>{error || "Something went wrong."}</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const dynamicImageUrl = `https://picsum.photos/seed/${encodeURIComponent(story.imageQuery)}/1200/600`;

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Feed
      </button>

      <div className="grid gap-12 lg:grid-cols-12">
        <article className="lg:col-span-8">
          <header className="mb-10">
            <div className="mb-4 flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium uppercase tracking-wider text-blue-700">{story.category}</span>
              <span>&bull;</span>
              <span>{formatDistanceToNow(new Date(story.timestamp))} ago</span>
            </div>
            <h1 className="font-serif text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {article.headline}
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-gray-600 font-serif italic">
              {story.summary}
            </p>
          </header>

          <figure className="mb-12 overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={dynamicImageUrl}
              alt={article.headline}
              className="w-full object-cover aspect-[2/1]"
              referrerPolicy="no-referrer"
            />
            <figcaption className="p-3 text-right text-xs text-gray-500">
              AI-generated representation based on: "{story.imageQuery}"
            </figcaption>
          </figure>

          <div className="prose prose-lg prose-gray max-w-none font-article prose-headings:font-serif prose-headings:font-bold prose-a:text-blue-700 hover:prose-a:text-blue-900 prose-img:rounded-xl">
            <Markdown>{article.content}</Markdown>
          </div>

          {article.sources.length > 0 && (
            <div className="mt-16 border-t border-gray-200 pt-8">
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">Sources & Grounding</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {article.sources.map((source, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 hover:underline">
                      {source.title || source.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50 p-4">
              <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Article Assistant
              </h3>
              <p className="text-xs text-gray-500 mt-1">Ask questions about this reporting.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 space-y-3">
                  <div className="rounded-full bg-blue-50 p-3">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm max-w-[200px]">I've read the article. What would you like to know?</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      msg.role === 'user' ? "bg-gray-100" : "bg-blue-50"
                    )}>
                      {msg.role === 'user' ? <User className="h-4 w-4 text-gray-600" /> : <Bot className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm max-w-[80%]",
                      msg.role === 'user' 
                        ? "bg-gray-900 text-white rounded-tr-sm" 
                        : "bg-gray-100 text-gray-900 rounded-tl-sm"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-100 p-4 bg-white">
              <form onSubmit={handleAskQuestion} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-4 pr-12 text-sm focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-0 transition-colors"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || chatLoading}
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </aside>
      </div>
    </motion.main>
  );
}
