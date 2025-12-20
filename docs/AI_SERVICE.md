# Intégration AI (Gemini)

L'application utilise le SDK `@google/genai` pour analyser les images localement et enrichir les métadonnées.

## Configuration

Le service est isolé dans `services/geminiService.ts`.
- **Modèle** : `gemini-3-flash-preview` (Optimisé pour la vitesse et la vision multimodale).
- **Format de réponse** : JSON structuré (`responseMimeType: "application/json"`).

## Workflow d'Analyse

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

## Gestion des Erreurs

- Si la clé API est manquante (`process.env.API_KEY`), une erreur explicite est levée.
- Le service gère les cas où le JSON retourné serait malformé (bien que rare avec le mode JSON activé).

## Limites

- L'analyse se fait image par image (pas de batch automatique pour économiser les quotas API).
- L'image est envoyée aux serveurs de Google, ce qui nécessite une connexion internet, contrairement au reste de l'app qui fonctionne hors-ligne.
