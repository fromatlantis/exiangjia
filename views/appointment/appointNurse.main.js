'use strict';
define(function(require,exports,module){
	var zepto=require('../plugins/zepto.min.js');
	var View=require('../View');
	var TemplateFromUrl=require('../TemplateFromUrl');
	var SliderHelper=require('../SliderHelper');
	var Util=require('../Util');
	
	var util=new Util();
	var type=util.urlParam('type');//必须定义在入口函数之前

	_initAppView();//入口函数
	_init();
	
	function _initAppView(){
		var appTmpl;
		if(type==1){
			appTmpl=new TemplateFromUrl({
				tmplName:require('../templates/appointment/nanny.html'),
				tmplData:{}
			});
		}else if(type==2){
			appTmpl=new TemplateFromUrl({
				tmplName:require('../templates/appointment/matron.html'),
				tmplData:{}
			});
		}else if(type==3){
			appTmpl=new TemplateFromUrl({
				tmplName:require('../templates/appointment/childCare.html'),
				tmplData:{}
			});
		}
		//alert(type);
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
    	var serviceclass;
    	if(type==1){
    		serviceclass='0001000300030003';//保姆
    	}else if(type==2){
    		serviceclass='0001000300030001';//月嫂
    	}else if(type==3){
    		serviceclass='0001000300030002';//育婴师
    	}
    	$('#appointment-btn').tap(function(){
    		window.location.href='fillOrderNurse.html?type=nurse&serviceclass='+serviceclass;
    	})
    }

})