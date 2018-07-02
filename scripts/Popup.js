$(document).ready(function(){
	$("#showHelp").click(function(){
		chrome.tabs.create({ url: "../readme.html" },function(tab){
		    setTimeout(function(){chrome.tabs.remove(tab.id);}, 200);
		});
		
	});
});