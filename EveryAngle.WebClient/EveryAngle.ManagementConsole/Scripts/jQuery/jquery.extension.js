// $.limitMaxlength
(function ($) {
    jQuery.fn.limitMaxlength = function (c) { var d = jQuery.extend({ attribute: "maxlength", onLimit: function () { }, onEdit: function () { } }, c); var e = jQuery(this); var f = function () { var a = jQuery(this); var b = parseInt(a.attr(d.attribute)); if (a.val().length > b) { a.val(a.val().substr(0, b)); jQuery.proxy(d.onLimit, this)() } jQuery.proxy(d.onEdit, this)(b - a.val().length) }; e.each(f); return e.keyup(f).keydown(f).focus(f).on('input paste', f) };
})(jQuery);

// $.parseParams
(function ($) {
    var re = /([^&=]+)=?([^&]*)/g;
    var decode = function (str) {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    };
    $.parseParams = function (query) {
        var params = {}, e;
        while (e = re.exec(query)) {
            var k = decode(e[1]), v = decode(e[2]);
            if (k.substring(k.length - 2) === '[]') {
                k = k.substring(0, k.length - 2);
                (params[k] || (params[k] = [])).push(v);
            }
            else params[k] = v;
        }
        return params;
    };
})(jQuery);

// $.between
(function ($) {
    // how to use
    // childSelector = ex. 'td', 'div', '.className', '#id'
    // begin = 0
    // end = 10
    $.fn.between = function (childSelector, begin, end) {
        var expectedElements = this.find(childSelector).slice(begin, end);
        return expectedElements;
    }
})(jQuery);

// if $.browser
(function ($) {
    if (typeof $.browser === 'undefined') {
        $.uaMatch = function (a) { a = a.toLowerCase(); a = /(chrome)[ \/]([\w.]+)/.exec(a) || /(webkit)[ \/]([\w.]+)/.exec(a) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a) || /(msie) ([\w.]+)/.exec(a) || 0 > a.indexOf("compatible") && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a) || []; return { browser: a[1] || "", version: a[2] || "0" } }; var matched = jQuery.uaMatch(navigator.userAgent), browser = {}; matched.browser && (browser[matched.browser] = !0, browser.version = matched.version); browser.chrome ? browser.webkit = !0 : browser.webkit && (browser.safari = !0);
        $.browser = browser;
    }

    // ie detection
    // - ie11 = Trident7.x (no MSIE)
    // - edge
    if (/Trident\/7\./.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) {
        delete $.browser.mozilla;
        $.browser.msie = true;
    }
   
})(jQuery);

// $.serializeObject
(function ($) {
    $.fn.serializeObject = function () {
        var arrayData, objectData;
        arrayData = this.serializeArray();
        objectData = {};

        $.each(arrayData, function () {
            var value;

            if (this.value != null) {
                value = this.value;
            } else {
                value = '';
            }

            if (objectData[this.name] != null) {
                if (!objectData[this.name].push) {
                    objectData[this.name] = [objectData[this.name]];
                }

                objectData[this.name].push(value);
            } else {
                objectData[this.name] = value;
            }
        });

        return objectData;
    };
})(jQuery);

// $.busyIndicator
(function ($) {
    $.fn.busyIndicator = function (c) {
        var b = $(this);
        var d = b.find(".k-loading-mask");
        c ? d.length || (d = $("<div class='k-loading-mask'><span class='k-loading-text'>Loading...</span><div class='k-loading-image'/><div class='k-loading-color'/></div>").width(b.outerWidth()).height(b.outerHeight()).prependTo(b)) : d && d.remove();
        return b;
    };
})(jQuery);

/*
highlight v5
Highlights arbitrary terms.
<http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>

MIT license.

Johann Burkard
<http://johannburkard.de>
<mailto:jb@eaio.com>
*/
(function ($) {
    $.fn.highlight = function (c) { function e(b, c) { var d = 0; if (3 == b.nodeType) { var a = b.data.toUpperCase().indexOf(c), a = a - (b.data.substr(0, a).toUpperCase().length - b.data.substr(0, a).length); if (0 <= a) { d = document.createElement("span"); d.className = "highlight"; a = b.splitText(a); a.splitText(Math.min(c.length, a.data.length)); var f = a.cloneNode(!0); d.appendChild(f); a.parentNode.replaceChild(d, a); d = 1 } } else if (1 == b.nodeType && b.childNodes && !/(script|style)/i.test(b.tagName)) for (a = 0; a < b.childNodes.length; ++a) a += e(b.childNodes[a], c); return d } return this.length && c && c.length ? this.each(function () { e(this, c.toUpperCase()) }) : this }; $.fn.removeHighlight = function () { return this.find("span.highlight").each(function () { this.parentNode.firstChild.nodeName; with (this.parentNode) replaceChild(this.firstChild, this), normalize() }).end() };
})(jQuery);

// json sorting
(function ($) {
    $.fn.sort = function () {
        return this.pushStack([].sort.apply(this, arguments), []);
    };
})(jQuery);

// $.MultiSelect Component
(function ($) {
    $.fn.kendoMultiSelectExtension = function (options) {
        var _self = {};
        var _fn = {};
        var _options = $.extend({
            dataTextField: 'Text',
            dataValueField: 'Value',
            itemTemplate: '<span data-tooltip-title=\"#: Tooltip #\">#: Text # </span>',
            tagTemplate: '<span title=\"#: Tooltip #\" id=\"#: Id #\">#: Text #</span>',

            // Custom options
            isReadonlyDefaultValues: false
        }, options);

        _self.context = this.kendoMultiSelect(_options);
        _self.kendo = _self.context.data('kendoMultiSelect');

        _self.mandatoryValues = _options.value;
        _self.previousValues = _self.kendo.value();

        _fn.init = function () {
            if (_options.isReadonlyDefaultValues) {
                _fn.setReadOnlyEventHandler();
                _fn.setReadOnlyStyling();
            }

        };

        _fn.setReadOnlyEventHandler = function () {
            
            _self.kendo.bind('change', function (e) {
                var hasValue = true;
                var updatedValues = this.value();

                _self.mandatoryValues.forEach(function (v) {
                    if (jQuery.inArray(v.Value, updatedValues) === -1) {
                        hasValue = false;
                        return hasValue;
                    }
                });

                if (!hasValue) {
                    this.value(_self.previousValues);
                }
                else {
                    _self.previousValues = updatedValues;
                }

                _fn.setReadOnlyStyling();
            });

        };

        _fn.setReadOnlyStyling = function () {
            var buttonList = _self.context.siblings('.k-multiselect-wrap').find('.k-button');
            _self.mandatoryValues.forEach(function (v) {
                var mandatoryValue = buttonList.find('#' + v.Id);
                if (mandatoryValue.length) {
                    mandatoryValue.closest('.k-button').addClass('readonly');
                }
            });
        };

        _fn.init();
        
        return _self;
    };
})(jQuery);
