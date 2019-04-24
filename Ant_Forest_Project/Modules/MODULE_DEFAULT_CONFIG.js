module.exports = {
	"af": {
		help_collect_switch: true,
		non_break_check_switch: false,
		non_break_check_time_area: [["07:28:00", "07:28:47"]],
		help_collect_intensity: 16,
		help_collect_color: "#f99137",
		help_collect_color_threshold: 60,
		auto_unlock_switch: false,
		message_showing_switch: true,
		console_log_switch: true,
		console_log_details: true, // whether to show message details of each friend in console
		debug_info_switch: false, // show debug logs in console to debug this script or to give developer feedback
		result_showing_switch: true,
		floaty_result_switch: true, // result will show in floaty way with "true value" or toast way with "false value"
	},
	"unlock": {
		unlock_code: null,
		unlock_pattern_size: 3,
		unlock_max_try_times: 20,
		dismiss_layer_gesture_time: 120,
		gesture_unlock_swipe_time: 320,
	}
};