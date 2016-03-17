'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var FetchApi=require('./FetchApi');
	var Util=require('./Util');
    var Toasts=require('./Toasts');
    var RefreshHelper=require('./RefreshHelper');

    var toasts=new Toasts();
	var util=new Util();
	var pageParams={
		userid:util.urlParam('userid'),
		price:util.urlParam('price'),
		orderno:util.urlParam('orderno'),
		commercialid:util.urlParam('commercialid'),
        nextPageFlag:true,
        pageNo:1,
        once:true
	};
	var Apis={
		auntDetail:'/removte/provider/getProviderInfo',
		commentList:'/removte/ordercomment/getProviderCommentList',
		selectAunt:'/removte/order/selectServicePersonnel'
	}

    if(sessionStorage.userInfo){
        _init();
    }else{
        util.wxAuthCode(function(){
            _init(); 
        });
    }

	//_init();

	function _initOrderDetailView(records){
		var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/auntDetail.html'),
			tmplData:records
		});
		var appView=new View({
			holder:'.auntDetail-info',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			_bindEvents();
			//execAnim('.order-item img','bounceIn');
		});
	}

    function _initAuntCommentsView(data){
        var appTmpl=new TemplateFromUrl({
            tmplName:require('./templates/auntComments.html'),
            tmplData:data
        });
        var appView=new View({
            holder:'.appraise-comments',
            content:appTmpl.getHtml()
        })
        if(pageParams.pageNo==1){
            appView.render();//加载第一页 
            //如果没有记录则不显示refreshHelper
            if(data.data&&data.data.length!=0){
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
        }else{
            if(!data.data||(data.data&&data.data.length==0)){
                pageParams.nextPageFlag=false;
            }
            if(pageParams.nextPageFlag){
                $('.appraise-comments').append(appTmpl.getHtml());
            }else{
                toasts.show('亲，没有更多了哦~');
            }
            myScroll.refresh();//特别重要，一定要在渲染之后refresh，不然会引起滚动条位置不对应的BUG
        }     
    }
     
    function _init(){
		$('footer').hide();
		$('.main').css({'padding-bottom':0});
		var data=new FormData();
		data.append('userid',pageParams.userid);
		var auntDetail=new FetchApi({
            urlApi:Apis.auntDetail,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
            //alert(JSON.stringify(this.records));
            if(this.records.code==200){
                _initOrderDetailView(this.records);
            }else{
                toasts.alert(this.records.message);
            }
        });
        renderComment();
     	//getComment();//获取评论信息
    }

    function _bindEvents(){
    	$('.select-other').tap(function(){
    		window.location.href='auntList.html?orderno='+pageParams.orderno;
    	})
    	$('.select-this').tap(function(){
    		selectAunt(function(){
                //window.location.href='orderDetail.html?order_status=waitService&orderno='+pageParams.orderno;
                window.location.href='orderDetail.html?orderno='+pageParams.orderno;
    		})
    	})
    }
    function renderComment(){
    	var data=new FormData();
		data.append('userid',pageParams.userid);
        data.append('pageNo',pageParams.pageNo);
        data.append('pageSize','5');
    	var commentList=new FetchApi({
            urlApi:Apis.commentList,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
         	//alert(JSON.stringify(this.records));
            if(this.records.code==200){
                if(!!this.records.data){
                    this.records.data.forEach(function(e){
                        e.mobile=util.concealMobile(e.mobile);
                    })
                }
                _initAuntCommentsView(this.records);
            }else{
                toasts.alert(this.records.message);
            }
        });
    }
    function selectAunt(callback){
    	var data=new FormData();
		data.append('userid',pageParams.userid);
		data.append('price',pageParams.price);
		data.append('orderno',pageParams.orderno);
		//data.append('commercialid',pageParams.commercialid);
        //alert(pageParams.userid+','+pageParams.price+','+pageParams.orderno);
    	var selectAunt=new FetchApi({
            urlApi:Apis.selectAunt,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
         	//alert(JSON.stringify(this.records));
            if(this.records.code==200){
                    if(callback)
                        callback();
            }else{
                toasts.alert(this.records.message,function(){
                    window.location.href='orderDetail.html?orderno='+pageParams.orderno;
                });
            }
        });
    }
    function Refresh() {
        setTimeout(function () {
            pageParams.nextPageFlag=true;
            pageParams.pageNo=1;
            renderComment(); 
        }, 1000);
    }
    function Load() {
        setTimeout(function () {
            if(pageParams.nextPageFlag){
                pageParams.pageNo++;//如果有下一页，则页数加一
            }
            renderComment(); 
        }, 1000);
    }
})