document.addEventListener('DOMContentLoaded', function() {
    var navMenu = document.getElementsByClassName('nav-menu')[0];
    var navToggle = document.getElementsByClassName('nav-toggle')[0];
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('is-active');
        navToggle.classList.toggle('is-active');
    });
    var cardToggles = document.getElementsByClassName('card-toggle');
    for (var i = 0; i < cardToggles.length; i++) {
        cardToggles[i].addEventListener('click', function(e) {
            e.currentTarget.parentElement.parentElement.childNodes[3].classList.toggle('is-hidden');
        });
    }
});