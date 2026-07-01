/**
 * Insight-Grid — Registration backend
 * ------------------------------------
 * Deploy this as a Google Apps Script Web App bound to your
 * registration Google Sheet. See README.md for setup steps.
 *
 * Sheet tab name expected: "Registrations"
 * Header row (row 1) expected, in this order:
 *   Timestamp | Full Name | Phone | Email | Bundle | SIWES | Notes
 */

const SHEET_NAME = "Registrations";
const LUCKY_SLOTS = 10;

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Full Name", "Phone", "Email", "Bundle", "SIWES", "Notes"]);
  }
  return sheet;
}

function countRegistrations_() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  // Subtract 1 for the header row; never go below 0.
  return Math.max(0, lastRow - 1);
}

/**
 * Handles GET requests.
 * ?action=count    -> returns how many people are registered,
 *                      how many lucky-10 spots are left, and the price.
 * ?action=register -> appends a new registration row, reading the
 *                      registrant's details from the query parameters.
 *
 * Registration is done via GET (not POST) deliberately — Apps Script
 * Web Apps can drop the POST body during their internal redirect, but
 * GET query parameters survive that redirect reliably.
 */
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  if (action === "count") {
    const count = countRegistrations_();
    const slotsLeft = Math.max(0, LUCKY_SLOTS - count);
    const price = slotsLeft > 0 ? 90000 : 100000;
    return jsonOut_({ result: "success", count: count, slotsLeft: slotsLeft, price: price });
  }

  if (action === "register") {
    return registerEntry_(e.parameter);
  }

  return jsonOut_({ result: "error", error: "Unknown action" });
}

function registerEntry_(params) {
  try {
    const fullName = (params.fullName || "").trim();
    const phone = (params.phone || "").trim();
    const email = (params.email || "").trim();

    if (!fullName || !phone || !email) {
      return jsonOut_({ result: "error", error: "Missing required fields" });
    }

    const sheet = getSheet_();
    sheet.appendRow([
      params.timestamp || new Date().toISOString(),
      fullName,
      phone,
      email,
      params.bundle || "Excel + Power BI + SQL — Full 3-Month Bundle",
      params.siwes || "No",
      params.notes || ""
    ]);

    const count = countRegistrations_();
    return jsonOut_({ result: "success", count: count });

  } catch (err) {
    return jsonOut_({ result: "error", error: err.message });
  }
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
