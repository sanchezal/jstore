const jst = require('./index.js');
var db = new jst.jstore(__dirname + '/testdb.jst');

var searchResult = db.search('members', {
   name: 'foo', 
   access: {
      query: jstore.greaterThan,
      value: 0
   }
})

console.log(searchResult);