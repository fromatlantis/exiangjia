'use strict';
define(function(require,exports,module){
	var zepto=require('zepto');
	var View=require('./View');
	var StaticView=require('./StaticView');
	var TemplateFromUrl=require('./TemplateFromUrl');

	var headerView=new StaticView({
		tmplName:'header',
		tmplData:{
			isHome:true,
			title:'e享家'
		},
		holder:'header'	
	})

	var footerView=new StaticView({
		tmplName:'footer',
		tmplData:{
			current:1
		},
		holder:'footer'
	})
	_initAppView();//入口函数
	_bindEvents();

	function _initAppView(){
		var appTmpl=new TemplateFromUrl({
			tmplName:'app',
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
		
    }

    function _bindEvents(){
    	$('.housekeeping').tap(function(){
			headerView.redraw({
				tmplData:{
					isHome:false,
					title:'家政'
				}
			})
			footerView.redraw({
				tmplData:{
					current:0
				}
			})
			_initHousekeepingView();
		})
		$('.cleaning').tap(function(){
			headerView.redraw({
				tmplData:{
					isHome:false,
					title:'清洗服务'
				}
			})
			footerView.redraw({
				tmplData:{
					current:0
				}
			})
			_initCleaningView();
		})
		$('.manipulation').tap(function(){
			headerView.redraw({
				tmplData:{
					isHome:false,
					title:'推拿'
				}
			})
			footerView.redraw({
				tmplData:{
					current:0
				}
			})
			_initManipulation();
		})
		$('.menu .home').tap(function(){
			headerView.redraw({
				tmplData:{
					isHome:true,
					title:'e享家'
				}
			})
			footerView.redraw({
				tmplData:{
					current:1
				}
			})
			_initAppView();
		})
    }

    function _initHousekeepingView(){
    	var appTmpl=new TemplateFromUrl({
			tmplName:'housekeeping',
			tmplData:{}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			//_init();
			_bindEvents();
			execAnim('.housekeeping-page .service-item','fadeInRight');
		})
    }

    function _initCleaningView(){
    	var appTmpl=new TemplateFromUrl({
			tmplName:'cleaning',
			tmplData:{}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			//_init();
			_bindEvents();
			execAnim('.housekeeping-page .service-item','fadeInRight');
		})
    }

    function _initManipulation(){
    	var appTmpl=new TemplateFromUrl({
			tmplName:'manipulation',
			tmplData:{}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			//_init();
			_bindEvents();
			execAnim('.housekeeping-page .service-item','fadeInRight');
		})
    }

    function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
})