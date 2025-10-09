# MemoGenie 🧞‍♂️✨

**Your Intelligent Writing Companion**

MemoGenie est un assistant IA moderne et puissant pour vous aider à rédiger vos mémoires académiques ou discuter de n'importe quel sujet. Propulsé par Google Gemini 2.5 Flash avec gestion intelligente du contexte longue durée.

Créé par **Ahmad Ahmad** 💜

## 🎯 Fonctionnalités Principales

### 🧞‍♂️ Deux Modes Intelligents
- **Mode Mémoire** : Assistant académique spécialisé pour rédiger des mémoires structurés
- **Mode Chatbot** : Assistant général pour toutes vos questions et besoins

### ✨ Fonctionnalités Avancées
- **Rédaction en temps réel** : Visualisez le texte s'écrire mot par mot avec streaming
- **Bouton Stop** : Interrompez la génération à tout moment
- **Gestion du contexte longue durée** : L'IA se souvient de tout, même après 60+ pages
- **Continuité parfaite** : Reprenez votre travail à tout moment sans perdre le fil
- **Interface moderne** : Design épuré avec animations Framer Motion
- **Multi-projets** : Gérez plusieurs projets simultanément
- **Organisation par chapitres** : Structurez vos documents facilement
- **Vision AI** : Analysez des images avec Gemini Vision
- **Génération d'images** : Créez des images IA via Pollinations.ai
- **Zoom d'images** : Visualisez vos images en plein écran
- **Copie formatée** : Copiez du texte avec formatage préservé (HTML + Markdown)
- **Syntax Highlighting** : Blocs de code avec coloration syntaxique
- **Export PDF/Word** : Exportez vos documents en plusieurs formats
- **Sauvegarde automatique** : Données stockées localement en SQLite

## 🚀 Installation

### Prérequis
- Node.js 18+ et npm/pnpm/yarn

### Étapes d'installation

1. **Installer les dépendances** :
```powershell
npm install
```

2. **Configurer l'API Gemini** :
   - Obtenez une clé API gratuite sur [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Créez un fichier `.env.local` :
```powershell
Copy-Item .env.local.example .env.local
```
   - Ouvrez `.env.local` et ajoutez votre clé :
```
GEMINI_API_KEY=votre_cle_api_ici
```

3. **Lancer le serveur de développement** :
```powershell
npm run dev
```

4. **Ouvrir l'application** :
   - Rendez-vous sur [http://localhost:3000](http://localhost:3000)

## 💡 Utilisation

### Créer un nouveau projet
1. Cliquez sur "Nouveau Projet"
2. Donnez un titre à votre mémoire
3. Ajoutez une description (optionnel)

### Organiser votre mémoire
1. Créez des chapitres avec le bouton "+"
2. Sélectionnez un chapitre pour travailler dessus
3. L'IA maintiendra le contexte de tous vos chapitres

### Rédiger avec l'IA
1. Décrivez ce que vous voulez dans la zone de texte
2. L'IA génère le contenu en temps réel
3. Le texte apparaît mot par mot (streaming)
4. Utilisez "Continuer" pour reprendre là où ça s'est arrêté

### Exemples de commandes
- *"Rédige une introduction sur l'intelligence artificielle en éducation"*
- *"Continue la rédaction du chapitre actuel"*
- *"Développe la partie sur les méthodologies de recherche"*
- *"Ajoute une conclusion à ce chapitre"*

## 🎨 Caractéristiques Techniques

- **Frontend** : Next.js 14 + React 18 + TypeScript
- **Styling** : TailwindCSS + Framer Motion (animations)
- **IA** : Google Gemini 1.5 Pro avec streaming SSE
- **Base de données** : SQLite (better-sqlite3)
- **Architecture** : API Routes Next.js + Server-Sent Events

## 🧠 Gestion du Contexte

L'application maintient plusieurs niveaux de contexte :

1. **Contexte du projet** : Informations globales (sujet, problématique, etc.)
2. **Historique des conversations** : Les 50 derniers échanges
3. **Contenu des chapitres** : Tout le texte déjà rédigé
4. **Mémoire clé-valeur** : Informations extraites automatiquement

Cela permet à l'IA de :
- Ne jamais oublier les détails précédents
- Maintenir la cohérence sur 60+ pages
- Reprendre exactement là où vous vous êtes arrêté
- Ne pas mélanger les contextes entre sections

## 📦 Structure du Projet

```
AgentAA/
├── app/
│   ├── api/
│   │   ├── chat/          # Endpoint de chat avec streaming
│   │   ├── continue/      # Continuation de chapitre
│   │   ├── projects/      # CRUD projets
│   │   └── chapters/      # CRUD chapitres
│   ├── page.tsx           # Page principale
│   ├── layout.tsx         # Layout global
│   └── globals.css        # Styles globaux
├── lib/
│   ├── database.ts        # Gestion SQLite
│   └── gemini.ts          # Intégration Gemini
├── data/
│   └── memoire.db         # Base de données (auto-créée)
└── package.json
```

## 🔒 Confidentialité

- Toutes vos données sont stockées **localement** sur votre machine
- Seuls vos prompts et le contexte nécessaire sont envoyés à l'API Gemini
- Pas de serveur externe pour vos données
- Base de données SQLite locale

## 🛠️ Développement

### Build de production
```powershell
npm run build
npm start
```

### Lint
```powershell
npm run lint
```

## 📝 Licence

MIT - Libre d'utilisation pour vos projets personnels et académiques

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

## 👨‍💻 Auteur

**Ahmad Ahmad**
- GitHub: [@ahmedooo1](https://github.com/ahmedooo1?tab=repositories)
- Portfolio: [Mes Projets](https://github.com/ahmedooo1?tab=repositories)

**Créé avec 💜 pour faciliter la rédaction académique et l'assistance intelligente**

© 2025 MemoGenie - Tous droits réservés
