/**
 * SUIVI D'AUDIENCE MULTI-APPS + SCORES — À COLLER DANS GOOGLE APPS SCRIPT
 * (remplace tout le code existant, puis Déployer → Gérer les déploiements
 *  → Modifier → Version : Nouvelle version → Déployer)
 *
 * L'app envoie : e = événement, u = identifiant anonyme, d = appareil,
 * a = nom de l'app, m = module, s = score de fin de module (%), r = provenance.
 *
 * UNE ONGLET PAR APP, UNE LIGNE PAR UTILISATEUR, avec meilleurs scores par module.
 * NB : l'ajout de la colonne « Meilleurs scores » déclenche l'archivage automatique
 * des onglets à l'ancien format (Archive_<app>) — normal au premier passage.
 */
var ENTETES = ["Dernière activité", "Utilisateur", "Appareil", "Première visite", "Modules utilisés", "Nb d'événements", "Meilleurs scores (%)"];

/* Nettoie un nom d'app pour en faire un nom d'onglet Sheets valide. */
function nomOngletApp(app) {
  var n = String(app || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  n = n.replace(/[^A-Za-z0-9_\-]/g, "-").replace(/\-{2,}/g, "-").slice(0, 90);
  return n || "defaut";
}

/* Met à jour la colonne « Meilleurs scores » : garde le MAX par module.
   Format stocké : "flash:75%, quiz:100%" */
function majMeilleursScores(sh, ligne, module, score) {
  var prev = String(sh.getRange(ligne, 7).getValue() || "");
  var map = {};
  prev.split(",").forEach(function (part) {
    var morceaux = part.split(":");
    if (morceaux.length === 2) {
      var m = morceaux[0].trim();
      var v = Number(String(morceaux[1]).replace("%", "").trim());
      if (m && !isNaN(v)) map[m] = v;
    }
  });
  var s = Number(score);
  if (!isNaN(s) && (!map[module] || s > map[module])) map[module] = s;
  var texte = Object.keys(map).map(function (m) { return m + ":" + map[m] + "%"; }).join(", ");
  sh.getRange(ligne, 7).setValue(texte);
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const uid = String(p.u || "").slice(0, 40);
  const appareil = String(p.d || "appareil ?").slice(0, 60);
  const evenement = String(p.e || "inconnu");
  const module = String(p.m || "").slice(0, 40);
  const score = String(p.s || "");
  const referant = String(p.r || "");
  const app = nomOngletApp(p.a);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(app);
  if (!sh) {
    sh = ss.insertSheet(app);
    sh.appendRow(ENTETES);
    sh.setFrozenRows(1);
  }

  // Auto-vérification : en-têtes obsolètes → archivage de l'onglet et recréation propre.
  const actuelles = sh.getRange(1, 1, 1, ENTETES.length).getValues()[0];
  const ok = ENTETES.every(function (h, i) { return actuelles[i] === h; });
  if (!ok) {
    if (sh.getLastRow() > 1) {
      let arch = ss.getSheetByName("Archive_" + app);
      if (!arch) arch = ss.insertSheet("Archive_" + app);
      const plage = sh.getRange(1, 1, sh.getLastRow(), Math.max(sh.getLastColumn(), ENTETES.length));
      plage.copyTo(arch.getRange(1, 1));
      ss.deleteSheet(sh);
      sh = ss.insertSheet(app);
      sh.appendRow(ENTETES);
      sh.setFrozenRows(1);
    } else {
      sh.getRange(1, 1, 1, ENTETES.length).setValues([ENTETES]);
    }
  }

  if (uid && uid !== "anonyme") {
    // Recherche de la ligne de cet utilisateur (colonne Utilisateur)
    const last = sh.getLastRow();
    if (last >= 2) {
      const uids = sh.getRange(2, 2, last - 1, 1).getValues();
      for (let i = 0; i < uids.length; i++) {
        if (uids[i][0] === uid) {
          const r = i + 2;
          sh.getRange(r, 1).setValue(new Date());                              // dernière activité
          sh.getRange(r, 6).setValue(Number(sh.getRange(r, 6).getValue()) + 1); // compteur
          if (module) {
            const prev = String(sh.getRange(r, 5).getValue() || "");
            sh.getRange(r, 5).setValue(prev ? prev + ", " + module : module);
          }
          if (evenement === "score" && score !== "") majMeilleursScores(sh, r, module, score);
          return ContentService.createTextOutput("ok");
        }
      }
    }
    // Nouvel utilisateur : nouvelle ligne
    sh.appendRow([new Date(), uid, appareil, new Date(), module, 1, ""]);
    if (evenement === "score" && score !== "") majMeilleursScores(sh, sh.getLastRow(), module, score);
  } else {
    // Événements sans identifiant : journal brut commun (rare)
    let j = ss.getSheetByName("Journal");
    if (!j) {
      j = ss.insertSheet("Journal");
      j.appendRow(["Horodatage", "App", "Événement", "Module", "Provenance"]);
    }
    j.appendRow([new Date(), app, evenement, module, referant]);
  }

  return ContentService.createTextOutput("ok");
}
