# Lumina Portfolio - Documentation Technique

Bienvenue dans la documentation technique de **Lumina Portfolio**. Cette application est une galerie photo haute performance "Local-First" construite avec React, TypeScript et Tailwind CSS, intégrant l'intelligence artificielle Google Gemini.

## Sommaire

1. [Architecture & Données](ARCHITECTURE.md)
   - Structure globale
   - Modèle de données (Types)
   - Gestion de la mémoire (Object URLs)
   
2. [Composants UI & UX](COMPONENTS.md)
   - Système de vues (Grid, Flow, List)
   - Moteur d'animation (Framer Motion)
   - Logique du Slider et de la Navigation
   
3. [Service AI (Gemini)](AI_SERVICE.md)
   - Intégration de l'API
   - Ingénierie du Prompt
   - Traitement des images
   
4. [Interactions & Raccourcis](INTERACTIONS.md)
   - Gestion du clavier
   - Système de tagging couleur
   - Drag & Drop

## Installation Rapide

L'application utilise une structure sans build-step complexe (via Import Maps), mais les dépendances sont standards :

- **React 19**: Framework UI
- **Tailwind CSS v4**: Styling (via `@tailwindcss/vite` plugin)
- **Framer Motion**: Animations
- **Google GenAI SDK**: (`@google/genai`) Analyse d'images
- **Vitest**: Tests Unitaires

## Conventions de Code

- **State Lifting**: L'état global est centralisé dans `App.tsx` pour orchestrer les vues.
- **Glassmorphism**: Utilisation intensive de `backdrop-blur` et de couleurs semi-transparentes (`bg-white/5`).
- **Performance**: Utilisation de `useMemo` pour les tris/filtres lourds et nettoyage des `URL.createObjectURL`.
