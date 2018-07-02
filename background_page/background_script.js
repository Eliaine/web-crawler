var config = new Config();
var shot = new ScreenShot();
var store;
config.loadConfiguration(function () {
	console.log("initial configuration", config);
	store = new Store(config);
});

chrome.storage.onChanged.addListener(function () {
	config.loadConfiguration(function () {
		console.log("configuration changed", config);
		store = new Store(config);
	});
});

var sendToActiveTab = function(request, callback) {
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function (tabs) {
		if (tabs.length < 1) {
			this.console.log("couldn't find active tab");
		}
		else {
			var tab = tabs[0];
			chrome.tabs.sendMessage(tab.id, request, callback);
		}
	});
};

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {

		console.log("background:chrome.runtime.onMessage", request);
		if (request.createSitemap) {
			store.createSitemap(request.sitemap, sendResponse);
			return true;
		}
		else if (request.saveSitemap) {
			store.saveSitemap(request.sitemap, sendResponse);
			return true;
		}
		else if (request.deleteSitemap) {
			store.deleteSitemap(request.sitemap, sendResponse);
			return true;
		}
		else if (request.getAllSitemaps) {
			store.getAllSitemaps(sendResponse);
			return true;
		}
		else if (request.sitemapExists) {
			console.log("background receive sitemapExists");
			store.sitemapExists(request.sitemapId, sendResponse);
			return true;
		}
		else if (request.getSitemapData) {
			store.getSitemapData(new Sitemap(request.sitemap), sendResponse);
			return true;
		}
		else if(request.saveSitemapExport){
			console.log("background received createSitemapUpload extraction request");
			store.createSitemapUpload(request.sitemap, sendResponse);
			return true;
		}
		else if (request.scrapeSitemap) {
			var sitemap = new Sitemap(request.sitemap);
			var queue = new Queue();
			var browser = new ChromePopupBrowser({
				pageLoadDelay: request.pageLoadDelay
			});

			var scraper = new Scraper({
				queue: queue,
				sitemap: sitemap,
				browser: browser,
				store: store,
				requestInterval: request.requestInterval
			});

			try {
				scraper.run(function () {
					browser.close();
					var notification = chrome.notifications.create("采集结束", {
						type: 'basic',
						iconUrl: 'assets/images/crawler128.png',
						title: '采集结束',
						message: '网站： ' + sitemap.name+'结束采集'
					}, function(id) {
						// notification showed
					});
					sendResponse();
				});
			}
			catch (e) {
				console.log("Scraper execution cancelled".e);
			}

			return true;
		}
		else if(request.previewSelectorData) {
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function (tabs) {
				if (tabs.length < 1) {
					this.console.log("couldn't find active tab");
				}
				else {
					var tab = tabs[0];
					chrome.tabs.sendMessage(tab.id, request, sendResponse);
				}
			});
			return true;
		}else if(request.startScreenShot){
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function (tabs) {
				if (tabs.length < 1) {
					this.console.log("couldn't find active tab");
				}
				else {
					var tab = tabs[0];
					shot.setTabId(tab);
					var request2 = {
						getPageDetails: true
					};
					chrome.tabs.sendMessage(tab.id, request2, sendResponse);
				}
			});
			return true;
		}else if (request.setPageDetails) {
			shot.setPageDetail(request);
		} else if (request.capturePage) {
			shot.capturePage(request.position, request.lastCapture);
		}
		else if(request.backgroundScriptCall) {

			var backgroundScript = getBackgroundScript("BackgroundScript");
			var deferredResponse = backgroundScript[request.fn](request.request)
			deferredResponse.done(function(response){
				sendResponse(response);
			});

			return true;
		}
		
	}
);
