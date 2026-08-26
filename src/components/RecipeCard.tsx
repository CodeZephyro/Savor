import React, { useState } from 'react';
import { 
  Heart, 
  Bookmark, 
  Clock, 
  Star, 
  ChefHat, 
  Flame, 
  Play, 
  Share2,
  Check,
  Sparkles
} from 'lucide-react';
import { Recipe } from '../types';
import { useRecipeContext } from '../context/RecipeContext';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const {
    currentUser,
    toggleLikeRecipe,
    toggleSaveRecipe,
    setActiveRecipeModal,
    setActiveCookModeRecipe,
    setSelectedAuthorProfile,
    getUserById,
    setActiveTab,
  } = useRecipeContext();

  const [copiedShare, setCopiedShare] = useState(false);

  const isLiked = currentUser.likedRecipeIds.includes(recipe.id);
  const isSaved = currentUser.savedRecipeIds.includes(recipe.id);
  const totalTime = recipe.prepTime + recipe.cookTime;
  const isTrending = recipe.likesCount >= 40 || recipe.averageRating >= 4.9;

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Advanced: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const author = getUserById(recipe.authorId);
    if (author) {
      setSelectedAuthorProfile(author);
      setActiveTab('profile');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?recipe=${recipe.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this delicious ${recipe.title} recipe on Savor!`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // Ignore
    }
  };

  // Safe image resolution
  const displayImage = (recipe.images && recipe.images.length > 0 && recipe.images[0])
    ? recipe.images[0]
    : (recipe.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop&q=80');

  return (
    <article
      id={`recipe-card-${recipe.id}`}
      onClick={() => setActiveRecipeModal(recipe)}
      className="group bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <img
          src={displayImage}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient Overlay on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

        {/* Top Badges: Cuisine & Difficulty & Trending */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-stone-900 shadow-xs">
            {recipe.cuisine}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${difficultyColors[recipe.difficulty] || 'bg-stone-100 text-stone-700'}`}>
            {recipe.difficulty}
          </span>
          {isTrending && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white flex items-center gap-0.5 shadow-xs">
              <Flame className="w-2.5 h-2.5 fill-current" />
              <span>Trending</span>
            </span>
          )}
        </div>

        {/* Top Right Actions: Share, Like, Save */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            id={`share-btn-${recipe.id}`}
            onClick={handleShare}
            className="p-2 rounded-full backdrop-blur-md bg-white/80 hover:bg-white text-stone-700 hover:text-orange-600 shadow-xs transition-all active:scale-90"
            title="Share recipe link"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            id={`like-btn-${recipe.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleLikeRecipe(recipe.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
              isLiked
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-stone-700 hover:text-rose-600 shadow-xs'
            }`}
            title={isLiked ? 'Unlike' : 'Like recipe'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-white stroke-white' : ''}`} />
          </button>

          <button
            id={`save-btn-${recipe.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveRecipe(recipe.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
              isSaved
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-stone-700 hover:text-amber-600 shadow-xs'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save to cookbook'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white stroke-white' : ''}`} />
          </button>
        </div>

        {/* Copied notification tooltip */}
        {copiedShare && (
          <div className="absolute top-12 right-3 bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg animate-in fade-in">
            Link copied!
          </div>
        )}

        {/* Bottom Banner inside Image: Time & Rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-stone-200" />
            <span className="font-medium">{totalTime} mins</span>
          </div>

          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold">{recipe.averageRating.toFixed(1)}</span>
            <span className="text-stone-300 text-[10px]">({recipe.reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1.5">
          {/* Author info */}
          <div 
            id={`author-link-${recipe.id}`}
            onClick={handleAuthorClick}
            className="flex items-center gap-2 group/author hover:opacity-80 transition-opacity w-fit"
          >
            <img
              src={recipe.authorAvatar}
              alt={recipe.authorName}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-orange-500/20"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
              }}
            />
            <span className="text-xs font-semibold text-stone-600 group-hover/author:text-orange-600 truncate max-w-[150px]">
              {recipe.authorName}
            </span>
            {recipe.authorBadge && (
              <span className="text-[9px] font-medium px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded-sm">
                {recipe.authorBadge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">
            {recipe.description}
          </p>
        </div>

        {/* Tags & Quick Actions */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          
          {/* Tag Pills */}
          <div className="flex items-center gap-1 overflow-hidden flex-wrap max-h-5">
            {recipe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-block text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {recipe.tags.length > 2 && (
              <span className="text-[10px] text-stone-400 font-medium">
                +{recipe.tags.length - 2}
              </span>
            )}
          </div>

          {/* Cook Mode Trigger Button */}
          <button
            id={`start-cook-mode-btn-${recipe.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveCookModeRecipe(recipe);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-full border border-orange-200 transition-colors shrink-0 cursor-pointer"
            title="Start step-by-step interactive cooking mode with timers"
          >
            <Play className="w-3 h-3 fill-orange-700" />
            <span>Cook</span>
          </button>

        </div>

      </div>
    </article>
  );
};

