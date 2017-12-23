const data_types = require('./datatypes');

module.exports = {
   verifyScheme(scheme){
      var k = Object.keys(scheme);

   },
   getDatatype(dt){
      if(data_types[dt])return data_types[dt];
      var k = Object.keys(data_types);
      for(var i of k)
         if(data_types[i].alias.indexOf(dt.toLowerCase())!=-1)return data_types[i];
      return false;
   }
}