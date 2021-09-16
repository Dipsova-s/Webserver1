(function (window, kendo, $) {

    // kendo grid column resize bug
    kendo.ui.Grid.prototype.options.columnResize = function (e) {
        this.resize(true);
    };

    // kendo spltter disable keyboard navigator
    kendo.ui.Splitter.prototype._keydown = $.noop;

    // touch + mouse device
    if (Modernizr.touch && window.Modernizr.mouse) {
        kendo.support.mobileOS = true;
        kendo.support.kineticScrollNeeded = true;
    }

    // overriding kendo default grid loader
    kendo.ui.progress = function (container, toggle) {
        var mask = container.find(".k-loading-mask");

        if (toggle) {
            if (!mask.length) {
                mask = $("<div class='k-loading-mask'><span class='k-loading-text'>" + getLoadingIconSvg() + "</span><div class='k-loading-image'/><div class='k-loading-color'/></div>")
                    .width("100%").height("100%")
                    .prependTo(container)
                    .css({ top: container.scrollTop(), left: container.scrollLeft() });
            }
        } else if (mask) {
            mask.remove();
        }
    }
    
})(window, window.kendo, window.jQuery);
