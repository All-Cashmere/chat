function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options) {
    if(value == null) {
        console.log('lol');
        document.cookie = null;
        return;
    }

    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}
function deleteCookie(name) {
    setCookie(name, "", {
        expires: -1
    })
}
var socket = io();


document.querySelector('#loginbtn').onclick = function () {
    document.getElementById('id01').style.display='block';
};


document.forms.loginForm.onsubmit = (function () {

    var username = document.forms.loginForm.uname.value;
    var password = document.forms.loginForm.psw.value;

    socket.emit('login', username, password);



    //alert('h');
    /*
    var error = socket.emit('login', username, password);
    alert(error);
    if(error) {

    } else {
        /*
         это событие в отличии от socket.on('login', ...)
         будет выполняется только у конкретного пользователя
         но можно также куку заполнить на серверной части
         */
        //setCookie('username', username);
        //deleteCookie(username);

    //}
    //*/

    socket.on('loginCB', function (error) {
        //alert('h!!!!');
       if(error) {
           //console.log('wrong password');
           alert('wrong password!');
       } else {
           setCookie('username', username);

           socket.emit('chat message', getCookie('username') + ' connected!', false);

           document.querySelector('#loginbtn').style.display = 'none';
           document.querySelector('#logoutbtn').style.display = 'inline-block';

           //document.querySelector('#loginbtn').style.opacity = 0;
           //document.querySelector('#logoutbtn').style.opacity = 1;

           //document.querySelector('#loginbtn').innerHTML = 'Logout';

           /*
           var btn = document.querySelectorAll('button');
           for(var i = 0; i < btn.length; i++) {
               if(btn[i].innerHTML == 'Login') {
                   btn[i].style.display = 'none';
               }
               if(btn[i].innerHTML == 'Logout') {
                   btn[i].style.display = 'block';
               }
           }
           */
       }

       return false;
    });

    return false;
});



