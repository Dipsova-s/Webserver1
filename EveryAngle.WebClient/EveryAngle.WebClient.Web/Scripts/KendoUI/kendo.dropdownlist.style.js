/*
* Author: Gaj
*
* DropDownList change the arrow icon
*/

(function ($) {

    var span = kendo.ui.DropDownList.prototype._span;
    kendo.ui.DropDownList.prototype._span = function () {
        span.call(this);
        this._arrow.addClass('icon icon-caret-down');
    };

})(jQuery);
