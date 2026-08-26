import React from 'react';
import { 
  Flame, 
  Sparkles, 
  ChefHat, 
  Star, 
  Heart, 
  MessageSquare, 
  ThumbsUp, 
  Share2,
  TrendingUp,
  Award
} from 'lucide-react';
import { useRecipeContext } from '../context/RecipeContext';
import { RecipeCard } from './RecipeCard';

export const CommunityFeedView: React.FC = () => {
  const {
    recipes,
    reviews,
    users,
    currentUser,
    toggleFollowUser,
    likeReview,
    setActiveRecipeModal,
    setSelectedAuthorProfile,
    setActiveTab,
  } = useRecipeContext();

  // Trending / top rated recipes
  const trendingRecipes = [...recipes].sort((a, b) => b.likesCount - a.likesCount).slice(0, 3);
  
  // Recent reviews with photos or comments
  const recentReviews = [...reviews].sort((a, b) => b.likes - a.likes);

  // Top chefs
  const topChefs = users.slice(0, 4);

  return (
    <div id="community-feed-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-orange-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-orange-400" />
            <span>Community Feed & Trending Dishes</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Discover What Food Lovers Are Cooking & Tasting Right Now
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Follow Michelin-inspired home chefs, explore photo reviews from verified home cooks, and get inspired for your next kitchen session.
          </p>
        </div>

        {/* Decorative ambient glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-orange-600/20 to-transparent pointer-events-none" />
      </div>

      {/* Featured Trending Chefs Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-600" />
            <h2 className="font-serif text-xl font-bold text-stone-900">Featured Chefs & Food Creators</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topChefs.map((chef) => {
            const isFollowing = currentUser.following.includes(chef.id);
            const isMe = chef.id === currentUser.id;

            return (
              <div
                key={chef.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between items-center text-center space-y-3"
              >
                <img
                  src={chef.avatar}
                  alt={chef.name}
                  onClick={() => {
                    setSelectedAuthorProfile(chef);
                    setActiveTab('profile');
                  }}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-500/20 cursor-pointer hover:scale-105 transition-transform"
                />

                <div className="space-y-1">
                  <h4 
                    onClick={() => {
                      setSelectedAuthorProfile(chef);
                      setActiveTab('profile');
                    }}
                    className="font-bold text-stone-900 text-sm hover:text-orange-600 cursor-pointer"
                  >
                    {chef.name}
                  </h4>
                  <p className="text-[11px] text-stone-500">@{chef.username}</p>
                  {chef.badge && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                      {chef.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 line-clamp-2">{chef.bio}</p>

                {!isMe && (
                  <button
                    onClick={() => toggleFollowUser(chef.id)}
                    className={`w-full py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      isFollowing
                        ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                    }`}
                  >
                    {isFollowing ? 'Following' : '+ Follow'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Trending Recipes (Left) & Community Reviews/Dishes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Trending Recipes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h2 className="font-serif text-xl font-bold text-stone-900">Trending Recipes This Week</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {trendingRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>

        {/* Right Column: Live Community Reviews with Photos (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="font-serif text-xl font-bold text-stone-900">Real Home Cook Reviews</h2>
          </div>

          <div className="space-y-4">
            {recentReviews.map((rev) => {
              const matchedRecipe = recipes.find((r) => r.id === rev.recipeId);
              const isRevLiked = rev.likedBy.includes(currentUser.id);

              return (
                <div
                  key={rev.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-orange-500/20"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">{rev.userName}</span>
                          {rev.madeIt && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                              ✓ Made It
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                            />
                          ))}
                          <span className="text-[10px] text-stone-400 ml-1">{rev.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => likeReview(rev.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        isRevLiked ? 'bg-orange-50 text-orange-800' : 'text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${isRevLiked ? 'fill-orange-600 text-orange-600' : ''}`} />
                      <span>{rev.likes > 0 ? rev.likes : 'Helpful'}</span>
                    </button>
                  </div>

                  {matchedRecipe && (
                    <div
                      onClick={() => setActiveRecipeModal(matchedRecipe)}
                      className="text-xs font-semibold text-orange-700 hover:underline cursor-pointer flex items-center gap-1.5 bg-orange-50/50 p-2 rounded-xl"
                    >
                      <span>Reviewed: {matchedRecipe.title}</span>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                    {rev.comment}
                  </p>

                  {rev.photoUrl && (
                    <div className="rounded-xl overflow-hidden aspect-16/9 max-w-xs border border-stone-200 shadow-xs">
                      <img src={rev.photoUrl} alt="Cooked result" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
