'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var Toasts=require('./Toasts');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var FetchApi=require('./FetchApi');
	var Util=require('./Util');

	var util=new Util();
	var toasts=new Toasts();

	var pageParams={
		orderno:util.urlParam('orderno'),
		serviceclass:util.urlParam('serviceclass')
	};
	var Apis={
		userCoupon:'/removte/user/searchUserCoupon',
		changeCode:'/removte/coupon/code/exchangecode'
	}

	_init('0');
	_bindEvents();

	function _initOrderDetailView(data){
		var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/coupons.html'),
			tmplData:data
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			if(!!pageParams.orderno){
				$('.coupons-not').show();
			}
		});
	}
     
    function _init(state){
    	var data=new FormData();
    	data.append('state',state);
    	var couponSore=new FetchApi({
			urlApi:Apis.userCoupon,
			fetchParams:{
				method:'post',
				body:data
			}
		},function(){
			//alert(JSON.stringify(this.records));
			if(this.records.code==200){
				var coupon=this.records.data;
				if(!!coupon){
					coupon.forEach(function(e){
						e.begtime=e.begtime.replace(/-/g,".");
						e.expirdDate=e.expirdDate.replace(/-/g,".");
						e.serviceClass=e.serviceType;
						e.serviceType=util.cuoponsTypeMap(e.serviceType);
					})
				}
				this.records.state=state;
	    		_initOrderDetailView(this.records);
	    	}else{
	    		toasts.alert(this.records.message);
	    	}
		});
		$('footer').hide();
		$('.main').css({'padding-bottom':0});
    }

    function _bindEvents(){
    	$('.main').on('tap','.change-coupons',function(){
    		var couponCode=$('.coupons-code').val();
    		if(couponCode==''){
    			toasts.show('请输入兑换码');
    		}else {
    			var data=new FormData();
    			data.append('couponCode',couponCode);
    			var exchangeCode=new FetchApi({
    				urlApi:Apis.changeCode,
    				fetchParams:{
    					method:'post',
    					body:data
    				}
    			},function(){
    				if(this.records.code==200){
	    				_init('0');
	    			}else{
	    				toasts.alert(this.records.message);
	    			}
    			})
    		}
    	})
    	if(!!pageParams.orderno){
    		$('.main').on('click','.coupons-chip',function(){
    			var serviceclass=$(this).data('serviceclass');
    			if($(this).find('.coupons-blue').hasClass('coupons-disable')){
    				toasts.alert('此优惠券无法使用！');
    			}else if(serviceclass!='00010003'&&(serviceclass!=pageParams.serviceclass)){
					toasts.alert('优惠券品类不符，请重新选择');
    			}else{
    				//alert(pageParams.serviceclass);
	    			var couponId=$(this).data('coupon-id');
	    			var couponNum=$(this).find('.coupons-num span').text();
	    			window.location.href='orderDetail.html?orderno='+pageParams.orderno+'&couponId='+couponId+'&couponNum='+couponNum;
	    		}
    		})
    	}
    	$('.main').on('tap','.coupons-not',function(){
    		window.location.href='orderDetail.html?orderno='+pageParams.orderno;
    	})
    	$('.main').on('tap','.coupons-tabs .row>div',function(){
    		var state=$(this).data('state');
    		_init(state);
    	})
    }   
})