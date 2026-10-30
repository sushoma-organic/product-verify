// =====================================================================
// SUSHOMA PRODUCT VERIFICATION — GOOGLE APPS SCRIPT (for the verify page)
// ---------------------------------------------------------------------
// Sheet columns (row 1 = headers, data from row 2):
//   A Product ID | B Invoice No | C Customer Name | D Mobile Number |
//   E Product Name | F Batch No | G MFG Date | H EXP Date | I Status
//
// Columns are found by their HEADER NAME, so you may change the order
// or add extra columns — just keep the header names as above.
// Product ID matches with or without dashes/spaces and in any case:
//   "ab12cd34" = "AB-12-CD34" = "ab 12 cd34"
// =====================================================================

var SHEET_NAME = "";   // leave "" to use the first sheet, or write the tab name e.g. "Products"
var TIMEZONE   = "Asia/Dhaka";

// Header name (lower-case, letters/numbers only) -> JSON key the page reads
var HEADER_MAP = {
  "productid": "product_id",  "id": "product_id",
  "invoiceno": "invoice_no",  "invoice": "invoice_no", "invoicenumber": "invoice_no",
  "customername": "customer_name", "customer": "customer_name", "name": "customer_name",
  "mobilenumber": "mobile", "mobile": "mobile", "mobileno": "mobile", "phone": "mobile",
  "productname": "product_name", "product": "product_name",
  "batchno": "batch_no", "batch": "batch_no", "batchnumber": "batch_no",
  "mfgdate": "mfg_date", "mfg": "mfg_date", "manufacturedate": "mfg_date",
  "expdate": "exp_date", "exp": "exp_date", "expirydate": "exp_date", "expiredate": "exp_date",
  "status": "status"
};

// Used only if the headers are not recognised (same order as listed above)
var DEFAULT_ORDER = ["product_id", "invoice_no", "customer_name", "mobile",
                     "product_name", "batch_no", "mfg_date", "exp_date", "status"];

function doGet(e) {
  var p = (e && e.parameter) || {};
  var callback = p.callback;
  var response;

  try {
    response = findProduct(p.id);
  } catch (err) {
    response = { success: false, message: "Server error: " + err };
  }

  var json = JSON.stringify(response);

  // Only allow a safe JSONP callback name
  if (callback && /^[A-Za-z_$][\w$.]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function findProduct(rawId) {
  var wanted = cleanId(rawId);
  if (!wanted) return { success: false, message: "Product ID not provided." };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  if (!sheet) return { success: false, message: "Sheet not found." };

  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: false, message: "Product not found in database." };

  var cols = mapColumns(rows[0]);
  var idCol = cols.product_id;

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (row[idCol] === "" || row[idCol] === null) continue;
    if (cleanId(row[idCol]) !== wanted) continue;

    return {
      success:       true,
      product_id:    cell(row, cols.product_id),
      invoice_no:    cell(row, cols.invoice_no),
      customer_name: cell(row, cols.customer_name),
      mobile:        mobile(cell(row, cols.mobile)),
      product_name:  cell(row, cols.product_name),
      batch_no:      cell(row, cols.batch_no),
      mfg_date:      cell(row, cols.mfg_date),
      exp_date:      cell(row, cols.exp_date),
      status:        cell(row, cols.status)
    };
  }
  return { success: false, message: "Product not found in database." };
}

// ---------- helpers ----------

// "ab-12 cd34" -> "AB12CD34"
function cleanId(v) {
  return String(v == null ? "" : v).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function mapColumns(headerRow) {
  var cols = {};
  for (var c = 0; c < headerRow.length; c++) {
    var key = HEADER_MAP[String(headerRow[c]).toLowerCase().replace(/[^a-z0-9]/g, "")];
    if (key && cols[key] === undefined) cols[key] = c;
  }
  if (cols.product_id === undefined) {           // headers not recognised -> fixed order
    cols = {};
    for (var k = 0; k < DEFAULT_ORDER.length; k++) cols[DEFAULT_ORDER[k]] = k;
  }
  return cols;
}

// Cell value as text; dates become yyyy-MM-dd (the page shows them nicely)
function cell(row, idx) {
  if (idx === undefined || idx >= row.length) return "";
  var v = row[idx];
  if (v instanceof Date) return Utilities.formatDate(v, TIMEZONE, "yyyy-MM-dd");
  return String(v == null ? "" : v).trim();
}

// Sheets drops the leading 0 of numbers: 1911199262 -> 01911199262
function mobile(v) {
  var s = String(v || "").trim();
  if (/^1\d{9}$/.test(s)) s = "0" + s;
  if (/^8801\d{9}$/.test(s)) s = "0" + s.slice(3);
  return s;
}

// ---------------------------------------------------------------------
// RUN ONCE: select "setupSheet" at the top of the editor and press Run.
// - Writes the headers in row 1 (only if row 1 is empty)
// - Makes Product ID (A) and Mobile Number (D) columns PLAIN TEXT
// - Puts back the leading 0 on mobile numbers already in the sheet
// ---------------------------------------------------------------------
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  var headers = ["Product ID", "Invoice No", "Customer Name", "Mobile Number",
                 "Product Name", "Batch No", "MFG Date", "EXP Date", "Status"];

  var first = sheet.getRange(1, 1, 1, headers.length).getValues()[0].join("");
  if (!first) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.setFrozenRows(1);

  var cols = mapColumns(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
  var maxRows = sheet.getMaxRows();
  [cols.product_id, cols.mobile, cols.invoice_no].forEach(function (c) {
    if (c === undefined) return;
    var range = sheet.getRange(1, c + 1, maxRows, 1);
    var values = range.getValues();
    range.setNumberFormat("@");                       // Plain text
    if (c === cols.mobile) {
      for (var r = 1; r < values.length; r++) {
        if (values[r][0] !== "") values[r][0] = mobile(String(values[r][0]));
      }
    }
    range.setValues(values.map(function (v) { return [String(v[0])]; }));
  });
  Logger.log("Sheet setup done.");
}

// Run this once from the editor to test (View → Logs / Execution log)
function testLookup() {
  Logger.log(JSON.stringify(findProduct("AB12CD34")));
}
