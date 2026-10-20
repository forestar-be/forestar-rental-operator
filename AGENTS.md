# AGENTS.md — Forestar Rental Operator

Application interne de l'opérateur de location sur le terrain : détail d'une location, photos, conditions de location, signature du client, finalisation. Elle consomme l'API de `forestar-server`, routes `/rental-operator/*`.

## Stack

React 18 (Create React App, `react-scripts` 5), MUI 6, TypeScript, Redux Toolkit, AG Grid 32, Formik + Yup, `@react-pdf/renderer`, `react-leaflet`, `@forestar-be/core` pour la session SSO. Pas de Tailwind.

## Commandes

Le gestionnaire est pnpm (`packageManager` dans `package.json`).

```bash
pnpm start            # développement
pnpm run build        # build de production
pnpm run types:check  # tsc
pnpm run lint
pnpm run format:check
pnpm run test:app-menu # jest (jest.app-menu.config.cjs), seule zone testée
```

## Structure

- `src/pages/` : accueil, détail d'une location (`RentalDetail.tsx`), réglages, connexion.
- `src/components/` : étapes du parcours (client, photos, génération des conditions, signature, finalisation) et éditeur des conditions.
- `src/store/` : état Redux.

## Authentification

Deux chemins embarqués, un seul actif, choisi au build par `REACT_APP_AUTH_MODE` (`src/hooks/session.ts`) :

- `oidc` : session SSO via `@forestar-be/core`, rôles admis `forestar.rental_operator` et `forestar.admin` ;
- autre valeur : ancien login (`src/pages/Login.tsx`) avec `REACT_APP_AUTH_TOKEN`.

Importer `@forestar-be/core` par sa racine, jamais par son sous-chemin `/auth` (il dépend de `next/navigation`, que ce bundle ne doit pas embarquer).

## Variables d'environnement

`REACT_APP_API_URL`, `REACT_APP_AUTH_MODE`, `REACT_APP_AUTH_TOKEN` (voir `.env.template`). Les variables `REACT_APP_*` sont figées au build.
