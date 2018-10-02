var flagActiveSearch = false;
var flag_check_type = 0;

var flag_window_state	= 0;

var pay_str_list = null;
var pay_modal_inputs = null; 
var user_block_inputs = null;

var user_block_enter = null;
var user_block_close = null;

function setFlag (variable) {
	flag_window_state = variable;
}

function focusFirstStr(){
	$('#pay_modal_nal').focus();	
}

function search(method){
	var search_text = $('#search-field').val();
	var params = [];
	params.push(search_text);
	params.push(method);

	last_value_search = search_text;
	last_method_search = method;
	
	executeOperation("findByMethod",params);
	setTimeout(function(){
		$('#search-products').scrollTop(0);
	},250);
}

function searchDiscountCard(){
	var search_text = $('#search-field').val();
	findDiscountCardByNumber(search_text);
}

function searchWeightBarcode(){
	var search_text = $('#search-field').val();
	findProductByWeightBarcode(search_text);
}

function getActiveTabNum(navTabs){
	var activeRoute = 0;
	navTabs.find('a').each(
		function(index){
			if($(this).hasClass('active')){
				activeRoute = index;
			}
		}
	);
	return activeRoute;
}

function enterLoginPassword(){
	var params = [];
	params.push($('#sel_kassir').val());
	params.push($('#pass_kassir').val());
	executeOperation("getUserByLP",params);
}

function switchTypeCheck(){
	switch(flag_check_type){
		case 0:
			$('#type-check').text('продажа');
			$('#type-check').addClass("type-check-sale");
			flag_check_type = 1;
			break;
		case 1:
			$('#type-check').text('возврат');
			$('#type-check').removeClass("type-check-sale");
			$('#type-check').addClass("type-check-return");
			flag_check_type = 2;
			break;
		case 2:
			$('#type-check').text('продажа');
			$('#type-check').addClass("type-check-sale");
			$('#type-check').removeClass("type-check-return");
			flag_check_type = 1;
			break;
	}
}

function Initialize(){
	
	$('#user_block_modal').modal('show');
	setFlag (3);

	switchTypeCheck();

	pay_modal_inputs = $('#pay_modal_nal, #pay_modal_bnal, #pay_modal_sert, #pay_modal_disc');
	pay_modal_inputs.on('input', payModalCalculation);
	user_block_inputs = $('#sel_kassir, #pass_kassir, #login_reg, #pass_reg');
	user_block_inputs.on('keypress', function(e){
		switch(e.keyCode){
			case 13:
				enterLoginPassword();
				break;
		}
	});

	user_block_enter = $('#button-enter, #button-register');
	user_block_enter.on('click', function(e){
		enterLoginPassword();	
	});

	user_block_close = $('#button-close-enter, #button-close-register');
	user_block_close.on('click', function(e){
		closeWindow();	
	});

	var prefix_inputs = $('#weight-barcode-prefix, #discount-barcode-prefix')
	prefix_inputs.on("input",function(e){
		if($(this).val().length>2){
			$(this).val(99);
		}
	});

	$('#pay_modal').on('show', function() {
	  $(this).find('selected-str').focus();
	});

	$('#button-edit-quantity').on("click",function(e){
		if(ArrayProducts.length>0){
			$('#change_quantity_modal').modal('show');
			$('#modal-quantity-product').val(1);
			setFlag(6);	
		}
	});

	$('#button-plus-product').on("click",function(e){
		changeQuantityCurrentProduct(1);
	});

	$('#button-minus-product').on("click",function(e){
		changeQuantityCurrentProduct(2);
	});

	$('#pay_modal_disc').on("input", 
		function(e){
			costDiscount = $(this).val();			 
		}
	);

	$('#backup-folder-button').on("click",function(e){
		$('#backup-folder').click();	
	});

	$('#backup-folder').on('change', function(e){
		var path_elem = $('#backup-folder');
		var path = "";
		if(path_elem.length>0){
			path = path_elem.get(0).files[0].path;
			$('#backup-folder-path').val(path);	
		}
			
	});

	$('#search-field').on('focus',function(e){
		flagActiveSearch = true;
	});

	$('#search-field').on('blur',function(e){
		flagActiveSearch = false;
	});
}

function getCurrentNumberProduct(){
	var current_number = Number($('#products').find('.active').find('div')[0].innerText) - 1;
	return current_number;
}

window.onload = function(){
	Initialize();

	window.onkeydown = function(e){
		switch (flag_window_state) {
			case 0: //main
				switch (e.keyCode) {
					case 13: // Enter
						var flagChooseSearchArticle = getOption("choose-search-article",1);
						var flagChooseSearchName= getOption("choose-search-name",1);
						var flagChooseSearchPrice = getOption("choose-search-price",1);
						var flagChooseSearchBarcode = getOption("choose-search-barcode",1);

						var curr_flag = "";
						if(flagChooseSearchArticle){search(1)}
						if(flagChooseSearchName){search(2)}
						if(flagChooseSearchPrice){search(3)}
						if(flagChooseSearchBarcode){search(4)}
						break;
					case 16: //Shift
						break;
					case 18: //Alt
						activeSearchField();
						break;
					case 27: //Esc
						closeWindow();
						break;
					case 32: // Pay Space
						$('#pay_modal').modal('show');
						var currCostDiscount = finalCost*discount_card_percent/100;
						currCostDiscount = currCostDiscount.toFixed(2);
						if(currCostDiscount>0){
							$('#pay_modal_disc').val(currCostDiscount);
						}
						//payModalCalculation();
						setFlag(4);

						pay_str_list = $('.pay-left').find('input');
						var flagManualDiscount = getOption("manual-discount-checkbox",1);
						if(flagManualDiscount){
							$('#pay_modal_disc').prop('disabled', false);
						}
						else{
							$('#pay_modal_disc').prop('disabled', true);
						}
						setTimeout(focusFirstStr,1000);
						break;	
					case 38: //Top
						if(!flagActiveSearch){
							changeRowPosition(true,1);
						}
						break;
					case 40: // Down
						if(!flagActiveSearch){
							changeRowPosition(false,1);
						}
						break;
					case 46: // Del
						deleteProduct();
						break;	
					case 106: // *
						if(ArrayProducts.length>0){
							$('#change_quantity_modal').modal('show');
							$('#modal-quantity-product').val(1);
							$('#set-quantity').addClass('active-option');
							$('#sum-quantity').removeClass('active-option');
							setFlag(6);	
						}
						break;
					case 107:// +
						changeQuantityCurrentProduct(1);
						//addCurrentProduct();
						break;
					case 109:// -
						changeQuantityCurrentProduct(2);
						//addCurrentProduct()
						//createBuckupDB();
						break;
					case 113: //SEARCH ARTICLE 	f2
						search(1);
						break;
					case 114: //SEARCH NAME 	f3
						search(2);
						break;
					case 115: //SEARCH PRICE 	f4
						search(3);
						break;
					case 116: //SEARCH BARCODE 	f5
						search(4);
						break;
					case 117: //SEARCH DISCOUNT	f6
						searchDiscountCard();
						break;
					case 118: //SEARCH SECTION 	f7
						//searchWeightBarcode();
						switchTypeCheck();
						break;		
					case 119: //service f8
						openServiceModal();
						break;
					case 120: //lock f9
						var result = confirm("Вы действительно хотите выйти из системы?");
						if(result){
							$('#user_block_modal').modal('show');
							setFlag (3);
						}
						break;
					case 122: //handle discount f11
						if(ArrayProducts.length>0){
							var curr_product = ArrayProducts[getCurrentNumberProduct()];
							if(!curr_product.hd_flag){
								alert("Для выбранного товара ручная скидка не доступна!");
								break;
							}
							$('#change_handle_discount_modal').modal('show');
							$('#modal-hd-percent').on("input",function(e){
								var current_discount = curr_product.price * Number($(this).val()) / 100;
								current_discount = Number(current_discount.toFixed(2));
								$("#modal-hd-coast").val(current_discount);
							});
							$('#modal-hd-coast').on("input",function(e){
								var current_discount =Number($(this).val()) * 100 / curr_product.price;
								current_discount = Number(current_discount.toFixed(2));
								$("#modal-hd-percent").val(current_discount);
							});

							$('#modal-hd-percent').val(curr_product.hd_percent);
							var current_discount = curr_product.price * curr_product.hd_percent / 100;
							current_discount = Number(current_discount.toFixed(2));
							$('#modal-hd-coast').val(current_discount);
							setFlag (7);
						}
						break;		
				}
				break;
			case 1://service
				switch (e.keyCode) {
					case 27: //Esc
						$('#service_modal').modal('hide');
						setFlag(0);
						break;
					case 117: // openOptionModal f6
						openOptionModal();
						executeOperation("getUsers");
						setFlag(2);
						break;
				}
				break;
			case 2://options
				switch (e.keyCode) {
					case 13:
						saveOptionsArray();
						executeOperation("setOptions");
						$('#options_modal').modal('hide');
						setFlag(1);
						break;
					case 27: //close option Esc
						$('#options_modal').modal('hide');
						setFlag(1);
						setOptionFlag(0);
						break;
					case 37: // Down
						changeOptionTab(1,true);
						break;
					case 38:
						switch (flag_option_state) {
							case 8:
								changeRowPosition(true,3);
								break;
						}
						break;	
					case 39: // Down
						changeOptionTab(1,false);
						break;	
					case 40:
						switch (flag_option_state) {
							case 8:
								changeRowPosition(false,3);
								break;
						}
						break;	
					case 46:
						switch (flag_option_state) {
							case 8:
								if (confirm("Удалить выбранного пользователя?")) {
									var params = [];
									params.push(getActiveUser().name);
									executeOperation('deleteUser',params);
								}
								break;
						}
						break;	
					case 112: //f1
						switch (flag_option_state) {
							case 0:
								focusByID("ip-address-ksa");
								break;
							case 1:
								 
								break;
							case 2:
								checkByID("union-position-checkbox");
								break;
							case 3:
								checkByID("weight-barcode-checkbox");
								break;
							case 4:
								checkByID("card-discount-checkbox");
								break;
							case 7:
								$('#backup-folder-button').click();
								break;
							case 8:
								focusByID("login_reg");
								break;
							}
						break;
					case 113: //f2
						switch (flag_option_state) {
							case 0:
								
								break;
							case 1:
								 
								break;
							case 2:
								focusByID("rounding-accuracy");
								break;
							case 3:
								focusByID("weight-barcode-prefix");
								break;
							case 4:
								checkByID("quantity-discount-checkbox");
								break;
							case 8:
								focusByID("pass_reg");
								break;
						}
						break;
					case 114: //f3
						switch (flag_option_state) {
							case 0:
								
								break;
							case 1:
								 
								break;
							case 2:
								var ids = [];
								ids.push("choose-search-article");
								ids.push("choose-search-name");
								ids.push("choose-search-price");
								ids.push("choose-search-barcode");
								changeByIDs(ids);
								break;
							case 3:
								var ids = [];
								ids.push("weight-barcode-first");
								ids.push("weight-barcode-second");
								changeByIDs(ids);
								break;
							case 4:
								checkByID("sum-discount-checkbox");
								break;
							case 8:
								var login = $('#login_reg').val();
								var password = $('#pass_reg').val();
								var message = varification(login,password);
								if(login == "admin"){
									message += "Имя пользователя admin нельзя использовать!\n"
								}
								if(message!= ""){
									alert(message);
									break;
								}
								if (confirm("Сохранить пользователя?")) {
									var params = [];
									params.push(login);
									params.push(password);
									executeOperation("saveUser",params);
								}
								break;
						}
						break;
					case 115: //f4
						switch (flag_option_state) {
							case 0:
								
								break;
							case 1:
								 
								break;
							case 2:
								
								break;
							case 3:
								focusByID("discount-barcode-prefix");
								break;
							case 4:
								checkByID("temporary-discount-checkbox");
								break;
							case 8:
								var user = getActiveUser();
								$('#login_reg').val(user.name);
								$('#pass_reg').val(user.password);
								break;
						}
						break;
					case 116: //f5
						switch (flag_option_state) {
							case 0:
								
								break;
							case 1:
								 
								break;
							case 2:
								
								break;
							case 3:
								
								break;
							case 4:
								checkByID("manual-discount-checkbox");
								break;
							case 8:
								break;
						}
						break;
					case 117: //f6
						switch (flag_option_state) {
							case 0:
								
								break;
							case 1:
								 
								break;
							case 2:
								
								break;
							case 3:
								
								break;
							case 4:
								focusByID("max-procent-discount");
								break;
						}
						break;
					case 118: //f7
						switch (flag_option_state) {
							case 0:
								
								break;
							case 1:
								 
								break;
							case 2:
								
								break;
							case 3:
								
								break;
							case 4:
								var ids = [];
								ids.push("choose-max-discount");
								ids.push("choose-total-discount");
								changeByIDs(ids);
								break;
						}
						break;
					case 119: //f8
						switch (flag_option_state) {
							case 0:
								
								break;
							case 1:
								 
								break;
							case 2:
								
								break;
							case 3:
								
								break;
							case 4:
								focusByID("sum-val-discount");
								break;
						}
						break;
						case 120: //f9
						switch (flag_option_state) {
							case 0:
								
								break;
							case 1:
								 
								break;
							case 2:
								
								break;
							case 3:
								
								break;
							case 4:
								focusByID("sum-procent-discount");
								break;
						}
						break;
				}
				break;
			case 3://lock
				switch (e.keyCode) {
					/*case 13: //Enter 
						
						break;*/
					case 27://Esc
						closeWindow();
						break;
					case 37: // Down
						changeOptionTab(2,true);
						break;
					case 39: // Down
						changeOptionTab(2,false);
						break;	
					case 112:
						/*var activeRoute = getActiveTabNum($('#myTab2'));
						switch(activeRoute){
							case 0:*/
								focusByID("sel_kassir");
								/*break;
							case 1:
								focusByID("login_reg");
								break;
						}		*/				
						break;
					case 113:
						/*var activeRoute = getActiveTabNum($('#myTab2'));
						switch(activeRoute){
							case 0:*/
								focusByID("pass_kassir");
							/*	break;
							case 1:
								focusByID("pass_reg");
								break;
						}*/
						break;		

				}
				break;
			case 4://pay
				switch (e.keyCode) {
					case 27: //close pay Esc
						$('#pay_modal').modal('hide');
						pay_modal_inputs.val("");
						$('#pay_modal_rest_money').text("0.00");	
						setFlag(0);
						break;
					case 32: //Space
						$('#print-check').click();
						break;
					case 38: //Top
						e.preventDefault();
						changeStrPosition(true);
						break;
					case 40: // Down
						e.preventDefault();
						changeStrPosition(false);
						break;	
				}
				break;		
			case 5://search
				switch (e.keyCode) {
					case 13: // Enter
						addSearchProduct();
						$('#search_modal').modal('hide');
						setFlag(0);
						break;
					case 27: //close search Esc
						$('#search_modal').modal('hide');
						setFlag(0);
						break;
					case 38: //Top
						if(!flagActiveSearch){
							changeRowPosition(true,2);
						}
						break;
					case 40: // Down
						if(!flagActiveSearch){
							changeRowPosition(false,2);
						}
						break;
				}
				break
			case 6://change quantity
				switch (e.keyCode) {
					case 13: // Enter
						var value = parseFloat($('#modal-quantity-product').val());
						if(value>0){
							if($('#set-quantity').hasClass('active-option')){
								changeQuantityCurrentProduct(3, value);
							}
							else {
								changeQuantityCurrentProduct(4, value);
							}
							$('#change_quantity_modal').modal('hide');
							setFlag(0);
						}
						else {
							alert("Количество должно быть больше нуля!!!");
						}
						break;	
					case 27: //close pay Esc
						$('#change_quantity_modal').modal('hide');
						setFlag(0);
						break;
					case 112: //f1
						var ids = [];
						ids.push("set-quantity");
						ids.push("sum-quantity");
						changeByIDs(ids);
						break;
					case 113: //f2
						focusByID("modal-quantity-product");
						break;
				}	
				break;
			case 7://handle discount
				switch (e.keyCode) {
					case 13: // Enter
						$('#change_handle_discount_modal').modal('hide');
						var current_number = getCurrentNumberProduct();
						ArrayProducts[current_number].hd_percent = Number($('#modal-hd-percent').val());
						rewriteProductInfo(current_number,true);
						fillTable(current_number,1);
						$('#modal-hd-percent').off("input");
						$('#modal-hd-coast').off("input");
						$('#modal-hd-percent').val(0);
						$('#modal-hd-coast').val(0);
						setFlag(0);
						break;
					case 27: //close hd Esc
						$('#change_handle_discount_modal').modal('hide');
						$('#modal-hd-percent').off("input");
						$('#modal-hd-coast').off("input");
						$('#modal-hd-percent').val(0);
						$('#modal-hd-coast').val(0);
						setFlag(0);
					case 112: //f1
						focusByID("modal-hd-percent");
						break;
					case 113: //f2
						focusByID("modal-hd-coast");
						break;	
				}
				break;	
		}	

	}
}

/*function getCurrentTableStr(flag){

	var currTableStr = null;

	switch(flag){
		case 1:
			currTableId = $("#products");
			break;
		case 2:
			currTableId = $("#search-products");
			break;
	}

	currTableId.find(".row").each(function(index) {
		if($(this).hasClass("active")){

		}
	});
}*/

function getActiveUser(){
	var list = $('#users-list').find('.active').children();
	var user = {
		"name":list[1].innerText,
		"password":list[2].innerText
	};
	return user;
}

function openOptionModal(){
	var modal = $('#options_modal');
	$('#options_modal').modal('show');
	setFlag(2);
	setOptions();
}

function openServiceModal(){
	if(ArrayProducts.length>0){
		alert("Нельзя открыть 'Сервис' во время продажи!!!");
	}
	else{
		$('#service_modal').modal('show');
		setFlag(1);
	}
}

function addSearchProduct () {
	var tbody = $('#search-products');
	var rows = tbody.find('.row');

	rows.each(function(index) {
		if($(this).hasClass("active")){					 
			addProductInArray(
				SearchProducts[index].barcode, 
				SearchProducts[index].article, 
				SearchProducts[index].name, 
				SearchProducts[index].price,
				1,
				SearchProducts[index].td_percent,
				SearchProducts[index].qd_quantity,
				SearchProducts[index].qd_percent,
				SearchProducts[index].dd_flag,
				SearchProducts[index].sd_flag,
				SearchProducts[index].hd_flag
			);
		}
	});

}

function activeSearchField(){
	if(flagActiveSearch){
		$('#search-field').blur();
	}
	else{
		$('#search-field').focus();
	}	
}

function closeWindow() {
	if (confirm("Закрыть рабочее место кассира?")) {
		window.close();
	}
}

function changeQuantityCurrentProduct(variant, quantity) {
	$("#products").find(".row").each(function(index) {
		if($(this).hasClass("active")){
			switch(variant){
				case 1: //plus one
					var pos = index+1;
					ArrayProducts[ArrayProducts.length - pos].quantity += 1;
					ArrayProducts[ArrayProducts.length - pos].cost = ArrayProducts[ArrayProducts.length - pos].price * ArrayProducts[ArrayProducts.length - pos].quantity;
					calculateFinalCoasts();
					fillTable(ArrayProducts.length - pos,1);
					break;
				case 2: //minus
					var pos = index+1;
					if(ArrayProducts[ArrayProducts.length - pos].quantity>1){
						ArrayProducts[ArrayProducts.length - pos].quantity -= 1;
						ArrayProducts[ArrayProducts.length - pos].cost = ArrayProducts[ArrayProducts.length - pos].price * ArrayProducts[ArrayProducts.length - pos].quantity;
						calculateFinalCoasts();
						fillTable(ArrayProducts.length - pos,1);
					}	
					break;
				case 3: //multiple
					var pos = index+1;
					ArrayProducts[ArrayProducts.length - pos].quantity = quantity;
					ArrayProducts[ArrayProducts.length - pos].cost = ArrayProducts[ArrayProducts.length - pos].price * quantity;
					calculateFinalCoasts();
					fillTable(ArrayProducts.length - pos,1);
					break;		
				case 4: //add few
					var pos = index+1;
					ArrayProducts[ArrayProducts.length - pos].quantity += quantity;
					ArrayProducts[ArrayProducts.length - pos].cost = ArrayProducts[ArrayProducts.length - pos].price * ArrayProducts[ArrayProducts.length - pos].quantity;
					calculateFinalCoasts();
					fillTable(ArrayProducts.length - pos,1);
					break;					
			}
			
		}
	});
}

function deleteProduct() {
	$("#products").find(".row").each(function(index) {
		if($(this).hasClass("active")){
			var pos = index+1;
			ArrayProducts.splice(ArrayProducts.length - pos, 1);

			if(index == ArrayProducts.length){
				if(ArrayProducts.length == 0){
					fillTable(0,0);
					rewriteProductInfo(0,false);
				}
				else {
					calculateFinalCoasts();
					fillTable(ArrayProducts.length - index,1);
				}
			}
			else {
				calculateFinalCoasts();
				fillTable(ArrayProducts.length - pos,1);
			}
		}
	});

}

function changeStrPosition(type){

	var thisIndex = null;

	pay_str_list.each(function(index) {
		if($( this ).hasClass("selected-str")){
			thisIndex = index;
		}
	});

    var newIndex = null;

    var quantity = pay_str_list.length;

	if(type == true) {
	   newIndex = thisIndex - 1;
	}
	if(type == false) {
	   newIndex = thisIndex + 1;       
	}
	if(type == null) {
	   newIndex = 0;       
	}

	if((newIndex>=0)&&(newIndex<quantity)){
		if(newIndex !== null) {     
    		pay_str_list.removeClass("selected-str");
    		pay_str_list.each(function(index) {
    			if(index == newIndex){
    				$( this ).addClass('selected-str');
    				$( this ).focus();
    			}
    		});

    	}	
	}
}

function changeRowPosition(type,flag){
	
	var thisIndex = null;

	var tbody = null;
	var rows = null;

	switch (flag) {
		case 1:
			tbody = $("#products");
			break;
		case 2:
			tbody =$("#search-products")
			break;
		case 3:
			tbody =$("#users-list")
			break;
	}
	rows = tbody.find(".row");
	rows.each(function(index) {
		if($( this ).hasClass("active")){
			thisIndex = index;
		}
	});

    var quantity = rows.length;
    var currScroll = tbody.scrollTop();

    var clientHeight = 0;
    if(tbody.find('.active').length>0){
    	clientHeight = tbody.find('.active').get(0).clientHeight;
    } 

	if(type) {
	   newIndex = thisIndex - 1;
	   tbody.scrollTop(currScroll - clientHeight);
	}
	else {
	   newIndex = thisIndex + 1; 
	   tbody.scrollTop(currScroll + clientHeight);      
	}
	if((newIndex>=0)&&(newIndex<quantity)){
		if(newIndex !== null) {     
    		rows.removeClass("active"); 
    		tbody.find('.row').each(function(index){
				if(index == newIndex){
					$(this).addClass('active');
						switch (flag) {
							case 1:
								rewriteProductInfo(ArrayProducts.length - index - 1,true);
								break;
						}
				}
			})
    		//fillTable(quantity - newIndex - 1,flag);
    	}	
	}
}

$(document).ready(function() {
    var pressed = false; 
    var chars = []; 

    $(window).keydown(function(e) {
    	if( e.keyCode == 123 ){
      		e.preventDefault();
        }
    });

    $(window).keyup(function(e) {
    	if( e.keyCode == 123 ){
      		e.preventDefault();
        }
    });

    $(window).keypress(function(e) {
        if (e.which >= 48 && e.which <= 57) {
            chars.push(String.fromCharCode(e.which));
        }
        if( e.keyCode == 13 ){
      		e.preventDefault();
        }
        if (pressed == false) {
            setTimeout(function(){
                if (chars.length >= 10) {
                    var barcode = chars.join("");

                    findByFullBarcode(barcode);
                }
                chars = [];
                pressed = false;
            },500);

        }
        pressed = true;
    });
});

var parsed = null;

function loadFile(files){
    var file = files[0];
	var reader = new FileReader();
	reader.onload = function (e) {
    	parsed = new DOMParser().parseFromString(this.result, "text/xml"); 
    	var rows = $('Row', parsed);
    	var params = [];
    	for(var i = 1; i < rows.length; i++){

    		var row = rows[i];

    		var code 	= row.children[0].innerHTML;
    		var article	= row.children[3].innerHTML;
    		var barcode = row.children[4].innerHTML;
    		var name 	= row.children[5].innerHTML;
    		var price 	= row.children[7].innerHTML;
    		var new_row = {"code":code, "article":article, "barcode":barcode, "name":name, "price":price};
    		//console.log(new_row);
	   		params.push(new_row);

       	}
       	executeOperation("addProductsInDB",params);

	};
	reader.readAsText(file);
}
