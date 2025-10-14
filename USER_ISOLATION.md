# 🔐 Gestion des Utilisateurs - MemoGenie

## Comment ça marche maintenant ?

Chaque utilisateur a un **ID unique** stocké dans son navigateur (localStorage). Les projets et conversations sont **isolés par utilisateur**.

### ✅ Ce qui a été ajouté:

1. **Colonne `user_id`** dans la table `projects`
2. **Migration automatique** qui ajoute cette colonne au démarrage
3. **Système d'ID utilisateur** basé sur localStorage (`lib/user.ts`)
4. **Filtrage automatique** - chaque utilisateur voit uniquement ses projets

### 🧪 Pour tester:

#### Tester avec plusieurs utilisateurs:

1. **Ouvrir l'app** dans un navigateur normal
   - Créer quelques projets
   
2. **Ouvrir en navigation privée** (Ctrl+Shift+N)
   - Vous verrez un utilisateur vide (nouveau user_id)
   - Créer d'autres projets
   
3. **Retourner dans le navigateur normal**
   - Vos anciens projets sont toujours là!

#### Réinitialiser votre utilisateur:

Ouvrez la console du navigateur (F12) et tapez:
```javascript
localStorage.removeItem('memogenie_user_id');
location.reload();
```

### 📊 Structure de la base de données:

```sql
-- Table projects avec user_id
projects (
  id INTEGER PRIMARY KEY,
  title TEXT,
  description TEXT,
  project_type TEXT,
  user_id TEXT,  -- ⭐ NOUVEAU
  created_at DATETIME,
  updated_at DATETIME
)
```

### 🔧 Fonctions utiles: 

```typescript
import { getUserId, resetUserId } from '@/lib/user';

// Récupérer l'ID utilisateur actuel
const userId = getUserId();

// Réinitialiser l'utilisateur (nouveau compte)
const newUserId = resetUserId();
```

### 🚀 Déploiement:

La migration s'exécute automatiquement au démarrage:
```
🔄 Migration: Ajout de la colonne user_id à projects...
✅ Migration réussie: colonne user_id ajoutée à projects
```

### ⚠️ Notes importantes:

1. **Les anciens projets** sont assignés à `user_id = "anonymous"` par défaut
2. **Pas d'authentification** - c'est juste une isolation par navigateur
3. **Effacer le cache** du navigateur = perdre son ID utilisateur
4. **Pour une vraie auth**, il faudrait ajouter NextAuth.js

### 🎯 Prochaines étapes possibles:

- [ ] Ajouter un système de login/signup
- [ ] Permettre l'export/import de projets
- [ ] Ajouter un système de partage de projets
- [ ] Cloud sync avec compte utilisateur
- [ ] Support multi-device avec compte

### 🐛 En cas de problème:

Si les projets sont vides après déploiement:
```bash
# Sur le serveur
cd /var/www/MemoGenie
npm run migrate
pm2 restart memogenie
```

---

**Maintenant chaque utilisateur a son propre espace privé!** 🎉
