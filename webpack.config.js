var webpack = require('webpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
var fetchPlugin=new webpack.ProvidePlugin({
  'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
})
module.exports = {
  entry: {
    index: './views/index.main.js',
    housekeeping: './views/housekeeping.main.js',
    daily: './views/appointment.main.js',
    window: './views/cleanWindow.main.js',
    nurse: './views/nurse.main.js',
    newOrder:'./views/fillOrder.main.js',
    newOrderNurse:'./views/fillOrderNurse.main.js',
    coupons:'./views/coupons.main.js',
    searchAunt:'./views/searchAunt.main.js',
    auntList:'./views/auntList.main.js',
    auntDetail:'./views/auntDetail.main.js',
    orderDetail:'./views/orderDetail.main.js',
    order:'./views/order.main.js',
    profile:'./views/profile.main.js',
    serviceAddress:'./views/serviceAddress.main.js',
    recharge:'./views/recharge.main.js',
    feedback:'./views/feedback.main.js',
    paySuccess:'./views/paySuccess.main.js',
    cleaning:'./views/cleaning.main.js',
    cleanWindow:'./views/cleanWindow.main.js',
    monthly:'./views/appointment/monthly.main.js',
    fotile:'./views/appointment/fotile.main.js',
    appointNurse:'./views/appointment/appointNurse.main.js',
    wasteland:'./views/appointment/wasteland.main.js',
    //nanny:'./views/appointment/nanny.main.js',
    //matron:'./views/appointment/matron.main.js',
    //childCare:'./views/appointment/childCare.main.js',
    bills:'./views/bills.main.js',
    login:'./views/login.main.js'
  },
  output: {
    path: './public/html/javascripts/wx',
    publicPath: "http://localhost:3000/",
    filename: '[name].js' // Template based on keys in entry above
  },
  plugins: [commonsPlugin,fetchPlugin],
  module: {
      loaders: [
          { test: /\.css$/, loader: 'style-loader!css-loader' },
          { test: /\.html$/, loader: 'html-loader' },
          { test: /\.(png|jpg)$/, loader: "file-loader?name=[path][name].[ext]" }
          //{test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
      ]
  }
};