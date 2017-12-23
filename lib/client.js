const fs = require('fs-extra');
const path = require('path');
const Util = require('./util');
const data_types = require('./datatypes');
const jsoncomp = require('json-stringify-pretty-compact');

const relationReg = /\bref:\b(.+)/gi;

module.exports = class{
   /**
    * Create a new db object from the given file.
    * @param {string} file Path to the db.
    */
   constructor(file){
      this.file = file;
      this.db = {};
   }

   /**
    * Create a table with the given scheme.
    * @param {object} scheme The table scheme
    */
   createTable(scheme){
      this._read();
   }

   /**
    * Insert data object or array of objects into db.
    * @param {object} data Data object or array of objects.
    */
   insert(table, data){
      this._read();
      var valid = this._verifyInsert(table, data);
      if(!valid) throw new Error('Insert scheme invalid');
      var scheme = this.getScheme(table);
      var insertObj = {};
      for(var i of Object.keys(scheme)){
         console.log(scheme[i])
         if(scheme[i].type=='pk'){
            insertObj[i] = this._getIncrement(table);
         }else{
            insertObj[i] = (data[i] || null)
            if(insertObj[i] == null && typeof scheme[i].default !== 'undefined'){
               insertObj[i] = scheme[i].default
            }
         }
      }
      if(!this.db['_data'][table])this.db['_data'][table] = [];
      this.db['_data'][table].push(insertObj);
      this._increment(table);
      this._save();
   }

   /**
    * Select data from a given table.
    * @param {string} table The table to search on
    * @param {object} query The query that should be completed.
    */
   select(table, query){
      this._read();
      if(!this._tableExists(table)) throw new Error('No such table.');
      var data = this.db['_data'][table];
      var request = [];
      if(!data) return [];
      for(var i of data){
         //TODO: Add more parameters
         if(this._recordMatches(query, i))
            request.push(i);
      }
      return request;
   }

   /**
    * Update a given table with the given data.
    * @param {string} table The table to update
    * @param {object} where The query that should be completed
    * @param {object} update The update to the selected rows.
    */
   update(table, where, update){
      this._read();
      var stats = { affectedRows: 0 };
      if(!this._tableExists(table)) throw new Error('No such table.');
      var data = this.db['_data'][table];
      if(!data) return stats;
      for(var i of data){
         if(this._recordMatches(where, i)){
            for(var j of Object.keys(update)){
               if(typeof i[j] !== 'undefined')
                  i[j] = update[j]
            }
         }
      }
      this._save();
   }

   /**
    * Get a table's scheme.
    * @param {string} table The table
    */
   getScheme(table){
      return this.db['_schemes'][table];
   }

   _recordMatches(query, record){
      for(var i of Object.keys(query)){
         if(query[i]!=record[i])return false;
      }
      return true;
   }

   /**
    * Get the next available primary key in the given table.
    * @param {string} table The table to check
    */
   _getIncrement(table){
      return (this.db['_increments'][table] || 0);
   }

   /**
    * Increment the table.
    * WILL NOT WRITE.
    * @param {string} table The table to increment.
    */
   _increment(table){
      var it = this.db['_increments'][table];
      console.log("INCR: " + it);
      if(!it) this.db['_increments'][table] = 1;
      else this.db['_increments'][table] = it+1;
   }

   /**
    * Save the database to disk.
    */
   _save(){
      fs.writeFileSync(this.file, jsoncomp(this.db, {
         indent: 3
      }));
   }

   /**
    * Read from the database.
    */
   _read(){
      this.db = fs.readJsonSync(this.file);
      if(!this._verifyDb(this.db)){
         var err =  new Error('Database is corrupted or malformed.')
         throw err;
      }
   }

   /**
    * Verify if the data types of the table are valid.
    * @param {string} table The table's name
    * @param {object} scheme The table's scheme
    */
   _verifyScheme(table, scheme){
      if(typeof scheme !== 'object')return false;
      this._read();
      var k = Object.keys(scheme), pk = false;
      for(var i of k){
         var tdt = scheme[i];
         console.log(tdt);
         if(!tdt.type){
            if(!tdt.references) return false;
            if(!this._tableExists(tdt.references) || !tdt.references==table) 
               return false;
            return true
         }
         var dt = Util.getDatatype(tdt.type);
         if(!dt) return false;
         else if(dt.primary_key)pk = true;
      }
      return pk;
   }

   /**
    * Verify that the data types and attributes match with 
    * the table in the database.
    * @param {string} table The table inserting
    * @param {object} data The data to insert to the table.
    */
   _verifyInsert(table, data){
      if(!this._tableExists(table))return false;
      var scheme = this.getScheme(table), k = Object.keys(data);
      for(var i of k){
         if(!scheme[i])return false;
         var validDt = Util.getDatatype(scheme[i].type);
         if(!validDt || !validDt.verify(data[i])) return false;
      }
      return true;
   }

   /**
    * Verify if a table exists in the database.
    * @param {string} table The table
    */
   _tableExists(table){
      this._read();
      return this.db['_schemes'][table];
   }

   /**
    * Verify a database integrity.
    * @param {object} db The database
    */
   _verifyDb(db){
      var def = ['_schemes', '_data', '_increments'];
      for(var i of def){
         if(typeof db[i] === 'undefined')return false;
      }
      return true;
   }
}