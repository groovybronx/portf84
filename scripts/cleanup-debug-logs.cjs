#!/usr/bin/env node

/**
 * Script de nettoyage des logs de débogage
 *
 * Ce script parcourt le codebase et identifie tous les logs de débogage
 * (console.log, console.warn, console.error, console.info, console.debug)
 * et propose de les désactiver automatiquement.
 *
 * Usage: node scripts/cleanup-debug-logs.js [--dry-run] [--fix]
 *   --dry-run : Affiche seulement les logs trouvés sans modifier les fichiers
 *   --fix     : Modifie automatiquement les fichiers pour désactiver les logs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Extensions de fichiers à analyser
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  // Patterns de logs à rechercher
  logPatterns: [
    /console\.log\s*\(/g,
    /console\.warn\s*\(/g,
    /console\.error\s*\(/g,
    /console\.info\s*\(/g,
    /console\.debug\s*\(/g,
    /console\.trace\s*\(/g,
    /console\.time\s*\(/g,
    /console\.timeEnd\s*\(/g,
    /console\.group\s*\(/g,
    /console\.groupEnd\s*\(/g,
  ],
  // Patterns à ignorer (logs légitimes)
  ignorePatterns: [
    /console\.error\s*\(\s*['"`]Error:\s*['"`]/g, // Messages d'erreur explicites
    /console\.log\s*\(\s*['"`]Starting\.\.\.['"`]/g, // Messages de démarrage
    /console\.log\s*\(\s*['"`]Server running on port['"`]/g, // Messages de serveur
  ],
  // Dossiers à ignorer
  ignoreDirs: ['node_modules', '.git', 'dist', 'build', 'coverage'],
};

// Options CLI
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldFix = args.includes('--fix');

if (!isDryRun && !shouldFix) {
  console.log('❌ Spécifiez --dry-run ou --fix');
  console.log('   --dry-run : Affiche les logs sans modifier');
  console.log('   --fix     : Modifie automatiquement les fichiers');
  process.exit(1);
}

// Statistiques
const stats = {
  filesScanned: 0,
  filesWithLogs: 0,
  totalLogs: 0,
  logsByType: {},
  fixedFiles: 0,
};

// Fonction pour vérifier si un fichier doit être analysé
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  if (!config.extensions.includes(ext)) return false;

  const dir = path.dirname(filePath);
  for (const ignoreDir of config.ignoreDirs) {
    if (dir.includes(ignoreDir)) return false;
  }

  return true;
}

// Fonction pour vérifier si un log doit être ignoré
function shouldIgnoreLog(line, pattern) {
  for (const ignorePattern of config.ignorePatterns) {
    if (ignorePattern.test(line)) {
      return true;
    }
  }
  return false;
}

// Fonction pour analyser un fichier
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const logs = [];

    lines.forEach((line, index) => {
      config.logPatterns.forEach((pattern) => {
        const matches = line.match(pattern);
        if (matches && !shouldIgnoreLog(line, pattern)) {
          const logType = pattern.toString().split('(')[0].replace(/[\/g]/g, '');
          logs.push({
            line: index + 1,
            type: logType,
            content: line.trim(),
          });

          // Statistiques
          stats.totalLogs++;
          stats.logsByType[logType] = (stats.logsByType[logType] || 0) + 1;
        }
      });
    });

    if (logs.length > 0) {
      return { filePath, logs };
    }
    return null;
  } catch (error) {
    console.error(`❌ Erreur en lisant ${filePath}:`, error.message);
    return null;
  }
}

// Fonction pour désactiver les logs dans un fichier
function fixFile(filePath, logs) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Modifier les lignes en ordre inverse pour ne pas affecter les indices
    logs
      .sort((a, b) => b.line - a.line)
      .forEach((log) => {
        const lineIndex = log.line - 1;
        const originalLine = lines[lineIndex];

        // Commenter la ligne de log
        lines[lineIndex] = originalLine.replace(/(console\.\w+\s*\()/, '// DEBUG DISABLED: $1');
      });

    // Écrire le fichier modifié
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    stats.fixedFiles++;

    console.log(`✅ ${filePath} - ${logs.length} logs désactivés`);
  } catch (error) {
    console.error(`❌ Erreur en modifiant ${filePath}:`, error.message);
  }
}

// Fonction principale
function main() {
  console.log(`🔍 ${isDryRun ? 'ANALYSE' : 'CORRECTION'} des logs de débogage\n`);

  // Obtenir tous les fichiers TypeScript/JavaScript
  let files = [];
  try {
    const result = execSync(
      'find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\)',
      { encoding: 'utf8' }
    );
    files = result
      .trim()
      .split('\n')
      .filter((f) => f && shouldProcessFile(f));
  } catch (error) {
    console.error('❌ Erreur lors de la recherche des fichiers:', error.message);
    process.exit(1);
  }

  stats.filesScanned = files.length;

  // Analyser chaque fichier
  const filesWithLogs = [];

  files.forEach((filePath) => {
    const result = analyzeFile(filePath);
    if (result) {
      filesWithLogs.push(result);
      stats.filesWithLogs++;
    }
  });

  // Afficher les résultats
  console.log(`📊 Statistiques:`);
  console.log(`   Fichiers scannés: ${stats.filesScanned}`);
  console.log(`   Fichiers avec logs: ${stats.filesWithLogs}`);
  console.log(`   Total de logs: ${stats.totalLogs}\n`);

  if (stats.totalLogs > 0) {
    console.log(`📋 Logs par type:`);
    Object.entries(stats.logsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    console.log();

    // Afficher les détails
    console.log(`🔍 Détails des fichiers avec logs:\n`);

    filesWithLogs.forEach((file) => {
      console.log(`📄 ${file.filePath}:`);
      file.logs.forEach((log) => {
        console.log(`   L${log.line} [${log.type}]: ${log.content}`);
      });
      console.log();
    });

    // Appliquer les corrections si demandé
    if (shouldFix) {
      console.log(`🔧 Application des corrections...\n`);
      filesWithLogs.forEach((file) => {
        fixFile(file.filePath, file.logs);
      });

      console.log(`\n✅ Correction terminée:`);
      console.log(`   Fichiers modifiés: ${stats.fixedFiles}`);
      console.log(`   Logs désactivés: ${stats.totalLogs}`);
    }
  } else {
    console.log(`✅ Aucun log de débogage trouvé !`);
  }

  // Générer un rapport
  const report = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? 'dry-run' : 'fix',
    stats,
    filesWithLogs: filesWithLogs.map((f) => ({
      path: f.filePath,
      logCount: f.logs.length,
      logs: f.logs.map((l) => ({ line: l.line, type: l.type })),
    })),
  };

  const reportPath = `debug-logs-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Rapport généré: ${reportPath}`);
}

// Exécuter le script
main();
