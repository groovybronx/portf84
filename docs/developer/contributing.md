# 🤝 Contributing - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026

---

## 📋 Vue d'Ensemble

Ce guide décrit comment contribuer au développement de Lumina Portfolio. Nous apprécions toutes les contributions, que ce soit du code, de la documentation, des tests ou des signalements de bugs.

---

## 🚀 Comment Contribuer

### **1. Fork et Clone**

```bash
# Forker le projet sur GitHub
git clone https://github.com/VOTRE_USERNAME/portf84.git
cd portf84

# Ajouter le dépôt original
git remote add upstream https://github.com/groovybronx/portf84.git
```

### **2. Créer une Branche**

```bash
# Mettre à jour le main
git checkout main
git pull upstream main

# Créer une branche de fonctionnalité
git checkout -b feature/nom-de-la-fonctionnalite

# Ou pour un bugfix
git checkout -b fix/nom-du-bug
```

### **3. Développer et Tester**

```bash
# Installer les dépendances
npm install

# Démarrer le développement
npm run tauri:dev

# Lancer les tests
npm test
npm run type-check
```

### **4. Commit et Push**

```bash
# Ajouter les changements
git add .

# Commit avec message conventionnel
git commit -m "feat: add new feature description"

# Push vers votre fork
git push origin feature/nom-de-la-fonctionalite
```

### **5. Pull Request**

- Créer une Pull Request sur GitHub
- Remplir le template de PR
- Attendre la review et les tests CI

---

## 📝 Conventions de Commit

### **Format des Messages**

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### **Types Disponibles**

- **feat** : Nouvelle fonctionnalité
- **fix** : Correction de bug
- **docs** : Documentation
- **style** : Formatage, style (pas de changement de code)
- **refactor** : Refactoring (ni feat ni fix)
- **test** : Ajout de tests
- **chore** : Maintenance, dépendances, build

### **Exemples**

```bash
feat(ui): add glass morphism effect to cards
fix(ai): resolve Gemini API timeout issue
docs(readme): update installation instructions
test(components): add Button component tests
refactor(storage): optimize database queries
```

---

## 🔧 Environnement de Développement

### **Prérequis**

- Node.js 18+
- Rust (installé automatiquement par Tauri)
- Git
- VS Code (recommandé)

### **Configuration VS Code**

Extensions recommandées :

- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **ES7+ React/Redux/React-Native snippets**
- **Auto Rename Tag**
- **GitLens**

### **Scripts Utiles**

```bash
# Développement
npm run tauri:dev          # Dev server + Tauri
npm run dev                 # Vite dev server seul

# Build
npm run build               # Build frontend
npm run tauri:build         # Build application

# Testing
npm test                    # Tests unitaires
npm run test:e2e           # Tests end-to-end
npm run type-check          # Vérification TypeScript

# Qualité
npm run lint                # Linting
npm run format              # Formatage du code
```

---

## 📁 Structure du Projet

```
src/
├── features/              # Modules fonctionnels
│   ├── collections/       # Gestion des collections
│   ├── library/           # Médiathèque et vues
│   ├── navigation/        # Navigation et topbar
│   ├── tags/             # Système de tags
│   ├── overlays/         # Modales et overlays
│   └── layout/           # Layouts réutilisables
├── shared/               # Code partagé
│   ├── components/       # Composants UI réutilisables
│   ├── contexts/         # Contextes React
│   ├── hooks/            # Hooks personnalisés
│   ├── types/            # Types TypeScript
│   ├── utils/            # Utilitaires
│   └── constants/        # Constantes
├── services/             # Services externes
└── i18n/                 # Internationalisation
```

### **Où Contribuer**

#### **Nouveaux Composants UI**

- Ajouter dans `src/shared/components/ui/`
- Exporter dans `src/shared/components/ui/index.ts`
- Ajouter les tests dans `tests/shared/components/`

#### **Nouvelles Fonctionnalités**

- Créer un dossier dans `src/features/`
- Ajouter les hooks et contextes nécessaires
- Documenter dans `docs/`

#### **Services Externes**

- Ajouter dans `src/services/`
- Créer les types correspondants dans `src/shared/types/`
- Ajouter les tests d'intégration

---

## 🧪 Testing

### **Tests Requis**

Toute nouvelle fonctionnalité doit inclure :

1. **Tests unitaires** pour les composants et hooks
2. **Tests d'intégration** pour les workflows
3. **Tests E2E** pour les fonctionnalités critiques

### **Écrire des Tests**

```typescript
// Exemple de test de composant
import { render, screen } from "@testing-library/react";
import { Button } from "@/shared/components/ui/Button";

describe("Button", () => {
	it("renders with correct variant", () => {
		render(<Button variant="primary">Click me</Button>);
		expect(screen.getByRole("button")).toHaveClass("primary");
	});
});
```

### **Lancer les Tests**

```bash
# Tous les tests
npm test

# Tests filtrés
npm test -- Button

# Tests avec coverage
npm run test:coverage

# Tests E2E
npm run test:e2e
```

---

## 📝 Documentation

### **Types de Documentation**

- **Code comments** : JSDoc pour les fonctions publiques
- **README** : Documentation des composants complexes
- **User docs** : Guides pour les nouvelles fonctionnalités
- **API docs** : Référence des services et hooks

### **Style de Documentation**

````typescript
/**
 * Analyse une image avec Gemini AI
 * @param imageBuffer - Buffer de l'image à analyser
 * @param options - Options d'analyse
 * @returns Promise avec description et tags
 * @example
 * ```typescript
 * const result = await analyzeImage(buffer, { confidence: 0.8 });
 * console.log(result.description);
 * ```
 */
export const analyzeImage = async (
	imageBuffer: ArrayBuffer,
	options?: AnalysisOptions
): Promise<AnalysisResult> => {
	// Implementation
};
````

---

## 🎨 Conventions de Code

### **TypeScript**

- **Typage strict** : Toujours typer les paramètres et retours
- **Interfaces** : Utiliser des interfaces pour les props
- **No any** : Éviter `any`, préférer `unknown`
- **Paths** : Utiliser les alias `@/` pour les imports

### **React**

- **Components** : Functional components avec `React.FC`
- **Props** : Interfaces typées avec `Props` suffixe
- **Hooks** : Préfixe `use` obligatoire
- **Memo** : Utiliser `React.memo` pour les composants coûteux

### **CSS/Tailwind**

- **Utility-first** : Préférer les classes utilitaires
- **Responsive** : Mobile-first approach
- **Custom CSS** : Uniquement pour les animations complexes
- **Variables** : Utiliser les tokens CSS définis

### **Exemples**

```typescript
// ✅ Bon
interface ButtonProps {
	variant: "primary" | "secondary";
	onClick: () => void;
	children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = "primary", onClick, children }) => {
	return (
		<button className={cn("btn", `btn-${variant}`)} onClick={onClick}>
			{children}
		</button>
	);
};

// ❌ Éviter
export const Button = (props: any) => {
	return <button {...props} />;
};
```

---

## 🔍 Review Process

### **Pull Request Checklist**

- [ ] Code suit les conventions du projet
- [ ] Tests ajoutés et passants
- [ ] Documentation mise à jour
- [ ] TypeScript compilation réussie
- [ ] Pas de console errors/warnings
- [ ] Performance acceptable

### **Review Guidelines**

- **Constructif** : Feedback utile et respectueux
- **Thorough** : Vérifier la logique, la performance, l'accessibilité
- **Responsive** : Répondre aux questions et suggestions

---

## 🐛 Signalement de Bugs

### **Comment Signaler**

1. **Vérifier** si le bug existe déjà
2. **Créer une issue** avec le template bug
3. **Fournir** :
   - Description détaillée
   - Steps to reproduce
   - Environment (OS, navigateur, version)
   - Screenshots si applicable
   - Logs d'erreur

### **Template d'Issue**

```markdown
## Bug Description

Description claire et concise du problème

## Steps to Reproduce

1. Aller à...
2. Cliquer sur...
3. Observer...

## Expected Behavior

Ce qui devrait se passer

## Actual Behavior

Ce qui se passe réellement

## Environment

- OS: [e.g. macOS 13.0]
- Version: [e.g. 0.1.0]
- Browser: [e.g. Chrome 108]

## Additional Context

Informations supplémentaires
```

---

## 💡 Suggestions de Fonctionnalités

### **Proposer une Idée**

1. **Vérifier** si la suggestion existe déjà
2. **Créer une issue** avec le template feature request
3. **Décrire** :
   - Le problème à résoudre
   - La solution proposée
   - Les bénéfices attendus

### **Template de Feature Request**

```markdown
## Problem Description

Quel problème cette fonctionnalité résout-elle

## Proposed Solution

Description détaillée de la solution

## Benefits

Pourquoi cette fonctionnalité est utile

## Alternatives Considered

Autres solutions envisagées et pourquoi elles ne sont pas idéales
```

---

## 🏷️ Labels et Milestones

### **Labels Communs**

- **bug** : Rapports de bugs
- **enhancement** : Améliorations
- **documentation** : Documentation
- **good first issue** : Pour les nouveaux contributeurs
- **help wanted** : Besoin d'aide
- **priority/high** : Haute priorité
- **priority/medium** : Priorité moyenne
- **priority/low** : Basse priorité

### **Milestones**

- **v0.2** : Prochaines fonctionnalités
- **v0.3** : Améliorations
- **v1.0** : Version stable

---

## 🎯 Rôles et Responsabilités

### **Maintainers**

- **Review** les Pull Requests
- **Merge** les changements
- **Release** les nouvelles versions
- **Gérer** les issues et milestones

### **Contributors**

- **Respecter** les conventions du projet
- **Tester** soigneusement les changements
- **Documenter** les nouvelles fonctionnalités
- **Aider** les autres contributeurs

---

## 📚 Ressources

### **Documentation**

- **[Architecture](../developer/architecture.md)** : Comprendre la structure
- **[API Reference](../developer/api.md)** : Référence technique
- **[UI Components](../developer/ui-ux/components.md)** : Composants UI

### **Outils**

- **[VS Code](https://code.visualstudio.com/)** : IDE recommandé
- **[GitHub Desktop](https://desktop.github.com/)** : Client Git
- **[Figma](https://www.figma.com/)** : Design (si applicable)

### **Apprentissage**

- **[React Documentation](https://react.dev/)** : Guide React
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** : Guide TypeScript
- **[Tauri Docs](https://tauri.app/)** : Documentation Tauri

---

## 🎉 Reconnaissance

### **Contributeurs**

- **GitHub Contributors** : Liste des contributeurs
- **Release Notes** : Mention dans les notes de version
- **README** : Ajout dans la section contributors

### **Types de Contributions**

- **Code** : Nouvelles fonctionnalités, corrections
- **Documentation** : Améliorations de la documentation
- **Testing** : Tests et qualité
- **Design** : UI/UX et design system
- **Translation** : Internationalisation

---

## 📞 Contact

### **Canaux**

- **GitHub Issues** : Bugs et fonctionnalités
- **GitHub Discussions** : Questions et discussions
- **Discord** : (si disponible) Chat communautaire

### **Support**

Pour les questions sur le développement :

- **Vérifier** la documentation existante
- **Chercher** dans les issues existantes
- **Créer** une discussion si nécessaire

---

## 🚀 Getting Started

### **Pour les Nouveaux Contributeurs**

1. **Lire** ce guide en entier
2. **Explorer** la structure du projet
3. **Choisir** une issue "good first issue"
4. **Demander** de l'aide si nécessaire

### **Pour les Développeurs Expérimentés**

1. **Examiner** les issues "help wanted"
2. **Consulter** la roadmap du projet
3. **Proposer** des améliorations
4. **Mentor** les nouveaux contributeurs

---

**Merci de contribuer à Lumina Portfolio ! 🎉**

_Votre contribution, quelle que soit sa taille, est précieuse et appréciée._
