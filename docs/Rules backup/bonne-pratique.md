---
trigger: always_on
---

# Règles de Modification de Fichiers

## Prévention des Erreurs "Target Content Not Found"

### Contexte

L'erreur `CORTEX_STEP_TYPE_CODE_ACTION: Could not successfully apply any edits. chunk 0: target content not found in file` survient lorsque le contenu ciblé (`TargetContent`) ne correspond pas **exactement** au contenu réel du fichier.

### Règles Obligatoires

1. **TOUJOURS lire avant de modifier**

   - Utiliser `view_file` pour lire le fichier complet ou la section ciblée
   - Ne JAMAIS modifier un fichier sans l'avoir lu au préalable dans la même conversation

2. **Copier-coller EXACT du TargetContent**

   - Copier le `TargetContent` **mot pour mot** depuis la sortie de `view_file`
   - Inclure TOUS les espaces, tabs, et sauts de ligne exactement comme affichés
   - Ne PAS reformater ou "corriger" l'indentation du `TargetContent`

3. **Vérifier la nécessité de la modification**

   - Si le fichier contient déjà le contenu souhaité, NE PAS le modifier
   - Créer un nouveau fichier ou document si besoin au lieu de forcer une modification inutile

4. **Utiliser les bons outils**

   - `replace_file_content` : Pour UN SEUL bloc de modification continu
   - `multi_replace_file_content` : Pour PLUSIEURS blocs non-contigus
   - `write_to_file` : Pour créer un NOUVEAU fichier uniquement

5. **Spécifier des plages précises**
   - Toujours fournir `StartLine` et `EndLine` qui contiennent le `TargetContent`
   - Élargir la plage si nécessaire pour inclure du contexte unique
   - Vérifier que le `TargetContent` n'apparaît qu'UNE SEULE fois dans la plage (sauf si `AllowMultiple: true`)

### Checklist Avant Modification

- [ ] J'ai lu le fichier avec `view_file`
- [ ] J'ai copié-collé le `TargetContent` exactement depuis `view_file`
- [ ] J'ai vérifié que la modification est nécessaire
- [ ] J'ai choisi le bon outil (`replace_file_content` vs `multi_replace_file_content`)
- [ ] J'ai spécifié `StartLine` et `EndLine` correctement
- [ ] J'ai vérifié que `TargetContent` est unique dans la plage (ou `AllowMultiple: true`)

### En Cas d'Erreur

Si l'erreur "target content not found" survient :

1. Relire le fichier avec `view_file` pour voir l'état actuel
2. Comparer caractère par caractère le `TargetContent` avec le contenu réel
3. Vérifier les espaces, tabs, et sauts de ligne
4. Si le contenu souhaité existe déjà, abandonner la modification
5. Sinon, ajuster le `TargetContent` pour correspondre EXACTEMENT au fichier

### Exceptions

- Fichiers binaires (images, vidéos) : Utiliser `view_file` sans modification
- Nouveaux fichiers : Utiliser `write_to_file` avec `Overwrite: false`
- Remplacement complet : Utiliser `write_to_file` avec `Overwrite: true` (RARE, à éviter)
