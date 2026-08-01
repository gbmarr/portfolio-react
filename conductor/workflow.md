# Conductor Workflow

This file defines the standard development workflow for this project. All implementation work MUST follow these rules.

## Core Principles

1. **Spec & Plan first:** Never start implementation before a track has an approved `spec.md` and `plan.md`.
2. **Test-Driven Development (TDD):** Write failing tests before implementing the feature.
3. **Small, reviewable commits:** Commit after each completed task (or phase if configured).
4. **Green builds only:** Never leave the codebase in a broken state. The build and test suite must pass at every commit.

## TDD Cycle

For each feature task in a plan:

1. **Write Tests:** Write automated tests that describe the expected behavior. Run them to confirm they fail (red).
2. **Implement:** Write the minimal code to make the tests pass (green).
3. **Refactor:** Clean up the implementation while keeping tests green.

## Test Coverage

- The default required test coverage is **>80%** for code.
- Coverage must be verified with the project's coverage tooling (e.g., Vitest, Jest).
- If coverage drops below the threshold, add tests before continuing.

## Commit Protocol

- Commit messages must be descriptive and follow conventional commits format:
  - `feat(scope): description`
  - `fix(scope): description`
  - `refactor(scope): description`
  - `test(scope): description`
  - `chore(scope): description`
- Commit after each completed task (or per phase if configured).
- Do not commit generated artifacts or secrets.

## Task Summaries

- Record a short summary of each completed task.
- Summaries are stored in commit messages and/or the track's plan file (check the checkbox `[x]`).

## Definition of Done

A task is done when:

- [ ] Tests are written and passing.
- [ ] Code meets the required coverage threshold.
- [ ] Code follows the project's code style guides.
- [ ] The build succeeds locally.
- [ ] The task is committed with a descriptive message.

## Phase Completion Verification and Checkpointing Protocol

After every Phase in an implementation plan is completed:

1. **User Manual Verification:** The Conductor agent MUST present a summary of the completed phase to the user and request manual verification.
2. **Checkpoint:** Only after the user confirms the phase output, mark the phase's verification meta-task as complete and proceed to the next phase.
3. **Record:** Update the track's `plan.md` status markers to reflect completed work.
