var ColorMap = function (map) {
    var provinces = {
        "广西":"#C8C1E3", "广东":"#FBC5DC", "湖南":"#DBEDC7", "贵州":"#E7CCAF", "云南":"#DBEDC7",
        "福建":"#FEFCBF", "江西":"#E7CCAF", "浙江":"#C8C1E3", "安徽":"#FBC5DC", "湖北":"#C8C1E3",
        "河南":"#DBECC8", "江苏":"#DBECC8", "四川":"#FCFBBB", "海南省":"#FCFBBB", "山东":"#FCFBBB", "辽宁":"#FCFBBB",
        "新疆":"#FCFBBB", "西藏":"#E7CCAF", "陕西":"#E7CCAF", "河北":"#E7CCAF", "黑龙江":"#E7CCAF", "宁夏":"#FBC5DC",
        "内蒙古自治区":"#DBEDC7", "青海":"#DBEDC7", "甘肃":"#C8C1E3", "山西":"#FBC5DC", "吉林省":"#C8C1E3",
        "北京":"#FBC5DC", "天津":"#C8C1E3", "三河市":"#E7CCAF", "上海":"#FCFBBB", "重庆市":"#FBC5DC", "香港":"#C8C1E3"
    };
   // var boundary = new BMap.Boundary();

    function setBGColorForProvinces() {
        for (var p in provinces) {
            setBGColor(p, provinces[p]);
        }
    }

    function setBGColorBatch(options) {
        for (var i = 0; i < options.length; i++) {
            setBGColor(options[i].name, options[i].color);
        }
    }

    function setBGColorWithBoundary(bgColor, points) {
        var pointArr;
        if (points instanceof Array) {
            pointArr = points;
        } else {           
            pointArr = getPointsFromString(points);
        }
        var ply = new BMap.Polygon(points, { strokeWeight: 0.1, fillColor: bgColor });
        map.addOverlay(ply);
    }

    function setBGColorWithBoundaryBatch(options) {
        for (var i = 0; i < options.length; i++) {
            setBGColorWithBoundary(options[i].bgColor, options[i].points);
        }
    }

    function getPointsFromString(pointsString) {
        var points = [];
        var bArr = pointsString.split(";");
        var lng;
        var lat;
        for (var i = 0; i < bArr.length; i++) {
            lng = bArr[i].split(",")[0];
            lat = bArr[i].split(",")[1];
            points.push(new BMap.Point(lng, lat));
        } 
        return points;
    }

    function setBGColor(name, bgColor) {
        var boundary = new BMap.Boundary();
        boundary.get(name, function (rs) {
            if (rs.boundaries.length > 0) {
                var points = getPointsFromString(rs.boundaries[0]);                
                var ply = new BMap.Polygon(points, { strokeWeight: 0.1, fillColor: bgColor });
                map.addOverlay(ply);
            } else {
                console.log(name + " not found!")
            }
        });
    }

    return {
        setBGColorForProvinces: setBGColorForProvinces,
        setBGColor: setBGColor,
        setBGColorBatch: setBGColorBatch,
        setBGColorWithBoundary: setBGColorWithBoundary,
        setBGColorWithBoundaryBatch: setBGColorWithBoundaryBatch
    };
}