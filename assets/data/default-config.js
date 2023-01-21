module.exports = {
    af: {
        projectDesc: '蚂蚁森林',
        selfCollectSwitch: true,
        // sometimes alipay will not be launched without Auto.js running in the foreground
        appLaunchSpringboard: 'OFF',
        // if you are multi-account user, you may turn this on and specify a 'main account' to switch
        accountSwitch: false,
        // with this switch on, original logged in account will be logged back before exit
        accountLogBackInSwitch: false,
        // with this value, logging back in will not happen in any circumstance
        accountLogBackInMaxContinuousTimes: 3,
        // stores information of the 'main account' user
        mainAccountInfo: {},
        // 1 <= x <= 200; press time for press(); small value like 1 may be not safe in some situations
        forestBallsClickDuration: 54,
        // 10 <= x <= 2000; as the saying goes, 'Haste makes waste'
        forestBallsClickInterval: 108,
        // set true value if you need continuously check your own energy balls
        homepageMonitorSwitch: true,
        // 1 <= x <= 3; continuously check your own energy balls if min countdown is within threshold
        homepageMonitorThreshold: 2,
        // return to homepage and monitor if own energy min countdown is less than some threshold
        homepageBackgroundMonitorSwitch: false,
        // 1.0 <= x <= 3.0; value should not bigger than homepageMonitorThreshold
        homepageBackgroundMonitorThreshold: 1,
        // set falsy to disable homepage water ball check
        homepageWaterBallSwitch: true,
        // just in case of infinite loop check
        homepageWaterBallCheckLimit: 120,
        // max hue value in HSB mode without blue component for water wall identification
        homepageWaterBallMaxHueNoBlue: 47,
        friendCollectSwitch: true,
        // color for collect icon with a hand pattern
        friendCollectIconColor: '#1DA06D',
        // 0 <= x <= 66; the smaller, the stricter; max limit tested on Sony G8441
        friendCollectIconThreshold: 10,
        // set truthy value to get targets by stroll button rather than traverse rank list
        getTargetsByStrollButton: false,
        // 1 <= x <= 8; size limitation for forest balls samples pool
        forestImagePoolLimit: 3,
        // 10 <= x <= 500; interval between two samples when saving into forest balls samples pool
        forestImagePoolInterval: 60,
        // rectangle region for energy balls recognition in forest page
        energyBallsRecognitionRegion: [0.1 /* cX */, 0.15 /* cYx */, 0.9 /* cX */, 0.45 /* cYx */],
        // strategies for cv::houghCircles image source (8bit, single-channel and grayscale)
        houghSrcImageStrategy: {
            grayscale: true, // images.grayscale(image)
            adaptiveThreshold: true, // images.adaptiveThreshold(image, 255, 'GAUSSIAN_C', 'BINARY_INV', 9, 6)
            medianBlur: true, // images.medianBlur(image, 9)
            blur: true, // images.blur(image, 9, null, 'REPLICATE')
            bilateralFilter: false, // images.bilateralFilter(image, 9, 20, 20, 'REPLICATE')
        },
        // strategies for handling cv::houghCircles results
        houghResultsStrategy: {
            antiOverlap: true, // anti overlap: remove redundant balls overlapped
            symmetrical: true, // symmetrical: calculated outer absent ball of one side
            linearInterpolate: true, // linear interpolate: calculated inner absent ball(s)
        },
        // 0 <= x <= 40; the smaller, the stricter;
        ripeBallDetectThreshold: 13,
        // color for ripe balls in forest page since Oct 16, 2020 around (old value: '#CEFF5F')
        ripeBallDetectColorValue: '#DEFF00',
        // 0.06 <= x <= 0.15; minimum distance between two energy balls
        minBallsDistance: 0.09,
        // shield identifying color from a certain point in countdown area
        shieldDetectColorValue: '#BEF888', // TODO...
        // do not set this value too big in case that green balls will be recognized as shield
        shieldDetectThreshold: 5, // TODO...
        // set true if you wish your dream's coming true when you are making a sweet dream or snoring
        autoUnlockSwitch: false,
        // set false value if you need a clean console or hide what you've done to your friends
        messageShowingSwitch: true,
        // if false was set, message in console will not be printed, but toast or floaty not included
        consoleLogSwitch: true,
        // show debug logs in console to debug this script or to give developer feedback
        debugInfoSwitch: false,
        // information will show in floaty way with true or toast way with false
        resultShowingSwitch: true,
        // result will show in floaty way with 'true value' or toast way with 'false value'
        floatyResultSwitch: true,
        // 2 <= x <= 9; countdown seconds before floaty window going dismissed
        floatyResultCountdownSeconds: 6,
        // review rank list samples if one or more of conditions met
        rankListReviewSwitch: true,
        // rank list review condition: min countdown threshold
        rankListReviewThresholdSwitch: true,
        // 1 <= x <= 5; check if rank list min countdown is less than threshold
        rankListReviewThreshold: 1,
        // rank list review condition: samples clicked flag
        rankListReviewSamplesClickedSwitch: true,
        // rank list review condition: samples difference between last two samples nickname data
        rankListReviewDifferenceSwitch: true,
        // 'swipe' may be not helpful sometimes (e.g. some Android 11 devices)
        rankListScanStrategy: 'scroll',
        // [0.4, 0.9] for percentage, or integer for pixel distance (like 1260)
        rankListSwipeDistance: 0.75,
        // 100 <= x <= 1200; duration for swiping up each time
        rankListSwipeDuration: 150,
        // 100 <= x <= 2400; interval between swipes
        rankListSwipeInterval: 300,
        // 100 <= x <= 2400;
        rankListScrollInterval: 240,
        // 50 <= x <= 500; just in case of infinite loop check
        rankListNotTargetedLimit: 200,
        // 5 <= x <= 800; to prevent infinity swipe up at rank list page
        rankListCaptPoolDiffCheckThreshold: 20,
        // fantastic function which almost everybody wants it, however, i still need to switch it off initially
        timersSwitch: false,
        // set false value if you prefer a manual timer management
        timersSelfManageSwitch: true,
        // whether to auto-calc next running timestamp and set a timed task
        timersCountdownCheckOwnSwitch: true,
        // 0 <= x <= 3; if you prefer an earlier timed task before own balls ripe
        timersCountdownCheckOwnTimedTaskAhead: 2,
        // whether to auto-calc next running timestamp and set a timed task
        timersCountdownCheckFriendsSwitch: true,
        // 0 <= x <= 5; if you prefer an earlier timed task before friends' balls ripe
        timersCountdownCheckFriendsTimedTaskAhead: 1,
        // whether to set a timed task in the future when there are no other tasks set
        timersUninterruptedCheckSwitch: true,
        // 1 <= x <= 600; multi sections available
        timersUninterruptedCheckSections: [{section: ['06:30', '00:00'], interval: 60}],
        // set if you were bothered by auto timed task system; like: [['21:00', '07:45'], ['11:30', '13:30']]
        timersAutoTaskSections: [],
        // just in case, as you know; timed task will be set on running and removed when script finished
        timersInsuranceSwitch: true,
        // 1 <= x <= 10; timed task will be extended every 10 sec to avoid interval's consumption
        timersInsuranceInterval: 5,
        // 1 <= x <= 5; auto-insurance task will be dysfunctional with to many continuous attempts
        timersInsuranceMaxContinuousTimes: 3,
        // 5 <= x <= 90; max running time for a single script
        maxRunningTimeGlobal: 45,
        // 1 <= x <= 120; max queue time for every exclusive task if exclusive tasks ahead is running or queueing
        maxQueueTimeGlobal: 60,
        // 100 <= x <= 800; exclusive tasks with too small intervals will be taken as bomb tasks
        minBombIntervalGlobal: 300,
        // ant forest timed task will be auto-delayed if battery percentage is lower than specified value
        minBatteryPercentage: 20,
        // decide whether to kill alipay app before script ended
        killWhenDoneSwitch: false,
        // true value for an intelligent check before killing alipay
        killWhenDoneIntelligent: true,
        // set true value if you prefer to keep ant forest pages before script ended
        killWhenDoneKeepRelatedPages: false,
        // when switched on, script will be paused if phone call state is not idle
        phoneCallStateMonitorSwitch: true,
        // dynamic; will be initialized when script running (often among 0, 1 and 2)
        phoneCallStateIdleValue: undefined,
        // set false value if you do not need a countdown dialog before running script
        promptBeforeRunningSwitch: true,
        // 3 <= x <= 30; countdown seconds before dialog dismissed automatically
        promptBeforeRunningCountdownSeconds: 5,
        // dialog won't prompt with truthy value when running with screen off or device locked
        promptBeforeRunningAutoSkip: true,
        // confirmation won't prompt with truthy value before quit current running task
        promptBeforeRunningQuitConfirm: true,
        // default choices for a postponed minute
        promptBeforeRunningPostponedMinutes: [1, 2, 3, 5, 10, 15, 20, 30, 60],
        // 0 for ask every time, other number like 1, 2, 5 for specific postponed minute
        promptBeforeRunningPostponedMinute: 0,
        // record user selected value of postponed settings dialog in countdown dialog
        promptBeforeRunningPostponedMinuteUser: 3,
        // ant forest timed task will be auto-delayed if current foreground app is in this list
        foregroundAppBlacklist: [],
        // some others
        updateIgnoreList: [],
        updateAutoCheckSwitch: true,
        updateShowOnAfSettings: true,
        updateShowOnShowingResult: true,
        autoTaskShowOnShowingResult: true,
        statListShowZero: 1, // hide zero
        statListDateRange: 2, // today
        autojsGlobalLogSwitch: true,
        autojsGlobalLogConfigPath: './log/',
        autojsGlobalLogConfigFilePattern: '%d{yyyy-MM-dd/}%m%n',
        autojsGlobalLogConfigMaxBackupSize: 7,
        autojsGlobalLogConfigMaxFileSize: 320, // KB
        energyDoubleCollectSwitch: false,
        energyRainCollectSwitch: false,
        strollButtonMatchThreshold: 10,
        strollButtonLocateMainColor: '#FF7E00',
        // 1 <= x <= 5; to avoid infinite loop targets detection
        strollNotTargetedLimit: 3,
        rootAccessPrivileges: {
            forceStopApp: false,
            screenOffByKeyEvent: true,
        },
    },
    unlock: {
        // when we first met, i do not know your name, your age, or, your sexual orientation, wow...
        unlockCode: null,
        // max times for trying unlocking your phone
        unlockTryLimit: 20,
        // 'segmental' for faster and more accurate swipe and 'solid' for stable swipe without break
        unlockPatternStrategy: 'segmental',
        // side size of a speed-dial-like pattern for unlocking your phone, and 3 is the most common value
        unlockPatternSize: 3,
        // swipe time for pattern unlock each two points; may be auto modified
        unlockPatternSwipeDurationSegmental: 120,
        // swipe time for pattern unlock each time; may be auto modified
        unlockPatternSwipeDurationSolid: 200,
        // also, 'delay' or 'disable' dismiss layer check is optional
        unlockDismissLayerStrategy: 'preferred',
        // 0.5 <= x <= 0.95; great value (like 0.95) may cause unexpected object activation
        unlockDismissLayerBottom: 0.7,
        // 0.05 <= x <= 0.4; this value may be not that important
        unlockDismissLayerTop: 0.3,
        // time for swiping up to dismiss the lock screen layer; will be auto modified initially
        unlockDismissLayerSwipeDuration: 110,
    },
    settings: {
        itemAreaWidth: 0.78,
    },
};