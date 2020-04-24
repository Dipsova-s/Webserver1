function BaseDisplayResultHandler() {}

(function (handler) {
    "use strict";

    handler.DisplayHandler = null;
    handler.Initial = function (displayHandler) {
        var self = this;
        self.DisplayHandler = displayHandler;
    };
    handler.Render = jQuery.noop;
    handler.Drilldown = jQuery.noop;
    handler.CanSortField = jQuery.noop;
    handler.SortField = jQuery.noop;

    // aggregation
    handler.InitialAggregationUI = jQuery.noop;
    handler.SetAggregationTexts = jQuery.noop;
    handler.SetAggregationFormatTexts = jQuery.noop;
    handler.GetAggregationFieldLimit = jQuery.noop;
    handler.GetAggregationSortingClassName = jQuery.noop;
    handler.CanChangeCountFieldState = jQuery.noop;
    handler.ValidateAggregation = jQuery.noop;
    handler.OnAggregationChangeCallback = jQuery.noop;
    handler.CanAddReferenceLine = jQuery.noop;
    handler.ShowAddReferenceLinePopup = jQuery.noop;

    handler.ShowAggregationOptions = jQuery.noop;
    handler.EnsureAggregationOptions = jQuery.noop;
})(BaseDisplayResultHandler.prototype);