/* Enerpy Ambiental — página de confirmación */
(function () {
  'use strict';

  /* The lead never travels in the URL. Query strings end up in browser history,
     in referrer headers and in any analytics that logs the path, and a name plus
     a phone number is personal data — so index.html hands it over in
     sessionStorage, which stays in the tab and dies with it. A reader who opens
     this page directly, or reloads it after the tab was closed, simply gets the
     generic thank-you below instead of a broken one. */
  var raw = null;
  try { raw = sessionStorage.getItem('enerpy.lead'); } catch (e) { raw = null; }

  if (!raw) return;

  var lead;
  try { lead = JSON.parse(raw); } catch (e) { return; }
  if (!lead || !lead.name) return;

  var firstName = String(lead.name).trim().split(/\s+/)[0];
  var number = String(lead.display || '').trim();

  var h = document.getElementById('thanks-h');
  var p = document.getElementById('thanks-p');

  h.textContent = 'Gracias, ' + firstName + '.';

  p.textContent = number
    ? 'Recibimos su consulta. Un especialista de Enerpy Ambiental le escribe al ' + number + '.'
    : 'Recibimos su consulta. Un especialista de Enerpy Ambiental se pone en contacto con usted.';

  /* Read once. Reloading the page or coming back to it later should not keep
     replaying someone's name at them, and the entry has done its job. */
  try { sessionStorage.removeItem('enerpy.lead'); } catch (e) {}
})();
