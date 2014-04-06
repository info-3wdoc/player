	/**
 * @preserve LICENSE:
 * Lib3wmlPlayer is licensed under Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported License.
 * Permissions beyond the scope of this license may be available at http://www.hecube.net/
 * codeAuthor: info@3wdoc.com
 */

// Set the classes in global scope so it is accessible in each library file inside wrapper function
var Lib3wmlPlayer;

/** ******************** **/
/**   FUNCTION WRAPPER   **/
/** ******************** **/

(function( $ ) {
	
	/** ******************** **/
	/**   Lib3wmlPlayer class  **/
	/** ******************** **/
	
	Lib3wmlPlayer = function(element) {
		
		/** ******************** **/
		/**      properties      **/
		/** ******************** **/
		
		// self reference to "this" object (void confusion with "this" in context)
		var self = this;
		
		// fontface
		var fontface			= {};
		
		// main elements
		var core				= element;
		var requestCore 		= {};
		var definitions 		= {};
		var effects 			= {};
		var events				= {};
		var styles				= {};
		var grid 				= {};
		var catalog				= {};
		var recall				= {};
		var collector			= {};
		
		// player elements
		var clock				= {};
		var injector			= {};
		var nabber				= {};
		var render				= {};
		var scrub				= {};
		
		// widget elements
		var menu				= {};
		var binder				= {};
		var dialog				= {};
		var dialogSimple		= {};
		var browser				= {};
		var formfield			= {};
		var xdroppable			= {};
		var nabberSlider		= {};
		
		// jQuery queueing support
		var queues				= $({});
		
		// instance timestamp
		var now = 0;
		
		// instance context
		var standalone = false;
		
		$.extend({
			
			// BEGIN Clock vvv--------------------------------------------------------vvv
			setClock: function() {
				$(core).data("clock", {
					"period": 100, // period duration in ms, defines the timescale precision of the clock
					"status": false, // running or not
					"seek": false, // seeking or not
					"origintime": 0, // in ms, the start playing origin
					"duration": 0,
					"cuetime": 0, // in ms !!! different of the outside world of this plugin
					"stoid": 0, // setTimeout identifier
					"registered": [],
					"mounted": [],
					"seeking": [],
					"mobileRegisterLock": false,
					"nslist": ["NETWORK_EMPTY","NETWORK_IDLE","NETWORK_LOADING","NETWORK_LOADED","NETWORK_NO_SOURCE"],
					"rslist": ["HAVE_NOTHING","HAVE_METADATA","HAVE_CURRENT_DATA","HAVE_FUTURE_DATA","HAVE_ENOUGH_DATA"],
					quartz: function() {
						if( clock["seeking"].length > 0 ) {
							clock["origintime"] = $.getMicrotime()-clock["cuetime"];
						} else {
							clock["cuetime"] = $.getMicrotime()-clock["origintime"];
							$(core).trigger("cuetimePlayer", [clock["cuetime"]]);
						}
						if( clock["cuetime"] >= clock["duration"] ) {
//							clock.stopLoop(true);
							clock.stopLoop(); // pause only stay coool :)
							$(core).trigger("endtimePlayer", [clock["cuetime"]]);
							if( standalone === true ) {
								if( scrub.queryOpt("autochain") === true ) {
									$.playerInitSequence(false, 0, false);
								}
							}
							return false;
						}
						clock["stoid"] = setTimeout(function() {
							clock.quartz(); // RECURSE // <-:)] ===|------------------ || ------------------|=== [(:-> // RECURSE //
						}, clock["period"]);
					},
					// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ROOT-LEVEL OBJECTS ANONYMOUS METHODS
					startLoop: function() {
						if( clock["status"] === true ) {
							$.log("startLoop failed, loop already running");
							return false;
						}
						clock["status"] = true;
						clock["origintime"] = $.getMicrotime()-clock["cuetime"];
						clock["duration"] = scrub.queryOpt("duration")*1000;
						clock.quartz();
						clock.syncMountedList();
						return true;
					},
					stopLoop: function(reset) { // can force stop if pass false as first argument
						clock["status"] = false;
						if( reset === true ) {
							clock["origintime"] = 0;
							clock["duration"] = 0;
							clock["cuetime"] = 0;
						}
						var _stoid = clock["stoid"];
						clock["stoid"] = 0;
						clearTimeout(_stoid);
						clock.syncMountedList();
						return _stoid;
					},
					cueLoop: function(cuetime) { // in ms !!!
						if( typeof(cuetime) != "number" || cuetime < 0 ) {
							var cuetime = 0;
						}
						var status = clock["status"];
						clock.stopLoop();
						clock["cuetime"] = cuetime;
						$(core).trigger("cuetimePlayer", [cuetime]);
						if( status === true ) {
							clock.startLoop();
						}
						clock.cueMountedList(); // previously placed before cuetimePlayer trigger ^
						clock.syncMountedList();
						return cuetime;
					},
					statusLoop: function(pn) {
						if( pn === "period" ) {
							return clock["period"];
						}
						else if( pn === "status" ) {
							return clock["status"];
						}
						else if( pn === "seek" ) {
							return clock["seek"];
						}
						else if( pn === "origintime" ) {
							return clock["origintime"];
						}
						else if( pn === "cuetime" ) {
							return clock["cuetime"];
						}
						else if( pn === "stoid" ) {
							return clock["stoid"];
						} else {
							return {
								"period": clock["period"],
								"origintime": clock["origintime"],
								"cuetime": clock["cuetime"],
								"status": clock["status"],
								"seek": clock["seek"],
								"stoid": clock["stoid"]
							};
						}
					},
					syncMountedList: function() {
						if( clock["status"] && clock["seeking"].length == 0 ) {
							clock.startMountedList();
							clock.soundMountedList();
						}
						else if( !clock["status"] && clock["seeking"].length == 0 ) {
							clock.stopMountedList();
						}
					},
					startMountedList: function() {
						$.each(clock["mounted"], function(k, oid) {
							clock.startMounted(oid);
						});
						return true;
					},
					startMounted: function(oid) {
						var playerTrackNode = render["playerTrackNodes"][oid];
						if( typeof(playerTrackNode) != "object" ) {
							return false;
						}
						if( typeof($(playerTrackNode).get(0).play) != "function" ) {
							return false;
						}
						if( $(playerTrackNode).get(0).paused === false ) {
							return false;
						}
						$(playerTrackNode).get(0).play();
						return true;
					},
					stopMountedList: function() {
						$.each(clock["mounted"], function(k, oid) {
							clock.stopMounted(oid);
						});
						return true;
					},
					stopMounted: function(oid) {
						var playerTrackNode = render["playerTrackNodes"][oid];
						if( typeof(playerTrackNode) != "object" ) {
							return false;
						}
						if( typeof($(playerTrackNode).get(0).pause) != "function" ) {
							return false;
						}
						if( $(playerTrackNode).get(0).paused === true ) {
							return false;
						}
						$(playerTrackNode).get(0).pause();
						return true;
					},
					cueMountedList: function() {
						$.each(clock["mounted"], function(k, oid) {
							clock.cueMounted(oid);
						});
						return true;
					},
					cueMounted: function(oid) {
						var playerTrackNode = render["playerTrackNodes"][oid];
						if( typeof(playerTrackNode) != "object" ) {
							return false;
						}
						if( typeof($(playerTrackNode).get(0).currentTime) != "number" ) {
							return false;
						}
						var cuetime_s = Math.round(clock["cuetime"]/1000);
						var startTime = $(playerTrackNode).data("injectorMetadata")["startTime"];
						var stopTime = $(playerTrackNode).data("injectorMetadata")["stopTime"];
						if( $(playerTrackNode).data("overlay") === true ) {
							// allow cueing outside of start and stop points !!!
							var cT = cuetime_s-startTime;
							if( cuetime_s < startTime || cuetime_s > stopTime ) {
								cT = 0;
							}
							$(playerTrackNode).get(0).currentTime = cT;
						} else {
							// disallow cueing outside of start and stop points
							if( cuetime_s < startTime || cuetime_s > stopTime ) {
								return false;
							}
							$(playerTrackNode).get(0).currentTime = cuetime_s-startTime;
						}
						return true;
					},
					soundMountedList: function() {
						$.each(clock["mounted"], function(k, oid) {
							clock.soundMounted(oid);
						});
						return true;
					},
					soundMounted: function(oid) {
						var playerTrackNode = render["playerTrackNodes"][oid];
						if( typeof(playerTrackNode) != "object" ) {
							return false;
						}
						if( typeof($(playerTrackNode).get(0).volume) != "number" ) {
							return false;
						}
						$(playerTrackNode).get(0).volume = render["metrics"]["contentVolume"];
						if( typeof($(playerTrackNode).get(0).muted) != "boolean" ) {
							return false;
						}
						$(playerTrackNode).get(0).muted = render["metrics"]["contentMute"];
						return true;
					},
					mountRegistered: function(oid) {
						var s = $.inArray(oid, clock["mounted"]);
						if( s != -1 ) {
							// $.log("mountRegistered failed, oid already mounted");
							return false;
						}
						clock["mounted"].push(oid);
						clock.cueMounted(oid); // must be here because of FF
						return true;
					},
					umountRegistered: function(oid) {
						var s = $.inArray(oid, clock["mounted"]);
						if( s == -1 ) {
							// $.log("umountRegistered failed, oid not mounted");
							return false;
						}
						clock["mounted"].splice(s, 1);
						return true;
					},
					seekRegistered: function(oid) {
						var s = $.inArray(oid, clock["seeking"]);
						if( s != -1 ) {
							// $.log("seekRegistered failed, oid already seeking");
							return false;
						}
						clock["seeking"].push(oid);
						$(core).trigger("seekPlayer", [true]);
						return true;
					},
					useekRegistered: function(oid) {
						var s = $.inArray(oid, clock["seeking"]);
						if( s == -1 ) {
							// $.log("useekRegistered failed, oid not seeking");
							return false;
						}
						clock["seeking"].splice(s, 1);
						if( clock["seeking"].length < 1 ) {
							$(core).trigger("seekPlayer", [false]);
						}
						return true;
					},
					register: function(oid) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("register failed, oid not booted");
							return false;
						}
						if( $.inArray(oid, clock["registered"]) != -1 ) {
							$.log("register failed, oid already registered");
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						switch( $(playerTrackNode).data("species") ) {
							case "raw":
								$(playerTrackNode).bind("clockLoad", function(e) {
									var oid = $(playerTrackNode).data("oid");
									$.log("clockLoad "+$(playerTrackNode).data("species")+" "+oid);
									var im = $(playerTrackNode).data("injectorMetadata");
									$(playerTrackNode).html(im["data"]["render"]);
									$(playerTrackNode).children().css({
										"width": "100%",
										"height": "100%"
									});
									var showHandler = $(playerTrackNode).data("showHandler");
									showHandler();
								});
								$(playerTrackNode).bind("clockUnLoad", function(e) {
									var oid = $(playerTrackNode).data("oid");
									$.log("clockUnload "+$(playerTrackNode).data("species")+" "+oid);
									var hideHandler = $(playerTrackNode).data("hideHandler");
									hideHandler();
								});
								break;
							case "button":
								$(playerTrackNode).bind("clockLoad", function(e) {
									var oid = $(playerTrackNode).data("oid");
									$.log("clockLoad "+$(playerTrackNode).data("species")+" "+oid);
									var im = $(playerTrackNode).data("injectorMetadata");
									$(playerTrackNode).text(im["data"]["control"]);
									var family = false;
									if( typeof(im["styleMouseleave"]) == "object" ) {
										if( typeof(im["styleMouseleave"]["font-family"]) == "string" && im["styleMouseleave"]["font-family"] != "" ) {
											family = im["styleMouseleave"]["font-family"];
										}
									}
									fontface.setFamily(playerTrackNode, family);
									var showHandler = $(playerTrackNode).data("showHandler");
									showHandler();
								});
								$(playerTrackNode).bind("clockUnLoad", function(e) {
									var oid = $(playerTrackNode).data("oid");
									$.log("clockUnload "+$(playerTrackNode).data("species")+" "+oid);
									var hideHandler = $(playerTrackNode).data("hideHandler");
									hideHandler();
								});
								break;
							case "article":
								$(playerTrackNode).bind("clockLoad", function(e) {
									var oid = $(playerTrackNode).data("oid");
									$.log("clockLoad "+$(playerTrackNode).data("species")+" "+oid);
									var im = $(playerTrackNode).data("injectorMetadata");
									$(playerTrackNode).html(im["data"]["text"]);
									var showHandler = $(playerTrackNode).data("showHandler");
									showHandler();
								});
								$(playerTrackNode).bind("clockUnLoad", function(e) {
									var oid = $(playerTrackNode).data("oid");
									$.log("clockUnload "+$(playerTrackNode).data("species")+" "+oid);
									var hideHandler = $(playerTrackNode).data("hideHandler");
									hideHandler();
								});
								break;
							case "image":
								$(playerTrackNode).bind("clockLoad", function(e) {
									var oid = $(playerTrackNode).data("oid");
									$.log("clockLoad "+$(playerTrackNode).data("species")+" "+oid);
									$(playerTrackNode).data("eventReady", true);
									var im = $(playerTrackNode).data("injectorMetadata");
									var currentSrc = $(playerTrackNode).attr("src");
									if( typeof(currentSrc) != "string" || currentSrc == "" ) {
										$(playerTrackNode).bind("load", function(e) {
											$(playerTrackNode).trigger("seeked");
										});
										$(playerTrackNode).bind("error", function(e) {
											var errorHandler = $(playerTrackNode).data("errorHandler");
											errorHandler(function() {
												clock.useekRegistered(oid);
												$(playerTrackNode).unbind("load");
												$(playerTrackNode).unbind("seeked");
											});
										});
										clock.seekRegistered(oid);
//										$(playerTrackNode).attr("src", im["data"]["formats"][0]["url"]+'?nocache='+$.getMicrotime());
										$(playerTrackNode).attr("src", im["data"]["formats"][0]["url"]);
									} else {
										$(playerTrackNode).trigger("seeked");
									}
								});
								$(playerTrackNode).bind("clockUnLoad", function(e) {
									var oid = $(playerTrackNode).data("oid");
									$.log("clockUnload "+$(playerTrackNode).data("species")+" "+oid);
									$(playerTrackNode).data("eventReady", false);
									var hideHandler = $(playerTrackNode).data("hideHandler");
									hideHandler(function() {
										clock.useekRegistered(oid);
									});
								});
								$(playerTrackNode).bind("seeked", function(e) {
									var oid = $(playerTrackNode).data("oid");
									if( $(playerTrackNode).data("eventReady") !== true ) {
										return false;
									}
									var showHandler = $(playerTrackNode).data("showHandler");
									showHandler();
									clock.useekRegistered(oid);
								});
								break;
							case "video":
							case "audio":
								/* debug *//*
								$(playerTrackNode).bind("loadstart", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("progress", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("suspend", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("abort", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("error", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("emptied", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("stalled", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("play", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("pause", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("loadedmetadata", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("loadeddata", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("waiting", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("playing", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("canplay", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("canplaytrough", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("seeking", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("seeked", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								$(playerTrackNode).bind("ended", function(e) {
									console.log("+++");
									clock.showStats($(playerTrackNode).data("oid"), e);
								});
								*//* debug */
								/* mobile specific */
								if( $.get3wmlBrowserIsMobile() ) {
									if( clock["mobileRegisterLock"] ) {
										$(playerTrackNode).data("visible", false);
										$.log("mountRegistered failed, only one registered at a time for mobiles");
										return false;
									}
									$(playerTrackNode).attr("controls", true);
									clock["mobileRegisterLock"] = true;
								}
								/* mobile specific */
								$(playerTrackNode).bind("clockLoad", function(e) {
									var oid = $(playerTrackNode).data("oid");
									$.log("clockLoad "+$(playerTrackNode).data("species")+" "+oid);
									$(playerTrackNode).data("eventReady", true);
									var im = $(playerTrackNode).data("injectorMetadata");
									var currentSrc = $(playerTrackNode).get(0).currentSrc;
									clock.seekRegistered(oid);
									if( typeof(currentSrc) != "string" || currentSrc == "" ) {
										var cptc = 0;
										$.each(im["data"]["formats"], function(k,v) {
											var cpt = $(playerTrackNode).get(0).canPlayType(v["ctype"]);
											if( typeof(cpt) == "string" && cpt != "" ) {
												var source = $(playerTrackNode).append('<source type="'+v["ctype"]+'"/>').children().last();
//												$(source).attr("src", v["url"]+'?nocache='+$.getMicrotime());
												$(source).attr("src", v["url"]);
												cptc++;
											}
										});
										if( cptc < 1 ) { // error case, no fitting source found
											var errorHandler = $(playerTrackNode).data("errorHandler");
											errorHandler(function() {
												clock.stopMounted(oid);
												clock.useekRegistered(oid);
												clock.umountRegistered(oid);
												$(playerTrackNode).unbind("loadeddata");
												$(playerTrackNode).unbind("canplay");
												$(playerTrackNode).unbind("canplaythrough");
												$(playerTrackNode).unbind("seeking");
												$(playerTrackNode).unbind("seeked");
											});
										}
									} else {
//										$(playerTrackNode).load(); // does not work with all safari versions
										$(playerTrackNode).trigger("canplay");
									}
									/* mobile specific */
									if( $.get3wmlBrowserIsMobile() ) {
										$(playerTrackNode).show(); // we should print the proprietary A---e overlay, so nasty !!!
									}
									/* mobile specific */
								});
								$(playerTrackNode).bind("clockUnLoad", function(e) {
									var oid = $(playerTrackNode).data("oid");
									$.log("clockUnload "+$(playerTrackNode).data("species")+" "+oid);
									$(playerTrackNode).data("eventReady", false);
									$(playerTrackNode).removeAttr("controls");
									var hideHandler = $(playerTrackNode).data("hideHandler");
									hideHandler(function() {
										clock.stopMounted(oid);
										clock.useekRegistered(oid);
										clock.umountRegistered(oid);
									});
								});
								$(playerTrackNode).bind("loadeddata canplay", function(e) {
									var oid = $(playerTrackNode).data("oid");
									if( $(playerTrackNode).data("eventReady") !== true ) {
										return false;
									}
									clock.showStats(oid, e);
									$(playerTrackNode).get(0).pause(); // needed because of autoplay attr
									clock.mountRegistered(oid);
									clock.syncMountedList(); // sync again and again because of safari weird html5 events
								});
								$(playerTrackNode).bind("seeking", function(e) {
									var oid = $(playerTrackNode).data("oid");
									if( $(playerTrackNode).data("eventReady") !== true ) {
										return false;
									}
									clock.showStats(oid, e);
									clock.seekRegistered(oid);
								});
								$(playerTrackNode).bind("seeked", function(e) {
									var oid = $(playerTrackNode).data("oid");
									if( $(playerTrackNode).data("eventReady") !== true ) {
										return false;
									}
									clock.showStats(oid, e);
									var showHandler = $(playerTrackNode).data("showHandler");
									showHandler();
									clock.useekRegistered(oid);
									clock.syncMountedList();
									if( $(playerTrackNode).data("overlay") === true ) {
										$(playerTrackNode).attr("controls", true);
										clock.startMounted(oid);
									}
								});
								/* mobile specific */
								if( $.get3wmlBrowserIsMobile() ) {
									$(playerTrackNode).bind("canplaythrough", function(e) {
										var oid = $(playerTrackNode).data("oid");
										if( $(playerTrackNode).data("clockMobileUnlock") !== true ) {
											clock.mountRegistered(oid);
											$(playerTrackNode).data("clockMobileUnlock", true);
											$(playerTrackNode).trigger("seeked");
										}
									});
									$(playerTrackNode).bind("play", function(e) {
										var oid = $(playerTrackNode).data("oid");
										if( $(playerTrackNode).data("clockMobileUnlock") !== true ) {
											$(playerTrackNode).get(0).pause();
											$(playerTrackNode).hide();
											$(playerTrackNode).removeAttr("controls");
										}
									});
								}
								/* mobile specific */
								break;
							default:
								return false;
								break;
						}
						clock["registered"].push(oid)
						return true;
					},
					unregister: function(oid) {
						if( typeof(oid) == "number" && oid > 0 ) {
							if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
								$.log("unregister failed, oid not booted");
								return false;
							}
							var s = $.inArray(oid, clock["registered"]);
							if( $.inArray(oid, clock["registered"]) == -1 ) {
								$.log("unregister failed, oid not registered");
								return false;
							}
							clock.useekRegistered(oid);
							clock.umountRegistered(oid);
							clock["registered"].splice(s, 1);
							// TODO, case for mobile mobileRegisterLock: false
						} else {
							clock["seeking"] = [];
							clock["mounted"] = [];
							clock["registered"] = [];
							clock["mobileRegisterLock"] = false;
						}
						return true;
					},
					showStats: function(oid, e) {
						if( typeof(oid) != "number" || oid < 1 ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var cs = $(playerTrackNode).get(0).currentSrc;
						var mts = $.getMicrotime();
						var ts = $.getTimestamp();
						var date = new Date(mts);
						var td = date.toTimeString();
						var ns = 0;
						if( typeof($(playerTrackNode).get(0)) != "undefined" ) {
							ns = clock.nslist[$(playerTrackNode).get(0).networkState];
						}
						var rs = 0;
						if( typeof($(playerTrackNode).get(0)) != "undefined" ) {
							rs = clock.rslist[$(playerTrackNode).get(0).readyState];
						}
						var s = [e["type"],td,mts,"networkState: "+ns,"readyState: "+rs,"currentSrc: "+cs].join(" | ");
						$.log(s);
					}
				});
				return $(core).data("clock");
			},
			getClock: function() {
				return $(core).data("clock");
			},
			// END Clock ^^^----------------------------------------------------------^^^
			
			// BEGIN Injector vvv--------------------------------------------------------vvv
			setInjector: function() {
				$(core).data("injector", {
					// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ROOT-LEVEL OBJECTS ANONYMOUS METHODS
					validate_effect: function(effect, zIndex) {
						var imfx = {
							"name": "fade",
							"duration": 0,
							"options": {}
						};
						if( typeof(effect) != "object" ) {
							return imfx;
						}
						if( typeof(effect["name"]) != "string" || effect["name"] == "" ) {
							return imfx;
						}
						imfx["name"] = effect["name"];
						if( typeof(effect["duration"]) != "number" || effect["duration"] < 0 ) {
							return imfx;
						}
						imfx["duration"] = effect["duration"];
						if( typeof(effect["options"]) != "object" ) {
							return imfx;
						}
						imfx["options"] = effect["options"];
						imfx["options"]["zIndex"] = zIndex+render["metrics"]["screenZindex"]; // explode (libHack) zIndex correction
						return imfx;
					},
					// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- RAW
					show_edit_raw: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var img = $(playerTrackNode).append('<img/>').children().last();
						$(img).bind("load", function(e) {
							$(img).unbind("load");
							$(playerTrackNode).show();
							if( tid !== false ) {
								$(core).trigger(tid, [true]);
							}
						});
						$(img).attr("src", im["data"]["thumbnail_url"]);
						return playerTrackNode;
					},
					hide_edit_raw: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						$(playerTrackNode).hide();
						$(playerTrackNode).find("*").remove();
						if( tid !== false ) {
							$(core).trigger(tid, [true]);
						}
						return playerTrackNode;
					},
					show_preview_raw: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var imfx = injector.validate_effect();
						if( fx ) {
							imfx = injector.validate_effect(im["startEffect"], im["startZindex"]);
						}
						$(playerTrackNode).data("showHandler", function(clockHandler) {
							$(playerTrackNode).show(imfx["name"], imfx["options"], imfx["duration"], function() {
								if( typeof(clockHandler) == "function" ) {
									clockHandler();
								}
								if( tid !== false ) {
									$(core).trigger(tid, [true]);
								}
							});
						});
						$(playerTrackNode).trigger("clockLoad");
						return playerTrackNode;
					},
					hide_preview_raw: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var imfx = injector.validate_effect();
						if( fx ) {
							imfx = injector.validate_effect(im["stopEffect"], im["startZindex"]);
						}
						$(playerTrackNode).data("hideHandler", function(clockHandler) {
							$(playerTrackNode).hide(imfx["name"], imfx["options"], imfx["duration"], function() {
								if( typeof(clockHandler) == "function" ) {
									clockHandler();
								}
								if( tid !== false ) {
									$(core).trigger(tid, [true]);
								}
							});
						});
						$(playerTrackNode).trigger("clockUnLoad");
						return playerTrackNode;
					},
					// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- BUTTON
					show_edit_button: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var button = $(playerTrackNode).append('<button/>').children().last();
						$(button).text(im["data"]["control"]);
						var family = false;
						if( typeof(im["styleMouseleave"]) == "object" ) {
							if( typeof(im["styleMouseleave"]["font-family"]) == "string" && im["styleMouseleave"]["font-family"] != "" ) {
								family = im["styleMouseleave"]["font-family"];
							}
						}
						fontface.setFamily(button, family);
						$(playerTrackNode).show();
						if( tid !== false ) {
							$(core).trigger(tid, [true]);
						}
						return playerTrackNode;
					},
					hide_edit_button: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						$(playerTrackNode).hide();
						$(playerTrackNode).find("*").remove();
						if( tid !== false ) {
							$(core).trigger(tid, [true]);
						}
						return playerTrackNode;
					},
					show_preview_button: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var imfx = injector.validate_effect();
						if( fx ) {
							imfx = injector.validate_effect(im["startEffect"], im["startZindex"]);
						}
						$(playerTrackNode).data("showHandler", function(clockHandler) {
							$(playerTrackNode).show(imfx["name"], imfx["options"], imfx["duration"], function() {
								if( typeof(clockHandler) == "function" ) {
									clockHandler();
								}
								if( tid !== false ) {
									$(core).trigger(tid, [true]);
								}
							});
						});
						$(playerTrackNode).trigger("clockLoad");
						return playerTrackNode;
					},
					hide_preview_button: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var imfx = injector.validate_effect();
						if( fx ) {
							imfx = injector.validate_effect(im["stopEffect"], im["startZindex"]);
						}
						$(playerTrackNode).data("hideHandler", function(clockHandler) {
							$(playerTrackNode).hide(imfx["name"], imfx["options"], imfx["duration"], function() {
								if( typeof(clockHandler) == "function" ) {
									clockHandler();
								}
								if( tid !== false ) {
									$(core).trigger(tid, [true]);
								}
							});
						});
						$(playerTrackNode).trigger("clockUnLoad");
						return playerTrackNode;
					},
					// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ARTICLE
					show_edit_article: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var article = $(playerTrackNode).append('<article/>').children().last();
						$(article).html(im["data"]["text"]); // check dependancy !!!
						$(playerTrackNode).show();
						if( tid !== false ) {
							$(core).trigger(tid, [true]);
						}
						return playerTrackNode;
					},
					hide_edit_article: function(oid, tid, fx) {
						injector.hide_edit_button(oid, tid, fx);
					},
					show_preview_article: function(oid, tid, fx) {
						injector.show_preview_button(oid, tid, fx);
					},
					hide_preview_article: function(oid, tid, fx) {
						injector.hide_preview_button(oid, tid, fx);
					},
					// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- IMAGE
					show_edit_image: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var img = $(playerTrackNode).append('<img/>').children().last();
						$(img).bind("load", function(e) {
							$(img).unbind("load");
							$(playerTrackNode).show();
							if( tid !== false ) {
								$(core).trigger(tid, [true]);
							}
						});
						$(img).attr("src", im["data"]["formats"][0]["url"]+'?nocache='+$.getMicrotime());
						return playerTrackNode;
					},
					hide_edit_image: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						$(playerTrackNode).hide();
						$(playerTrackNode).find("*").remove();
						if( tid !== false ) {
							$(core).trigger(tid, [true]);
						}
						return playerTrackNode;
					},
					show_preview_image: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var imfx = injector.validate_effect();
						if( fx ) {
							imfx = injector.validate_effect(im["startEffect"], im["startZindex"]);
						}
						$(playerTrackNode).data("showHandler", function(clockHandler) {
							$(playerTrackNode).show(imfx["name"], imfx["options"], imfx["duration"], function() {
								if( typeof(clockHandler) == "function" ) {
									clockHandler();
								}
								if( tid !== false ) {
									$(core).trigger(tid, [true]);
								}
							});
						});
						$(playerTrackNode).data("errorHandler", function(clockHandler) {
							$(playerTrackNode).hide();
							if( typeof(clockHandler) == "function" ) {
								clockHandler();
							}
							if( tid !== false ) {
								$(core).trigger(tid, [false]);
							}
						});
						$(playerTrackNode).trigger("clockLoad");
						return playerTrackNode;
					},
					hide_preview_image: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var imfx = injector.validate_effect();
						if( fx ) {
							imfx = injector.validate_effect(im["stopEffect"], im["startZindex"]);
						}
						$(playerTrackNode).data("hideHandler", function(clockHandler) {
							$(playerTrackNode).hide(imfx["name"], imfx["options"], imfx["duration"], function() {
								if( typeof(clockHandler) == "function" ) {
									clockHandler();
								}
								if( tid !== false ) {
									$(core).trigger(tid, [true]);
								}
							});
						});
						$(playerTrackNode).trigger("clockUnLoad");
						return playerTrackNode;
					},
					// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- VIDEO
					show_edit_video: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var img = $(playerTrackNode).append('<img/>').children().last();
						$(img).bind("load", function(e) {
							$(img).unbind("load");
							$(playerTrackNode).show();
							if( tid !== false ) {
								$(core).trigger(tid, [true]);
							}
						});
						$(img).attr("src", im["data"]["thumbnails"][0]["url"]+'?nocache='+$.getMicrotime());
						return playerTrackNode;
					},
					hide_edit_video: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						$(playerTrackNode).hide();
						$(playerTrackNode).find("*").remove();
						if( tid !== false ) {
							$(core).trigger(tid, [true]);
						}
						return playerTrackNode;
					},
					show_preview_video: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var imfx = injector.validate_effect();
						if( fx ) {
							imfx = injector.validate_effect(im["startEffect"], im["startZindex"]);
						}
						$(playerTrackNode).data("showHandler", function(clockHandler) {
							$(playerTrackNode).show(imfx["name"], imfx["options"], imfx["duration"], function() {
								if( typeof(clockHandler) == "function" ) {
									clockHandler();
								}
								if( tid !== false ) {
									$(core).trigger(tid, [true]);
								}
							});
						});
						$(playerTrackNode).data("errorHandler", function(clockHandler) {
							$(playerTrackNode).hide();
							if( typeof(clockHandler) == "function" ) {
								clockHandler();
							}
							if( tid !== false ) {
								$(core).trigger(tid, [false]);
							}
						});
						$(playerTrackNode).trigger("clockLoad");
						return playerTrackNode;
					},
					hide_preview_video: function(oid, tid, fx) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var imfx = injector.validate_effect();
						if( fx ) {
							imfx = injector.validate_effect(im["stopEffect"], im["startZindex"]);
						}
						$(playerTrackNode).data("hideHandler", function(clockHandler) {
							$(playerTrackNode).hide(imfx["name"], imfx["options"], imfx["duration"], function() {
								if( typeof(clockHandler) == "function" ) {
									clockHandler();
								}
								if( tid !== false ) {
									$(core).trigger(tid, [true]);
								}
							});
						});
						$(playerTrackNode).trigger("clockUnLoad");
						return playerTrackNode;
					},
					// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- AUDIO
					show_edit_audio: function(oid, tid, fx) {
						return injector.show_edit_video(oid, tid, fx);
					},
					hide_edit_audio: function(oid, tid, fx) {
						return injector.hide_edit_video(oid, tid, fx);
					},
					show_preview_audio: function(oid, tid, fx) {
						return injector.show_preview_video(oid, tid, fx);
					},
					hide_preview_audio: function(oid, tid, fx) {
						return injector.hide_preview_video(oid, tid, fx);
					}
				});
				return $(core).data("injector");
			},
			getInjector: function() {
				return $(core).data("injector");
			},
			// END Injector ^^^----------------------------------------------------------^^^
			
			// BEGIN Nabber vvv--------------------------------------------------------vvv
			setNabber: function() {
				$(core).data("nabber", {
					"headerHeight": 20,
					"registered": {},
					"origins": {},
					"reduced": [],
					"resizables": [],
					"draggables": [],
					"reduceButtons": {},
					"lockRatioButtons": {},
					"lockedRatios": [],
					"revealed": [],
					"lastRevealed": 0,
					// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ROOT-LEVEL OBJECTS ANONYMOUS METHODS
					toggleReduce: function(oid) {
						if( $.inArray(oid, nabber["reduced"]) == -1 ) {
							return nabber.reduce(oid);
						} else {
							return nabber.maximize(oid);
						}
					},
					reduce: function(oid) {
						if( typeof(nabber["registered"][oid]) != "object" ) {
							$.log("nabber.reduce failed, oid not registered");
							return false;
						}
						var s = $.inArray(oid, nabber["reduced"]);
						if( s > -1 ) {
							//$.log("nabber.reduce failed, oid already reduced"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						var nabberNode = nabber["registered"][oid];
						var playerTrackNode = render["playerTrackNodes"][oid];
						$(nabberNode).css("height", nabber["headerHeight"]+"px");
						$(playerTrackNode).css("height", nabber["headerHeight"]+"px");
						nabber.unsetResizable(oid);
						nabber["reduced"].push(oid);
						return oid;
					},
					maximize: function(oid) {
						if( typeof(nabber["registered"][oid]) != "object" ) {
							$.log("nabber.reduce failed, oid not registered");
							return false;
						}
						var s = $.inArray(oid, nabber["reduced"]);
						if( s == -1 ) {
							//$.log("nabber.maximize failed, oid not reduced"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						var nabberNode = nabber["registered"][oid];
						var playerTrackNode = render["playerTrackNodes"][oid];
						$(nabberNode).css("height", nabber["origins"][oid]["height"]+"px");
						$(playerTrackNode).css("height", nabber["origins"][oid]["height"]+"px");
						nabber["reduced"].splice(s, 1);
						nabber.setResizable(oid); // after splice !!!
						return oid;
					},
					reveal: function(oid) {
						if( render["mode"] != "edit" ) {
							return false; // %%% §§§ %%% //
						}
						if( typeof(nabber["registered"][oid]) != "object" ) {
							$.log("nabber.reveal failed, oid not registered");
							return false;
						}
						var s = $.inArray(oid, nabber["revealed"]);
						if( s > -1 ) {
							//$.log("nabber.reveal failed, oid already revealed"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						var nabberNode = nabber["registered"][oid];
						var playerTrackNode = render["playerTrackNodes"][oid];
						nabber.setResizable(oid);
						nabber.setDraggable(oid);
						$(nabberNode).show();
						nabber["revealed"].push(oid);
						nabber["lastRevealed"] = oid;
						return oid;
					},
					mask: function(oid) {
						if( typeof(nabber["registered"][oid]) != "object" ) {
							$.log("nabber.mask failed, oid not registered");
							return false;
						}
						var s = $.inArray(oid, nabber["revealed"]);
						if( s == -1 ) {
							//$.log("nabber.mask failed, oid not revealed yet"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						var nabberNode = nabber["registered"][oid];
						var playerTrackNode = render["playerTrackNodes"][oid];
						nabber.unsetResizable(oid);
						nabber.unsetDraggable(oid);
						$(nabberNode).hide();
						nabber["revealed"].splice(s, 1);
						return oid;
					},
					toggleLockRatio: function(oid) {
						if( $.inArray(oid, nabber["lockedRatios"]) == -1 ) {
							return nabber.lockRatio(oid);
						} else {
							return nabber.unlockRatio(oid);
						}
					},
					lockRatio: function(oid) {
						if( typeof(nabber["registered"][oid]) != "object" ) {
							$.log("nabber.lockRatio failed, oid not registered");
							return false;
						}
						var nabberNode = nabber["registered"][oid];
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var s = $.inArray(oid, nabber["lockedRatios"]);
						if( s > -1 ) {
							//$.log("nabber.lockRatio failed, oid already locked"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						$(nabberNode).resizable("option", "aspectRatio", im["startWidth"]/im["startHeight"]); // http://bugs.jqueryui.com/ticket/4186
						nabber["lockedRatios"].push(oid);
						return true;
					},
					unlockRatio: function(oid) {
						if( typeof(nabber["registered"][oid]) != "object" ) {
							$.log("nabber.unlockRatio failed, oid not registered");
							return false;
						}
						var nabberNode = nabber["registered"][oid];
						var playerTrackNode = render["playerTrackNodes"][oid];
						var s = $.inArray(oid, nabber["lockedRatios"]);
						if( s == -1 ) {
							//$.log("nabber.unlockRatio failed, oid not locked"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						$(nabberNode).resizable("option", "aspectRatio", false); // http://bugs.jqueryui.com/ticket/4186
						nabber["lockedRatios"].splice(s, 1);
						return true;
					},
					setResizable: function(oid) {
						if( typeof(nabber["registered"][oid]) != "object" ) {
							$.log("nabber.setResizable failed, oid not registered");
							return false;
						}
						var nabberNode = nabber["registered"][oid];
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var ed = $(playerTrackNode).data("editDiff");
						if( typeof(ed) == "undefined" ) { // temp, void errors on shitty tracks
							var ed = [0,0];
						}
						var _species = $(playerTrackNode).data("species");
						var s = $.inArray(oid, nabber["reduced"]);
						if( s > -1 ) {
							//$.log("nabber.setResizable failed, oid is reduced"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						$(nabber["lockRatioButtons"][oid]).button("enable");
						var s = $.inArray(oid, nabber["resizables"]);
						if( s > -1 ) {
							//$.log("nabber.setResizable failed, oid already resizable"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						var aspectRatio = (im["startWidth"]+ed[0])/(im["startHeight"]+ed[1]);
						$(playerTrackNode).addClass("alsoResize"+oid);
						$(playerTrackNode).children(":first").addClass("alsoResize"+oid);
						$(nabberNode).resizable({
							"alsoResize": ".alsoResize"+oid,
							"aspectRatio": aspectRatio, // http://bugs.jqueryui.com/ticket/4186
							"handles": "e,s,se",
							start: function(e, ui) {
								$.handlerForceBlur();
							},
							resize: function(e, ui) {
								// nothing to do ...
							},
							stop: function(e, ui) {
								$(playerTrackNode).hide();
								var im = $(playerTrackNode).data("injectorMetadata");
								var startWidth = (ui["size"]["width"]/render["metrics"]["screenRatio"])-ed[0];
								if( startWidth < 10 ) {
									startWidth = 10;
								}
								var startHeight = (ui["size"]["height"]/render["metrics"]["screenRatio"])-ed[1];
								if( startHeight < 10 ) {
									startHeight = 10;
								}
								var odata = {
									"startWidth": startWidth,
									"startHeight": startHeight
								};
								nabber.unregister(oid);
								$.handlerActivityEdit(im["osid"], "track", odata, true, false);
							}
						});
						nabber["resizables"].push(oid);
						return true;
					},
					unsetResizable: function(oid) {
						if( typeof(nabber["registered"][oid]) != "object" ) {
							$.log("nabber.unsetResizable failed, oid not registered");
							return false;
						}
						var nabberNode = nabber["registered"][oid];
						var playerTrackNode = render["playerTrackNodes"][oid];
						var s = $.inArray(oid, nabber["resizables"]);
						if( s == -1 ) {
							//$.log("nabber.unsetResizable failed, oid not resizable"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						$(nabber["lockRatioButtons"][oid]).button("disable");
						$(playerTrackNode).removeClass("alsoResize"+oid);
						$(playerTrackNode).children(":first").removeClass("alsoResize"+oid);
						$(nabberNode).resizable("destroy");
						nabber["resizables"].splice(s, 1);
						return true;
					},
					setDraggable: function(oid) {
						if( typeof(nabber["registered"][oid]) != "object" ) {
							$.log("nabber.setDraggable failed, oid not registered");
							return false;
						}
						var nabberNode = nabber["registered"][oid];
						var playerTrackNode = render["playerTrackNodes"][oid];
						var s = $.inArray(oid, nabber["draggables"]);
						if( s > -1 ) {
							//$.log("nabber.setDraggable failed, oid already draggable"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						$(nabberNode).draggable({
							"helper": "clone",
							"cursor": "move",
							"revert": false,
							start: function(e, ui) {
								$.handlerForceBlur();
							},
							drag: function(e, ui) {
								// nothing to do ...
							},
							stop: function(e, ui) {
								$(playerTrackNode).hide();
								var im = $(playerTrackNode).data("injectorMetadata");
								var startTop = (ui["offset"]["top"]-render["metrics"]["screenTop"])/render["metrics"]["screenRatio"];
								if( startTop < 0 ) {
									startTop = 0;
								}
								var startLeft = (ui["offset"]["left"]-render["metrics"]["screenLeft"])/render["metrics"]["screenRatio"];
								if( startLeft < 0 ) {
									startLeft = 0;
								}
								var odata = {
									"startTop": startTop,
									"startLeft": startLeft
								};
								nabber.unregister(oid);
								$.handlerActivityEdit(im["osid"], "track", odata, true, false);
							}
						});
						nabber["draggables"].push(oid);
						return true;
					},
					unsetDraggable: function(oid) {
						if( typeof(nabber["registered"][oid]) != "object" ) {
							$.log("nabber.unsetDraggable failed, oid not registered");
							return false;
						}
						var nabberNode = nabber["registered"][oid];
						var playerTrackNode = render["playerTrackNodes"][oid];
						var s = $.inArray(oid, nabber["draggables"]);
						if( s == -1 ) {
							//$.log("nabber.unsetDraggable failed, oid not draggable"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						$(nabberNode).draggable("destroy");
						nabber["draggables"].splice(s, 1);
						return true;
					},
					register: function(oid) {
						if( render["mode"] != "edit" ) {
							return false; // %%% §§§ %%% //
						}
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("nabber.register failed, oid not booted");
							return false;
						}
						if( typeof(nabber["registered"][oid]) == "object" ) {
							$.log("nabber.register failed, oid already registered");
							return false;
						}
						if( $.count(formfield) < 1 ) {
							formfield = $.getFormfield(); // WARNING, declare sub elements like this to feed the root scope property of the class
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var _species = $(playerTrackNode).data("species");
						var nabberNode = $(playerTrackNode).parent().append('<li/>').children().last();
						$(nabberNode).addClass("gui-3wml-drawer-screen-nabber");
						$(nabberNode).addClass(_species);
						var origin = {
							"background": "transparent",
							"position": "absolute",
							"top": $(playerTrackNode).offset()["top"],
							"left": $(playerTrackNode).offset()["left"],
							"width": $(playerTrackNode).width(),
							"height": $(playerTrackNode).height(),
							"z-index": $(playerTrackNode).css("z-index")
						}
						$(nabberNode).css({
							"background": origin["background"],
							"opacity": .9,
							"position": origin["position"],
							"top": origin["top"]+"px",
							"left": origin["left"]+"px",
							"width": origin["width"]+"px",
							"height": origin["height"]+"px",
							"z-index": origin["z-index"]
						});
						nabber["origins"][oid] = origin;
						$(playerTrackNode).bind("click", function(e) {
							$.playerSelectTrack(oid);
						});
						// HEADER ..................................................................................................
						var nabberHeaderNode = $(nabberNode).append('<div/>').children().last();
						$(nabberHeaderNode).addClass("gui-3wml-drawer-screen-nabber-header");
						$(nabberHeaderNode).addClass("ui-widget-header ui-corner-all");
						$(nabberHeaderNode).css({
							"width": "100%",
							"height": nabber["headerHeight"]+"px"
						});
						// osid
						var nabberOsidNode = $(nabberHeaderNode).append('<div/>').children().last();
						$(nabberOsidNode).addClass("gui-3wml-drawer-screen-nabber-osid");
						$(nabberOsidNode).text($.shortenText(im["osid"], 10, true));
						// edit
						var nabberEditNode = $(nabberHeaderNode).append('<div/>').children().last();
						$(nabberEditNode).addClass("gui-3wml-drawer-screen-nabber-edit");
						var dataOptions = {
							"dataMode": _species,
							"text": false,
							"icons": {
								"primary": "ui-icon-search"
							}
						};
						formfield.register(nabberEditNode, im["osid"], im["oname"], "data", "gui-3wml-drawer-screen-nabber-edit-"+oid, true, dataOptions); // %% %% %% %% %% %% %% %% %% <-:)
						// delete
						var nabberDeleteNode = $(nabberHeaderNode).append('<div/>').children().last();
						$(nabberDeleteNode).addClass("gui-3wml-drawer-screen-nabber-delete");
						var nabberDeleteButton = $(nabberDeleteNode).append('<button/>').children().last();
						$(nabberDeleteButton).button({text:false,icons:{primary:"ui-icon-trash"}});
						$(nabberDeleteButton).bind("click", function(e) {
							$.handlerActivityDelete(im["osid"], im["oname"], false);
							return false;
						});
						// lockRatio
						var nabberLockRatioNode = $(nabberHeaderNode).append('<div/>').children().last();
						$(nabberLockRatioNode).addClass("gui-3wml-drawer-screen-nabber-lockRatio");
						if( _species == "video" || _species == "audio" ) {
							var nabberLockRatioButton = $(nabberLockRatioNode).append('<button/>').children().last();
							$(nabberLockRatioButton).button({text:false,icons:{primary:"ui-icon-locked"}});
							$(nabberLockRatioButton).button("disable");
						} else {
							var nabberLockRatioButton = $(nabberLockRatioNode).append('<button/>').children().last();
							$(nabberLockRatioButton).button({text:false,icons:{primary:"ui-icon-locked"}});
							$(nabberLockRatioButton).bind("click", function(e) {
								nabber.toggleLockRatio(oid);
								var o;
								if( $.inArray(oid, nabber["lockedRatios"]) > -1 ) {
									o = {text:false,icons:{primary:"ui-icon-locked"}};
								} else {
									o = {text:false,icons:{primary:"ui-icon-unlocked"}};
								}
								$(nabberLockRatioButton).button("option", o);
							});
							nabber["lockRatioButtons"][oid] = nabberLockRatioButton;
						}
						// reduce
						var nabberReduceNode = $(nabberHeaderNode).append('<div/>').children().last();
						$(nabberReduceNode).addClass("gui-3wml-drawer-screen-nabber-reduce");
						var nabberReduceButton = $(nabberReduceNode).append('<button/>').children().last();
						$(nabberReduceButton).button({text:false,icons:{primary:"ui-icon-triangle-1-s"}});
						$(nabberReduceButton).bind("click", function(e) {
							nabber.toggleReduce(oid);
							var o;
							if( $.inArray(oid, nabber["reduced"]) == -1 ) {
								o = {text:false,icons:{primary:"ui-icon-triangle-1-s"}};
							} else {
								o = {text:false,icons:{primary:"ui-icon-triangle-1-n"}};
							}
							$(nabberReduceButton).button("option", o);
						});
						nabber["reduceButtons"][oid] = nabberReduceButton;
						// END .....................................................................................................
						$(nabberNode).hide();
						nabber["registered"][oid] = nabberNode;
						nabber.lockRatio(oid);
						return nabberNode;
					},
					upregister: function(oid, extHandler) {
						if( render["mode"] != "edit" ) {
							return false; // %%% §§§ %%% //
						}
						var reduced = false;
						if( typeof(nabber["registered"][oid]) == "object" ) {
							var s = $.inArray(oid, nabber["reduced"]);
							if( s > -1 ) {
								reduced = true;
							}
							nabber.unregister(oid);
						}
						if( typeof(extHandler) == "function" ) {
							extHandler();
						}
						nabber.register(oid);
						if( nabber["lastRevealed"] == oid ) {
							nabber.reveal(oid);
						}
						if( reduced ) {
							nabber.reduce(oid);
						}
						return true;
					},
					unregisterAll: function() {
						$.each(nabber["registered"], function(oid, nabberNode) {
							oid = parseInt(oid);
							nabber.unregister(oid);
						});
						return true;
					},
					unregister: function(oid) {
						if( typeof(nabber["registered"][oid]) != "object" ) {
							//$.log("nabber.unregister failed, oid not registered"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						formfield.unregister("gui-3wml-drawer-screen-nabber-edit-"+oid);
						var nabberNode = nabber["registered"][oid];
						$(nabberNode).remove();
						nabber.maximize(oid);
						nabber.mask(oid);
						delete nabber["lockRatioButtons"][oid];
						delete nabber["reduceButtons"][oid];
						delete nabber["origins"][oid];
						delete nabber["registered"][oid];
						return true;
					}
				});
				return $(core).data("nabber");
			},
			getNabber: function() {
				return $(core).data("nabber");
			},
			// END Nabber ^^^----------------------------------------------------------^^^
			
			// BEGIN Render vvv--------------------------------------------------------vvv
			setRender: function() {
				$(core).data("render", {
					"status": false,
					"playerNode": false,
					"mode": "empty",
					"metrics": {},
					"ctHandler": false,
					"playerTrackNodes": {},
					"playerNabberNodes": {},
					"playerTrackSpecies": ["button","article","image","video","audio","raw"],
					// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ROOT-LEVEL OBJECTS ANONYMOUS METHODS
					fitResize: function(maxWidth, maxHeight, eWidth, eHeight, noUpscale) {
						var rWidth = maxWidth;
						var rHeight = maxHeight;
						var rScale = 1;
						var rRef = "";
						var rRatio = rWidth/rHeight;
						var eRatio = eWidth/eHeight;
						if( rRatio > eRatio) {
							rWidth = rHeight*eRatio;
							rScale = rWidth/eWidth;
							rRef = "height";
						} else {
							rHeight = rWidth/eRatio;
							rScale = rHeight/eHeight;
							rRef = "width";
						}
						if( noUpscale === true && eWidth <= maxWidth && eHeight <= maxHeight && rScale >= 1 ) {
							return [eWidth,eHeight,rRef,1];
						} else {
							return [rWidth,rHeight,rRef,rScale];
						}
					},
					queryEnv: function(envName) {
						var envVal;
						if( typeof(envName) != "string" || envName == "" ) {
							return envVal;
						}
						$.each(render, function(k,v) {
							if( typeof(v) == "function" ) {
								return true;
							}
							if( k == envName ) {
								envVal = v;
								return false;
							}
						});
						return envVal;
					},
					getPlayerTrackNodes: function(oid) {
						if( render["status"] === false ) {
							$.log("render.getPlayerTrackNodes failed, render is not ready");
							return false;
						}
						if( typeof(oid) != "number" || oid < 1 ) {
							return render["playerTrackNodes"];
						} else {
							if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
								$.log("render.getPlayerTrackNodes failed, oid ("+oid+") not found");
								return false;
							}
							return render["playerTrackNodes"][oid];
						}
					},
					spatializeScreen: function() {
						if( typeof(render["playerNode"]) != "object" ) {
							$.log("render.spatializeScreen failed, playerNode not booted");
							return false;
						}
						var lockerNode = $("#gui-3wml-player-widescreen-locker");
						if( lockerNode.length == 0 ) {
							lockerNode = $("body").append('<div/>').children().last();
							$(lockerNode).attr("id", "gui-3wml-player-widescreen-locker");
							$(lockerNode).hide();
						}
						if( typeof($("body").data("overflow")) != "string" ) { // only the first time !!!
							$("body").data("overflow", $("body").css("overflow"));
						}
						if( typeof($("body").data("scrollTop")) != "number" ) {
							$("body").data("scrollTop", $("body").scrollTop());
						} else {
							if( $("body").css("overflow") != "hidden" ) { // one shot late and stop if contentScreenSize goes to true ...
								$("body").data("scrollTop", $("body").scrollTop());
							}
						}
						if( typeof($("body").data("scrollLeft")) != "number" ) {
							$("body").data("scrollLeft", $("body").scrollLeft());
						} else {
							if( $("body").css("overflow") != "hidden" ) { // one shot late and stop if contentScreenSize goes to true ...
								$("body").data("scrollLeft", $("body").scrollLeft());
							}
						}
						if( render["metrics"]["contentScreenSize"] === true ) {
							$("body").scrollTop(0);
							$("body").scrollLeft(0);
							$("body").css("overflow", "hidden");
							$(lockerNode).css({
								"position": "absolute",
								"top": 0,
								"left": 0,
								"background": "#000000",
								"width": $(window).width()+"px",
								"height": $(window).height()+"px",
								"z-index": render["metrics"]["screenZindex"]-1
							});
							$(lockerNode).show();
						} else {
							$("body").css("overflow", $("body").data("overflow"));
							$("body").scrollTop($("body").data("scrollTop"));
							$("body").scrollLeft($("body").data("scrollLeft"));
							$(lockerNode).hide();
						}
						$(render["playerNode"]).css({
							"position": render["metrics"]["screenPosition"],
							//"top": render["metrics"]["screenTop"]+"px",
							//"left": render["metrics"]["screenLeft"]+"px",
							"top": (render["metrics"]["screenTop"]+render["metrics"]["screenCenterTop"])+"px",
							"left": (render["metrics"]["screenLeft"]+render["metrics"]["screenCenterLeft"])+"px",
							"width": render["metrics"]["screenWidth"]+"px",
							"height": render["metrics"]["screenHeight"]+"px",
							"z-index": render["metrics"]["screenZindex"]
						});
						if( render["mode"] == "edit" ) {
							$(render["playerNode"]).parent().children("style").remove();
							var checkerboardNode = $(render["playerNode"]).parent().prepend('<style type="text/css"/>').children().first();
							var sW = 20*render["metrics"]["screenRatio"]; // TODO, plug to a global _3WML var ........................................................................ %%%
							var cL = ["#EEEEEE","#FFFFFF"];
							var checkerboard = [
								".gui-3wml-drawer-screen .checkerboard {",
								"background-color: "+cL[1]+";",
								"background-image: none;",
								"background-image: -moz-linear-gradient(45deg, "+cL[0]+" 25%, transparent 25%, transparent 75%, "+cL[0]+" 75%, "+cL[0]+"),-moz-linear-gradient(45deg, "+cL[0]+" 25%, transparent 25%, transparent 75%, "+cL[0]+" 75%, "+cL[0]+");",
								"background-image: -webkit-linear-gradient(45deg, "+cL[0]+" 25%, transparent 25%, transparent 75%, "+cL[0]+" 75%, "+cL[0]+"),-webkit-linear-gradient(45deg, "+cL[0]+" 25%, transparent 25%, transparent 75%, "+cL[0]+" 75%, "+cL[0]+");",
								"background-image: -o-linear-gradient(45deg, "+cL[0]+" 25%, transparent 25%, transparent 75%, "+cL[0]+" 75%, "+cL[0]+"),-o-linear-gradient(45deg, "+cL[0]+" 25%, transparent 25%, transparent 75%, "+cL[0]+" 75%, "+cL[0]+");",
								"background-image: -ms-linear-gradient(45deg, "+cL[0]+" 25%, transparent 25%, transparent 75%, "+cL[0]+" 75%, "+cL[0]+"),-ms-linear-gradient(45deg, "+cL[0]+" 25%, transparent 25%, transparent 75%, "+cL[0]+" 75%, "+cL[0]+");",
								"background-size: "+(sW*2)+"px "+(sW*2)+"px;",
								"background-position: 0 0, "+sW+"px "+sW+"px",
								"}"
							];
							$(checkerboardNode).text(checkerboard.join(""));
							$(render["playerNode"]).addClass("checkerboard");
						}
						else if( render["mode"] == "preview" ) {
							$(render["playerNode"]).parent().children("style").remove();
							$(render["playerNode"]).removeClass("checkerboard");
						}
						return true;
					},
					spatializeTracks: function() {
						if( render["mode"] == "edit" ) {
							$.each(render["playerTrackNodes"], function(k,v) {
								if( $(v).data("visible") !== true ) {
									nabber.unregister(oid);
									return true;
								}
								var oid = parseInt(k);
								nabber.upregister(oid, function() {
									render.spatializeTrack(oid);
								});
							});
						}
						else if( render["mode"] == "preview" ) {
							$.each(render["playerTrackNodes"], function(k,v) {
								var oid = parseInt(k);
								render.spatializeTrack(oid);
							});
						}
						return true;
					},
					spatializeTrack: function(oid) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("render.spatializeTrack failed, oid not booted");
							return false;
						}
						var im = $(render["playerTrackNodes"][oid]).data("injectorMetadata");
						$(render["playerTrackNodes"][oid]).css({
							"position": "absolute",
							//"top": (render["metrics"]["screenTop"]+(im["startTop"]*render["metrics"]["screenRatio"]))+"px",
							//"left": (render["metrics"]["screenLeft"]+(im["startLeft"]*render["metrics"]["screenRatio"]))+"px",
							"top": (render["metrics"]["screenTop"]+/*render["metrics"]["screenCenterTop"]+*/(im["startTop"]*render["metrics"]["screenRatio"]))+"px",
							"left": (render["metrics"]["screenLeft"]+/*render["metrics"]["screenCenterLeft"]+*/(im["startLeft"]*render["metrics"]["screenRatio"]))+"px",
							"width": (im["startWidth"]*render["metrics"]["screenRatio"])+"px",
							"height": (im["startHeight"]*render["metrics"]["screenRatio"])+"px",
							"z-index": im["startZindex"]+render["metrics"]["screenZindex"]
						});
						// cross reference with css mouseleave (== defaults!!!) that deal with "spatial system" [(:->] ===|---------------
						//$(render["playerTrackNodes"][oid]).trigger("mouseleave"); // too large !!!
						render.triggerTrackListener(oid, "mouseleave", "styleMouseleave"); 
						return true
					},
					eventizeTrack: function(oid) {
						if( standalone !== true ) {
							$.log("render.eventizeTrack failed, available only in standalone");
							return false;
						}
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("render.eventizeTrack failed, oid not booted");
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var __exec = function(eN, eO, eT) { // eN: eventName, eO: eventOptions, eT: eventType
							switch( eN ) {
								case "link":
									if( typeof(eO["href"]) != "string" || eO["href"] == "" ) {
										return false;
									}
									if( typeof(eO["target"]) != "string" || eO["target"] == "" ) {
										return false;
									}
									window.open(eO["href"], eO["target"]);
									break;
								case "goto":
									if( typeof(eO["cuetime"]) != "number" || eO["cuetime"] < 0 ) {
										return false;
									}
									if( typeof(eO["sequence_oid"]) != "number" || eO["sequence_oid"] < 1 ) {
										return false;
									}
									if( scrub["pointers"]["sequence"] == eO["sequence_oid"] ) {
										$.playerTransport("cue", eO["cuetime"]);
									} else {
										$.playerInitSequence(false, eO["cuetime"], eO["sequence_oid"]);
									}
									break;
								case "show":
								case "hide":
									if( typeof(eO["track_oids"]) != "object" ) {
										return false;
									}
									if( typeof(eO["track_oids"].length) != "number" ) {
										return false;
									}
									if( typeof(eO["track_oids"].length) < 1 ) {
										return false;
									}
									if( eT == "mouseenter" || eT == "mouseleave" ) {
										if( typeof(eO["ttl"]) == "number" && eO["ttl"] > 0 ) {
											var ttl = setTimeout(function() {
												$.each(eO["track_oids"], function(k, t_oid) {
													$.playerSpinTrack(t_oid, eN); // set spin action
												});
												$(playerTrackNode).data("ttl", false);
											}, eO["ttl"]);
											$(playerTrackNode).data("ttl", ttl);
										} else {
											if( typeof($(playerTrackNode).data("ttl")) == "number" && $(playerTrackNode).data("ttl") > 0 ) {
												$.each(eO["track_oids"], function(k, t_oid) {
													$(render["playerTrackNodes"][t_oid]).stop(true, true); // stop the fx queue !!!
												});
												clearTimeout($(playerTrackNode).data("ttl")); // cancel the spin action !!!
												$(playerTrackNode).data("ttl", false);
											}
											$.each(eO["track_oids"], function(k, t_oid) {
												render.addTrackListener(t_oid, "mouseenter", "eventMouseenterProxy", function(e) {
													if( eO["linkedHovering"] === true ) {
														$(playerTrackNode).trigger("mouseenter");
													} else {
														$(playerTrackNode).trigger("mouseenter", [true]);
													}
												});
												render.addTrackListener(t_oid, "mouseleave", "eventMouseleaveProxy", function(e) {
													$(playerTrackNode).trigger("mouseleave");
												});
												$.playerSpinTrack(t_oid, eN);
											});
										}
									}
									else { // click
										if( typeof($(playerTrackNode).data("ttl")) == "number" && $(playerTrackNode).data("ttl") > 0 ) {
											$.each(eO["track_oids"], function(k, t_oid) {
												$(render["playerTrackNodes"][t_oid]).stop(true, true); // stop the fx queue !!!
											});
											clearTimeout($(playerTrackNode).data("ttl")); // cancel the spin action !!!
											$(playerTrackNode).data("ttl", false);
										}
										$.each(eO["track_oids"], function(k, t_oid) {
											$.playerSpinTrack(t_oid, eN);
										});
									}
									break;
							}
							return true;
						};
						if( im["species"] == "button" ) {
							if( typeof(im["data"]["control"]) == "string" ) {
								var symbol = _3WML_CONTROL_SYMBOLS[im["data"]["control"]];
								if( typeof(symbol) == "string" && symbol != "" ) {
									var eHandler = function(e) {
										$.playerTransport(symbol);
									};
									render.addTrackListener(oid, "click", "control", eHandler);
								}
							}
						} else {
							if( typeof(im["eventClick"]["name"]) == "string" && typeof(im["eventClick"]["options"]) == "object" ) {
								var eHandler = function(e) {
									__exec(im["eventClick"]["name"], im["eventClick"]["options"], "click");
								};
								render.addTrackListener(oid, "click", "eventClick", eHandler);
							}
							if( typeof(im["eventMouseenter"]["name"]) == "string" && typeof(im["eventMouseenter"]["options"]) == "object" ) {
								var ttlValue = 0; // inject user ttl --v
								if( typeof(im["eventMouseenter"]["options"]["ttl"]) == "number" && im["eventMouseenter"]["options"]["ttl"] > 0 ) {
									ttlValue = im["eventMouseenter"]["options"]["ttl"]; // inject for duplicate mouseleave
									delete im["eventMouseenter"]["options"]["ttl"]; // strip out from original mouseenter
								}
								var eHandler = function(e) {
									__exec(im["eventMouseenter"]["name"], im["eventMouseenter"]["options"], "mouseenter");
								};
								render.addTrackListener(oid, "mouseenter", "eventMouseenter", eHandler);
								if( im["eventMouseenter"]["name"] == "show" ) {
									var eHandler = function(e) {
										im["eventMouseleave"] = {
											"name": "hide",
											"options": {
												"track_oids": im["eventMouseenter"]["options"]["track_oids"],
												"ttl": ttlValue
											}
										};
										__exec(im["eventMouseleave"]["name"], im["eventMouseleave"]["options"], "mouseleave");
									};
									render.addTrackListener(oid, "mouseleave", "eventMouseleave", eHandler);
								}
							}
						}
						return true;
					},
					stylizeTrack: function(oid) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("render.stylizeTrack failed, oid not booted");
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var im = $(playerTrackNode).data("injectorMetadata");
						var __adjust = function(k, v) {
							switch( k ) {
								case "font-size":
								case "line-height":
								case "border-width":
								case "border-top-left-radius":
								case "border-top-right-radius":
								case "border-bottom-left-radius":
								case "border-bottom-right-radius":
								case "padding-left":
								case "padding-right":
								case "padding-top":
								case "padding-bottom":
									var vN = parseInt(v);
									return (vN*render["metrics"]["screenRatio"])+"px";
									break;
								case "background-image":
									if( typeof(v) != "string" || v == "" ) {
										return "none";
									} else {
										var _I = new Image(); _I.src = v; // preoload css images !!! ===|------------------
										return "url("+v+")";
									}
									break;
								default:
									return v;
									break;
							}
						};
						if( typeof(im["styleMouseleave"]) == "object" ) {
							if( $.count(im["styleMouseleave"]) > 0 ) {
								if( render["mode"] == "edit" ) {
									if( im["species"] == "button" ) {
										var eHandler = function(e) {
											var visualNode = $(render["playerTrackNodes"][oid]).children(":first");
											$(visualNode).css({
												"width": (im["startWidth"]*render["metrics"]["screenRatio"])+"px",
												"height": (im["startHeight"]*render["metrics"]["screenRatio"])+"px"
											});
											$.each(im["styleMouseleave"], function(k,v) {
												if( k == "font-family" ) { // exclude button.font-family from here, fontface module is needed and cannot be called here !
													return true;
												}
												$(visualNode).css(k, __adjust(k, v));
											});
											// padding and border offsets
											var editDiff = [
												$(visualNode).outerWidth()-$(visualNode).width(),
												$(visualNode).outerHeight()-$(visualNode).height()
											];
											$(playerTrackNode).data("editDiff", editDiff);
											$(playerTrackNode).css({
												"width": $(visualNode).outerWidth()+"px",
												"height": $(visualNode).outerHeight()+"px"
											});
										};
									} else {
										var eHandler = function(e) {
											var visualNode = $(render["playerTrackNodes"][oid]).children(":first");
											$(visualNode).css({
												"width": (im["startWidth"]*render["metrics"]["screenRatio"])+"px",
												"height": (im["startHeight"]*render["metrics"]["screenRatio"])+"px"
											});
											$.each(im["styleMouseleave"], function(k,v) {
												$(visualNode).css(k, __adjust(k, v));
											});
											// padding and border offsets
											var editDiff = [
												$(visualNode).outerWidth()-$(visualNode).width(),
												$(visualNode).outerHeight()-$(visualNode).height()
											];
											$(playerTrackNode).data("editDiff", editDiff);
											$(playerTrackNode).css({
												"width": $(visualNode).outerWidth()+"px",
												"height": $(visualNode).outerHeight()+"px"
											});
										};
									}
								}
								else if( render["mode"] == "preview" ) {
									if( im["species"] == "button" ) {
										var eHandler = function(e) {
											$.each(im["styleMouseleave"], function(k,v) {
												if( k == "font-family" ) { // exclude button.font-family from here, fontface module is needed and cannot be called here !
													return true;
												}
												$(render["playerTrackNodes"][oid]).css(k, __adjust(k, v));
											});
										};
									} else {
										var eHandler = function(e) {
											$.each(im["styleMouseleave"], function(k,v) {
												$(render["playerTrackNodes"][oid]).css(k, __adjust(k, v));
											});
										};
									}
									
								}
								if( typeof(eHandler) == "function" ) {
									render.addTrackListener(oid, "mouseleave", "styleMouseleave", eHandler);
									eHandler(); // apply this state as default node state ...
								}
							}
						}
						if( typeof(im["styleMouseenter"]) == "object" ) {
							if( $.count(im["styleMouseenter"]) > 0 ) {
								if( render["mode"] == "edit" ) {
									if( im["species"] == "button" ) {
										var eHandler = function(e) {
											var visualNode = $(playerTrackNode).children(":first");
											$.each(im["styleMouseenter"], function(k,v) {
												if( k == "font-family" ) { // exclude button.font-family from here, fontface module is needed and cannot be called here !
													return true;
												}
												$(visualNode).css(k, __adjust(k, v));
											});
										};
									} else {
										var eHandler = function(e) {
											var visualNode = $(playerTrackNode).children(":first");
											$.each(im["styleMouseenter"], function(k,v) {
												$(visualNode).css(k, __adjust(k, v));
											});
										};
									}
								}
								else if( render["mode"] == "preview" ) {
									if( im["species"] == "button" ) {
										var eHandler = function(e) {
											$.each(im["styleMouseenter"], function(k,v) {
												if( k == "font-family" ) { // exclude button.font-family from here, fontface module is needed and cannot be called here !
													return true;
												}
												$(playerTrackNode).css(k, __adjust(k, v));
											});
										};
									} else {
										var eHandler = function(e) {
											$.each(im["styleMouseenter"], function(k,v) {
												$(playerTrackNode).css(k, __adjust(k, v));
											});
										};
									}
								}
								if( typeof(eHandler) == "function" ) {
									render.addTrackListener(oid, "mouseenter", "styleMouseenter", eHandler);
								}
							}
						}
						return true;
					},
					soundTracks: function() {
						clock.soundMountedList();
						return true;
					},
					shutdownTrackEdit: function(oid) {
						$(render["playerNode"]).children("#"+oid).remove();
						delete render["playerTrackNodes"][oid];
						return true;
					},
					bootTrackListener: function(oid) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("render.bootTrackListener failed, oid not booted");
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var nEs = ["click","mouseenter","mouseleave"];
						$.each(nEs, function(k, nE) {
							$(playerTrackNode).unbind(nE); // WARNING !!! +++++++++++++++++++++++++++
							$(playerTrackNode).data(nE, {});
							$(playerTrackNode).bind(nE, function(e, proxy) {
								$.each($(playerTrackNode).data(nE), function(eName, eHandler) {
									if( typeof(eHandler) != "function" ) {
										return true;
									}
									if( proxy === true && eName == "styleMouseenter" ) {
										return true;
									}
									eHandler(e);
								});
							});
						});
						return true;
					},
					addTrackListener: function(oid, eType, eName, eHandler) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("render.addTrackListener failed, oid not booted");
							return false;
						}
						if( typeof(eType) != "string" || eType == "" ) {
							$.log("render.addTrackListener failed, eType is not a string");
							return false;
						}
						if( typeof(eName) != "string" || eName == "" ) {
							$.log("render.addTrackListener failed, eName is not a string");
							return false;
						}
						if( typeof(eHandler) != "function" ) {
							$.log("render.addTrackListener failed, eHandler is not a function");
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var nE = $(playerTrackNode).data(eType);
						if( typeof(nE) != "object" ) {
							$.log("render.addTrackListener failed, nE is not an object");
							return false;
						}
						nE[eName] = eHandler;
						$(playerTrackNode).data(eType, nE);
						return true;
					},
					triggerTrackListener: function(oid, eType, eName) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("render.triggerTrackListener failed, oid not booted");
							return false;
						}
						if( typeof(eType) != "string" || eType == "" ) {
							$.log("render.triggerTrackListener failed, eType is not a string");
							return false;
						}
						if( typeof(eName) != "string" || eName == "" ) {
							$.log("render.triggerTrackListener failed, eName is not a string");
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var nE = $(playerTrackNode).data(eType);
						if( typeof(nE) != "object" ) {
							$.log("render.triggerTrackListener failed, nE is not an object");
							return false;
						}
						if( typeof(nE[eName]) != "function" ) {
							$.log("render.triggerTrackListener failed, nE is not an object");
							return false;
						}
						nE[eName]();
						return true;
					},
					removeTrackListener: function(oid, eType, eName) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("render.removeTrackListener failed, oid not booted");
							return false;
						}
						if( typeof(eType) != "string" || eType == "" ) {
							$.log("render.removeTrackListener failed, eType is not a string");
							return false;
						}
						if( typeof(eName) != "string" || eName == "" ) {
							$.log("render.removeTrackListener failed, eName is not a string");
							return false;
						}
						var playerTrackNode = render["playerTrackNodes"][oid];
						var nE = $(playerTrackNode).data(eType);
						if( typeof(nE) != "object" ) {
							$.log("render.addTrackListener failed, nE is not an object");
							return false;
						}
						if( typeof(nE[eName]) != "function" ) {
							$.log("render.addTrackListener failed, nE is not an object");
							return false;
						}
						delete nE[eName];
						$(playerTrackNode).data(eType, nE);
						return true;
					},
					bootTrackEdit: function(oid, spin, cuetime_s) {
						if( typeof(render["playerTrackNodes"][oid]) == "object" ) {
							//$.log("render.bootTrackEdit failed, oid already booted"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						if( typeof(render["playerNode"]) != "object" ) {
							$.log("render.bootTrackEdit failed, playerNode is not an object");
							return false;
						}
						var playerNode = render["playerNode"];
						var _species = scrub.getTrackMetadata(oid, "species");
						var _visible = scrub.getTrackMetadata(oid, "visible");
						var injectorMetadata = scrub.getTrackMetadata(oid);
						var nodeTag = '<li/>';
						var nodeName = "li";
						var playerTrackNode = $(playerNode).append(nodeTag).children().last();
						$(playerTrackNode).attr("id", oid); // used in shutdownTrackEdit
						$(playerTrackNode).data("oid", oid);
						$(playerTrackNode).data("species", _species);
						$(playerTrackNode).data("visible", _visible);
						$(playerTrackNode).data("firstSpin", false);
						$(playerTrackNode).data("spin", spin);
						$(playerTrackNode).data("cuetime", cuetime_s);
						$(playerTrackNode).data("injectorMetadata", injectorMetadata);
						$(playerTrackNode).css({
							"list-style": "none",
							"overflow": "hidden"
						});
						render["playerTrackNodes"][oid] = playerTrackNode;
						if( _visible !== true ) {
							nabber.unregister(oid);
						}
						render.bootTrackListener(oid);
						render.stylizeTrack(oid);
						$(playerTrackNode).hide();
						$.log("render.bootTrackEdit success, track ("+nodeName+")("+oid+")("+spin+")");
						return playerTrackNode;
					},
					bootTrackPreview: function(oid, spin, cuetime_s) {
						if( typeof(render["playerTrackNodes"][oid]) == "object" ) {
							//$.log("render.bootTrackPreview failed, oid already booted"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						if( typeof(render["playerNode"]) != "object" ) {
							$.log("render.bootTrackPreview failed, playerNode is not an object");
							return false;
						}
						var playerNode = render["playerNode"];
						var _species = scrub.getTrackMetadata(oid, "species");
						var _visible = scrub.getTrackMetadata(oid, "visible");
						var injectorMetadata = scrub.getTrackMetadata(oid);
						var nodeTag, nodeName;
						switch( _species ) {
							case "raw":
								nodeTag = '<div/>';
								nodeName = "div";
								break;
							case "button":
								nodeTag = '<button/>';
								nodeName = "button";
								break;
							case "article":
								nodeTag = '<article/>';
								nodeName = "article";
								break;
							case "image":
								nodeTag = '<img/>';
								nodeName = "img";
								break;
							case "video":
								nodeTag = '<video autoplay autobuffer/>';
								nodeName = "video";
								break;
							case "audio":
								nodeTag = '<audio autoplay autobuffer/>';
								nodeName = "audio";
								break;
						}
						var playerTrackNode = $(playerNode).append(nodeTag).children().last();
						$(playerTrackNode).data("oid", oid);
						$(playerTrackNode).data("species", _species);
						$(playerTrackNode).data("visible", _visible);
						$(playerTrackNode).data("firstSpin", false);
						$(playerTrackNode).data("spin", spin);
						$(playerTrackNode).data("cuetime", cuetime_s);
						$(playerTrackNode).data("overlay", false);
						$(playerTrackNode).data("injectorMetadata", injectorMetadata);
						$(playerTrackNode).css({
							"overflow": "hidden"
						});
						render["playerTrackNodes"][oid] = playerTrackNode;
						render.bootTrackListener(oid);
						clock.register(oid);
						render.eventizeTrack(oid);
						render.stylizeTrack(oid);
						render.spatializeTrack(oid);
						$(playerTrackNode).hide();
						$.log("render.bootTrackPreview success, track ("+nodeName+")("+oid+")("+spin+")");
						return playerTrackNode;
					},
					spinTrackEdit: function(oid, spin, cuetime_s) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("render.spinTrackEdit failed, oid not booted");
							return false;
						}
						var metadata = scrub.getTrackMetadata(oid);
						var playerTrackNode = render["playerTrackNodes"][oid];
						if( $(playerTrackNode).data("visible") !== true ) {
							// $.log("render.spinTrackEdit failed, oid not visible"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						$(playerTrackNode).data("cuetime", cuetime_s);
						var _spin = $(playerTrackNode).data("spin");
						if( $(playerTrackNode).data("firstSpin") === false ) {
							_spin = -1;
							$(playerTrackNode).data("firstSpin", true);
						}
						if( spin == _spin ) { // already done !!! ===|)-----------------------
							return false;
						}
						switch( spin ) {
							case 0:
								// do nothing
								break;
							case 1:
							case 2:
							case 3:
							case 4:
								if( [1,2,3,4,9].indexOf(_spin) != -1 ) { // if gui_spin was not, break !!!=|===|=!!!
									// console.log("MARK_spinTrackEdit ++++++++++++++++++++++++++++++++ [1,2,3,4]("+oid+"@"+cuetime_s+")"+_spin+"::"+spin);
									return false;
								}
								// console.log("MARK_spinIn_edit ++++++++++++++++++++++++++++++++++++++++++++++++++ ");
								$(playerTrackNode).data("spin", 2);
								$(core).trigger("spinTrackPlayer", [metadata,1]);
								var tid = render.relayToHandler(["show","edit",metadata["species"]], oid);
								$(core).bind(tid, function(e, status) {
									$(core).unbind(e["type"]);
									if( status === true ) {
										render.spatializeTrack(oid);
										nabber.upregister(oid);
										$(core).trigger("spinTrackPlayer", [metadata,3]);
										$(playerTrackNode).data("spin", 4);
									} else {
										nabber.unregister(oid);
										$(core).trigger("spinTrackPlayer", [metadata,9]);
										$(playerTrackNode).data("spin", 9);
									}
								});
								break;
							case 5:
							case 6:
							case 7:
							case 8:
								if( [5,6,7,8,9].indexOf(_spin) != -1 ) { // if gui_spin was not, break !!!=|===|=!!!
									// console.log("MARK_spinTrackEdit ++++++++++++++++++++++++++++++++ [5,6,7,8]("+oid+"@"+cuetime_s+")"+_spin+"::"+spin);
									return false;
								}
								// console.log("MARK_spinOut_edit +++++++++++++++++++++++++++++++++++++++++++++++++ ");
								$(playerTrackNode).data("spin", 6);
								$(core).trigger("spinTrackPlayer", [metadata,5]);
								var tid = render.relayToHandler(["hide","edit",metadata["species"]], oid);
								$(core).bind(tid, function(e, status) {
									$(core).unbind(e["type"]);
									if( status === true ) {
										nabber.unregister(oid);
										$(core).trigger("spinTrackPlayer", [metadata,7]);
										$(playerTrackNode).data("spin", 8);
									} else {
										nabber.unregister(oid);
										$(core).trigger("spinTrackPlayer", [metadata,9]);
										$(playerTrackNode).data("spin", 9);
									}
								});
								break;
						}
//						$.log("render.spinTrackEdit success, track ("+oid+"@"+_spin+"::"+spin+")");
						return playerTrackNode;
					},
					spinTrackPreview: function(oid, spin, cuetime_s, overlay) {
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("render.spinTrackPreview failed, oid not booted");
							return false;
						}
						var metadata = scrub.getTrackMetadata(oid);
						var playerTrackNode = render["playerTrackNodes"][oid];
						if( $(playerTrackNode).data("visible") !== true ) {
							// $.log("render.spinTrackPreview failed, oid not visible"); // flood !!! ~~~L__-~~ !!!
							return false;
						}
						$(playerTrackNode).data("cuetime", cuetime_s);
						var _spin = $(playerTrackNode).data("spin");
						if( overlay === true && [0,1,5].indexOf(_spin) > -1 ) {
							_spin = -1;
						}
						if( $(playerTrackNode).data("firstSpin") === false ) {
							_spin = -1;
							$(playerTrackNode).data("firstSpin", true);
						}
						if( spin == _spin ) { // already done !!! ===|)-----------------------
							return false;
						}
						switch( spin ) {
							case 0:
								// do nothing
								break;
							case 1:
								if( [1,2,3,4,9].indexOf(_spin) != -1 ) { // if gui_spin was ..., break !!!=|===|=!!!
									// console.log("MARK_spinTrackPreview +++ [1,2,3,4]("+oid+"@"+cuetime_s+")"+_spin+"::"+spin);
									return false;
								}
								// console.log("MARK_spinIn_preview_FX +++[1]("+oid+"@"+cuetime_s+")"+_spin+"::"+spin);
//								$(playerTrackNode).stop(true); // stop fx queue
								if( overlay === true ) {
									$(playerTrackNode).data("overlay", true);
								}
								$(playerTrackNode).data("spin", 2);
								$(core).trigger("spinTrackPlayer", [metadata,1]);
								var tid = render.relayToHandler(["show","preview",metadata["species"]], oid, true); // effect-on
								$(core).bind(tid, function(e, status) {
									$(core).unbind(e["type"]);
									if( status === true ) {
										$(core).trigger("spinTrackPlayer", [metadata,3]);
										$(playerTrackNode).data("spin", 4);
									} else {
										$(core).trigger("spinTrackPlayer", [metadata,9]);
										$(playerTrackNode).data("spin", 9);
									}
								});
								break;
							case 2:
							case 3:
							case 4:
								if( [1,2,3,4,9].indexOf(_spin) != -1 ) { // if gui_spin was ..., break !!!=|===|=!!!
									// console.log("MARK_spinTrackPreview +++ [1,2,3,4]("+oid+"@"+cuetime_s+")"+_spin+"::"+spin);
									return false;
								}
								// console.log("MARK_spinIn_preview +++ [2,3,4]("+oid+"@"+cuetime_s+")"+_spin+"::"+spin);
//								$(playerTrackNode).stop(true); // stop fx queue
								if( overlay === true ) {
									$(playerTrackNode).data("overlay", true);
								}
								$(playerTrackNode).data("spin", 2);
								$(core).trigger("spinTrackPlayer", [metadata,1]);
								var tid = render.relayToHandler(["show","preview",metadata["species"]], oid, false); // effect-off
								$(core).bind(tid, function(e, status) {
									$(core).unbind(e["type"]);
									if( status === true ) {
										$(core).trigger("spinTrackPlayer", [metadata,3]);
										$(playerTrackNode).data("spin", 4);
									} else {
										$(core).trigger("spinTrackPlayer", [metadata,9]);
										$(playerTrackNode).data("spin", 9);
									}
								});
								break;
							case 5:
								if( [5,6,7,8,9].indexOf(_spin) != -1 ) { // if gui_spin was ..., break !!!=|===|=!!!
									// console.log("MARK_spinTrackPreview +++ [5,6,7,8]("+oid+"@"+cuetime_s+")"+_spin+"::"+spin);
									return false;
								}
								// console.log("MARK_spinOut_preview_FX +++ [5]("+oid+"@"+cuetime_s+")"+_spin+"::"+spin);
//								$(playerTrackNode).stop(true); // stop fx queue
								if( overlay === true ) {
									$(playerTrackNode).data("overlay", false);
								}
								$(playerTrackNode).data("spin", 6);
								$(core).trigger("spinTrackPlayer", [metadata,5]);
								var tid = render.relayToHandler(["hide","preview",metadata["species"]], oid, true); // effect-on
								$(core).bind(tid, function(e, status) {
									$(core).unbind(e["type"]);
									if( status === true ) {
										$(core).trigger("spinTrackPlayer", [metadata,7]);
										$(playerTrackNode).data("spin", 8);
									} else {
										$(core).trigger("spinTrackPlayer", [metadata,9]);
										$(playerTrackNode).data("spin", 9);
									}
								});
								break;
							case 6:
							case 7:
							case 8:
								if( [5,6,7,8,9].indexOf(_spin) != -1 ) { // if gui_spin was ..., break !!!=|===|=!!!
									// console.log("MARK_spinTrackPreview ++++++++++++++++++++++++++++++++ [5,6,7,8]("+oid+"@"+cuetime_s+")"+_spin+"::"+spin);
									return false;
								}
								// console.log("MARK_spinOut_preview +++ [6,7,8]("+oid+"@"+cuetime_s+")"+_spin+"::"+spin);
//								$(playerTrackNode).stop(true); // stop fx queue
								if( overlay === true ) {
									$(playerTrackNode).data("overlay", false);
								}
								$(playerTrackNode).data("spin", 6);
								$(core).trigger("spinTrackPlayer", [metadata,5]);
								var tid = render.relayToHandler(["hide","preview",metadata["species"]], oid, false); // effect-off
								$(core).bind(tid, function(e, status) {
									$(core).unbind(e["type"]);
									if( status === true ) {
										$(core).trigger("spinTrackPlayer", [metadata,7]);
										$(playerTrackNode).data("spin", 8);
									} else {
										$(core).trigger("spinTrackPlayer", [metadata,9]);
										$(playerTrackNode).data("spin", 9);
									}
								});
								break;
						}
						// $.log("render.spinTrackPreview success, track ("+oid+"@"+_spin+"::"+spin+")");
						return playerTrackNode;
					},
					relayToHandler: function(relayHandlerParts, oid, fx) {
						var tid = $.getUniqId();
						setTimeout(function() {
							var relayHandler = relayHandlerParts.join("_");
							if( typeof(injector[relayHandler]) != "function" ) {
								$.log("render.relayToHandler failed, relayHandler ("+relayHandler+") is not a function");
							}
							injector[relayHandler](oid, tid, fx);
						}, _3WML_SETTIMEOUT_DEFAULT);
						return tid;
					},
					registerLoad: function(playerNode, mode, ctHandler) {
						if( typeof(playerNode) != "object" ) {
							$.log("render.registerLoad failed, playerNode is not an object");
							return false;
						}
						if( typeof(mode) != "string" || mode == "" ) {
							$.log("render.registerLoad failed, mode is not a string");
							return false;
						}
						if( typeof(ctHandler) != "function" ) {
							$.log("render.registerLoad failed, ctHandler is not a function");
							return false;
						}
						if( render["status"] === true ) {
							$.log("render.registerLoad failed, already registered");
							return false;
						}
						render["playerTrackNodes"] = {};
						$(core).bind("cuetimePlayer", function(e, cuetime_ms) {
							var cuetime_s = Math.round(cuetime_ms/1000);
							render["ctHandler"](e, cuetime_s);
							var spinList = scrub.query(cuetime_s);
							if( spinList === false ) {
								$.log("render.cuetimePlayer failed, scrub.query error");
								return false;
							}
							var bootHandler = "bootTrack";
							var spinHandler = "spinTrack";
							if( mode == "edit" || mode == "preview" ) {
								bootHandler = bootHandler+$.ucwords(mode);
								spinHandler = spinHandler+$.ucwords(mode);
							}
							else {
								$.log("render.cuetimePlayer failed, wrong mode");
								return false;
							}
							$.each(spinList, function(oid, spin) {
								render[bootHandler](parseInt(oid), spin, cuetime_s);
							});
							$.each(spinList, function(oid, spin) {
								if( $(render["playerTrackNodes"][oid]).data("overlay") === true ) {
									return true;
								}
								render[spinHandler](parseInt(oid), spin, cuetime_s);
							});
						});
						render["playerNode"] = playerNode;
						if( mode == "edit" || mode == "preview" ) {
							render["mode"] = mode;
						} else {
							render["mode"] = "empty";
						}
						render["ctHandler"] = ctHandler;
						render.initMetrics();
						render.spatializeScreen();
						render["status"] = true;
						return playerNode;
					},
					resetMetrics: function() {
						render["metrics"] = {
							"screenOriginTop": 0, // lock !!!
							"screenOriginLeft": 0, // lock !!!
							"screenOriginWidth": 0, // lock !!!
							"screenOriginHeight": 0, // lock !!!
							"screenPosition": "static",
							"screenTop": 0,
							"screenLeft": 0,
							"screenCenterTop": 0,
							"screenCenterLeft": 0,
							"screenWidth": 0,
							"screenHeight": 0,
							"screenBackground": "transparent", // lock !!!
							"screenZindex": (standalone === true ? 4000 : _3WML_ZINDEXES["gui-3wml-drawer-screen"]), // lock !!!
							"screenRatioReference": "width",
							"screenRatio": 1,
							"contentWidth": 0, // lock !!!
							"contentHeight": 0, // lock !!!
							"contentScreenSize": false,
							"contentVolume": 1,
							"contentMute": false
						};
						return render["metrics"];
					},
					initMetrics: function() {
						var screenOffset = $(render["playerNode"]).offset();
						var screenBackground = $(render["playerNode"]).css("background");
						if( standalone === true ) {
							var screenFitResize = render.fitResize(
								scrub.queryOpt("width"),
								scrub.queryOpt("height"),
								scrub.queryOpt("width"),
								scrub.queryOpt("height"),
								true
							);
						}
						else {
							var screenFitResize = render.fitResize(
								_3WML_SIZES["gui-3wml-drawer-screen"]["width"],
								_3WML_SIZES["gui-3wml-drawer-screen"]["height"],
								scrub.queryOpt("width"),
								scrub.queryOpt("height"),
								true
							);
						}
						render["metrics"] = {
							"screenOriginTop": screenOffset["top"], // lock !!!
							"screenOriginLeft": screenOffset["left"], // lock !!!
							"screenOriginWidth": screenFitResize[0], // lock !!!
							"screenOriginHeight": screenFitResize[1], // lock !!!
							"screenPosition": "static",
							"screenTop": screenOffset["top"],
							"screenLeft": screenOffset["left"],
							"screenCenterTop": 0,
							"screenCenterLeft": 0,
							"screenWidth": screenFitResize[0],
							"screenHeight": screenFitResize[1],
							"screenBackground": screenBackground, // lock !!!
							"screenZindex": (standalone === true ? 4000 : _3WML_ZINDEXES["gui-3wml-drawer-screen"]), // lock !!!
							"screenRatioReference": screenFitResize[2],
							"screenRatio": screenFitResize[3],
							"contentWidth": scrub.queryOpt("width"), // lock !!!
							"contentHeight": scrub.queryOpt("height"), // lock !!!
							"contentScreenSize": false,
							"contentVolume": 1,
							"contentMute": false
						};
						return render["metrics"];
					},
					offsetMetrics: function() {
						if( typeof(render["playerNode"]) != "object" ) {
							$.log("render.offsetMetrics failed, playerNode is not an object");
							return false;
						}
						var screenOffset = $(render["playerNode"]).offset();
						render["metrics"]["screenOriginTop"] = screenOffset["top"];
						render["metrics"]["screenOriginLeft"] = screenOffset["left"];
						return render["metrics"];
					},
					detectMetrics: function(metricsType, metricsParams) {
						if( typeof(render["playerNode"]) != "object" ) {
							$.log("render.detectMetrics failed, playerNode is not an object");
							return false;
						}
						// sound
						if( metricsType === "sound" ) {
							if( typeof(metricsParams) == "object" ) {
								if( typeof(metricsParams["contentVolume"]) == "number" ) {
									if( metricsParams["contentVolume"] < 0 ) {
										metricsParams["contentVolume"] = 0;
									}
									if( metricsParams["contentVolume"] > 1 ) {
										metricsParams["contentVolume"] = 1;
									}
									render["metrics"]["contentVolume"] = metricsParams["contentVolume"];
								}
								if( typeof(metricsParams["contentMute"]) == "boolean" ) {
									render["metrics"]["contentMute"] = metricsParams["contentMute"];
								}
							}
						}
						// spatialize
						else if( metricsType === "spatialize" ) {
							if( typeof(metricsParams) == "object" ) {
								if( metricsParams["contentScreenSize"] === true ) {
									render["metrics"]["contentScreenSize"] = true;
								} else {
									render["metrics"]["contentScreenSize"] = false;
								}
							}
							if( render["metrics"]["contentScreenSize"] === true ) {
								var windowWidth = $(window).width();
								var windowHeight = $(window).height();
								var screenFitResize = render.fitResize(
									windowWidth,
									windowHeight,
									render["metrics"]["contentWidth"],
									render["metrics"]["contentHeight"],
									false
								);
								render["metrics"]["screenPosition"] = "absolute";
								render["metrics"]["screenTop"] = 0;
								render["metrics"]["screenLeft"] = 0;
								if( render["mode"] === "preview" ) {
									render["metrics"]["screenCenterTop"] = (windowHeight-screenFitResize[1])/2;
									render["metrics"]["screenCenterLeft"] = (windowWidth-screenFitResize[0])/2;
								} else {
									render["metrics"]["screenCenterTop"] = 0;
									render["metrics"]["screenCenterLeft"] = 0;
								}
								render["metrics"]["screenWidth"] = screenFitResize[0];
								render["metrics"]["screenHeight"] = screenFitResize[1];
								render["metrics"]["screenRatioReference"] = screenFitResize[2];
								render["metrics"]["screenRatio"] = screenFitResize[3];
							} else {
								var screenFitResize = render.fitResize(
									render["metrics"]["screenOriginWidth"],
									render["metrics"]["screenOriginHeight"],
									render["metrics"]["contentWidth"],
									render["metrics"]["contentHeight"],
									true
								);
								render["metrics"]["screenPosition"] = "static";
								render["metrics"]["screenTop"] = render["metrics"]["screenOriginTop"];
								render["metrics"]["screenLeft"] = render["metrics"]["screenOriginLeft"];
								render["metrics"]["screenCenterTop"] = 0;
								render["metrics"]["screenCenterLeft"] = 0;
								render["metrics"]["screenWidth"] = screenFitResize[0];
								render["metrics"]["screenHeight"] = screenFitResize[1];
								render["metrics"]["screenRatioReference"] = screenFitResize[2];
								render["metrics"]["screenRatio"] = screenFitResize[3];
							}
						}
						return render["metrics"];
					},
					registerUpdate: function(oid) {
						if( typeof(render["playerNode"]) != "object" ) {
							$.log("render.registerUpdate failed, playerNode is not an object");
							return false;
						}
						if( typeof(render["mode"]) != "string" || render["mode"] == "" ) {
							$.log("render.registerUpdate failed, mode is not a string");
							return false;
						}
						if( typeof(render["ctHandler"]) != "function" ) {
							$.log("render.registerUpdate failed, ctHandler is not a function");
							return false;
						}
						if( render["status"] !== true ) {
							$.log("render.registerUpdate failed, not registered yet");
							return false;
						}
						if( render["mode"] !== "edit" ) {
							$.log("render.registerUpdate failed, mode must be edit");
							return false;
						}
						if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
							$.log("render.registerUpdate failed, oid is not an object");
							return false;
						}
						render.shutdownTrackEdit(oid); // should relaunch boot for this track
						return true;
					},
					unregister: function() {
						$(core).unbind("cuetimePlayer");
						render.resetMetrics();
						render["playerNode"] = false;
						render["mode"] = "empty";
						render["ctHandler"] = false;
						render["playerTrackNodes"] = {};
						render["status"] = false;
						return true;
					}
				});
				return $(core).data("render");
			},
			getRender: function() {
				return $(core).data("render");
			},
			// END Render ^^^----------------------------------------------------------^^^
			
			// BEGIN Scrub vvv--------------------------------------------------------vvv
			setScrub: function() {
				$(core).data("scrub", {
					"status": "error", // error,loading,ready
					"tree": false,
					"pointers": {},
					"chainer": {
						"chainIndex": -1,
						"chainOid": 0
					},
					"opts": {},
					"live": {},
					"spin": [],
					"collect": {
						outside: function() {
							var qid = $.getUniqId();
							scrub.collect.outside[qid] = 0;
							scrub.collect.inside[qid]++;
							queues.queue(qid, function(next) {
								$(core).trigger(qid, ["loading"]); // trigger loading
								if( typeof(scrub["tree"]) == "object" ) {
									var b_metadata = scrub["tree"];
									$(core).trigger(qid, ["ready",b_metadata]); // trigger ready
									$(core).trigger(qid, [true]); // queue ended trigger
									$.log("scrub.collect.outside qid "+qid+" buffered success");
								} else {
									var url = [
										$.rtrim(_3WML_STATIC_QUERY_URL,'/'),
										_3WML_DYNAMIC_UID,
										_3WML_DYNAMIC_OID,
										"webdocument.js"
									];
									$.ajax({
										url: url.join("/"),
										dataType: "jsonp",
										jsonpCallback: "webdocument"
									}).done(function(metadata) {
										scrub["tree"] = metadata;
										$(core).trigger(qid, ["ready",metadata]); // trigger ready
										scrub.collect.outside[qid]--;
										if( scrub.collect.outside[qid] < 1 ) {
											$(core).trigger(qid, [true]); // queue ended trigger
											$.log("scrub.collect.outside qid "+qid+" execution success");
										}
									});
								}
								next();
							});
							setTimeout(function() {
								queues.dequeue(qid);
							}, _3WML_SETTIMEOUT_DEFAULT);
							$.log("scrub.collect.outside qid "+qid+" stack success");
							return qid;
						},
						inside: function(blast) {
							var qid = $.getUniqId();
							scrub.collect.inside[qid] = 0;
							$.each(blast, function(k,v) {
								scrub.collect.inside[qid]++;
								queues.queue(qid, function(next) {
									$(core).trigger(qid, ["loading",v]); // trigger loading
									$(core).bind(grid.refreshObject(v["osid"], v["oname"]), function(e, success, r, osid, oname) {
										if( success === false ) {
											$(core).trigger(qid, ["error",v]); // singleton trigger error
											$.log("scrub.collect.inside failed, actionOpen error");
											return false;
										}
										var metadata = grid.showObject(osid, oname);
										if( metadata === false ) {
											$(core).trigger(qid, ["error",v]); // trigger error
											$.log("scrub.collect.inside failed, showObject error");
											return false;
										}
										$(core).trigger(qid, ["ready",v,metadata]); // trigger ready
										scrub.collect.inside[qid]--;
										if( scrub.collect.inside[qid] < 1 ) {
											$(core).trigger(qid, [true]); // queue ended trigger
											$.log("scrub.collect.inside qid "+qid+" execution success");
										}
									});
									next();
								});
							});
							setTimeout(function() {
								queues.dequeue(qid);
							}, _3WML_SETTIMEOUT_DEFAULT);
							$.log("scrub.collect.inside qid "+qid+" stack success");
							return qid;
						}
					},
					// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ROOT-LEVEL OBJECTS ANONYMOUS METHODS
					reset: function() {
						if( scrub["status"] === "loading" ) {
							$.log("scrub.reset failed, cannot reset while loading, come back later");
							return false;
						}
						scrub["pointers"] = {
							"webdocument": 0, // the webdocument oid
							"sequence": 0, // the sequence oid
							"track": [] // the track oid's that belogs to the sequence -^
						};
						scrub["live"] = {
							"webdocument": {},
							"sequence": {},
							"track": {}
						};
						scrub["spin"] = [];
						scrub["status"] = "error";
					},
					blastload: function() {
						if( scrub["status"] === "loading" ) {
							$.log("scrub.blastload failed, already loading");
							return false;
						}
						var handlers = {};
						handlers.outside = function(sid) {
							var qid = scrub.collect.outside();
							if( qid === false ) {
								scrub["status"] = "error";
								$.log("scrub.blastload failed, __collect error");
								return false;
							}
							$(core).bind(qid, function(e, status, metadata) {
								if( status === "loading" ) {
									scrub["status"] = "loading";
									$(core).trigger(sid, ["loading"]);
								}
								else if( status === "error" ) {
									scrub["status"] = "error";
									$(core).trigger(sid, ["error"]);
								}
								else if( status === "ready" ) {
									var chainOid = $.playerInitSequence["sequence_oid"];
									var realOids = [];
									$.each(metadata["children"], function(k,v) {
										realOids.push(v["oid"]);
									});
									$.each(metadata["chain"], function(k,v) {
										if( $.inArray(v, realOids) == -1 ) {
											metadata["chain"].splice(k, 1); // clean chain from non existing sequences
										}
									});
									if( metadata["chain"].length < 1 ) {
										metadata["chain"] = realOids;
									}
									if( metadata["chain"].length > 0 ) {
										if( typeof(chainOid) == "number" && chainOid > 0 ) {
											var cci = -1;
											var ccis = [];
											var ccos = [];
											$.each(metadata["chain"], function(cIndex,cOid) {
												if( chainOid == cOid ) {
													ccis.push(cIndex);
													ccos.push(cOid);
													if( cIndex >= scrub["chainer"]["chainIndex"] ) {
														cci = cIndex;
													}
												}
												
											});
											if( cci > -1 ) {
												scrub["chainer"]["chainIndex"] = cci;
												scrub["chainer"]["chainOid"] = ccos[ccis.indexOf(cci)];
											}
											else if( ccis.length > 0 ) {
												scrub["chainer"]["chainIndex"] = ccis[0];
												scrub["chainer"]["chainOid"] = ccos[0];
											}
											else {
												scrub["chainer"]["chainIndex"] = 0;
												scrub["chainer"]["chainOid"] = metadata["chain"][0];
											}
										} else {
											if( scrub["chainer"]["chainIndex"]+1 < metadata["chain"].length ) {
												scrub["chainer"]["chainIndex"]++;
												scrub["chainer"]["chainOid"] = metadata["chain"][scrub["chainer"]["chainIndex"]];
											} else {
												scrub["chainer"]["chainIndex"] = 0;
												scrub["chainer"]["chainOid"] = metadata["chain"][0];
											}
										}
									}
									scrub["pointers"][metadata["oname"]] = metadata["oid"];
									scrub["live"][metadata["oname"]][metadata["oid"]] = {};
									var noTracks = true;
									$.each(metadata, function(wpk,wpv) {
										if( wpk == "children" && typeof(wpv) == "object" ) {
											$.each(wpv, function(sk,sv) {
												if( sv["oid"] != scrub["chainer"]["chainOid"] ) {
													return true;
												}
												scrub["pointers"][sv["oname"]] = sv["oid"];
												scrub["live"][sv["oname"]][sv["oid"]] = {};
												$.each(sv, function(spk,spv) {
													if( spk == "children" && typeof(spv) == "object" ) {
														$.each(spv, function(tk,tv) {
															scrub["pointers"][tv["oname"]].push(tv["oid"]);
															scrub["live"][tv["oname"]][tv["oid"]] = tv;
															if( noTracks ) {
																noTracks = false;
															}
														});
													} else {
														scrub["live"][sv["oname"]][sv["oid"]][spk] = spv;
													}
												});
												
											});
										} else {
											scrub["live"][metadata["oname"]][metadata["oid"]][wpk] = wpv;
										}
									});
									if( noTracks ) {
										scrub.setOpts();
										scrub["status"] = "error";
										$(core).trigger(sid, ["error"]);
									} else {
										scrub.setOpts();
										scrub.setSpin();
										scrub["status"] = "ready";
										$(core).trigger(sid, ["ready"]);
									}
								}
							});
							return true;
						};
						handlers.inside = function(sid) {
							var blast = [];
							var p_webdocument = grid.getEditorObjectRefPointer("webdocument");
							if( typeof(p_webdocument["osid"]) != "string" || p_webdocument["osid"] == "" ) {
								scrub["status"] = "error";
								$.log("scrub.blastload failed, no webdocument loaded");
								setTimeout(function() {
									$(core).trigger(sid, ["error"]);
								}, _3WML_SETTIMEOUT_DEFAULT);
								return false;
							}
							blast.push({
								"oname": "webdocument",
								"osid": p_webdocument["osid"]
							});
							var p_sequence = grid.getEditorObjectRefPointer("sequence");
							if( typeof(p_sequence["osid"]) != "string" || p_sequence["osid"] == "" ) {
								scrub["status"] = "error";
								$.log("scrub.blastload failed, no sequence loaded");
								setTimeout(function() {
									$(core).trigger(sid, ["error"]);
								}, _3WML_SETTIMEOUT_DEFAULT);
								return false;
							}
							blast.push({
								"oname": "sequence",
								"osid": p_sequence["osid"]
							});
							var editorSequenceRef = grid.getEditorObjectRefFromOname("sequence");
							var noTracks = false;
							if( $.count(editorSequenceRef["children"]) < 1 ) {
								scrub["status"] = "error";
								$.log("scrub.blastload warning, no track loaded");
								noTracks = true;
							} else {
								$.each(editorSequenceRef["children"], function(k, osid) {
									blast.push({
										"oname": "track",
										"osid": osid
									});
								});
							}
							var qid = scrub.collect.inside(blast);
							$(core).bind(qid, function(e, status, v, metadata) {
								if( status === "loading" ) {
									scrub["status"] = "loading";
									$(core).trigger(sid, ["loading"]);
								}
								else if( status === "error" ) {
									scrub["status"] = "error";
									$(core).trigger(sid, ["error"]);
								}
								else if( status === "ready" ) {
									if( typeof(scrub["live"][metadata["oname"]]) != "object" ) {
										scrub["status"] = "error";
										$(core).trigger(sid, ["error"]);
										return false;
									}
									if( metadata["oname"] == "track" ) {
										scrub["pointers"][metadata["oname"]].push(metadata["oid"]);
									} else {
										scrub["pointers"][metadata["oname"]] = metadata["oid"];
									}
									scrub["live"][metadata["oname"]][metadata["oid"]] = metadata;
								}
								else if( status === true ) { // nothing but true here
									if( noTracks ) {
										scrub.setOpts();
										scrub["status"] = "error";
										$(core).trigger(sid, ["error"]);
									} else {
										scrub.setOpts();
										scrub.setSpin();
										scrub["status"] = "ready";
										$(core).trigger(sid, ["ready"]);
									}
								}
							});
							return true;
						};
						var sid = $.getUniqId();
						scrub.reset();
						scrub["status"] = "loading";
						$(core).trigger(sid, ["loading"]);
						if( standalone ) {
							handlers.outside(sid);
						} else {
							handlers.inside(sid);
						}
						return sid; // the event to be bound on core
					},
					blastupdate: function(oid) {
						if( scrub["status"] === "loading" ) {
							$.log("scrub.blastupdate failed, already loading");
							return false;
						}
						var handlers = {};
						handlers.outside = function(sid) {
							scrub["status"] = "error";
							$.log("scrub.blastupdate failed, outside does not support update!");
							setTimeout(function() {
								$(core).trigger(sid, ["error"]);
							}, _3WML_SETTIMEOUT_DEFAULT);
							return false;
						};
						handlers.inside = function(sid) {
							var blast = [];
							var p_webdocument = grid.getEditorObjectRefPointer("webdocument");
							if( typeof(p_webdocument["osid"]) != "string" || p_webdocument["osid"] == "" ) {
								scrub["status"] = "error";
								$.log("scrub.blastupdate failed, no webdocument loaded");
								setTimeout(function() {
									$(core).trigger(sid, ["error"]);
								}, _3WML_SETTIMEOUT_DEFAULT);
								return false;
							}
							var p_sequence = grid.getEditorObjectRefPointer("sequence");
							if( typeof(p_sequence["osid"]) != "string" || p_sequence["osid"] == "" ) {
								scrub["status"] = "error";
								$.log("scrub.blastupdate failed, no sequence loaded");
								setTimeout(function() {
									$(core).trigger(sid, ["error"]);
								}, _3WML_SETTIMEOUT_DEFAULT);
								return false;
							}
							if( $.inArray(oid, scrub["pointers"]["track"]) == -1 ) {
								scrub["status"] = "error";
								$.log("scrub.blastupdate failed, no sequence loaded");
								setTimeout(function() {
									$(core).trigger(sid, ["error"]);
								}, _3WML_SETTIMEOUT_DEFAULT);
								return false;
							}
							blast.push({ // should be a track singleton only !!!
								"oname": "track",
								"osid": grid.getObjectOsidFromOid(oid, "track")
							});
							var qid = scrub.collect.inside(blast);
							$(core).bind(qid, function(e, status, v, metadata) {
								if( status === "loading" ) {
									scrub["status"] = "loading";
									$(core).trigger(sid, ["loading"]);
								}
								else if( status === "error" ) {
									scrub["status"] = "error";
									$(core).trigger(sid, ["error"]);
								}
								else if( status === "ready" ) {
									if( typeof(scrub["live"][metadata["oname"]]) != "object" ) {
										scrub["status"] = "error";
										$(core).trigger(sid, ["error"]);
										return false;
									}
									scrub["live"][metadata["oname"]][metadata["oid"]] = metadata; // should be a track singleton only !!!
								}
								else if( status === true ) { // nothing but true here
									scrub.setSpin();
									scrub["status"] = "ready";
									$(core).trigger(sid, ["ready"]);
								}
							});
							return true;
						};
						var sid = $.getUniqId();
						scrub["status"] = "loading";
						$(core).trigger(sid, ["loading"]);
						if( standalone ) {
							handlers.outside(sid);
						} else {
							handlers.inside(sid);
						}
						return sid; // the event to be bound on core
					},
					setOpts: function() {
						var webdocument_oid = scrub["pointers"]["webdocument"];
						var sequence_oid = scrub["pointers"]["sequence"];
						scrub["opts"] = {
							"webdocument": scrub["live"]["webdocument"][webdocument_oid],
							"sequence": scrub["live"]["sequence"][sequence_oid]
						};
						return true;
					},
					setSpin: function() {
						var sequence_duration = scrub.queryOpt("duration");
						var trackList = scrub["pointers"]["track"];
						for( i = 0; i < sequence_duration; i++ ) { // one frame per second !
							$.each(trackList, function(k, oid) {
								var metadata = scrub["live"]["track"][oid];
								var startEffectDuration = 0;
								if( typeof(metadata["startEffect"]["duration"]) == "number" ) {
									startEffectDuration = Math.round(metadata["startEffect"]["duration"]/1000);
								}
								var stopEffectDuration = 0;
								if( typeof(metadata["stopEffect"]["duration"]) == "number" ) {
									stopEffectDuration = Math.round(metadata["stopEffect"]["duration"]/1000);
								}
								var spin;
								if( metadata["startTime"] == metadata["stopTime"] ) {
									spin = scrub.getSpin("shadow"); // shadow
								}
								else if( i < metadata["startTime"] || i > metadata["stopTime"] ) {
									spin = scrub.getSpin("unvisible"); // unvisible
								}
								else if( i == metadata["startTime"] ) {
									spin = scrub.getSpin("show"); // show
								}
								else if( i > metadata["startTime"] && i < (metadata["startTime"]+startEffectDuration) ) {
									spin = scrub.getSpin("showing"); // showing
								}
								else if( i == (metadata["startTime"]+startEffectDuration) ) {
									spin = scrub.getSpin("shown"); // shown
								}
								else if( i > (metadata["startTime"]+startEffectDuration) && i < (metadata["stopTime"]-stopEffectDuration) ) {
									spin = scrub.getSpin("visible"); // visible
								}
								else if( i == (metadata["stopTime"]-stopEffectDuration) ) {
									spin = scrub.getSpin("hide"); // hide
								}
								else if( i > (metadata["stopTime"]-stopEffectDuration) && i < stopEffectDuration ) {
									spin = scrub.getSpin("hiding"); // hiding
								}
								else if( i > metadata["stopTime"] ) {
									spin = scrub.getSpin("hidden"); // hidden
								}
								if( typeof(scrub["spin"][i]) != "object" ) {
									scrub["spin"][i] = {};
								}
								scrub["spin"][i][oid] = spin;
							});
						}
						scrub["spin"][i] = scrub["spin"][i-1]; // inject overhead last frame to have a set still at endtimePlayer
						return true;
					},
					getSpin: function(q) {
						if( typeof(q) == "string" ) {
							switch( q ) {
								case "shadow":
									return 0;
								case "show":
									return 1;
								case "showing":
									return 2;
								case "shown":
									return 3;
								case "visible":
									return 4;
								case "hide":
									return 5;
								case "hiding":
									return 6;
								case "hidden":
									return 7;
								case "unvisible":
									return 8;
								default:
									return 9;
							}
						}
						else if( typeof(q) == "number" ) {
							switch( q ) {
								case 0:
									return "shadow";
								case 1:
									return "show";
								case 2:
									return "showing";
								case 3:
									return "shown";
								case 4:
									return "visible";
								case 5:
									return "hide";
								case 6:
									return "hiding";
								case 7:
									return "hidden";
								case 8:
									return "unvisible";
								default:
									return "error";
							}
						}
					},
					queryOpt: function(optName) {
						var optVal;
						if( typeof(optName) != "string" || optName == "" ) {
							return optVal;
						}
						$.each(scrub["opts"], function(k,v) {
							if( k == optName ) {
								optVal = v;
								return false;
							}
							$.each(v, function(kk,vv) {
								if( kk == optName ) {
									optVal = vv;
									return false;
								}
							});
						});
						return optVal;
					},
					updateOpt: function(optName, optValue) {
						var optVal;
						if( typeof(optName) != "string" || optName == "" ) {
							return optVal;
						}
						if( typeof(optName) == "undefined" ) {
							return optVal;
						}
						$.each(scrub["opts"], function(k,v) {
							if( k == optName ) {
								optVal = v;
								scrub["opts"][k] = optValue;
								return false;
							}
							$.each(v, function(kk,vv) {
								if( kk == optName ) {
									optVal = vv;
									scrub["opts"][k][kk] = optValue;
									return false;
								}
							});
						});
						return optVal;
					},
					getTrackMetadata: function(oid, pname) {
						if( typeof(oid) != "number" || oid < 1 ) {
							$.log("scrub.getTrackMetadata failed, oid is not a number");
							return false;
						}
						if( scrub["status"] === "loading" || scrub["status"] === "error" ) {
							$.log("scrub.getTrackMetadata failed, cannot get while loading or error");
							return false;
						}
						if( typeof(scrub["live"]["track"][oid]) != "object" ) {
							$.log("scrub.getTrackMetadata failed, oid not found");
							return false;
						}
						var live = scrub["live"]["track"][oid];
						if( typeof(pname) != "string" || pname == "" ) {
							return live;
						}
						if( typeof(live[pname]) == "undefined" ) {
							return live;
						}
						return live[pname];
					},
					getPlayerTrackMetadata: function(oid, species, direction) {
						if( render["status"] === false ) {
							$.log("scrub.getPlayerTrackNodes failed, render is not ready");
							return false;
						}
						var trackMetadata = []; // main ordered(===|--------------) object, js does not garantee the creation order in objects (non arrays) ?
						var oids = [];
						var _species = [];
						var metadatas = {};
						if( typeof(species) == "object" && typeof(species.length) == "number" ) {
							if( species.length > 0 ) {
								$.each(species, function(k_s, v_species) {
									if( $.inArray(v_species, render["playerTrackSpecies"]) < 0 ) {
										return true;
									}
									_species.push(v_species);
								});
							}
						}
						$.each(scrub["pointers"]["track"], function(k, k_oid) {
							var metadata = scrub.getTrackMetadata(k_oid);
							if( metadata === false ) {
								return true;
							}
							if( typeof(oid) == "number" && oid > 0 ) {
								if( k_oid != oid ) {
									return true;
								}
							}
							if( _species.length > 0 ) {
								if( $.inArray(metadata["species"], _species) < 0 ) {
									return true;
								}
							}
							oids.push(k_oid);
							metadatas[k_oid] = metadata;
						});
						if( oids.length == 1 ) {
							trackMetadata.push(metadatas[oids[0]]);
						}
						else if( oids.length > 1 ) {
							if( direction === "down" ) {
								oids.sort(function(a,b){return b - a}); //Sort numerically and descending
							} else {
								oids.sort(function(a,b){return a - b}); //Sort numerically and ascending
							}
							$.each(oids, function(k,v) {
								trackMetadata.push(metadatas[v]);
							});
						}
						return trackMetadata;
					},
					query: function(cuetime) { // cuetime in s from a inited oid ...
						if( scrub["status"] !== "ready" ) {
							$.log("scrub.query failed, not ready");
							return false;
						}
						if( typeof(scrub["spin"][cuetime]) != "object" ) {
							$.log("scrub.query failed, cuetime not found");
							return false;
						}
						var spinList = scrub["spin"][cuetime];
						return spinList;
					},
					statusInit: function() {
						return scrub["status"];
					}
				});
				return $(core).data("scrub");
			},
			getScrub: function() {
				return $(core).data("scrub");
			},
			// END Scrub ^^^----------------------------------------------------------^^^
			
			playerInit: function(playerNode, mode, cuetime, ctHandler) {
				if( $.playerInit["status"] === "loading" ) {
					$.log("playerInit failed, already loading");
					return false;
				}
				$.playerInit["status"] = "loading";
				if( typeof(playerNode) != "object" ) {
					$.log("playerInit failed, playerNode is not an object");
					return false;
				}
				if( typeof(ctHandler) != "function" ) {
					$.log("playerInit failed, ctHandler is not a function");
					return false;
				}
				$(playerNode).find("*").remove();
				if( mode !== "edit" && mode !== "preview" ) {
					var mode = "preview";
				}
				if( standalone ) {
					mode = "preview";
				}
				if( typeof(cuetime) != "number" || cuetime < 0 ) { // in s here
					var cuetime = 0;
				}
				$.playerInit["pid"] = $.getUniqId();
				clock.unregister();
				nabber.unregisterAll();
				render.unregister();
				var sid = scrub.blastload();
				if( sid === false ) {
					$.log("playerInit failed, scrub.blastload error");
					return false;
				}
				$(core).bind(sid, function(e, status) {
					if( status === "loading" ) {
						// console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% LOADING");
						$(core).trigger($.playerInit["pid"], ["loading",scrub.pointers,mode]);
						$(core).trigger("playerInit", ["loading",scrub.pointers,mode]);
					}
					else if( status === "error" ) {
						// console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ERROR");
						$.playerInit["status"] = "error";
						$(core).trigger($.playerInit["pid"], ["error",scrub.pointers,mode]);
						$(core).trigger("playerInit", ["error",scrub.pointers,mode]);
					}
					else if( status === "ready" ) {
						// console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% READY");
						render.registerLoad(playerNode, mode, ctHandler);
						$.playerTransport("cue", cuetime);
						$.playerInit["status"] = "ready";
						$(core).trigger($.playerInit["pid"], ["ready",scrub.pointers,mode]);
						$(core).trigger("playerInit", ["ready",scrub.pointers,mode]);
						if( standalone === true ) {
							if( scrub.queryOpt("autoplay") === true ) {
								$.playerTransport("play");
							}
							if( scrub.queryOpt("screenSize") === true ) {
								$.playerTransport("widescreen");
							}
							if( scrub.queryOpt("mute") === true ) {
								$.playerTransport("mute"); // TODO, plug on real muting ?
							}
						}
					}
				});
				$.log("playerInit success, "+$.playerInit["pid"]);
				return $.playerInit["pid"];
			},
			
			playerUpdate: function(oid, noTrigger) { // identification thru playerInit !!!
				if( standalone === true ) {
					$.log("playerUpdate failed, not available in standalone");
					return false;
				}
				if( $.playerInit["status"] === "loading" ) {
					$.log("playerUpdate failed, already loading");
					return false;
				}
				var cuetime = Math.round(clock["cuetime"]/1000);
				var mode = render["mode"];
				if( mode !== "edit" ) {
					$.log("playerUpdate failed, mode must be edit");
					return false;
				}
				$.playerInit["status"] = "loading";
				$.playerInit["pid"] = $.getUniqId();
				var sid = scrub.blastupdate(oid);
				if( sid === false ) {
					$.log("playerUpdate failed, scrub.blastupdate error");
					return false;
				}
				$(core).bind(sid, function(e, status) {
					if( status === "loading" ) {
						// console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% LOADING");
						$(core).trigger($.playerInit["pid"], ["loading",scrub.pointers,mode]);
						if( noTrigger !== true ) {
							$(core).trigger("playerInit", ["loading",scrub.pointers,mode]);
						}
					}
					else if( status === "error" ) {
						// console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ERROR");
						$.playerInit["status"] = "error";
						$(core).trigger($.playerInit["pid"], ["error",scrub.pointers,mode]);
						if( noTrigger !== true ) {
							$(core).trigger("playerInit", ["error",scrub.pointers,mode]);
						}
					}
					else if( status === "ready" ) {
						// console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% READY");
						render.registerUpdate(oid);
						$.playerTransport("cue", cuetime);
						$.playerInit["status"] = "ready";
						$(core).trigger($.playerInit["pid"], ["ready",scrub.pointers,mode]);
						if( noTrigger !== true ) {
							$(core).trigger("playerInit", ["ready",scrub.pointers,mode]);
						}
					}
				});
				$.log("playerUpdate success, "+$.playerInit["pid"]);
				return $.playerInit["pid"];
			},
			
			playerInitSequence: function(playerNode, cuetime, sequence_oid) {
				if( standalone !== true ) {
					$.log("playerInitSequence failed, only available in standalone");
					return false;
				}
				if( typeof(playerNode) != "object" ) {
					if( typeof(render["playerNode"]) != "object" ) {
						$.log("playerInitSequence failed, playerNode is not an object");
						return false;
					}
					var playerNode = render["playerNode"];
				}
				
				$.playerInitSequence["sequence_oid"] = sequence_oid;
				return $.playerInit(playerNode, "preview", cuetime, function() {});
			},
			
			playerGetTrackMediaDuration: function(oid) {
				if( $.playerInit["status"] === "loading" || $.playerInit["status"] === "empty" ) {
					$.log("playerGetTrackVideoDuration failed, player not ready");
					return false;
				}
				if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
					$.log("playerGetTrackVideoDuration failed, oid is not an object");
					return false;
				}
				var playerTrackNode = render["playerTrackNodes"][oid];
				var im = $(playerTrackNode).data("injectorMetadata");
				var _species = $(playerTrackNode).data("species");
				var duration_in_ms;
				switch( _species ) {
					case "video":
					case "audio":
						duration_in_ms = im["data"]["formats"][0]["duration_in_ms"];
						break;
					default:
						return false;
						break;
				}
				if( typeof(duration_in_ms) != "number" ) {
					return false;
				}
				var duration_in_s = Math.round(duration_in_ms/1000);
				return duration_in_s;
			},
			
			playerSelectTrack: function(oid) {
				if( standalone === true ) {
					$.log("playerSelectTrack failed, not available in standalone");
					return false;
				}
				if( $.playerInit["status"] === "loading" ) {
					$.log("playerSelectTrack failed, already loading");
					return false;
				}
				var mode = render["mode"];
				if( mode !== "edit" ) {
					$.log("playerSelectTrack failed, mode must be edit");
					return false;
				}
				if( typeof(render["playerTrackNodes"][oid]) != "object" ) {
					$.log("playerSelectTrack failed, oid is not an object");
					return false;
				}
				var playerTrackNode = render["playerTrackNodes"][oid];
				var im = $(playerTrackNode).data("injectorMetadata");
				if( nabber["lastRevealed"] > 0 ) {
					nabber.mask(nabber["lastRevealed"]);
				}
				$(playerTrackNode).trigger("mouseleave"); // cancel the mouseenter style !!!
				nabber.reveal(oid);
				grid.setEditorObjectRefPointer(im["osid"], "track");
				$(core).trigger("refreshPathway");
				$(core).trigger("playerSelectTrack", [oid]);
			},
			
			playerSpinTrack: function(oid, direction, noFx) {
				if( $.playerInit["status"] !== "ready" ) {
					$.log("playerSpinTrack failed, player not ready");
					return false;
				}
				if( standalone !== true ) {
					$.log("playerSpinTrack failed, only available in standalone");
					return false;
				}
				var cuetime_s = $.playerCuetime();
				var spin = scrub.getSpin("shadow");
				if( direction === "show" ) {
					if( noFx === true ) {
						spin = scrub.getSpin("visible");
					} else {
						spin = scrub.getSpin("show");
					}
				}
				else if( direction === "hide" ) {
					if( noFx === true ) {
						spin = scrub.getSpin("unvisible");
					} else {
						spin = scrub.getSpin("hide");
					}
				}
				else {
					$.log("playerSpinTrack failed, direction not understood");
					return false;
				}
				render.spinTrackPreview(oid, spin, cuetime_s, true); // fourth parameter to force spin engine
				return true;
			},
			
			playerTransport: function(transport, param) {
				if( typeof(transport) != "string" || transport == "" ) {
					$.log("playerTransport failed, transport is not a string");
					return false;
				}
				if( scrub["status"] !== "ready" ) {
					$.log("playerTransport failed, scrub is not ready");
					return false;
				}
				switch( transport ) {
					case "cue":
					case "rwd":
					case "fwd":
						if( typeof(param) != "number" ) {
							var cuetime_s = $.playerCuetime();
							if( transport == "fwd" ) {
								var param = cuetime_s+3;
							} else if( transport == "rwd" ) {
								var param = cuetime_s-3;
							} else {
								$.log("playerTransport failed, cuetime is not a number");
								return false;
							}
						}
						var min = 0;
						var max = scrub.queryOpt("duration"); // convert to ms
						if( param < min ) {
							param = min;
						}
						if( param > max ) {
							param = max;
						}
						clock.cueLoop(param*1000);
						$(core).trigger("playerTransport", [transport,param]);
						break;
					case "stop":
						clock.stopLoop(true);
						clock.cueLoop(0);
						$(core).trigger("playerTransport", [transport]);
						break;
					case "play":
						clock.startLoop();
						$(core).trigger("playerTransport", [transport]);
						break;
					case "pause":
						clock.stopLoop();
						$(core).trigger("playerTransport", [transport]);
						break;
					case "mute":
						render.detectMetrics("sound", {"contentMute": true});
						render.soundTracks();
						$(core).trigger("playerTransport", [transport]);
						break;
					case "unmute":
						render.detectMetrics("sound", {"contentMute": false});
						render.soundTracks();
						$(core).trigger("playerTransport", [transport]);
						break;
					case "soundminus":
					case "soundplus":
						if( typeof(param) != "number" ) {
							if( transport == "soundplus" ) {
								var param = render.detectMetrics("sound")["contentVolume"]+.1;
							} else {
								var param = render.detectMetrics("sound")["contentVolume"]-.1;
							}
						}
						var min = 0;
						var max = 1;
						if( param < min ) {
							param = min;
						}
						if( param > max ) {
							param = max;
						}
						param = $.roundFloat(param, 1);
						render.detectMetrics("sound", {"contentVolume": param});
						render.soundTracks();
						$(core).trigger("playerTransport", [transport,param]);
						break;
					case "smallscreen":
					case "widescreen":
						if( transport == "widescreen" ) {
							render.detectMetrics("spatialize", {"contentScreenSize": true});
						} else {
							render.detectMetrics("spatialize", {"contentScreenSize": false});
							$(window).trigger("resize"); // TODO, find a better way ...
						}
						render.spatializeScreen();
						render.spatializeTracks();
						$(core).trigger("playerTransport", [transport]);
						break;
				}
				return true;
			},
			
			playerOptsQuery: function(optName) {
				return scrub.queryOpt(optName);
			},
			
			playerEnvQuery: function(envName) {
				return render.queryEnv(envName);
			},
			
			playerFitResize: function(maxWidth, maxHeight, eWidth, eHeight, noUpscale) {
				if( typeof(eWidth) != "number" && typeof(eHeight) != "number" ) {
					var eWidth = scrub.queryOpt("width");
					var eHeight = scrub.queryOpt("height");
				}
				return render.fitResize(maxWidth, maxHeight, eWidth, eHeight, noUpscale);
			},
			
			playerTrackNodesQuery: function(oid) {
				return render.getPlayerTrackNodes(oid);
			},
			
			playerTrackMetadataQuery: function(oid, species, direction) {
				return scrub.getPlayerTrackMetadata(oid, species, direction);
			},
			
			playerCuetime: function(ms) {
				if( ms === true ) {
					return clock.statusLoop("cuetime");
				} else {
					return Math.round(clock.statusLoop("cuetime")/1000);
				}
			}
			
		}); // EO$.extends ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		
		self.init = function() {
			
			now = $.getTimestamp();
			
			if( typeof($.requestDynamic) != "function" ) {
				standalone = true;
			}
			
			// main elements
			fontface				= $.getFontface();
			if( !standalone ) {
				requestCore				= $.getRequestCore();
				definitions				= $.getDefinitions();
				effects					= $.getEffects();
				events					= $.getEvents();
				styles					= $.getStyles();
				grid					= $.getGrid();
				catalog					= $.getCatalog();
				recall					= $.getRecall();
				collector				= $.getCollector();
			}
			
			// player elements
			clock					= $.setClock();
			injector				= $.setInjector();
			nabber					= $.setNabber();
			render					= $.setRender();
			scrub					= $.setScrub();
			
			// window resize handling
			var cto = 0;
			$(window).bind("resize", function(e) {
				if( typeof(e["clientX"]) == "number" ) { // restricting this to window only, client.X should not be defined in window context !!!
					return false;
				}
				if( scrub["status"] !== "ready" ) {
					return false;
				}
				clearTimeout(cto);
				cto = setTimeout(function() {
					if( render["metrics"]["contentScreenSize"] === true ) {
						render.detectMetrics("spatialize", {"contentScreenSize": true});
					} else {
						render.offsetMetrics();
						render.detectMetrics("spatialize", {"contentScreenSize": false});
					}
					render.spatializeScreen();
					render.spatializeTracks();
				}, 250);
			});
			
			// esc from widescreen, general
			$(document).bind("keydown", "Esc", function(e) { // keyboard hotkeys bindings
				if( e["keyCode"] === 27 ) { // firewalling needed to filter keyCode, in standalone mode all keys are responding here, weird ..!
					var transportButton = $("#lib3wml").find(".gui-3wml-drawer-toolbar-transport-widescreen_smallscreen").children("button");
					if( transportButton.length == 1 ) {
						$(transportButton).trigger("click");
					} else {
						$.playerTransport("smallscreen");
					}
				}
			});
			
			$.log("lib3wmlPlayer class init at "+now,true);
			return true;
			
		}; // EOM
		
	}; // EOClass ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
	/** ******************** **/
	/**    PLUGIN WRAPPER    **/
	/** ******************** **/
	
	$.fn.lib3wmlPlayer = function(options) {
		
		return this.each(function() {
			
			var element = this;
			if( $(element).data("lib3wmlPlayer") ) {
				return null;
			}
			var lib3wmlPlayer = new Lib3wmlPlayer(element);
			$(element).data("lib3wmlPlayer", lib3wmlPlayer);
			lib3wmlPlayer.init();
			
		});
		
	}; // EOPluginWrapper ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
})(jQuery);
;