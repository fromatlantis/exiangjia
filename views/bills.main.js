'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	var FetchApi=require('./FetchApi');
    var RefreshHelper=require('./RefreshHelper');
    var Toasts=require('./Toasts');
	var Util=require('./Util');

    var toasts=new Toasts();
	var util=new Util();
	var pageParams={
        pageNo:1,
        nextPageFlag:true,
        once:true
	}
	var Apis={
		countFundRecord:'/removte/user/countUserFundrecord',
		searchFundRecord:'/removte/user/searchUserFundrecord'
	}
	if(sessionStorage.userInfo){
        _init();
    }else{
        util.wxAuthCode(function(){
            _init(); 
        });
    }
     
    function _init(){
    	$('footer').hide();
    	renderTotal();
		renderList();
    }

    function _bindEvents(){
    }
    function renderTotal(){
    	var toatl=new FetchApi({
    		urlApi:Apis.countFundRecord
    	},function(){
    		//alert(JSON.stringify(this.records));
            if(this.records.code==200){
        		var store={
        			charge:'0.00',
        			expense:'0.00'
        		};
        		var records=this.records.data;
        		for(var i=0;i<records.length;i++){
        			if(records[i].dealtype=='000100090002'){//充值
        				store.charge=records[i].balance;
        			}else if(records[i].dealtype=='000100090001'){//消费
        				store.expense=records[i].balance;
        			}
        		}
        		var appTmpl=new TemplateFromUrl({
    				tmplName:require('./templates/bills.html'),
    				tmplData:store
    			});
    			var appView=new View({
    				holder:'.bills-title',
    				content:appTmpl.getHtml()
    			})
    			appView.render();
            }else{
                toasts.alert(this.records.message);
            }
    	})
    }
    function renderList(){
        var data=new FormData();
        data.append('pageNo',pageParams.pageNo);
        data.append('pageSize','10');
    	var toatl=new FetchApi({
    		urlApi:Apis.searchFundRecord,
            fetchParams:{
                method: 'post',
                body:data
            }
    	},function(){
    		//alert(JSON.stringify(this.records));
            if(this.records.code==200){
        		var appTmpl=new TemplateFromUrl({
    				tmplName:require('./templates/billsList.html'),
    				tmplData:this.records
    			});
    			var appView=new View({
    				holder:'.bills-list',
    				content:appTmpl.getHtml()
    			})
                if(pageParams.pageNo==1){
                    appView.render();//加载第一页
                    //如果没有记录则不显示refreshHelper
                    if(!!this.records.data&&this.records.data.list.length!=0){
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
                    //$('.order-list').html(appTmpl.getHtml());
                }else{
                    if(!this.records.data||(this.records.data&&this.records.data.list.length==0)){
                        pageParams.nextPageFlag=false;
                    }
                    if(pageParams.nextPageFlag){
                        $('.bills-list').append(appTmpl.getHtml());
                    }else{
                        toasts.show('亲，没有更多了哦~');
                    }
                    myScroll.refresh();//特别重要，一定要在渲染之后refresh，不然会引起滚动条位置不对应的BUG
                }     
            }else{
                toasts.alert(this.records.message);
            }
    	})
    }

    function Refresh() {
        setTimeout(function () {
            pageParams.nextPageFlag=true;
            pageParams.pageNo=1;
            renderList(); 
        }, 1000);
    }
    function Load() {
        setTimeout(function () {
            if(pageParams.nextPageFlag){
                pageParams.pageNo++;//如果有下一页，则页数加一
            }
            renderList(); 
        }, 1000);
    }

    function execAnim(el,x) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      //$(this).removeClass();
	    });
  	};
})