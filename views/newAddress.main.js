define(function(require,exports,module){
	var zepto=require('zepto');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');

	_initHousekeepingView();//入口函数
	_init();

	function _initHousekeepingView(){
    	var appTmpl=new TemplateFromUrl({
			tmplName:'newAddress',
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
    }

    function _bindEvents(){

    }

})