# 🎯 Quiz des Drapeaux Régionaux Européens

Application web interactive pour tester vos connaissances sur les drapeaux des régions européennes.

![Quiz](https://img.shields.io/badge/Quiz-Interactive-blue)
![Régions](https://img.shields.io/badge/Régions-127-green)
![Pays](https://img.shields.io/badge/Pays-9-orange)

---

## 🌍 Description

Un quiz élégant et interactif qui teste vos connaissances sur **127 régions** de **9 pays européens** :

- 🇫🇷 France (13 régions)
- 🇩🇪 Allemagne (15 Länder)
- 🇨🇭 Suisse (25 cantons)
- 🇪🇸 Espagne (17 communautés)
- 🇮🇹 Italie (20 régions)
- 🇧🇪 Belgique (13 provinces)
- 🇳🇱 Pays-Bas (12 provinces)
- 🇦🇹 Autriche (7 Länder)
- 🇮🇪 Irlande (5 provinces)

---

## ✨ Fonctionnalités

- 🎮 **3 niveaux de difficulté** : Facile (5Q), Moyen (10Q), Difficile (15Q)
- 🌐 **10 modes de jeu** : Par pays ou tous les pays mélangés
- 📊 **Feedback en temps réel** : Score et progression visuelle
- 🎨 **Design sophistiqué** : Interface élégante et responsive
- 📱 **Mobile-friendly** : Fonctionne sur tous les appareils

---

## 🚀 Démarrage Rapide

### Prérequis

- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Python 3 (pour le serveur local)

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/quiz-drapeaux-europe.git
cd quiz-drapeaux-europe

# Lancer le serveur local
python3 -m http.server 8000
```

### Utilisation

Ouvrez votre navigateur et allez sur :
```
http://localhost:8000/
```

---

## 📁 Structure du Projet

```
quiz-drapeaux-europe/
├── quiz.html              # Page principale
├── css/
│   └── style.css          # Styles de l'application
├── js/
│   └── quiz.js            # Logique du quiz
├── data/
│   └── regions.json       # Données des 127 régions
└── drapeaux_regions/      # 127 drapeaux au format PNG
```

---

## 🎮 Comment Jouer

1. **Sélectionnez un pays** (ou "Tous les pays")
2. **Choisissez la difficulté** (Facile, Moyen, Difficile)
3. **Devinez les régions** à partir de leurs drapeaux
4. **Recevez votre score** avec un message personnalisé

---

## 🛠️ Technologies

- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec variables CSS
- **JavaScript ES6+** : Logique avec async/await
- **JSON** : Format de données structurées

---

## 🎨 Captures d'écran

### Écran de Configuration
Interface élégante pour choisir le pays et la difficulté.

### Quiz en Action
Affichage du drapeau avec 4 options de réponse.

### Résultats
Score détaillé avec statistiques et message personnalisé.

---

## 📝 Licence

Projet libre d'utilisation à des fins éducatives.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout d'une fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

---

## 📧 Contact

Créé avec ❤️ pour l'apprentissage des régions européennes.

---

## ⭐ Remerciements

- Drapeaux sous licence libre
- Polices : Google Fonts (Playfair Display, Source Sans 3)
