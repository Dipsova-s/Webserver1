/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displaymodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/FieldSettingsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/validationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usermodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />

describe("DisplayModel", function () {
    var displayModel;
    beforeEach(function () {
        displayModel = new DisplayModel();
        createMockHandler(window, 'anglePageHandler', {
            HandlerAngle: {
                AddDisplay: $.noop
            }
        });
    });
    afterEach(function () {
        restoreMockHandlers();
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
            var result = displayModel.GetDrilldownQueryStepOperator(null, enumHandlers.FIELDTYPE.ENUM, "individual", "");
            expect(result).toEqual(enumHandlers.OPERATOR.EQUALTO.Value);
        });
    });

    describe(".GenerateDrilldownQueryStep", function () {
        var fieldSettings = {
            DisplayType: 'pivot',
            ComponentType: {
                PIVOT: 'pivot'
            },
            GetFields: function () {
                return {
                    findObject: function () {
                        return { DataType: 'type' };
                    }
                };
            }
        };

        var bucket = {
            Operator: 'operator',
            source_field: 'source field'
        };

        it("should generate drilldown query step", function () {
            spyOn(displayModel, 'GetDrilldownQueryStepOperator').and.returnValue('operator');
            spyOn(displayModel, 'GetDrilldownQueryStepArguments').and.returnValue('arguments');

            var result = displayModel.GenerateDrilldownQueryStep(fieldSettings, bucket, "id", "value");

            expect(result.step_type).toEqual(enumHandlers.FILTERTYPE.FILTER);
            expect(result.field).toEqual('source field');
            expect(result.operator).toEqual('operator');
            expect(result.arguments).toEqual('arguments');
            expect(result.is_adhoc_filter).toEqual(true);
            expect(result.is_adhoc).toEqual(true);
            expect(result.is_applied).toEqual(true);
        });
    });

    describe('.GetBetweenArgumentValues', function () {
        var testObjects = [
            {
                arguments: {
                    value: 0,
                    fieldType: 'percentage',
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
                    fieldType: 'percentage',
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

        it("should get between argument values with eight decimal places", function () {

            var testObject = {
                arguments: {
                    value: 0.09990404,
                    fieldType: enumHandlers.FIELDTYPE.PERCENTAGE,
                    bucketOperator: 'power10_min2'
                },
                expectedResult: {
                    lowerBound: 0.09990404,
                    upperBound: 0.10000404
                }
            };

            var actualResult = displayModel.GetBetweenArgumentValues(
                testObject.arguments.value, testObject.arguments.fieldType, testObject.arguments.bucketOperator);

            expect(testObject.expectedResult.lowerBound).toEqual(actualResult[0].value);
            expect(testObject.expectedResult.upperBound).toEqual(actualResult[1].value);
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
        it('should get 2 filters and jumps from Angle page', function () {
            var querySteps = [
                { step_type: enumHandlers.FILTERTYPE.FILTER },
                { step_type: enumHandlers.FILTERTYPE.FOLLOWUP },
                { step_type: enumHandlers.FILTERTYPE.AGGREGATION },
                { step_type: enumHandlers.FILTERTYPE.SORTING },
                { step_type: 'any' }
            ];

            var newQuerySteps = displayModel.GetCurrentDisplayQuerySteps(querySteps);
            expect(newQuerySteps.length).toEqual(2);
        });

    });

    describe(".GetSwitchDisplayQuerySteps", function () {

        var currentDisplayFilters;
        var switchDisplayQuerySteps;

        beforeEach(function () {
            currentDisplayFilters = [
                {
                    execution_parameter_id: 'e1',
                    field: 'f1',
                    is_adhoc_filter: true,
                    is_adhoc: true,
                    is_applied: true,
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

            expect(newQuerySteps[0].is_adhoc_filter).toEqual(true);
            expect(newQuerySteps[0].is_adhoc).toEqual(true);
            expect(newQuerySteps[0].is_applied).toEqual(true);
            expect(newQuerySteps[0].is_execution_parameter).toEqual(false);
            expect(newQuerySteps[0].execution_parameter_id).toEqual('e1');
        });

        it("should get correct query steps (keepDisplayFilters=true)", function () {
            var keepDisplayFilters = true;
            var newQuerySteps = displayModel.GetSwitchDisplayQuerySteps(currentDisplayFilters, switchDisplayQuerySteps, keepDisplayFilters);
            expect(newQuerySteps.length).toEqual(5);
            expect(newQuerySteps[0].step_type).toEqual(enumHandlers.FILTERTYPE.FILTER);
            expect(newQuerySteps[1].step_type).toEqual(enumHandlers.FILTERTYPE.FILTER);
            expect(newQuerySteps[2].step_type).toEqual(enumHandlers.FILTERTYPE.FOLLOWUP);
            expect(newQuerySteps[3].step_type).toEqual(enumHandlers.FILTERTYPE.SORTING);
            expect(newQuerySteps[4].step_type).toEqual(enumHandlers.FILTERTYPE.AGGREGATION);

            expect(newQuerySteps[0].is_adhoc_filter).toEqual(true);
            expect(newQuerySteps[0].is_adhoc).toEqual(true);
            expect(newQuerySteps[0].is_applied).toEqual(true);
            expect(newQuerySteps[0].is_execution_parameter).toEqual(false);
            expect(newQuerySteps[0].execution_parameter_id).toEqual('e1');
        });

    });

    describe(".CreateDisplayFromChartOrPivot", function () {
        it("should call NormalizeDataDisplayFromChartOrPivot to remove unused data", function () {
            // mock
            spyOn(displayQueryBlockModel, 'CollectQueryBlocks').and.returnValue([{
                "query_steps": [{
                    "aggregation_fields": [{
                        "field": "count",
                        "operator": "count"
                    }],
                    "step_type": "aggregation"
                }],
                "queryblock_type": "query_steps"
            }]);
            spyOn(displayModel, 'Data').and.returnValue({ id: 123, fields: [] });
            spyOn(displayModel, 'NormalizeDataDisplayFromChartOrPivot');
            spyOn(displayModel, 'CreateTempDisplay').and.returnValue({ uri: 'test' });
            spyOn(displayModel, 'GotoTemporaryDisplay');
            spyOn(userModel, 'Data').and.returnValue({
                uri: 'test',
                full_name: 'full name'
            });

            // action
            displayModel.CreateDisplayFromChartOrPivot('pivot');

            // expect
            expect(displayModel.NormalizeDataDisplayFromChartOrPivot).toHaveBeenCalled();
        });
    });

    describe(".NormalizeDataDisplayFromChartOrPivot", function () {
        it("should remove unused data", function () {
            // mock
            var display = {
                id: 123,
                uri: 'abc',
                display_type: 'type',
                user_specific: {},
                authorizations: {},
                is_angle_default: true,
                is_public: true,
                changed: {},
                results: {},
                uri_template: '',
                used_in_task: true,
                query_blocks: [{
                    "query_steps": [{
                        "aggregation_fields": [{
                            "field": "count",
                            "operator": "count"
                        }],
                        "step_type": "aggregation"
                    }],
                    "queryblock_type": "query_steps"
                }]
            };

            // action
            displayModel.NormalizeDataDisplayFromChartOrPivot(display);

            // expect
            expect(display.id).toBeUndefined();
            expect(display.uri).toBeUndefined();
            expect(display.display_type).toBeUndefined();
            expect(display.user_specific).toBeUndefined();
            expect(display.authorizations).toBeUndefined();
            expect(display.is_angle_default).toBeUndefined();
            expect(display.is_public).toBeUndefined();
            expect(display.changed).toBeUndefined();
            expect(display.results).toBeUndefined();
            expect(display.uri_template).toBeUndefined();
            expect(display.used_in_task).toBeUndefined();
            expect(display.query_blocks).not.toEqual(null);
        });
    });

    describe(".SetTemporaryDisplay", function () {
        it("should store temp display in local storage when value is not null", function () {

            var displayUri = 'display_uri';
            var value = { display_name: 'display_name' };

            displayModel.TemporaryDisplay({});
            spyOn(jQuery, 'localStorage');

            displayModel.SetTemporaryDisplay(displayUri, value);

            expect(displayModel.TemporaryDisplay()).toEqual({ display_uri: value });
            expect(jQuery.localStorage).toHaveBeenCalledWith('temp_displays', { display_uri: value });
        });

        it("should clear temp display in local storage when value is null", function () {

            var displayUri = 'display_uri';
            var value = null;

            displayModel.TemporaryDisplay({ display_uri: { display_name: 'display_name' } });
            var infoData = {
                display_definitions: {
                    removeObject: $.noop
                }
            };
            spyOn(infoData.display_definitions, 'removeObject');
            spyOn(angleInfoModel, 'Data').and.returnValue(infoData);
            spyOn(angleInfoModel.Data, 'commit');
            spyOn(jQuery, 'localStorage');

            displayModel.SetTemporaryDisplay(displayUri, value);

            expect(displayModel.TemporaryDisplay()).toEqual({});
            expect(jQuery.localStorage).toHaveBeenCalledWith('temp_displays', {});
        });
    });

    describe(".CreateTempDisplay", function () {
        it("should get adhoc Display data", function () {
            var data = {
                is_angle_default: true,
                used_in_task: true,
                uri_template: '/models/1/angles/2/displays/3',
                user_specific: {
                    is_user_default: true,
                    execute_on_login: true
                },
                other: 'yes'
            };
            userModel.Data({
                uri: '/users/1',
                full_name: 'My Name'
            });
            angleInfoModel.Data({ display_definitions: [] });
            angleInfoModel.Data.commit();
            spyOn(jQuery, 'GUID').and.returnValue('mnop-qrst-uvwx-yz');
            spyOn(WC.DateHelper, 'GetCurrentUnixTime').and.returnValue(1000000);
            spyOn(WC.Utility, 'UrlParameter').and.returnValue('/models/1/angles/abcd-efgh-ijhl');
            spyOn(displayModel, 'GetDefaultAdhocAuthorization').and.returnValue({
                'update_user_specific': false,
                'delete': false,
                'make_angle_default': false,
                'publish': false,
                'unpublish': false,
                'update': true
            });
            spyOn(displayModel, 'SetTemporaryDisplay');
            spyOn(angleInfoModel, 'SetData');
            $.when(displayModel.CreateTempDisplay('list', data))
                .done(function (result) {
                    expect(result.id).toEqual('dmnopqrstuvwxyz');
                    expect(result.display_type).toEqual('list');
                    expect(result.uri).toEqual('/models/1/angles/abcd-efgh-ijhl/displays/mnop-qrst-uvwx-yz');
                    expect(result.is_angle_default).toEqual(true);
                    expect(result.authorizations).toEqual({
                        'update_user_specific': false,
                        'delete': false,
                        'make_angle_default': false,
                        'publish': false,
                        'unpublish': false,
                        'update': true
                    });
                    expect(result.used_in_task).toBeUndefined();
                    expect(result.uri_template).toBeUndefined();
                    expect(result.user_specific).toEqual({
                        is_user_default: false,
                        execute_on_login: false
                    });
                    expect(result.is_public).toEqual(false);
                    expect(result.is_adhoc).toEqual(true);
                    expect(result.created).toEqual({
                        user: '/users/1',
                        datetime: 1000000,
                        full_name: 'My Name'
                    });
                    expect(result.other).toEqual('yes');
                    expect(displayModel.SetTemporaryDisplay).toHaveBeenCalled();
                    expect(angleInfoModel.SetData).toHaveBeenCalled();
                });
        });
    });
});
