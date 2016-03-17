var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/removte/user/getUserInfo', function(req, res, next) {
  var mockJson={
		"code":"200",
		"data":{
			"id":"000001",
			"userName":"唐嫣"
		},
		"message":null
	}
  res.json(mockJson);
});
router.post('/removte/user/sendCode', function(req, res, next) {
	var mockJson={"code":"200","data":null,"message":null};
  	res.json(mockJson);
});
router.post('/removte/user/register', function(req, res, next) {
	//var mockJson={"code":"1003","data":null,"message":"验证码错误"};
	var mockJson={"code":"200","data":null,"message":null};
  	res.json(mockJson);
});
router.post('/removte/order/saveOrderform',function(req, res, next){
	var order={
		orderno:'1234567890'
	}
	var mockJson={"code":"200","data":null,"message":null};
	mockJson.data=order;
  	res.json(mockJson);
})
router.post('/removte/order/searchServicePersonnelList',function(req,res,next){
	var result={
		providerId:'1234567890',
		price:'30',
		realname:'刘诗诗',
		age:'28',
		startlevel:'5',
		experience:'3',
		commercialid:'1234567890',
		icon:''
	}
	var arr=[];
	arr.push(result);
	arr.push(result);
	var mockJson={"code":"200","data":null,"message":null};
	mockJson.data=arr;
  	res.json(mockJson);
})
router.post('/removte/order/selectServicePersonnel',function(req,res,next){
	var mockJson={"code":"200","data":null,"message":null};
  	res.json(mockJson);
})
router.post('/removte/ordercomment/getProviderCommentList',function(req,res,next){
	var comment={
		title:'',
		contents:'阿姨特别认真负责',
		creationDate:'2016-01-18',
		mobile:'15100123457'
	}
	var commentArr=[];
	commentArr.push(comment);
	commentArr.push(comment);
	commentArr.push(comment);
	var mockJson={"code":"200","data":null,"message":null};
	mockJson.data=commentArr;
  	res.json(mockJson);
})
router.post('/removte/user/getUseraddressList',function(req, res, next){
	var address={'id':'1234567890','addressHouse':'1007','addressArea':'石家庄'};
	var addressArr=[];
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	addressArr.push(address);
	var mockJson={"code":"200","data":null,"message":null};
	mockJson.data=addressArr;
  	res.json(mockJson);
})
router.post('/removte/user/deleteUseraddress',function(req,res,next){
	var mockJson={"code":"200","data":null,"message":null};
  	res.json(mockJson);
})
router.post('/removte/order/queryOrderInfo',function(req,res,next){
	var orderInfo={
		serviceclass:'日常保洁',
		orderPrice:'25',
		ordernum:5,
		confirmnum:3,
		orderAgreedTime:'2016-01-16 12:00',
		addressArea:'冰岛',
		linkman:'唐嫣',
		contactMobile:'15100123457'
	}
	var mockJson={"code":"200","data":null,"message":null};
	mockJson.data=orderInfo;
  	res.json(mockJson);
})
router.post('/removte/order/getOrderList',function(req,res,next){
	var order={
		state:1,
		orderno:'2016011600',
		providerId:'20160116000',
		addressArea:'石家庄市勒泰中心写字楼A座',
		orderAgreedTime:'2016-01-16 15:00',
		paymoney:25
	}
	var order2={
		state:2,
		orderno:'2016011600',
		providerId:'20160116000',
		addressArea:'石家庄市勒泰中心写字楼A座',
		orderAgreedTime:'2016-01-16 15:00',
		paymoney:25
	}
	var order3={
		state:3,
		orderno:'2016011600',
		providerId:'20160116000',
		addressArea:'石家庄市勒泰中心写字楼A座',
		orderAgreedTime:'2016-01-16 15:00',
		paymoney:25
	}
	var order5={
		state:5,
		orderno:'2016011600',
		providerId:'20160116000',
		addressArea:'石家庄市勒泰中心写字楼A座',
		orderAgreedTime:'2016-01-16 15:00',
		paymoney:25
	}
	var order6={
		state:6,
		orderno:'2016011600',
		providerId:'20160116000',
		addressArea:'石家庄市勒泰中心写字楼A座',
		orderAgreedTime:'2016-01-16 15:00',
		paymoney:25
	}
	var orderArr=[];
	orderArr.push(order);
	orderArr.push(order2);
	orderArr.push(order3);
	orderArr.push(order5);
	orderArr.push(order6);
	var mockJson={"code":"200","data":null,"message":null};
	mockJson.data=orderArr;
  	res.json(mockJson);
})
router.post('/removte/user/searchUserCoupon',function(req,res,next){
	var coupon={
		id:'123456',
		money:'30',
		begtime:'2016-01-17',
		expirdDate:'2016-02-17',
		state:1,
		amount:1,
		serviceType:1
	}
	var coupon2={
		id:'123456',
		money:'50',
		begtime:'2016-01-17',
		expirdDate:'2016-02-17',
		state:1,
		amount:1,
		serviceType:2
	}
	var coupon3={
		id:'123456',
		money:'50',
		begtime:'2016-01-17',
		expirdDate:'2016-02-17',
		state:1,
		amount:1,
		serviceType:3
	}
	var coupon4={
		id:'123456',
		money:'50',
		begtime:'2016-01-17',
		expirdDate:'2016-02-17',
		state:2,
		amount:1,
		serviceType:1
	}
	var coupon5={
		id:'123456',
		money:'50',
		begtime:'2016-01-10',
		expirdDate:'2016-01-15',
		state:1,
		amount:1,
		serviceType:2
	}
	var coupon6={
		id:'123456',
		money:'50',
		begtime:'2016-01-17',
		expirdDate:'2016-02-17',
		state:1,
		amount:1,
		serviceType:3
	}
	var couponArr=[];
	couponArr.push(coupon);
	couponArr.push(coupon2);
	couponArr.push(coupon3);
	couponArr.push(coupon4);
	couponArr.push(coupon5);
	couponArr.push(coupon6);
	var mockJson={"code":"200","data":null,"message":null};
	mockJson.data=couponArr;
  	res.json(mockJson);
})
router.post('/removte/coupon/code/exchangecode',function(req,res,next){
	var mockJson={"code":"200","data":null,"message":'优惠券兑换成功!'};
  	res.json(mockJson);
})
router.post('/removte/provider/getProviderInfo',function(req,res,next){
	var aunt={
		realname:'唐嫣',
		mobile:'15100123457'
	}
	var mockJson={"code":"200","data":null,"message":'优惠券兑换成功!'};
	mockJson.data=aunt;
  	res.json(mockJson);
})
router.get('/removte/recharge/code/getOnlineRechargeActivity',function(req,res,next){
	var item={
		money:100,
		presentermoney:10
	};
	var item1={
		money:300,
		presentermoney:50
	}
	var arr=[];
	arr.push(item);
	arr.push(item1);
	var mockJson={"code":"200","data":null,"message":'优惠券兑换成功!'};
	mockJson.data=arr;
  	res.json(mockJson);
})
module.exports = router;
