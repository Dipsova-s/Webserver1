(function (win) {
    "use strict";

    var setActive = function (that, index) {
        var menu = that.element.find('.tab-menu').removeClass('active');
        var content = that.element.find('.tab-content').removeClass('active');
        that.menu = menu.eq(index);
        that.content = content.eq(index);
        that.menu.addClass('active');
        that.content.addClass('active');

        // callback
        if (that._isReady)
            that.settings.change(index, that.content);
    };

    var setEvents = function (that) {
        that.element.find('.tab-menu').off('click.tab').on('click.tab', function () {
            var index = jQuery(this).index();
            setActive(that, index);
        });
    };

    var tab = function (selector, options) {
        var that = Object.create({});
        that._isReady = false;
        that.settings = jQuery.extend({
            index: 0,
            change: jQuery.noop
        }, options);
        that.element = jQuery(selector);

        // scrollable
        that.element.find('.tab-content-wrapper')
            .addClass('scrollbar-custom')
            .scrollbar();

        // method
        that.active = function (index) {
            setActive(that, index);
        };

        // call methods
        setActive(that, that.settings.index);
        setEvents(that);

        that.element.data('Tab', that);
        that._isReady = true;
        return that;
    };

    jQuery.extend(win.WC.HtmlHelper, { Tab: tab });
})(window);