# 🔧 Troubleshooting - Lumina Portfolio

**Common issues and solutions for Lumina Portfolio**

**Last Update**: January 8, 2026

---

## 📋 Overview

This guide covers common issues, error messages, and solutions for Lumina Portfolio. If you encounter a problem not covered here, please check the [GitHub Issues](https://github.com/groovybronx/portf84/issues) or create a new issue.

---

## 🚀 Installation Issues

### Node.js Version Problems

#### Issue: "Node.js version not supported"
```
error: Unsupported Node.js version. Requires Node.js 18 or higher.
```

**Solutions:**
```bash
# Check current version
node --version

# Install correct version using nvm
nvm install 18
nvm use 18

# Or download from nodejs.org
```

#### Issue: "npm install fails"
```
npm ERR! peer dep missing: @tauri-apps/api@^2.0.0
```

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### Rust Installation Issues

#### Issue: "Rust not found"
```
error: command not found: cargo
```

**Solutions:**
```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Restart terminal and verify
rustc --version
cargo --version
```

#### Issue: "Rust compilation fails"
```
error: failed to compile `tauri-plugin-sql v2.0.0`
```

**Solutions:**
```bash
# Update Rust toolchain
rustup update

# Clean and rebuild
cargo clean
npm run tauri:build
```

### Platform-Specific Issues

#### macOS
##### Issue: "Xcode command line tools not found"
```
error: xcode-select not found
```

**Solution:**
```bash
xcode-select --install
```

##### Issue: "Code signing failed"
```
error: No valid signing identity found
```

**Solutions:**
```bash
# Check available identities
security find-identity -v -p codesigning

# For development, disable signing
# In tauri.conf.json, set "signingIdentity": null
```

#### Windows
##### Issue: "Visual Studio Build Tools not found"
```
error: Microsoft Visual C++ 14.0 is required
```

**Solution:**
1. Download [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. Install "C++ build tools" workload
3. Restart terminal

##### Issue: "Windows Defender blocks application"
```
Windows Defender prevented this app from running
```

**Solution:**
1. Open Windows Security
2. Go to "Virus & threat protection"
3. Click "Manage allowed apps"
4. Add Lumina Portfolio to allowed list

#### Linux
##### Issue: "Missing system libraries"
```
error: libwebkit2gtk-4.0-37: cannot open shared object file
```

**Solution (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install libwebkit2gtk-4.0-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**Solution (Fedora):**
```bash
sudo dnf install webkit2gtk4.0-devel \
  libappindicator-gtk3 \
  librsvg2-devel
```

---

## 🏃‍♂️ Runtime Issues

### Application Startup

#### Issue: "Application fails to start"
```
Error: Failed to start application
```

**Solutions:**
```bash
# Check logs
npm run tauri:dev -- --log-level debug

# Clear cache
rm -rf src-tauri/target

# Rebuild
npm run tauri:build
```

#### Issue: "White screen on startup"
```
Application opens but shows blank white screen
```

**Solutions:**
1. Check browser console for errors
2. Verify API key is configured
3. Check database permissions
4. Try running in debug mode

```bash
# Run with debug tools
npm run tauri:dev
```

### Database Issues

#### Issue: "Database connection failed"
```
Error: Failed to connect to database
```

**Solutions:**
```bash
# Check database file permissions
ls -la lumina.db

# Remove corrupted database
rm lumina.db

# Restart application to recreate database
```

#### Issue: "Database locked"
```
Error: Database is locked
```

**Solutions:**
1. Close all application instances
2. Check for background processes
3. Remove lock file if stuck

```bash
# Find and remove lock file
find . -name "*.db-wal" -delete
find . -name "*.db-shm" -delete
```

### AI Service Issues

#### Issue: "Gemini API key invalid"
```
Error: Invalid API key. Please check your configuration.
```

**Solutions:**
1. Verify API key in Google Cloud Console
2. Check API key is correctly configured
3. Ensure Gemini API is enabled

```typescript
// Check API key configuration
console.log('API Key configured:', !!import.meta.env.VITE_GEMINI_API_KEY);
```

#### Issue: "Rate limit exceeded"
```
Error: Rate limit exceeded. Please try again later.
```

**Solutions:**
1. Wait for rate limit to reset (usually 1 minute)
2. Reduce batch size in settings
3. Implement exponential backoff

```typescript
// Implement retry with backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

---

## 🖼️ Photo Loading Issues

### Image Display

#### Issue: "Photos not loading"
```
Photos appear as broken images or don't display
```

**Solutions:**
1. Check file permissions
2. Verify file formats are supported
3. Check thumbnail generation

```bash
# Check supported formats
jpg jpeg png gif webp bmp tiff
```

#### Issue: "Thumbnails not generating"
```
Error: Failed to generate thumbnail
```

**Solutions:**
1. Check disk space
2. Verify image file integrity
3. Check image processing libraries

```typescript
// Check image processing
const sharp = require('sharp');
try {
  await sharp(imagePath).metadata();
} catch (error) {
  console.error('Image processing error:', error);
}
```

### Performance Issues

#### Issue: "Slow photo loading"
```
Photos take a long time to load or display
```

**Solutions:**
1. Enable image caching
2. Optimize image sizes
3. Use virtualization for large libraries

```typescript
// Enable caching
const imageCache = new Map<string, string>();

const getCachedImage = (path: string) => {
  if (imageCache.has(path)) {
    return imageCache.get(path);
  }

  const image = loadImage(path);
  imageCache.set(path, image);
  return image;
};
```

#### Issue: "High memory usage"
```
Application uses excessive memory when viewing photos
```

**Solutions:**
1. Implement lazy loading
2. Limit concurrent image loading
3. Clear unused image data

```typescript
// Implement lazy loading
const LazyImage = ({ src, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting)
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return inView ? <img src={src} {...props} /> : <div />;
};
```

---

## 🏷️ Tag System Issues

### Tag Management

#### Issue: "Tags not saving"
```
Created tags disappear when application restarts
```

**Solutions:**
1. Check database write permissions
2. Verify tag creation logic
3. Check for database corruption

```typescript
// Debug tag creation
const createTag = async (name: string) => {
  try {
    const tag = await tagService.getOrCreateTag(name);
    console.log('Tag created:', tag);
    return tag;
  } catch (error) {
    console.error('Tag creation failed:', error);
    throw error;
  }
};
```

#### Issue: "Duplicate tags not merging"
```
Similar tags are not detected as duplicates
```

**Solutions:**
1. Check similarity thresholds
2. Verify analysis cache
3. Update tag fusion settings

```typescript
// Check similarity settings
const settings = getTagSettings();
console.log('Similarity thresholds:', settings);
```

### Search Issues

#### Issue: "Search not working"
```
Search returns no results for existing items
```

**Solutions:**
1. Rebuild search index
2. Check search filters
3. Verify search query format

```typescript
// Rebuild search index
const rebuildSearchIndex = async () => {
  await searchService.buildIndex();
  console.log('Search index rebuilt');
};
```

---

## 🎨 UI/UX Issues

### Interface Problems

#### Issue: "UI elements not responsive"
```
Interface doesn't adapt to window size changes
```

**Solutions:**
1. Check Tailwind responsive classes
2. Verify CSS media queries
3. Test different screen sizes

```css
/* Check responsive breakpoints */
@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

#### Issue: "Animations not working"
```
UI animations are choppy or don't play
```

**Solutions:**
1. Check Framer Motion installation
2. Verify animation settings
3. Check performance settings

```typescript
// Check animation preferences
const animationsEnabled = getSetting('animations.enabled');
console.log('Animations enabled:', animationsEnabled);
```

### Accessibility Issues

#### Issue: "Keyboard navigation not working"
```
Cannot navigate interface with keyboard
```

**Solutions:**
1. Check focus management
2. Verify ARIA labels
3. Test with screen reader

```typescript
// Check focus management
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Tab':
      console.log('Tab pressed');
      break;
    case 'Enter':
      console.log('Enter pressed');
      break;
  }
};
```

---

## 🔧 Development Issues

### Build Problems

#### Issue: "TypeScript compilation errors"
```
tsc: Cannot find module '@/components/Button'
```

**Solutions:**
1. Check TypeScript configuration
2. Verify path aliases
3. Check import statements

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/shared/components/*"]
    }
  }
}
```

#### Issue: "Vite build fails"
```
Error: Rollup build failed
```

**Solutions:**
1. Check for circular dependencies
2. Verify import statements
3. Check build configuration

```bash
# Check for circular dependencies
npm run build -- --mode development
```

### Testing Issues

#### Issue: "Tests failing"
```
Test suite: 0 passing, 5 failing
```

**Solutions:**
1. Check test configuration
2. Verify mock implementations
3. Update test expectations

```typescript
// Check test configuration
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts']
  }
});
```

---

## 🌐 Network Issues

### API Connectivity

#### Issue: "Cannot connect to Gemini API"
```
NetworkError: Failed to fetch
```

**Solutions:**
1. Check internet connection
2. Verify API endpoint
3. Check firewall settings

```typescript
// Test connectivity
const testConnectivity = async () => {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com');
    console.log('Network OK:', response.status);
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

#### Issue: "CORS errors"
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solutions:**
1. Check API configuration
2. Verify Tauri security settings
3. Update CSP headers

```json
// tauri.conf.json
{
  "security": {
    "csp": "default-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com'"
  }
}
```

---

## 📊 Performance Issues

### Memory Management

#### Issue: "Memory usage increases over time"
```
Application memory usage grows continuously
```

**Solutions:**
1. Check for memory leaks
2. Implement proper cleanup
3. Monitor object disposal

```typescript
// Check for memory leaks
const checkMemoryLeaks = () => {
  if (performance.memory) {
    console.log('Memory usage:', {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    });
  }
};
```

### CPU Usage

#### Issue: "High CPU usage"
```
Application uses 100% CPU when idle
```

**Solutions:**
1. Check for infinite loops
2. Optimize expensive operations
3. Implement debouncing

```typescript
// Implement debouncing
const debouncedSearch = debounce((query: string) => {
  performSearch(query);
}, 300);
```

---

## 🔍 Debugging Tools

### Browser DevTools

#### Opening DevTools
```bash
# In development mode
npm run tauri:dev

# Press F12 or right-click → Inspect
```

#### Console Commands
```javascript
// Check application state
console.log('Library state:', libraryState);
console.log('Tag state:', tagState);
console.log('Settings:', settings);

// Check performance
console.time('operation');
// ... perform operation
console.timeEnd('operation');

// Check memory
console.log('Memory:', performance.memory);
```

### Tauri Debug Tools

#### Enabling Debug Mode
```typescript
// src-tauri/src/main.rs
#[cfg(debug_assertions)]
tauri::Builder::default()
    .plugin(tauri_plugin_devtools::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

#### Rust Logging
```rust
// src-tauri/src/main.rs
use log::info;

fn main() {
    env_logger::init();
    info!("Starting Lumina Portfolio");
}
```

---

## 📞 Getting Help

### Support Channels

#### Official Support
- **GitHub Issues**: [Report bugs](https://github.com/groovybronx/portf84/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/groovybronx/portf84/discussions)
- **Documentation**: [Check guides](./README.md)

#### Community Support
- **Discord**: Join our Discord server
- **Reddit**: r/LuminaPortfolio
- **Stack Overflow**: Use tags `lumina-portfolio` and `tauri`

### Creating Good Bug Reports

#### Information to Include
1. **Operating System** and version
2. **Application Version**
3. **Steps to reproduce**
4. **Expected vs Actual behavior**
5. **Error messages** or screenshots
6. **Console logs** if applicable

#### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Environment
- OS: [e.g. macOS 13.0, Windows 11, Ubuntu 22.04]
- Version: [e.g. v0.3.0-beta.1]
- Browser: [if applicable]

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Console Logs
```
Paste relevant console logs here
```
```

---

## 🔮 Future Improvements

### Planned Troubleshooting Features

#### Diagnostic Tool
```typescript
interface DiagnosticReport {
  systemInfo: SystemInfo;
  applicationState: ApplicationState;
  errors: ErrorReport[];
  performance: PerformanceMetrics;
}

const runDiagnostics = async (): Promise<DiagnosticReport> => {
  return {
    systemInfo: await getSystemInfo(),
    applicationState: getApplicationState(),
    errors: getRecentErrors(),
    performance: getPerformanceMetrics()
  };
};
```

#### Self-Healing
```typescript
const attemptSelfHealing = async (error: Error): Promise<boolean> => {
  switch (error.name) {
    case 'DatabaseError':
      return await repairDatabase();
    case 'CacheError':
      return await clearCache();
    case 'NetworkError':
      return await retryWithBackoff();
    default:
      return false;
  }
};
```

---

## 📚 Related Documentation

- **[User Guide](./USER_GUIDE.md)** - End-user documentation
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Development workflow
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation
- **[Contributing](./CONTRIBUTING.md)** - Contribution guidelines

---

## 🆘 Emergency Procedures

### Application Corruption

#### Reset Application
```bash
# Backup current data
cp lumina.db lumina.db.backup

# Reset to defaults
rm -rf src-tauri/target
rm lumina.db

# Restart application
npm run tauri:dev
```

#### Data Recovery
```bash
# Check backup files
ls -la *.backup

# Restore from backup
cp lumina.db.backup lumina.db
```

---

<div align="center">

**Troubleshooting Documentation** - Solutions for common issues 🔧✨

[🏠 Back to Documentation](./README.md) | [💻 Developer Guide](./DEVELOPER_GUIDE.md) | [🤝 Contributing](./CONTRIBUTING.md)

</div>
