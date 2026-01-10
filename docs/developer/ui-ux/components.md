# 🧩 UI Components - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src/shared/components/ui/`

---

## 📋 Vue d'Ensemble

Lumina Portfolio dispose d'une librairie de 25+ composants UI réutilisables construits avec React et Tailwind CSS v4. Tous les composants suivent les standards de design system de l'application.

---

## 🎨 Design System

### **Variants de Boutons**

```typescript
type ButtonVariant =
	| "primary" // Bouton principal bleu
	| "secondary" // Bouton secondaire gris
	| "outline" // Bouton avec contour
	| "ghost" // Bouton transparent
	| "danger" // Bouton rouge pour actions destructives
	| "glass" // Effet glass morphism
	| "glass-icon" // Icone avec effet glass
	| "close" // Bouton de fermeture
	| "nav-arrow"; // Flèche de navigation
```

### **Tailles Standard**

```typescript
type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-lg" | "icon-sm";
```

### **Tokens de Couleur**

- **Primary** : Bleu `#3b82f6`
- **Glass** : Transparence avec backdrop-blur
- **Palette Tags** : 6 couleurs prédéfinies (voir `COLOR_PALETTE`)

---

## 🔘 Button

### **Interface**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
	fullWidth?: boolean;
	className?: string;
}
```

### **Utilisation**

```typescript
// Bouton standard
<Button onClick={handleClick}>
  Save Changes
</Button>

// Bouton avec icône
<Button icon={<Save size={16} />} iconPosition="left">
  Save
</Button>

// Bouton icône seul
<Button icon={<X size={16} />} variant="ghost" size="icon" />

// Bouton de chargement
<Button loading={true} disabled>
  Processing...
</Button>

// Variants glass morphism
<Button variant="glass" icon={<Settings />}>
  Settings
</Button>
```

### **Comportement**

- **Loading** : Affiche un spinner et désactive le bouton
- **Focus** : Ring bleu de 2px avec outline
- **Active** : Léger effet de scale (0.95)
- **Disabled** : Opacité 50% et pointer-events none

---

## 💬 Modal

### **Interface**

```typescript
interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	className?: string;
}
```

### **Utilisation**

```typescript
<Modal
	isOpen={isModalOpen}
	onClose={() => setIsModalOpen(false)}
	title="Confirm Action"
	size="md"
	footer={
		<div className="flex justify-end gap-2">
			<Button variant="outline" onClick={cancel}>
				Cancel
			</Button>
			<Button onClick={confirm}>Confirm</Button>
		</div>
	}
>
	<p>Are you sure you want to proceed?</p>
</Modal>
```

### **Fonctionnalités**

- **Portal rendering** : Monte dans `document.body`
- **Scroll lock** : Bloque le scroll du body quand ouvert
- **Animations Framer Motion** : Fade in/scale
- **Close on escape** : Fermeture avec touche Échap
- **Click outside** : Fermeture en cliquant à l'extérieur

---

## 📝 Input

### **Interface**

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	error?: boolean;
}
```

### **Utilisation**

```typescript
// Input standard
<Input placeholder="Enter name" />

// Input avec icônes
<Input
  leftIcon={<User size={16} />}
  rightIcon={<Check size={16} />}
  placeholder="Username"
/>

// Input avec erreur
<Input
  error={true}
  placeholder="Email"
  className="border-red-500"
/>

// SearchInput (composant dédié)
<SearchInput placeholder="Search photos..." />
```

### **Styles**

- **Glass morphism** : Arrière-plan transparent avec backdrop-blur
- **Focus states** : Bordure bleue et ring lumineux
- **Error states** : Bordure rouge avec ring rouge
- **Icon positioning** : Padding ajusté automatiquement

---

## 🃏 GlassCard

### **Interface**

```typescript
interface GlassCardProps {
	children: React.ReactNode;
	className?: string;
	hover?: boolean;
}
```

### **Utilisation**

```typescript
<GlassCard hover={true}>
	<h3>Card Title</h3>
	<p>Card content with glass morphism effect</p>
</GlassCard>
```

### **Effet Glass Morphism**

```css
/* Styles appliqués */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

---

## 🔄 ConfirmDialog

### **Interface**

```typescript
interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "primary" | "danger";
}
```

### **Utilisation**

```typescript
<ConfirmDialog
	isOpen={showDeleteDialog}
	onClose={() => setShowDeleteDialog(false)}
	onConfirm={handleDelete}
	title="Delete Photo"
	message="This action cannot be undone. Are you sure?"
	confirmText="Delete"
	cancelText="Cancel"
	variant="danger"
/>
```

---

## 📐 Layout Components

### **Container**

```typescript
interface ContainerProps {
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	className?: string;
}
```

```typescript
<Container size="lg">
	<h1>Page Title</h1>
	<p>Page content</p>
</Container>
```

### **Flex**

```typescript
interface FlexProps {
	children: React.ReactNode;
	align?: "start" | "center" | "end" | "stretch";
	justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
	direction?: "row" | "col" | "row-reverse" | "col-reverse";
	gap?: number;
	wrap?: boolean;
	className?: string;
}
```

```typescript
<Flex align="center" justify="between" gap={4}>
	<h2>Section Title</h2>
	<Button icon={<Settings />}>Settings</Button>
</Flex>
```

### **Grid**

```typescript
interface GridProps {
	children: React.ReactNode;
	cols?: number | string;
	gap?: number;
	className?: string;
}
```

```typescript
<Grid cols={3} gap={4}>
	{photos.map((photo) => (
		<PhotoCard key={photo.id} photo={photo} />
	))}
</Grid>
```

### **Stack**

```typescript
interface StackProps {
	children: React.ReactNode;
	direction?: "vertical" | "horizontal";
	spacing?: number;
	align?: "start" | "center" | "end" | "stretch";
	className?: string;
}
```

```typescript
<Stack direction="vertical" spacing={4}>
	<Input placeholder="First name" />
	<Input placeholder="Last name" />
	<Button>Submit</Button>
</Stack>
```

---

## ⏳ Loading States

### **LoadingSpinner**

```typescript
interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}
```

```typescript
<LoadingSpinner size="md" />
```

### **Skeleton**

```typescript
interface SkeletonProps {
	width?: string | number;
	height?: string | number;
	className?: string;
}
```

```typescript
<Skeleton width="100%" height="200px" />
<Skeleton width="60%" height="20px" />
```

---

## 🎯 Patterns d'Utilisation

### **Formulaire Complet**

```typescript
<Stack direction="vertical" spacing={4}>
	<Input leftIcon={<Mail size={16} />} placeholder="Email address" type="email" />
	<Input leftIcon={<Lock size={16} />} placeholder="Password" type="password" />
	<Button fullWidth={true} loading={isLoading}>
		Sign In
	</Button>
</Stack>
```

### **Card avec Actions**

```typescript
<GlassCard hover={true}>
	<Stack direction="vertical" spacing={3}>
		<h3>Photo Collection</h3>
		<p>23 photos • Last updated 2 hours ago</p>
		<Flex justify="end">
			<Button variant="outline" size="sm">
				View
			</Button>
			<Button size="sm">Edit</Button>
		</Flex>
	</Stack>
</GlassCard>
```

### **Modal Complexe**

```typescript
<Modal
	isOpen={isOpen}
	onClose={onClose}
	title="Edit Collection"
	size="lg"
	footer={
		<Flex justify="end" gap={2}>
			<Button variant="outline" onClick={onClose}>
				Cancel
			</Button>
			<Button onClick={save} loading={isSaving}>
				Save Changes
			</Button>
		</Flex>
	}
>
	<Stack direction="vertical" spacing={4}>
		<Input
			leftIcon={<Folder size={16} />}
			placeholder="Collection name"
			defaultValue={collection.name}
		/>
		<Input
			leftIcon={<FileText size={16} />}
			placeholder="Description"
			defaultValue={collection.description}
		/>
	</Stack>
</Modal>
```

---

## 🎨 Thème et Styles

### **CSS Variables**

```css
:root {
	--z-modal: 50;
	--z-tooltip: 100;
	--z-toast: 200;

	--glass-bg: rgba(255, 255, 255, 0.05);
	--glass-bg-accent: rgba(255, 255, 255, 0.1);
	--glass-bg-active: rgba(255, 255, 255, 0.15);
	--glass-border: rgba(255, 255, 255, 0.1);
	--glass-border-light: rgba(255, 255, 255, 0.2);
}
```

### **Responsive Design**

```typescript
// Breakpoints utilisés
sm: 640px   // Mobile large
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Desktop large
```

---

## 🔧 Utilitaires

### **cn() - Class Names Utility**

```typescript
import { cn } from "@/shared/utils/cn";

// Fusion conditionnelle de classes
const className = cn(
	"base-class",
	{
		"conditional-class": condition,
		"another-class": anotherCondition,
	},
	props.className
);
```

---

## 📚 Références

- **Code source** : `src/shared/components/ui/`
- **Design tokens** : Variables CSS dans `index.css`
- **Icons** : Lucide React (`lucide-react`)
- **Animations** : Framer Motion
- **Styling** : Tailwind CSS v4

---

## 🚀 Bonnes Pratiques

1. **Typage strict** : Toujours utiliser les interfaces TypeScript
2. **Props par défaut** : Définir des valeurs par défaut raisonnables
3. **Accessibilité** : Ajouter ARIA labels et keyboard navigation
4. **Performance** : Utiliser `React.memo` pour composants coûteux
5. **Consistance** : Suivre les patterns établis (variants, sizes, spacing)
