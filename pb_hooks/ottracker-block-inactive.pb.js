/// <reference path="../pb_data/types.d.ts" />
// Block deactivated accounts at the auth layer. The `active` flag is a custom
// field, so PocketBase itself would happily authenticate a deactivated user —
// collection rules already wall off their data, but this makes "Deactivate
// blocks sign-in" literally true and kills already-issued tokens on refresh.
//
// Deploy note: PocketBase loads this from a pb_hooks/ folder next to the
// executable. The Railway PB service must include this folder (mount or bake it
// into the image) — it is NOT applied via migrations.
onRecordAuthRequest((e) => {
  const rec = e.record
  if (rec && rec.collection().name === "users" && !rec.getBool("active")) {
    throw new ForbiddenError("This account has been deactivated.")
  }
  e.next()
})
