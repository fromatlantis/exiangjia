define(function(require,exports,module){
	//var zepto=require('zepto');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var Toasts=require('./Toasts');
    var FetchApi=require('./FetchApi');
    var Util=require('./Util');

	var toasts=new Toasts();
    var util=new Util();
    var Apis={
        sendCode:'/removte/user/sendCode',
        register:'/removte/user/register',
        getUseraddressList:'/removte/user/getUseraddressList',
        saveOrderform:'/removte/order/saveOrderform',
        saveCycleOrderform:'/removte/order/saveCycleOrderform',
        saveNurseOrderform:'/removte/order/saveNurseOrderform',
        getMyProviders:'/removte/provider/getMyProviders',
        queryOrderInfo:'/removte/order/queryOrderInfo'
    };
    var pageParams={
        type:util.urlParam('type'),//自定义服务品类如：cleanWindow、monthly等
        serviceclass:util.urlParam('serviceclass'),//服务品类ID
        orderAgain:util.urlParam('orderAgain'),//再来一单功能标识
        orderno:util.urlParam('orderno'),//再来一单功能：订单号
        myAunt:[],
        providers:'',
        fotileType:'',//油烟机类型
        selectedDay:'',//周期订单所选日期对应的星期
        weekTimes:1,
        customerRemark:null
    };
    if(sessionStorage.userInfo){
        _init();
    }else{
        util.wxAuthCode(function(){
            _init(); 
        });
    }
    //_init();
	function _initHousekeepingView(data){
        data.serviceType='';
        var appTmpl;

        if(pageParams.type=='nurse'){
            data.serviceType='nurse';
            data.serviceclass=pageParams.serviceclass;
        }else if(pageParams.type=='wasteland'){
            data.serviceType='wasteland';
        }
        appTmpl=new TemplateFromUrl({
            tmplName:require('./templates/fillOrder.html'),
            tmplData:data
        });
		var appView=new View({
			holder:'.fillOrder-page',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
            readSession();
			_bindEvents();
            pageParams.userInfo=JSON.parse(sessionStorage.userInfo);
            if(pageParams.orderAgain){
                renderOrderAgain();
            }else{
                resetHeight();
            }
            //var userInfo=JSON.parse(sessionStorage.userInfo);
            //alert(userInfo.data.id);
		})
    }
     
    function _init(){
    	var vh=$(window).height();
		$('footer').hide();
		$('.main').css({'height':vh});
		$('.main').css({'padding-bottom':0});
        if(pageParams.type!='daily'){
            $('.remark-daily').hide();//日常保洁
        }
        if(pageParams.type=='nurse'){
            $('.remark-items').hide();//保姆类只填写要求
        }
        _delegateEvents();
        var userInfo=JSON.parse(sessionStorage.userInfo);
        _initHousekeepingView(userInfo);
    }
    function _delegateEvents(){
        var mobileReg = /^1[3-9]\d{9}$/;
        $('.main').on('click','.fill-address',function(){
            pageOut('.fillOrder-page');
            pageIn('.newAddress-page');
            $(".btn-chip").show();
            $(".address-list").show();
            getAddressListData();
            execAnim('.newAddress-page','bounceInRight',function(){
                $('.newAddress-page').removeClass('bounceInRight');
            });
        })
        $('.main').on('click','.new-address-btn',function(){
            var house=$('#address-house').val();
            var houseCheck=$('#house-check').val();
            var door=$('#address-door').val();
            if(house==""){
                toasts.show('请填写服务地址');
            }else if(house!=houseCheck){
                toasts.show('请您选择下拉菜单中的地址。');
            }else if(houseCheck.indexOf("石家庄")<0 || houseCheck.indexOf("鹿泉")>-1 || houseCheck.indexOf("栾城")>-1 || houseCheck.indexOf("藁城")>-1 || houseCheck.indexOf("井陉")>-1 || houseCheck.indexOf("县")>-1){
                toasts.show('抱歉，我们目前只能提供石家庄市区内的服务。');
            }else if(door==''){
                toasts.show('请填写门牌号');
            }else{
                $(".btn-chip").hide();
                $(".address-list").hide();
                //$('.main').css({'height':$(window).height()});
                $("#appAddress").text(house+door);
                sessionStorage.addressArea=house;
                sessionStorage.addressHouse=door;
                resetHeight();
                execAnim('.newAddress-page','bounceOutRight',function(){
                    $('.newAddress-page').removeClass('bounceOutRight');
                    pageOut('.newAddress-page');
                    pageIn('.fillOrder-page');
                });                   
            }
        })
        $('.main').on('click','.order-btn',function(){
            var address=$('#appAddress').text(),
                date=$('#appDate').val(),
                phone=$('#appPhone').val();
            if(address==''||address=='请选择服务地点'){
                toasts.show('请填写服务地点');
            }else if(date==''){
                toasts.show('请填写服务时间');
            }else if(phone==''){
                toasts.show('请填写手机号');
            }else if(!mobileReg.test(phone)){
                toasts.show('请填写正确的手机号');
            }else{
                newOrder();
                //window.location.href='searchAunt.html';
            }
        })
    }
    function _bindEvents(){
		var dateScroll = function(){
	        var date = new Date();
	        var curr = new Date().getFullYear(),
	            d = date.getDate(),
	            m = date.getMonth();
	        $('#appDate').scroller({
	            preset: 'date',
	            minDate: new Date(curr, m, d, 8, 00),
	            //maxDate: new Date(curr, m, d+10),
	            //invalid: [{ d: new Date(), start: '00:00', end: (date.getHours()+2)+':'+date.getMinutes() }],
	            theme: "android-ics light",
	            mode: "scroller",
	            lang: 'zh',
	            display:"bottom",
	            animate: "slideup",
	            stepMinute: 30,
	            dateOrder: 'MMddD',
	            rows:3,
	            timeWheels: 'HHii',
                dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
	            onSelect: function (valueText, inst) {
	            }
	        });
        }
        dateScroll();//时间选择控件
    }
    function pageIn(page){
		$(page).css({'z-index':1});
		$(page).css({'opacity':1});
    }
    function pageOut(page){
    	$(page).css({'z-index':-1});
		$(page).css({'opacity':0});
    }
    function execAnim(el,x,callback) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	      if(callback)
	      	callback();
	    });
  	};
    function newOrder(){
        $(this).attr('disabled','disabled');
        $('.page-overlay').show();
        $('.page-tips').text('数据提交中，请稍后···');
        var serviceTime=$("#appDate").val();
        var data = new FormData();
        data.append('customerId', pageParams.userInfo.data.id);
        data.append('addressArea', sessionStorage.addressArea);
        data.append('addressHouse', sessionStorage.addressHouse);
        data.append('baiduMapLng', sessionStorage.baiduMapLng);
        data.append('baiduMapLat', sessionStorage.baiduMapLat);
        data.append('orderAgreedTime', serviceTime);
        data.append('serviceclass',pageParams.serviceclass);
        data.append('contactMobile', $('#appPhone').val());
        data.append('customerRemark', $('#customRemark').val());
        //alert(pageParams.userInfo.data.wechatName);
        data.append('linkman',pageParams.userInfo.data.wechatName);
        var url=Apis.saveNurseOrderform;
        var order=new FetchApi({
            urlApi:url,
            fetchParams:{
                method: 'post',
                body: data
            }
        },function(){
            //alert(JSON.stringify(this.records));
            if(this.records.code==200){
                window.location.href='orderDetail.html?orderno='+this.records.data.orderno;
            }else{
                toasts.alert(this.records.message);
                //toasts.show(this.records.message);
            }
            $('.order-btn').removeAttr('disabled');
            $('.page-overlay').hide();
        });
    }
    //获取地址列表
    function _initAddressListView(records){
        records.type='fillOrder';
        var appTmpl=new TemplateFromUrl({
            tmplName:require('./templates/serviceAddress.html'),
            tmplData:records
        });
        var appView=new View({
            holder:'.address-list',
            content:appTmpl.getHtml()
        })
        appView.render(function(){
            var vh=$(window).height();
            //重置高度
            var h1=$('.address-base').height();
            var h2=$('.address-list').height();
            var btn=$('.btn-chip').height();
            if((h1+h2+btn)>vh){
                $('.main').css({'height':h1+h2+btn});
            }else {
                $('.main').css({'height':$(window).height()});
            }
            $(".address-page .table").on("click",function(){
                //特别注意data属性不能用大写
                var area=$(this).find('.area').text();
                var house=$(this).find('.house').text();
                var baiduMapLng=$(this).data('address-lng');
                var baiduMapLat=$(this).data('address-lat');

                sessionStorage.addressArea=area;
                sessionStorage.addressHouse=house;
                sessionStorage.baiduMapLat=baiduMapLat;
                sessionStorage.baiduMapLng=baiduMapLng;

                $(".btn-chip").hide();
                $(".address-list").hide();
                //$('.main').css({'height':vh});
                $("#appAddress").text(area+house);
                resetHeight();
                execAnim('.newAddress-page','bounceOutRight',function(){
                    $('.newAddress-page').removeClass('bounceOutRight');
                    pageOut('.newAddress-page');
                    pageIn('.fillOrder-page');
                });    
            })
        });
    }
    function getAddressListData(){
        var data = new FormData();
        data.append('userid', pageParams.userInfo.data.id);
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
    function readSession(){
        if(sessionStorage.addressArea){
            var area=sessionStorage.addressArea;
            var house=sessionStorage.addressHouse;
            $('#appAddress').text(area+house);
        }
        if(sessionStorage.appDate){
            $('#appDate').val(sessionStorage.appDate);
        }
    }
    //再来一单功能
    function renderOrderAgain(){
        var data = new FormData();
        data.append('orderno', pageParams.orderno);
        var orderInfo=new FetchApi({
            urlApi:Apis.queryOrderInfo,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
            if(this.records.code==200){
                //alert(JSON.stringify(this.records));
                sessionStorage.addressArea=this.records.data.addressArea;
                sessionStorage.addressHouse=this.records.data.addressHouse;
                sessionStorage.baiduMapLng=this.records.data.baiduMapLng;
                sessionStorage.baiduMapLat=this.records.data.baiduMapLat;
                sessionStorage.removeItem('appDate');
                pageParams.providers=this.records.data.providerId;
                $('#appAddress').text(this.records.data.addressArea+this.records.data.addressHouse);
                var aunt=[{'icon':util.urlParam('icon'),'name':decodeURI(util.urlParam('jjname'))}];
                renderMyAuntChip(aunt);
            }else{
                toasts.alert(this.records.message);
            }
        })
    }
    //包月服务重新计算页面高度
    function resetHeight(){
        var vh=$(window).height();
        var btnh=$('.fill-btn-box').height();
        var top=$('.fill-top').height();
        var bot=$('.fill-bot').height();
        //alert(vh);
        //alert(top+bot+btnh);
        if(vh-bot-top-btnh<80){
            //不知道60的差值哪里来。。
            $('.main').css({'height':top+bot+btnh+80});
        }else{
            $('.main').css({'height':vh});
        }
    }
})