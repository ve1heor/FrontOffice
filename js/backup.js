//const fs = require('fs');

function createBuckupDB(){
	var backupFolderPath = getOption("backup-folder-path");
	console.log(backupFolderPath[backupFolderPath.length-1]);
	if(backupFolderPath[backupFolderPath.length-1] != "\\"){	
		backupFolderPath += "\\";	
	}					
	fs.copyFile('sql.db', backupFolderPath + 'sql.db.backup', (err) => {
		if (err){
			alert('Ошибка создания бекапа базы данных');	
		}
		else{
			alert('Бекап базы данных создан');	
		}
	});		
}
