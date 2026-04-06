/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { ArticleView } from "./pages/ArticleView";

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-[#FAFAFA] font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleView />} />
          </Routes>
        </div>
        <footer className="border-t border-gray-200 bg-white py-8 mt-12">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
            <p className="font-serif italic mb-2">Chronicle AI</p>
            <p>&copy; {new Date().getFullYear()} Autonomous News Surface. All rights reserved.</p>
          </div>
        </footer>
      </div>
      <Analytics />
    </Router>
  );
}
