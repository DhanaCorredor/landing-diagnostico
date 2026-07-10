/* ===== Cotización por WhatsApp (PROTOTIPO) =====
   Mejora progresiva: sin JS, servicios.html/promociones.html quedan intactos.
   Añade botón "+" en cada servicio o promoción, una pastilla flotante y un
   panel que arma un mensaje de WhatsApp con lo seleccionado. Persiste en
   localStorage y se comparte entre servicios y promociones. */
(function () {
  'use strict';
  var WA = '584129160186';
  var KEY = 'diag_cotiz_v1';

  var rows = Array.prototype.slice.call(document.querySelectorAll('.srow, .prow'));
  if (!rows.length) return;

  // Estado: { id: {name, price} }
  var selected = {};
  try { selected = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { selected = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(selected)); } catch (e) {} }

  function priceOf(row) {
    var b = row.querySelector('.pprice') || row.querySelector('b');
    var n = b ? parseFloat(b.textContent.replace(/[^0-9.]/g, '')) : 0;
    return isNaN(n) ? 0 : n;
  }
  function nameOf(row) {
    // Promoción: usa el nombre del combo (.pname)
    var pname = row.querySelector('.pname');
    if (pname) return pname.textContent.replace(/\s+/g, ' ').trim();
    // Servicio: usa el <span> sin el <small> descriptivo
    var span = row.querySelector('span');
    if (!span) return '';
    var clone = span.cloneNode(true);
    var s = clone.querySelector('small');
    if (s) s.parentNode.removeChild(s);
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  var ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  // --- Botón "+" en cada fila ---
  rows.forEach(function (row, i) {
    var id = (row.classList.contains('prow') ? 'promo-' : 'svc-') + i;
    var name = nameOf(row), price = priceOf(row);
    row.setAttribute('data-qid', id);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'qadd';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Agregar ' + name + ' a la cotización');
    row.appendChild(btn);

    btn.addEventListener('click', function () {
      if (selected[id]) { delete selected[id]; }
      else { selected[id] = { name: name, price: price }; }
      save();
      paintRow(id);
      render();
    });

    row._qbtn = btn;
    row._qmeta = { id: id, name: name, price: price };
  });

  function paintRow(id) {
    var row = document.querySelector('[data-qid="' + id + '"]');
    if (!row) return;
    var on = !!selected[id];
    row.classList.toggle('is-added', on);
    var b = row._qbtn;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.innerHTML = on ? ICON_CHECK : ICON_PLUS;
    b.setAttribute('aria-label', (on ? 'Quitar ' : 'Agregar ') + row._qmeta.name);
  }

  // --- Pista bajo el encabezado ---
  var phead = document.querySelector('.phead');
  if (phead) {
    var hint = document.createElement('p');
    hint.className = 'qhint';
    hint.innerHTML = 'Toca <span class="qhint-plus">' + ICON_PLUS + '</span> para armar tu cotización y enviarla por WhatsApp.';
    phead.appendChild(hint);
  }

  // --- Pastilla flotante ---
  var bar = document.createElement('button');
  bar.type = 'button';
  bar.className = 'qbar';
  bar.setAttribute('aria-label', 'Ver tu cotización');
  bar.innerHTML =
    '<span class="qbar-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h2l1.2 11.2a1.5 1.5 0 0 0 1.5 1.3h8.2a1.5 1.5 0 0 0 1.5-1.2L20 8H6.2"/><circle cx="9.5" cy="20" r="1.2"/><circle cx="17.5" cy="20" r="1.2"/></svg><span class="qbar-count">0</span></span>' +
    '<span class="qbar-txt">Mi cotización</span>' +
    '<span class="qbar-total">$0</span>';
  document.body.appendChild(bar);
  bar.addEventListener('click', openSheet);

  // --- Panel (bottom sheet) ---
  var back = document.createElement('div');
  back.className = 'qsheet-back';
  back.innerHTML =
    '<div class="qsheet" role="dialog" aria-modal="true" aria-label="Tu cotización">' +
      '<div class="qsheet-grab"></div>' +
      '<div class="qsheet-head"><h2>Tu cotización</h2>' +
        '<button type="button" class="qsheet-x" aria-label="Cerrar">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="qsheet-list"></div>' +
      '<div class="qsheet-foot">' +
        '<div class="qsheet-total"><span>Total</span><b class="qsheet-sum">$0</b></div>' +
        '<p class="qsheet-note">Impuestos incluidos · Confirma tu cita con el centro.</p>' +
        '<a class="qsheet-wa" href="#" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.8-1.5A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.8.9.9-2.7-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 01-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 00-.7.3c-.2.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1z"/></svg>' +
          'Enviar por WhatsApp</a>' +
        '<button type="button" class="qsheet-more">Seguir agregando</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(back);

  var sheet = back.querySelector('.qsheet');
  var listEl = back.querySelector('.qsheet-list');
  var sumEl = back.querySelector('.qsheet-sum');
  var waEl = back.querySelector('.qsheet-wa');

  back.addEventListener('click', function (e) { if (e.target === back) closeSheet(); });
  back.querySelector('.qsheet-x').addEventListener('click', closeSheet);
  back.querySelector('.qsheet-more').addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

  function keys() { return Object.keys(selected); }
  function total() { return keys().reduce(function (s, k) { return s + (selected[k].price || 0); }, 0); }

  function openSheet() {
    if (!keys().length) return;
    buildList();
    back.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    back.classList.remove('open');
    document.body.style.overflow = '';
  }

  function buildList() {
    listEl.innerHTML = '';
    keys().forEach(function (k) {
      var it = selected[k];
      var row = document.createElement('div');
      row.className = 'qitem';
      row.innerHTML =
        '<span class="qitem-name"></span>' +
        '<b class="qitem-price"></b>' +
        '<button type="button" class="qitem-x" aria-label="Quitar">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
      row.querySelector('.qitem-name').textContent = it.name;
      row.querySelector('.qitem-price').textContent = it.price ? '$' + it.price : '';
      row.querySelector('.qitem-x').addEventListener('click', function () {
        delete selected[k]; save(); paintRow(k); render();
        if (!keys().length) { closeSheet(); } else { buildList(); }
      });
      listEl.appendChild(row);
    });
    sumEl.textContent = '$' + total();
    waEl.setAttribute('href', waLink());
  }

  function waLink() {
    var lines = ['Hola, quiero obtener una cita de los siguientes servicios:', ''];
    keys().forEach(function (k) {
      var it = selected[k];
      lines.push('* ' + it.name + (it.price ? ' — $' + it.price : ''));
    });
    lines.push('', 'Total $' + total(), 'Me confirman para cuando tienen disponibilidad, por favor.');
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function render() {
    var n = keys().length, t = total();
    bar.querySelector('.qbar-count').textContent = n;
    bar.querySelector('.qbar-total').textContent = '$' + t;
    bar.classList.toggle('show', n > 0);
  }

  // Estado inicial (si venía guardado)
  keys().forEach(paintRow);
  render();
})();
