# Kiro Hooks

Hooks automate agent actions based on IDE events. Each `.json` file defines
one hook with a trigger condition and an action.

## Current Hooks

| File | Trigger | Action |
|------|---------|--------|
| `security-hook.json` | IAM/SG/policy file saved | Runs security scanner agent |
| `build-hook.json` | Any `.ts` file in lib/ or bin/ saved | Runs `npm run build` |
| `test-hook.json` | Test file saved | Runs `npm test` |

## Adding a New Hook

1. Create a new `.json` file in this folder
2. Follow this schema:

```json
{
  "name": "Human-readable name",
  "version": "1.0.0",
  "description": "What this hook does",
  "when": {
    "type": "fileEdited | fileCreated | fileDeleted | userTriggered | promptSubmit | agentStop | preToolUse | postToolUse",
    "patterns": ["glob/patterns/**/*.ts"]
  },
  "then": {
    "type": "askAgent | runCommand",
    "prompt": "Instructions for the agent (askAgent only)",
    "command": "shell command to run (runCommand only)"
  }
}
```

3. Save the file — Kiro picks it up automatically

## Example Future Hooks

- `lint-hook.json` — run ESLint on save
- `deploy-check-hook.json` — warn before deploying to prod
- `doc-hook.json` — auto-generate docs when a stack file changes
- `cost-hook.json` — estimate cost impact when resource config changes

## Event Types

| Event | When it fires |
|-------|---------------|
| `fileEdited` | User saves a file matching the pattern |
| `fileCreated` | User creates a new file matching the pattern |
| `fileDeleted` | User deletes a file matching the pattern |
| `userTriggered` | User manually clicks the hook button |
| `promptSubmit` | User sends a message to Kiro |
| `agentStop` | Agent execution completes |
| `preToolUse` | Before a tool is executed |
| `postToolUse` | After a tool is executed |
