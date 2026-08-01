# General Code Style Guide

This guide defines general coding standards that apply across the entire project.

## Principles

1. **Readability first:** Write code for humans, not machines. Clarity beats cleverness.
2. **Consistency:** Follow the same patterns and conventions throughout the codebase.
3. **Small, focused units:** Keep functions and components small and single-purpose.
4. **Meaningful names:** Use descriptive names for variables, functions, and files. Avoid abbreviations.
5. **DRY (Don't Repeat Yourself):** Extract shared logic into reusable helpers or components.

## Formatting

- Use an automated formatter (e.g., Prettier) and linting (e.g., ESLint) consistently.
- Use 2 spaces for indentation.
- Use semicolons.
- Use single quotes by default; double quotes for strings containing single quotes.
- Maximum line length of 100 characters.
- Trailing commas in multi-line arrays, objects, and function parameters.

## Comments

- Prefer self-documenting code over comments.
- Use comments to explain **why**, not **what**.
- Use JSDoc-style comments for exported functions, props, and public APIs.
- Do not leave commented-out code in the repository.

## Error Handling

- Handle errors explicitly; never swallow exceptions silently.
- Log errors with enough context to debug (message, stack, relevant data).
- Fail fast with clear, actionable error messages.

## Testing

- Write tests for all non-trivial logic.
- Follow the testing conventions defined in the project workflow.
- Name tests by behavior: `it should ...` or `test('...')`.

## Anti-patterns (Avoid)

- Deeply nested conditionals or callbacks.
- Magic numbers and hard-coded strings without named constants.
- Copy-pasted code blocks.
- Over-engineering: do not add abstractions before they are needed.
