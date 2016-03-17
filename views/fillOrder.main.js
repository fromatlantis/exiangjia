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
        if(pageParams.type=='cleanWindow'){
            data.serviceType='cleanWindow';
            appTmpl=new TemplateFromUrl({
                tmplName:require('./templates/fillOrder.html'),
                tmplData:data
            });
        }else if(pageParams.type=='monthly'){
             appTmpl=new TemplateFromUrl({
                tmplName:require('./templates/fillOrder/monthly.html'),
                tmplData:data
            });
        }else if(pageParams.type=='fotile'){
            appTmpl=new TemplateFromUrl({
                tmplName:require('./templates/fillOrder/fotile.html'),
                tmplData:data
            });
        }else{
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
        }
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
        $('.main').on('click','.fill-myAunt',function(){
            $(".btn-chip").show();
            $(".myAunt-wrap").show();
            getMyAuntData();
        })
        $('.main').on('click','.fill-fotile-type',function(){
            pageOut('.fillOrder-page');
            pageIn('.fotileType-page');
            $('.main').css({'height':$(window).height()});
            renderFotile();
            execAnim('.fotileType-page','bounceInRight',function(){
                $('.fotileType-page').removeClass('bounceInRight');
            });
        })    
        $('.fillOrder-page').on('click','.weeks-count>div',function(){
            var no=$(this).data('weeks');
            var me=$(this);
            $('.weeks-count>div').removeClass('fill-current');
            me.addClass('fill-current');
            $('.week-num').text(no);
            $('.week-total').text(pageParams.weekTimes*no);
        })
        $('.fillOrder-page').on('click','.week-no>div',function(){
            var me=$(this);
            if(me.hasClass('fill-current')){
                me.removeClass('fill-current');
                pageParams.weekTimes--;
            }else{
                me.addClass('fill-current');
                pageParams.weekTimes++;
            }
            $('.week-time').text(pageParams.weekTimes);
            $('.weeks-count>div').each(function(){
                if($(this).hasClass('fill-current')){
                    var weeks=parseInt($(this).data('weeks'));
                    $('.week-total').text(pageParams.weekTimes*weeks);
                }
            })
        })
        $('.myAunt-page').on('click','.myAunt-btn',function(){
            $('.myAunt-page').find('.arrow').each(function() {
                var me=$(this);
                var userid=me.data('userid'),
                    name=me.data('name'),
                    icon=me.data('icon');
                if(me.hasClass('aunt-checked')){
                    var auntInfo={};
                    auntInfo.name=name;
                    auntInfo.icon=icon;
                    pageParams.myAunt.push(auntInfo);
                    pageParams.providers+=userid+',';
                }
            });
            //alert(JSON.stringify(pageParams.myAunt));
            pageParams.providers=pageParams.providers.substring(0,pageParams.providers.length-1);
            if(pageParams.myAunt.length>0){
                renderMyAuntChip(pageParams.myAunt);
            }
            resetHeight();
            execAnim('.myAunt-page','bounceOutRight',function(){
                $('.myAunt-page').removeClass('bounceOutRight');
                pageOut('.myAunt-page');
                pageIn('.fillOrder-page');
                $(".btn-chip").hide();
                $(".myAunt-wrap").hide();
            });  
        })
        $('.myAunt-page').on('click','.arrow',function(){
            var me=$(this);
            if(me.hasClass('aunt-uncheck')){
                me.removeClass('aunt-uncheck');
                me.addClass('aunt-checked');
            }else{
                me.removeClass('aunt-checked');
                me.addClass('aunt-uncheck');
            }
        })
        $('.fotileType-page').on('click','.fotile-type-btn',function(){
            if(pageParams.fotileType==''){
                toasts.show('请选择油烟机类型');
            }else{
                resetHeight();
                execAnim('.fotileType-page','bounceOutRight',function(){
                    $('.fotileType-page').removeClass('bounceOutRight');
                    pageOut('.fotileType-page');
                    pageIn('.fillOrder-page');
                });  
            }
        })
        $('.fotileType-page').on('click','.aunt-uncheck',function(){
            var me=$(this);
            $('.fotile-type').removeClass('aunt-checked');
            me.addClass('aunt-checked');
            pageParams.fotileType=me.data('fotile-type');
            $('#appFotile').text(me.data('fotile-title'));
        })
        $('.main').on('click','.fill-begin',function(){
            $('.fill-begin select').show();
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
        $('.main').on('click','.to-aunt',function(){
            $(".aunt-remark").show();
            execAnim('.aunt-remark','bounceInUp',function(){
                $(".aunt-remark").removeClass('bounceInUp');
            });
            $(".page-overlay").show();
        })
        $(".aunt-remark .flex-row > div").on("click",function(){
            if($(this).hasClass('current')){
                $(this).removeClass('current');
            }else {
                $(this).addClass('current');
            }
        })
         $(".aunt-remark .cancel").click(function(){
            var $modal=$(this).parents('.fill-other-modal');
            $(".page-overlay").hide();
            $modal.hide();
        })
        $(".aunt-remark .conform").click(function(){
            var customerRemark=$('#customRemark').val();
            var $item=$(".aunt-remark .flex-row > div");
            var item='';
            $item.each(function(index, el) {
                if($(this).hasClass('current')){
                    item+=$(this).text()+'!';
                }
            });
            pageParams.customerRemark=customerRemark+item;
            execAnim('.aunt-remark','bounceOutDown',function(){
                $(".aunt-remark").removeClass('bounceOutDown');
                $(".page-overlay").hide();
                $(".aunt-remark").hide();
            });
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
                if(pageParams.type=='cleanWindow' || pageParams.type=='wasteland'){
                    var area=$('#appArea').val();
                    if(area==''){
                        toasts.show('请填写住房面积');
                    }else if(isNaN(area)){
                        toasts.show('请填写正确的住房面积');
                    }else{
                        newOrder();
                    }
                }else if(pageParams.type=='monthly'){
                    var monthlyFlag=false;
                    $('.week-no>div').each(function(){
                        var me=$(this);
                        if(me.hasClass('fill-current')){
                            if(me.data('weeknum')==pageParams.selectedDay){
                                monthlyFlag=true;
                            }
                        }
                    })
                    if(!monthlyFlag){
                        toasts.alert('上门时间必须在上门周期所选的时间范围内');
                        $('#appDate').val('');
                    }else{
                        newOrder();
                    }
                }else if(pageParams.type=='fotile'){
                    if($('#appFotile').text()=='请选择油烟机种类'){
                        toasts.show('请选择油烟机种类');
                    }else{
                        newOrder();
                    }
                }else{
                    newOrder();
                }
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
            var newColumn=1;
            var rowtype=0;
	        if(pageParams.type=='cleanWindow' || pageParams.type=='wasteland' || pageParams.type=='fotile'){
                newColumn=0;//玻璃清洗，无时长
            }else if(pageParams.type=='nurse'){
                rowtype=2;//保姆类，只有日期
            }
	        $('#appDate').scroller({
	            preset: 'datehour',
	            minDate: new Date(curr, m, d, 8, 00),
	            maxDate: new Date(curr, m, d+10),
	            invalid: [{ d: new Date(), start: '00:00', end: (date.getHours()+2)+':'+date.getMinutes() }],
	            theme: "android-ics light",
	            mode: "scroller",
	            lang: 'zh',
	            display:"bottom",
	            animate: "slideup",
	            stepMinute: 30,
	            dateOrder: 'MMDdd',
	            rows:3,
	            timeWheels: 'HHii',
                newColumn:newColumn,
                rowtype:rowtype,
	            onSelect: function (valueText, inst) {
	                //var selectedDate = inst.getVal(); 
	                //_debug(selectedDate);
                    //02.27不再从sessionStorage取值，因为不同品类有不同的格式
                    //sessionStorage.appDate=$("#appDate").val();
                    if(pageParams.type=='monthly'){
                        var selectedDate=util.getDate($("#appDate").val().split('  ')[0]);
                        if(selectedDate.getDay()==0){
                            pageParams.selectedDay=7;
                        }else{
                            pageParams.selectedDay=selectedDate.getDay();
                        }
                        //alert(pageParams.selectedDay);
                    }
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
        var type='0001000300010001';//日常保洁
        if(pageParams.type=='cleanWindow'){
            type='0001000300020001';//玻璃清洗
        }else if(pageParams.type=='wasteland'){
            type='0001000300010002';//新居开荒
        }
        data.append('customerId', pageParams.userInfo.data.id);
        data.append('addressArea', sessionStorage.addressArea);
        data.append('addressHouse', sessionStorage.addressHouse);
        data.append('baiduMapLng', sessionStorage.baiduMapLng);
        data.append('baiduMapLat', sessionStorage.baiduMapLat);
        if(type=='0001000300010001'){
            var atime,hours,timeArr=serviceTime.split('  ');
            if(timeArr.length===2){
                atime=timeArr[0];
                hours=timeArr[1].substring(0,timeArr[1].length-2);
                data.append('ordernum', hours);
                data.append('orderAgreedTime', atime);
            }else if(timeArr.length===1){//保姆类只有日期
                data.append('orderAgreedTime', serviceTime);
                if(pageParams.type=='fotile'){//油烟机，数量默认为1
                    data.append('ordernum', '1');
                }
            }
        }else if(type=='0001000300020001'){
            var area=$('#appArea').val();
            data.append('ordernum', area*0.1);
            data.append('orderAgreedTime', serviceTime);
        }else if(type=='0001000300010002'){
            var area=$('#appArea').val();
            data.append('ordernum', area);
            data.append('orderAgreedTime', serviceTime);
        }
        if(pageParams.type!='nurse'&&pageParams.type!='fotile'){
            data.append('serviceclass', type);
        }else if(pageParams.fotileType!=''){
            data.append('serviceclass',pageParams.fotileType);
        }else{
            data.append('serviceclass',pageParams.serviceclass);
        }
        data.append('contactMobile', $('#appPhone').val());
        if(pageParams.type=='nurse'){
             data.append('customerRemark', $('#customRemark').val());
        }else{
            if(pageParams.customerRemark){
                data.append('customerRemark', pageParams.customerRemark);
            }
        }
        //alert(pageParams.userInfo.data.wechatName);
        data.append('linkman',pageParams.userInfo.data.wechatName);
        if(pageParams.providers!=''){
            //alert(pageParams.providers);
            data.append('providers',pageParams.providers);
        }
        var url=Apis.saveOrderform;
        if(pageParams.type=='monthly'){
            url=Apis.saveCycleOrderform;
            data.append('weeknum',$('.week-num').text());
            var weekdays='';
            $('.week-no>div').each(function(){
                var me=$(this);
                if(me.hasClass('fill-current')){
                    weekdays+=me.data('weeknum')+',';
                }
            })
            if(weekdays!=''){
                weekdays=weekdays.substring(0,weekdays.length-1);
                data.append('weekdays',weekdays);
            }
        }else if(pageParams.type=='nurse'){
            url=Apis.saveNurseOrderform;
        }
        var order=new FetchApi({
            urlApi:url,
            fetchParams:{
                method: 'post',
                body: data
            }
        },function(){
            //alert(JSON.stringify(this.records));
            if(this.records.code==200){
                if(pageParams.type!='nurse'){
                    window.location.href='searchAunt.html?orderno='+this.records.data.orderno+'&providers='+pageParams.providers;
                }else{
                    window.location.href='orderDetail.html?orderno='+this.records.data.orderno;
                }
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
    //指定手艺人
    function renderMyAunt(records){
        var appTmpl=new TemplateFromUrl({
            tmplName:require('./templates/myAunt.html'),
            tmplData:records
        });
        var appView=new View({
            holder:'.myAunt-page',
            content:appTmpl.getHtml()
        })
        appView.render(function(){
            var h1=$('.myAunt-wrap').height();
            var btn=$('.btn-chip').height();
            var vh=$(window).height();
            if((h1+btn)>vh){
                $('.main').css({'height':h1+btn});
            }else {
                $('.main').css({'height':vh});
            }
            var arr=pageParams.providers.split(',');
            if(arr.length>0){
                for(var i=0;i<arr.length;i++){
                    $('.myAunt-page').find('.arrow').each(function(){
                        var userid=$(this).data('userid');
                        if(userid==arr[i]){
                            $(this).removeClass('aunt-uncheck');
                            $(this).addClass('aunt-checked');
                        }
                    });
                }
            }
            pageParams.myAunt=[];
            pageParams.providers='';
        });
    }
    function getMyAuntData(){
        var data = new FormData();
        data.append('userid', pageParams.userInfo.data.id);
        if(pageParams.fotileType!=''){
            data.append('serviceclass',pageParams.fotileType);
        }else if(pageParams.type!='nurse'){
            //alert(util.serviceClassMap(pageParams.type));
            data.append('serviceclass',util.serviceClassMap(pageParams.type));
        }
        //data.append('serviceclass',)
        var address=new FetchApi({
            urlApi:Apis.getMyProviders,
            fetchParams:{
                method: 'post',
                body: data
            }
        },function(){
            if(this.records.code==200){
                //alert(JSON.stringify(this.records));
                if(this.records.data.length==0){
                    toasts.show('暂无符合的手艺人');  
                }else{
                    pageOut('.fillOrder-page');
                    pageIn('.myAunt-page');
                    $('.main').css({'height':$(window).height()});
                    execAnim('.myAunt-page','bounceInRight',function(){
                        $('.myAunt-page').removeClass('bounceInRight');
                    });
                    renderMyAunt(this.records);
                }
            }else{
                toasts.alert(this.records.message);
                //toasts.show(this.records.message);
            }
        });
    }
    function renderMyAuntChip(data){
        var records={};
        records.data=data;
        var appTmpl=new TemplateFromUrl({
            tmplName:require('./templates/myAuntChip.html'),
            tmplData:records
        });
        $('#myAunt').html(appTmpl.getHtml());
        resetHeight();
    }
    //选择油烟机种类
    function renderFotile(){
        var appTmpl=new TemplateFromUrl({
            tmplName:require('./templates/fotileType.html'),
            tmplData:{}
        });
        var appView=new View({
            holder:'.fotileType-page',
            content:appTmpl.getHtml()
        })
        appView.render(function(){
        });
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