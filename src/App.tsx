import React from 'react';
import { RecipeProvider, useRecipeContext } from './context/RecipeContext';
import { Navbar } from './components/Navbar';
import { ExploreView } from './components/ExploreView';
import { CommunityFeedView } from './components/CommunityFeedView';
import { UserProfileView } from './components/UserProfileView';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { CookModeModal } from './components/CookModeModal';
import { CreateRecipeModal } from './components/CreateRecipeModal';
import { FridgeSearchModal } from './components/FridgeSearchModal';
import { GroceryListModal } from './components/GroceryListModal';
import { AiSousChefDrawer } from './components/AiSousChefDrawer';

const MainLayout: React.FC = () => {
  const { activeTab, currentUser, selectedAuthorProfile } = useRecipeContext();

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {(activeTab === 'explore' || activeTab === 'following') && <ExploreView />}
        {(activeTab === 'saved' || activeTab === 'my-recipes') && <UserProfileView user={currentUser} />}
        {activeTab === 'profile' && (
          <UserProfileView user={selectedAuthorProfile || currentUser} />
        )}
      </main>

      {/* Modals & Drawers */}
      <RecipeDetailModal />
      <CookModeModal />
      <CreateRecipeModal />
      <FridgeSearchModal />
      <GroceryListModal />
      <AiSousChefDrawer />
    </div>
  );
};

export default function App() {
  return (
    <RecipeProvider>
      <MainLayout />
    </RecipeProvider>
  );
}
