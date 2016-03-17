'use strict';
define(function(require,exports,module){
	var View=require('./View');
	var TemplateFromUrl=require('./TemplateFromUrl');
	function StaticView(options){
		var opts=options||{};
		this.tmplName=opts.tmplName;
		this.tmplData=opts.tmplData||{};
		this.holder=opts.holder;
		_init.call(this);
	}
	StaticView.prototype=Object.create(View.prototype);
	StaticView.prototype.constructor=StaticView;

	function _init(){
		var _tmpl=new TemplateFromUrl({
			tmplName:this.tmplName,
			tmplData:this.tmplData
		})
		this.content=_tmpl.getHtml();
		this.render(function(){
			//var tableHelper=new TableHelper();
			//alert('0');
		})
	}

	StaticView.prototype.redraw=function(options){
		var opts=options || {};
		var _tmpl=new TemplateFromUrl({
			tmplName:opts.tmplName ? opts.tmplName : this.tmplName,
			tmplData:opts.tmplData ? opts.tmplData : this.tmplData
		})
		this.content=_tmpl.getHtml();
		this.render(function(){
			//var tableHelper=new TableHelper();
		})
	}
	module.exports=StaticView;
})