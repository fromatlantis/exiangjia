'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var FetchApi=require('./FetchApi');
	var Util=require('./Util');
	var Toasts=require('./Toasts');

	var util=new Util();
	var toasts=new Toasts();
	var pageParams={};
	var Apis={
		saveFeedback:'/removte/feedback/saveFeedback'
	}

	_init();

	function _initOrderDetailView(){
		var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/feedback.html'),
			tmplData:{}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			_bindEvents();
			//execAnim('.order-item img','bounceIn');
		});
	}
     
    function _init(){
		$('footer').hide();
		$('.main').css({'padding-bottom':0});
		_initOrderDetailView();//入口函数
    }

    function _bindEvents(){
    	$('#feedback-btn').tap(function(){
    		var me=$(this);
    		var content=$('.feedback-content').val();
    		if(content==''){
    			toasts.show('请输入反馈内容！');
    		}else{
	    		me.attr('disabled','disabled');
	    		var data=new FormData();
	    		data.append('content',content);
	    		data.append('feedbacktype','000100140001');
	    		var feedback=new FetchApi({
	    			urlApi:Apis.saveFeedback,
	    			fetchParams:{
	    				method:'post',
	    				body:data
	    			}
	    		},function(){
	    			//alert(JSON.stringify(this.records));
	    			if(this.records.code==200){
		    			me.removeAttr('disabled');
		    			toasts.alert('提交成功，感谢您的参与！');
		    			$('.feedback-content').val('');
		    		}else{
		    			toasts.alert(this.records.message);
		    		}
	    		})
	    	}
    	})
    }
    
})