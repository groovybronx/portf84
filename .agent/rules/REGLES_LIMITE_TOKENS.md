---
trigger: always_on
---

# Règles de Gestion de la Limite de Tokens

## Principe Fondamental

**Notifier l'utilisateur lorsque la conversation approche de la limite de tokens pour permettre une transition propre vers une nouvelle conversation.**

**Cette règle s'adapte automatiquement à la limite de tokens du modèle utilisé.**

---

## 1. Détection de la Limite du Modèle

### Identification Automatique

**À chaque vérification**, je dois :
1. Consulter les metadata système pour obtenir :
   - **Tokens utilisés** : `[current_usage]`
   - **Limite totale** : `[total_budget]` (varie selon le modèle)
2. Calculer le pourcentage : `(current_usage / total_budget) × 100`

**Modèles disponibles dans Antigravity** :
- **Gemini 3 Pro (High)** : ~2,000,000 tokens
- **Gemini 3 Pro (Low)** : ~2,000,000 tokens
- **Gemini 3 Flash** : ~1,000,000 tokens
- **Claude Sonnet 4.5** : ~200,000 tokens
- **Claude Sonnet 4.5 (Thinking)** : ~200,000 tokens
- **Claude Opus 4.5 (Thinking)** : ~200,000 tokens
- **GPT-OSS 120B (Medium)** : Variable (à vérifier)

> [!NOTE]
> Les limites exactes peuvent varier. La règle s'adapte automatiquement
> en lisant la limite depuis les metadata système.

---

## 2. Seuils de Notification (Adaptatifs)

### Seuil d'Alerte (80% de la limite)

**Calcul** : `limite_totale × 0.80`

**Action** : Notification informative

**Message** :
```markdown
> ⚠️ **Alerte Tokens**
>
> **Utilisation actuelle** : [X]/[LIMITE] tokens (80%)
> **Tokens restants** : [Y] tokens (~20% du budget)
>
> La conversation approche de sa limite. Je te recommande de :
> 1. Finaliser les tâches en cours
> 2. Mettre à jour `docs/CHANGELOG.md` avec l'état actuel
> 3. Préparer une transition vers une nouvelle conversation
```

### Seuil Critique (90% de la limite)

**Calcul** : `limite_totale × 0.90`

**Action** : Notification urgente

**Message** :
```markdown
> 🚨 **ALERTE CRITIQUE - Limite de Tokens**
>
> **Utilisation actuelle** : [X]/[LIMITE] tokens (90%)
> **Tokens restants** : [Y] tokens (~10% du budget)
>
> **Action requise MAINTENANT** :
> 1. ✅ Finaliser immédiatement les tâches en cours
> 2. ✅ Mettre à jour `docs/CHANGELOG.md` avec "État Actuel"
> 3. ✅ Commit Git de sauvegarde
> 4. ✅ Ouvrir une nouvelle conversation
>
> **Ne pas** :
> - ❌ Commencer de nouvelles tâches complexes
> - ❌ Créer de nouveaux plans d'implémentation
> - ❌ Faire des refactorings majeurs
```

### Seuil d'Urgence (95% de la limite)

**Calcul** : `limite_totale × 0.95`

**Action** : Arrêt immédiat et sauvegarde

**Message** :
```markdown
> 🔴 **URGENCE - Limite de Tokens Atteinte**
>
> **Utilisation actuelle** : [X]/[LIMITE] tokens (95%)
> **Tokens restants** : [Y] tokens (~5% du budget)
>
> **Je dois arrêter maintenant pour éviter une coupure brutale.**
>
> **Actions de sauvegarde en cours** :
> 1. Mise à jour de `docs/CHANGELOG.md` avec l'état actuel
> 2. Sauvegarde du contexte
>
> **Ouvre une nouvelle conversation immédiatement.**
> Dans la nouvelle conversation, je lirai `CHANGELOG.md` pour reprendre où on s'est arrêté.
```

---

## 2. Workflow de Notification

### Vérification Automatique

**Quand vérifier** :
- Après chaque réponse significative
- Après chaque série d'outils (view_file, run_command, etc.)
- Avant de commencer une nouvelle tâche complexe

**Comment vérifier** :
- Consulter les metadata système pour le token usage actuel
- Calculer le pourcentage utilisé
- Comparer aux seuils définis

### Actions Préventives

**À 80% (160,000 tokens)** :
- ✅ Notifier l'utilisateur
- ✅ Suggérer de finaliser les tâches en cours
- ✅ Éviter de commencer de nouvelles tâches longues

**À 90% (180,000 tokens)** :
- ✅ Notification urgente
- ✅ Demander de mettre à jour `CHANGELOG.md`
- ✅ Suggérer un commit Git
- ✅ Recommander fortement une nouvelle conversation

**À 95% (190,000 tokens)** :
- ✅ Arrêt immédiat de toute nouvelle tâche
- ✅ Mise à jour automatique de `CHANGELOG.md` si possible
- ✅ Message d'urgence pour ouvrir nouvelle conversation

---

## 3. Préparation à la Transition

### Checklist Avant Nouvelle Conversation

**Actions obligatoires** :

- [ ] Mettre à jour `docs/CHANGELOG.md` avec :
  - Section "État Actuel" complète
  - Progression des tâches en cours
  - Prochaines étapes clairement définies
- [ ] Commit Git avec message descriptif
- [ ] Vérifier que tous les fichiers importants sont sauvegardés
- [ ] Informer l'utilisateur de l'état exact du projet

### Message de Transition

**Modèle à utiliser** :
```markdown
> 📋 **Préparation à la Transition**
>
> **État actuel sauvegardé** :
> - ✅ `docs/CHANGELOG.md` mis à jour
> - ✅ Progression : [X]% des tâches complétées
> - ✅ Prochaines étapes documentées
>
> **Dans la nouvelle conversation** :
> 1. Je lirai `docs/CHANGELOG.md` automatiquement
> 2. Je te rappellerai où on en était
> 3. On pourra continuer sans perte de contexte
>
> **Tu peux ouvrir une nouvelle conversation maintenant !** 🚀
```

---

## 4. Cas Particuliers

### Tâche Critique en Cours

**Si une tâche critique est en cours à 90%** :
1. Évaluer si elle peut être terminée rapidement (< 5,000 tokens)
2. Si oui : Terminer la tâche puis notifier
3. Si non : Arrêter immédiatement, sauvegarder l'état, notifier

### Build ou Tests en Cours

**Si un build/test long est lancé** :
- Attendre la fin du build/test
- Sauvegarder les résultats dans `CHANGELOG.md`
- Notifier immédiatement après

### Conversation Déjà à 95%+

**Si la conversation est déjà au-delà de 95%** :
- Message d'urgence immédiat
- Pas de nouvelles actions
- Rediriger vers nouvelle conversation

---

## 5. Responsabilité de l'Agent

**En tant qu'agent Antigravity, je dois** :
- ✅ Surveiller activement l'utilisation des tokens
- ✅ Notifier proactivement avant d'atteindre les limites
- ✅ Prioriser la sauvegarde du contexte
- ✅ Faciliter une transition propre vers une nouvelle conversation
- ✅ Garantir qu'aucun travail n'est perdu
- ❌ Ne JAMAIS laisser la conversation atteindre 100% sans notification
- ❌ Ne JAMAIS commencer une tâche complexe au-delà de 90%

---

## 6. Exemple de Notification

### Notification à 85% (Exemple Réel)

```markdown
> ⚠️ **Alerte Tokens**
>
> **Utilisation actuelle** : 170,000/200,000 tokens (85%)
> **Tokens restants** : 30,000 tokens
>
> On approche de la limite de cette conversation. Je te suggère de :
> 1. Finaliser la documentation en cours
> 2. Faire un commit Git de sauvegarde
> 3. Mettre à jour `docs/CHANGELOG.md` avec l'état actuel
> 4. Préparer une nouvelle conversation pour la suite
>
> On a encore de la marge pour finir proprement ! 👍
```

---

## 7. Intégration avec Autres Règles

### Lien avec REGLES_ARTIFACTS.md

- La sauvegarde du contexte dans `CHANGELOG.md` garantit la continuité
- La nouvelle conversation pourra reprendre via la lecture de `CHANGELOG.md`

### Lien avec REGLES_DOCUMENTATION.md

- `CHANGELOG.md` doit être à jour avant la transition
- La section "État Actuel" est critique pour la reprise

---

## 8. Monitoring Continu

**Je dois vérifier les tokens** :
- ✅ Après chaque réponse longue
- ✅ Après chaque série d'outils
- ✅ Avant de commencer une nouvelle tâche
- ✅ Périodiquement pendant les tâches longues

**Formule de calcul** :
```
Pourcentage = (Tokens utilisés / 200,000) × 100
```

**Tokens restants estimés pour actions courantes** :
- Lecture d'un fichier moyen : ~1,000 tokens
- Réponse détaillée : ~500-1,000 tokens
- Modification de code : ~500-2,000 tokens
- Création d'artifact : ~1,000-3,000 tokens
