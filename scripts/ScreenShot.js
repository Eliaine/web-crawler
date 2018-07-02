var capResult = null;
var capResultDataURL = null;

var ScreenShot = function() {
	this.initialize();
};

ScreenShot.prototype = {
	/**
	 * @description ID of current tab
	 * @type {Number}
	 */
	tab : null,

	/**
	 * @description Canvas element
	 * @type {Object}
	 */
	screenshotCanvas : null,

	/**
	 * @description 2D context of screenshotCanvas element
	 * @type {Object}
	 */
	screenshotContext : null,

	/**
	 * @description Number of pixels by which to move the screen
	 * @type {Number}
	 */
	scrollBy : 0,

	/**
	 * @description Sizes of page
	 * @type {Object}
	 */
	size : {
		width : 0,
		height : 0
	},

	/**
	 * @description Keep original params of page
	 * @type {Object}
	 */
	originalParams : {
		overflow : "",
		scrollTop : 0
	},

	/**
	 * @description Initialize plugin
	 */
	initialize : function() {
		this.screenshotCanvas = document.createElement("canvas");
		this.screenshotContext = this.screenshotCanvas.getContext("2d");
	},

	/**
	 * 设置tab
	 */
	setTabId : function(tab) {
		this.tab = tab;
	},

	/**
	 * 根据请求设置相关参数
	 */
	setPageDetail : function(request) {
		this.size = request.size;
		this.scrollBy = request.scrollBy;
		this.originalParams = request.originalParams;

		// set width & height of canvas element
		this.screenshotCanvas.width = this.size.width;
		this.screenshotCanvas.height = this.size.height;

		this.scrollTo(0);
	},

	/**
	 * @description Send request to scroll page on given position
	 * @param {Number}
	 *            position
	 */
	scrollTo : function(position) {
		chrome.tabs.sendMessage(this.tab.id, {
			scrollPage : true,
			"size" : this.size,
			"scrollBy" : this.scrollBy,
			"scrollTo" : position
		});
	},

	/**
	 * @description Takes screenshot of visible area and merges it
	 * @param {Number}
	 *            position
	 * @param {Boolean}
	 *            lastCapture
	 */
	capturePage : function(position, lastCapture) {
		var self = this;

		setTimeout(function() {
			chrome.tabs.captureVisibleTab(null, {
				"format" : "png"
			}, function(dataURI) {
				var newWindow, image = new Image();

				if (typeof dataURI !== "undefined") {
					image.onload = function() {
						self.screenshotContext.drawImage(image, 0, position);

						if (lastCapture) {
							self.resetPage();
							// newWindow = window.open();
							// newWindow.document.write("<style
							// type='text/css'>body {margin: 0;}</style>");
							// newWindow.document.write("<img src='" +
							// self.screenshotCanvas.toDataURL("image/png") +
							// "'/>");

							capResult = image;
							capResultDataURL = self.screenshotCanvas
									.toDataURL("image/png");
							chrome.tabs.create({
								url : "Captured.html"
							});
						} else {
							self.scrollTo(position + self.scrollBy);
						}
					};

					image.src = dataURI;
				} else {
					chrome.tabs.sendMessage(self.tab.id, {
						showError : true,
						"originalParams" : self.originalParams
					});
				}
			});
		}, 300);
	},

	/**
	 * @description Send request to set original params of page
	 */
	resetPage : function() {
		chrome.tabs.sendMessage(this.tab.id, {
			resetPage : true,
			"originalParams" : this.originalParams
		});
	}
};

function LinksGrabber(doc) {
	var root = doc, horzMoving = false, stubbornNodes = [];
	return {
		elementExists : function(elem) {
			for (var i = 0; i < stubbornNodes.length; ++i)
				if (stubbornNodes[i].elem === elem)
					return true;

			return false;
		},
		isChildOf : function(parent, element) {
			var p = element.parentNode;
			while (p) {
				if (p == parent)
					return true;
				else
					p = p.parentNode;
			}
			return false;
		},
		hideStubbornElements : function() {
			var itr = root.createNodeIterator(root.documentElement,
					NodeFilter.SHOW_ELEMENT, null, false), current;
			while (current = itr.nextNode()) {
				var style = root.defaultView.getComputedStyle(current, "");
				if (style
						&& (style.getPropertyValue("position") == "fixed" || style
								.getPropertyValue("position") == "sticky")
						&& !this.elementExists(current)
						&& style.getPropertyValue("display") != "none") {
					// if (current.scrollWidth > window.innerWidth * 0.9 &&
					// current.scrollHeight > window.innerHeight * 0.9)
					// continue;
					console.log("Found stubborn element " + current.id);
					stubbornNodes.push({
						elem : current,
						opacity : style.getPropertyValue("opacity")
					});
				}
			}

			for (var i = 0; i < stubbornNodes.length; ++i)
				// stubbornNodes[i].elem.style.setProperty("display", "none");
				stubbornNodes[i].elem.style.setProperty("opacity", "0");
		}
	}
};
