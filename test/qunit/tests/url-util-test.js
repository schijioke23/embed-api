/*global MTVNPlayer, equal, test*/
test("url util",function() {
	var url = "http://test.com",
		Url = MTVNPlayer.require("mtvn-player-test").Url;
	// append
	equal(Url.addQueryStringParam(url,"a","b"),"http://test.com/?a=b");
	equal(Url.addQueryStringParam(url+"/","a","b"),"http://test.com/?a=b");
	equal(Url.addQueryStringParam(url+"/?","a","b"),"http://test.com/?a=b");
	equal(Url.addQueryStringParam(url+"/?b=c","a","b"),"http://test.com/?b=c&a=b");
	equal(Url.addQueryStringParam(url+"/?b=c&","a","b"),"http://test.com/?b=c&a=b");
	// replace
	equal(Url.setQueryStringParam(url,"a","b"),"http://test.com/?a=b");
	equal(Url.setQueryStringParam(url+"/","b","a"),"http://test.com/?b=a");
	equal(Url.setQueryStringParam(url+"/?","b","a"),"http://test.com/?b=a");
	equal(Url.setQueryStringParam(url+"/?b=c","b","a"),"http://test.com/?b=a");
	equal(Url.setQueryStringParam(url+"/?b=c&","b","a"),"http://test.com/?b=a&");
});