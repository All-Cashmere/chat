var socket = io();

/*
socket.on('disconnect', function () {
    setCookie('username', null);
    console.log(getCookie('username'));
});
    */


if(getCookie('username') != null) {
    document.querySelector('#loginbtn').style.display = 'none';
    //document.querySelector('#loginbtn').innerHTML = 'Logout';
    //document.querySelector('#loginbtn').style.opacity = 0;

} else {
    document.querySelector('#logoutbtn').style.display = 'none';
    //document.querySelector('#loginbtn').innerHTML = 'Login';
    //document.querySelector('#logoutbtn').style.opacity = 0;
}

document.querySelector('#logoutbtn').onclick = function () {

   // if(document.querySelector('#loginbtn').innerHTML == 'Logout') {
        socket.emit('chat message', getCookie('username') + ' disconnected!', false);

        deleteCookie('username');


        //document.querySelector('#loginbtn').innerHTML = 'Login';
        document.querySelector('#logoutbtn').style.display = 'none';
        document.querySelector('#loginbtn').style.display = 'inline-block';
    //document.querySelector('#loginbtn').style.opacity = 1;
    //document.querySelector('#logoutbtn').style.opacity = 0;

  //  } else {
        //document.getElementById('id01').style.display='block';
  //  }
};