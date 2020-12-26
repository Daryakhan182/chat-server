var express = require('express');
let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
require('dotenv').config()


app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var Message = mongoose.model('Message',{
  user : String,
  text : String,
  //khan
  //category: String,
 // post: String,
});
//var dbUrl = 'mongodb://localhost:27017/WorkerData'
var dbUrl = process.env.dbUrl;
app.set('port', (process.env.PORT));
mongoose.connect(dbUrl ,{ useNewUrlParser: true,useCreateIndex: true, useUnifiedTopology: true });

 
 
io.on('connection', (socket) => {
 
  socket.on('disconnect', function(){
    io.emit('users-changed', {user: socket.username, event: 'left'});   
  });
 
  socket.on('set-name', (name) => {
    socket.username = name;
    io.emit('users-changed', {user: name, event: 'joined'});    
  });
  
  socket.on('send-message', (message) => {
     var newMessage = new Message();
     newMessage.user=socket.username;
      newMessage.text=message.text;
       newMessage.save((err) =>{
        if(err)
          sendStatus(500);
       });
    io.emit('message', {msg: message.text, user: socket.username, createdAt: new Date()});    
  });
});


app.get('/messages', function (req, res){
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
});

app.get('/chat',  function (req, res) {
  res.status(200).send({
    message: 'Express backend server'});
});


 
server.listen(app.get('port'));


console.log('chat server is on at port',app.get('port'));

