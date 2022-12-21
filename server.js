const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');
const { Connection } = require('pg');

const db = knex({
    client:'pg',
    Connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'admin',
        database: 'loginforwebcam'
    }
})

const app = express();

let initialPath = path.join(__dirname, "Public");

app.use(bodyParser.json());
app.use(express.static(initialPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(initialPath, "html/main.html"))
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(initialPath, "index.html"))
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(initialPath, "index.html"))
});
app.get('/register-user', (req, res) => {
    const{ name, email, password} = req.body;

    if(name.length || !email.length || !password.length){
        res.json('fill the field');
    } else {
        db("users").insert({
            name: name,
            email: email,
            password: password
        })
        .returning(["name", "email"])
        .then(data => {
            res.json(data[0])
        })
        .catch(err => {
            if(err.detail.includes('already exists')){
                res.json('email already exists');
            }
        })
    }
});

app.post('/login-user', (res, req) => {
    const {email, password } = req.body;

    db.select('name', 'email')
    .from('users')
    .where({
        email: email,
        password: password
    })
    .then(data => {
        if(data.length){
            res.json(data[0]);
        }else{
            res.json('Email or password is incorrect');
        }
    })
})

app.listen(3000, (req, res) => {
    console.log('Listening on port 3000........')
});