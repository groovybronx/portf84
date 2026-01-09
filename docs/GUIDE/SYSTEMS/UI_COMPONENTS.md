# 🎨 UI Components - Lumina Portfolio

**Complete component library and design system documentation**

**Last Update**: January 8, 2026

---

## 📋 Overview

Lumina Portfolio features a comprehensive component library built with React, TypeScript, and Tailwind CSS. The design system emphasizes glassmorphism, smooth animations, and accessibility while maintaining excellent performance.

### Design Principles

- **🎨 Glassmorphism** - Translucent backgrounds with backdrop blur
- **🌙 Dark Theme** - Optimized for photo viewing and editing
- **⚡ Performance** - Optimized rendering with React.memo and virtualization
- **♿ Accessibility** - WCAG AA compliant with proper ARIA labels
- **📱 Responsive** - Adapts to different screen sizes and orientations
- **🎭 Animations** - Smooth transitions powered by Framer Motion

---

## 🏗️ Component Architecture

### Component Hierarchy

```
src/shared/components/
├── Layout/
│   ├── MainLayout.tsx
│   ├── TopBar.tsx
│   ├── Sidebar.tsx
│   └── StatusBar.tsx
├── UI/
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Radio.tsx
│   ├── Toggle.tsx
│   ├── Slider.tsx
│   ├── Progress.tsx
│   └── Badge.tsx
├── Feedback/
│   ├── LoadingSpinner.tsx
│   ├── Toast.tsx
│   ├── Alert.tsx
│   ├── Tooltip.tsx
│   └── EmptyState.tsx
├── Media/
│   ├── Image.tsx
│   ├── Video.tsx
│   ├── Icon.tsx
│   └── Avatar.tsx
├── Navigation/
│   ├── Tabs.tsx
│   ├── Pagination.tsx
│   ├── Breadcrumb.tsx
│   └── Menu.tsx
└── Forms/
    ├── Form.tsx
    ├── Field.tsx
    ├── Label.tsx
    └── Error.tsx
```

### Component Categories

#### 1. Layout Components
Structural components for page layout and navigation

#### 2. UI Components
Fundamental interactive elements (buttons, inputs, etc.)

#### 3. Feedback Components
User feedback and status indicators

#### 4. Media Components
Image, video, and icon display components

#### 5. Navigation Components
Navigation and routing components

#### 6. Form Components
Form building blocks and validation

---

## 🎨 Design System

### Color Palette

#### Primary Colors
```css
/* Semantic color tokens using Tailwind @theme syntax */
--color-primary: theme('colors.blue.500');
--color-primary-hover: theme('colors.blue.600');
--color-primary-active: theme('colors.blue.700');

--color-secondary: theme('colors.gray.500');
--color-secondary-hover: theme('colors.gray.600');
--color-secondary-active: theme('colors.gray.700');
```

#### Background Colors
```css
/* Glassmorphism backgrounds */
--color-background: theme('colors.gray.900');
--color-surface: theme('colors.gray.800/50');
--color-surface-hover: theme('colors.gray.700/60');
--color-surface-active: theme('colors.gray.600/70');

/* Overlay backgrounds */
--color-overlay: theme('colors.black/80');
--color-modal: theme('colors.gray.900/95');
```

#### Text Colors
```css
--color-text-primary: theme('colors.white');
--color-text-secondary: theme('colors.gray.300');
--color-text-muted: theme('colors.gray.500');
--color-text-inverse: theme('colors.gray.900');
```

#### Accent Colors
```css
--color-success: theme('colors.green.500');
--color-warning: theme('colors.yellow.500');
--color-error: theme('colors.red.500');
--color-info: theme('colors.blue.500');
```

### Typography

#### Font Scale
```css
/* Using Tailwind's font size scale */
.text-xs   /* 12px - Captions */
.text-sm   /* 14px - Small text */
.text-base /* 16px - Body text */
.text-lg   /* 18px - Large text */
.text-xl   /* 20px - Headings */
.text-2xl  /* 24px - Section titles */
.text-3xl  /* 30px - Page titles */
.text-4xl  /* 36px - Display titles */
```

#### Font Weights
```css
.font-light    /* 300 */
.font-normal   /* 400 */
.font-medium   /* 500 */
.font-semibold /* 600 */
.font-bold     /* 700 */
```

### Spacing System

#### Scale (8px base unit)
```css
/* Tailwind spacing scale */
.space-1   /* 4px */
.space-2   /* 8px */
.space-3   /* 12px */
.space-4   /* 16px */
.space-5   /* 20px */
.space-6   /* 24px */
.space-8   /* 32px */
.space-10  /* 40px */
.space-12  /* 48px */
.space-16  /* 64px */
```

### Border Radius

```css
.rounded-sm   /* 2px - Small elements */
.rounded      /* 4px - Default */
.rounded-md   /* 6px - Medium */
.rounded-lg   /* 8px - Large */
.rounded-xl   /* 12px - Extra large */
.rounded-2xl  /* 16px - Cards */
.rounded-3xl  /* 24px - Modals */
.rounded-full /* 50% - Circles */
```

### Shadows

```css
.shadow-sm    /* Subtle elevation */
.shadow       /* Standard elevation */
.shadow-md    /* Medium elevation */
.shadow-lg    /* High elevation */
.shadow-xl    /* Very high elevation */
```

---

## 🧩 Core Components

### Button Component

#### Interface
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass' | 'glass-icon' | 'close' | 'nav-arrow';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-lg' | 'icon-sm';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}
```

#### Implementation
```typescript
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border border-gray-400 hover:bg-gray-700 text-white focus:ring-gray-500',
    ghost: 'hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    glass: 'bg-glass-bg text-white border border-glass-border-light hover:bg-glass-bg-active hover:border-glass-border backdrop-blur-md',
    'glass-icon': 'p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors border-none',
    close: 'p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors border-none',
    'nav-arrow': 'p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'h-9 w-9 p-0',
    'icon-lg': 'h-11 w-11 p-0',
    'icon-sm': 'h-7 w-7 p-0',
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    (disabled || loading) && 'opacity-50 cursor-not-allowed',
    className
  );

  return (
    <motion.button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading && <LoadingSpinner className="mr-2" size="sm" />}
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </motion.button>
  );
};
```

#### Usage Examples
```typescript
// Primary button
<Button onClick={handleSave}>Save Changes</Button>

// Button with icon
<Button icon={<PlusIcon />} onClick={handleAdd}>
  Add Item
</Button>

// Loading state
<Button loading={isSubmitting} onClick={handleSubmit}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>

// Different variants
<Button variant="outline">Cancel</Button>
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>
```

### Modal Component

#### Interface
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

#### Implementation
```typescript
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  className = ''
}) => {
  useEffect(() => {
    if (closeOnEscape && isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        {/* Modal Content */}
        <motion.div
          className={cn(
            'relative w-full bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl',
            sizeClasses[size],
            className
          )}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              {title && (
                <h2 className="text-xl font-semibold text-white">{title}</h2>
              )}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<XIcon />}
                  onClick={onClose}
                  aria-label="Close modal"
                />
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
```

#### Usage Examples
```typescript
// Basic modal
<Modal isOpen={isOpen} onClose={onClose} title="Edit Photo">
  <PhotoEditor photo={photo} onSave={onSave} />
</Modal>

// Different sizes
<Modal isOpen={isOpen} onClose={onClose} size="xl">
  <ImageViewer image={image} />
</Modal>

// Custom modal without header
<Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
  <CustomContent />
</Modal>
```

### Input Component

#### Interface
```typescript
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'number';
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}
```

#### Implementation
```typescript
export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  label,
  error,
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = true,
  className = ''
}) => {
  const [focused, setFocused] = useState(false);
  const inputId = useId();

  const baseClasses = 'bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 transition-all duration-200';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const stateClasses = cn(
    focused && 'border-blue-500 ring-1 ring-blue-500/20',
    error && 'border-red-500 ring-1 ring-red-500/20',
    disabled && 'opacity-50 cursor-not-allowed bg-gray-800/30'
  );

  const classes = cn(
    baseClasses,
    sizeClasses[size],
    stateClasses,
    fullWidth && 'w-full',
    icon && iconPosition === 'left' && 'pl-10',
    icon && iconPosition === 'right' && 'pr-10',
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={classes}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};
```

#### Usage Examples
```typescript
// Basic input
<Input
  value={email}
  onChange={setEmail}
  type="email"
  placeholder="Enter your email"
  label="Email Address"
  required
/>

// Input with icon and validation
<Input
  value={password}
  onChange={setPassword}
  type="password"
  placeholder="Enter password"
  label="Password"
  icon={<LockIcon />}
  error={passwordError}
  required
/>

// Search input
<Input
  value={searchQuery}
  onChange={setSearchQuery}
  type="search"
  placeholder="Search photos..."
  icon={<SearchIcon />}
/>
```

---

## 🎭 Advanced Components

### PhotoGrid Component

#### Interface
```typescript
interface PhotoGridProps {
  photos: Photo[];
  selectedPhotos: string[];
  onPhotoSelect: (id: string) => void;
  onPhotoMultiSelect: (id: string) => void;
  viewMode: 'grid' | 'list';
  loading?: boolean;
  className?: string;
}
```

#### Implementation
```typescript
export const PhotoGrid: React.FC<PhotoGridProps> = React.memo(({
  photos,
  selectedPhotos,
  onPhotoSelect,
  onPhotoMultiSelect,
  viewMode,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return <PhotoGridSkeleton />;
  }

  if (photos.length === 0) {
    return <EmptyState message="No photos found" />;
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {photos.map(photo => (
          <PhotoListItem
            key={photo.id}
            photo={photo}
            selected={selectedPhotos.includes(photo.id)}
            onSelect={() => onPhotoSelect(photo.id)}
            onMultiSelect={() => onPhotoMultiSelect(photo.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {photos.map(photo => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          selected={selectedPhotos.includes(photo.id)}
          onSelect={() => onPhotoSelect(photo.id)}
          onMultiSelect={() => onPhotoMultiSelect(photo.id)}
        />
      ))}
    </div>
  );
});
```

### TagHub Component

#### Interface
```typescript
interface TagHubProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onTagsChange: () => void;
}
```

#### Implementation
```typescript
export const TagHub: React.FC<TagHubProps> = ({
  isOpen,
  onClose,
  tags,
  onTagsChange
}) => {
  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    { id: 1, label: 'Browse', icon: <SearchIcon /> },
    { id: 2, label: 'Manage', icon: <SettingsIcon /> },
    { id: 3, label: 'Fusion', icon: <MergeIcon /> },
    { id: 4, label: 'Settings', icon: <CogIcon /> }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Tag Hub"
      className="min-h-[600px]"
    >
      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-white/10 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
              activeTab === tab.id
                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 1 && <BrowseTab tags={tags} />}
        {activeTab === 2 && <ManageTab tags={tags} onChange={onTagsChange} />}
        {activeTab === 3 && <FusionTab tags={tags} onChange={onTagsChange} />}
        {activeTab === 4 && <SettingsTab />}
      </div>
    </Modal>
  );
};
```

---

## ⚡ Performance Optimization

### React.memo Usage

#### Expensive Components
```typescript
// Memoize components that receive complex props
export const PhotoCard = React.memo<PhotoCardProps>(({ photo, selected, onSelect }) => {
  return (
    <motion.div
      className={cn('photo-card', selected && 'selected')}
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
    >
      <img src={photo.thumbnail} alt={photo.filename} />
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.photo.id === nextProps.photo.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.onSelect === nextProps.onSelect
  );
});
```

### Virtualization

#### Large Lists
```typescript
import { FixedSizeList as List } from 'react-window';

export const VirtualPhotoList: React.FC<{ photos: Photo[] }> = ({ photos }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <PhotoCard photo={photos[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={photos.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### Image Optimization

#### Progressive Loading
```typescript
export const OptimizedImage: React.FC<ImageProps> = ({ src, alt, ...props }) => {
  const [imageSrc, setImageSrc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };
  }, [src]);

  return (
    <div className="relative">
      {loading && <ImageSkeleton />}
      <img
        src={imageSrc || placeholderSrc}
        alt={alt}
        className={cn('transition-opacity duration-300', loading && 'opacity-0')}
        {...props}
      />
    </div>
  );
};
```

---

## ♿ Accessibility

### ARIA Labels

#### Semantic HTML
```typescript
export const AccessibleButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      role="button"
      aria-label={typeof children === 'string' ? children : undefined}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### Keyboard Navigation
```typescript
export const KeyboardNavigableGrid: React.FC<{ items: Item[] }> = ({ items }) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (focusedIndex >= 0) {
          items[focusedIndex].action();
        }
        break;
    }
  };

  return (
    <div
      role="grid"
      aria-label="Photo grid"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          role="gridcell"
          aria-label={item.label}
          aria-selected={focusedIndex === index}
          tabIndex={focusedIndex === index ? 0 : -1}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};
```

### Screen Reader Support

#### Live Regions
```typescript
export const StatusMessage: React.FC<{ message: string; type: 'info' | 'error' | 'success' }> = ({ message, type }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'sr-only',
        type === 'error' && 'text-red-500',
        type === 'success' && 'text-green-500'
      )}
    >
      {message}
    </div>
  );
};
```

---

## 🧪 Testing Components

### Unit Tests

#### Button Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/shared/components/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-500');
  });
});
```

### Component Integration Tests

#### Modal Integration Test
```typescript
describe('Modal Integration', () => {
  it('opens and closes correctly', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on escape key', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Modal content</p>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📚 Component Library Usage

### Import Patterns

#### Individual Imports
```typescript
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { Input } from '@/shared/components/Input';
```

#### Barrel Exports
```typescript
// src/shared/components/index.ts
export { Button } from './Button';
export { Modal } from './Modal';
export { Input } from './Input';
export { LoadingSpinner } from './LoadingSpinner';

// Usage
import { Button, Modal, Input } from '@/shared/components';
```

### Theme Customization

#### Tailwind Configuration
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

#### CSS Variables
```css
/* src/styles/theme.css */
:root {
  --color-primary: theme('colors.primary.500');
  --color-background: theme('colors.gray.900');
  --border-radius: theme('borderRadius.lg');
}
```

---

## 🔮 Future Enhancements

### Planned Components

#### 1. Data Table
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  selection?: 'single' | 'multiple';
}
```

#### 2. Chart Components
```typescript
interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartData;
  options?: ChartOptions;
}
```

#### 3. File Upload
```typescript
interface FileUploadProps {
  accept?: string[];
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
}
```

### Design System Evolution

#### 1. Design Tokens
```typescript
export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      // ... full scale
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    // ... full scale
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui'],
      mono: ['JetBrains Mono', 'monospace']
    }
  }
};
```

#### 2. Component Variants
```typescript
export const buttonVariants = {
  variant: {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-600 hover:bg-gray-700',
    // ... more variants
  },
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
};
```

---

## 📚 Related Documentation

- **[Architecture](../../ARCHITECTURE.md)** - System architecture overview
- **[Developer Guide](../../DEVELOPER_GUIDE.md)** - Development workflow
- **[Tag System](./TAG_SYSTEM/TAG_SYSTEM.md)** - Tag management documentation
- **[AI Service](./AI_SERVICE.md)** - AI features documentation

---

## 🆘 Troubleshooting

### Common Issues

#### Styling Problems
- **Issue**: Tailwind classes not applying
- **Solution**: Check class names and ensure Tailwind is properly configured

#### Animation Issues
- **Issue**: Animations not working
- **Solution**: Ensure Framer Motion is properly installed and configured

#### Performance Issues
- **Issue**: Slow rendering with many components
- **Solution**: Use React.memo and virtualization for large lists

### Debug Mode

#### Component Debugging
```typescript
// Enable debug logging for components
const DEBUG = process.env.NODE_ENV === 'development';

export const debugLog = (component: string, message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[${component}] ${message}`, data);
  }
};
```

---

<div align="center">

**UI Components Documentation** - Beautiful, accessible, and performant components 🎨✨

[🏠 Back to Documentation](../../README.md) | [🤖 AI Service](./AI_SERVICE.md) | [🏷️ Tag System](./TAG_SYSTEM/TAG_SYSTEM.md)

</div>
