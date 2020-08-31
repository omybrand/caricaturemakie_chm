var express = require('express');
var goodsController = require('../controllers/goods');
var goods = express.Router();

goods.post('/list', goodsController.getGoodsList); // 상품 목록 가져오기
goods.post('/info', goodsController.getGoodsInfo); // 상품 옵션 및 포트폴리오 가져오기(상품 목록에 따른)

module.exports = goods;