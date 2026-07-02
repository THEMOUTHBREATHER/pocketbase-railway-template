/// <reference path="../pb_data/types.d.ts" />
// The 2× banked-rate flag (second day of rest / stat holiday) rides on each
// entry. Guarded: skips if the field already exists.
migrate((app) => {
  const entries = app.findCollectionByNameOrId("entries")
  let exists = false
  try { exists = !!entries.fields.getByName("doubleOt") } catch (_) { exists = false }
  if (!exists) {
    entries.fields.add(new Field({
      "id": "bool_double_ot", "name": "doubleOt", "type": "bool",
      "required": false, "presentable": false, "system": false, "hidden": false
    }))
    app.save(entries)
  }
}, (app) => {
  const entries = app.findCollectionByNameOrId("entries")
  try {
    entries.fields.removeById("bool_double_ot")
    app.save(entries)
  } catch (_) {}
})
