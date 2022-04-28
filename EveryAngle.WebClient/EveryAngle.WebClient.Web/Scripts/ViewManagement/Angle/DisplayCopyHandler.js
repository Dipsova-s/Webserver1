var displayCopyHandler = new DisplayCopyHandler();

function DisplayCopyHandler() {
    "use strict";

    var self = this;

    self.CanCopyDisplay = function () {
        var isAllow = false;
        privilegesViewModel.Data().forEach(function (model) {
            if (model.privileges.save_displays) {
                isAllow = true;
                return;
            }
        });
        return isAllow;
    };

    self.CopyDisplay = function () {
        var displayData = WC.ModelHelper.RemoveReadOnlyDisplayData(displayModel.Data());
        displayData.is_public = false;
        displayData.is_angle_default = false;
        displayData.used_in_task = false;
        displayData.user_specific.execute_on_login = false;
        displayData.user_specific.is_user_default = false;
        displayData.is_available_externally = false;
        if (displayData.display_type !== enumHandlers.DISPLAYTYPE.CHART && !angleInfoModel.Data().is_template)
            displayData.external_id = '';
        jQuery.localStorage('copied_display', displayData);

        if (self.CanPasteDisplay()) {
            jQuery('#ActionDropdownListPopup .pastedisplay').removeClass('disabled');
            toast.MakeSuccessTextFormatting(displayModel.Name(), Localization.Toast_CopyDisplay);
        }
    };

    self.CanPasteDisplay = function () {
        return resultModel.Data().authorizations.change_field_collection && jQuery.localStorage('copied_display');
    };

    self.PasteDisplay = function () {
        if (self.CheckAngleHaveWarning())
            popup.Info(Localization.Info_CannotPasteDisplayBecuaseAngleWarning);
        else {
            jQuery.when(self.CheckDisplayHaveWarning())
                .done(function (valid, htmlMessage, displayCopy) {
                    if (valid) {
                        self.PrepareDisplayForPasted(displayCopy);
                        jQuery.when(displayModel.CreateTempDisplay(displayCopy.display_type, displayCopy))
                            .done(function (data) {
                                fieldSettingsHandler.ClearFieldSettings();
                                anglePageHandler.HandlerValidation.ShowValidationStatus[data.uri] = true;
                                anglePageHandler.HandlerAngle.AddDisplay(data, null, true);
                                displayModel.GotoTemporaryDisplay(data.uri);
                                toast.MakeSuccessTextFormatting(displayModel.Name(), Localization.Toast_PasteDisplay);
                            });
                    }
                    else
                        popup.Info(Localization.Info_DisplayCannotBeCopied + '<br><br>' + htmlMessage);
                });
        }
    };

    self.PrepareDisplayForPasted = function (displayCopy) {
        var angleUri = anglePageHandler.HandlerAngle.Data().uri + '/';
        if (displayCopy.uri.indexOf(angleUri) === -1) {
            var displayDetails = WC.Utility.ParseJSON(displayCopy.display_details);
            delete displayDetails.drilldown_display;
            displayCopy.display_details = JSON.stringify(displayDetails);
        }
        delete displayCopy.uri;
    };

    self.CheckAngleHaveWarning = function () {
        var result = validationHandler.GetAngleValidation(angleInfoModel.Data());
        return !result.Valid;
    };

    self.CheckDisplayHaveWarning = function () {
        var copiedDisplay = jQuery.localStorage('copied_display');
        var newDisplay = jQuery.GUID();
        copiedDisplay.id = 'd' + newDisplay.replace(/-/g, '');

        var data = {
            query_definition: angleInfoModel.Data().query_definition,
            display_definitions:
                [{
                    query_blocks: copiedDisplay.query_blocks,
                    fields: copiedDisplay.fields
                }]
        };

        var model = modelsHandler.GetModelByUri(angleInfoModel.Data().model);
        var url = model.validate_query_integrity + '?multilingual=yes';

        return CreateDataToWebService(url, data)
            .then(function (response) {

                copiedDisplay.query_blocks = response.display_definitions[0].query_blocks;
                copiedDisplay.fields = response.display_definitions[0].fields;

                var displayValidation = validationHandler.GetDisplayValidation(copiedDisplay, angleInfoModel.Data().model);
                var messages = validationHandler.GetAllInvalidMessages(displayValidation);
                var htmlMessage = validationHandler.GetAllInvalidMessagesHtml(messages);

                if (displayValidation.InvalidSortings) {
                    // find an object which step_type is sorting, then remove if its state is not valid
                    var sortingSteps = copiedDisplay.query_blocks[0].query_steps.findObject('step_type', enumHandlers.FILTERTYPE.SORTING);
                    sortingSteps.sorting_fields.removeObject('valid', false);

                    // check if the sorting_fields was completely removed, remove its object.
                    if (sortingSteps.sorting_fields.length === 0)
                        copiedDisplay.query_blocks[0].query_steps.removeObject('step_type', enumHandlers.FILTERTYPE.SORTING);
                }

                var canPasteDisplay = !(displayValidation.InvalidFilters || displayValidation.InvalidFollowups || displayValidation.InvalidAggregates);
                return jQuery.when(canPasteDisplay, htmlMessage, copiedDisplay);
            });
    };
}