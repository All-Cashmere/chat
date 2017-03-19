var socket = io();

// send message on chat
document.querySelector('#sendForm').onsubmit = (function () {
    //alert(getCookie('username'));
    if(getCookie('username') == null){
        alert('Sign in, please!');
        return false;
    }

    socket.emit('chat message', getCookie('username')  + '> ' + document.querySelector('#m').value, true);
    document.querySelector('#m').value = '';


    setTimeout(function () {
        container.scrollTop = 100000000;
        Ps.update(container);
    }, 10);


    return false;
});
socket.on('chat message', function (msg) {
    var li = document.createElement('li');

    //li.innerHTML = (uname == undefined) ? uname + msg : msg;

    li.innerHTML = msg;

    document.querySelector('#messages').appendChild(li);

    setTimeout(function () {
        container.scrollTop = 100000000;
        Ps.update(container);
    }, 10);

    //Ps.update(document.querySelector('#div'));

    /*
     if(msg != 'deleteAllMessagesPlease') {
     var li = document.createElement('li');

     //li.innerHTML = (uname == undefined) ? uname + msg : msg;

     li.innerHTML = msg;

     document.querySelector('#messages').appendChild(li);
     } else {
     var mes = document.querySelector('#messages');

     while(mes.childElementCount) {
     document.removeChild(mes);
     }
     }
     */
});


//initialize scrollbar
var container = document.querySelector('#messages');

Ps.initialize(container, {
    wheelSpeed: 0.3,
    wheelPropagation: true,
    minScrollbarLength: 20
});


//Ps.initialize(container);

//Ps.update(container);



//handlersSocket on chat
socket.on('connect', function () {

    //var connectedUser = document.createElement('li');
    //alert('hh');
    socket.emit('get old message from chat');

    if(getCookie('username') != null) {
        socket.emit('chat message', getCookie('username') + ' connected!', false);
    }

    //document.querySelector('#messages').appendChild(connectedUser);

});

socket.on('disconnected', function (username) {
    console.log('dis');
    if(getCookie('username') != null && username != null) {
        socket.emit('chat message', username + ' disconnected!', false);
    }
});

socket.emit('getUsername', getCookie('username'));