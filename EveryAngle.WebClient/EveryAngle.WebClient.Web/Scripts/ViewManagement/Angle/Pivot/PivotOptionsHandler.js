function PivotOptionsHandler(displayHandler) {
    "use strict";

    var _self = {};
    _self.$container = jQuery();
    _self.defaultTotalFor = '1';
    _self.defaultPercentageType = '0';
    _self.timeTypeTotalFor = '0';
    _self.timeTypePercentageType = '0';
    _self.values = {};
    _self.convertToString = function (value) {
        return value + '';
    };
    _self.convertToNumber = function (value) {
        return WC.Utility.ToNumber(value);
    };

    var self = this;
    self.DisplayHandler = null;
    self.View = new PivotOptionsView();
    self.Data = {
        show_total_for: {
            title: Captions.Pivot_Option_Totals,
            value: ko.observable(null),
            input: _self.convertToString,
            output: _self.convertToNumber,
            valid: ko.observable(false),
            ui: PivotOptionsHandler.UI.Dropdown,
            options: jQuery.map(enumHandlers.PIVOTSHOWTOTALMODES, function (option) {
                return {
                    id: option.id,
                    name: option.name,
                    is_default: option.id === _self.defaultTotalFor
                };
            })
        },
        totals_location: {
            title: '',
            value: ko.observable(null),
            valid: ko.observable(false),
            input: _self.convertToString,
            output: _self.convertToNumber,
            ui: PivotOptionsHandler.UI.Radio,
            options: [
                {
                    id: enumHandlers.PIVOTTOTALSLOCATION.NEAR.Value,
                    name: enumHandlers.PIVOTTOTALSLOCATION.NEAR.Name
                },
                {
                    id: enumHandlers.PIVOTTOTALSLOCATION.FAR.Value,
                    name: enumHandlers.PIVOTTOTALSLOCATION.FAR.Name,
                    is_default: true
                }
            ]
        },
        include_subtotals: {
            title: Captions.Pivot_Option_IncludeSubtotals,
            value: ko.observable(false),
            valid: ko.observable(false),
            ui: PivotOptionsHandler.UI.Checkbox,
            options: []
        },
        percentage_summary_type: {
            title: Captions.Pivot_Option_Percentages,
            value: ko.observable(null),
            input: _self.convertToString,
            output: _self.convertToNumber,
            valid: ko.observable(false),
            ui: PivotOptionsHandler.UI.Dropdown,
            options: jQuery.map(enumHandlers.PERCENTAGESUMMARYTYPES, function (option) {
                return {
                    id: option.id,
                    name: option.name,
                    is_default: option.id === _self.defaultPercentageType
                };
            })
        }
    };

    // general
    self.Initial = function (displayHandler) {
        self.DisplayHandler = displayHandler;
        self.SetValidOptions();
        self.SetValues();
    };
    self.GetOptions = function () {
        return self.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
    };
    self.SetOptions = function () {
        // update values
        var options = self.GetOptions();        
        jQuery.each(self.Data, function (id, model) {
            if (model.valid())
                options[id] = model.output ? model.output(model.value()) : model.value();
            else
                delete options[id];
        });

        // commit
        self.DisplayHandler.QueryDefinitionHandler.AggregationOptions(options);
    };
    self.SetValidOptions = function () {
        jQuery.each(self.Data, function (_index, model) {
            model.valid(true);
        });

        if (self.HasTimeDataType()) {
            self.Data.show_total_for.value(_self.timeTypeTotalFor);
            self.Data.percentage_summary_type.value(_self.timeTypePercentageType);
        }

        var showTotalFor = self.GetValueOrDefault(self.GetOptions().show_total_for, self.Data.show_total_for);
        self.CheckTotalOptions(showTotalFor);
    };
    self.SetValues = function () {
        var options = self.GetOptions();
        jQuery.each(self.Data, function (id, data) {
            var value = self.GetValueOrDefault(options[id], data);
            _self.values[id] = value;
            data.value(value);
        });
    };
    self.GetValueOrDefault = function (value, data) {
        if (typeof value === 'undefined')
            value = !data.options.length ? data.value() : data.options.findObject('is_default', true).id;
        return data.input ? data.input(value) : value; 
    };
    self.HasTimeDataType = function () {
        var hasTime = false;
        jQuery.each(self.DisplayHandler.QueryDefinitionHandler.Aggregation(), function (index, aggregation) {
            if (!aggregation.is_selected())
                return;

            var modelField = ko.toJS(modelFieldsHandler.GetFieldById(aggregation.source_field, aggregation.model) || { fieldtype: enumHandlers.FIELDTYPE.INTEGER });
            var dataType = self.DisplayHandler.QueryDefinitionHandler.GetAggregationDataType(aggregation, modelField.fieldtype);
            if (dataType === enumHandlers.FIELDTYPE.TIME) {
                hasTime = true;
                return false;
            }
        });
        return hasTime;
    };
    self.HasChanged = function () {
        var hasChanged = false;

        // check others
        jQuery.each(self.Data, function (id, model) {
            if (model.valid() && model.value() !== _self.values[id]) {
                hasChanged = true;
                return false;
            }
        });

        return hasChanged;
    };

    // popup
    self.ShowPopup = function () {
        if (jQuery('#PopupAggregationOptions').is(':visible'))
            return;

        var options = self.GetPopupOptions();
        popup.Show(options);
        jQuery.clickOutside('.aggregation-options-popup', self.CheckClickOutside);
    };
    self.CheckClickOutside = function (e) {
        var excepts = '.section-aggregation .action-options, .aggregation-options-popup, .aggregation-option-dropdown';
        if (jQuery('#PopupAggregationOptions').is(':visible')
            && !jQuery(e.target).closest(excepts).length) {
            self.ClosePopup();
        }
    };
    self.ClosePopup = function () {
        popup.Close('#PopupAggregationOptions');
    };
    self.OnPopupClose = function (e) {
        if (self.HasChanged()) {
            self.DisplayHandler.QueryDefinitionHandler.OpenAggregationPanel();
            self.SetOptions();
        }
        popup.Destroy(e);
    };
    self.GetPopupOptions = function () {
        var position = jQuery('.section-aggregation .action-options').offset();
        position.top -= 10;
        position.left += 25;
        return {
            element: '#PopupAggregationOptions',
            html: self.View.GetTemplate(self.Data),
            className: 'aggregation-options-popup',
            actions: [],
            width: 280,
            minHeight: 100,
            resizable: false,
            center: false,
            position: position,
            open: self.ShowPopupCallback,
            close: self.OnPopupClose
        };
    };
    self.ShowPopupCallback = function (e) {
        jQuery('.k-overlay').css('opacity', 0);
        _self.$container = e.sender.element;
        self.InitialUI();
        WC.HtmlHelper.ApplyKnockout(self, _self.$container);

        var space = 10;
        var popupBoundary = { top: e.sender.wrapper.offset().top };
        popupBoundary.bottom = popupBoundary.top + e.sender.wrapper.outerHeight();
        if (popupBoundary.bottom > WC.Window.Height - space) {
            e.sender.wrapper.css('top', popupBoundary.top - (popupBoundary.bottom - WC.Window.Height) - space);
        }
    };
    self.InitialUI = function () {
        var mappers = {};
        mappers[PivotOptionsHandler.UI.Dropdown] = self.CreateDropdown;
        mappers[PivotOptionsHandler.UI.Checkbox] = self.CreateCheckbox;
        mappers[PivotOptionsHandler.UI.Radio] = self.CreateRadio;
        jQuery.each(self.Data, function (id, model) {
            var element = _self.$container.find('input[name="' + id + '"]');
            mappers[model.ui](element, model);
        });
        self.CheckTotalOptions(self.Data.show_total_for.value());
    };
    self.CheckTotalOptions = function (showTotalFor) {
        var disableTotals = _self.convertToNumber(showTotalFor) === 0;
        self.Data.totals_location.valid(!disableTotals);
        self.Data.include_subtotals.valid(!disableTotals);
    };

    // checkbox UI
    self.CreateCheckbox = function (element, model) {
        element
            .prop('disabled', self.HasTimeDataType())
            .prop('checked', model.value())
            .off('change').on('change', jQuery.proxy(self.CheckboxChange, self, model.id));
    };
    self.CheckboxChange = function (id, e) {
        var value = e.currentTarget.checked;
        var model = self.Data[id];
        model.value(value);
    };

    // radio UI
    self.CreateRadio = function (element, model) {
        element
            .prop('disabled', self.HasTimeDataType())
            .off('change').on('change', jQuery.proxy(self.RadioChange, self, model.id))
            .filter('[value="' + model.value() + '"]')
            .prop('checked', true);
    };
    self.RadioChange = function (id, e) {
        var value = e.currentTarget.value;
        var model = self.Data[id];
        model.value(value);
    };

    // dropdown UI
    self.CreateDropdown = function (element, model) {
        var dropdown = WC.HtmlHelper.DropdownList(element, model.options, {
            open: self.DropdownOpen,
            change: jQuery.proxy(self.DropdownChange, self, model.id)
        });
        dropdown.enable(!self.HasTimeDataType());
        dropdown.value(model.value());
    };
    self.DropdownOpen = function (e) {
        e.sender.popup.element.addClass('aggregation-option-dropdown');
    };
    self.DropdownChange = function (id, e) {
        var value = e.sender.value();
        var model = self.Data[id];
        model.value(value);
        self.CheckTotalOptions(self.Data.show_total_for.value());
    };

    // constructur
    self.Initial(displayHandler);
}

PivotOptionsHandler.UI = {
    Dropdown: 'dropdown',
    Checkbox: 'checkbox',
    Radio: 'radio'
};