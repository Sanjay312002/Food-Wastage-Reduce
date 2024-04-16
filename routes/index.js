var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');

});
router.post('/', function (req, res, next) {
  console.log("post");
  let email = req.params.email;
  let password = req.params.password;
  dbConn.query('SELECT * FROM login WHERE email = "' + email + '"', function (err, rows, fields) {
    if (err) throw err
    if (rows.length <= 0) {
      req.flash('error', 'No user found')
      res.redirect('/')
    }
    else {
      if (password != row[0].password) {
        req.flash('error', 'wrong password')
        res.redirect('/')
      }
      res.render('/books/display');
    }
  })
})

module.exports = router;
