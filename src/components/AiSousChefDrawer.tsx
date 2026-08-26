import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  ChefHat, 
  HelpCircle, 
  RefreshCw, 
  Wine, 
  Scale, 
  Leaf 
} from 'lucide-react';
import { useRecipeContext } from '../context/RecipeContext';

export const AiSousChefDrawer: React.FC = () => {
  const { isAiDrawerOpen, setIsAiDrawerOpen, aiDrawerRecipe } = useRecipeContext();

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'chef'; text: string }>>([
    {
      sender: 'chef',
      text: "Bonjour! I am Chef Remy, your AI Sous-Chef. Ask me for ingredient substitutions, technique advice, wine pairings, or dietary modifications!",
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAiDrawerOpen) return null;

  const quickPrompts = [
    { label: '🔄 Ingredient Substitutions', prompt: 'What are the best ingredient substitutions if I am missing a key component?' },
    { label: '🍷 Wine & Drink Pairing', prompt: 'What wine, cocktail, or non-alcoholic beverage pairs best with this dish?' },
    { label: '🌿 Make it Plant-Based / Dairy-Free', prompt: 'How can I adapt this recipe for a plant-based or dairy-free diet without losing flavor?' },
    { label: '👨‍🍳 Pro Cooking Secret', prompt: 'What is one professional restaurant technique that elevates this dish?' },
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMsgs);
    setInputQuery('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 28000);

    try {
      const res = await fetch('/api/ai/ask-chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: textToSend,
          recipeContext: aiDrawerRecipe
            ? {
                title: aiDrawerRecipe.title,
                ingredients: aiDrawerRecipe.ingredients,
                instructions: aiDrawerRecipe.instructions,
              }
            : null,
        }),
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Chef is taking a short kitchen break.');
      }

      setMessages([...newMsgs, { sender: 'chef' as const, text: data.answer }]);
    } catch (err: any) {
      clearTimeout(timeoutId);
      const errorText = err.name === 'AbortError'
        ? 'Chef Remy is currently busy perfecting another dish. Please try your question again in a moment!'
        : (err.message || 'Chef Remy is tasting and composing advice. Please try again.');
      setMessages([
        ...newMsgs,
        {
          sender: 'chef' as const,
          text: `Chef Note: ${errorText}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="ai-sous-chef-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <header className="p-4 sm:p-5 border-b border-stone-200 bg-amber-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900 leading-tight">
              Chef Remy • AI Sous-Chef
            </h3>
            <p className="text-[11px] text-stone-500">
              {aiDrawerRecipe ? `Assisting with: ${aiDrawerRecipe.title.slice(0, 30)}...` : 'Ask anything culinary'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(false)}
          className="p-2 rounded-full hover:bg-stone-200 text-stone-500"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
        
        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5 pb-2">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Quick Inquiries</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp.prompt)}
                className="text-left px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-medium transition-colors"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Thread */}
        <div className="space-y-3 pt-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'chef' && (
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-xs">
                  👨‍🍳
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-orange-600 text-white rounded-tr-xs'
                    : 'bg-stone-100 text-stone-800 rounded-tl-xs border border-stone-200/80 whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-stone-500 text-xs italic">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs animate-pulse">
                👨‍🍳
              </div>
              <span>Chef Remy is tasting and composing advice...</span>
            </div>
          )}
        </div>

      </div>

      {/* Input Footer */}
      <footer className="p-4 border-t border-stone-200 bg-stone-50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question (e.g. Can I substitute ricotta for feta?)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-hidden placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
};
