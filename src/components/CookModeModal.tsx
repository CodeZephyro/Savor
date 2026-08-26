import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Utensils, 
  Sparkles, 
  Award,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe } from '../types';
import { useRecipeContext } from '../context/RecipeContext';

export const CookModeModal: React.FC = () => {
  const { activeCookModeRecipe, setActiveCookModeRecipe, setActiveRecipeModal } = useRecipeContext();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [showIngredientsDrawer, setShowIngredientsDrawer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Timer state for current step
  const currentStep = activeCookModeRecipe?.instructions?.[currentStepIndex];
  const stepTimerMinutes = currentStep?.timerMinutes || null;

  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(
    stepTimerMinutes ? stepTimerMinutes * 60 : null
  );
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Reset timer when changing steps
  useEffect(() => {
    if (stepTimerMinutes) {
      setTimerSecondsLeft(stepTimerMinutes * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsLeft(null);
      setIsTimerRunning(false);
    }
  }, [currentStepIndex, stepTimerMinutes]);

  // Timer Countdown interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Trigger a gentle confetti & notification
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  if (!activeCookModeRecipe) return null;

  const recipe = activeCookModeRecipe;
  const totalSteps = recipe.instructions.length;

  const toggleStepCompleted = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleNext = () => {
    setCompletedSteps((prev) => ({ ...prev, [currentStepIndex]: true }));
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
      });
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      id="cook-mode-overlay"
      className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col justify-between overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-stone-800/80 bg-stone-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-600/20 text-orange-500 border border-orange-500/30">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-white line-clamp-1">
              {recipe.title}
            </h2>
            <p className="text-xs text-stone-400">
              Interactive Cook Assistant • Step {currentStepIndex + 1} of {totalSteps}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="toggle-ingredients-cook-mode-btn"
            onClick={() => setShowIngredientsDrawer(!showIngredientsDrawer)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
          >
            📋 Ingredients
          </button>

          <button
            id="exit-cook-mode-btn"
            onClick={() => setActiveCookModeRecipe(null)}
            className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            title="Exit Cook Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-stone-800 h-1.5">
        <div 
          className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Center Stage: Step Instruction & Timer */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-center relative overflow-y-auto">
        
        {isFinished ? (
          /* Finished Screen */
          <div className="text-center space-y-6 max-w-md mx-auto py-10 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Award className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-3xl font-bold text-white">Bon Appétit!</h3>
              <p className="text-stone-300 text-sm">
                You have successfully prepared <strong className="text-orange-400 font-semibold">{recipe.title}</strong>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  setActiveCookModeRecipe(null);
                  setActiveRecipeModal(recipe);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-sm font-bold rounded-full shadow-lg transition-all"
              >
                Leave Rating & Photos
              </button>
              <button
                onClick={() => {
                  setIsFinished(false);
                  setCurrentStepIndex(0);
                  setCompletedSteps({});
                }}
                className="w-full sm:w-auto px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold rounded-full border border-stone-700 transition-colors"
              >
                Restart Steps
              </button>
            </div>
          </div>
        ) : (
          /* Active Step View */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
            
            {/* Step Number Badge */}
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-orange-600 text-white tracking-wide uppercase">
                Step {currentStep.step}
              </span>
              <span className="text-xs text-stone-400">
                {Object.keys(completedSteps).length} of {totalSteps} completed
              </span>
            </div>

            {/* Step Title */}
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
              {currentStep.title}
            </h1>

            {/* Instruction Body in Large Clear Font */}
            <div className="bg-stone-900/80 border border-stone-800 p-6 sm:p-8 rounded-3xl shadow-xl">
              <p className="text-stone-100 text-lg sm:text-2xl leading-relaxed font-normal">
                {currentStep.instruction}
              </p>
            </div>

            {/* Step Timer Widget (if step has timer) */}
            {timerSecondsLeft !== null && (
              <div className="bg-stone-900 border border-amber-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isTimerRunning ? 'bg-amber-500 text-stone-950 animate-pulse' : 'bg-stone-800 text-amber-400'}`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-stone-400">Kitchen Timer</p>
                    <p className="font-mono text-3xl font-bold text-amber-400">
                      {formatTime(timerSecondsLeft)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                      isTimerRunning
                        ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                        : 'bg-orange-600 text-white hover:bg-orange-500'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isTimerRunning ? 'Pause' : 'Start Timer'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSecondsLeft(stepTimerMinutes ? stepTimerMinutes * 60 : 0);
                    }}
                    className="p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Floating Ingredients Drawer Overlay */}
      {showIngredientsDrawer && (
        <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-stone-900 border-l border-stone-800 p-6 z-40 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif text-lg font-bold text-white">Recipe Ingredients</h3>
              <button onClick={() => setShowIngredientsDrawer(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {recipe.ingredients.map((ing) => (
                <div key={ing.id} className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-800 text-xs">
                  <span className="font-bold text-orange-400 mr-1.5">{ing.amount} {ing.unit}</span>
                  <span className="text-stone-200 font-medium">{ing.name}</span>
                  {ing.notes && <span className="block text-[11px] text-stone-400">({ing.notes})</span>}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowIngredientsDrawer(false)}
            className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl mt-4"
          >
            Back to Step
          </button>
        </div>
      )}

      {/* Bottom Navigation Controls Bar */}
      {!isFinished && (
        <footer className="p-4 sm:p-6 bg-stone-900/90 border-t border-stone-800 flex items-center justify-between max-w-4xl mx-auto w-full gap-4">
          <button
            id="cook-mode-prev-btn"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            id="cook-mode-complete-step-btn"
            onClick={() => toggleStepCompleted(currentStepIndex)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
              completedSteps[currentStepIndex]
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${completedSteps[currentStepIndex] ? 'text-emerald-400' : 'text-stone-500'}`} />
            <span>{completedSteps[currentStepIndex] ? 'Step Done' : 'Mark Done'}</span>
          </button>

          <button
            id="cook-mode-next-btn"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <span>{currentStepIndex === totalSteps - 1 ? 'Finish Dish' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      )}

    </div>
  );
};
