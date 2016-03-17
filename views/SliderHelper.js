/**
 * @author Vincent
 * @description for slider
 * dom like:
 * <div class="slider-container">
		<div class="slider">
		  	<div class="banner1">
		  		
		  	</div>
		  	<div class="banner2">
		  		
		  	</div>
	  	</div>
	  	<div class="slider-page">
	  		<span class="current"></span>
	  		<span></span>
	  	</div>
	</div>
	css like:
	.slider-container {
		overflow: hidden;
	}
	.slider {
		width: 500%;//超过5张需要重新定义宽度
	}
	.slider > div {
		display: table-cell;
		width: 100vw;
		background-size:cover;
		height:15rem;
		transition: transform 0.5s ease-in-out 0s;
	}
	.slider-page {
		text-align: center;
	}
	.slider-page span{
		display: inline-block;
	    width: 40px;
	    height: 2px;
	    margin-left: 5px;
	    cursor: pointer;
	    background: #000;
	    opacity: 0.2;
	}
	.slider-page .current{
		opacity: 0.5;
	}
	.banner1 {
		background:url(../img/banner/banner1.png);
	}
	.banner2 {
		background:url(../img/banner/banner2.png);
	}
 */
'use strict';
define(function(require,exports,module){
	var zepto=require('./plugins/zepto.min.js');
	function SliderHelper(){
		_init.call(this);
	}
	function _init(){
		var vw=$(window).width();
    	$('.slider div').width(vw);
    	var $sliderItem=$('.slider > div');
    	var $sliderPage=$('.slider-page span');
    	/**
    	$sliderItem.each(function(index){
    		var current;
    		if(index!=0){	
    			current=index-1;
    			$(this).swipeRight(function(){
    				$sliderItem.css({'-webkit-transform':'translateX('+vw*current+'px)'});
    			})
    		}
    		if(index!=$sliderItem.length-1){
    			current=index+1;
    			$(this).swipeLeft(function(){
    				$sliderItem.css({'-webkit-transform':'translateX('+vw*-current+'px)'});
    			})
    		}
    	})
		**/
    	var current=0,total=$sliderItem.length;
    	setInterval(function(){
    		if(current<$sliderItem.length-1){
    			current++;
    		}else{
    			current=0;
    		}
    		$sliderPage.removeClass('current');
    		$sliderPage.each(function(index){
    			//console.log(index+','+current);
    			if(index===current){
    				$(this).addClass('current');
    			}
    		})
    		$sliderItem.css({'-webkit-transform':'translateX('+vw*-current+'px)'});
    	},3500);
	}
	module.exports=SliderHelper;
})