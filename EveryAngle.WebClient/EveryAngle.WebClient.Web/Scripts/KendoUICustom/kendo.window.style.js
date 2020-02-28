/*
* Author: Gaj
*
* Window change the arrow icon
*/

(function ($) {

    var fnActions = kendo.ui.Window.prototype._actions;
    kendo.ui.Window.prototype._actions = function () {
        fnActions.apply(this, arguments);
        var container = this.wrapper.find('.k-window-actions');
        container.find('.k-i-close').addClass('icon icon-close').empty();
        container.find('.k-i-window-maximize').addClass('icon icon-maximize').empty();
    };

    var fnSizingAction = kendo.ui.Window.prototype._sizingAction;
    kendo.ui.Window.prototype._sizingAction = function () {
        var result = fnSizingAction.apply(this, arguments);
        var container = this.wrapper.find('.k-window-actions');
        container.find('.k-i-window-restore').addClass('icon icon-minimize').empty();
        return result;
    };

})(jQuery);
