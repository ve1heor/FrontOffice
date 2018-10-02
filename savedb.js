const fs = require("fs");
const Sqlite = require('better-sqlite3');

let dbFileName = __dirname + '\\sql.db';

var db = new Sqlite(dbFileName);
saveDB();

function saveDB(){
	var json = '{';
	var tables = db.prepare('SELECT * FROM sqlite_master').all();
	for (var i = 0; i< tables.length; i++) {
		//console.log("Table : " + tables[i].name);
		if(i!=0){
			json+=',';	
		}
		json += '"'+tables[i].name+'":{';
		var columns = db.pragma('table_info('+tables[i].name+')', false);
		for (var j = 0; j < columns.length;j++) {
			if(j!=0){
				json+=',';	
			}
			console.log(columns[j].type);
			json += '"'+columns[j].name+'":"'+String(columns[j].type)+'"';
			//json["'"+tables[i].name+"'"].push(columns[j].name);
	    	//console.log("		Column: " + columns[j].name/*JSON.parse(JSON.stringify(columns[j])).name*/) ;
	    }
	   	json+='}';	 

	}
	json += '}';

	//json = JSON.parse(json); 
	fs.writeFileSync(__dirname + "/version-db-struct",json,"utf8");
	//console.log(json);
	/*for (var key in json){
        var attrName = key;
        var attrValue = json[key];
        console.log(attrValue);
    }*/
	
}
