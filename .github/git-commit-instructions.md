# Git Commit Instructions

## Commit Message Format

All commit messages should follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Where:

- **`<type>`**: Describes the kind of change (required)
- **`<scope>`**: Describes what section of the codebase is affected (optional)
- **`<subject>`**: Short description of the change (required)
- **`<body>`**: Detailed description of the change (optional)
- **`<footer>`**: Mention issue IDs or breaking changes (optional)

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Changes that don't affect code functionality (formatting, etc.)
- **refactor**: Code changes that neither fix bugs nor add features
- **perf**: Performance improvements
- **test**: Adding/modifying tests
- **chore**: Changes to build process, dependencies, etc.

## Scopes

Some common scopes for this project:

- **api**: Changes to API service files
- **auth**: Changes to authentication
- **ui**: UI component changes
- **tasks**: Task management related changes
- **timer**: Pomodoro timer related changes
- **tests**: Changes to test files only
- **deps**: Dependency updates

## Examples

```
feat(tasks): add Microsoft Todo integration

Implemented Microsoft Graph API client to connect with Microsoft Todo.
Added authentication flow and task synchronization capabilities.

Resolves #123
```

```
fix(timer): correct timer display when paused

Fixed a rendering issue where the timer would show incorrect values
when paused and resumed multiple times.
```

```
refactor(api): consolidate task API interfaces

Created a common interface for all task providers to implement,
making it easier to add new integrations in the future.
```

## Dos and Don'ts

### Do:
- Keep the subject line under 50 characters
- Use imperative mood in the subject line (e.g., "add" not "added")
- Capitalize the first letter of the subject
- Wrap the body text at 72 characters
- Use the body to explain what and why, not how
- Reference issues and pull requests in the footer

### Don't:
- End the subject line with a period
- Use past tense in the subject line
- Leave the subject line blank
- Include detailed code explanations (that's what code comments are for)

## Commit Frequently

- Make small, focused commits rather than large, sweeping changes
- Each commit should represent a single logical change
- If you need to make multiple unrelated changes, split them into separate commits

## Before Committing

- Run tests to ensure your changes don't break existing functionality
- Check code formatting and linting rules
- Review your changes with `git diff` before committing

## Special Commit Messages

### Breaking Changes
When introducing breaking changes, mention them in the footer prefixed with "BREAKING CHANGE:":

```
feat(api): change task API response format

BREAKING CHANGE: Task API now returns objects with camelCase properties
instead of snake_case. Update all consumers accordingly.
```

### Reverting Changes
When reverting a previous commit, use the "revert" type and reference the original commit:

```
revert: feat(tasks): add Microsoft Todo integration

This reverts commit abc123.
```
