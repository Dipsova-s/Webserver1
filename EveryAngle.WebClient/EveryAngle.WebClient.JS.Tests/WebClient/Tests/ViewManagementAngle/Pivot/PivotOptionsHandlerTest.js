/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Pivot/PivottHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Pivot/PivotOptionsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Pivot/PivotOptionsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SaveDisplaysUsedInAutomationTasksHandler.js" />

describe("PivotOptionsHandler", function () {
    var pivotOptionsHandler;
    beforeEach(function () {
        pivotOptionsHandler = new PivotOptionsHandler(new DisplayHandler({ display_type: 'pivot' }, new AngleHandler({})));
        jQuery.each(pivotOptionsHandler.Data, function (_index, model) {
            model.valid(true);
        });
    });

    describe(".Initial", function () {
        it('should set DisplayHandler', function () {
            // assert
            expect(pivotOptionsHandler.DisplayHandler instanceof DisplayHandler).toEqual(true);
            $.each(pivotOptionsHandler.Data, function (index, data) {
                if (data.options.length) {
                    expect(data.options.findObjects('is_default', true).length).toEqual(1);
                }
            });
        });
    });

    describe(".SetOptions", function () {
        it('should set options', function () {
            // prepare
            pivotOptionsHandler.Data.show_total_for.value('3');
            pivotOptionsHandler.Data.totals_location.value('1');
            pivotOptionsHandler.Data.include_subtotals.valid(false);
            pivotOptionsHandler.Data.include_subtotals.value('my-new-include_subtotals');
            spyOn(pivotOptionsHandler, 'GetOptions').and.returnValue({
                others: 'my-others',
                show_total_for: '0',
                totals_location: 'my-old-totals_location',
                include_subtotals: 'my-old-include_subtotals'
            });
            pivotOptionsHandler.SetOptions();

            // assert
            var result = pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler.AggregationOptions();
            expect(result.others).toEqual('my-others');
            expect(result.show_total_for).toEqual(3);
            expect(result.totals_location).toEqual(1);
            expect(result.include_subtotals).not.toBeDefined();
        });
    });

    describe(".SetValidOptions", function () {
        it('should set valid=true by default', function () {
            // prepare
            spyOn(pivotOptionsHandler, 'CheckTotalOptions');
            spyOn(pivotOptionsHandler, 'HasTimeDataType').and.returnValue(false);
            pivotOptionsHandler.SetValidOptions();

            // assert
            expect(pivotOptionsHandler.Data.show_total_for.valid()).toEqual(true);
            expect(pivotOptionsHandler.Data.totals_location.valid()).toEqual(true);
            expect(pivotOptionsHandler.Data.include_subtotals.valid()).toEqual(true);
            expect(pivotOptionsHandler.Data.percentage_summary_type.valid()).toEqual(true);
            expect(pivotOptionsHandler.CheckTotalOptions).toHaveBeenCalled();
        });
        it('should set valid for time data type', function () {
            // prepare
            spyOn(pivotOptionsHandler, 'CheckTotalOptions');
            spyOn(pivotOptionsHandler, 'HasTimeDataType').and.returnValue(true);
            pivotOptionsHandler.SetValidOptions();

            // assert
            expect(pivotOptionsHandler.Data.show_total_for.valid()).toEqual(true);
            expect(pivotOptionsHandler.Data.show_total_for.value()).toEqual('0');
            expect(pivotOptionsHandler.Data.totals_location.valid()).toEqual(true);
            expect(pivotOptionsHandler.Data.include_subtotals.valid()).toEqual(true);
            expect(pivotOptionsHandler.Data.percentage_summary_type.valid()).toEqual(true);
            expect(pivotOptionsHandler.Data.percentage_summary_type.value()).toEqual('0');
            expect(pivotOptionsHandler.CheckTotalOptions).toHaveBeenCalled();
        });
    });

    describe(".GetValueOrDefault", function () {
        var tests = [
            {
                title: 'should get a default value (show_total_for)',
                id: 'show_total_for',
                value: undefined,
                expected: '1'
            },
            {
                title: 'should get a default value (totals_location)',
                id: 'totals_location',
                value: undefined,
                expected: '1'
            },
            {
                title: 'should get a default value (include_subtotals)',
                id: 'include_subtotals',
                value: undefined,
                expected: false
            },
            {
                title: 'should get a default value (percentage_summary_type)',
                id: 'percentage_summary_type',
                value: undefined,
                expected: '0'
            },
            {
                title: 'should get a value (show_total_for)',
                id: 'show_total_for',
                value: 3,
                expected: '3'
            },
            {
                title: 'should get a value (totals_location)',
                id: 'totals_location',
                value: 0,
                expected: '0'
            },
            {
                title: 'should get a value (include_subtotals)',
                id: 'include_subtotals',
                value: true,
                expected: true
            },
            {
                title: 'should get a value (percentage_summary_type)',
                id: 'percentage_summary_type',
                value: 1,
                expected: '1'
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                var result = pivotOptionsHandler.GetValueOrDefault(test.value, pivotOptionsHandler.Data[test.id]);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".HasTimeDataType", function () {
        it('should be false', function () {
            // prepare
            pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler.Aggregation([
                { is_selected: ko.observable(false) },
                { is_selected: ko.observable(true) }
            ]);
            spyOn(modelFieldsHandler, 'GetFieldById');
            spyOn(pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataType').and.returnValue('int');
            var result = pivotOptionsHandler.HasTimeDataType();

            // assert
            expect(result).toEqual(false);
        });
        it('should be true', function () {
            // prepare
            pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler.Aggregation([
                { is_selected: ko.observable(false) },
                { is_selected: ko.observable(true) }
            ]);
            spyOn(modelFieldsHandler, 'GetFieldById');
            spyOn(pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataType').and.returnValue('time');
            var result = pivotOptionsHandler.HasTimeDataType();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".CanApplyAggregation", function () {
        it("Should check if Aggregation can be applied", function () {
            // prepare
            spyOn(pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'CanApplyAggregation');
            pivotOptionsHandler.CanApplyAggregation();

            // assert
            expect(pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler.CanApplyAggregation).toHaveBeenCalled();
        })
    });

    describe(".ApplyAggregation", function () {
        it("should apply the aggregation changes", function () {
            // Prepare
            spyOn(pivotOptionsHandler, 'HasChanged').and.returnValue(true);
            spyOn(pivotOptionsHandler, 'SetOptions');
            spyOn(pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'ApplyAggregation');
            pivotOptionsHandler.ApplyAggregation();

            // assert
            expect(pivotOptionsHandler.SetOptions).toHaveBeenCalled();
            expect(pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler.ApplyAggregation).toHaveBeenCalled();
        })

        it("should not apply the aggregation changes", function() {
            spyOn(pivotOptionsHandler, 'HasChanged').and.returnValue(false);
            spyOn(pivotOptionsHandler, 'SetOptions');
            spyOn(pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler, 'ApplyAggregation');
            pivotOptionsHandler.ApplyAggregation();

             // assert
            expect(pivotOptionsHandler.SetOptions).not.toHaveBeenCalled();
            expect(pivotOptionsHandler.DisplayHandler.QueryDefinitionHandler.ApplyAggregation).not.toHaveBeenCalled();

        })
    });

    describe(".HasChanged", function () {
        it('should be false', function () {
            // prepare
            var result = pivotOptionsHandler.HasChanged();

            // assert
            expect(result).toEqual(false);
        });
        it('should be true', function () {
            // prepare
            pivotOptionsHandler.Data.include_subtotals.valid(true);
            pivotOptionsHandler.Data.include_subtotals.value(true);
            var result = pivotOptionsHandler.HasChanged();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".ShowPopup", function () {
        var element;
        beforeEach(function () {
            element = $('<div id="PopupAggregationOptions"/>');
            element.appendTo('body');
            
            spyOn(popup, 'Show');
            spyOn(pivotOptionsHandler, 'GetPopupOptions');
            spyOn($, 'clickOutside');
        });
        afterEach(function () {
            element.remove();
        });
        it('should show popup', function () {
            // prepare
            element.hide();
            pivotOptionsHandler.ShowPopup();

            // assert
            expect(popup.Show).toHaveBeenCalled();
            expect($.clickOutside).toHaveBeenCalled();
        });
        it('should not show popup', function () {
            // prepare
            element.show();
            pivotOptionsHandler.ShowPopup();

            // assert
            expect(popup.Show).not.toHaveBeenCalled();
            expect($.clickOutside).not.toHaveBeenCalled();
        });
    });

    describe(".CheckClickOutside", function () {
        var element;
        beforeEach(function () {
            element = $('<div id="PopupAggregationOptions"/>');
            element.appendTo('body');
            
            spyOn(pivotOptionsHandler, 'ClosePopup');
        });
        afterEach(function () {
            element.remove();
        });
        it('should close popup', function () {
            // prepare
            var e = { target: $() };
            element.show();
            spyOn($.fn, 'closest').and.returnValue($());
            pivotOptionsHandler.CheckClickOutside(e);

            // assert
            expect(pivotOptionsHandler.ClosePopup).toHaveBeenCalled();
        });
        it('should not close popup (popup is hidden)', function () {
            // prepare
            var e = { target: $() };
            element.hide();
            spyOn($.fn, 'closest').and.returnValue($());
            pivotOptionsHandler.CheckClickOutside(e);

            // assert
            expect(pivotOptionsHandler.ClosePopup).not.toHaveBeenCalled();
        });
        it('should not close popup (has closest element)', function () {
            // prepare
            var e = { target: $() };
            element.show();
            spyOn($.fn, 'closest').and.returnValue($('<div/>'));
            pivotOptionsHandler.CheckClickOutside(e);

            // assert
            expect(pivotOptionsHandler.ClosePopup).not.toHaveBeenCalled();
        });
    });

    describe(".ClosePopup", function () {
        it('should close popup', function () {
            // prepare
            spyOn(popup, 'Close');
            pivotOptionsHandler.ClosePopup();

            // assert
            expect(popup.Close).toHaveBeenCalled();
        });
    });

    describe(".OnPopupClose", function () {
        it('should destroy popup', function () {
            // prepare
            spyOn(popup, 'Destroy');
            pivotOptionsHandler.OnPopupClose({});

            // assert
            expect(popup.Destroy).toHaveBeenCalled();
        });
    });

    describe(".GetPopupOptions", function () {
        it('should get popup options', function () {
            // prepare
            spyOn($.fn, 'offset').and.returnValue({ left: 100, top: 50 });
            var result = pivotOptionsHandler.GetPopupOptions();

            // assert
            expect(result.position).toEqual({ left: 125, top: 40 });
            expect(result.resizable).toEqual(false);
            expect(result.actions.length).toEqual(0);
        });
    });

    describe(".ShowPopupCallback", function () {
        var element;
        beforeEach(function () {
            element = $('<div class="k-overlay"/>').css('opacity', 0.5);
            element.appendTo('body');
        });
        afterEach(function () {
            element.remove();
        });
        it('should initial UI', function () {
            // prepare
            WC.Window.Height = 200;
            spyOn($.fn, 'offset').and.returnValue({ top: 100 });
            spyOn($.fn, 'outerHeight').and.returnValue(200);
            spyOn(pivotOptionsHandler, 'InitialUI');
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            pivotOptionsHandler.ShowPopupCallback({ sender: { element: $(), wrapper: $() } });

            // assert
            expect(element.css('opacity')).toEqual('0');
            expect(pivotOptionsHandler.InitialUI).toHaveBeenCalled();
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
        });
    });

    describe(".InitialUI", function () {
        it('should initial UI', function () {
            // prepare
            spyOn(pivotOptionsHandler, 'CreateDropdown');
            spyOn(pivotOptionsHandler, 'CreateCheckbox');
            spyOn(pivotOptionsHandler, 'CreateRadio');
            pivotOptionsHandler.InitialUI();

            // assert
            expect(pivotOptionsHandler.CreateDropdown).toHaveBeenCalledTimes(2);
            expect(pivotOptionsHandler.CreateCheckbox).toHaveBeenCalledTimes(1);
            expect(pivotOptionsHandler.CreateRadio).toHaveBeenCalledTimes(1);
        });
    });

    describe(".CheckTotalOptions", function () {
        it('should set valid=false', function () {
            // prepare
            pivotOptionsHandler.CheckTotalOptions('0');

            // assert
            expect(pivotOptionsHandler.Data.totals_location.valid()).toEqual(false);
            expect(pivotOptionsHandler.Data.include_subtotals.valid()).toEqual(false);
        });
        
        it('should set valid=true', function () {
            // prepare
            pivotOptionsHandler.CheckTotalOptions('1');

            // assert
            expect(pivotOptionsHandler.Data.totals_location.valid()).toEqual(true);
            expect(pivotOptionsHandler.Data.include_subtotals.valid()).toEqual(true);
        });
    });

    describe(".CreateCheckbox", function () {
        it('should create checkbox and set value', function () {
            // prepare
            var element = $('<input type="checkbox"/>');
            pivotOptionsHandler.Data.include_subtotals.value(true);
            spyOn(pivotOptionsHandler, 'HasTimeDataType').and.returnValue(true);
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'on').and.returnValue($());
            pivotOptionsHandler.CreateCheckbox(element, pivotOptionsHandler.Data.include_subtotals);

            // assert
            expect(element.prop('checked')).toEqual(true);
            expect(element.prop('disabled')).toEqual(true);
            expect($.fn.off).toHaveBeenCalled();
            expect($.fn.on).toHaveBeenCalled();
        });
    });

    describe(".CheckboxChange", function () {
        it('should set value', function () {
            // prepare
            var e = { currentTarget: { checked: true } };
            pivotOptionsHandler.Data.include_subtotals.value(false);
            pivotOptionsHandler.CheckboxChange('include_subtotals', e);

            // assert
            expect(pivotOptionsHandler.Data.include_subtotals.value()).toEqual(true);
        });
    });

    describe(".CreateRadio", function () {
        it('should create radio and set value', function () {
            // prepare
            var element = $('<input type="radio"/>');
            pivotOptionsHandler.Data.totals_location.value(true);
            spyOn(pivotOptionsHandler, 'HasTimeDataType').and.returnValue(true);
            spyOn($.fn, 'filter').and.returnValue(element);
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'on').and.returnValue($());
            pivotOptionsHandler.CreateRadio(element, pivotOptionsHandler.Data.totals_location);

            // assert
            expect(element.prop('checked')).toEqual(true);
            expect(element.prop('disabled')).toEqual(true);
            expect($.fn.filter).toHaveBeenCalled();
            expect($.fn.off).toHaveBeenCalled();
            expect($.fn.on).toHaveBeenCalled();
        });
    });

    describe(".RadioChange", function () {
        it('should set value', function () {
            // prepare
            var e = { currentTarget: { value: '1' } };
            pivotOptionsHandler.Data.totals_location.value('0');
            pivotOptionsHandler.RadioChange('totals_location', e);

            // assert
            expect(pivotOptionsHandler.Data.totals_location.value()).toEqual('1');
        });
    });

    describe(".CreateDropdown", function () {
        it('should create dropdown and set value', function () {
            // prepare
            var dropdown = { value: ko.observable(null), enable: ko.observable(null) };
            pivotOptionsHandler.Data.show_total_for.value('my-value');
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(dropdown);
            spyOn(pivotOptionsHandler, 'HasTimeDataType').and.returnValue(true);
            pivotOptionsHandler.CreateDropdown($(), pivotOptionsHandler.Data.show_total_for);

            // assert
            expect(dropdown.value()).toEqual('my-value');
            expect(dropdown.enable()).toEqual(false);
        });
    });

    describe(".DropdownOpen", function () {
        it('should add css class name to dropdown popup', function () {
            // prepare
            var e = {
                sender: {
                    popup: { element: $('<div/>') }
                }
            };
            pivotOptionsHandler.DropdownOpen(e);

            // assert
            expect(e.sender.popup.element.hasClass('aggregation-option-dropdown')).toEqual(true);
        });
    });

    describe(".DropdownChange", function () {
        it('should set value', function () {
            // prepare
            var e = { sender: { value: ko.observable('my-value') } };
            pivotOptionsHandler.Data.show_total_for.value(null);
            spyOn(pivotOptionsHandler, 'CheckTotalOptions');
            pivotOptionsHandler.DropdownChange('show_total_for', e);

            // assert
            expect(pivotOptionsHandler.Data.show_total_for.value()).toEqual('my-value');
            expect(pivotOptionsHandler.CheckTotalOptions).toHaveBeenCalled();
        });
    });
});
