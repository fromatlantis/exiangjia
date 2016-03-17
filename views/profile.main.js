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
	var pageParams={};
	var Apis={
		getOrderList:'/removte/order/getOrderList',
        userCoupon:'/removte/user/searchUserCoupon'
	}
	var footerView=new StaticView({
		tmplName:require('./templates/footer.html'),
		tmplData:{
			current:3
		},
		holder:'footer'
	})

	if(sessionStorage.userInfo){
        util.getUserInfo(sessionStorage.code,function(){
            _init();//实时更新用户数据    
        })  
    }else{
        util.wxAuthCode(function(){
            _init();//入口函数
        });
    }

	//_initOrderView();//入口函数

	function _initOrderView(data){
		var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/profile.html'),
			tmplData:data
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			_bindEvents();
			//getNocomment();
            //countCoupons();
			execAnim('.profile-icon img','bounceIn');
		});
	}
     
    function _init(){
        //alert(sessionStorage.userInfo);
        var userInfo=JSON.parse(sessionStorage.userInfo);
        _initOrderView(userInfo);
    }

    function _bindEvents(){
    	//storage只能存储字符串，使用时应转换为json
    	var userInfo=JSON.parse(sessionStorage.userInfo);
        $('.tabs-orders').click(function(){
            window.location.href='order.html';
        })
        $('.tabs-wait-pay').click(function(){
            //window.location.href='order.html?state=5'; 由于微信API用到state参数，所以其他接口应避免state参数
            window.location.href='order.html?status=5';
        })
    	$('.tabs-wait-comment').click(function(){
    		window.location.href='order.html?nocomment=0';
    	})
        $('.tabs-wait-service').click(function(){
            window.location.href='order.html?servicestate=0';
        })
    	$('.to-coupons').click(function(){
    		window.location.href='coupons.html';
    	})
    	$('.to-recharge').click(function(){
    		window.location.href='recharge.html';
    	})
    	$('.to-address').click(function(){
    		window.location.href='serviceAddress.html?userid='+userInfo.data.id;
    	})
    	$('.to-feedback').click(function(){
    		window.location.href='feedback.html';
    	})
    	$('.to-bill').click(function(){
    		window.location.href='bills.html';
    	})
    }
    function getNocomment(){
    	var userInfo=JSON.parse(sessionStorage.userInfo);
    	var data=new FormData();
        data.append('mobile',userInfo.data.mobile);
        //data.append('providerJudgeLevel','0');
        //data.append('status','6');
        data.append('pageNo','1');
        data.append('pageSize','10000');
        var userInfo=new FetchApi({
            //urlApi:Apis.getUserInfo+'?code='+util.code
            urlApi:Apis.getOrderList,
            fetchParams:{
                method:'post',
                body:data
            }
        },function(){
            if(this.records.code==200){
                if(!!this.records.data){
                    var payArr=[],commentArr=[],serviceArr=[];
                    this.records.data.forEach(function(e){
                        if(e.state==5){
                            payArr.push(e);
                        }else if(e.state==6 && e.providerJudgeLevel==null){
                            commentArr.push(e);
                        }else if(e.state==2){
                            serviceArr.push(e);
                        }
                    })
                    if(payArr.length>0){
                        $('.wait-pay-num').text(payArr.length);
                        $('.wait-pay-num').show();
                    }
                    if(commentArr.length>0){
                        $('.wait-comment-num').text(commentArr.length);
                        $('.wait-comment-num').show();
                    }
                    if(serviceArr.length>0){
                        $('.wait-service-num').text(commentArr.length);
                        $('.wait-service-num').show();
                    }
                    //$('.no-comment').text(this.records.data.length);
                }
            }else{
                toasts.alert(this.records.message);
            }
        });
    }
    function countCoupons(){
        var userInfo=new FetchApi({
            urlApi:Apis.userCoupon
        },function(){
            if(this.records.code==200){
                if(!!this.records.data){
                    $('.coupons-count').text(this.records.data.length+' 张');
                }else{
                    $('.coupons-count').text('0 张');
                }
            }else{
                toasts.alert(this.records.message);
            }
        });
    }
    function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
})