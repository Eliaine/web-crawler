$(document).ready(function(){
	init();
	$("#installation").show();
	$('#readContent a').on('click', function () {
		init();
		var docId = $(this).attr("thref");
		if(docId!=undefined && docId!=null && docId!=""){
			$(docId).show();
		}
	})
	
	function init(){
		$("#readContent a").each(function(){
			var id = $(this).attr("thref");
			if(id!=undefined && id!=null && id!=""){
				$(id).hide();
			}
		 });
	}
});