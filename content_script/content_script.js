chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	console.log("content:chrome.runtime.onMessage", request);

	if (request.extractData) {
		console.log("received data extraction request", request);
		var extractor = new DataExtractor(request);
		var deferredData = extractor.getData();
		deferredData.done(function(data) {
			console.log("dataextractor data", data);
			sendResponse(data);
		});
		return true;
	} else if (request.previewSelectorData) {
		console.log("received data-preview extraction request", request);
		var extractor = new DataExtractor(request);
		var deferredData = extractor.getSingleSelectorData(
				request.parentSelectorIds, request.selectorId);
		deferredData.done(function(data) {
			console.log("dataextractor data", data);
			sendResponse(data);
		});
		return true;
	}
	// Universal ContentScript communication handler
	else if (request.contentScriptCall) {

		var contentScript = getContentScript("ContentScript");

		console.log("received ContentScript request", request);

		var deferredResponse = contentScript[request.fn](request.request);
		deferredResponse.done(function(response) {
			sendResponse(response);
		});

		return true;
	}

	else if (request.getPageDetails) {
		//为了数据更好看，去掉浮窗和iframe嵌套的信息
		console.log(document);
		var linksGrabber = new LinksGrabber(document);
		linksGrabber.hideStubbornElements();
		document = linksGrabber;
	    linksGrabber = undefined;
	    console.log("remove attributes");
	    console.log(document);
		var size = {
				width: Math.max(
					document.documentElement.clientWidth,
					document.body.scrollWidth,
					document.documentElement.scrollWidth,
					document.body.offsetWidth,
					document.documentElement.offsetWidth
				),
				height: Math.max(
					document.documentElement.clientHeight,
					document.body.scrollHeight,
					document.documentElement.scrollHeight,
					document.body.offsetHeight,
					document.documentElement.offsetHeight
				)
			};

			chrome.extension.sendMessage({
				setPageDetails: true,
				"size": size,
				"scrollBy": window.innerHeight,
				"originalParams": {
					"overflow": document.querySelector("body").style.overflow,
					"scrollTop": document.documentElement.scrollTop
				}
			});
			return true;
	} else if (request.scrollPage) {
		var lastCapture = false;
		
		window.scrollTo(0, request.scrollTo);

		// first scrolling
		if (request.scrollTo === 0) {
			document.querySelector("body").style.overflow = "hidden";
		}

		// last scrolling
		if (request.size.height <= window.scrollY + request.scrollBy) {
			lastCapture = true;
			request.scrollTo = request.size.height - request.scrollBy;
		}

		chrome.extension.sendMessage({
			capturePage: true,
			"position": request.scrollTo,
			"lastCapture": lastCapture
		});
		return true;
	} else if (request.resetPage) {
		var originalParams = request.originalParams;
		window.scrollTo(0, originalParams.scrollTop);
		document.querySelector("body").style.overflow = originalParams.overflow;
	} else if (request.showError) {
		var errorEl = document.createElement("div");

		errorEl.innerHTML = "<div style='position: absolute; top: 10px; right: 10px; z-index: 9999; padding: 8px; background-color: #fff2f2; border: 1px solid #f03e3e; border-radius: 2px; font-size: 12px; line-height: 16px; transition: opacity .3s linear;'>An internal error occurred while taking pictures.</div>";
		document.body.appendChild(errorEl);

		setTimeout(function () {
			errorEl.firstChild.style.opacity = 0;
		}, 3000);

		var originalParams = request.originalParams;
		window.scrollTo(0, originalParams.scrollTop);
		document.querySelector("body").style.overflow = originalParams.overflow;
	}
});