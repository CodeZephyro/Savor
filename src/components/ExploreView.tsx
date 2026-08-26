import React from 'react';
import { 
  Flame, 
  Sparkles, 
  ArrowUpDown, 
  Search, 
  SlidersHorizontal, 
  RotateCcw,
  ChefHat,
  RefreshCw,
  TrendingUp,
  Clock,
  Star,
  Heart
} from 'lucide-react';
import { useRecipeContext } from '../context/RecipeContext';
import { FilterBar } from './FilterBar';
import { RecipeCard } from './RecipeCard';

export const ExploreView: React.FC = () => {
  const {
    recipes,
    filteredRecipes,
    filters,
    setFilters,
    resetFilters,
    refreshCommunityUploads,
    lastRefreshTime,
    setActiveRecipeModal,
    setIsCreateModalOpen,
  } = useRecipeContext();

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.cuisine !== 'All' ||
    filters.mealType !== 'All' ||
    filters.difficulty !== 'All' ||
    filters.maxTotalTime !== null ||
    filters.minRating !== null ||
    filters.selectedTags.length > 0 ||
    filters.fridgeIngredients.length > 0;

  // Curate top trending dishes for the spotlight
  const trendingDishes = [...recipes]
    .sort((a, b) => (b.likesCount * 2 + b.reviewsCount * 3 + b.averageRating * 10) - (a.likesCount * 2 + a.reviewsCount * 3 + a.averageRating * 10))
    .slice(0, 4);

  return (
    <div id="explore-view" className="space-y-6 pb-12">
      
      {/* Top Filter Bar Component */}
      <FilterBar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Dynamic Fresh Uploads Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-linear-to-r from-orange-500/10 via-amber-500/10 to-stone-100 border border-orange-200/60 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">Fresh Community Creations</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-600 text-white">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Fresh uploads loaded from world chefs • Updated at {lastRefreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>

          <button
            id="refresh-community-uploads-btn"
            onClick={refreshCommunityUploads}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-orange-400 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
            title="Load fresh recipes uploaded by community members"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
            <span>Load New Uploads</span>
          </button>
        </div>

        {/* Trending Dishes Spotlight (when not searching specific queries) */}
        {!hasActiveFilters && trendingDishes.length > 0 && (
          <section id="trending-dishes-spotlight" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">Trending Dishes This Week</h2>
                  <p className="text-xs text-stone-500">Most loved & cooked recipes across the culinary community</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-orange-700 bg-orange-100/70 px-3 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> High Engagement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingDishes.map((dish, idx) => (
                <div
                  key={`trending-${dish.id}`}
                  id={`trending-card-${dish.id}`}
                  onClick={() => setActiveRecipeModal(dish)}
                  className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-40 overflow-hidden bg-stone-100">
                    <img
                      src={dish.imageUrl}
                      alt={dish.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-600 text-white shadow-xs">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>#{idx + 1} Trending</span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/70 backdrop-blur-xs text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{dish.prepTime + dish.cookTime}m</span>
                    </div>
                  </div>

                  <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                        <span className="font-semibold text-orange-600 uppercase tracking-wider text-[10px]">{dish.cuisine}</span>
                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-current text-amber-500" />
                          <span>{dish.averageRating.toFixed(1)}</span>
                          <span className="text-stone-400 font-normal">({dish.reviewsCount})</span>
                        </div>
                      </div>
                      <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {dish.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={dish.authorAvatar}
                          alt={dish.authorName}
                          className="w-5 h-5 rounded-full object-cover border border-stone-200"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="text-stone-600 font-medium text-[11px] truncate max-w-[90px]">{dish.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                        <Heart className="w-3 h-3 fill-current" />
                        <span>{dish.likesCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Results Header: Count & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {filters.searchQuery ? `Search Results for "${filters.searchQuery}"` : 'All Community Recipes'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
              {filteredRecipes.length} recipes
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs text-xs font-semibold text-stone-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
              <span>Sort:</span>
              <select
                id="sort-by-select"
                value={filters.sortBy}
                onChange={(e) => setFilters({ sortBy: e.target.value as any })}
                className="bg-transparent font-bold text-orange-600 outline-hidden cursor-pointer"
              >
                <option value="trending">🔥 Trending</option>
                <option value="highest_rated">⭐ Highest Rated</option>
                <option value="newest">✨ Most Recent</option>
                <option value="quickest">⚡ Quickest Cook Time</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                id="reset-filters-btn"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Recipe Grid or Empty State */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-stone-900">No Recipes Found</h3>
              <p className="text-xs sm:text-sm text-stone-500">
                We couldn&apos;t find any recipes matching your current filter criteria.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
              >
                Share This Recipe First
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

