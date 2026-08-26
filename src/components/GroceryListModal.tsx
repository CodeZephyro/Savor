import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  Check, 
  Copy, 
  Plus, 
  Share2, 
  CheckCheck 
} from 'lucide-react';
import { useRecipeContext } from '../context/RecipeContext';
import { GroceryItem } from '../types';

export const GroceryListModal: React.FC = () => {
  const {
    isGroceryModalOpen,
    setIsGroceryModalOpen,
    groceryList,
    toggleGroceryItem,
    removeGroceryItem,
    clearCheckedGroceryItems,
    clearAllGroceryItems,
  } = useRecipeContext();

  const [newItemName, setNewItemName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isGroceryModalOpen) return null;

  const uncheckedItems = groceryList.filter((g) => !g.checked);
  const checkedItems = groceryList.filter((g) => g.checked);

  // Group by category
  const categories = ['produce', 'dairy', 'meat', 'pantry', 'spices', 'bakery', 'other'];

  const handleCopyList = () => {
    const text = groceryList
      .map((item) => `${item.checked ? '[x]' : '[ ]'} ${item.amount} ${item.unit} ${item.name} (${item.recipeTitle})`)
      .join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      id="grocery-list-overlay"
      className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm overflow-y-auto flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={() => setIsGroceryModalOpen(false)}
    >
      <div 
        id="grocery-list-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-stone-200 flex flex-col relative max-h-[90vh]"
      >
        {/* Header */}
        <header className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 leading-none">
                Smart Grocery List
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {uncheckedItems.length} items to pick up • auto-grouped by aisle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {groceryList.length > 0 && (
              <button
                onClick={handleCopyList}
                className="p-2 rounded-xl hover:bg-stone-200 text-stone-600 flex items-center gap-1.5 text-xs font-semibold"
                title="Copy shopping list text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            <button
              onClick={() => setIsGroceryModalOpen(false)}
              className="p-2 rounded-full hover:bg-stone-200 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {groceryList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-800 text-sm">Your Grocery List is Empty</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore recipes and click &quot;Add to Grocery List&quot; on any recipe page to automatically populate your shopping list.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Unchecked Items grouped by category */}
              {categories.map((cat) => {
                const catItems = uncheckedItems.filter((i) => i.category === cat);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat} className="space-y-2">
                    <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      {cat}
                    </h4>
                    <div className="space-y-1.5">
                      {catItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleGroceryItem(item.id)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50/50 border border-stone-200/80 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-md border border-stone-300 bg-white flex items-center justify-center group-hover:border-orange-500">
                              {item.checked && <Check className="w-3 h-3 text-orange-600 stroke-[3]" />}
                            </div>
                            <div className="text-xs">
                              <span className="font-bold text-stone-900 mr-1.5">
                                {item.amount} {item.unit}
                              </span>
                              <span className="text-stone-800">{item.name}</span>
                              <span className="text-[10px] text-stone-400 ml-2">
                                ({item.recipeTitle})
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGroceryItem(item.id);
                            }}
                            className="p-1 text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Checked Items */}
              {checkedItems.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Completed ({checkedItems.length})
                    </h4>
                    <button
                      onClick={clearCheckedGroceryItems}
                      className="text-xs text-stone-500 hover:text-rose-600 font-semibold"
                    >
                      Clear Done
                    </button>
                  </div>
                  <div className="space-y-1 opacity-60">
                    {checkedItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleGroceryItem(item.id)}
                        className="flex items-center justify-between p-2 rounded-xl bg-stone-100 line-through text-xs text-stone-500 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-md bg-orange-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>
                            {item.amount} {item.unit} {item.name}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGroceryItem(item.id);
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        {groceryList.length > 0 && (
          <footer className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
            <button
              onClick={clearAllGroceryItems}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Clear Entire List
            </button>
            <button
              onClick={() => setIsGroceryModalOpen(false)}
              className="px-5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-full"
            >
              Done Shopping
            </button>
          </footer>
        )}

      </div>
    </div>
  );
};
