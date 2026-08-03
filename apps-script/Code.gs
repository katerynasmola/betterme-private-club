// Paste this code into Extensions > Apps Script of your Google Sheet.
// See README.md for the full setup steps.

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

function doGet(e) {
  try {
    var sheet = getNamesSheet();
    var names = readNames(sheet);
    return jsonResponse({ result: "success", names: names });
  } catch (err) {
    return jsonResponse({ result: "error", error: err.message });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var name = (data.name || "").toString().trim();
    var eventId = (data.event || "").toString().trim().toLowerCase();

    if (!name) {
      return jsonResponse({ result: "error", error: "Empty name" });
    }

    var columns = EVENT_COLUMNS[eventId];
    if (!columns) {
      return jsonResponse({ result: "error", error: "Unknown or missing event" });
    }

    var sheet = getNamesSheet();
    var rowIndex = findRowByName(sheet, name);

    if (rowIndex === -1) {
      return jsonResponse({ result: "error", error: "Name not found in the list" });
    }

    var statusCell = sheet.getRange(rowIndex, columns.status);
    var alreadyCheckedIn = statusCell.getValue().toString().trim() !== "";

    statusCell.setValue("Checked In");
    sheet.getRange(rowIndex, columns.timestamp).setValue(new Date());

    logResponse(name, eventId);

    return jsonResponse({ result: "success", alreadyCheckedIn: alreadyCheckedIn });
  } catch (err) {
    return jsonResponse({ result: "error", error: err.message });
  }
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

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
