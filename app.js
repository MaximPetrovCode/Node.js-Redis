const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const redis = require('redis');
const hbs = require('express-handlebars');

//Create Redis client
const client = redis.createClient();
client.on('connect', function (req, res, next) {
    console.log("Redis connected correctly!");
});

//Init app
const app = express();

//Set port
const port = 3000;

//view engine
app.engine('handlebars', hbs({ defaultLayout: 'index' }));
app.set('view engine', 'handlebars');

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res, next) {
    res.render('search');
});

app.post('/search', function (req, res, next) {
    let id = req.body.id;
    console.log(id);

    
    client.hgetall(id, function(err, obj){
        if(!obj){
            res.render('add',{
                error: 'There is no such data...'
            });
        }
        else{
            obj.id = id;
            res.render('details',{
                data: obj
            })
        }
    });
});

app.post('/add', function(req, res,next){
    let id = req.body.id;
    let age = req.body.age;
    let name = req.body.name;

    client.hgetall(id, function(err, obj){
        if(!obj){
            
            client.HMSET(id,['name',name,'age',age],function(err, reply){
                if(err){
                    console.log(err);
                }
                console.log(reply);
                res.redirect('/');
            });

            //Here function for adding data to DB
            console.log("Added "+ id);
        }
        else{
            obj.id = id;
            res.render('details', {
                data: obj,
                already: true
            });
        }
    });
});

app.post('/delete/:id',function(req, res){
    client.del(req.params.id);
    res.redirect('/');
});



app.listen(port, function (req, res, next) {
    console.log("Server is up on 3000 port!");
});