# 🚀 Mon Projet React (Gros Projet Scalable)

Un projet React moderne, bien structuré et prêt à l'emploi pour des applications de grande envergure. Conçu avec une architecture modulaire, typée et maintenable.

---

## 📦 Stack Technique
- **Frontend** : React 18 + TypeScript
- **Bundler** : Vite
- **Styling** : Tailwind CSS
- **State & Data** : TanStack Query (React Query)
- **Routing** : React Router v6
- **Validation** : Zod
- **Linter** : ESLint + Prettier
- **API Client** : Axios

---

## 🧱 Architecture
Le projet suit une **organisation par fonctionnalités (feature-based)** pour une meilleure scalabilité et maintenabilité.

```
src/
├── assets/         # Ressources statiques (images, fonts)
├── components/     # Composants UI réutilisables
├── features/       # Fonctionnalités métier (ex: auth, dashboard)
├── pages/          # Pages routées
├── lib/            # Services, utils, API
├── hooks/          # Hooks personnalisés
├── store/          # Gestion d'état global (Zustand/Redux)
├── types/          # Types TypeScript globaux
├── context/        # Contextes React (Auth, Theme, etc.)
├── routes/         # Configuration des routes
├── styles/         # Styles globaux et thème
├── config/         # Configuration (env, app config)
└── tests/          # Tests (unit, integration)
```

> ✅ Chaque `feature` est autonome : composants, hooks, services, types.

---

## 🚦 Fonctionnalités clés
- [x] Structure modulaire et scalable
- [x] Gestion centralisée des appels API
- [x] Typage fort avec TypeScript
- [x] Gestion des erreurs et loading states
- [x] Routing protégé
- [x] Linting et formatage automatique
- [ ] Internationalisation (i18n) – à ajouter
- [ ] Tests unitaires et d'intégration – à compléter

---

## 🔧 Technologies utilisées
| Outil | Usage |
|---------------------|--------------------------------------|
| React + Vite | Frontend rapide et moderne |
| TypeScript | Typage statique et sécurité |
| Tailwind CSS | Styling utility-first |
| TanStack Query | Gestion des données asynchrones |
| React Router | Navigation côté client |
| Zod | Validation de schémas |
| ESLint + Prettier | Qualité de code et formatage |

---

## 🚀 Démarrage du projet

### 1. Cloner le dépôt
```bash
git clone https://github.com/ton-pseudo/mon-projet-react.git
cd mon-projet-react
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
Crée un fichier `.env` à la racine :
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Démarrer le serveur de développement
```bash
npm run dev
```
Ouvre [http://localhost:5173](http://localhost:5173) dans ton navigateur.

---

## 🛠️ Scripts disponibles
| Script | Commande | Description |
|-------------|------------------------|-----------------------------------------|
| `dev` | `npm run dev` | Démarre le serveur de dev (Vite) |
| `build` | `npm run build` | Génère la version production |
| `preview` | `npm run preview` | Prévisualise la build en local |
| `lint` | `npm run lint` | Vérifie le code avec ESLint |
| `format` | `npm run format` | Formate le code avec Prettier |

---

## 🧪 Tests
Les tests sont placés dans `src/tests/`.
```bash
# À venir : configuration de Jest + React Testing Library
```

---

## 🧩 Bonnes pratiques
- ✅ **Feature-based architecture** : chaque fonctionnalité est isolée.
- ✅ **Single Responsibility** : chaque fichier a un rôle clair.
- ✅ **Hooks réutilisables** : logique d'état partagée dans `/hooks`.
- ✅ **Types globaux** : évite la duplication avec `/types`.
- ✅ **API centralisée** : tous les appels dans `/lib/api`.

---

## 🤝 Contribution
1. Fork le projet
2. Crée une branche (`git checkout -b feat/nouvelle-fonction`)
3. Commit tes changements (`git commit -m 'feat: ajoute X'`)
4. Push la branche (`git push origin feat/nouvelle-fonction`)
5. Ouvre une Pull Request

---

## 📄 Licence
Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus d'informations.

---

## 🙌 Remerciements
Merci d'utiliser ce starter kit ! Construit avec ❤️ pour les projets React de grande envergure.
