import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Plus, 
  Trash2, 
  Sparkles, 
  Clock, 
  Utensils, 
  ChefHat, 
  Image as ImageIcon, 
  Check, 
  AlertCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRecipeContext } from '../context/RecipeContext';
import { compressImage } from '../utils/imageCompressor';
import { CUISINES, MEAL_TYPES } from '../data/initialData';
import { Ingredient, InstructionStep, IngredientCategory, MealType, Difficulty } from '../types';

const SAMPLE_FOOD_PRESETS = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1000&auto=format&fit=crop&q=80',
];

const DIETARY_TAG_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'High-Protein',
  'Low-Carb',
  'Keto',
  'Quick & Easy',
  'Gourmet',
  'Comfort Food',
  'Meal Prep',
  'Date Night',
];

export const CreateRecipeModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, addRecipe, setActiveRecipeModal } = useRecipeContext();

  // Basic Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('Italian');
  const [mealType, setMealType] = useState<MealType>('Dinner');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(25);
  const [servings, setServings] = useState(4);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Ingredients State
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', amount: '2', unit: 'tbsp', name: 'Extra Virgin Olive Oil', category: 'pantry' },
    { id: '2', amount: '3', unit: 'cloves', name: 'Fresh Garlic', category: 'produce', notes: 'minced' },
  ]);

  // Instructions State
  const [instructions, setInstructions] = useState<InstructionStep[]>([
    { step: 1, title: 'Prep the Aromatics', instruction: 'Mince garlic and gather all fresh herbs and measured ingredients.', timerMinutes: 5 },
    { step: 2, title: 'Cook & Simmer', instruction: 'Heat olive oil in a deep skillet and cook aromatics until fragrant.', timerMinutes: 10 },
  ]);

  // Tags & Nutrition State
  const [selectedTags, setSelectedTags] = useState<string[]>(['Quick & Easy']);
  const [chefTips, setChefTips] = useState<string[]>(['Use high-quality olive oil for the best aromatic base.']);
  const [newTipInput, setNewTipInput] = useState('');

  const [calories, setCalories] = useState<number>(450);
  const [protein, setProtein] = useState('18g');
  const [carbs, setCarbs] = useState('42g');
  const [fat, setFat] = useState('20g');

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingWithAi, setIsGeneratingWithAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isCreateModalOpen) return null;

  // Handle Image Upload via File Input or Drop
  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map((file) => compressImage(file, 1200, 0.82));
      const newImages = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Add Ingredient Row
  const addIngredientRow = () => {
    setIngredients((prev) => [
      ...prev,
      { id: Date.now().toString(), amount: '1', unit: 'cup', name: '', category: 'pantry' },
    ]);
  };

  const removeIngredientRow = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Add Step Row
  const addInstructionRow = () => {
    setInstructions((prev) => [
      ...prev,
      {
        step: prev.length + 1,
        title: `Step ${prev.length + 1}`,
        instruction: '',
        timerMinutes: null,
      },
    ]);
  };

  const removeInstructionRow = (stepIndex: number) => {
    const filtered = instructions.filter((_, idx) => idx !== stepIndex);
    // Re-index steps
    const reindexed = filtered.map((st, i) => ({ ...st, step: i + 1 }));
    setInstructions(reindexed);
  };

  const updateInstruction = (stepIndex: number, field: keyof InstructionStep, value: any) => {
    setInstructions((prev) =>
      prev.map((item, idx) => (idx === stepIndex ? { ...item, [field]: value } : item))
    );
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const addChefTip = () => {
    if (newTipInput.trim()) {
      setChefTips((prev) => [...prev, newTipInput.trim()]);
      setNewTipInput('');
    }
  };

  // AI Recipe Auto-Fill
  const handleAiAutoFill = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingWithAi(true);
    setAiError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 28000);

    try {
      const res = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ prompt: aiPrompt, cuisine }),
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to auto-generate recipe');
      }

      const r = data.recipe;
      if (r.title) setTitle(r.title);
      if (r.description) setDescription(r.description);
      if (r.cuisine) setCuisine(r.cuisine);
      if (r.mealType) setMealType(r.mealType);
      if (r.difficulty) setDifficulty(r.difficulty);
      if (r.prepTime) setPrepTime(r.prepTime);
      if (r.cookTime) setCookTime(r.cookTime);
      if (r.servings) setServings(r.servings);
      if (r.tags && Array.isArray(r.tags)) setSelectedTags(r.tags);
      if (r.ingredients && Array.isArray(r.ingredients)) {
        setIngredients(
          r.ingredients.map((ing: any, i: number) => ({
            id: `ai-ing-${i}`,
            amount: ing.amount || '1',
            unit: ing.unit || 'unit',
            name: ing.name || 'Ingredient',
            category: 'pantry',
            notes: ing.notes || '',
          }))
        );
      }
      if (r.instructions && Array.isArray(r.instructions)) {
        setInstructions(
          r.instructions.map((ins: any, i: number) => ({
            step: i + 1,
            title: ins.title || `Step ${i + 1}`,
            instruction: ins.instruction || '',
            timerMinutes: ins.timerMinutes || null,
          }))
        );
      }
      if (r.chefTips && Array.isArray(r.chefTips)) setChefTips(r.chefTips);
      if (r.nutrition) {
        if (r.nutrition.calories) setCalories(r.nutrition.calories);
        if (r.nutrition.protein) setProtein(r.nutrition.protein);
        if (r.nutrition.carbs) setCarbs(r.nutrition.carbs);
        if (r.nutrition.fat) setFat(r.nutrition.fat);
      }

      // If no images yet, add a relevant preset image
      if (images.length === 0) {
        setImages([SAMPLE_FOOD_PRESETS[Math.floor(Math.random() * SAMPLE_FOOD_PRESETS.length)]]);
      }
    } catch (err: any) {
      setAiError(err.message || 'AI Auto-Fill encountered an issue.');
    } finally {
      setIsGeneratingWithAi(false);
    }
  };

  // Submit Recipe
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalImages = images.length > 0
      ? images
      : [SAMPLE_FOOD_PRESETS[Math.floor(Math.random() * SAMPLE_FOOD_PRESETS.length)]];

    const validIngredients = ingredients.filter((i) => i.name.trim().length > 0);
    const validInstructions = instructions.filter((i) => i.instruction.trim().length > 0);

    const created = addRecipe({
      title: title.trim(),
      description: description.trim() || 'A delightful homemade recipe shared on Savor.',
      images: finalImages,
      cuisine: cuisine === 'All' ? 'Fusion' : cuisine,
      mealType,
      difficulty,
      prepTime: Number(prepTime) || 15,
      cookTime: Number(cookTime) || 20,
      servings: Number(servings) || 4,
      tags: selectedTags.length > 0 ? selectedTags : ['Homemade'],
      ingredients: validIngredients.length > 0 ? validIngredients : [
        { id: '1', amount: '1', unit: 'serving', name: 'Main ingredient', category: 'pantry' },
      ],
      instructions: validInstructions.length > 0 ? validInstructions : [
        { step: 1, title: 'Preparation', instruction: 'Follow your chef intuition and enjoy cooking!' },
      ],
      chefTips: chefTips.length > 0 ? chefTips : undefined,
      nutrition: {
        calories: Number(calories) || 400,
        protein: protein || '15g',
        carbs: carbs || '35g',
        fat: fat || '18g',
      },
    });

    setIsCreateModalOpen(false);
    setActiveRecipeModal(created);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div 
      id="create-recipe-overlay"
      className="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-sm overflow-y-auto flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={() => setIsCreateModalOpen(false)}
    >
      <div 
        id="create-recipe-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-stone-200 flex flex-col relative max-h-[92vh]"
      >
        
        {/* Header */}
        <header className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 leading-none">
                Share a New Recipe
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Post your culinary creations, photos, timers & techniques
              </p>
            </div>
          </div>

          <button
            id="close-create-modal-btn"
            onClick={() => setIsCreateModalOpen(false)}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Form Body */}
        <form onSubmit={handlePublish} className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-8 flex-1">
          
          {/* AI Recipe Assistant Auto-Fill Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Have an idea? Let Chef AI draft your recipe structure instantly</span>
            </div>

            <div className="flex gap-2">
              <input
                id="ai-prompt-input"
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Crispy Honey Garlic Salmon with toasted sesame broccoli & Jasmine rice..."
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden placeholder:text-stone-400"
              />
              <button
                type="button"
                id="ai-generate-recipe-btn"
                onClick={handleAiAutoFill}
                disabled={isGeneratingWithAi || !aiPrompt.trim()}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition-all"
              >
                {isGeneratingWithAi ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill Form</span>
                  </>
                )}
              </button>
            </div>
            {aiError && <p className="text-xs text-rose-600">{aiError}</p>}
          </div>

          {/* Section 1: Recipe Imagery Uploads */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
              Recipe Photos & Visuals (Upload or Pick)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Drop / Upload Zone */}
              <label 
                id="image-dropzone"
                className="aspect-4/3 rounded-2xl border-2 border-dashed border-stone-300 hover:border-orange-500 bg-stone-50 hover:bg-orange-50/50 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors group"
              >
                <Camera className="w-6 h-6 text-stone-400 group-hover:text-orange-600 mb-1" />
                <span className="text-xs font-semibold text-stone-700 group-hover:text-orange-900">
                  Upload Photo
                </span>
                <span className="text-[10px] text-stone-400">Drag or browse</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageFiles(e.target.files)}
                  className="hidden"
                />
              </label>

              {/* Uploaded Images Preview Cards */}
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-4/3 rounded-2xl overflow-hidden border border-stone-200 group shadow-xs">
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      Cover Photo
                    </span>
                  )}
                </div>
              ))}

            </div>

            {/* Quick Preset Selector if empty */}
            {images.length === 0 && (
              <div className="pt-1">
                <p className="text-[11px] text-stone-500 mb-1.5">Or choose from gourmet culinary presets:</p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {SAMPLE_FOOD_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImages([preset])}
                      className="w-14 h-14 rounded-xl overflow-hidden border-2 border-stone-200 hover:border-orange-500 shrink-0 transition-transform hover:scale-105"
                    >
                      <img src={preset} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Core Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                Recipe Title *
              </label>
              <input
                id="recipe-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pan-Seared Chilean Sea Bass with Lemon Caper Emulsion"
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-hidden font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                Story & Description
              </label>
              <textarea
                id="recipe-description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the inspiration, flavor notes, or history behind this dish..."
                rows={2}
                className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-hidden"
              />
            </div>

            {/* Cuisines, Meals, Difficulty, Yield & Times Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Cuisine</label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  {CUISINES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Meal Course</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  {MEAL_TYPES.filter((m) => m !== 'All').map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Prep (Mins)</label>
                <input
                  type="number"
                  min={1}
                  value={prepTime}
                  onChange={(e) => setPrepTime(Number(e.target.value))}
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Cook (Mins)</label>
                <input
                  type="number"
                  min={0}
                  value={cookTime}
                  onChange={(e) => setCookTime(Number(e.target.value))}
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Servings</label>
                <input
                  type="number"
                  min={1}
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Ingredients Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                Ingredients ({ingredients.length})
              </label>
              <button
                type="button"
                id="add-ingredient-btn"
                onClick={addIngredientRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing) => (
                <div key={ing.id} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                  <input
                    type="text"
                    placeholder="Amt"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(ing.id, 'amount', e.target.value)}
                    className="w-16 p-1.5 text-xs bg-white border border-stone-200 rounded-lg text-center font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Unit (g, tbsp, cups)"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                    className="w-24 p-1.5 text-xs bg-white border border-stone-200 rounded-lg text-center"
                  />
                  <input
                    type="text"
                    placeholder="Ingredient Name (e.g. Parmigiano-Reggiano)"
                    value={ing.name}
                    onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                    className="flex-1 p-1.5 text-xs bg-white border border-stone-200 rounded-lg font-medium"
                  />
                  <select
                    value={ing.category}
                    onChange={(e) => updateIngredient(ing.id, 'category', e.target.value as IngredientCategory)}
                    className="w-24 p-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-600 hidden sm:block"
                  >
                    <option value="produce">Produce</option>
                    <option value="dairy">Dairy</option>
                    <option value="meat">Meat</option>
                    <option value="pantry">Pantry</option>
                    <option value="spices">Spices</option>
                    <option value="bakery">Bakery</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeIngredientRow(ing.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Step-by-Step Instructions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                Step-by-Step Instructions ({instructions.length})
              </label>
              <button
                type="button"
                id="add-instruction-step-btn"
                onClick={addInstructionRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-3">
              {instructions.map((step, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {step.step}
                      </span>
                      <input
                        type="text"
                        placeholder="Step Heading (e.g. Searing the Duck Breast)"
                        value={step.title}
                        onChange={(e) => updateInstruction(idx, 'title', e.target.value)}
                        className="flex-1 p-1.5 text-xs bg-white border border-stone-200 rounded-lg font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <input
                        type="number"
                        min={0}
                        placeholder="Timer (mins)"
                        value={step.timerMinutes || ''}
                        onChange={(e) =>
                          updateInstruction(
                            idx,
                            'timerMinutes',
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="w-24 p-1.5 text-xs bg-white border border-stone-200 rounded-lg text-center"
                      />
                      <button
                        type="button"
                        onClick={() => removeInstructionRow(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    placeholder="Describe specific culinary technique, visual cues, and sensations..."
                    value={step.instruction}
                    onChange={(e) => updateInstruction(idx, 'instruction', e.target.value)}
                    rows={2}
                    className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-xl outline-hidden"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Dietary Tags & Chef Tips */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                Dietary & Lifestyle Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIETARY_TAG_OPTIONS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-orange-600 text-white font-semibold'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chef Tips */}
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                Chef Tips & Pro Secrets
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Always bring steaks to room temp 30 mins prior to cooking..."
                  value={newTipInput}
                  onChange={(e) => setNewTipInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addChefTip();
                    }
                  }}
                  className="flex-1 p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
                <button
                  type="button"
                  onClick={addChefTip}
                  className="px-3 py-1.5 bg-stone-800 text-white text-xs font-bold rounded-xl"
                >
                  Add Tip
                </button>
              </div>

              {chefTips.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-stone-600">
                  {chefTips.map((tip, i) => (
                    <li key={i} className="flex items-center justify-between bg-amber-50/60 p-1.5 px-3 rounded-lg border border-amber-200/60">
                      <span>💡 {tip}</span>
                      <button
                        type="button"
                        onClick={() => setChefTips((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-stone-400 hover:text-rose-600"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Section 6: Nutrition Estimation */}
          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              Nutrition Breakdown (Per Serving)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500">Calories</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500">Protein</label>
                <input
                  type="text"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500">Carbs</label>
                <input
                  type="text"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500">Fat</label>
                <input
                  type="text"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Submit Footer CTA */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-5 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="publish-recipe-submit-btn"
              className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              Publish Recipe to Community
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
