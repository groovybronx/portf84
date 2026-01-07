# 🤖 Guide de l'Agent RAG de Documentation

## 📚 Introduction

L'agent RAG (Retrieval-Augmented Generation) de documentation est un système intelligent qui permet à GitHub Copilot d'accéder et d'utiliser la documentation complète du projet Lumina Portfolio comme base de connaissance.

### Qu'est-ce que RAG ?

RAG combine deux approches :
- **Retrieval** : Recherche intelligente dans la documentation indexée
- **Augmented Generation** : Génération de réponses enrichies avec citations précises

### Pourquoi un Agent RAG ?

- **Mémoire Persistante** : Accès permanent à 100+ documents de documentation
- **Réponses Précises** : Citations avec chemins de fichiers exacts
- **Recherche Intelligente** : Hybride lexicale (40%) + sémantique (60%)
- **Suggestions Proactives** : Documents liés et lectures complémentaires
- **Toujours à Jour** : Index reconstruit automatiquement

---

## 🎯 Utilisation

### Requêtes Simples

Pour poser une question à l'agent RAG dans GitHub Copilot Chat :

```
@documentation-rag-agent Comment fonctionne le système de tags ?
```

L'agent va :
1. Analyser votre question
2. Rechercher dans l'index de documentation
3. Retourner une réponse avec citations et sources

### Exemples de Requêtes

#### Question Architecturale
```
@documentation-rag-agent Quelle est l'architecture du système de collections ?
```

#### Guide d'Implémentation
```
@documentation-rag-agent Comment intégrer l'API Gemini pour l'analyse AI ?
```

#### Configuration
```
@documentation-rag-agent Quelles sont les permissions Tauri nécessaires ?
```

#### Historique et Décisions
```
@documentation-rag-agent Pourquoi utiliser SQLite au lieu d'IndexedDB ?
```

#### Bonnes Pratiques
```
@documentation-rag-agent Quelles sont les conventions de code React dans ce projet ?
```

---

## 🔍 Recherche Avancée

### Recherche Ciblée

Rechercher un terme spécifique dans un dossier particulier :

```
@documentation-rag-agent search:"Gemini API" in:guides/features
```

### Documents Liés

Trouver des documents liés à un fichier spécifique :

```
@documentation-rag-agent related:"docs/guides/architecture/TAG_SYSTEM_ARCHITECTURE.md"
```

### Suggestions par Sujet

Obtenir des suggestions de documentation sur un sujet :

```
@documentation-rag-agent suggest:"AI integration"
```

### Statistiques de l'Index

Voir les statistiques de l'index de documentation :

```
@documentation-rag-agent stats
```

---

## 📊 Commandes Spéciales

### Liste des Commandes

| Commande | Syntaxe | Description |
|----------|---------|-------------|
| **Recherche simple** | `@documentation-rag-agent [question]` | Question en langage naturel |
| **Recherche ciblée** | `@documentation-rag-agent search:"terme" in:dossier` | Recherche dans un dossier spécifique |
| **Suggestions** | `@documentation-rag-agent suggest:"sujet"` | Suggestions de documentation |
| **Documents liés** | `@documentation-rag-agent related:"chemin/fichier.md"` | Documents connexes |
| **Statistiques** | `@documentation-rag-agent stats` | Stats de l'index |
| **Rebuild** | `@documentation-rag-agent rebuild-index` | Reconstruction manuelle |

### Format de Réponse

Toutes les réponses de l'agent incluent :

```markdown
## 🎯 Réponse
[Réponse synthétisée]

### 📚 Sources
1. **[Titre du Document]** (`docs/chemin/fichier.md`)
   - Section: [Nom de la section]
   - Priorité: [Critical/High/Normal]
   - Extrait: "[citation]"

### 🔗 Documentation Liée
- [Doc suggéré 1]
- [Doc suggéré 2]

### 📊 Métadonnées
- Documents consultés: X
- Score de confiance: Y%
```

---

## 🔧 Maintenance

### Reconstruction de l'Index

#### Automatique

L'index est reconstruit automatiquement :
- À chaque push de fichiers `docs/**/*.md`
- Sur les pull requests touchant la documentation
- Quotidiennement à 2h UTC (cron)

#### Manuelle - Via GitHub Actions

1. Aller sur l'onglet **Actions** dans GitHub
2. Sélectionner le workflow **Build Documentation Index**
3. Cliquer sur **Run workflow**
4. Sélectionner la branche et cliquer sur **Run workflow**

#### Manuelle - En Local

```bash
# Construire l'index
npm run rag:build

# Ou directement avec Python
python scripts/rag/build_doc_index.py
```

### Tester le Système

```bash
# Exécuter tous les tests
npm run rag:test

# Tester une recherche
npm run rag:search "votre requête"
```

### Vérifier l'Index

```bash
# Voir les statistiques
python -c "
import json
with open('docs/.doc-metadata.json') as f:
    metadata = json.load(f)['metadata']
print(f'Documents: {metadata[\"total_documents\"]}')
print(f'Sections: {metadata[\"total_sections\"]}')
print(f'Mots: {metadata[\"total_words\"]:,}')
"
```

---

## 📈 Consulter les Statistiques

### Métadonnées de l'Index

Le fichier `docs/.doc-metadata.json` contient :

- **Version** : Version de l'index
- **Date de génération** : Timestamp de la dernière construction
- **Total documents** : Nombre de fichiers indexés
- **Breakdown par priorité** : Critical, High, Normal, Archive
- **Total sections** : Nombre de sections markdown
- **Total mots** : Nombre total de mots indexés
- **Top keywords** : 100 mots-clés les plus fréquents

### Exemple de Statistiques

```json
{
  "metadata": {
    "version": "1.0.0",
    "generated": "2026-01-07T16:00:00Z",
    "total_documents": 113,
    "total_sections": 856,
    "total_words": 125430,
    "priority_breakdown": {
      "critical": 5,
      "high": 23,
      "normal": 75,
      "archive": 10
    },
    "top_keywords": ["architecture", "tags", "gemini", ...]
  }
}
```

---

## 🐛 Troubleshooting

### Problème : Index Manquant

**Symptôme** : Erreur `Index not found at docs/.doc-index.json`

**Solutions** :
1. Exécuter `npm run rag:build` pour construire l'index
2. Vérifier que le script Python s'exécute sans erreur
3. Vérifier les permissions du dossier `docs/`

### Problème : Pas de Résultats

**Symptôme** : La recherche ne retourne aucun résultat

**Solutions** :
1. Vérifier l'orthographe des termes de recherche
2. Utiliser des termes plus généraux
3. Essayer des synonymes ou termes alternatifs
4. Vérifier que l'index est à jour : `npm run rag:build`

### Problème : Résultats Non Pertinents

**Symptôme** : Les résultats ne correspondent pas à la requête

**Solutions** :
1. Affiner la requête avec des termes plus spécifiques
2. Utiliser la recherche ciblée avec `in:dossier`
3. Vérifier la priorité des documents (privilégier Critical/High)
4. Reconstruire l'index si la documentation a changé

### Problème : Documentation Obsolète

**Symptôme** : L'agent retourne des informations périmées

**Solutions** :
1. Vérifier la date de dernière modification dans les métadonnées
2. Reconstruire l'index : `npm run rag:build`
3. Vérifier que le workflow GitHub Actions s'est exécuté récemment
4. Consulter directement le fichier source pour vérifier

### Problème : Erreur Python

**Symptôme** : Les scripts Python ne s'exécutent pas

**Solutions** :
1. Vérifier que Python 3.11+ est installé : `python --version`
2. S'assurer d'être dans le répertoire racine du projet
3. Vérifier les permissions des scripts : `chmod +x scripts/rag/*.py`
4. Consulter les logs d'erreur pour plus de détails

---

## 🏗️ Architecture Technique

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Copilot Chat                       │
│                 @documentation-rag-agent                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Documentation RAG Agent                        │
│  (.github/agents/documentation-rag-agent.agent.md)          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Analyze Query                                   │   │
│  │  2. Extract Keywords                                │   │
│  │  3. Search Index                                    │   │
│  │  4. Rank Results                                    │   │
│  │  5. Synthesize Response                             │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Documentation Search Engine                      │
│       (scripts/rag/search_documentation.py)                 │
│                                                             │
│  • Hybrid Search (Lexical 40% + Semantic 60%)              │
│  • Multi-factor Ranking                                    │
│  • Related Documents Discovery                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Documentation Index                            │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  .doc-index.json     │  │ .doc-metadata.json   │        │
│  │  (full, gitignored)  │  │ (simplified, versioned)│      │
│  │                      │  │                      │        │
│  │  • Full content      │  │  • Summary only      │        │
│  │  • All sections      │  │  • Top keywords      │        │
│  │  • All metadata      │  │  • Statistics        │        │
│  └──────────────────────┘  └──────────────────────┘        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Documentation Index Builder                      │
│        (scripts/rag/build_doc_index.py)                     │
│                                                             │
│  • Scan docs/**/*.md                                        │
│  • Extract sections & metadata                             │
│  • Determine priority                                       │
│  • Extract keywords                                         │
│  • Build hierarchical structure                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Documentation Files                         │
│                   (docs/**/*.md)                            │
│                                                             │
│  • Architecture guides                                      │
│  • Feature documentation                                    │
│  • Implementation summaries                                 │
│  • Project documentation                                    │
└─────────────────────────────────────────────────────────────┘
```

### Flux de Données

1. **Documentation → Index Builder** : Scripts Python scannent les fichiers `.md`
2. **Index Builder → Index Files** : Génération de `.doc-index.json` et `.doc-metadata.json`
3. **Index Files → Search Engine** : Chargement de l'index en mémoire
4. **User Query → RAG Agent** : Question via GitHub Copilot Chat
5. **RAG Agent → Search Engine** : Extraction keywords et recherche
6. **Search Engine → RAG Agent** : Résultats classés avec scores
7. **RAG Agent → User** : Réponse formatée avec citations

### Stratégie de Recherche Hybride

#### Lexical Search (40%)
- Correspondance exacte des termes
- TF-IDF sur les mots-clés
- Bonus pour correspondance dans les titres

#### Semantic Search (60%)
- Compréhension du contexte
- Relations entre concepts
- Synonymes et termes liés

#### Ranking Factors
- **Keyword match** (30%) : Présence des mots-clés
- **Title match** (20%) : Correspondance dans le titre
- **Priority boost** (20%) : Multiplicateur selon priorité
- **Recency** (10%) : Date de modification
- **Section relevance** (20%) : Pertinence des sections

---

## 🎓 Bonnes Pratiques

### Pour les Utilisateurs

1. **Soyez Spécifique** : Plus votre question est précise, meilleurs seront les résultats
2. **Utilisez des Mots-Clés** : Incluez des termes techniques pertinents
3. **Consultez les Citations** : Vérifiez toujours les sources originales
4. **Explorez les Liens** : Suivez les documents liés suggérés
5. **Feedback** : Signalez les lacunes documentaires

### Pour les Contributeurs

1. **Maintenez la Documentation** : Gardez les docs à jour avec le code
2. **Structure Claire** : Utilisez des titres markdown cohérents (H1-H6)
3. **Mots-Clés Pertinents** : Incluez des termes techniques importants
4. **Liens Inter-Documents** : Référencez d'autres documents
5. **Priorité Appropriée** : Placez les docs critiques dans les bons dossiers

### Pour les Mainteneurs

1. **Surveillance de l'Index** : Vérifier régulièrement les statistiques
2. **Tests Périodiques** : Exécuter `npm run rag:test` avant les releases
3. **Optimisation Continue** : Analyser les requêtes fréquentes
4. **Nettoyage Archives** : Déplacer les docs obsolètes vers `ARCHIVES/`
5. **Documentation du Système** : Maintenir ce guide à jour

---

## 📚 Références

### Configuration

- **Agent Definition** : `.github/agents/documentation-rag-agent.agent.md`
- **RAG Config** : `.github/copilot/rag-config.json`
- **Copilot Instructions** : `.github/copilot-instructions.md`

### Scripts

- **Index Builder** : `scripts/rag/build_doc_index.py`
- **Search Engine** : `scripts/rag/search_documentation.py`
- **Test Suite** : `scripts/rag/test_rag_system.py`

### Workflows

- **Auto Build** : `.github/workflows/build-doc-index.yml`

### Index Files

- **Full Index** : `docs/.doc-index.json` (gitignored)
- **Metadata** : `docs/.doc-metadata.json` (versioned)

---

## ❓ FAQ

### Q: L'agent peut-il accéder au code source ?

**R**: Non, l'agent RAG est spécialisé dans la documentation (fichiers `.md`). Pour le code source, utilisez les agents spécialisés comme `@react-frontend` ou `@tauri-rust-backend`.

### Q: À quelle fréquence l'index est-il mis à jour ?

**R**: L'index est reconstruit automatiquement :
- À chaque push de documentation (main/develop)
- Sur les PR affectant la documentation
- Quotidiennement à 2h UTC

### Q: Peut-on rechercher dans les archives ?

**R**: Oui, mais les documents archivés ont un score de priorité réduit (30%). Ils apparaissent dans les résultats s'ils sont très pertinents.

### Q: Quelle est la différence entre .doc-index.json et .doc-metadata.json ?

**R**:
- `.doc-index.json` : Index complet avec contenu, gitignored, ~plusieurs MB
- `.doc-metadata.json` : Résumé simplifié, versionné dans Git, ~quelques KB

### Q: Comment améliorer la qualité des résultats ?

**R**:
1. Enrichir la documentation avec plus de mots-clés
2. Structurer les documents avec des sections claires
3. Ajouter des liens entre documents liés
4. Maintenir la documentation à jour

### Q: Le système fonctionne-t-il hors ligne ?

**R**: Une fois l'index construit, la recherche fonctionne localement. Mais la construction de l'index nécessite les fichiers de documentation.

---

## 🔮 Évolutions Futures

### Version 1.1 (Planifié)
- [ ] Support de la recherche vectorielle (embeddings)
- [ ] Cache intelligent avec invalidation sélective
- [ ] Suggestions proactives basées sur le contexte
- [ ] Intégration avec le code source (cross-references)

### Version 2.0 (Vision)
- [ ] Multi-modal : support des diagrammes et images
- [ ] Historique personnalisé par utilisateur
- [ ] Apprentissage des patterns de recherche
- [ ] Génération automatique de documentation manquante

---

## 📞 Support

Pour toute question ou problème :

1. Consulter cette documentation
2. Vérifier les issues GitHub existantes
3. Contacter le `@meta-orchestrator` pour coordination
4. Ouvrir une nouvelle issue avec label `documentation` ou `rag-system`

---

**Dernière mise à jour** : 2026-01-07  
**Version du système** : 1.0.0  
**Mainteneur** : Équipe Lumina Portfolio
