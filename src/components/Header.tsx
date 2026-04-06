import { Link } from "react-router-dom";
import { Search, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-gray-900 transition-colors">World</Link>
            <Link to="/" className="hover:text-gray-900 transition-colors">Business</Link>
            <Link to="/" className="hover:text-gray-900 transition-colors">Technology</Link>
            <Link to="/" className="hover:text-gray-900 transition-colors">Science</Link>
          </div>
        </div>
        
        <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900">
            Chronicle AI
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <button className="p-2 -mr-2 text-gray-500 hover:text-gray-900 transition-colors">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
