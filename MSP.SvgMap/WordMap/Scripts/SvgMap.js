var SvgMap = function () {
    var self = this;
    var mapData = {};
    var container = "";
    var map;
    /*SVG map width*/
    this.mapWidth = 297;

    /*SVG map Height*/
    this.mapHeight = 297;
    this.mapParams = {
        //背景色
        backgroundColor: 'black',
        scaleColors: ['#b6d6ff', '#005ace'],
        regionStyle: {
            initial: {
                fill: "#ffffff",
                "fill-opacity": 1,
                stroke: 'none',
                "stroke-width": 0,
                "stroke-opacity": 1
            },
            hover: {
                "fill-opacity": 0.8,
                fill: "#d36165"
            },
            selected: {
                fill: 'yellow'
            },
            selectedHover: {
            }
        }
    };

    this.getMapData = function () {
        return mapData;
    }

    /*初始化地图数据*/
    this.init = function (data) {
        $.fn.vectorMap('addMap', 'china_zh', {
            "width": self.mapWidth, "height": self.mapHeight, "paths": data
        });
        mapData = data;
    };

    /*创建地图*/
    this.create = function (containerID) {
        container = containerID;
        map = new jvm.WorldMap({
            container: $('#'+containerID),
            map: 'china_zh',
            backgroundColor: self.mapParams.backgroundColor,
            regionStyle: self.mapParams.regionStyle,
            series: {
                regions: [{
                    attribute: 'fill'
                }]
            },

            onRegionLabelShow: function (e, el, code) {
                self.onRegionLabelShow(e, el, code);
            },

            onRegionOver: function (e, code) {
                self.onRegionOver(e, code);
            },
            onRegionOut: function (e, code) {
                self.onRegionOut(e, code);
            },
            onRegionClick: function (e, code) {
                self.onRegionClick(event, code);
            },

            onRegionSelected: function (e, code, isSelected, selectedRegions) {
                self.onRegionSelected(e, code, isSelected, selectedRegions);
            },

            onMarkerLabelShow: function (e, label, code) {
                self.onMarkerLabelShow(e, label, code);
            },
            onMarkerOver: function (e, code) {
                self.onMarkerOver(e, code);
            },
            onMarkerOut: function (e, code) {
                self.onMarkerOut(e, code);
            },
            onMarkerClick: function (e, code) {
                self.onMarkerClick(e, code);
            },
            onMarkerSelected: function (e, code, isSelected, selectedMarkers) {
                self.onMarkerSelected(e, code, isSelected, selectedMarkers);
            },
            onViewportChange: function (e, scale) {
                self.onViewportChange(e, scale);
            }
        });
    };

    //set region color
    this.setColor = function (code, color) {
        var colors = {};
        colors[code] = color;
        self.setColors(colors);
    }

    //set regions color
    this.setColors = function (colors) {
        map.series.regions[0].setValues(colors);
    }

    //set backgroundcolor
    this.setBackgroundColor = function (color) {
        $('#' + container).vectorMap('set', 'backgroundColor', color);
    }

    /*get map object*/
    this.getMapObject = function () {
        return map.getMapObject();
    }

    //***Marker ***//

    /*add marker*/
    this.addMarker = function (key, marker, seriesData) {
        map.addMarker(key, marker, seriesData);
    }

    /*add markers */
    this.addMarkers = function (marders, seriesData) {
        map.addMarkers(marders, seriesData);
    }

    this.clearSelectedMarkers = function () { map.clearSelectedMarkers(); }

    this.getSelectedMarkers = function () { return map.getSelectedMarkers(); }

    this.removeAllMarkers = function () { map.removeAllMarkers(); };

    this.removeMarkers = function (markers) { map.removeMarkers(markers); };

    this.setSelectedMarkers = function (keys) { map.setSelectedMarkers(keys); };

    /* Will be called right before the marker label is going to be shown.*/
    this.onMarkerLabelShow = function (e, label, code) { };

    /*Will be called on marker mouse over event.*/
    this.onMarkerOver = function (e, code) { };

    /*Will be called on marker mouse out event.*/
    this.onMarkerOut = function (e, code) { };

    /*Will be called on marker click event.*/
    this.onMarkerClick = function (e, code) { };

    /*Will be called when marker is (de)selected. 
    isSelected parameter of the callback indicates whether marker is selected or not. 
    selectedMarkers */
    this.onMarkerSelected = function (e, code, isSelected, selectedMarkers) { };

    //***Marker End***//

    //***Region***//

    /*Will be called right before the region label is going to be shown.*/
    this.onRegionLabelShow = function (event, element, code) {
        element.html(element.html());
    };

    /*Will be called on region mouse over event.*/
    this.onRegionOver = function (e, code) { };

    /*Will be called on region mouse out event.*/
    this.onRegionOut = function (e, code) { };

    /* Will be called on region click event.*/
    this.onRegionClick = function (e, code) { };

    /*Will be called when region is (de)selected. 
    isSelected parameter of the callback indicates whether region is selected or not. 
    selectedRegions contains codes of all currently selected regions*/
    this.onRegionSelected = function (e, code, isSelected, selectedRegions) { };

    this.clearSelectedRegions = function () { map.clearSelectedRegions(); };

    this.getRegionName = function (code) {
        return map.getRegionName(code);
    }

    this.getSelectedRegions = function () {
        return map.getSelectedRegions();
    }

    this.setSelectedRegions = function (keys) { map.setSelectedRegions(keys); }
    ///***Region End***///
  

    this.latLngToPoint = function (lat, lng) {
        return map.latLngToPoint(lat, lng);
    }

    this.pointToLatLng = function (x, y) {
        return map.pointToLatLng(x, y);
    }

    /* Triggered when the map's viewport is changed (map was panned or zoomed).*/
    this.onViewportChange = function (e, scale, transX, transY) { };

    this.reset = function () { map.reset(); };

    this.setFocus = function (scale, centerX, centerY) { map.setFocus(scale, centerX, centerY); };

}
