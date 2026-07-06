/* Diagnóstico · Centro de Salud — comportamiento del sitio
   Mejora progresiva: el contenido funciona sin JavaScript. */
(function () {
  'use strict';

  var drawer = document.getElementById('drawer');
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('header.nav');

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
  }

  // Menú hamburguesa (móvil)
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      drawer.classList.toggle('open');
    });
    // Cerrar el menú al pulsar cualquier enlace
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });
  }

  // Navbar: transparente sobre el hero, blanco (con logo) al hacer scroll
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
