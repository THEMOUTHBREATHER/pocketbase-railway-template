/// <reference path="../pb_data/types.d.ts" />
// PocketBase 0.39 treats a text field's max:0 as "apply the built-in 5000-
// character default", NOT "unbounded" (confirmed by direct repro against a
// local instance -- an unrelated max:0 field failed at exactly 5001 chars
// too). Every base64 JPEG receipt is far longer than 5000 characters, so
// ANY expense with a photo attached (camera-captured or uploaded) has always
// failed validation and never reached the database -- create() rejects it
// before a record is ever written. Set an explicit, generous max instead of
// relying on 0. resizeImage() caps output at 1200px/quality 0.7, which is
// comfortably under this even accounting for base64's ~33% size inflation.
migrate((app) => {
  const expenses = app.findCollectionByNameOrId("expenses")
  const receipt = expenses.fields.getByName("receipt")
  receipt.max = 2000000
  app.save(expenses)
}, (app) => {
  const expenses = app.findCollectionByNameOrId("expenses")
  const receipt = expenses.fields.getByName("receipt")
  receipt.max = 0
  app.save(expenses)
})
