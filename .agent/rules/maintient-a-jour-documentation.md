---
trigger: always_on
---

# Instructions de Gestion de la Documentation Technique

## 1. Source de Vérité et Connaissance Persistante

- **Référence absolue :** Tu dois utiliser les fichiers listés au point 2 comme ta source de connaissance principale.
- **Consultation systématique :** Avant de répondre à une question sur l'état du projet ou de proposer une modification, consulte obligatoirement ces documents pour t'assurer que ta compréhension est alignée avec l'état actuel réel.

## 2. Périmètre (Fichiers cibles dans `docs/`)

Les documents suivants doivent être maintenus à jour :

- `docs/AI_SERVICE.md`
- `docs/ARCHITECTURE.md`
- `docs/COMPONENTS.md`
- `docs/INTERACTIONS.md`
- `docs/README.md`
- `docs/CHANGELOG.md` (Suivi chronologique des modifications)

## 3. Règles de Modification (CRITIQUE)

- **Horodatage obligatoire :** En haut de chaque fichier modifié, tu dois indiquer ou mettre à jour la mention : `Dernière mise à jour : JJ/MM/AAAA à HH:MM`.
- **Édition Partielle Uniquement :** Il est **strictement INTERDIT** de remplacer la totalité d'un fichier. Ne modifie que les informations qui ont besoin d'être complétées, actualisées ou supprimées.
- **Conservation :** Préserve toujours la structure existante et le contenu encore valide.

## 4. Gestion du CHANGELOG.md

- **Emplacement :** Le fichier doit impérativement se trouver dans `docs/CHANGELOG.md`.
- **Maintenance :** Tu dois créer (si inexistant) et maintenir ce fichier.
- **Contenu :** Chaque modification majeure ou complétion de tâche doit y être consignée avec la date, le type de changement (Ajout, Correction, Modification) et une brève description.

## 5. Déclencheurs et Workflow Git

Avant d'exécuter un `git commit` ou `git push` :

1. **Analyse & Comparaison :** Vérifie l'impact des changements sur la documentation.
2. **Mise à jour :** Actualise les fichiers `.md` concernés, incluant l'horodatage et le `docs/CHANGELOG.md`.
3. **Notification :** Utilise le modèle ci-dessous pour validation.

## 6. Modèle de Notification

> **[VÉRIFICATION DOC & CHANGELOG]**
>
> - **Code :** [Résumé bref des changements effectués]
> - **Impact Doc :** [Liste des fichiers modifiés dans docs/ + Horodatage mis à jour]
> - **Changelog :** [Entrée ajoutée au docs/CHANGELOG.md]
> - **Action :** Souhaites-tu que j'applique ces changements ? Si tu as un doute, demande-moi des précisions.

## 7. Communication et Incertitude

- Si une modification a un impact ambigu sur la documentation, **ne devine pas**. Demande des précisions à l'utilisateur avant toute modification de fichier.
