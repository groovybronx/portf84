# GitHub Config Quick Reference

Quick reference for maintaining `.github` configuration files.

## 🚀 Quick Commands

```bash
# Validate configuration
./scripts/maintain-github-config.sh

# Interactive fix mode
./scripts/maintain-github-config.sh --fix

# Show help
./scripts/maintain-github-config.sh --help

# Validate JSON manually
jq . .github/copilot-rules.json
jq . .github/copilot-settings.json
```

## 📁 Key Files

| File | Purpose | Update When |
|------|---------|-------------|
| `copilot-instructions.md` | Main Copilot guide | Conventions change, new patterns |
| `copilot-rules.json` | Pattern-based rules | New file types, rule categories |
| `copilot-settings.json` | Project metadata | Tech stack updates |
| `agents/*.md` | Domain experts | Domain knowledge changes |
| `copilot/*.md` | Detailed rules | Coding standards change |
| `workflows/*.yml` | CI/CD pipelines | Build/test process changes |

## ✅ Quick Update Checklist

Before committing changes to `.github`:

- [ ] Run `./scripts/maintain-github-config.sh`
- [ ] Validate JSON syntax
- [ ] Check cross-references (agents in README, etc.)
- [ ] Test with GitHub Copilot
- [ ] Update related files for consistency
- [ ] Run validation again

## 🔄 Common Tasks

### Add New Agent

```bash
# 1. Create file
touch .github/agents/my-new-agent.md

# 2. Add content (use template from existing agents)
nano .github/agents/my-new-agent.md

# 3. Update README
nano .github/agents/README.md

# 4. Validate
./scripts/maintain-github-config.sh
```

### Update Convention

```bash
# 1. Update main instructions
nano .github/copilot-instructions.md

# 2. Update JSON rules
nano .github/copilot-rules.json

# 3. Update relevant rule file
nano .github/copilot/typescript-react-rules.md

# 4. Validate
./scripts/maintain-github-config.sh
```

### Add New Rule Category

```json
// Add to copilot-rules.json
{
  "name": "my-rule-category",
  "description": "Description of the rule",
  "patterns": ["**/*.ts", "**/*.tsx"],
  "instructions": [
    "Instruction 1",
    "Instruction 2"
  ]
}
```

## 🎯 File Size Guidelines

- Agents: 3,000-8,000 bytes
- Rules: 5,000-10,000 bytes
- Instructions: 10,000-15,000 bytes
- Settings: 2,000-5,000 bytes

Files under 500 bytes are flagged as potentially incomplete.

## 🐛 Common Issues

### JSON Syntax Error
```bash
# Validate JSON
jq . .github/copilot-rules.json

# Pretty-print and save
jq . .github/copilot-rules.json > temp.json && mv temp.json .github/copilot-rules.json
```

### Missing Cross-Reference
- Check if all agents are listed in `agents/README.md`
- Verify rule files are documented in `copilot/README.md`
- Ensure conventions match between instructions and rules

### Copilot Not Following Rules
1. Check file is saved
2. Reload VS Code window
3. Verify JSON syntax is valid
4. Check pattern matching (file paths)
5. Test with `@workspace` in Copilot Chat

## 📊 Validation Output

```
✓ = Check passed
⚠️ = Warning (non-critical)
❌ = Error (needs attention)
```

Exit codes:
- `0` = Success (no errors)
- `1` = Errors found

## 🔗 Full Documentation

See [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) for complete documentation.

## 💡 Tips

- Run validation before committing
- Update related files together
- Test changes with GitHub Copilot
- Keep examples up to date
- Use consistent formatting
- Document reasons for changes

---

**Quick Help**: `./scripts/maintain-github-config.sh --help`
