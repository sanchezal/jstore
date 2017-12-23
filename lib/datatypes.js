function numeric(v){
   return !isNaN(v);
}

module.exports = {
   pk: {
      primary_key: true,
      alias: ['primary key', 'primary key', 'primarykey'],
      verify: numeric
   },
   number:{
      alias: ['float', 'integer', 'int', 'double'],
      verify: numeric
   },
   string: {
      alias: ['varchar'],
      verify: function(v){ return typeof v === 'string' }
   },
   bool: {
      alias: ['boolean'],
      verify: function(v) {return typeof v === 'boolean'}
   },
   array_number:{
      alias: ['array_integer', 'array_float', 'array_int', 'array_double'],
      verify: function(v){
         if(typeof v !== 'array')return false;
         for(var i of v) if(typeof i !== 'number')return false;
         return true;
      }
   },
   array_string: {
      alias: ['array_varchar'],
      verify: function(v){
         if(typeof v !== 'array')return false;
         for(var i of v) if(typeof i !== 'string') return false;
         return true;
      }
   },
   object: {
      alias: [],
      verify: function(v){ return typeof v === 'object' }
   }
}