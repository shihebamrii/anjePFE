# Documentation Technique PFE — Portail Web ISET Gafsa (Backend)

## Partie 1 : Architecture Générale, Configuration et Modèles de Données

---

## Table des Matières (Partie 1)

1. [Présentation de l'Architecture Backend](#1-présentation-de-larchitecture-backend)
2. [Stack Technique Backend](#2-stack-technique-backend)
3. [Architecture des Dossiers](#3-architecture-des-dossiers)
4. [Point d'Entrée et Configuration Globale](#4-point-dentrée-et-configuration-globale)
5. [Sécurité et Authentification](#5-sécurité-et-authentification)
6. [Modèles de Données (Mongoose)](#6-modèles-de-données-mongoose)
7. [Base de Données et Relations](#7-base-de-données-et-relations)

---

## 1. Présentation de l'Architecture Backend

Le backend du portail web de l'ISET Gafsa est une application **Node.js** construite avec le framework **Express.js**. Il agit comme une **API RESTful** fournissant les données et les règles métier pour le frontend Next.js, tout en supportant des communications bidirectionnelles en temps réel grâce à **Socket.io**.

L'architecture repose sur le modèle **MVC (Modèle-Vue-Contrôleur)** adapté pour les API :
- **Routes** : Définissent les points de terminaison (endpoints) de l'API.
- **Controllers** : Contiennent la logique métier et le traitement des requêtes.
- **Models** : Définissent la structure des données et les interactions avec la base MongoDB via l'ODM Mongoose.
- **Middleware** : Filtrent et enrichissent les requêtes (authentification JWT, gestion des fichiers multipart).

---

## 2. Stack Technique Backend

| Technologie / Librairie | Version | Rôle |
|-------------------------|---------|------|
| **Node.js** | (Runtime) | Environnement d'exécution JavaScript côté serveur |
| **Express.js** | 5.2.1 | Framework serveur web léger et flexible |
| **MongoDB** | (Base) | Base de données NoSQL orientée documents |
| **Mongoose** | 8.23.0 | Object Data Modeling (ODM) pour MongoDB |
| **JSON Web Token (JWT)**| 9.0.3 | Gestion des sessions et sécurisation des API |
| **Bcrypt** | 6.0.0 | Hachage sécurisé des mots de passe |
| **Socket.io** | 4.8.3 | Serveur WebSocket pour le chat en temps réel |
| **Multer** | 2.1.1 | Middleware pour l'upload de fichiers (images, Excel) |
| **XLSX (SheetJS)** | 0.18.5 | Parsing des fichiers Excel (import de notes/étudiants) |
| **Dotenv / Cors** | 17.3 / 2.8| Variables d'environnement et autorisations cross-origin |

*Note : Le projet utilise les modules ES6 (`"type": "module"` dans `package.json`), privilégiant les `import/export` au lieu de `require`.*

---

## 3. Architecture des Dossiers

```
Backend/
├── controllers/                  # Logique métier par domaine
│   ├── academicController.js     # Gestion des cours, séances et salles
│   ├── attendanceController.js   # Logique des présences (individuelle/masse)
│   ├── authController.js         # Inscription, connexion, profil
│   ├── chatController.js         # Historique des messages
│   ├── complaintController.js    # Gestion des réclamations
│   ├── departmentController.js   # Gestion des classes, enseignants, imports
│   ├── eventController.js        # Gestion des événements
│   ├── gradeController.js        # Gestion des notes et import Excel
│   ├── newsController.js         # Gestion des actualités
│   ├── notificationController.js # Algorithme d'agrégation des notifications
│   ├── stageController.js        # Gestion des offres de stage
│   └── userController.js         # Administration des utilisateurs
├── middleware/                   # Fonctions intermédiaires
│   ├── authMiddleware.js         # Vérification du token JWT et des rôles
│   └── uploadMiddleware.js       # Configuration Multer pour les fichiers
├── models/                       # Schémas Mongoose
│   ├── Attendance.js, Complaint.js, Course.js, Department.js
│   ├── Event.js, Grade.js, Message.js, News.js, Room.js
│   ├── Session.js, Stage.js, User.js
├── routes/                       # Points de terminaison de l'API
│   ├── academicRoutes.js, attendanceRoutes.js, authRoutes.js, ...
├── socket/                       # Logique temps réel
│   └── chatHandler.js            # Gestion des événements Socket.io
├── uploads/                      # Dossier statique (fichiers uploadés)
├── .env                          # Variables d'environnement (PORT, MONGODB_URI, JWT_SECRET)
├── package.json                  # Dépendances du projet
└── server.js                     # Point d'entrée principal (Bootstrapping)
```

---

## 4. Point d'Entrée et Configuration Globale

### `server.js` (95 lignes)

Le fichier `server.js` est le cœur de l'application. Il orchestre :

1. **L'initialisation d'Express** : Configuration du parser JSON et de CORS.
2. **Le routage statique** : Exposition du dossier `/uploads` pour servir publiquement les fichiers joints ou les images.
3. **Le montage des routes API** : Ajout du préfixe `/api/` pour chaque module (ex: `/api/auth`, `/api/academic`).
4. **L'initialisation de Socket.io** :
   - Attachement au serveur HTTP `createServer(app)`.
   - **Middleware Socket** : Récupération du `token` JWT depuis `socket.handshake.auth.token` et validation avant d'autoriser la connexion WebSocket.
   - Délégation des événements à `chatHandler(io, socket)`.
5. **Connexion MongoDB** : Connexion via `mongoose.connect()` en utilisant `MONGODB_URI` puis démarrage du serveur sur le `PORT` 5000.

---

## 5. Sécurité et Authentification

### 5.1 Processus d'Authentification

L'authentification est de type *Stateless* (sans état) basée sur des tokens JWT.

- **Hashage (Bcrypt)** : Lors de l'inscription (`User.js` pre-save hook), le mot de passe en clair est salé (`genSalt(10)`) et haché avant insertion en base.
- **Génération JWT** : À la connexion (`authController.login`), un token est généré avec `jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' })`.

### 5.2 Middlewares (`authMiddleware.js`)

Deux middlewares principaux sécurisent l'API :

1. **`protect`** :
   - Extrait le token du header `Authorization: Bearer <token>`.
   - Vérifie sa validité via `jwt.verify()`.
   - Récupère l'utilisateur en base et l'injecte dans l'objet `req` (`req.user = user`).
   - Renvoie une erreur 401 si le token est manquant ou invalide.

2. **`authorize(...roles)`** :
   - Vérifie si le rôle de `req.user` fait partie du tableau des rôles autorisés passé en argument.
   - Renvoie une erreur 403 (Forbidden) si l'utilisateur n'a pas les droits nécessaires.

---

## 6. Modèles de Données (Mongoose)

Le backend utilise une base de données MongoDB flexible avec des schémas stricts garantis par Mongoose.

### 6.1 `User.js` (Utilisateurs de la plateforme)
Gère l'ensemble des acteurs (Étudiants, Enseignants, Administrateurs, Chefs de département, Partenaires).
- **Champs de base** : `firstName`, `lastName`, `email`, `password`, `role` (Enum), `isActive`, `avatar`.
- **Champs spécifiques (optionnels selon le rôle)** : `department`, `studentId`, `registrationNumber`, `classId`, `className`, `teacherId`.
- Mongoose ne retourne pas le `password` par défaut (`select: false`).

### 6.2 `Department.js` (Départements académiques)
Modélisation complexe avec **sous-documents embarqués** (Embedded Documents).
- **Champs** : `name`, `head` (nom du chef), `headEmail`.
- **`teachers` (Tableau de sous-documents)** : `firstName`, `lastName`, `email`, `grade`, `specialization`.
- **`classes` (Tableau de sous-documents)** : `name`, `level`, `track`, `students` (nombre), `academicYear`.
*Cette dénormalisation optimise la lecture car les enseignants et les classes sont souvent récupérés en même temps que le département.*

### 6.3 `Session.js` (Emploi du temps)
Structure granulaire pour le Drag & Drop du frontend.
- **Champs** : `course` (référence), `courseName`, `teacher` (objet id/name), `room` (objet id/name), `classId`, `className`, `type` (LECTURE, TUTORIAL, PRACTICAL).
- **Horodatage** : `dayOfWeek` (1 à 6), `timeSlot` (1 à 6), `semester`, `group` (ex: "Groupe 1").

### 6.4 `Attendance.js` (Présences)
- **Références** : `student` (User ID), `teacher` (User ID).
- **Champs** : `courseName`, `date`, `durationHours`, `status` (Enum: PRESENT, ABSENT, LATE, EXCUSED), `sessionType` (COURS, TD, TP), `justified`.
- **Index** : Index composé `{ student: 1, date: -1 }` pour accélérer les requêtes d'historique.

### 6.5 `Grade.js` (Notes)
- **Références** : `student`, `teacher`.
- **Champs** : `courseName`, `department`, `subject`, `score` (0-20), `coefficient`, `semester`, `type` (DS, EXAM, TP, TD).
- **Index** : Index `{ student: 1, semester: 1 }` pour la génération rapide des relevés.

### 6.6 `Complaint.js` (Réclamations)
Lie un étudiant à une note spécifique.
- **Champs** : `student`, `grade`, `reason`, `status` (PENDING, ACCEPTED, REJECTED), `response`, `resolvedBy`.

---

## 7. Base de Données et Relations

Contrairement au SQL classique, les relations MongoDB dans ce projet sont gérées de deux manières :
1. **Référencement (Normalization)** : Utilisation de `mongoose.Schema.Types.ObjectId` et de `ref: 'ModelName'` (ex: Lier un `Grade` à un `User`). L'API utilise les jointures via `.populate()` lorsque cela est nécessaire (ex: Récupérer les détails de la note dans une réclamation).
2. **Embarquement (Denormalization)** : L'entité `Department` contient les schémas complets `classSchema` et `teacherSchema` pour réduire les requêtes au serveur.

---

> **Suite dans DOCUMENTATION_PFE_BACKEND_PART2.md** — Contrôleurs, Logique Métier, Imports Excel, Notifications dynamiques, Temps réel et Routes.
