'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var FetchApi=require('./FetchApi');
	var Util=require('./Util');
    var Toasts=require("./Toasts");

	var util=new Util();
    var toasts=new Toasts();
	var pageParams={};
	var Apis={
		getUserInfo:'/removte/user/getUserInfo',
		exchangecode:'/removte/recharge/code/exchangecode',
		rechargePay:'/removte/pay/weixin/weixinRechargePaySign',
		payState:'/removte/pay/onlinePayState',
        onlineRecharge:'/removte/recharge/code/getOnlineRechargeActivity'
	}

	if(sessionStorage.userInfo){
		 _init();//入口函数      
    }else{
        util.wxAuthCode(function(){
            _init();//入口函数
        });
    }
    
    //_init();
    
	function _initOrderDetailView(data){
        //var userInfo=JSON.parse(sessionStorage.userInfo);
        //data.isMember=userInfo.data.isMember;
        data.isMember=1;
		var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/recharge.html'),
			tmplData:data
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			_bindEvents();
			execAnim('.charge-item','bounceInRight');
		});
	}
     
    function _init(){
		$('.main').css({'padding-bottom':0});
        var userInfo=new FetchApi({
            urlApi:Apis.onlineRecharge
        },function(){
            //alert(JSON.stringify(this.records));
            _initOrderDetailView(this.records);//入口函数
        });
    }

    function _bindEvents(){
    	$('.modal-close').tap(function(){
    		$('.vip-tips-modal').hide();
            setTimeout(function(){
                $('.page-overlay').hide();
            },500);
    	})
    	$('.vip-code-tips').on('click',function(){
    		$('.page-overlay').show();
    		$('.vip-tip').show();
    	})
    	$('.vip-code-box').tap(function(){
            var $change=$('.vip-change');
            if($change.css('display')=='none'){
                $('.vip-change').show();
            }else {
                $('.vip-change').hide(); 
            }
    	})
    	$('#change-btn').click(function(){
    		changeCode();
    	})
    	$('.charge-btn').click(function(event) {
    		var money=$(this).data('price');
    		//var money='1';
    		_payWx(money);
    	});
    }
    function changeCode(){
    	var code=$('.change-code').val();
		if(code==''){
			toasts.show('请输入兑换码');
		}else{
    		var data=new FormData();
    		data.append('rechagreCode',code);
    		var charge=new FetchApi({
			 	urlApi:Apis.exchangecode,
	            fetchParams:{
	                method:'post',
	                body:data
	            }
    		},function(){
    			if(this.records.code==200){
    				toasts.alert('充值成功');
                    $('.vip-change').hide(); 
                    $('.change-code').val('');
    			}else{
    				//toasts.show('系统错误，请联系客服！');
    				toasts.alert(this.records.message);
    			}
    		})
    	}
    }
    function _payWx(money){
    	var data = new FormData();
        data.append('money',money);
        data.append('remark','微信充值');
        var orderInfo=new FetchApi({
            urlApi:Apis.rechargePay,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
        	if(this.records.code==200){
        		var info=this.records.data;
        		WeixinJSBridge.invoke('getBrandWCPayRequest', {
		           		"appId":info.appId,     //公众号名称，由商户传入     
		           		"timeStamp":info.timeStamp,         //时间戳，自1970年以来的秒数     
		           		"nonceStr":info.nonceStr, //随机串     
		           		"package":info.package,     
	           			"signType":info.signType,         //微信签名方式：     
		           		"paySign":info.paySign //微信签名 
			       	},
			       	function(res){     
		           		if(res.err_msg == "get_brand_wcpay_request:ok" ) {
		           			_payState(info.orderno);
		           		}else{
		           			if(res.err_msg != "get_brand_wcpay_request:cancel"){
                                alert(res.err_msg);
                            }
           				}
		           		// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
			       	}
			   	); 
			}else{
				alert(this.records.message);
			}
        });
    }
    function _payState(orderno){
    	var data = new FormData();
        data.append('orderno', orderno);
     	var payState=new FetchApi({
            urlApi:Apis.payState,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
        	if(this.records.data==1){
        		alert('支付成功！');
        	}else if(this.records.data==0){
        		alert('待确认');
        	}else if(this.records.data==2){
        		alert('支付失败');
        	}
        });
    }
 	function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
})