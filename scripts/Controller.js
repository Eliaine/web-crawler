var SitemapController = function (options) {

	for (var i in options) {
		this[i] = options[i];
	}
	this.init();
};

SitemapController.prototype = {

	backgroundScript: getBackgroundScript("DevTools"),
	contentScript: getContentScript("DevTools"),

	control: function (controls) {
		var controller = this;

		for (var selector in controls) {
			for (var event in controls[selector]) {
				$(document).on(event, selector, (function (selector, event) {
					return function () {
						var continueBubbling = controls[selector][event].call(controller, this);
						if (continueBubbling !== true) {
							return false;
						}
					}
				})(selector, event));
			}
		}
	},

	/**
	 * Loads templates for ICanHaz
	 */
	loadTemplates: function (cbAllTemplatesLoaded) {
		var templateIds = [
			'Viewport',
			'SitemapList',
			'SitemapListItem',
			'SitemapCreate',
			'SitemapStartUrlField',
			'SitemapImport',
			'SitemapExport',
			'SitemapBrowseData',
			'SitemapScrapeConfig',
			'SitemapExportDataCSV',
			'SitemapEditMetadata',
			'SelectorList',
			'SelectorListItem',
			'SelectorEdit',
			'SelectorEditTableColumn',
			'SitemapSelectorGraph',
			'DataPreview'
		];
		var templatesLoaded = 0;
		var cbLoaded = function (templateId, template) {
			templatesLoaded++;
			ich.addTemplate(templateId, template);
			if (templatesLoaded === templateIds.length) {
				cbAllTemplatesLoaded();
			}
		}

		templateIds.forEach(function (templateId) {
			$.get(this.templateDir + templateId + '.html', cbLoaded.bind(this, templateId));
		}.bind(this));
	},
	
	loadSelectorsTypes : function(){
		var selectorsTypes = [
			{
				type: 'SelectorText',
				title: '文本选择器'
			},
			{
				type: 'SelectorLink',
				title: '链接选择器'
			},
			{
				type: 'SelectorPopupLink',
				title: '弹出窗链接选择器'
			},
			{
				type: 'SelectorImage',
				title: '图片选择器'
			},
			{
				type: 'SelectorTable',
				title: '表格选择器'
			},
			{
				type: 'SelectorElementAttribute',
				title: '属性选择器'
			},
			{
				type: 'SelectorHTML',
				title: 'HTML选择器'
			},
			{
				type: 'SelectorGroup',
				title: '归类选择器'
			},
			{
				type: 'SelectorElement',
				title: '元素选择器'
			},
			{
				type: 'SelectorElementScroll',
				title: '滚动元素选择器'
			},
			{
				type: 'SelectorElementClick',
				title: '点击元素选择器'
			}
		];
		return selectorsTypes;
	},

	init: function () {
		
		this.loadTemplates(function () {
			// currently viewed objects
			this.clearState();

			// render main viewport
			ich.Viewport().appendTo("body");

			// cancel all form submits
			$("form").bind("submit", function () {
				return false;
			});

			this.control({
				'#sitemaps-nav-button': {
					click: this.showSitemaps
				},
				'#create-sitemap-create-nav-button': {
					click: this.showCreateSitemap
				},
				'#create-sitemap-import-nav-button': {
					click: this.showImportSitemapPanel
				},
				'#sitemap-export-nav-button': {
					click: this.showSitemapExportPanel
				},
				'#sitemap-export-data-csv-nav-button': {
					click: this.showSitemapExportDataCsvPanel
				},
				'#submit-create-sitemap': {
					click: this.createSitemap
				},
				'#submit-import-sitemap': {
					click: this.importSitemap
				},
				'#sitemap-edit-metadata-nav-button': {
					click: this.editSitemapMetadata
				},
				'#sitemap-selector-list-nav-button': {
					click: this.showSitemapSelectorList
				},
				'#sitemap-selector-graph-nav-button': {
					click: this.showSitemapSelectorGraph
				},
				'#sitemap-browse-nav-button': {
					click: this.browseSitemapData
				},
				'button#submit-edit-sitemap': {
					click: this.editSitemapMetadataSave
				},
				'#edit-sitemap-metadata-form': {
					submit: function(){return false;}
				},
				'#sitemaps tr': {
					click: this.editSitemap
				},
				'#sitemaps button[action=delete-sitemap]': {
					click: this.deleteSitemap
				},
				'#sitemap-scrape-nav-button': {
					click: this.showScrapeSitemapConfigPanel
				},
				'#submit-scrape-sitemap-form': {
					submit: function(){return false;}
				},
				'#submit-scrape-sitemap': {
					click: this.scrapeSitemap
				},
				"#sitemaps button[action=browse-sitemap-data]": {
					click: this.sitemapListBrowseSitemapData
				},
				'#sitemaps button[action=csv-download-sitemap-data]': {
					click: this.downloadSitemapData
				},
				"button[action=submit-sitemap-upload]": {
					click: this.saveSitemapExport
				},
				"button[action=submit-sitemap-upload-back]": {
					click: this.showSitemapSelectorList
				},
				
				// @TODO move to tr
				'#selector-tree tbody tr': {
					click: this.showChildSelectors
				},
				'#selector-tree .breadcrumb a': {
					click: this.treeNavigationshowSitemapSelectorList
				},
				'#selector-tree tr button[action=edit-selector]': {
					click: this.editSelector
				},
				'#edit-selector select[name=type]': {
					change: this.selectorTypeChanged
				},
				'#edit-selector button[action=save-selector]': {
					click: this.saveSelector
				},
				'#edit-selector button[action=cancel-selector-editing]': {
					click: this.cancelSelectorEditing
				},
				'#edit-selector #selectorId': {
					keyup: this.updateSelectorParentListOnIdChange
				},
				'#selector-tree button[action=add-selector]': {
					click: this.addSelector
				},
				"#selector-tree tr button[action=delete-selector]": {
					click: this.deleteSelector
				},
				"#selector-tree tr button[action=preview-selector]": {
					click: this.previewSelectorFromSelectorTree
				},
				"#selector-tree tr button[action=data-preview-selector]": {
					click: this.previewSelectorDataFromSelectorTree
				},
				"#edit-selector button[action=select-selector]": {
					click: this.selectSelector
				},
				"#edit-selector button[action=select-table-header-row-selector]": {
					click: this.selectTableHeaderRowSelector
				},
				"#edit-selector button[action=select-table-data-row-selector]": {
					click: this.selectTableDataRowSelector
				},
				"#edit-selector button[action=preview-selector]": {
					click: this.previewSelector
				},
				"#edit-selector button[action=preview-click-element-selector]": {
					click: this.previewClickElementSelector
				},
				"#edit-selector button[action=preview-table-row-selector]": {
					click: this.previewTableRowSelector
				},
				"#edit-selector button[action=preview-selector-data]": {
					click: this.previewSelectorDataFromSelectorEditing
				},
				"button.add-extra-start-url": {
					click: this.addStartUrl
				},
				"button.remove-start-url": {
					click: this.removeStartUrl
				},
				'#screenshot-button': {
					click: this.screenShot
				}
			});
			this.showSitemaps();
		}.bind(this));
	},

	clearState: function () {
		this.state = {
			// sitemap that is currently open
			currentSitemap: null,
			// selector ids that are shown in the navigation
			editSitemapBreadcumbsSelectors: null,
			currentParentSelectorId: null,
			currentSelector: null
		};
	},

	setStateEditSitemap: function (sitemap) {
		this.state.currentSitemap = sitemap;
		this.state.editSitemapBreadcumbsSelectors = [
			{id: '_root',name:sitemap.name}
		];
		this.state.currentParentSelectorId = '_root';
	},

	setActiveNavigationButton: function (navigationId) {
		$(".nav .active").removeClass("active");
		$("#" + navigationId + "-nav-button").closest("li").addClass("active");

		if (navigationId.match(/^sitemap-/)) {
			$("#sitemap-nav-button").removeClass("disabled");
			$("#sitemap-nav-button").closest("li").addClass('active');
			$("#navbar-active-sitemap-id").text("(" + this.state.currentSitemap.name + ")");
		}
		else {
			$("#sitemap-nav-button").addClass("disabled");
			$("#navbar-active-sitemap-id").text("");
		}

		if (navigationId.match(/^create-sitemap-/)) {
			$("#create-sitemap-nav-button").closest("li").addClass('active');
		}
	},

	/**
	 * Simple info popup for sitemap start url input field
	 */
	initMultipleStartUrlHelper: function () {
		$("#startUrl")
			.popover({
				title: '多个入口URL',
				html: true,
				content: "你可以创建一个正则范围的入口URL，例如:<br />http://example.com/[1-100].html",
				placement: 'bottom'
			})
			.blur(function () {
				$(this).popover('hide');
			});
	},

	/**
	 * Returns bootstrapValidator object for current form in viewport
	 */
	getFormValidator: function() {

		var validator = $('#viewport form').data('bootstrapValidator');
		return validator;
	},

	/**
	 * Returns whether current form in the viewport is valid
	 * @returns {Boolean}
	 */
	isValidForm: function() {
		var validator = this.getFormValidator();

		//validator.validate();
		// validate method calls submit which is not needed in this case.
		for (var field in validator.options.fields) {
			validator.validateField(field);
		}

		var valid = validator.isValid();
		return valid;
	},

	/**
	 * Add validation to sitemap creation or editing form
	 */
	initSitemapValidation: function() {
		//给名字的输入框添加onblur事件，跟着修改ID
		$("#viewport form input[name=_name]").blur(function(){
		  var name = $("#viewport form input[name=_name]").val();
		  if(name!=null && name!=""){
		  	var id = $("#viewport form input[name=_id]").val();
		  	if(id==null || id == ""){
		  		//默认先将name的md5值赋值
		  		id = md5(name);
				$("#viewport form input[name=_id]").val(id);
		  	}
		  }
		});
		$('#viewport form').bootstrapValidator({
			fields: {
				"_name": {
					validators: {
						notEmpty: {
							message: '网站名称必填'
						},
						stringLength: {
							min: 2,
							message: '网站名称的长度必须在2个字符以上'
						},
						regexp: {
							regexp: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
							message: '只能含有汉字、数字、字母、下划线'
						}
					}
				},
				'_id': {
		          validators: {
		            notEmpty: {
		              message: '网站ID不能为空'
		            },
		            stringLength: {
		              min: 3,
		              message: '网站ID的长度必须在3个字符以上'
		            },
		            regexp: {
		              regexp: /^[a-z][a-z0-9_$()+\-/]+$/,
		              message: '网站ID只支持字母 (a-z), 数字 (0-9), 或者 _, $, (, ), +, -, / 。 并且必须以字母开头。'
		            },
		            callback: {
		              message: '网站ID已经存在',
		              callback: function (value, validator) {
		                return true
		              }
		            }
		          }
		        },
				"startUrl[]": {
					validators: {
						notEmpty: {
							message: '入口URL不能为空'
						},
						uri: {
							message: '入口URL的格式不正确'
						}
					}
				}
			}
		});
	},

	showCreateSitemap: function () {
		this.setActiveNavigationButton('create-sitemap-create');
		var sitemapForm = ich.SitemapCreate();
		$("#viewport").html(sitemapForm);
		this.initMultipleStartUrlHelper();
		this.initSitemapValidation();

		return true;
	},

	initImportStiemapValidation: function(){
		//给名字的输入框添加onblur事件，跟着修改ID
		$("#viewport form input[name=_name]").blur(function(){
		  var name = $("#viewport form input[name=_name]").val();
		  if(name!=null && name!=""){
		  	var id = $("#viewport form input[name=_id]").val();
		  	if(id==null || id == ""){
		  		//默认先将name的md5值赋值
		  		id = md5(name);
				$("#viewport form input[name=_id]").val(id);
		  	}
		  }
		});
		$('#viewport form').bootstrapValidator({
			fields: {
				"_name": {
					validators: {
						stringLength: {
							min: 2,
							message: '网站名称的长度必须在2个字符以上'
						},
						regexp: {
							regexp: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
							message: '只能含有汉字、数字、字母、下划线'
						}
					}
				},
				'_id': {
		          validators: {
		            stringLength: {
		              min: 3,
		              message: '网站ID的长度必须在3个字符以上'
		            },
		            regexp: {
		              regexp: /^[a-z][a-z0-9_$()+\-/]+$/,
		              message: '网站ID只支持字母 (a-z), 数字 (0-9), 或者 _, $, (, ), +, -, / 。 并且必须以字母开头。'
		            },
		            callback: {
		              message: '网站ID已经存在',
		              callback: function (value, validator) {
		                return true
		              }
		            }
		          }
		        },
				sitemapJSON: {
					validators: {
						notEmpty: {
							message: '网站导入JSON不能为空'
						},
						callback: {
							message: 'JSON格式不正确',
							callback: function(value, validator) {
								try {
									JSON.parse(value);
								} catch (e) {
									return false;
								}
								return true;
							}.bind(this)
						}
					}
				}
			}
		});
	},

	showImportSitemapPanel: function () {
		this.setActiveNavigationButton('create-sitemap-import');
		var sitemapForm = ich.SitemapImport();
		$("#viewport").html(sitemapForm);
		this.initImportStiemapValidation();
		return true;
	},

	showSitemapExportPanel: function () {
		this.setActiveNavigationButton('sitemap-export');
		var sitemap = this.state.currentSitemap;
		var sitemapJSON = sitemap.exportSitemap();
		var sitemapExportForm = ich.SitemapExport({
			sitemapJSON: sitemapJSON
		});
		$("#viewport").html(sitemapExportForm);
		return true;
	},

	showSitemaps: function () {

		this.clearState();
		this.setActiveNavigationButton("sitemaps");

		this.store.getAllSitemaps(function (sitemaps) {
			$sitemapListPanel = ich.SitemapList();
			sitemaps.forEach(function (sitemap) {
				$sitemap = ich.SitemapListItem(sitemap);
				$sitemap.data("sitemap", sitemap);
				$sitemapListPanel.find("tbody").append($sitemap);
			});
			$("#viewport").html($sitemapListPanel);
		});
	},

	getSitemapFromMetadataForm: function(){

		var id = $("#viewport form input[name=_id]").val();
		var name = $("#viewport form input[name=_name]").val();
		console.log(id+","+name)
		if(id==null || id ==""){
			id = md5(name);
			$("#viewport form input[name=_id]").val(id);
		}
		
		var $startUrlInputs = $("#viewport form .input-start-url");
		var startUrl;
		if($startUrlInputs.length === 1) {
			startUrl = $startUrlInputs.val();
		}
		else {
			startUrl = [];
			$startUrlInputs.each(function(i, element) {
				startUrl.push($(element).val());
			});
		}

		return {
			id:id,
			name:name,
			startUrl:startUrl
		};
	},

	createSitemap: function (form) {

		// cancel submit if invalid form
		if(!this.isValidForm()) {
			return false;
		}

		var sitemapData = this.getSitemapFromMetadataForm();
		console.log("crontroller receive sitemapExists");
		// check whether sitemap with this id already exist
		this.store.sitemapExists(sitemapData.id, function (sitemapExists) {
			if(sitemapExists) {
				var validator = this.getFormValidator();
				validator.updateStatus('_id', 'INVALID', 'callback');
			}
			else {
				var sitemap = new Sitemap({
					_id: sitemapData.id,
					name:sitemapData.name,
					startUrl: sitemapData.startUrl,
					selectors: []
				});
				this.store.createSitemap(sitemap, function (sitemap) {
					this._editSitemap(sitemap, ['_root']);
				}.bind(this, sitemap));
			}

		}.bind(this));
	},

	importSitemap: function () {

		// cancel submit if invalid form
		if(!this.isValidForm()) {
			return false;
		}

		// load data from form
		var sitemapJSON = $("[name=sitemapJSON]").val();
		var name = $("input[name=_name]").val();
		var id = $("input[name=_id]").val();
		if(id==null || id == ""){
			if(name!=undefined && name!=null && name!=""){
				id = md5(name);
				$("input[name=_id]").val(id);
			}
		}
		
		//var id = $("input[name=_id]").val();
		var sitemap = new Sitemap();
		sitemap.importSitemap(sitemapJSON);
		if(id.length) {
			sitemap._id = id;
		}
		if(name.length){
			sitemap.name = name;
		}
		// check whether sitemap with this id already exist
		this.store.sitemapExists(sitemap._id, function (sitemapExists) {
			if(sitemapExists) {
				var validator = this.getFormValidator();
				validator.updateStatus('_id', 'INVALID', 'callback');
			}
			else {
				this.store.createSitemap(sitemap, function (sitemap) {
					this._editSitemap(sitemap, ['_root']);
				}.bind(this, sitemap));
			}
		}.bind(this));
	},

	editSitemapMetadata: function (button) {

		this.setActiveNavigationButton('sitemap-edit-metadata');

		var sitemap = this.state.currentSitemap;
		var $sitemapMetadataForm = ich.SitemapEditMetadata(sitemap);
		$("#viewport").html($sitemapMetadataForm);
		this.initMultipleStartUrlHelper();
		this.initSitemapValidation();

		return true;
	},

	editSitemapMetadataSave: function (button) {
		var sitemap = this.state.currentSitemap;
		var sitemapData = this.getSitemapFromMetadataForm();

		// cancel submit if invalid form
		if(!this.isValidForm()) {
			return false;
		}
		
		// check whether sitemap with this id already exist
		this.store.sitemapExists(sitemapData.id, function (sitemapExists) {
			if(sitemap._id !== sitemapData.id && sitemapExists) {
				var validator = this.getFormValidator();
				validator.updateStatus('_id', 'INVALID', 'callback');
				return;
			}

			// change data
			sitemap.name = sitemapData.name;
			sitemap.startUrl = sitemapData.startUrl;

			// just change sitemaps url
			if (sitemapData.id === sitemap._id) {
				this.store.saveSitemap(sitemap, function (sitemap) {
					this.setStateEditSitemap(sitemap);
					this.showSitemapSelectorList();
				}.bind(this));
			}
			// id changed. we need to delete the old one and create a new one
			else {
				var newSitemap = new Sitemap(sitemap);
				var oldSitemap = sitemap;
				newSitemap._id = sitemapData.id;
				this.store.createSitemap(newSitemap, function (newSitemap) {
					this.store.deleteSitemap(oldSitemap, function () {
						//this.state.currentSitemap = newSitemap;
						this.setStateEditSitemap(newSitemap);
						this.showSitemapSelectorList();
					}.bind(this));
				}.bind(this));
			}

		}.bind(this));
	},

	/**
	 * Callback when sitemap edit button is clicked in sitemap grid
	 */
	editSitemap: function (tr) {

		var sitemap = $(tr).data("sitemap");
		this._editSitemap(sitemap);
	},
	_editSitemap: function (sitemap) {
		this.setStateEditSitemap(sitemap);
		this.setActiveNavigationButton("sitemap");

		this.showSitemapSelectorList();
	},
	showSitemapSelectorList: function () {

		this.setActiveNavigationButton('sitemap-selector-list');

		var sitemap = this.state.currentSitemap;
		var parentSelectors = this.state.editSitemapBreadcumbsSelectors;
		var parentSelectorId = this.state.currentParentSelectorId;

		var $selectorListPanel = ich.SelectorList({
			parentSelectors: parentSelectors
		});
		
		var selectTypes = this.loadSelectorsTypes();
		var selectors = sitemap.getDirectChildSelectors(parentSelectorId);
		//将type进行转换
		
		selectors.forEach(function (selector) {
			var type = selector.type;
			var typeName = "";
			selectTypes.forEach(function (stypes) {
				if(stypes.type == type){
					typeName = stypes.title;
				}
			});
			selector.typeName =  typeName;
			$selector = ich.SelectorListItem(selector);
			$selector.data("selector", selector);
			$selectorListPanel.find("tbody").append($selector);
		});
		$("#viewport").html($selectorListPanel);

		return true;
	},
	showSitemapSelectorGraph: function () {
		this.setActiveNavigationButton('sitemap-selector-graph');
		var sitemap = this.state.currentSitemap;
		var $selectorGraphPanel = ich.SitemapSelectorGraph();
		$("#viewport").html($selectorGraphPanel);
		var graphDiv = $("#selector-graph")[0];
		var graph = new SelectorGraphv2(sitemap);
		graph.draw(graphDiv, $(document).width(), 200);
		return true;
	},
	showChildSelectors: function (tr) {
		var selector = $(tr).data('selector');
		var parentSelectors = this.state.editSitemapBreadcumbsSelectors;
		this.state.currentParentSelectorId = selector.id;
		parentSelectors.push(selector);
		
		this.showSitemapSelectorList();
	},
	saveSitemapExport: function (button) {
		console.log("createSitemapUpload start...");
		var siteJson = $("#sitemap_json").val();
		if(siteJson!=undefined && siteJson!=""){
			this.store.saveSitemapExport(siteJson, function () {
				$("#uploadResult").html("上传成功！");
				$("#sitemapUploadAlert").addClass("in");
			}.bind(this));
		}
	},
	treeNavigationshowSitemapSelectorList: function (button) {
		var parentSelectors = this.state.editSitemapBreadcumbsSelectors;
		var controller = this;
		$("#selector-tree .breadcrumb li a").each(function (i, parentSelectorButton) {
			if (parentSelectorButton === button) {
				parentSelectors.splice(i + 1);
				controller.state.currentParentSelectorId = parentSelectors[i].id;
			}
		});
		this.showSitemapSelectorList();
	},

	initSelectorValidation: function() {

		$('#viewport form').bootstrapValidator({
			fields: {
				"id": {
					validators: {
						notEmpty: {
							message: '任务字段名不能为空'
						},
						stringLength: {
							min: 3,
							message: '任务字段名的长度必须在3个字符以上'
						},
						regexp: {
							regexp: /^[^_].*$/,
							message: '任务字段名不能以 _开头'
						}
					}
				},
				"name": {
					validators: {
						notEmpty: {
							message: '任务名称不能为空'
						},
						stringLength: {
							min: 2,
							message: '任务名称的长度必须在2个字符以上'
						},
						regexp: {
							regexp: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
							message: '任务名称只能含有汉字、数字、字母、下划线'
						}
					}
				},
				selector: {
					validators: {
						notEmpty: {
							message: '抽取规则不能为空'
						}
					}
				},
				regex: {
					validators: {
						callback: {
							message: 'JavaScript 不支持该正则表达式，所以将匹配不到数据',
							callback: function(value, validator) {
								// allow no regex
								if(!value) {
									return true;
								}

								var matches = "".match(new RegExp(value));
								if(matches !== null && matches[0] === "") {
									return false;
								}
								else {
									return true;
								}
							}
						}
					}
				},
				clickElementSelector: {
					validators: {
						notEmpty: {
							message: '元素单击选择器不能为空'
						}
					}
				},
				tableHeaderRowSelector: {
					validators: {
						notEmpty: {
							message: '表头选择不能为空'
						}
					}
				},
				tableDataRowSelector: {
					validators: {
						notEmpty: {
							message: '表数据选择不能为空'
						}
					}
				},
				delay: {
					validators: {
						numeric: {
							message: '请求间隔必须为数字'
						}
					}
				},
				parentSelectors: {
					validators: {
						notEmpty: {
							message: '你必须选择一个父任务'
						},
						callback: {
							message: '无法处理子任务',
							callback: function(value, validator, $field) {

								var sitemap = this.getCurrentlyEditedSelectorSitemap();
								return !sitemap.selectors.hasRecursiveElementSelectors();

							}.bind(this)
						}
					}
				}
			}
		});
	},
	editSelector: function (button) {
		var selector = $(button).closest("tr").data('selector');
		this._editSelector(selector);
	},
	updateSelectorParentListOnIdChange: function() {

		var selector = this.getCurrentlyEditedSelector();
		$(".currently-edited").val(selector.id).text(selector.id);
	},
	_editSelector: function (selector) {

		var sitemap = this.state.currentSitemap;
		var selectorIds = sitemap.getPossibleParentSelectorIds();

		var $editSelectorForm = ich.SelectorEdit({
			selector: selector,
			selectorIds: selectorIds,
			selectorTypes: this.loadSelectorsTypes()
		});
		$("#viewport").html($editSelectorForm);
		// mark initially opened selector as currently edited
		$("#edit-selector #parentSelectors option").each(function(i, element) {
			if($(element).val() === selector.id) {
				$(element).addClass("currently-edited");
			}
		});

		// set clickType
		if(selector.clickType) {
			$editSelectorForm.find("[name=clickType]").val(selector.clickType);
		}
		// set clickElementUniquenessType
		if(selector.clickElementUniquenessType) {
			$editSelectorForm.find("[name=clickElementUniquenessType]").val(selector.clickElementUniquenessType);
		}

		// handle selects seperately
		$editSelectorForm.find("[name=type]").val(selector.type);
		selector.parentSelectors.forEach(function (parentSelectorId) {
			$editSelectorForm.find("#parentSelectors [value='" + parentSelectorId + "']").attr("selected", "selected");
		});

		this.state.currentSelector = selector;
		this.selectorTypeChanged();
		this.initSelectorValidation();
	},
	selectorTypeChanged: function () {
		var type = $("#edit-selector select[name=type]").val();
		var features = window[type].getFeatures();
		$("#edit-selector .feature").hide();
		features.forEach(function (feature) {
			$("#edit-selector .feature-" + feature).show();
		});

		// add this selector to possible parent selector
		var selector = this.getCurrentlyEditedSelector();
		if(selector.canHaveChildSelectors()) {
			if($("#edit-selector #parentSelectors .currently-edited").length === 0) {
				var $option = $('<option class="currently-edited"></option>');
				$option.text(selector.id).val(selector.id);
				$("#edit-selector #parentSelectors").append($option);
			}
		}
		// remove if type doesn't allow to have child selectors
		else {
			$("#edit-selector #parentSelectors .currently-edited").remove();
		}
	},
	saveSelector: function (button) {

		var sitemap = this.state.currentSitemap;
		var selector = this.state.currentSelector;
		var newSelector = this.getCurrentlyEditedSelector();

		// cancel submit if invalid form
		if(!this.isValidForm()) {
			return false;
		}

		// cancel possible element selection
		this.contentScript.removeCurrentContentSelector().done(function(){
			sitemap.updateSelector(selector, newSelector);

			this.store.saveSitemap(sitemap, function () {
				this.showSitemapSelectorList();
			}.bind(this));
		}.bind(this));
	},
	/**
	 * Get selector from selector editing form
	 */
	getCurrentlyEditedSelector: function () {
		var id = $("#edit-selector [name=id]").val();
		var taskName = $("#edit-selector [id=selectorName]").val();
		
		var selectorsSelector = $("#edit-selector [name=selector]").val();
		var tableDataRowSelector = $("#edit-selector [name=tableDataRowSelector]").val();
		var tableHeaderRowSelector = $("#edit-selector [name=tableHeaderRowSelector]").val();
		var clickElementSelector = $("#edit-selector [name=clickElementSelector]").val();
		var type = $("#edit-selector [name=type]").val();
		var clickElementUniquenessType = $("#edit-selector [name=clickElementUniquenessType]").val();
		var clickType = $("#edit-selector [name=clickType]").val();
		var discardInitialElements = $("#edit-selector [name=discardInitialElements]").is(":checked");
		var multiple = $("#edit-selector [name=multiple]").is(":checked");
		var downloadImage = $("#edit-selector [name=downloadImage]").is(":checked");
		var clickPopup = $("#edit-selector [name=clickPopup]").is(":checked");
		var regex = $("#edit-selector [name=regex]").val();
		var delay = $("#edit-selector [name=delay]").val();
		var extractAttribute = $("#edit-selector [name=extractAttribute]").val();
		var parentSelectors = $("#edit-selector [name=parentSelectors]").val();
		var columns = [];
		var $columnHeaders = $("#edit-selector .column-header");
		var $columnNames = $("#edit-selector .column-name");
		var $columnExtracts = $("#edit-selector .column-extract");

		$columnHeaders.each(function(i){
			var header = $($columnHeaders[i]).val();
			var name = $($columnNames[i]).val();
			var extract = $($columnExtracts[i]).is(":checked");
			columns.push({
				header:header,
				name:name,
				extract:extract
			});
		});

		var newSelector = new Selector({
			id: id,
			name : taskName,
			selector: selectorsSelector,
			tableHeaderRowSelector: tableHeaderRowSelector,
			tableDataRowSelector: tableDataRowSelector,
			clickElementSelector: clickElementSelector,
			clickElementUniquenessType: clickElementUniquenessType,
			clickType: clickType,
			discardInitialElements: discardInitialElements,
			type: type,
			multiple: multiple,
			downloadImage: downloadImage,
			clickPopup: clickPopup,
			regex: regex,
			extractAttribute:extractAttribute,
			parentSelectors: parentSelectors,
			columns:columns,
			delay:delay
		});
		return newSelector;
	},
	/**
	 * @returns {Sitemap|*} Cloned Sitemap with currently edited selector
	 */
	getCurrentlyEditedSelectorSitemap: function () {
		var sitemap = this.state.currentSitemap.clone();
		var selector = sitemap.getSelectorById(this.state.currentSelector.id);
		var newSelector = this.getCurrentlyEditedSelector();
		sitemap.updateSelector(selector, newSelector);
		return sitemap;
	},
	cancelSelectorEditing: function (button) {

		// cancel possible element selection
		this.contentScript.removeCurrentContentSelector().done(function() {
			this.showSitemapSelectorList();
		}.bind(this));
	},
	addSelector: function () {

		var parentSelectorId = this.state.currentParentSelectorId;
		var sitemap = this.state.currentSitemap;

		var selector = new Selector({
			parentSelectors: [parentSelectorId],
			type: 'SelectorText',
			multiple: false
		});

		this._editSelector(selector, sitemap);
	},
	deleteSelector: function (button) {

		var sitemap = this.state.currentSitemap;
		var selector = $(button).closest("tr").data('selector');
		sitemap.deleteSelector(selector);

		this.store.saveSitemap(sitemap, function () {
			this.showSitemapSelectorList();
		}.bind(this));
	},
	deleteSitemap: function (button) {
		var sitemap = $(button).closest("tr").data("sitemap");
		var controller = this;
		this.store.deleteSitemap(sitemap, function () {
			controller.showSitemaps();
		});
	},
	initScrapeSitemapConfigValidation: function(){

		$('#viewport form').bootstrapValidator({
			fields: {
				"requestInterval": {
					validators: {
						notEmpty: {
							message: '请求间隔必需，不能为空'
						},
						numeric: {
							message: '请求间隔只能是数字'
						},
						callback: {
							message: '请求间隔必须大于 2000 毫秒',
							callback: function(value, validator) {
								return value >= 2000;
							}
						}
					}
				},
				"pageLoadDelay": {
					validators: {
						notEmpty: {
							message: '页面加载延迟不能为空'
						},
						numeric: {
							message: '页面加载延迟只能是数字'
						},
						callback: {
							message: '页面加载延迟必须大于 500 毫秒',
							callback: function(value, validator) {
								return value >= 500;
							}
						}
					}
				}
			}
		});
	},
	showScrapeSitemapConfigPanel: function() {

		this.setActiveNavigationButton('sitemap-scrape');
		var scrapeConfigPanel = ich.SitemapScrapeConfig();
		$("#viewport").html(scrapeConfigPanel);
		this.initScrapeSitemapConfigValidation();
		return true;
	},
	scrapeSitemap: function () {

		if(!this.isValidForm()) {
			return false;
		}
		
		var requestInterval = $("input[name=requestInterval]").val();
		var pageLoadDelay = $("input[name=pageLoadDelay]").val();

		var sitemap = this.state.currentSitemap;
		var request = {
			scrapeSitemap: true,
			sitemap: JSON.parse(JSON.stringify(sitemap)),
			requestInterval: requestInterval,
			pageLoadDelay: pageLoadDelay
		};

		// show sitemap scraping panel
		this.getFormValidator().destroy();
		$(".scraping-in-progress").removeClass("hide");
		$("#submit-scrape-sitemap").closest(".form-group").hide();
		$("#scrape-sitemap-config input").prop('disabled', true);
		$("#submit-scrape-sitemap").attr("disabled","true");
		chrome.runtime.sendMessage(request, function (response) {
			this.browseSitemapData();
		}.bind(this));
		return false;
	},
	sitemapListBrowseSitemapData: function (button) {
		var sitemap = $(button).closest("tr").data("sitemap");
		this.setStateEditSitemap(sitemap);
		this.browseSitemapData();
	},
	browseSitemapData: function () {
		this.setActiveNavigationButton('sitemap-browse');
		var sitemap = this.state.currentSitemap;
		this.store.getSitemapData(sitemap, function (data) {

			var dataColumns = sitemap.getDataColumns();

			var dataPanel = ich.SitemapBrowseData({
				columns: dataColumns
			});
			$("#viewport").html(dataPanel);

			// display data
			// Doing this the long way so there aren't xss vulnerubilites 
			// while working with data or with the selector titles
			var $tbody = $("#sitemap-data tbody");
			data.forEach(function (row) {
				var $tr = $("<tr></tr>");
				dataColumns.forEach(function (column) {
					var $td = $("<td></td>");
					var cellData = row[column];
					if (typeof cellData === 'object') {
						cellData = JSON.stringify(cellData);
					}
					$td.text(cellData);
					$tr.append($td);
				});
				$tbody.append($tr);
			});
		}.bind(this));

		return true;
	},

	showSitemapExportDataCsvPanel: function () {
		this.setActiveNavigationButton('sitemap-export-data-csv');

		var sitemap = this.state.currentSitemap;
		var exportPanel = ich.SitemapExportDataCSV(sitemap);
		$("#viewport").html(exportPanel);

		// generate data
		$(".download-button").hide();
		this.store.getSitemapData(sitemap, function (data) {
			var blob = sitemap.getDataExportCsvBlob(data);
			$(".download-button a").attr("href", window.URL.createObjectURL(blob));
			$(".download-button a").attr("download", sitemap._id + ".csv");
			$(".download-button").show();
		}.bind(this));

		return true;
	},

	selectSelector: function (button) {

		var input = $(button).closest(".form-group").find("input.selector-value");
		var sitemap = this.getCurrentlyEditedSelectorSitemap();
		var selector = this.getCurrentlyEditedSelector();
		var currentStateParentSelectorIds = this.getCurrentStateParentSelectorIds();
		var parentCSSSelector = sitemap.selectors.getParentCSSSelectorWithinOnePage(currentStateParentSelectorIds);

		var deferredSelector = this.contentScript.selectSelector({
			parentCSSSelector: parentCSSSelector,
			allowedElements: selector.getItemCSSSelector()
		});

		deferredSelector.done(function(result) {

			$(input).val(result.CSSSelector);

			// update validation for selector field
			var validator = this.getFormValidator();
			validator.revalidateField(input);

			// @TODO how could this be encapsulated?
			// update header row, data row selectors after selecting the table. selectors are updated based on tables
			// inner html
			if(selector.type === 'SelectorTable') {

				this.getSelectorHTML().done(function(html) {

					var tableHeaderRowSelector = SelectorTable.getTableHeaderRowSelectorFromTableHTML(html);
					var tableDataRowSelector = SelectorTable.getTableDataRowSelectorFromTableHTML(html);
					$("input[name=tableHeaderRowSelector]").val(tableHeaderRowSelector);
					$("input[name=tableDataRowSelector]").val(tableDataRowSelector);

					var headerColumns = SelectorTable.getTableHeaderColumnsFromHTML(tableHeaderRowSelector, html);
					this.renderTableHeaderColumns(headerColumns);
				}.bind(this));
			}

		}.bind(this));
	},

	getCurrentStateParentSelectorIds: function() {

		var parentSelectorIds = this.state.editSitemapBreadcumbsSelectors.map(function(selector) {
			return selector.id;
		});

		return parentSelectorIds;
	},

	selectTableHeaderRowSelector: function(button) {

		var input = $(button).closest(".form-group").find("input.selector-value");
		var sitemap = this.getCurrentlyEditedSelectorSitemap();
		var selector = this.getCurrentlyEditedSelector();
		var currentStateParentSelectorIds = this.getCurrentStateParentSelectorIds();
		var parentCSSSelector = sitemap.selectors.getCSSSelectorWithinOnePage(selector.id, currentStateParentSelectorIds);

		var deferredSelector = this.contentScript.selectSelector({
			parentCSSSelector: parentCSSSelector,
			allowedElements: "tr"
		});

		deferredSelector.done(function(result) {

			var tableHeaderRowSelector = result.CSSSelector
			$(input).val(tableHeaderRowSelector);

			this.getSelectorHTML().done(function(html) {

				var headerColumns = SelectorTable.getTableHeaderColumnsFromHTML(tableHeaderRowSelector, html);
				this.renderTableHeaderColumns(headerColumns);

			}.bind(this));

			// update validation for selector field
			var validator = this.getFormValidator();
			validator.revalidateField(input);

		}.bind(this));
	},

	selectTableDataRowSelector: function(button) {

		var input = $(button).closest(".form-group").find("input.selector-value");
		var sitemap = this.getCurrentlyEditedSelectorSitemap();
		var selector = this.getCurrentlyEditedSelector();
		var currentStateParentSelectorIds = this.getCurrentStateParentSelectorIds();
		var parentCSSSelector = sitemap.selectors.getCSSSelectorWithinOnePage(selector.id, currentStateParentSelectorIds);

		var deferredSelector = this.contentScript.selectSelector({
			parentCSSSelector: parentCSSSelector,
			allowedElements: "tr"
		});

		deferredSelector.done(function(result) {

			$(input).val(result.CSSSelector);

			// update validation for selector field
			var validator = this.getFormValidator();
			validator.revalidateField(input);

		}.bind(this));
	},

	/**
	 * update table selector column editing fields
	 */
	renderTableHeaderColumns: function(headerColumns) {

		// reset previous columns
		var $tbody = $(".feature-columns table tbody");
		$tbody.html("");
		headerColumns.forEach(function(column) {
			var $row = ich.SelectorEditTableColumn(column);
			$tbody.append($row);
		});
	},

	/**
	 * Returns HTML that the current selector would select
	 */
	getSelectorHTML: function() {

		var sitemap = this.getCurrentlyEditedSelectorSitemap();
		var selector = this.getCurrentlyEditedSelector();
		var currentStateParentSelectorIds = this.getCurrentStateParentSelectorIds();
		var CSSSelector = sitemap.selectors.getCSSSelectorWithinOnePage(selector.id, currentStateParentSelectorIds);
		var deferredHTML = this.contentScript.getHTML({CSSSelector: CSSSelector});

		return deferredHTML;
	},
	previewSelector: function (button) {

		if (!$(button).hasClass('preview')) {

			var sitemap = this.getCurrentlyEditedSelectorSitemap();
			var selector = this.getCurrentlyEditedSelector();
			var currentStateParentSelectorIds = this.getCurrentStateParentSelectorIds();
			var parentCSSSelector = sitemap.selectors.getParentCSSSelectorWithinOnePage(currentStateParentSelectorIds);
			var deferredSelectorPreview = this.contentScript.previewSelector({
				parentCSSSelector: parentCSSSelector,
				elementCSSSelector: selector.selector
			});

			deferredSelectorPreview.done(function() {
				$(button).addClass("preview");
			});
		}
		else {

			this.contentScript.removeCurrentContentSelector();
			$(button).removeClass("preview");
		}
	},
	previewClickElementSelector: function(button) {

		if (!$(button).hasClass('preview')) {

			var sitemap = this.state.currentSitemap;
			var selector = this.getCurrentlyEditedSelector();
			var currentStateParentSelectorIds = this.getCurrentStateParentSelectorIds();
			var parentCSSSelector = sitemap.selectors.getParentCSSSelectorWithinOnePage(currentStateParentSelectorIds);

			var deferredSelectorPreview = this.contentScript.previewSelector({
				parentCSSSelector: parentCSSSelector,
				elementCSSSelector: selector.clickElementSelector
			});

			deferredSelectorPreview.done(function() {
				$(button).addClass("preview");
			});
		}
		else {
			this.contentScript.removeCurrentContentSelector();
			$(button).removeClass("preview");
		}
	},
	previewTableRowSelector: function(button) {

		if (!$(button).hasClass('preview')) {

			var sitemap = this.getCurrentlyEditedSelectorSitemap();
			var selector = this.getCurrentlyEditedSelector();
			var currentStateParentSelectorIds = this.getCurrentStateParentSelectorIds();
			var parentCSSSelector = sitemap.selectors.getCSSSelectorWithinOnePage(selector.id, currentStateParentSelectorIds);
			var rowSelector = $(button).closest(".form-group").find("input").val();

			var deferredSelectorPreview = this.contentScript.previewSelector({
				parentCSSSelector: parentCSSSelector,
				elementCSSSelector: rowSelector
			});

			deferredSelectorPreview.done(function() {
				$(button).addClass("preview");
			});
		}
		else {
			this.contentScript.removeCurrentContentSelector();
			$(button).removeClass("preview");
		}
	},
	previewSelectorFromSelectorTree: function (button) {

		if (!$(button).hasClass('preview')) {

			var sitemap = this.state.currentSitemap;
			var selector = $(button).closest("tr").data('selector');
			var currentStateParentSelectorIds = this.getCurrentStateParentSelectorIds();
			var parentCSSSelector = sitemap.selectors.getParentCSSSelectorWithinOnePage(currentStateParentSelectorIds);
			var deferredSelectorPreview = this.contentScript.previewSelector({
				parentCSSSelector: parentCSSSelector,
				elementCSSSelector: selector.selector
			});

			deferredSelectorPreview.done(function() {
				$(button).addClass("preview");
			});
		}
		else {

			this.contentScript.removeCurrentContentSelector();
			$(button).removeClass("preview");
		}
	},
	previewSelectorDataFromSelectorTree: function (button) {
		var sitemap = this.state.currentSitemap;
		var selector = $(button).closest("tr").data('selector');
		this.previewSelectorData(sitemap, selector.id);
	},
	previewSelectorDataFromSelectorEditing: function() {
		var sitemap = this.state.currentSitemap.clone();
		var selector = sitemap.getSelectorById(this.state.currentSelector.id);
		var newSelector = this.getCurrentlyEditedSelector();
		sitemap.updateSelector(selector, newSelector);
		this.previewSelectorData(sitemap, newSelector.id);
	},
	/**
	 * Returns a list of selector ids that the user has opened
	 * @returns {Array}
	 */
	getStateParentSelectorIds: function(){
		var parentSelectorIds = [];
		this.state.editSitemapBreadcumbsSelectors.forEach(function(selector){
			parentSelectorIds.push(selector.id);
		});
		return parentSelectorIds;
	},
	previewSelectorData: function (sitemap, selectorId) {

		// data preview will be base on how the selector tree is opened
		var parentSelectorIds = this.getStateParentSelectorIds();

		var request = {
			previewSelectorData: true,
			sitemap: JSON.parse(JSON.stringify(sitemap)),
			parentSelectorIds: parentSelectorIds,
			selectorId: selectorId
		};
		chrome.runtime.sendMessage(request, function (response) {

			if (response.length === 0) {
				return
			}
			var dataColumns = Object.keys(response[0]);

			console.log(dataColumns);

			var $dataPreviewPanel = ich.DataPreview({
				columns: dataColumns
			});
			$("#viewport").append($dataPreviewPanel);
			$dataPreviewPanel.modal('show');
			// display data
			// Doing this the long way so there aren't xss vulnerubilites
			// while working with data or with the selector titles
			var $tbody = $("tbody", $dataPreviewPanel);
			response.forEach(function (row) {
				var $tr = $("<tr></tr>");
				dataColumns.forEach(function (column) {
					var $td = $("<td></td>");
					var cellData = row[column];
					if (typeof cellData === 'object') {
						cellData = JSON.stringify(cellData);
					}
					$td.text(cellData);
					$tr.append($td);
				});
				$tbody.append($tr);
			});

			var windowHeight = $(window).height();

			$(".data-preview-modal .modal-body").height(windowHeight - 130);

			// remove modal from dom after it is closed
			$dataPreviewPanel.on("hidden.bs.modal", function () {
				$(this).remove();
			});
		});
	},
	/**
	 * Add start url to sitemap creation or editing form
	 * @param button
	 */
	addStartUrl: function(button) {

		var $startUrlInputField = ich.SitemapStartUrlField();
		$("#viewport .start-url-block:last").after($startUrlInputField);
		var validator = this.getFormValidator();
		validator.addField($startUrlInputField.find("input"));
	},
	/**
	 * Remove start url from sitemap creation or editing form.
	 * @param button
	 */
	removeStartUrl: function(button) {

		var $block = $(button).closest(".start-url-block");
		if($("#viewport .start-url-block").length > 1) {

			// remove from validator
			var validator = this.getFormValidator();
			validator.removeField($block.find("input"));
			
			$block.remove();
		}
	},
	/**
	 * 滚动截屏
	 */
	screenShot:function(button){
		this.store.startScreenShot(function () {
			
		});
	}
};
