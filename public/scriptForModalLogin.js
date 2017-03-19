// Get the modal
var modal = document.getElementById('id01');

// When the user cliks anywhere outside of the modal, close it
window.onclick = function (event) {
    if(event.target == modal || event.target == document.querySelector('#logbtnModal')) {
        modal.style.display = 'none';
    }
};


//var socket = io();

//socket.emit('refresh old message');
