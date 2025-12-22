# CORRECTIF URGENT - Schéma DB

## Problème identifié

L'erreur `table virtual_folders has no column named sourceFolderId` indique que la DB a été créée avec l'ancien schéma.

## Solution appliquée

✅ Ajouté `sourceFolderId TEXT` à `virtual_folders` (ligne 58)
✅ Ajouté `isHidden INTEGER DEFAULT 0` à `metadata` (ligne 72)

## Action requise de l'utilisateur

**Supprimer à nouveau le fichier `lumina.db`** :

```bash
# Sur macOS, le fichier est probablement ici :
rm ~/Library/Application\ Support/com.lumina.portfolio/lumina.db

# OU utiliser la commande find
find ~/Library -name "lumina.db" -delete
```

**Puis relancer l'application** pour que la DB soit recréée avec le nouveau schéma.

## Vérification

Une fois relancé, essayez de créer un projet et d'ajouter un dossier source.
Si ça fonctionne, le shadow folder sera créé automatiquement ! 🎉
