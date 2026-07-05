import { useState } from 'react';
import { Search, ChevronDown, BookOpen, MessageSquare, Clock, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BlogArticle } from '../types';
import { BLOG_ARTICLES, FAQS } from '../data';

export default function BlogFAQ() {
  const [activeTab, setActiveTab] = useState<'blog' | 'faq'>('blog');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Blog detailed reading modal state
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <section className="py-20 bg-zinc-50 dark:bg-zinc-900/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tab Toggle Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex bg-zinc-200/60 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('blog')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'blog'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Platform Blog & Insights</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'faq'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Common FAQs Answered</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display Grid */}
        <AnimatePresence mode="wait">
          
          {activeTab === 'blog' && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-zinc-900 dark:text-white">
                  Livestock Intelligence & Industry Reports
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  Stay updated on animal husbandry advances, smart agriculture tech, and African retail market dynamics written by our veterinary and financial specialists.
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {BLOG_ARTICLES.map((art) => (
                  <motion.div
                    key={art.id}
                    whileHover={{ y: -6 }}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 relative overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                        <span className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold text-amber-500 px-3 py-1 rounded-full">
                          {art.category}
                        </span>
                      </div>

                      <div className="p-6 space-y-3.5">
                        <div className="flex items-center space-x-4 text-[10px] text-zinc-400 font-mono">
                          <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {art.readTime}</span>
                          <span>•</span>
                          <span>{art.date}</span>
                        </div>
                        
                        <h4 className="font-display font-bold text-lg text-zinc-950 dark:text-white leading-tight hover:text-emerald-600 cursor-pointer" onClick={() => setSelectedArticle(art)}>
                          {art.title}
                        </h4>
                        
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3">
                          {art.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 mt-4 flex justify-between items-center text-xs">
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">By {art.author}</span>
                      <button
                        onClick={() => setSelectedArticle(art)}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Read Full Article
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              
              {/* Header & Search */}
              <div className="text-center space-y-6">
                <div>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-zinc-900 dark:text-white">
                    Got Questions? We’ve Got Answers.
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                    Everything you need to know about the platform, our biosecurity protocols, health tracking, and off-taking procedures.
                  </p>
                </div>

                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search questions (e.g., tracking, payout)..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Accordion list */}
              <div className="space-y-4">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-zinc-950 border rounded-2xl text-zinc-500">
                    No FAQs match your search parameters.
                  </div>
                ) : (
                  filteredFaqs.map((faq, index) => {
                    const isExpanded = expandedFaq === index;
                    return (
                      <div
                        key={index}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-all"
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : index)}
                          className="w-full p-5 text-left flex justify-between items-center hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                        >
                          <span className="font-display font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                            {faq.question}
                          </span>
                          <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform ${isExpanded ? 'rotate-185' : ''}`} />
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950"
                            >
                              <p className="p-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Blog Article Full Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
              onClick={() => setSelectedArticle(null)}
            />

            {/* Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative z-10"
            >
              
              {/* Image banner */}
              <div className="h-64 w-full relative">
                <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 p-2 bg-zinc-950/70 backdrop-blur-md rounded-full text-zinc-200 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content body */}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex items-center space-x-3 text-xs text-zinc-400 font-mono">
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold uppercase">{selectedArticle.category}</span>
                  <span>{selectedArticle.date}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-zinc-950 dark:text-white leading-tight">
                  {selectedArticle.title}
                </h3>

                <div className="flex items-center space-x-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                    {selectedArticle.author[0]}
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">Published by {selectedArticle.author} (CVO, CowPlugNG)</span>
                </div>

                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-4">
                  <p>{selectedArticle.content}</p>
                  <p>In addition, CowPlugNG regularly collaborates with tier-1 agricultural researchers and expert veterinary officers to ensure our operational processes prevent common outbreaks like Foot-and-Mouth disease and sheep PPR entirely. Registered investors can log into their dashboards to read full veterinary logs and book onsite Saturday tours whenever they desire.</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-200">The Future is Smart, Transparent, and Profitable. Join us in feeding Africa today.</p>
                </div>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs pt-4"
                >
                  Close Article Reader
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
