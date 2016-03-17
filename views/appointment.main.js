'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var SliderHelper=require('./SliderHelper');
	var Util=require('./Util');
	
	var util=new Util();
	if(sessionStorage.userInfo){
        _init();
    }else{
        util.wxCode(function(){
            _init(); 
        });
    }
	//_init();

	function _initHousekeepingView(){
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/appointment.html'),
			tmplData:{}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			//_init();
			_bindEvents();
		})
    }
     
    function _init(){
		$('footer').hide();
		$('.main').css({'padding-bottom':0});
		_initHousekeepingView();
    }

    function _bindEvents(){
		var sliderHelper=new SliderHelper();
    }

})