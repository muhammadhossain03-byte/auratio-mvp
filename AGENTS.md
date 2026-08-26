# Auratio implementation guardrails

- `/docs` contains the authoritative product specifications. Preserve it unless the user explicitly requests a documentation change.
- Figma page `03 — Interactive Prototype — MVP v1.8` is authoritative for visual and interaction implementation. Use its variables, styles, components, dimensions, and flows; do not redesign them.
- Written specifications prevail for business rules, security, data, and backend semantics.
- Step IV uses mock or local frontend data only.
- Do not add Supabase, Gemini, a production backend/API, production authentication, or real role-based access control during Step IV.
- Do not redesign, simplify, or silently reinterpret locked product behavior.

Validate mobile changes with:

```sh
cd mobile
flutter pub get
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test
```

Validate portal changes with:

```sh
cd portal
npm ci
npm run lint
npm run build
```
