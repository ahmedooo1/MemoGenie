# ☁️ Configuration Cloudflare Workers AI pour MemoGenie

## 🎯 Pourquoi Cloudflare Workers AI ?
- ✅ **100% GRATUIT** (100,000 requêtes/jour)
- ✅ **Image-to-Image** (vraie modification d'image !)
- ✅ **Stable Diffusion XL** - Qualité professionnelle
- ✅ **Pas de watermark**

## ⚡ Avantage majeur
Contrairement à Pollinations/Hugging Face qui font du **text-to-image** (génération depuis zéro), Cloudflare Workers AI permet du **image-to-image** : vous fournissez une image existante et il la modifie !

## 📋 Configuration (5 minutes)

### 1️⃣ Créer un compte Cloudflare (gratuit)
👉 **Lien** : https://dash.cloudflare.com/sign-up
- Email, mot de passe, validation

### 2️⃣ Obtenir votre Account ID
👉 **Lien** : https://dash.cloudflare.com/
- Une fois connecté, votre **Account ID** est visible dans l'URL :
  ```
  https://dash.cloudflare.com/<ACCOUNT_ID>/workers
  ```
- Ou dans la barre latérale droite, section "Account ID"
- **Copiez-le** (format : 32 caractères hexadécimaux)

### 3️⃣ Créer un API Token
👉 **Lien** : https://dash.cloudflare.com/profile/api-tokens

**Option A - Template rapide :**
- Cliquez sur "Create Token"
- Choisissez le template **"Edit Cloudflare Workers"**
- Cliquez "Continue to summary"
- Cliquez "Create Token"
- **Copiez le token** (vous ne le reverrez plus !)

**Option B - Custom token :**
- Cliquez "Create Custom Token"
- **Token name** : "MemoGenie"
- **Permissions** :
  - Account → Workers AI → Edit
  - Account → Workers Scripts → Edit
- **Account Resources** : Include → All accounts
- Cliquez "Continue to summary" puis "Create Token"
- **Copiez le token**

### 4️⃣ Ajouter dans MemoGenie
1. Ouvrez le fichier **`.env.local`** à la racine du projet
2. Trouvez les lignes :
   ```bash
   CLOUDFLARE_ACCOUNT_ID=your_account_id_here
   CLOUDFLARE_API_TOKEN=your_api_token_here
   ```
3. Remplacez par vos vraies valeurs :
   ```bash
   CLOUDFLARE_ACCOUNT_ID=abc123def456...
   CLOUDFLARE_API_TOKEN=your_cloudflare_token...
   ```
4. **Sauvegardez le fichier**

### 5️⃣ Redémarrer le serveur
```powershell
# Arrêter (Ctrl+C) puis relancer :
npm run dev
```

## ✅ Vérification
Testez une modification d'image :
1. "genere batman"
2. "mets le dans une voiture"

Dans la console du serveur, vous devriez voir :
```
☁️ Utilisation de Cloudflare Workers AI pour img2img...
✅ Image modifiée avec Cloudflare Workers AI
```

## 🔄 Système intelligent
MemoGenie utilise maintenant un système à 3 niveaux :
1. **Modification d'image** → Cloudflare Workers AI (img2img)
2. **Génération d'image** → Hugging Face Stable Diffusion
3. **Fallback** → Pollinations (si les 2 premiers échouent)

## 📊 Différence visible
### Avant (Pollinations/Hugging Face) :
- "genere batman" → Image A de Batman
- "mets le dans une voiture" → Image B complètement différente (autre personne)

### Après (Cloudflare img2img) :
- "genere batman" → Image A de Batman
- "mets le dans une voiture" → Image A' avec **le même Batman** dans une voiture ! 🎉

## 🆓 Limites gratuites
- **100,000 requêtes/jour** (largement suffisant)
- Pas de carte bancaire requise
- Pas d'expiration

## 🎨 Paramètres de modification
Dans `/api/modify-image/route.ts`, vous pouvez ajuster :
- `strength: 0.7` → Force de modification (0.0 = identique, 1.0 = complètement nouveau)
  - 0.5 = modification légère
  - 0.7 = modification moyenne (par défaut)
  - 0.9 = modification forte
- `num_steps: 20` → Qualité (10-50, plus = meilleur mais plus lent)
- `guidance: 7.5` → Respect du prompt (5-15)

---

**Questions ?** Vérifiez que :
1. ✅ Account ID et API Token sont corrects
2. ✅ Le fichier `.env.local` est sauvegardé
3. ✅ Le serveur a été redémarré
4. ✅ Vous testez une **modification** (pas juste une génération)
