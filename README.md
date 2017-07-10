# jstore
An easy way for lightweight storage via a JSON file.  

## Getting started
```javascript
const jst = require('jstorejs'); //Require jstore
/**
* Create a new jstore instance.
* If the file does not exist, jstore will create a new file with a black JSON.
*/
var db = new jst.jstore('/path/to/db.jst'); 
```

## jstore.insert(table, obj)
```javascript
/**
* Inserts a given object into the given table.
*/
db.insert('members', {
   name: 'foo',
   access: '1'
})
```

## jstore.search(table, query)
```javascript
/**
* Search in table "tablename" with the given query.
* In this example "name" is a column in the databse.
* It will search in the table for items with the exact value in the given column.
*/
db.search('members', {
   name: 'foo'
});

//Now it will search for items with access greater than 0.
db.search('members', {
   access: {
      query: jstore.greaterThan,
      value: 0
   }
})
```

## jstore.remove(table, query)
```javascript
/**
* Removes items that fulfil the given query in the given table.
*/
db.remove('members', {
   access: {
      query: jstore.lessThan,
      value: 2
   }
})

db.remove('members', {
   name: 'foo'
})
```

## jstore.refresh()
```javascript
/**
*  Refreshes the database to what is inside the database file.
*/
db.refresh();
```

## jstore.pushDb()
```javascript
/**
* Saves the database into the file.
* THIS IS NOT REQUIRED, as the database is saved everytime
* a change is made (removes, inserts).
*/
db.pushDb();
```