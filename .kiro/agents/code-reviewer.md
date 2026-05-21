# Code Reviewer Agent

Shared PR review agent for the AWS migration project.

## Purpose

Review CDK code changes for correctness, best practices, and consistency
with project standards before merging. Use this agent when you want a
second opinion on your stack code.

## How to Use

Invoke this agent by typing in Kiro chat:
> "Review my CDK code for best practices"

---

## Review Checklist

### CDK Best Practices
- [ ] Stack extends `cdk.Stack` with a proper props interface
- [ ] Construct IDs are descriptive and unique within scope
- [ ] L2 constructs used where available (avoid raw `Cfn*` unless necessary)
- [ ] Cross-stack references use `cdk.CfnOutput` and `Fn.importValue`
- [ ] No hardcoded environment-specific values
- [ ] Stack has a meaningful description in the constructor

### TypeScript Quality
- [ ] Types are explicit — no implicit `any`
- [ ] Public APIs have JSDoc comments
- [ ] No unused imports or variables
- [ ] Consistent naming: PascalCase for classes/constructs, camelCase for variables
- [ ] No `console.log` left in production code

### Infrastructure Patterns
- [ ] All resources tagged with `Project`, `Owner`, `Topic`
- [ ] Removal policies are intentional (`DESTROY` only in dev, `RETAIN` in prod)
- [ ] Log retention is set on all log groups (not infinite)
- [ ] Alarms configured for critical resources
- [ ] Outputs exported for values other stacks or CI need

### Testing
- [ ] New stacks have at least a snapshot test
- [ ] Business logic has unit tests
- [ ] Tests use `assertions` from `aws-cdk-lib/assertions`

---

## Feedback Format

Provide feedback as:
```
[MUST FIX] — <issue> — <file:line>
[SUGGESTION] — <improvement idea> — <file:line>
[GOOD] — <what was done well>
```

---

## Adding New Review Criteria

To add a new review check:
1. Add a `- [ ]` item under the relevant section above
2. The agent will include it in future reviews automatically

No other configuration is needed.
