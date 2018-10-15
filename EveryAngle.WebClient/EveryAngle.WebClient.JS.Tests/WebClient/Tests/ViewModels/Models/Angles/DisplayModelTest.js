/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displaymodel.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/validationHandler.js" />

describe("DisplayModel", function () {
    var displayModel;

    beforeEach(function () {
        displayModel = new DisplayModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(displayModel).toBeDefined();
        });

    });

    describe("It should get correct drilldown value", function () {

        it("should have same value after call 'GetCellDrillDownValue' method", function () {
            for (var i = 0; i < cellDrillDownItems.length; i++) {
                expect(cellDrillDownItems[i].FieldValue).toEqual(displayModel.GetCellDrillDownValue(cellDrillDownItems[i]));
            }
        });

    });

    describe("call UpdatePublicationsWatcher", function () {

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

    describe("call GetTimeBucketSize", function () {

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

    describe("when drill down on a null value ", function () {

        it("should apply equal to operator", function () {
            var result = displayModel.GetDrilldownQueryStepOperator(null, enumHandlers.FIELDTYPE.ENUM, "individual", "");
            expect(result).toEqual(enumHandlers.OPERATOR.EQUALTO.Value);
        });
    });

    describe('when create argument values', function () {
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

    describe('call CleanNotAcceptedExecutionParameter', function () {
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

});
