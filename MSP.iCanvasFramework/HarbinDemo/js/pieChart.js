/// <reference path="../framework/iCanvas_v1_1_1.js" />


(function () {
    var _cvsWrapper, _baseCtrl, _pieCtrl, _isInCtrl, _legend;
    _cvsWrapper = new canvasWrapper();
    _baseCtrl = _cvsWrapper.getBaseCtrlObj().constructor;
    _isInCtrl = canvasWrapper.prototype["isInCtrl"];
    _pieCtrl = function (wrapper, x, y, r, color) {
        _baseCtrl.apply(this, Array.prototype.slice.call(arguments));
        this.backColor = color;
        var that = this;
        this.r = r;
        /* circle center coordinates*/
        this.ocx = x;
        this.ocy = y;

        /*the control variable of animation, it can calculate the circle center coordinates by changing its value */
        this.dr = 0;
        this.alpha = 1;
        this.distance = 5;
        this.isRepainted = false;
        this.cx = function () {
            return Math.cos((this.endPosition + this.startPosition) * Math.PI) * this.dr + this.ocx
        };
        this.cy = function () {

            return Math.sin((this.endPosition + this.startPosition) * Math.PI) * this.dr + this.ocy
        };
        this.startPosition = 0;
        this.endPostition = 2;
        this.shadow = {
            shadowBlur: 4,
            shadowOffsetX: 4,
            shadowOffsetY: 2,
            shadowColor: "#000000"
        };
        this.lineWidth = 0;

        function _drawString(cx, cy) {
            var _tmpTextPos = {},
                _tmpBisectorAngle = (this.endPosition + this.startPosition) * Math.PI,
                _quadrant = _tmpBisectorAngle % (Math.PI * 2),
                _tsx = cx + _calculateX(this.r),
                _tsy = cy + _calculateY(this.r),
                _w = this.textWidth,
                _offsetX = 0,
                _offsetY = 0,
                _wrapper = this.wrapper,
                _fontsize = this.fontsize,
                _fontfamily = this.fontfamily,
                _fontweight = this.fontweight,
                _fontcolor = this.fontcolor,
                _lineSx, _lineSy, _lineEx, _lineEy,
                _lineColor = this.backColor,
                _danymicOffset,
                _tmpResult;

            if (parseFloat(this.text) <= 5) {
                _lineSx = parseInt(_tsx + _calculateX(30), 10);
                _lineSy = parseInt(_tsy + _calculateY(30), 10);
            }
            else {
                _lineSx = parseInt(_tsx + _calculateX(15), 10);
                _lineSy = parseInt(_tsy + _calculateY(15), 10);
            }

            function _calculateX(l) {
                return Math.cos(_tmpBisectorAngle) * l;
            }
            function _calculateY(l) {
                return Math.sin(_tmpBisectorAngle) * l;
            }
            function _calculateOffset(angle) {
                var _temp = 7 / Math.cos(angle);
                return _temp;
            }
            function _calculateLinePosition(tsx, tsy, offset) {
                var _rs = {};
                _rs.sx = parseInt(tsx + _calculateX(offset), 10);
                _rs.sy = parseInt(tsy + _calculateY(offset), 10);
                return _rs;
            }

            // 计算角平分线所在象限
            if (_quadrant >= 0 && _quadrant <= Math.PI / 2) {
                //first
                _danymicOffset = _calculateOffset(_quadrant);


                //防止指示线过长，每个象限的值不一样。
                if (_quadrant < 1 / 4 * Math.PI) {
                    if (_danymicOffset >= 15) {
                        _danymicOffset = _danymicOffset % 10;
                    }
                }
                else {
                    if (_danymicOffset >= 35) {
                        _danymicOffset = _danymicOffset % 19;
                    }
                }
                _danymicOffset = _danymicOffset < 10 ? 10 : _danymicOffset;
                _tmpResult = _calculateLinePosition(_tsx, _tsy, _danymicOffset);
                _lineSx = _tmpResult.sx;
                _lineSy = _tmpResult.sy;
                _wrapper.drawLine(_tsx, _tsy, _lineSx, _lineSy, 1, _lineColor);


                _lineEx = _lineSx + _danymicOffset;
                _lineEy = _lineSy;

                _wrapper.drawLine(_lineSx, _lineSy, _lineEx, _lineEy, 1, _lineColor);

                _wrapper.drawString(this.text, _lineEx, _lineEy, _w, _fontsize, _fontcolor, _fontsize, _fontfamily, _fontweight, "center", "top", true);
            }
            else if (_quadrant > Math.PI / 2 && _quadrant <= Math.PI) {
                // second quadrant                    
                _danymicOffset = _calculateOffset(_quadrant - Math.PI / 2);
                if (_danymicOffset >= 35) {
                    _danymicOffset = _danymicOffset % 20;
                }
                _danymicOffset = _danymicOffset < 10 ? 10 : _danymicOffset;
                _tmpResult = _calculateLinePosition(_tsx, _tsy, _danymicOffset);
                _lineSx = _tmpResult.sx;
                _lineSy = _tmpResult.sy;

                _wrapper.drawLine(_tsx, _tsy, _lineSx, _lineSy, 1, this.backColor);
                _lineEx = _lineSx;
                _lineEy = _lineSy + _danymicOffset;

                _wrapper.drawLine(_lineSx, _lineSy, _lineEx, _lineEy, 1, _lineColor);
                _lineEx = _lineEx - _w;
                _lineEy = _lineEy + _fontsize / 2;

                _wrapper.drawString(this.text, _lineEx, _lineEy, _w, _fontsize, _fontcolor, _fontsize, _fontfamily, _fontweight, "left", "top", true);
            }
            else if (_quadrant > Math.PI && _quadrant <= Math.PI * 1.5) {
                // third quadrant

                _danymicOffset = _calculateOffset(_quadrant - Math.PI);
                if (_quadrant > 5 / 4 * Math.PI) {
                    if (_danymicOffset >= 15) {
                        _danymicOffset = _danymicOffset % 10;
                    }
                }
                else {
                    if (_danymicOffset >= 35) {
                        _danymicOffset = _danymicOffset % 20;
                    }

                }
                _danymicOffset = _danymicOffset < 10 ? 10 : _danymicOffset;
                _tmpResult = _calculateLinePosition(_tsx, _tsy, _danymicOffset);
                _lineSx = _tmpResult.sx;
                _lineSy = _tmpResult.sy;

                _wrapper.drawLine(_tsx, _tsy, _lineSx, _lineSy, 1, this.backColor);



                _lineEx = _lineSx;
                _lineEy = _lineSy - _danymicOffset;
                _wrapper.drawLine(_lineSx, _lineSy, _lineEx, _lineEy, 1, _lineColor);
                _lineEx = _lineEx - _w / 1.2;
                _lineEy = _lineEy - _fontsize / 2;

                _wrapper.drawString(this.text, _lineEx, _lineEy, _w, _fontsize, _fontcolor, _fontsize, _fontfamily, _fontweight, "left", "center", true);
            }
            else {
                // four quadrant
                _danymicOffset = _calculateOffset(_quadrant - 3 / 2 * Math.PI);

                //防止指示线太长

                if (_danymicOffset >= 15) {
                    _danymicOffset = _danymicOffset % 10;
                }

                _danymicOffset = _danymicOffset < 10 ? 10 : _danymicOffset;

                _tmpResult = _calculateLinePosition(_tsx, _tsy, _danymicOffset);
                _lineSx = _tmpResult.sx;
                _lineSy = _tmpResult.sy;
                _wrapper.drawLine(_tsx, _tsy, _lineSx, _lineSy, 1, _lineColor);

                _lineEx = _lineSx + _danymicOffset;
                _lineEy = _lineSy;

                _wrapper.drawLine(_lineSx, _lineSy, _lineEx, _lineEy, 1, _lineColor);

                _wrapper.drawString(this.text, _lineEx, _lineEy, _w, _fontsize, _fontcolor, _fontsize, _fontfamily, _fontweight, "center", "center", true);
            }
            _tmpTextPos.sx = _tsx + _offsetX;
            _tmpTextPos.sy = _tsy + _offsetY;

        }

        this.addRenderHandler(function () {
            var _wrapper = this.wrapper, _ctx = _wrapper.ctx, _cx, _cy, _shadow = this.shadow;
            _ctx.save();
            _ctx.globalAlpha = this.alpha;
            _cx = this.cx();
            _cy = this.cy();
            _ctx.save();
            if (this.isUseShadowInRender) {

                for (var shadowAttr in _shadow) {
                    _ctx[shadowAttr] = _shadow[shadowAttr];
                }
            }

            _wrapper.drawSector(_cx, _cy, this.r, this.backColor, this.startPosition, this.endPosition, false, this.lineWidth);
            if (this.displayBorder) {
                _wrapper.drawStorkeSector(_cx, _cy, this.r, this.borderColor, this.startPosition, this.endPosition, false, this.lineWidth);
            }
            _ctx.restore();
            if (parseFloat(this.text) > 0) {
                _drawString.call(this, _cx, _cy);
            }

            this.isRepainted = false;
            _ctx.restore();

        });
        this.addRepaintHandler(function () {
            var _wrapper = this.wrapper, _ctx = _wrapper.ctx, _shadow = this.shadow, _cx, _cy, _r = this.distance;
            this.isRepainted = true;
            _ctx.save();
            for (var shadowAttr in _shadow) {
                _ctx[shadowAttr] = _shadow[shadowAttr];
            }
            var _offsetX = Math.cos((this.endPosition + this.startPosition) * Math.PI) * _r;
            var _offsetY = Math.sin((this.endPosition + this.startPosition) * Math.PI) * _r;
            _cx = this.cx() + _offsetX;
            _cy = this.cy() + _offsetY;

            _wrapper.drawSector(_cx, _cy, this.r, this.backColor, this.startPosition, this.endPosition, false, this.lineWidth);
            _ctx.restore();
            if (parseFloat(this.text) > 0) {
                _drawString.call(this, _cx, _cy);
            }
        });


    };
    inheritPrototype(_pieCtrl, _baseCtrl);
    _pieCtrl.prototype.setText = function (text, color, fontsize, fontfamily, fontweight) {
        this.text = text || "Legend";
        //_title_fontWeight, _title_fontsize, _title_fontFamily, _title_text
        this.fontcolor = color || "black";
        this.fontsize = fontsize || 12;
        this.fontfamily = fontfamily || "微软雅黑";
        this.fontweight = fontweight || null;
        this.textWidth = this.wrapper.messureText(this.fontweight, this.fontsize, this.fontfamily, text).width;
    };



    _legend = function (wrapper, x, y, w, h, color, flag) {
        _baseCtrl.apply(this, Array.prototype.slice.call(arguments));
        this._imageData;
        function _putImageData(x, y, dx, dy, dw, dh) {
            this._imageData = this._imageData || this.wrapper.ctx.getImageData(dx, dy, dw, dh);
        }
        function _drawLegendParttern() {
            var _x = this.partternSx(),
                _y = this.partternSy(),
                _w = this.partternWidth(),
                _h = this.partternHeight();
            this._legendHandler.notify(_x, _y, _w, _h);
        }
        this.checked = !!flag;
        this.text = "Legend";
        this.fontsize = 12;
        this.fontfamily = "微软雅黑";
        this.fontweight = "normal";
        this.fontcolor = "black";
        this._isCleared = false;
        this.legendWidth = undefined;
        this.legendHeight = undefined
        this._legendHandler = new evtWrapper(this);
        this.partternColor = color;
        this.partternWidth = function () { return this.legendWidth || this.w * 0.2; };
        this.partternHeight = function () { return this.legendHeight || this.h * 0.7; };
        this._partternLeft = 0;
        this._partternTop = 0;
        this.partternSx = function () { return this.sx + this._partternLeft; };
        this.partternSy = function () { return this.sy + this._partternTop; };
        this.shadow = {
            shadowBlur: 2,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            shadowColor: "#000000"
        };
        this.addRenderHandler(function () {
            var _wrapper = this.wrapper, _x, _y, _h;
            if (this._isCleared) {
                _putImageData.call(this, 0, 0, this.x, this.y, this.w, this.h);
                this._isCleared = false;
            }
            _drawLegendParttern.call(this);
            _x = this.sx + this.partternWidth() + 5;
            _y = this.sy;
            _h = this.h;
         
            _wrapper.writePureText(_x, _y, _h, this.text, this.fontcolor, this.fontsize, this.fontfamily, this.fontweight, true);

        });
        this.addRepaintHandler(function () {
            var _wrapper = this.wrapper, _x, _y, _h, _ctx = _wrapper.ctx, _shadow = this.shadow;
            if (this._isCleared) {
                _putImageData.call(this, 0, 0, this.x, this.y, this.w, this.h);
                this._isCleared = false;
            }

            _ctx.save();
            for (var shadowAttr in _shadow) {
                _ctx[shadowAttr] = _shadow[shadowAttr];
            }
            _drawLegendParttern.call(this);
            _ctx.restore();
            _x = this.sx + this.partternWidth() + 6;
            _y = this.sy - 1;
            _h = this.h;           
            _wrapper.writePureText(_x, _y, _h, this.text, this.fontcolor, this.fontsize, this.fontfamily, this.fontweight, true);


        });
    }
    inheritPrototype(_legend, _baseCtrl);
    _legend.prototype.setText = function (text, color, fontsize, fontfamily, fontweight) {
        this.text = text || "Legend";
        //_title_fontWeight, _title_fontsize, _title_fontFamily, _title_text
        this.fontcolor = color || "black";
        this.fontsize = fontsize || 12;
        this.fontfamily = fontfamily || "微软雅黑";
        this.fontweight = fontweight || "normal";
        this.textWidth = this.wrapper.messureText(this.fontweight, this.fontsize, this.fontfamily, text).width;
    };
    _legend.prototype.addLegendHandler = function (func) {
        this._legendHandler.attach(func);
    };
    _legend.prototype.setPartternPosition = function (left, top) {
        this._partternLeft = left || 0;
        this._partternTop = top || 0;
    }
    canvasWrapper.prototype.addPieCtrl = function (cx, cy, r, color, parentCtrl) {
        var _pie = new _pieCtrl(this, cx, cy, r, color);
        _pie.setParent(parentCtrl);
        this.ctrlList.push(_pie);
        return _pie;
    };
    canvasWrapper.prototype.addPieCtrlLegend = function (x, y, w, h, color, flag, parentCtrl) {
        var _pieLegend = new _legend(this, x, y, w, h, color, flag);
        _pieLegend.setParent(parentCtrl);
        this.ctrlList.push(_pieLegend);
        return _pieLegend;
    }
    canvasWrapper.prototype.isInCtrl = function (coords, ctrl) {
        if (ctrl instanceof _pieCtrl) {
            var _result, _ctx = this.ctx,
             _position = this.getCtrlHierarchy(ctrl),
             _cx = ctrl.cx(), _cy = ctrl.cy(), _r = ctrl.r,
             _start = ctrl.startPosition * Math.PI * 2,
             _end = ctrl.endPosition * Math.PI * 2;
            _ctx.save();
            _ctx.translate(_position.x, _position.y);
            _ctx.beginPath();
            _ctx.moveTo(_cx, _cy);
            _ctx.arc(_cx, _cy, _r, _start, _end, false);
            _ctx.closePath();
            _result = _ctx.isPointInPath(coords.x, coords.y);
            _ctx.restore();
            return _result;
        }
        else {
            return _isInCtrl.call(this, coords, ctrl);
        }
    }
    canvasWrapper.prototype.drawSector = function (cx, cy, r, color, startPosition, range, clockwise, lineWidth) {
        var _c = this.ctx;
        _c.save();
        _c.translate(cx, cy);
        _c.fillStyle = color ? color : "gray";
        var _startPosition = Math.PI * 2 * (startPosition || 0);
        var _range = Math.PI * 2 * (range || 1);
        var _clockwise = !!clockwise;
        _c.lineWidth = lineWidth ? lineWidth : 1;
        _c.beginPath();
        _c.moveTo(0, 0);
        _c.arc(0, 0, r, _startPosition, _range, _clockwise);
        _c.closePath();
        _c.fill();
        _c.restore();
    }
    canvasWrapper.prototype.drawStorkeSector = function (cx, cy, r, color, startPosition, range, clockwise, lineWidth) {
        var _c = this.ctx;
        _c.save();
        _c.translate(cx, cy);
        _c.strokeStyle = color ? color : "gray";
        var _startPosition = Math.PI * 2 * (startPosition || 0);
        var _range = Math.PI * 2 * (range || 1);
        var _clockwise = !!clockwise;
        _c.lineWidth = lineWidth ? lineWidth : 1;
        _c.beginPath();
        _c.moveTo(0, 0);
        _c.arc(0, 0, r, _startPosition, _range, _clockwise);
        _c.closePath();
        _c.stroke();
        _c.restore();
    }
    canvasWrapper.prototype.drawString = function (text, sx, sy, w, h, fontColor, size, family, weight, textAlign, vtextAlign, isfill) {
        var _c = this.ctx;
        _c.save();
        _c.translate(sx, sy);
        _c.textBaseline = 'middle';
        var _left = 0, _top = 0;
        switch (textAlign) {
            case "right":
                {
                    _left = w;
                    break;
                }
            case "center":
                {
                    _left = w / 2;
                    break;
                }
            default:
                {
                    _left = 0;
                    break;
                }
        }
        vtextAlign = vtextAlign ? vtextAlign : "top";
        _c.textAlign = textAlign;
        var _color = fontColor || "black";
        var _weight = weight || "";
        var _size = size || Math.round(h * 0.6);
        var _family = family || "'Segoe UI Light', 'Segoe UI', Tahoma, Arial, Verdana, sans-serif";
        var _font = _weight + " " + _size + "px " + _family;

        switch (vtextAlign) {
            case "bottom":
                {
                    _top = h - size;
                    break;
                }
            case 'center':
                {
                    _top = h / 2 - size / 2;
                    break;
                }
            default:
                {
                    _top = 0;
                    break;
                }
        }
        _c.fillStyle = _color;
        _c.strokeStyle = _color;
        isfill ? _c.fillText(text, _left, _top) : _c.strokeText(text, _left, _top);
        _c.restore();

    };




})();


var pieChart = function (sx, sy, w, h, scale) {
    this.sx = sx != undefined ? sx : 0;
    this.sy = sy != undefined ? sy : 0;
    this.w = w != undefined ? w : 400;
    this.h = h != undefined ? h : 420;
    this.displayPieBorder = false;
    this.pieBorderColor = "white";
    this.pieBorderWidth = 1;
    this.renderHandler = new evtWrapper(this);
    this.bgColor = "white";
    this.applyScale(scale);
    this.isLegendHorizontal = false;
    this.appearanceAttr = {
        title: "",
        title_fontsize: 12,
        title_fontFamily: "微软雅黑",
        title_fontWeight: "bold",
        title_color: "black"

    }
    this.pieLegendConfigs = {
        I: { color: "#00FE00", text: "优" },
        II: { color: "#00A6D0", text: "良" },
        III: { color: "#ACAC03", text: "轻微污染" },
        IV: { color: "#76762F", text: "轻度污染" },
        V: { color: "#FE4D00", text: "中度污染" },
        VI: { color: "#E68E6B", text: "中度重污染" },
        VII: { color: "#F56A6A", text: "重度污染" }

    };
    this.sectorData = [
      { "city": "道里区", "API": "10", "level": "I", "status": "良" },
      { "city": "道外区", "API": "167", "level": "II", "status": "良" },
      { "city": "南岗区", "API": "267", "level": "III", "status": "良" },
      { "city": "香坊区", "API": "367", "level": "IV", "status": "良" },
      { "city": "平房区", "API": "107", "level": "V", "status": "良" },
      { "city": "松北区", "API": "67", "level": "VI", "status": "良" },
    ];
    this.addRenderHandler(function () {
        var _wrapper = this.wrapper,
            _pieLegendConfigs = this.pieLegendConfigs,
            _sectorData = this.sectorData,
            _this_w = this.w,
            _this_h = this.h,
            _this_sx = this.sx,
            _this_sy = this.sy,
            _pie_sx = this.pieSx,
            _pie_sy = this.pieSy,
            _pie_radius = this.pieRadius,
            _appearanceAttr = this.appearanceAttr,
            _that = this,
            _displayPieBorder = this.displayPieBorder,
            _pieBorderColor = this.pieBorderColor,
            _pieBorderWidth = this.pieBorderWidth;
        /* Temp variable*/
        var _tempTextWidth, _tempTitleText;
        /*control variable*/
        var _bigBack, _header, _title, _pieCtrl, _legend;
        /*title style variable*/
        var _title_text = _appearanceAttr.title,
            _title_color = _appearanceAttr.title_color,
            _title_fontsize = _appearanceAttr.title_fontsize,
            _title_fontFamily = _appearanceAttr.title_fontFamily,
            _title_fontWeight = _appearanceAttr.title_fontWeight;

        var _tempLegend = [];

        for (var i in _pieLegendConfigs) {
            _pieLegendConfigs[i]["name"] = i;
            _tempLegend.push(_pieLegendConfigs[i]);
        }

        _tempLegend.sort(function (x, y) {
            return x.zindex > y.zindex;
        });
        _pieLegendConfigs = {};

        for (var j = 0, len; len = _tempLegend.length, j < len; j++) {
            var _name = _tempLegend[j].name;
            _pieLegendConfigs[_name] = _tempLegend[j];
        }

        /*********define and initialize the contorls **********/
        _bigBack = _wrapper.addBanner(0, 0, 0, 0);
        _bigBack.setBorderState(false);
        _bigBack.w = _this_w;
        _bigBack.h = _this_h;
        _bigBack.setPosition(_this_sx, _this_sy);
        _bigBack.backColor = this.bgColor || _wrapper.createLinearGradient(0, 0, 0, _bigBack.h, { 0: "rgb(255,255,255)", 1: "rgb(229,229,229)" });
        _bigBack.setZIndex(1);

        _header = _wrapper.addBanner(0, 0, 0, 0, null, _bigBack);
        _header.setPosition(0, 0);
        _header.absolute = true;
        _header.w = _header.parentNode.w;
        _header.h = _header.parentNode.h * 20 / _this_h;
        _header.backColor = this.bgColor || _wrapper.createLinearGradient(0, 0, 0, _header.h, { 0: "rgb(255,255,255)", 1: "rgb(252,252,252)" });
        _header.setZIndex(2);

        _title = _wrapper.addLable(0, 0, 0, 0, _title_color, _title_fontFamily, _header);

        _title.addText(_title_text, _title_color, _title_fontsize, _title_fontFamily, _title_fontWeight);
        _tempTextWidth = _wrapper.messureText(_title_fontWeight, _title_fontsize, _title_fontFamily, _title_text).width;
        _title.left = (_title.parentNode.w - _tempTextWidth) / 2;
        _title.top = 10;
        _title.setZIndex(3);



        var _start = 0,
            _level,
           _pieCtrls = [],
           _legends = [],
           _sectorFinalData = {},
           _i = 0, _ci,
           _tatal = _sectorData.reduce(function (pv, cv, ci) {
               var _API = parseFloat(cv.API);
               if (_sectorFinalData[cv.level] == undefined) { _sectorFinalData[cv.level] = 0; }

               _sectorFinalData[cv.level] += _API;

               return pv + _API;

           }, 0);

        for (var key in _pieLegendConfigs) {
            _ci = _sectorFinalData[key];
            _level = _pieLegendConfigs[key];

            _pieCtrl = _wrapper.addPieCtrl(0, 0, 0, _level.color, _bigBack);
            _pieCtrl.absolute = true;
            _pieCtrl.ocx = _pie_sx || 120 / 332 * _pieCtrl.parentNode.w;
            _pieCtrl.ocy = _pie_sy || 119 / 238 * _pieCtrl.parentNode.h;
            _pieCtrl.startPosition = _start;
            var _bfb = _ci / _tatal;
            if (typeof _ci == "undefined") {
                _bfb = 0;
                _pieCtrl.setRenderFlag(false);
            }

            _start = _start + _bfb;
            _pieCtrl.endPosition = _start;
            _pieCtrl.setText((_bfb * 100).toFixed(1) + "%");
            _pieCtrl.r = _pie_radius;
            _pieCtrl.dr = 20;
            _pieCtrl.distance = 10;
            _pieCtrl.alpha = 0.3;
            _pieCtrl.setZIndex(5 + _i);
            _pieCtrl.displayBorder = _displayPieBorder;
            _pieCtrl.borderColor = _pieBorderColor;
            _pieCtrl.lineWidth = _pieBorderWidth;
            (function (k) {
                _pieCtrl.onclick(function () {
                    if (!this.isRepainted) {
                        this.setRenderFlag(false);
                        _legends[k].setRenderFlag(false);
                        _wrapper.render();
                        //_animation.repaint();
                        this.setRenderFlag(true);
                        _legends[k].setRenderFlag(true);
                        this.repaint();
                        _legends[k].repaint();
                    }
                    else {
                        _wrapper.render();
                        //_animation.repaint();
                    }
                });

            })(_i);
            _pieCtrls.push(_pieCtrl);

            _legend = _wrapper.addPieCtrlLegend(0, 0, 0, 0, _level.color, true, _bigBack);
            _legend.absolute = true;
            _legend.w = this.legendW;
            _legend.h = this.legendH;
            _legend.legendWidth = this.legendW * 0.8;
            _legend.legendHeight = this.legendH * 0.8;
            var _top, _left;
            if (!this.isLegendHorizontal) {
                _left = this.legendX || 240 / 332 * _legend.parentNode.w;
                _top = this.legendY || 50 / 238 * _legend.parentNode.h;
                _top = _top + _legend.h * _i + _i * 5;
            }
            else {
                _left = this.legendX || 240 / 332 * _legend.parentNode.w;
                _top = this.legendY || 50 / 238 * _legend.parentNode.h;
                _left = _left + _legend.w * _i + _i * 5;
            }
            _legend.left = _left;
            _legend.top = _top;
            _legend.setText(_level.text, "black", 12, null, null);
            _legend.setZIndex(6 + _i);
            (function (_tlevel, k) {
                _legend.addLegendHandler(function (_x, _y, _w, _h) {
                    _wrapper.drawRect(_x, _y, _w, _h, _tlevel.color);
                });
                _legend.onclick(function () {
                    var _tpieCtrl = _pieCtrls[k];
                    if (!_tpieCtrl.isRepainted) {
                        _tpieCtrl.setRenderFlag(false);
                        this.setRenderFlag(false);
                        _wrapper.render();
                        //_animation.repaint();
                        this.setRenderFlag(true);
                        _tpieCtrl.setRenderFlag(true);
                        this.repaint();
                        _tpieCtrl.repaint();
                    }
                    else {
                        _wrapper.render();
                        //_animation.repaint();
                    }
                });
            })(_level, _i)
            _legend.setPartternPosition(0, 2);

            _legends.push(_legend);
            _i++;
        }
        var _animation = _wrapper.addAnimation(20);
        _animation.applyCtrls(_bigBack, _header, _title);
        for (var i = 0, ci, cj; cj = _legends[i], ci = _pieCtrls[i]; i++) {
            _animation.applyCtrl(cj);
            _animation.logChanges(ci, { dr: -ci.dr }, 0, 3);
            _animation.logChanges(ci, { alpha: 1 }, 0, 3);

        }
        _animation.addClearHandler(function () {
            this.applyClearArea(_bigBack.sx, _bigBack.sy, _bigBack.w, _bigBack.h);
        });
        _animation.active();
        _animation.attachDeactiveHandler(function () {

        });
    });
    this.legendX = 240;
    this.legendY = 50;
    this.legendW = 80;
    this.legendH = 20;
    this.pieRadius = 64;
    this.pieSx = undefined;
    this.pieSy = undefined;

}
pieChart.prototype.addRenderHandler = function (func) {
    if (typeof func == "function") {
        this.renderHandler.attach(func);
    }
}
pieChart.prototype.setLegend = function (x, y, w, h) {
    this.legendX = x || 240;
    this.legendY = y || 50;
    this.legendW = w || 80;
    this.legendH = h || 20;
}
pieChart.prototype.applyWrapper = function (canvasId, width, height) {
    this.wrapper = new canvasWrapper(canvasId, width, height);
    return this;
}
pieChart.prototype.applyScale = function (scale) {
    this.scale = scale != undefined ? scale : 1;
}
pieChart.prototype.runConfig = function () { this.renderHandler.notify(); };
pieChart.prototype.render = function (scale, isAutoStart) {
    var _wrapper = this.wrapper;
    if (!_wrapper) { throw "canvases are not ready"; };

    //_wrapper.registerAnimation();
    var _scale = scale ? scale : 1;
    _wrapper.renderByHierarchy(_scale);
    this.applyScale(scale);
    if (isAutoStart) {
        _wrapper.autoStart();
    }
}
pieChart.prototype.repaint = function (scale, isAutoStart) {
    var _wrapper = this.wrapper;
    if (!_wrapper) { throw "canvases are not ready"; };
    var _canvas = _wrapper.canvas;
    _wrapper.clearRect(0, 0, _canvas.width, _canvas.height);
    this.render(scale, isAutoStart);
}
pieChart.prototype.setSectorData = function (data) {
    this.sectorData = data;
}
pieChart.prototype.setPieLegendConfigs = function (data) {
    this.pieLegendConfigs = data;
}

pieChart.prototype.setAppearanceAttr = function (configs) {
    this.appearanceAttr = configs || this.appearanceAttr;

}
pieChart.prototype.setPiePosition = function (x, y, r) {
    this.pieSx = x;
    this.pieSy = y;
    this.pieRadius = r;
}



var pieChartConfig = function (defaults, data, pieLegendConfigs) {
    this.defaults = {
        cvsId: "cvs",
        width: 332,
        height: 238,
        startX: 0,
        startY: 0,
        pieSx: 200,
        pieSy: 125,
        pieRadius: 95,
        pieBorderWidth: 2,
        pieBorderColor: "white",
        displayBorder: false,
        legendX: 400,
        legendY: 55,
        legendW: 100,
        legendH: 20

    }

    for (var i in defaults) {
        if (i in this.defaults) {
            this.defaults[i] = defaults[i];
        }
    }


    this.pieLegendConfigs = pieLegendConfigs || { I: { color: "green", zindex: 0, text: "" } };


    this.defaultColors = ["green", "blue", "#FFC90E"];
    this.defaultColorTitles = ["优", "良", "差"];
    this.setData(data);
}
pieChartConfig.prototype.Render = function () {
    var _defaults = this.defaults, _w = _defaults.width, _h = _defaults.height;
    var _pie = new pieChart(_defaults.startX, _defaults.startY, _w, _h);
    _pie.setSectorData(this.data);
    _pie.setPieLegendConfigs(this.pieLegendConfigs);
    _pie.setAppearanceAttr(this.titleAttrs);
    _pie.applyWrapper(_defaults.cvsId, _w, _h);
    _pie.setLegend(_defaults.legendX, _defaults.legendY, _defaults.legendW, _defaults.legendH);
    _pie.setPiePosition(_defaults.pieSx, _defaults.pieSy, _defaults.pieRadius);
    _pie.pieBorderColor = _defaults.pieBorderColor;
    _pie.pieBorderWidth = _defaults.pieBorderWidth;
    _pie.displayPieBorder = _defaults.displayBorder;
    _pie.isLegendHorizontal = true;
    _pie.runConfig();
    _pie.render(1, true);
}
pieChartConfig.prototype.setData = function (data, mapToColorfunc, colors) {
    this.data = data;
    this.mapDataToColor(mapToColorfunc, colors);
}
pieChartConfig.prototype.mapDataToColor = function (func, colors, colorsTexts) {
    var _data = this.data || [];
    colors = colors && colors.length >= 3 ? colors : this.defaultColors;
    colorsTexts = colorsTexts && colorsTexts.length >= 3 ? colorsTexts : this.defaultColorTitles;
    if (typeof func == "function") {
        func.apply(this, [colors, colorsTexts]);
    }
    else {
        this.pieLegendConfigs = this.pieLegendConfigs || {};
        for (var i = 0, len; len = _data.length, i < len; i++) {
            var data = _data[i];
            var _API = parseInt(data["exponent"], 10);
            data["API"] = _API;
            if (_API > 105) {
                data["level"] = "I";//优
                data["status"] = "优";
                this.pieLegendConfigs["I"] = {};
                this.pieLegendConfigs["I"]["color"] = colors[0];
                this.pieLegendConfigs["I"]["text"] = "优";
                this.pieLegendConfigs["I"]["zindex"] = 1;
            }
            else if (_API <= 95) {
                data["level"] = "III";//差
                data["status"] = "差";
                this.pieLegendConfigs["III"] = {};
                this.pieLegendConfigs["III"]["color"] = colors[2];
                this.pieLegendConfigs["III"]["text"] = "差";
                this.pieLegendConfigs["III"]["zindex"] = 3;
            }
            else {
                data["level"] = "II";
                data["status"] = "良";
                this.pieLegendConfigs["II"] = {};
                this.pieLegendConfigs["II"]["color"] = colors[1];
                this.pieLegendConfigs["II"]["zindex"] = 2;
                this.pieLegendConfigs["II"]["text"] = "良";
            }
        }
    }

}
pieChartConfig.prototype.setPieLegendConfigs = function (configs, x, y, w, h) {
    this.pieLegendConfigs = configs || this.pieLegendConfigs;
    this.legendX = x;
    this.legendY = y;
    this.legendW = w;
    this.legendY = y;
}
pieChartConfig.prototype.setTitleAttr = function (configs) {
    this.titleAttrs = configs;

}
pieChartConfig.prototype.buildHtml = function (func) {
    if (typeof func == "function") {
        func.call(this);
    }
}