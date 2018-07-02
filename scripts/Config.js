var Config = function () {

};

Config.prototype = {

	sitemapDb: '',
	dataDb: '',
	crawlerDb:'',

	defaults: {
		storageType: "local",
		// this is where sitemap documents are stored
		sitemapDb: "",
		// this is where scraped data is stored.
		// empty for local storage
		dataDb: "",
		crawlerDb :""
	},

	/**
	 * Loads configuration from chrome extension sync storage
	 */
	loadConfiguration: function (callback) {

		chrome.storage.sync.get(['sitemapDb', 'dataDb', 'storageType','crawlerDb'], function (items) {

			this.storageType = items.storageType || this.defaults.storageType;
			if (this.storageType === 'local') {
				this.sitemapDb = this.defaults.sitemapDb;
				this.dataDb = this.defaults.dataDb;
			}
			else {
				this.sitemapDb = items.sitemapDb || this.defaults.sitemapDb;
				this.dataDb = items.dataDb || this.defaults.dataDb;
			}
			this.crawlerDb = items.crawlerDb || this.defaults.crawlerDb;
			callback();
		}.bind(this));
	},

	/**
	 * Saves configuration to chrome extension sync storage
	 * @param {type} items
	 * @param {type} callback
	 * @returns {undefined}
	 */
	updateConfiguration: function (items, callback) {
		chrome.storage.sync.set(items, callback);
	}
};