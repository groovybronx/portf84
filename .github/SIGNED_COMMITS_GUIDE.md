# Guide de Configuration des Commits Signés

## 🔐 Pourquoi Signer les Commits ?

Les commits signés garantissent :
- ✅ **Authenticité** : Prouve que c'est bien toi qui as fait le commit
- ✅ **Intégrité** : Garantit que le code n'a pas été modifié
- ✅ **Conformité** : Requis par tes règles de protection GitHub

---

## 📋 Choix : GPG ou SSH ?

### Option 1 : GPG (Recommandé)
- ✅ Standard historique
- ✅ Compatible partout
- ❌ Plus complexe à configurer

### Option 2 : SSH (Plus Simple)
- ✅ Très simple si tu as déjà une clé SSH
- ✅ Supporté par GitHub depuis 2022
- ✅ Même clé pour authentification et signature

**Je recommande SSH** pour la simplicité.

---

## 🚀 Configuration avec SSH (Recommandé)

### Étape 1 : Vérifier si tu as déjà une clé SSH

```bash
ls -la ~/.ssh
# Cherche : id_ed25519.pub ou id_rsa.pub
```

### Étape 2A : Si tu as déjà une clé SSH

```bash
# Afficher ta clé publique
cat ~/.ssh/id_ed25519.pub
# OU
cat ~/.ssh/id_rsa.pub
```

1. **Copie la clé** (commence par `ssh-ed25519` ou `ssh-rsa`)
2. Va sur GitHub : https://github.com/settings/keys
3. Clique sur **"New SSH key"**
4. **Type** : Sélectionne **"Signing Key"** (PAS "Authentication Key")
5. Colle ta clé publique
6. Sauvegarde

### Étape 2B : Si tu n'as PAS de clé SSH

```bash
# Générer une nouvelle clé ED25519 (recommandé)
ssh-keygen -t ed25519 -C "ton-email@example.com"

# Appuie sur Entrée 3 fois (pas de passphrase pour simplicité)
# La clé est créée dans ~/.ssh/id_ed25519

# Afficher la clé publique
cat ~/.ssh/id_ed25519.pub
```

Puis suis les étapes ci-dessus pour l'ajouter à GitHub.

### Étape 3 : Configurer Git pour signer avec SSH

```bash
# Dire à Git d'utiliser SSH pour signer
git config --global gpg.format ssh

# Spécifier quelle clé utiliser (remplace par ton chemin)
git config --global user.signingkey ~/.ssh/id_ed25519.pub

# Activer la signature automatique pour tous les commits
git config --global commit.gpgsign true

# Activer la signature pour les tags aussi (optionnel)
git config --global tag.gpgsign true
```

### Étape 4 : Vérification

```bash
# Créer un commit de test
git commit --allow-empty -m "test: Signed commit"

# Vérifier la signature
git log --show-signature -1
```

Résultat attendu :
```
Good "git" signature for ton-email@example.com with ED25519 key SHA256:...
```

---

## 🔧 Configuration avec GPG (Alternative)

### Étape 1 : Installer GPG

```bash
# Sur macOS
brew install gnupg
```

### Étape 2 : Générer une clé GPG

```bash
gpg --full-generate-key
```

Choisis :
- Type : `(1) RSA and RSA`
- Taille : `4096`
- Validité : `0` (ne jamais expirer) ou `1y` (1 an)
- Nom et email : **Utilise le même email que ton compte GitHub**

### Étape 3 : Lister les clés

```bash
gpg --list-secret-keys --keyid-format=long
```

Résultat :
```
sec   rsa4096/ABCD1234EFGH5678 2024-12-30
      XXXXXXXXXXXXXXXXXXXXXXXXXXXX
uid                 [ultimate] Ton Nom <ton-email@example.com>
```

Note le `ABCD1234EFGH5678` (ton KEY ID).

### Étape 4 : Configurer Git

```bash
# Remplace par ton KEY ID
git config --global user.signingkey ABCD1234EFGH5678
git config --global commit.gpgsign true
```

### Étape 5 : Exporter la clé publique

```bash
# Remplace par ton KEY ID
gpg --armor --export ABCD1234EFGH5678
```

Copie tout (de `-----BEGIN PGP PUBLIC KEY BLOCK-----` à `-----END PGP PUBLIC KEY BLOCK-----`).

### Étape 6 : Ajouter à GitHub

1. Va sur : https://github.com/settings/keys
2. Clique sur **"New GPG key"**
3. Colle la clé publique
4. Sauvegarde

---

## ✅ Test Final

```bash
# Créer un commit signé
git commit --allow-empty -m "test: Signed commit"

# Pousser vers GitHub
git push origin feature/dynamic-configuration

# Sur GitHub, tu verras un badge "Verified" vert ✅
```

---

## 🆘 Dépannage

### Erreur : "gpg: signing failed: Inappropriate ioctl for device"

```bash
export GPG_TTY=$(tty)
# Ajoute aussi à ton ~/.zshrc ou ~/.bashrc
echo 'export GPG_TTY=$(tty)' >> ~/.zshrc
```

### Erreur : "error: cannot run gpg: No such file or directory"

```bash
# Installer GPG
brew install gnupg
```

### Commit non vérifié sur GitHub

- Vérifie que l'email du commit = email de la clé = email GitHub
- Vérifie que la clé est bien ajoutée à GitHub

---

## 📚 Ressources

- [GitHub: Signing Commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)
- [GitHub: Adding SSH Key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
- [GitHub: Troubleshooting](https://docs.github.com/en/authentication/troubleshooting-commit-signature-verification)

---

**Dernière mise à jour** : 30/12/2024
