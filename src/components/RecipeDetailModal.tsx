import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Bookmark, 
  Clock, 
  Users, 
  Flame, 
  ChefHat, 
  Star, 
  Play, 
  ShoppingCart, 
  Sparkles, 
  Camera, 
  ThumbsUp, 
  Share2, 
  Utensils, 
  Check, 
  Plus, 
  Minus,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Recipe } from '../types';
import { useRecipeContext } from '../context/RecipeContext';
import { compressImage } from '../utils/imageCompressor';

export const RecipeDetailModal: React.FC = () => {
  const {
    activeRecipeModal,
    setActiveRecipeModal,
    setActiveCookModeRecipe,
    currentUser,
    toggleLikeRecipe,
    toggleSaveRecipe,
    toggleFollowUser,
    addReview,
    likeReview,
    getReviewsForRecipe,
    addIngredientsToGrocery,
    setIsAiDrawerOpen,
    setAiDrawerRecipe,
    getUserById,
    setSelectedAuthorProfile,
    setActiveTab,
  } = useRecipeContext();

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Dynamic Servings Scaling
  const [servingsMultiplier, setServingsMultiplier] = useState(1);

  // Checked ingredients in modal
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [madeItCheck, setMadeItCheck] = useState(true);
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!activeRecipeModal) return null;

  const recipe = activeRecipeModal;
  const author = getUserById(recipe.authorId);
  const isLiked = currentUser.likedRecipeIds.includes(recipe.id);
  const isSaved = currentUser.savedRecipeIds.includes(recipe.id);
  const isFollowingAuthor = currentUser.following.includes(recipe.authorId);
  const reviews = getReviewsForRecipe(recipe.id);
  const currentServings = Math.round(recipe.servings * servingsMultiplier);

  // Handle Review photo upload
  const handleReviewPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 0.8);
        setReviewPhotoUrl(compressed);
      } catch (err) {
        console.error('Error compressing review photo:', err);
      }
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    addReview(recipe.id, {
      rating: userRating,
      comment: reviewComment.trim(),
      madeIt: madeItCheck,
      photoUrl: reviewPhotoUrl || undefined,
    });

    setReviewComment('');
    setReviewPhotoUrl(null);
    setIsSubmittingReview(false);
    setReviewSuccessMsg(true);
    setTimeout(() => setReviewSuccessMsg(false), 4000);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?recipe=${recipe.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this delicious recipe: ${recipe.title} by ${recipe.authorName} on Savor!`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    }
  };

  // Helper to scale ingredient amounts
  const scaleAmount = (amountStr: string) => {
    if (servingsMultiplier === 1) return amountStr;
    // Check if numeric or fraction
    const num = parseFloat(amountStr);
    if (!isNaN(num)) {
      const scaled = (num * servingsMultiplier).toFixed(1).replace(/\.0$/, '');
      return scaled;
    }
    return amountStr;
  };

  return (
    <div 
      id="recipe-detail-overlay"
      className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm overflow-y-auto flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={() => setActiveRecipeModal(null)}
    >
      <div 
        id="recipe-detail-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-stone-200 flex flex-col relative animate-in zoom-in-95 duration-200"
      >
        
        {/* Floating Close Button */}
        <button
          id="close-recipe-detail-btn"
          onClick={() => setActiveRecipeModal(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-transform hover:scale-105 active:scale-95 shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Gallery Header */}
        <div className="relative aspect-16/9 sm:aspect-21/9 bg-stone-900 overflow-hidden">
          <img
            src={recipe.images[activeImageIndex] || recipe.images[0]}
            alt={recipe.title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Gallery Thumbnails (if multiple images) */}
          {recipe.images.length > 1 && (
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
              {recipe.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-orange-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Header Overlay on Image */}
          <div className="absolute bottom-4 left-4 sm:left-6 z-10 text-white max-w-xl pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-600 text-white">
                {recipe.cuisine}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                {recipe.mealType}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                {recipe.difficulty}
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-3xl font-bold tracking-tight leading-tight text-white drop-shadow-md">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
          
          {/* Author & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            
            {/* Author Profile Card */}
            <div className="flex items-center gap-3">
              <img
                src={recipe.authorAvatar}
                alt={recipe.authorName}
                onClick={() => {
                  if (author) {
                    setSelectedAuthorProfile(author);
                    setActiveTab('profile');
                    setActiveRecipeModal(null);
                  }
                }}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/30 cursor-pointer hover:opacity-90"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 
                    onClick={() => {
                      if (author) {
                        setSelectedAuthorProfile(author);
                        setActiveTab('profile');
                        setActiveRecipeModal(null);
                      }
                    }}
                    className="font-bold text-stone-900 hover:text-orange-600 cursor-pointer text-sm sm:text-base"
                  >
                    {recipe.authorName}
                  </h4>
                  {recipe.authorBadge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                      {recipe.authorBadge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500">
                  Shared on {new Date(recipe.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Follow Button (if not me) */}
              {recipe.authorId !== currentUser.id && (
                <button
                  id={`follow-author-btn-${recipe.authorId}`}
                  onClick={() => toggleFollowUser(recipe.authorId)}
                  className={`ml-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isFollowingAuthor
                      ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
                      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                  }`}
                >
                  {isFollowingAuthor ? 'Following' : '+ Follow'}
                </button>
              )}
            </div>

            {/* Social Actions: Like, Save, Share, AI Sous-Chef */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="recipe-detail-like-btn"
                onClick={() => toggleLikeRecipe(recipe.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                  isLiked
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{recipe.likesCount}</span>
              </button>

              <button
                id="recipe-detail-save-btn"
                onClick={() => toggleSaveRecipe(recipe.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                  isSaved
                    ? 'bg-amber-50 text-amber-800 border border-amber-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-600' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                id="recipe-detail-share-btn"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                title="Copy share link"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                id="recipe-detail-ask-chef-btn"
                onClick={() => {
                  setAiDrawerRecipe(recipe);
                  setIsAiDrawerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Ask Chef AI</span>
              </button>
            </div>

          </div>

          {/* Quick Metrics Bar (Prep, Cook, Total, Calories, Servings) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-orange-600 border border-stone-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-stone-500 uppercase">Prep Time</p>
                <p className="font-bold text-stone-900 text-sm">{recipe.prepTime} mins</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-amber-600 border border-stone-100">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-stone-500 uppercase">Cook Time</p>
                <p className="font-bold text-stone-900 text-sm">{recipe.cookTime} mins</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-emerald-600 border border-stone-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-stone-500 uppercase">Yield / Servings</p>
                <p className="font-bold text-stone-900 text-sm">{currentServings} servings</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-purple-600 border border-stone-100">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-stone-500 uppercase">Rating</p>
                <p className="font-bold text-stone-900 text-sm">
                  {recipe.averageRating.toFixed(1)} <span className="text-xs font-normal text-stone-400">({recipe.reviewsCount} reviews)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Description & Tags */}
          <div className="space-y-3">
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              {recipe.description}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {recipe.tags.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-700">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Two-Column Core: Ingredients (with Portions Scaler) & Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
            
            {/* Left Column: Ingredients & Nutrition (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Ingredients Card */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">Ingredients</h3>
                    <p className="text-xs text-stone-500">Tap to check off as you prepare</p>
                  </div>

                  {/* Servings Multiplier Controls */}
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-stone-200 shadow-xs">
                    <button
                      onClick={() => setServingsMultiplier((prev) => Math.max(0.5, prev - 0.5))}
                      className="p-1 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100"
                      title="Decrease servings"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-stone-800 px-1 min-w-[40px] text-center">
                      {currentServings} ptn
                    </span>
                    <button
                      onClick={() => setServingsMultiplier((prev) => Math.min(5, prev + 0.5))}
                      className="p-1 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100"
                      title="Increase servings"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ingredients List */}
                <div className="space-y-2">
                  {recipe.ingredients.map((ing) => {
                    const isChecked = checkedIngredients[ing.id];
                    return (
                      <div
                        key={ing.id}
                        onClick={() =>
                          setCheckedIngredients((prev) => ({
                            ...prev,
                            [ing.id]: !prev[ing.id],
                          }))
                        }
                        className={`flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                          isChecked ? 'bg-stone-200/50 line-through opacity-60' : 'hover:bg-white'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-orange-600 border-orange-600 text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-stone-900 mr-1.5">
                            {scaleAmount(ing.amount)} {ing.unit}
                          </span>
                          <span className="text-stone-800 font-medium">{ing.name}</span>
                          {ing.notes && (
                            <span className="block text-[11px] text-stone-500 font-normal">
                              ({ing.notes})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add to Smart Grocery CTA */}
                <button
                  id="add-recipe-to-grocery-btn"
                  onClick={() => addIngredientsToGrocery(recipe)}
                  className="w-full py-2.5 px-4 bg-white hover:bg-orange-50 text-orange-900 hover:text-orange-950 font-semibold text-xs rounded-xl border border-orange-200 shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 text-orange-600" />
                  <span>Add All to Grocery List</span>
                </button>
              </div>

              {/* Nutrition Card (if available) */}
              {recipe.nutrition && (
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3">
                  <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-orange-500" /> Estimated Nutrition Per Serving
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/60">
                      <p className="text-base font-bold text-stone-900">{recipe.nutrition.calories}</p>
                      <p className="text-[10px] text-stone-500 font-semibold uppercase">Calories</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/60">
                      <p className="text-base font-bold text-stone-900">{recipe.nutrition.protein}</p>
                      <p className="text-[10px] text-stone-500 font-semibold uppercase">Protein</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/60">
                      <p className="text-base font-bold text-stone-900">{recipe.nutrition.carbs}</p>
                      <p className="text-[10px] text-stone-500 font-semibold uppercase">Carbs</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/60">
                      <p className="text-base font-bold text-stone-900">{recipe.nutrition.fat}</p>
                      <p className="text-[10px] text-stone-500 font-semibold uppercase">Fat</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chef Tips */}
              {recipe.chefTips && recipe.chefTips.length > 0 && (
                <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ChefHat className="w-4 h-4 text-amber-700" />
                    <span>Chef Notes & Culinary Secrets</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-950/90 leading-relaxed">
                    {recipe.chefTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Right Column: Step-by-Step Instructions (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">Step-by-Step Instructions</h3>
                  <p className="text-xs text-stone-500">Carefully structured culinary workflow</p>
                </div>

                {/* Enter Interactive Cook Mode Trigger */}
                <button
                  id="open-cook-mode-from-detail"
                  onClick={() => setActiveCookModeRecipe(recipe)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold rounded-full shadow-md shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Cook Mode</span>
                </button>
              </div>

              {/* Instructions Timeline */}
              <div className="space-y-4">
                {recipe.instructions.map((step) => (
                  <div
                    key={step.step}
                    className="flex gap-4 p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-200 transition-colors shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-900 font-bold text-sm flex items-center justify-center shrink-0 border border-orange-200">
                      {step.step}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-stone-900 text-sm">
                          {step.title}
                        </h4>
                        {step.timerMinutes && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {step.timerMinutes} mins timer
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                        {step.instruction}
                      </p>

                      {step.stepImage && (
                        <div className="mt-2 rounded-xl overflow-hidden aspect-16/9 max-w-sm">
                          <img src={step.stepImage} alt={`Step ${step.step}`} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Bottom Section: Community Ratings & Photo Reviews */}
          <div id="recipe-reviews-section" className="pt-8 border-t border-stone-200 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Ratings & Community Reviews</h3>
                <p className="text-xs text-stone-500">See what home cooks and chefs made and loved</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(recipe.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-stone-900 text-sm">{recipe.averageRating.toFixed(1)} / 5.0</span>
                <span className="text-xs text-stone-400">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Leave a Review Form */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/90 space-y-4">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                <span>Did you make this dish? Share your rating & photo!</span>
              </h4>

              {reviewSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your review and photo were successfully shared with the community.</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                
                {/* Star rating selector + Made It Checkbox */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-stone-700 mr-2">Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        id={`rate-star-${star}`}
                        onClick={() => setUserRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= userRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-stone-800 ml-2">
                      {userRating === 5 ? 'Masterpiece! (5★)' : `${userRating} Stars`}
                    </span>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={madeItCheck}
                      onChange={(e) => setMadeItCheck(e.target.checked)}
                      className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                    />
                    <span>I made this recipe!</span>
                  </label>
                </div>

                {/* Comment Textarea */}
                <div>
                  <textarea
                    id="review-comment-input"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe how it turned out, any ingredient swaps, or tips for other home cooks..."
                    rows={3}
                    className="w-full p-3 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-hidden placeholder:text-stone-400"
                    required
                  />
                </div>

                {/* Photo Upload & Submit Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  
                  {/* Photo Upload input */}
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 cursor-pointer shadow-xs transition-colors">
                      <Camera className="w-4 h-4 text-orange-600" />
                      <span>{reviewPhotoUrl ? 'Change Photo' : 'Upload Finished Dish Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReviewPhotoUpload}
                        className="hidden"
                      />
                    </label>

                    {reviewPhotoUrl && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-stone-300">
                        <img src={reviewPhotoUrl} alt="Review upload" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setReviewPhotoUrl(null)}
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="submit-review-btn"
                    disabled={isSubmittingReview || !reviewComment.trim()}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-sm shadow-orange-600/20 transition-all"
                  >
                    Post Review
                  </button>

                </div>

              </form>
            </div>

            {/* Existing Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs">
                  No reviews yet. Be the very first home cook to make and review this dish!
                </div>
              ) : (
                reviews.map((rev) => {
                  const isRevLiked = rev.likedBy.includes(currentUser.id);
                  return (
                    <div
                      key={rev.id}
                      className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.userAvatar}
                            alt={rev.userName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-orange-500/20"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-900">{rev.userName}</span>
                              {rev.madeIt && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                                  <Check className="w-2.5 h-2.5" /> Made It
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-amber-500">
                              {[1, 2, 3, 4, 5].map((st) => (
                                <Star
                                  key={st}
                                  className={`w-3 h-3 ${st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                                />
                              ))}
                              <span className="text-[10px] text-stone-400 ml-1">{rev.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        {/* Like review helpful button */}
                        <button
                          onClick={() => likeReview(rev.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            isRevLiked
                              ? 'bg-orange-50 text-orange-800 border border-orange-200'
                              : 'text-stone-500 hover:bg-stone-100'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${isRevLiked ? 'fill-orange-600 text-orange-600' : ''}`} />
                          <span>{rev.likes > 0 ? rev.likes : 'Helpful'}</span>
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                        {rev.comment}
                      </p>

                      {rev.photoUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden max-w-xs aspect-4/3 border border-stone-200 shadow-xs">
                          <img src={rev.photoUrl} alt="Cooked result" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
