# 🔊 Guide de la Lecture Vocale (Text-to-Speech)

## 📖 Vue d'ensemble

MemoGenie intègre maintenant une fonctionnalité de lecture vocale avancée qui permet d'écouter les messages à haute voix. Cette fonctionnalité utilise l'API Web Speech moderne du navigateur pour une expérience audio naturelle.

## ✨ Fonctionnalités

### 🎯 Lecture par message
- **Bouton sur chaque message** : Un bouton de haut-parleur (🔊) apparaît au survol de chaque message
- **Lecture individuelle** : Cliquez sur le bouton pour lire un message spécifique
- **Animation en direct** : Le bouton s'anime et change de couleur pendant la lecture
- **Arrêt simple** : Cliquez à nouveau pour arrêter la lecture

### 🎭 Lecture globale
- **Bouton dans le header** : Un bouton global pour lire toute la conversation
- **Lecture continue** : Lit tous les messages de l'IA d'un seul coup
- **Contrôle facile** : Arrêtez à tout moment en cliquant à nouveau

## 🌍 Support multilingue automatique

La lecture vocale détecte automatiquement la langue du texte :

| Langue | Code | Détection |
|--------|------|-----------|
| 🇫🇷 Français | fr-FR | Détection automatique des accents français |
| 🇸🇦 Arabe | ar-SA | Détection des caractères arabes (RTL) |
| 🇬🇧 Anglais | en-US | Langue par défaut |
| 🇷🇺 Russe | ru-RU | Détection de l'alphabet cyrillique |
| 🇨🇳 Chinois | zh-CN | Détection des caractères chinois |

## 🎨 Interface utilisateur

### Boutons de message
- **🟣 Violet** : Bouton normal (lecture non active)
- **🟠 Orange animé** : Lecture en cours
- **Icônes** :
  - 🔊 `Volume2` : Prêt à lire
  - 🔇 `VolumeX` : Lecture active (cliquez pour arrêter)

### Bouton global (header)
- Position : Dans la barre d'outils du header
- États :
  - Gris : Inactif
  - Violet au survol : Prêt
  - Orange pulsant : Lecture globale en cours

## ⚙️ Paramètres de lecture

Les paramètres par défaut sont optimisés pour une écoute confortable :

```javascript
utterance.rate = 1.0;    // Vitesse normale
utterance.pitch = 1.0;   // Tonalité normale
utterance.volume = 1.0;  // Volume maximum
```

## 🔧 Traitement du texte

Le système nettoie automatiquement le texte avant la lecture :
- ✅ Supprime les balises Markdown (`#`, `*`, `_`, etc.)
- ✅ Remplace les doubles sauts de ligne par des pauses
- ✅ Normalise les espaces
- ✅ Préserve le sens et la ponctuation

## 🎯 Cas d'usage

### 1. Accessibilité
- Idéal pour les utilisateurs malvoyants
- Permet de consommer le contenu en multitâche

### 2. Apprentissage
- Écouter des cours ou des résumés
- Améliorer la prononciation en langue étrangère

### 3. Productivité
- Écouter pendant d'autres tâches
- Révision audio des documents

### 4. Vérification
- Entendre le texte pour détecter des erreurs
- Valider le ton et le style

## 💡 Conseils d'utilisation

### ✅ Bonnes pratiques
1. **Utilisez un navigateur moderne** : Chrome, Edge, Safari ou Firefox
2. **Vérifiez votre volume** : Ajustez le volume système avant de commencer
3. **Messages courts** : Pour une meilleure expérience, privilégiez les messages < 500 mots
4. **Environnement calme** : Pour une écoute optimale

### ⚠️ Limitations
- La qualité vocale dépend du navigateur et du système d'exploitation
- Certains caractères spéciaux peuvent être mal prononcés
- Les blocs de code sont lus comme du texte normal

## 🌐 Compatibilité

### Navigateurs supportés
| Navigateur | Support | Qualité |
|------------|---------|---------|
| Chrome/Edge | ✅ Excellent | ⭐⭐⭐⭐⭐ |
| Safari | ✅ Très bon | ⭐⭐⭐⭐ |
| Firefox | ✅ Bon | ⭐⭐⭐ |
| Opera | ✅ Bon | ⭐⭐⭐ |

### Systèmes d'exploitation
- ✅ Windows 10/11
- ✅ macOS
- ✅ Linux
- ✅ Android
- ✅ iOS

## 🔮 Améliorations futures possibles

1. **Contrôles avancés**
   - Réglage de la vitesse de lecture
   - Choix de la voix (masculin/féminin)
   - Ajustement de la tonalité

2. **Playlist audio**
   - File d'attente de messages
   - Lecture automatique des nouveaux messages

3. **Export audio**
   - Télécharger la lecture en MP3
   - Partager l'audio

4. **Sous-titres en temps réel**
   - Suivre le texte pendant la lecture
   - Surlignage du texte lu

## 🐛 Résolution de problèmes

### La lecture ne fonctionne pas
1. Vérifiez que votre navigateur supporte Web Speech API
2. Autorisez l'accès au son dans les paramètres du navigateur
3. Rechargez la page

### La voix est de mauvaise qualité
- Essayez un autre navigateur (Chrome recommandé)
- Vérifiez les paramètres vocaux de votre système
- Installez des voix supplémentaires (Windows : Paramètres > Heure et langue > Voix)

### La lecture s'arrête brusquement
- Messages trop longs : divisez-les en parties plus petites
- Problème de connexion : vérifiez votre connexion internet
- Cache du navigateur : videz le cache et réessayez

## 📚 Ressources

- [Web Speech API Documentation](https://developer.mozilla.org/fr/docs/Web/API/Web_Speech_API)
- [SpeechSynthesis Interface](https://developer.mozilla.org/fr/docs/Web/API/SpeechSynthesis)
- [Browser Compatibility](https://caniuse.com/speech-synthesis)

---

**Profitez de votre expérience audio avec MemoGenie ! 🎧✨**
