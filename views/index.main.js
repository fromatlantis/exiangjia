'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var StaticView=require('./StaticView');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var SliderHelper=require('./SliderHelper');
	var Util=require('./Util');

	var util=new Util();
	var footerView=new StaticView({
		tmplName:require('./templates/footer.html'),
		tmplData:{
			current:1
		},
		holder:'footer'
	})

 	if(sessionStorage.userInfo){
        _init();
    }else{
        util.wxCode(function(){
            _init(); 
        });
    }

    //_init(); 
	function _initAppView(){
		var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/app.html'),
			tmplData:{}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			var sliderHelper=new SliderHelper();
			execAnim('.service-item i','bounceIn');
		});
	}
     
    function _init(){
		_initAppView();
		_bindEvents();
    }

    function _bindEvents(){
    }

    function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
})