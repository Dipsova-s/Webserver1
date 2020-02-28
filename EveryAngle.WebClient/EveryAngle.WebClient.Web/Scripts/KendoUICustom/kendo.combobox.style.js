/*
* Author: Gaj
*
* ComboBox change the arrow icon
*/

(function ($) {

    var input = kendo.ui.ComboBox.prototype._input;
    kendo.ui.ComboBox.prototype._input = function () {
        input.call(this);
        this._arrow.addClass('icon icon-caret-down');
    };

})(jQuery);
