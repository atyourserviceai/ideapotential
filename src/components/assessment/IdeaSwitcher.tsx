import { Card } from "@/components/card/Card";
import type { AppAgentState } from "../../agent/AppAgent";
import type { Idea } from "../../types/assessment";

interface IdeaSwitcherProps {
  agentState: AppAgentState;
  onIdeaChange: (ideaId: string | "new") => void;
}

export function IdeaSwitcher({ agentState, onIdeaChange }: IdeaSwitcherProps) {
  const ideas = agentState.ideas || [];
  const currentIdea = agentState.currentIdea;
  const currentIdeaId = currentIdea?.idea_id || "new";

  const getCompletionPercentage = (idea: Idea): number => {
    const factors = Object.values(idea.checklist || {});
    const scored = factors.filter(
      (f) => f.score !== null && f.score !== undefined
    ).length;
    return factors.length > 0 ? Math.round((scored / factors.length) * 100) : 0;
  };

  return (
    <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      {/* Desktop: side-by-side layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Current Idea {ideas.length > 0 && `(${ideas.length} total)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={currentIdeaId}
            onChange={(e) => onIdeaChange(e.target.value)}
            className="text-sm border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-100"
          >
            {ideas.map((idea) => (
              <option key={idea.idea_id} value={idea.idea_id}>
                {idea.title || "Untitled Idea"}
              </option>
            ))}
            <option value="new">+ New Idea</option>
          </select>
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Current Idea {ideas.length > 0 && `(${ideas.length} total)`}
          </span>
        </div>
        <select
          value={currentIdeaId}
          onChange={(e) => onIdeaChange(e.target.value)}
          className="w-full text-sm border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-100"
        >
          {ideas.map((idea) => (
            <option key={idea.idea_id} value={idea.idea_id}>
              {(idea.title || "Untitled Idea").length > 30
                ? `${(idea.title || "Untitled Idea").substring(0, 30)}...`
                : idea.title || "Untitled Idea"}
            </option>
          ))}
          <option value="new">+ New Idea</option>
        </select>
      </div>

      {/* Current idea summary */}
      <div className="mt-2">
        {currentIdea ? (
          <div className="text-xs text-blue-600 dark:text-blue-300">
            {currentIdea.one_liner || "No description yet"} • Stage:{" "}
            {currentIdea.stage || "concept"} • Progress:{" "}
            {getCompletionPercentage(currentIdea)}%
          </div>
        ) : (
          <div className="text-xs text-blue-600 dark:text-blue-300">
            Ready to assess a new startup idea
          </div>
        )}
      </div>
    </Card>
  );
}
