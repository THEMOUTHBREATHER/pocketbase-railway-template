/// <reference path="../pb_data/types.d.ts" />
// Enforce the `active` flag on ALL per-user data collections, including
// employee_info (missed by 1780500000).
//
// Why this re-states rules 1780500000 already tried to set: that migration
// used dynamic property assignment (`c[k] = ...`) in a loop, which is a SILENT
// NO-OP in PocketBase's JS VM — the rules were recorded as migrated but never
// actually changed. This migration uses the `unmarshal` pattern (the one
// PocketBase generates itself), sets the exact rule text deterministically,
// and is idempotent, so it safely repairs any instance regardless of whether
// the rules were later fixed by hand in the admin dashboard.
migrate((app) => {
  const RULE = "user = @request.auth.id && @request.auth.active = true"
  for (const name of ["entries", "expenses", "day_notes", "employee_info"]) {
    const c = app.findCollectionByNameOrId(name)
    unmarshal({
      "listRule":   RULE,
      "viewRule":   RULE,
      "createRule": RULE,
      "updateRule": RULE,
      "deleteRule": RULE,
    }, c)
    app.save(c)
  }
}, (app) => {
  const RULE = "user = @request.auth.id"
  for (const name of ["entries", "expenses", "day_notes", "employee_info"]) {
    const c = app.findCollectionByNameOrId(name)
    unmarshal({
      "listRule":   RULE,
      "viewRule":   RULE,
      "createRule": RULE,
      "updateRule": RULE,
      "deleteRule": RULE,
    }, c)
    app.save(c)
  }
})
