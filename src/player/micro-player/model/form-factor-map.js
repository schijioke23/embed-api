var FormFactorMap = function() {
	var DEFAULT_FALSE = [false, true],
		DEFAULT_TRUE = [true, false];
	return {
		"8": {
			name: "ccEnabled",
			value: DEFAULT_FALSE
		},
		"10": {
			name: "useSegmentedScrubber",
			value: [false, true, true]
		},
		"22": {
			name: "useNativeControls",
			value: DEFAULT_FALSE,
			defaultValue: true
		},
		"27" : {
			name : "useCoda",
			value : DEFAULT_TRUE
		}
	};
}();