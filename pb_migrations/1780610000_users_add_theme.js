/// <reference path="../pb_data/types.d.ts" />
// The app saves a per-account theme (system/light/dark) to users.theme, but the
// field was only ever added by hand in the admin UI. Capture it in a migration
// so a rebuilt or local PocketBase doesn't silently drift from production.
// Guarded: skips if the field already exists (e.g. the live instance).
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")
  let exists = false
  try { exists = !!users.fields.getByName("theme") } catch (_) { exists = false }
  if (!exists) {
    users.fields.add(new Field({
      "id": "text_theme_pref", "name": "theme", "type": "text",
      "required": false, "presentable": false, "system": false, "hidden": false,
      "min": 0, "max": 0, "pattern": "", "autogeneratePattern": "", "primaryKey": false
    }))
    app.save(users)
  }
}, (app) => {
  const users = app.findCollectionByNameOrId("users")
  try {
    users.fields.removeById("text_theme_pref")
    app.save(users)
  } catch (_) {}
})
