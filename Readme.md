# Web Components - Lecteur Audio avec Visualiseur et Égaliseur

Ce tp est un lecteur audio est structuré à l'aide de **Web Components**. L'application est découpée en composants indépendants.

---

## Architecture des Composants

Le tp est divisé en trois briques :

### 1. `my-audio-player`
C'est le composant parent qui contient l'interface principale.
* **Rôle** : Gère le `AudioContext`, la playlist, le chargement des fichiers et la logique de lecture (play, pause, shuffle, loop).
* **Communication** : Il injecte les données audio vers le visualiseur et écoute les changements venant de l'égaliseur pour modifier les filtres.

### 2. `my-visualizer` (Le Rendu Graphique)
Ce composant s'occupe de transformer les données fréquentielles et temporelles en graphiques.
* **Affichage** :
    * **Spectrum Canvas** : Visualisation des fréquences (barres colorées).
    * **Waveform Canvas** : Visualisation de l'onde sonore (oscilloscope rose).

### 3. `my-equalizer` (Le Traitement Sonore)
Une grille interactive (6 bandes) pour modifier le gain des fréquences spécifiques.
* **Fréquences** : 60Hz, 170Hz, 350Hz, 1KHz, 3.5KHz, 10KHz.
* **Événement API** : `eq-change`. Il émet cet événement à chaque mouvement de slider pour informer le lecteur qu'il doit appliquer un gain (dB).

---