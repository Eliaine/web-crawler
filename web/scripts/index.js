$(document).ready(function(){
	initContent();
	init();
	$("#homeContent").show();
	$("#homeP").addClass("active");
	$('#headerContent a').on('click', function () {
		initContent();
		var docId = $(this).attr("thref");
		if(docId!=undefined && docId!=null && docId!=""){
			$(this).parent().addClass("active");
			$(docId).show();
			$("#installation").show();
		}
	})
	
	$('#helpContent a').on('click', function () {
		init();
		$("#helpContent").show();
		//$("#homeContent").hide();
		var docId = $(this).attr("thref");
		if(docId!=undefined && docId!=null && docId!=""){
			$(docId).show();
		}
	})
	
	function initContent(){
		$("#headerContent a").each(function(){
			var id = $(this).attr("thref");
			if(id!=undefined && id!=null && id!=""){
				$(this).parent().removeClass("active")
				$(id).hide();
			}
		 });
	}
	
	function init(){		
		$("#helpContent a").each(function(){
			var id = $(this).attr("thref");
			if(id!=undefined && id!=null && id!=""){
				$(id).hide();
			}
		 });
	}
});