function DisplayPivotResultHandler(displayHandler) {
    "use strict";

    var self = this;

    // options
    self.ShowAggregationOptions = function () {
        if (!self.DisplayHandler.QueryDefinitionHandler.CanChangeAggregationOptions())
            return;

        var handler = new PivotOptionsHandler(self.DisplayHandler);
        handler.ShowPopup();
    };
    self.EnsureAggregationOptions = function () {
        var handler = new PivotOptionsHandler(self.DisplayHandler);
        handler.SetOptions();
    };

    // aggregation
    self.InitialAggregationUI = function () {
        self.SetAggregationTexts();
    };
    self.SetAggregationTexts = function () {
        var texts = jQuery.extend(
            {},
            self.DisplayHandler.QueryDefinitionHandler.Texts(),
            {
                AggregationTitle: Captions.Title_AggregationPivot,
                AggregationHeaderRow: Localization.PivotRowArea,
                AggregationHeaderColumn: Localization.PivotColumnArea,
                AggregationHeaderData: Localization.PivotDataArea,
                AggregationConfirmDiscardChanges: kendo.format(Localization.PopupConfirmDiscardChangeFieldSettingAndContinue, self.DisplayHandler.Data().display_type)
            }
        );
        self.DisplayHandler.QueryDefinitionHandler.Texts(texts);
    };
    self.SetAggregationFormatTexts = function (texts) {
        texts.HeaderAlias = Localization.NameAsShowInPivot;
    };
    self.GetAggregationFieldLimit = function () {
        return Infinity;
    };
    self.CanChangeCountFieldState = function () {
        return self.DisplayHandler.QueryDefinitionHandler.GetAggregationDataFields().length > 1
            && self.DisplayHandler.QueryDefinitionHandler.Authorizations.CanChangeAggregation();
    };
    self.CanSortField = function (aggregation) {
        var isSupportArea = aggregation.area() !== AggregationFieldViewModel.Area.Data;
        var isValidField = aggregation.valid() && aggregation.is_selected();
        return isSupportArea
            && isValidField
            && self.DisplayHandler.QueryDefinitionHandler.Authorizations.CanChangeAggregation();
    };
    self.SortField = function (aggregation) {
        if (aggregation.sorting() === AggregationFieldViewModel.Sorting.Ascending)
            aggregation.sorting(AggregationFieldViewModel.Sorting.Descending);
        else
            aggregation.sorting(AggregationFieldViewModel.Sorting.Ascending);
    };
    self.GetAggregationSortingClassName = function (aggregation) {
        return aggregation.sorting() === AggregationFieldViewModel.Sorting.Descending ? 'icon-sort-desc' : 'icon-sort-asc';
    };
    self.ValidateAggregation = function () {
        // has error
        if (self.DisplayHandler.QueryDefinitionHandler.HasErrorAggregationField()) {
            popup.Alert(Localization.Warning_Title, Localization.Info_PleaseRemoveAllInvalidFieldsInAggArea);
            return false;
        }

        // has a duplicate data field
        if (self.DisplayHandler.QueryDefinitionHandler.HasDuplicatedAggregationDataField()) {
            popup.Alert(Localization.Warning_Title, Localization.FieldSettingWarningMessageNotAllowSameFieldSameBucketInDataArea);
            return false;
        }

        // check pivot fields
        var rowFields = ko.toJS(self.DisplayHandler.QueryDefinitionHandler.GetAggregationRowFields()).findObjects('is_selected', true);
        var columnFields = ko.toJS(self.DisplayHandler.QueryDefinitionHandler.GetAggregationColumnFields()).findObjects('is_selected', true);

        // must have at least one field in row/column area
        if (!rowFields.length && !columnFields.length) {
            popup.Alert(Localization.Warning_Title, Localization.Info_RequiredAtLeastOneFieldForPivot);
            return false;
        }

        return true;
    };

    // constructur
    self.Initial(displayHandler);
}
DisplayPivotResultHandler.extend(BaseDisplayResultHandler);
