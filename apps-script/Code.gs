// Paste Code.gs, Index.html, Stylesheet.html and JavaScript.html into
// Extensions > Apps Script of your Google Sheet (one Apps Script "file"
// each — matching names/types). See README.md for full setup steps.

// Must match the tab name exactly. If you rename the tab, update this too.
var NAMES_SHEET_NAME = "Private Club Kyiv | Registration (landing)";
var RESPONSES_SHEET_NAME = "Responses";

// Column layout on the names tab:
// A = Ukrainian name (shown in the dropdown, searchable)
// B = English name (used for check-in search/match, shown in the dropdown)
// C = Email
// D = Kyiv Check-in status    E = Kyiv Check-in timestamp
// F = Warsaw Check-in status  G = Warsaw Check-in timestamp
var UK_NAME_COLUMN = 1;
var NAME_COLUMN = 2;
var EVENT_COLUMNS = {
  kyiv: { status: 4, timestamp: 5 },
  warsaw: { status: 6, timestamp: 7 },
};

var EVENT_META = {
  kyiv: "15 August 2026 · Mayachok, Kyiv",
  warsaw: "29 August 2026 · Warsaw",
};

function doGet(e) {
  var eventId = ((e.parameter && e.parameter.event) || "").toString().trim().toLowerCase();
  var template = HtmlService.createTemplateFromFile("Index");
  template.eventId = eventId;
  template.eventMeta = EVENT_META[eventId] || "";
  return template
    .evaluate()
    .setTitle("BetterMe Private Club — Check-In")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Called from the client via google.script.run — returns {uk, en} pairs for
// every row so the client can search/display both languages. `en` is the
// value later sent back to checkIn() and must stay unique (see NAME_COLUMN).
function getNames() {
  var sheet = getNamesSheet();
  return readNames(sheet);
}

// Called from the client via google.script.run when someone checks in.
function checkIn(name, eventId) {
  name = (name || "").toString().trim();
  eventId = (eventId || "").toString().trim().toLowerCase();

  if (!name) {
    throw new Error("Empty name");
  }

  var columns = EVENT_COLUMNS[eventId];
  if (!columns) {
    throw new Error("Unknown or missing event");
  }

  var sheet = getNamesSheet();
  var rowIndex = findRowByName(sheet, name);

  if (rowIndex === -1) {
    throw new Error("Name not found in the list");
  }

  var statusCell = sheet.getRange(rowIndex, columns.status);
  var alreadyCheckedIn = statusCell.getValue().toString().trim() !== "";

  statusCell.setValue("Checked In");
  sheet.getRange(rowIndex, columns.timestamp).setValue(new Date());

  logResponse(name, eventId);

  return { alreadyCheckedIn: alreadyCheckedIn };
}

function getNamesSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NAMES_SHEET_NAME);
  if (!sheet) {
    throw new Error('Names tab "' + NAMES_SHEET_NAME + '" not found');
  }
  return sheet;
}

function readNames(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) return [];

  var startCol = Math.min(UK_NAME_COLUMN, NAME_COLUMN);
  var width = Math.abs(NAME_COLUMN - UK_NAME_COLUMN) + 1;
  var values = sheet.getRange(1, startCol, lastRow, width).getValues();
  var ukOffset = UK_NAME_COLUMN - startCol;
  var enOffset = NAME_COLUMN - startCol;

  var people = [];
  for (var i = 0; i < values.length; i++) {
    var uk = (values[i][ukOffset] || "").toString().trim();
    var en = (values[i][enOffset] || "").toString().trim();
    if (en) people.push({ uk: uk, en: en });
  }
  return people;
}

function findRowByName(sheet, name) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) return -1;

  var values = sheet.getRange(1, NAME_COLUMN, lastRow, 1).getValues();
  var target = name.toLowerCase();
  for (var i = 0; i < values.length; i++) {
    var candidate = (values[i][0] || "").toString().trim().toLowerCase();
    if (candidate === target) return i + 1;
  }
  return -1;
}

function logResponse(name, eventId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(RESPONSES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(RESPONSES_SHEET_NAME);
    sheet.appendRow(["Timestamp", "Name", "Event"]);
  }
  sheet.appendRow([new Date(), name, eventId]);
}
