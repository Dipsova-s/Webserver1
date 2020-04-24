/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepAggregationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleUserSpecificHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleBusinessProcessHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/ResultHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/BaseItemHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayOverviewHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayDrilldownHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/Pivot/PivotHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/Pivot/PivotOptionsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayResultHandler/BaseDisplayResultHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayResultHandler/DisplayPivotResultHandler.js" />

describe("DisplayPivotResultHandler", function () {
    var displayPivotResultHandler;
    beforeEach(function () {
        var displayHandler = new DisplayHandler({ display_type: 'pivot' }, new AngleHandler());
        displayPivotResultHandler = new DisplayPivotResultHandler(displayHandler);
    });

    describe("constructor", function () {
        it('should set DisplayHandler', function () {
            // assert
            expect(displayPivotResultHandler.DisplayHandler instanceof DisplayHandler).toEqual(true);
        });
    });

    describe(".ShowAggregationOptions", function () {
        var optionHandler;
        beforeEach(function () {
            optionHandler = { ShowPopup: $.noop };
            spyOn(optionHandler, 'ShowPopup');
            spyOn(window, 'PivotOptionsHandler').and.returnValue(optionHandler);
        });
        it('should not show a popup', function () {
            // prepare
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'CanChangeAggregationOptions').and.returnValue(false);
            displayPivotResultHandler.ShowAggregationOptions();

            // assert
            expect(optionHandler.ShowPopup).not.toHaveBeenCalled();
        });
        it('should show a popup', function () {
            // prepare
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'CanChangeAggregationOptions').and.returnValue(true);
            displayPivotResultHandler.ShowAggregationOptions();

            // assert
            expect(optionHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".EnsureAggregationOptions", function () {
        var optionHandler;
        beforeEach(function () {
            optionHandler = { SetOptions: $.noop };
            spyOn(optionHandler, 'SetOptions');
            spyOn(window, 'PivotOptionsHandler').and.returnValue(optionHandler);
        });
        it('should update options', function () {
            // prepare
            displayPivotResultHandler.EnsureAggregationOptions();

            // assert
            expect(optionHandler.SetOptions).toHaveBeenCalled();
        });
    });

    describe(".InitialAggregationUI", function () {
        it('should set texts', function () {
            // prepare
            spyOn(displayPivotResultHandler, 'SetAggregationTexts');
            displayPivotResultHandler.InitialAggregationUI();

            // assert
            expect(displayPivotResultHandler.SetAggregationTexts).toHaveBeenCalled();
        });
    });

    describe(".SetAggregationTexts", function () {
        it('should set texts', function () {
            // prepare
            displayPivotResultHandler.SetAggregationTexts();

            // assert
            var texts = displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler.Texts();
            expect(texts.AggregationTitle).toEqual(Captions.Title_AggregationPivot);
            expect(texts.AggregationHeaderRow).toEqual(Localization.PivotRowArea);
            expect(texts.AggregationHeaderColumn).toEqual(Localization.PivotColumnArea);
            expect(texts.AggregationHeaderData).toEqual(Localization.PivotDataArea);
            expect(texts.AggregationConfirmDiscardChanges).toEqual(kendo.format(Localization.PopupConfirmDiscardChangeFieldSettingAndContinue, 'pivot'));
        });
    });

    describe(".SetAggregationFormatTexts", function () {
        it('should set texts', function () {
            // prepare
            var texts = {};
            displayPivotResultHandler.SetAggregationFormatTexts(texts);

            // assert
            expect(texts.HeaderAlias).toEqual(Localization.NameAsShowInPivot);
        });
    });

    describe(".GetAggregationFieldLimit", function () {
        it('should get a limit', function () {
            // prepare
            var result = displayPivotResultHandler.GetAggregationFieldLimit();

            // assert
            expect(result).toEqual(Infinity);
        });
    });

    describe(".CanChangeCountFieldState", function () {
        it('can change count field state', function () {
            // prepare
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([{}, {}, {}]);
            var result = displayPivotResultHandler.CanChangeCountFieldState();

            // assert
            expect(result).toEqual(true);
        });
        it('cannot change count field state', function () {
            // prepare
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationDataFields').and.returnValue([{}]);
            var result = displayPivotResultHandler.CanChangeCountFieldState();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".CanSortField", function () {
        var tests = [
            {
                data: {
                    area: 'any',
                    valid: true,
                    is_selected: true,
                    authorization: true
                },
                expected: true
            },
            {
                data: {
                    area: 'data',
                    valid: true,
                    is_selected: true,
                    authorization: true
                },
                expected: false
            },
            {
                data: {
                    area: 'any',
                    valid: false,
                    is_selected: true,
                    authorization: true
                },
                expected: false
            },
            {
                data: {
                    area: 'any',
                    valid: true,
                    is_selected: false,
                    authorization: true
                },
                expected: false
            },
            {
                data: {
                    area: 'any',
                    valid: true,
                    is_selected: true,
                    authorization: false
                },
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            var title = test.expected ? 'can sort field ' : 'cannot sort field ';
            title += JSON.stringify(test.data);
            it(title, function () {
                // prepare
                var aggregation = {
                    area: ko.observable(test.data.area),
                    valid: ko.observable(test.data.valid),
                    is_selected: ko.observable(test.data.is_selected)
                };
                spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler.Authorizations, 'CanChangeAggregation').and.returnValue(test.data.authorization);
                var result = displayPivotResultHandler.CanSortField(aggregation);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".SortField", function () {
        it('should be ascending (current=)', function () {
            // prepare
            var aggregation = { sorting: ko.observable('') };
            displayPivotResultHandler.SortField(aggregation);

            // assert
            expect(aggregation.sorting()).toEqual('asc');
        });
        it('should be ascending (current=asc)', function () {
            // prepare
            var aggregation = { sorting: ko.observable('desc') };
            displayPivotResultHandler.SortField(aggregation);

            // assert
            expect(aggregation.sorting()).toEqual('asc');
        });
        it('should be descending (current=desc)', function () {
            // prepare
            var aggregation = { sorting: ko.observable('asc') };
            displayPivotResultHandler.SortField(aggregation);

            // assert
            expect(aggregation.sorting()).toEqual('desc');
        });
    });

    describe(".GetAggregationSortingClassName", function () {
        it('should get icon (no sorting)', function () {
            // prepare
            var aggregation = { sorting: ko.observable('') };
            var result = displayPivotResultHandler.GetAggregationSortingClassName(aggregation);

            // assert
            expect(result).toEqual('icon-sort-asc');
        });
        it('should get icon (ascending)', function () {
            // prepare
            var aggregation = { sorting: ko.observable('asc') };
            var result = displayPivotResultHandler.GetAggregationSortingClassName(aggregation);

            // assert
            expect(result).toEqual('icon-sort-asc');
        });
        it('should get icon (descending)', function () {
            // prepare
            var aggregation = { sorting: ko.observable('desc') };
            var result = displayPivotResultHandler.GetAggregationSortingClassName(aggregation);

            // assert
            expect(result).toEqual('icon-sort-desc');
        });
    });

    describe(".ValidateAggregation", function () {
        it('should be valid', function () {
            // prepare
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(false);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(false);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationRowFields').and.returnValue([
                { is_selected: ko.observable(true) }
            ]);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationColumnFields').and.returnValue([
                { is_selected: ko.observable(true) }
            ]);
            spyOn(popup, 'Alert');
            var result = displayPivotResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });

        it('should not be valid (has error)', function () {
            // prepare
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(true);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(false);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationRowFields').and.returnValue([
                { is_selected: ko.observable(true) }
            ]);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationColumnFields').and.returnValue([
                { is_selected: ko.observable(true) }
            ]);
            spyOn(popup, 'Alert');
            var result = displayPivotResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });

        it('should not be valid (has a duplicated)', function () {
            // prepare
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(false);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(true);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationRowFields').and.returnValue([
                { is_selected: ko.observable(true) }
            ]);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationColumnFields').and.returnValue([
                { is_selected: ko.observable(true) }
            ]);
            spyOn(popup, 'Alert');
            var result = displayPivotResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });

        it('should not be valid (no field)', function () {
            // prepare
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasErrorAggregationField').and.returnValue(false);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'HasDuplicatedAggregationDataField').and.returnValue(false);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationRowFields').and.returnValue([]);
            spyOn(displayPivotResultHandler.DisplayHandler.QueryDefinitionHandler, 'GetAggregationColumnFields').and.returnValue([]);
            spyOn(popup, 'Alert');
            var result = displayPivotResultHandler.ValidateAggregation();

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
    });
});
