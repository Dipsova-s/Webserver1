(function (window) {
    "use strict";

    window.Function.prototype.extend = function (parent) {
        this.prototype = new parent();
        this.prototype.constructor = this;
        this.prototype.parent = parent;
    };

    window.WC.Utility.GetDefaultDisplay = function (displays, skipCheckUserDefault) {
        /// <summary>
        /// get default display from displays list
        /// </summary>
        /// <param name="displays" type="Array">displays list</param>
        /// <param name="skipCheckUserDefault" type="Boolean" optional="true">default: false, check from user_specific.is_user_default or not?</param>
        /// <returns type="Object">display object</returns>

        if (!displays.length) {
            return null;
        }

        // check from display.user_specific.is_user_default
        if (skipCheckUserDefault !== true) {
            var display = displays.findObject('user_specific', function (userSpecific) { return userSpecific.is_user_default; });
            if (display) {
                return display;
            }
        }

        // is display.is_angle_default
        display = displays.findObject('is_angle_default', true);
        if (display) {
            return display;
        }

        // display.display_type is list
        display = displays.findObject('display_type', enumHandlers.DISPLAYTYPE.LIST);
        if (display) {
            return display;
        }

        // 1st display
        return displays[0];
    };
    window.WC.Utility.GetDefaultMultiLangText = function (multiLangs) {
        if (multiLangs && multiLangs.length) {
            // check from user settings
            var multiLang = multiLangs.findObject('lang', userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase());
            if (multiLang) {
                return jQuery.trim(multiLang.text);
            }

            // use first language
            if (multiLangs.length) {
                return jQuery.trim(multiLangs[0].text);
            }
        }

        // return empty
        return '';
    };
    window.WC.Utility.ConvertFieldName = function (name) {
        name = name.replace(/@/g, 'OatO');
        name = name.replace(/\-/g, 'OdashO');
        name = name.replace(/:/g, 'OcolonO');
        name = name.replace(/\//g, 'OslashO');
        name = name.replace(/\\/g, 'ObackslashO');
        name = name.replace(/\$/g, 'OdollarO');
        name = name.replace(/§/g, 'OsectionO');
        name = name.replace(/Â/g, 'OacircumflexO');
        return name;
    };
    window.WC.Utility.RevertFieldName = function (name) {
        name = name.replace(/OatO/g, '@');
        name = name.replace(/OdashO/g, '-');
        name = name.replace(/OcolonO/g, ':');
        name = name.replace(/OslashO/g, '/');
        name = name.replace(/ObackslashO/g, '\\');
        name = name.replace(/OdollarO/g, '$');
        name = name.replace(/OsectionO/g, '§');
        name = name.replace(/OacircumflexO/g, 'Â');
        return name;
    };
    window.WC.Utility.RevertBackSlashFieldName = function (name) {
        var revertedFieldId = window.WC.Utility.RevertFieldName(name);
        var replacedFieldId = revertedFieldId.replace(/\\/g, '\\\\');
        return replacedFieldId;
    };
    window.WC.Utility.MeasureText = function (text, font) {
        if (Modernizr.canvas) {
            // re-use canvas object for better performance
            var cache = window.WC.Utility.MeasureText.cache[font] || (window.WC.Utility.MeasureText.cache[font] = {});
            var canvas = window.WC.Utility.MeasureText.canvas || (window.WC.Utility.MeasureText.canvas = document.createElement('canvas'));
            var context = canvas.getContext('2d');
            context.font = font;
            var size = 0, _size;
            var getTextSize = function (t) {
                var tSize;
                if (cache[t]) {
                    tSize = cache[t];
                }
                else {
                    tSize = context.measureText(t).width;
                    if (!cache[t]) {
                        cache[t] = tSize;
                    }
                }
                return tSize;
            };
            jQuery.each(text.split('\n'), function (i, t) {
                if (t) {
                    _size = getTextSize(t);
                    if (_size > size) {
                        size = _size;
                    }
                }
            });
            return size;
        }
        else {
            var div = jQuery('#ea_measure');
            if (!div.length) {
                div = jQuery('<div id="ea_measure" />', {
                    css: {
                        visibility: 'hidden',
                        overflow: 'visible',
                        position: 'absolute',
                        'white-space': 'nowrap',
                        left: -10000,
                        top: -10000,
                        font: font
                    }
                }).appendTo('body');
            }
            return div.html(text.replace(/\n/g, '<br/>')).width();
        }
    };
    window.WC.Utility.MeasureText.cache = {};
    window.WC.Utility.OpenUrlNewWindow = function (url) {
        if (!!jQuery.browser.chrome) {
            var evt = document.createEvent('MouseEvents');
            if (evt && evt.initMouseEvent) {
                var a = document.createElement('a');
                a.href = url;
                evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, true, false, false, false, 0, null);
                a.dispatchEvent(evt);
                return;
            }
        }

        // default behavior
        window.open(url);
    };
    window.WC.Utility.RedirectUrl = function (url) {
        window.location = url;
    };
    window.WC.Utility.DownloadFile = function (url) {
        WC.Utility.RedirectUrl(url);
    };
    window.WC.Utility.UrlParameter = function (name, value, append) {
        return jQuery.address.parameter(name, value, append);
    };
    window.WC.Utility.GetSearchPageUri = function (query) {
        return searchPageUrl + '#/?' + unescape(jQuery.param(query));
    };
    window.WC.Utility.GetAnglePageUri = function (angleUri, displayUri, query) {
        var params = {};
        params[enumHandlers.ANGLEPARAMETER.ANGLE] = angleUri;
        params[enumHandlers.ANGLEPARAMETER.DISPLAY] = displayUri;
        jQuery.extend(params, query || {});

        var queryString = jQuery.param(params);
        queryString = queryString.replace(/\+/g, ' ');
        queryString = unescape(queryString);

        return anglePageUrl + '#/?' + queryString;
    };
    window.WC.Utility.GetDashboardPageUri = function (dashboardUri, query) {
        var params = {};
        params[enumHandlers.DASHBOARDPARAMETER.DASHBOARD] = dashboardUri;
        jQuery.extend(params, query || {});

        var queryString = jQuery.param(params);
        queryString = queryString.replace(/\+/g, ' ');
        queryString = unescape(queryString);

        return dashboardPageUrl + '#/?' + queryString;
    };
    window.WC.Utility.Compare = function (value1, value2, sensitive) {
        return (value1 === value2 || (!sensitive && ('' + value1).toLowerCase() === ('' + value2).toLowerCase()));
    };
    window.WC.Utility.GetParameterByName = function (name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        var results = regex.exec(url);
        if (!results) {
            return null;
        }
        if (!results[2]) {
            return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };
    window.WC.Utility.SetTimeout = function (callback, delay, args) {
        return setTimeout((function (args) {
            return function () { callback.apply(this, args); };
        })(args), 200);
    };
    window.WC.Utility.ParseJSON = function (string, fallback) {
        /// <summary>parse string to json object</summary>
        /// <param name="string" type="String">json string</param>
        /// <param name="fallback" type="Object" optional="true">default: {}, fallback value if parse fail</param>
        /// <returns type="Object"></returns>

        var getFallback = function () {
            return typeof fallback !== 'undefined' ? fallback : {};
        };

        if (!string)
            return getFallback();

        var json;
        try {
            json = JSON.parse(string);
        }
        catch (ex) {
            json = getFallback();
        }
        return json;
    };
    window.WC.Utility.GetObjectValue = function (object, name, fallback) {
        /// <summary>get object value</summary>
        /// <param name="object" type="Object">object</param>
        /// <param name="name" type="String">property name</param>
        /// <param name="fallback" type="Object" optional="true">default: null, fallback value if object is nothing</param>
        /// <returns type="Object"></returns>

        var getFallback = function () {
            return typeof fallback !== 'undefined' ? fallback : null;
        };
        return object && typeof object[name] !== 'undefined' ? object[name] : getFallback();
    };
    window.WC.Utility.ToArray = function (value) {
        /// <summary>convert to array</summary>
        /// <param name="value" type="Object">json string</param>
        /// <returns type="Array"></returns>

        return !value || !jQuery.isArray(JSON.parse(JSON.stringify(value))) ? [] : value;
    };
    window.WC.Utility.ToNumber = function (value, fallback) {
        var getFallback = function () {
            return typeof fallback === 'number' ? fallback : 0;
        };
        value = parseFloat((value + '').replace(/,/g, ''));
        return !isNaN(value) ? value : getFallback();
    };
    window.WC.Utility.ToBoolean = function (value) {
        return !!value;
    };
    window.WC.Utility.ToString = function (value) {
        return typeof value !== 'string' ? '' : value;
    };
    window.WC.Utility.IfNothing = function (value, fallback) {
        return value ? value : fallback;
    };

    window.IsNullOrEmpty = function (data) {
        return typeof data === 'undefined' || data == null || data === '';
    };
    window.IsUndefindedOrNull = function (data) {
        return typeof data === 'undefined' || data == null;
    };
    window.GenerateDecimalPlaces = function (placesNumber) {
        var decimalFormat = '#.';

        for (var i = 1; i <= placesNumber; i++) {
            decimalFormat += '0';
        }

        return decimalFormat;
    };

    window.IsValidPackageName = function (fileName) {
        // Package name should contain only a-z, A-Z, 0-9, and '_'.
        var rg2 = /^[\w]+$/g;
        return rg2.test(fileName);
    };
    window.IsValidPackageId = function (id) {
        return /^[a-z_](\w*)$/ig.test(id);
    };
    window.IsValidPackageVersion = function (version) {
        return version[0] !== '.' && version[version.length - 1] !== '.' && /([\d\.])*/ig.test(version) && !/[\.]{2,}/g.test(version);
    };
    window.IsValidFileName = function (fileName) {
        // forbidden characters \ / : * ? " < > |
        var rg1 = /^[\\/:\*\?"<>\|]+$/;

        // cannot start with dot (.)
        var rg2 = /^\./;

        // forbidden file names
        var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i;

        return !rg1.test(fileName) && !rg2.test(fileName) && !rg3.test(fileName);
    };
    window.IsValidFileAndSheetName = function (name) {
        // forbidden characters \ / : * ? " < > |
        var rg1 = /[\\/:\*\?"<>\|\[\]]+/;

        // cannot start with dot (.)
        var rg2 = /^\./;

        // forbidden file names
        var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i;

        return !rg1.test(name) && !rg2.test(name) && !rg3.test(name);
    };
    window.IsValidSheetName = function (sheetName) {
        // forbidden characters \ / : * ? " < > |
        var rg1 = /^[\\/:\*\?"<>\|\[\]]+$/;

        // cannot start with dot (.)
        var rg2 = /^\./;

        // forbidden file names
        var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i;

        return !rg1.test(sheetName) && !rg2.test(sheetName) && !rg3.test(sheetName);
    };
    window.CleanExcelFileName = function (name, reservedName) {
        name = jQuery.trim(name);
        if (IsNullOrEmpty(name)) {
            name = jQuery.trim(reservedName) || 'ExportAngle';
        }

        name = name.replace(/[\\/:\*\?\"<>\|]/g, '');
        name = name.replace(/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/ig, '');

        // cannot start with dot (.)
        name = name.replace(/^\.*/g, '');

        // remove multiple space
        name = name.replace(/\s{2,}/, '');

        return name;
    };
    window.CleanSheetName = function (name, reservedName, maxLength) {
        name = jQuery.trim(name);
        if (IsNullOrEmpty(name)) {
            name = jQuery.trim(reservedName) || 'ExportAngle';
        }

        name = name.replace(/[\\/:\*\?\|]/g, '');
        name = name.replace(/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/ig, '');

        // cannot start with dot (.)
        name = name.replace(/^\.*/g, '');

        // remove multiple space
        name = name.replace(/\s{2,}/, '');

        return name.substr(0, maxLength);
    };

    window.UnionObjectArrays = function (arr1, arr2, isCaseSensitive) {
        var unions = [];
        var loop, i;
        var isDuplicate = function (arr) {
            var duplicate = false;
            for (i = 0; i < unions.length; i++) {
                if (jQuery.deepCompare(unions[i], arr[loop], isCaseSensitive)) {
                    duplicate = true;
                    break;
                }
            }
            return duplicate;
        };

        for (loop = 0; loop < arr1.length; loop++) {
            if (!unions.length) {
                unions.push(arr1[loop]);
            }
            else {
                if (!isDuplicate(arr1))
                    unions.push(arr1[loop]);
            }
        }

        for (loop = 0; loop < arr2.length; loop++) {
            if (!unions.length) {
                unions.push(arr2[loop]);
            }
            else {
                if (!isDuplicate(arr2))
                    unions.push(arr2[loop]);
            }
        }

        return unions;
    };

    // extending jQuery.fn
    jQuery.extend(jQuery.fn, {

        // kendo - busyIndicator
        busyIndicator: function (c) {
            return this.each(function () {
                var b = jQuery(this);
                var d = b.find(".k-loading-mask");
                if (!c || d.length) {
                    d.remove();
                }
                if (c) {
                    jQuery("<div class='k-loading-mask'><span class='k-loading-text'>Loading...</span><div class='k-loading-image'/><div class='k-loading-color'/></div>")
                        .width(b.width())
                        .height(b.height())
                        .prependTo(b);
                }
            });
        },

        // sort
        sort: function () {
            return this.pushStack([].sort.apply(this, arguments), []);
        }
    });

    // extending jQuery
    jQuery.extend(jQuery, {

        deepCompare: function (obj1, obj2, sensitive, arraySort) {
            /// <summary>Comparing 2 objects</summary>
            /// <param name="obj1" type="Any">1st object</param>
            /// <param name="obj2" type="Any">2nd object</param>
            /// <param name="sensitive" type="Boolean" optional="true">default: true, is case sensitive or not?</param>
            /// <param name="arraySort" type="Boolean" optional="true">default: true, sort before comparing or not?</param>
            /// <returns type="Boolean">result of comparing</returns>

            var leftChain = [], rightChain = [];
            if (typeof sensitive === 'undefined') {
                sensitive = true;
            }
            if (typeof arraySort === 'undefined') {
                arraySort = true;
            }

            obj1 = ko.toJS(obj1);
            obj2 = ko.toJS(obj2);

            function compare2Objects(x, y) {
                var p;

                // remember that NaN === NaN returns false
                // and isNaN(undefined) returns true
                if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
                    return true;
                }

                // Compare primitives and functions.
                // Check if both arguments link to the same object.
                // Especially useful on step when comparing prototypes
                if (x === y) {
                    return true;
                }

                // Works in case when functions are created in constructor.
                // Comparing dates is a common scenario. Another built-ins?
                // We can even handle functions passed across iframes
                if ((typeof x === 'function' && typeof y === 'function') ||
                    (x instanceof Date && y instanceof Date) ||
                    (x instanceof RegExp && y instanceof RegExp) ||
                    (x instanceof String && y instanceof String) ||
                    (x instanceof Number && y instanceof Number)) {
                    return x.toString() === y.toString();
                }

                // At last checking prototypes as good a we can
                if (!(x instanceof Object && y instanceof Object)) {
                    return false;
                }

                if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
                    return false;
                }

                if (x.constructor !== y.constructor) {
                    return false;
                }

                if (x.prototype !== y.prototype) {
                    return false;
                }

                // check for infinitive linking loops
                if (jQuery.inArray(x, leftChain) > -1 || jQuery.inArray(y, rightChain) > -1) {
                    return false;
                }

                // check array type
                if (x instanceof Array && y instanceof Array) {
                    if (typeof x[0] === 'number' || typeof x[0] === 'string') {
                        sort(x);
                        sort(y);
                    }
                    else {
                        if (arraySort) {
                            var p2;
                            for (p = x.length - 1; p >= 0; p--) {
                                for (p2 in y) {
                                    if (compare2Objects(x[p], y[p2])) {
                                        x.splice(p, 1);
                                        y.splice(p2, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                // Quick checking of one object beeing a subset of another.
                // cache the structure of arguments[0] for performance
                for (p in y) {
                    if (y.hasOwnProperty(p) !== x.hasOwnProperty(p) || typeof y[p] !== typeof x[p]) {
                        return false;
                    }
                }

                for (p in x) {
                    if (y.hasOwnProperty(p) !== x.hasOwnProperty(p) || typeof y[p] !== typeof x[p]) {
                        return false;
                    }

                    switch (typeof x[p]) {
                        case 'object':
                        case 'function':

                            leftChain.push(x);
                            rightChain.push(y);

                            if (!compare2Objects(x[p], y[p])) {
                                return false;
                            }

                            leftChain.pop();
                            rightChain.pop();
                            break;

                        case 'string':
                            if ((!sensitive && x[p].toLowerCase() !== y[p].toLowerCase())
                                || (sensitive && x[p] !== y[p])) {
                                return false;
                            }
                            break;

                        default:
                            if (x[p] !== y[p]) {
                                return false;
                            }
                            break;
                    }
                }

                return true;
            }

            function sort(array) {
                array.sort(function (a, b) {
                    if (!sensitive) {
                        a = typeof a === 'string' ? a.toLowerCase() : a;
                        b = typeof b === 'string' ? b.toLowerCase() : b;
                    }
                    return typeof a === 'string' ? a.localeCompare(b) : (a < b ? -1 : (a > b ? 1 : 0));
                });
            }

            return compare2Objects(obj1, obj2);
        },

        GUID: function () {
            /// <summary>Generate GUID</summary>
            /// <returns type="String">randomly GUID</returns>

            var s4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); //NOSONAR
            };

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + new Date().getTime().toString().substring(1);
        },

        whenAll: function (deferreds, async, ignore_fail) {
            /// <summary>Chain deferred object</summary>
            /// <param name="deferreds" type="Array|Promise">deferred objects</param>
            /// <param name="async" type="Boolean" optional="true">default: true, is async?</param>
            /// <param name="ignore_fail" type="Boolean" optional="true">default: true, ignore failure?</param>
            /// <returns type="Promise">resolved or rejected object</returns>

            var self = this;
            var isCustomDeferred = false;
            if (deferreds.length && deferreds[0] instanceof Object && deferreds[0].fn) {
                isCustomDeferred = true;
            }

            var deferred = new jQuery.Deferred(),
                settings = jQuery.extend({
                    async: true,
                    ignore_fail: true
                }, {
                    async: async,
                    ignore_fail: ignore_fail
                });

            if (!settings.async) {
                var promised = deferred.promise(), resolved = [];
                jQuery.each(deferreds, function (i, d) {
                    promised = promised.then(function () {
                        var wrapDeferred = jQuery.Deferred();
                        if (!settings.ignore_fail) {
                            jQuery.when(isCustomDeferred ? d.fn.apply(self, d.args) : d)
                                .fail(function () {
                                    resolved.push(Array.prototype.slice.call(arguments));
                                    wrapDeferred.reject(Array.prototype.slice.call(arguments));
                                })
                                .done(function () {
                                    resolved.push(Array.prototype.slice.call(arguments));
                                    wrapDeferred.resolve(Array.prototype.slice.call(arguments));
                                });
                        }
                        else {
                            jQuery.when(isCustomDeferred ? d.fn.apply(self, d.args) : d).always(function () {
                                resolved.push(Array.prototype.slice.call(arguments));
                                wrapDeferred.resolve(resolved);
                            });
                        }
                        return wrapDeferred.promise();
                    });
                });

                deferred.resolve();

                return promised;
            }
            else {
                return jQuery.when.apply(jQuery, jQuery.map(deferreds, function (d) {
                    var wrapDeferred = jQuery.Deferred();
                    if (!settings.ignore_fail) {
                        jQuery.when(isCustomDeferred ? d.fn.apply(self, d.args) : d)
                            .done(function () { wrapDeferred.resolve(Array.prototype.slice.call(arguments)); })
                            .fail(function () { wrapDeferred.reject(Array.prototype.slice.call(arguments)); });
                    }
                    else {
                        jQuery.when(isCustomDeferred ? d.fn.apply(self, d.args) : d)
                            .always(function () { wrapDeferred.resolve(Array.prototype.slice.call(arguments)); });
                    }
                    return wrapDeferred.promise();
                }));
            }
        },

        whenAllSet: function (deferreds, numberPerSet) {
            /// <summary>Chain deferred object</summary>
            /// <param name="deferreds" type="Array|Promise">deferred objects</param>
            /// <param name="numberPerSet" type="Number" optional="true">default: 10, deferred objects which will execute each set</param>
            /// <returns type="Promise">resolved or rejected object</returns>

            if (typeof numberPerSet !== 'number' || !numberPerSet) {
                numberPerSet = 10;
            }

            var deferCount = deferreds.length;
            var deferred = jQuery.Deferred();
            var promise = deferred.promise();
            var setIndex = 0;
            var deferSet = [];
            jQuery.each(deferreds, function (index, dfd) {
                if (typeof deferSet[setIndex] === 'undefined') {
                    deferSet[setIndex] = [];
                }
                deferSet[setIndex].push(dfd);

                if ((index + 1) % numberPerSet === 0 || index === deferCount - 1) {
                    promise = promise.then(function () {
                        return jQuery.when(Math.floor(index / numberPerSet));
                    })
                    .then(function (i) {
                        return jQuery.whenAll(deferSet[i]);
                    });
                    setIndex++;
                }
            });

            deferred.resolve();
            return promise;
        },

        // click outside event
        clickOutside: function (selector, checker) {
            var clickOutsideElements = WC.Utility.ToArray(jQuery(document).data('clickOutsideElements'));

            if (!clickOutsideElements.hasObject('selector', selector)) {
                clickOutsideElements.push({
                    selector: selector,
                    checker: checker
                });

                jQuery(document).data('clickOutsideElements', clickOutsideElements);
            }
        },
        clickOutsideInitial: function () {
            if (!jQuery(document).data('clickOutsideInitial')) {
                jQuery(document).data('clickOutsideInitial', true);

                jQuery(document).on('click.outside touchend.outside', function (e) {
                    var clickOutsideElements = WC.Utility.ToArray(jQuery(document).data('clickOutsideElements')),
                        clickOutsideElement,
                        handleChecker,
                        handleCheckBy;

                    jQuery.each(clickOutsideElements, function (k, v) {
                        clickOutsideElement = jQuery(v.selector);

                        if (clickOutsideElement.length) {
                            // check bind event.stopPropagation();
                            if (!clickOutsideElement.data('stopPropagationBound')) {
                                clickOutsideElement.data('stopPropagationBound', true).click(function (event) {
                                    event.stopPropagation();
                                });
                            }


                            if (typeof v.checker === 'function') {
                                e.clickTarget = v.selector;
                                if (e.type === 'click') {
                                    // check visibility by callback function
                                    v.checker(e);
                                }
                                else {
                                    jQuery.when({ fn: v.checker, args: [e] })
                                        .then(function (checker) {
                                            var d = jQuery.Deferred();
                                            setTimeout(function () {
                                                d.resolve(checker);
                                            }, 500);
                                            return d.promise();
                                        })
                                        .done(function (checker) {
                                            checker.fn.apply(this, checker.args);
                                        });
                                }
                            }
                            else {
                                // check visibility by handle
                                handleChecker = v.checker.split(' ');
                                handleChecker = handleChecker[handleChecker.length - 1].charAt(0);
                                handleCheckBy = handleChecker === '#' ? 'id' : (handleChecker === '.' ? 'class' : 'tag');
                                if (!jQuery(e.target).parents(v.selector).length
                                    && !jQuery(e.target).parents(v.checker).length
                                    && ((handleCheckBy === 'id' && e.target.id !== v.checker.substr(1))
                                        || (handleCheckBy === 'class' && !jQuery(e.target).hasClass(v.checker.substr(1)))
                                        || (handleCheckBy === 'tag' && !jQuery(e.target).is(v.checker)))) {
                                    var elementHidden = handleCheckBy === 'id' ? jQuery('[id="' + clickOutsideElement.attr('id') + '"]') : clickOutsideElement;
                                    if (e.type === 'click') {
                                        elementHidden.hide();
                                    }
                                    else {
                                        jQuery.when(elementHidden)
                                            .then(function (element) {
                                                var d = jQuery.Deferred();
                                                setTimeout(function () {
                                                    d.resolve(element);
                                                }, 500);
                                                return d.promise();
                                            })
                                            .done(function (element) {
                                                element.hide();
                                            });
                                    }
                                }
                            }
                        }
                    });
                });
            }
        }
    });
    jQuery.clickOutsideInitial();

    /*
    HTMLEncode - Encode HTML special characters.
    Copyright (c) 2006-2010 Thomas Peri, http://www.tumuski.com/
    MIT License
    */

    /*jslint white: true, onevar: true, undef: true, nomen: true, eqeqeq: true,
        plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */

    /**
     * HTML-Encode the supplied input
     *
     * Parameters:
     *
     * (String)  source    The text to be encoded.
     *
     * (boolean) display   The output is intended for display.
     *
     *                     If true:
     *                     * Tabs will be expanded to the number of spaces
     *                       indicated by the 'tabs' argument.
     *                     * Line breaks will be converted to <br />.
     *
     *                     If false:
     *                     * Tabs and linebreaks get turned into &#____;
     *                       entities just like all other control characters.
     *
     * (integer) tabs      The number of spaces to expand tabs to.  (Ignored
     *                     when the 'display' parameter evaluates to false.)
     *
     * version 2010-11-08
     */
    window.htmlEncode = function (source, display, tabs) {
        if (typeof source !== 'string')
            return source;

        var i, s, ch, peek, line, result,
            next, endline, push,
            spaces;

        // Stash the next character and advance the pointer
        next = function () {
            peek = source.charAt(i);
            i += 1;
        };

        // Start a new "line" of output, to be joined later by <br />
        endline = function () {
            line = line.join('');
            if (display) {
                // If a line starts or ends with a space, it evaporates in html
                // unless it's an nbsp.
                line = line.replace(/(^ )|( $)/g, '&nbsp;');
            }
            result.push(line);
            line = [];
        };

        // Push a character or its entity onto the current line
        push = function () {
            if (ch < ' ' || ch > '~') {
                line.push('&#' + ch.charCodeAt(0) + ';');
            } else {
                line.push(ch);
            }
        };

        // Use only integer part of tabs, and default to 4
        tabs = (tabs >= 0) ? Math.floor(tabs) : 4;

        result = [];
        line = [];

        i = 0;
        next();

        // less than or equal, because i is always one ahead
        while (i <= source.length) {
            ch = peek;
            next();

            // HTML special chars.
            switch (ch) {
                case '<':
                    line.push('&lt;');
                    break;
                case '>':
                    line.push('&gt;');
                    break;
                case '&':
                    line.push('&amp;');
                    break;
                case '"':
                    line.push('&quot;');
                    break;
                case "'":
                    line.push('&#39;');
                    break;
                default:
                    // If the output is intended for display,
                    // then end lines on newlines, and replace tabs with spaces.
                    if (display) {
                        switch (ch) {
                            case '\r':
                                // If this \r is the beginning of a \r\n, skip over the \n part.
                                if (peek === '\n') {
                                    next();
                                }
                                endline();
                                break;
                            case '\n':
                                endline();
                                break;
                            case '\t':
                                // expand tabs
                                spaces = tabs - (line.length % tabs);
                                for (s = 0; s < spaces; s += 1) {
                                    line.push(' ');
                                }
                                break;
                            default:
                                // All other characters can be dealt with generically.
                                push();
                        }
                    } else {
                        // If the output is not for display,
                        // then none of the characters need special treatment.
                        push();
                    }
            }
        }
        endline();

        // If you can't beat 'em, join 'em.
        result = result.join('<br />');

        if (display) {
            // Break up contiguous blocks of spaces with non-breaking spaces
            result = result.replace(/ {2}/g, ' &nbsp;');
        }

        // tada!
        return result;
    };

})(window);
