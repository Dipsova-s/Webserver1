﻿/// <chutzpah_reference path="/../../Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/TargetLineHandler.js" />

describe("TargetLineHandler", function () {
    var targetlinehadler;

    beforeEach(function () {
        var queryDefinitionHandler = {};
        var aggregation = {
            details: ko.observable({})
        };
        var field = {};
        targetlinehadler = new TargetLineHandler(queryDefinitionHandler, aggregation, field);
    });
    describe(".ShowPopup", function () {
        beforeEach(function () {
            spyOn(popup, "Show");
            spyOn(targetlinehadler, 'GetPopupSettings').and.returnValue(null);
        });
        it("should set property targetlinedetails to details", function () {
            targetlinehadler.Details();
            targetlinehadler.ShowPopup();
            expect(targetlinehadler.Details()).toEqual({ targetlinedetails: { fromvalue: null, tovalue: null } });
        });
        it("should call show popup", function () {
            targetlinehadler.ShowPopup();
            expect(popup.Show).toHaveBeenCalled();
        });
    });
    describe(".ClosePopup", function () {
        it("should call close popup", function () {
            // prepare
            spyOn(popup, "Close");
            targetlinehadler.ClosePopup();

            // assert
            expect(popup.Close).toHaveBeenCalled();
        });
    });
    describe(".CheckInputReferenceTo", function () {
        it("should disable button", function () {
            var handler1 = {
                element: {
                    val: function () { return '500'; }
                }
            };
            var handler2 = {
                value: function () { return 50; },
                enable: function () {
                    return '';
                }
            };

            spyOn($.fn, 'data').and.returnValues(handler1, handler2);
           // spyOn(to, 'enable');
            spyOn($.fn, 'addClass');
            spyOn($.fn, 'removeClass');
            spyOn(targetlinehadler, 'ButtonStatus');
            targetlinehadler.CheckInputReferenceTo();

            // assert
            // expect(to.enable).toHaveBeenCalled();
            expect($.fn.addClass).not.toHaveBeenCalled();
            expect($.fn.removeClass).toHaveBeenCalled();
            expect(targetlinehadler.ButtonStatus).toHaveBeenCalled();
        });
        it("should enable button", function () {
            // prepare
            var handler1 = {
                element: {
                    val: function () { return ''; }
                }
            };
            var handler2 = {
                value: function () { return 50; },
                enable: function () {
                    return '';
                }
            };
            spyOn($.fn, 'data').and.returnValues(handler1, handler2);
            spyOn(targetlinehadler, "HasChanged").and.returnValue(false);
            spyOn($.fn, 'addClass');
            spyOn($.fn, 'removeClass');
            spyOn(targetlinehadler, 'ButtonStatus');
            targetlinehadler.CheckInputReferenceTo();

            // assert
            expect(targetlinehadler.ButtonStatus).toHaveBeenCalled();
            expect($.fn.addClass).toHaveBeenCalled();
            expect($.fn.removeClass).not.toHaveBeenCalled();
        });
    });
    describe(".GetPopupSettings", function () {
        it("should get popup details", function () {
            var result = targetlinehadler.GetPopupSettings();
            expect(result.width).toEqual(350);
            expect(result.minHeight).toEqual(100);
            expect(result.element).toEqual('#popupReferenceLine');
            expect(result.className).toEqual('popupReferenceLine');
            expect(result.html).toContain('ReferenceFromValue');
            expect(result.html).toContain('ReferenceToValue');
        });
    });
    describe(".SetInputStatus", function () {
        it("should call function CheckInputReferenceTo and keyup event", function () {
            targetlinehadler.Details({
                targetlinedetails: { fromvalue: 0, tovalue: 0 }
            });
            targetlinehadler.QueryDefinitionHandler = {
                GetAggregationDataType: function () { return 'int'; }
            };
            spyOn(WC.FormatHelper, 'GetFormatter').and.returnValue('');
            spyOn(targetlinehadler, 'CreateInput');

            spyOn($.fn, 'on').and.returnValue(true);
            spyOn(targetlinehadler, 'CheckInputReferenceTo').and.returnValue(true);
            targetlinehadler.SetInputStatus();
            expect(targetlinehadler.CheckInputReferenceTo).toHaveBeenCalled();
            expect($.fn.on).toHaveBeenCalled();
        });
    });
    describe(".SetData", function () {
        it('should set data to targetlinedetails', function () {
            var expectedValue = {
                fromvalue: 20,
                tovalue: 50
            };
            targetlinehadler.QueryDefinitionHandler = {
                GetAggregationDataType: function () { return 'int'; }
            };
            targetlinehadler.Details({
                targetlinedetails: { fromvalue: 0, tovalue: 0 }
            });
            targetlinehadler.Aggregation.details({
                targetlinedetails: { fromvalue: 0, tovalue: 0 }
            });
            var handler1 = { value: function () { return 20; } };

            var handler2 = {
                value: function () { return 50; }
            };

            spyOn($.fn, 'data').and.returnValues(handler1, handler2);
            targetlinehadler.SetData();
            expect(targetlinehadler.Aggregation.details().targetlinedetails).toEqual(expectedValue);
        });
    });
    describe(".CreateInput", function () {
        it('should return kendoPercentageTextBox', function () {
            var formatTemplate = "#,##0 EUR";

            var uiName = enumHandlers.KENDOUITYPE.PERCENTAGETEXT;
            $.fn.kendoPercentageTextBox = $.noop;
            $.fn.kendoNumericTextBox = $.noop;
            spyOn($.fn, 'kendoNumericTextBox').and.returnValue($());
            spyOn($.fn, 'kendoPercentageTextBox').and.returnValue($());
            targetlinehadler.CreateInput($(), uiName, formatTemplate, null);

            // assert
            expect($.fn.kendoNumericTextBox).not.toHaveBeenCalled();
            expect($.fn.kendoPercentageTextBox).toHaveBeenCalled();

        });
    });
    describe(".Apply", function () {
        it('should not call setData and closepopup', function () {
            spyOn(targetlinehadler, "HasChanged").and.returnValue(true);
            spyOn(targetlinehadler, "ValidateTimepicker").and.returnValue(false);
            spyOn(targetlinehadler, "SetData");
            spyOn(targetlinehadler, "ClosePopup");
            targetlinehadler.Apply();
            expect(targetlinehadler.SetData).not.toHaveBeenCalled();
            expect(targetlinehadler.ClosePopup).not.toHaveBeenCalled();
        });
        it('should call setData and closepopup', function () {
            spyOn(targetlinehadler, "HasChanged").and.returnValue(false);
            spyOn(targetlinehadler, "ValidateTimepicker").and.returnValue(true);
            spyOn(targetlinehadler, "SetData");
            spyOn(targetlinehadler, "ClosePopup");
            targetlinehadler.Apply();
            expect(targetlinehadler.SetData).toHaveBeenCalled();
            expect(targetlinehadler.ClosePopup).toHaveBeenCalled();
        });
    });
    describe(".ButtonStatus", function () {
        it('should check value haschanged', function () {
            var handler1 = {
                element: {
                    val: function () { return 20; }
                }
            };

            var handler2 = {
                element: {
                    val: function () { return 20; }
                }
            };

            spyOn($.fn, 'data').and.returnValues(handler1, handler2);
            spyOn(targetlinehadler, "HasChanged").and.returnValue(false);
            spyOn($.fn, 'removeClass');
            targetlinehadler.ButtonStatus();
            expect($.fn.removeClass).toHaveBeenCalled();
        });
    });
    describe(".GetUIData", function () {
        it('should check value haschanged', function () {
            var expectedValue = {
                fromvalue: 20,
                tovalue: 50
            };

            targetlinehadler.QueryDefinitionHandler = {
                GetAggregationDataType: function () { return 'int'; }
            };
            var handler1 = {
                element: { val: function () { return 20; } }
            };

            var handler2 = {
                element:{ val: function () { return 50; } }
            };

            spyOn($.fn, 'data').and.returnValues(handler1, handler2);
            var result = targetlinehadler.GetUIData();
            expect(result).toEqual(expectedValue);
        });
    });
    describe(".HasChanged", function () {
        it('should return true', function () {
            targetlinehadler.Aggregation.details().targetlinedetails = { fromvalue: 10, tovalue: 20 };
            targetlinehadler.GetUIData = function () {
                return {
                    fromvalue: 10,
                    tovalue: 20
                };
            };
            var result = targetlinehadler.HasChanged();
            expect(result).toEqual(true);
        });
        it('should return false', function () {
            targetlinehadler.Aggregation.details().targetlinedetails = { fromvalue: 10, tovalue: 20 };
            targetlinehadler.GetUIData = function () {
                return {
                    fromvalue: 10,
                    tovalue: 30
                };
            };
            var result = targetlinehadler.HasChanged();
            expect(result).toEqual(false);
        });
    });
    describe(".ValidateTimepicker", function () {
        it('should return  true', function () {
            targetlinehadler.QueryDefinitionHandler = {
                GetAggregationDataType: function () { return 'int'; }
            };
            targetlinehadler.Details({
                targetlinedetails: { fromvalue: 0, tovalue: 0 }
            });
            targetlinehadler.Aggregation.details({
                targetlinedetails: { fromvalue: 0, tovalue: 0 }
            });
            var handler1 = {
                value: function () { return 20; }
            };

            var handler2 = {
                value: function () { return 50; }
            };

            spyOn($.fn, 'data').and.returnValues(handler1, handler2);
            var result = targetlinehadler.ValidateTimepicker();
            expect(result).toEqual(true);
        });
    });
    describe(".UpdateLayout", function () {
        it('should CheckInputReferenceTo function called', function () {
            var handler1 = { value: function () { return 20; } };

            var handler2 = {
                value: function () { return 50; }
            };

            spyOn($.fn, 'data').and.returnValues(handler1, handler2);
            spyOn(targetlinehadler, 'CheckInputReferenceTo');
            targetlinehadler.UpdateLayout();
            expect(targetlinehadler.CheckInputReferenceTo).toHaveBeenCalled();
        });
    });
});