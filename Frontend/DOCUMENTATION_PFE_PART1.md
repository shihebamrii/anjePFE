# Documentation Technique PFE — Portail Web ISET Gafsa (Frontend)

## Partie 1 : Architecture Générale, Configuration et Pages Publiques

---

## Table des Matières (Partie 1)

1. [Présentation du Projet](#1-présentation-du-projet)
2. [Stack Technique](#2-stack-technique)
3. [Architecture des Dossiers](#3-architecture-des-dossiers)
4. [Configuration et Environnement](#4-configuration-et-environnement)
5. [Couche de Services API](#5-couche-de-services-api)
6. [Système d'Authentification](#6-système-dauthentification)
7. [Pages Publiques](#7-pages-publiques)
8. [Bibliothèque de Composants UI](#8-bibliothèque-de-composants-ui)

---

## 1. Présentation du Projet

Ce projet constitue le **frontend** du portail universitaire de l'Institut Supérieur des Études Technologiques (ISET) de Gafsa. Il s'agit d'une application web **monopage (SPA)** développée avec **Next.js 16** utilisant l'architecture **App Router**.

### 1.1 Objectifs Fonctionnels

- Fournir un espace extranet sécurisé pour 5 profils d'utilisateurs : **Administrateur**, **Enseignant**, **Étudiant**, **Partenaire**, **Chef de Département**
- Gérer les **notes**, **présences**, **emplois du temps**, **actualités**, **événements**, **stages** et **réclamations**
- Offrir une **messagerie temps réel** entre les acteurs via Socket.io
- Permettre l'**export PDF** des rapports de présence et l'**import Excel** des données en masse

### 1.2 Rôles Utilisateurs

| Rôle | Code | Accès Principal |
|------|------|----------------|
| Administrateur | `ADMIN` | Gestion globale, utilisateurs, actualités, événements |
| Enseignant | `TEACHER` | Notes, présences, emploi du temps, cours |
| Étudiant | `STUDENT` | Consultation notes/présences, emploi du temps, réclamations |
| Partenaire | `PARTNER` | Publication et gestion d'offres de stage |
| Chef de Département | `CHEF_DEPT` | Gestion départementale (enseignants, classes, cours, emploi du temps) |

---

## 2. Stack Technique

### 2.1 Dépendances Principales

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 16.0.0 | Framework React avec App Router |
| React | 19.0.0 | Bibliothèque UI |
| Tailwind CSS | 4.0.0 | Système de styles utilitaires |
| Axios | 1.8.4 | Client HTTP pour les appels API |
| Socket.io Client | 4.8.1 | Communication temps réel (chat) |
| Radix UI | Dernière | Composants accessibles (Dialog, Dropdown, etc.) |
| Lucide React | 0.475.0 | Bibliothèque d'icônes SVG |
| Leaflet | 1.9.4 | Cartes interactives |
| jsPDF | 2.5.2 | Génération de rapports PDF côté client |
| xlsx (SheetJS) | 0.18.5 | Import/export de fichiers Excel |
| Recharts | 2.15.3 | Graphiques et visualisations |

### 2.2 Typographies

- **Inter** : police principale sans-serif pour l'interface
- **Playfair Display** : police serif pour les titres éditoriaux (page d'accueil)

---

## 3. Architecture des Dossiers

```
Frontend/
├── app/                          # Routes Next.js (App Router)
│   ├── layout.js                 # Layout racine (AuthProvider, polices)
│   ├── page.js                   # Page d'accueil publique
│   ├── globals.css               # Styles globaux + thème Tailwind
│   ├── login/page.jsx            # Page de connexion
│   ├── register/page.jsx         # Page d'inscription
│   └── dashboard/                # Zone protégée
│       ├── layout.jsx            # Layout dashboard (Sidebar + Topbar + auth guard)
│       ├── admin/                # Dashboard administrateur
│       │   ├── page.jsx          # Vue d'ensemble admin
│       │   ├── chefs/page.jsx    # Gestion chefs de département
│       │   ├── teachers/page.jsx # Gestion enseignants
│       │   └── students/page.jsx # Gestion étudiants
│       ├── teacher/              # Dashboard enseignant
│       │   ├── page.jsx          # Vue d'ensemble enseignant
│       │   ├── schedule/page.jsx # Emploi du temps enseignant
│       │   ├── courses/page.jsx  # Cours assignés
│       │   └── classes/page.jsx  # Classes enseignées
│       ├── student/              # Dashboard étudiant
│       │   ├── page.jsx          # Vue d'ensemble étudiant
│       │   └── schedule/page.jsx # Emploi du temps étudiant
│       ├── partner/page.jsx      # Dashboard partenaire
│       ├── chef/                 # Dashboard chef de département
│       │   ├── page.jsx          # Vue d'ensemble département
│       │   ├── teachers/page.jsx # Enseignants du département
│       │   ├── students/page.jsx # Étudiants du département
│       │   ├── courses/page.jsx  # Cours et matières
│       │   ├── classes/page.jsx  # Gestion des classes
│       │   ├── schedule/page.jsx # Emploi du temps (drag & drop)
│       │   └── rooms/page.jsx    # Salles disponibles
│       ├── grades/page.jsx       # Module notes
│       ├── attendance/page.jsx   # Module présences
│       ├── news/page.jsx         # Module actualités
│       ├── events/page.jsx       # Module événements
│       ├── stages/page.jsx       # Module stages
│       ├── complaints/page.jsx   # Module réclamations
│       ├── chat/page.jsx         # Module messagerie
│       ├── users/page.jsx        # Annuaire utilisateurs
│       └── profile/page.jsx      # Profil personnel
├── components/                   # Composants réutilisables
│   ├── ui/                       # 57 composants shadcn/ui (Button, Card, Dialog, etc.)
│   ├── layout/
│   │   ├── Sidebar.jsx           # Barre latérale adaptative par rôle
│   │   └── Topbar.jsx            # Barre supérieure (notifications, dark mode)
│   ├── admin/
│   │   └── UsersManager.jsx      # CRUD utilisateurs générique (réutilisé par admin)
│   ├── chat/
│   │   └── ChatInterface.jsx     # Interface de messagerie temps réel
│   └── home/
│       └── MapComponent.js       # Carte interactive Leaflet du campus
├── context/
│   └── AuthContext.jsx           # Contexte d'authentification React
├── services/                     # Couche d'abstraction API
│   ├── api.js                    # Instance Axios (intercepteurs JWT + 401)
│   ├── authService.js            # Authentification (login, register, profil)
│   ├── academicService.js        # Cours, étudiants, emplois du temps, sessions
│   ├── attendanceService.js      # Présences (CRUD + bulk)
│   ├── gradeService.js           # Notes (CRUD + import Excel)
│   ├── newsService.js            # Actualités (CRUD + upload fichiers)
│   ├── eventService.js           # Événements (CRUD + upload fichiers)
│   ├── stageService.js           # Stages (CRUD)
│   ├── departmentService.js      # Départements, enseignants, classes
│   ├── userService.js            # Utilisateurs (CRUD)
│   └── complaintService.js       # Réclamations (CRUD + résolution)
├── lib/
│   └── utils.js                  # Utilitaires (moyennes, formatage, badges)
├── package.json                  # Dépendances et scripts
├── jsconfig.json                 # Alias `@/` pour imports
├── next.config.mjs               # Configuration Next.js
└── railway.json                  # Déploiement Railway CI/CD
```

---

## 4. Configuration et Environnement

### 4.1 Variables d'Environnement

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | URL de base de l'API backend |

### 4.2 Instance Axios (`services/api.js`)

L'instance Axios centralisée gère :
- **Intercepteur de requêtes** : injection automatique du token JWT depuis `localStorage`
- **Intercepteur de réponses** : redirection vers `/login` en cas de réponse 401 (token expiré) avec nettoyage du `localStorage`

### 4.3 Déploiement

Le fichier `railway.json` configure le déploiement sur **Railway** avec la commande `npm run build` suivie de `npm start`.

---

## 5. Couche de Services API

### 5.1 `authService.js` — Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `register(userData)` | `POST /auth/register` | Inscription + stockage token |
| `login(email, password)` | `POST /auth/login` | Connexion + stockage token |
| `logout()` | — | Nettoyage localStorage |
| `getProfile()` | `GET /auth/profile` | Récupération profil courant |
| `getCurrentUser()` | — | Lecture utilisateur depuis localStorage |

### 5.2 `academicService.js` — Gestion Académique

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `getMyCourses()` | `GET /academic/courses` | Cours du département |
| `getRooms()` | `GET /academic/rooms` | Salles disponibles |
| `getSchedule(classId)` | `GET /academic/schedule?classId=` | Emploi du temps d'une classe |
| `getStudentSchedule()` | `GET /academic/schedule/student` | Emploi du temps étudiant |
| `getTeacherSchedule()` | `GET /academic/schedule/teacher` | Emploi du temps enseignant |
| `getTeacherCourses()` | `GET /academic/teacher/courses` | Cours de l'enseignant |
| `getTeacherClasses()` | `GET /academic/teacher/classes` | Classes de l'enseignant |
| `addStudent/updateStudent/deleteStudent` | CRUD `/academic/students` | Gestion étudiants |
| `addCourse/updateCourse/deleteCourse` | CRUD `/academic/courses` | Gestion cours |
| `addSession/updateSession/deleteSession` | CRUD `/academic/sessions` | Gestion séances |

### 5.3 `attendanceService.js` — Présences

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `getAttendance(date, studentId)` | `GET /attendance` | Liste des présences filtrées |
| `markAttendance(data)` | `POST /attendance` | Marquer une présence |
| `markBulkAttendance(data)` | `POST /attendance/bulk` | Marquage en masse |
| `getStudentsByClass(className)` | `GET /attendance/students-by-class` | Étudiants par classe |

### 5.4 `gradeService.js` — Notes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `getGrades(semester, studentId)` | `GET /grades` | Notes filtrées |
| `addGrade(data)` | `POST /grades` | Ajout d'une note |
| `deleteGrade(id)` | `DELETE /grades/:id` | Suppression |
| `bulkUploadGrades(formData)` | `POST /grades/bulk-upload` | Import Excel (multipart) |

### 5.5 Autres Services

- **`newsService.js`** : CRUD actualités avec support `FormData` (images)
- **`eventService.js`** : CRUD événements avec upload de fichiers
- **`stageService.js`** : CRUD offres de stage avec filtrage par type/statut
- **`departmentService.js`** : Gestion département, enseignants, classes, import étudiants en masse
- **`userService.js`** : CRUD utilisateurs avec filtrage par rôle
- **`complaintService.js`** : Création et résolution des réclamations

---

## 6. Système d'Authentification

### 6.1 AuthContext (`context/AuthContext.jsx`)

Le contexte React `AuthContext` fournit à toute l'application :
- `user` : objet utilisateur courant (nom, email, rôle)
- `token` : JWT stocké
- `loading` : état de chargement initial
- `isAuthenticated` : booléen de connexion
- `login(email, password)` : fonction de connexion
- `register(userData)` : fonction d'inscription
- `logout()` : fonction de déconnexion

**Persistance** : les données sont stockées dans `localStorage` (`user` et `token`) et rechargées au montage du composant.

### 6.2 Protection des Routes

Le fichier `app/dashboard/layout.jsx` agit comme **garde de route** :
1. Vérifie `isAuthenticated` au chargement
2. Redirige vers `/login` si non authentifié
3. Affiche un écran de chargement pendant la vérification
4. Rend `null` si non authentifié (empêche le flash de contenu)

### 6.3 Redirection par Rôle

Après connexion réussie (`login/page.jsx`), l'utilisateur est redirigé vers :

| Rôle | Route de redirection |
|------|---------------------|
| ADMIN | `/dashboard/admin` |
| TEACHER | `/dashboard/teacher` |
| STUDENT | `/dashboard/student` |
| PARTNER | `/dashboard/partner` |
| CHEF_DEPT | `/dashboard/chef` |

---

## 7. Pages Publiques

### 7.1 Page d'Accueil (`app/page.js` — 986 lignes)

La page d'accueil est un composant `'use client'` qui présente l'ISET Gafsa aux visiteurs :

**Sections :**
1. **Hero cinématique** : titre animé avec dégradé, sous-titre et boutons d'action
2. **Statistiques animées** : compteurs dynamiques (étudiants, départements, taux de réussite)
3. **Grille Bento** : présentation visuelle des fonctionnalités en cartes asymétriques
4. **Départements** : chargement dynamique depuis l'API
5. **Actualités récentes** : dernières news chargées depuis le backend
6. **Événements à venir** : calendrier des prochains événements
7. **Carte interactive** : composant Leaflet (chargé dynamiquement via `next/dynamic` avec `ssr: false`)
8. **Pied de page** : informations de contact et liens utiles

### 7.2 Page de Connexion (`app/login/page.jsx` — 271 lignes)

Interface split-screen :
- **Panneau gauche** : branding ISET avec image de fond, fonctionnalités clés en cartes
- **Panneau droit** : formulaire de connexion (email + mot de passe avec toggle visibilité)
- Validation côté client : email valide + mot de passe ≥ 6 caractères
- Gestion des erreurs avec messages visuels

### 7.3 Page d'Inscription (`app/register/page.jsx` — 338 lignes)

Même design split-screen avec :
- Formulaire complet : prénom, nom, email, mot de passe (avec confirmation)
- **Sélection de rôle** : cartes visuelles pour Étudiant / Enseignant / Partenaire
- Validation complète côté client avant soumission

---

## 8. Bibliothèque de Composants UI

### 8.1 shadcn/ui — 57 Composants

Le dossier `components/ui/` contient **57 composants** basés sur Radix UI :

**Composants de navigation** : `navigation-menu`, `menubar`, `tabs`, `breadcrumb`, `pagination`, `sidebar`

**Composants de formulaire** : `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`, `calendar`, `combobox`, `field`, `form`

**Composants de feedback** : `alert`, `alert-dialog`, `dialog`, `drawer`, `sheet`, `popover`, `tooltip`, `hover-card`, `sonner`, `loading`, `spinner`, `skeleton`, `empty`, `progress`

**Composants de données** : `table`, `card`, `badge`, `avatar`, `carousel`, `chart`, `accordion`, `collapsible`

**Composants d'action** : `button`, `button-group`, `toggle`, `toggle-group`, `context-menu`, `dropdown-menu`, `command`

### 8.2 Composants Layout

**`Sidebar.jsx` (228 lignes)** :
- Navigation adaptative selon le rôle utilisateur (5 configurations différentes)
- Mode rétractable (collapsed) avec synchronisation CSS variable
- Version mobile via composant `Sheet` (drawer)
- Dégradés de couleurs par rôle (violet/admin, bleu/teacher, vert/student, etc.)

**`Topbar.jsx` (216 lignes)** :
- Salutation personnalisée avec date en français
- Basculement mode sombre/clair
- Système de notifications avec dropdown, marquage lu/non-lu, rafraîchissement toutes les 60s
- Menu utilisateur avec avatar (initiales), accès profil et déconnexion

### 8.3 Utilitaires (`lib/utils.js` — 117 lignes)

- `cn()` : fusion de classes Tailwind (clsx + tailwind-merge)
- `getInitials(firstName, lastName)` : extraction des initiales pour avatars
- `calculateWeightedAverage(grades)` : calcul de moyenne pondérée
- `getAttendanceRate(records)` : calcul du taux de présence
- `formatDate(date)` : formatage de date en français
- `getRoleBadge(role)` / `getStageTypeBadge(type)` : badges visuels dynamiques

---

> **Suite dans DOCUMENTATION_PFE_PART2.md** — Modules du Dashboard (Notes, Présences, Chef de Département, Messagerie, etc.)
