# AI Coding Instructions

## General Rules

- Write clean, maintainable, production-ready TypeScript.
- Follow the existing project structure and conventions.
- Read related files before making changes.
- Do not modify unrelated files.
- Do not remove existing functionality unless explicitly requested.
- Prefer small, focused changes over large rewrites.
- Avoid using `any`; create proper interfaces and types.
- Use descriptive names for variables, functions, classes, and components.
- Handle errors explicitly.
- Do not add new dependencies without explaining why.
- Never expose secrets, API keys, tokens, or environment variables.
- Run or suggest relevant tests after changes.
- Follow the project's ESLint and formatting configuration.

## Response Format

When completing a task:

1. Briefly explain the approach.
2. List the files changed.
3. Make the requested code changes.
4. Mention tests or commands that should be run.
5. Mention any assumptions or unresolved issues.

---

# React + TypeScript Instructions

## Components

- Use functional components.
- Define props with TypeScript interfaces or type aliases.
- Use named exports unless the existing project uses default exports.
- Keep components focused on one responsibility.
- Extract reusable logic into custom hooks.
- Extract reusable UI into separate components.
- Avoid components larger than approximately 200 lines.
- Do not create unnecessary wrapper components.

## Example Component

```tsx
interface UserCardProps {
  name: string;
  email: string;
  isActive?: boolean;
}

export function UserCard({
  name,
  email,
  isActive = false,
}: UserCardProps) {
  return (
    <article>
      <h2>{name}</h2>
      <p>{email}</p>
      <span>{isActive ? "Active" : "Inactive"}</span>
    </article>
  );
}