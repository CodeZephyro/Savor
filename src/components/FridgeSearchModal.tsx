import React, { useState } from 'react';
import { 
  X, 
  Refrigerator, 
  Plus, 
  Search, 
  Sparkles, 
  Check, 
  ArrowRight,
  UtensilsCrossed 
} from 'lucide-react';
import { useRecipeContext } from '../context/RecipeContext';
import { COMMON_PANTRY_INGREDIENTS } from '../data/initialData';

export const FridgeSearchModal: React.FC = () => {
  const {
    isFridgeModalOpen,
    setIsFridgeModalOpen,
    filters,
    setFilters,
    recipes,
    setActiveRecipeModal,
    setActiveTab,
  } = useRecipeContext();

  const [customInput, setCustomInput] = useState('');
  const selected = filters.fridgeIngredients;

  if (!isFridgeModalOpen) return null;

  const toggleIngredient = (name: string) => {
    if (selected.includes(name)) {
      setFilters({ fridgeIngredients: selected.filter((i) => i !== name) });
    } else {
      setFilters({ fridgeIngredients: [...selected, name] });
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      const clean = customInput.trim();
      if (!selected.includes(clean)) {
        setFilters({ fridgeIngredients: [...selected, clean] });
      }
      setCustomInput('');
    }
  };

  // Compute matched recipes with match percentage
  const matchedRecipes = recipes
    .map((recipe) => {
      const ingNames = recipe.ingredients.map((i) => i.name.toLowerCase());
      if (selected.length === 0) return { recipe, matchCount: 0, matchPercentage: 0 };

      let matches = 0;
      selected.forEach((sel) => {
        if (ingNames.some((r) => r.includes(sel.toLowerCase()))) {
          matches++;
        }
      });

      const percentage = Math.round((matches / Math.max(1, recipe.ingredients.length)) * 100);
      return { recipe, matchCount: matches, matchPercentage: percentage };
    })
    .filter((item) => (selected.length > 0 ? item.matchCount > 0 : true))
    .sort((a, b) => b.matchCount - a.matchCount);

  return (
    <div 
      id="fridge-search-overlay"
      className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm overflow-y-auto flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={() => setIsFridgeModalOpen(false)}
    >
      <div 
        id="fridge-search-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-stone-200 flex flex-col relative max-h-[90vh]"
      >
        {/* Header */}
        <header className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Refrigerator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 leading-none">
                What’s In Your Fridge?
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Select items on hand to find recipes you can cook right now
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFridgeModalOpen(false)}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Custom Add Input */}
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type an ingredient (e.g. Greek yogurt, zucchini, soy sauce)..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Pantry Quick Chips */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Common Pantry & Fridge Staples
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PANTRY_INGREDIENTS.map((item) => {
                const isSelected = selected.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleIngredient(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-orange-600 text-white font-bold shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Selected List */}
          {selected.length > 0 && (
            <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-orange-900">
                <span>Selected ({selected.length}):</span>
                {selected.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-md border border-orange-200 text-stone-800"
                  >
                    {s}
                    <button onClick={() => toggleIngredient(s)} className="text-stone-400 hover:text-rose-600">
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={() => setFilters({ fridgeIngredients: [] })}
                className="text-xs text-orange-700 font-bold hover:underline shrink-0"
              >
                Clear
              </button>
            </div>
          )}

          {/* Matched Recipe Results */}
          <div className="space-y-3 pt-2">
            <h3 className="font-serif text-base font-bold text-stone-900 flex items-center justify-between">
              <span>Matching Community Dishes ({matchedRecipes.length})</span>
            </h3>

            {matchedRecipes.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                No matching recipes found with these exact ingredients. Try adding more pantry items or clearing some filters!
              </div>
            ) : (
              <div className="space-y-2.5">
                {matchedRecipes.slice(0, 5).map(({ recipe, matchCount }) => (
                  <div
                    key={recipe.id}
                    onClick={() => {
                      setIsFridgeModalOpen(false);
                      setActiveRecipeModal(recipe);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200 hover:border-orange-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={recipe.images[0]}
                        alt={recipe.title}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">
                          {recipe.title}
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          {recipe.cuisine} • {recipe.prepTime + recipe.cookTime} mins • by {recipe.authorName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selected.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {matchCount} ingredients matched
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <footer className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            {selected.length === 0
              ? 'Select ingredients to filter recipes'
              : `Filtering explore feed by ${selected.length} items`}
          </p>
          <button
            onClick={() => {
              setIsFridgeModalOpen(false);
              setActiveTab('explore');
            }}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-full shadow-xs transition-all"
          >
            Apply to Feed
          </button>
        </footer>

      </div>
    </div>
  );
};
