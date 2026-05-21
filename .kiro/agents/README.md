# Kiro Agents

Agent instruction files that tell Kiro how to perform specific tasks.
Each `.md` file defines one agent with its purpose, checks, and output format.

## Current Agents

| File | Purpose |
|------|---------|
| `security-scanner.md` | Scans for IAM, SG, tagging, and compliance issues |
| `code-reviewer.md` | Reviews CDK code for best practices and quality |

## Adding a New Agent

1. Create a new `.md` file in this folder (e.g. `cost-optimizer.md`)
2. Structure it with: Purpose, How to Use, Checks, Reporting format
3. Reference it in hooks if you want it to trigger automatically

No config changes needed — Kiro discovers agents from this folder.

## Example Future Agents

- `cost-optimizer.md` — flag expensive resource configurations
- `drift-detector.md` — compare deployed state vs CDK code
- `test-generator.md` — auto-generate snapshot and unit tests
- `documentation-writer.md` — generate README and inline docs from code
