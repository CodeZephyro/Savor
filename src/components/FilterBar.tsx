import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Clock, 
  Star, 
  Sparkles, 
  Utensils, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { useRecipeContext } from '../context/RecipeContext';
import { CUISINES, MEAL_TYPES } from '../data/initialData';

const POPULAR_TAGS = [
  'Vegetarian',
  'Quick & Easy',
  'Gourmet',
  'High-Protein',
  'Gluten-Free',
  'Comfort Food',
  'Baking',
  'Street Food',
];

const TIME_OPTIONS = [
  { label: 'Any Time', value: null },
  { label: '⚡ < 20 mins', value: 20 },
  { label: '⏱️ < 35 mins', value: 35 },
  { label: '🍲 < 60 mins', value: 60 },
];

export const FilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters, filteredRecipes, recipes } = useRecipeContext();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const hasActiveFilters =
    filters.cuisine !== 'All' ||
    filters.mealType !== 'All' ||
    filters.difficulty !== 'All' ||
    filters.maxTotalTime !== null ||
    filters.minRating !== null ||
    filters.selectedTags.length > 0 ||
    filters.fridgeIngredients.length > 0 ||
    Boolean(filters.searchQuery);

  const toggleTag = (tag: string) => {
    if (filters.selectedTags.includes(tag)) {
      setFilters({ selectedTags: filters.selectedTags.filter((t) => t !== tag) });
    } else {
      setFilters({ selectedTags: [...filters.selectedTags, tag] });
    }
  };

  return (
    <div id="filter-bar-container" className="bg-white border-b border-stone-200/80 pb-3 pt-4 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        
        {/* Row 1: Cuisines Horizon Scroll & Sort / Advanced Filters Toggle */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Cuisine Horizon Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {CUISINES.map((cuisine) => {
              const isSelected = filters.cuisine === cuisine;
              return (
                <button
                  key={cuisine}
                  id={`filter-cuisine-${cuisine.toLowerCase()}`}
                  onClick={() => setFilters({ cuisine })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 hover:text-stone-900'
                  }`}
                >
                  {cuisine}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Sort & Advanced Filter */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Selector */}
            <div className="relative">
              <select
                id="sort-recipes-select"
                value={filters.sortBy}
                onChange={(e) => setFilters({ sortBy: e.target.value as any })}
                className="appearance-none pl-3 pr-8 py-1.5 bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-semibold rounded-full border-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer outline-hidden transition-colors"
              >
                <option value="trending">🔥 Trending</option>
                <option value="highest_rated">⭐ Highest Rated</option>
                <option value="newest">✨ Newest First</option>
                <option value="quickest">⚡ Quickest to Cook</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Toggle Advanced */}
            <button
              id="toggle-advanced-filters-btn"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isAdvancedOpen || hasActiveFilters
                  ? 'bg-orange-50 text-orange-900 border-orange-300'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-orange-600"></span>
              )}
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                id="reset-filters-btn"
                onClick={resetFilters}
                className="p-1.5 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Secondary Quick Chips (Meal types & Popular tags) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider shrink-0">
            Meals:
          </span>
          {MEAL_TYPES.map((meal) => {
            const isSelected = filters.mealType === meal;
            return (
              <button
                key={meal}
                id={`filter-meal-${meal.toLowerCase()}`}
                onClick={() => setFilters({ mealType: meal })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {meal}
              </button>
            );
          })}

          <div className="h-4 w-px bg-stone-200 mx-1 shrink-0" />

          {/* Quick Tags */}
          {POPULAR_TAGS.slice(0, 5).map((tag) => {
            const isSelected = filters.selectedTags.includes(tag);
            return (
              <button
                key={tag}
                id={`filter-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Expandable Advanced Filter Panel */}
        {isAdvancedOpen && (
          <div 
            id="advanced-filters-panel"
            className="p-4 mt-2 bg-stone-50/90 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-1 duration-200 text-xs"
          >
            {/* 1. Time constraints */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-500" /> Max Cook Time
              </label>
              <div className="space-y-1">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setFilters({ maxTotalTime: opt.value })}
                    className={`w-full text-left px-2.5 py-1 rounded-lg transition-colors flex items-center justify-between ${
                      filters.maxTotalTime === opt.value
                        ? 'bg-orange-100 text-orange-950 font-semibold'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {filters.maxTotalTime === opt.value && <Check className="w-3 h-3 text-orange-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Difficulty */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-stone-500" /> Difficulty
              </label>
              <div className="space-y-1">
                {['All', 'Easy', 'Medium', 'Advanced'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setFilters({ difficulty: diff })}
                    className={`w-full text-left px-2.5 py-1 rounded-lg transition-colors flex items-center justify-between ${
                      filters.difficulty === diff
                        ? 'bg-orange-100 text-orange-950 font-semibold'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{diff === 'All' ? 'Any Level' : diff}</span>
                    {filters.difficulty === diff && <Check className="w-3 h-3 text-orange-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Rating */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Minimum Rating
              </label>
              <div className="space-y-1">
                {[
                  { label: 'All Ratings', value: null },
                  { label: '4.8 ★ & above (Master)', value: 4.8 },
                  { label: '4.5 ★ & above', value: 4.5 },
                  { label: '4.0 ★ & above', value: 4.0 },
                ].map((rat) => (
                  <button
                    key={rat.label}
                    onClick={() => setFilters({ minRating: rat.value })}
                    className={`w-full text-left px-2.5 py-1 rounded-lg transition-colors flex items-center justify-between ${
                      filters.minRating === rat.value
                        ? 'bg-orange-100 text-orange-950 font-semibold'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{rat.label}</span>
                    {filters.minRating === rat.value && <Check className="w-3 h-3 text-orange-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Dietary & Tags */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-stone-500" /> Dietary & Lifestyle
              </label>
              <div className="flex flex-wrap gap-1">
                {POPULAR_TAGS.map((tag) => {
                  const isSelected = filters.selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                        isSelected
                          ? 'bg-orange-600 text-white font-semibold'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Results count & active search indicators */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          <p>
            Showing <strong className="text-stone-900 font-bold">{filteredRecipes.length}</strong> of{' '}
            {recipes.length} culinary recipes
          </p>

          {filters.fridgeIngredients.length > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 text-orange-800 text-[11px] font-medium">
              <span>Fridge filtered ({filters.fridgeIngredients.length} ingredients)</span>
              <button
                onClick={() => setFilters({ fridgeIngredients: [] })}
                className="text-orange-900 font-bold hover:text-orange-950"
              >
                ✕
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
