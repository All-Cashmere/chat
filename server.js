var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.set('port', (process.env.PORT || 3000));

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

//var connectedUsers = [];
var DB, /*SOCKET,*/ dialog;
/*
MongoClient.connect('mongodb://127.0.0.1:27017/chat2', function (err, db) {
    console.log('!');
    assert.equal(err, null);

    DB = db;
});*/
MongoClient.connect('mongodb://login:password@ds137370.mlab.com:37370/chat', function (err, db) {
  assert.equal(err, null);

  DB = db;
  console.log(db);
});


function getCookie(name, socket) {
    var matches = socket.request.headers.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}


app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');


app.use(express.static('public'));

app.get('/', function (req, res) {
   res.render('home.ejs');
});
app.get('/chat', function (req, res) {
    res.render('chat');
});

app.get('/dialog', function (req, res) {
   res.render('dialog');
});
/* почему-то не находит файлы, поэтому на замену следующий гет
app.get('/dialog/:id', function (req, res) {
    dialog = io.of('/dialog/:id');
    res.render('dialog');
});
*/

/*
app.get('/:id', function (req, res) {

   // dialog = io.of('/mes');
    console.log('llll');
    dialog = io.of('/:id');
   res.render('dialog');
});
*/





/* для личной страницы
app.get('/user/:id', function(req, res) {
    res.send('user ' + req.params.id);
});
*/
/*
для приватного сообщения
 io.on('connection', function(client){
 client.on('say to someone', function(id, msg){
 // send a private message to the socket with the given id
 client.broadcast.to(id).emit('my message', msg);
 });
 });
 */


/*
    If you want to send a message to everyone
    except for a certain socket, we have the broadcast flag:
*/



io.sockets.on('connection', function (socket) {


    /*
    socket.on('removeFromConnectedUsers', function (fromUsername, toUsername) {
       for(var i = 0, lim = 2; i < connectedUsers.length; i++) {
            if(connectedUsers[i] == undefined) {continue}
            if(fromUsername + 'TO' + toUsername == connectedUsers[i][0] || fromUsername + 'TO' + toUsername == connectedUsers[i][1]) {



                delete connectedUsers[i];

                lim--;

                if(lim == 0) {
                    lim = 2;
                    break;
                }
                //connectedUsers.splice(i, 1);

            }
       }
       //console.log(connectedUsers);
    });
    */

    socket.on('connected to dialog', function (room1, room2) {
        //console.log('1');

        //room1 - native room
        socket.handshake.headers.rooms = [room1, room2];

        socket.join(room1, function () {
            //  console.log(socket.rooms);
        });
        socket.join(room2, function () {
           //console.log(socket.rooms);
        });


    });

    socket.on('dialog message', function (msg) {

        //сохраняем одну из комнат, потому что когда будем отображать старые сообщения, так будет удобнее(для реализации)
        DB.collection('private_message').insertOne({date: new Date(), message: msg, room: socket.handshake.headers.rooms[0]
                                                        /*,room2: socket.handshake.headers.rooms[1]*/}, function (err, result) {
            assert.equal(err, null);
            console.log('message saved in private dialog: ' + result);


        });

        
        //io.to(socket.handshake.headers.rooms[0]).emit('notification', )

        //console.log(socket.handshake.headers.rooms[0], socket.handshake.headers.rooms[1]);
        debugger;
        //io.to(socket.handshake.headers.rooms[0]).emit('dialog message', msg);
        //io.to(socket.handshake.headers.rooms[1]).emit('dialog message', msg);
        io.to(socket.handshake.headers.rooms[0]).to(socket.handshake.headers.rooms[1]).emit('dialog message', {date: new Date(), message: msg, room: socket.handshake.headers.rooms[0]});
        debugger;
    });
    
    socket.on('old message from room', function (fromUsername, toUsername, callback) {
        //тут очень жесткие костыли, лучше не смотреть
       DB.collection('private_message').find({room: fromUsername + 'TO' + toUsername}).toArray(function (err, messages) {
           assert.equal(err, null);

           DB.collection('private_message').find({room: toUsername + 'TO' + fromUsername}).toArray(function (err, messages2) {
               assert.equal(err, null);

               //конкатинация
                for(var j = 0; j < messages2.length; j++) {
                    messages[messages.length] = messages2[j];
                }

               //console.log(messages);

               //сортировочка пузырьком по времени
                for(var k = 0; k < messages.length; k++) {
                    for(var l = 0; l < messages.length; l++) {
                        if(messages[k].date < messages[l].date) {
                            var temp = messages[k];
                            messages[k] = messages[l];
                            messages[l] = temp;
                        }
                    }
                }



               //console.log(messages);
               /*
               console.log(socket.handshake.headers.rooms[1]);
               for(var i = 0, isCompanionConnected; i < connectedUsers.length; i++) {
                   if(connectedUsers[i] == undefined) {continue}
                   if(connectedUsers[i][0] == socket.handshake.headers.rooms[1] || connectedUsers[i][0] == socket.handshake.headers.rooms[0]) {
                       console.log('h');
                       isCompanionConnected = true;
                       break;
                   }
               }
               */

               // таким колбэком мы отображаем старые сообщения только для пользователя, который "попросил это сделать"
                callback(messages);

                /*
               for(var i = 0; i < messages.length; i++) {

                   io.to(socket.handshake.headers.rooms[0]).to(socket.handshake.headers.rooms[1]).emit('dialog message', messages[i].message);
                   //socket.broadcast.to(socket.handshake.headers.rooms[0]).to(socket.handshake.headers.rooms[1]).emit('dialog message', messages[i].message);
                   //io.sockets.in(socket.handshake.headers.rooms[0]).in(socket.handshake.headers.rooms[1]).emit('dialog message', messages[i].message);
                   //socket.in(socket.handshake.headers.rooms[0]).in(socket.handshake.headers.rooms[1]).emit('dialog message', messages[i].message);

                   /*
                   if(isCompanionConnected) {
                       socket.to(socket.handshake.headers.rooms[0]).to(socket.handshake.headers.rooms[1]).emit('emit for another user', messages[i].message);
                   }
                   else {
                       io.to(socket.handshake.headers.rooms[0]).to(socket.handshake.headers.rooms[1]).emit('dialog message', messages[i].message);

                       // достаточно просто добавить комнату, собеседник которой уже подключился
                       var room = [socket.handshake.headers.rooms[0], socket.handshake.headers.rooms[1]];
                       connectedUsers.push(room);
                       //console.log(connectedUsers);
                   }
                   console.log(connectedUsers);
                   */

               //} */

           });

           //console.log('lol');
           //for(var i = 0; i < messages.length; i++) {
           //    io.to(socket.handshake.headers.rooms[0]).to(socket.handshake.headers.rooms[1]).emit('dialog message', messages[i].message);
           //}
       });


       /*
        DB.collection('private_message').find({room: toUsername + 'TO' + fromUsername}).toArray(function (err, messages) {
            assert.equal(err, null);

            console.log('lol');
            for(var i = 0; i < messages.length; i++) {
                io.to(socket.handshake.headers.rooms[0]).to(socket.handshake.headers.rooms[1]).emit('dialog message', messages[i].message);
            }
        });
*/

    });


    /*
    socket.on('broadcast for another user', function (message) {
        socket.to(socket.handshake.headers.rooms[0]).to(socket.handshake.headers.rooms[1]).emit('dialog message', message);
    });
    */

    // данный обработчик существует, потому что нужно было вызвать с клиента клиентский обработчик "dialog message"
    socket.on('dialog message front', function (messages) {
        for(var i = 0; i < messages.length; i++) {
            socket.emit('dialog message', messages[i]);
        }
    });

    socket.on('clean rooms', function () {
        if(socket.handshake.headers.rooms) {
            socket.leave(socket.handshake.headers.rooms[0], function () {

            });
            socket.leave(socket.handshake.headers.rooms[1], function () {

            });
        }
    });


    /*
    socket.on('dialog message', function (msg) {
        io.emit('dialog message', msg);
    });
*/
    //console.log(socket.rooms);


    //console.log(socket.request.headers.cookie);
    //console.log(getCookie('username', socket), ': ', getCookie('socketId', socket));
    //console.log(socket.id);






    // io.emit - для всех пользователей
    // socket.emit - для текущего пользователя

    //SOCKET = socket;
    /* Refresh old message */
    //io.emit('chat message')

    socket.on('get old message from chat', function () {
        //console.log('hh');
        DB.collection('message').find({}).toArray(function (err, messages) {
            assert.equal(err, null);


            for (var i = 0; i < messages.length; i++) {
                socket.emit('chat message', messages[i].message);
            }

        });
    });
    /*
    DB.collection('message').find({}).toArray(function (err, messages) {
        assert.equal(err, null);


        for (var i = 0; i < messages.length; i++) {
            socket.emit('chat message', messages[i].message);
        }

    });
    */

    // норм работает
    socket.on('get users for dialog', function () {
        //console.log('123');

        DB.collection('user').find({}).toArray(function (err, users) {
           assert.equal(err, null);

            socket.emit('get users for dialog', users);
        });


    });

    // ???
    /*
    socket.on('dialog message', function (from, to, msg) {

        DB.collection('private_message').insertOne({message: msg, from: from, to: to}, function (err, result) {
            assert.equal(err, null);
            console.log('message saved in private dialog');


        });


    });

    */

/*

    socket.on('test dialog', function (msg) {
        //console.log(dialog);
        console.log(dialog);
        dialog.emit('test_mes', msg);
    });

*/

    /*

    socket.on('getUsername', function (username) {
       socket.handshake.headers.username = username;
    });
*/



    socket.on('chat message', function (msg, save) {

        /* Save each message in database */
        if(save) { // подключение/отключение чтобы не сохраняло
            DB.collection('message').insertOne({message: msg}, function (err, result) {
                assert.equal(err, null);
                console.log('message saved');
            });
        }



        io.emit('chat message', msg);
    });


    socket.on('login', function (username, password) {

        var error;

        DB.collection('user').findOne({ username: username }, function (err, user) {

            if(err || !user || user.username != username) {
                DB.collection('user').insertOne({username: username, password: password}, function (err, result) {
                    assert.equal(err, null);



                    console.log('created new user: ' + username);
                    socket.handshake.headers.username = username;

                });
                return;
            }
            //console.log('in: ' + username + ' ' + user.username);

            if(user.password == password) {
                console.log(username + ' login');
                //Залогинимся просто :)
                //Делаем после такого логаут и чет с сессией, чтобы было все хорошо :)
                socket.handshake.headers.username = username;
                //console.log(socket.handshake.headers.username);
            } else {
                console.log('wrong password');
                error = 'Уже существует такой юзер :)';

            }

        });



        /*
            тут можно было бы заполнить куку пользователя
            socket.handshake.headers
            (нужно будет попробовать)
            (нельзя, пробовал(не видит на клиенте таких свойств))
            +++++
            можно вернуть ошибку обратно в ту функциюю, таким образом не понадобится довольнительный обработчик события
            (нельзя, пробовал)
         */
        /*
        socket.handshake.headers.cookie = username;
        console.log(socket.handshake.headers.cookie);
        */

        setTimeout( function () {
            //console.log(error);
            socket.emit('loginCB', error);
        }, 100);

    });


    socket.on('disconnect', function () {
        //console.log('dis');
        //socket.emit('chat message', 'deleteAllMessagesPlease');
        //console.log(socket.handshake.headers.username);
        io.emit('disconnected', socket.handshake.headers.username);
    });

});

/*
io.of('/dialog').clients(function (error, clients) {
   if(error) throw error;

   console.log(clients);
});
*/





http.listen(app.get('port'), function () {
    console.log('listening on *:3000');
});


/*
io.of('/').clients(function (error, clients) {
    if(error) throw error;

    console.log(clients);
});
   */

