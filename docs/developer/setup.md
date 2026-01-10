# 🛠️ Developer Setup - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `package.json`, `tsconfig.json`, `vite.config.ts`

---

## 📋 Vue d'Ensemble

Lumina Portfolio est une application desktop construite avec React + Tauri. Ce guide décrit l'installation et la configuration de l'environnement de développement.

---

## 🎯 Architecture Technique

### **Frontend**

- **React** 18.3.1 - Framework UI
- **TypeScript** ~5.8.2 - Typage strict
- **Tailwind CSS** 4.1.18 - Styling avec @theme syntax
- **Vite** 6.2.0 - Build tool et dev server

### **Backend**

- **Tauri** v2.9.1 - Runtime desktop (Rust)
- **SQLite** - Base de données locale via plugin
- **Plugins Tauri** : fs, dialog, sql, os, process

### **IA et Services**

- **Gemini AI** @google/genai 1.34.0 - Analyse d'images
- **i18next** 25.7.3 - Internationalisation

---

## 💻 Prérequis Système

### **Node.js**

```bash
# Version requise : 18+ (recommandée : 20+)
node --version  # v20.11.0+
npm --version   # 10.0.0+
```

### **Rust (Tauri)**

```bash
# Installé automatiquement par Tauri CLI
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### **Dépendances Système**

- **macOS** : Xcode Command Line Tools
- **Windows** : Microsoft Visual Studio C++ Build Tools
- **Linux** : build-essential (Ubuntu/Debian)

---

## 📦 Installation

### **1. Cloner le Projet**

```bash
git clone https://github.com/groovybronx/portf84.git
cd portf84
```

### **2. Installer les Dépendances**

```bash
# Installer les dépendances Node.js
npm install

# Installer les dépendances Tauri
npm run tauri:info
```

### **3. Configuration**

```bash
# Copier le fichier d'environnement d'exemple
cp .env.example .env

# Configurer la clé API Gemini (optionnel pour le dev)
# Ouvrir .env et ajouter :
# VITE_GEMINI_API_KEY=votre_clé_api_ici
```

---

## 🚀 Scripts de Développement

### **Développement Local**

```bash
# Démarrer le serveur de développement + Tauri
npm run tauri:dev

# Ou séparément :
npm run dev          # Vite dev server seul
npm run tauri dev    # Tauri dev mode seul
```

### **Build**

```bash
# Build frontend
npm run build

# Build application desktop
npm run tauri:build

# Build pour production
npm run build && npm run tauri:build
```

### **Testing**

```bash
# Tests unitaires
npm test

# Tests end-to-end
npm run test:e2e

# Tests E2E par plateforme
npm run test:e2e:platform chromium

# Vérification des types
npm run type-check
```

---

## ⚙️ Configuration

### **TypeScript (tsconfig.json)**

```json
{
	"compilerOptions": {
		"target": "ES2020",
		"useDefineForClassFields": true,
		"lib": ["ES2020", "DOM", "DOM.Iterable"],
		"module": "ESNext",
		"skipLibCheck": true,
		"moduleResolution": "bundler",
		"allowImportingTsExtensions": true,
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"jsx": "react-jsx",
		"strict": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noFallthroughCasesInSwitch": true,
		"baseUrl": ".",
		"paths": {
			"@/*": ["./src/*"]
		}
	},
	"include": ["src"],
	"references": [{ "path": "./tsconfig.node.json" }]
}
```

### **Vite (vite.config.ts)**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
	server: {
		port: 1420, // Port par défaut Tauri
	},
	build: {
		target: "esnext",
		minify: "esbuild",
	},
});
```

### **Tailwind CSS**

```javascript
// tailwind.config.js (si présent)
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			// Variables CSS personnalisées
			colors: {
				// Palette de couleurs pour les tags
			},
		},
	},
	plugins: [],
};
```

---

## 🗂️ Structure des Dossiers

```
src/
├── features/              # Modules fonctionnels
│   ├── collections/      # Gestion des collections
│   ├── library/          # Médiathèque et vues
│   ├── navigation/       # Navigation et topbar
│   ├── tags/            # Système de tags
│   ├── overlays/        # Modales et overlays
│   └── layout/          # Layouts réutilisables
├── shared/              # Code partagé
│   ├── components/      # Composants UI réutilisables
│   ├── contexts/        # Contextes React
│   ├── hooks/           # Hooks personnalisés
│   ├── types/           # Types TypeScript
│   ├── utils/           # Utilitaires
│   └── constants/       # Constantes
├── services/            # Services externes
│   ├── storage/         # Service de stockage
│   ├── libraryLoader.ts # Chargement des dossiers
│   ├── secureStorage.ts # Stockage sécurisé
│   └── ...              # Autres services
├── i18n/                # Internationalisation
├── App.tsx              # Composant principal
└── main.tsx            # Point d'entrée
```

---

## 🔧 Développement

### **Nouveau Composant**

```typescript
// src/shared/components/NewComponent.tsx
import React from "react";

interface NewComponentProps {
	title: string;
	onAction?: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, onAction }) => {
	return (
		<div className="p-4 border rounded">
			<h2>{title}</h2>
			{onAction && <button onClick={onAction}>Action</button>}
		</div>
	);
};
```

### **Nouveau Hook**

```typescript
// src/shared/hooks/useNewFeature.ts
import { useState, useCallback } from "react";

export const useNewFeature = () => {
	const [state, setState] = useState(false);

	const toggle = useCallback(() => {
		setState((prev) => !prev);
	}, []);

	return {
		state,
		toggle,
		setState,
	};
};
```

### **Nouveau Service**

```typescript
// src/services/newService.ts
export class NewService {
	static async doSomething(): Promise<string> {
		// Logique métier
		return "result";
	}

	static async handleError(error: unknown): Promise<void> {
		// Gestion des erreurs
		console.error("Service error:", error);
	}
}
```

---

## 🧪 Testing

### **Test de Composant**

```typescript
// src/shared/components/__tests__/NewComponent.test.tsx
import { render, screen } from "@testing-library/react";
import { NewComponent } from "../NewComponent";

describe("NewComponent", () => {
	it("renders title correctly", () => {
		render(<NewComponent title="Test Title" />);
		expect(screen.getByText("Test Title")).toBeInTheDocument();
	});

	it("calls onAction when button clicked", () => {
		const onAction = vi.fn();
		render(<NewComponent title="Test" onAction={onAction} />);

		screen.getByText("Action").click();
		expect(onAction).toHaveBeenCalled();
	});
});
```

### **Test de Hook**

```typescript
// src/shared/hooks/__tests__/useNewFeature.test.ts
import { renderHook, act } from "@testing-library/react";
import { useNewFeature } from "../useNewFeature";

describe("useNewFeature", () => {
	it("toggles state correctly", () => {
		const { result } = renderHook(() => useNewFeature());

		expect(result.current.state).toBe(false);

		act(() => {
			result.current.toggle();
		});

		expect(result.current.state).toBe(true);
	});
});
```

---

## 🔍 Debugging

### **Logs**

```typescript
// Utiliser le logger intégré
import { logger } from "@/shared/utils/logger";

logger.debug("component", "Debug message");
logger.info("component", "Info message");
logger.warn("component", "Warning message");
logger.error("component", "Error message");
```

### **DevTools**

```bash
# Ouvrir les dev tools Tauri
npm run tauri:dev
# Puis F12 dans l'application

# Vérifier la build
npm run tauri:info
```

### **Problèmes Communs**

```bash
# Problème de dépendances
npm install

# Problème de build Tauri
npm run tauri:build --verbose

# Problème de types
npm run type-check
```

---

## 📱 Déploiement

### **Build de Production**

```bash
# Build optimisée
npm run build

# Build application
npm run tauri:build

# Résultat dans :
# src-tauri/target/release/bundle/
```

### **Plateformes Supportées**

- **macOS** : .app, .dmg
- **Windows** : .exe, .msi
- **Linux** : .deb, .AppImage

---

## 🎨 Conventions de Code

### **TypeScript**

- Utiliser les interfaces pour les props
- Typage strict (`noUncheckedIndexedAccess`)
- Préférez `unknown` à `any`
- Utiliser les paths alias `@/`

### **React**

- Composants fonctionnels avec `React.FC`
- Props typées avec interfaces
- Hooks personnalisés avec préfixe `use`
- `React.memo` pour composants coûteux

### **CSS**

- Tailwind CSS v4 avec `@theme`
- Classes utilitaires uniquement
- Responsive design mobile-first
- Variables CSS pour z-index et animations

---

## 🔧 Outils Recommandés

### **VS Code Extensions**

- TypeScript Importer
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- GitLens

### **Navigateur**

- React Developer Tools
- Redux DevTools (si utilisé)

---

## 📚 Références

- **Documentation Tauri** : https://tauri.app/
- **Documentation React** : https://react.dev/
- **Documentation Tailwind** : https://tailwindcss.com/
- **Documentation TypeScript** : https://www.typescriptlang.org/

---

## 🆘 Support

### **Ressources**

- **Issues GitHub** : https://github.com/groovybronx/portf84/issues
- **Discussions** : https://github.com/groovybronx/portf84/discussions

### **Commandes Utiles**

```bash
# Vérifier l'environnement
npm run tauri:info

# Nettoyer les dépendances
rm -rf node_modules package-lock.json
npm install

# Réinitialiser Tauri
cd src-tauri
cargo clean
cd ..
npm run tauri:dev
```
