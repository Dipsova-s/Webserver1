/*
* Author: Gaj
*
* ComboBox change the arrow icon
*/

(function ($) {

    var fn = kendo.ui.ColorPicker.prototype._template;
    kendo.ui.ColorPicker.prototype._template = function () {
        var template = fn.apply(this, arguments);
        return template.replace('k-i-arrow-s', 'k-i-arrow-s k-i-arrow-60-down icon icon-caret-down');
    };

})(jQuery);
