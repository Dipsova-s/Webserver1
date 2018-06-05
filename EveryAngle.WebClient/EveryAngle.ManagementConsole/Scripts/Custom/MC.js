// set window name
window.name = 'MC';

var MC = {
    init: function () {
        // set browser class name to html tag
        MC.browserDetector();

        // add modernizr test
        MC.addModernizrTest();

        // ios bugs
        MC.iosFixed();

        // events
        jQuery(window).resize(function () {
            MC.pageResize();
        });
        jQuery(document).on('click touchend', function (e) {
            MC.pageClicked(e);
        });
        jQuery(function () {
            MC.pageReady();
        });
    },
    browserDetector: function () {
        // browser detector
        jQuery('html').removeClass('no-js');
        jQuery.each(jQuery.browser, function (a, b) {
            if (a != 'version') {
                if (a == 'msie') {
                    var v = Math.floor(jQuery.browser.version);
                    jQuery('html').addClass('ie ie' + v);
                    for (var i = v; i <= 10; i++) if (v < i) jQuery('html').addClass('lt-ie' + i);
                }
                else jQuery('html').addClass(a + (a == 'webkit' ? '' : ' ' + a + parseInt(jQuery.browser.version, 10)));
            }
        });
    },
    addModernizrTest: function () {
        Modernizr.addTest('xhr2', function () { return 'FormData' in window; });
        Modernizr.addTest('textareamaxlength', function () { return 'maxLength' in document.createElement('textarea'); });
        this.mouseDetect();
    },
    iosFixed: function () {
        // fixed ios scale bug
        var viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]');
        var ua = navigator.userAgent;
        var gestureStart = function () {
            viewportmeta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
        };
        var scaleFix = function () {
            if (viewportmeta && (/iPhone|iPod|iPad/.test(ua) && !/Opera Mini/.test(ua))) {
                viewportmeta.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
                document.addEventListener("gesturestart", gestureStart, !1);
            }
        };
        scaleFix();

        // fixed ipad safari while keyboard is showing
        if (Modernizr.touch && !!jQuery.browser.safari) {
            jQuery(document).on('focus', 'input, textarea', function () {
                jQuery('html').addClass('keyboard');
                jQuery(window).scrollTop(jQuery(window).scrollTop() + 34);
            })
            .on('blur', 'input, textarea', function () {
                jQuery('html').removeClass('keyboard');
                setTimeout(function () {
                    jQuery(window).scrollTop(jQuery(window).scrollTop() - 1);
                }, 10);
            })
            .on('click', 'input:file', function () {
                jQuery('html').addClass('keyboard');
                jQuery(window).scrollTop(jQuery(window).scrollTop() + 34);
                document.body.onfocus = function () {
                    jQuery('html').removeClass('keyboard');
                    document.body.onfocus = null;
                };
            });
        }
    },

    pageClickedFunctions: [],
    pageReadyFunctions: [],
    pageResizeFunctions: [],
    ajaxDoneFunctions: [],
    addPageClickedFunction: function (fn) {
        this.addEvent(this.pageClickedFunctions, fn);
    },
    removePageClickedFunction: function (fn) {
        this.removeEvent(this.pageClickedFunctions, fn);
    },
    addPageReadyFunction: function (fn) {
        if (this.addEvent(this.pageReadyFunctions, fn) && jQuery.isReady)
            fn();
    },
    removePageReadyFunction: function (fn) {
        this.removeEvent(this.pageReadyFunctions, fn);
    },
    addPageResizeFunction: function (fn) {
        this.addEvent(this.pageResizeFunctions, fn);
    },
    removePageResizeFunction: function (fn) {
        this.removeEvent(this.pageResizeFunctions, fn);
    },
    addAjaxDoneFunction: function (fn) {
        this.addEvent(this.ajaxDoneFunctions, fn);
    },
    removeAjaxDoneFunction: function (fn) {
        this.removeEvent(this.ajaxDoneFunctions, fn);
    },
    addEvent: function (events, fn) {
        if (jQuery.inArray(fn, events) === -1) {
            events.push(fn);
            return true;
        }
        return false;
    },
    removeEvent: function (events, fn) {
        var index = jQuery.inArray(fn, this.events);
        if (index !== -1)
            this.events.splice(index, 1);
    },
    fireEvents: function (events, e) {
        jQuery.each(events, function (index, fn) {
            fn(e);
        });
    },
    pageClicked: function (e) {
        this.fireEvents(this.pageClickedFunctions, e);
    },
    pageReady: function () {
        this.fireEvents(this.pageReadyFunctions);
    },
    pageResize: function () {
        this.fireEvents(this.pageResizeFunctions);
    },
    ajaxDone: function () {
        this.fireEvents(this.ajaxDoneFunctions);
    },
    mouseDetect: function () {
        // mouse support
        var mouseTestResult = jQuery.localStorage('mouse');
        if (mouseTestResult === null) {
            Modernizr.mouse = false;
            jQuery.localStorage('mouse', false);
            jQuery(document).one('mousemove.test', function () {
                Modernizr.mouse = true;
                jQuery.localStorage('mouse', true);
                jQuery('html').addClass('mouse');
            });
        }
        else {
            Modernizr.mouse = mouseTestResult;
            if (mouseTestResult) {
                jQuery('html').addClass('mouse');
            }
            else {
                jQuery('html').removeClass('mouse');
            }
        }
    }
};
MC.init();

function disableLoading() {
    MC.ui.loading.setLoader('loadingHide');
}

function onKendoGridPagingStart() {
    disableLoading();
}

function getToday() {
    return new Date();
}

function checkEmailAddress(value) {

    //at least one dot
    if (!value.match(/\./g))
        return false;

    //exactly one @
    if (!value.match(/@/g))
        return false;
    if (value.match(/@/g).length > 1)
        return false;

    //no space
    if (/\s/g.test(value))
        return false;

    //no %
    if (/%/g.test(value))
        return false;

    return true;
}

function checkIp4Ip6(value) {
    if (value) {
        // M4-34574: support wildcard (only the last part)
        // - 192.168.1.* valid
        // - 192.168.*.1 invalid
        // - 2001::85a3:8d3:1319:8a2e:370:* valid
        // - 2001::85a3:8d3:1319:8a2e:*:370 invalid

        var testIP4Value = value.replace(/\.\*$/, '.255');
        var isIP4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/ig.test(testIP4Value);

        var testIP6Value = value.replace(/:\*$/, ':ffff');
        var isIP6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/ig.test(testIP6Value);
        return isIP4 || isIP6;
    }
    return true;
}

function checkRequiredField(value) {
    return !!$.trim(value);
}
