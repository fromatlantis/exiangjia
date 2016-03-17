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

	var pageParams={
        phone:null,
        code:util.urlParam('code')
	}
	var Apis={
	 	sendCode:'/removte/user/sendCode',
        register:'/removte/user/register'
	}
    /**
    var code=util.urlParam('code');
    if(!!code){
        pageParams.code=code;
       _init();
    }else{
        //var appId='wx9e60458de7e99750';//e享家
        //var appId='wx2fe53c9baefe37a5'; //e家净
        var appId='wxda1ad46a30222ae2';
        //var currentUrl=encodeURI(window.location);
        var currentUrl=encodeURIComponent(window.location);//注意带参数必须用这种编码
        var wexinApi='https://open.weixin.qq.com/connect/oauth2/authorize';
        window.location.href=wexinApi+'?appid='+appId+'&redirect_uri='+currentUrl+'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
    }
    **/
    _init();
	function _initAppView(){
		var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/login.html'),
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
    	$('footer').hide();
		_initAppView();//入口函数
    }

    function _bindEvents(){
    	var mobileReg = /^1[3-9]\d{9}$/;
    	var $phone=$('#login-mobile');
    	var $code=$('#login-code');
        var $getCodeBtn=$('#get-code');
        var clock;
    	document.getElementById('login-mobile').addEventListener('input',function(){
    		var num=$phone.val().length;
    		if(num===11){
    			$getCodeBtn.removeClass('btn-disable');
    			$getCodeBtn.removeAttr('disabled');
    			$('.fill-clear').css({'visibility':'visible'});
    		}
    	},false);
        var seconds=30;
        function doLoop(){
            seconds--;
            if(seconds > 0){
              $getCodeBtn.text('重新获取'+seconds);
            }else{
              clearInterval(clock); //清除js定时器
              $getCodeBtn.removeAttr('disabled');
              $getCodeBtn.text('获取验证码');
              $getCodeBtn.removeClass('btn-disable');
              seconds = 30; //重置时间
            }
        }
    	$getCodeBtn.on('click',function(){
    		var phone=$phone.val();
    		if(phone==''){
    			toasts.show('请填写手机号');
    		}else if(!mobileReg.test(phone)){
    			toasts.show('请填写正确的手机号码');
    		}else{
                $getCodeBtn.addClass('btn-disable');
                $getCodeBtn.attr('disabled','disabled');
                clock = setInterval(doLoop, 1000); //一秒执行一次
    			_getCode(phone);
    		}
    	})
    	$('.fill-clear').tap(function(){
    		$('#login-mobile').val('');
    		$(this).css({'visibility':'hidden'});
    		$('.btn-submit').addClass('btn-disable');
			$('.btn-submit').attr('disabled','disabled');
    	})
    	document.getElementById('login-code').addEventListener('input',function(){
    		var num=$code.val().length;
    		if(num>4){
    			$('#login-btn').removeClass('btn-disable');
    			$('#login-btn').removeAttr('disabled');
    		}
    	},false);
    	$('#login-btn').on('click',function(){
    		//var phone=$phone.val();
            var phone=pageParams.phone;
    		var code=$code.val();
    		if(phone==''||phone==null){
    			toasts.show('请填写手机号');
    		}else if(!mobileReg.test(phone)){
    			toasts.show('请填写正确的手机号码');
    		}else if(code==''){
    			toasts.show('请填写验证码');
    		}else if(isNaN(code)){
    			toasts.show('请填写正确的验证码');
    		}else{
                $(this).attr('disabled','disabled');
    			_register(phone,code);
    		}
    	})
    }
    function _getCode(phone){
    	var data = new FormData();
        data.append('contactMobile', phone);
        var phoneCode=new FetchApi({
            urlApi:Apis.sendCode,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
            if(this.records.code!=200){
                toasts.alert(this.records.message);
            }else {
                pageParams.phone=phone;
            }
        });
    }
    function _register(phone,code){
	 	var data=new FormData();
        data.append('contactMobile',phone);
        data.append('mobileCode',code);
        data.append('code',pageParams.code);
    	var register=new FetchApi({
            urlApi:Apis.register,
            fetchParams:{
                method:'post',
                body:data
            }
        },function(){
            if(this.records.code==200){
            	toasts.alert('绑定成功！',function(){
                    //pageParams.userInfo=this.records;
                    sessionStorage.userInfo=JSON.stringify(this.records);
                    window.location.href = document.referrer;
                });
            }else{
                toasts.alert(this.records.message);
                //toasts.show(this.records.message);
            }
            $('#login-btn').removeAttr('disabled');
        });
    }
    function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
})