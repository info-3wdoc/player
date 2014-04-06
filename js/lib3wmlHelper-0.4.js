/**
 * @preserve LICENSE:
 * Lib3wmlHelper is licensed under Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported License.
 * Permissions beyond the scope of this license may be available at http://www.hecube.net/
 * codeAuthor: info@3wdoc.com
 */

/** ******************** **/
/**   FUNCTION WRAPPER   **/
/** ******************** **/

(function( $ ) {
	
	// fontface
	var fontface			= {};
	
	$.extend({
		
		// BEGIN Fontface vvv--------------------------------------------------vvv
		setFontface: function() {
			$("head").data("fontface", {
				"status": false,
				// include binary base64 encoded fontsource, cheapest solution since it involves only S3 broadcasting
				"list": { // §§§ Access-Control-Allow-Origin fix
					"rounded": "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",
					"square": "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"
				},
				"format": "truetype",
				"prefix": "3wdoc-",
				"embed": [],
				"styleNode": false,
				// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ROOT-LEVEL OBJECTS ANONYMOUS METHODS
				init: function() {
					if( fontface["status"] === true ) {
						$.log("fontface.init failed, already inited");
						return false;
					}
					fontface["status"] = false;
					fontface["embed"] = [];
					$(fontface["styleNode"]).remove();
					fontface["styleNode"] = false;
					$.each(fontface["list"], function(filename, fontdata) {
						var styleText = [
							"@font-face {",
							"font-family: '"+fontface["prefix"]+filename+"';",
							"src: url('data:font/ttf;charset=utf-8;base64,"+fontdata+"') format('"+fontface["format"]+"');", // §§§ Access-Control-Allow-Origin fix
							"font-weight: normal;",
							"font-style: normal;",
							"}"
						];
						fontface["embed"].push(styleText.join(""));
					});
					if( fontface["embed"].length < 1 ) {
						$.log("fontface.init failed, nothing to embed");
						return false;
					}
					var styleNode = $("head").prepend('<style type="text/css"/>').children().first();
					$(styleNode).text(fontface["embed"].join("\n"));
					fontface["styleNode"] = styleNode;
					fontface["status"] = true;
					return true;
				},
				getList: function(noPrefix) {
					var list = [];
					if( fontface["status"] !== true ) {
						$.log("fontface.getList failed, fontface not inited");
						return list;
					}
					$.each(fontface["list"], function(filename, fontdata) {
						if( noPrefix === true ) {
							list.push(filename+"."+fontface["extension"]);
						} else {
							list.push(fontface["prefix"]+filename);
						}
					});
					return list;
				},
				setFamily: function(node, family) {
					if( typeof(node) != "object" ) {
						$.log("fontface.setFamily failed, node is not an object");
						return false;
					}
					var fontfaceList = fontface.getList();
					if( fontfaceList.length < 1 ) {
						$.log("fontface.setFamily failed, getList error");
						return false;
					}
					var fontfaceName = fontfaceList[0];
					family = $.trim(family, "'");
					if( typeof(family) == "string" && family != "" ) {
						var s = $.inArray(family, fontfaceList);
						if( s > -1 ) {
							fontfaceName = fontfaceList[s];
						}
					}
					$(node).css("font-family", "'"+fontfaceName+"'");
					return node;
				}
			});
			fontface = $("head").data("fontface");
			return $("head").data("fontface");
		},
		getFontface: function() {
			return $("head").data("fontface");
		},
		// END Fontface vvv----------------------------------------------------vvv
		
		objectFilter: function(obj, pagelength, sort, direction, search) {
			/*
			var search = {
				"expression": "",
				"species": ""
			};
			*/
			var result = {
				"pagelength": pagelength,
				"sort": sort,
				"direction": direction,
				"pagecount": 0,
				"pages": {}
			};
			var __searchExpression = function(str, osid) {
				var regexp = new RegExp(str,'i');
				if( osid.search(regexp) >= 0 ) {
					return true;
				}
				return false;
			};
			var __searchSpecies = function(str, osid) {
				var species = str.split(",");
				var extension = osid.substr(osid.lastIndexOf('.') + 1).toLowerCase();
				if( typeof(_3WML_FILEUPLOAD_OEXTS[extension]) != "undefined" ) {
					var ospecies = _3WML_FILEUPLOAD_OEXTS[extension]["species"];
					if( $.inArray(ospecies, species) >= 0 ) {
						return true;
					}
				}
				return false;
			};
			var idx = [];
			$.each(obj, function(k,v) {
				if( typeof(search["expression"]) == "string" && search["expression"] != "" ) {
					if( __searchExpression(search["expression"], v) === false ) {
						return true;
					}
				}
				if( typeof(search["species"]) == "string" && search["species"] != "" ) {
					if( __searchSpecies(search["species"], v) === false ) {
						return true;
					}
				}
				if( sort == "string" ) {
					idx.push(v);
				}
				else if( sort == "number" ) {
					idx.push(k);
				}
			});
			if( sort == "string" && direction == "up" ) {
				idx.sort();
			}
			else if( sort == "string" && direction == "down" ) {
				idx.sort();
				idx.reverse();
			}
			else if( sort == "number" && direction == "up" ) {
				idx.sort(function(a,b){return a - b}); //Sort numerically and ascending
			}
			else if( sort == "number" && direction == "down" ) {
				idx.sort(function(a,b){return b - a}); //Sort numerically and descending
			}
			result["pagecount"] = Math.ceil((idx.length)/pagelength);
			var c = 1;
			var page = 1;
			var oid;
			var osid;
			$.each(idx, function(k,v) {
				if( c > pagelength ) {
					c = 1;
					page++;
				}
				if( c == 1 ) {
					result["pages"][page] = [];
				}
				if( sort == "string" ) {
					osid = v;
				}
				else if( sort == "number" ) {
					osid = obj[v];
				}
				result["pages"][page].push(osid);
				c++;
			});
			return result;
		},
		
		trim: function(str,chars) {
			return $.ltrim($.rtrim(str, chars), chars);
		},
		
		objectClone: function(obj) {
			var newObj = (obj instanceof Array) ? [] : {};
			for(i in obj) {
				if( i == "clone" ) {
					continue;
				};
				if( obj[i] && typeof obj[i] == "object" ) {
		      		newObj[i] = $.objectClone(obj[i]);
		    	} else {
					newObj[i] = obj[i];
				}
			}
			return newObj;
		},
		
		ltrim: function(str, chars) {
			chars = chars || "\\s";
			return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
		},
		
		rtrim: function(str, chars) {
			chars = chars || "\\s";
			return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
		},
		
		arrayMax: function(array) {
			if( array.length < 1 ) {
				return 0;
			}
		    return Math.max.apply(Math, array);
		},
		
		arrayMin: function(array) {
		    return Math.min.apply(Math, array);
		},
		
		objectKeysMax: function(obj) {
			var keys = [];
			$.each(obj, function(k,v) {
				if( typeof(k) != "number" ) {
					return true;
				}
				keys.push(k);
			});
			return $.arrayMax(keys);
		},
		
		objectKeysMin: function(obj) {
			var keys = [];
			$.each(obj, function(k,v) {
				if( typeof(k) != "number" ) {
					return true;
				}
				keys.push(k);
			});
			return $.arrayMin(keys);
		},
		
		inObject: function(needle,haystack,i) {
			if( typeof(i) == "undefined" ) {
				var i = false;
			}
			var keys = [];
			$.each(haystack, function(k,v) {
				if( i === false && typeof(v) == "string" ) {
					v = v.toLowerCase();
					needle = needle.toString().toLowerCase();
				}
				if( v != needle ) {
					return true;
				}
				keys.push(k);
			});
			if( keys.length < 1 ) {
				return false;
			}
			return keys;
		},
		
		compareObjects: function(obj1, obj2) {
			if( obj1 === obj2 ) return true;
		 	if( !(obj1 instanceof Object) || ! (obj2 instanceof Object) ) return false;
			if( obj1.constructor !== obj2.constructor ) return false;
			for( var p in obj1 ) {
				if( !obj1.hasOwnProperty( p ) ) continue;
				if( !obj2.hasOwnProperty( p ) ) return false;
				if( obj1[ p ] === obj2[ p ] ) continue;
				if( typeof(obj1[p]) !== "object" ) return false;
				if( !$.compareObjects(obj1[p], obj2[p]) ) return false;
			}
			for(p in obj2) {
				if( obj2.hasOwnProperty(p) && ! obj1.hasOwnProperty(p) ) return false;
			}
			return true;
		},
		
		strRepeat: function(i, m) {
			return new Array(m+1).join(i);
		},
		
		ucwords: function(str) {
			return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
				return $1.toUpperCase();
			});
		},
		
		isNull: function(input) {
			return (input === null);
		},
		
		count: function(obj) {
			return parseInt(Object.keys(obj).length);
		},
		
		parseBoolean: function(str) {
			return /^true$/i.test(str);
		},
		
		roundFloat: function(value, decimals) {
			if( typeof(decimals) == "undefined" ) {
				var decimals = 1;
			}
			return parseFloat(Math.round(value*Math.pow(10,decimals))/Math.pow(10,decimals));
		},
		
		his2s: function(his) {
			return (parseInt(his[0])*3600)+(parseInt(his[1])*60)+(parseInt(his[2]));
		},
		
		s2his: function(s) {
			s = parseInt(s);
			var his = [];
			his[0] = Math.floor(s/3600);
			his[1] = Math.floor(s%3600/60);
			his[2] = Math.floor(s%3600%60);
			return his;
		},
		
		his2his: function(his) {
			return $.s2his($.his2s(his));
		},
		
		buildArray: function(min, max, step, prefix) {
			var values = [];
			if( typeof(min) != "number" || typeof(max) != "number" || typeof(step) != "number" ) {
				return values;
			}
			for( var i = min; i <= max; i = i+step ) {
				if( typeof(prefix) == "string" && prefix != "") {
					values.push(i+prefix);	
				} else {
					values.push(i);	
				}
			}
			return values;
		},
		
		_e: function(key) {
			if( typeof(key) != "string" || key == "" ) {
				return "";
			}
			if( typeof(_3WML_LANG_SOURCES) != "object" ) {
				return key;
			}
			if( typeof(_3WML_LANG_SOURCES[key]) != "string" ) {
				_3WML_LANG_SOURCES[key] = key;
				return key;
			}
			return _3WML_LANG_SOURCES[key];
		},
		
		showDate: function(ts) {
			var date = new Date(ts*1000);
			return date.toUTCString();
		},
		
		getTimestamp: function() {
			return Math.round((new Date()).getTime() / 1000);
		},
		
		getMicrotime: function() {
			return Math.round((new Date()).getTime());
		},
		
		isValidUrl: function(url) {
			var regexp = /((http:\/\/|https:\/\/)(www.)?(([a-zA-Z0-9-]){2,}\.){0,4}([a-zA-Z]){2,6}(\/([a-zA-Z-_\/\.0-9#:?=&;,]*)?)?)/;
			return regexp.test(url);
		},
		
		shortenText: function(string, length, dots) {
			string = string.toString();
			if( typeof(length) != "number" || length <= 0 ) {
				var length = string.length;
			}
			if( typeof(dots) != "boolean" ) {
				var dots = true;
			}
			if( length > string.length ) {
				dots = false;
			}
			string = string.substr(0, length);
			if( dots ) {
				string += "…";
			}
			return string;
		},
		
		htmlspecialcharsEncode: function(string, quote_style, charset, double_encode) {
			var optTemp = 0,
			i = 0,
			noquotes = false;
			if (typeof quote_style === 'undefined' || quote_style === null) {
				quote_style = 2;
			}
			string = string.toString();
			if (double_encode !== false) { // Put this first to avoid double-encoding
				string = string.replace(/&/g, '&amp;');
			}
			string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			var OPTS = {
				'ENT_NOQUOTES': 0,
				'ENT_HTML_QUOTE_SINGLE': 1,
				'ENT_HTML_QUOTE_DOUBLE': 2,
				'ENT_COMPAT': 2,
				'ENT_QUOTES': 3,
				'ENT_IGNORE': 4
			};
			if (quote_style === 0) {
				noquotes = true;
			}
			if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
				quote_style = [].concat(quote_style);
				for (i = 0; i < quote_style.length; i++) {
					// Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
					if (OPTS[quote_style[i]] === 0) {
						noquotes = true;
					}
					else if (OPTS[quote_style[i]]) {
						optTemp = optTemp | OPTS[quote_style[i]];
					}
				}
				quote_style = optTemp;
			}
			if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
				string = string.replace(/'/g, '&#039;');
			}
			if (!noquotes) {
				string = string.replace(/"/g, '&quot;');
			}
			return string;
		},
		
		htmlspecialcharsDecode: function(string, quote_style) {
			var optTemp = 0,
			i = 0,
			noquotes = false;
			if (typeof quote_style === 'undefined') {
				quote_style = 2;
			}
			string = string.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			var OPTS = {
				'ENT_NOQUOTES': 0,
				'ENT_HTML_QUOTE_SINGLE': 1,
				'ENT_HTML_QUOTE_DOUBLE': 2,
				'ENT_COMPAT': 2,
				'ENT_QUOTES': 3,
				'ENT_IGNORE': 4
			};
			if (quote_style === 0) {
				noquotes = true;
			}
			if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
				quote_style = [].concat(quote_style);
				for (i = 0; i < quote_style.length; i++) {
					// Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
					if (OPTS[quote_style[i]] === 0) {
						noquotes = true;
					} else if (OPTS[quote_style[i]]) {
						optTemp = optTemp | OPTS[quote_style[i]];
					}
				}
				quote_style = optTemp;
			}
			if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
				string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
				// string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
			}
			if (!noquotes) {
				string = string.replace(/&quot;/g, '"');
			}
			// Put this in last place to avoid escape being double-decoded
			string = string.replace(/&amp;/g, '&');
			return string;
		},
		
		getUniqId: function() {
			// http://www.broofa.com/Tools/Math.uuid.js
			var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
			var uuid = new Array(36);
			var rnd = 0;
			var r;
			for( var i = 0; i < 36; i++ ) {
				if( i==8 || i==13 ||  i==18 || i==23 ) {
					uuid[i] = '-';
				} else if( i==14 ) {
					uuid[i] = '4';
				} else {
					if( rnd <= 0x02 ) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
					r = rnd & 0xf;
					rnd = rnd >> 4;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
			return uuid.join('');
		},
			
		sanitizeJsonString: function(string) { // one way encode protection for serialized json data
			string = string.replace(/\n/g, ""); // delete newlines
			string = string.replace(/"/g, "'"); // transform double quotes to single quotes
			return string;
		},
		
		stringifyObject: function(o) {
			// http://www.sitepoint.com/javascript-json-serialization/
			// return JSON.stringify(o);
			var t = typeof (o);
			if (t != "object" || o === null) {
				// simple data type
				if (t == "string") o = '"'+o+'"';
				return String(o);
			}
			else {
				// recurse array or object
				var n, v, json = [], arr = (o && o.constructor == Array);
				for (n in o) {
					v = o[n]; t = typeof(v);
					if (t == "string") v = '"'+$.sanitizeJsonString(v)+'"';
					else if (t == "object" && v !== null) v = $.stringifyObject(v);
					json.push((arr ? "" : '"' + n + '":') + String(v));
				}
				return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
			}
		},
		
		objectifyString: function(s) {
			// http://www.sitepoint.com/javascript-json-serialization/
			// return JSON.parse(s);
			if (s === "") s = '""';
			eval("var o=" + s + ";");
			return o;
		},
		
		addSlashes: function(str) {
			return (str+'').replace(/[\\"']/g,'\\$&').replace(/\u0000/g,'\\0');
		},
		
		stripSlashes: function(str) {
			return (str+'').replace(/\\(.?)/g, function(s, n1) {
				switch (n1) {
					case '\\':
						return '\\';
					case '0':
						return '\u0000';
					case '':
						return '';
					default:
						return n1;
				}
			});
		},
		
		nl2br: function(str, is_xhtml) {
			var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
//			return (str+'').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,'$1'+breakTag+'$2'); // does not remove the nl !
			return (str+'').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,'$1'+breakTag);
		},
		
		br2nl: function(str) {
//			return str.replace( /\<br(\s*\/|)\>/g, '\r\n'); // the windows carriage return dos not exists in js, we only need new-line
			return (str+'').replace( /\<br(\s*\/|)\>/g, '\n');
		},
		
		getXPath: function(node, path) {
			path = path || [];
			if(node.parentNode) {
				path = $.getXPath(node.parentNode, path);
			}	
			if(node.previousSibling) {
				var count = 1;
				var sibling = node.previousSibling
				do {
					if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {
						count++;
					}
					sibling = sibling.previousSibling;
				} while(sibling);
				if(count == 1) {
					count = null;
				}
			} else if(node.nextSibling) {
				var sibling = node.nextSibling;
				do {
					if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {
						var count = 1;
						sibling = null;
					} else {
						var count = null;
						sibling = sibling.previousSibling;
					}
				} while(sibling);
			}
			if(node.nodeType == 1) {
				path.push(node.nodeName.toLowerCase() + (node.id ? "[@id='"+node.id+"']" : count > 0 ? "["+count+"]" : ''));
			}
			return path;
		},
		
		utf8_encode: function(argString) {
		    // + Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			if (argString === null || typeof argString === "undefined") {
				return "";
			}
			var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
			var utftext = "", start, end, stringl = 0;
			start = end = 0;
			stringl = string.length;
			for(var n = 0; n < stringl; n++) {
				var c1 = string.charCodeAt(n);
				var enc = null;
				if( c1 < 128 ) {
					end++;
				} else if( c1 > 127 && c1 < 2048 ) {
					enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
				} else {
					enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
				}
				if( enc !== null ) {
					if( end > start ) {
						utftext += string.slice(start, end);
					}
					utftext += enc;
					start = end = n + 1;
				}
			}
			if( end > start ) {
				utftext += string.slice(start, stringl);
			}
			return utftext;
		},
		
		utf8_decode: function(str_data) {
			// + Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			var tmp_arr = [],
				i = 0,
				ac = 0,
				c1 = 0,
				c2 = 0,
				c3 = 0;
	 		str_data += '';
			while(i < str_data.length) {
				c1 = str_data.charCodeAt(i);
				if (c1 < 128) {
					tmp_arr[ac++] = String.fromCharCode(c1);
					i++;
				} else if (c1 > 191 && c1 < 224) {
					c2 = str_data.charCodeAt(i + 1);
					tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = str_data.charCodeAt(i + 1);
					c3 = str_data.charCodeAt(i + 2);
					tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return tmp_arr.join('');
		},
		
		base64_encode: function(data) {
			// + Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "", tmp_arr = [];
			if (!data) {
				return data;
			}
			data = $.utf8_encode(data + '');
			do { // pack three octets into four hexets
				o1 = data.charCodeAt(i++);
				o2 = data.charCodeAt(i++);
				o3 = data.charCodeAt(i++);
				bits = o1 << 16 | o2 << 8 | o3;
				h1 = bits >> 18 & 0x3f;
				h2 = bits >> 12 & 0x3f;
				h3 = bits >> 6 & 0x3f;
				h4 = bits & 0x3f;
				// use hexets to index into b64, and append result to encoded string
				tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
			} while (i < data.length);
			enc = tmp_arr.join('');
		    var r = data.length % 3;
		    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
		},
		
		base64_decode: function(data) {
			// + Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = "", tmp_arr = [];
			if (!data) {
				return data;
			}
			data += '';
			do { // unpack four hexets into three octets using index points in b64
				h1 = b64.indexOf(data.charAt(i++));
				h2 = b64.indexOf(data.charAt(i++));
				h3 = b64.indexOf(data.charAt(i++));
				h4 = b64.indexOf(data.charAt(i++));
				bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
				o1 = bits >> 16 & 0xff;
				o2 = bits >> 8 & 0xff;
				o3 = bits & 0xff;
				if (h3 == 64) {
					tmp_arr[ac++] = String.fromCharCode(o1);
				} else if (h4 == 64) {
					tmp_arr[ac++] = String.fromCharCode(o1, o2);
				} else {
					tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
				}
			} while (i < data.length)
			dec = tmp_arr.join('');
			dec = $.utf8_decode(dec);
			return dec;
		},
		
		cookie: function(key, value, options) {
			// + https://github.com/carhartl/jquery-cookie
			// + Create session cookie: 							$.cookie('the_cookie', 'the_value');
			// + Create expiring cookie, 7 days from then: 			$.cookie('the_cookie', 'the_value', { expires: 7 });
			// + Create expiring cookie, valid across entire page: 	$.cookie('the_cookie', 'the_value', { expires: 7, path: '/' });
			// + Read cookie: 										$.cookie('the_cookie'); // => 'the_value' // $.cookie('not_existing'); // => null
			// + Delete cookie by passing null as value: 			$.cookie('the_cookie', null);
			// key and at least value given, set cookie...
			if( arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined) ) {
				options = $.extend({}, options);
				if( value === null || value === undefined ) {
					options.expires = -1;
				}
				if( typeof options.expires === 'number' ) {
					var days = options.expires, t = options.expires = new Date();
					t.setDate(t.getDate() + days);
				}
				value = String(value);
				return (document.cookie = [
					encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
					options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					options.path    ? '; path=' + options.path : '',
					options.domain  ? '; domain=' + options.domain : '',
					options.secure  ? '; secure' : ''
					].join(''));
			}
			// key and possibly options given, get cookie...
			options = value || {};
			var decode = options.raw ? function(s) { return s; } : decodeURIComponent;
			var pairs = document.cookie.split('; ');
			for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
				if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
			}
			return null;
		},
		
		detectBrowser: function() {
			var name = $.uaMatch(navigator.userAgent).browser;
			var userAgent = navigator.userAgent.toLowerCase();
			$.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
			var version = 0;
			// Is this a version of IE?
			if($.browser.msie){
				userAgent = $.browser.version;
				userAgent = userAgent.substring(0,userAgent.indexOf('.'));
				version = userAgent;
			}
			// Is this a version of Chrome?
			if($.browser.chrome){
				userAgent = userAgent.substring(userAgent.indexOf('chrome/') +7);
				userAgent = userAgent.substring(0,userAgent.indexOf('.'));
				version = userAgent;
				// If it is chrome then jQuery thinks it's safari so we have to tell it it isn't
				$.browser.safari = false;
				name = "chrome";
			}
			// Is this a version of Safari?
			if($.browser.safari){
				userAgent = userAgent.substring(userAgent.indexOf('safari/') +7);
				userAgent = userAgent.substring(0,userAgent.indexOf('.'));
				version = userAgent;
				name = "safari";
				if( navigator.userAgent.match(/iPad/i) != null ) {
					name = "iPad";
				}
				if( navigator.userAgent.match(/iPhone/i) != null ) {
					name = "iPhone";
				}
			}
			// Is this a version of Mozilla?
			if($.browser.mozilla){
				//Is it Firefox?
				if(navigator.userAgent.toLowerCase().indexOf('firefox') != -1){
					/* DEPRECATED, for FF we must separate 3.x subbranches
					userAgent = userAgent.substring(userAgent.indexOf('firefox/') +8);
					userAgent = userAgent.substring(0,userAgent.indexOf('.'));
					version = userAgent;
					*/
					userAgent = userAgent.substring(userAgent.indexOf('firefox/') +8);
					if( userAgent.indexOf(' ') >= 0 ) {
						userAgent = userAgent.substring(0,userAgent.indexOf(' '));
					}
					var userAgentA = userAgent.split(".");
					if( userAgentA.length > 2 ) {
						userAgentA.pop();
					}
					userAgent = userAgentA.join("");
					version = userAgent;
				} else {
					// If not then it must be another Mozilla
				}
			}
			// Is this a version of Opera?
			if($.browser.opera){
				userAgent = userAgent.substring(userAgent.indexOf('version/') +8);
				userAgent = userAgent.substring(0,userAgent.indexOf('.'));
				version = userAgent;
			}
			var result = {
				"name": name,
				"version": version
			};
			return result;
		},
		
		get3wmlBrowserIsMobile: function() {
			var detect = $.detectBrowser();
			var n = detect.name;
			if( n == "iPad" ) {
				return true;
			}
			else if( n == "iPhone" ) {
				return true;
			}
			return false;
		},
		
		get3wmlBrowserCompliance: function() {
			$.log(navigator.userAgent);
			var c = false;
			var g = false;
			var detect = $.detectBrowser();
			var n = detect.name;
			var v = parseInt(detect.version);
			if( n == "safari" && v >= 533 ) {
				c = true;
			}
			else if( n == "chrome" && v >= 11 ) {
				c = true;
			}
			else if( n == "mozilla" && v >= 36 ) {
				c = true;
			}
			else if( n == "iPad" && v >= 6533 ) {
				c = true;
			}
			else if( n == "iPhone" && v >= 6533 ) {
				c = true;
			}
			else if( n == "opera" && v >= 11 ) {
				c = true;
			}
			else if( n == "msie" && v >= 6 ) {
				g = true;
			}
			if(c) {
				$.log("setCompatibility succeeded, the browser is html5");
			} else {
				if( g ) {
					$.getScript("http://ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.min.js", function() {
//						$.log("http://ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.min.js loaded, prompting GCF install",true);
						CFInstall.check({
							mode: "overlay"
						});
					});
				} else {
//					$.log("setCompatibility failed, the browser is not html5",true);
				}
			}
			return c;
		},
		
		log: function(ticket) {
			if( _3WML_CONSOLE_LOGGING === false ) {
				return false;
			}
			$("head").trigger("log", [ticket]);
//			var detect = $.detectBrowser();
//			var n = detect.name;
//			if( n != "mozilla" && n != "chrome" ) {
//				return false;
//			}
			if( typeof(console) != "object" ) {
				return false;
			}
			if( typeof(console.log) != "function" || typeof(console.dir) != "function" ) {
				return false;
			}
			if( typeof(ticket) == "number" || typeof(ticket) == "string" || typeof(ticket) == "boolean" ) {
				console.log(ticket.toString());
			} else {
				console.dir(ticket);
			}
			return true;
		}
		
	}); // EO$.extends ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
})(jQuery);
;