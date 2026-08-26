import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Bookmark, 
  Flame, 
  Users, 
  Edit3, 
  Star, 
  UtensilsCrossed, 
  Check, 
  Camera,
  X
} from 'lucide-react';
import { User, Recipe } from '../types';
import { useRecipeContext } from '../context/RecipeContext';
import { RecipeCard } from './RecipeCard';
import { compressImage } from '../utils/imageCompressor';

interface UserProfileViewProps {
  user: User;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user }) => {
  const {
    currentUser,
    recipes,
    reviews,
    toggleFollowUser,
    updateProfile,
    setActiveTab,
    setSelectedAuthorProfile,
  } = useRecipeContext();

  const isMe = user.id === currentUser.id;
  const isFollowing = currentUser.following.includes(user.id);

  const [activeSubTab, setActiveSubTab] = useState<'created' | 'saved' | 'reviews'>('created');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);
  const [editSpecialties, setEditSpecialties] = useState(user.specialties.join(', '));
  const [editAvatar, setEditAvatar] = useState(user.avatar);

  const createdRecipes = recipes.filter((r) => r.authorId === user.id);
  const savedRecipes = recipes.filter((r) => user.savedRecipeIds.includes(r.id));
  const userReviews = reviews.filter((rev) => rev.userId === user.id);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 0.85);
        setEditAvatar(compressed);
      } catch (err) {
        console.error('Failed to compress avatar:', err);
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const specs = editSpecialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      avatar: editAvatar,
      specialties: specs.length > 0 ? specs : user.specialties,
    });
    setIsEditingProfile(false);
  };

  return (
    <div id="user-profile-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Profile Banner & Bio Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-orange-500/20 shadow-md"
              />
              {user.badge && (
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white shadow-xs">
                  {user.badge}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-none">
                  {user.name}
                </h1>
                <span className="text-xs text-stone-400 font-medium">@{user.username}</span>
              </div>

              <p className="text-xs text-stone-500">{user.joinedDate}</p>

              {/* Followers & Following counters */}
              <div className="flex items-center gap-4 pt-1 text-xs">
                <span className="text-stone-700">
                  <strong className="font-bold text-stone-900">{user.followersCount}</strong> Followers
                </span>
                <span className="text-stone-700">
                  <strong className="font-bold text-stone-900">{user.followingCount}</strong> Following
                </span>
                <span className="text-stone-700">
                  <strong className="font-bold text-stone-900">{createdRecipes.length}</strong> Recipes
                </span>
              </div>
            </div>
          </div>

          {/* Action: Edit Profile or Follow */}
          <div>
            {isMe ? (
              <button
                id="edit-profile-btn"
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                id={`profile-follow-btn-${user.id}`}
                onClick={() => toggleFollowUser(user.id)}
                className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                  isFollowing
                    ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20'
                }`}
              >
                {isFollowing ? 'Following' : '+ Follow Chef'}
              </button>
            )}
          </div>

        </div>

        {/* Bio & Specialties */}
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-3xl">
            {user.bio}
          </p>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-stone-500 uppercase tracking-wider text-[11px]">
              Specialties:
            </span>
            {user.specialties.map((spec) => (
              <span
                key={spec}
                className="px-3 py-1 rounded-full bg-orange-50 text-orange-900 font-semibold border border-orange-200 text-xs"
              >
                🍳 {spec}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Sub Tabs: Created, Saved, Reviews */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveSubTab('created')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeSubTab === 'created'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Created Recipes ({createdRecipes.length})
          </button>

          <button
            onClick={() => setActiveSubTab('saved')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeSubTab === 'saved'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Saved Cookbook ({savedRecipes.length})
          </button>

          <button
            onClick={() => setActiveSubTab('reviews')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeSubTab === 'reviews'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Reviews & Photos ({userReviews.length})
          </button>
        </div>

        {/* Content of Sub Tabs */}
        {activeSubTab === 'created' && (
          <div>
            {createdRecipes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-stone-200">
                <p className="text-sm text-stone-500">No published recipes yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {createdRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'saved' && (
          <div>
            {savedRecipes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-stone-200">
                <p className="text-sm text-stone-500">No saved recipes in cookbook yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'reviews' && (
          <div className="space-y-4">
            {userReviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-stone-200">
                <p className="text-sm text-stone-500">No reviews written yet.</p>
              </div>
            ) : (
              userReviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                        />
                      ))}
                      <span className="text-xs text-stone-400 ml-2">{rev.createdAt}</span>
                    </div>
                    {rev.madeIt && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ Made It
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{rev.comment}</p>
                  {rev.photoUrl && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-stone-200 mt-2">
                      <img src={rev.photoUrl} alt="Review result" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div 
          className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex justify-center p-4 overflow-y-auto"
          onClick={() => setIsEditingProfile(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 my-auto border border-stone-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">Edit Chef Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              {/* Avatar Uploader */}
              <div className="flex items-center gap-4">
                <img src={editAvatar} alt="Preview" className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-500/30" />
                <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl cursor-pointer">
                  <span>Change Avatar</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Specialties (comma-separated)</label>
                <input
                  type="text"
                  value={editSpecialties}
                  onChange={(e) => setEditSpecialties(e.target.value)}
                  placeholder="e.g. Sourdough, Pasta, Mediterranean"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-stone-600 font-semibold hover:bg-stone-100 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
