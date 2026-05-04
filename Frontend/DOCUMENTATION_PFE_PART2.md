# Documentation Technique PFE — Portail Web ISET Gafsa (Frontend)

## Partie 2 : Tableaux de Bord et Modules Fonctionnels

---

## Table des Matières (Partie 2)

9. [Dashboard Administrateur](#9-dashboard-administrateur)
10. [Dashboard Étudiant](#10-dashboard-étudiant)
11. [Dashboard Enseignant](#11-dashboard-enseignant)
12. [Dashboard Partenaire](#12-dashboard-partenaire)
13. [Dashboard Chef de Département](#13-dashboard-chef-de-département)
14. [Module Notes](#14-module-notes)
15. [Module Présences](#15-module-présences)
16. [Modules Transverses](#16-modules-transverses)
17. [Messagerie Temps Réel](#17-messagerie-temps-réel)
18. [Carte Interactive du Campus](#18-carte-interactive-du-campus)
19. [Thème et Design System](#19-thème-et-design-system)
20. [Recommandations et Perspectives](#20-recommandations-et-perspectives)

---

## 9. Dashboard Administrateur

### 9.1 Vue d'ensemble (`admin/page.jsx` — 164 lignes)

Le tableau de bord administrateur affiche une vue globale du système :

- **Cartes statistiques** : nombre total d'utilisateurs, actualités publiées, événements à venir
- **Actualités récentes** : liste des 5 dernières publications avec date et catégorie
- **Événements prochains** : calendrier des événements imminents
- **Boutons d'accès rapide** : liens vers la gestion des chefs, enseignants, étudiants

**Données chargées** : `userService.getUsers()`, `newsService.getNews()`, `eventService.getEvents()`

### 9.2 Gestion des Utilisateurs — Composant Réutilisable

Les pages `admin/chefs/page.jsx`, `admin/teachers/page.jsx` et `admin/students/page.jsx` sont des wrappers légers (~16 lignes chacun) qui instancient le composant générique `UsersManager`.

**`UsersManager.jsx` (314 lignes)** — Composant CRUD complet :

| Fonctionnalité | Description |
|----------------|-------------|
| Tableau de données | Affichage avec avatar (initiales), email, département, statut actif/inactif |
| Recherche | Filtre temps réel par nom ou email |
| Filtres avancés | Par département et par statut (actif/inactif) |
| Ajout | Modale avec formulaire (prénom, nom, email, mot de passe, département, statut) |
| Modification | Pré-remplissage du formulaire, mot de passe optionnel en édition |
| Suppression | Confirmation avant suppression définitive |

**Props du composant** :
- `roleFilter` : rôle à filtrer (`CHEF_DEPT`, `TEACHER`, `STUDENT`)
- `title` / `description` : textes d'en-tête
- `badgeIcon` : icône Lucide pour le titre

---

## 10. Dashboard Étudiant

### 10.1 Vue d'ensemble (`student/page.jsx` — 140 lignes)

Affiche les données personnelles de l'étudiant connecté :

- **Moyenne générale** : calculée via `calculateWeightedAverage()` depuis les notes récupérées
- **Taux de présence** : calculé via `getAttendanceRate()` depuis les enregistrements
- **Événements à venir** : liste des prochains événements du campus
- **Accès rapides** : liens vers notes, présences, emploi du temps, stages

### 10.2 Emploi du Temps Étudiant (`student/schedule/page.jsx` — 179 lignes)

Grille hebdomadaire en lecture seule :

- **6 jours** (Lundi → Samedi) × **6 créneaux horaires** (08:30 → 18:50)
- Chaque séance affiche : nom du cours, enseignant, salle, type (CR/TD/TP), groupe
- Codage couleur par type : bleu (Cours), vert (TD), ambre (TP)
- Données via `academicService.getStudentSchedule()` (résolution automatique par token)

---

## 11. Dashboard Enseignant

### 11.1 Vue d'ensemble (`teacher/page.jsx` — 199 lignes)

- **Séances du jour** : sessions filtrées par jour courant avec heure, salle et classe
- **Statistiques** : nombre de cours, classes, séances hebdomadaires
- **Accès rapides** : notes, présences, emploi du temps

### 11.2 Emploi du Temps (`teacher/schedule/page.jsx` — 179 lignes)

Même grille que l'étudiant mais avec la vue enseignant :
- Affiche la **classe cible** au lieu de l'enseignant
- Codage couleur : bleu (Cours), vert (TD), rose (TP)
- Données via `academicService.getTeacherSchedule()`

### 11.3 Mes Cours (`teacher/courses/page.jsx` — 132 lignes)

Grille de cartes affichant les cours assignés à l'enseignant :
- Nom du cours, type (Cours/TD/TP), classe associée
- Créneaux horaires avec jour, heure, salle et groupe
- Filtrage par type et recherche textuelle
- Données via `academicService.getTeacherCourses()`

### 11.4 Mes Classes (`teacher/classes/page.jsx` — 93 lignes)

Vue en cartes des classes où l'enseignant intervient :
- Nom de la classe, nombre de séances, cours enseignés (badges)
- Recherche par nom de classe ou de cours
- Données via `academicService.getTeacherClasses()`

---

## 12. Dashboard Partenaire

### 12.1 Vue d'ensemble (`partner/page.jsx` — 99 lignes)

Dashboard dédié à la gestion des offres de stage :
- **Compteurs** : offres ouvertes vs fermées
- **Liste des offres** : titre, type de stage, statut, date de publication
- **Bouton d'accès** : redirection vers le module stages pour créer de nouvelles offres
- Données via `stageService.getStages()`

---

## 13. Dashboard Chef de Département

Le chef de département dispose de l'espace le plus riche avec **6 sous-modules** CRUD complets.

### 13.1 Vue d'ensemble (`chef/page.jsx` — 165 lignes)

- **Statistiques départementales** : nombre d'enseignants, classes, étudiants
- **Distribution par grade** : répartition des enseignants (Maître Technologue, Technologue, etc.)
- **Liste récente** : derniers enseignants ajoutés
- Données via `departmentService.getMyDepartment()`

### 13.2 Gestion des Enseignants (`chef/teachers/page.jsx` — 320 lignes)

CRUD complet pour les enseignants du département :

| Fonctionnalité | Détail |
|----------------|--------|
| Tableau | Avatar, email (lien mailto), grade (badge coloré), spécialisation |
| Filtres | Recherche textuelle + filtre par grade académique |
| Grades supportés | Maître Technologue, Technologue, Enseignant Secondaire, Vacataire, Ingénieur, Professeur Émérite |
| CRUD | Ajout/modification via Dialog shadcn, suppression avec confirmation |
| Couleurs des grades | Violet (Maît.Tech), Bleu (Tech), Ambre (Ens.Sec), Gris (Vac), Vert (Ing), Rose (Prof.Em) |

### 13.3 Gestion des Étudiants (`chef/students/page.jsx` — 555 lignes)

Le module le plus complexe du chef avec **import en masse** :

**Fonctionnalités CRUD standard** :
- Tableau avec nom, email, numéro d'inscription, classe (badge)
- Filtrage par classe (DropdownMenu) et recherche textuelle
- Ajout/modification avec sélection de classe

**Import Excel en masse** :
1. Sélection de la classe de destination
2. Téléchargement d'un modèle Excel (template) généré côté client via `xlsx`
3. Upload du fichier rempli (.xlsx, .xls, .csv)
4. Parsing côté client : extraction des colonnes (Nom, Prénom, Email, N° Inscription)
5. Soumission via `departmentService.addBulkStudents(classId, studentsArray)`
6. Affichage des erreurs partielles et du message de succès

### 13.4 Gestion des Cours (`chef/courses/page.jsx` — 337 lignes)

Grille de cartes pour les matières du département :
- **Informations affichées** : nom, code, semestre, niveau (L1/L2/L3), filière
- **Volume horaire détaillé** : Cours (bleu), TD (ambre), TP (violet) avec total
- Filtrage par semestre et recherche
- CRUD complet via Dialogs avec saisie du volume horaire par type

### 13.5 Gestion des Classes (`chef/classes/page.jsx` — 274 lignes)

Cartes pour chaque classe du département :
- Nom, niveau (Licence 1/2/3), effectif, filière, année universitaire
- Filtrage par niveau et recherche
- CRUD complet (ajout, modification, suppression avec confirmation)

### 13.6 Emploi du Temps — Drag & Drop (`chef/schedule/page.jsx` — 525 lignes)

**Module le plus avancé techniquement** — Éditeur d'emploi du temps par glisser-déposer :

**Architecture** :
- **Panneau latéral** : formulaire de création de session (cours, enseignant, salle, type, groupe)
- **Grille principale** : 6 jours × 6 créneaux = 36 cellules de dépôt

**Workflow Drag & Drop** :
1. L'utilisateur configure une session dans le panneau latéral
2. Une carte draggable apparaît avec les détails
3. L'utilisateur glisse la carte vers une cellule vide de la grille
4. `handleDrop()` appelle `academicService.addSession()` avec les coordonnées (jour, créneau)
5. Les sessions existantes peuvent être déplacées entre cellules (mise à jour via `updateSession`)
6. Suppression via icône au survol de chaque session

**Données chargées en parallèle** : départements, cours, enseignants, salles via `Promise.all()`

### 13.7 Salles Disponibles (`chef/rooms/page.jsx` — 119 lignes)

Grille de cartes en lecture seule pour les salles :
- Nom, type (LAB/salle), bloc, capacité, disponibilité (✓/✗)
- Filtrage par type et recherche
- Codage couleur : ambre (LAB), bleu (salle classique)
- Salles indisponibles affichées en grisé

---

## 14. Module Notes

### 14.1 Page Notes (`grades/page.jsx` — 623 lignes)

Module multi-rôle avec vues différenciées :

**Vue Enseignant** :
- Sélection de la classe cible (DropdownMenu)
- **Saisie manuelle** : formulaire par étudiant (matière, type d'examen, note, coefficient)
- **Import Excel** : upload de fichier avec parsing automatique via `xlsx`
- Soumission via `gradeService.addGrade()` ou `gradeService.bulkUploadGrades()`

**Vue Étudiant** :
- Tableau personnel des notes avec matière, type, note, coefficient
- Filtrage par semestre
- Calcul automatique de la moyenne pondérée via `calculateWeightedAverage()`
- Bouton de réclamation pour contester une note

**Vue Chef de Département** :
- Consultation des notes par classe et par étudiant
- Accès aux réclamations soumises

---

## 15. Module Présences

### 15.1 Page Présences (`attendance/page.jsx` — 745 lignes)

Le module le plus volumineux, avec des vues multi-rôles :

**Vue Enseignant — Marquage en masse** :
1. Sélection de la classe via dropdown
2. Chargement automatique de la liste des étudiants via `attendanceService.getStudentsByClass()`
3. Sélection de la date et de la séance (créneau horaire)
4. Tableau avec checkbox par étudiant : Présent / Absent / Justifié
5. Soumission en lot via `attendanceService.markBulkAttendance()`

**Vue Étudiant** :
- Historique personnel des présences
- Taux de présence global calculé dynamiquement
- Filtrage par date

**Export PDF** (via `jspdf`) :
- En-tête avec logo ISET et informations de la classe
- Tableau formaté avec statut de chaque étudiant
- Pied de page avec date de génération et signature
- Téléchargement automatique du fichier

---

## 16. Modules Transverses

### 16.1 Actualités (`news/page.jsx` — 210 lignes)

- Liste des actualités avec titre, catégorie, contenu tronqué, date
- **CRUD** réservé aux rôles ADMIN et CHEF_DEPT
- Support d'upload d'images via `FormData`
- Filtrage par catégorie

### 16.2 Événements (`events/page.jsx` — 195 lignes)

- Calendrier des événements avec type, audience cible, date, lieu
- **CRUD** avec upload de fichiers (ressources associées)
- Filtrage par type et audience

### 16.3 Stages (`stages/page.jsx` — 216 lignes)

- Liste des offres de stage avec titre, entreprise, type, durée, statut
- **Création** réservée aux PARTNER et ADMIN
- Filtrage par type de stage (PFE, Stage d'été, etc.)
- Support `FormData` pour documents joints

### 16.4 Réclamations (`complaints/page.jsx` — 254 lignes)

Workflow de gestion des contestations de notes :

| Rôle | Actions |
|------|---------|
| Étudiant | Soumettre une réclamation (matière, note contestée, motif) |
| Enseignant/Chef | Consulter, accepter ou rejeter avec commentaire |

- Statuts : En attente → Acceptée / Rejetée
- Badges colorés par statut
- Résolution via `complaintService.resolveComplaint(id, { status, comment })`

### 16.5 Profil (`profile/page.jsx` — 106 lignes)

- Affichage des informations personnelles (nom, email, rôle)
- Pour les étudiants : classe, numéro d'inscription, moyenne, taux de présence
- Badge de rôle coloré

### 16.6 Annuaire Utilisateurs (`users/page.jsx` — 106 lignes)

- Tableau searchable de tous les utilisateurs
- Filtrage par rôle via onglets
- Affichage : avatar, nom complet, email, rôle (badge)

---

## 17. Messagerie Temps Réel

### 17.1 Architecture (`ChatInterface.jsx` — 259 lignes)

La messagerie utilise **Socket.io** pour la communication bidirectionnelle :

**Connexion** :
```
URL Socket = NEXT_PUBLIC_API_URL sans "/api"
Authentification via token JWT dans socket.auth
```

**Événements Socket.io** :

| Événement | Direction | Description |
|-----------|-----------|-------------|
| `join_room` | Client → Serveur | Rejoindre un salon |
| `leave_room` | Client → Serveur | Quitter un salon |
| `send_message` | Client → Serveur | Envoyer un message |
| `receive_message` | Serveur → Client | Recevoir un message |
| `typing` | Client → Serveur | Indicateur de saisie |
| `user_typing` | Serveur → Client | Notification de saisie |
| `stop_typing` | Bidirectionnel | Fin de saisie |

**Interface** :
- **Panneau gauche** : liste des salons avec recherche, types GENERAL et DEPARTMENT
- **Panneau droit** : zone de messages avec bulles (envoyé/reçu), horodatage, indicateur de saisie
- Historique chargé via `GET /chat/history/:roomId`
- Défilement automatique vers le dernier message

---

## 18. Carte Interactive du Campus

### 18.1 MapComponent (`components/home/MapComponent.js` — 132 lignes)

Composant Leaflet intégré à la page d'accueil via `next/dynamic` (SSR désactivé) :

**Configuration** :
- Centre : coordonnées GPS du campus ISET Gafsa `[34.4295, 8.7623]`
- Zoom : 17 (vue rapprochée)
- Tuiles : Google Maps (`mt0-mt3.google.com`)
- Scroll zoom désactivé pour UX

**Marqueurs** (6 points) :

| Lieu | Icône | Coordonnées |
|------|-------|-------------|
| ISET Gafsa (Direction) | Or | 34.4253, 8.7753 |
| Dép. Technologies de l'Informatique | Bleu | 34.4296, 8.7618 |
| Dép. Génie Électrique | Bleu | 34.4290, 8.7626 |
| Dép. Génie Mécanique | Bleu | 34.4291, 8.7623 |
| Dép. Génie Civil | Bleu | 34.4290, 8.7629 |
| Dép. Sciences Éco. et Gestion | Bleu | 34.4295, 8.7616 |

Chaque marqueur dispose d'un popup personnalisé avec nom, description et bouton itinéraire.

---

## 19. Thème et Design System

### 19.1 Tokens CSS (`globals.css` — 559 lignes)

**Couleurs de marque** :
- `--brand` : `#1a1f4e` (bleu marine ISET)
- `--brand-dark` : `#0f1235`
- `--gold` : `#c5a55a` (doré institutionnel)
- `--accent` : `#6366f1` (indigo pour les actions)

**Animations personnalisées** :
- `fade-in`, `slide-up`, `scale-in` : animations d'entrée
- `float` : animation de flottement pour éléments décoratifs
- `shimmer` : effet de brillance pour états de chargement
- `count-up` : animation pour les compteurs

**Utilitaires glassmorphism** :
- `.glass` : arrière-plan flou semi-transparent
- `.glass-dark` : variante sombre

**Mode sombre** :
- Support complet via la classe `dark` sur `<html>`
- Basculement via le bouton dans `Topbar.jsx`
- Variables CSS adaptatives pour surfaces, textes et bordures

---

## 20. Recommandations et Perspectives

### 20.1 Points Forts de l'Implémentation

- **Architecture modulaire** : séparation claire entre services, composants et pages
- **Réutilisabilité** : composants génériques (`UsersManager`, grilles d'emploi du temps)
- **Sécurité** : protection des routes, intercepteurs JWT, gestion automatique des sessions expirées
- **UX Premium** : animations, mode sombre, design responsive, glassmorphism

### 20.2 Axes d'Amélioration

| Aspect | Recommandation |
|--------|----------------|
| Backend Socket.io | Implémenter le serveur Socket.io pour activer la messagerie temps réel |
| Tests | Ajouter des tests unitaires (Jest) et E2E (Playwright) |
| Accessibilité | Auditer et améliorer la conformité WCAG |
| PWA | Ajouter le support hors-ligne et les notifications push |
| Internationalisation | Préparer le support multilingue (i18n) pour français/arabe |
| État global | Migrer vers Zustand ou Redux Toolkit pour les états complexes |
| Export PDF | Tester la compatibilité sur navigateurs mobiles |

### 20.3 Prérequis Backend

L'application frontend nécessite un backend Node.js/Express avec les endpoints suivants :
- `/api/auth/*` : authentification JWT
- `/api/academic/*` : gestion académique
- `/api/attendance/*` : présences
- `/api/grades/*` : notes
- `/api/news/*`, `/api/events/*` : contenu éditorial
- `/api/stages/*` : offres de stage
- `/api/departments/*` : gestion départementale
- `/api/users/*` : gestion utilisateurs
- `/api/complaints/*` : réclamations
- `/api/chat/*` : messagerie
- `/api/notifications` : notifications

---

> **Fin de la documentation technique Frontend — Projet de Fin d'Études ISET Gafsa**
>
> *Document rédigé dans le cadre du PFE — Année universitaire 2025-2026*
