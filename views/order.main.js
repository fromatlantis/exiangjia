'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var StaticView=require('./StaticView');
	var TemplateFromUrl=require('./TemplateFromUrl');
 	var FetchApi=require('./FetchApi');
    var Util=require('./Util');
    var RefreshHelper=require('./RefreshHelper');
    var Toasts=require('./Toasts');

    var toasts=new Toasts();
    var util=new Util();
    var pageParams={
        nocomment:util.urlParam('nocomment'),
        status:util.urlParam('status'), 
        servicestate:util.urlParam('servicestate'),
        pageNo:1,
        nextPageFlag:true,
        once:true
    };
    var Apis={
    	orderList:'/removte/order/getOrderList'
    }
	var footerView=new StaticView({
		tmplName:require('./templates/footer.html'),
		tmplData:{
			current:2
		},
		holder:'footer'
	})
	
    if(sessionStorage.userInfo){
        util.getUserInfo(sessionStorage.code,function(){
            _init();//实时更新用户数据    
        }) 
    }else{
        util.wxAuthCode(function(){
            _init(); 
        });
    }

	//_init();
    //只用于第一页渲染
	function _initOrderView(data){
		var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/order.html'),
			tmplData:data
		});
		var appView=new View({
			holder:'.order-items',
			content:appTmpl.getHtml()
		})
		appView.render();
	}
     
    function _init(){
        _bindEvents();
        _renderOrderView();
    }
    function _renderOrderTabs(data){
        if(pageParams.status=='5'){
            data.tabCurrent=1;
        }else if(pageParams.nocomment=='0'){
            data.tabCurrent=2;
        }else if(pageParams.servicestate=='0'){
            data.tabCurrent=3;
        }else {
            data.tabCurrent=0;
        }
        var appTmpl=new TemplateFromUrl({
            tmplName:require('./templates/orderTabs.html'),
            tmplData:data
        });
        var appView=new View({
            holder:'.order-tabs',
            content:appTmpl.getHtml()
        })
        appView.render();
    }
    function _renderOrderView(){
        var userInfo=JSON.parse(sessionStorage.userInfo);
        _renderOrderTabs(userInfo);
        var data=new FormData();
        data.append('mobile',userInfo.data.mobile);
        if(!!pageParams.nocomment){
            data.append('providerJudgeLevel','0');
            data.append('status','6');
        }
        if(!!pageParams.status){
            data.append('status',pageParams.status);
        }
        if(!!pageParams.servicestate){
            data.append('servicestate',pageParams.servicestate);
        }
        //alert(pageParams.pageNo);
        data.append('pageNo',pageParams.pageNo);
        data.append('pageSize','10');
        var orderList=new FetchApi({
            urlApi:Apis.orderList,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
            if(this.records.code==200){
                //alert(JSON.stringify(this.records));
                this.records.data.forEach(function(e){
                    e.state=util.orderStatusMap(e.state);
                    e.serviceclass=util.serviceTypeMap(e.serviceclass);
                })
                var appTmpl=new TemplateFromUrl({
                    tmplName:require('./templates/order.html'),
                    tmplData:this.records
                });
                if(pageParams.pageNo==1){
                    _initOrderView(this.records);//加载第一页
                    if(this.records.data.length!=0){
                        if(pageParams.once){
                            var refreshHelper=new RefreshHelper({
                                id:"scroll-wrapper",
                                pullDownAction:Refresh,
                                pullUpAction:Load
                            });
                            pageParams.once=false;
                        }
                        myScroll.refresh();//特别重要，一定要在渲染之后refresh，不然会引起滚动条位置不对应的BUG
                    }
                    //$('.order-items').html(appTmpl.getHtml());
                }else{
                    if(this.records.data.length==0){
                        pageParams.nextPageFlag=false;
                    }
                    if(pageParams.nextPageFlag){
                        $('.order-items').append(appTmpl.getHtml());
                    }else{
                        toasts.show('亲，没有更多了哦~');
                    }
                    myScroll.refresh();//特别重要，一定要在渲染之后refresh，不然会引起滚动条位置不对应的BUG
                }     
            }else{
                toasts.alert(this.records.message);
            }
        });
    }
    function _bindEvents(){
        var vh=$(window).height();
        var fh=$('footer').height();
        $('#scroll-wrapper').height(vh-fh);
        $('.order-page').on('click','.order-title',function(){
            var orderno=$(this).data('orderno');
            var providerId=$(this).data('provider-id');
            var state=$(this).data('state');
            var link='?orderno='+orderno+'&providerId='+providerId;
            /**
            if(state=='竞单中'){
                window.location.href='auntList.html?orderno='+orderno;
            }else if(state!='超时'){
                window.location.href='orderDetail.html'+link;
            }
            **/
            if(state!='超时'){
                window.location.href='orderDetail.html'+link;
            }
        })
        $('.order-page').on('click','.order-des',function(){
            var orderno=$(this).data('orderno');
            var providerId=$(this).data('provider-id');
            var state=$(this).data('state');
            var link='?orderno='+orderno+'&providerId='+providerId;
            if(state!='超时'){
                window.location.href='orderDetail.html'+link;
            }
        })
        //再来一单
        $('.order-page').on('tap','.order-again',function(){
            var info=util.serviceTypeMapReverse($(this).data('serviceclass')).split(':');
            var serviceclass=info[0];
            var type=info[1];
            var orderno=$(this).data('orderno');
            var icon=$(this).data('icon');
            var jjname=encodeURI(encodeURI($(this).data('jjname')));
            window.location.href='fillOrder.html?type='+type+'&serviceclass='+serviceclass+'&orderno='+orderno+'&orderAgain=true&icon='+icon+'&jjname='+jjname;
        })
        $('.order-tabs').on('click','.row>div',function(){
            var state=$(this).data('state');
            if(state=='waitpay'){
                window.location.href='order.html?status=5';
            }else if(state=='waitevaluate'){
                window.location.href='order.html?nocomment=0';
            }else if(state=='waitservice'){
                window.location.href='order.html?servicestate=0';
            }else if(state=='all'){
                window.location.href='order.html';  
            }
        })
    }
    function Refresh() {
        setTimeout(function () { 
            pageParams.nextPageFlag=true;
            pageParams.pageNo=1;
            _renderOrderView();
            //myScroll.refresh();/****remember to refresh when you action was completed！！！****/
        }, 1000);
    }
    function Load() {
        setTimeout(function () {
            if(pageParams.nextPageFlag){
                pageParams.pageNo++;//如果有下一页，则页数加一
            }
            _renderOrderView();
            //myScroll.refresh();/****remember to refresh when you action was completed！！！****/
        }, 1000);
    }
    function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
})