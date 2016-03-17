'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var FetchApi=require('./FetchApi');
	var Toasts=require('./Toasts');
    var Util=require('./Util');

    var util=new Util();
	var toasts=new Toasts();
	var pageParams={
        userid:util.urlParam('userid')
	};
	var Apis={
		getUseraddressList:'/removte/user/getUseraddressList',
		delAddress:'/removte/user/deleteUseraddress'
	}

	_init();

	function _initAddressListView(data){
        data.type='profile';
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/serviceAddress.html'),
			tmplData:data
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
		$('footer').hide();
		$('.main').css({'padding-bottom':0});
		getAddressListData();
    }

    function _bindEvents(){
    	$(".address-page .table").swipeLeft(function(){
    		$('.address-del').hide();
    		$('.swipe-left').removeClass('swipe-left');
            $(this).find('.address-del').show();
    		$(this).addClass('swipe-left');
    	})
    	$(".address-del").tap(function(){
    		var addressId=$(this).data('address-id');
    		var data=new FormData();
    		data.append('ids',addressId);
    		var delAddress=new FetchApi({
    			urlApi:Apis.delAddress,
    			fetchParams:{
    				method:'post',
    				body:data
    			}
    		},function(){
    			toasts.show('删除地址成功');
    			getAddressListData();
    		})
    	})
        $(document).tap(function(){
            $('.address-del').hide();
            $('.swipe-left').removeClass('swipe-left');
        })
    }

    function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
  	function getAddressListData(){
        var data = new FormData();
        data.append('userid', pageParams.userid);
        var address=new FetchApi({
            urlApi:Apis.getUseraddressList,
            fetchParams:{
                method: 'post',
                body: data
            }
        },function(){
            if(this.records.code==200){
                _initAddressListView(this.records);
            }else{
                toasts.alert(this.records.message);
                //toasts.show(this.records.message);
            }
        });
    }
})