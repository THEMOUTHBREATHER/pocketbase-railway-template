/// <reference path="../pb_data/types.d.ts" />
// Time-off balance anchors: one record per user per account holding "balance
// was `hours` as of `asOf`". Running balances are always derived client-side
// (calc.js accountBalance) — nothing here is mutated when entries change.
migrate((app) => {
  const collection = new Collection({
    "createRule": "user = @request.auth.id && @request.auth.active = true",
    "deleteRule": "user = @request.auth.id && @request.auth.active = true",
    "listRule": "user = @request.auth.id && @request.auth.active = true",
    "viewRule": "user = @request.auth.id && @request.auth.active = true",
    "updateRule": "user = @request.auth.id && @request.auth.active = true",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation_ta_user",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "user",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_ta_account",
        "max": 0,
        "min": 0,
        "name": "account",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "number_ta_hours",
        "max": null,
        "min": null,
        "name": "hours",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_ta_asof",
        "max": 0,
        "min": 0,
        "name": "asOf",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "autodate_ta_created",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate_ta_updated",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_9417300031",
    "indexes": [],
    "name": "time_accounts",
    "system": false,
    "type": "base"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9417300031");

  return app.delete(collection);
})
