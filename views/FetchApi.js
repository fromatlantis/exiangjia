'use strict';
define(function(require,exports,module){
	var Promise=require('./plugins/es6-promise.js').polyfill();//兼容 chrome浏览器可不用
	var Toasts=require('./Toasts');
	function FetchApi(options,callback){
		var opts=options||{};
		this.urlApi=opts.urlApi;
		this.fetchParams=opts.fetchParams||{};
		this.records={};
		this.callback=callback;
		_init.call(this);
	}
	var toasts=new Toasts();
	function _init(){
		var me=this;
		fetch(this.urlApi, this.fetchParams).then(function(response) {
			return response.json();
			//return response.text()
		}).then(function(json) {
		//}).then(function(text) {
			console.log(me.urlApi+' ok');
			//处理js整型精度不够问题(最大15位，java Long类型为18位)
			me.records=json;
			//me.records=JSON.parse(text.toString().replace(/:\s\d{18}/g, ":\"@!#@!#$&\"").replace(/:\d{18}/g, ":\"@!#@!#$&\"").replace(/@!#@!#:\s/g,"").replace(/@!#@!#:/g,""));
			if(me.callback)
				me.callback();
		}).catch(function(ex) {
			//console.log('api'+me.urlApi+' failed', ex);
			toasts.alert(me.urlApi+' failed '+ex);
		})
		/**
		$.ajax({
			url:this.urlApi,
			type:'post',
			dataType:'json',
			data:{username:"xinguan081",password:"xinguan081"},
			success:function(res){
				alert(res);
			}
		})
**/
	}
	module.exports=FetchApi;
})