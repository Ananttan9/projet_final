const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const mdp = require('password-hash');

let app = express();
let urlencodedparser = bodyParser.urlencoded({ extended: false });
app.set('trust proxy', 1) // trust first proxy
app.use(urlencodedparser)
app.use(express.static(__dirname + '/Views'));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ananttan'
});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected");
  connection.query("CREATE DATABASE IF NOT EXISTS Ananttandb", function (err, result) {
    if (err) throw err;
    console.log("Database created");

    connection.query('USE Ananttandb', (err, res) =>{
      if (err) throw err

      var sql = "CREATE TABLE IF NOT EXISTS Utilisateur (id INT AUTO_INCREMENT PRIMARY KEY, Utilisateur VARCHAR(255),Mdp VARCHAR(255),Mail VARCHAR(255)) ";
      connection.query(sql, function (err, result) {
        if (err) throw err;

        console.log(result);
      });
      var sql = "CREATE TABLE IF NOT EXISTS Memo (id INT AUTO_INCREMENT PRIMARY KEY, Nom VARCHAR(255), Message VARCHAR(255), Utilisateur INT, FOREIGN KEY (Utilisateur) REFERENCES Utilisateur(id))";
      connection.query(sql, function (err, result) {
        if (err){
          throw err;
        }
        console.log("Table created");
      });
      var sql = "CREATE TABLE IF NOT EXISTS Share (id INT AUTO_INCREMENT PRIMARY KEY, memoId INT , owner INT NOT NULL, reader INT,  FOREIGN KEY (memoId) REFERENCES Memo(id),  FOREIGN KEY (owner) REFERENCES Utilisateur(id), FOREIGN KEY (reader) REFERENCES Utilisateur(id))";
      connection.query(sql, function (err, result) {
        if (err){
          throw err;
        }
        console.log("Table created");
      });
    });
  })
});



app.get('/', (req, res) => {
  if (req.session.user_name !== undefined)
  res.redirect('/VoirMemo', {name : req.session.user_name})
  else {
    res.redirect('/Identification')
  }
}).get('/logout', function (req, res, next) {
  if (req.session.loggedin) {
    req.session.destroy();
    console.log("Deconnexion")
  }
  res.redirect('/');
}).get('/page1', (req, res) => {
  if (req.session.user_name !== undefined)
  res.redirect('/VoirMemo')
  else {
    res.redirect('/Identification')
  }

}).get('/Identification', (req, res) => {
  if (req.session.user_name !== undefined)
  res.redirect('/')
  else
  res.render('Identification.ejs')

}).get('/Inscription', (req, res) => {
  if (req.session.user_name !== undefined)
  res.redirect('/')
  else
  res.render('Inscription.ejs')
}).get('/Memo', (req, res) => {
  if (req.session.user_name === undefined)
  res.redirect('/')
  else{
    res.render('Memo.ejs', {name : req.session.user_name})
  }
}).get('/VoirMemo', function (req, res) {
  if (req.session.user_name === undefined)
  res.redirect('/')
  else{
    const query ="SELECT id FROM Utilisateur WHERE Utilisateur = ?"
    connection.query(query , [req.session.user_name], function (err, resu) {
      const sql = "SELECT * FROM Memo WHERE Utilisateur = ?";
      connection.query(sql,[resu[0].id], function (err, result) {
        if (err) throw err;
        const query = "SELECT * FROM Utilisateur WHERE Utilisateur != ?"
        connection.query(query,[req.session.user_name], function (error, users) {
          if (err) throw err;
          else {
            res.render('VoirMemo.ejs',{result ,  name : req.session.user_name, users});
          }
        })
      });
    })
  }
}).get('/shared', (req, res) => {
  if (req.session.user_name !== undefined){
    const userQuery = 'SELECT id FROM Utilisateur where Utilisateur = ?'
    connection.query(userQuery, [req.session.user_name] ,(err, me)  => {
      if (err) throw err
      else{
        const idUser = me[0].id
        const sharedQuery = 'SELECT memoId FROM Share WHERE reader = ?'
        connection.query(sharedQuery, [idUser], (err, result) => {
          if (err)              res.render('/')
          else{
            if(result.length === 0)
            res.render('a.ejs',{result : [], name : req.session.user_name})
            else{
              let all = []
              if (result.length == 0)
              res.redirect  ('/')
              else{
                var idMemoQuery = 'SELECT * FROM Memo WHERE id = ?'
                for(let i = 0; i < result.length; i++){
                  all.push(result[i].memoId)
                  if (i != 0)
                  idMemoQuery += ' OR id = ?'
                }
              }

              connection.query(idMemoQuery, all, (err, mems) => {
                if (err) throw err
                else
                {

                  res.render('a.ejs',{result : mems, name : req.session.user_name})

                }
              })
            }
          }
        })}
      })}else
      res.redirect('/')
    })



    app.post('/Inscription', function (req, res) {
      if (req.session.user_name !== undefined)
      res.redirect('/')
      else{

        const passwordHashed = mdp.generate(req.body.Mot_de_passe)
        const sql = "INSERT INTO Utilisateur (Utilisateur ,Mdp ,Mail) VALUES (?,?,?)";
        const values = [req.body.user_name, passwordHashed, req.body.user_email]
        console.log(values)
        connection.query(sql,values , function (err, result) {
          if (err)
          throw err;
        });

        res.redirect('/')
      }
    }).post('/Memo', function (req, res) {
      if (req.session.user_name === undefined)
      res.redirect('/')
      else{
        if (req.session.loggedin == true){
          var sql = "SELECT id FROM Utilisateur WHERE Utilisateur = ?";
          var value = [req.session.user_name];
          connection.query(sql, value, function (err, result) {
            var values = [req.body.Nom, req.body.Message, result[0].id];
            connection.query("INSERT INTO Memo (Nom,Message,Utilisateur) VALUES (?,?,?)", values, function (err, result2) {
              console.log(result2);
            });
          })
          res.redirect('/VoirMemo')
        } else {
          res.render('Memo.ejs')
        }
      }
    }).post('/Identification', function (req, res) {
      if (req.session.user_name !== undefined)
      res.redirect('/')
      else{

        const sql = "SELECT * FROM Utilisateur WHERE Utilisateur = ? ";
        const values = [req.body.user_name,req.body.Mot_de_passe];
        if (req.body.user_name && req.body.Mot_de_passe){
          connection.query(sql,values, function (err, result) {
            if (err) throw err;
            if (mdp.verify(req.body.Mot_de_passe, result[0].Mdp)){
              req.session.userID = result[0].Utilisateur
              console.log(req.session.userID)
              req.session.loggedin = true;
              req.session.user_name = req.body.user_name;
              console.log(result);
              res.redirect('/VoirMemo')
            }
            else {
              res.redirect('Identification')
            }
            res.end();
          });
        } else{
          res.redirect('Identification')
        }
      }
    }).post('/deleteMemo', (req, res) => {
      const id = req.body.idMemo
      const sharedQuery = 'DELETE FROM Share WHERE memoID = ?'
      connection.query(sharedQuery, [id], (err, result) => {
        if (err) throw err
      })
      const query = "DELETE FROM Memo WHERE id = ?"
      connection.query(query, [id], (err, result) => {
        if (err) throw err
      })
      res.redirect('/VoirMemo')
    }).post('/share', (req, res) => {
      if (req.body.values == '')
      res.redirect('/VoirMemo')
      else{
        let array = req.body.values.split(',')
        let memoId = req.body.idMemo
        let query = 'SELECT id FROM Utilisateur WHERE Utilisateur = ?'
        connection.query(query, [req.session.user_name], (err, me) =>{
          if (err) throw err;
          else{
            let idOwner = me[0].id
            let query = 'INSERT INTO Share(memoId, owner, reader) VALUES ( ? , ? , ?)'
            for(let i = 0; i < array.length; i++){
              connection.query(query, [memoId, idOwner, array[i]], (err, end) => {
                if (err) throw err;
                else {
                  console.log(end)
                }
              })
            }
          }
        })
      }
      res.redirect('/VoirMemo')

    }).post('/UpdateMemo', (req, res)=>{
      let title = req.body.title
      let content = req.body.content
      let idMemo = req.body.memoId
      const query = "UPDATE Memo SET Nom = '"+title+"', Message = '"+content+"' WHERE id = ?"

      connection.query(query, [idMemo], (err, result)=>{
        if(err) throw err
        else{
          res.redirect('/VoirMemo')
        }
      })
    })



    app.listen(8080)
    let displayObj = (lol) =>{
      let str = JSON.stringify(lol);
      str = JSON.stringify(lol, null, 4); // (Optional) beautiful indented output.
      console.log(str); // Logs output to dev tools console.
    }
