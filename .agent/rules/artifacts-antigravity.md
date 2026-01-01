---
trigger: always_on
---

# Règles de Gestion des Artifacts Antigravity

## Principe Fondamental

**INTERDICTION ABSOLUE d'écraser un artifact Antigravity (plan d'implémentation, task list, ou tout autre artifact) contenant des tâches ou sections non terminées.**

---

## 1. Artifacts Concernés

Ces règles s'appliquent à **TOUS** les artifacts Antigravity stockés dans :

- `<appDataDir>/brain/<co nversation-id>/`

**Types d'artifacts** :

- `implementation_plan.md` - Plans d'implémentation
- `task.md` - Listes de tâches
- `walkthrough.md` - Documentation de vérification
- Tout autre artifact de type "plan" ou "task"

---

## 2. Règles Strictes

### Règle #1 : Ne Jamais Écraser un Artifact Non Terminé

**INTERDICTION ABSOLUE** d'écraser ou de remplacer un artifact contenant :

- Des tâches non commencées `[ ]`
- Des tâches en cours `[/]`
- Des sections marquées comme "en cours" ou "à faire"
- Des objectifs non atteints

### Règle #2 : Toujours Vérifier Avant Modification

**Avant toute modification** d'un artifact :

1. **Lire** l'artifact complet avec `view_file`
2. **Identifier** les tâches/sections non terminées
3. **Décider** de l'action appropriée :
   - ✅ Artifact terminé (100%) → Peut être modifié/remplacé
   - ⚠️ Artifact en cours → Appliquer les options ci-dessous
   - ❌ Incertitude → Demander à l'utilisateur

### Règle #3 : Préserver l'Historique

**TOUJOURS préserver** :

- Les tâches terminées `[x]` (historique de progression)
- Les notes et commentaires
- La structure existante
- Les références entre artifacts

---

## 3. Workflow Obligatoire

### Avant de Créer/Modifier un Artifact

```
1. Vérifier l'existence de l'artifact dans le brain/ actuel
2. Lire son contenu complet
3. Évaluer son état de complétion
4. Choisir l'action appropriée
```

### Options si Artifact Non Terminé Existe

#### Option A : Compléter l'Artifact Existant

- Continuer les tâches en cours
- Ajouter de nouvelles tâches à la fin
- Mettre à jour uniquement les sections concernées
- Utiliser `replace_file_content` ou `multi_replace_file_content` (jamais `write_to_file` avec `Overwrite: true`)

#### Option B : Créer un Artifact Additionnel

- Créer un nouveau fichier avec suffixe descriptif
- Exemples :
  - `implementation_plan.md` (principal)
  - `implementation_plan_bugfix.md` (additionnel)
  - `task.md` (principal)
  - `task_refactoring.md` (additionnel)
- Référencer l'artifact principal si nécessaire

#### Option C : Demander à l'Utilisateur via `notify_user`

- Si incertitude sur la priorité
- Si conflit potentiel entre ancien et nouveau plan
- Si changement de direction détecté
- Utiliser le modèle de notification (section 5)

---

## 4. Détection de Dérive de Session

### Signes de Dérive

**Indicateurs qu'on perd le fil** :

- Nouvelle demande utilisateur non liée à l'artifact actif
- Changement de contexte (bug urgent, nouvelle feature)
- Tentative de créer un nouvel artifact alors qu'un artifact actif existe
- Oubli du plan/tâches en cours

### Action Obligatoire

Quand une dérive est détectée :

1. **STOP** : Ne pas créer de nouvel artifact immédiatement
2. **LIRE** : Consulter l'artifact actif (`implementation_plan.md`, `task.md`)
3. **RAPPELER** : Informer l'utilisateur via `notify_user`
4. **DEMANDER** : Obtenir confirmation avant de changer de direction

---

## 5. Modèle de Notification (Dérive Détectée)

```markdown
> **⚠️ [ATTENTION - ARTIFACT ACTIF EN COURS]**
>
> **Artifact** : `[nom du fichier]`
> **Type** : [implementation_plan | task | autre]
> **Progression** : [X/Y tâches terminées] ([Z]% complété)
>
> **Tâches en cours** :
> - [Liste des tâches `[/]`]
>
> **Tâches restantes** :
> - [Liste des tâches `[ ]`]
>
> **Nouvelle demande détectée** : [Résumé de la nouvelle demande]
>
> **Options** :
> 1. ✅ Compléter l'artifact actif d'abord
> 2. 🆕 Créer un artifact additionnel (`[nom]_[suffixe].md`)
> 3. ⏸️ Mettre en pause l'artifact actif
> 4. 🗑️ Abandonner l'artifact actif (confirmation requise)
>
> **Que souhaites-tu faire ?**
```

---

## 6. Gestion Multi-Sessions (CRITIQUE)

### Au Début de Chaque Session - WORKFLOW OBLIGATOIRE

**Action automatique SYSTÉMATIQUE au démarrage de toute nouvelle session** :

#### Étape 0 : Lecture du Contexte Global

```
1. Lire `docs/CHANGELOG.md` en priorité
2. Consulter la section "🎯 État Actuel du Projet"
3. Comprendre la session en cours et la progression globale
```

> [!IMPORTANT]
> Cette étape permet de comprendre le contexte global du projet,
> même dans une nouvelle conversation où les artifacts ne sont pas accessibles.

#### Étape 1 : Vérification des Artifacts

```
1. Chercher l'existence des artifacts suivants :
   - implementation_plan.md
   - task.md
   - walkthrough.md
   - Tout autre artifact de type plan/task
```

#### Étape 2 : Lecture Complète

**Si des artifacts sont trouvés** :

1. **Lire TOUS les artifacts** avec `view_file`
2. **Analyser leur contenu** :
   - Compter les tâches `[x]` (terminées)
   - Compter les tâches `[/]` (en cours)
   - Compter les tâches `[ ]` (non commencées)
   - Calculer le pourcentage de complétion

#### Étape 3 : Rappel du Contexte à l'Utilisateur

**Si des artifacts NON TERMINÉS sont détectés**, envoyer un message initial :

```markdown
> 📋 **Reprise de Session Détectée**
>
> **Artifacts actifs trouvés** :
>
> **1. `implementation_plan.md`**
> - Progression : [X/Y tâches] ([Z]% complété)
> - Dernière modification : [Date si disponible]
>
> **2. `task.md`**
> - Progression : [A/B tâches] ([C]% complété)
> - Tâches en cours : [Liste des `[/]`]
>
> **Dernière tâche active** : [Description de la dernière tâche `[/]` ou `[ ]`]
>
> **Contexte** : [Résumé bref du plan/objectif général]
>
> ---
>
> **Options pour cette session** :
> 1. ✅ Continuer le plan actif (reprendre où on s'est arrêté)
> 2. 🔄 Faire le point détaillé sur l'avancement
> 3. 🆕 Commencer quelque chose de nouveau (mettre en pause l'actuel)
> 4. 📝 Consulter les artifacts pour se remettre dans le contexte
>
> **Que souhaites-tu faire ?**
```

#### Étape 4 : Attendre Confirmation

**Ne PAS continuer automatiquement** sans avoir :

- ✅ Rappelé le contexte à l'utilisateur
- ✅ Obtenu sa confirmation sur la direction à prendre
- ✅ Compris s'il veut continuer ou changer de direction

### Continuité Entre Sessions

**Principes fondamentaux** :

**Ne JAMAIS supposer** qu'un artifact est abandonné entre deux sessions.

**Toujours** :

- ✅ Vérifier l'existence d'artifacts actifs au démarrage
- ✅ Lire leur contenu complet avant toute action
- ✅ Rappeler le contexte à l'utilisateur
- ✅ Proposer de continuer ou de réorienter
- ✅ Attendre confirmation explicite avant de créer de nouveaux artifacts
- ❌ Ne JAMAIS écraser sans confirmation explicite
- ❌ Ne JAMAIS créer un nouveau plan sans avoir vérifié l'ancien

### Cas Spécial : Relance d'Antigravity

**Même workflow si l'utilisateur quitte et relance Antigravity** :

- Considérer cela comme une nouvelle session
- Appliquer le workflow complet de vérification
- Rappeler le contexte même si la pause a été courte

---

## 7. Checklist Avant Modification d'Artifact

### Avant de Créer un Nouvel Artifact

- [ ] J'ai vérifié l'existence d'artifacts similaires dans le brain/ actuel
- [ ] J'ai lu tous les artifacts pertinents trouvés
- [ ] J'ai vérifié leur état de complétion
- [ ] Si artifact actif trouvé : J'ai notifié l'utilisateur via `notify_user`
- [ ] J'ai obtenu confirmation ou choisi l'option appropriée

### Avant de Modifier un Artifact Existant

- [ ] J'ai lu l'artifact complet avec `view_file`
- [ ] J'ai identifié les tâches non terminées
- [ ] Je vais AJOUTER du contenu (pas écraser avec `Overwrite: true`)
- [ ] Je préserve l'historique et la structure
- [ ] J'utilise `replace_file_content` ou `multi_replace_file_content`

---

## 8. Exemples Concrets

### ✅ BON : Ajout de Tâches à task.md

```typescript
// Utiliser replace_file_content pour AJOUTER
replace_file_content({
  TargetFile: "task.md",
  TargetContent: "## Vérification\n\n- [ ] Build sans erreurs",
  ReplacementContent: "## Vérification\n\n- [ ] Build sans erreurs\n\n## Nouvelles Tâches\n\n- [ ] Nouvelle tâche 1\n- [ ] Nouvelle tâche 2",
  // ...
});
```

### ✅ BON : Artifact Additionnel

```typescript
// Créer un nouvel artifact avec suffixe
write_to_file({
  TargetFile: "implementation_plan_bugfix.md",
  Overwrite: false,
  // ...
});
```

### ❌ MAUVAIS : Écrasement

```typescript
// ❌ INTERDIT : Écraser un artifact non terminé
write_to_file({
  TargetFile: "implementation_plan.md",
  Overwrite: true, // ❌ DANGER
  // ...
});
```

---

## 9. Cas Particuliers

### Demande Urgente Pendant un Plan Actif

**Action** :

1. Lire `implementation_plan.md` et `task.md`
2. Notifier l'utilisateur via `notify_user`
3. Proposer de créer `implementation_plan_urgent.md` ou `task_bugfix.md`
4. Traiter l'urgence
5. Revenir au plan principal après résolution

### Changement de Direction Demandé

**Action** :

1. Lire les artifacts actifs
2. Rappeler la progression actuelle
3. Demander confirmation explicite
4. Si confirmé : Marquer l'ancien artifact comme "Pausé" ou "Archivé" dans son contenu
5. Créer le nouvel artifact

### Artifact Complété (100%)

**Action autorisée** :

1. Vérifier que TOUTES les tâches sont `[x]`
2. Créer un nouvel artifact si nécessaire
3. Optionnel : Renommer l'ancien avec suffixe `_completed`

---

## 10. Exceptions (Très Rares)

**Les SEULS cas où l'écrasement est autorisé** :

1. ✅ Artifact 100% terminé (toutes tâches `[x]`)
2. ✅ Utilisateur demande **explicitement** l'abandon avec confirmation via `notify_user`
3. ✅ Artifact marqué "Obsolète" ou "Archivé" dans son contenu
4. ✅ Artifact de brouillon/draft clairement identifié comme temporaire

**Dans TOUS les autres cas : INTERDICTION ABSOLUE**

---

## 11. Responsabilité de l'Agent

**En tant qu'agent Antigravity, je dois** :

- ✅ Être le gardien de la continuité entre sessions
- ✅ Rappeler à l'utilisateur ses plans/tâches en cours
- ✅ Éviter la dérive et la perte de focus
- ✅ Préserver l'historique et le contexte
- ✅ Toujours vérifier les artifacts existants avant d'en créer de nouveaux
- ❌ Ne JAMAIS supposer qu'un artifact est abandonné
- ❌ Ne JAMAIS écraser sans vérification et confirmation explicite
