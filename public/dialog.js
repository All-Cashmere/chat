var socket = io();

var ulUsers = document.querySelector('#users');
var ulMessages = document.querySelector('#messages');

socket.on('connect', function () {
    setCookie('socketId', socket.id);

    socket.emit('get users for dialog');

    socket.on('get users for dialog', function (users) {

        for(var i = 0; i < users.length; i++) {
            var li = document.createElement('li');

            li.innerHTML = users[i].username;
            //li.value = users[i]._id;



            ulUsers.appendChild(li);
        }
    });

});

socket.on('disconnect', function () {

    //socket.emit('removeFromConnectedUsers', getCookie('username'), getCookie('toUsername'));

    deleteCookie('toUsername');
    deleteCookie('socketId');


});

Ps.initialize(ulUsers, {
    wheelSpeed: 0.3,
    wheelPropagation: true,
    minScrollbarLength: 20
});
Ps.initialize(ulMessages, {
    wheelSpeed: 0.3,
    wheelPropagation: true,
    minScrollbarLength: 20
});




ulUsers.onclick = function (event) {
    if(getCookie('username') == null){
        alert('Sign in, please!');
        return;
    }
    else {
        //socket.emit('addToConnectedUsers', getCookie('username'));
        //socket.emit('removeFromConnectedUsers', getCookie('username'), getCookie('toUsername'));
    }


    while(ulMessages.firstChild) {
        ulMessages.removeChild(ulMessages.firstChild);
    }



    var elem = event.target;

    var fromUsername = getCookie('username');
    var toUsername = elem.innerHTML;




    var oldToUsername = getCookie('toUsername');
    setCookie('toUsername', toUsername);



    //document.location.href = 'http://localhost:3000/' + fromUsername + 'TO' + toUsername;
    //document.location.herf = 'http://localhost:3000/mes';
    //document.location.href = '/mes';
    //document.location.href = '/1';

    //io('http://localhost:3000').socket('/1');
   // var manager = new Manager('http://localhost:3000');
    //manager.socket('1');

    //socket.manager.socket('/1');

    //document.location.href = '/mes';



    socket.emit('clean rooms');


    socket.emit('connected to dialog', fromUsername + 'TO' + toUsername, toUsername + 'TO' + fromUsername);

/*
    if(toUsername != oldToUsername) {
        while(ulMessages.firstChild) {
            ulMessages.removeChild(ulMessages.firstChild);
        }



    }
    */

    // вот так вот странно я регенирирую старые сообщения, колбэками и обработчиками через обработчики
    socket.emit('old message from room', fromUsername, toUsername, function (messages) {
        socket.emit('dialog message front', messages);
        /*
        for(var i = 0; i < messages.length; i++) {
            socket.emit('dialog message front', messages[i]);
        }
        */
    });


    /*
    var firstLi = document.createElement('li');
    firstLi.innerHTML = 'You(' + fromUsername + ') write message to ' + toUsername;
    ulMessages.appendChild(firstLi);
*/

    document.querySelector('#headerOfMessages').innerHTML = "You(" + fromUsername + ") write message to " + toUsername;
    document.querySelector('#headerOfMessages').style.display = 'block';


    setTimeout(function () {
        ulMessages.scrollTop = 100000000;
        Ps.update(ulMessages);
    }, 10);


};

document.querySelector('#sendForm').onsubmit = (function () {
    if(getCookie('username') == null) {
        alert('Sign in, please!');
        return false;
    }
    if(getCookie('toUsername') == null) {
        alert('Choose someone, please');
        return false;
    }

    //socket.emit('say to someone',2 , document.querySelector('#m').value);
    socket.emit('dialog message', document.querySelector('#m').value);
    //socket.emit('dialog message', getCookie('username'), getCookie('toUsername'), document.querySelector('#m').value);
    document.querySelector('#m').value = '';


    setTimeout(function () {
        ulMessages.scrollTop = 100000000;
        Ps.update(ulMessages);
    }, 10);


    return false;

});
socket.on('dialog message', function (msg) {
   var li = document.createElement('li');
   // alert('j');

    if(msg.room.slice(0, msg.room.indexOf('TO')) == getCookie('username')) {
        li.style.cssText = 'text-align: right';
    } else {
        li.style.cssText = 'text-align: left';
    }

   li.innerHTML = msg.message;

   document.querySelector('#messages').appendChild(li);

    setTimeout(function () {
        ulMessages.scrollTop = 100000000;
        Ps.update(ulMessages);
    }, 10);

});





/*
socket.on('emit for another user', function (msg) {
   socket.emit('broadcast for another user', msg);
});
*/

/*
socket.on('dialog message', function (from, to, msg) {
    var li = document.createElement('li');

    alert('j');
    li.innerHTML = msg;

    document.querySelector('#messages').appendChild(li);
});
*/
/*


socket.emit('getUsername', getCookie('username'));
socket.emit('getSocketId', getCookie('socketId'));

    */