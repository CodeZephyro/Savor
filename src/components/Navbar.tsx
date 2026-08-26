import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Search, 
  Plus, 
  Bookmark, 
  Users, 
  Compass, 
  ShoppingCart, 
  Sparkles, 
  Refrigerator,
  User as UserIcon,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { useRecipeContext } from '../context/RecipeContext';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    activeTab,
    setActiveTab,
    setIsCreateModalOpen,
    setIsGroceryModalOpen,
    setIsFridgeModalOpen,
    setIsAiDrawerOpen,
    setAiDrawerRecipe,
    groceryList,
    filters,
    setFilters,
    setSelectedAuthorProfile,
  } = useRecipeContext();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const uncheckedGroceriesCount = groceryList.filter((g) => !g.checked).length;

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            id="brand-logo"
            onClick={() => {
              setActiveTab('explore');
              setSelectedAuthorProfile(null);
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 leading-none">
                  Savor
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 uppercase tracking-wider">
                  Social
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-500 hidden sm:block">
                Cook, Share & Connect
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg relative">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ searchQuery: e.target.value })}
                placeholder="Search recipes, ingredients, cuisines, or chefs..."
                className="w-full pl-10 pr-9 py-2 bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-stone-800 text-sm rounded-full border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-hidden placeholder:text-stone-400"
              />
              {filters.searchQuery && (
                <button
                  id="clear-search-button"
                  onClick={() => setFilters({ searchQuery: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Fridge Pantry Finder Button */}
            <button
              id="open-fridge-search-btn"
              onClick={() => setIsFridgeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-orange-600 bg-stone-100 hover:bg-orange-50 border border-stone-200 rounded-full transition-colors"
              title="Find recipes using ingredients currently in your fridge"
            >
              <Refrigerator className="w-4 h-4 text-orange-500" />
              <span className="hidden md:inline">Fridge Finder</span>
              {filters.fridgeIngredients.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              )}
            </button>

            {/* AI Sous Chef Trigger */}
            <button
              id="open-ai-chef-btn"
              onClick={() => {
                setAiDrawerRecipe(null);
                setIsAiDrawerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-full transition-colors"
              title="Ask AI Sous-Chef for ideas, substitutes & pairing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden md:inline">Ask AI Chef</span>
            </button>

            {/* Smart Grocery List */}
            <button
              id="open-grocery-list-btn"
              onClick={() => setIsGroceryModalOpen(true)}
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
              title="View your smart grocery shopping list"
            >
              <ShoppingCart className="w-5 h-5" />
              {uncheckedGroceriesCount > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 w-5 h-5 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {uncheckedGroceriesCount > 9 ? '9+' : uncheckedGroceriesCount}
                </span>
              )}
            </button>

            {/* Share / Create Recipe CTA */}
            <button
              id="create-recipe-header-btn"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm shadow-orange-600/20 hover:shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Share Recipe</span>
              <span className="sm:hidden">Share</span>
            </button>

            {/* User Profile / Switcher Dropdown */}
            <div className="relative">
              <button
                id="user-menu-trigger"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-colors"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-orange-500/30"
                />
                <span className="text-xs font-semibold text-stone-800 max-w-[80px] truncate hidden lg:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* User Dropdown Popover */}
              {isUserMenuOpen && (
                <div 
                  id="user-menu-popover"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-3 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-stone-900 truncate">{currentUser.name}</p>
                        <p className="text-xs text-stone-500 truncate">@{currentUser.username}</p>
                        {currentUser.badge && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                            {currentUser.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="view-my-profile-btn"
                      onClick={() => {
                        setSelectedAuthorProfile(currentUser);
                        setActiveTab('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-stone-400" />
                      View My Profile
                    </button>
                    <button
                      id="view-my-saved-btn"
                      onClick={() => {
                        setActiveTab('saved');
                        setSelectedAuthorProfile(null);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4 text-stone-400" />
                      Saved Recipes ({currentUser.savedRecipeIds.length})
                    </button>
                  </div>

                  {/* Switch Demo Chef Persona */}
                  <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/70">
                    <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                      Switch Chef Account
                    </p>
                    <div className="space-y-1.5">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          id={`switch-user-${u.id}`}
                          onClick={() => {
                            switchUser(u.id);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            u.id === currentUser.id
                              ? 'bg-orange-50 text-orange-900 font-semibold border border-orange-200'
                              : 'text-stone-600 hover:bg-stone-100 font-normal'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                            <span className="truncate">{u.name}</span>
                          </div>
                          {u.id === currentUser.id && (
                            <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Navigation Tabs Header Bar */}
        <div className="flex items-center justify-between border-t border-stone-100 py-2 overflow-x-auto scrollbar-none gap-2">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="tab-explore"
              onClick={() => {
                setActiveTab('explore');
                setSelectedAuthorProfile(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'explore' && !filters.searchQuery
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Explore All
            </button>

            <button
              id="tab-following"
              onClick={() => {
                setActiveTab('following');
                setSelectedAuthorProfile(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'following'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Chefs You Follow ({currentUser.following.length})
            </button>

            <button
              id="tab-saved"
              onClick={() => {
                setActiveTab('saved');
                setSelectedAuthorProfile(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Cookbook & Saved ({currentUser.savedRecipeIds.length})
            </button>

            <button
              id="tab-my-recipes"
              onClick={() => {
                setActiveTab('my-recipes');
                setSelectedAuthorProfile(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'my-recipes'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              My Shared Recipes
            </button>
          </nav>
        </div>

      </div>
    </header>
  );
};
