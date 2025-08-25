# Multi-Idea Management UX Design

## Current Problem

- Users can only see idea switcher when multiple ideas exist
- No way to start working on a new idea once one is created
- Agent doesn't know which idea user is currently focused on
- No clear way to switch between ideas during conversation

## Solution: Always-Visible Idea Switcher

### UI Design

#### Enhanced Idea Selector (Always Visible)

```typescript
// Always show this component, even with zero or one ideas
<Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
        Current Idea
      </span>
    </div>
    <div className="flex items-center gap-2">
      {/* Dropdown selector */}
      <select
        value={currentIdeaId || 'new'}
        onChange={handleIdeaChange}
        className="text-sm border rounded px-2 py-1"
      >
        {ideas.map(idea => (
          <option key={idea.idea_id} value={idea.idea_id}>
            {idea.title}
          </option>
        ))}
        <option value="new">+ New Idea</option>
      </select>

      {currentIdea && (
        <button onClick={handleDuplicateIdea} title="Duplicate this idea">
          📋
        </button>
      )}
    </div>
  </div>

  {/* Current idea summary */}
  {currentIdea ? (
    <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
      {currentIdea.one_liner} • {currentIdea.stage}
    </div>
  ) : (
    <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
      Ready to start assessing a new startup idea
    </div>
  )}
</Card>
```

### State Management

#### New Agent Tool: `selectIdea`

```typescript
// src/agent/tools/assessment.ts
export const selectIdea = tool({
  description: "Select which idea to focus the conversation on",
  parameters: z.object({
    ideaId: z
      .string()
      .describe("ID of the idea to select, or 'new' for new idea"),
    reason: z.string().optional().describe("Why switching to this idea"),
  }),
  execute: async ({ ideaId, reason }, { state, setState }) => {
    if (ideaId === "new") {
      // Reset to empty state for new idea
      setState({
        ...state,
        currentIdea: undefined,
        assessmentProgress: {
          currentStep: 0,
          totalSteps: 10,
          completedFactors: [],
        },
      });
      return "Ready to work on a new idea. Please describe your startup concept.";
    }

    const idea = state.ideas?.find((i) => i.idea_id === ideaId);
    if (!idea) {
      return (
        "Idea not found. Available ideas: " +
        (state.ideas?.map((i) => `${i.title} (${i.idea_id})`).join(", ") ||
          "none")
      );
    }

    setState({
      ...state,
      currentIdea: idea,
    });

    return `Now focusing on "${idea.title}". Current status: ${getIdeaProgress(idea)}`;
  },
});
```

#### Enhanced `getAgentState` Tool

```typescript
// Update existing getAgentState to include idea context
export const getAgentState = tool({
  description: "Get current agent state including selected idea context",
  parameters: z.object({}),
  execute: async (_, { state }) => {
    const currentIdea = state.currentIdea;
    const totalIdeas = state.ideas?.length || 0;

    return {
      mode: state.mode,
      currentIdea: currentIdea
        ? {
            id: currentIdea.idea_id,
            title: currentIdea.title,
            stage: currentIdea.stage,
            progressSummary: getIdeaProgress(currentIdea),
          }
        : null,
      totalIdeas,
      availableIdeas:
        state.ideas?.map((i) => ({
          id: i.idea_id,
          title: i.title,
          stage: i.stage,
        })) || [],
      founderProfile: state.founderProfile,
      assessmentProgress: state.assessmentProgress,
    };
  },
});
```

### Frontend Implementation

#### IdeaSwitcher Component

```typescript
// src/components/assessment/IdeaSwitcher.tsx
interface IdeaSwitcherProps {
  agentState: AppAgentState;
  onIdeaChange: (ideaId: string | 'new') => void;
}

export function IdeaSwitcher({ agentState, onIdeaChange }: IdeaSwitcherProps) {
  const ideas = agentState.ideas || [];
  const currentIdea = agentState.currentIdea;
  const currentIdeaId = currentIdea?.idea_id || 'new';

  const handleDuplicate = () => {
    if (currentIdea) {
      // Trigger agent to duplicate current idea
      window.dispatchEvent(new CustomEvent('set-chat-input', {
        detail: { text: `Duplicate "${currentIdea.title}" as a new variation` }
      }));
    }
  };

  return (
    <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Current Idea {ideas.length > 0 && `(${ideas.length} total)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={currentIdeaId}
            onChange={(e) => onIdeaChange(e.target.value)}
            className="text-sm border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-neutral-800"
          >
            {ideas.map(idea => (
              <option key={idea.idea_id} value={idea.idea_id}>
                {idea.title}
              </option>
            ))}
            <option value="new">+ New Idea</option>
          </select>

          {currentIdea && (
            <button
              onClick={handleDuplicate}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="Create variation of this idea"
            >
              📋
            </button>
          )}
        </div>
      </div>

      {/* Current idea summary */}
      <div className="mt-2">
        {currentIdea ? (
          <div className="text-xs text-blue-600 dark:text-blue-300">
            {currentIdea.one_liner} • Stage: {currentIdea.stage} •
            Progress: {getCompletionPercentage(currentIdea)}%
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

function getCompletionPercentage(idea: Idea): number {
  const factors = Object.values(idea.checklist);
  const scored = factors.filter(f => f.score !== null).length;
  return Math.round((scored / factors.length) * 100);
}
```

#### Integration with PresentationPanel

```typescript
// In PresentationPanel.tsx, replace the current idea selector with:
const handleIdeaChange = (ideaId: string) => {
  if (ideaId === 'new') {
    // Trigger agent to start new idea
    setChatInput("I want to assess a new startup idea");
  } else {
    // Trigger agent to switch to existing idea
    setChatInput(`Switch to working on idea: ${ideaId}`);
  }
};

// Always show the switcher (remove the condition)
<IdeaSwitcher
  agentState={agentState}
  onIdeaChange={handleIdeaChange}
/>
```

### Agent Prompt Updates

#### Enhanced System Prompt Instructions

```typescript
// Add to unified.ts prompt:
## IDEA MANAGEMENT

You work with users who may have multiple startup ideas. Always be aware of:

1. **Current Idea Context**: Use getAgentState() to check which idea is currently selected
2. **Idea Switching**: When user selects different idea, use selectIdea() tool to switch context
3. **New Ideas**: When user wants to work on new idea, use selectIdea() with 'new' parameter
4. **Progress Tracking**: Each idea has independent progress and assessment state

**Important**:
- ALWAYS call getAgentState() at start of conversation to understand current context
- When user mentions "this idea" or "my idea", they mean the currently selected idea
- If no idea is selected (currentIdea is null), prompt user to describe their startup concept
- When switching ideas, provide brief summary of the new idea's current status

## CONVERSATION FLOW EXAMPLES

**No idea selected:**
"I see you haven't selected an idea to work on yet. Would you like to assess a new startup idea or continue working on one of your existing ideas?"

**Switching ideas:**
"I've switched to working on '[Idea Title]'. This idea is at [stage] with [X]% assessment completion. Where would you like to continue?"

**Multiple ideas context:**
"You have [X] ideas total. Currently working on '[Current Title]'. The other ideas are [list]. Which would you like to focus on?"
```

### Key UX Improvements

#### 1. **Always-Visible Control**

- Idea switcher visible even with 0 or 1 ideas
- Clear "New Idea" option always available
- Shows current progress for selected idea

#### 2. **Seamless Switching**

- Dropdown selection triggers agent conversation
- Agent automatically switches context
- Clear feedback about which idea is active

#### 3. **Agent Awareness**

- Agent always knows which idea user is focused on
- Tools work with currently selected idea
- Conversation maintains proper context

#### 4. **Progressive Disclosure**

- Simple interface that scales from 1 to many ideas
- Advanced features (duplicate) appear when relevant
- Clear visual hierarchy

### Implementation Order

1. ✅ **Create IdeaSwitcher component**
2. ✅ **Add selectIdea agent tool**
3. ✅ **Update getAgentState to include idea context**
4. ✅ **Integrate switcher into PresentationPanel**
5. ✅ **Update system prompt with idea management instructions**
6. ✅ **Test idea switching workflows**

This design solves the fundamental UX gap while maintaining the clean, professional interface. Users can seamlessly work on multiple ideas and the agent always has proper context.
