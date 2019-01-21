/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displaymodel.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/validationHandler.js" />

describe("DisplayModel", function () {
    var displayModel;

    beforeEach(function () {
        displayModel = new DisplayModel();
    });

    describe(".GetCellDrillDownValue", function () {

        it("should have same value after call 'GetCellDrillDownValue' method", function () {
            for (var i = 0; i < cellDrillDownItems.length; i++) {
                expect(cellDrillDownItems[i].FieldValue).toEqual(displayModel.GetCellDrillDownValue(cellDrillDownItems[i]));
            }
        });

    });

    describe(".UpdatePublicationsWatcher", function () {

        beforeEach(function () {
            displayModel.Data({
                uri: 'display_watcher1',
                is_public: true
            });
            displayModel.Data.commit();

            jQuery.storageWatcher('__watcher_dashboard_publications_' + displayModel.Data().uri, true);
        });

        it("should set publication status for Display", function () {
            displayModel.UpdatePublicationsWatcher();

            var watcher = jQuery.storageWatcher('__watcher_dashboard_publications_' + displayModel.Data().uri);

            expect(watcher).toEqual(true);
        });

        it("should set publication status to true", function () {
            displayModel.UpdatePublicationsWatcher(true);

            var watcher = jQuery.storageWatcher('__watcher_dashboard_publications_' + displayModel.Data().uri);

            expect(watcher).toEqual(true);
        });

        it("should set publication status to false", function () {
            displayModel.UpdatePublicationsWatcher(false);

            var watcher = jQuery.storageWatcher('__watcher_dashboard_publications_' + displayModel.Data().uri);

            expect(watcher).toEqual(false);
        });

    });

    describe(".GetTimeBucketSize", function () {

        it("time bucket size should be 3600 if it is less than max value", function () {
            var bucketSize = displayModel.GetTimeBucketSize(0);
            expect(bucketSize).toEqual(3600);
        });

        it("time bucket size should be 3599 if it is equal to max value", function () {
            var bucketSize = displayModel.GetTimeBucketSize(82800);
            expect(bucketSize).toEqual(3599);
        });

        it("time bucket size should be 0 if it is more than max value", function () {
            var bucketSize = displayModel.GetTimeBucketSize(86400);
            expect(bucketSize).toEqual(0);
        });

    });

    describe(".GetDrilldownQueryStepOperator", function () {

        it("should apply equal to operator", function () {
            var result = displayModel.GetDrilldownQueryStepOperator(null, enumHandlers.FIELDTYPE.ENUM, "individual","");
            expect(result).toEqual(enumHandlers.OPERATOR.EQUALTO.Value);
        });
    });

    describe('.GetBetweenArgumentValues', function () {
        var testObjects = [
            {
                arguments: {
                    value: 0,
                    fieldType: enumHandlers.FIELDTYPE.PERCENTAGE,
                    bucketOperator: 'power10_min2'
                },
                expectedResult: {
                    lowerBound: 0,
                    upperBound: 0.0001
                }
            },
            {
                arguments: {
                    value: 10,
                    fieldType: enumHandlers.FIELDTYPE.PERCENTAGE,
                    bucketOperator: 'power10_3'
                },
                expectedResult: {
                    lowerBound: 10,
                    upperBound: 20
                }
            }
        ];

        testObjects.forEach(function (testObject) {
            var testCaseName = kendo.format('should get between argument values with {0} field type correctly: [value: {1}, bucketOperator: {2}]',
                testObject.arguments.fieldType, testObject.arguments.value, testObject.arguments.bucketOperator);
            it(testCaseName, function () {
                var actualResult = displayModel.GetBetweenArgumentValues(testObject.arguments.value, testObject.arguments.fieldType, testObject.arguments.bucketOperator);
                expect(testObject.expectedResult.lowerBound).toEqual(actualResult[0].value);
                expect(testObject.expectedResult.upperBound).toEqual(actualResult[1].value);
            });
        });
    });

    describe('.CleanNotAcceptedExecutionParameter', function () {
        it('should return empty array when queryBlocks is empty array', function () {
            var queryBlocks = [];
            var modelUri = '/models/1';
            var result = displayModel.CleanNotAcceptedExecutionParameter(queryBlocks, modelUri);
            expect(result).toEqual([]);
        });

        it('should return null when queryBlocks is null', function () {
            var queryBlocks = null;
            var modelUri = '/models/1';
            var result = displayModel.CleanNotAcceptedExecutionParameter(queryBlocks, modelUri);
            expect(result).toEqual(null);
        });

        it('should return undefined array when queryBlocks is undefined', function () {
            var queryBlocks = undefined;
            var modelUri = '/models/1';
            var result = displayModel.CleanNotAcceptedExecutionParameter(queryBlocks, modelUri);
            expect(result).toEqual(undefined);
        });

        it('should return all parameter but type is Filter', function () {
            spyOn(validationHandler, 'CheckValidExecutionParameters').and.returnValue({ IsAllValidArgument: false });
            var queryBlocks = [{
                query_steps: [
                    {
                        step_type: enumHandlers.FILTERTYPE.FILTER
                    },
                    {
                        step_type: enumHandlers.FILTERTYPE.SQLFILTER
                    },
                    {
                        step_type: enumHandlers.FILTERTYPE.FOLLOWUP
                    },
                    {
                        step_type: enumHandlers.FILTERTYPE.AGGREGATION
                    },
                    {
                        step_type: enumHandlers.FILTERTYPE.EXPRESSION_AGGREGATION
                    },
                    {
                        step_type: enumHandlers.FILTERTYPE.SORTING
                    }
                ]
            }];
            var modelUri = '/models/1';
            var result = displayModel.CleanNotAcceptedExecutionParameter(queryBlocks, modelUri);
            expect(result[0].query_steps.length).toEqual(5);
        });

        it('should return Filter parameter when Filter parameter is valid', function () {
            spyOn(validationHandler, 'CheckValidExecutionParameters').and.returnValue({ IsAllValidArgument: true });
            var queryBlocks = [{
                query_steps: [
                    {
                        step_type: enumHandlers.FILTERTYPE.FILTER
                    }
                ]
            }];
            var modelUri = '/models/1';
            var result = displayModel.CleanNotAcceptedExecutionParameter(queryBlocks, modelUri);
            expect(result[0].query_steps.length).toEqual(1);
        });
    });

    describe(".SetSwitchDisplayName", function () {

        it("should set name if drilldown from Angle page", function () {
            var switchDisplay = {
                multi_lang_name: [{}],
                multi_lang_description: [{}]
            };
            spyOn(displayModel, 'GetAdhocDisplayName').and.returnValue('name1 (1)');

            displayModel.SetSwitchDisplayName(switchDisplay, false);
            
            expect(displayModel.DisplayInfo.Displays().length).toEqual(0);
            expect($.isArray(switchDisplay.multi_lang_name)).toEqual(true);
            expect(switchDisplay.multi_lang_name.length).toEqual(1);
            expect(switchDisplay.multi_lang_name[0].text).toEqual('name1 (1)');

            expect($.isArray(switchDisplay.multi_lang_description)).toEqual(true);
            expect(switchDisplay.multi_lang_description.length).toEqual(1);
        });

        it("should set name if drilldown from Dashboard page", function () {
            var switchDisplay = {
                name: 'name1',
                description: 'description1'
            };
            spyOn(userSettingModel, 'GetByName').and.returnValue('en');
            spyOn(displayModel, 'GetAdhocDisplayName').and.returnValue('name1 (1)');

            displayModel.SetSwitchDisplayName(switchDisplay, true);
            
            expect(displayModel.DisplayInfo.Displays().length).toEqual(1);
            expect(displayModel.DisplayInfo.Displays()[0].Name).toEqual('name1');
            expect(switchDisplay.name).not.toBeDefined();
            expect($.isArray(switchDisplay.multi_lang_name)).toEqual(true);
            expect(switchDisplay.multi_lang_name.length).toEqual(1);
            expect(switchDisplay.multi_lang_name[0].lang).toEqual('en');
            expect(switchDisplay.multi_lang_name[0].text).toEqual('name1 (1)');

            expect(switchDisplay.description).not.toBeDefined();
            expect($.isArray(switchDisplay.multi_lang_description)).toEqual(true);
            expect(switchDisplay.multi_lang_description.length).toEqual(1);
            expect(switchDisplay.multi_lang_description[0].lang).toEqual('en');
            expect(switchDisplay.multi_lang_description[0].text).toEqual('description1');
        });

    });

    describe(".GetCurrentDisplayQuerySteps", function () {

        var tests = [
            {
                title: 'should get 4 filters and jumps from Angle page',
                keepFilter: true,
                isDashboardDrilldown: false,
                listFilters: {
                    'test1': 0,
                    'test2': 1
                },
                expected: 4
            },
            {
                title: 'should get 2 filters and jumps from Angle page (keepFilter=false)',
                keepFilter: false,
                isDashboardDrilldown: true,
                listFilters: {
                    'test1': 0,
                    'test2': 1
                },
                expected: 2
            },
            {
                title: 'should get 2 filters and jumps from Angle page (listFilters=undefined)',
                keepFilter: true,
                isDashboardDrilldown: false,
                listFilters: undefined,
                expected: 2
            },
            {
                title: 'should get 2 filters and jumps from Dashboard page',
                keepFilter: true,
                isDashboardDrilldown: true,
                listFilters: {
                    'test1': 0,
                    'test2': 1
                },
                expected: 2
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var querySteps = [
                    { step_type: enumHandlers.FILTERTYPE.FILTER },
                    { step_type: enumHandlers.FILTERTYPE.FOLLOWUP },
                    { step_type: enumHandlers.FILTERTYPE.AGGREGATION },
                    { step_type: enumHandlers.FILTERTYPE.SORTING },
                    { step_type: 'any' }
                ];
                spyOn(WC.Utility, 'UrlParameter').and.returnValue(JSON.stringify(test.listFilters));
                displayModel.KeepFilter(test.keepFilter);

                var newQuerySteps = displayModel.GetCurrentDisplayQuerySteps(querySteps, test.isDashboardDrilldown);
            
                expect(newQuerySteps.length).toEqual(test.expected);
            });
        });

    });

    describe(".GetSwitchDisplayQuerySteps", function () {

        var currentDisplayFilters;
        var switchDisplayQuerySteps;

        beforeEach(function () {
            currentDisplayFilters = [
                {
                    execution_parameter_id: '',
                    field: 'f1',
                    is_adhoc_filter: true,
                    is_execution_parameter: false,
                    step_type: enumHandlers.FILTERTYPE.FILTER
                }
            ];
            switchDisplayQuerySteps = [
                { step_type: enumHandlers.FILTERTYPE.FILTER, field: 'f1' },
                { step_type: enumHandlers.FILTERTYPE.FOLLOWUP, field: 'j1' },
                { step_type: enumHandlers.FILTERTYPE.AGGREGATION },
                { step_type: enumHandlers.FILTERTYPE.SORTING }
            ];
        });

        it("should get correct query steps (keepDisplayFilters=false)", function () {
            var keepDisplayFilters = false;
            var newQuerySteps = displayModel.GetSwitchDisplayQuerySteps(currentDisplayFilters, switchDisplayQuerySteps, keepDisplayFilters);
            
            expect(newQuerySteps.length).toEqual(3);
            expect(newQuerySteps[0].step_type).toEqual(enumHandlers.FILTERTYPE.FILTER);
            expect(newQuerySteps[1].step_type).toEqual(enumHandlers.FILTERTYPE.SORTING);
            expect(newQuerySteps[2].step_type).toEqual(enumHandlers.FILTERTYPE.AGGREGATION);
        });

        it("should get correct query steps (keepDisplayFilters=true)", function () {
            var keepDisplayFilters = true;
            var newQuerySteps = displayModel.GetSwitchDisplayQuerySteps(currentDisplayFilters, switchDisplayQuerySteps, keepDisplayFilters);
            
            expect(newQuerySteps.length).toEqual(4);
            expect(newQuerySteps[0].step_type).toEqual(enumHandlers.FILTERTYPE.FILTER);
            expect(newQuerySteps[1].step_type).toEqual(enumHandlers.FILTERTYPE.FOLLOWUP);
            expect(newQuerySteps[2].step_type).toEqual(enumHandlers.FILTERTYPE.SORTING);
            expect(newQuerySteps[3].step_type).toEqual(enumHandlers.FILTERTYPE.AGGREGATION);
        });

    });

});
