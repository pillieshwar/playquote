$(function(){
	var question_id_param = $.url('?q');
	if (typeof question_id_param === 'undefined') {
		get_quotes();
		//switch_to_page("index-page");
	} 

	$("#home-icon").click(function() {
		window.history.replaceState(null, null, window.location.pathname);
		//switch_to_page("index-page");
	})
});

function update_login_state(is_logged_in, address) {
	if (is_logged_in) {
		$(".not-logged-in").hide();
		$(".logged-in").show();
		$("#public-address").html(address);
		mark_owned_questions()
	} else {
		$(".not-logged-in").show();
		$(".logged-in").hide();
		$("#public-address").html();
	}
}

function mark_owned_questions() {
	var address = $("#public-address").html();

	if (address.length > 0) {
		$("#question-card-list .question-card").each(function(index) {
			if ($(this).attr('author-id') == address) {
				$(this).find('.card-is-owner').html('You created this - ')
			}
		});

	}
}