'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var Util=require('./Util');

	var util=new Util();
	var pageParams={
		orderno:util.urlParam('orderno')
	}

	if(sessionStorage.userInfo){
        _init();
    }else{
        util.wxAuthCode(function(){
            _init(); 
        });
    }

	function _initAppView(){
		var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/paySuccess.html'),
			tmplData:{}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			_bindEvents();
			//execAnim('.service-item img','bounceIn');
		});
	}
     
    function _init(){
		_initAppView();//入口函数
    }

    function _bindEvents(){
    	$('#go-comment').click(function(event) {
    		window.location.href="orderDetail.html?orderno="+pageParams.orderno;
    	});
    	$('#go-order').click(function(event) {
    		window.location.href='order.html';
    	});
    	$('#go-home').click(function(event) {
    		window.location.href='index.html';
    	});
    }

    function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
})