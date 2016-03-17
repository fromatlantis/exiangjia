'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var StaticView=require('./StaticView');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var FetchApi=require('./FetchApi');
	var Util=require('./Util');
	var Toasts=require('./Toasts');

	var util=new Util();
	var toasts=new Toasts();
	var pageParams={
		orderno:util.urlParam('orderno'),
		userid:util.urlParam('providerId'),
		couponId:util.urlParam('couponId'),
		couponNum:util.urlParam('couponNum'),
		score:0
	};
	var Apis={
		auntDetail:'/removte/provider/getProviderInfo',
		queryOrderInfo:'/removte/order/queryOrderInfo',
		cancelOrder:'/removte/order/cancleOrderform',//cancel拼错了哥哥..
		payOrder:'/removte/pay/payOrder',
		weixinPay:'/removte/pay/weixin/weixinPaySign',
		submitComment:'/removte/ordercomment/submitProviderJudge',
		payState:'/removte/pay/onlinePayState'
	}

	if(sessionStorage.userInfo){
        util.getUserInfo(sessionStorage.code,function(){
            _init();//实时更新用户数据    
        }); 
    }else{
        util.wxAuthCode(function(){
            _init(); 
        });
    }

	//_init();
 	function _init(){
		$('footer').hide();
		//var order_status=util.urlParam('order_status');
		//renderOrder(order_status);
		renderOrder();
    }
    function renderOrder(){
    	var data = new FormData();
        data.append('orderno', pageParams.orderno);
        var orderInfo=new FetchApi({
            urlApi:Apis.queryOrderInfo,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
            //alert(JSON.stringify(this.records));
            if(this.records.code==200){
	            if(!!this.records.data){
	            	var orderInfo=this.records.data;
	            	pageParams.userid=orderInfo.providerId;
		            var serviceType=orderInfo.serviceclass;
		            var orderState=orderInfo.state;
		            orderInfo.serviceType=serviceType;
		            orderInfo.serviceclass=util.serviceTypeMap(serviceType);
		            orderInfo.orderAgreedTime=util.formatDate('MM月dd日 hh:mm',orderInfo.orderAgreedTime.replace(/-/g,"/"));
		            //保姆类没有结束时间
		            if(!!orderInfo.orderDurationTime){
			            orderInfo.orderDurationTime=util.formatDate('MM月dd日 hh:mm',orderInfo.orderDurationTime.replace(/-/g,"/"));
			        }
		            if(orderInfo.ordertype==1){
		            	orderInfo.cycleList.forEach(function(item){
		            		item.orderAgreedTime=util.formatDate('MM月dd日',item.orderAgreedTime.replace(/-/g,"/"));
		            	})
		            }	
					if(orderState==6 && this.records.data.providerJudgeLevel==null){
						$('.main').css({'padding-bottom':'5rem'});
						_initWaitAppraise(this.records);
					}else if(orderState==6){
						_initComplete(this.records);
					}else if(orderState==2){
						_initWaitService(this.records);
						//$('.main').css({'padding-bottom':0});
					}else if(orderState==5){
						$('.main').css({'padding-bottom':0});
						_initWaitPay(this.records);
					}else if(orderState==3){
						_initCancelOrder(this.records);
					}else if(orderState==1){
						_initSearchAunt(this.records);
					}
				}
			}else{
				toasts.alert(this.records.message);
			}
        });
    }
    function getAuntNo(){
    	var data = new FormData();
        data.append('userid',pageParams.userid);
        var orderInfo=new FetchApi({
            urlApi:Apis.auntDetail,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
        	if(this.records.code==200){
	        	$('.aunt-no').attr('href','tel:'+this.records.data.mobile);
	        }else{
	        	toasts.alert(this.records.message);
	        }
        });
    }
    function renderAuntInfo(){
    	var data = new FormData();
        data.append('userid',pageParams.userid);
        var orderInfo=new FetchApi({
            urlApi:Apis.auntDetail,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
        	if(this.records.code==200){
	        	_submitComment();
	            _initAuntChip(this.records);
	            pageParams.auntInfo=this.records;
	        }else{
	        	toasts.alert(this.records.message);
	        }
        });
    }
    function _initAuntChip(data,callback){
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/auntChip.html'),
			tmplData:data
		});
		var appView=new View({
			holder:'.aunt-chip',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			if(callback)
				callback();
		});
    }
    function renderAuntInfoNotAppraise(){
    	var data = new FormData();
        data.append('userid',pageParams.userid);
        var orderInfo=new FetchApi({
            urlApi:Apis.auntDetail,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
            _initAuntChipNotAppraise(this.records);
            pageParams.auntInfo=this.records;
        });
    }
     function _initAuntChipNotAppraise(data){
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/auntChipNotAppraise.html'),
			tmplData:data
		});
		var appView=new View({
			holder:'.aunt-chip',
			content:appTmpl.getHtml()
		})
		appView.render();
    }
    function _initWaitService(records){
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/orderDetail.html'),
			tmplData:{
				title:'等待服务',
				status:'waitService',
				orderInfo:records.data
			}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			getAuntNo();
			_bindEvents();
			//execAnim('.order-item img','bounceIn');
		});
    }
    function _initSearchAunt(records){
    	var title='竞单中';
    	var status='searchAunt';
    	var serviceclass=records.data.serviceclass;
    	if(serviceclass=='保姆' || serviceclass=='月嫂' || serviceclass=='育婴师'){
    		title=serviceclass;//保姆类
    		status='nurse';
    	}
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/orderDetail.html'),
			tmplData:{
				title:title,
				status:status,
				orderInfo:records.data
			}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			_bindEvents();
			$('.search-aunt-btn').click(function(){
				if(status=='searchAunt'){
					var providers='';
					if(!!records.data.providers){
						providers=records.data.providers;
					}
					window.location.href='auntList.html?orderno='+pageParams.orderno+'&providers='+providers;
				}else if(status=='nurse'){
					window.location.href='order.html';
				}
			})
		});
    }
    function _initWaitPay(records){
    	var balance=0;
    	var usercoupon=0;
    	if(sessionStorage.userInfo){
    		var userInfo=JSON.parse(sessionStorage.userInfo);
    		balance=userInfo.data.balance;
    		usercoupon=userInfo.data.usercoupon;
    	}
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/orderDetail.html'),
			tmplData:{
				title:'等待支付',
				status:'waitPay',
				orderInfo:records.data,
				balance:balance
			}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			if(usercoupon==0){
				$('.coupon-price').text('暂无可用优惠券');
			}else{
				$('.coupon-price').text('您有'+usercoupon+'张可用优惠券');
			}
			_payWayEvent(balance);
			$('#use-coupon').click(function(){
				window.location.href='coupons.html?orderno='+pageParams.orderno+'&serviceclass='+records.data.serviceType;
			})
			//兼容2.0优惠券
			if(records.data&&!!records.data.couponid){
				pageParams.couponId=records.data.couponid;
				pageParams.couponNum=records.data.couponValue;
			}
			if(!!pageParams.couponId){
				var price=$('.real-price').text();
				$('.coupon-price').text('减免'+pageParams.couponNum+'元');
				var finalnum=price-pageParams.couponNum>0?price-pageParams.couponNum:0;
				$('.pay-num').text(finalnum);
				//优惠券不能混合现金使用
				$('.crash-table').hide();
			}
			$('#pay-btn').click(function(event) {
				_payOrder(balance);
			});
		});
    }
    function _initWaitAppraise(records){
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/orderDetail.html'),
			tmplData:{
				title:'已完成等待评价',
				status:'waitAppraise',
				orderInfo:records.data
			}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			renderAuntInfo();
		});
    }
    function _initComplete(records){
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/orderDetail.html'),
			tmplData:{
				title:'已完成',
				status:'waitAppraise',
				orderInfo:records.data
			}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			$('footer').show();
			var footerView=new StaticView({
				tmplName:require('./templates/footer.html'),
				tmplData:{
					current:2
				},
				holder:'footer'
			})
			if(!!pageParams.userid){//保姆类，没有阿姨详情
				renderAuntInfoNotAppraise();
			}else{
				$('.wait-appraise').hide();
			}
		});
    }   
    function _initCancelOrder(records){
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/orderDetail.html'),
			tmplData:{
				title:'已取消',
				status:'cancelOrder',
				orderInfo:records.data
			}
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render();
    }
    function _bindEvents(){
    	var vh=$(window).height();
    	var hh=$('header').height();
    	$('.order-detail-page').css({'min-height':vh-hh});
    	var refreshFlag=true;
    	$('.refresh').tap(function(){
    		if(refreshFlag){
    			var me=$(this);
	    		me.addClass('rotateAn');
	    		var data = new FormData();
		        data.append('orderno', pageParams.orderno);
		        var orderInfo=new FetchApi({
		            urlApi:Apis.queryOrderInfo,
		            fetchParams:{
		                method: 'post',
		                body:data
		            }
		        },function(){
		        	if(this.records.data.state==5){
		        		refreshFlag=false;
		        		me.removeClass('rotateAn');
		            	//alert(JSON.stringify(this.records));
		            	var serviceType=this.records.data.serviceclass;
		            	this.records.data.serviceclass=util.serviceTypeMap(serviceType);
		            	$('.main').css({'padding-bottom':0});   	
						_initWaitPay(this.records);
					}else{
						setTimeout(function(){
							refreshFlag=true;
							me.removeClass('rotateAn');
						},3000)
					}
		        });
		    }
    	})
    	$('.order-cancel').click(function(event) {
    		toasts.confirm('您确信要取消当前订单吗？',function(){
    			var data = new FormData();
		        data.append('orderno', pageParams.orderno);
		        var orderInfo=new FetchApi({
		            urlApi:Apis.cancelOrder,
		            fetchParams:{
		                method: 'post',
		                body:data
		            }
		        },function(){
		        	if(this.records.code==200){
		            	renderOrder();
					}else{
						toasts.alert(this.records.message);
					}
		        });
    		})
    		/**
    		var cfm = confirm("您确信要取消当前订单吗？");
            if(cfm == true) {
	    		var data = new FormData();
		        data.append('orderno', pageParams.orderno);
		        var orderInfo=new FetchApi({
		            urlApi:Apis.cancelOrder,
		            fetchParams:{
		                method: 'post',
		                body:data
		            }
		        },function(){
		        	if(this.records.code==200){
		            	renderOrder();
					}else{
						toasts.alert(this.records.message);
					}
		        });
	        }
	        **/
    	});
    }
    function _payOrder(balance){
    	var $ways=$('.menu-item-right img.checked');
    	var price=$('.real-price').text();
    	if(!!pageParams.couponId){
			price=price-pageParams.couponNum>0?price-pageParams.couponNum:0;
		}
    	var _balance=0,money=0;
    	var wxPay=false;
    	if($ways.length>0){
	    	$ways.each(function(index, el) {
				if($(this).data('pay-type')=='balance'){
					if(price>=balance){
						_balance=balance;
					}else {
						_balance=price;
					}
				}
				if($(this).data('pay-type')=='crash'){
					money=$('.pay-num').text();
					wxPay=false;
				}
				if($(this).data('pay-type')=='wpay'){
					money=$('.pay-num').text();
					wxPay=true;
				}
	    	});
	    	if(wxPay&&money>0){
				_payWx(_balance,money);
	    	}else{
	    		_payCrash(_balance,money);
	    	}
	    }else{
	    	toasts.alert('请选择支付方式！');
	    }
    }
    function _copyAuntInfo(){
    	var auntInfo={};
		auntInfo.icon=pageParams.auntInfo.data.icon;
		auntInfo.startlevel=pageParams.auntInfo.data.startlevel;
		auntInfo.realname=pageParams.auntInfo.data.realname;
		auntInfo.goodNum=pageParams.auntInfo.data.goodNum;
		auntInfo.averageNum=pageParams.auntInfo.data.averageNum;
		auntInfo.badNum=pageParams.auntInfo.data.badNum;
		return auntInfo;
    }
    function _submitComment(){
    	$('.main').on('tap','.appraise-a',function(){
    		var $i=$(this).find('i'); 
    		var auntInfo=_copyAuntInfo();
    		var record={
    			data:auntInfo
    		}
    		if($i.hasClass('icon-good')){
	    		record.data.goodNum++;
	    		_initAuntChip(record,function(){
	    			//$img.attr('src',aimgh);这种写法是错误的，回调函数中不能用this
		    		$('.appraise-a').find('i').removeClass('icon-good');
		    		$('.appraise-a').find('i').addClass('icon-goodh');
		    		pageParams.score=100;
		    	});	
	    	}else{
	    		_initAuntChip(record,function(){
		    		$('.appraise-a').find('i').removeClass('icon-goodh');
		    		$('.appraise-a').find('i').addClass('icon-good');
		    		pageParams.score=0;
		    	});
	    	}
    	})
    	$('.main').on('tap','.appraise-b',function(){
    		var $i=$(this).find('i');
    		var auntInfo=_copyAuntInfo();
    		var record={
    			data:auntInfo
    		}
    		if($i.hasClass('icon-average')){
	    		record.data.averageNum++;
	    		_initAuntChip(record,function(){
	    			//$img.attr('src',aimgh);这种写法是错误的，回调函数中不能用this
		    		$('.appraise-b').find('i').removeClass('icon-average');
		    		$('.appraise-b').find('i').addClass('icon-averageh');
		    		pageParams.score=60;
		    	});	
	    	}else{
	    		_initAuntChip(record,function(){
		    		$('.appraise-b').find('i').removeClass('icon-averageh');
		    		$('.appraise-b').find('i').addClass('icon-average');
		    		pageParams.score=0;
		    	});
	    	}
    	})
    	$('.main').on('tap','.appraise-c',function(){
    		var $i=$(this).find('i');
    		var auntInfo=_copyAuntInfo();
    		var record={
    			data:auntInfo
    		}
    		if($i.hasClass('icon-bad')){
	    		record.data.badNum++;
	    		_initAuntChip(record,function(){
	    			//$img.attr('src',aimgh);这种写法是错误的，回调函数中不能用this
		    		$('.appraise-c').find('i').removeClass('icon-bad');
		    		$('.appraise-c').find('i').addClass('icon-badh');
		    		pageParams.score=20;
		    	});	
	    	}else{
	    		_initAuntChip(record,function(){
		    		$('.appraise-c').find('i').removeClass('icon-badh');
		    		$('.appraise-c').find('i').addClass('icon-bad');
		    		pageParams.score=0;
		    	});
	    	}
    	})
    	$('#submitComment').tap(function(){
			var comment=$('.appraise-tips').val();
			if(pageParams.score==0){
				toasts.alert('请您选择好评、中评或差评');
			}else{
				$(this).attr('disabled','disabled');
				$('.page-overlay').show();
				var userInfo=JSON.parse(sessionStorage.userInfo);
				var data = new FormData();
		        data.append('orderno', pageParams.orderno);
		        data.append('providerJudgeLevel',pageParams.score);
		        data.append('commentContent',comment);
		        //alert(userInfo.data.mobile);
		        data.append('mobile',userInfo.data.mobile);
		        var orderInfo=new FetchApi({
		            urlApi:Apis.submitComment,
		            fetchParams:{
		                method: 'post',
		                body:data
		            }
		        },function(){
		        	if(this.records.code==200){
		            	toasts.show('评价成功！');
		            	$('.appraise-tips').val('');
		            	renderOrder();
					}else{
						toasts.alert(this.records.message);
					}
					$('#submitComment').removeAttr('disabled');
					$('.page-overlay').hide();
		        });
			}
		})
    }
    function _payWayEvent(balance){
    	var checked='/images/wx/order/detail/checked.png';
		var uncheck='/images/wx/order/detail/uncheck.png';
		var price=$('.pay-num').text();
		$('.balance-check img').click(function(event) {
			var imgsrc=$(this).attr('src');
			if(imgsrc==uncheck){
				$(this).attr('src',checked);
				$(this).addClass('checked');
				if(price>balance){
					if(!!pageParams.couponId){
						var finalnum=price-balance-pageParams.couponNum>0?price-balance-pageParams.couponNum:0;
						$('.pay-num').text(finalnum);
					}else{
						$('.pay-num').text(price-balance);
					}
				}else{
					$('.pay-num').text('0');
					$('.pay-other').hide();
					$('.pay-check img').attr('src',uncheck);
					$('.pay-check img').removeClass('checked');
				}
			}else{
				$(this).attr('src',uncheck);
				$(this).removeClass('checked');
				if(price<balance){
					$('.pay-check img').attr('src',uncheck);
					$('.pay-check img').removeClass('checked');
				}	
				if(!!pageParams.couponId){
					var finalnum=price-pageParams.couponNum>0?price-pageParams.couponNum:0;
					$('.pay-num').text(finalnum);
				}else{
					$('.pay-num').text(price);
				}
				$('.pay-other').show();
			}

		});
		$('.pay-check img').click(function(event) {
			var imgsrc=$(this).attr('src');
			$('.pay-check img').attr('src',uncheck);
			$('.pay-check img').removeClass('checked');
			//if(imgsrc==uncheck){
				$(this).attr('src',checked);
				$(this).addClass('checked');
			//}else{
				//$(this).attr('src',uncheck);
			//}
		});
    }
    function _payCrash(_balance,money){
		$('#pay-btn').attr('disabled','disabled');
		$('.page-overlay').show();
    	var data = new FormData();
        data.append('orderno', pageParams.orderno);
        data.append('balance',_balance);
        data.append('money',money);
        if(!!pageParams.couponId){
        	data.append('coupon',pageParams.couponId);
        }
        //alert('crash');
        //alert(_balance);
        //alert(money);
        var orderInfo=new FetchApi({
            urlApi:Apis.payOrder,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
        	if(this.records.code==200){
        		if(this.records.data==1){
	            	renderOrder();
	            }else{
	            	toasts.alert(util.payErrMap(this.records.data));
	            }
			}else{
				toasts.alert('支付失败，请重试！')
			}
			$('#pay-btn').removeAttr('disabled');
			$('.page-overlay').hide();
        });
    }
 	function _payWx(_balance,money){
 		$('#pay-btn').attr('disabled','disabled');
		$('.page-overlay').show();
    	var data = new FormData();
        data.append('orderno', pageParams.orderno);
        data.append('balance',_balance);
        data.append('money',money);
        data.append('payFlag','1');
        data.append('remark','线上支付');
        if(!!pageParams.couponId){
        	data.append('coupon',pageParams.couponId);
        	
        }
        //alert('wxpay');
        //alert(_balance);
        //alert(money);
        var orderInfo=new FetchApi({
            urlApi:Apis.weixinPay,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
        	if(this.records.code==200){
        		//alert(this.records.data);
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
		           		if(res.err_msg == "get_brand_wcpay_request:ok") {
		           			_payState(info.orderno);
		           		}else{
		           			if(res.err_msg != "get_brand_wcpay_request:cancel"){
			           			toasts.alert(res.err_msg);
			           		}
           				}
		           		// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
			       	}
			   	); 
			}else{
				toasts.alert(this.records.message);
			}
			$('#pay-btn').removeAttr('disabled');
			$('.page-overlay').hide();
        });
    }
    function _payState(orderno){
    	var data = new FormData();
    	//alert(orderno);
        data.append('orderno', orderno);
     	var payState=new FetchApi({
            urlApi:Apis.payState,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
        	if(this.records.data==1){
        		window.location.href='paySuccess.html?orderno='+pageParams.orderno;
        	}else if(this.records.data==0){
        		toasts.alert('待确认');
        	}else if(this.records.data==2){
        		toasts.alert('支付失败');
        	}
        });
    }
})