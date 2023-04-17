const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

function register(req, res) {
  const hash = bcrypt.hashSync(req.body.password, saltRounds);

  const data = {
    email: req.body.email,
    password: hash,
    date_of_birth: req.body.dateOfBirth,
    name: req.body.name,
    created_at: new Date(),
    deleted_at: null
  }

  req.getConnection((err, conn) => {
    conn.query('SELECT email FROM users where email = ? and deleted_at is not null', [data.email], (error, rows) => {
      if(error) {
        if(error.code === 'ER_DUP_ENTRY') res.status(400).send({ status: false, data: 'Email en uso' });
        return false;
      };
      if(rows.length > 0){
        conn.query('UPDATE users SET ? WHERE email = ?', [data, data.email], (error, results, fields) => {
          if(error){
            console.log(error);
            res.status(400).send({ status: false, error });
          }
          const token = jwt.sign(data, 'patty');
          delete data.password;
          delete data.deleted_at;
          res.status(200).send({ status: true, token, data });
        }); 
      }else{
        conn.query('INSERT INTO users SET ?', data, (error, results, fields) => {
          if(error) {
            if(error.code === 'ER_DUP_ENTRY') res.status(400).send({ status: false, data: 'Email en uso' });
            return false;
          };
          const token = jwt.sign(data, 'patty');
          delete data.password;
          delete data.deleted_at;
          res.status(200).send({ status: true, token, data });
        });
      }
    });

  });
}

function update(req, res) {
  const data = {
    // password: hash,
    date_of_birth: req.body.dateOfBirth,
    name: req.body.name,
    email: req.user.email,
    created_at: req.user.created_at,
    deleted_at: null
  }
  req.getConnection((err, conn) => {
    conn.query('UPDATE users SET ? WHERE email = ?', [data, req.user.email], (error, results, fields) => {
      if(error){
        console.log(error);
        res.status(400).send({ status: false, error });
      }
      const token = jwt.sign(data, 'patty');
      res.status(200).send({ status: true, token, data });
    }); 
  });
}

function destroy(req, res) {
  const data = {
    deleted_at: new Date()
  }
  req.getConnection((err, conn) => {
    conn.query('UPDATE users SET ? WHERE email = ?', [data, req.user.email], (error, results, fields) => {
      if(error){
        console.log(error);
        res.status(400).send({ status: false, error });
      }
      res.status(200).send({ status: true, msg: 'Eliminado correctamente' });
    }); 
  });
}

function auth(req, res) {
	let email = req.body.email;
	let password = req.body.password;
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM users WHERE email = ? AND deleted_at is NULL;', [email], (err, rows) => {
      if(rows.length > 0) {
        const isSame = bcrypt.compareSync(password, rows[0].password);
        if(!isSame) return  res.status(400).send({ status: false, data: 'Usuario o contraseña incorrectos' });
        const token = jwt.sign(req.body, 'patty');
        delete rows[0].password;
        delete rows[0].deleted_at;
        return res.status(200).send({ status: true, token, data: rows[0] });
      } else {
        return res.status(400).send({ status: false, data: 'Usuario o contraseña incorrectos' });
      }
    });
  });
}


function verify(req, res) {
  res.status(200).send({ status: true });
}

module.exports = {
  register,
  auth,
  verify,
  update,
  destroy
}
