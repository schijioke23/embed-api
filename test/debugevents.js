/*global $, MTVNPlayer */
(function(window) {
	if(!MTVNPlayer.EventTracker) {
		MTVNPlayer.EventTracker = function(player, logToConsole) {
			var outputID = "eventLogOutput",
				output = function(output) {
					if(!output) {
						output = document.createElement("div");
						output.scrollByLines = true;
						var s = output.style;
						s.overflow = "scroll";
						s.height = "180px";
						output.id = outputID;
					}
					return output;
				}(document.getElementById(outputID)),
				log = function(message) {
					if(message.indexOf("logMessage:") !== -1) {
						message = message.slice(11);
					}
					output.innerHTML += message + "<br/>";
				},
				container = function() {
					container = document.createElement("div");
					var clear = function() {
							var clear = document.createElement("button");
							clear.textContent = "clear";
							$(clear).click(function() {
								output.innerHTML = "";
							});
							return clear;
						}(),
						logButton = function() {
							var logButton = document.createElement("button"),
								disableText = "disable log",
								enableText = "enable log",
								doLog = function(event) {
									log(event.data);
								},
								onLogClick = function() {
									if(logButton.textContent === disableText) {
										logButton.textContent = enableText;
										window.removeEventListener("message", doLog, false);
									} else {
										logButton.textContent = disableText;
										window.addEventListener("message", doLog, false);
									}
								};
							logButton.textContent = enableText;
							$(logButton).click(onLogClick);
							return logButton;
						}(),
						s = container.style;
					container.className = "inspector";
					s.width = (player.config.width - 10) + "px";
					s.height = "200px";
					s.margin = "3px";
					container.appendChild(output);
					container.appendChild(logButton);
					container.appendChild(clear);
					document.body.appendChild(container);
				}();
			MTVNPlayer.onPlayer(

			function(player) {
				log("MTVNPlayer.onPlayer:" + player.id);
			});
			var eventFunc = player.addEventListener ? player.addEventListener : player.bind;
			for(var eventName in MTVNPlayer.Events) {
				if(MTVNPlayer.Events[eventName] !== MTVNPlayer.Events.PLAYHEAD_UPDATE) {
					eventFunc.apply(player, [MTVNPlayer.Events[eventName], (function(eventName) {
						return function(event) {
							log("<b>" + eventName + "</b>" + (event.data !== undefined ? ":" + event.data : ""));
							if(logToConsole && console && console.log) {
								console.log(event.target.id + ":" + eventName, event.data !== undefined ? event.data : "");
							}
						};
					})(eventName)]);
				}
			}
		};
	}
})(window);