var advanceFilterHtmlTemplate = function () {
    return [
        '<div class="popupAdvFiltering">',
            '<div class="popupAdvFilteringRow popupAdvFilteringRowUsage">',
                '<h2>' + Localization.AdvanceFilterTextTitle + '</h2>',
                '<div class="popupAdvFilteringContent">',
                    '<!-- ko if: searchPageHandler.CanEditId() -->',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="eaText" id="ids" placeholder="' + Captions.Label_AdvanceFilter_AngleId + '" />',
                    '</div>',
                    '<!-- /ko -->',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="eaText" id="nameTextBox" placeholder="' + Captions.Label_AdvanceFilter_AngleName + '" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="eaText" id="descriptionTextBox" placeholder="' + Captions.Label_AdvanceFilter_AngleDescription + '" />',
                    '</div>',
                '</div>',
                '<div class="popupAdvFilteringContent">',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="eaText" id="displayNameTextBox" placeholder="' + Captions.Label_AdvanceFilter_AngleDisplayName + '" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="eaText"  id="displayDescriptionTextBox" placeholder="' + Captions.Label_AdvanceFilter_DisplayDescription + '" />',
                    '</div>',
                '</div>',
                '<div class="popupAdvFilteringContent">',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="eaText" id="baseClassTextBox" placeholder="' + Captions.Label_AdvanceFilter_BaseClasses + '" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="eaText" id="queryStepFieldTextBox" placeholder="' + Captions.Label_AdvanceFilter_QueryStep + '" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="eaText" id="followupTextBox" placeholder="' + Captions.Label_AdvanceFilter_Followup + '" />',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="popupAdvFilteringRow popupAdvFilteringRowUsage">',
                '<h2>' + Localization.AdvanceFilterUsageTitle + '</h2>',
                '<div class="popupAdvFilteringContent createdFilter">',
                    '<div class="popupAdvFilteringItem">',
                        '<input class="k-autocomplete-light userFilter" id="createdFilter" placeholder="' + Localization.AdvanceFilterUsageCreateBy + '" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem">',
                        '<span class="k-dropdown-light dropdownUsageOperators createdFilterType" id="createdFilterType"></span>',
                    '</div>',
                    '<div class="popupAdvFilteringItem datepickerColumn">',
                        '<input type="text" class="Datepicker datepickerFrom" data-datepicker-class="k-datepicker-light datepickerFrom" id="createdFilterFrom" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem datepickerColumn">',
                        '<input type="text" class="Datepicker datepickerTo" data-datepicker-class="k-datepicker-light datepickerTo" id="createdFilterTo" />',
                    '</div>',
                '</div>',
                '<div class="popupAdvFilteringContent lastChangedFilter">',
                    '<div class="popupAdvFilteringItem">',
                        '<input class="k-autocomplete-light userFilter" id="lastChangedFilter" placeholder="' + Captions.Label_AdvanceFilter_LastChangedBy + '" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem">',
                        '<span class="k-dropdown-light dropdownUsageOperators lastChangedFilterType" id="lastChangedFilterType"></span>',
                    '</div>',
                    '<div class="popupAdvFilteringItem datepickerColumn">',
                        '<input type="text" class="Datepicker datepickerFrom" data-datepicker-class="k-datepicker-light datepickerFrom" id="lastChangedFilterFrom" />',
                     '</div>',
                    '<div class="popupAdvFilteringItem datepickerColumn">',
                        '<input type="text" class="Datepicker datepickerTo" data-datepicker-class="k-datepicker-light datepickerTo" id="lastChangedFilterTo" />',
                    '</div>',
                '</div>',
                '<div class="popupAdvFilteringContent executeFilter">',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="k-autocomplete-light userFilter" id="executeFilter" placeholder="' + Localization.AdvanceFilterUsageLastExecutedBy + '" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem">',
                        '<span class="k-dropdown-light dropdownUsageOperators executeFilterType" id="executeFilterType"></span>',
                    '</div>',
                    '<div class="popupAdvFilteringItem datepickerColumn">',
                        '<input type="text" class="Datepicker datepickerFrom" data-datepicker-class="k-datepicker-light datepickerFrom" id="executeFilterFrom" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem datepickerColumn">',
                        '<input type="text" class="Datepicker datepickerTo" data-datepicker-class="k-datepicker-light datepickerTo" id="executeFilterTo" />',
                    '</div>',
                '</div>',
                '<div class="popupAdvFilteringContent validateFilter">',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="k-autocomplete-light userFilter" id="validateFilter" placeholder="' + Localization.AdvanceFilterUsageValidationChangeBy + '" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem">',
                        '<span class="k-dropdown-light dropdownUsageOperators validateFilterType" id="validateFilterType"></span>',
                    '</div>',
                    '<div class="popupAdvFilteringItem datepickerColumn">',
                        '<input type="text" class="Datepicker datepickerFrom" data-datepicker-class="k-datepicker-light datepickerFrom" id="validateFilterFrom" />',
                    '</div>',
                    '<div class="popupAdvFilteringItem datepickerColumn">',
                        '<input type="text" class="Datepicker datepickerTo" data-datepicker-class="k-datepicker-light datepickerTo" id="validateFilterTo" />',
                    '</div>',
                '</div>',
                '<div class="popupAdvFilteringContent numberExecutedFilter">',
                    '<div class="popupAdvFilteringItem">',
                        '<span class="k-dropdown-light dropdownNumberExcutes" id="dropdownNumberExcutes"></span>',
                    '</div>',
                    '<div class="popupAdvFilteringItem">',
                        '<input type="text" class="k-numerictextbox-light" id="textNumberExcutes" />',
                    '</div>',
                '</div>',
                '<div class="popupAdvFilteringContent characteristicFilter">',
                    '<div class="popupAdvFilteringItem publicStatus">',
                        '<span class="k-dropdown-light dropdownPublicStatus" id="dropdownPublicStatus"></span>',
                    '</div>',
                    '<div class="popupAdvFilteringItem validationStatus">',
                        '<span class="k-dropdown-light dropdownValidation" id="dropdownValidation"></span>',
                    '</div>',
                    '<div class="popupAdvFilteringItem warningStatus">',
                        '<span class="k-dropdown-light dropdownWarning" id="dropdownWarning"></span>',
                    '</div>',
                    '<div class="popupAdvFilteringItem starredStatus">',
                        '<span class="k-dropdown-light dropdownStarred" id="dropdownStarred"></span>',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="popupAdvFilteringRow popupAdvFilteringRowLimitations">',
                '<h2>' + Localization.AdvanceFilterLimitationsTitle + '</h2>',
                '<div class="popupAdvFilteringContent">',
                    '<div class="popupAdvFilteringItem">',
                        '<label for="allowMoreDetailCheckbox">',
                            '<input type="checkbox" id="allowMoreDetailCheckbox" />',
                            '<span class="label" id="allowMoreDetailCheckboxLabel">' + Captions.Label_AdvanceFilter_Search_AllowMoreDetail + '</span>',
                        '</label>',
                    '</div>',
                    '<div class="popupAdvFilteringItem">',
                        '<label for="allowFollowUpCheckbox">',
                            '<input type="checkbox" id="allowFollowUpCheckbox" />',
                            '<span class="label" id="allowFollowUpCheckboxLabel">' + Captions.Label_AdvanceFilter_Search_AllowFollowup + '</span>',
                        '</label>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
};
