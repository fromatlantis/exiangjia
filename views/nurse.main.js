'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var StaticView=require('./StaticView');
	var SliderHelper=require('./SliderHelper');

	var footerView=new StaticView({
		tmplName:require('./templates/footer.html'),
		tmplData:{
			current:0
		},
		holder:'footer'
	})
	_initManipulation();//入口函数

	function _initManipulation(){
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/nurse.html'),
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