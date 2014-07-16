/// <reference path="../framework/iCanvas_v1_1_1.js" />
/// <reference path="heartbeatLine.js" />
/// <reference path="jquery-2.0.3.js" />

window.onload = function () {
    var nCount = 13, aData = [], dObjDate = new Date(), dCurTime = dObjDate.getTime();
    dObjDate.setMinutes(0);
    dObjDate.setSeconds(0);

    var $$ = function (id) { return document.getElementById(id); }
    var ePopup = $$("popup");
    var ePopup_content = $$("content");
    var eCvs_c1 = $$("c1");
    var eCvs_c2 = $$("c2");
    // var eCvs_c3 = $$("c3");
    var arrow = $$("arrow");
    ePopup.onmouseleave = function () {
        this.style.display = "none";
    }

    $.ajax({
        url: "./js/getData.h",
        data: { timeunit: "hour", linecount: 2, pointcount: nCount, dataformat: "line" },
        type: "get",
        dataType: "json",
        async: true,
        error: function (r,text,errorThrown) {
            alert(r.status);
            alert(text + "milo" + errorThrown);
        },
        success: function (data) {
            var heartbeat1 = heartbeatLineChart({
                cvsId: "c1",
                width: 785,
                height: 350,
                data: data,
                pointCount: nCount,
                lineWidth: 4,
                pointRadius: 7,
                axisLinePosition: [80, 100, 120, 140, 160, 180, 200],
                axisRange: [0, 200],
                originalValue: 0,
                lineColor: ["#F48029", "#00B294"],
                pointColor: ["#F48029", "#00B294"],
                pointFontColor: ["#F48029", "#00B294"],
                displayTooltip: true,
                displayPointText: true
            });
            heartbeat1.onPointClick(function (point, coord) {
                var _offsetLeft = parseInt(eCvs_c1.offsetLeft, 10);
                var _offsetTop = parseInt(eCvs_c1.offsetTop, 10);
                // if ((parseInt(point.text, 10) > 300 && point.pointTag == "0") || (parseInt(point.text, 10) > 90 && point.pointTag == "1")) {
                if (point.pointTag.tag == null) return;
                var str = ["<ul>"];
                for (var i = 0, ci; ci = point.pointTag.tag[i]; i++) {
                    str.push("<li><a target='_blank' href=" + ci.url + ">" + ci.text + "</a></li>");
                }
                str.push("</ul>")
                ePopup_content.innerHTML = str.join("");
                ePopup.style.cssText = "display:block;border-color:" + point.backColor + ";";
                var _w = parseInt(ePopup.offsetWidth, 10);
                var _h = parseInt(ePopup.offsetHeight, 10);
                var _aw = parseInt(arrow.offsetWidth, 10);
                var _ah = parseInt(arrow.offsetHeight, 10);
                var duijiao = Math.sqrt(_aw * _aw + _ah * _ah);
                ePopup.style.cssText += "left:" + (_offsetLeft + point.cx - _w - point.r - duijiao / 2) + "px;top:" + (point.cy + _offsetTop - _h / 2) + "px";
                arrow.style.cssText = "margin-top:" + (_h - duijiao) / 2 + "px;border-color:" + point.backColor + ";";
                //}
            });
            heartbeat1.addMoveCompletedHandler(function (value) {
                $$("hit").innerHTML = value[0];
            });
            heartbeat1.loadingCompletedCallBack(function (value) {
                var t = value[0];
                $$("hit").innerHTML = t[t.length - 1];
            });
            var oldTime = new Date().getHours();
            var now;
            setTimeout(function () {
                now = new Date().getHours();
                if (now >oldTime) {
                    setTimeout(function () {
                        $.ajax({
                            url: "./js/getData.h",
                            data: { timeunit: "hour", linecount: 2, pointcount: nCount, dataformat: "point", t: new Date().getTime() },
                            type: "get",
                            dataType: "json",
                            async: false,
                            success: function (data) {
                                heartbeat1.addData(data);
                                heartbeat1.activedRenderAnimation();
                            }
                        });
                    }, 300000);
                    oldTime = now;
                }
                setTimeout(arguments.callee, 3000);
            }, 3000);
        }
    });



    /*环境质量舆情指数监控图*/

    /*
    * 初始化数据
    */

    $.ajax({
        url: "./js/getData.h",
        data: { timeunit: "day", linecount: 1, pointcount: nCount, dataformat: "line" },
        type: "get",
        dataType: "json",
        async: true,
        success: function (data) {
            var heartbeat2 = heartbeatLineChart({
                cvsId: "c2",
                width: 785,
                height: 160,
                data: data,
                pointCount: nCount,
                lineWidth: 4,
                pointRadius: 7,
                axisLinePosition: [80, 100, 120],
                axisRange: [0, 120],
                originalValue: 0,
                lineColor: ["#00BCF2"],
                pointColor: ["#00BCF2"],
                pointFontColor: ["#00BCF2"],
                displayTooltip: true,
                displayPointText: true
            });
            heartbeat2.onPointClick(function (point, coord) {
                var _offsetLeft = parseInt(eCvs_c2.offsetLeft, 10);
                var _offsetTop = parseInt(eCvs_c2.offsetTop, 10);
                // if ((parseInt(point.text, 10) > 300 && point.pointTag == "0") || (parseInt(point.text, 10) > 90 && point.pointTag == "1")) {

                if (point.pointTag.tag == null) return;

                var str = ["<ul>"];
                for (var i = 0, ci; ci = point.pointTag.tag[i]; i++) {
                    str.push("<a href=" + ci.url + ">" + ci.text + "</a>");
                }
                str.push("</ul>")
                ePopup_content.innerHTML = str.join("");
                ePopup.style.cssText = "display:block;border-color:" + point.backColor + ";";
                var _w = parseInt(ePopup.offsetWidth, 10);
                var _h = parseInt(ePopup.offsetHeight, 10);
                var _aw = parseInt(arrow.offsetWidth, 10);
                var _ah = parseInt(arrow.offsetHeight, 10);
                var duijiao = Math.sqrt(_aw * _aw + _ah * _ah);
                ePopup.style.cssText += "left:" + (_offsetLeft + point.cx - _w - point.r - duijiao / 2) + "px;top:" + (point.cy + _offsetTop - _h / 2) + "px";
                arrow.style.cssText = "margin-top:" + (_h - duijiao) / 2 + "px;border-color:" + point.backColor + ";";
                //}
            });
            heartbeat2.addMoveCompletedHandler(function (value) {
                //$$("txt").innerHTML = value[0];
            });
        }
    });


}
