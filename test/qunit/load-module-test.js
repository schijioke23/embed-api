/*global MTVNPlayer test equal ok asyncTest start */
(function() {
	"use strict";
	var ModuleLoader = MTVNPlayer.module("ModuleLoader");
	test("ModuleLoader.getDependencyList", function() {
		var dependencies = {
			"A": {
				id: "A",
				url: "A url"
			},
			"B": {
				id: "B",
				url: "B url"
			},
			"C": {
				id: "C",
				url: "C url"
			}
		};
		MTVNPlayer.provide("C", {});
		var list = ModuleLoader.getDependencyList(dependencies);
		equal(list[0], "A url", "required A");
		equal(list[1], "B url", "required B");
		equal(list.length, 2, "C is not in list because it's provided.");
	});
	asyncTest("EndSlateModule", 5, function() {
		ok(!MTVNPlayer.has("$"), "jQuery not loaded yet");
		ok(!MTVNPlayer.has("mtvn-util"), "mtvn-util not loaded yet");
		var player = {
			config: {
				module: {
					"endslate": {
						url: "mock-data/end-slate.js",
						css: "mock-data/end-slate.css",
						dependencies: {
							"$": {
								url: "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
							},
							"mtvn-util": {
								url: "mock-data/mtvn-util.js"
							}
						}
					}
				}
			}
		},
			event = {
				target: player
			},
			EndSlateModule = MTVNPlayer.module("ModuleLoader").EndSlateModule;

		EndSlateModule.onModuleRequested(event);
		EndSlateModule.callbacks.push(function() {
			ok(MTVNPlayer.has("$"), "jQuery loaded");
			equal(MTVNPlayer.require("$").fn.jquery, "1.9.1", "jQuery");
			ok(MTVNPlayer.has("mtvn-util"), "mtvn-util loaded");
			// MTVNPlayer.provide("$",null);
			MTVNPlayer.provide("mtvn-util", null);
			start();
		});
	});
})();