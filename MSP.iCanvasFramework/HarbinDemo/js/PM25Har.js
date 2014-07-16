var map,
    cities = new Object(),
    stations = new Object(),
    pmData, pmRanking,
    messageBoxHeight = 300,
    messageBoxMinHeight = 300,
    messageBoxWidth = 315,
    infoWindow = new BMap.InfoWindow("", { enableMessage: false, width: messageBoxWidth, height: messageBoxHeight }),
    serviceURL = "/x.h";


function initialize() {
    map = new BMap.Map("map-canvas");
    var center = new BMap.Point(126.657217, 45.731399);
    map.centerAndZoom(center, 12);
    map.addControl(new BMap.NavigationControl());
    map.addControl(new BMap.ScaleControl());
    map.addControl(new BMap.OverviewMapControl());
    map.addControl(new BMap.MapTypeControl());
    map.enableScrollWheelZoom();

    //map.addEventListener("tilesloaded", function () {
    //    if (!isRunFunc) {
    //        getAllPMValues();
    //    }
    //});
    map.addEventListener("click", function (event) {
        infoWindow.close();
        hideNewsBox();
    });
    infoWindow.addEventListener("close", function (type, target, point) {
        hideNewsBox();
    });

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
});

function hideNewsBox() {
    $("#newscontent").hide();
}

function getAllPMValues() {
    getDataFromHandler(serviceURL + "?timeUnit=map", null, function (data) {
        if (typeof data == "undefined") {
            return;
        }
        console.log("get data!");
        pmData = data;
        setTimeout(function () {
            MarkMarkers();
            setDefaultPostion(pmData[7]);
        }, 2000);
    }, function (XMLHttpRequest, textStatus, errorThrown) {
        console.log(errorThrown);
    });
}

var positionsWithLatLog = new Array();
var citiesNoWithLatLog = new Array();
function MarkMarkers() {
    for (var i = 0; i < pmData.length; i++) {
        if (pmData[i].Area != undefined) {
            var lat = parseFloat(pmData[i].Lat);
            var lng = parseFloat(pmData[i].lng);
            var iconUrl = getMarkIcon(pmData[i].Quality);
            var opt = {};
            if (iconUrl != null) {
                opt.icon = new BMap.Icon(iconUrl, new BMap.Size(16, 16));
            }
            var mk = new BMap.Marker(new BMap.Point(lng, lat), opt);
            mk.setTitle(pmData[i].Position_name);
            map.addOverlay(mk);
            mk.addEventListener('mouseover', function (event) {
                var that = this;
                var positionName = that.getTitle();
                hideNewsBox();
                //PM2.5
                var pmObject = getPMInfoByPositionName(this.getTitle());
                var contentString = getPMHTMLString(pmObject);
                infoWindow.setContent(contentString);
                this.openInfoWindow(infoWindow);
            });
            positionsWithLatLog.push(mk);
        } else {
            citiesNoWithLatLog.push(pmData[i]);
        }
    }
}

function getPMHTMLString(pmObject) {
    var contentArr = new Array();
    var fontColor = getFontColor(pmObject.PM.quality);
    contentArr.push('<div class="contentZone">');
    contentArr.push('<table>' +
                        '<tr>' +
                            '<td>' +
                                '<div style="width: 300px;">' +
                                    '<div class="info" id="simple">' +
                                        '<div class="quality" style="color:' + fontColor + '">' + pmObject.PM.Quality + '</div>' +
                                        '<div id="swLeft">' +
                                            '<img class="switchIconLeft" style="display: none;" src="' + getDetailsIcon(pmObject.PM.Quality) + '" onclick="switchToDetails()" />' +
                                        '</div><br>' +
                                        '<div class="level">空气质量： ' + getQualityLevel(pmObject.PM.Quality) + '</div><br>' +
                                        '<div class="area">' + pmObject.PM.Area + '</div>' +
                                        '<div class="pm25">PM2.5:  <span style="color:' + fontColor + '">' + pmObject.PM.Aqi + '</span>' +
                                        '</div>' +
                                    '</div>');
    contentArr.push('<div class="info" id="details" style="display: block" >' +
                        '<div class="detailData">' +
                            '<table width="100%">' +
                                '<tr>' +
                                    '<td>监测站点：<span>' + pmObject.PM.Position_name + '</span></td>' +
                                    '<td>一氧化碳：<span>' + pmObject.PM.Co_24h + '</span></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>排名：<span>' + (pmObject.index + 1).toString() + '</span></td>' +
                                    '<td>二氧化氮：<span>' + pmObject.PM.No2 + '</span></td>' +
                                 '</tr>' +
                                '<tr>' +
                                    '<td>空气质量指数：<span>' + pmObject.PM.Aqi + '</span></td>' +
                                    '<td>臭氧：<span>' + pmObject.PM.O3 + '</span></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>空气质量：<span>' + pmObject.PM.Quality + '</span></td>' +
                                    '<td>臭氧8小时平均：<span>' + pmObject.PM.O3_8h + '</span></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>PM2.5：<span>' + pmObject.PM.Pm2_5 + '</span></td>' +
                                    '<td>二氧化硫：<span>' + pmObject.PM.So2 + '</span></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td>PM10：<span>' + pmObject.PM.Pm10 + '</span></td>' +
                                    '<td>&nbsp;</td>' +
                                '</tr>' +
                            '</table>' +
                        '</div>' +
                        '<div id="swRight">' +
                           '<img class="switchIconRight" style="display: none;"  src="' + getBackToSummaryIcon(pmObject.PM.Quality) + '" onclick="switchToSimple()"/>' +
                        '</div>' +
                    '</div>');
    return contentArr.join("");
}

function getLevelColor() {
    return $(".quality").css("color");
}

function getQualityLevel(quality) {
    switch (quality) {
        case "优":
            return "一级";
        case "良":
            return "二级";
        case "轻度污染":
            return "三级";
        case "中度污染":
            return "四级";
        case "重度污染":
            return "五级";
        case "严重污染":
            return "六级";
        default:
            return null;
    }
}

function getDetailsIcon(quality) {
    switch (quality) {
        case "优":
            return "img/green_ri.png";
        case "良":
            return "img/yellow_ri.png";
        case "轻度污染":
            return "img/orange_ri.png";
        case "中度污染":
            return "img/red_ri.png";
        case "重度污染":
            return "img/purple_ri.png";
        case "严重污染":
            return "img/gray_ri.png";
        default:
            return "";
    }
}

function getBackToSummaryIcon(quality) {
    switch (quality) {
        case "优":
            return "img/green_le.png";
        case "良":
            return "img/yellow_le.png";
        case "轻度污染":
            return "img/orange_le.png";
        case "中度污染":
            return "img/red_le.png";
        case "重度污染":
            return "img/purple_le.png";
        case "严重污染":
            return "img/gray_le.png";
        default:
            return "";
    }
}
function getMarkIcon(quality) {
    switch (quality) {
        case "优":
            return "img/green_point.png";
        case "良":
            return "img/yellow_point.png";
        case "轻度污染":
            return "img/orange_point.png";
        case "中度污染":
            return "img/red_point.png";
        case "重度污染":
            return "img/purple_point.png";
        case "严重污染":
            return "img/gray_point.png";
        default:
            return "";
    }
}


function getFontColor(quality) {
    switch (quality) {
        case "优":
            return "#90cc77";
        case "良":
            return "#ebd801";
        case "轻度污染":
            return "#fdad21";
        case "中度污染":
            return "#e95d5a";
        case "重度污染":
            return "#b37cb6";
        case "严重污染":
            return "#956667";
        default:
            return "#90cc77";
    }
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






