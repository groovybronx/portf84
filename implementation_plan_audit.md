# Plan d'Implémentation - Correctifs Audit Critique

Ce plan vise à résoudre les problèmes **CRITIQUES** identifiés dans l'audit de commercialisation (`docs/COMMERCIAL_AUDIT.md`).

## 🎯 Objectifs Prioritaires

1.  **Robustesse** : Gestion globale des erreurs (Error Boundaries).
2.  **Sécurité** : Sécurisation de la clé API (migration hors de localStorage).
3.  **Distribution** : Validation du build natif (Tauri).
4.  **Qualité** : Ajout de tests essentiels.

---

## 🛠️ Tâches Techniques

### Phase 1 : Gestion d'Erreurs Robuste (Blocker)

- [x] **Intégrer l'Error Boundary Existant**
  - Utiliser `src/shared/components/ErrorBoundary.tsx` (déjà existant)
  - Intégrer dans `src/index.tsx` (autour de `App`) ✅ Fait
  - Vérifier que le fallback UI est adapté

- [x] **Améliorer la Gestion d'Erreurs API (Gemini)**
  - Modifier `src/features/vision/services/geminiService.ts`
  - Ajouter des types d'erreurs spécifiques (`NetworkError`, `ApiKeyError`, `QuotaExceededError`)
  - Retourner des messages utilisateurs clairs au lieu de logs console bruts
  - Mettre à jour l'UI (`TagManagerModal` ou `TopBar`) pour afficher ces erreurs via un Toast/Alert

### Phase 2 : Sécurité Clé API (Blocker)

- [x] **Sécuriser le Stockage de la Clé**
  - **État actuel** : `localStorage` (non sécurisé)
  - **Cible** : Utiliser `tauri-plugin-store` (stockage fichier disque) ou chiffrement simple
  - *Action* : Migrer la logique de `getApiKey` et le stockage dans `SettingsModal`
  - Chiffrer la clé avant stockage (AES simple ou encodage pour éviter le texte clair immédiat)

### Phase 3 : Validation Build & Distribution (Blocker)

- [x] **Vérifier et Réparer le Build Tauri**
  - Lancer un build de test (`npm run tauri build -- --debug`) ✅ Réussi
  - Corriger les erreurs de configuration éventuelles dans `tauri.conf.json`
  - Documenter la procédure de build dans `docs/README.md`

### Phase 4 : Tests & Qualité (Blocker)

- [x] **Ajouter des Tests Critiques**
  - [x] Create `tests/App.test.tsx` (Smoke test).
  - [x] Create `tests/geminiErrors.test.ts`.
  - [x] Ensure `tests/useItemActions.test.ts` passes (fix mocks).
  - [x] Verify all tests pass with `npm run test`.

---

## 📅 Séquence d'Exécution

1. Error Boundary (Rapide, impact immédiat)
2. Gestion Erreurs Gemini (UX)
3. Sécurité API (Nécessite dépendances Tauri ?)
4. Build check

## 📝 Notes
- La sécurité parfaite impliquerait le Keychain OS, mais `tauri-plugin-store` est une première étape acceptable pour le MVP.
