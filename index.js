var express = require("express");
var app = express();

// memcached
var memjs = require('memjs');

// mongo
var mongoose = require("mongoose");

// mysql
var knex = require('knex');

// neo4j
var neo4j = require('neo4j');

// postgres
var knex = require('knex');

// rabbitMQ
var amqp = require('amqplib/callback_api');

// initializations

/* ================= memcached =================*/
var memcachedClient = memjs.Client.create('127.0.0.1:11211', {
  username: 'username',
  password: 'password'
});

module.exports.memcachedClient = memcachedClient;

/* ================= mongo =================*/
mongoose.connect("mongodb://localhost/test", function (err) {
  if (!err) {
    console.log("Connected to MongoDB");
  } else {
    console.error(err);
  }
});

app.get("/", function (req, res) {
  res.send("Hey buddy!");
});

var Thing = require("./model");

app.get("/:name", function (req, res) {
  Thing.find({ name: req.params.name }, function (err, t) {
    if (t.length < 1) {
      var thing = new Thing();
      thing.name = req.params.name;
      thing.save(function(err, savedThing) {
        if (err) {
          res.send(500);
        } else {
          res.send({returnObj: savedThing, created: true});
        }
      });
    } else {
      res.send({returnObj: t[0], created: false});
    }
  });
});

app.listen(3000);


/* ================= mysql =================*/
var db_mysql = knex.initialize({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'shippable',
    password : '',
    database : 'test'
  }
});

db_mysql.schema.hasTable('things').then(function (exists) {
  if (!exists) {
    console.log('Table does not exist, creating...');
    db_mysql.raw('CREATE TABLE things (name char(20));').then(function (res) {
      console.dir(res);
    });
  }
});

module.exports.db_mysql = db_mysql;

/* ================= neo4j =================*/
// var db_neo4j = new neo4j.GraphDatabase('http://localhost:7474');
// module.exports.db_neo4j = db_neo4j;


/* ================= postgres =================*/
var db_postgres = knex.initialize({
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    user     : 'postgres',
    password : '',
    database : 'app_test'
  }
});

module.exports.db_postgres = db_postgres;

/* ================= rabbitMQ =================*/

module.exports.rabbit_send = function (done) {
  amqp.connect('amqp://localhost', function(err, connection) {});

  amqp.connect('amqp://localhost', function(err, connection) {
    connection.createChannel(function(err, ch) {});
  });

  amqp.connect('amqp://localhost',
    function(err, connection) {
      connection.createChannel(
        function(err, ch) {
          var q = 'hello';

          ch.assertQueue(q, {durable: false});
          ch.sendToQueue(q, new Buffer('Hello World!'));
          console.log(" [x] Sent 'Hello World!'");
          return done(null, 'sent message');
        }
      );
    }
  );
};

module.exports.rabbit_receive = function (done) {
  amqp.connect('amqp://localhost',
    function(err, conn) {
      conn.createChannel(
        function(err, ch) {
          ch.consume('hello',
            function(msg) {
              console.log(" [x] Received %s", msg.content.toString());
              return done(null, msg.content.toString());
          },
          {noAck: true});
        }
      );
    }
  );
};
