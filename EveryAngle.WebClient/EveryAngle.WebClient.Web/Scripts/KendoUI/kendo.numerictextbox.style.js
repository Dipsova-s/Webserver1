/*
* Author: Gaj
*
* DropDownList change the arrow icon
*/

(function ($) {

    var arrows = kendo.ui.NumericTextBox.prototype._arrows;
    kendo.ui.NumericTextBox.prototype._arrows = function () {
        arrows.call(this);
        this._upArrow.children().addClass('icon icon-caret-up');
        this._downArrow.children().addClass('icon icon-caret-down');
    };

})(jQuery);
