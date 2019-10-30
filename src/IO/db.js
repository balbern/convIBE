import { Pool} from 'pg';
import Factory from '../utils/factory';

export default class DB { 
	constructor(dbOpt) {
		if(dbOpt){
			this.pool = new Pool({
		  user: dbOpt.user,
		  host: dbOpt.host,
		  database: dbOpt.database,
		  password: dbOpt.password,
		  port: dbOpt.port,
		})	
		} else {
			this.pool = new Pool();
		}
			
	}
	query(text,params){
    	return this.pool.query(text,params)
  	}
  	end(){
  		return this.pool.end();
  	}
  	async getTable(tableName){
  		let res = await this.query({text:'SELECT * from '+tableName,rowMode:'array'})
  		let data = res.fields.map(field => field.name);
  		let table = new Factory('Table',[tableName]);
  		table.createJSON([data,...res.rows])
  		return table;
  	}

    async setDBLink(dblink){
      let keys = Object.keys(dblink)
      for (var i = 0; i < Object.keys(dblink).length; i++) {
        return await this.query({text:"select dblink_connect_u('"+keys[i]+"','dbname="+dblink[keys[i]]+"')"});
      }
      
    }

  	async setSchema(schemaName){
  		let res = await this.query({text:'SET search_path TO '+schemaName,rowMode:'array'})
  		return res;
  	}

}

//Usage:
//PGUSER= PGHOST= PGPASSWORD= PGDATABASE= PGPORT= babel-node src/main.js