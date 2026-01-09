# GitHub Configuration Maintenance Guide

This guide explains how to maintain and update the GitHub configuration files in the `.github` directory.

## 📁 Configuration Structure

```
.github/
├── agents/                      # GitHub Copilot agents (domain experts)
│   ├── README.md               # Agent documentation
│   ├── project-architecture.md # Architecture expert
│   ├── react-frontend.md       # React/TypeScript expert
│   ├── tauri-rust-backend.md   # Rust/Tauri expert
│   ├── database-sqlite.md      # Database expert
│   ├── ai-gemini-integration.md # AI integration expert
│   └── testing-vitest.md       # Testing expert
│
├── copilot/                    # GitHub Copilot rules documentation
│   ├── README.md               # Rules documentation
│   ├── typescript-react-rules.md
│   ├── rust-tauri-rules.md
│   ├── testing-rules.md
│   ├── security-rules.md
│   ├── EXAMPLES.md
│   └── VALIDATION.md
│
├── workflows/                  # GitHub Actions workflows
│   ├── ci.yml                 # Continuous integration
│   ├── release-macos.yml      # Release automation
│   └── github-config-check.yml # Config validation
│
├── ISSUE_TEMPLATE/            # Issue templates
│   ├── bug_report.md
│   └── feature_request.md
│
├── copilot-instructions.md    # Main Copilot instructions
├── copilot-rules.json         # JSON-based rule configuration
├── copilot-settings.json      # Copilot settings
├── CODEOWNERS                 # Code ownership
├── PULL_REQUEST_TEMPLATE.md   # PR template
├── BRANCH_PROTECTION_GUIDE.md
└── SIGNED_COMMITS_GUIDE.md
```

## 🔧 Maintenance Script

The `scripts/maintain-github-config.sh` script helps validate and maintain the configuration.

### Running the Validation

```bash
# Check configuration health
./scripts/maintain-github-config.sh

# Or explicitly use check mode
./scripts/maintain-github-config.sh --check
```

### Interactive Fix Mode

```bash
# Run in fix mode for interactive repairs
./scripts/maintain-github-config.sh --fix
```

### What Gets Checked

The maintenance script validates:

1. **Core Configuration Files**
   - ✅ `copilot-instructions.md` exists and has content
   - ✅ `copilot-rules.json` valid JSON syntax and structure
   - ✅ `copilot-settings.json` valid JSON syntax

2. **Agents Directory**
   - ✅ Directory exists and contains agent files
   - ✅ Each agent file has adequate content (>500 bytes)
   - ✅ `agents/README.md` exists and documents all agents

3. **Copilot Rules Directory**
   - ✅ Directory exists and contains rule files
   - ✅ Each rule file has adequate content
   - ✅ `copilot/README.md` exists

4. **Workflows Directory**
   - ✅ Directory exists and contains workflow files
   - ✅ Basic YAML syntax validation

5. **Additional Configuration**
   - ✅ CODEOWNERS file exists
   - ✅ PULL_REQUEST_TEMPLATE.md exists
   - ✅ ISSUE_TEMPLATE directory and templates exist

6. **Consistency Checks**
   - ✅ TypeScript/Rust conventions match between files
   - ✅ All agents are documented in README
   - ✅ Rules are properly cross-referenced

## 📝 Update Procedures

### When to Update Configuration

Update the GitHub configuration when:

- ✨ **New Features**: Major features are added to the project
- 🔄 **Architecture Changes**: Project structure or patterns change
- 📚 **Convention Updates**: New coding conventions are adopted
- 🔒 **Security Updates**: New security practices are implemented
- 📦 **Dependency Updates**: Major dependencies are upgraded (React, Tauri, etc.)
- 🐛 **Bug Fixes**: Correcting outdated or incorrect information

### Update Checklist

When updating configuration files:

- [ ] Run validation script before changes: `./scripts/maintain-github-config.sh`
- [ ] Update relevant files in `.github/`
- [ ] Ensure consistency across related files:
  - [ ] `copilot-instructions.md` ↔ `copilot-rules.json`
  - [ ] Agent files ↔ `agents/README.md`
  - [ ] Rule files ↔ `copilot/README.md`
- [ ] Validate JSON syntax for `.json` files
- [ ] Update documentation and examples
- [ ] Run validation script after changes
- [ ] Test with GitHub Copilot to verify effectiveness
- [ ] Commit changes with descriptive message

## 🤖 Automated Checks

The repository includes a GitHub Actions workflow (`github-config-check.yml`) that automatically validates configuration on:

- Pushes to `main` or `develop` branches
- Pull requests that modify `.github/` files
- Manual workflow dispatch

The workflow:
1. Checks out the repository
2. Installs required dependencies (jq)
3. Runs the validation script
4. Reports results in the Actions log

## 📚 Configuration File Guidelines

### copilot-instructions.md

**Purpose**: Comprehensive instructions for GitHub Copilot  
**Format**: Markdown  
**Length**: ~10,000-15,000 bytes

**Sections to include**:
- Project overview and tech stack
- Language-specific guidelines (TypeScript/React, Rust/Tauri)
- Styling conventions (Tailwind CSS)
- Testing patterns
- Architecture patterns
- Security guidelines
- Performance considerations
- Common patterns and examples

**Update when**:
- Project technology changes
- New architectural patterns emerge
- Convention changes are adopted

### copilot-rules.json

**Purpose**: JSON-based ruleset for pattern matching  
**Format**: JSON (must be valid)  
**Structure**:
```json
{
  "$schema": "https://json.schemastore.org/copilot-rules.json",
  "version": "1.0",
  "rules": [
    {
      "name": "rule-name",
      "description": "What this rule does",
      "patterns": ["**/*.ts", "**/*.tsx"],
      "instructions": [
        "Instruction 1",
        "Instruction 2"
      ]
    }
  ]
}
```

**Update when**:
- Adding new file patterns
- Defining new rule categories
- Changing pattern-specific instructions

### copilot-settings.json

**Purpose**: Project metadata and settings  
**Format**: JSON (must be valid)

**Key sections**:
- `project`: Project info and tech stack
- `conventions`: Code style conventions
- `file_patterns`: Pattern definitions
- `key_concepts`: Important concepts
- `common_patterns`: Code templates

**Update when**:
- Project metadata changes
- Tech stack is updated
- Conventions are modified

### Agent Files (.github/agents/*.md)

**Purpose**: Domain-specific expert agents for GitHub Copilot  
**Format**: Markdown  
**Typical length**: 3,000-8,000 bytes

**Template structure**:
```markdown
# [Agent Name] Agent

## Expertise
- Area 1
- Area 2

## When to Use This Agent
- Scenario 1
- Scenario 2

## Core Responsibilities
Detailed description...

## Key Patterns
Pattern examples...

## Best Practices
Guidelines...

## Examples
Code examples...

## Common Issues
Troubleshooting...
```

**Update when**:
- Domain expertise changes
- New patterns emerge in that domain
- Best practices are updated

### Rule Files (.github/copilot/*.md)

**Purpose**: Detailed documentation of coding rules  
**Format**: Markdown  
**Typical length**: 5,000-10,000 bytes

**Structure**:
- Overview of the rule category
- Specific guidelines and conventions
- Code examples (good and bad)
- Anti-patterns to avoid
- Testing considerations

**Update when**:
- Coding standards change
- New patterns are adopted
- Common mistakes are identified

## 🔄 Version Control Best Practices

### Branch Strategy

When updating configuration:

1. Create a feature branch: `feature/update-copilot-config`
2. Make changes incrementally
3. Run validation after each change
4. Commit with clear messages
5. Create a Pull Request
6. Let CI validate the changes
7. Merge to develop, then main

### Commit Message Format

```
<type>: <description>

<detailed explanation if needed>
```

**Types**:
- `docs:` - Documentation updates
- `feat:` - New agent or rule
- `fix:` - Fix incorrect information
- `refactor:` - Reorganize without changing content
- `chore:` - Maintenance tasks

**Examples**:
```
docs: Update TypeScript conventions in copilot-instructions.md

Add guidelines for React 19 features and update imports section
to reflect new path alias configuration.
```

```
feat: Add performance optimization agent

Created new agent focused on React performance patterns,
including memoization, virtualization, and lazy loading.
```

## 🧪 Testing Configuration Changes

### Manual Testing

After updating configuration:

1. **Test with GitHub Copilot**
   - Open relevant files in VS Code
   - Invoke Copilot suggestions
   - Verify suggestions follow new guidelines
   - Test with Copilot Chat (@workspace)

2. **Validate JSON Files**
   ```bash
   jq . .github/copilot-rules.json
   jq . .github/copilot-settings.json
   ```

3. **Check Markdown Formatting**
   - Use a Markdown linter
   - Verify links work
   - Check code blocks syntax

4. **Run Maintenance Script**
   ```bash
   ./scripts/maintain-github-config.sh
   ```

### Automated Testing

The CI pipeline automatically:
- Validates JSON syntax
- Checks file existence
- Verifies structure
- Runs consistency checks

## 🎯 Common Maintenance Tasks

### Adding a New Agent

1. Create new file in `.github/agents/`
2. Use existing agents as templates
3. Add comprehensive content (aim for 3,000+ bytes)
4. Update `.github/agents/README.md`
5. Reference in `copilot-instructions.md` if appropriate
6. Run validation script
7. Test with GitHub Copilot

### Adding a New Rule

1. Decide if it goes in `copilot-rules.json` or a markdown file
2. For JSON: Add to rules array with proper structure
3. For markdown: Create new file in `.github/copilot/`
4. Update `copilot/README.md`
5. Add examples of the rule in action
6. Run validation script
7. Test with GitHub Copilot

### Updating Conventions

1. Update `copilot-instructions.md`
2. Update corresponding section in `copilot-rules.json`
3. Update relevant rule files in `.github/copilot/`
4. Update `copilot-settings.json` if needed
5. Ensure consistency across all files
6. Run validation script
7. Update code examples in documentation

### Deprecating Old Patterns

1. Identify outdated patterns across all config files
2. Update or remove from `copilot-instructions.md`
3. Update `copilot-rules.json`
4. Update relevant agent files
5. Add migration notes in CHANGELOG or PR description
6. Run validation script

## 📊 Monitoring Configuration Health

### Regular Checks

Run the maintenance script:
- **Weekly**: During active development
- **Before releases**: Always validate before release
- **After major changes**: After tech stack updates
- **Monthly**: During maintenance periods

### Health Indicators

**Healthy configuration**:
- ✅ All validation checks pass
- ✅ No warnings
- ✅ All files > 500 bytes (adequate content)
- ✅ JSON files parse correctly
- ✅ All cross-references valid
- ✅ Copilot provides relevant suggestions

**Needs attention**:
- ⚠️ Warnings in validation
- ⚠️ Small file sizes (possibly incomplete)
- ⚠️ Missing cross-references
- ⚠️ Copilot suggestions don't follow conventions

**Critical issues**:
- ❌ Validation errors
- ❌ Invalid JSON syntax
- ❌ Missing required files
- ❌ Copilot provides incorrect suggestions

## 🤝 Contributing to Configuration

When contributing to GitHub configuration:

1. **Understand the purpose** of each file
2. **Follow existing structure** and formatting
3. **Be specific** - vague guidelines aren't helpful
4. **Include examples** - show, don't just tell
5. **Test thoroughly** - verify with GitHub Copilot
6. **Document changes** - explain why, not just what
7. **Maintain consistency** - update all related files
8. **Run validation** - ensure health before committing

## 📞 Support

If you encounter issues:

1. Run `./scripts/maintain-github-config.sh` for diagnostics
2. Check the error messages and warnings
3. Review this documentation
4. Check if JSON syntax is valid
5. Verify file paths and references
6. Open an issue with validation output

## 🔗 Related Documentation

- [Scripts README](../scripts/README.md) - All maintenance scripts
- [Architecture Guide](../docs/guides/architecture/ARCHITECTURE.md) - System architecture
- [Contributing Guide](../README.md) - How to contribute
- [GitHub Copilot Docs](https://docs.github.com/en/copilot) - Official Copilot documentation

---

**Last Updated**: 2026-01-01  
**Maintained By**: Repository maintainers  
**Script Version**: 1.0
