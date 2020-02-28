/*
* Author: Gaj
*
* DropDownList change the arrow icon
*/

(function ($) {

    var span = kendo.ui.DropDownList.prototype._span;
    kendo.ui.DropDownList.prototype._span = function () {
        span.call(this);
        this._arrow.find('.k-icon').addClass('icon icon-caret-down');
    };

})(jQuery);
