// main-content
MC.content = {
    init: function () {
        MC.addPageReadyFunction(this.adjustContent);
        MC.addPageReadyFunction(this.checkBodyScrolling);

        MC.addPageResizeFunction(this.adjustContent);
    },
    adjustContent: function () {
        jQuery('#mainContent').css('height', MC.util.window.height - 100);

        if (window.kendo) kendo.resize(jQuery('.k-grid'));
    },
    checkBodyScrolling: function () {
        var currentScollPosition = {
            left: 0,
            top: 0
        };
        jQuery(window).scroll(function () {
            if (jQuery(MC.ui.loading.loader + ':visible,.k-overlay:visible').length) {
                window.scrollTo(currentScollPosition.left, currentScollPosition.top);
            }
            else {
                currentScollPosition.left = jQuery(window).scrollLeft();
                currentScollPosition.top = jQuery(window).scrollTop();
            }
        });
    }
};
MC.content.init();
