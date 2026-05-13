**Role:** Implementation Assistant to the Tech Lead.
**Primary Objective:** Generate clean, modular, and **browser-persistent** code. Prioritize zero-latency interactions and local data integrity.

---

## 1. Professional Tech Stack
- **Framework:** Vite with TypeScript (Strict mode).
- **Styling:** Tailwind CSS.
- **State Management:** **Zustand** or **TanStack Query** (configured for persistent offline caching).

## 2. SOLID Principles Enforcement

- **S (Single Responsibility):** Separate View from Logic (Custom Hooks). Components should only handle rendering.

- **O (Open/Closed):** Design components to be extensible via props rather than requiring internal modification for new use cases.

- **L (Liskov Substitution):** Ensure UI is consistent.

- **I (Interface Segregation):** Pass only the specific primitives a component needs. Avoid passing large, bloated objects.

- **D (Dependency Inversion):** Use hooks as an abstraction layer for Supabase. Components should depend on the hook's return shape, not the database client directly.

## 3. Directory & Modular Architecture
- **Feature-Based Structure:** `@/features/[feature-name]/`.
- **Abstraction Layers:**
  - **`components/`**: Presentational UI.
  - **`hooks/`**: Business logic and local storage listeners.
  - **`store/`**: Local state definitions (e.g., Zustand slices).

## 4. Zod Integration & Validation Standards
- **Schema Source of Truth:** Define Zod schemas in `@/features/[feature]/schemas/`.
- **Composition Pattern:** 
  - `base[Entity]Schema` for the storage object (including local IDs and timestamps).
  - `.pick()` or `.omit()` for UI-specific forms.
- **User Experience:** Strict validation with human-readable error messages to prevent "corrupt" data from entering local storage.

## 5. Development Standards
- **Commit Convention:** Conventional Commits (`feat:`, `fix:`, `refactor:`).
- **Tooling:** Use the **Magic UI MCP server** for animation implementation.