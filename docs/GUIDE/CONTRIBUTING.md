# 🤝 Contributing to Lumina Portfolio

**Guidelines for contributing to the Lumina Portfolio project**

**Last Update**: January 8, 2026

---

## 📋 Overview

Thank you for your interest in contributing to Lumina Portfolio! This document provides guidelines and best practices for contributors.

### Ways to Contribute

- 🐛 **Bug Reports** - Report issues and help us fix them
- 💡 **Feature Requests** - Suggest new features and improvements
- 🔧 **Code Contributions** - Submit pull requests with code changes
- 📖 **Documentation** - Improve documentation and guides
- 🧪 **Testing** - Write and improve tests
- 🌍 **Translations** - Help with internationalization

---

## 🚀 Getting Started

### Prerequisites

Before contributing, make sure you have:

- **Node.js** 18+ LTS installed
- **Rust** stable toolchain installed
- **Git** configured with your name and email
- **GitHub** account with two-factor authentication enabled

### Development Setup

#### 1. Fork the Repository
```bash
# Fork the repository on GitHub
# Clone your fork locally
git clone https://github.com/YOUR_USERNAME/portf84.git
cd portf84
```

#### 2. Set Up Upstream Remote
```bash
# Add upstream remote
git remote add upstream https://github.com/groovybronx/portf84.git

# Verify remotes
git remote -v
```

#### 3. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Rust dependencies (if needed)
rustup component add rustfmt clippy
```

#### 4. Create Development Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

---

## 🏗️ Development Workflow

### Code Standards

#### TypeScript Configuration
- Use **strict TypeScript** mode
- Provide **type annotations** for all functions
- Use **interfaces** for object shapes
- Avoid `any` type when possible

#### Code Style
```typescript
// ✅ Good - Use interfaces and proper typing
interface Photo {
  id: string;
  filename: string;
  createdAt: Date;
}

const getPhoto = async (id: string): Promise<Photo | null> => {
  // Implementation
};

// ❌ Bad - Avoid any type
const getPhoto = async (id: any): Promise<any> => {
  // Implementation
};
```

#### Component Structure
```typescript
// ✅ Good - Feature-based organization
export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onSelect }) => {
  return (
    <div className="photo-card" onClick={() => onSelect(photo.id)}>
      <img src={photo.thumbnail} alt={photo.filename} />
    </div>
  );
};

// ❌ Bad - Inline types and unclear structure
export const PhotoCard = ({ photo, onSelect }) => {
  return (
    <div onClick={() => onSelect(photo.id)}>
      <img src={photo.thumbnail} />
    </div>
  );
};
```

### Naming Conventions

#### Files and Directories
- **Components**: PascalCase (`PhotoCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`usePhotoSelection.ts`)
- **Services**: PascalCase (`PhotoService.ts`)
- **Utilities**: camelCase (`fileUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

#### Variables and Functions
```typescript
// ✅ Good - Descriptive names
const selectedPhotoIds = useSelectedPhotoIds();
const analyzeImageWithGemini = async (imagePath: string) => {
  // Implementation
};

// ❌ Bad - Unclear names
const ids = useIds();
const analyze = async (path: string) => {
  // Implementation
};
```

---

## 🧪 Testing Guidelines

### Test Structure

#### Unit Tests
```typescript
// tests/services/photoService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhotoService } from '@/services/photoService';

describe('PhotoService', () => {
  let photoService: PhotoService;

  beforeEach(() => {
    photoService = new PhotoService();
  });

  describe('getPhotoById', () => {
    it('should return photo when found', async () => {
      const mockPhoto = createMockPhoto();
      vi.mocked(photoService.getPhotoById).mockResolvedValue(mockPhoto);

      const result = await photoService.getPhotoById('photo-id');

      expect(result).toEqual(mockPhoto);
    });

    it('should return null when not found', async () => {
      vi.mocked(photoService.getPhotoById).mockResolvedValue(null);

      const result = await photoService.getPhotoById('non-existent');

      expect(result).toBeNull();
    });
  });
});
```

#### Component Tests
```typescript
// tests/components/PhotoCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoCard } from '@/features/library/components/PhotoCard';

describe('PhotoCard', () => {
  const mockPhoto = createMockPhoto();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render photo information', () => {
    render(<PhotoCard photo={mockPhoto} onSelect={mockOnSelect} />);

    expect(screen.getByAltText(mockPhoto.filename)).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    render(<PhotoCard photo={mockPhoto} onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByRole('img'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockPhoto.id);
  });
});
```

### Test Requirements

#### Coverage Requirements
- **Unit Tests**: 80% minimum coverage
- **Component Tests**: All UI components must have tests
- **Integration Tests**: Critical workflows must be tested

#### Test Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test PhotoCard.test.tsx
```

---

## 📝 Documentation Standards

### Code Documentation

#### JSDoc Comments
```typescript
/**
 * Analyzes an image using Gemini AI
 * @param imagePath - Path to the image file
 * @param options - Analysis options
 * @returns Promise resolving to analysis results
 * @throws {Error} When image analysis fails
 * @example
 * ```typescript
 * const analysis = await analyzeImage('/path/to/photo.jpg');
 * console.log(analysis.objects);
 * ```
 */
export const analyzeImage = async (
  imagePath: string,
  options?: AnalysisOptions
): Promise<ImageAnalysis> => {
  // Implementation
};
```

#### Component Documentation
```typescript
interface PhotoCardProps {
  /** Photo object to display */
  photo: Photo;
  /** Callback function when photo is selected */
  onSelect: (id: string) => void;
  /** Whether the photo is currently selected */
  selected?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PhotoCard component displays a single photo with selection state
 *
 * @example
 * ```tsx
 * <PhotoCard
 *   photo={photo}
 *   onSelect={handleSelect}
 *   selected={isSelected}
 * />
 * ```
 */
export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onSelect,
  selected = false,
  className = ''
}) => {
  // Implementation
};
```

### README Updates

When adding new features:
1. Update the main README.md
2. Update relevant documentation files
3. Add examples to the User Guide
4. Update API Reference if needed

---

## 🐛 Bug Reports

### Bug Report Template

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. macOS 13.0, Windows 11, Ubuntu 22.04]
- Version: [e.g. v0.3.0-beta.1]
- Browser: [if applicable]

## Additional Context
Add any other context about the problem here
```

### Reporting Guidelines

- **Search existing issues** before creating new ones
- **Use the template** and provide all required information
- **Include screenshots** for UI issues
- **Add logs** or error messages when available
- **Label the issue** appropriately (bug, enhancement, etc.)

---

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear and concise description of the feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Add any other context or screenshots about the feature request here
```

### Request Guidelines

- **Check existing issues** for similar requests
- **Provide clear use cases** and benefits
- **Consider implementation complexity**
- **Discuss trade-offs** and alternatives

---

## 🔧 Pull Request Guidelines

### PR Requirements

#### Before Submitting
- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Code compiles without errors (`npm run type-check`)
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions

#### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Added tests for new functionality
- [ ] Updated existing tests
- [ ] All tests pass

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
```

### Commit Message Guidelines

#### Format
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples
```bash
feat(tags): add tag search functionality

fix(photo): resolve memory leak in image viewer

docs(readme): update installation instructions

test(photo): add unit tests for photo service
```

---

## 🌍 Internationalization

### Adding Translations

#### Translation Files
```json
// src/i18n/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "photo": {
    "loading": "Loading photo...",
    "error": "Failed to load photo"
  }
}

// src/i18n/locales/fr.json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler"
  },
  "photo": {
    "loading": "Chargement de la photo...",
    "error": "Échec du chargement de la photo"
  }
}
```

#### Using Translations
```typescript
import { useTranslation } from 'react-i18next';

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('photo.loading')}</h2>
      <img src={photo.thumbnail} alt={photo.filename} />
    </div>
  );
};
```

### Translation Guidelines

- **Use descriptive keys** with dot notation
- **Provide context** for ambiguous terms
- **Keep translations concise**
- **Test all languages** before submitting

---

## 🔒 Security Considerations

### Security Guidelines

#### API Keys and Secrets
- **Never commit API keys** to the repository
- **Use environment variables** for sensitive data
- **Validate all inputs** from external sources
- **Use HTTPS** for all external API calls

#### Code Security
```typescript
// ✅ Good - Validate input
export const validateImagePath = (path: string): boolean => {
  if (!path || typeof path !== 'string') return false;

  // Check for directory traversal
  if (path.includes('..')) return false;

  // Check file extension
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(path).toLowerCase();
  return allowedExts.includes(ext);
};

// ❌ Bad - No validation
export const loadImage = (path: string) => {
  // Directly use path without validation
  return fs.readFileSync(path);
};
```

---

## 📊 Performance Guidelines

### Performance Requirements

#### Code Optimization
- **Use React.memo** for expensive components
- **Implement virtualization** for large lists
- **Optimize images** with proper sizing and compression
- **Use lazy loading** for non-critical resources

#### Monitoring Performance
```typescript
// Performance monitoring
export const withPerformanceTracking = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
) => {
  return async (...args: T): Promise<R> => {
    const start = performance.now();
    const result = await fn(...args);
    const duration = performance.now() - start;

    console.log(`${name} took ${duration.toFixed(2)}ms`);

    // Send to analytics if in production
    if (import.meta.env.PROD) {
      analytics.track('performance', { name, duration });
    }

    return result;
  };
};
```

---

## 🎯 Code Review Process

### Review Guidelines

#### For Reviewers
- **Check code quality** and adherence to standards
- **Verify functionality** matches requirements
- **Ensure tests** are adequate and passing
- **Check documentation** is updated
- **Look for potential issues** and edge cases

#### For Authors
- **Address all feedback** from reviewers
- **Update tests** as needed
- **Improve documentation** based on suggestions
- **Consider alternative approaches** when suggested

### Review Checklist

#### Code Quality
- [ ] Code follows project style guidelines
- [ ] Types are properly defined and used
- [ ] Error handling is implemented
- [ ] Performance considerations are addressed

#### Functionality
- [ ] Feature works as expected
- [ ] Edge cases are handled
- [ ] User experience is considered
- [ ] Accessibility requirements are met

#### Testing
- [ ] Tests cover new functionality
- [ ] Tests are well-written and maintainable
- [ ] Edge cases are tested
- [ ] Integration tests are included if needed

---

## 📚 Resources

### Documentation
- **[Architecture](./ARCHITECTURE.md)** - System architecture
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Development workflow
- **[API Reference](./API_REFERENCE.md)** - API documentation
- **[User Guide](./USER_GUIDE.md)** - User documentation

### Tools and Resources
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**
- **[React Documentation](https://react.dev/)**
- **[Tauri Documentation](https://tauri.app/)**
- **[Tailwind CSS](https://tailwindcss.com/docs)**

### Community
- **[GitHub Discussions](https://github.com/groovybronx/portf84/discussions)** - Questions and discussions
- **[GitHub Issues](https://github.com/groovybronx/portf84/issues)** - Bug reports and feature requests

---

## 🤝 Getting Help

### Support Channels

#### For Contributors
- **GitHub Discussions** - General questions and discussions
- **GitHub Issues** - Bug reports and feature requests
- **Discord/Slack** - Real-time chat (if available)

#### Code Review Help
- **Request review** in pull request description
- **Tag maintainers** for urgent review needs
- **Ask questions** in GitHub Discussions

---

## 🎉 Recognition

### Contributor Recognition

#### Contributors List
All contributors are recognized in:
- **README.md** - Contributors section
- **Release Notes** - Feature attributions
- **About dialog** - In-app credits

#### Recognition Levels
- **🌟 Contributor** - 1-5 contributions
- **🌟🌟 Active Contributor** - 6-20 contributions
- **🌟🌟🌟 Core Contributor** - 20+ contributions

---

<div align="center">

**Thank you for contributing to Lumina Portfolio!** 🤝✨

Every contribution, no matter how small, helps make this project better.

[🏠 Back to Documentation](./README.md) | [💻 Developer Guide](./DEVELOPER_GUIDE.md) | [🐛 Report Issue](https://github.com/groovybronx/portf84/issues)

</div>
