const fs = require("fs");

//var sqlite3 = null;
const Sqlite = require('better-sqlite3');
var db = null;

var ArrayProducts 	= [];
var SearchProducts 	= [];
var paymasters = [];//"";

var last_value_search = "";
var last_method_search = 0;

var discount_card_number 	= "#############";
var discount_card_percent 	= 0;

var finalCost 			= 0;
var finalCostSumm		= 0;

var finalCostWithDisc 	= 0;
var finalDisc 			= 0;

var finalCostWithDiscount = 0;

Start();

function Start(){
	let dbFileName = __dirname + '\\sql.db';
	dbFileName = dbFileName.replace('resources\\app.asar\\','');
	console.log(dbFileName);

	var isExist = fs.existsSync(dbFileName);
	console.log(isExist);
	if(!isExist){
		var dbFile = fs.createWriteStream(dbFileName);
		dbFile.end();
	}

	db = new Sqlite(dbFileName);

	InitializeDB();
	InitializeData();
	executeOperation("getUsers");
	executeOperation("getOptions");
}

function InitializeDB(){
	if(db == null){
		return 0;
	}
	var json_str = fs.readFileSync(__dirname + "/version-db-struct", "utf8");
	var json = JSON.parse(json_str);
	for (var tableName in json){
        var listColumns = json[tableName];
        console.log("Table:" + tableName);
        if(tableName === "sqlite_sequence"){
        	continue;
        }
        var query = "CREATE TABLE IF NOT EXISTS '"+tableName+"' ('id'	INTEGER PRIMARY KEY AUTOINCREMENT)";
        var row = db.prepare(query).run();
        for (var columnName in listColumns){
        	query = "ALTER TABLE "+tableName+" ADD COLUMN "+columnName+" " + listColumns[columnName];
        	try{
        		row = db.prepare(query).run();
        	}
        	catch(e) {}
        	//console.log("	Column:" + columnName + "; Type: " + listColumns[columnName]);	
        }
    }
}

function InitializeData(){
	var row = db.prepare("SELECT name FROM paymaster WHERE name = 'admin'").get();
	if(!row){
		row = db.prepare('INSERT INTO paymaster(name,password,isAdmin) VALUES("admin","admin","true")').run();
	}
	console.log(row);
}


function payModalCalculation(){
	var nal =  Number($('#pay_modal_nal').val());
	var bnal = Number($('#pay_modal_bnal').val());
	var sert = Number($('#pay_modal_sert').val());
	var disc = Number($('#pay_modal_disc').val());

	var costWithoutSert = finalCost - sert;
}

function activePrintCheckButton(rest_money){
	if(rest_money>=0){
		$('#print-check').removeClass('disable');
		$('#print-check').on("click", printCheck);
		$('#print-check').prop('disabled', false);	
	}
	else {
		$('#print-check').addClass('disable');
		$('#print-check').off("click");
		$('#print-check').prop('disabled', true);
	}
}

/*function payModalCalculation(){
	//var final_coast = Number($('#final_coast_dialog').text());

	var nal =  Number($('#pay_modal_nal').val());
	var bnal = Number($('#pay_modal_bnal').val());
	var sert = Number($('#pay_modal_sert').val());
	var disc = Number($('#pay_modal_disc').val());

	var costWithDisc = finalCost - disc;
	costWithDisc = costWithDisc.toFixed(2);

	var rest_money = nal + bnal + sert - costWithDisc;
	rest_money = rest_money.toFixed(2);
	
	
	$('#final_coast_dialog').text(costWithDisc);
	$('#pay_modal_rest_money').text(rest_money);
}*/

function printCheck() {
	alert("Чек напечатан!"); 
}

function fillTable(curr_pos,flag){
	var finalString = "";
	var currentRowInfo = "";
	var table = null;

	
	finalCostWithDisc = 0;

	switch (flag) {
		case 1:
			table = ArrayProducts;

			var last_num = table.length - 1;
			for(var i = last_num; i>=0 ;i--){
				if(i == curr_pos){
					finalString += "<div class='row active'>"		
				}
				else {
					finalString += "<div class='row'>"	
				}

				if(i == last_num){ 
					finalString += "<div class='col-sp-1 first-td' scope='row'>";	
				}
				else{
					finalString += "<div class='col-sp-1' scope='row'>";
				}

				finalString += (i+1)
					+"</div><div class='col-sp-4'>"+table[i].barcode
					+"</div><div class='col-sp-10'>"+table[i].name
					+"</div><div class='col-sp-3'>"+table[i].price.toFixed(2)
					+"</div><div class='col-sp-3'>"+table[i].quantity.toFixed(3)
					+"</div><div class='col-sp-3'>"+table[i].cost.toFixed(2)+"</div></div>"; 	

				/*var discounts = [];
				discounts.push(table[i].td_percent);		
				discounts.push(table[i].qd_percent);
				discounts.push(table[i].dd_percent);
				discounts.push(table[i].sd_percent);
				discounts.push(table[i].hd_percent);*/
				
				/*var coastProduct =*/ 
				calculateCoastProduct(
					table[i]/*, 
					discounts*/
				);		
				//finalCost += table[i].cost;
				finalCostWithDisc += table[i].cost_wd;
			}
			break;
		case 2:
			table = SearchProducts;
			var last_num = table.length - 1;
			var search_value = $('#search-field').val();

			var val_barcode = "";
			var val_name = "";
			var val_price = "";
			var val_article = "";

			for(var i = 0; i<=last_num ;i++){
				if(i == curr_pos){
					finalString += "<div class='row active'>"
					/*currentRowInfo = table[i].barcode + " - " 
					+ table[i].name  + " "
					+ table[i].price.toFixed(2)  + " x "
					+ table[i].quantity.toFixed(3)  + " = "
					+ table[i].cost.toFixed(2)
					;	*/
				}
				else {
					finalString += "<div class='row'>"	
				}

				if(i == last_num){
					finalString += "<div class='col-sp-1 first-td' scope='row'>";	
				}
				else{
					finalString += "<div class='col-sp-1' scope='row'>";
				}

				val_barcode = table[i].barcode;
				val_name = table[i].name;
				val_price = table[i].price.toFixed(2).toString();
				val_article = table[i].article;

				switch(last_method_search){
					case 1:
						val_article = val_article.replace(last_value_search,"<span class='selected-text'>"+last_value_search+"</span>");
						break;
					case 2:
						val_name = val_name.replace(last_value_search,"<span class='selected-text'>"+last_value_search+"</span>");
						break;
					case 3:
						val_price = val_price.replace(last_value_search,"<span class='selected-text'>"+last_value_search+"</span>");
						break;
					case 4:
						val_barcode = val_barcode.replace(last_value_search,"<span class='selected-text'>"+last_value_search+"</span>");
						break;
				}

				finalString += (i+1)
					+"</div><div class='col-sp-5'>"+val_barcode
					+"</div><div class='col-sp-10'>"+val_name
					+"</div><div class='col-sp-3'>"+val_price
					+"</div><div class='col-sp-5'>"+val_article
					+"</div>"
					+"</div>";
			}
			break;
		case 3:
			table = paymasters;
			var last_num = table.length - 1;
			for(var i = 0; i<=last_num ;i++){
				if(i == curr_pos){
					finalString += "<div class='row active'>"		
				}
				else {
					finalString += "<div class='row'>"	
				}
				finalString += 
                        "<div class='col-sp-2'>"+(i+1)+"</div>"+
                        "<div class='col-sp-9'>"+table[i].name+"</div>"+
                    	"<div class='col-sp-9'>"+table[i].password+"</div>"+
                    	"</div>";	
			}
			break;
	}

	switch (flag) {
		case 0:
			$('#products').html(finalString);
			break;
		case 1:
			$('#products').html(finalString);
			$('#final-cost').text(finalCostWithDisc.toFixed(2));
			$('#final_coast_dialog').text(finalCostWithDisc.toFixed(2));

			rewriteProductInfo(curr_pos,true);
			break;
		case 2:
			$('#search-products').html(finalString);
			break;
		case 3:
			$('#users-list').html(finalString);
			break;
	}	
}

function getQuantityProductByBarcode(barcode){
	var quantity = 0;
	for(var i=0;i<ArrayProducts.length;i++){
		if(ArrayProducts[i].barcode == barcode){
			quantity++;
		}
	}
	return quantity;
}

function calculateCoastProduct(row){ //расчет скидки для товара и цены со скидкой
	var result = 0;
	var result_discount = 0;

	var method = getOption("choose-max-discount",1);

	var max_perc = getOption("max-procent-discount");
	var sum_value = getOption("sum-val-discount",1);
	var sum_percent = getOption("sum-procent-discount",1);
	var flagUnionPosition = getOption("union-position-checkbox",1);
	/*if(method){
		for(var i=0;i<discounts.length;i++){
			if()
			result_discount += discounts[i];	
		}
	}
	else {
		result_discount = discounts[0];
		for(var i=1;i<discounts.length;i++){
			if(discounts[i]>result_discount){
				result_discount = discounts[i];	
			}
		}
	}*/

	if(!method){ //sum
		result_discount += row.td_percent;
		if(!flagUnionPosition){

			var quantity = getQuantityProductByBarcode(row.barcode);
			if(quantity>= row.qd_quantity){
				result_discount += row.qd_percent;	
			}
		}else {
			if(row.quantity>= row.qd_quantity){
				result_discount += row.qd_percent;	
			}
		}
		
		if(row.dd_flag){
			result_discount += row.dd_percent;
		}
		if(row.sd_flag){
			if(finalCostSumm>=sum_value){
				row.sd_percent = sum_percent;
				result_discount += row.sd_percent;
			}
		}	
		if(row.hd_flag){
			result_discount += row.hd_percent;
		}
	}
	else { //max
		result_discount = row.td_percent;
		if(!flagUnionPosition){
			var quantity = getQuantityProductByBarcode(row.barcode);
			if(quantity>= row.qd_quantity){
				if(row.qd_percent>result_discount){
					result_discount = row.qd_percent;	
				}
			}
		}
		else {
			if(row.quantity>= row.qd_quantity){
				if(row.qd_percent>result_discount){
					result_discount = row.qd_percent;	
				}
			}	
		}
		
		if(row.dd_flag){
			if(row.dd_percent>result_discount){
				result_discount = row.dd_percent;	
			}
		}
		if(row.sd_flag){
			if(finalCostSumm>=sum_value){
				row.sd_percent = sum_percent;
				if(row.sd_percent>result_discount){
					result_discount = row.sd_percent;	
				}
			}
		}
		if(row.hd_flag){
			if(row.hd_percent>result_discount){
				result_discount = row.hd_percent;	
			}		
		}
	}

	if((result_discount>max_perc)&&(max_perc>0)){ //ограничить скидку максимальной, если она больше 0
		result_discount = max_perc;
	}
	
	price_with_disc = row.price * (100 - result_discount) / 100;
	row.price_wd = parseFloat(price_with_disc.toFixed(2));

	result =  row.price_wd * row.quantity;
 	row.cost_wd = parseFloat(result.toFixed(2)); 
}

function getConnection () {
	let dbFileName = __dirname + '/sql.db';
	dbFileName = dbFileName.replace('resources\\app.asar/','');
	console.log(dbFileName);
	var isExist = fs.existsSync(dbFileName);
	if(!isExist){
		var dbFile = fs.createWriteStream(dbFileName);
		dbFile.end();
	}

	/*db = new sqlite3.Database(dbFileName, sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err);
		}
		//InitializeDB();
		console.log('Connected to database.');
	});*/
	db = new Sqlite(dbFileName);
	console.log('Connected to database.');
}

function closeConnection() {
	db.close((err) => {
		if (err) {
	    	console.error(err.message);
	  	}
	  	console.log('Close database connection.');
	});
}

function getQuery(search_text,method,flag){
	var query = "";

	var flag_td = getOption("temporary-discount-checkbox",1);
	var flag_dd = getOption("card-discount-checkbox",1);
	var flag_qd = getOption("quantity-discount-checkbox",1);
	var flag_sd = getOption("sum-discount-checkbox",1);
	var flag_hd = getOption("manual-discount-checkbox",1);

	var select = "SELECT pr.name,pr.article,pr.barcode,pr.price";
	var from = " FROM product pr";
	var left_join = "";
	var where = "";
	if(flag_dd){
		select += ", pr.fl_disc "
	}
	if(flag_sd){
		select += ", pr.fl_sum "
	}
	if(flag_hd){
		select += ", pr.fl_hand "
	}
	if(flag_td){
		select += ",tdisc.date_begin td_date_begin,tdisc.time_begin td_time_begin,tdisc.date_end td_date_end,tdisc.time_end td_time_end,tdisc.percent td_percent"
		left_join += " LEFT JOIN temporary_discount tdisc ON pr.id = tdisc.id_product ";
	}
	if(flag_qd){
		select += ", qdisc.quantity qd_quantity, qdisc.percent qd_percent "
		left_join += " LEFT JOIN  quantity_discount qdisc ON pr.id = qdisc.id_product ";
	}
	switch(method){
		case 1:
			where = " WHERE pr.article LIKE '%" + search_text + "%'";	
			break;
		case 2:
			where = " WHERE pr.name LIKE '%" + search_text + "%'";	
			break;
		case 3:
			search_text = search_text.replace(",",".");
			where = " WHERE pr.price = '" + search_text + "'";
			break;
		case 4:
			if(flag){
				where = " WHERE pr.barcode LIKE '%" + search_text + "'";	
			}
			else {
				where = " WHERE pr.barcode = '" + search_text + "'";
			}
			break;
		case 5:
			where = " WHERE pr.weight_code = '" + search_text + "'";
			break;
		case 6:
			break;
	}
	/*'SELECT pr.name,pr.article,pr.barcode,pr.price,tdisc.date_begin, tdisc.time_begin,tdisc.date_end,tdisc.time_end,tdisc.percent '+
						 	'FROM product as pr '+
						 	'LEFT JOIN temporary_discount tdisc ON pr.id = tdisc.id_product ' +
						 	'WHERE pr.barcode = "' + barcode + '"'*/
	query = select + from + left_join + where;
	//console.log(query);
	return query;
}

function findDiscountCardByNumber(barcode){
	var flagDicountCard = getOption("card-discount-checkbox",1);
	if(flagDicountCard){
		if (ArrayProducts.length>0){
			var row = db.prepare('SELECT id,barcode,percent FROM discount_card WHERE barcode = "' + barcode + '"').get(); 
			row ? setDiscountCard(row.barcode, row.percent) : alert('Не найдена дисконтная карта со штрихкодом ' + barcode);
		}
		else {
			alert("Нельзя добавить дисконтную скидку без товаров!");
		}	
	}
	else {
		alert("Опция 'Дисконтная скидка' выключена!");
	}	
}

function findProductByWeightBarcode(barcode){
	var flagWheightBarcode = getOption("weight-barcode-checkbox",1);
	if(flagWheightBarcode){

		if(barcode.length != 13){
			alert("Длинная весового штрихкода должна быть 13 символов!");
			return;
		}

		var flagWheightFirst = getOption("weight-barcode-first",1);
		var flagWheightSecond = getOption("weight-barcode-second",1);

		var curr_wflag = ((flagWheightFirst)?1:2)

		var weight_prefix = "";
		var weight_code = "";
		var weight_value = "";
		var weight_control_sum = "";

		switch(curr_wflag){
			case 1:
				//weight_prefix = barcode.substr(0,2);
				weight_code = barcode.substr(2,5);
				weight_value = barcode.substr(7,5);
				//weight_control_sum = barcode.substr(12,1);
				break;
			case 2:
				weight_code = barcode.substr(2,6);
				weight_value = barcode.substr(8,4);
				break;
		}

		var query = getQuery(weight_code,5);
		//console.log(query);
		var rows = db.prepare(query).all(); 
		//console.log(row);
		rows.forEach((row) => {
			var td_percent = getTemporaryDiscount(row.td_date_begin,row.td_time_begin,row.td_date_end,row.td_time_end, row.td_percent);
		    var qd_quantity = row.qd_quantity;
		    var qd_percent = row.qd_percent;

		    var dd_flag = JSON.parse(row.fl_disc);
			var sd_flag = JSON.parse(row.fl_sum);
			var hd_flag = JSON.parse(row.fl_hand);

			var quantity = Number(weight_value)/1000;

			addProductInArray(row.barcode,row.article,row.name,row.price,quantity,td_percent,qd_quantity,qd_percent,dd_flag,sd_flag,hd_flag);
		});
	}
	else{
		alert("Сасай писос, не найден весовой код!");
	}
}

function loginUser(name){
	$('#current-user').text(name);
	$('#user_block_modal').modal('hide');
	setFlag(0);
}

function updateUser(id,login, password){
	var row = db.prepare('update paymaster SET name ="'+
		login+'", password = "'+
		password+'"'+
		'WHERE id = "'+id+'"').run();
	executeOperation("getUsers");
	alert("Пользователь успешно обновлен!");
}

function registerUser(login, password){
	var row = db.prepare('INSERT INTO paymaster(name,password,isAdmin) VALUES("'+login+'","'+password+'","false")').run();
	executeOperation("getUsers");
	alert("Пользователь успешно добавлен!");
}

function varification(login, password){
	var message = "";
	if(login.length<3){
		message += "Логин должен быть 3 либо более символов!\n";
	}
	if(password.length<3){
		message += "Пароль должен быть 3 либо более символов!\n";
	}
	return message;
}

function executeOperation(oper_name, params) {
	//db.serialize(() => {
		console.log(oper_name);
		switch (oper_name) {
			case "getUsers":
				var rows = db.prepare('SELECT * FROM paymaster WHERE isAdmin = "false"').all(); 
				console.log(rows.length);
				paymasters = [];
				var login_list = [];
				rows.forEach((row) => {
					paymasters.push({"name":row.name, "password":row.password});	
					login_list.push(row.name);
				});
				//console.log(paymasters);
				$("#sel_kassir").autocomplete({
			      source: login_list
			    });
			    $("#ui-id-1").css( "zIndex", 9999);
			    fillTable(0,3);

				//$('#sel_kassir').html(paymasters);
					
				
				break;
			case "getUserByLP":
				var login = params[0];
				var password = params[1];
				var row = db.prepare('SELECT name FROM paymaster WHERE name = "'+login+'" and password = "' + password + '"').get();
			    row ? loginUser(row.name) : alert('Пароль введен неправильно!');
			
				//);
				break;
			case "saveUser":
				var login = params[0];
				var password = params[1];
				
				var row = db.prepare('SELECT id FROM paymaster WHERE name = "'+login+'" and isAdmin = "false"').get(); 
			
			    row ? updateUser(row.id,login, password) : registerUser(login, password);
			    $('#login_reg').val("");
				$('#pass_reg').val("");
			    executeOperation("getUsers");
			
				break;
			case "deleteUser":
				var login = params[0];
				var row = db.prepare('DELETE FROM paymaster WHERE name="'+login+'"').run();
				executeOperation("getUsers");
				break;
			case "addProductsInDB":
				var finalQuery = "";
				var queryComplite = false;
				var now = new Date();

				$.each(params,function(index, row){
					var rows = db.prepare('SELECT id FROM product WHERE barcode = "'+row.barcode+'"').all(); 
				
			  		if(rows.length>0){
			  			var row = db.prepare("UPDATE product SET name = '"+row.name+
			  				"', article = '"+row.article+
			  				"', price = '"+row.price+
			  				"' WHERE barcode = '"+row.barcode+"'").run();
			  		}
			  		else {
			  			var row = db.prepare('INSERT INTO product(name,article,barcode,price) VALUES("'+
			  				row.name+'","'+
			  				row.article+'","'+
			  				row.barcode+'","'+
			  				row.price+'")').run();
			  		}
				});
				break;
			/////////////////////////////////////////////////////////////////////////GET OPTIONS FROM DB
			case "getOptions":
				options = [];
				var rows = db.prepare('SELECT name,value FROM option').all(); 
				rows.forEach((row) => {
				    options.push({"name":row.name,"value":row.value});	
				});
				if(options.length == 0){
					//
					setStandartOptions();
					//
					for(var i=0; i<options.length;i++){
						var rows = db.prepare('INSERT INTO option(name,value) VALUES("'+options[i].name+'","'+options[i].value+'")').run();
						console.log(`A row has been inserted with rowid ${this.lastID}`);
					}
				}
				break; 
			/////////////////////////////////////////////////////////////////////////SET OPTIONS IN DB
			case "setOptions":
				for(var i=0; i<options.length;i++){
					var row = db.prepare('UPDATE option SET value = "'+options[i].value+'" WHERE name = "'+options[i].name + '"').run()
					console.log(`A row has been updated with rowid ${this.lastID}`);
				}
				alert("Settings successfully saved");
				break;
			/////////////////////////////////////////////////////////////////////////SCAN BY FULL BARCODE
			case "findByFullBarcode":
				var barcode = params[0];
				var typeBarcode = 1; //1 - product barcode, 2 - discount barcode, 3 - weight barcode

				var disc_barcode_prefix = getOption("discount-barcode-prefix",1);
				var weight_barcode_prefix = getOption("weight-barcode-prefix",1);

				if(disc_barcode_prefix != undefined){
					if(barcode.indexOf(disc_barcode_prefix) == 0){
						typeBarcode = 2;
					}
				}

				if(weight_barcode_prefix != undefined){
					if(barcode.indexOf(weight_barcode_prefix) == 0){
						typeBarcode = 3;
					}
				}

				switch(typeBarcode){
					case 1:
						var query = getQuery(barcode,4,false);
						//console.log(query);
						var rows = db.prepare(query).all(); 
						rows.forEach((row) => {
						    var td_percent = getTemporaryDiscount(row.td_date_begin,row.td_time_begin,row.td_date_end,row.td_time_end, row.td_percent);
						    var qd_quantity = row.qd_quantity;
						    var qd_percent = row.qd_percent;

						    var dd_flag = JSON.parse(row.fl_disc);
							var sd_flag = JSON.parse(row.fl_sum);
							var hd_flag = JSON.parse(row.fl_hand);

							addProductInArray(row.barcode,row.article,row.name,row.price,1,td_percent,qd_quantity,qd_percent,dd_flag,sd_flag,hd_flag);
						});
						break;
					case 2:
						findDiscountCardByNumber(barcode);		
						break;
					case 3:
						//console.log("ПИСОСОВЫЙ ТОВАР");
						findProductByWeightBarcode(barcode);
						break;	
				}
			/////////////////////////////////////////////////////////////////////////SEARCH
			case "findByMethod":
				SearchProducts = [];

				var query = getQuery(params[0],params[1],true);
				var rows = db.prepare(query).all(); 
			 	switch (rows.length) {
			 		case 0:
			 			alert("Товаров не найдено");
			 			break;
			 		case 1:
			 			rows.forEach((row) => {
			 				var td_percent = getTemporaryDiscount(row.td_date_begin,row.td_time_begin,row.td_date_end,row.td_time_end, row.td_percent);
			 				var qd_quantity = row.qd_quantity;
					    	var qd_percent = row.qd_percent;
						    
						    var dd_flag = JSON.parse(row.fl_disc);
						    var sd_flag = JSON.parse(row.fl_sum);
						    var hd_flag = JSON.parse(row.fl_hand);

							addProductInArray(row.barcode,row.article,row.name,row.price,1,td_percent,qd_quantity,qd_percent,dd_flag,sd_flag,hd_flag);
						});
			 			break;
			 		default:
			 			rows.forEach((row) => {
			 				var td_percent = getTemporaryDiscount(row.td_date_begin,row.td_time_begin,row.td_date_end,row.td_time_end, row.td_percent);
			 				var qd_quantity = row.qd_quantity;
					    	var qd_percent = row.qd_percent;

					    	var dd_flag = ((row.fl_disc == undefined) ? false : JSON.parse(row.fl_disc));
						    var sd_flag = ((row.fl_sum == undefined) ? false : JSON.parse(row.fl_sum));
						    var hd_flag = ((row.fl_hand == undefined) ? false : JSON.parse(row.fl_hand));

						    addProductInSearch(row.barcode,row.article,row.name,row.price,td_percent,qd_quantity,qd_percent,dd_flag,sd_flag,hd_flag);
						});
						fillTable(0,2);	
						$('#search-quantity').text(SearchProducts.length)
						$('#search_modal').modal('show');
						setFlag(5);	 
					 	break;
			 	}
				break;
		}
	//});
}

function getTemporaryDiscount(rdate_begin,rtime_begin,rdate_end,rtime_end, rpercent){
	var td_percent = 0;

	var date_begin = new Date(rdate_begin + " " + rtime_begin);
	var date_end = new Date(rdate_end  + " " + rtime_end);
	var date_curr = new Date();

	if(rpercent == undefined){
		rpercent = 0;
	}

	if((rdate_begin == undefined)&&(rdate_end == undefined)){
		td_percent = rpercent;
	}
	else if((rdate_begin == undefined)&&(rdate_end != undefined)){
		if(date_curr<=date_end){
			td_percent = rpercent;	
		}
	}
	else if((rdate_begin != undefined)&&(rdate_end == undefined)){
		if(date_begin<=date_curr){
			td_percent = rpercent;	
		}
	}
	else if((date_begin<=date_curr)&&(date_curr<=date_end)){
		td_percent = rpercent;
	}

	return td_percent;
}

function setDiscountCard(number, percent){
	discount_card_number = number; 
	discount_card_percent = percent;

	for (var i = 0; i < ArrayProducts.length; i++) {
		if(ArrayProducts[i].dd_flag){
			ArrayProducts[i].dd_percent = discount_card_percent;
		}
	}
	var curr_pos = getCurrentNumberProduct();
	fillTable(curr_pos,1);

	/*$('#big-discount-card-number').text(discount_card_number);
	$('#big-discount-card-percent').text(discount_card_percent);

	$('#discount-card-number').text(discount_card_number);
	$('#discount-card-percent').text(discount_card_percent);
	finalDisc = discount_card_percent/100*finalCost;
	$('#pay_modal_disc').val(finalDisc.toFixed(2));
	finalCostWithDiscount = (finalCost - finalDisc);
	$('#final-cost').text(finalCostWithDiscount.toFixed(2));
	$('#final_coast_dialog').text(finalCostWithDiscount.toFixed(2));
	payModalCalculation();*/
}

function addProductInArray(barcode,article,name,price,quantity,td_percent,qd_quantity,qd_percent,dd_flag,sd_flag,hd_flag){
	var	flagFindProduct = false;
	var posFindProduct = -1;

	//for(var i = 0; i<Products.length;i++){
	// 	if(Products[i].barcode == barcode){
			var p_barcode 	= barcode;
	 		var p_name		= name;
	 		var p_price 	= price;
	 		var p_quantity 	= quantity;
	 		var p_cost	 	= price;
	 		var p_article 	= article;

	 		var p_td_perc 	= ((td_percent == undefined) ? 0 : td_percent);
	 		var p_qd_qty 	= ((qd_quantity == undefined) ? 0 : qd_quantity);
	 		var p_qd_perc 	= ((qd_percent == undefined) ? 0 : qd_percent);
	 		var p_dd_flag 	= ((dd_flag == undefined) ? false : dd_flag);
	 		var p_dd_perc 	= ((p_dd_flag == false) ? 0 : discount_card_percent);
	 		var p_sd_flag	= ((sd_flag == undefined) ? false : sd_flag);
	 		var p_sd_perc 	= 0;
	 		var p_hd_flag	= ((hd_flag == undefined) ? false : hd_flag);
	 		var p_hd_perc 	= 0;

	 		var p_price_wd 	= 0;
	 		var p_cost_wd 	= 0;

	 		var flagUnionPosition = getOption("union-position-checkbox",1);

	 		/*
				discounts.push(table[i].qd_percent);
				discounts.push(table[i].dd_percent);
				discounts.push(table[i].sd_percent);
				discounts.push(table[i].hd_percent);*/

	 		if(!flagUnionPosition){
	 			ArrayProducts.push({
	 				"barcode":p_barcode,
	 				"name":p_name,
	 				"price":p_price,
	 				"quantity":p_quantity,
	 				"cost":p_cost,
	 				"article":p_article,
	 				"td_percent":p_td_perc,
	 				"qd_quantity":p_qd_qty,	 				
	 				"qd_percent":p_qd_perc,
	 				"dd_flag":p_dd_flag,
	 				"dd_percent":p_dd_perc,
	 				"sd_flag":p_sd_flag,
	 				"sd_percent":p_sd_perc,
	 				"hd_flag":p_hd_flag,
	 				"hd_percent":p_hd_perc,
	 				"price_wd":p_price_wd,
	 				"cost_wd":p_cost_wd
	 			});
	 			posFindProduct = ArrayProducts.length - 1;
	 		}
	 		else{
	 			for(var i = 0; i<ArrayProducts.length;i++){
	 				if(ArrayProducts[i].barcode == barcode){
	 					ArrayProducts[i].quantity += p_quantity;	
	 					ArrayProducts[i].cost += p_cost;
	 					flagFindProduct = true;
	 					posFindProduct = i;
	 				}
	 			}
	 			if(!flagFindProduct){
	 				ArrayProducts.push({
	 					"barcode":p_barcode,
		 				"name":p_name,
		 				"price":p_price,
		 				"quantity":p_quantity,
		 				"cost":p_cost,
		 				"article":p_article,
		 				"td_percent":p_td_perc,
		 				"qd_quantity":p_qd_qty,	 				
		 				"qd_percent":p_qd_perc,
		 				"dd_flag":p_dd_flag,
		 				"dd_percent":p_dd_perc,
		 				"sd_flag":p_sd_flag,
		 				"sd_percent":p_sd_perc,
		 				"hd_flag":p_hd_flag,
		 				"hd_percent":p_hd_perc,
		 				"price_wd":p_price_wd,
		 				"cost_wd":p_cost_wd
	 				});
	 				posFindProduct = ArrayProducts.length - 1;
	 			}
	 		}
	// 	}	
	//}
	if(posFindProduct!=-1){
		calculateFinalCoasts();		
		fillTable(posFindProduct,1);
	}	
}

function calculateFinalCoasts(){
	finalCost = 0;
	finalCostSumm = 0;
	for(var i = 0; i<ArrayProducts.length;i++){
		finalCost += ArrayProducts[i].cost;	
		if(ArrayProducts[i].sd_flag){
			finalCostSumm += ArrayProducts[i].cost;	 
		}
	}
}

function addProductInSearch(barcode,article,name,price,td_percent,qd_quantity,qd_percent,dd_flag,sd_flag,hd_flag){
	var p_barcode 	= barcode;
	var p_name		= name;
	var p_price 	= price;
	var p_article 	= article;

	var p_td_perc 	= ((td_percent == undefined) ? 0 : td_percent);
	var p_qd_qty 	= ((qd_quantity == undefined) ? 0 : qd_quantity);
	var p_qd_perc 	= ((qd_percent == undefined) ? 0 : qd_percent);
	var p_dd_flag 	= ((dd_flag == undefined) ? false : dd_flag);
	var p_dd_perc 	= ((p_dd_flag == false) ? 0 : discount_card_percent);
	var p_sd_flag	= ((sd_flag == undefined) ? false : sd_flag);
	var p_sd_perc 	= 0;
	var p_hd_flag	= ((hd_flag == undefined) ? false : hd_flag);
	var p_hd_perc 	= 0;

	var p_cost_wd 	= 0;
	//console.log(td_percent);
	//console.log(p_td_perc);
	SearchProducts.push({
		"barcode":p_barcode,
		"name":p_name,
		"price":p_price,
		"article":p_article,
		"td_percent":p_td_perc,
		"qd_quantity":p_qd_qty,	 				
		"qd_percent":p_qd_perc,
		"dd_flag":p_dd_flag,
		"dd_percent":p_dd_perc,
		"sd_flag":p_sd_flag,
		"sd_percent":p_sd_perc,
		"hd_flag":p_hd_flag,
		"hd_percent":p_hd_perc
	});
}

function rewriteProductInfo(position,type){
	if(type){
		var row = ArrayProducts[position];
		var sum_value = getOption("sum-val-discount",1);
		var sum_percent = getOption("sum-procent-discount",1);
		var flagUnionPosition = getOption("union-position-checkbox",1);

		$('#big-name').text(row.name);
		$('#big-barcode').text(row.barcode);	
		$('#big-article').text(row.article);

		var quantity = 0;	

		$('#big-td-percent').text(row.td_percent);
		if(!flagUnionPosition){
			quantity = getQuantityProductByBarcode(row.barcode);
		}
		else{
			quantity = row.quantity;
		}

		if(quantity>= row.qd_quantity){
			$('#big-qd-percent').text(row.qd_percent);
		}
		else {
			$('#big-qd-percent').text("0");
		}

		if(row.dd_flag){
			$('#big-dd-percent').text(row.dd_percent);
		}
		else{
			$('#big-dd-percent').text("0");
		}

		if(row.sd_flag){
			if(finalCostSumm>=sum_value){
				$('#big-sd-percent').text(row.sd_percent);
			}
			else{
				$('#big-sd-percent').text("0");
			}
		}	
		if(row.hd_flag){
			$('#big-hd-percent').text(row.hd_percent);
		}
		else{
			$('#big-hd-percent').text("0");
		}
	}
	else{
		$('#big-name').text("#############");
		$('#big-barcode').text("#############");	
		$('#big-article').text("#############");	
		$('#big-td-percent').text("0");
		$('#big-dd-percent').text("0");
		$('#big-sd-percent').text("0");
		$('#big-qd-percent').text("0");
		$('#big-hd-percent').text("0");
		$('#discount-card-number').text("#############");
		$('#discount-card-percent').text("0.00");
		$('#final-cost').text("0.00");

		discount_card_number 	= "#############";
		discount_card_percent 	= 0;
	}
	
	
}
							