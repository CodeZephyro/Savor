import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Recipe, Review, GroceryItem, FilterOptions, Ingredient } from '../types';
import { INITIAL_USERS, INITIAL_RECIPES, INITIAL_REVIEWS } from '../data/initialData';
import { COMMUNITY_CHEFS, pickFreshUploadedRecipes } from '../data/recipePool';

interface RecipeContextType {
  recipes: Recipe[];
  users: User[];
  currentUser: User;
  reviews: Review[];
  groceryList: GroceryItem[];
  filters: FilterOptions;
  
  // Dynamic Community Uploads
  refreshCommunityUploads: () => void;
  lastRefreshTime: Date;

  // Navigation & Modals
  activeTab: 'explore' | 'following' | 'saved' | 'my-recipes' | 'profile';
  setActiveTab: (tab: 'explore' | 'following' | 'saved' | 'my-recipes' | 'profile') => void;
  activeRecipeModal: Recipe | null;
  setActiveRecipeModal: (recipe: Recipe | null) => void;
  activeCookModeRecipe: Recipe | null;
  setActiveCookModeRecipe: (recipe: Recipe | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isGroceryModalOpen: boolean;
  setIsGroceryModalOpen: (open: boolean) => void;
  isFridgeModalOpen: boolean;
  setIsFridgeModalOpen: (open: boolean) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  aiDrawerRecipe: Recipe | null;
  setAiDrawerRecipe: (recipe: Recipe | null) => void;
  selectedAuthorProfile: User | null;
  setSelectedAuthorProfile: (user: User | null) => void;

  // Recipe Actions
  addRecipe: (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'authorAvatar' | 'authorBadge' | 'averageRating' | 'reviewsCount' | 'likesCount' | 'savesCount'>) => Recipe;
  updateRecipe: (id: string, updated: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  toggleSaveRecipe: (recipeId: string) => void;
  toggleLikeRecipe: (recipeId: string) => void;

  // Reviews
  addReview: (recipeId: string, review: { rating: number; comment: string; madeIt: boolean; photoUrl?: string }) => void;
  likeReview: (reviewId: string) => void;
  getReviewsForRecipe: (recipeId: string) => Review[];

  // Social
  toggleFollowUser: (targetUserId: string) => void;
  switchUser: (userId: string) => void;
  updateProfile: (updatedProfile: Partial<User>) => void;
  getUserById: (userId: string) => User | undefined;

  // Grocery
  addIngredientsToGrocery: (recipe: Recipe, ingredientList?: Ingredient[]) => void;
  toggleGroceryItem: (itemId: string) => void;
  removeGroceryItem: (itemId: string) => void;
  clearCheckedGroceryItems: () => void;
  clearAllGroceryItems: () => void;

  // Search & Filtering
  setFilters: (newFilters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  filteredRecipes: Recipe[];
}

const defaultFilters: FilterOptions = {
  searchQuery: '',
  cuisine: 'All',
  mealType: 'All',
  difficulty: 'All',
  maxTotalTime: null,
  minRating: null,
  selectedTags: [],
  sortBy: 'trending',
  fridgeIngredients: [],
};

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

// Helper to combine initial users with community chefs without duplicates
const ALL_SEED_USERS: User[] = [
  ...INITIAL_USERS,
  ...COMMUNITY_CHEFS.filter((c) => !INITIAL_USERS.some((u) => u.id === c.id)),
];

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(() => new Date());

  // Load from localStorage or seed with 6-8 fresh community recipes
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const freshUploads = pickFreshUploadedRecipes(7);
      const saved = localStorage.getItem('savor_recipes');
      if (saved) {
        const parsed: Recipe[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((r) => r.id));
        const newUniqueFresh = freshUploads.filter((f) => !existingIds.has(f.id));
        return [...newUniqueFresh, ...parsed];
      }
      return [...freshUploads, ...INITIAL_RECIPES];
    } catch {
      return [...pickFreshUploadedRecipes(7), ...INITIAL_RECIPES];
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('savor_users');
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((u) => u.id));
        const missingChefs = COMMUNITY_CHEFS.filter((c) => !existingIds.has(c.id));
        return [...parsed, ...missingChefs];
      }
      return ALL_SEED_USERS;
    } catch {
      return ALL_SEED_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('savor_current_user');
      if (saved) return JSON.parse(saved);
      const defaultUser = INITIAL_USERS.find((u) => u.id === 'user-me') || INITIAL_USERS[0];
      return defaultUser;
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('savor_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [groceryList, setGroceryList] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem('savor_grocery_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filters, setFiltersState] = useState<FilterOptions>(defaultFilters);

  // Modals & Navigation state
  const [activeTab, setActiveTab] = useState<'explore' | 'following' | 'saved' | 'my-recipes' | 'profile'>('explore');
  const [activeRecipeModal, setActiveRecipeModal] = useState<Recipe | null>(null);
  const [activeCookModeRecipe, setActiveCookModeRecipe] = useState<Recipe | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);
  const [isFridgeModalOpen, setIsFridgeModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiDrawerRecipe, setAiDrawerRecipe] = useState<Recipe | null>(null);
  const [selectedAuthorProfile, setSelectedAuthorProfile] = useState<User | null>(null);

  // Fresh Community Uploads Refresh trigger
  const refreshCommunityUploads = useCallback(() => {
    const freshBatch = pickFreshUploadedRecipes(7);
    setRecipes((prev) => {
      // Keep user created recipes at top, then new fresh batch, then remainder
      const myCreated = prev.filter((r) => r.authorId === currentUser.id);
      const others = prev.filter((r) => r.authorId !== currentUser.id);
      return [...myCreated, ...freshBatch, ...others.slice(0, 20)];
    });
    setLastRefreshTime(new Date());
  }, [currentUser.id]);

  // URL Query / Hash deep linking to open shared recipes in real time
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const recipeParam = urlParams.get('recipe');
      const hashParam = window.location.hash ? window.location.hash.replace('#', '') : null;
      const targetId = recipeParam || hashParam;

      if (targetId) {
        const found = recipes.find((r) => r.id === targetId || r.id.includes(targetId));
        if (found) {
          setActiveRecipeModal(found);
        }
      }
    } catch (e) {
      console.error('URL parsing error:', e);
    }
  }, [recipes]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('savor_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('savor_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('savor_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('savor_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('savor_grocery_list', JSON.stringify(groceryList));
  }, [groceryList]);

  // Keep activeRecipeModal in sync with updated recipe data
  useEffect(() => {
    if (activeRecipeModal) {
      const found = recipes.find((r) => r.id === activeRecipeModal.id);
      if (found && found !== activeRecipeModal) {
        setActiveRecipeModal(found);
      }
    }
  }, [recipes, activeRecipeModal]);

  const setFilters = (newFilters: Partial<FilterOptions>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  const addRecipe = (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'authorAvatar' | 'authorBadge' | 'averageRating' | 'reviewsCount' | 'likesCount' | 'savesCount'>): Recipe => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: `recipe-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorBadge: currentUser.badge || 'Chef Creator',
      averageRating: 5.0,
      reviewsCount: 0,
      likesCount: 1,
      savesCount: 0,
      createdAt: new Date().toISOString(),
    };

    setRecipes((prev) => [newRecipe, ...prev]);

    // Add to currentUser liked list automatically
    setCurrentUser((prev) => ({
      ...prev,
      likedRecipeIds: [...prev.likedRecipeIds, newRecipe.id],
    }));

    return newRecipe;
  };

  const updateRecipe = (id: string, updated: Partial<Recipe>) => {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    if (activeRecipeModal?.id === id) setActiveRecipeModal(null);
  };

  const toggleSaveRecipe = (recipeId: string) => {
    const isSaved = currentUser.savedRecipeIds.includes(recipeId);
    const newSaved = isSaved
      ? currentUser.savedRecipeIds.filter((id) => id !== recipeId)
      : [...currentUser.savedRecipeIds, recipeId];

    setCurrentUser((prev) => ({ ...prev, savedRecipeIds: newSaved }));

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, savedRecipeIds: newSaved } : u))
    );

    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          return {
            ...r,
            savesCount: Math.max(0, r.savesCount + (isSaved ? -1 : 1)),
          };
        }
        return r;
      })
    );
  };

  const toggleLikeRecipe = (recipeId: string) => {
    const isLiked = currentUser.likedRecipeIds.includes(recipeId);
    const newLiked = isLiked
      ? currentUser.likedRecipeIds.filter((id) => id !== recipeId)
      : [...currentUser.likedRecipeIds, recipeId];

    setCurrentUser((prev) => ({ ...prev, likedRecipeIds: newLiked }));

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, likedRecipeIds: newLiked } : u))
    );

    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          return {
            ...r,
            likesCount: Math.max(0, r.likesCount + (isLiked ? -1 : 1)),
          };
        }
        return r;
      })
    );
  };

  const addReview = (recipeId: string, reviewData: { rating: number; comment: string; madeIt: boolean; photoUrl?: string }) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      recipeId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating: reviewData.rating,
      comment: reviewData.comment,
      madeIt: reviewData.madeIt,
      photoUrl: reviewData.photoUrl,
      createdAt: 'Just now',
      likes: 0,
      likedBy: [],
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Recalculate average rating
    const recipeReviews = updatedReviews.filter((r) => r.recipeId === recipeId);
    const sum = recipeReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = Number((sum / recipeReviews.length).toFixed(1));

    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          return {
            ...r,
            averageRating: avg,
            reviewsCount: recipeReviews.length,
          };
        }
        return r;
      })
    );
  };

  const likeReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((rev) => {
        if (rev.id === reviewId) {
          const isLiked = rev.likedBy.includes(currentUser.id);
          const newLikedBy = isLiked
            ? rev.likedBy.filter((id) => id !== currentUser.id)
            : [...rev.likedBy, currentUser.id];
          return {
            ...rev,
            likedBy: newLikedBy,
            likes: newLikedBy.length,
          };
        }
        return rev;
      })
    );
  };

  const getReviewsForRecipe = (recipeId: string) => {
    return reviews.filter((r) => r.recipeId === recipeId);
  };

  const toggleFollowUser = (targetUserId: string) => {
    if (targetUserId === currentUser.id) return;
    const isFollowing = currentUser.following.includes(targetUserId);

    const updatedFollowing = isFollowing
      ? currentUser.following.filter((id) => id !== targetUserId)
      : [...currentUser.following, targetUserId];

    const updatedCurrentUser = {
      ...currentUser,
      following: updatedFollowing,
      followingCount: updatedFollowing.length,
    };

    setCurrentUser(updatedCurrentUser);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) return updatedCurrentUser;
        if (u.id === targetUserId) {
          const isFollower = u.followers.includes(currentUser.id);
          const newFollowers = isFollower
            ? u.followers.filter((id) => id !== currentUser.id)
            : [...u.followers, currentUser.id];
          return {
            ...u,
            followers: newFollowers,
            followersCount: newFollowers.length,
          };
        }
        return u;
      })
    );
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const updateProfile = (updatedProfile: Partial<User>) => {
    const updated = { ...currentUser, ...updatedProfile };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  const addIngredientsToGrocery = (recipe: Recipe, ingredientList?: Ingredient[]) => {
    const itemsToAdd = (ingredientList || recipe.ingredients).map((ing) => ({
      id: `groc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      category: ing.category,
      recipeTitle: recipe.title,
      checked: false,
    }));

    setGroceryList((prev) => [...prev, ...itemsToAdd]);
    setIsGroceryModalOpen(true);
  };

  const toggleGroceryItem = (itemId: string) => {
    setGroceryList((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item))
    );
  };

  const removeGroceryItem = (itemId: string) => {
    setGroceryList((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCheckedGroceryItems = () => {
    setGroceryList((prev) => prev.filter((item) => !item.checked));
  };

  const clearAllGroceryItems = () => {
    setGroceryList([]);
  };

  // Filtered & Sorted Recipes computation
  const filteredRecipes = recipes.filter((recipe) => {
    // 1. Tab restriction
    if (activeTab === 'following') {
      if (!currentUser.following.includes(recipe.authorId)) return false;
    } else if (activeTab === 'saved') {
      if (!currentUser.savedRecipeIds.includes(recipe.id)) return false;
    } else if (activeTab === 'my-recipes') {
      if (recipe.authorId !== currentUser.id) return false;
    }

    // 2. Search Query (Title, Description, Ingredients, Tags, Author)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = recipe.title.toLowerCase().includes(q);
      const matchDesc = recipe.description.toLowerCase().includes(q);
      const matchAuthor = recipe.authorName.toLowerCase().includes(q);
      const matchTags = recipe.tags.some((t) => t.toLowerCase().includes(q));
      const matchIngredients = recipe.ingredients.some((i) => i.name.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAuthor && !matchTags && !matchIngredients) {
        return false;
      }
    }

    // 3. Cuisine
    if (filters.cuisine !== 'All' && recipe.cuisine !== filters.cuisine) {
      return false;
    }

    // 4. Meal Type
    if (filters.mealType !== 'All' && recipe.mealType !== filters.mealType) {
      return false;
    }

    // 5. Difficulty
    if (filters.difficulty !== 'All' && recipe.difficulty !== filters.difficulty) {
      return false;
    }

    // 6. Max Time (Prep + Cook)
    if (filters.maxTotalTime !== null) {
      const totalTime = recipe.prepTime + recipe.cookTime;
      if (totalTime > filters.maxTotalTime) return false;
    }

    // 7. Min Rating
    if (filters.minRating !== null) {
      if (recipe.averageRating < filters.minRating) return false;
    }

    // 8. Tags filter
    if (filters.selectedTags.length > 0) {
      const hasAllTags = filters.selectedTags.every((tag) => recipe.tags.includes(tag));
      if (!hasAllTags) return false;
    }

    // 9. Fridge Search (At least one or ratio matching)
    if (filters.fridgeIngredients.length > 0) {
      const recipeIngNames = recipe.ingredients.map((i) => i.name.toLowerCase());
      const hasAny = filters.fridgeIngredients.some((f) =>
        recipeIngNames.some((r) => r.includes(f.toLowerCase()))
      );
      if (!hasAny) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'highest_rated') {
      return b.averageRating - a.averageRating;
    }
    if (filters.sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === 'quickest') {
      return a.prepTime + a.cookTime - (b.prepTime + b.cookTime);
    }
    // 'trending' by default: combination of likes and rating
    const scoreA = a.likesCount * 2 + a.reviewsCount * 3 + a.averageRating * 10;
    const scoreB = b.likesCount * 2 + b.reviewsCount * 3 + b.averageRating * 10;
    return scoreB - scoreA;
  });

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        users,
        currentUser,
        reviews,
        groceryList,
        filters,
        refreshCommunityUploads,
        lastRefreshTime,
        activeTab,
        setActiveTab,
        activeRecipeModal,
        setActiveRecipeModal,
        activeCookModeRecipe,
        setActiveCookModeRecipe,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isGroceryModalOpen,
        setIsGroceryModalOpen,
        isFridgeModalOpen,
        setIsFridgeModalOpen,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        aiDrawerRecipe,
        setAiDrawerRecipe,
        selectedAuthorProfile,
        setSelectedAuthorProfile,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        toggleSaveRecipe,
        toggleLikeRecipe,
        addReview,
        likeReview,
        getReviewsForRecipe,
        toggleFollowUser,
        switchUser,
        updateProfile,
        getUserById,
        addIngredientsToGrocery,
        toggleGroceryItem,
        removeGroceryItem,
        clearCheckedGroceryItems,
        clearAllGroceryItems,
        setFilters,
        resetFilters,
        filteredRecipes,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipeContext = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipeContext must be used within a RecipeProvider');
  }
  return context;
};
