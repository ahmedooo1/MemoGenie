# 🎨 Configuration Hugging Face pour MemoGenie

## Pourquoi Hugging Face ?
- ✅ **100% GRATUIT** (avec compte gratuit)
- ✅ **Stable Diffusion XL** - Meilleure qualité d'images
- ✅ **Modifications cohérentes** - Meilleur contrôle sur les personnages
- ✅ **Pas de watermark**

## 📋 Étapes de configuration (5 minutes)

### 1️⃣ Créer un compte Hugging Face
👉 **Lien** : https://huggingface.co/join
- Cliquez sur "Sign Up"
- Remplissez email, username, password
- Validez votre email

### 2️⃣ Générer un token API
👉 **Lien** : https://huggingface.co/settings/tokens
- Cliquez sur "New token"
- **Name** : "MemoGenie" (ou ce que vous voulez)
- **Type** : Sélectionnez "Read" (suffisant)
- Cliquez sur "Generate a token"
- **Copiez le token** (commence par `hf_...`)

### 3️⃣ Ajouter le token dans MemoGenie
1. Ouvrez le fichier `.env.local` à la racine du projet
2. Trouvez la ligne :
   ```bash
   HUGGINGFACE_API_KEY=your_token_here
   ```
3. Remplacez `your_token_here` par votre token :
   ```bash
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **Sauvegardez le fichier**

### 4️⃣ Redémarrer le serveur
```powershell
# Arrêter le serveur (Ctrl+C dans le terminal)
# Puis relancer :
npm run dev
```

## ✅ Vérification
- Testez une génération d'image
- Dans la console du serveur, vous devriez voir :
  ```
  🤗 Utilisation de Hugging Face Stable Diffusion...
  ✅ Image générée avec Hugging Face
  ```

## 🔄 Système de Fallback
Si Hugging Face échoue ou n'est pas configuré, MemoGenie utilise automatiquement **Pollinations.ai** (gratuit aussi).

## 🆓 Limites gratuites
- **Hugging Face** : ~100 requêtes/jour (largement suffisant)
- **Pollinations** : Illimité mais qualité moindre

## 🎨 Résultat attendu
Avec Hugging Face, les modifications d'images seront :
- ✅ Plus cohérentes (même personnage)
- ✅ Meilleure qualité
- ✅ Style plus stable
- ✅ Meilleur respect des prompts

---

**Questions ?** Vérifiez que :
1. Le token commence bien par `hf_`
2. Le fichier `.env.local` est sauvegardé
3. Le serveur a été redémarré
