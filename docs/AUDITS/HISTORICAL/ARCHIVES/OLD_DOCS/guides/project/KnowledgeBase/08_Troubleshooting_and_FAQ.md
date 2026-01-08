# Troubleshooting & FAQ

## Common Issues

### 1. "Missing Gemini API Key" Error
**Symptom**: AI analysis fails immediately.
**Cause**: The application cannot find an API key in `localStorage` or environment variables.
**Solution**:
1.  Go to Settings (Gear icon).
2.  Paste your Google Gemini API Key.
3.  Save.
4.  If developing, ensure `.env.local` has `VITE_GEMINI_API_KEY=...`.

### 2. Images Not Loading (Broken Icon)
**Symptom**: Photo grid shows placeholders.
**Cause**: The **Asset Protocol** path is incorrect or permissions are denied.
**Solution**:
1.  Check the console for `404 (Not Found)` on `asset://` URLs.
2.  Verify `src-tauri/capabilities/default.json` allows read access to the folder path.
3.  Ensure the path does not contain special characters that might break URL encoding (though `convertFileSrc` should handle this).

### 3. Database Locked / Initialization Failed
**Symptom**: App hangs on startup or logs "Schema initialization failed".
**Cause**: Multiple instances of the app running or a zombie process holding the lock.
**Solution**:
1.  Kill all `lumina-portfolio` processes.
2.  Kill `tauri-driver` if running tests.
3.  Delete `lumina.db` in the App Data folder to force a reset (Warning: Data Loss).
    -   macOS: `~/Library/Application Support/com.portf84.lumina/`
    -   Windows: `%APPDATA%\com.portf84.lumina\`

### 4. "Shadow Folder" not updating
**Symptom**: You added a file to the physical folder, but it's not in the app.
**Cause**: The app does not currently watch the file system for real-time changes (Polling/Watchers not yet implemented in v0.1).
**Solution**:
-   Re-open the folder or trigger a "Refresh" action (if implemented) to re-scan the directory.

## FAQ

**Q: Where are my photos stored?**
A: Your photos remain exactly where they are on your hard drive. Lumina does not copy or move them unless you explicitly use a "Move" command.

**Q: Can I use this on multiple computers?**
A: Currently, no. The database (`lumina.db`) is local to the machine. Syncing features are planned for future versions.

**Q: Is the AI analysis free?**
A: It depends on your Google Gemini API quota. The "Flash" models usually have a generous free tier, but check Google's pricing.

**Q: Why does the app request Network Access?**
A: Only to communicate with Google's AI servers. No other data is transmitted.
