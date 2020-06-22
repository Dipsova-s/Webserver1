/// <chutzpah_reference path="/../../Dependencies/ViewManagement/User/UserSettingsPanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayAggregationFormatHandler.js" />

describe("DisplayAggregationFormatHandler", function () {
    var handler, aggregation;
    beforeEach(function () {
        aggregation = new AggregationFieldViewModel({ source_field: 'my-field' }, '', {}, [{ lang: 'en', text: 'my-alias-name' }], true);
        handler = new DisplayAggregationFormatHandler(
            new QueryDefinitionHandler({}),
            aggregation,
            {}
        );
    });
    describe("contructor", function () {
        it("should initial", function () {
            // assert
            expect(handler.QueryDefinitionHandler).not.toEqual(null);
            expect(handler.Aggregation).not.toEqual(null);
            expect(handler.Field).not.toEqual(null);
        });
    });
    describe(".ShowPopup", function () {
        it("should show popup", function () {
            // prepare
            spyOn(popup, 'Show');
            handler.ShowPopup();

            // assert
            expect(popup.Show).toHaveBeenCalled();
        });
    });
    describe(".ClosePopup", function () {
        it("should close popup", function () {
            // prepare
            spyOn(popup, 'Close');
            handler.ClosePopup();

            // assert
            expect(popup.Close).toHaveBeenCalled();
        });
    });
    describe(".GetPopupOptions", function () {
        it("should get popup options", function () {
            // prepare
            var result = handler.GetPopupOptions('my-title');

            // assert
            expect(result.element).toEqual('#PopupAggregationFormat');
            expect(result.title).toEqual('my-title');
            expect(result.html).toContain('input-alias-value');
            expect(result.html).toContain('input-operator-value');
            expect(result.html).toContain('input-unit-value');
            expect(result.html).toContain('input-decimal-value');
            expect(result.html).toContain('input-format-value');
            expect(result.html).toContain('input-second-value');
            expect(result.html).toContain('input-thousand-separator-value');
            expect(result.scrollable).toEqual(false);
            expect(result.resizable).toEqual(false);
        });
    });
    describe(".ShowPopupCallback", function () {
        it("should create UI", function () {
            // prepare
            spyOn(handler, 'SetHeaderOperatorText');
            spyOn(handler, 'SetTexts');
            spyOn(handler, 'InitialData');
            spyOn(handler, 'InitialUI');
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            handler.ShowPopupCallback({ sender: { element: $('<div/>') } });

            // assert
            expect(handler.SetHeaderOperatorText).toHaveBeenCalled();
            expect(handler.SetTexts).toHaveBeenCalled();
            expect(handler.InitialData).toHaveBeenCalled();
            expect(handler.InitialUI).toHaveBeenCalled();
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
        });
    });
    describe(".SetHeaderOperatorText", function () {
        it("should set text for data area", function () {
            // prepare
            handler.Aggregation.area('data');
            handler.SetHeaderOperatorText(handler.Aggregation);

            // assert
            expect(handler.Texts().HeaderOperator).toEqual(Localization.Aggregation);
        });
        it("should set text for other area", function () {
            // prepare
            handler.Aggregation.area('row');
            handler.SetHeaderOperatorText(handler.Aggregation);

            // assert
            expect(handler.Texts().HeaderOperator).toEqual(Localization.Bucket);
        });
    });
    describe(".InitialData", function () {
        it("should initial data", function () {
            // prepare
            spyOn(handler, 'SetData');
            spyOn(handler, 'UpdateValues');
            spyOn(handler.QueryDefinitionHandler, 'GetAggregationName').and.returnValue('my-alias');
            spyOn(handler, 'GetThousandSeparatorValue').and.returnValue('my-thousandseparator');
            handler.InitialData();

            // assert
            expect(handler.Data.alias.value()).toEqual('my-alias');
            expect(handler.Data.thousandseparator.value()).toEqual('my-thousandseparator');
            expect(handler.SetData).toHaveBeenCalled();
            expect(handler.UpdateValues).toHaveBeenCalled();
        });
    });
    describe(".InitialUI", function () {
        it("should initial UI", function () {
            // prepare
            spyOn(handler, 'UpdateUI');
            handler.InitialUI($());

            // assert
            expect(handler.UpdateUI).toHaveBeenCalled();
        });
    });
    describe(".HasChanged", function () {
        it("should be true", function () {
            // prepare
            spyOn($.fn, 'removeClass');
            handler.AddSubscribers();
            handler.Data.format.value(true);
            var result = handler.HasChanged();

            // assert
            expect(result).toEqual(true);
            expect($.fn.removeClass).toHaveBeenCalled();
        });
        it("should be false", function () {
            // prepare
            spyOn($.fn, 'removeClass');
            handler.AddSubscribers();
            var result = handler.HasChanged();

            // assert
            expect(result).toEqual(false);
            expect($.fn.removeClass).not.toHaveBeenCalled();
        });
    });
    describe(".UpdateUI", function () {
        it("should update UI", function () {
            // prepare
            spyOn(handler, 'CreateDropdown');
            handler.UpdateUI($());

            // assert
            expect(handler.CreateDropdown).toHaveBeenCalledTimes(5);
        });
    });
    describe(".CreateDropdown", function () {
        it("should create dropdown and set value", function () {
            // prepare
            var dropdown = { value: ko.observable(null) };
            spyOn(WC.HtmlHelper, 'DropdownList').and.returnValue(dropdown);
            handler.CreateDropdown($(), { value: function () { return 'my-value'; } }, $.noop);

            // assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
            expect(dropdown.value()).toEqual('my-value');
        });
    });
    describe(".OperatorChanged", function () {
        var e;
        beforeEach(function () {
            e = {
                sender: {
                    value: ko.observable('my-operator')
                }
            };
            spyOn(handler.QueryDefinitionHandler, 'GetAggregationName').and.returnValues('my-name', 'my-name2');
            spyOn(handler, 'SetData');
            spyOn(handler, 'UpdateValues');
            spyOn(handler, 'UpdateUI');
        });
        it("should update UI and alias value", function () {
            // prepare
            handler.Data.alias.value('my-name');
            handler.OperatorChanged(e);

            // assert
            expect(handler.Data.alias.value()).toEqual('my-name2');
            expect(handler.SetData).toHaveBeenCalled();
            expect(handler.UpdateValues).toHaveBeenCalled();
            expect(handler.UpdateUI).toHaveBeenCalled();
            expect(handler.Aggregation.operator()).toEqual('my-operator');
            expect(handler.Aggregation.field()).toEqual('my-operator_my-field');
        });
        it("should update UI but alias value", function () {
            // prepare
            handler.Data.alias.value('another-name');
            handler.OperatorChanged(e);

            // assert
            expect(handler.Data.alias.value()).toEqual('another-name');
            expect(handler.SetData).toHaveBeenCalled();
            expect(handler.UpdateValues).toHaveBeenCalled();
            expect(handler.UpdateUI).toHaveBeenCalled();
            expect(handler.Aggregation.operator()).toEqual('my-operator');
            expect(handler.Aggregation.field()).toEqual('my-operator_my-field');
        });
    });
    describe(".UnitChanged", function () {
        it("should set details and update values", function () {
            // prepare
            var e = {
                sender: {
                    value: ko.observable('my-value')
                }
            };
            spyOn(dataTypeModel, 'GetCorrectPrefix').and.returnValue('new-value');
            spyOn(handler, 'SetDetails');
            spyOn(handler, 'UpdateValues');
            handler.UnitChanged(e);

            // assert
            expect(handler.SetDetails).toHaveBeenCalled();
            expect(handler.UpdateValues).toHaveBeenCalled();
        });
    });
    describe(".DecimalChanged", function () {
        it("should set details and update values", function () {
            // prepare
            var e = {
                sender: {
                    value: ko.observable('my-value')
                }
            };
            spyOn(handler, 'SetDetails');
            spyOn(handler, 'UpdateValues');
            handler.DecimalChanged(e);

            // assert
            expect(handler.SetDetails).toHaveBeenCalled();
            expect(handler.UpdateValues).toHaveBeenCalled();
        });
    });
    describe(".FormatChanged", function () {
        it("should set details and update values", function () {
            // prepare
            var e = {
                sender: {
                    value: ko.observable('my-value')
                }
            };
            spyOn(handler, 'SetDetails');
            spyOn(handler, 'UpdateValues');
            handler.FormatChanged(e);

            // assert
            expect(handler.SetDetails).toHaveBeenCalled();
            expect(handler.UpdateValues).toHaveBeenCalled();
        });
    });
    describe(".SecondChanged", function () {
        it("should set details and update values", function () {
            // prepare
            var e = {
                sender: {
                    value: ko.observable('my-value')
                }
            };
            spyOn(handler, 'SetDetails');
            spyOn(handler, 'UpdateValues');
            handler.SecondChanged(e);

            // assert
            expect(handler.SetDetails).toHaveBeenCalled();
            expect(handler.UpdateValues).toHaveBeenCalled();
        });
    });
    describe(".SetDetails", function () {
        it("should set details", function () {
            // prepare
            handler.Aggregation.details({});
            handler.SetDetails('property', 'my-value', 'my-final-value');

            // assert
            expect(handler.Aggregation.details()['property']).toEqual('my-final-value');
        });
        it("should unset details (usedefault)", function () {
            // prepare
            handler.Aggregation.details({ property: 'another-value' });
            handler.SetDetails('property', enumHandlers.FIELDSETTING.USEDEFAULT, 'my-final-value');

            // assert
            expect(handler.Aggregation.details()['property']).not.toBeDefined();
        });
        it("should unset details (null)", function () {
            // prepare
            handler.Aggregation.details({ property: 'another-value' });
            handler.SetDetails('property', null, 'my-final-value');

            // assert
            expect(handler.Aggregation.details()['property']).not.toBeDefined();
        });
    });
    describe(".ResetData", function () {
        it("should reset valid and options", function () {
            // prepare
            $.each(handler.Data, function (_name, setting) {
                setting.value('my-value');
                setting.valid(true);
                setting.options = [{}, {}];
            });
            handler.ResetData();

            // assert
            $.each(handler.Data, function (_name, setting) {
                expect(setting.value()).toEqual('my-value');
                expect(setting.valid()).toEqual(false);
                expect(setting.options.length).toEqual(0);
            });
        });
    });
    describe(".SetData", function () {
        var tests = [
            {
                title: 'should set data (area=data, field=count, operator=count)',
                fieldtype: 'int',
                area: 'data',
                operator: 'count',
                expected: {
                    alias_valid: false,
                    alias_options: 0,
                    operator_valid: false,
                    operator_options: 0,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=text, operator=any)',
                fieldtype: 'text',
                area: 'row',
                operator: 'any',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 41,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=enumerated, operator=individual)',
                fieldtype: 'enumerated',
                area: 'row',
                operator: 'individual',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 21,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: true,
                    format_options: 4,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=enumerated, operator=left2)',
                fieldtype: 'enumerated',
                area: 'row',
                operator: 'left2',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 21,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=boolean, operator=any)',
                fieldtype: 'boolean',
                area: 'row',
                operator: 'any',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 1,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=date, operator=any)',
                fieldtype: 'date',
                area: 'row',
                operator: 'any',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=datetime, operator=any)',
                fieldtype: 'datetime',
                area: 'row',
                operator: 'any',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=time, operator=any)',
                fieldtype: 'time',
                area: 'row',
                operator: 'any',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 1,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: true,
                    second_options: 3,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=timespan, operator=any)',
                fieldtype: 'timespan',
                area: 'row',
                operator: 'any',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 7,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: true,
                    second_options: 3,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=period, operator=any)',
                fieldtype: 'period',
                area: 'row',
                operator: 'any',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=int, operator=individual)',
                fieldtype: 'int',
                area: 'row',
                operator: 'individual',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 10,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=int, operator=power10_1)',
                fieldtype: 'int',
                area: 'row',
                operator: 'power10_1',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 10,
                    unit_valid: true,
                    unit_options: 2,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=int, operator=power10_3)',
                fieldtype: 'int',
                area: 'row',
                operator: 'power10_3',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 10,
                    unit_valid: true,
                    unit_options: 3,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=int, operator=power10_6)',
                fieldtype: 'int',
                area: 'row',
                operator: 'power10_6',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 10,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=double, operator=power10_min3)',
                fieldtype: 'double',
                area: 'row',
                operator: 'power10_min3',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 13,
                    unit_valid: true,
                    unit_options: 2,
                    decimal_valid: true,
                    decimal_options: 8,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=currency, operator=power10_0)',
                fieldtype: 'currency',
                area: 'row',
                operator: 'power10_0',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 13,
                    unit_valid: true,
                    unit_options: 2,
                    decimal_valid: true,
                    decimal_options: 8,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=row, field=percentage, operator=power10_0)',
                fieldtype: 'percentage',
                area: 'row',
                operator: 'power10_0',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 13,
                    unit_valid: true,
                    unit_options: 2,
                    decimal_valid: true,
                    decimal_options: 8,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=int, operator=sum)',
                fieldtype: 'int',
                area: 'data',
                operator: 'sum',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=int, operator=count_valid)',
                fieldtype: 'int',
                area: 'data',
                operator: 'count_valid',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=int, operator=average)',
                fieldtype: 'int',
                area: 'data',
                operator: 'average',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: true,
                    decimal_options: 8,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=double, operator=sum)',
                fieldtype: 'double',
                area: 'data',
                operator: 'sum',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: true,
                    decimal_options: 8,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=double, operator=count_valid)',
                fieldtype: 'double',
                area: 'data',
                operator: 'count_valid',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=double, operator=average)',
                fieldtype: 'double',
                area: 'data',
                operator: 'average',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: true,
                    decimal_options: 8,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=period, operator=sum)',
                fieldtype: 'period',
                area: 'data',
                operator: 'sum',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=period, operator=count_valid)',
                fieldtype: 'period',
                area: 'data',
                operator: 'count_valid',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=period, operator=average)',
                fieldtype: 'period',
                area: 'data',
                operator: 'average',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: true,
                    decimal_options: 8,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=timespan, operator=sum)',
                fieldtype: 'timespan',
                area: 'data',
                operator: 'sum',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: true,
                    second_options: 3,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=timespan, operator=count_valid)',
                fieldtype: 'timespan',
                area: 'data',
                operator: 'count_valid',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=timespan, operator=average)',
                fieldtype: 'timespan',
                area: 'data',
                operator: 'average',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 6,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: true,
                    second_options: 3,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=time, operator=min)',
                fieldtype: 'time',
                area: 'data',
                operator: 'min',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options:5,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: true,
                    second_options: 3,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=time, operator=count_valid)',
                fieldtype: 'time',
                area: 'data',
                operator: 'count_valid',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 5,
                    unit_valid: true,
                    unit_options: 4,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: false,
                    second_options: 0,
                    thousandseparator_valid: true,
                    thousandseparator_options: 0
                }
            },
            {
                title: 'should set data (area=data, field=time, operator=average)',
                fieldtype: 'time',
                area: 'data',
                operator: 'average',
                expected: {
                    alias_valid: true,
                    alias_options: 0,
                    operator_valid: true,
                    operator_options: 5,
                    unit_valid: false,
                    unit_options: 0,
                    decimal_valid: false,
                    decimal_options: 0,
                    format_valid: false,
                    format_options: 0,
                    second_valid: true,
                    second_options: 3,
                    thousandseparator_valid: false,
                    thousandseparator_options: 0
                }
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                handler.Field.fieldtype = test.fieldtype;
                spyOn(handler.Aggregation, 'area').and.returnValue(test.area);
                spyOn(handler.Aggregation, 'operator').and.returnValue(test.operator);
                spyOn(handler.Aggregation, 'is_count_field').and.returnValue(test.operator === 'count');
                handler.SetData(handler.Aggregation);

                // assert
                expect(handler.Data.alias.valid()).toEqual(test.expected.alias_valid);
                expect(handler.Data.alias.options.length).toEqual(test.expected.alias_options);
                expect(handler.Data.operator.valid()).toEqual(test.expected.operator_valid);
                expect(handler.Data.operator.options.length).toEqual(test.expected.operator_options);
                expect(handler.Data.unit.valid()).toEqual(test.expected.unit_valid);
                expect(handler.Data.unit.options.length).toEqual(test.expected.unit_options);
                expect(handler.Data.decimal.valid()).toEqual(test.expected.decimal_valid);
                expect(handler.Data.decimal.options.length).toEqual(test.expected.decimal_options);
                expect(handler.Data.format.valid()).toEqual(test.expected.format_valid);
                expect(handler.Data.format.options.length).toEqual(test.expected.format_options);
                expect(handler.Data.second.valid()).toEqual(test.expected.second_valid);
                expect(handler.Data.second.options.length).toEqual(test.expected.second_options);
                expect(handler.Data.thousandseparator.valid()).toEqual(test.expected.thousandseparator_valid);
                expect(handler.Data.thousandseparator.options.length).toEqual(test.expected.thousandseparator_options);
            });
        });
    });
    describe(".UpdateValues", function () {
        it("should update values", function () {
            // prepare
            handler.Aggregation.operator('my-operator');
            spyOn(userSettingsPanelHandler, 'GetPrefixDropdownValue');
            spyOn(dataTypeModel, 'GetCorrectPrefix').and.returnValue('my-unit');
            spyOn(userSettingsPanelHandler, 'GetDecimalDropdownValue').and.returnValue('my-decimal');
            spyOn(userSettingsPanelHandler, 'GetEnumDropdownValue').and.returnValue('my-format');
            spyOn(userSettingsPanelHandler, 'GetSecondDropdownValue').and.returnValue('my-second');
            handler.UpdateValues(handler.Aggregation);

            // assert
            expect(handler.Data.operator.value()).toEqual('my-operator');
            expect(handler.Data.unit.value()).toEqual('my-unit');
            expect(handler.Data.decimal.value()).toEqual('my-decimal');
            expect(handler.Data.format.value()).toEqual('my-format');
            expect(handler.Data.second.value()).toEqual('my-second');
        });
    });
    describe(".GetOperatorsByType", function () {
        var tests = [
            { fieldtype: 'boolean', expected: 1 },
            { fieldtype: 'text', expected: 41 },
            { fieldtype: 'enumerated', expected: 21 },
            { fieldtype: 'double', expected: 13 },
            { fieldtype: 'currency', expected: 13 },
            { fieldtype: 'percentage', expected: 13 },
            { fieldtype: 'int', expected: 10 },
            { fieldtype: 'date', expected: 6 },
            { fieldtype: 'datetime', expected: 6 },
            { fieldtype: 'period', expected: 6 },
            { fieldtype: 'timespan', expected: 7 },
            { fieldtype: 'time', expected: 1 },
            { fieldtype: 'another', expected: 0 }
        ];
        $.each(tests, function (index, test) {
            it("should get operators (field=" + test.fieldtype + ")", function () {
                // prepare
                var result = handler.GetOperatorsByType(test.fieldtype);

                // assert
                expect(result.length).toEqual(test.expected);
            });
        });
    });
    describe(".AddOperatorOption", function () {
        var tests = [
            { aggregation: 'count', fieldtype: 'any', expected: 0 },
            { aggregation: 'sum', fieldtype: 'time', expected: 0 },
            { aggregation: 'average', fieldtype: 'time', expected: 1 },
            { aggregation: 'max', fieldtype: 'time', expected: 1 },
            { aggregation: 'min', fieldtype: 'any', expected: 1 },
            { aggregation: 'max', fieldtype: 'any', expected: 1 },
            { aggregation: 'average', fieldtype: 'any', expected: 1 },
            { aggregation: 'average_valid', fieldtype: 'any', expected: 1 },
            { aggregation: 'count_valid', fieldtype: 'any', expected: 1 }
        ];
        $.each(tests, function (index, test) {
            it("should update operator (aggregation=" + test.aggregation + ", field=" + test.fieldtype + ")", function () {
                // prepare
                var aggregation = { Value: test.aggregation };
                var options = [];
                handler.AddOperatorOption(aggregation, test.fieldtype, options);

                // assert
                expect(options.length).toEqual(test.expected);
            });
        });
    });
    describe(".AddUseDefaultOption", function () {
        it("should insert a user default option", function () {
            // prepare
            var result = handler.AddUseDefaultOption([{ id: 'option1' }, { id: 'option2' }]);

            // assert
            expect(result.length).toEqual(3);
            expect(result[0].id).toEqual('usedefault');
        });
    });
    describe(".IsAliasPlaceholder", function () {
        it("should be a placeholder", function () {
            // prepare
            handler.Data.alias.value('my-name');
            spyOn(handler.QueryDefinitionHandler, 'GetAggregationDefaultName').and.returnValue('my-name');
            var result = handler.IsAliasPlaceholder();

            // assert
            expect(result).toEqual(true);
        });
        it("should not be a placeholder", function () {
            // prepare
            handler.Data.alias.value('my-alias-name');
            spyOn(handler.QueryDefinitionHandler, 'GetAggregationDefaultName').and.returnValue('my-name');
            var result = handler.IsAliasPlaceholder();

            // assert
            expect(result).toEqual(false);
        });
    });
    describe(".GetMultiLangAlias", function () {
        it("should include NL text", function () {
            // prepare
            handler.Data.alias.value('my-nl-name');
            spyOn(handler, 'IsAliasPlaceholder').and.returnValue(false);
            spyOn(userSettingModel, 'GetByName').and.returnValue('nl');
            var result = handler.GetMultiLangAlias();

            // assert
            expect(result.length).toEqual(2);
            expect(result[0].lang).toEqual('en');
            expect(result[0].text).toEqual('my-alias-name');
            expect(result[1].lang).toEqual('nl');
            expect(result[1].text).toEqual('my-nl-name');
        });
        it("should clear all", function () {
            // prepare
            handler.Data.alias.value('my-name');
            spyOn(handler, 'IsAliasPlaceholder').and.returnValue(true);
            spyOn(userSettingModel, 'GetByName').and.returnValue('en');
            var result = handler.GetMultiLangAlias();

            // assert
            expect(result.length).toEqual(0);
        });
    });
    describe(".GetThousandSeparatorValue", function () {
        it("should get true", function () {
            // prepare
            var details = { thousandseparator: true };
            var result = handler.GetThousandSeparatorValue(details);

            // assert
            expect(result).toEqual(true);
        });
        it("should get false", function () {
            // prepare
            var details = { thousandseparator: false };
            var result = handler.GetThousandSeparatorValue(details);

            // assert
            expect(result).toEqual(false);
        });
        it("should get null", function () {
            // prepare
            var details = {};
            var result = handler.GetThousandSeparatorValue(details);

            // assert
            expect(result).toEqual(null);
        });
    });
    describe(".Apply", function () {
        it("should not set valid values to aggregation", function () {
            // prepare
            spyOn(handler, 'HasChanged').and.returnValue(false);
            spyOn(handler, 'ApplyCallback');
            spyOn(popup, 'Close');
            handler.Apply();

            // assert
            expect(handler.ApplyCallback).not.toHaveBeenCalled();
            expect(popup.Close).not.toHaveBeenCalled();
        });
        it("should set valid values to aggregation", function () {
            // prepare
            handler.Data.unit.valid(true);
            handler.Data.decimal.valid(true);
            handler.Data.format.valid(false);
            handler.Data.second.valid(false);
            handler.Data.thousandseparator.valid(true);
            handler.Data.thousandseparator.value(null);
            handler.Aggregation.details({
                prefix: 'M',
                decimals: 2,
                format: 'sln',
                second: 'ss',
                thousandseparator: false,
                other: 'xx'
            });
            handler.Aggregation.operator('my');
            handler.Aggregation.field('my_field');
            spyOn(handler, 'HasChanged').and.returnValue(true);
            spyOn(handler, 'GetMultiLangAlias').and.returnValue([{}, {}]);
            spyOn(handler, 'ApplyCallback');
            spyOn(popup, 'Close');
            handler.Apply();

            // assert
            expect(aggregation.details().prefix).toEqual('M');
            expect(aggregation.details().decimals).toEqual(2);
            expect(aggregation.details().format).not.toBeDefined();
            expect(aggregation.details().second).not.toBeDefined();
            expect(aggregation.details().thousandseparator).not.toBeDefined();
            expect(aggregation.details().other).toEqual('xx');
            expect(aggregation.multi_lang_alias().length).toEqual(2);
            expect(aggregation.operator()).toEqual('my');
            expect(aggregation.field()).toEqual('my_field');
            expect(handler.ApplyCallback).toHaveBeenCalled();
            expect(popup.Close).toHaveBeenCalled();
        });
    });
});