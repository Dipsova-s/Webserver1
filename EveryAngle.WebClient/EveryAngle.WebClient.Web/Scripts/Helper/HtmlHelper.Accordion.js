(function () {
    "use strict";

    // accordion
    jQuery(document).on('click', '.accordion-header', function (e) {
        // stop for action clicking
        if (jQuery(e.target).closest('.action').length || jQuery(e.currentTarget).closest('.accordion-item').hasClass('disabled'))
            return;

        var that = jQuery(this);
        var callback = that.data('callback');
        var wrapper = that.closest('.accordion');
        if (wrapper.hasClass('toggleable')) {
            wrapper.find('.accordion-header').not(that).removeClass('open').addClass('close');
        }
        that.next().stop().slideToggle(300, "swing", function () {
            that.toggleClass('open');
            that.toggleClass('close');
            if (jQuery.isFunction(callback))
                callback(that);
            jQuery(window).trigger('resize');
        });       
    });
})();