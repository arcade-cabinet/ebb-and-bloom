# GitHub Copilot Prompts

This directory contains GitHub Copilot prompts for Ebb & Bloom development.

## Available Prompts

### `ecs-architecture.prompt.yml`
ECS architecture patterns and React + TypeScript + Miniplex development guidelines.
- Use when: Working on game logic, ECS systems, or React components
- Focus: Architecture constraints, data flow, anti-patterns

### `mobile-performance.prompt.yml`
Mobile game performance optimization targeting 60 FPS.
- Use when: Optimizing rendering, memory, or battery usage
- Focus: Instanced rendering, object pooling, Capacitor integration

### `game-design.prompt.yml`
Core game design principles and mechanics.
- Use when: Implementing new features or mechanics
- Focus: Design pillars, narrative style, game feel

## How to Use

GitHub Copilot will automatically discover these prompts when you:
1. Open files matching the `applyTo` patterns (if specified)
2. Reference prompts in your conversations
3. Use GitHub Copilot Chat in VS Code or GitHub.com

## Format

Prompts use the `.prompt.yml` format as specified in:
https://docs.github.com/en/github-models/use-github-models/storing-prompts-in-github-repositories

Each prompt includes:
- `name`: Human-readable name
- `description`: What the prompt helps with
- `model`: AI model to use
- `modelParameters`: Model configuration
- `messages`: System and user prompts with `{{variable}}` placeholders

## Customization

To use a prompt with specific context, reference it in your conversation:
```
@ecs-architecture.prompt.yml Help me create a movement system
```

Or use the task variable:
```
@mobile-performance.prompt.yml Optimize the creature renderer
```
