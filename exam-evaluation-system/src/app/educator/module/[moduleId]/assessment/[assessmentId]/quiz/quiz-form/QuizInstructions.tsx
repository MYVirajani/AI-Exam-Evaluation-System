import { Plus, Trash2, X } from "lucide-react";
import Button from "@/components/Button";
import { formatDuration } from "@/utils/date-time";

interface QuizInstructionsProps {
  instructions: string[];
  duration: number;
  shuffleQuestions: boolean;
  backNavigation: boolean;
  autoGrade: boolean;
  hasPassword: boolean;
  maxAttempts: number;
  onInstructionsChange: (instructions: string[]) => void;
}

const generateDefaultInstructions = ({
  duration,
  shuffleQuestions,
  backNavigation,
  autoGrade,
  hasPassword,
  maxAttempts,
}: {
  duration: number;
  shuffleQuestions: boolean;
  backNavigation: boolean;
  autoGrade: boolean;
  hasPassword: boolean;
  maxAttempts: number;
}): string[] => {
  const instructions = [
    "Ensure stable internet connection before starting",
    "Complete the quiz in one continuous session",
    `Time limit: ${formatDuration(duration)}`,
    "Submit before the deadline to avoid auto-submission",

    autoGrade
      ? "Results will be available immediately after submission"
      : "Results will be available after manual grading by your educator",

    maxAttempts > 1
      ? `You have ${maxAttempts} attempts - your highest score will be recorded`
      : "Only one attempt allowed",

    hasPassword ? "Password required to start the quiz" : null,

    backNavigation
      ? "You can navigate back to previous questions"
      : "Back navigation is disabled - answers are final once submitted",

    shuffleQuestions
      ? "Questions will be shuffled for each attempt"
      : null,

    "Review your answers carefully before final submission",
  ];

  return instructions.filter(Boolean) as string[];
};

export default function QuizInstructions({
  instructions,
  duration,
  shuffleQuestions,
  backNavigation,
  autoGrade,
  hasPassword,
  maxAttempts,
  onInstructionsChange,
}: QuizInstructionsProps) {
  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    onInstructionsChange(newInstructions);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      onInstructionsChange(newInstructions);
    }
  };

  const addInstruction = () => {
    onInstructionsChange([...instructions, ""]);
  };

  const resetToDefaults = () => {
    onInstructionsChange(
      generateDefaultInstructions({
        duration,
        shuffleQuestions,
        backNavigation,
        autoGrade,
        hasPassword,
        maxAttempts,
      })
    );
  };

  const clearAllInstructions = () => {
    onInstructionsChange([""]);
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Quiz Instructions
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Add instructions to guide students during the quiz
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={clearAllInstructions}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear All
          </Button>
          <Button
            onClick={resetToDefaults}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Reset to Defaults
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="space-y-3">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-start gap-3 group">
              <div className="flex-shrink-0 w-8 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600 mt-1">
                {index + 1}
              </div>
              <input
                type="text"
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                className="flex-1 px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                placeholder="Enter an instruction for students..."
              />
              {instructions.length > 1 && (
                <Button
                  onClick={() => removeInstruction(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={addInstruction} variant="secondary" size="sm">
            <Plus className="w-4 h-4" />
            Add Instruction
          </Button>
        </div>
      </div>
    </div>
  );
}