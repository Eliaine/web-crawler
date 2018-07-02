$(document).ready(function(){
	var backgroundPage = null;
	var capResult = null;
	var capResultDataURL = null;
	var onChangedEventActivated = false;

	function showPage() {
		$(".container").show();

		document.getElementById("imgResult").onload = function() {
			var img = capResult;
			var div = document.getElementById("divImgResult");
			if (img.width < $(div).width()) {
				$("#imgResult").css("width", "auto");
				$("#divImgResult").css(
						"overflow-y",
						div.clientHeight < div.scrollHeight ? "scroll"
								: "hidden");
				div.style.zoom = 1.0000001;
				setTimeout(function() {
					div.style.zoom = 1;
				}, 50);
			}

			else if (div.clientHeight >= div.scrollHeight) {
				$(div).css("overflow-y", "hidden");
				div.style.zoom = 1.0000001;
				setTimeout(function() {
					div.style.zoom = 1;
				}, 50);
			}
		};

		document.getElementById("imgResult").src = capResultDataURL;
	}

	function init() {
		chrome.runtime.getBackgroundPage(function(bp) {
			if (!bp)
				return;

			backgroundPage = bp;
			capResultDataURL = backgroundPage.capResultDataURL;
			capResult = backgroundPage.capResult;

			showPage();
		});
	}
	
	init();
});