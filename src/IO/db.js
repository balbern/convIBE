import { Pool} from 'pg';
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
  		return [data,...res.rows]
  	}
}

//Usage:
//PGUSER= PGHOST= PGPASSWORD= PGDATABASE= PGPORT= babel-node src/main.js