var express = require('express');
let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var Message = mongoose.model('Message',{
  user : String,
  text : String,
  //category: String,
 // post: String,
});
var dbUrl = 'mongodb://localhost:27017/WorkerData'

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
})

mongoose.connect(dbUrl ,{ useNewUrlParser: true,useCreateIndex: true, useUnifiedTopology: true } ,(err) => {
  console.log('mongodb connected',err);
});
 
var port = process.env.PORT || 3000;
 
server.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});

