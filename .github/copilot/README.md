# GitHub Copilot Configuration for Lumina Portfolio

This directory contains the GitHub Copilot configuration and rule sets for the Lumina Portfolio project. These files help Copilot provide context-aware code suggestions that align with the project's conventions and best practices.

## 📁 Structure

```
.github/
├── copilot-instructions.md     # Main instructions file (read by Copilot)
├── copilot-rules.json          # JSON-based ruleset configuration
├── copilot/                    # Detailed ruleset documentation
│   ├── README.md               # This file
│   ├── typescript-react-rules.md
│   ├── rust-tauri-rules.md
│   ├── testing-rules.md
│   └── security-rules.md
```

## 🎯 Purpose

These rule sets ensure that GitHub Copilot:
- Follows project-specific coding conventions
- Suggests secure code patterns
- Maintains consistency across the codebase
- Respects the feature-based architecture
- Uses correct TypeScript types and React patterns
- Follows Tauri/Rust best practices

## 📚 Rule Set Overview

### 1. **typescript-react-rules.md**
Covers:
- Component structure and patterns
- Import organization with `@/` alias
- State management (Context API, hooks)
- Type safety and TypeScript conventions
- Performance optimization patterns
- Code style (tabs, quotes, semicolons)

### 2. **rust-tauri-rules.md**
Covers:
- Tauri command patterns
- Error handling with `Result<T, String>`
- Database operations with SQLite
- String handling (`&str` vs `String`)
- Tauri plugin usage
- Security considerations

### 3. **testing-rules.md**
Covers:
- Test file organization
- Component testing with React Testing Library
- Custom hook testing
- Service/utility testing
- Mocking patterns (Tauri, API calls)
- Accessibility testing

### 4. **security-rules.md**
Covers:
- API key and secrets management
- Input validation
- SQL injection prevention
- XSS prevention
- File system security
- Secure data storage
- Rate limiting

### 5. **copilot-rules.json**
JSON-based configuration that defines:
- Pattern-based rule application
- File-specific instructions
- Cross-cutting concerns

## 🚀 How It Works

GitHub Copilot automatically reads these files when:
1. You're editing code in the repository
2. You invoke Copilot (inline suggestions or chat)
3. You use Copilot Chat with `@workspace` context

The rules are applied based on:
- File patterns (e.g., `*.tsx` for React rules)
- Directory structure (e.g., `src-tauri/` for Rust rules)
- Context of the current work

## 💡 Usage Tips

### For Inline Suggestions
When you're typing code, Copilot will automatically suggest completions that follow the rules. For example:
- Typing a component will suggest `React.FC` pattern
- Creating a Tauri command will suggest proper error handling
- Writing a test will follow AAA pattern

### For Copilot Chat
You can reference specific rules in your prompts:

```
"Create a new React component following our TypeScript conventions"
"Write a Tauri command that validates user input"
"Add tests for this hook following our testing patterns"
```

### With @workspace
Use `@workspace` in Copilot Chat to ensure it has full context:

```
"@workspace How should I structure a new feature module?"
"@workspace What's the correct pattern for state management here?"
```

## 🔧 Customization

### Adding New Rules

1. **Update copilot-rules.json**
   - Add a new rule object with name, description, patterns, and instructions

2. **Create detailed documentation**
   - Add a new `.md` file in `.github/copilot/`
   - Include examples and anti-patterns

3. **Update this README**
   - Document the new ruleset

### Modifying Existing Rules

1. Edit the relevant `.md` file
2. Update `copilot-rules.json` if patterns change
3. Test suggestions after changes

## 📖 Examples

### Example 1: Creating a New Component

**You type:**
```typescript
export const PhotoCard
```

**Copilot suggests:**
```typescript
export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onSelect }) => {
	return (
		<div className="backdrop-blur-xl bg-white/10 border border-white/20">
			{/* Component content */}
		</div>
	);
};
```

### Example 2: Creating a Tauri Command

**You type:**
```rust
#[command]
fn load_photos
```

**Copilot suggests:**
```rust
#[command]
fn load_photos(path: String) -> Result<Vec<Photo>, String> {
	// Validate path
	if path.contains("..") {
		return Err("Invalid path".to_string());
	}
	
	// Implementation
}
```

### Example 3: Writing Tests

**You type:**
```typescript
describe("PhotoGrid", () => {
	it("should
```

**Copilot suggests:**
```typescript
describe("PhotoGrid", () => {
	it("should render photos in grid layout", () => {
		// Arrange
		const photos = [mockPhoto1, mockPhoto2];
		
		// Act
		render(<PhotoGrid photos={photos} />);
		
		// Assert
		expect(screen.getByRole("grid")).toBeInTheDocument();
	});
});
```

## 🎓 Learning Resources

### Project Documentation
- Main README: `/README.md`
- Architecture docs: `/docs/`
- Copilot instructions: `/.github/copilot-instructions.md`

### External Resources
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [React Documentation](https://react.dev)
- [Tauri Documentation](https://tauri.app)
- [Vitest Documentation](https://vitest.dev)

## 🤝 Contributing

When contributing to this project, Copilot will help you follow conventions automatically. However:

1. **Review suggestions** - Copilot is a tool, not a replacement for thinking
2. **Test your code** - Always run tests after accepting suggestions
3. **Follow the patterns** - If Copilot suggests something different, consider why
4. **Update rules** - If you discover better patterns, update the rulesets

## ⚠️ Important Notes

### What Copilot CAN Do
✅ Suggest code that follows project conventions
✅ Complete boilerplate code quickly
✅ Help with refactoring and code organization
✅ Suggest test cases and edge cases
✅ Provide context-aware completions

### What Copilot CANNOT Do
❌ Replace code reviews
❌ Guarantee bug-free code
❌ Understand complex business logic without context
❌ Make architectural decisions
❌ Replace testing and validation

### Security Reminders
- Never accept suggestions that include hardcoded secrets
- Always validate file paths and user inputs
- Review security-sensitive code carefully
- Follow the security checklist in `security-rules.md`

## 📝 Feedback

If you find:
- Copilot suggesting code that doesn't match our conventions
- Patterns that should be added to the rulesets
- Outdated or incorrect rules

Please open an issue or PR to improve the configuration!

## 🔄 Version History

- **v1.0** (2024-01): Initial ruleset configuration
  - TypeScript/React rules
  - Rust/Tauri rules
  - Testing patterns
  - Security guidelines

---

**Note**: These rules are guidelines for Copilot. They don't enforce code standards automatically. Use ESLint, Prettier, Clippy, and other linters for enforcement.
