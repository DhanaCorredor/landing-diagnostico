/* Diagnóstico · Centro de Salud — comportamiento del sitio
   Mejora progresiva: el contenido funciona sin JavaScript. */
(function () {
  'use strict';

  var drawer = document.getElementById('drawer');
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('header.nav');

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  // Menú hamburguesa (móvil)
  if (burger && drawer) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
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

  // Animaciones de aparición al entrar en pantalla
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }
  }
})();
