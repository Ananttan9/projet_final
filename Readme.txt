Kanageswaran Ananttna

Présentation:

Le site est un aide-mémoire qui permet à des utilisateurs de s’inscrire puis de s’authentifier 
avec un identifiant et un mot de passe, puis de créer et d’afficher des mémos 
(de simples blocs de texte), le tout enregistré dans une base de donnée. 
L'utilisateur peux modifier un mémo ainsi que le partager avec un ou plusieurs autres utilisateurs.



"name": "aidememoire",
  "version": "1.0.0",
  "description": "projet aide memoire ananttan kanageswaran",
  "main": "mainAnanttan.js",
  "dependencies": {
    "body-parser": "^1.19.0",
    "bootstrap": "^4.4.1",
    "cookie-session": "^1.4.0",
    "ejs": "^3.0.1",
    "express": "^4.17.1",
    "express-session": "^1.17.0",
    "mysql": "^2.18.1",
    "npm": "^6.14.3",
    "password-hash": "^1.2.2"

J'ai un fichier package.json du coup
il suffit de faire un :
npm install

Celà installera tous ce dont nous avons besoin.

Si celà ne fonctionne pas alors:
npm install mysql
npm install body-parser
npm install ejs
npm install express
npm install express-session
npm install password-hash	
npm install bootstrap

Configuration de la base de donnée:
-Modifier les lignes 15 (host), 16 (user) et 17 (password) si nécessaire.
(Ma base de donnée se nomme Ananttandb)

Pour lancé le projet on exécute l'une des commandes suivantes:
nodejs main.js
ou
nodemon main.js 


Puis ouvrir localhost:8080/ sur un navigateur.

Sur le site on peux faire:
-l'inscription avec identiant et
authentication par mot de passe.
-Se Connecter et se Déconnecter.
-Mot de passe hasher dans la base de donnée.
-Création de Mémo modifiable et enregistrement dans la base de donnée si elle existe.
-Partage de Mémo avec les autres utilisateurs choisis.
-Bootstrap utiliser pour la mise en page du Site.


J'ai laisser mes console.log pour montrer que tout se passe bien.