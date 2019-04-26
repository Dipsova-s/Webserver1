(function (win) {
    
    var init = function () {
        MC.addPageReadyFunction(MC.ui.password);
        MC.addAjaxDoneFunction(MC.ui.password);
    };
    var password = function (obj) {
        if (typeof obj === 'undefined')
            obj = '[data-role="password"]';

        jQuery(obj).each(function (index, element) {
            element = jQuery(element);
            if (element.data('password'))
                return;

            element.data('password', true);
            element.val(element.data('hasPassword') ? win.passwordPlaceHolder : '');
        });
    };

    win.MC.ui.password = password;
    init();

})(window);
