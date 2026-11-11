# Enviar el formulario a Google Sheets

The landing page is static — it runs on GitHub Pages with no server of its own, so
it cannot write to a spreadsheet by itself. The usual way to bridge that is a
**Google Apps Script web app**: a small script that lives inside your own Google
account, owns the sheet, and accepts a POST from the page.

Everything below happens in the Google account that will own the data
(**giro54@gmail.com**). None of it can be done from this repository — the script
has to be created and deployed while signed in as you.

Until `LEAD_ENDPOINT` is filled in, the form still works: it validates, hands the
conversation to WhatsApp and shows the confirmation page. It just writes nothing
down. That is a deliberate working state, not a half-finished one.

---

## 1. Create the sheet

1. Go to <https://sheets.new> while signed in as **giro54@gmail.com**.
2. Name it something like `Enerpy — Leads`.
3. Rename the first tab to **`Leads`** (bottom-left tab, double-click).
4. Put these headers in row 1, in this order:

   | A | B | C | D | E | F |
   |---|---|---|---|---|---|
   | Fecha | Nombre | WhatsApp | Mostrado | País | Origen |

## 2. Add the script

In that spreadsheet: **Extensiones → Apps Script**. Delete whatever is in the
editor and paste this:

```javascript
/**
 * Enerpy Ambiental — recibe el formulario de la landing y lo guarda en la hoja.
 * El script es dueño de la hoja porque está vinculado a ella, así que no hace
 * falta una API key ni credenciales en el sitio.
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActive().getSheetByName('Leads');
    var p = (e && e.parameter) || {};

    sheet.appendRow([
      p.enviado ? new Date(p.enviado) : new Date(),
      p.nombre   || '',
      // leading apostrophe: without it Sheets reads +59598112345 as a formula
      p.whatsapp ? "'" + p.whatsapp : '',
      p.mostrado || '',
      p.pais     || '',
      p.origen   || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    // never throw: the page cannot read the answer anyway, and an exception
    // here only fills the Apps Script log with noise
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** Visiting the URL in a browser should say something human, not crash. */
function doGet() {
  return ContentService.createTextOutput('Enerpy lead endpoint activo.');
}
```

Save it (disk icon) and give the project a name.

## 3. Deploy it

1. **Implementar → Nueva implementación**.
2. Gear icon next to "Tipo" → **Aplicación web**.
3. Fill in:
   - **Ejecutar como:** `Yo (giro54@gmail.com)`
   - **Quién tiene acceso:** `Cualquier usuario` ← this is required. The page
     posts anonymously; "Cualquier usuario con cuenta de Google" would reject it.
4. **Implementar**, then authorise when Google asks. It warns that the app is not
   verified — that is normal for your own script: **Configuración avanzada → Ir a
   (nombre del proyecto)**.
5. Copy the **URL de la aplicación web**. It looks like
   `https://script.google.com/macros/s/AKfy…long…/exec`.

## 4. Point the site at it

In [`main.js`](../main.js), find:

```javascript
var LEAD_ENDPOINT = '';
```

and paste the URL between the quotes. Then bump the `?v=` on the `main.js` tag in
both `index.html` and `gracias.html` so browsers pick up the change, commit and
push.

## 5. Check it

Open the live page, submit the form with your own name and number, and watch the
row appear in the sheet. If it does not:

- **Re-deploy after any script edit.** Apps Script keeps serving the deployed
  version, not the saved one. Use **Implementar → Gestionar implementaciones →
  editar → Versión: Nueva**.
- Confirm access is `Cualquier usuario`, not `Cualquier usuario con cuenta de Google`.
- Confirm the tab is named exactly `Leads`.
- Check **Ejecuciones** in the Apps Script editor to see whether the POST arrived.

---

## What the page sends

| Campo | Ejemplo | Nota |
|---|---|---|
| `enviado` | `2026-11-11T14:02:55.431Z` | ISO, set on the browser |
| `nombre` | `Ana Giménez` | as typed, trimmed |
| `whatsapp` | `595981123456` | E.164 digits, no `+`, trunk zero removed |
| `mostrado` | `+595 981 123456` | grouped for reading |
| `pais` | `PY` | ISO code of the selected dial code |
| `origen` | `https://…/index.html` | which page the form was on |

## Why it is sent the way it is

The POST goes out with `navigator.sendBeacon`, not `fetch`. The page navigates to
the confirmation immediately after submitting, and a normal `fetch` is cancelled
when the document unloads — the row would be lost exactly when the traffic is
real. `sendBeacon` hands the request to the browser, which completes it after the
page is gone. `fetch(…, {keepalive: true})` is the fallback for browsers without it.

Neither can read Apps Script's reply, because Apps Script does not send CORS
headers for a cross-origin POST. That is accepted on purpose: a failed write must
never cost a visitor their confirmation page. **If recording every lead matters
more than that, this needs a real backend endpoint, not Apps Script.**

## Before this collects real data

The form now gathers a name and a phone number and stores them in a Google
spreadsheet. That is personal data, and the page should say so:

- The note under the fields currently reads *"Usamos su nombre y su número solo
  para responderle por WhatsApp."* — accurate, but it does not mention storage.
- Paraguay's Ley 6534/2020 on personal data protection applies. Worth a line
  linking to a privacy policy, and worth confirming with the client who is
  responsible for the data and how long it is kept.
- The spreadsheet will hold customer contact details. Keep it out of "anyone with
  the link" sharing.
