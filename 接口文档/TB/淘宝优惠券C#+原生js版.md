| 接口地址                                              | 接口说明       | 接口                                        |
| ----------------------------------------------------- | -------------- | ------------------------------------------- |
| https://open.taobao.com/api.htm?docId=64333&docType=2 | 物料id列表查询 | **taobao.tbk.optimus.tou.material.ids.get** |
| https://open.taobao.com/api.htm?docId=62201&docType=2 | 物料精选       | **taobao.tbk.dg.material.recommend**        |
| https://open.taobao.com/api.htm?docId=64759&docType=2 | 物料搜索       | **taobao.tbk.dg.material.optional.upgrade** |
| https://open.taobao.com/api.htm?docId=24521&docType=2 | 店铺搜索       | **taobao.tbk.shop.get**                     |

### WuLiao.aspx

```
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="WuLiao.aspx.cs" Inherits="TaobaoPro_WuLiao" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale=1,user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <link href="../mui/dist/css/mui.min.css" rel="stylesheet" />
    <link href="../Script/css/adminsytle.css" rel="stylesheet" />
    <link href="../mui/dist/css/showLoading.css" rel="stylesheet" />
    <link href="../Script/css/Taobao.css?v=1.3" rel="stylesheet" />
    <%--<script src="../Script/js/checkopenid.js"></script>--%>
    <script>
        //解决部分机型缓存dom不加载问题
        window.onpageshow = function (event) {
            if (event.persisted) {
                if (sessionStorage.hasOwnProperty('wuliaodetail')) {
                    mui.hideLoading();//从跳转页面过来
                }
            }
        };
    </script>
    <style>
        * {
            touch-action: pan-y; /* 使用全局样式样式去掉滑动顶部滑动栏时产生的警告 */
        }
    </style>
</head>
<body>
    <header class="mui-bar mui-bar-nav headercolor">
        <a class="mui-action-back mui-icon mui-icon-left-nav mui-pull-left topleft mui-navbar-left"></a>
        <h1 class="mui-title">淘宝优惠券</h1>
        <a class="love mui-icon mui-icon-plus mui-pull-right"></a>
    </header>
    <div class="mui-content" style="">

        <!--页面主结构开始-->
        <div id="app" class="mui-views mui-fullscreen mui-control-content mui-active">
            <div class="mui-view">
                <div class="mui-navbar">
                </div>
                <div class="mui-pages">
                </div>
            </div>
        </div>

        <div id="slider" class="mui-slider mui-fullscreen mui-page">
            <div style="display: flex; border-bottom: 1px solid #ccc; margin-bottom: 10px;">
                <div id="sliderSegmentedControl" class="mui-scroll-wrapper mui-slider-indicator mui-segmented-control mui-segmented-control-inverted">
                    <div class="mui-scroll" id="shoptype" style="transform: translate3d(0px, 0px, 0px) translateZ(0px); transition-timing-function: cubic-bezier(0.1, 0.57, 0.1, 1); transition-duration: 0ms;">
                        <!-- 分类菜单dom -->
                    </div>
                </div>
                <!-- 跳转搜索 -->
                <a href="#account" id="search_btn"><span class="mui-icon mui-icon-search"></span></a>

            </div>

            <div class="mui-slider-group " id="mailbox" style="transform: translate3d(0px, 0px, 0px) translateZ(0px); transition-duration: 0ms; transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);">
                <!-- 分类dom -->
            </div>
        </div>

        <div id="GoTop">
            <p class="mui-icon mui-icon-arrowup"></p>
            <p>顶部</p>
        </div>

    </div>

    <!-- 搜索页面 -->
    <div id="account" class="mui-page">
        <div class="mui-navbar-inner mui-bar mui-bar-nav sousuoleft">
            <button type="button" class="mui-left mui-navbar-left mui-action-back mui-btn  mui-btn-link mui-btn-nav mui-pull-left">
                <span class="mui-icon mui-icon-left-nav"></span>
            </button>
            <h1 class="mui-center mui-title">搜索</h1>
        </div>
        <div class="mui-page-content">
            <div id="totalbox">
                <div id="searchbox">
                    <div class="mui-input-row">
                        <%--<form action="#" id="myform"></form>--%>
                        <input type="search" class="mui-input-clear" placeholder="你想找什么" id="SearchIpt" />
                    </div>
                    <button type="button" class="mui-btn mui-btn-primary" id="SearchBtn">搜索</button>
                </div>
                <%--<div class="mui-row" id="SearchTypes">
                        <div class="mui-col-xs-6 typeactive" id="Goods">
                            商品
                        </div>
                        <div class="mui-col-xs-6" id="Store">
                            店铺
                        </div>
                    </div>--%>
            </div>

            <!-- 结果列表 -->
            <div>
                <div id="ShopMsgs"></div>
                <div class="mui-pull-bottom-wrapper" style="display: none;"><span class="mui-pull-loading bottomloading"><span class="mui-icon  mui-spinner bottomloadicon"></span>正在加载中...</span></div>
            </div>
        </div>
        <!-- 淘口令 -->
        <span id="tkl" style="position:absolute;top:99999px;"></span>
    </div>
</body>
</html>
<script src="../mui/jquery.min.js"></script>
<script src="../mui/dist/js/mui.min.js?v=1.0"></script>
<script src="../mui/js/showLoading.js"></script>
<script src="../Script/js/DailyLog.js"></script>
<script src="../Script/js/lovemenu.js"></script>
<script src="../mui/js/mui.view_top.js"></script>
<script>
    mui.init();
    dailylog.commonLog(localStorage.getItem('employeeid'), '用户' + localStorage.getItem('employeeid'), '进入热卖推荐页面', '1');
    if (sessionStorage.hasOwnProperty('wuliaodetail')) {
        mui.hideLoading();//从跳转页面过来
    }
    var dom;//用来给回到顶部按钮赋dom
    //初始化单页view
    var viewApi = mui('#app').view({
        defaultPage: '#slider'
    });
    var view = viewApi.view;
    (function ($) {
        //处理view的后退与webview后退
        var oldBack = $.back;
        $.back = function () {
            if (viewApi.canBack()) { //如果view可以后退，则执行view的后退
                viewApi.back();
            } else { //执行webview后退
                oldBack();
            }
        };
        //监听页面切换事件方案1,通过view元素监听所有页面切换事件，目前提供pageBeforeShow|pageShow|pageBeforeBack|pageBack四种事件(before事件为动画开始前触发)
        //第一个参数为事件名称，第二个参数为事件回调，其中e.detail.page为当前页面的html对象
        var isshowtop = false;
        view.addEventListener('pageBeforeShow', function (e) {
            if (e.detail.page.id == 'account') {//搜索页面
                if ($('#GoTop')[0].style.display == 'block') {
                    $('#GoTop')[0].style.display = 'none';
                    isshowtop = true;
                } else {
                    isshowtop = false;
                }
                if ($("#SearchIpt")[0].value == '') {
                    SearchIpt.focus();//使搜索框获取焦点
                }
            } else {
                if ($('#GoTop')[0].style.display == 'block') {
                    $('#GoTop')[0].style.display = 'none';
                }
                if (isshowtop) {
                    var domid = $('#shoptype .mui-active')[0].href.split("#")[1];
                    dom = $('#' + domid + '')[0];
                    $('#GoTop')[0].style.display = 'block'
                }
            }
        });
        view.addEventListener('pageShow', function (e) {
            //    console.log(e.detail.page.id + ' show');
        });
        view.addEventListener('pageBeforeBack', function (e) {
            //    console.log(e.detail.page.id + ' beforeBack');
        });
        view.addEventListener('pageBack', function (e) {
            //    console.log(e.detail.page.id + ' back');
        });
    })(mui);

    //获取openid（这个是要用来个性化推荐商品的，但是找不到获取设备唯一id的方法，暂用openid代替）
    var openids = localStorage.getItem("openid").toLowerCase().replace("-", "0").replace("_", "1");
    //var openid = openids.slice(0, 8) + '-' + openids.slice(8, 12) + '-' + openids.slice(12, 16) + '-' + openids.slice(16, 20) + '-' + openids.slice(16, 28);
    var openid = localStorage.getItem("personid");
    var okadd = 0;//限定函数执行一次
    //这里定义各类别的起始页码
    var ShopMsgsnum = 1;//各类页数
    var labelnum = 0;//用来下标展开
    var isgotwo = true;//用来标识首页是否可以滑动
    //阻尼系数
    var deceleration = mui.os.ios ? 0.3 : 0.9;
    mui('.mui-scroll-wrapper').scroll({
        bounce: true,//是否启用回弹
        indicators: true, //是否显示滚动条
        deceleration: deceleration
    });
    var winH = $(window).height();//文档高度
    //用来监听搜索页面商品的上下滑动
    $(".mui-page-content").scroll(function () {
        if ($(this).find('#ShopMsgs').length) {//有商品容器
            var typeH = $(this).find('#ShopMsgs').offset().top;//距离顶部的距离
            var boxH = $(this).find('#ShopMsgs').height();//div高度
            var bottomH = 0;//距离底部的距离
            if (typeH > 0) {//正数，div在屏幕中
                bottomH = boxH - typeH - winH;
            } else {
                bottomH = boxH + typeH - winH;
            }
            if (bottomH < 500) {
                okadd++;
                if (okadd == 1) {
                    ShopMsgsnum++;
                    //$('#SearchTypes .typeactive').attr('id')
                    GetShopmsg("Goods", ShopMsgsnum, false);
                }
            } else {
                okadd = 0;
            }
            if (typeH < -100) {//回到顶部按钮出现
                $('#GoTop').show();
                dom = $(this);
                $('#GoTop').on('click', function () {
                    dom.animate({ scrollTop: -100 }, 1000);
                    setTimeout(function () {
                        $('#GoTop').hide();
                        dom.stop();//结束回滚动画
                    }, 1000)
                })
            } else {
                $('#GoTop').hide();
            }
        }
    });

    window.onload = function () {
        mui.showLoading();
        //获取商品类型
        mui.ajax({
            url: 'TaobaoHandler.ashx?action=GetWuLiaoType',
            type: 'post',
            dataType: 'json',
            success: function (data) {
                if (data.code == 1) {
                    var wuliaotypes = data.msg;
                    var typestr = '';//物料类别
                    var wuliaoboxstr = '';//物料内容
                    var zongid = '';//首页物料id
                    var zongname = '';//首页存放商品dom的id
                    wuliaotypes.forEach(function (item, index) {
                        if (index == 0) {
                            typestr += '<a class="mui-control-item mui-active" href="#item' + (index + 1) + 'mobile" materialid="' + item.MATERIALID + '" boxid="' + item.MATERIALENNAME + '">' + item.MATERIALNAME + '</a>';
                            wuliaoboxstr += '<div id="item' + (index + 1) + 'mobile" class="mui-slider-item mui-control-content mui-active" page=1>'
                            zongid = item.MATERIALID;
                            zongname = item.MATERIALENNAME;
                        } else {
                            typestr += '<a class="mui-control-item" href="#item' + (index + 1) + 'mobile" materialid="' + item.MATERIALID + '" boxid="' + item.MATERIALENNAME + '">' + item.MATERIALNAME + '</a>';
                            wuliaoboxstr += '<div id="item' + (index + 1) + 'mobile" class="mui-slider-item mui-control-content" page=1>'
                        }
                        wuliaoboxstr += '<div id="' + item.MATERIALENNAME + '" class="types" materialid="' + item.MATERIALID + '"></div>'
                        wuliaoboxstr += '<div class="mui-pull-bottom-wrapper"><span class="mui-pull-loading bottomloading"><span class="mui-icon  mui-spinner bottomloadicon"></span>正在加载中...</span></div>'
                        wuliaoboxstr += '</div>';
                    })
                    $('#shoptype').html(typestr);
                    $('#mailbox').html(wuliaoboxstr);
                    
                    
                    
                    //首次仅加载第一个分类的商品
                    GetGoods(openid, zongid, 10, 1, "#" + zongname + "", true);

                    //动态加载的dom要重新实例化一下页面滚动
                    var gallery = mui('.mui-slider');
                    gallery.slider();
                    
                    //监听类别列表，有拖动操作后释放第一个页面的拖动
                    $('#shoptype').on('drag', function (e) {
                        isgotwo = false;
                    })
                    $('#item1mobile').on('drag', function (e) {
                        //刚进入页面禁止拖动第一个分类，不然这里会报错
                        if (isgotwo) {
                            return false;
                        }
                    })
                    //这里监听页面上下滚动
                    $(".mui-slider-item").scroll(function () {
                        if ($(this).find('.types').length) {//有商品容器
                            var typeH = $(this).find('.types').offset().top;//距离顶部的距离
                            var boxH = $(this).find('.types').height();//div高度
                            var bottomH = 0;//距离底部的距离
                            if (typeH > 0) {//正数，div在屏幕中
                                bottomH = boxH - typeH - winH;
                            } else {
                                bottomH = boxH + typeH - winH;
                            }
                            var boxId = $(this).find('.types').attr('id');
                            var boxMailid = $(this).find('.types').attr('materialid');
                            if (bottomH < 500) {
                                okadd++;
                                if (okadd == 1) {
                                    var page = $(this).attr('page') - 0;
                                    page++;
                                    $(this).attr('page', page);//重置页码
                                    GetGoods(openid, boxMailid, 10, page, "#" + boxId + "", false);//获取商品
                                }
                            } else {
                                okadd = 0;
                            }
                            if (typeH < -100) {//回到顶部按钮出现
                                $('#GoTop').show();
                                dom = $(this);
                                $('#GoTop').on('click', function () {
                                    dom = $(dom);
                                    dom.animate({ scrollTop: -100 }, 1000);
                                    setTimeout(function () {
                                        $('#GoTop').hide();
                                        dom.stop();//结束回滚动画
                                    }, 1000)
                                })
                            } else {
                                $('#GoTop').hide();
                            }
                        }
                    });
                } else {
                    mui.toast(data.msg)
                }
                mui.hideLoading();
            }
        })
    }
    //监听页面切换
    document.getElementById('slider').addEventListener('slide', function (e) {
        if (e.detail.slideNumber == 0) {
            isgotwo = false;//从别的页面返回到首页，释放滑动
        }
        var domindex = e.detail.slideNumber + 1;
        dom = $('#item' + domindex + 'mobile');
        if (dom.find('.types').length) {//有商品容器
            var typeH = dom.find('.types').offset().top;//距离顶部的距离
            if (typeH < -100) {//回到顶部按钮出现
                $('#GoTop').show();
                $('#GoTop').on('click', function () {
                    dom.animate({ scrollTop: -100 }, 1000);
                    setTimeout(function () {
                        $('#GoTop').hide();
                        dom.stop();//结束回滚动画
                    }, 1000)
                })
            } else {
                $('#GoTop').hide();
            }
        }
        //首次加载
        if (dom.find('.types').children().length == 0) {
            var dommailid = $($('#shoptype .mui-control-item')[e.detail.slideNumber]).attr('materialid');
            var domboxid = $($('#shoptype .mui-control-item')[e.detail.slideNumber]).attr('boxid');
            GetGoods(openid, dommailid, 10, 1, "#" + domboxid + "", true);
        }
    });
    /*获取商品
    *   imei:国际移动设备身份码imei(862052036723433)
    *   materialid:物料id
    *   page:页大小
    *   size:第几页
    *   listid:存放数据dom的id
    *   loading:是否显示loading(bool值)
    */
    function GetGoods(imei, materialid, page, size, listid, loading) {
        //loading ? mui.showLoading() : "";
        mui.ajax({
            url: 'TaobaoHandler.ashx?action=GetWuLiaomsg',
            type: 'post',
            dataType: 'json',
            data: {
                imei: imei,
                wuliaoid: materialid,
                page: page,
                size: size
            },
            success: function (data) {
                if (data.code == 1) {
                    var str = '';
                    if (data.data.tbk_dg_material_recommend_response != undefined) {
                        var msglist = data.data.tbk_dg_material_recommend_response.result_list.map_data;
                        msglist.forEach(function (item, index) {
                            //折扣价-优惠券
                            //var pick = (Number(item.zk_final_price) - item.coupon_amount).toFixed(2);
                            var pick = Number(item.price_promotion_info.final_promotion_price).toFixed(2);
                            var linkurl = '';//链接
                            if (item.publish_info.coupon_share_url != undefined) {
                                //linkurl = shoturl('https:' + item.coupon_share_url + '?id=' + labelnum);
                                str += '<a class="msglist" href="####" linkurl="https:' + item.publish_info.coupon_share_url + '" short_title="' + item.short_title + '">'
                            } else {
                                //linkurl = shoturl('https:' + item.url + '?id=' + labelnum);
                                str += '<a class="msglist" href="####" linkurl="https:' + item.publish_info.click_url + '" short_title="' + item.short_title + '">'
                            }
                            str += '<span class="tkltxt"></span>';
                            //商品图
                            str += '<div class="imgmsg"><img src="' + item.item_basic_info.pict_url + '" /></div>'
                            //if (item.white_image != "" && item.white_image != undefined) {
                            //    str += '<div class="imgmsg"><img src="' + item.white_image + '" /></div>'
                            //} else {
                            //    str += '<div class="imgmsg"><img src="' + item.pict_url + '" /></div>'
                            //}

                            str += '<div class="txtmsg">'
                            str += '<div class="wrapper">'
                            str += '<input id="exp' + listid + labelnum + '" class="exp" type="checkbox" />'
                            str += '<div class="titletext">'
                            str += '<label class="btn" for="exp' + listid + labelnum + '"></label>'
                            str += '<span>' + item.item_basic_info.title + '</span>'
                            str += '</div>'
                            str += '</div>'
                            //str += '<div class="conpmsg">'
                            //str += '<span class=""><span class="yj">原价</span><span class="oldmany">￥' + item.price_promotion_info.zk_final_price + '</span></span>'
                            //str += '<div class="quantxt">';
                            //str += '<div class="card"><span class="clickquan">点击领券</span><div class="line-gg"></div>券￥' + item.price_promotion_info.final_promotion_path_list.final_promotion_path_map_data[0].promotion_fee + '</div>'
                            //str += '</div>';
                            //str += '</div>'
                            //str += '<p class="manymsg">'
                            //str += '<span class="many"><span class="manytxt">到手价</span><span class="manynum">￥' + pick + '</span></span>'
                            //str += '<span class="readynum">已售' + item.item_basic_info.volume + '</span>'
                            //str += '</p>'


                            if (item.price_promotion_info.final_promotion_path_list != '' && item.price_promotion_info.final_promotion_path_list != undefined) {
                                str += '<div class="conpmsg">'
                                str += '<span class=""><span class="yj">原价</span><span class="oldmany">￥' + item.price_promotion_info.zk_final_price + '</span></span>'
                                str += '<div class="quantxt">';
                                str += '<div class="card"><span class="clickquan">点击领券</span><div class="line-gg"></div>券￥' + item.price_promotion_info.final_promotion_path_list.final_promotion_path_map_data[0].promotion_fee + '</div>'
                                str += '</div>';
                                str += '</div>'
                                str += '<p class="manymsg">'
                                str += '<span class="many"><span class="manytxt">到手价</span><span class="manynum">￥' + pick + '</span></span>'
                                str += '<span class="readynum">已售' + item.item_basic_info.volume + '</span>'
                                str += '</p>'
                            } else {
                                if (item.item_basic_info.small_images != undefined) {
                                    var imglist = item.item_basic_info.small_images.string;
                                    str += '<div style="white-space:nowrap;overflow:auto;" class="shopimgli">';
                                    imglist.forEach(function (imgitem, imgindex) {
                                        str += '<img src="' + imgitem + '" style="width:20%;margin-right:10px;height:50px;" class="shopimg"/>';
                                    })
                                    str += '</div>';
                                } else {
                                    str += '<div style="height:50px;width:100%;"></div>'
                                }
                            }








                            str += '<p class="shopname"><img src="../images/shop.png" />' + item.item_basic_info.shop_title + '</p>'
                            //if (item.nick != undefined) {
                            //    str += '<p class="shopname"><img src="../images/shop.png" />' + item.item_basic_info.sub_title + '</p>'
                            //} else {
                            //    str += '<p class="shopname"><img src="../images/shop.png" />' + item.level_one_category_name + '</p>'
                            //}
                            str += '</div>'
                            str += '</a>';
                            labelnum++;
                        })
                        $(listid).append(str);
                    } else {
                        //没有了
                        $(listid).next().html(('<p style="text-align:center;height:30px;line-height:30px;">抱歉，没有更多商品了~</p>'));
                    }
                    okadd = 0;
                }
                mui.hideLoading();
            }
        })
    }

    //切换搜索类型（商品or店铺----店铺暂时屏蔽--此处就先不屏蔽了）
    $('#SearchTypes div').on('click', function () {
        $('#SearchTypes div').removeClass('typeactive');
        $(this).addClass('typeactive');
        $("#ShopMsgs").html('');
        GetShopmsg($(this).attr('id'), 1, true);
    })
    //获取搜索内容[type:查找类型-商品or店铺]
    function GetShopmsg(type, page, showloading) {
        $("#ShopMsgs").next().html('<span class="mui-pull-loading bottomloading"><span class="mui-icon  mui-spinner bottomloadicon"></span>正在加载中...</span>');
        showloading ? mui.showLoading() : $("#ShopMsgs").next().show();
        mui.ajax({
            url: 'TaobaoHandler.ashx?action=GetWuLiaoSearch',
            type: 'post',
            dataType: 'json',
            data: {
                type: type,
                shop: $('#SearchIpt').val(),
                page: page,
                size: 10
            },
            success: function (data) {
                mui.hideLoading();
                if (data.code == 1) {
                    if (data.data.error_response == undefined) {//有商品的情况
                        var str = '';
                        if (type == "Goods") {//商品
                            if (data.data.tbk_dg_material_optional_upgrade_response != undefined) {
                                var msglist = data.data.tbk_dg_material_optional_upgrade_response.result_list.map_data;
                                if (msglist.length < 10) {//这个时候已经没有商品了
                                    $("#ShopMsgs").next().show();
                                    $("#ShopMsgs").next().html('<p style="text-align:center;height:30px;line-height:30px;">抱歉，没有更多商品了~</p>');
                                }
                                msglist.forEach(function (item, index) {
                                    //折扣价-优惠券
                                    var pick = Number(item.price_promotion_info.final_promotion_price).toFixed(2);
                                    //var pick = (Number(item.reserve_price) - Number(item.coupon_amount)).toFixed(2);
                                    //分辨有无优惠券页面的链接
                                    //var linkurl = '';//链接
                                    if (item.publish_info.coupon_share_url != undefined) {
                                        //linkurl = shoturl('https:' + item.coupon_share_url + '?id=' + labelnum);
                                        str += '<a class="msglist" href="####" linkurl="https:' + item.publish_info.coupon_share_url + '" short_title="' + item.short_title + '">'
                                    } else {
                                        //linkurl = shoturl('https:' + item.url + '?id=' + labelnum);
                                        str += '<a class="msglist" href="####" linkurl="https:' + item.publish_info.click_url + '" short_title="' + item.short_title + '">'
                                    }
                                    str += '<span class="tkltxt"></span>';
                                    //商品图
                                    str += '<div class="imgmsg"><img src="' + item.item_basic_info.pict_url + '" /></div>'
                                    //if (item.white_image != "") {
                                    //    str += '<div class="imgmsg"><img src="' + item.white_image + '" /></div>'
                                    //} else {
                                    //    str += '<div class="imgmsg"><img src="' + item.item_basic_info.pict_url + '" /></div>'
                                    //}
                                    str += '<div class="txtmsg">'
                                    str += '<div class="wrapper">'
                                    str += '<input id="exp' + type + labelnum + '" class="exp" type="checkbox" />'
                                    str += '<div class="titletext">'
                                    str += '<label class="btn" for="exp' + type + labelnum + '"></label>'
                                    str += '<span>' + item.item_basic_info.title + '</span>'
                                    str += '</div>'
                                    str += '</div>'
                                    if (item.price_promotion_info.final_promotion_path_list != '' && item.price_promotion_info.final_promotion_path_list != undefined) {
                                        str += '<div class="conpmsg">'
                                        str += '<span class=""><span class="yj">原价</span><span class="oldmany">￥' + item.price_promotion_info.zk_final_price + '</span></span>'
                                        //str += '<span style="font-size:14px;"><span class="yj">原价</span>￥' + item.reserve_price + '</span>'
                                        str += '<div class="quantxt">';
                                        str += '<div class="card"><span class="clickquan">点击领券</span><div class="line-gg"></div>券￥' + item.price_promotion_info.final_promotion_path_list.final_promotion_path_map_data[0].promotion_fee + '</div>'
                                        //str += '<div class="card"><span class="clickquan">点击领券</span><div class="line-gg"></div>券￥' + item.coupon_amount + '</div>'
                                        //str += '<div class="impose">' + item.coupon_info + '</div>'
                                        str += '</div>'
                                        str += '</div>'
                                        str += '<p class="manymsg">'
                                        str += '<span class="many"><span class="manytxt">到手价</span><span class="manynum">￥' + pick + '</span></span>'
                                        //str += '<span class="oldmany">￥' + item.reserve_price + '</span>'
                                        str += '<span class="readynum">已售' + item.item_basic_info.volume + '</span>'
                                        str += '</p>'
                                        
                                    } else {
                                        if (item.item_basic_info.small_images != undefined) {
                                            var imglist = item.item_basic_info.small_images.string;
                                            str += '<div style="white-space:nowrap;overflow:auto;" class="shopimgli">';
                                            imglist.forEach(function (imgitem, imgindex) {
                                                str += '<img src="' + imgitem + '" style="width:20%;margin-right:10px;height:50px;" class="shopimg"/>';
                                            })
                                            str += '</div>';
                                        } else {
                                            str += '<div style="height:50px;width:100%;"></div>'
                                        }
                                    }
                                    str += '<p class="shopname"><img src="../images/shop.png" />' + item.item_basic_info.shop_title + '</p>'
                                    str += '</div>'
                                    str += '</a>';
                                    labelnum++;
                                })
                            }
                        } else {//店铺
                            if (data.data.tbk_shop_get_response != undefined) {
                                var msglist = data.data.tbk_shop_get_response.results.n_tbk_shop;
                                str += '<ul class="mui-table-view">'
                                msglist.forEach(function (item, index) {
                                    str += '<li class="mui-table-view-cell">'
                                    str += '<a href="' + item.shop_url + '" class="mui-navigate-right storysty">'
                                    str += '<img src="' + item.pict_url + '" class="shoplogo" />'
                                    str += '<div class="shoptitle">' + item.shop_title + '</div>'
                                    str += '</a>'
                                    str += '</li>'
                                })
                                str += '</ul>';
                            }
                        }
                        $("#ShopMsgs").append(str);
                    } else {
                        $("#ShopMsgs").next().show();
                        var str = '<p style="text-align:center;height:30px;line-height:30px;">抱歉，没有更多商品了~</p>';
                        $("#ShopMsgs").next().html(str);
                    }
                    document.activeElement.blur();//屏蔽默认键盘弹出；
                }
            }
        })
    }
    //搜索按钮点击事件
    $('#SearchBtn').on('click', function () {
        if ($('#SearchIpt').val() == '') {
            mui.toast('请输入要查找的商品或店铺！');
            return;
        }
        $("#ShopMsgs").html('');
        //$('#SearchTypes .typeactive').attr('id')
        GetShopmsg("Goods", 1, true);
    });
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    //跳转
    $(document).on('click', '.msglist', function (event) {
        // 如果点击的是展开或收起，则不进行处理
        if ($(event.target).is(".btn") || $(event.target).is(".exp")) {
            event.stopPropagation();
        } else {
            mui.showLoading('正在创建淘口令...');
            var linkurl = $(this).attr('linkurl');
            var that = this;
            //转淘口令
            mui.ajax({
                url: 'TaobaoHandler.ashx?action=Tpwd',
                type: 'post',
                dataType: 'json',
                data: {
                    longurl: linkurl
                },
                success: function (data) {
                    if (data.code == 1) {
                        if (data.data.tbk_tpwd_create_response != undefined) {
                            var tkl14 = data.data.tbk_tpwd_create_response.data.model;//iOS14及以上版本用这个
                            var tlktxt = data.data.tbk_tpwd_create_response.data.password_simple;//iOS14以下版本及安卓用这个
                            if (iOS) {
                                var match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
                                var version = parseInt(match[1], 10);
                                // 根据版本号进行相应的操作
                                if (version >= 14) {
                                    $(that).find('.tkltxt').text(tkl14);
                                } else {
                                    $(that).find('.tkltxt').text(tlktxt);
                                }
                            } else {
                                $(that).find('.tkltxt').text(tlktxt);
                            }
                            setTimeout(function () {
                                // 获取要复制的文本
                                var text = $(that).find('.tkltxt').text().trim();
                                // 创建一个新的textarea元素
                                var textarea = $("<textarea/>").val(text).appendTo("body");
                                // 选中textarea中的文本
                                textarea.select();
                                // 复制选中的文本
                                document.execCommand("copy");
                                // 移除textarea元素
                                textarea.remove();
                                // 提示用户复制成功
                                mui.toast("淘口令复制成功~打开淘宝就能看到宝贝了~");
                            })
                        } else {
                            //转淘口令失败时直接复制链接
                            $(that).find('.tkltxt').text(linkurl);
                            setTimeout(function () {
                                // 获取要复制的文本
                                var text = $(that).find('.tkltxt').text().trim();
                                // 创建一个新的textarea元素
                                var textarea = $("<textarea/>").val(text).appendTo("body");
                                // 选中textarea中的文本
                                textarea.select();
                                // 复制选中的文本
                                document.execCommand("copy");
                                // 移除textarea元素
                                textarea.remove();
                                // 提示用户复制成功
                                mui.toast("优惠券链接已复制~打开淘宝搜索就能看到了~");
                            })
                        }
                    } else {
                        mui.toast('抱歉，此优惠券领完了，看看别的吧~')
                    }
                    mui.hideLoading();
                }
            });
        }
    })
</script>

```

### TaobaoHandler.ashx

```
<%@ WebHandler Language="C#" Class="TaobaoHandler" %>

using System;
using System.Web;
using System.IO;
using System.Collections.Generic;
using System.Text;
using System.Data;
using System.Linq;
using System.Security.Cryptography;
using Newtonsoft.Json.Linq;
using System.Web.SessionState;

public class TaobaoHandler : IHttpHandler , IRequiresSessionState
{
    Taobao tb = new Taobao();
    public void ProcessRequest (HttpContext context) 
    {
        var action = context.Request["action"];
        switch (action)
        {
            //获取物料推广
            case "GetWuLiaomsg":
                GetWuLiaomsg(context);
                break;
            //获取物料搜索
            case "GetWuLiaoSearch":
                GetWuLiaoSearch(context);
                break;
            //获取优惠券搜索(无api权限)
            case "GetCouponSearch":
                GetCouponSearch(context);
                break;
            //获取物料类型
            case "GetWuLiaoType":
                GetWuLiaoType(context);
                break;
            //长链转短链
            case "SpreadUrl":
                SpreadUrl(context);
                break;
            //转淘口令
            case "Tpwd":
                Tpwd(context);
                break;
        }
    }
    string appkey = "33910417";
    string secret = "a3b055133cbecd6de2d1edbfed4ccd46";
    string session = "test";//此处无用
    private void Tpwd(HttpContext context)
    {
        string longurl = context.Request["longurl"].ToString() ?? "";//长链
        IDictionary<string, string> param = new Dictionary<string, string>();

        string msg = tb.PostTpwdlong("http://gw.api.taobao.com/router/rest", appkey, secret, "taobao.tbk.tpwd.create", session, param, longurl);
        context.Response.Write("{\"code\":1,\"data\":" + msg + "}");
    }
    private void SpreadUrl(HttpContext context)
    {
        string longurl = context.Request["longurl"].ToString() ?? "";//长链
        IDictionary<string, string> param = new Dictionary<string, string>();

        JArray myArray = new JArray();
        JObject myObject = new JObject();
        myObject.Add("url", longurl);
        myArray.Add(myObject);
        string msg = tb.PostSearchCouponlong("http://gw.api.taobao.com/router/rest", appkey, secret, "taobao.tbk.spread.get", session, param, myArray);
        context.Response.Write("{\"code\":1,\"data\":" + msg + "}");
    }

    private void GetWuLiaoType(HttpContext context)
    {
        DataTable wuliao = tb.GetWuLiaoType();
        if (wuliao.Rows.Count > 0)
        {
            string str = ConvertJson.DataTableToJson(wuliao);
            context.Response.Write("{\"code\":1,\"msg\":" + str + "}");
        }
        else
        {
            context.Response.Write("{\"code\":0,\"msg\":\"未查到物料信息！\"}");
        }
    }
    

    private void GetCouponSearch(HttpContext context)
    {
        string password_content = context.Request["password_content"].ToString() ?? "";//需要解析的淘口令
        //string wuliaoid = context.Request["wuliaoid"].ToString() ?? "";//物料id
        //string page = context.Request["page"].ToString() ?? "";//页大小
        //string size = context.Request["size"].ToString() ?? "";//第几页
        //string deviceval = GetMD5(imeistr);
        IDictionary<string, string> param = new Dictionary<string, string>();
        param.Add("password_content", password_content);
        param.Add("adzone_id", "112334700203");//mm_xxx_xxx_xxx的第三位
        string msg = tb.PostSearchCoupon("http://gw.api.taobao.com/router/rest", appkey, secret, "taobao.tbk.tpwd.convert", session, param);
        context.Response.Write("{\"code\":1,\"data\":" + msg + "}");
    }
    
    
    
    
    private void GetWuLiaoSearch(HttpContext context)
    {
        string shop = context.Request["shop"].ToString() ?? "";//搜索内容
        string type = context.Request["type"].ToString() ?? "";
        string page = context.Request["page"].ToString() ?? "";//页大小
        string size = context.Request["size"].ToString() ?? "";//第几页
        IDictionary<string, string> param = new Dictionary<string, string>();
        param.Add("page_size", size);//页大小
        param.Add("page_no", page);//第几页
        param.Add("q", shop);
        param.Add("adzone_id", "112334700203");//mm_xxx_xxx_xxx的第三位
        //商品
        if (type == "Goods")
        {
            string msg = tb.PostSearch("http://gw.api.taobao.com/router/rest", appkey, secret, "taobao.tbk.dg.material.optional.upgrade", session, param);
            context.Response.Write("{\"code\":1,\"data\":" + msg + "}");
        }
        else 
        { 
            //店铺
            param.Add("fields", "user_id,shop_title,shop_type,seller_nick,pict_url,shop_url");
            string msg = tb.PostSearch("http://gw.api.taobao.com/router/rest", appkey, secret, "taobao.tbk.shop.get", session, param);
            context.Response.Write("{\"code\":1,\"data\":" + msg + "}");
        }
        
    }
    private void GetWuLiaomsg(HttpContext context)
    {
        string imeistr = context.Request["imei"].ToString() ?? "";
        string wuliaoid = context.Request["wuliaoid"].ToString() ?? "";//物料id
        string page = context.Request["page"].ToString() ?? "";//页大小
        string size = context.Request["size"].ToString() ?? "";//第几页
        //string deviceval = GetMD5(imeistr);
        string deviceval = imeistr;
        IDictionary<string, string> param = new Dictionary<string, string>();
        param.Add("fields", "user_id,tb695786164,type");//此处无用
        string msg = tb.Post("http://gw.api.taobao.com/router/rest", appkey, secret, "taobao.tbk.dg.material.recommend", session, param, wuliaoid, deviceval, page, size);
        context.Response.Write("{\"code\":1,\"data\":" + msg + "}");
    }

    public static string GetMD5(string myString)
    {
        MD5 md5 = new MD5CryptoServiceProvider();
        byte[] fromData = System.Text.Encoding.UTF8.GetBytes(myString);//
        byte[] targetData = md5.ComputeHash(fromData);
        string byte2String = null;
        for (int i = 0; i < targetData.Length; i++)
        {
            byte2String += targetData[i].ToString("x");
        }
        return byte2String;
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}
```

### Taobao.cs

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using System.Data.OracleClient;
using System.Data;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

/// <summary>
/// Taobao 的摘要说明
/// </summary>
public class Taobao
{
    OracleHelper wx = new OracleHelper("weixinEHR");

    /// <summary>
    /// 获取所有的物料类型
    /// </summary>
    /// <returns></returns>
    public DataTable GetWuLiaoType()
    {
        string sql = string.Format(@"select * from  TaobaoMaterial where isdisabled='1' order by ordernum ");
        return wx.ExecuteDataTable(sql, CommandType.Text);
    }
    /// <summary>
    /// 给TOP请求签名 API v2.0
    /// </summary>
    /// <param name="parameters">所有字符型的TOP请求参数</param>
    /// <param name="secret">签名密钥</param>
    /// <returns>签名</returns>
    protected static string CreateSign(IDictionary<string, string> parameters, string secret)
    {
        parameters.Remove("sign");
        IDictionary<string, string> sortedParams = new SortedDictionary<string, string>(parameters);
        IEnumerator<KeyValuePair<string, string>> dem = sortedParams.GetEnumerator();
        StringBuilder query = new StringBuilder(secret);
        while (dem.MoveNext())
        {
            string key = dem.Current.Key;
            string value = dem.Current.Value;
            if (!string.IsNullOrEmpty(key) && !string.IsNullOrEmpty(value))
            {
                query.Append(key).Append(value);
            }
        }
        query.Append(secret);
        MD5 md5 = MD5.Create();
        byte[] bytes = md5.ComputeHash(Encoding.UTF8.GetBytes(query.ToString()));
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < bytes.Length; i++)
        {
            string hex = bytes[i].ToString("X");
            if (hex.Length == 1)
            {
                result.Append("0");
            }
            result.Append(hex);
        }
        return result.ToString();
    }

    /// <summary>
    /// 组装普通文本请求参数。
    /// </summary>
    /// <param name="parameters">Key-Value形式请求参数字典</param>
    /// <returns>URL编码后的请求数据</returns>
    protected static string PostData(IDictionary<string, string> parameters)
    {
        StringBuilder postData = new StringBuilder();
        bool hasParam = false;
        IEnumerator<KeyValuePair<string, string>> dem = parameters.GetEnumerator();
        while (dem.MoveNext())
        {
            string name = dem.Current.Key;
            string value = dem.Current.Value;
            // 忽略参数名或参数值为空的参数
            if (!string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(value))
            {
                if (hasParam)
                {
                    postData.Append("&");
                }
                postData.Append(name);
                postData.Append("=");
                postData.Append(Uri.EscapeDataString(value));
                hasParam = true;
            }
        }
        return postData.ToString();
    }

    /// <summary>
    /// TOP API POST 请求
    /// </summary>
    /// <param name="url">请求容器URL</param>
    /// <param name="appkey">AppKey</param>
    /// <param name="appSecret">AppSecret</param>
    /// <param name="method">API接口方法名</param>
    /// <param name="session">调用私有的sessionkey</param>
    /// <param name="param">请求参数</param>
    /// <returns>返回字符串</returns>
    public string Post(string url, string appkey, string appSecret, string method, string session, IDictionary<string, string> param,string wuliaoid,string deviceval,string page,string size)
    {
        #region -----API系统参数----
        param.Add("app_key", appkey);
        param.Add("method", method);
        param.Add("session", session);
        param.Add("timestamp", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
        param.Add("format", "json");
        param.Add("v", "2.0");
        param.Add("adzone_id", "115826900428");//mm_xxx_xxx_xxx的第三位
        param.Add("material_id", wuliaoid);//官方的物料Id
        param.Add("device_type", "OAID");//设备号类型
        //param.Add("device_encrypt", "MD5");//设备号加密类型（OAID不传，其他设备类型要传）
        param.Add("device_value", deviceval);//设备号加密后的值（MD5加密需32位小写）
        param.Add("page_size", page);//页大小
        param.Add("page_no", size);//第几页
        param.Add("sign_method", "md5");
        param.Add("sign", CreateSign(param, appSecret));
        #endregion
        string result = string.Empty;
        #region ---- 完成 HTTP POST 请求----
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
        req.Method = "POST";
        req.KeepAlive = true;
        req.Timeout = 300000;
        req.ContentType = "application/x-www-form-urlencoded;charset=utf-8";
        byte[] postData = Encoding.UTF8.GetBytes(PostData(param));
        Stream reqStream = req.GetRequestStream();
        reqStream.Write(postData, 0, postData.Length);
        reqStream.Close();
        HttpWebResponse rsp = (HttpWebResponse)req.GetResponse();
        Encoding encoding = Encoding.GetEncoding(rsp.CharacterSet);
        Stream stream = null;
        StreamReader reader = null;
        stream = rsp.GetResponseStream();
        reader = new StreamReader(stream, encoding);
        result = reader.ReadToEnd();
        if (reader != null) reader.Close();
        if (stream != null) stream.Close();
        if (rsp != null) rsp.Close();
        #endregion
        return Regex.Replace(result, @"[\x00-\x08\x0b-\x0c\x0e-\x1f]", "");
    }


    /// <summary>
    /// 搜索-- 请求
    /// </summary>
    /// <param name="url">请求容器URL</param>
    /// <param name="appkey">AppKey</param>
    /// <param name="appSecret">AppSecret</param>
    /// <param name="method">API接口方法名</param>
    /// <param name="session">调用私有的sessionkey</param>
    /// <param name="param">请求参数</param>
    /// <returns>返回字符串</returns>
    public string PostSearch(string url, string appkey, string appSecret, string method, string session, IDictionary<string, string> param)
    {
        #region -----API系统参数----
        param.Add("app_key", appkey);
        param.Add("method", method);
        param.Add("session", session);
        param.Add("timestamp", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
        param.Add("format", "json");
        param.Add("v", "2.0");
        
        //param.Add("material_id", wuliaoid);//官方的物料Id
        param.Add("sign_method", "md5");
        param.Add("sign", CreateSign(param, appSecret));
        #endregion
        string result = string.Empty;
        #region ---- 完成 HTTP POST 请求----
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
        req.Method = "POST";
        req.KeepAlive = true;
        req.Timeout = 300000;
        req.ContentType = "application/x-www-form-urlencoded;charset=utf-8";
        byte[] postData = Encoding.UTF8.GetBytes(PostData(param));
        Stream reqStream = req.GetRequestStream();
        reqStream.Write(postData, 0, postData.Length);
        reqStream.Close();
        HttpWebResponse rsp = (HttpWebResponse)req.GetResponse();
        Encoding encoding = Encoding.GetEncoding(rsp.CharacterSet);
        Stream stream = null;
        StreamReader reader = null;
        stream = rsp.GetResponseStream();
        reader = new StreamReader(stream, encoding);
        result = reader.ReadToEnd();
        if (reader != null) reader.Close();
        if (stream != null) stream.Close();
        if (rsp != null) rsp.Close();
        #endregion
        return Regex.Replace(result, @"[\x00-\x08\x0b-\x0c\x0e-\x1f]", "");
    }


    /// <summary>
    /// 搜索优惠券-- 请求
    /// </summary>
    /// <param name="url">请求容器URL</param>
    /// <param name="appkey">AppKey</param>
    /// <param name="appSecret">AppSecret</param>
    /// <param name="method">API接口方法名</param>
    /// <param name="session">调用私有的sessionkey</param>
    /// <param name="param">请求参数</param>
    /// <returns>返回字符串</returns>
    public string PostSearchCoupon(string url, string appkey, string appSecret, string method, string session, IDictionary<string, string> param)
    {
        #region -----API系统参数----
        param.Add("app_key", appkey);
        param.Add("method", method);
        param.Add("session", session);
        param.Add("timestamp", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
        param.Add("format", "json");
        param.Add("v", "2.0");

        //param.Add("material_id", wuliaoid);//官方的物料Id
        param.Add("sign_method", "md5");
        param.Add("sign", CreateSign(param, appSecret));
        #endregion
        string result = string.Empty;
        #region ---- 完成 HTTP POST 请求----
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
        req.Method = "POST";
        req.KeepAlive = true;
        req.Timeout = 300000;
        req.ContentType = "application/x-www-form-urlencoded;charset=utf-8";
        byte[] postData = Encoding.UTF8.GetBytes(PostData(param));
        Stream reqStream = req.GetRequestStream();
        reqStream.Write(postData, 0, postData.Length);
        reqStream.Close();
        HttpWebResponse rsp = (HttpWebResponse)req.GetResponse();
        Encoding encoding = Encoding.GetEncoding(rsp.CharacterSet);
        Stream stream = null;
        StreamReader reader = null;
        stream = rsp.GetResponseStream();
        reader = new StreamReader(stream, encoding);
        result = reader.ReadToEnd();
        if (reader != null) reader.Close();
        if (stream != null) stream.Close();
        if (rsp != null) rsp.Close();
        #endregion
        return Regex.Replace(result, @"[\x00-\x08\x0b-\x0c\x0e-\x1f]", "");
    }
    /// <summary>
    /// 转短链
    /// </summary>
    /// <param name="url">请求容器URL</param>
    /// <param name="appkey">AppKey</param>
    /// <param name="appSecret">AppSecret</param>
    /// <param name="method">API接口方法名</param>
    /// <param name="session">调用私有的sessionkey</param>
    /// <param name="param">请求参数</param>
    /// <returns>返回字符串</returns>
    public string PostSearchCouponlong(string url, string appkey, string appSecret, string method, string session, IDictionary<string, string> param, JArray list)
    {
        #region -----API系统参数----
        param.Add("app_key", appkey);
        param.Add("method", method);
        param.Add("session", session);
        param.Add("timestamp", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
        param.Add("format", "json");
        param.Add("v", "2.0");

        //param.Add("material_id", wuliaoid);//官方的物料Id
        param.Add("sign_method", "md5");
        param.Add("requests", JsonConvert.SerializeObject(list));
        param.Add("sign", CreateSign(param, appSecret));

        #endregion
        string result = string.Empty;
        #region ---- 完成 HTTP POST 请求----
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
        req.Method = "POST";
        req.KeepAlive = true;
        req.Timeout = 300000;
        req.ContentType = "application/x-www-form-urlencoded;charset=utf-8";
        byte[] postData = Encoding.UTF8.GetBytes(PostData(param));
        Stream reqStream = req.GetRequestStream();
        reqStream.Write(postData, 0, postData.Length);
        reqStream.Close();
        HttpWebResponse rsp = (HttpWebResponse)req.GetResponse();
        Encoding encoding = Encoding.GetEncoding(rsp.CharacterSet);
        Stream stream = null;
        StreamReader reader = null;
        stream = rsp.GetResponseStream();
        reader = new StreamReader(stream, encoding);
        result = reader.ReadToEnd();
        if (reader != null) reader.Close();
        if (stream != null) stream.Close();
        if (rsp != null) rsp.Close();
        #endregion
        return Regex.Replace(result, @"[\x00-\x08\x0b-\x0c\x0e-\x1f]", "");
    }
    /// <summary>
    /// 转淘口令
    /// </summary>
    /// <returns>返回字符串</returns>
    public string PostTpwdlong(string url, string appkey, string appSecret, string method, string session, IDictionary<string, string> param, string longurl)
    {
        #region -----API系统参数----
        param.Add("app_key", appkey);
        param.Add("method", method);
        param.Add("session", session);
        param.Add("timestamp", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
        param.Add("format", "json");
        param.Add("v", "2.0");

        //param.Add("material_id", wuliaoid);//官方的物料Id
        param.Add("sign_method", "md5");
        param.Add("url", longurl);
        param.Add("sign", CreateSign(param, appSecret));

        #endregion
        string result = string.Empty;
        #region ---- 完成 HTTP POST 请求----
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
        req.Method = "POST";
        req.KeepAlive = true;
        req.Timeout = 300000;
        req.ContentType = "application/x-www-form-urlencoded;charset=utf-8";
        byte[] postData = Encoding.UTF8.GetBytes(PostData(param));
        Stream reqStream = req.GetRequestStream();
        reqStream.Write(postData, 0, postData.Length);
        reqStream.Close();
        HttpWebResponse rsp = (HttpWebResponse)req.GetResponse();
        Encoding encoding = Encoding.GetEncoding(rsp.CharacterSet);
        Stream stream = null;
        StreamReader reader = null;
        stream = rsp.GetResponseStream();
        reader = new StreamReader(stream, encoding);
        result = reader.ReadToEnd();
        if (reader != null) reader.Close();
        if (stream != null) stream.Close();
        if (rsp != null) rsp.Close();
        #endregion
        return Regex.Replace(result, @"[\x00-\x08\x0b-\x0c\x0e-\x1f]", "");
    }

	public Taobao()
	{
		//
		// TODO: 在此处添加构造函数逻辑
		//
	}
}
```

