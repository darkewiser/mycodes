var keyWord = function () {
    var positionList, container, first,handlerUrl,blocks = [], dealerfunc;
    var config = {
        unit: 50
        , border: 2
        , padding: 5
    }

    var ctrlWrapper = function (attributes) {
        this.renderReady = true;
        this.dom = document.createElement("DIV");
        this.applyTarget(attributes);
    }


    ctrlWrapper.prototype.applyTarget = function (block) {
        for (var i in block) {
            this[i] = block[i];
        }
        return this;
    }

    ctrlWrapper.prototype.init = function (dx, dy, dw, dh) {
        this.left = dx != undefined ? dx : this.x ? this.x : 0;
        this.top = dy != undefined ? dy : this.y ? this.y : 0;
        this.width = dw != undefined ? dw : this.w ? this.w : 1;
        this.height = dh != undefined ? dh : this.h ? this.h : 1;
    }

    ctrlWrapper.prototype.render = function () {
        this.setLeftTop(this.left, this.top);
        this.setWH(this.width, this.height);
        this.dom.style.backgroundColor = this.c;
        this.dom.innerHTML = this.t;
        if (this.tc) {
            this.dom.style.color = this.tc;
        }
        this.dom.title = this.title;
        var _value=Math.min(this.width,this.height);
        this.dom.style.fontSize = (this.size == "small" ? _value * 0.3 : this.size == "middle" ? _value * 0.4 : _value * 0.6) + "px";
    }

    ctrlWrapper.prototype.setLeftTop = function (left, top) {
        this.dom.style.left = left + "px";
        this.dom.style.top = top + "px";
    }

    ctrlWrapper.prototype.setWH = function (w, h) {
        this.dom.style.padding = config.padding + "px";
        this.dom.style.width = w - config.padding * 2 + "px";
        this.dom.style.height = h - config.padding * 2 + "px";
    }

    ctrlWrapper.prototype.appendTo = function (parent) {
        parent.appendChild(this.dom);
    }
    
    ctrlWrapper.prototype.removeDom = function () {
        this.dom.parentNode.removeChild(this.dom);
    }


    return {
        init: function (id) {
            container = document.getElementById(id);
            return this;
        }
        , applyURL: function (url) {
            handlerUrl =window.location.href.slice(0,window.location.href.lastIndexOf("/"))+url
            return this;
        }
        , applySingleBlock: function (left, top, w, h, color, text, tc, title) {
            if (!positionList) {
                positionList = {
                    0: { x: left, y: top, w: w, h: h, c: color, t: text ? text : "", tc:tc,title:title }
                    , len: 1
                };
            }
            else {
                positionList[positionList.len] = { x: left, y: top, w: w, h: h, c: color, t: text ? text : "", tc: tc ,title:title};
                positionList.len++;
            }
            return this;
        }
        , applyBlocks: function (blockList) {
            var xmlhttp = null;
            var that = this;
            if (window.XMLHttpRequest) {// code for Firefox, Opera, IE7, etc.
                xmlhttp = new XMLHttpRequest();
            }
            else if (window.ActiveXObject) {// code for IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            if (xmlhttp != null) {
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {// 4 = "loaded"
                        if (xmlhttp.status == 200) {// 200 = "OK"
                            var _list = eval(xmlhttp.responseText);
                            for (var i = 0, ci; ci = blockList[i]; i++) {
                                that.applySingleBlock(ci.x, ci.y, ci.w, ci.h, ci.c, _list[i].Word_name, ci.tc, _list[i].Word_count);
                            }
                            that.set();
                        }
                        else {
                            alert("Problem retrieving data:" + xmlhttp.statusText);
                        }
                    }
                };
                xmlhttp.open("GET", handlerUrl, true);
                xmlhttp.send(null);
            }
            else {
                alert("Your browser does not support XMLHTTP.");
            }
            return this;
        }
        , set: function () {
            if (!positionList || !container) { return; }
            for (var i in positionList) {
                if (!isNaN(i)) {
                    var _item = positionList[i];
                    var _border = config.border;
                    var _unit = config.unit;
                    var dx = _item.x * _unit + (_item.x + 1) * _border;
                    var dy = _item.y * _unit + (_item.y + 1) * _border;
                    var dw = _item.w * _unit + (_item.w - 1) * _border;
                    var dh = _item.h * _unit + (_item.h - 1) * _border;
                    var _temp = new ctrlWrapper({ x: dx, y: dy, w: dw, h: dh, c: _item.c, t: _item.t, tc: _item.tc, title: _item.title });
                    if (_item.w > 2 || _item.h > 2 ) {
                        _temp.size = "big";
                    }
                    else if (_item.w > 1 || _item.h > 1 || (_item.w == 2 && _item.h == 2)) {
                        _temp.size = "middle";
                    }
                    else {
                        _temp.size = "small";
                    }
                    
                    _temp.init();
                    _temp.appendTo(container);
                    blocks.push(_temp);
                }
            }

            if (dealerfunc) {
                dealerfunc();
            }
        }
        , applyDealer: function (func) {
            dealerfunc = func;
            return this;
        }
        , getBlocks: function () {
            return blocks;
        }
        , getContainer: function () {
            return container;
        }
    }
}();