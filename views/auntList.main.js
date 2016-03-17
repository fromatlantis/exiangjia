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
		orderno:util.urlParam('orderno'),
		providers:util.urlParam('providers'),
		auntArr:[]
	};
	var Apis={
		auntList:'/removte/order/searchServicePersonnelList'
	}

	if(sessionStorage.userInfo){
        _init();
    }else{
        util.wxAuthCode(function(){
            _init(); 
        });
    }
    
	//_init();

	function _initOrderListView(records){
		//records.orderno=pageParams.orderno;
		if(records.data.length==0){
			records.title='努力搜寻中，请稍后···';
		}else{
			records.title='已有'+records.data.length+'位手艺人抢单';
		}
    	var appTmpl=new TemplateFromUrl({
			tmplName:require('./templates/auntList.html'),
			tmplData:records
		});
		var appView=new View({
			holder:'.main',
			content:appTmpl.getHtml()
		})
		appView.render(function(){
			//_init();
			if(records.data.length==0){
				$('.auntList-myAunt').hide();
				$('.auntList-otherAunt').hide();
			}else{
				$('.title-loading').show();
			}
			if(!pageParams.providers){
				$('.auntList-tips').hide();
			}
			execAnim('.housekeeping-page .service-item','fadeIn',function(){
				$('.housekeeping-page .service-item').removeClass('fadeIn');
			});
			execAnim('.loading-text','fadeIn',function(){
				$('loading-text').removeClass('fadeIn');
			});
		})
    }
     
    function _init(){
		$('footer').hide();
		$('.main').css({'padding-bottom':0});
		getAuntLits();
		_bindEvents();
		//setInterval("getAuntLits()",10000);
    }

    function _bindEvents(){
		$('.main').on('click','.service-item',function(){
			var userid=$(this).data('userid'),
				price=$(this).data('price'),
				commercialid=$(this).data('commercialid');
			window.location.href='auntDetail.html?userid='+userid+'&price='+price+'&orderno='+pageParams.orderno+'&commercialid='+commercialid;
		})
    }

    function execAnim(el,x,callback) {
	    $(el).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      if(callback)
	      	callback();
	    });
  	};

  	function getAuntLits(){
        _renderList();
        setInterval(_renderNew,5000);//轮询
  	}
  	function _renderList(){
  		var data = new FormData();
        data.append('orderid', pageParams.orderno);
  		var auntList=new FetchApi({
            urlApi:Apis.auntList,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){
            //alert(JSON.stringify(this.records));
            pageParams.auntArr=this.records.data;
            if(this.records.code==200){
	            _initOrderListView(this.records);
	        }else{
	        	toasts.alert(this.records.message);
	        }
        });
  	}
  	function _renderNew(){
  		var data = new FormData();
        data.append('orderid', pageParams.orderno);
  		var auntList=new FetchApi({
            urlApi:Apis.auntList,
            fetchParams:{
                method: 'post',
                body:data
            }
        },function(){ 
            if(this.records.code==200){
            	var diffArr=util.diffArr(this.records.data,pageParams.auntArr,'userid');
            	if(diffArr.length>0){
            		pageParams.auntArr=this.records.data;
            		$('.solar').hide();
            		$('.aunt-list-title').text('已有'+this.records.data.length+'位手艺人抢单');
	        		_initNewAunt(diffArr);
		        }else if(this.records.data.length==0){
		        	$('.aunt-list-title').text(util.loadingTips());
		        }
	        }else{
	        	toasts.alert(this.records.message);
	        }
        });
  	}
  	function _initNewAunt(data){
  		for(var i=0;i<data.length;i++){
	  		var records={};
	  		records.data=data[i];
	  		var appTmpl=new TemplateFromUrl({
				tmplName:require('./templates/auntListChip.html'),
				tmplData:records
			});
			var html=appTmpl.getHtml();
			if(!!pageParams.providers){
				$('.auntList-tips').show();
			}
			$('.auntList-myAunt').show();
			$('.auntList-otherAunt').show();
			$('.title-loading').show();
	  		if(data[i].isSelect==1){
	  			$('.myAunt-box').prepend(html);
	  			$('.auntList-myAunt .auntList-tips').text('指定手艺人抢单');
	  		}else{
	  			$('.auntList-otherAunt .auntList-tips').text('我们还为您推荐以下手艺人');
	  			$('.otherAunt-box').prepend(html);
	  		}
	  	}
  	}
})