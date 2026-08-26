export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  specialties: string[];
  followersCount: number;
  followingCount: number;
  followers: string[]; // user IDs
  following: string[]; // user IDs
  savedRecipeIds: string[];
  likedRecipeIds: string[];
  joinedDate: string;
  badge?: string;
}

export type IngredientCategory = 'produce' | 'dairy' | 'meat' | 'pantry' | 'spices' | 'bakery' | 'other';

export interface Ingredient {
  id: string;
  amount: string;
  unit: string;
  name: string;
  category: IngredientCategory;
  notes?: string;
}

export interface InstructionStep {
  step: number;
  title: string;
  instruction: string;
  timerMinutes?: number | null;
  stepImage?: string;
}

export interface Review {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  madeIt: boolean;
  photoUrl?: string;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Beverage' | 'Snack' | 'Appetizer';
export type Difficulty = 'Easy' | 'Medium' | 'Advanced';

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber?: string;
  sodium?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  images: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: string;
  cuisine: string;
  mealType: MealType;
  difficulty: Difficulty;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  tags: string[];
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  chefTips?: string[];
  nutrition?: NutritionInfo;
  averageRating: number;
  reviewsCount: number;
  likesCount: number;
  savesCount: number;
  createdAt: string;
  featured?: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  category: IngredientCategory;
  recipeTitle: string;
  checked: boolean;
}

export interface FilterOptions {
  searchQuery: string;
  cuisine: string;
  mealType: string;
  difficulty: string;
  maxTotalTime: number | null;
  minRating: number | null;
  selectedTags: string[];
  sortBy: 'trending' | 'highest_rated' | 'newest' | 'quickest';
  fridgeIngredients: string[];
}
