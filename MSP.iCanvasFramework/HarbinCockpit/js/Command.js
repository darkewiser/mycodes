var map, mapMinWidth = 300, mapMinHeight = 600;


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

    resizeMap();
    setTimeout(function () {
        resizeMap();
        resizeCharts();
    }, 100);
    map.addEventListener("click", function (ev) {

    });


    window.addEventListener("resize", function (ev) {
        resizeMap();
        resizeCharts();
    }, false);


    setTimeout(function () {
        center = new BMap.Point(126.657217, 45.731399);
        map.centerAndZoom(center, 12);
        MarkMarkers();
    }, 100);
}

$(function () {
    //$("#rightTabZone").tabs();
    $("#leftTabZone").tabs();
    showDataChart();
});

document.body.onload = function () {
    initialize();
    $("#pfqdTemplate").tmpl(comList).appendTo("#pfqdTable");
    $("#cbgjTemplate").tmpl(alarmData).appendTo("#cbgjTable");


}

function resizeMap() {

    var h1 = window.innerHeight;
    var h2 = document.body.scrollHeight;

    var w1 = window.innerWidth;
    var w2 = document.body.scrollWidth;;

    var mapControl = $("#map-canvas");
    var lowerChartControl = $("#lowercharZone");

    var fullWidth = w2 > w1 ? Math.max(window.innerWidth, document.body.scrollWidth) : (h2 > h1 ? Math.min(window.innerWidth, document.body.scrollWidth) : Math.max(window.innerWidth, document.body.scrollWidth));
    var width = fullWidth - $(".leftZone").width() - $(".rightZone").width();
    var fullHeight = Math.max(h1, h2);

    var height = fullHeight - lowerChartControl.outerHeight();
    mapControl.width(width);
    mapControl.height(height);
    lowerChartControl.css("top", height);
}

function resizeCharts() {
    var width = $("#map-canvas").width();
    var w = Math.floor(width / 3);
    showDataChart(w);
}

function showDataChart(width, height) {
    var h = typeof height == "undefined" ? 260 : height;
    var w = typeof width == "undefined" ? 264 : width;

    var allCityArr = [], posArr = [], posValArr = [], so2Arr = [], noxArr = [], grainArr = [], timeArr = [];
    pm25Data.forEach(function (v1, ind1, arr1) {
        timeArr.push(v1["时间"]);
        allCityArr.push(parseFloat(parseFloat(v1["浓度(ug/m³)"]).toFixed(2)));
    });
    posData.forEach(function (v2, ind2, arr2) {
        posArr.push(v2["监测点"]);
        posValArr.push(parseFloat(parseFloat(v2["浓度(ug/m³)"]).toFixed(2)));
    });
    so2Data.forEach(function (v3, ind3, arr3) {
        so2Arr.push(parseFloat(parseFloat(v3["排放总量"] / 1000).toFixed(2)));
    });
    noxData.forEach(function (v4, ind4, arr4) {
        noxArr.push(parseFloat(parseFloat(v4["排放量"] / 1000).toFixed(2)));
    });
    klData.forEach(function (v5, ind5, arr5) {
        grainArr.push(parseFloat(parseFloat(v5["排放量"] / 1000).toFixed(2)));
    });
    getHighCharts("allCityDataChart", "line", timeArr, allCityArr, "全市PM2.5浓度曲线", "PM2.5浓度(ug/m³)");
    getHighCharts("posDataChart", "column", posArr, posValArr, "各监测点位浓度对比", "PM2.5浓度(ug/m³)");
    getHighCharts("so2TotalChart", "line", timeArr, so2Arr, "SO2总量", "SO2排放量(kg)", w);
    getHighCharts("noxTotalChart", "line", timeArr, noxArr, "NOx总量", "NOx排放量(kg)", w);
    getHighCharts("grainTotalChart", "line", timeArr, grainArr, "颗粒物总量", "颗粒物排放量(kg)", w);
}


function getHighCharts(id, type, cat, dataArr, title, sName, width, height) {
    var h = typeof height == "undefined" ? 260 : height;
    var w = typeof width == "undefined" ? 264 : width;
    $("#" + id).highcharts({
        chart: {
            type: type,
            height: h,
            width: w,
            marginRight: 14
        },
        exporting: {
            enabled: false
        },
        title: {
            text: title,
            style: { "font-size": "13px", "color": "#274b6d", "font-family": "Microsoft YaHei" }
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
            //max: maxVal,
            title: {
                text: null
            },
            labels: { style: { "font-size": "11px", "color": "#555", "font-family": "Arial" } },
            gridLineColor: "#c8c8c8",
            lineColor: "#8ec657",
            //plotbands: [{
            //    color: '#274b6d',
            //    width: 1.2,
            //    value: 0.25,
            //    label: {
            //        text: '0.25',
            //        align: 'left',
            //        x: -28,
            //        y: 4,
            //        style: { "font-size": "11px", "color": "#555", "font-family": "arial" },
            //    }
            //}]
        },
        legend: {
            enabled: false
        },
        series: [{
            name: sName,
            color: "#8ec657",
            data: dataArr
        }]
    })
}

function MarkMarkers() {
    for (var i = 0; i < posList.length; i++) {
        if (posList[i]["站点名称"] != undefined) {
            var lat = parseFloat(posList[i]["经度"]);
            var lng = parseFloat(posList[i]["纬度"]);
            var iconUrl = getMarkIcon(posList[i].AQI);
            var opt = {};
            if (iconUrl != null) {
                opt.icon = new BMap.Icon(iconUrl, new BMap.Size(16, 16));
            }
            var mk = new BMap.Marker(new BMap.Point(lat, lng), opt);
            var label = new BMap.Label(posList[i]["站点名称"], { "offset": new BMap.Size(10, -20) });
            label.setContent(createLabel(posList[i]["站点名称"]));
            label.setStyle({ "border": "none", "width": "200px", color: "red", fontSize: "12px", "font-weight": "600", "background-color": "transparent" });
            mk.setLabel(label);
            mk.setTitle(posList[i]["站点名称"]);
            map.addOverlay(mk);
            mk.addEventListener('click', function (ev) {

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

function createLabel(text, pos) {
    return '<div>' +
          '<div style="background-image: url(img/button_Left.png); height: 28px; width: 18px; background-repeat: no-repeat; float: left"></div>' +
          '<div style="background-image: url(img/button_Line.png); float: left; height: 28px; padding-top:3px; background-repeat:repeat-x">' + text + '</div>' +
           '<div style="background-image: url(img/button_Right.png); height: 28px; width: 18px; background-repeat: no-repeat; float: left"></div>' +
      '</div>'
}