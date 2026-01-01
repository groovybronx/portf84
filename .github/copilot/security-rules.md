# Security Ruleset

## API Keys and Secrets Management

### Environment Variables
Always use environment variables for sensitive data:

```typescript
// ✅ Good: Use environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
	throw new Error("API key is required");
}
```

```typescript
// ❌ Bad: Hardcoded API key
const apiKey = "AIzaSyD..."; // NEVER DO THIS
```

### .env Files
- Always add `.env` files to `.gitignore`
- Provide `.env.example` with dummy values
- Never commit real API keys or secrets

```bash
# .env.example
VITE_GEMINI_API_KEY=your_api_key_here
VITE_API_URL=https://api.example.com
```

## Input Validation

### Frontend Validation
Always validate and sanitize user inputs:

```typescript
const validatePhotoPath = (path: string): boolean => {
	// Prevent directory traversal
	if (path.includes("..") || path.includes("~")) {
		throw new Error("Invalid path");
	}
	
	// Validate file extension
	const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
	const ext = path.toLowerCase().slice(path.lastIndexOf("."));
	
	if (!validExtensions.includes(ext)) {
		throw new Error("Invalid file type");
	}
	
	return true;
};
```

### Backend Validation
Always validate inputs from the frontend in Rust commands:

```rust
#[command]
fn load_file(path: String) -> Result<Vec<u8>, String> {
    // Validate path
    if path.contains("..") || path.contains("~") {
        return Err("Invalid path".to_string());
    }
    
    // Check file extension
    if !path.ends_with(".jpg") && !path.ends_with(".png") {
        return Err("Invalid file type".to_string());
    }
    
    // Use canonicalize to resolve path safely
    let canonical_path = std::fs::canonicalize(&path)
        .map_err(|e| format!("Invalid path: {}", e))?;
    
    std::fs::read(canonical_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}
```

## SQL Injection Prevention

### Always Use Prepared Statements
```typescript
// ✅ Good: Prepared statement
const photos = await db.select(
	"SELECT * FROM photos WHERE folder_id = ?",
	[folderId]
);
```

```typescript
// ❌ Bad: String concatenation
const query = `SELECT * FROM photos WHERE folder_id = '${folderId}'`;
const photos = await db.select(query);
```

### Parameterized Queries in Rust
```rust
// ✅ Good: Parameterized query
sqlx::query!(
    "SELECT * FROM photos WHERE folder_id = ?",
    folder_id
)
.fetch_all(&db.pool)
.await?;
```

```rust
// ❌ Bad: String interpolation
let query = format!("SELECT * FROM photos WHERE folder_id = '{}'", folder_id);
sqlx::query(&query).fetch_all(&db.pool).await?;
```

## XSS Prevention

### Sanitize User-Generated Content
```typescript
import { escapeHtml } from "@/shared/utils/security";

const DisplayUserInput: React.FC<{ input: string }> = ({ input }) => {
	// Sanitize before displaying
	const safeInput = escapeHtml(input);
	
	return <div>{safeInput}</div>;
};
```

### Content Security Policy (CSP)
Configure CSP in Tauri:

```json
// src-tauri/tauri.conf.json
{
	"security": {
		"csp": {
			"default-src": "'self'",
			"script-src": "'self' 'wasm-unsafe-eval'",
			"style-src": "'self' 'unsafe-inline'",
			"img-src": "'self' data: asset: https:",
			"connect-src": "'self' https://generativelanguage.googleapis.com"
		}
	}
}
```

## Authentication & Authorization

### API Request Signing
```typescript
const makeAuthenticatedRequest = async (endpoint: string, data: unknown) => {
	const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
	
	if (!apiKey) {
		throw new Error("API key not configured");
	}
	
	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${apiKey}`,
		},
		body: JSON.stringify(data),
	});
	
	if (!response.ok) {
		throw new Error(`Request failed: ${response.status}`);
	}
	
	return response.json();
};
```

## File System Security

### Path Validation
```rust
use std::path::{Path, PathBuf};

fn validate_path(path: &str, base_dir: &Path) -> Result<PathBuf, String> {
    let path = Path::new(path);
    
    // Canonicalize to resolve .. and symlinks
    let canonical = path.canonicalize()
        .map_err(|e| format!("Invalid path: {}", e))?;
    
    // Ensure path is within allowed directory
    if !canonical.starts_with(base_dir) {
        return Err("Path outside allowed directory".to_string());
    }
    
    Ok(canonical)
}
```

### Tauri Capability Configuration
```json
// src-tauri/capabilities/default.json
{
	"identifier": "default",
	"permissions": [
		"core:default",
		"fs:allow-read-file",
		"fs:allow-write-file",
		"dialog:allow-open",
		"sql:allow-execute"
	]
}
```

## Secure Data Storage

### Database Encryption
```rust
// Enable SQLite encryption at rest
sqlx::sqlite::SqliteConnectOptions::new()
    .filename("database.db")
    .pragma("key", "encryption_key")
    .create_if_missing(true)
```

### Sensitive Data Handling
```typescript
// Clear sensitive data after use
const processApiKey = (apiKey: string) => {
	// Use the key
	const result = makeRequest(apiKey);
	
	// Clear from memory (TypeScript limitation, but shows intent)
	apiKey = "";
	
	return result;
};
```

## Error Handling Security

### Don't Expose Internal Details
```rust
// ❌ Bad: Exposes internal error details
#[command]
fn bad_error_handling(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path)
        .map_err(|e| e.to_string()) // Exposes system paths, etc.
}

// ✅ Good: Generic error message
#[command]
fn good_error_handling(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path)
        .map_err(|_| "Failed to read file".to_string())
}
```

### Safe Logging
```typescript
// ❌ Bad: Logs sensitive data
console.log("API Key:", apiKey);

// ✅ Good: Log without sensitive data
console.log("API request initiated");
```

## Dependency Security

### Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Rust dependencies
cargo update
cargo audit
```

### Pin Critical Dependencies
```json
// package.json
{
	"dependencies": {
		"@tauri-apps/api": "2.9.1",  // Exact version
		"react": "^19.2.3"            // Allow minor updates
	}
}
```

## Rate Limiting

### API Rate Limiting
```typescript
class RateLimiter {
	private requests: number[] = [];
	private readonly maxRequests: number;
	private readonly timeWindow: number;
	
	constructor(maxRequests: number, timeWindowMs: number) {
		this.maxRequests = maxRequests;
		this.timeWindow = timeWindowMs;
	}
	
	async throttle(): Promise<void> {
		const now = Date.now();
		
		// Remove old requests outside time window
		this.requests = this.requests.filter(
			time => now - time < this.timeWindow
		);
		
		if (this.requests.length >= this.maxRequests) {
			const oldestRequest = this.requests[0]!;
			const waitTime = this.timeWindow - (now - oldestRequest);
			await new Promise(resolve => setTimeout(resolve, waitTime));
			return this.throttle();
		}
		
		this.requests.push(now);
	}
}

// Usage
const limiter = new RateLimiter(10, 60000); // 10 requests per minute

const makeApiCall = async () => {
	await limiter.throttle();
	return fetch("https://api.example.com/endpoint");
};
```

## Security Checklist

Before deploying or merging code, verify:

- [ ] No hardcoded API keys or secrets
- [ ] All user inputs are validated
- [ ] SQL queries use prepared statements
- [ ] File paths are validated and sanitized
- [ ] CSP is properly configured
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up to date
- [ ] Tauri capabilities follow least privilege principle
- [ ] Sensitive data is encrypted at rest
- [ ] API rate limiting is implemented
- [ ] Authentication is properly implemented
- [ ] HTTPS is used for all external requests

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Tauri Security Best Practices](https://tauri.app/v1/guides/building/security/)
- [React Security](https://react.dev/learn/security)
- [Rust Security Advisory Database](https://rustsec.org/)
