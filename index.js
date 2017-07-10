const fs = require('fs-extra');

exports.jstore = class {

   /**
    * Creates a jstore db.
    * @param {String} filename File location of the db jstore file.
    */
   constructor(filename){
      this.filename = filename;
      this.refresh();
   }

	/**
	 * Refreshes the variable 'db' with the actual db.
	 */
	refresh(){
      this.db = fs.readJSONSync(this.filename);
	}

   /**
    * Searches the database with a given table and query object.
    * @param {String} table Table to search for.
    * @param {Object} obj An object that includes what will be queried. Key must be the column name.
    */
   search(table, obj){
		this.refresh();
		if(!obj)return this.db[table];
      var keys = Object.keys(obj), retArray = [], keysCompleted = 0;
		if(!this.db[table])return [];
      for(var i of this.db[table]){
         for(var k of keys){
            // if(Object.keys(i).indexOf(k) >-1 && i[k]==obj[k])retArray.push(i);
            if(Object.keys(i).indexOf(k) >-1){
               var queryObj = obj[k];
               if(typeof queryObj === 'object'){
                  switch(queryObj.query){
                     case exports.equal: 
                        if(queryObj.value == i[k])keysCompleted++;
                        else continue;
                        break;
                     case exports.notEqual: 
                        if(queryObj.value != i[k])keysCompleted++;
                        else continue;
                        break;
                     case exports.greaterThan:
                        if(parseFloat(i[k]) > parseFloat(queryObj.value))keysCompleted++;
                        else continue;
                        break;
                     case exports.lessThan:
                        if(parseFloat(i[k]) < parseInt(queryObj.value))keysCompleted++;
                        else continue;
                        break;
                     case exports.lessEqualThan:
                        if(parseFloat(i[k]) <= parseFloat(queryObj.value))keysCompleted++;
                        else continue;
                        break;
                     case exports.greaterEqualThan:
                        if(parseFloat(i[k]) >= parseFloat(queryObj.value))keysCompleted++;
                        else continue;
                        break;
                  }
               }else if(typeof queryObj === 'string'){
                  if(queryObj == i[k])keysCompleted++;
                  else continue;
               }
            }
         }
         if(keysCompleted == keys.length){
            retArray.push(i);
         }
         keysCompleted = 0;
      }
      return retArray;
   }

   /**
    * Inserts an object to the given table.
    * @param {String} table The table that the object will be inserted in.
    * @param {String|Object} obj The object that will be inserted.
    */
   insert(table, obj){
		this.refresh();
      if(!this.db[table]){
         this.db[table] = [];
      }
      this.db[table].push(obj);
      this.pushDb();
   }
   /**
    * Removes the queried objects from the given table.
    * @param {String} table The table that will holds the desired items to be removed.
    * @param {Object} obj The query object that will be removed.
    */
   remove(table, obj){
		this.refresh();
      var removeItems = this.search(table, obj);
      for(var i of removeItems){
         this.db[table].splice(this.db[table].indexOf(i), 1);
      }
      this.pushDb();
   }

   /**
    * Saves the db to the file.
    */
   pushDb(){
      fs.writeFileSync(this.filename, JSON.stringify(this.db, null, 4));
   }
}

module.exports.greaterThan = 'gt';
module.exports.lessThan = 'lt';
module.exports.equal = 'eq';
module.exports.greaterEqualThan = 'get';
module.exports.lessEqualThan = 'let';
module.exports.notEqual = 'not';