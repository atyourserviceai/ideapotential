# IdeaPotential.com Implementation Plan

## Overview

Transform the current app-agent-template clone into a fully functional idea validation tool as specified in `ideapotential.md`. This plan outlines the complete transformation from a generic AI agent into a specialized 10-factor startup idea grader.

## Current State Analysis

- **Current**: Generic AI agent template with chat interface
- **Target**: Specialized idea validation tool with structured assessment, scoring, and sharing features
- **Architecture**: Cloudflare Workers + Durable Objects + React frontend
- **Existing Assets**: Authentication, basic chat UI, agent framework

## Implementation Phases

### Phase 1: Foundation & Data Model (Week 1)

**Goal**: Establish core data structures and basic UI framework

#### 1.1 Data Model Implementation

- [ ] Add IdeaPotential types to AppAgentState in `src/agent/AppAgent.ts`
  - [ ] FounderDoc, Idea, ChecklistItem, Evidence interfaces
  - [ ] Current assessment state tracking
  - [ ] Assessment progress and completion status
- [ ] Use existing AppAgentState persistence (automatically saves to Durable Object)
- [ ] Set up data validation with Zod schemas
- [ ] Enhance existing migration system in `async initialize()` method

#### 1.2 Package Configuration

- [ ] Update package.json name to "ideapotential"
- [ ] Add required dependencies (PDF generation libraries)
- [ ] Update project metadata and keywords

#### 1.3 Basic UI Integration

- [ ] Build on existing PlaybookPanel component structure
- [ ] Add new IdeaPotential components alongside existing chat:
  - `ChecklistGrid` (10-factor display) in playbook area
  - `ScoreDial` (overall readiness %) in playbook area
  - `EvidenceAccordion` (collapsible evidence details) in playbook area
- [ ] Keep existing ChatContainer for agent interaction

### Phase 2: Core Assessment Engine (Week 2)

**Goal**: Implement the 10-factor checklist and basic scoring

#### 2.1 Agent-Based Intake System

- [ ] Update unified system prompt in `src/agent/prompts/unified.ts`
  - [ ] Add IdeaPotential context and instructions
  - [ ] Include 15 structured questions mapped to checklist factors
  - [ ] Add instructions for evidence collection during conversation
  - [ ] Define when to transition between assessment phases

#### 2.2 Agent-Based Scoring System

- [ ] Add scoring rubric to system prompt
  - [ ] Define 0-5 scoring scale for each factor
  - [ ] Include evidence strength calculation (0-3 scale)
  - [ ] Add "one tweak" recommendation instructions
- [ ] Agent handles scoring through natural conversation

#### 2.3 Core UI Components

- [ ] Build interactive checklist grid with color coding
- [ ] Create animated score dial (0-100%)
- [ ] Implement evidence strength indicators
- [ ] Add basic sharing (copy link) functionality

### Phase 3: Data Enrichment & Intelligence (Week 3)

**Goal**: Automatic data fetching and enhanced scoring

#### 3.1 Composio Tools Integration

Based on available integrations, add these specific tools to `src/agent/tools/composio.ts`:

- [ ] **Ahrefs** - SEO metrics, domain rating, backlinks analysis
- [ ] **LinkedIn** - Professional network metrics, company insights
- [ ] **Twitter** - Social media metrics, brand mentions
- [ ] **Reddit** - Community discussions, market pain mentions
- [ ] **ScreenshotOne** - Landing page screenshots
- [ ] **Hunter** - Email/contact validation and enrichment
- [ ] **Google Analytics** - Website traffic insights (if available)
- [ ] **SemRush** - Additional SEO and competitive analysis
- [ ] Register new tools in `src/agent/tools/registry.ts`
- [ ] Update tool access permissions in `AppAgent.ts` getToolsForMode()

#### 3.2 Enhanced Scoring

- [ ] Weight scores by evidence strength
- [ ] Implement Bayesian scoring adjustments
- [ ] Add confidence intervals for scores
- [ ] Create trend analysis for score changes

#### 3.3 Advanced UI Features

- [ ] Real-time score updates during data fetching
- [ ] Toast notifications for background processes
- [ ] Evidence source citations and links
- [ ] Hover tooltips with scoring explanations

### Phase 4: Sharing & Viral Features (Week 4)

**Goal**: Enable sharing, PDF export, and viral loops

#### 4.1 Public Sharing

- [ ] Create public assessment view (`/share/:idea_id`)
- [ ] Implement read-only scorecard display
- [ ] Add view counter and engagement tracking
- [ ] Create branded public page layout

#### 4.2 PDF Export

- [ ] Integrate Api2PDF for document generation
- [ ] Design 2-page assessment summary template
- [ ] Add download functionality with watermarking
- [ ] Implement optional deep-dive upsell

#### 4.3 Viral Loops

- [ ] Build Peer Proof modal (friend verification)
- [ ] Create email invitation system
- [ ] Implement referral tracking
- [ ] Add social sharing buttons with preview cards

### Phase 5: Landing Page & GTM (Week 5-6)

**Goal**: Complete product experience and launch preparation

#### 5.1 Landing Page

- [ ] Create marketing homepage with hero section
- [ ] Build feature showcase and checklist preview
- [ ] Add testimonials and social proof sections
- [ ] Implement conversion-optimized CTAs

#### 5.2 User Experience Polish

- [ ] Add onboarding flow and tutorials
- [ ] Implement idea management (multiple ideas per user)
- [ ] Create idea comparison and diff views
- [ ] Add progress persistence and resume functionality

#### 5.3 Analytics & Monitoring

- [ ] Implement user behavior tracking
- [ ] Add assessment completion funnels
- [ ] Create admin dashboard for manual review
- [ ] Set up error monitoring and alerts

## Technical Implementation Details

### Architecture Changes

```
Current: Generic Agent Chat
├── ChatContainer (agent responses)
├── PlaybookPanel (empty sidebar)
├── AgentTools (basic tools)
└── AuthProvider

Target: IdeaPotential Assessment Tool
├── ChatContainer (agent-driven assessment questions)
├── PlaybookPanel (assessment display)
│   ├── ChecklistGrid (10 factors)
│   ├── ScoreDial (readiness %)
│   └── EvidenceAccordion (proof details)
├── Enhanced AgentTools (+ Composio data fetching)
├── AppAgentState (+ assessment data)
└── Unified Prompt (+ assessment instructions)
```

### New Dependencies

- PDF generation: `@api2pdf/node` or similar
- Data validation: Enhanced Zod schemas
- Composio integrations: SEO, social, screenshot tools
- UI components: Chart libraries for score dial
- Analytics: Basic tracking

### Enhanced File Structure (Building on Existing)

```
/ideapotential (existing structure enhanced)
├── src/
│   ├── agent/
│   │   ├── AppAgent.ts        # Enhanced with IdeaPotential state
│   │   ├── prompts/
│   │   │   └── unified.ts     # Enhanced with assessment prompts
│   │   └── tools/
│   │       ├── composio.ts    # Enhanced with SEO/social tools
│   │       └── registry.ts    # Enhanced tool registration
│   ├── components/
│   │   ├── chat/              # Existing chat components
│   │   ├── assessment/        # NEW: Assessment UI components
│   │   │   ├── ChecklistGrid.tsx
│   │   │   ├── ScoreDial.tsx
│   │   │   └── EvidenceAccordion.tsx
│   │   └── sharing/           # NEW: Sharing components
│   └── types/                 # Enhanced with assessment types
```

### Assessment Flow via Agent Conversation

**Agent-Driven Intake Questions (Embedded in System Prompt)**

1. **Problem Clarity** → Agent asks: Problem description, JTBD formulation
2. **Outcome Gap** → Agent asks: User satisfaction, importance ratings
3. **Solution Evidence** → Agent asks: Demo links, unit economics
4. **Founder-Solution Fit** → Agent asks: Experience, passion scores
5. **Team-Scope Fit** → Agent asks: Team size, roadmap scope
6. **Competitive Moat** → Agent asks: Hamilton's 7 Powers assessment
7. **Market Pain Mentions** → Agent uses Composio tools: Reddit/Twitter scraping
8. **Early Demand** → Agent asks: Waitlist, pre-orders
9. **Traffic Authority** → Agent uses Composio tools: SEO domain analysis
10. **Marketing-Product Fit** → Agent asks: CAC/LTV metrics

**Agent continuously updates AppAgentState with collected evidence and calculates scores based on prompt instructions. Data automatically persists via existing Durable Object storage.**

## Success Metrics

- **MVP Validation**: 50 completed assessments within 2 weeks
- **User Engagement**: >50% completion rate for started assessments
- **Viral Growth**: >25% of users trigger sharing features
- **Data Quality**: >80% of factors have evidence strength ≥2

## Risk Mitigation

- **API Dependencies**: Fallback to manual input if external APIs fail
- **LLM Costs**: Implement credit limits and user-provided keys
- **Data Privacy**: GDPR compliance for founder data storage
- **Performance**: Optimize for mobile and slow connections

## Next Steps

1. Begin Phase 1 with data model implementation
2. Set up development environment with new dependencies
3. Create basic UI mockups for user testing
4. Validate 15-question flow with beta users
5. Establish API integrations with test accounts

This plan transforms the generic agent template into a specialized, production-ready idea validation tool following the comprehensive spec in `ideapotential.md`.
