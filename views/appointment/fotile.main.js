'use strict';
define(function(require,exports,module){
	var zepto=require('../plugins/zepto.min.js');
	var View=require('../View');
	var TemplateFromUrl=require('../TemplateFromUrl');
	var SliderHelper=require('../SliderHelper');
	
	_initAppView();//入口函数
	_init();

	function _initAppView(){
		var appTmpl=new TemplateFromUrl({
			tmplName:require('../templates/appointment/fotile.html'),
			tmplData:{}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			_bindEvents();
		});
	}
     
 	function _init(){
		$('footer').hide();
		$('.main').css({'padding-bottom':0});
    }

    function _bindEvents(){
    	var sliderHelper=new SliderHelper();
    }

})