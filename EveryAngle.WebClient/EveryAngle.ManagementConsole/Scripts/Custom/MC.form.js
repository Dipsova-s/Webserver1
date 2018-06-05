(function (win) {

    var form = {
        clean: function (container) {
            if (typeof container == 'undefined')
                container = '.content';
            jQuery(container).find('[type="text"],textarea').each(function (index, element) {
                element = jQuery(element);
                element.val(jQuery.trim(element.val()));
            });
        }
    };

    win.MC.form = form;

})(window);
