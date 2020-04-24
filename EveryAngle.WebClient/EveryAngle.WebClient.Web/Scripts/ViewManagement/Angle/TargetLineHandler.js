
function TargetLineHandler(queryDefinitionHandler, aggregation, field) {
    "use strict";

    var self = this;
    self.QueryDefinitionHandler = queryDefinitionHandler;
    self.Aggregation = aggregation;
    self.Field = field;
    var _self = {};
    self.Details = ko.observable();
    _self.popupName = 'ReferenceLine';

    self.Template = function () {
        return [
            '<div class="form-row">',
            '<div class="form-col form-col-header">' + Localization.AdvanceFilterUsageTextFrom + '</div>',
            '<div class="form-col form-col-body"><input type="text" id="ReferenceFromValue" class="eaText" /></div>',
            '</div>',
            '<div class="form-row" id="ReferenceLabel">',
            '<div class="form-col form-col-header">' + Localization.AdvanceFilterUsageTextTo + '</div>',
            '<div class="form-col form-col-body"><input type="text" id="ReferenceToValue" class="eaText" /></div>',
            '</div>'
        ].join('');
    };
    //popup settings for reference line
    self.GetPopupSettings = function (popupTitle) {
        return {
            title: popupTitle,
            element: '#popup' + _self.popupName,
            appendTo: 'body',
            className: 'popup' + _self.popupName,
            width: 350,
            minHeight: 100,
            html: self.Template(),
            buttons: [
                {
                    text: Localization.Ok,
                    className: 'btn-apply',
                    click: self.Apply,
                    isPrimary: true,
                    position: 'right'
                },
                {
                    text: Localization.ClearAll,
                    className: 'btn-clear',
                    click: self.UpdateLayout,
                    isPrimary: false,
                    position: 'right'
                }
            ],
            open: function () {
                self.SetInputStatus();
            },
            close: popup.Destroy
        };
    };
    // Show popup for reference line
    self.ShowPopup = function () {
        var fieldDetails = self.Aggregation.details();
        if (fieldDetails.targetlinedetails === undefined) {
            var json = {
                "targetlinedetails": {
                    fromvalue: null,
                    tovalue:null
                }
            };
            jQuery.extend(fieldDetails, json);
        }
        self.Details(fieldDetails);
        var popupSettings = self.GetPopupSettings(Localization.ChartReferenceFieldName);
        popup.Show(popupSettings);
    };
    //set reference details to aggregation details
    self.SetData = function () {
        var fieldDetails = self.Details();
        var fromValue = $("#ReferenceFromValue").data('handler').value();
        var toValue = $("#ReferenceToValue").data('handler').value();
        var formatType = self.QueryDefinitionHandler.GetAggregationDataType(self.Aggregation, self.Field.fieldtype);
        if (formatType === enumHandlers.FIELDTYPE.TIME) {
            fromValue = fromValue ? WC.WidgetFilterHelper.ConvertTimePickerToUnixTime(fromValue) : null;
            toValue = toValue ? WC.WidgetFilterHelper.ConvertTimePickerToUnixTime(toValue) : null;
        }
        fieldDetails.targetlinedetails.fromvalue = typeof fromValue === 'number' ? parseFloat(fromValue) : null;
        fieldDetails.targetlinedetails.tovalue = typeof toValue === 'number' ? parseFloat(toValue) : null;
        self.Aggregation.details(fieldDetails);
    };
    //set input field as kendo textbox
    self.SetInputStatus = function () {
        var fieldDetails = self.Details();
        var fromvalue = fieldDetails.targetlinedetails.fromvalue !== null ? fieldDetails.targetlinedetails.fromvalue : null;
        var tovalue = fieldDetails.targetlinedetails.tovalue !== null ? fieldDetails.targetlinedetails.tovalue : null;

        var formatType = self.QueryDefinitionHandler.GetAggregationDataType(self.Aggregation, self.Field.fieldtype), uiName, formatter,formatTemplate;

        if (formatType === enumHandlers.FIELDTYPE.PERCENTAGE) {
            formatter = new Formatter({ thousandseparator: true, decimals: 0 }, formatType);
            uiName = enumHandlers.KENDOUITYPE.PERCENTAGETEXT
        }
        else if (formatType === enumHandlers.FIELDTYPE.TIME) {
            formatter = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.TIME);
            formatter.second = 'ss';
            uiName = enumHandlers.KENDOUITYPE.TIMEPICKER;
            fromvalue = fromvalue !== null ? WC.WidgetFilterHelper.ConvertUnixTimeToPicker(fromvalue) : null;
            tovalue = tovalue !== null ? WC.WidgetFilterHelper.ConvertUnixTimeToPicker(tovalue) : null;
        }
        else {
            formatter = new Formatter({ thousandseparator: true, decimals: 0 }, formatType);
            uiName = enumHandlers.KENDOUITYPE.NUMERICTEXT;
        }

        var formatTemplate = WC.FormatHelper.GetFormatter(formatter);
        if (self.Field.fieldtype === enumHandlers.FIELDTYPE.PERIOD) {
            var fromTextBox = self.BindingPeriodPicker($("#ReferenceFromValue"), formatTemplate, fromvalue);
            var toTextBox = self.BindingPeriodPicker($("#ReferenceToValue"), formatTemplate, tovalue);
            self.CheckInputReferenceTo();
            fromTextBox.numericTextbox.element.on('change', jQuery.proxy(self.CheckInputReferenceTo));
            toTextBox.numericTextbox.element.on('change', jQuery.proxy(self.ButtonStatus));
            fromTextBox.dropdownList.element.on('change', jQuery.proxy(self.CheckInputReferenceTo));
            toTextBox.dropdownList.element.on('change', jQuery.proxy(self.ButtonStatus));
        }
        else {
            var fromTextBox = self.CreateInput($("#ReferenceFromValue"), uiName, formatTemplate, fromvalue);
            var toTextBox = self.CreateInput($("#ReferenceToValue"), uiName, formatTemplate, tovalue);
            self.CheckInputReferenceTo();
            $('#ReferenceFromValue').on('change', jQuery.proxy(self.CheckInputReferenceTo));
            $('#ReferenceToValue').on('change', jQuery.proxy(self.ButtonStatus));
        }
    };
    self.CheckInputReferenceTo = function () {
        var label = $('.popup' + _self.popupName).find('#ReferenceLabel');       
        var fromTextBox = self.Field.fieldtype === enumHandlers.FIELDTYPE.PERIOD ? $("#ReferenceFromValue").data('handler').numericTextbox : $("#ReferenceFromValue").data('handler');
        var toTextBox = self.Field.fieldtype === enumHandlers.FIELDTYPE.PERIOD ? $("#ReferenceToValue").data('handler').numericTextbox : $("#ReferenceToValue").data('handler');
        self.ButtonStatus();
        fromTextBox.element.val().length ? label.removeClass('disabled') : label.addClass('disabled');        
        toTextBox.enable(fromTextBox.element.val().length);
    };
    self.GetUIData = function () {
        var targetlinedetails = {};
        var fromValue = $("#ReferenceFromValue").data('handler');
        var toValue = $("#ReferenceToValue").data('handler');
        if (self.Field.fieldtype === enumHandlers.FIELDTYPE.TIME) {
            var fromvalue = fromValue.element.val();
            var tovalue = toValue.element.val();
            var dtRegex = new RegExp(/^(?:2[0-3]|[01][0-9]).[0-5][0-9].[0-5][0-9]$/);
            dtRegex.test(fromvalue) ? fromValue.value(fromvalue) : '';
            dtRegex.test(tovalue) ? toValue.value(tovalue) : '';
            targetlinedetails.fromvalue = dtRegex.test(fromvalue) ? WC.WidgetFilterHelper.ConvertTimePickerToUnixTime(fromValue.value()) : fromvalue.length ? fromvalue : null;
            targetlinedetails.tovalue = dtRegex.test(tovalue) ? WC.WidgetFilterHelper.ConvertTimePickerToUnixTime(toValue.value()) : tovalue.length ? tovalue:null;
        }
        else if (self.Field.fieldtype === enumHandlers.FIELDTYPE.PERIOD) {
            var fromvalue = fromValue.numericTextbox.element.val();
            var tovalue = toValue.numericTextbox.element.val();
            fromvalue = !fromvalue.length && fromValue.dropdownList.element.val() !== 'day' ? 0 : fromvalue;
            tovalue = !tovalue.length && toValue.dropdownList.element.val() !== 'day' ? 0 : tovalue;
            fromValue.numericTextbox.value(fromvalue);
            toValue.numericTextbox.value(tovalue);
            targetlinedetails.fromvalue = typeof fromValue.value() === 'number' ? parseFloat(fromValue.value()) : null;
            targetlinedetails.tovalue = typeof toValue.value() === 'number' ? parseFloat(toValue.value()) : null;
        }
        else {
            var fromvalue = fromValue.element.val();
            var tovalue = toValue.element.val();
            var val = self.Field.fieldtype === enumHandlers.FIELDTYPE.PERCENTAGE ? 100 : 1;
            targetlinedetails.fromvalue = fromvalue ? parseFloat(fromvalue) / val : null;
            targetlinedetails.tovalue = tovalue ? parseFloat(tovalue) / val : null;
        }
        return targetlinedetails;
    };
    self.HasChanged = function () {
        var value1 = self.GetUIData();
        var value2 = self.Aggregation.details().targetlinedetails;
        return jQuery.deepCompare(value1, value2);
    };
    self.ButtonStatus = function () {
        var buttonSubmit = $('.popup' + _self.popupName).find('.btn-apply');
        var buttonClear = $('.popup' + _self.popupName).find('.btn-clear');
        self.HasChanged() ? buttonSubmit.addClass('disabled') : buttonSubmit.removeClass('disabled');
        var fromValue = self.Field.fieldtype === enumHandlers.FIELDTYPE.PERIOD ? $("#ReferenceFromValue").data('handler').numericTextbox.element.val() : $("#ReferenceFromValue").data('handler').element.val();
        var toValue = self.Field.fieldtype === enumHandlers.FIELDTYPE.PERIOD ? $("#ReferenceToValue").data('handler').numericTextbox.element.val() : $("#ReferenceToValue").data('handler').element.val();
        fromValue.length || toValue.length ? buttonClear.removeClass('disabled') : buttonClear.addClass('disabled');
    };
    self.ValidateTimepicker = function () {
        var fromValue = $("#ReferenceFromValue").data('handler');
        var toValue = $("#ReferenceToValue").data('handler');
        var formatType = self.QueryDefinitionHandler.GetAggregationDataType(self.Aggregation, self.Field.fieldtype);
        if (formatType === enumHandlers.FIELDTYPE.TIME) {
            if ((fromValue.value() === null && fromValue.element.val().length)
                || (toValue.value() === null && toValue.element.val().length)) {
                popup.Alert(Localization.Warning_Title, Localization.ReferencePopupWarning);
                return false;
            }
        }
        return true;
    };
    self.Apply = function () {
        if (self.HasChanged() || !self.ValidateTimepicker())
            return;
        self.SetData();
        self.ClosePopup();
    };
    self.ClosePopup = function () {
        popup.Close('.popup' + _self.popupName);
    };
    self.CreateInput = function (element, uiName, formatTemplate, value) {
        return element[uiName]({
            step: 1,
            format: formatTemplate,
            value: value
        }).data(uiName);
    };
    self.BindingPeriodPicker = function (input,format,value) {
        return input[enumHandlers.KENDOUITYPE.PERIODPICKER]({
            numericTextboxOptions: {
                format: format,
                value: value
            },
            dropdownListOptions: {
                dataSource: ko.toJS(enumHandlers.FILTERPERIODTYPES),
                defaultValue: enumHandlers.FILTERPERIODTYPES[0].Value
            }
        }).data(enumHandlers.KENDOUITYPE.PERIODPICKER);
    };
    self.UpdateLayout = function () {
        if ($('.popup' + _self.popupName).find('.btn-clear').hasClass('disabled'))
            return;
        $("#ReferenceFromValue").data('handler').value(null);
        $("#ReferenceToValue").data('handler').value(null);
        self.CheckInputReferenceTo();
    };
}