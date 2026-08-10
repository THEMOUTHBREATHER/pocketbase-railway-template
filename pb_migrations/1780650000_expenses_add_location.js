/// <reference path="../pb_data/types.d.ts" />
// Where the expense happened, shown per-card in the ESS "Enter Receipts"
// helper (separate from `reason`, which is the free-text activity note).
// Guarded: skips if the field already exists.
migrate((app) => {
  const expenses = app.findCollectionByNameOrId("expenses")
  let exists = false
  try { exists = !!expenses.fields.getByName("location") } catch (_) { exists = false }
  if (!exists) {
    expenses.fields.add(new Field({
      "id": "text_expense_location", "name": "location", "type": "text",
      "required": false, "presentable": false, "system": false, "hidden": false,
      "min": 0, "max": 0, "pattern": "", "autogeneratePattern": "", "primaryKey": false
    }))
    app.save(expenses)
  }
}, (app) => {
  const expenses = app.findCollectionByNameOrId("expenses")
  try {
    expenses.fields.removeById("text_expense_location")
    app.save(expenses)
  } catch (_) {}
})
