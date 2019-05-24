module.exports = {
	"af": {
		self_collect_switch: true, // i know the trick about the reason you wanna turn this switch off
		friend_collect_switch: true, // seriously? i cannot believe it if you turn this switch off
		help_collect_switch: true, // set false if you do not wanna give a hand; leave it true if you like "surprise"
		non_break_check_switch: false, // non-stop checking your energy balls switch
		non_break_check_time_area: [["07:28:00", "07:28:47"]], // period(s) for non-stop checking your energy balls; leave [] if not needed
		help_collect_icon_color: "#f99137", // color for help icon with a heart pattern
		help_collect_icon_threshold: 10, // 0 <= x <= 66 is recommended; the smaller, the stricter; max limit tested on Sony G8441
		help_collect_balls_color: "#f99137", // color for fade-in-and-out help balls in a friend's forest
		help_collect_balls_threshold: 60, // 30 ~< x <= 83 is recommended; the smaller, the stricter; max limit tested on Sony G8441
		help_collect_balls_intensity: 16, // 10 <= x <= 20 is recommended; more samples for image matching, at the cost of time however
		friend_collect_icon_color: "#1da06d", // color for collect icon with a hand pattern
		friend_collect_icon_threshold: 10, // 0 <= x <= 66 is recommended; the smaller, the stricter; max limit tested on Sony G8441
		protect_cover_ident_color: "#bef658", // protect cover identifying color from a certain point in countdown area
		protect_cover_ident_threshold: 5, // do not set this value much too big in case that green balls will be recognized as protect cover
		auto_unlock_switch: false, // set true if you wish your dream's coming true when you are making a sweet dream or snoring
		message_showing_switch: true, // set false value if you need a clean console or hide what you've done to your friends
		console_log_switch: true, // if false was set, message in console will not be printed, but toast or floaty not included
		console_log_details: true, // whether to show message details of each friend in console
		debug_info_switch: false, // show debug logs in console to debug this script or to give developer feedback
		result_showing_switch: true, // information will show in floaty way with true or toast way with false
		floaty_result_switch: true, // result will show in floaty way with "true value" or toast way with "false value"
		rank_list_samples_collect_strategy: "layout", // "image" for image recolonization or "layout" for layout inspection
	},
	"unlock": {
		unlock_code: null, // when we first met, i do not know your name, your age, or, your sexual orientation, wow...
		unlock_pattern_size: 3, // side size of a speed-dial-like pattern for unlocking your phone, and 3 is the most common value
		unlock_max_try_times: 20, // max times for trying unlocking your phone
		dismiss_layer_swipe_time: 110, // time for swiping up to dismiss the lock screen layer
		pattern_unlock_swipe_time: 120, // gesture time for pattern unlock each time, and usually won't change with correct unlock code
	}
};