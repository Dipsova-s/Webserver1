(function (window, document, jQuery) {
    "use strict";

    // set window name
    window.name = "WC";

    // set WC namespace
    window.WC = {};
    window.WC.Window = {};
    window.WC.ModelsCollection = {};
    window.WC.Utility = {};
    window.WC.Utility.LoadScripts = function (options, lab) {
        jQuery.each(options, function (index, option) {
            var indexFile;
            for (indexFile = option.scripts.length - 1; indexFile >= 0; indexFile--) {
                if (option.scripts[indexFile].indexOf('.css') !== -1) {
                    yepnope.injectCss(option.scripts[indexFile]);
                    option.scripts.splice(indexFile, 1);
                }
            }
            lab = lab.script(option.scripts).wait(option.callback);
        });

        return lab;
    };

    // navigator.sendBeacon support
    Modernizr.addTest('sendbeacon', function () { return 'sendBeacon' in navigator; });

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

    window.WC.Page = {
        InitialPage: function () {
            var currentUrl = jQuery.localStorage('current_url') || '';
            var previousUrl = WC.Page.GetPreviousPageUrl();

            if (currentUrl !== window.location.href && currentUrl !== previousUrl) {
                jQuery.localStorage('previous_url', currentUrl);
            }
            jQuery.localStorage('current_url', window.location.href);
        },
        GetPreviousPageUrl: function () {
            return jQuery.localStorage('previous_url') || '';
        },
        CollectScripts: function (allScripts) {
            var scripts = [], i = 0;
            while (i < allScripts.length) {
                if (typeof allScripts[i + 1] === 'function') {
                    scripts.push({ scripts: allScripts[i], callback: allScripts[i + 1] });
                    i++;
                }
                else {
                    scripts.push({ scripts: allScripts[i], callback: jQuery.noop });
                }

                i++;
            }
            return scripts;
        },
        LoadCoreScripts: function () {
            var options = WC.Page.CollectScripts(Array.prototype.slice.call(arguments));

            var lab = $LAB;
            jQuery.each(options, function (index, option) {
                var indexFile;
                for (indexFile = option.scripts.length - 1; indexFile >= 0; indexFile--) {
                    if (option.scripts[indexFile].indexOf('.css') !== -1) {
                        yepnope.injectCss(option.scripts[indexFile]);
                        option.scripts.splice(indexFile, 1);
                    }
                }

                lab = lab.queueScript(option.scripts).queueWait(option.callback);
            });
        },
        LoadLoginPageScripts: function () {
            var options = WC.Page.CollectScripts(Array.prototype.slice.call(arguments));

            WC.Utility.LoadScripts(options, $LAB);
        },
        LoadSearchPageScripts: function () {
            var options = WC.Page.CollectScripts(Array.prototype.slice.call(arguments));

            WC.Utility.LoadScripts(options, $LAB.runQueue());
        },
        LoadAnglePageScripts: function () {
            var options = WC.Page.CollectScripts(Array.prototype.slice.call(arguments));

            WC.Utility.LoadScripts(options, $LAB.runQueue());
        },
        LoadDashboardPageScripts: function () {
            var options = WC.Page.CollectScripts(Array.prototype.slice.call(arguments));

            WC.Utility.LoadScripts(options, $LAB.runQueue());
        },
        Stop: function () {
            if (window.stop)
                window.stop();
            else if (document.execCommand)
                document.execCommand('Stop');
        }
    };
    jQuery(function () {
        window.WC.Page.InitialPage();
    });

    // get scrollbar size
    function getScrollBarWidth() {
        var parent, child, width;

        parent = jQuery('<div style="width:50px;height:50px;overflow:auto"><div></div></div>').appendTo('html');
        child = parent.children();
        width = child.innerWidth() - child.height(99).innerWidth();
        parent.remove();
        return width;
    }
    function setWindowHeight() {
        if (!!$.browser.safari && Modernizr.touch && window.WC.Window.Ratio === 1) {
            window.WC.Window.Height = window.innerHeight;
        }
        else {
            window.WC.Window.Height = jQuery(window).height();
        }
    }
    window.WC.Window.ScrollBarWidth = getScrollBarWidth();

    // date helper
    if (!Date.now) {
        Date.now = function () {
            return new Date().getTime();
        };
    }
    jQuery.now = function () {
        return Date.now();
    };
    window.WC.DateHelper = {
        instance: new Date()
    };

    // ie detection
    // - ie11 = Trident7.x (no MSIE)
    // - edge
    if (/Trident\/7\./.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) {
        delete $.browser.mozilla;
        $.browser.msie = true;
    }

    jQuery('html').removeClass('no-js');
    var getCssClassIE = function (version) {
        var cssClass = 'ie ie' + version;
        for (var i = version; i <= 10; i++) {
            if (version < i) {
                cssClass += ' lt-ie' + i;
            }
        }
        return cssClass;
    };
    jQuery.each(jQuery.browser, function (key) {
        if (key !== 'version') {
            if (key === 'msie') {
                var version = Math.floor(jQuery.browser.version);
                var cssClass = getCssClassIE(version);
                jQuery('html').addClass(cssClass);
            }
            else {
                jQuery('html').addClass(key);
            }
        }
    });

    var updateViewportHeight = function () {
        // Then we set the value in the --vh custom property to the root of the document
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
    };

    // global window resizing event
    var landscape = "landscape";
    var portrait = "portrait";
    if (!Modernizr.touch) {
        window.WC.Window.OrientationChanged = true;
        window.WC.Window.Orientation = landscape;
    }
    jQuery(window).on('resize.ea', function () {
        window.WC.Window.Ratio = document.documentElement.clientWidth / window.innerWidth;
        window.WC.Window.Width = jQuery(window).width();
        setWindowHeight();
        updateViewportHeight();

        if (Modernizr.touch) {
            var currentOrientation = window.WC.Window.Width > window.WC.Window.Height ? landscape : portrait;

            window.WC.Window.OrientationChanged = window.WC.Window.Orientation && currentOrientation !== window.WC.Window.Orientation;
            window.WC.Window.Orientation = currentOrientation;
        }
    });
    jQuery(window).trigger('resize.ea');

    // ios scrolling down
    if (!!$.browser.safari && Modernizr.touch) {
        var currentRatio = 0, fnTouchEndResize;
        var updateLayout = function () {
            if (typeof searchPageHandler !== 'undefined' && searchPageHandler.UpdateLayout) {
                searchPageHandler.UpdateLayout();
            }
            else if (typeof anglePageHandler !== 'undefined' && anglePageHandler.UpdateLayout) {
                anglePageHandler.UpdateLayout();
            }
            else if (typeof dashboardPageHandler !== 'undefined' && dashboardPageHandler.UpdateLayout) {
                dashboardPageHandler.UpdateLayout();
            }
        };
        jQuery(document)
            .on('touchstart.ea', function () {
                if (!currentRatio) {
                    currentRatio = window.WC.Window.Ratio;
                }
            })
            .on('touchend.ea', function () {
                window.WC.Window.Ratio = document.documentElement.clientWidth / window.innerWidth;
                setWindowHeight();

                if (window.WC.Window.Ratio === 1 && !jQuery('#UserName:visible').length) {
                    jQuery('body,html').animate({ scrollTop: 0 });
                }

                if (currentRatio !== window.WC.Window.Ratio) {
                    currentRatio = window.WC.Window.Ratio;

                    clearTimeout(fnTouchEndResize);
                    fnTouchEndResize = setTimeout(updateLayout, 500);
                }
            });
    }

    // ios persisted
    if (Modernizr.touch) {
        window.onpageshow = function (evt) {
            // If persisted then it is in the page cache, do somethings...
            if (jQuery.isReady && evt.persisted) {
                if (typeof progressbarModel !== 'undefined') {
                    progressbarModel.EndProgressBar();
                }

                if (typeof searchPageHandler !== 'undefined' && searchPageHandler.TriggerPersisted) {
                    searchPageHandler.TriggerPersisted(evt);
                }
                else if (typeof anglePageHandler !== 'undefined' && anglePageHandler.TriggerPersisted) {
                    anglePageHandler.TriggerPersisted(evt);
                }
                else if (typeof dashboardPageHandler !== 'undefined' && dashboardPageHandler.TriggerPersisted) {
                    dashboardPageHandler.TriggerPersisted(evt);
                }
            }
        };
    }

    /*! A fix for the iOS orientationchange zoom bug. Script by @scottjehl, rebound by @wilto.MIT License.*/
    (function (m) {
        if (!(/iPhone|iPad|iPod/.test(navigator.platform) && navigator.userAgent.indexOf("AppleWebKit") > -1)) {
            return;
        }
        var l = m.document;
        if (!l.querySelector) {
            return;
        }
        var n = l.querySelector("meta[name=viewport]"),
            a = n && n.getAttribute("content"),
            k = a + ",maximum-scale=1",
            d = a + ",maximum-scale=10",
            g = true,
            j, i, h, c;
        if (!n) {
            return;
        }
        function f() {
            n.setAttribute("content", d);
            g = true;
            m.scrollTo(0, 1);
        }
        function b() {
            n.setAttribute("content", k);
            g = false;
        }
        function e(o) {
            c = o.accelerationIncludingGravity;
            j = Math.abs(c.x);
            i = Math.abs(c.y);
            h = Math.abs(c.z);
            if (!m.orientation && (j > 7 || ((h > 6 && i < 8 || h < 8 && i > 6) && j > 5))) {   //NOSONAR
                if (g) {
                    b();
                }
            }
            else {
                if (!g) {
                    f();
                }
            }
        }
        m.addEventListener("orientationchange", f, false);
        m.addEventListener("devicemotion", e, false);
    })(window);

    // viewport setup
    var viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]'),
        width = WC.Window.Width,
        height = WC.Window.Height,
        minWidth = 768,
        minHeight = 465,
        scale = 600 / minWidth,
        lowScaleFix = function () {
            if ('onorientationchange' in window && (width < minWidth || height < minHeight)) {
                viewportmeta.content = "width=device-width, initial-scale=" + scale;
            }
        };
    if (viewportmeta) {
        lowScaleFix();
    }
})(window, document, jQuery);
