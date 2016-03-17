'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var Util=require('./Util');
	var RefreshHelper=require('./RefreshHelper');

	var util=new Util();
	var pageParams={
		orderno:util.urlParam('orderno')
	}

	_init();
     
    function _init(){
		var refreshHelper=new RefreshHelper({
			id:"scroll-wrapper",
			pullDownAction:Refresh,
			pullUpAction:Load
		});
    }

    function _bindEvents(){
    	
    }
    var generatedCount = 0;
function Refresh() {
	setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
		var el, li, i;
		el =document.querySelector("#scroll-wrapper ul");
		el.innerHTML='';
		for (i=0; i<11; i++) {
			li = document.createElement('li');
			li.appendChild(document.createTextNode('async row ' + (++generatedCount)));
		el.insertBefore(li, el.childNodes[0]);
		}	
		myScroll.refresh();/****remember to refresh when you action was completed！！！****/
	}, 1000);
}

function Load() {
	setTimeout(function () {// <-- Simulate network congestion, remove setTimeout from production!
		var el, li, i;
		el =document.querySelector("#scroll-wrapper ul");
		for (i=0; i<2; i++) {
			li = document.createElement('li');
			li.appendChild(document.createTextNode('async row ' + (++generatedCount)));
			el.appendChild(li, el.childNodes[0]);
		}
		myScroll.refresh();/****remember to refresh when you action was completed！！！****/
	}, 1000);
}
    function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
})