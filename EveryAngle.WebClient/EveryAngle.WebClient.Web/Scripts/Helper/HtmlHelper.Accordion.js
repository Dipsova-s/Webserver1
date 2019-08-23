(function () {
    "use strict";

    // accordion
    jQuery(document).on('click', '.accordion-header', function (e) {
        var that = jQuery(this);
        var wrapper = that.closest('.accordion');
        if (wrapper.hasClass('toggleable')) {
            wrapper.find('.accordion-header').not(that).removeClass('open').addClass('close');
        }
        that.toggleClass('open');
        that.toggleClass('close');
    });
})();