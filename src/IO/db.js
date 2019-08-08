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
  		let res = await this.query({name:'test',text:'SELECT * from '+tableName,rowMode:'array'})
  		let data = res.fields.map(field => field.name);
  		let table = new Factory('Table',[tableName]);
  		table.createJSON([data,...res.rows])
  		return table;
  	}
}

//Usage:
//PGUSER= PGHOST= PGPASSWORD= PGDATABASE= PGPORT= babel-node src/main.js