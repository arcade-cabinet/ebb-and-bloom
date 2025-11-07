# GitHub Copilot Agents

This directory contains GitHub Copilot custom agents for Ebb & Bloom development.

## Available Agents

### `ecs-architecture.md`
**ECS Architecture Specialist** - React + TypeScript + Miniplex ECS development patterns
- Use when: Working on game logic, ECS systems, or React components
- Focus: Architecture constraints, data flow, anti-patterns
- Tools: read, edit, search, codebase, problems

### `mobile-performance.md`
**Mobile Performance Optimizer** - Mobile-specific optimization patterns targeting 60 FPS
- Use when: Optimizing for mobile devices (rendering, memory, battery)
- Focus: Instanced rendering, object pooling, Capacitor integration, mobile-specific constraints
- Tools: read, edit, search, codebase, problems

### `game-design.md`
**Game Design Specialist** - Core game design principles for a resource race with emergent endings
- Use when: Implementing new features, mechanics, or understanding game vision
- Focus: Design pillars, Yuka AI integration, procedural generation, emergent endings
- Tools: read, edit, search, codebase
- Reference: `docs/WORLD.md` (2,005 lines) - THE comprehensive blueprint

## How to Use

### On GitHub.com
1. Go to [GitHub Copilot Agents](https://github.com/copilot/agents)
2. Select your repository from the dropdown
3. Choose an agent from the agent selector (🤖 icon)
4. Start a conversation with the specialized agent

### In VS Code
1. Open the Copilot Chat view
2. Use the mode dropdown to select a custom agent
3. The agent's instructions will guide its behavior

### Via CLI
```bash
# Use a specific agent
gh copilot agent ecs-architecture

# Or reference in prompts
gh copilot "Create a movement system" --agent ecs-architecture
```

## Agent Format

Agents are Markdown files with YAML frontmatter:
- `name`: Human-readable agent name
- `description`: What the agent specializes in
- `tools`: List of available tools (omit for all tools)

The Markdown content below defines the agent's behavior, expertise, and instructions.

## Migration from Instructions

The old `.github/instructions/` directory contained instruction files that are now replaced by these agents. Agents provide:
- Better integration with GitHub Copilot
- Specialized tool access
- More focused expertise per agent
- Better discoverability in Copilot UI

## Customization

To create a new agent:
1. Create a new `.md` file in `.github/agents/`
2. Add YAML frontmatter with name, description, and tools
3. Write the agent's instructions in Markdown
4. Commit and push to the repository
5. The agent will appear in Copilot's agent selector

For more information, see:
- [Create custom agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)
- [Custom agents configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
