'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var StaticView=require('./StaticView');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var SliderHelper=require('./SliderHelper');

	var footerView=new StaticView({
		tmplName:require('./templates/footer.html'),
		tmplData:{
			current:0
		},
		holder:'footer'
	})
	
	_initCleaningView();//入口函数

	function _initCleaningView(){
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/cleaning.html'),
			tmplData:{}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			//_init();
			_bindEvents();
			execAnim('.housekeeping-page .service-item','bounceInRight');
		})
    }
     
    function _init(){
		
    }

    function _bindEvents(){
    	var sliderHelper=new SliderHelper();
    }

    function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
})