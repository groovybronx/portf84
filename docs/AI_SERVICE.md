# Intégration AI (Gemini)

L'application utilise le SDK `@google/genai` pour analyser les images localement et enrichir les métadonnées.

## Configuration

Le service est isolé dans `services/geminiService.ts`.
- **Modèle** : `gemini-3-flash-preview` (Strictement imposé).
- **Format de réponse** : JSON structuré.
- **Authentification** : Clé API stockée dans le `localStorage` du navigateur (sécurité accrue, pas de backend).

> [!IMPORTANT]
> L'utilisation du modèle **`gemini-3-flash-preview`** est obligatoire. Tout downgrade est interdit par règle projet.

## Workflow d'Analyse (Image Unique)

1. **Encodage** : L'image (File object) est convertie en chaîne Base64.
2. **Prompt Engineering** :
   Nous envoyons un prompt structuré demandant deux choses spécifiques :
   - Une description artistique concise (max 2 phrases).
   - Une liste de 5 tags SEO avec un score de confiance.

   ```typescript
   text: `Analyze this image for a professional portfolio. 
          1. Provide a concise, artistic description...
          2. List 5 relevant SEO keywords...
          Return response in JSON format...`
   ```

3. **Parsing** : La réponse texte JSON est parsée et typée en `AiTagDetailed[]`.
4. **Mise à jour UI** : Les tags s'affichent sous forme de barres de progression (confiance) dans l'ImageViewer.

## Batch Processing (Traitement par Lots)

Pour analyser de grands dossiers sans intervention manuelle répétée :

1. **Queue (File d'attente)** : `App.tsx` maintient un state `aiQueue` (tableau d'items).
2. **Exécution Séquentielle** : Un `useEffect` surveille la file d'attente. Dès qu'elle n'est pas vide, il dépile le premier élément, lance l'analyse, attend la réponse, met à jour l'état, puis passe au suivant.
3. **Avantages** :
   - Évite de spammer l'API et de déclencher des erreurs "Rate Limit" (429).
   - Ne bloque pas l'interface utilisateur (l'utilisateur peut naviguer pendant l'analyse).
   - Indicateur de progression visuel dans la `TopBar`.

## Gestion des Erreurs

- Si la clé API est manquante (ni dans `localStorage`, ni dans les variables d'env), une erreur explicite demande à l'utilisateur de la configurer via les Paramètres.
- Le service gère les cas où le JSON retourné serait malformé.
- En mode Batch, une erreur sur une image ne stoppe pas le processus pour les suivantes.

## Limites

- L'image est envoyée aux serveurs de Google, ce qui nécessite une connexion internet.
- Les fichiers très volumineux (> 20MB) peuvent nécessiter un redimensionnement préalable (non implémenté actuellement) avant l'envoi en Base64 pour éviter les timeouts.