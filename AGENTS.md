# Repository Guidelines

## Project Structure & Module Organization

This is a Create React App frontend using React, TypeScript, and React Router. Application code lives in `src/`: `App.tsx` defines routes, `index.tsx` mounts the app, `api/` contains Axios clients, `context/` stores React providers, `hooks/` contains reusable hooks, `types/` contains shared TypeScript types, and `global.css` holds global styling. UI is grouped by domain: `components/common`, `components/layout`, `components/product`, `components/comment`, and `components/shop`; route pages live under `pages/auth`, `pages/customer`, and `pages/shop`. Static files and images are in `public/`, with coffee assets and fonts under `public/assets/`. Build output goes to `build/` and should not be hand-edited.

## Build, Test, and Development Commands

- `npm start`: runs the development server at `http://localhost:3000` with hot reload.
- `npm test`: starts the CRA/Jest interactive test runner.
- `npm run build`: creates an optimized production bundle in `build/`.
- `npm install`: installs dependencies from `package-lock.json`.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode enabled. Follow the existing 4-space indentation, single quotes, semicolons, and function component style. Name React components and page files in PascalCase, for example `ProductDetailPage.tsx`; name hooks with `use`, for example `useShippingAddress.ts`. Prefer CSS modules for page or component styling (`HomePage.module.css`, `ProductCard.module.css`) and reserve `global.css` for application-wide rules. Keep API concerns in `src/api` and shared shapes in `src/types`.

## Testing Guidelines

Testing dependencies are CRA defaults: Jest, React Testing Library, and `@testing-library/jest-dom`. Place tests next to the implementation as `ComponentName.test.tsx` or under a local `__tests__` folder if a feature grows. Focus tests on routing guards, API-driven UI states, form validation, and cart/checkout behavior. Run `npm test` before submitting changes and use `npm run build` for a full TypeScript and production compile check.

## Commit & Pull Request Guidelines

Current history only shows the initial commit (`Initialize project using Create React App`), so use clear imperative commit messages such as `Add checkout validation` or `Fix shop product pagination`. Pull requests should include a concise summary, test/build results, linked issues when applicable, and screenshots or short recordings for visible UI changes.

## Security & Configuration Tips

Environment-specific API URLs live in `.env.development` and `.env.production` as `REACT_APP_API_BASE_URL`. Do not commit secrets; CRA exposes `REACT_APP_*` values to the browser. Keep authentication token handling centralized in `src/api/axiosClient.ts` and `src/context/AuthContext.tsx`.
