var map, waterMap, navControl, typeControl, monthMarkVal, dayMarkVal,
    mapMinWidth = 680,
    cities = new Object(),
    stations = new Object(),
    pmData, pmRanking,
    messageBoxHeight = 300,
    messageBoxMinHeight = 300,
    messageBoxWidth = 315,
    infoWindow = new BMap.InfoWindow("", { enableMessage: false, width: messageBoxWidth, height: messageBoxHeight }),
    detailDialog, center, detailChartDialog, isInWaterView = false, isFocusOnePos = false,
    isPosYearView = false, isComYearView = false;


function initialize() {
    map = new BMap.Map("map-canvas");
    center = new BMap.Point(126.657217, 45.731399);
    map.centerAndZoom(center, 12);
    map.addControl(new BMap.NavigationControl());
    map.addControl(new BMap.ScaleControl());
    map.addControl(new BMap.OverviewMapControl());
    //map.addControl(new BMap.MapTypeControl());
    map.enableScrollWheelZoom();
    map.enableDoubleClickZoom();
    detailDialog = new CustomDetailDialog();
    detailChartDialog = new CustomDetailChartDialog();
    //map.addEventListener("tilesloaded", function () {
    //    if (!isRunFunc) {
    //        getAllPMValues();
    //    }
    //});
    map.addEventListener("click", function (ev) {
        infoWindow.close();
        if (ev.overlay == null) {
            detailDialog.hide();
            detailChartDialog.hide();
        }
    });
    infoWindow.addEventListener("close", function (type, target, point) {

    });

    resizeMap();
    window.addEventListener("resize", function (ev) {
        resizeMap();
    }, false);

    //map.addEventListener("resize", function (ev) {
    //    detailDialog.hide();
    //    detailChartDialog.hide();
    //    map.centerAndZoom(center, 12);
    //}, false);

    map.addEventListener("moveend", function (type, target) {
        center = map.getCenter();
    });

    map.addEventListener("zoomend", function (type, target) {
        center = map.getCenter();
    });

    bindData();
    $(".positionName").click(function () {
        if (isInWaterView) {
            map.clearOverlays();
            setTimeout(function () {
                center = new BMap.Point(126.657217, 45.731399);
                map.centerAndZoom(center, 12);
                map.addControl(new BMap.ScaleControl());
                $(".BMap_stdMpCtrl").show();
                $(".BMap_noprint").show();
                map.addControl(new BMap.OverviewMapControl());
                map.enableScrollWheelZoom();
                MarkMarkers()
            }, 100);
            isInWaterView = false;
        }
        var that = $(this), posLat, posLng;
        for (var i = 0; i < posList.length; i++) {
            if (that.text() == posList[i]["站点名称"]) {
                posLat = posList[i]["经度"];
                posLng = posList[i]["纬度"];
                break;
            }
        }
        center = new BMap.Point(posLat, posLng);
        map.centerAndZoom(center, 14);
        isFocusOnePos = true;
    });

    $("#posWater").click(function () {
        $("#map-canvas").hide();
        $("#map-water").show();
    });

    $("#comWater").click(function () {
        $("#map-water").hide();
        $("#map-canvas").show();
        if (isInWaterView) {
            return;
        }
        isInWaterView = true;
        map.clearOverlays();
        setTimeout(function () {
            center = new BMap.Point(126.657217, 45.731399);
            map.centerAndZoom(center, 12);
            $(".BMap_stdMpCtrl").hide();
            $(".BMap_noprint").hide();
            MarkWaterMarkers()
        }, 100);
    });

    $("#airQuality, #airComChart, #detailsDisplay").click(function () {
        $("#map-water").hide();
        $("#map-canvas").show();
        if (!isInWaterView && !isFocusOnePos) {
            return;
        }
        isInWaterView = false;
        isFocusOnePos = false;
        map.clearOverlays();
        setTimeout(function () {
            center = new BMap.Point(126.657217, 45.731399);
            map.centerAndZoom(center, 12);
            map.addControl(new BMap.ScaleControl());
            $(".BMap_stdMpCtrl").show();
            $(".BMap_noprint").show();
            map.addControl(new BMap.OverviewMapControl());
            map.enableScrollWheelZoom();
            $("#map-canvas").show();
            MarkMarkers()
        }, 100);

    });
}

function bindData() {
    getAqiIconToTable();
    getWaterIconToTable();
    $("#airMinitorPo").tmpl(posList).appendTo("#airMinitorPoTable");
    $("#waterMinitorPo").tmpl(waterMinitor).appendTo("#waterMinitorPoTable");
    $("#administrativePotency").tmpl(administrativePotency).appendTo("#administrativePotencyTable");
}

function getAqiIconToTable() {
    posList.forEach(function (vv, ind, arr) {
        var aqi = parseFloat(vv.AQI);
        if (0 <= aqi && aqi <= 50) {
            vv["空气质量图标"] = "img/green_point.png";
        } else if (aqi <= 100) {
            vv["空气质量图标"] = "img/yellow_point.png";
        } else if (aqi <= 150) {
            vv["空气质量图标"] = "img/orange_point.png";
        } else if (aqi <= 200) {
            vv["空气质量图标"] = "img/red_point.png";
        } else if (aqi <= 300) {
            vv["空气质量图标"] = "img/purple_point.png";
        } else if (aqi > 300) {
            vv["空气质量图标"] = "img/gray_point.png";
        } else {
            vv["空气质量图标"] = "img/green_point.png";
        }
    });
}

function getWaterIconToTable() {
    waterMinitor.forEach(function (value, index, array) {
        switch (value["本周水质"]) {
            case "I":
            case "II":
                value["水质图标"] = "img/w01.png";
                break;
            case "III":
                value["水质图标"] = "img/w02.png";
                break;
            case "IV":
                value["水质图标"] = "img/w03.png";
                break;
            case "V":
                value["水质图标"] = "img/w04.png";
                break;
            case "劣V":
                value["水质图标"] = "img/w05.png";
                break;
            default:
                value["水质图标"] = "img/w01.png";
                break;
        }
    });
}

function resizeMap() {
    var width = Math.max(mapMinWidth, window.innerWidth - $("#content-cockpit").width());  // window.innerWidth * 860 / 1440
    $("#map-canvas").width(width);
    $("#content-cockpit").css("margin-left", width);
    detailDialog.hide();
    detailChartDialog.hide();
    //if (detailDialog.visible()) {
    //    if (width >= 650) {
    //        detailDialog.show();
    //    } else {
    //        detailDialog.hide();
    //    }
    //}
}

//function showblgc() {
//    $("#imgblgc").show();
//    $("#closeButton").show();
//    var left = ($("#imgxzsx").outerWidth() - $("#imgblgc").outerWidth()) / 2;
//    var top = ($("#imgxzsx").outerHeight() - $("#imgblgc").outerHeight()) / 2;
//    var closeLeft = parseFloat(left) + 870 + "px";
//    var closeTop = parseFloat(top) + 3 + "px";
//    $("#imgblgc").css({ top: top, left: left });
//    $("#closeButton").css({ top: closeTop, left: closeLeft });
//}


function showblgcSmall() {
    $("#imgblgcSmall").show();
    var left = ($("#imgxzsxSmall").outerWidth() - $("#imgblgcSmall").outerWidth()) / 2;
    var top = ($("#imgxzsxSmall").outerHeight() - $("#imgblgcSmall").outerHeight()) / 2;
    $("#imgblgcSmall").css({ top: top, left: left });
}

function stopPropagate(ev) {
    if (ev.stopPropagation) {
        ev.stopPropagation();
    } else {
        ev.cancelBubble = true;
    }
}

$(function () {
    initialize();
    getAllPMValues();
    addCityEnvironmentData();

});


function getAllPMValues() {
    pmData = posList;
    setTimeout(function () {
        MarkMarkers();
    }, 2000);
}


var CustomDetailDialog = function () {
    var control = $('#enterpriseDetail');
    var mapControl = $("#map-canvas");

    function hide() {
        control.hide();
    }

    function changeEnterpriseDetailTab(id) {
        $("#enterpriseDetail>div").hide();
        var picDiv = $("#enterpriseDetail #" + id);
        //var mapWidth = Math.max(mapMinWidth, window.innerWidth - $("#content-cockpit").width());
        //var mapHeight = Math.max(parseInt(mapControl.css("min-height")), mapControl.height());
        //picDiv.find("img").attr("width", mapWidth - 100);
        //picDiv.find("img").attr("Height", mapHeight - 100);
        picDiv.show();
    }

    function visible() {
        return control.is(":visible");
    }

    function show(po, full) {
        if (typeof po == "undefined" || po == null) {
            if (full && full == true) {
                var top = (window.innerHeight - control.outerHeight()) / 2;
                var left = (window.innerWidth - control.outerWidth()) / 2;
                position({ top: top, left: left })
            } else {
                var top = (window.innerHeight - control.outerHeight()) / 2;
                var left = (mapControl.outerWidth() - control.outerWidth()) / 2;
                position({ top: top, left: left });
            }
        }
        control.show();
    }
    function position(po) {
        control.css({ top: po.top, left: po.left });
    }
    return { hide: hide, show: show, changeEnterpriseDetailTab: changeEnterpriseDetailTab, position: position, visible: visible };

}

var CustomDetailChartDialog = function () {
    var control = $('#detailsChart');
    var mapControl = $("#map-canvas")

    function hide() {
        control.hide();
    }

    function visible() {
        return control.is(":visible");
    }

    function show(chartOptions, po) {
        control.find("#chartContainer").highcharts(chartOptions);
        //control.highcharts(chartOptions);
        control.show();
        if (typeof po == "undefined") {
            var top = (window.innerHeight - control.outerHeight()) / 2;
            var left = (mapControl.outerWidth() - control.outerWidth()) / 2;
            position({ top: top, left: left });
        }
    }
    function position(po) {
        control.css({ top: po.top, left: po.left });
    }

    control.find("#closeButton").click(function (ev) {
        hide();
    });

    return { hide: hide, show: show, position: position, visible: visible };

}

function createLabel(text, pos) {
    return '<div>' +
          '<div style="background-image: url(img/button_Left.png); height: 28px; width: 18px; background-repeat: no-repeat; float: left"></div>' +
          '<div style="background-image: url(img/button_Line.png); float: left; height: 28px; padding-top:3px; background-repeat:repeat-x">' + text + '</div>' +
           '<div style="background-image: url(img/button_Right.png); height: 28px; width: 18px; background-repeat: no-repeat; float: left"></div>' +
      '</div>'
}

var positionsWithLatLog = new Array();
var citiesNoWithLatLog = new Array();
function MarkMarkers() {
    for (var i = 0; i < pmData.length; i++) {
        if (pmData[i]["站点名称"] != undefined) {
            var lat = parseFloat(pmData[i]["经度"]);
            var lng = parseFloat(pmData[i]["纬度"]);
            var iconUrl = getMarkIcon(pmData[i].AQI);
            var opt = {};
            if (iconUrl != null) {
                opt.icon = new BMap.Icon(iconUrl, new BMap.Size(16, 16));
            }
            var mk = new BMap.Marker(new BMap.Point(lat, lng), opt);
            var label = new BMap.Label(pmData[i]["站点名称"], { "offset": new BMap.Size(10, -20) });
            label.setContent(createLabel(pmData[i]["站点名称"]));
            label.setStyle({ "border": "none", "width": "200px", color: "red", fontSize: "12px", "font-weight": "600", "background-color": "transparent" });
            mk.setLabel(label);
            mk.setTitle(pmData[i]["站点名称"]);
            map.addOverlay(mk);
            mk.addEventListener('click', function (ev) {
                var conFir = $("#content-first").css("display");
                if (conFir == "none") {
                    if (inMonthView) {
                        getPosYearChart(this.getTitle());
                    }
                    if (inDayView) {
                        getPosMonthChart(this.getTitle(), monthMarkVal);
                    }
                    if (inHourView) {
                        getPosDayChart(this.getTitle(), dayMarkVal);
                    }
                }
                else {
                    if ((window.innerWidth - $("#content-cockpit").width()) <= mapMinWidth) {
                        detailDialog.changeEnterpriseDetailTab("jcsjSmall");
                    } else {
                        detailDialog.changeEnterpriseDetailTab("jcsj");
                    }
                    detailDialog.show();
                }
            });
        }
    }

    for (var i = 0; i < comList.length; i++) {
        if (comList[i]["企业名称"] != undefined) {
            var lat = parseFloat(comList[i]["经度"]);
            var lng = parseFloat(comList[i]["纬度"]);
            var so2C = comList[i]["SO2总量（吨）"];
            var icon = getMarkIconForEnterprise(so2C);
            var opt = {};
            if (icon != null) {
                opt.icon = icon;
            }
            var mk = new BMap.Marker(new BMap.Point(lat, lng), opt);
            mk.setTitle(comList[i]["企业名称"]);
            var label = new BMap.Label(comList[i]["企业名称"], { "offset": new BMap.Size(icon.size.width * 0.5, -20) });
            label.setContent(createLabel(comList[i]["企业名称"]));
            label.setStyle({ "border": "none", color: "blue", fontSize: "12px", "width": "200px", "font-weight": "600", "background-color": "transparent" });
            mk.setLabel(label);
            map.addOverlay(mk);
            mk.addEventListener('click', function (ev) {
                var conFir = $("#content-first").css("display");
                if (conFir == "none") {
                    if (inMonthView) {
                        //isComYearView = false;
                        getComYearChart(this.getTitle());
                    }
                    if (inDayView) {
                        getComMonthChart(this.getTitle(), monthMarkVal);
                    }
                    if (inHourView) { //if (isView($("#comHourColumnChart"))) {
                        getComDayChart(this.getTitle(), dayMarkVal);
                    }
                }
                else {
                    var x = ev.pixel.x;
                    var y = ev.pixel.y;
                    if ((window.innerWidth - $("#content-cockpit").width()) <= mapMinWidth) {
                        detailDialog.changeEnterpriseDetailTab("zxjcSmall");
                    } else {
                        detailDialog.changeEnterpriseDetailTab("zxjc");
                    }
                    detailDialog.show();
                }
            });
        }

    }
}

function getMarkIcon(aqi) {
    var q = parseFloat(aqi);
    if (0 <= q && q <= 50) {
        return "img/green_point.png";
    } else if (q <= 100) {

        return "img/yellow_point.png";
    } else if (q <= 150) {

        return "img/orange_point.png";
    } else if (q <= 200) {
        return "img/red_point.png";
    } else if (q <= 300) {
        return "img/purple_point.png";
    } else if (q > 300) {
        return "img/gray_point.png";
    } else {
        return "img/green_point.png";
    }
}

function getMarkIconForEnterprise(emission) {
    var s = Math.floor(emission / 4);
    var iconUrl;
    var size;
    if (s <= 1) {
        iconUrl = "img/c1_16.png";
        size = 16;
    } else if (s <= 2) {
        iconUrl = "img/c2_24.png";
        size = 24;
    } else if (s <= 3) {
        iconUrl = "img/c3_32.png";
        size = 32;
    } else {
        iconUrl = "img/c4_40.png";
        size = 40;
    }
    var icon = new BMap.Icon(iconUrl, new BMap.Size(size, size));
    return icon;

}


function getPMInfoByPositionName(name) {
    var retObj = {};
    for (var i = 0; i < pmData.length ; i++) {
        if (pmData[i].Position_name == name) {
            retObj.PM = pmData[i];
            retObj.index = i;
            break;
        }
    }
    return retObj;
}

function setDefaultPostion(postion) {
    var marker = getPositionMarkerByName(postion.Position_name);
    if (marker != null) {
        var point = new BMap.Point(parseFloat(postion.lng), parseFloat(postion.Lat));
        var pmObject = getPMInfoByPositionName(postion.Position_name);
        var contentString = getPMHTMLString(pmObject);
        infoWindow.setContent(contentString);
        map.centerAndZoom(point, 12)
        marker.openInfoWindow(infoWindow);

    }
}

function getPositionMarkerByName(name) {
    for (var i = 0; i < positionsWithLatLog.length; i++) {
        if (positionsWithLatLog[i].getTitle() == name) {
            return positionsWithLatLog[i];
        }
    }
    return null;
}

function addCityEnvironmentData() {

    getPieChart($("#aqiChart"));
    $("#peopleFeel").text(Math.round(20 + Math.random() * 30));
    //var expdate = new Date();
    //var visits;//以下设置COOKIES时间为1年,自己随便设置该时间..
    //expdate.setTime(expdate.getTime() + (24 * 60 * 60 * 1000 * 365));
    //if (!(visits = GetCookie("visits")))
    //    visits = 0;
    //visits++;
    //SetCookie("visits", visits, expdate, "/", null, false);
    //$("#letterNum").text(Math.round(visits * 10 + Math.random() * 10));
    $("#airInfosList").tabs({
        activate: function (event, ui) {
            var active = $("#airInfosList").tabs("option", "active");
            var currentImg = $("#airInfosList ul>li").eq(active).css("background-image");
            if (currentImg.indexOf("_current") < 0) {
                var activeImg = currentImg.replace(".jpg", "_current.jpg");
                var activeSib = $("#airInfosList ul>li").eq(active).siblings();
                $("#airInfosList ul>li").eq(active).css("background-image", activeImg);
                for (var i = 0; i < activeSib.length; i++) {
                    if (activeSib[i].id != "toCommand") {
                        var preImg = $(activeSib[i]).css("background-image");
                        $(activeSib[i]).css("background-image", preImg.replace("_current.jpg", ".jpg"));
                    }
                }
            }
        }
    });
    $("#waterInfosList").tabs({
        activate: function (event, ui) {
            var active = $("#waterInfosList").tabs("option", "active");
            var currentImg = $("#waterInfosList ul>li").eq(active).css("background-image");
            if (currentImg.indexOf("_current") < 0) {
                var activeImg = currentImg.replace(".jpg", "_current.jpg");
                var preImg = $("#waterInfosList ul>li").eq(active).siblings().css("background-image");
                $("#waterInfosList ul>li").eq(active).css("background-image", activeImg);
                $("#waterInfosList ul>li").eq(active).siblings().css("background-image", preImg.replace("_current.jpg", ".jpg"));
            }
        }
    });
    $("#administration").tabs({
        activate: function (event, ui) {
            var active = $("#administration").tabs("option", "active");
            var currentImg = $("#administration ul>li").eq(active).css("background-image");
            if (currentImg.indexOf("_current") < 0) {
                var activeImg = currentImg.replace(".jpg", "_current.jpg");
                var preImg = $("#administration ul>li").eq(active).siblings().css("background-image");
                $("#administration ul>li").eq(active).css("background-image", activeImg);
                $("#administration ul>li").eq(active).siblings().css("background-image", preImg.replace("_current.jpg", ".jpg"));
            }
        }
    });

    var comTotalDataArr = [], sortArr = [], comPre10DataArr = [], comCatArr = [];
    for (var i = 0; i < comList.length; i++) {
        comTotalDataArr.push(comList[i]);
    }
    sortArr = comTotalDataArr.sort(function (a, b) {
        return parseFloat(a["SO2总量（吨）"]) < parseFloat(b["SO2总量（吨）"]) ? 1 : -1;
    })
    for (var j = 0; j < 10; j++) {
        comCatArr.push(sortArr[j]["企业名称"]);
    }
    for (var j = 0; j < 10; j++) {
        comPre10DataArr.push(parseFloat(sortArr[j]["SO2总量（吨）"]));
    }
    $("#tabs-2").highcharts({
        chart: {
            type: 'column',
            width: 480,
            height: 200,
            marginRight: 32
        },
        title: {
            text: '废气排放总量前10名',
            style: {
                color: '#274b6d',
                fontSize: '14px',
                fontFamily: 'Microsoft YaHei'
            },
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: comCatArr,
            labels: {
                style: {
                    color: '#6c6c6c',
                    fontSize: '11px',
                    fontFamily: 'Microsoft YaHei'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: null
            }
        },
        series: [{
            name: 'SO2总量（吨）',
            data: comPre10DataArr,
            color: '#599bd7'
        }]
    });

    //聚焦企业点位
    var specialComLink = $("#tabs-2 .highcharts-axis-labels text:lt(10)");
    specialComLink.find("tspan").css({ "fill": "#6c6c6c", "font-weight": 600, "cursor": "pointer" });
    specialComLink.click("click", function (ev) {
        if (isInWaterView) {
            map.clearOverlays();
            center = new BMap.Point(126.657217, 45.731399);
            map.centerAndZoom(center, 12);
            map.addControl(new BMap.ScaleControl());
            $(".BMap_stdMpCtrl").show();
            $(".BMap_noprint").show();
            map.addControl(new BMap.OverviewMapControl());
            map.enableScrollWheelZoom();
            MarkMarkers();
            isInWaterView = false;
        }
        var that = $(this), comLat, comLng;
        var comName = that.find("tspan")[0].textContent;
        for (var i = 0; i < comList.length; i++) {
            if (comName == comList[i]["企业名称"]) {
                comLat = comList[i]["经度"];
                comLng = comList[i]["纬度"];
                break;
            }
        }
        center = new BMap.Point(comLat, comLng);
        map.centerAndZoom(center, 14);
        isFocusOnePos = true;
    });

    var dCat = [], ds1 = [], ds2 = [], topX = 10;
    drainage.sort(function (a, b) {
        var t1 = parseFloat(a["COD总量（Kg）"]) + parseFloat(a["NH3-N总量(Kg）"]);
        var t2 = parseFloat(b["COD总量（Kg）"]) + parseFloat(b["NH3-N总量(Kg）"]);
        return t1 >= t2 ? -1 : 1
    }).forEach(function (value, index, array) {
        if (index >= topX) {
            return;
        }
        dCat.push(value["简称"]);
        ds1.push(parseFloat(value["COD总量（Kg）"]));
        ds2.push(parseFloat(value["NH3-N总量(Kg）"]));
    });

    $("#tabs-4").highcharts({
        chart: {
            type: 'column',
            width: 480,
            height: 200,
            marginRight: 28
        },
        title: {
            text: '污水排放总量前10名',
            style: {
                color: '#274b6d',
                fontSize: '14px',
                fontFamily: 'Microsoft YaHei'
            },
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: dCat,
            labels: {
                style: {
                    color: '#6c6c6c',
                    fontSize: '11px',
                    fontFamily: 'Microsoft YaHei'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: null
            }
        },
        series: [{
            name: 'COD总量（Kg）',
            data: ds1,
            color: '#599bd7'
        }, {
            name: 'NH3-N总量(Kg）',
            data: ds2,
            color: '#eb7c2b'
        }]
    });

    var aCate = [], sbData = [], spData = [];
    projects.forEach(function (value, index, array) {
        aCate.push(value["日期"]);
        sbData.push(value["申报量"]);
        spData.push(value["审批量"]);
    });
    $("#adminChart").highcharts({
        chart: {
            height: 200,
            width: 300,
            //backgroundColor: '#545454',
        },
        title: {
            text: '一周办结量',
            style: {
                color: '#222',
                fontSize: '16px',
                fontFamily: 'Microsoft YaHei'
            },
            align: 'left',
            x: 10
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        legend: {
            borderWidth: 0,
            itemStyle: {
                color: '#555',
                fontSize: '12px',
            },
            verticalAlign: 'top',
            x: 80
        },
        xAxis: {
            categories: aCate,
            labels: {
                style: {
                    color: '#888',
                    fontSize: '12px',
                    fontFamily: 'Microsoft YaHei'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: null
            },
            labels: {
                style: {
                    color: '#888',
                    fontSize: '12px',
                    fontFamily: 'Microsoft YaHei'
                }
            }
        },
        series: [{
            name: '申报量',
            data: sbData,
            color: '#a5a3a6'
        }, {
            name: '审批量',
            data: spData,
            color: '#eb7c2b'
        }]
    });
}


function getPieChart(obj) {
    obj.highcharts({
        chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            width: 170,
            height: 200,
            backgroundColor: '#f2f2f4'
            //marginBottom: 10,
            //marginRight: 60,
        },

        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        title: {
            text: '空气质量指数',
            verticalAlign: 'bottom',
            y: 3,
            style: {
                fontSize: '14px',
                color: '#222222',
                fontFamily: 'Microsoft YaHei'
            }
        },
        pane: {
            startAngle: -150,
            endAngle: 150,
            background: [{
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#FFF'],
                        [1, '#333']
                    ]
                },
                borderWidth: 0,
                outerRadius: '109%'
            }, {
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#333'],
                        [1, '#FFF']
                    ]
                },
                borderWidth: 1,
                outerRadius: '107%'
            }, {
                // default background
            }, {
                backgroundColor: '#DDD',
                borderWidth: 0,
                outerRadius: '105%',
                innerRadius: '103%'
            }]
        },

        // the value axis
        yAxis: {
            min: 0,
            max: 400,

            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',

            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
                step: 2,
                rotation: 'auto'
            },
            plotBands: standardColorArr
        },

        series: [{
            name: 'AQI',
            data: [101]
        }]

    });
}

function getCookieVal(offset) {
    var endstr = document.cookie.indexOf(";", offset);
    if (endstr == -1) {
        endstr = document.cookie.length;
    }
    return unescape(document.cookie.substring(offset, endstr));
}
function GetCookie(name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg)
            return getCookieVal(j);
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0)
            break;
    }
    return null;
}
function SetCookie(name, value) {
    var argv = SetCookie.arguments;
    var argc = SetCookie.arguments.length;
    var expires = (2 < argc) ? argv[2] : null;
    var path = (3 < argc) ? argv[3] : null;
    var domain = (4 < argc) ? argv[4] : null;
    var secure = (5 < argc) ? argv[5] : false;
    document.cookie = name + "=" + escape(value) + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ((path == null) ? "" : ("; path=" + path)) + ((domain == null) ? "" : ("; domain=" + domain)) + ((secure == true) ? "; secure" : "");
}
function ResetCounts(name) {
    visits = 0; SetCookie("visits", visits, expdate, "/", null, false);
    location.reload();
}

var inMonthView = false, inDayView = false, inHourView = false;
function analyseDetails() {
    $("#content-first").hide();
    $("#content-second").show();

    $("#content-second").tabs({
        disabled: [1]
    });
    $("#content-cockpit").width(580);
    $("#cityConcentrationD").hide();

    var cat = [], industryArr = [];
    for (var i = 0; i < posList.length; i++) {
        cat.push(posList[i]["站点名称"]);
    }
    for (var i = 0; i < industryType.length; i++) {
        industryArr.push(industryType[i]);
    }
    var dataArr = getCityMonthData();
    inMonthView = true;
    center = new BMap.Point(126.657217, 45.731399);
    map.centerAndZoom(center, 12);
    MarkMarkers();
    $("#cityConcentrationM").highcharts({
        chart: {
            type: 'line',
            height: 260,
            width: 370
        },
        exporting: {
            enabled: false
        },
        title: {
            text: '全市SO2浓度变化曲线',
            style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
        },
        yAxis: {
            min: 0,
            max: 0.3,
            title: {
                text: null
            },
            labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } },
            gridLineColor: "#c8c8c8",
            lineColor: "#8ec657",
            plotBands: [{
                color: '#f38f43',
                width: 2,
                value: 0.25,
                label: {
                    text: '0.25',
                    align: 'left',
                    x: -28,
                    y: 4,
                    style: { "font-size": "11px", "color": "#555", "font-family": "Arial" },
                }
            }]
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'SO2浓度（mg/L）',
            color: "#8ec657",
            data: dataArr
        }]
    });
    $("#totalPro").highcharts({
        chart: {
            type: 'column',
            //marginRight: 30,
            marginLeft: 30,
            height: 260,
            width: 140
        },
        title: {
            text: '总量进度',
            x: 10
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: ['']
        },
        yAxis: {
            min: 0,
            labels: {
                enabled: false
            },
            title: {
                text: null
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                }
            }
        },
        tooltip: {
            enabled: false
        },
        series: [{
            name: '余量',
            color: "#8ec657",
            data: [3.61]
        }, {
            name: '排放量',
            color: "#2f7ed8",
            data: [10.11]
        }]
    });
    $("#posConcentration").highcharts({
        chart: {
            type: 'column',
            marginRight: 60,
            height: 260
        },
        title: {
            text: '各监测点位浓度对比',
            style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: cat,
            labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
        },
        yAxis: {
            min: 0,
            title: {
                text: null
            },
            labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } }
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'SO2浓度（mg/L）',
            data: getPosCompareArr(cat),
            color: "#8ec657"
        }]
    });


    var posYearLink = $("#posConcentration .highcharts-axis-labels text:lt(12)");
    posYearLink.find("tspan").css({ "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei", "font-weight": "600" });
    posYearLink.click("click", function (ev) {
        detailChartDialog.hide();
        detailDialog.hide();
        var that = this;
        //isPosYearView = true;
        var posName = $(that).find("tspan")[0].textContent;
        zoomMarkByName(posList, posName, inMonthView);
    });

    var indusPercentArr = getIndustryPercentArr();
    $("#comPieChart").highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            width: 170,
            height: 300
        },
        title: {
            text: '行业总量分布',
            style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true,
                colors: ['#8ec657', '#2f7ed8', '#00188f', '#b71415', '#20ace3', '#9b4f96', '#f38f43']
            }
        },
        series: [{
            type: 'pie',
            name: 'SO2总量百分比',
            data: [
                [industryArr[0], parseFloat(indusPercentArr[0])],
                [industryArr[1], parseFloat(indusPercentArr[1])],
                [industryArr[2], parseFloat(indusPercentArr[2])],
                [industryArr[3], parseFloat(indusPercentArr[3])],
                [industryArr[4], parseFloat(indusPercentArr[4])],
                [industryArr[5], parseFloat(indusPercentArr[5])],
                [industryArr[6], parseFloat(indusPercentArr[6])]
            ]
        }]
    });
    var industryTypeArr = [], industryPushTotalArr = [];
    var industryTotalValArr = sortIndustryTotalValue();
    for (var i = 0; i < 10; i++) {
        industryTypeArr.push(industryTotalValArr[i]["企业名称"]);
        industryPushTotalArr.push(industryTotalValArr[i]["排放总量"]);
    }
    $("#comColumnChart").highcharts({
        chart: {
            type: 'column',
            marginRight: 60,
            width: 380,
            height: 300
        },
        title: {
            text: '企业排放前10名',
            style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: industryTypeArr,
            labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
        },
        yAxis: {
            min: 0,
            title: {
                text: null
            },
            labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } }
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'SO2总量（吨）',
            color: "#8ec657",
            data: industryPushTotalArr
        }]
    });
    $("#cityConcentrationM").show();
    $("#totalPro").show();

    var comYearLink = $("#comColumnChart .highcharts-axis-labels text:lt(10)");
    comYearLink.find("tspan").css({ "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei", "font-weight": "600" });
    comYearLink.click("click", function (ev) {
        detailChartDialog.hide();
        detailDialog.hide();
        var that = this;
        //isComYearView = true;
        var comName = $(that).find("tspan")[0].textContent;
        zoomMarkByName(comList, comName, inMonthView);
    });



    //var specialMonthLink = $("#cityConcentrationM .highcharts-axis-labels text:lt(12)");
    var specialMonthLink = $("#cityConcentrationM .highcharts-axis-labels text").eq(9);
    specialMonthLink.find("tspan").css({ "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei", "font-weight": "600" });
    specialMonthLink.click("click", function (ev) {
        detailChartDialog.hide();
        detailDialog.hide();
        inMonthView = false;
        inDayView = true;
        var that = this;
        var month = parseInt($(that).find("tspan")[0].textContent.trimEnd('月'));
        monthMarkVal = month;
        center = new BMap.Point(126.657217, 45.731399);
        map.centerAndZoom(center, 12);
        MarkMarkers();
        var data = posDailyAveData(2012, month), categories = new Array(), dataArr = new Array();

        data.forEach(function (value, index, array) {
            categories.push(value.day);
            //TODO::
            dataArr.push(value.value == null ? null : parseFloat(value.value.toFixed(5)));
        });

        //城市SO2月浓度
        $("#cityConcentrationD").highcharts(
           {
               chart: {
                   type: 'line',
                   marginRight: 60,
                   height: 260,
                   width: 520
               },
               exporting: {
                   enabled: false
               },
               title: {
                   text: "全市SO2（" + month + "月）浓度变化曲线",
                   style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
               },
               credits: {
                   enabled: false
               },
               xAxis: {
                   categories: categories,
                   labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
               },
               yAxis: {
                   min: 0,
                   max: 0.3,
                   title: {
                       text: null
                   },
                   labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } },
                   plotBands: [{
                       color: '#f38f43',
                       width: 2,
                       value: 0.25,
                       label: {
                           text: '0.25',
                           align: 'left',
                           x: -28,
                           y: 4,
                           style: { "font-size": "11px", "color": "#555", "font-family": "Arial" },
                       }
                   }]
               },
               legend: {
                   enabled: false
               },
               series: [{
                   name: 'SO2浓度（mg/L）',
                   color: "#8ec657",
                   data: dataArr
               }]
           });


        //var dataMonthPos = new Array(), tempArr = new Array();
        //posMonthData.forEach(function (value, index, array) {
        //    var posName = value["站点名称"];
        //    var val = null;
        //    value["月数据"].forEach(function (v, i, arr) {
        //        if (v["月份"] == month) {
        //            val = v["月平均浓度值"];
        //            return;
        //        }
        //    });
        //    tempArr.push({ "站点名称": posName, "月平均浓度值": val });
        //});
        //// tempArr.sort(function (a, b) {
        ////});
        //cat.forEach(function (value, index, array) {
        //    var name = value;
        //    var val = null;
        //    tempArr.forEach(function (v, i, arr) {
        //        if (name == v["站点名称"]) {
        //            val = v["月平均浓度值"];
        //        }
        //    });
        //    dataMonthPos.push(val == null ? null : parseFloat(parseFloat(val).toFixed(5)));
        //});

        //检测站点月数据
        var dataMonthPos = new Array(), tempArr = new Array(), avg = 0, total = 0;
        posDailyAveVal.forEach(function (v, i, arr) {
            tempArr.push(v["站点名称"]);
            dataMonthPos.push(v["站点当月均值"]);
            total += v["站点当月均值"];
        });
        avg = total / 12;
        $("#posDayConcentration").highcharts({
            chart: {
                type: 'column',
                marginRight: 60,
                height: 265
            },
            title: {
                text: '各监测点位（' + month + '月）浓度对比',
                style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
            },
            exporting: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            xAxis: {
                //categories: cat
                categories: tempArr,
                labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
            },
            yAxis: {
                min: 0,
                title: {
                    text: null
                },
                labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } }
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'SO2浓度（mg/L）',
                color: "#8ec657",
                data: dataMonthPos
            }]
        });

        var slinks = $("#posDayConcentration .highcharts-axis-labels text:lt(12)")
        slinks.find("tspan").css({ "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei", "font-weight": "600" });
        slinks.click(function (ev) {
            detailChartDialog.hide();
            detailDialog.hide();
            var that = this;
            var posName = $(that).find("tspan")[0].textContent;
            //var posData = posMonthDetailData(posName, 2012, month);
            zoomMarkByName(posList, posName, inDayView);
        });

        //行业月总量
        var industryD = industryMonthData(2012, month), industryDChartP = [];
        industryD.forEach(function (value, index, array) {
            industryDChartP.push([value["行业"], value["月排放比例"]]);
        });
        $("#comDayPieChart").empty().highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                width: 170,
                height: 300
            },
            title: {
                text: '行业总量分布',
                style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
            },
            exporting: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true,
                    colors: ['#8ec657', '#2f7ed8', '#00188f', '#b71415', '#20ace3', '#9b4f96', '#f38f43']
                }
            },
            series: [{
                type: 'pie',
                name: 'SO2总量百分比',
                data: industryDChartP
            }]
        });
        //企业月排放前10
        var comMonArr = [];
        var arr = [];
        for (var i = 0; i < comMonthTotalVal.length; i++) {
            arr.push(comMonthTotalVal[i]);
        }
        var sortArr = arr.sort(function (a, b) {
            var v1 = a["月排放总量"] == null ? -1 : parseFloat(a["月排放总量"]);
            var v2 = b["月排放总量"] == null ? -1 : parseFloat(b["月排放总量"]);
            return v1 >= v2 ? -1 : 1
        })

        var topCount = 10;
        var companyNameArr = [], companyMArr = [], colorArr = [];
        sortArr.splice(0, topCount).forEach(function (v, i, arr) {
            companyNameArr.push(v["企业名称"]);
            companyMArr.push(parseFloat((v["月排放总量"] / 10000000).toFixed(2)));
        });

        for (var i = 0; i < topCount; i++) {
            colorArr.push("#2f7ed8");
        }

        $("#comDayColumnChart").empty().highcharts({
            chart: {
                type: 'column',
                marginRight: 60,
                width: 380,
                height: 300
            },
            color: colorArr,
            title: {
                text: '企业排放(' + month + '月)前10名',
                style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
            },
            exporting: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: companyNameArr,
                labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
            },
            yAxis: {
                min: 0,
                title: {
                    text: null
                },
                labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } }
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'SO2总量（吨）',
                color: "#8ec657",
                data: companyMArr
            }]
        });

        var comlinks = $("#comDayColumnChart .highcharts-axis-labels text:lt(10)")
        comlinks.find("tspan").css({ "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei", "font-weight": "600" });
        comlinks.click(function (ev) {
            detailChartDialog.hide();
            detailDialog.hide();
            var that = this;
            var comName = $(that).find("tspan")[0].textContent;
            zoomMarkByName(comList, comName, inDayView);
        });

        $("#cityConcentrationM").hide();
        $("#totalPro").hide();
        //$("#cityConcentrationH").hide();
        $("#posConcentration").hide();
        $("#comPieChart").hide();
        $("#comColumnChart").hide();
        $("#cityConcentrationD").show();
        $("#posDayConcentration").show();
        $("#comDayPieChart").show();
        $("#comDayColumnChart").show();

        //日数据
        var specialDayLink = $("#cityConcentrationD .highcharts-axis-labels text:eq(3), #cityConcentrationD .highcharts-axis-labels text:eq(6)");
        specialDayLink.find("tspan").css({ "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei", "font-weight": "600" });
        specialDayLink.click("click", function (ev) {
            inMonthView = false;
            inDayView = false;
            inHourView = true;
            var that = this;
            var day = parseInt($(that).find("tspan")[0].textContent);
            dayMarkVal = day;
            center = new BMap.Point(126.657217, 45.731399);
            map.centerAndZoom(center, 12);
            MarkMarkers();
            var data = so2CityOneDayArr.filter(function (v) {
                return v.day == day;
            });
            var categories = new Array(), dataArr = new Array();

            data.forEach(function (value, index, array) {
                categories.push(value.hour);
                //TODO::
                dataArr.push(value.value == null ? null : parseFloat(value.value.toFixed(3)));
            });

            //城市SO2日浓度
            $("#cityConcentrationH").highcharts(
               {
                   chart: {
                       type: 'line',
                       marginRight: 60,
                       height: 260,
                       width: 520
                   },
                   exporting: {
                       enabled: false
                   },
                   title: {
                       text: "全市SO2（" + day + "日）浓度变化曲线",
                       style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
                   },
                   credits: {
                       enabled: false
                   },
                   xAxis: {
                       categories: categories,
                       labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
                   },
                   yAxis: {
                       min: 0,
                       title: {
                           text: null
                       },
                       labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } },
                       plotBands: [{
                           color: '#f38f43',
                           width: 2,
                           value: 0.25,
                           label: {
                               text: '0.25',
                               align: 'left',
                               x: -28,
                               y: 4,
                               style: { "font-size": "11px", "color": "#555", "font-family": "Arial" },
                           }
                       }]
                   },
                   legend: {
                       enabled: false
                   },
                   series: [{
                       name: 'SO2浓度（mg/L）',
                       color: "#8ec657",
                       data: dataArr
                   }]
               });

            //检测站点日数据
            var dataD = posOneDayArr.filter(function (v) {
                return v["日期"] == day;
            });
            var dataDayPos = new Array(), tempArr = new Array(), avg = 0;
            dataD.forEach(function (value, index, array) {
                var hourData = value["小时数据"], total = 0, valInd = 0;
                hourData.forEach(function (vv, ind, arr) {
                    total += vv.value == null ? 0 : vv.value;
                    ++valInd;
                });
                tempArr.push(value["站点名称"]);
                dataDayPos.push(total / valInd == 0 ? null : parseFloat((total / valInd).toFixed(3)));
            });
            $("#posHourConcentration").highcharts({
                chart: {
                    type: 'column',
                    marginRight: 60,
                    height: 260
                },
                title: {
                    text: '各监测点位（' + day + '日）浓度对比',
                    style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
                },
                exporting: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    categories: tempArr,
                    labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: null
                    },
                    labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } }
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: 'SO2浓度（mg/L）',
                    color: "#8ec657",
                    data: dataDayPos
                }]
            });

            var slinks = $("#posHourConcentration .highcharts-axis-labels text:lt(12)")
            slinks.find("tspan").css({ "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei", "font-weight": "600" });
            slinks.click(function (ev) {
                detailChartDialog.hide();
                detailDialog.hide();
                var that = this;
                var posName = $(that).find("tspan")[0].textContent;
                zoomMarkByName(posList, posName, inHourView);
            });

            //行业日总量
            var industryD, industryDChartP = [];
            if (day == 4) {
                industryD = industryDayDataFour;
            }
            if (day == 7) {
                industryD = industryDayDataFour;
            }
            industryD.forEach(function (value, index, array) {
                industryDChartP.push([value["行业"], value["日排放比例"]]);
            });
            $("#comHourPieChart").empty().highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    width: 170,
                    height: 300
                },
                title: {
                    text: '行业总量分布',
                    style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
                },
                exporting: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true,
                        colors: ['#8ec657', '#2f7ed8', '#00188f', '#b71415', '#20ace3', '#9b4f96', '#f38f43']
                    },
                },
                series: [{
                    type: 'pie',
                    name: 'SO2总量百分比',
                    data: industryDChartP
                }]
            });

            //企业日排放前10
            var comMonArr = [], arr = [];
            if (day == 4) {
                for (var i = 0; i < comDayTotalValFour.length; i++) {
                    arr.push(comDayTotalValFour[i]);
                }
            }
            if (day == 7) {
                for (var i = 0; i < comDayTotalValSev.length; i++) {
                    arr.push(comDayTotalValSev[i]);
                }
            }
            var sortArr = arr.sort(function (a, b) {
                var v1 = a["日排放量"] == null ? -1 : parseFloat(a["日排放量"]);
                var v2 = b["日排放量"] == null ? -1 : parseFloat(b["日排放量"]);
                return v1 >= v2 ? -1 : 1
            })

            var topCount = 10;
            var companyNameArr = [], companyMArr = [], colorArr = [];
            sortArr.splice(0, topCount).forEach(function (v, i, arr) {
                companyNameArr.push(v["企业名称"]);
                if (v["企业名称"] == "哈尔滨第三发电厂") {
                    companyMArr.push(parseFloat((v["日排放量"] / 1000000000).toFixed(2)));
                }
                else {
                    companyMArr.push(parseFloat((v["日排放量"] / 1000000).toFixed(2)));
                }
            });

            for (var i = 0; i < topCount; i++) {
                colorArr.push("#8ec657");
            }

            $("#comHourColumnChart").empty().highcharts({
                chart: {
                    type: 'column',
                    marginRight: 60,
                    width: 380,
                    height: 300
                },
                color: colorArr,
                title: {
                    text: '企业排放(' + day + '日)前10名',
                    style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
                },
                exporting: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    categories: companyNameArr,
                    labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: null
                    },
                    labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } }
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: 'SO2总量（吨）',
                    color: "#8ec657",
                    data: companyMArr
                }]
            });


            var comlinks = $("#comHourColumnChart .highcharts-axis-labels text:lt(10)")
            comlinks.find("tspan").css({ "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei", "font-weight": "600" });
            comlinks.click(function (ev) {
                detailChartDialog.hide();
                detailDialog.hide();
                var that = this;
                var comName = $(that).find("tspan")[0].textContent;
                zoomMarkByName(comList, comName, inHourView);
            });

            $("#cityConcentrationD").hide();
            $("#posDayConcentration").hide();
            $("#comDayPieChart").hide();
            $("#comDayColumnChart").hide();
            //$("#totalPro").hide();
            $("#cityConcentrationH").show();
            $("#posHourConcentration").show();
            $("#comHourPieChart").show();
            $("#comHourColumnChart").show();

        }, false);

    }, false);


}

function returnToDetails() {
    detailChartDialog.hide();
    detailDialog.hide();

    if (inMonthView) {
        $("#content-second").hide();
        $("#content-first").show();
        addCityEnvironmentData();
        center = new BMap.Point(126.657217, 45.731399);
        map.centerAndZoom(center, 12);
        inMonthView = false;
    }
    if (inDayView) {
        $("#cityConcentrationD").hide();
        $("#posDayConcentration").hide();
        $("#comDayPieChart").hide();
        $("#comDayColumnChart").hide();
        $("#cityConcentrationM").show();
        $("#totalPro").show();
        $("#posConcentration").show();
        $("#comPieChart").show();
        $("#comColumnChart").show();
        center = new BMap.Point(126.657217, 45.731399);
        map.centerAndZoom(center, 12);
        inDayView = false;
        inMonthView = true;
    }
    if (inHourView) {
        $("#cityConcentrationH").hide();
        $("#posHourConcentration").hide();
        $("#comHourPieChart").hide();
        $("#comHourColumnChart").hide();
        $("#cityConcentrationD").show();
        $("#posDayConcentration").show();
        $("#comDayPieChart").show();
        $("#comDayColumnChart").show();
        center = new BMap.Point(126.657217, 45.731399);
        map.centerAndZoom(center, 12);
        //$("#totalPro").hide();        
        inHourView = false;
        inDayView = true;
    }
    //else {
    //    $("#content-second").hide();
    //    $("#content-first").show();
    //    addCityEnvironmentData();
    //}
}

function zoomMarkByName(list, name, isView) {
    if (!isView) {
        return;
    }
    map.clearOverlays();
    var lat, lng;
    for (var i = 0; i < list.length; i++) {
        if (name == list[i]["站点名称"] || name == list[i]["企业名称"]) {
            lat = list[i]["经度"];
            lng = list[i]["纬度"];
            break;
        }
    }
    center = new BMap.Point(lat, lng);
    map.centerAndZoom(center, 14);
    //map.addControl(new BMap.NavigationControl());
    map.addControl(new BMap.ScaleControl());
    $(".BMap_stdMpCtrl").show();
    $(".BMap_noprint").show();
    map.addControl(new BMap.OverviewMapControl());
    //map.addControl(new BMap.MapTypeControl());
    map.enableScrollWheelZoom();
    MarkMarkers();
}

function getPosYearChart(posName) {
    var posDD = posMonthData.filter(function (value) {
        return value["站点名称"] == posName;
    });
    if (posDD.length <= 0) {
        detailChartDialog.hide();
        return;
    }
    var posCat = [], posDataArr = [];
    for (var i = 1; i <= 12; i++) {
        var tmpArr = posDD[0]["月数据"].filter(function (value) {
            return i.toString() == value["月份"];
        });
        posCat.push(i.toString() + "月");
        posDataArr.push(tmpArr.length <= 0 ? null : parseFloat(parseFloat(tmpArr[0]["月平均浓度值"]).toFixed(5)));
    }

    detailChartDialog.show(
       {
           chart: {
               type: 'line',
               marginRight: 60,
               height: 300,
               width: 550
           },
           exporting: {
               enabled: false
           },
           title: {
               text: posName + 'SO2浓度变化曲线',
               style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
           },
           credits: {
               enabled: false
           },
           xAxis: {
               categories: posCat,
               labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
           },
           yAxis: {
               min: 0,
               max: 0.4,
               title: {
                   text: null
               },
               labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } },
               plotBands: [{
                   color: '#f38f43',
                   width: 2,
                   value: 0.25,
                   label: {
                       text: '0.25',
                       align: 'left',
                       x: -28,
                       y: 4,
                       style: { "font-size": "11px", "color": "#555", "font-family": "Arial" },
                   }
               }]
           },
           legend: {
               enabled: false
           },
           series: [{
               name: 'SO2浓度（mg/L）',
               color: "#8ec657",
               data: posDataArr
           }]
       });
}

function getComYearChart(comName) {
    var comDD = companyMonthData.filter(function (value) {
        return value["企业名称"] == comName;
    });
    if (comDD.length <= 0) {
        detailChartDialog.hide();
        return;
    }
    var comCat = [], comDataArr = [];
    for (var i = 1; i <= 12; i++) {
        var tmpArr = comDD[0]["月数据"].filter(function (value) {
            return i.toString() == value["月份"];
        });
        comCat.push(i.toString() + "月");
        comDataArr.push(tmpArr.length <= 0 ? null : parseFloat(parseFloat(tmpArr[0]["月平均排放量"]).toFixed(2)));
    }


    detailChartDialog.show(
       {
           chart: {
               type: 'line',
               marginRight: 60,
               height: 300,
               width: 550
           },
           exporting: {
               enabled: false
           },
           title: {
               text: comName + 'SO2浓度变化曲线',
               style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
           },
           credits: {
               enabled: false
           },
           xAxis: {
               categories: comCat,
               labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
           },
           yAxis: {
               min: 0,
               title: {
                   text: null
               },
               labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } }
           },
           legend: {
               enabled: false
           },
           series: [{
               name: 'SO2排量（吨）',
               color: "#8ec657",
               data: comDataArr
           }]
       });
}

function getPosMonthChart(posName, month) {
    var posData, posCat = new Array(), posDataArr = new Array();
    posMonthDetailData.forEach(function (v, i, arr) {
        if (posName == v["站点名称"]) {
            posData = v["日排放量"];
        }
    })
    if (posData == null) {
        return;
    }
    posData.forEach(function (value, index, array) {
        posCat.push(value.day);
        posDataArr.push(value.value == null ? null : parseFloat(value.value.toFixed(5)));
    });
    detailChartDialog.show(
       {
           chart: {
               type: 'line',
               marginRight: 60,
               height: 300,
               width: 550
           },
           exporting: {
               enabled: false
           },
           title: {
               text: posName + 'SO2（' + month + '月）浓度变化曲线',
               style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
           },
           credits: {
               enabled: false
           },
           xAxis: {
               categories: posCat,
               labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
           },
           yAxis: {
               min: 0,
               max: 0.3,
               title: {
                   text: null
               },
               labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } },
               plotBands: [{
                   color: '#f38f43',
                   width: 2,
                   value: 0.25,
                   label: {
                       text: '0.25',
                       align: 'left',
                       x: -28,
                       y: 4,
                       style: { "font-size": "11px", "color": "#555", "font-family": "Arial" },
                   }
               }]
           },
           legend: {
               enabled: false
           },
           series: [{
               name: 'SO2浓度（mg/L）',
               color: "#8ec657",
               data: posDataArr
           }]
       });
}

function getComMonthChart(comName, month) {
    var comD = new Array(), comCat = new Array(), comDataArr = new Array();
    comMonthTotalVal.forEach(function (v, i, arr) {
        if (v["企业名称"] == comName) {
            v["日排放量"].forEach(function (vv, ind, ar) {
                comD.push(vv);
            });
        }
    });
    if (comD == null) {
        return;
    }
    comD.forEach(function (value, index, array) {
        comCat.push(value.day);
        comDataArr.push(value.value == null ? null : parseFloat(((value.value) / 1000000).toFixed(2)));
    });
    detailChartDialog.show(
       {
           chart: {
               type: 'line',
               marginRight: 60,
               height: 300,
               width: 550
           },
           exporting: {
               enabled: false
           },
           title: {
               text: comName + 'SO2（' + month + '月）排量变化曲线',
               style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
           },
           credits: {
               enabled: false
           },
           xAxis: {
               categories: comCat,
               labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
           },
           yAxis: {
               min: 0,
               title: {
                   text: null
               },
               labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } }
           },
           legend: {
               enabled: false
           },
           series: [{
               name: 'SO2排量（吨）',
               color: "#8ec657",
               data: comDataArr
           }]
       });
}

function getPosDayChart(posName, day) {
    var posData = posOneDayArr.filter(function (v) {
        return v["站点名称"] == posName && v["日期"] == day;
    });
    var posCat = new Array(), posDataArr = new Array();
    if (posData == null) {
        return;
    }
    posData.forEach(function (value, index, array) {
        var hourD = value["小时数据"];
        hourD.forEach(function (vv, ind, arr) {
            posCat.push(vv.hour);
            posDataArr.push(vv.value == null ? null : vv.value);
        });
    });
    detailChartDialog.show(
       {
           chart: {
               type: 'line',
               marginRight: 60,
               height: 300,
               width: 550
           },
           exporting: {
               enabled: false
           },
           title: {
               text: posName + 'SO2（' + day + '日）浓度变化曲线',
               style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
           },
           credits: {
               enabled: false
           },
           xAxis: {
               categories: posCat,
               labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
           },
           yAxis: {
               min: 0,
               max: 0.3,
               title: {
                   text: null
               },
               labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } },
               plotBands: [{
                   color: '#f38f43',
                   width: 2,
                   value: 0.25,
                   label: {
                       text: '0.25',
                       align: 'left',
                       x: -28,
                       y: 4,
                       style: { "font-size": "11px", "color": "#555", "font-family": "Arial" },
                   }
               }]
           },
           legend: {
               enabled: false
           },
           series: [{
               name: 'SO2浓度（mg/L）',
               color: "#8ec657",
               data: posDataArr
           }]
       });
}

function getComDayChart(comName, day) {
    var comD = new Array(), comCat = new Array(), comDataArr = new Array();
    comMonthOneDayData.filter(function (v) {
        return v["日期"] == day.toString();
    }).forEach(function (v, i, arr) {
        if (v["企业名称"] == comName) {
            v["小时数据"].forEach(function (vv, ind, ar) {
                comD.push(vv);
            });
        }
    });
    if (comD == null) {
        return;
    }
    comD.forEach(function (value, index, array) {
        comCat.push(value["时间"]);
        comDataArr.push((value["小时均排量"] == null || value["小时均排量"] == 0) ? null : parseFloat((value["小时均排量"] / 100000).toFixed(2)));
    });
    detailChartDialog.show(
       {
           chart: {
               type: 'line',
               marginRight: 60,
               height: 300,
               width: 550
           },
           exporting: {
               enabled: false
           },
           title: {
               text: comName + 'SO2（' + day + '日）排量变化曲线',
               style: { "font-size": "14px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
           },
           credits: {
               enabled: false
           },
           xAxis: {
               categories: comCat,
               labels: { style: { "font-size": "11px", "color": "#6c6c6c", "font-family": "Microsoft YaHei" } }
           },
           yAxis: {
               min: 0,
               title: {
                   text: null
               },
               labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } }
           },
           legend: {
               enabled: false
           },
           series: [{
               name: 'SO2排量（吨）',
               color: "#8ec657",
               data: comDataArr
           }]
       });
}

function getCityMonthData() {
    var cityArr = [];
    for (var i = 0; i < posMonthData.length; i++) {
        cityArr.push(posMonthData[i]);
    }
    var jaTotal = feTotal = marTotal = aprTotal = mayTotal = junTotal = julTotal = augTotal = sepTotal = octTotal = novTotal = decTotal = 0;
    var jaIndex = feIndex = marIndex = aprIndex = mayIndex = junIndex = julIndex = augIndex = sepIndex = octIndex = novIndex = decIndex = 0;
    for (var j = 0; j < cityArr.length; j++) {
        var cityMonth = cityArr[j]["月数据"];
        for (var k = 0; k < cityMonth.length; k++) {
            var intMonth = parseInt(cityMonth[k]["月份"]);
            var monthVal = parseFloat(cityMonth[k]["月平均浓度值"]);
            hashMap.Set(intMonth, monthVal);
            switch (intMonth) {
                case 1:
                    jaTotal = jaTotal + hashMap.Get(1);
                    jaIndex++;
                    break;
                case 2:
                    feTotal = jaTotal + hashMap.Get(2);
                    feIndex++;
                    break;
                case 3:
                    marTotal = marTotal + hashMap.Get(3);
                    marIndex++;
                    break;
                case 4:
                    aprTotal = aprTotal + hashMap.Get(4);
                    aprIndex++;
                    break;
                case 5:
                    mayTotal = mayTotal + hashMap.Get(5);
                    mayIndex++;
                    break;
                case 6:
                    junTotal = junTotal + hashMap.Get(6);
                    junIndex++;
                    break;
                case 7:
                    julTotal = julTotal + hashMap.Get(7);
                    julIndex++;
                    break;
                case 8:
                    augTotal = augTotal + hashMap.Get(8);
                    augIndex++;
                    break;
                case 9:
                    sepTotal = sepTotal + hashMap.Get(9);
                    sepIndex++;
                    break;
                case 10:
                    octTotal = octTotal + hashMap.Get(10);
                    octIndex++;
                    break;
                case 11:
                    novTotal = novTotal + hashMap.Get(11);
                    novIndex++;
                    break;
                case 12:
                    decTotal = decTotal + hashMap.Get(12);
                    decIndex++;
                    break;
            }
            hashMap.Remove(intMonth);
        }
    }
    var dataArr = [parseFloat((jaTotal / jaIndex).toFixed(5)), parseFloat((feTotal / feIndex).toFixed(5)), parseFloat((marTotal / marIndex).toFixed(5)), parseFloat((aprTotal / aprIndex).toFixed(5)), parseFloat((mayTotal / mayIndex).toFixed(5)), parseFloat((junTotal / junIndex).toFixed(5)), parseFloat((julTotal / julIndex).toFixed(5)), parseFloat((augTotal / augIndex).toFixed(5)), parseFloat((sepTotal / sepIndex).toFixed(5)), parseFloat((octTotal / octIndex).toFixed(5)), parseFloat((novTotal / novIndex).toFixed(5)), parseFloat((decTotal / decIndex).toFixed(5))];
    return dataArr;
}

var hashMap = {
    Set: function (key, value) { this[key] = value },
    Get: function (key) { return this[key] },
    Contains: function (key) { return this.Get(key) == null ? false : true },
    Remove: function (key) { delete this[key] }
}


function getPosCompareArr(cat) {
    var posCompareArr = [];
    for (var j = 0; j < cat.length; j++) {
        //var index = 0;
        for (var k = 0; k < posMonthData.length; k++) {
            if (cat[j] != posMonthData[k]["站点名称"]) {
                if (k == posMonthData.length - 1) {
                    posCompareArr.push(null);
                }
            }
            else {
                var pmd = parseFloat(getMonthValue(posMonthData[k]));
                posCompareArr.push(pmd);
                break;
            }
        }
    }
    return posCompareArr;
}

function getMonthValue(arr) {
    var val = 0;
    var posMonthArr = arr["月数据"];
    for (var i = 0; i < posMonthArr.length; i++) {
        val = val + parseFloat(posMonthArr[i]["月平均浓度值"]);
    }
    return val.toFixed(5);
}

function getIndustryPercentArr() {
    var totalVal = 0;
    var IndustryTotalArr = getIndustryTotalArr();
    var IndustryPercentArr = [];
    for (var i = 0; i < IndustryTotalArr.length; i++) {
        totalVal = totalVal + IndustryTotalArr[i];
    }
    for (var j = 0; j < IndustryTotalArr.length; j++) {
        IndustryPercentArr.push((IndustryTotalArr[j] / totalVal).toFixed(5));
    }
    return IndustryPercentArr;
}

function getIndustryTotalArr() {
    var powerVal = steelVal = chemicalVal = cementVal = medicineVal = machineVal = otherVal = 0;
    var industryTotalArr;
    for (var i = 0; i < companyMonthData.length; i++) {
        switch (companyMonthData[i]["行业"]) {  //"电厂", "钢铁", "化工", "水泥", "医药", "机械", "其他"
            case "电厂":
                //if (companyMonthData[i]["企业名称"] == "哈尔滨热电") {
                //    continue;
                //}
                powerVal = powerVal + parseFloat(companyMonthData[i]["排放总量"]);
                break;
            case "钢铁":
                steelVal = steelVal + parseFloat(companyMonthData[i]["排放总量"]);
                break;
            case "化工":
                chemicalVal = chemicalVal + parseFloat(companyMonthData[i]["排放总量"]);
                break;
            case "水泥":
                cementVal = cementVal + parseFloat(companyMonthData[i]["排放总量"]);
                break;
            case "医药":
                medicineVal = medicineVal + parseFloat(companyMonthData[i]["排放总量"]);
                break;
            case "机械":
                machineVal = machineVal + parseFloat(companyMonthData[i]["排放总量"]);
                break;
            case "其他":
                otherVal = otherVal + parseFloat(companyMonthData[i]["排放总量"]);
                break;
        }
    }
    industryTotalArr = [Math.ceil(powerVal), Math.ceil(steelVal), Math.ceil(chemicalVal), Math.ceil(cementVal), Math.ceil(medicineVal), Math.ceil(machineVal), Math.ceil(otherVal)];
    return industryTotalArr;
}

function sortIndustryTotalValue() {
    var industryArr = [];
    for (var i = 0; i < companyMonthData.length; i++) {
        industryArr.push({ "企业名称": companyMonthData[i]["企业名称"], "排放总量": parseFloat((companyMonthData[i]["排放总量"] / 100000000).toFixed(2)) });
    }
    var arr = industryArr.sort(function (a, b) {
        return a["排放总量"] < b["排放总量"] ? 1 : -1;
    });
    //var arr2 = arr.slice(1, arr.length);
    return arr;
}


function getPosOneMonthData(month) {
    var arr1 = [], arr2 = [];
    for (var i = 0; i < posMonthData.length; i++) {
        arr1.push({ "站点名称": posMonthData[i]["站点名称"], "全年浓度数据": posMonthData[i]["月数据"] });
    }
    for (var j = 0; j < arr1.length; j++) {
        arr2.push({ "站点名称": arr1[j]["站点名称"], })
    }
}


function MarkWaterMarkers() {
    for (var i = 0; i < waterMinitor.length; i++) {
        var lat = waterMinitor[i]["纬度"];
        var lng = waterMinitor[i]["经度"]
        var iconUrl = getWaterMarkIcon(waterMinitor[i]["本周水质"]);
        var opt = {};
        if (iconUrl != null) {
            opt.icon = new BMap.Icon(iconUrl, new BMap.Size(16, 16));
        }
        var mk = new BMap.Marker(new BMap.Point(lng, lat), opt);
        var label;
        //if (waterMinitor[i]["站点名称"] == "大顶子山断面") {
        //    label = new BMap.Label(waterMinitor[i]["站点名称"], { "offset": new BMap.Size(-76, -8) });
        //}
        //else if (waterMinitor[i]["站点名称"] == "牡丹江口上断面") {
        //    label = new BMap.Label(waterMinitor[i]["站点名称"], { "offset": new BMap.Size(-90, 0) });
        //}
        //else {
        label = new BMap.Label(waterMinitor[i]["站点名称"], { "offset": new BMap.Size(10, -20) });
        //}       
        label.setStyle({ "border": "none", color: "red", fontSize: "12px", "width": "200px", "font-weight": "600", "background-color": "transparent" });
        label.setContent(createLabel(waterMinitor[i]["站点名称"]));
        mk.setLabel(label);
        mk.setTitle(waterMinitor[i]["站点名称"]);
        map.addOverlay(mk);
    }

    for (var i = 0; i < drainage.length; i++) {
        if (drainage[i]["简称"] != undefined) {
            var lat = parseFloat(drainage[i]["中心经度"]);
            var lng = parseFloat(drainage[i]["中心纬度"]);
            var cod = parseFloat(drainage[i]["COD总量（Kg）"]);
            var nh3 = parseFloat(drainage[i]["NH3-N总量(Kg）"]);
            var totalVal = cod + nh3;
            var icon = getWaterMarkIconForEnterprise(totalVal);
            var opt = {};
            if (icon != null) {
                //opt.icon = new BMap.Icon(icon, new BMap.Size(16, 16));
                opt.icon = icon;
            }
            var mk = new BMap.Marker(new BMap.Point(lat, lng), opt);
            mk.setTitle(drainage[i]["简称"]);
            var label;
            //if (drainage[i]["简称"] == "利林污水厂") {
            //    label = new BMap.Label(drainage[i]["简称"], { "offset": new BMap.Size(-67, 0) });
            //}
            //else 
            if (drainage[i]["简称"] == "文昌污水厂") {
                label = new BMap.Label(drainage[i]["简称"], { "offset": new BMap.Size(icon.size.width * 0.5, -30) });
            }
            else {
                label = new BMap.Label(drainage[i]["简称"], { "offset": new BMap.Size(icon.size.width * 0.5, -20) });
            }
            label.setContent(createLabel(drainage[i]["简称"]));
            label.setStyle({ "border": "none", color: "blue", fontSize: "12px", "width": "200px", "font-weight": "600", "background-color": "transparent" });
            mk.setLabel(label);
            map.addOverlay(mk);
        }
    }
}

function getWaterMarkIcon(quality) {
    switch (quality) {
        case "I":
        case "II":
            return "img/w01.png";
        case "III":
            return "img/w02.png";
        case "IV":
            return "img/w03.png";
        case "V":
            return "img/w04.png";
        case "劣V":
            return "img/w05.png";
        default:
            return "img/w01.png";
    }
}



function getWaterMarkIconForEnterprise(val) {
    var iconUrl;
    var size;
    if (val <= 15) {
        iconUrl = "img/c1_16.png";
        size = 16;
    } else if (val <= 25) {
        iconUrl = "img/c2_24.png";
        size = 24;
    } else if (val <= 35) {
        iconUrl = "img/c3_32.png";
        size = 32;
    } else {
        iconUrl = "img/c4_40.png";
        size = 40;
    }
    var icon = new BMap.Icon(iconUrl, new BMap.Size(size, size));
    return icon;

}

function DrawRiver(mp) {
    //var r1 = "127.130398,44.852412;127.105102,44.87531;127.086705,44.90637;127.093604,44.929246;127.095903,44.945581;127.084405,44.966808;127.068308,44.991292;127.047611,45.015765;127.022314,45.033706;127.003917,45.059791;126.98552,45.076088;126.976321,45.102153;126.978621,45.123322;126.971722,45.142856;126.948725,45.139601;126.918829,45.147739;126.884335,45.149366;126.859038,45.147739;126.833742,45.142856;126.803846,45.149366;126.790048,45.172145;126.762452,45.185157;126.734857,45.185157;126.70956,45.198166;126.663567,45.203044;126.652069,45.22255;126.624473,45.240425;126.592277,45.253421;126.560082,45.253421;126.539385,45.246924;126.500291,45.246924;126.463496,45.246924;126.426702,45.246924;126.445099,45.232301;126.403705,45.233926;126.380709,45.217674;126.362311,45.199792;126.337015,45.198166;126.311719,45.185157;126.291022,45.180278;126.279523,45.167264;126.256527,45.16401;126.23353,45.152621;126.196736,45.160757;126.16914,45.150993;126.123146,45.154248;126.090951,45.165637;126.061056,45.177024;126.03116,45.177024;125.996665,45.181904;125.973668,45.190036;125.934574,45.206295;125.89548,45.224175;125.863285,45.2388;125.831089,45.250173;125.812692,45.27291;125.782796,45.295639;125.743702,45.316736;125.725305,45.341069;125.709207,45.357285;125.709207,45.3816;125.718406,45.407525;125.713807,45.435057;125.713807,45.460957;125.716106,45.485227;125.699103,45.508901";
    //var r2 = "125.699103,45.508901;125.720706,45.525655;125.743702,45.533737;125.768998,45.533737;125.791995,45.525655;125.82649,45.524038;125.858685,45.524038;125.886281,45.541818;125.906978,45.569283;125.925375,45.585434;125.936874,45.614492;125.941473,45.638696;125.95987,45.640309;125.985167,45.638696;125.998965,45.661277;125.996665,45.683848;126.015062,45.693519;126.026561,45.716077;126.063355,45.72091;126.086352,45.701576;126.118547,45.69513;126.136944,45.683848;126.162241,45.699965;126.182938,45.711244;126.199035,45.698354;126.231231,45.70641;126.261126,45.711244;126.286422,45.714466;126.314018,45.714466;126.339315,45.722521;126.364611,45.716077;126.387608,45.719299;126.389907,45.745068;126.417503,45.743457;126.4382,45.748288;126.463496,45.751508;126.489448,45.754391;126.499429,45.754225;126.510352,45.754627;126.514951,45.758249;126.512077,45.765493;126.514376,45.775149;126.523,45.779574;126.531624,45.779977;126.537948,45.777563;126.541397,45.773137;126.549446,45.767102;126.557495,45.764688;126.566694,45.764688;126.587391,45.764285;126.593715,45.768712;126.598889,45.775551;126.609812,45.784402;126.620736,45.789631;126.632809,45.794055;126.661555,45.805717;126.674203,45.808934;126.683976,45.811748;126.69605,45.816572;126.705823,45.823004;126.715022,45.831043;126.720771,45.842296;126.720771,45.851537;126.720196,45.862384;126.712147,45.876039;126.706973,45.8921;126.716172,45.898925;126.728245,45.904544;126.744918,45.908558;126.763315,45.91217;126.773663,45.921801;126.785737,45.92461;126.796085,45.929023;126.805859,45.932233;126.820231,45.939052;126.825406,45.947475;126.835179,45.951486;126.844953,45.959506;126.858176,45.968728;126.868524,45.975943;126.871399,45.983158;126.882897,45.989571;126.89727,45.994781;126.904744,45.999188;126.916817,45.99999;126.927741,46.000791;126.940964,46.006;126.944413,46.017216;126.946713,46.025627;126.952462,46.030834;126.967985,46.032435;126.980058,46.033236;126.994431,46.035239;127.008229,46.03684;127.026626,46.039243;127.040424,46.041645;127.059971,46.042846;127.069745,46.040844;127.078369,46.036039;127.096766,46.028431;127.107114,46.024426;127.118613,46.02002;127.132411,46.014412;127.147358,46.007202;127.158282,46.001192;127.170355,45.993979;127.183003,45.991575;127.196801,45.989972;127.206575,45.988369;127.220668,45.987105";
    //var r3 = "126.489448,45.754391;126.499429,45.754225;126.510352,45.754627;126.514951,45.758249;126.512077,45.765493;126.514376,45.775149;126.523,45.779574;126.531624,45.779977;126.537948,45.777563;126.541397,45.773137;126.549446,45.767102;126.557495,45.764688;126.566694,45.764688;126.587391,45.764285;126.593715,45.768712;126.598889,45.775551;126.609812,45.784402;126.620736,45.789631;126.632809,45.794055;126.661555,45.805717;126.674203,45.808934;126.683976,45.811748;126.69605,45.816572;126.705823,45.823004;126.715022,45.831043;126.720771,45.842296;126.720771,45.851537;126.720196,45.862384;126.712147,45.876039;126.706973,45.8921;126.716172,45.898925;126.728245,45.904544;126.744918,45.908558;126.763315,45.91217;126.773663,45.921801;126.785737,45.92461;126.796085,45.929023;126.805859,45.932233;126.820231,45.939052;126.825406,45.947475;126.835179,45.951486;126.844953,45.959506;126.858176,45.968728;126.868524,45.975943;126.871399,45.983158;126.882897,45.989571;126.89727,45.994781;126.904744,45.999188;126.916817,45.99999;126.927741,46.000791;126.940964,46.006;126.944413,46.017216;126.946713,46.025627;126.952462,46.030834;126.967985,46.032435;126.980058,46.033236;126.994431,46.035239;127.008229,46.03684;127.026626,46.039243;127.040424,46.041645;127.059971,46.042846;127.069745,46.040844;127.078369,46.036039;127.096766,46.028431;127.107114,46.024426;127.118613,46.02002;127.132411,46.014412;127.147358,46.007202;127.158282,46.001192;127.170355,45.993979;127.183003,45.991575;127.196801,45.989972;127.206575,45.988369;127.220668,45.987105";
    var r1 = "125.699103,45.508901;125.699721,45.517066;125.70662,45.520704;125.715819,45.521916;125.725017,45.523937;125.733641,45.525554;125.74054,45.527978;125.749739,45.530403;125.760087,45.532423;125.772735,45.530403;125.779059,45.525554;125.785384,45.521916;125.791133,45.515854;125.803206,45.517875;125.814129,45.519896;125.829652,45.523129;125.8423,45.527574;125.853224,45.524745;125.862422,45.526362;125.876795,45.534848;125.885419,45.541313;125.895192,45.54818;125.900942,45.555451;125.904966,45.564337;125.913015,45.572413;125.922788,45.580084;125.933712,45.580892;125.940611,45.573624;125.951534,45.570798;125.964757,45.575643;125.978555,45.57322;125.987179,45.575643;125.983154,45.584929;125.975681,45.593406;125.970506,45.6039;125.975681,45.611567;125.984304,45.614391;125.991778,45.617215;126.001552,45.620847;126.01075,45.629721;126.018799,45.634562;126.030298,45.633352;126.038921,45.632142;126.051569,45.632142;126.055594,45.638192;126.063643,45.641821;126.072841,45.645451;126.08319,45.653919;126.085489,45.662385;126.086064,45.671657;126.088364,45.68012;126.096988,45.682135;126.108486,45.681732;126.122859,45.682538;126.136657,45.681732;126.147005,45.681329;126.156779,45.689792;126.164253,45.704296;126.174601,45.707115;126.1861,45.699864;126.197023,45.69503;126.214845,45.699059;126.228643,45.703893;126.244741,45.707115;126.261414,45.707921;126.275212,45.708727;126.286135,45.70631;126.297633,45.705101;126.312006,45.703893;126.323504,45.707115;126.338452,45.713157;126.3511,45.712755;126.359149,45.712352;126.367773,45.707921;126.374672,45.707921;126.380996,45.710338;126.381571,45.721615;126.379271,45.728058;126.382146,45.7345;126.392494,45.737318;126.406292,45.742149;126.41894,45.743357;126.433888,45.744967;126.444237,45.746577;126.451136,45.744967;126.464359,45.748187;126.471833,45.752615;126.478732,45.755432;126.489448,45.754391;126.502303,45.755029;126.514376,45.757847;126.512077,45.768309;126.517826,45.777161;126.528174,45.780781;126.537373,45.777965;126.547147,45.768712;126.582216,45.771528;126.601764,45.781184;126.614987,45.790033;126.631084,45.795261;126.637983,45.805315;126.648332,45.814964;126.667304,45.820994;126.688001,45.823808;126.714447,45.83466;126.721346,45.848725;126.718471,45.866802;126.708123,45.883669;126.714447,45.901735;126.73112,45.908558;126.745492,45.909361;126.76389,45.913775;126.774238,45.920998;126.784587,45.925412;126.797235,45.929825;126.810458,45.93464;126.818507,45.943464;126.824831,45.949079;126.836329,45.956699;126.846678,45.963916;126.857601,45.968327;126.868524,45.976344;126.878298,45.987166;126.888646,45.993979;126.913943,46.001993;126.929465,46.003996;126.942688,46.007602;126.946713,46.025627;126.966835,46.030834;126.986382,46.034838;127.026051,46.038842";
    var point1ColorStr = "125.697996,45.50878;125.697924,45.509487;125.698428,45.509942;125.699146,45.509993;125.699793,45.50974;125.70008,45.509083;125.700009,45.508426;125.69929,45.508123;125.698499,45.508022";

    var pointsArr1 = []; ar1 = r1.split(';');
    //var Lastlat1 = ar1[ar1.length].split(',')[0];
    ar1.forEach(function (value, index, arr) {
        var ar2 = value.split(',');
        pointsArr1.push(new BMap.Point(parseFloat(ar2[0]), parseFloat(ar2[1])));
    });
    var polyline1 = new BMap.Polyline(pointsArr1, { strokeColor: "blue", strokeWeight: 6 });
    map.addOverlay(polyline1);
}


