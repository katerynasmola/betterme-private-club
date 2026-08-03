// Paste Code.gs, Index.html, Stylesheet.html and JavaScript.html into
// Extensions > Apps Script of your Google Sheet (one Apps Script "file"
// each — matching names/types). See README.md for full setup steps.

// Must match the tab name exactly. If you rename the tab, update this too.
var NAMES_SHEET_NAME = "Private Club Kyiv | Registration (landing)";
var RESPONSES_SHEET_NAME = "Responses";

// Column layout on the names tab:
// A = Full name (already there)
// B = Kyiv Check-in status   C = Kyiv Check-in timestamp
// D = Warsaw Check-in status E = Warsaw Check-in timestamp
var EVENT_COLUMNS = {
  kyiv: { status: 2, timestamp: 3 },
  warsaw: { status: 4, timestamp: 5 },
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

// Called from the client via google.script.run — returns the list of names
// straight from column A of the names tab.
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

  var values = sheet.getRange(1, 1, lastRow, 1).getValues();
  var names = [];
  for (var i = 0; i < values.length; i++) {
    var name = (values[i][0] || "").toString().trim();
    if (name) names.push(name);
  }
  return names;
}

function findRowByName(sheet, name) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) return -1;

  var values = sheet.getRange(1, 1, lastRow, 1).getValues();
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
