$(function () {

	// popups for Storage setting input fields
	$("#crawlerDb")
	.popover({
		title: '任务上传地址',
		html: true,
		content: "任务上传地址<br /> http://192.168.5.158:8080/act-admin/meta/test/addSeed",
		placement: 'bottom'
	})
	.blur(function () {
		$(this).popover('hide');
	});
	$("#sitemapDb")
		.popover({
			title: '任务存储地址',
			html: true,
			content: "任务存储地址<br /> http://localhost:5984/scraper-sitemaps/",
			placement: 'bottom'
		})
		.blur(function () {
			$(this).popover('hide');
		});

	$("#dataDb")
		.popover({
			title: '数据存储地址',
			html: true,
			content: "数据存储. 针对每个任务会新建一个表来存储，默认表名为sitemap-data-任务ID.<br />http://localhost:5984/",
			placement: 'bottom'
		})
		.blur(function () {
			$(this).popover('hide');
		});

	// switch between configuration types
	$("select[name=storageType]").change(function () {
		var type = $(this).val();

		if (type === 'couchdb') {
			$(".form-group.couchdb").show();
		}
		else {
			$(".form-group.couchdb").hide();
		}
	});

	// Extension configuration
	var config = new Config();

	// load previously synced data
	config.loadConfiguration(function () {
		$("#crawlerDb").val(config.crawlerDb);
		$("#storageType").val(config.storageType);
		$("#sitemapDb").val(config.sitemapDb);
		$("#dataDb").val(config.dataDb);

		$("select[name=storageType]").change();
	});

	// Sync storage settings
	$("form#storage_configuration").submit(function () {
		var crawlerDb = $("#crawlerDb").val();
		var sitemapDb = $("#sitemapDb").val();
		var dataDb = $("#dataDb").val();
		var storageType = $("#storageType").val();

		var newConfig;

		if (storageType === 'local') {
			newConfig = {
				storageType: storageType,
				sitemapDb: ' ',
				dataDb: ' ',
				crawlerDb : crawlerDb
			}
		}
		else {
			newConfig = {
				storageType: storageType,
				sitemapDb: sitemapDb,
				dataDb: dataDb,
				crawlerDb : crawlerDb
			}
		}

		config.updateConfiguration(newConfig);
		return false;
	});
});