var options = [];
var flag_option_state	= 0;

function setOptionFlag (variable) {
	flag_option_state = variable;
}

function setOptions(){
	var curr_option = null;
	for(var i=0; i<options.length;i++){
		curr_option = $('#'+options[i].name);
		//console.log(options[i].name + " to " +  options[i].value);
		switch (curr_option.attr('type')) {
			case "checkbox":
				curr_option.prop("checked",JSON.parse(options[i].value));	
				break;
			case "text":
				curr_option.val(options[i].value);	
				break;
			case "number":
				curr_option.val(options[i].value);	
				break;	
			default:
				switch (curr_option.prop("tagName")) {
					case "A":
						//console.log(options[i]);
						curr_option.removeClass('active-option');
						if(options[i].value!=""){
							if(JSON.parse(options[i].value)){
								curr_option.addClass('active-option')
							}	
						}
						break;
				}
				break;
		}
	}	
}

function saveOptionsArray(){
	for(var i=0; i<options.length;i++){
		options[i].value = getOptionByID(options[i].name);	
	}
}

function getOption(name, type){
	for(var i=0; i<options.length;i++){
		if(options[i].name == name){
			switch (type) {
				case 1: 	//если значение нужно парсить из строки
					return JSON.parse(options[i].value);
					break;
				default:
					return options[i].value;
					break;
			}
		}	
	}	
	return false;
}

function setOption(name,value){
	for(var i=0; i<options.length;i++){
		if(options[i].name == name){
			options[i].value = value.toString();
		}	
	}	
}

function setStandartOptions(){
	option = [];
	//f1
	options.push({"name":"union-position-checkbox","value":"false"});
	options.push({"name":"weight-barcode-checkbox","value":"false"});
	options.push({"name":"card-discount-checkbox","value":"false"});
	options.push({"name":"backup-folder-path","value":""});
	options.push({"name":"ip-address-ksa","value":""});
	//
	//f2
	options.push({"name":"rounding-accuracy","value":""});
	options.push({"name":"weight-barcode-prefix","value":""});
	options.push({"name":"quantity-discount-checkbox","value":"false"});
	//
	//f3
	options.push({"name":"weight-barcode-first","value":"true"});
	options.push({"name":"weight-barcode-second","value":"false"});
	options.push({"name":"choose-search-article","value":"false"});
	options.push({"name":"choose-search-name","value":"false"});
	options.push({"name":"choose-search-price","value":"false"});
	options.push({"name":"choose-search-barcode","value":"true"});
	options.push({"name":"sum-discount-checkbox","value":"false"});
	//
	//f4
	options.push({"name":"temporary-discount-checkbox","value":"false"});
	options.push({"name":"discount-barcode-prefix","value":""});//
	//f5
	options.push({"name":"manual-discount-checkbox","value":"false"});
	//
	//f6
	options.push({"name":"max-procent-discount","value":""});
	//
	//f7
	options.push({"name":"choose-max-discount","value":"true"});
	options.push({"name":"choose-total-discount","value":"false"});
	//
	//f8
	options.push({"name":"sum-val-discount","value":"0"});
	//
	//f9
	options.push({"name":"sum-procent-discount","value":"0"});
	//
}

function getOptionByID(id) {
	var curr_option = null;
	var result = null;
	curr_option = $('#'+id);
	switch (curr_option.attr('type')) {
		case "checkbox":
			result = curr_option.prop("checked");
			break;
		case "text":
			result = curr_option.val();	
			break;
		case "number":
			result = curr_option.val();	
			break;
		default:
			switch (curr_option.prop("tagName")) {
				case "A":
					if(curr_option.hasClass('active-option')){
						result = true;		
					}
					else {
						result = false;
					}
					break;
			}
			break;
	}
	//console.log(id + "  -  " +curr_option.attr('type'));
	return result.toString();
}

function checkByID(id){
	var ch_state = $('#'+id);
	if(ch_state.prop("checked")){
		ch_state.prop("checked",false);	
	}
	else {
		ch_state.prop("checked",true);	
	} 

}

function focusByID(id){
	if($('#'+id).is( ":focus" )){
		$('#'+id).blur();
	}
	else{
		$('#'+id).focus();
	}
}

/*function changeByIDs(id_first, id_second){
	if($('#'+id_first).hasClass('active-option')){
		$('#'+id_first).removeClass('active-option');
		$('#'+id_second).addClass('active-option');	
		return 2;
	}
	else {
		$('#'+id_first).addClass('active-option');
		$('#'+id_second).removeClass('active-option');	
		return 1;
	}
	return 0;
}*/

function changeByIDs(ids){
	var last_active_id = 0;
	for (var i = 0; i < ids.length; i++) {
		if($('#'+ids[i]).hasClass('active-option')){
			last_active_id = i;
			$('#'+ids[i]).removeClass('active-option');	
		}
	}
	if(last_active_id != ids.length - 1){
		$('#'+ids[last_active_id+1]).addClass('active-option');	
	}
	else {
		$('#'+ids[0]).addClass('active-option');		
	}
	/*if($('#'+id_first).hasClass('active-option')){
		$('#'+id_first).removeClass('active-option');
		$('#'+id_second).addClass('active-option');	
		return 2;
	}
	else {
		$('#'+id_first).addClass('active-option');
		$('#'+id_second).removeClass('active-option');	
		return 1;
	}
	return 0;*/
}

function changeOptionTab(variable,type){
	var tabs = undefined;

	switch(variable){
		case 1:
			tabs = $('#options_modal').find('.nav-item').find('.nav-link');
			break;
		case 2:
			tabs = $('#user_block_modal').find('.nav-item').find('.nav-link');
			break;
	}

	var thisIndex = null;
	var newIndex = null;
	var quantity = tabs.length;

	tabs.each(
		function(index){
			if($(this).hasClass('active')){
				thisIndex = index;
			}
		}
	);

	if(type) {
	   newIndex = thisIndex - 1;
	}
	else {
	   newIndex = thisIndex + 1;   
	}

	if((newIndex>=0)&&(newIndex<quantity)){
		tabs.each(
			function(index){
				if(newIndex == index){
					setOptionFlag(index);
					$(this).tab('show');
				}
			}
		);
	}
}