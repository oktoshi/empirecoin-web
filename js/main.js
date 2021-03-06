// Class Definitions
var Image = function (id) {
	this.imageId = id;
	this.imageSrc = '/images/carousel/'+id+'.jpg';
};
var ImageCarousel = function (containerElementId) {
	this.numPhotos = 16;
	this.currentPhotoId = -1;
	this.slideTime = 5000;
	this.widthToHeight = Math.round(1800/570, 6);
	this.containerElementId = containerElementId;
	this.images = new Array();
	var _this = this;
	
	this.initialize = function() {
		for (var imageId=0; imageId<this.numPhotos; imageId++) {
			this.images[imageId] = new Image(imageId);
			$('<img />').attr('src',this.images[imageId].imageSrc).appendTo('body').css('display','none');
			$('#'+this.containerElementId).append('<div id="'+this.containerElementId+'_image'+imageId+'" class="carouselImage" style="background-image: url(\''+this.images[imageId].imageSrc+'\');"></div>');
		}
		
		this.nextPhoto();
	};
	
	this.nextPhoto = function() {
		var prevPhotoId = this.currentPhotoId;
		var curPhotoId = prevPhotoId + 1;
		if (curPhotoId == this.numPhotos) curPhotoId = 0;
		
		if (prevPhotoId == -1) {}
		else $('#'+this.containerElementId+'_image'+prevPhotoId).fadeOut('slow');
		
		$('#'+this.containerElementId+'_image'+curPhotoId).fadeIn('slow');
		this.currentPhotoId = curPhotoId;
		
		setTimeout(function() {_this.nextPhoto()}, this.slideTime);
	};
};
var chatWindow = function(chatWindowId, toUserId) {
	this.chatWindowId = chatWindowId;
	this.toUserId = toUserId;
	
	this.initialize = function() {};
};
var option = function(event, option_index, option_id, db_option_index, name, points, has_votingaddr) {
	this.event = event;
	this.option_index = option_index;
	this.option_id = option_id;
	this.db_option_index = db_option_index;
	this.name = name;
	this.existing_bet_sum = 0;
	this.bet_index = false;
	this.points = points;
	this.event.option_id2option_index[option_id] = option_index;
	this.has_votingaddr = has_votingaddr;
	this.event.game.option_has_votingaddr[option_id] = has_votingaddr;
	
	option_id2option_index[option_id] = option_index;
	option_index2option_id[option_index] = option_id;
};
var option_bet = function(bet_index, option_id) {
	this.bet_index = bet_index;
	this.option_id = option_id;
	this.slider_val = 50;
	this.amount = 0
};
var mature_io = function(io_index, io_id, amount, create_block_id) {
	this.io_index = io_index;
	this.io_id = io_id;
	this.amount = amount;
	this.create_block_id = create_block_id;
};
var vote_input = function(input_index, io_id, amount, create_block_id) {
	this.input_index = input_index;
	this.io_id = io_id;
	this.amount = amount;
	this.create_block_id = create_block_id;
};
var vote_option = function(option_index, name, option_id) {
	this.option_index = option_index;
	this.name = name;
	this.option_id = option_id;
	this.slider_val = 50;
	this.amount = 0;
};

// Global Functions
function rtrim(str, charlist) {
  charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
    .replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
  var re = new RegExp('[' + charlist + ']+$', 'g');
  return (str + '')
    .replace(re, '');
}
function format_coins(amount) {
	if (amount > Math.pow(10, 10)) {
		return parseFloat((amount/Math.pow(10, 9)).toPrecision(5))+"B";
	}
	else if (amount > Math.pow(10, 7)) {
		return parseFloat((amount/Math.pow(10, 6)).toPrecision(5))+"M";
	}
	else if (amount > Math.pow(10, 4)) {
		return parseFloat((amount/Math.pow(10, 3)).toPrecision(5))+"k";
	}
	else if (amount == 0) return "0";
	else if (amount < 1) {
		return rtrim((amount).toPrecision(5), "0.");
	}
	else return parseFloat((amount).toPrecision(5));
}
function explorer_search() {
	var search_term = $('#explorer_search').val();
	var search_url = "/ajax/explorer_search.php?";
	if (typeof games !== "undefined") search_url += "game_id="+games[0].game_id+"&";
	if (typeof blockchain_id !== "undefined") search_url += "blockchain_id="+blockchain_id+"&";
	search_url += "search_term="+search_term;
	
	$.get(search_url, function(result) {
		var result_obj = JSON.parse(result);
		if (result_obj['status_code'] == 1) window.location = result_obj['message'];
		else alert(result_obj['message']);
	});
}

// Initialize Variables
var chatWindows = new Array();
var userId2ChatWindowId = new Array();
var visibleChatWindows = 0;
var option_id2option_index = {};
var option_index2option_id = {};

// OBJECT: Wallet
var last_round_shown;
var round_sections_shown = 1;

function openChatWindow(userId) {
	if (typeof userId2ChatWindowId[userId] === 'undefined' || userId2ChatWindowId[userId] === false) {
		var chatWindowId = chatWindows.length;
		newChatWindow(chatWindowId, userId);
	}
}
function newChatWindow(chatWindowId, userId) {
	chatWindows[chatWindowId] = new chatWindow(chatWindowId, userId);
	userId2ChatWindowId[userId] = chatWindowId;
	
	$('#chatWindows').append('<div id="chatWindow'+chatWindowId+'" class="chatWindow"></div>');
	$('#chatWindow'+chatWindowId).css("right", chatWindowId*230);
	$('#chatWindow'+chatWindowId).html(baseChatWindow(chatWindowId));
	renderChatWindow(chatWindowId);
	$('#chatWindowWriter'+chatWindowId).focus();
}
function closeChatWindow(chatWindowId) {
	userId2ChatWindowId[chatWindows[chatWindowId].toUserId] = false;
	for (var i=chatWindowId+1; i<chatWindows.length; i++) {
		userId2ChatWindowId[chatWindows[i].toUserId] = i-1;
		chatWindows[i-1] = chatWindows[i];
		$('#chatWindow'+(i-1)).html(baseChatWindow(i-1));
		renderChatWindow(i-1);
	}
	$('#chatWindow'+(chatWindows.length-1)).remove();
	chatWindows.length = chatWindows.length-1;
}
function baseChatWindow(chatWindowId) {
	return $('#chatWindowTemplate').html().replace(/CHATID/g, chatWindowId);
}
function renderChatWindow(chatWindowId) {
	$('#chatWindowTitle'+chatWindowId).html('Loading...');
	$('#chatWindowContent'+chatWindowId).html('');
	$.get("/ajax/chat.php?action=fetch&game_id="+games[0].game_id+"&user_id="+chatWindows[chatWindowId].toUserId, function(result) {
		var result_obj = JSON.parse(result);
		$('#chatWindowTitle'+chatWindowId).html(result_obj['username']);
		$('#chatWindowContent'+chatWindowId).html(result_obj['content']);
		$('#chatWindowContent'+chatWindowId).scrollTop($('#chatWindowContent'+chatWindowId)[0].scrollHeight);
	});
}
function sendChatMessage(chatWindowId) {
	var message = $('#chatWindowWriter'+chatWindowId).val();
	$('#chatWindowSendBtn'+chatWindowId).html("...");
	$('#chatWindowWriter'+chatWindowId).val("");
	$.get("/ajax/chat.php?action=send&game_id="+games[0].game_id+"&user_id="+chatWindows[chatWindowId].toUserId+"&message="+encodeURIComponent(message), function(result) {
		$('#chatWindowSendBtn'+chatWindowId).html("Send");
		var result_obj = JSON.parse(result);
		$('#chatWindowContent'+chatWindowId).html(result_obj['content']);
		$('#chatWindowContent'+chatWindowId).scrollTop($('#chatWindowContent'+chatWindowId)[0].scrollHeight);
	});
}
$(window).keydown(function(e){
	var key = (e.which) ? e.which : e.keyCode;
	if (key == 13) {
		if ($(":focus").attr("class") == "chatWindowWriter") {
			var chatWindowId = $(":focus").attr("id").replace(/chatWindowWriter/g, '');
			sendChatMessage(chatWindowId);
		}
	}
});
function tab_clicked(index_id) {
	if (current_tab !== false) {
		$('#tabcell'+current_tab).removeClass("tabcell_sel");
		$('#tabcontent'+current_tab).hide();
	}
	
	$('#tabcell'+index_id).addClass("tabcell_sel");
	$('#tabcontent'+index_id).show();
	
	current_tab = index_id;
	
	if (index_id == 1) {
		refresh_players();
	}
}
function refresh_players() {
	$('#tabcontent1').html("Loading...");
	$.get("/ajax/show_players.php?game_id="+games[0].game_id, function(result) {
		$('#tabcontent1').html(result);
	});
}
function claim_coin_giveaway() {
	var giveaway_btn_txt = $('#giveaway_btn').html();
	$('#giveaway_btn').html("Loading...");
	
	$.get("/ajax/coin_giveaway.php?game_id="+games[0].game_id+"&do=claim", function(result) {
		$('#giveaway_btn').html(giveaway_btn_txt);
		
		if (result == "1") {
			alert("Great, coins have been added to your account!");
			window.location = '/wallet/'+games[0].game_url_identifier+'/';
			return false;
		}
		else alert("Your free coins have already been claimed.");
		
		games[0].refresh_if_needed();
	});
}
function rank_check_all_changed() {
	var set_checked = false;
	if ($('#rank_check_all').is(":checked")) set_checked = true;
	for (var i=1; i<=games[0].num_voting_options; i++) {
		$('#by_rank_'+i).prop("checked", set_checked);
	}
}
function vote_on_block_all_changed() {
	var set_checked = false;
	if ($('#vote_on_block_all').is(":checked")) set_checked = true;
	for (var i=1; i<games[0].game_round_length; i++) {
		$('#vote_on_block_'+i).prop("checked", set_checked);
	}
}
function by_entity_reset_pct() {
	for (var option_id=1; option_id<=games[0].num_voting_options; option_id++) {
		$('#option_pct_'+option_id).val("0");
	}
}
function loop_event() {
	/*var option_pct_sum = 0;
	for (var i=0; i<games[0].num_voting_options; i++) {
		var temp_pct = parseInt($('#option_pct_'+i).val());
		if (temp_pct && !$('#option_pct_'+i).is(":focus") && temp_pct != $('#option_pct_'+i).val()) {
			$('#option_pct_'+i).val(temp_pct);
		}
		if (temp_pct) option_pct_sum += temp_pct;
	}
	if (option_pct_sum <= 100 && option_pct_sum >= 0) {
		$('#option_pct_subtotal').html("<font class='greentext'>"+option_pct_sum+"/100 allocated, "+(100-option_pct_sum)+"% left</font>");
	}
	else {
		$('#option_pct_subtotal').html("<font class='redtext'>"+option_pct_sum+"/100 allocated</font>");
	}*/
	
	setTimeout("loop_event();", 1000);
}
function next_block() {
	if ($('#next_block_btn').html() == "Next Block") {
		$('#next_block_btn').html("Loading...");
		
		$.get("/ajax/next_block.php?game_id="+games[0].game_id, function(result) {
			games[0].refresh_if_needed();
		});
	}
}
function notification_pref_changed() {
	var notification_pref = $('#notification_preference').val();
	if (notification_pref == "email") {
		$('#notification_email').show('fast');
		$('#notification_email').focus();
	}
	else {
		$('#notification_email').hide();
	}
}
function notification_focused() {
	if (!started_checking_notification_settings) {
		check_notification_settings();
		started_checking_notification_settings = true;
	}
}
function check_notification_settings() {
	if ($('#notification_preference').val() != initial_notification_pref || $('#notification_email').val() != initial_notification_email) {
		$('#notification_save_btn').show();
	}
	else {
		$('#notification_save_btn').hide();
	}
	setTimeout("check_notification_settings();", 800);
}
function save_notification_preferences() {
	if ($('#notification_save_btn').html() == "Save Notification Settings") {
		var notification_pref = $('#notification_preference').val();
		var notification_email = $('#notification_email').val();
		$('#notification_save_btn').html("Saving...");
		$.get("/ajax/set_notification_preference.php?game_id="+games[0].game_id+"&preference="+encodeURIComponent(notification_pref)+"&email="+encodeURIComponent(notification_email), function(result) {
			$('#notification_save_btn').html("Save Notification Settings");
			initial_notification_pref = notification_pref;
			initial_notification_email = notification_email;
			alert(result);
		});
	}
}
function alias_pref_changed() {
	var alias_pref = $('#alias_preference').val();
	if (alias_pref == "public") {
		$('#alias').show('fast');
		$('#alias').focus();
	}
	else {
		$('#alias').hide();
	}
}
function alias_focused() {
	if (!started_checking_alias_settings) {
		check_alias_settings();
		started_checking_alias_settings = true;
	}
}
function check_alias_settings() {
	if ($('#alias_preference').val() != initial_alias_pref || $('#alias').val() != initial_alias) {
		$('#alias_save_btn').show();
	}
	else {
		$('#alias_save_btn').hide();
	}
	setTimeout("check_alias_settings();", 800);
}
function save_alias_preferences() {
	if ($('#alias_save_btn').html() == "Save Privacy Settings") {
		var alias_pref = $('#alias_preference').val();
		var alias = $('#alias').val();
		$('#notification_save_btn').html("Saving...");
		$.get("/ajax/set_alias_preference.php?game_id="+games[0].game_id+"&preference="+encodeURIComponent(alias_pref)+"&alias="+encodeURIComponent(alias), function(result) {
			$('#notification_save_btn').html("Save Privacy Settings");
			initial_alias_pref = alias_pref;
			initial_alias = alias;
			alert(result);
		});
	}
}
function show_more_performance_history() {
	if (!performance_history_loading) {
		performance_history_loading = true;
		performance_history_start_round -= 10;
		$('#performance_history').append('<div id="performance_history_'+performance_history_sections+'"></div>');
		$('#performance_history_'+performance_history_sections).html("Loading...");
		
		$.get("/ajax/performance_history.php?game_id="+games[0].game_id+"&from_round_id="+performance_history_start_round+"&to_round_id="+(performance_history_start_round+9), function(result) {
			$('#performance_history_'+performance_history_sections).html(result);
			performance_history_sections++;
			performance_history_loading = false;
		});
	}
}
function attempt_withdrawal() {
	if ($('#withdraw_btn').html() == "Withdraw") {
		var amount = $('#withdraw_amount').val();
		var address = $('#withdraw_address').val();
		
		$('#withdraw_btn').html("Withdrawing...");
		
		$.get("/ajax/withdraw.php?game_id="+games[0].game_id+"&amount="+encodeURIComponent(amount)+"&address="+encodeURIComponent(address)+"&remainder_address_id="+$('#withdraw_remainder_address_id').val()+"&fee="+encodeURIComponent($('#withdraw_fee').val()), function(result) {
			var result_obj = JSON.parse(result);
			
			$('#withdraw_btn').html("Withdraw");
			$('#withdraw_amount').val("");
			
			$('#withdraw_message').removeClass("redtext");
			$('#withdraw_message').removeClass("greentext");
			
			$('#withdraw_message').show('fast');
			$('#withdraw_message').html(result_obj['message']);
			
			if (result_obj['status_code'] == 1) $('#withdraw_message').addClass("greentext");
			else $('#withdraw_message').addClass("redtext");
			
			setTimeout("$('#withdraw_message').slideUp('fast');", 5000);
			
			games[0].refresh_if_needed();
		});
	}
}
function input_amount_sums() {
	var amount_sum = 0;
	var vote_sum = 0;
	for (var i=0; i<vote_inputs.length; i++) {
		amount_sum += vote_inputs[i].amount;
		if (games[0].payout_weight == "coin_block") {
			vote_sum += (1 + games[0].last_block_id - vote_inputs[i].create_block_id)*vote_inputs[i].amount;
		}
		else if (games[0].payout_weight == "coin_round") {
			vote_sum += (games[0].block_to_round(1+games[0].last_block_id) - games[0].block_to_round(vote_inputs[i].create_block_id))*vote_inputs[i].amount;
		}
	}
	return [amount_sum, vote_sum];
}
function set_input_amount_sums() {
	var amount_sums = input_amount_sums();
	
	var input_disp = format_coins(amount_sums[0]/Math.pow(10,8));
	if (input_disp == '1') input_disp += ' '+games[0].coin_name;
	else input_disp += ' '+games[0].coin_name_plural;
	$('#input_amount_sum').html(input_disp);
	
	if (games[0].payout_weight != 'coin') {
		$('#input_vote_sum').html(format_coins(amount_sums[1]/Math.pow(10,8))+" votes");
	}
}
function render_selected_utxo(index_id) {
	if (games[0].logo_image_url != "") {
		return "";
	}
	else {
		var score_qty = 0;
		if (games[0].payout_weight == "coin") score_qty = Math.floor(vote_inputs[index_id].amount);
		else if (games[0].payout_weight == "coin_round") score_qty = (games[0].block_to_round(1+games[0].last_block_id) - games[0].block_to_round(vote_inputs[index_id].create_block_id))*vote_inputs[index_id].amount;
		else score_qty = (1 + games[0].last_block_id - vote_inputs[index_id].create_block_id)*vote_inputs[index_id].amount;
		var render_text = format_coins(score_qty/Math.pow(10,8))+' ';
		if (games[0].payout_weight == "coin") {
			if (render_text == '1') render_text += games[0].coin_name;
			else render_text += games[0].coin_name_plural;
		}
		else render_text += ' votes';
		return render_text;
	}
}
function render_option_output(index_id, name) {
	var html = "";
	html += name+'&nbsp;&nbsp; <div id="output_amount_disp_'+index_id+'" class="output_amount_disp"></div> <font class="output_removal_link" onclick="remove_option_from_vote('+index_id+');">&#215;</font>';
	html += '<div><div id="output_threshold_'+index_id+'" class="noUiSlider"></div></div>';
	return html;
}
function render_option_bet(bet_index, option_id) {
	var html = games[0].options[option_id].name+'&nbsp;&nbsp; <div id="option_bet_amount_disp_'+bet_index+'" class="option_bet_amount_disp"></div> <font class="option_bet_removal_link" onclick="remove_option_bet('+bet_index+');">&#215;</font>';
	html += '<div><div id="option_bet_threshold_'+bet_index+'" class="noUiSlider"></div></div>';
	return html;
}
function add_utxo_to_vote(io_id, amount, create_block_id) {
	var index_id = vote_inputs.length;

	var already_in = false;
	for (var i=0; i<vote_inputs.length; i++) {
		if (vote_inputs[i].io_id == io_id) already_in = true;
	}
	if (!already_in) {
		var focus_select_output = false;
		if (index_id == 0) focus_select_output = true;
		vote_inputs.push(new vote_input(index_id, io_id, amount, create_block_id));
		$('#select_utxo_'+io_id).hide();
		var select_btn_html = '<div id="selected_utxo_'+index_id+'" onclick="remove_utxo_from_vote('+index_id+');" class="select_utxo';
		if (games[0].logo_image_url != "") select_btn_html += ' select_utxo_image';
		select_btn_html += ' btn btn-default">'+render_selected_utxo(index_id)+'</div>';
		$('#compose_vote_inputs').append(select_btn_html);
		
		if (games[0].logo_image_url != "") {
			var effectiveness_factor = games[0].block_id_to_effectiveness_factor(games[0].last_block_id+1);
			var votes = games[0].votes_from_io(amount, create_block_id);
			var height = Math.round(games[0].utxo_max_height*votes*Math.sqrt(effectiveness_factor)/games[0].utxo_max_effective_votes);
			$('#selected_utxo_'+index_id).css("height", height+"px");
			$('#selected_utxo_'+index_id).css("width", height+"px");
			$('#selected_utxo_'+index_id).css("background-image", "url('"+games[0].logo_image_url+"')");
		}
		io_id2input_index[io_id] = index_id;
		refresh_compose_vote();
		set_input_amount_sums();
		refresh_output_amounts();
		if (focus_select_output) setTimeout("$('#select_add_output').focus();", 600);
	}
}
function load_option_slider(index_id) {
	$('#output_threshold_'+index_id).noUiSlider({
		range: [0, 100]
	   ,start: 50, step: 1
	   ,handles: 1
	   ,connect: "lower"
	   ,serialization: {
			 to: [ false, false ]
			,resolution: 1
		}
	   ,slide: function(){
			vote_options[index_id].slider_val = parseInt($('#output_threshold_'+index_id).val());
			output_amounts_need_update = true;
	   }
	});
}
function load_option_bet_slider(bet_index) {
	$('#option_bet_threshold_'+bet_index).noUiSlider({
		range: [0, 100]
	   ,start: 50, step: 1
	   ,handles: 1
	   ,connect: "lower"
	   ,serialization: {
			 to: [ false, false ]
			,resolution: 1
		}
	   ,slide: function(){
			option_bets[bet_index].slider_val = parseInt($('#option_bet_threshold_'+bet_index).val());
			option_bet_amounts_need_update = true;
	   }
	});
}
function remove_utxo_from_vote(index_id) {
	var effectiveness_factor = games[0].block_id_to_effectiveness_factor(games[0].last_block_id+1);
	$('#select_utxo_'+vote_inputs[index_id].io_id).show('fast');
	io_id2input_index[vote_inputs[index_id].io_id] = false;
	
	for (var i=index_id; i<vote_inputs.length-1; i++) {
		vote_inputs[i] = vote_inputs[i+1];

		io_id2input_index[vote_inputs[i].io_id] = i;
		
		$('#selected_utxo_'+i).html(render_selected_utxo(i));
	}
	$('#selected_utxo_'+(vote_inputs.length-1)).remove();
	vote_inputs.length = vote_inputs.length-1;
	set_input_amount_sums();
	refresh_compose_vote();
	refresh_output_amounts();
}
function remove_option_from_vote(index_id) {
	for (var i=index_id+1; i<vote_options.length; i++) {
		$('#compose_vote_output_'+(i-1)).html(render_option_output(i-1, vote_options[i].name));
		$('#compose_vote_output_'+i).html('');
		vote_options[i-1] = vote_options[i];
		load_option_slider(i-1);
		$('#output_threshold_'+(i-1)).val(vote_options[i-1].slider_val);
	}
	$('#compose_vote_output_'+(vote_options.length-1)).remove();
	vote_options.length = vote_options.length-1;
	
	refresh_output_amounts();
}
function refresh_compose_vote() {
	if (vote_inputs.length > 0 || vote_options.length > 0) $('#compose_vote').show('fast');
	else $('#compose_vote').hide('fast');
}
function refresh_all_inputs() {
	var my_effective_votes=0;
	var utxo_max_effective_votes=0;
	var effectiveness_factor = games[0].block_id_to_effectiveness_factor(games[0].last_block_id+1);

	for (var i=0; i<mature_ios.length; i++) {
		var votes = games[0].votes_from_io(mature_ios[i].amount, mature_ios[i].create_block_id);
		if (votes > utxo_max_effective_votes) {
			utxo_max_effective_votes = votes;
		}
		my_effective_votes += votes;
	}

	for (var i=0; i<vote_inputs.length; i++) {
		var votes = games[0].votes_from_io(vote_inputs[i].amount, vote_inputs[i].create_block_id);
		var height = Math.round(Math.sqrt(effectiveness_factor)*games[0].utxo_max_height*votes/games[0].utxo_max_effective_votes);
		$('#selected_utxo_'+i).css("height", height+"px");
		$('#selected_utxo_'+i).css("width", height+"px");
	}
	games[0].my_effective_votes = my_effective_votes;
	games[0].utxo_max_effective_votes = utxo_max_effective_votes;
	refresh_mature_io_btns();
}
function finish_refresh_output_amounts() {
	if (vote_options.length > 0) {
		var input_sums = input_amount_sums();
		var coin_sum = input_sums[0]-games[0].fee_amount;
		var sum_votes = input_sums[1];
		
		var slider_sum = 0;
		for (var i=0; i<vote_options.length; i++) {
			slider_sum += vote_options[i].slider_val;
		}
		var coins_per_slider_val;
		if (slider_sum > 0) coins_per_slider_val = Math.floor(coin_sum/slider_sum);
		else coins_per_slider_val = 0;
		
		var output_coins_sum = 0;
		for (var i=0; i<vote_options.length; i++) {
			var output_coins = Math.floor(coins_per_slider_val*vote_options[i].slider_val);
			var output_score;
			if (coin_sum > 0) output_score = output_coins*(sum_votes/coin_sum);
			else output_score = 0;
			
			if (i == vote_options.length - 1) output_coins = coin_sum - output_coins_sum;
			
			var output_val = 0;
			if (games[0].payout_weight == "coin") output_val = output_coins;
			else output_val = output_score;
			
			var output_val_disp = format_coins(output_val/Math.pow(10,8));
			if (games[0].payout_weight == "coin") {
				if (output_val_disp == '1') output_val_disp += " "+games[0].coin_name;
				else output_val_disp += " "+games[0].coin_name_plural;
			}
			else output_val_disp += " votes";
			
			$('#output_amount_disp_'+i).html(output_val_disp);
			
			vote_options[i].amount = output_coins;
			output_coins_sum += output_coins;
		}
	}
}
function refresh_output_amounts() {
	refresh_all_inputs();
	finish_refresh_output_amounts();
}
function select_add_output_changed() {
	var option_id = $('#select_add_output').val();
	
	if (option_id != "") {
		var option_name = $('#select_add_output option:selected').text();
		games[0].add_option_to_vote(option_id, option_name);
		$('#select_add_output').val("");
	}
}
function show_intro_message() {
	$('#intro_message').modal('show');
}
function show_planned_votes() {
	$('#planned_votes').modal('show');
}

// OBJECT: GameForm
var game_form_vars = "blockchain_id,event_rule,option_group_id,event_entity_type_id,events_per_round,event_type_name,maturity,name,payout_weight,round_length,pos_reward,pow_reward,inflation,exponential_inflation_rate,exponential_inflation_minershare,final_round,coin_name,coin_name_plural,coin_abbreviation,start_condition,buyin_policy,game_buyin_cap,default_vote_effectiveness_function,default_max_voting_fraction,game_starting_block,escrow_address,genesis_tx_hash,genesis_amount".split(",");
function switch_to_game(game_id, action) {
	var fetch_link_text = $('#fetch_game_link_'+game_id).html();
	var switch_link_text = $('#switch_game_btn').html();
	
	if (action == "fetch") $('#fetch_game_link_'+game_id).html("Loading...");
	if (action == "switch") $('#switch_game_btn').html("Switching...");
	
	$.get("/ajax/switch_to_game.php?game_id="+game_id+"&action="+action, function(result) {
		var json_result = JSON.parse(result);
		
		if (action == "fetch" || action == "new") {
			if (action == "new") {
				editing_game_id = json_result['game_id'];
			}
			else {
				editing_game_id = game_id;
				$('#fetch_game_link_'+game_id).html(fetch_link_text);
			}
			
			$('#game_form_has_final_round').prop('disabled', true);
			if (json_result['game_status'] == "editable") $('#game_form_has_final_round').prop('disabled', false);

			if (json_result['my_game'] == true && json_result['game_status'] == "editable") {
				$('#save_game_btn').show();
				$('#publish_game_btn').show();
			}
			else {
				$('#save_game_btn').hide();
				$('#publish_game_btn').hide();
			}
			
			if (json_result['giveaway_status'] == "invite_free" || json_result['giveaway_status'] == "invite_pay") {
				if (json_result['my_game'] == true) {
					$('#game_invitations_game_btn').show();
				}
				else $('#game_invitations_game_btn').hide();
			}
			else if (json_result['giveaway_status'] == "public_pay" || json_result['giveaway_status'] == "public_free") $('#game_invitations_game_btn').show();
			else $('#game_invitations_game_btn').hide();
			
			$('#game_form').modal('show');
			$('#game_form_name_disp').html("Settings: "+json_result['name_disp']);
			
			for (var i=0; i<game_form_vars.length; i++) {
				if (game_form_vars[i] == "pos_reward" || game_form_vars[i] == "pow_reward" || game_form_vars[i] == "giveaway_amount" || game_form_vars[i] == "genesis_amount") {
					json_result[game_form_vars[i]] = parseInt(json_result[game_form_vars[i]])/Math.pow(10,8);
				}
				else if (game_form_vars[i] == "exponential_inflation_minershare" || game_form_vars[i] == "exponential_inflation_rate" || game_form_vars[i] == "default_max_voting_fraction") {
					json_result[game_form_vars[i]] = Math.round(json_result[game_form_vars[i]]*100*Math.pow(10,8))/Math.pow(10,8);
				}
				else if (game_form_vars[i] == "per_user_buyin_cap" || game_form_vars[i] == "game_buyin_cap") {
					if (json_result[game_form_vars[i]].indexOf('.') != -1) {
						json_result[game_form_vars[i]] = rtrim(json_result[game_form_vars[i]], '0');
					}
					json_result[game_form_vars[i]] = rtrim(json_result[game_form_vars[i]], '.');
				}
				
				$('#game_form_'+game_form_vars[i]).val(json_result[game_form_vars[i]]);
				
				if (json_result['my_game'] && json_result['game_status'] == "editable") $('#game_form_'+game_form_vars[i]).prop('disabled', false);
				else $('#game_form_'+game_form_vars[i]).prop('disabled', true);
			}
			
			if (json_result['my_game'] && json_result['game_status'] == "editable") $('#game_form_has_final_round').prop('disabled', false);
			else $('#game_form_has_final_round').prop('disabled', true);
			
			$('#game_form_game_status').html(json_result['game_status']);

			json_result['start_date']
			if (json_result['inflation'] == "exponential") {
				$('#game_form_inflation_exponential').show();
				$('#game_form_inflation_linear').hide();
			}
			else {
				$('#game_form_inflation_exponential').hide();
				$('#game_form_inflation_linear').show();
			}
			
			if (json_result['buyin_policy'] == "game_cap") {
				$('#game_form_game_buyin_cap_disp').show();
			}
			else $('#game_form_game_buyin_cap_disp').hide();
			
			if (json_result['final_round'] > 0) {
				$('#game_form_final_round_disp').show();
				$('#game_form_has_final_round').val(1);
			}
			else {
				$('#game_form_final_round_disp').hide();
				$('#game_form_has_final_round').val(0);
			}

			if (json_result['giveaway_status'] == "invite_pay" || json_result['giveaway_status'] == "public_pay") {
				$('#game_form_giveaway_status_pay').show();
			}
			else {
				$('#game_form_giveaway_status_pay').hide();
			}

			game_form_start_condition_changed();
			game_form_event_rule_changed();
		}
		else if (action == "switch" || action == "delete" || action == "reset") {
			if (action == "switch") $('#switch_game_btn').html(switch_link_text);
			
			if (json_result['status_code'] == 1) {
				window.location = json_result['redirect_url'];
			}
			else alert(json_result['message']);
		}
	});
}
function game_form_final_round_changed() {
	var final_round = parseInt($('#game_form_has_final_round').val());
	if (final_round == 1) {
		$('#game_form_final_round_disp').slideDown('fast');
		$('#game_form_final_round').focus();
	}
	else {
		$('#game_form_final_round_disp').slideUp('fast');
		$('#game_form_final_round').val(0);
	}
}
function game_form_inflation_changed() {
	var inflation_val = $('#game_form_inflation').val();
	if (inflation_val == "exponential") {
		$('#game_form_inflation_exponential').slideDown('fast');
		$('#game_form_inflation_linear').hide();
	}
	else {
		$('#game_form_inflation_exponential').hide();
		$('#game_form_inflation_linear').slideDown('fast');
	}
}
function game_form_giveaway_status_changed() {
	var giveaway_status = $('#game_form_giveaway_status').val();
	if (giveaway_status == "invite_pay" || giveaway_status == "public_pay") {
		$('#game_form_giveaway_status_pay').slideDown('fast');
	}
	else {
		$('#game_form_giveaway_status_pay').hide();
	}
}
function game_form_start_condition_changed() {
	var start_condition = $('#game_form_start_condition').val();

	$('#game_form_start_condition_fixed_time').hide();
	$('#game_form_start_condition_players_joined').hide();

	$('#game_form_start_condition_'+start_condition).show();
}
function game_form_buyin_policy_changed() {
	var buyin_policy = $('#game_form_buyin_policy').val();
	
	if (buyin_policy == "per_user_cap" || buyin_policy == "game_and_user_cap") {
		$('#game_form_per_user_buyin_cap_disp').show();
	}
	else $('#game_form_per_user_buyin_cap_disp').hide();
	
	if (buyin_policy == "game_cap" || buyin_policy == "game_and_user_cap") {
		$('#game_form_game_buyin_cap_disp').show();
	}
	else $('#game_form_game_buyin_cap_disp').hide();
}
function game_form_event_rule_changed() {
	var event_rule = $('#game_form_event_rule').val();
	if (event_rule == "entity_type_option_group") $('#game_form_event_rule_entity_type_option_group').show();
	else $('#game_form_event_rule_entity_type_option_group').hide();
}
function save_game(action) {
	var save_link_text = $('#save_game_btn').html();
	var save_url = "/ajax/save_game.php?game_id="+editing_game_id+'&action='+action;
	
	for (var i=0; i<game_form_vars.length; i++) {
		save_url += "&"+game_form_vars[i]+"="+encodeURIComponent($('#game_form_'+game_form_vars[i]).val());
	}
	
	$('#save_game_btn').html("Loading...");
	
	$.get(save_url, function(result) {
		$('#save_game_btn').html(save_link_text);
		var json_result = JSON.parse(result);
		if (parseInt(json_result['status_code']) == 1) {
			if (json_result['redirect_user'] == 1) {
				window.location = '/wallet/'+json_result['url_identifier']+'/';
			}
			else window.location = window.location;
		}
		else alert(json_result['message']);
	});
}
function refresh_mature_io_btns() {
	var effectiveness_factor = games[0].block_id_to_effectiveness_factor(games[0].last_block_id+1);
	for (var i=0; i<mature_ios.length; i++) {
		var select_btn_text = "";
		var votes = games[0].votes_from_io(mature_ios[i].amount, mature_ios[i].create_block_id);

		if (games[0].logo_image_url == "") {
			select_btn_text += 'Add '+format_coins(votes/Math.pow(10,8));
			select_btn_text += ' votes';
			if (games[0].payout_weight != 'coin') {
				var coin_disp = format_coins(mature_ios[i].amount/Math.pow(10,8));
				select_btn_text += "<br/>("+coin_disp+" ";
				if (coin_disp == '1') select_btn_text += games[0].coin_name;
				else select_btn_text += games[0].coin_name_plural;
				select_btn_text += ")";
			}
		}
		else {
			var height = Math.round(Math.sqrt(effectiveness_factor)*games[0].utxo_max_height*votes/games[0].utxo_max_effective_votes);
			$('#select_utxo_'+mature_ios[i].io_id).css("height", height+"px");
			$('#select_utxo_'+mature_ios[i].io_id).css("width", height+"px");
			$('#select_utxo_'+mature_ios[i].io_id).css("background-image", "url('"+games[0].logo_image_url+"')");
		}
		$('#select_utxo_'+mature_ios[i].io_id).html(select_btn_text);
	}
	for (var i=0; i<vote_inputs.length; i++) {
		$('#selected_utxo_'+i).html(render_selected_utxo(i));
	}
	console.log("Done with refresh_mature_io_btns()");
}
function compose_vote_loop() {
	if (output_amounts_need_update) refresh_output_amounts();
	output_amounts_need_update = false;
	setTimeout("compose_vote_loop();", 400);
}
function confirm_compose_vote() {
	if (vote_inputs.length > 0) {
		if (vote_options.length > 0) {
			if ((games[0].last_block_id+1)%games[0].game_round_length != 0) {
				$('#confirm_compose_vote_btn').html("Loading...");
				
				var place_vote_url = "/ajax/place_vote.php?game_id="+games[0].game_id+"&io_ids=";
				for (var i=0; i<vote_inputs.length; i++) {
					place_vote_url += vote_inputs[i].io_id;
					if (i != vote_inputs.length-1) place_vote_url += ",";
				}
				
				place_vote_url += "&option_ids=";
				var amounts_url = "&amounts=";
				
				for (var i=0; i<vote_options.length; i++) {
					place_vote_url += vote_options[i].option_id;
					if (i != vote_options.length-1) place_vote_url += ",";
					
					amounts_url += vote_options[i].amount;
					if (i != vote_options.length-1) amounts_url += ",";
				}
				place_vote_url += amounts_url;
				
				$.get(place_vote_url, function(result) {
					$('#confirm_compose_vote_btn').html("Submit Voting Transaction");
					
					var result_obj = JSON.parse(result);
					
					if (result_obj['status_code'] == 0) {
						//games[0].refresh_if_needed();
						$('#compose_vote_success').html(result_obj['message']);
						$('#compose_vote_success').slideDown('slow');
						setTimeout("$('#compose_vote_success').slideUp('fast');", 4500);
						
						for (var i=0; i<vote_options.length; i++) {
							$('#compose_vote_output_'+i).remove();
						}
						vote_options.length = 0;
						
						var num_inputs = vote_inputs.length;
						for (var i=0; i<num_inputs; i++) {
							remove_utxo_from_vote(0);
						}
					}
					else {
						$('#compose_vote_errors').html(result_obj['message']);
						$('#compose_vote_errors').slideDown('slow');
						setTimeout("$('#compose_vote_errors').slideUp('fast');", 2500);
					}
				});
			}
			else {
				alert("It's the final block of the round; you can't vote right now.");
			}
		}
		else {
			alert("First, please add the candidates that you wish to vote for.");
		}
	}
	else {
		alert("First, please add coin inputs to your voting transaction.");
	}
}
function reload_compose_vote() {
	for (var i=0; i<vote_inputs.length; i++) {
		$('#selected_utxo_'+i).remove();
	}
	vote_inputs.length = 0;
	
	$('#select_input_buttons').find('.select_utxo').each(function() {
		$(this).hide();
	});
	
	if (games[0].mature_io_ids_csv == "") {
		$('#select_input_buttons_msg').html("");
	}
	else {
		$('#select_input_buttons_msg').html("");
	}
	refresh_visible_inputs();
}
function refresh_visible_inputs() {
	var show_count = 0;
	var mature_io_ids = games[0].mature_io_ids_csv.split(",");
	for (var i=0; i<mature_io_ids.length; i++) {
		if (typeof io_id2input_index[mature_io_ids[i]] == 'undefined' || io_id2input_index[mature_io_ids[i]] === false) {
			$('#select_utxo_'+mature_io_ids[i]).show();
			show_count++;
		}
		else {
			add_utxo_to_vote(mature_io_ids[i], mature_ios[i].amount, mature_ios[i].create_block_id);
		}
	}
}
function show_more_rounds_complete() {
	if ($('#show_more_link').html() == "Show More") {
		$('#show_more_link').html("Loading...");
		$.get("/ajax/show_rounds_complete.php?game_id="+games[0].game_id+"&from_round_id="+(last_round_shown-1), function(result) {
			$('#show_more_link').html("Show More");
			var json_result = JSON.parse(result);
			if (parseInt(json_result[0]) > 0) last_round_shown = parseInt(json_result[0]);
			$('#rounds_complete').append('<div id="rounds_complete_'+round_sections_shown+'">'+json_result[1]+'</div>');
			round_sections_shown++;
		});
	}
}
function render_tx_fee() {
	$('#display_tx_fee').html("TX fee: "+format_coins(games[0].fee_amount/Math.pow(10,8))+" coins");
}
function manage_game_invitations(this_game_id) {
	$.get("/ajax/game_invitations.php?action=manage&game_id="+this_game_id, function(result) {
		$('#game_invitations_inner').html(result);
		$('#game_invitations').modal('show');
	});
}
function generate_invitation(this_game_id) {
	$.get("/ajax/game_invitations.php?action=generate&game_id="+this_game_id, function(result) {
		manage_game_invitations(this_game_id);
	});
}
function send_invitation(this_game_id, invitation_id, send_method) {
	var send_to = "";
	if (send_method == 'email') {
		send_to = prompt("Please enter the email address where you'd like to send this invitation.");
	}
	else send_to = prompt("Please enter the username of the account where the invitation should be sent.");
	
	if (send_to) {
		$.get("/ajax/game_invitations.php?action=send&send_method="+send_method+"&game_id="+this_game_id+"&invitation_id="+invitation_id+"&send_to="+encodeURIComponent(send_to), function(result) {
			var json_result = JSON.parse(result);
			if (json_result['status_code'] == 1) manage_game_invitations(this_game_id);
			else alert(json_result['message']);
		});
	}
}
var plan_round = function(round_id) {
	this.round_id = round_id;
	this.event_ids = new Array();
	this.sum_points = 0;
}
function set_plan_round_sums() {
	for (var i=0; i<plan_rounds.length; i++) {
		set_plan_round_sum(i);
	}
}
function set_plan_round_sum(round_index) {
	var round_points = 0;
	for (var e=0; e<plan_rounds[round_index].event_ids.length; e++) {
		var all_events_index = games[0].all_events_db_id_to_index[plan_rounds[round_index].event_ids[e]];
		for (var o=0; o<games[0].all_events[all_events_index].options.length; o++) {
			round_points += games[0].all_events[all_events_index].options[o].points;
		}
	}
	plan_rounds[round_index].sum_points = round_points;
}
function render_plan_option(round_index, event_index, option_index, event_id, option_id) {
	var pct_points = 0;
	var round_id = plan_rounds[round_index].round_id;
	var row_sum = plan_rounds[round_index].sum_points;
	var this_option = games[0].all_events[event_index].options[option_index];
	if (row_sum > 0) pct_points = Math.round(100*this_option.points/row_sum);
	$('#plan_option_'+round_id+'_'+event_id+'_'+option_id).css("background-color", "rgba(0,0,255,"+(pct_points/100)+")");
	if (pct_points >= 50) $('#plan_option_'+round_id+'_'+event_id+'_'+option_id).css("color", "#fff");
	else $('#plan_option_'+round_id+'_'+event_id+'_'+option_id).css("color", "#000");
	$('#plan_option_amount_'+round_id+'_'+event_id+'_'+option_id).html(this_option.points+" ("+pct_points+"%)");
	$('#plan_option_input_'+round_id+'_'+event_id+'_'+option_id).val(this_option.points);
}
function plan_option_clicked(round_id, event_id, option_id) {
	var event = games[0].all_events[games[0].all_events_db_id_to_index[event_id]];
	var option_index = event.option_id2option_index[option_id];
	var new_points = (event.options[option_index].points+plan_option_increment)%(plan_option_max_points+1);
	event.options[option_index].points = new_points;
	
	var round_index = round_id2plan_round_id[round_id];
	set_plan_round_sums();
	render_plan_round(round_index);
}
function render_plan_round(round_index) {
	for (var i=0; i<plan_rounds[round_index].event_ids.length; i++) {
		var event_index = games[0].all_events_db_id_to_index[plan_rounds[round_index].event_ids[i]];
		var temp_event = games[0].all_events[event_index];
		for (var option_i=0; option_i<temp_event.options.length; option_i++) {
			render_plan_option(round_index, event_index, option_i, temp_event.event_id, temp_event.options[option_i].option_id);
		}
	}
}
// Right click sets a planned vote to 0
function set_plan_rightclicks() {
	$('.plan_option').contextmenu(function() {
		var id_parts = $(this).attr("id").split('_');
		var round_id = parseInt(id_parts[2]);
		var event_id = parseInt(id_parts[3]);
		var option_id = parseInt(id_parts[4]);
		
		var event_index = games[0].all_events_db_id_to_index[event_id];
		var option_index = games[0].all_events[event_index].option_id2option_index[option_id];
		var round_index = round_id2plan_round_id[round_id];
		
		games[0].all_events[event_index].options[option_index].points = 0;
		set_plan_round_sum(round_index);
		render_plan_round(round_index);
		
		return false;
	});
}
function save_plan_allocations() {
	var postvars = {game_id: games[0].game_id, action: "save", voting_strategy_id: parseInt($('#voting_strategy_id').val()), from_round: parseInt($('#from_round').val()), to_round: parseInt($('#to_round').val())};
	
	for (var i=0; i<games[0].all_events.length; i++) {
		for (var o=0; o<games[0].all_events[i].options.length; o++) {
			var points = games[0].all_events[i].options[o].points;
			if (points > 0) {
				postvars['poi_'+games[0].all_events[i].options[o].option_id] = points;
			}
		}
	}
	
	$('#save_plan_btn').html("Saving...");
	$.ajax({
		type: "POST",
		url: "/ajax/planned_allocations.php",
		data: postvars,
		success: function(result) {
			$('#save_plan_btn').html("Save");
			$("input[name=voting_strategy][value='by_plan']").prop("checked",true);
		}
	});
}
function load_plan_rounds() {
	save_plan_allocations();
	refresh_plan_allocations();
}
function refresh_plan_allocations() {
	var from_round = parseInt($('#select_from_round').val());
	var to_round = parseInt($('#select_to_round').val());
	$.get("/ajax/planned_allocations.php?game_id="+games[0].game_id+"&action=fetch&voting_strategy_id="+$('#voting_strategy_id').val()+"&from_round="+from_round+"&to_round="+to_round, function(result) {
		$('#from_round').val(from_round);
		$('#to_round').val(to_round);
		var json_obj = JSON.parse(result);
		$('#plan_rows').html(json_obj['html']);
		set_plan_round_sums();
		render_plan_rounds();
	});
}
function render_plan_rounds() {
	for (var i=0; i<plan_rounds.length; i++) {
		render_plan_round(i);
	}
}
function initiate_buyin() {
	$.get("/ajax/buyin.php?game_id="+games[0].game_id, function(result) {
		$('#buyin_modal_content').html(result);
		$('#buyin_modal').modal('show');
		setTimeout("$('#buyin_amount').focus();", 1000);
	});
}
function scramble_strategy(strategy_id) {
	var btn_default_text = $('#scramble_plan_btn').html();
	var btn_loading_text = "Randomizing...";
	if ($('#scramble_plan_btn').html() != btn_loading_text) {
		var user_confirmed = confirm('All of your votes in rounds '+$('#select_from_round').val()+' to '+$('#select_to_round').val()+' will be overwritten. Are you sure you want to randomize your votes?');
		if (user_confirmed) {
			$('#scramble_plan_btn').html(btn_loading_text);
			$.get("/ajax/planned_allocations.php?game_id="+games[0].game_id+"&voting_strategy_id="+strategy_id+"&action=scramble&from_round="+$('#select_from_round').val()+"&to_round="+$('#select_to_round').val(), function(result) {
				$('#scramble_plan_btn').html(btn_default_text);
				refresh_plan_allocations();
			});
		}
	}
}

var editing_game_id = false;
var vote_inputs = new Array();
var vote_options = new Array();
var output_amounts_need_update = false;
var option_bet_amounts_need_update = false;
var io_id2input_index = {};
var mature_ios = new Array();

// OBJECT: Event
var Event = function(game, game_event_index, event_id, num_voting_options, vote_effectiveness_function) {
	this.game = game;
	this.game_event_index = game_event_index;
	this.event_id = event_id;
	
	this.num_voting_options = num_voting_options;
	this.vote_effectiveness_function = vote_effectiveness_function;
	
	this.refresh_in_progress = false;
	this.last_refresh_time = 0;
	this.event_loop_index = 1;
	this.last_event_loop_index_applied = -1;
	this.selected_option_id = false;
	this.votingaddr_count = 0;
	this.deleted = false;
	this.details_shown = true;

	this.options = new Array();
	this.option_id2option_index = {};
	
	this.option_bets = new Array();
	this.bet_sum = 0;
	
	this.start_vote = function(option_id) {
		$('#game'+this.game.instance_id+'_event'+this.game_event_index+'_vote_confirm_'+option_id).modal('toggle');
		$('#game'+this.game.instance_id+'_event'+this.game_event_index+'_vote_amount_'+option_id).focus();
		
		//var _this = this;
		//setTimeout(function() {$('#game'+_this.game.instance_id+"_event"+_this.game_event_index+"_vote_amount_"+option_id).focus()}, 500);
		
		// Reselect the option button which has been inadvertently unselected by the modal
		//setTimeout(function() {_this.option_selected($('#game'+_this.game.instance_id+'_event'+_this.game_event_index+'_option_id2rank_'+option_id).val())}, 100);
	};
	this.db_id2option_index = function(db_option_id) {
		for (var i=0; i<this.options.length; i++) {
			if (this.options[i].option_id == db_option_id) return i;
		}
		return false;
	};
	this.toggle_details = function() {
		if (this.details_shown) {
			$('#game'+this.game.instance_id+'_event'+this.game_event_index+'_details').hide();
			this.details_shown = false;
		}
		else {
			$('#game'+this.game.instance_id+'_event'+this.game_event_index+'_details').show();
			this.details_shown = true;
		}
	};
	this.refresh_if_needed = function() {
		if (!this.refresh_in_progress) {
			this.last_refresh_time = new Date().getTime();
			this.refresh_in_progress = true;
			
			var check_activity_url = "/ajax/check_new_activity.php?instance_id="+this.game.instance_id+"&game_event_index="+this.game_event_index+"&game_id="+this.game.game_id+"&event_id="+this.event_id+"&event_ids="+this.game.event_ids+"&refresh_page="+this.game.refresh_page+"&last_block_id="+this.game.last_block_id+"&last_transaction_id="+this.game.last_transaction_id+"&my_last_transaction_id="+this.game.my_last_transaction_id+"&mature_io_ids_csv="+this.game.mature_io_ids_csv+"&event_loop_index="+this.event_loop_index+"&min_bet_round="+this.game.min_bet_round+"&votingaddr_count="+this.votingaddr_count;
			if (this.game.refresh_page == "wallet") check_activity_url += "&performance_history_sections="+this.game.performance_history_sections;
			
			var _this = this;
			$.ajax({
				url: check_activity_url,
				success: function(result) {
					if (_this.deleted == false) {
						if (_this.game.refresh_page == "wallet" && result == "0") {
							window.location = '/wallet/'+_this.game.game_url_identifier+'/?do=logout';
						}
						else {
							_this.refresh_in_progress = false;
							var json_result = $.parseJSON(result);
							
							if (json_result['event_loop_index'] > _this.last_event_loop_index_applied) {
								if (json_result['new_block'] == "1") {
									_this.game.last_block_id = parseInt(json_result['last_block_id']);
									
									if (_this.game.refresh_page == "wallet") {
										if ((_this.game.last_block_id+1)%_this.game.game_round_length == 0) {
											$('#'+_this.game.instance_id+'_event'+_this.game_event_index+'_vote_popups').slideUp('medium');
											$('#'+_this.game.instance_id+'_event'+_this.game_event_index+'_vote_popups_disabled').show();
										}
										else {
											$('#'+_this.game.instance_id+'_event'+_this.game_event_index+'_vote_popups').show('fast');
											$('#'+_this.game.instance_id+'_event'+_this.game_event_index+'_vote_popups_disabled').hide('fast');
										}
										
										if (parseInt(json_result['new_performance_history']) == 1) {
											for (var i=1; i<_this.game.performance_history_sections; i++) {
												$('#game'+_this.game.instance_id+'_performance_history_'+i).html("");
											}
											$('#game'+_this.game.instance_id+'_performance_history_0').html(json_result['performance_history']);
											$('#game'+_this.game.instance_id+'_performance_history_0').hide();
											$('#game'+_this.game.instance_id+'_performance_history_0').fadeIn('fast');
											
											_this.game.performance_history_start_round = json_result['performance_history_start_round'];
											
											tab_clicked(3);
										}
										
										/*if (parseInt(json_result['min_bet_round']) != _this.min_bet_round) {
											_this.min_bet_round = parseInt(json_result['min_bet_round']);
											var selected_bet_round = $('#game'+_this.instance_id+'_bet_round').val();
											$('#game'+_this.instance_id+'_select_bet_round').html(json_result['select_bet_round']);	
											$('#game'+_this.instance_id+'_bet_round').val(selected_bet_round);
										}*/
									}
								}
								if (_this.game.refresh_page == "wallet") {
									$('#game_status_explanation').html(json_result['game_status_explanation']);
									if (json_result['game_status_explanation'] == '') $('#game_status_explanation').hide();
									else $('#game_status_explanation').show();
									
									if (parseInt(json_result['new_event_ids']) == 1) {
										$('#game'+_this.game.instance_id+'_new_event_js').append('<script type="text/javascript">'+json_result['new_event_js']+'</script>');
										_this.game.event_ids = json_result['event_ids'];
										set_select_add_output();
									}
									
									if (parseInt(json_result['new_my_transaction']) == 1) {
										$('#my_bets').html(json_result['my_bets']);
										_this.game.my_last_transaction_id = parseInt(json_result['my_last_transaction_id']);
									}
									
									if (parseInt(json_result['new_mature_ios']) == 1 || parseInt(json_result['new_my_transaction']) == 1 || json_result['new_block'] == 1) {
										if (typeof json_result['mature_io_ids_csv'] == "undefined") _this.game.mature_io_ids_csv = "";
										else _this.game.mature_io_ids_csv = json_result['mature_io_ids_csv'];
										$('#select_input_buttons').html(json_result['select_input_buttons']);
										console.log("refreshing transaction inputs: "+_this.game.mature_io_ids_csv);
										reload_compose_vote();
									}
									
									set_input_amount_sums();
									refresh_mature_io_btns();
									
									/*if (parseInt(json_result['new_votingaddresses']) == 1) {
										_this.option_has_votingaddr = json_result['option_has_votingaddr'];
										_this.votingaddr_count = parseInt(json_result['votingaddr_count']);
									}*/
									
									if (parseInt(json_result['new_messages']) == 1) {
										var new_message_user_ids = json_result['new_message_user_ids'].split(",");
										for (var i=0; i<new_message_user_ids.length; i++) {
											openChatWindow(new_message_user_ids[i]);
										}
									}
								}
								if (parseInt(json_result['new_transaction']) == 1) {
									_this.game.last_transaction_id = parseInt(json_result['last_transaction_id']);
								}
								if (typeof json_result['current_round_table'] != "undefined") {
									$('#game'+_this.game.instance_id+'_event'+_this.game_event_index+'_current_round_table').html(json_result['current_round_table']);
								}
								if (parseInt(json_result['new_block']) == 1 || parseInt(json_result['new_transaction']) == 1) {
									$('#account_value').html(json_result['account_value']);
									$('#account_value').hide();
									$('#account_value').fadeIn('medium');
									
									if (_this.game.refresh_page == "wallet") var lockedfunds_details_shown = $('#lockedfunds_details').is(":visible");
									$('#wallet_text_stats').html(json_result['wallet_text_stats']);
									if (_this.game.refresh_page == "wallet" && lockedfunds_details_shown) $('#lockedfunds_details').show();
									
									$('#game'+_this.game.instance_id+'_event'+_this.game_event_index+'_current_round_table').hide();
									$('#game'+_this.game.instance_id+'_event'+_this.game_event_index+'_current_round_table').show();
									
									if (_this.details_shown) {
										$('#game'+_this.game.instance_id+'_event'+_this.game_event_index+'_details').show();
									}
									else {
										$('#game'+_this.game.instance_id+'_event'+_this.game_event_index+'_details').hide();
									}
									
									$('#wallet_text_stats').hide();
									$('#wallet_text_stats').fadeIn('fast');
									
									var vote_option_details = json_result['vote_option_details'];
									
									if (typeof json_result['my_current_votes'] != "undefined") {
										$('#game'+_this.game.instance_id+'_event'+_this.game_event_index+'_my_current_votes').html(json_result['my_current_votes']);
										$('#game'+_this.game.instance_id+'_event'+_this.game_event_index+'_my_current_votes').hide();
										$('#game'+_this.game.instance_id+'_event'+_this.game_event_index+'_my_current_votes').fadeIn('fast');
									}
									
									for (var option_i=0; option_i<_this.num_voting_options; option_i++) {
										var option_id = _this.options[option_i].option_id;
										$('#game'+_this.game.instance_id+'_event'+_this.game_event_index+'_vote_confirm_'+option_id).html(vote_option_details[option_id]);
									}
									
									refresh_output_amounts();
								}
								_this.last_event_loop_index_applied = json_result['event_loop_index'];
							}
						}
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					_this.refresh_in_progress = false;
					console.log("Game loop web request failed.");
				}
			});
		}
	};
	this.option_selected = function(option_id) {
		if (this.selected_option_id !== false) this.option_deselected(this.selected_option_id);
		$('#game'+this.game.instance_id+'_event'+this.game_event_index+'_vote_option_'+option_id).addClass('vote_option_box_sel');
		this.selected_option_id = option_id;
		this.game.sel_game_event_index = this.game_event_index;
	};
	this.option_deselected = function(option_id) {
		$('#game'+this.game.instance_id+'_event'+this.game_event_index+'_vote_option_'+option_id).removeClass('vote_option_box_sel');
		this.selected_option_id = false;
	};
	this.event_loop_event = function() {
		if (this.deleted == false) {
			this.refresh_if_needed();
			this.event_loop_index++;
			var _this = this;
			setTimeout(function() {_this.event_loop_event()}, 2000);
		}
	};
};

// OBJECT: Game
var Game = function(game_id, last_block_id, last_transaction_id, my_last_transaction_id, mature_io_ids_csv, payout_weight, game_round_length, min_bet_round, fee_amount, game_url_identifier, coin_name, coin_name_plural, refresh_page, event_ids, logo_image_url, vote_effectiveness_function) {
	Game.numInstances = (Game.numInstances || 0) + 1;
	
	this.instance_id = Game.numInstances-1;
	this.game_id = game_id;
	this.last_block_id = last_block_id;
	this.last_transaction_id = last_transaction_id;
	this.my_last_transaction_id = my_last_transaction_id;
	this.mature_io_ids_csv = mature_io_ids_csv;
	this.payout_weight = payout_weight;
	this.game_round_length = game_round_length;
	this.min_bet_round = min_bet_round;
	this.fee_amount = fee_amount;
	this.game_url_identifier = game_url_identifier;
	this.coin_name = coin_name;
	this.coin_name_plural = coin_name_plural;
	this.refresh_page = refresh_page;
	this.event_ids = event_ids;
	this.logo_image_url = logo_image_url;
	this.vote_effectiveness_function = vote_effectiveness_function;
	this.events = new Array();
	this.all_events = new Array();
	this.option_has_votingaddr = [];
	this.sel_game_event_index = false;
	this.all_events_db_id_to_index = {};
	this.my_effective_votes = 0;
	this.utxo_max_effective_votes = 0;
	this.utxo_max_height = 150;
	
	this.block_id_to_round_index = function(block_id) {
		return ((block_id-1) % this.game_round_length)+1;
	};
	this.block_to_round = function(block_id) {
		return Math.ceil(block_id/this.game_round_length);
	};
	this.round_index_to_effectiveness_factor = function(round_index) {
		if (this.vote_effectiveness_function == "linear_decrease") {
			return Math.floor(Math.pow(10,8)*(this.game_round_length-round_index)/(this.game_round_length-1))/Math.pow(10,8);
		}
		else return 1;
	};
	this.block_id_to_effectiveness_factor = function(block_id) {
		return this.round_index_to_effectiveness_factor(this.block_id_to_round_index(block_id));
	};
	this.votes_from_io = function(amount, create_block) {
		var votes;
		if (this.payout_weight == "coin") votes = Math.floor(amount);
		else if (this.payout_weight == "coin_round") votes = (this.block_to_round(1+this.last_block_id) - this.block_to_round(create_block))*amount;
		else votes = (1+this.last_block_id - create_block)*amount;
		return votes;
	};
	this.add_option_to_vote = function(option_id, name) {
		if (this.refresh_page != "wallet") {
			alert("To cast votes, first log in to your wallet.");
		}
		else {
			var index_id = vote_options.length;
			
			if (games[0].option_has_votingaddr[option_id]) {
				vote_options.push(new vote_option(index_id, name, option_id));
				$('#compose_vote_outputs').append('<div id="compose_vote_output_'+index_id+'" class="select_utxo">'+render_option_output(index_id, name)+'</div>');
				
				load_option_slider(index_id);
				
				$('#game'+this.instance_id+'_event'+this.sel_game_event_index+'_vote_confirm_'+option_id).modal('hide');
				
				refresh_compose_vote();
				refresh_output_amounts();
			}
			else {
				alert("You can't vote for this candidate yet, you don't have a voting address for it.");
			}
		}
	};
};

var option_id2chart_index = {};
var existingBetChartData = false;

function bet_loop() {
	if (option_bet_amounts_need_update || bet_sum != parseFloat($('#bet_amount').val())) {
		refresh_option_bet_amounts();
		option_bet_amounts_need_update = false;
		bet_sum = parseFloat($('#bet_amount').val());
	}
	setTimeout("bet_loop();", 400);
}
function refresh_option_bet_amounts() {
	if (option_bets.length > 0) {
		var coin_sum = $('#bet_amount').val()
		if (coin_sum == '') coin_sum = 0;
		else coin_sum = Math.floor(parseFloat(coin_sum)*Math.pow(10,8));
		
		var slider_sum = 0;
		for (var i=0; i<option_bets.length; i++) {
			slider_sum += option_bets[i].slider_val;
		}
		var coins_per_slider_val;
		if (slider_sum > 0) coins_per_slider_val = Math.floor(coin_sum/slider_sum);
		else coins_per_slider_val = 0;
		
		var bet_coins_sum = 0;
		for (var i=0; i<option_bets.length; i++) {
			var bet_coins = Math.floor(coins_per_slider_val*option_bets[i].slider_val);
			
			if (i == option_bets.length - 1) bet_coins = coin_sum - bet_coins_sum;
			
			var output_val_disp = format_coins(bet_coins/Math.pow(10,8))+" coins";
			if (coin_sum > 0) output_val_disp += " ("+(Math.round(1000*bet_coins/coin_sum)/10)+"%)";
			$('#option_bet_amount_disp_'+i).html(output_val_disp);
			
			option_bets[i].amount = bet_coins;
			bet_coins_sum += bet_coins;
		}
		
		update_bet_chart();
	}
}
function place_bet() {
	if ($('#bet_confirm_btn').html() == "Place Bet") {
		var round = $('#bet_round').val();
		var amounts_csv = "";
		var options_csv = "";
		
		if (parseInt(round) > 0) {
			$('#bet_confirm_btn').html("Loading...");
			
			for (var i=0; i<option_bets.length; i++) {
				amounts_csv += option_bets[i].amount;
				options_csv += option_bets[i].option_id;
				if (i != option_bets.length-1) {
					amounts_csv += ",";
					options_csv += ",";
				}
			}
			
			$.get("/ajax/place_bets.php?game_id="+games[0].game_id+"&options="+options_csv+"&amounts="+amounts_csv+"&round="+round, function(result) {
				$('#bet_confirm_btn').html("Place Bet");
				
				var json_result = JSON.parse(result);
				alert(json_result['message']);
				
				if (json_result['result_code'] == 11) {
					$('#bet_round').val("");
					$('#bet_amount').val("");
					$('#option_bet_disp').html("");
					$('#round_odds_chart').html("");
					$('#round_odds_stats').html("");
					$('#bet_charts').hide();
					option_bets.length = 0;
				}
			});
		}
		else alert('You need to select a round first.');
	}
}
function add_bet_option() {
	var option_id = $('#bet_option').val();
	add_bet_option_by_id(option_id);
	$('#bet_option').val("");
	refresh_option_bet_amounts();
}
function add_bet_option_by_id(option_id) {
	if (options[option_id].bet_index === false) {
		var bet_index = option_bets.length;
		$('#option_bet_disp').append('<div id="option_bet_'+bet_index+'" class="select_utxo">'+render_option_bet(bet_index, option_id)+'</div>');
		option_bets.push(new option_bet(bet_index, option_id));
		options[option_id].bet_index = bet_index;
		load_option_bet_slider(bet_index);
	}
}
function remove_option_bet(bet_index) {
	options[option_bets[bet_index].option_id].bet_index = false;
	
	for (var i=bet_index+1; i<option_bets.length; i++) {
		$('#option_bet_'+(i-1)).html(render_option_bet(i-1, option_bets[i].option_id));
		$('#option_bet_'+i).html('');
		option_bets[i].bet_index = option_bets[i].bet_index-1;
		options[option_bets[i].option_id].bet_index = options[option_bets[i].option_id].bet_index-1;
		option_bets[i-1] = option_bets[i];
		load_option_bet_slider(i-1);
		$('#option_bet_threshold_'+(i-1)).val(option_bets[i-1].slider_val);
	}
	$('#option_bet_'+(option_bets.length-1)).remove();
	option_bets.length = option_bets.length-1;
	
	refresh_option_bet_amounts();
}
function add_all_bet_options() {
	for (var i=0; i<=games[0].num_voting_options; i++) {
		add_bet_option_by_id(i);
	}
	refresh_option_bet_amounts();
}
function bet_round_changed() {
	var round_id = $('#bet_round').val();
	
	$('#bet_charts').hide('fast');
	
	$.get("/ajax/bet_round_details.php?game_id="+games[0].game_id+"&round_id="+round_id, function(result) {
		$('#bet_charts').slideDown('fast');
		
		var json_result = JSON.parse(result);
		existingBetChartData = json_result[0];
		
		for (var i=0; i<existingBetChartData.length; i++) {
			options[existingBetChartData[i]['option_id']].existing_bet_sum = parseInt(existingBetChartData[i]['amount']);
		}
		
		$('#round_odds_stats').html(json_result[1]);
		
		update_bet_chart();
	});
}
function update_bet_chart() {
	if (existingBetChartData.length > 0) {
		var chartData = new Array();
		chartData.push(['Empire', 'Coins Staked']);
		
		var all_bets_sum = 0;
		
		for (var i=0; i<existingBetChartData.length; i++) {
			var option_id = existingBetChartData[i]['option_id'];
			var my_bet_amount = 0;
			if (options[option_id].bet_index !== false) my_bet_amount = option_bets[options[option_id].bet_index].amount;
			var this_bet_amount = parseInt(existingBetChartData[i]['amount'])+my_bet_amount;
			all_bets_sum += this_bet_amount;
			chartData.push([existingBetChartData[i]['name'], Math.round(this_bet_amount/Math.pow(10,6))/Math.pow(10,2)]);
			option_id2chart_index[option_id] = i;
		}
		
		for (var i=0; i<=games[0].num_voting_options; i++) {
			var this_bet_amount = options[i].existing_bet_sum;
			if (options[i].bet_index !== false) this_bet_amount += option_bets[options[i].bet_index].amount;
			
			if (all_bets_sum > 0) $('#bet_option_pct_'+i).html(Math.round(100*100*this_bet_amount/all_bets_sum)/100+"%");
			else $('#bet_option_pct_'+i).html("0.00%");
			
			if (this_bet_amount > 0) $('#bet_option_mult_'+i).html("&#215;"+Math.round(100*all_bets_sum/this_bet_amount)/100);
			else $('#bet_option_mult_'+i).html("");
		}
		
		var data = google.visualization.arrayToDataTable(chartData);
		var options = {
			legend: {position: 'none'}
		};
		var chart = new google.visualization.PieChart(document.getElementById('round_odds_chart'));
		chart.draw(data, options);
	}
	else {
		$('#round_odds_chart').html("");
	}
}
function newsletter_signup() {
	var email = $('#newsletter_email').val();
	$.get("/ajax/newsletter.php?action=signup&email="+encodeURIComponent(email), function(result) {
		var resultObj = JSON.parse(result);
		alert(resultObj['message']);
	});
}
function set_select_add_output() {
	var optionsAsString = "<option value=''>Please select...</option>";
	for (var i=0; i<games[0].events.length; i++) {
		for (var j=0; j<games[0].events[i].options.length; j++) {
			if (games[0].events[i].options[j].has_votingaddr) {
				optionsAsString += "<option value='"+games[0].events[i].options[j].option_id+"'>"+games[0].events[i].options[j].name+"</option>";
			}
		}
	}
	$("#select_add_output").find('option').remove().end().append($(optionsAsString));
}

var account_io_id = false;
var account_io_amount = false;

function account_start_spend_io(io_id, amount) {
	account_io_id = io_id;
	account_io_amount = amount;
	$('#account_spend_buyin_total').html("(Total: "+format_coins(amount)+" coins)");
	$('#account_spend_modal').modal('show');
	console.log(io_id);
}
function account_spend_action_changed() {
	var account_spend_action = $('#account_spend_action').val();
	if (account_spend_action == "buyin") {
		$('#account_spend_buyin').show('fast');
		$('#account_spend_withdraw').hide();
	}
	else {
		$('#account_spend_withdraw').show('fast');
		$('#account_spend_buyin').hide();
	}
}
function account_spend_buyin_address_choice_changed() {
	var address_choice = $('#account_spend_buyin_address_choice').val();
	if (address_choice == "new") {
		$('#account_spend_buyin_address_existing').hide('fast');
	}
	else {
		$('#account_spend_buyin_address_existing').show('fast');
		$('#account_spend_buyin_address').focus();
	}
}
function account_spend_refresh() {
	console.log('account_spend_refresh()');
	var buyin_amount = parseFloat($('#account_spend_buyin_amount').val());
	if (buyin_amount > 0) {
		var fee_amount = parseFloat($('#account_spend_buyin_fee').val());
		var color_amount = account_io_amount - buyin_amount - fee_amount;
		$('#account_spend_buyin_color_amount').html("Color "+format_coins(color_amount)+" coins");
	}
	setTimeout("account_spend_refresh();", 500);
}
function account_spend_buyin() {
	var account_spend_action = $('#account_spend_action').val();
	
	if (account_spend_action == "buyin") {
		var address_choice = $('#account_spend_buyin_address_choice').val();
		var buyin_amount = parseFloat($('#account_spend_buyin_amount').val());
		var fee_amount = parseFloat($('#account_spend_buyin_fee').val());
		var game_id = $('#account_spend_game_id').val();
		
		var buyin_url = "/ajax/account_spend.php?action=buyin&io_id="+account_io_id+"&game_id="+game_id+"&buyin_amount="+buyin_amount+"&fee_amount="+fee_amount;
		if (address_choice == "new") buyin_url += "&address=new";
		else buyin_url += "&address="+$('#account_spend_buyin_address').val();
		
		$.get(buyin_url, function(result) {
			var result_obj = JSON.parse(result);
			alert(result_obj['message']);
			if (result_obj['status_code'] == 1) window.location = window.location;
		});
	}
}