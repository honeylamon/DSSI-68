/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1174553048")

  // remove field
  collection.fields.removeById("number1542800728")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1174553048")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number1542800728",
    "max": null,
    "min": null,
    "name": "field",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
