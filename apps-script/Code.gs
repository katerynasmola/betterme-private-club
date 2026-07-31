// Paste this code into Extensions > Apps Script of your Google Sheet.
// See README.md for the full setup steps.

var RESPONSES_SHEET_NAME = "Responses";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var name = (data.name || "").toString().trim();

    if (!name) {
      return jsonResponse({ result: "error", error: "Empty name" });
    }

    var sheet = getOrCreateResponsesSheet();
    sheet.appendRow([new Date(), name]);

    return jsonResponse({ result: "success" });
  } catch (err) {
    return jsonResponse({ result: "error", error: err.message });
  }
}

function getOrCreateResponsesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(RESPONSES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(RESPONSES_SHEET_NAME);
    sheet.appendRow(["Timestamp", "Name"]);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
