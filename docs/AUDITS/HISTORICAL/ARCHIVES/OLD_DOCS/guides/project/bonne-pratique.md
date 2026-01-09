
# Règles de Vérification Systématique

## Principe Fondamental (Zéro Régression)

**L'agent doit S'AUTO-CORRIGER avant même de redonner la main à l'utilisateur.**
Il est inacceptable de laisser l'utilisateur découvrir des erreurs de syntaxe, d'import ou de typage évidentes qui auraient pu être détectées par l'agent.

## Checklist Obligatoire (Après Chaque Edit)

Après avoir utilisé `write_to_file`, `replace_file_content` ou tout outil de modification de code, tu DOIS :

1.  **Vérifier les `current_problems`** :
    - Regarde si de nouvelles erreurs sont apparues dans le contexte (section `@[current_problems]`).
    - Si oui, corrige-les IMMÉDIATEMENT.

2.  **Relire le fichier modifié** :
    - Utilise `view_file` sur les zones modifiées si tu as un doute.
    - Vérifie la syntaxe (parenthèses fermantes, accolades, virgules).
    - Vérifie les imports (les nouveaux composants sont-ils importés ?).

3.  **Vérifier la Compilation (Si Doute)** :
    - Si la modification est complexe, lance une commande de build ou de type-check (ex: `npm run type-check` ou `tsc --noEmit`).

## Erreurs Fréquentes à Éviter

- **Suppression accidentelle d'interfaces** : Ne supprime pas les types/interfaces s'ils sont encore utilisés.
- **Duplication de caractères** : Attention aux `>>` ou `}}` lors des `replace_file_content`.
- **Imports manquants** : Si tu utilises un nouveau composant (`LoadingSpinner`), assure-toi de l'importer en haut du fichier.

## Engagement

> "Je ne dirai jamais 'C'est fait' tant que je n'ai pas la certitude technique que le code compile et s'exécute sans erreur visible."
