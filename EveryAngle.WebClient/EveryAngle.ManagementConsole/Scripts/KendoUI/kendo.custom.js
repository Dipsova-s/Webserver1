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
    
})(window, window.kendo, window.jQuery);
