/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/QueryBlock/QueryBlockModel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/QueryBlock/QueryBlocksModel.js" />

describe("QueryBlocksModel", function () {

    var queryBlocksModel;
    var queryBlocksModel_undefined;
    var testQueryBlock_null;
    var testFilter = 'query_steps';
    var testQueryBlock = [{
        queryblock_type: "query_steps",
        query_steps: []
    }];

    beforeEach(function () {
        queryBlocksModel = new QueryBlocksModel(testQueryBlock, {});
        queryBlocksModel_undefined = new QueryBlocksModel(testQueryBlock_null, {});
    });

    describe("when query blocks model create new instance", function () {
        it("should be defined", function () {
            expect(queryBlocksModel).toBeDefined();
        });

        it("should be empty query blocks", function () {
            expect(queryBlocksModel_undefined.QueryBlocks).toEqual([]);
        });
    });

    describe("call GetBaseClassesTemplate", function () {

        it("should return queryblock_type as BASE_CLASSES", function () {
            var template = queryBlocksModel.GetBaseClassesTemplate(['test']);
            expect(template.queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
            expect(template.base_classes).toEqual(['test']);
        });

        it("should return base_classes as empty arrays if classes is not defined", function () {
            var fakeClass;
            var template = queryBlocksModel.GetBaseClassesTemplate(fakeClass);
            expect(template.base_classes).toEqual([]);
        });

        it("should return base_classes as empty arrays if classes is null", function () {
            var fakeClass = null;
            var template = queryBlocksModel.GetBaseClassesTemplate(fakeClass);
            expect(template.base_classes).toEqual([]);
        });

        it("should return base_classes as empty arrays if classes is empty arrays", function () {
            var fakeClass = [];
            var template = queryBlocksModel.GetBaseClassesTemplate(fakeClass);
            expect(template.base_classes).toEqual([]);
        });
    });

    describe("call GetBaseAngleTemplate", function () {

        it("should return queryblock_type as BASE_ANGLE", function () {
            var template = queryBlocksModel.GetBaseAngleTemplate({});
            expect(template.queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE);
            expect(template.base_angle).toEqual({});
        });

        it("should return base_angle as empty string if angle is not defined", function () {
            var fakeAngle;
            var template = queryBlocksModel.GetBaseAngleTemplate(fakeAngle);
            expect(template.base_angle).toEqual('');
        });
    });

    describe("call GetBaseDisplayTemplate", function () {

        it("should return queryblock_type as BASE_DISPLAY", function () {
            var template = queryBlocksModel.GetBaseDisplayTemplate({});
            expect(template.queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY);
            expect(template.base_display).toEqual({});
        });

        it("should return base_display as empty string if display is not defined", function () {
            var fakeDisplay;
            var template = queryBlocksModel.GetBaseDisplayTemplate(fakeDisplay);
            expect(template.base_display).toEqual('');
        });
    });

    describe("call GetQueryStepTemplate", function () {

        it("should return queryblock_type as QUERY_STEPS", function () {
            var template = queryBlocksModel.GetQueryStepTemplate([{}]);
            expect(template.queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            expect(template.query_steps).toEqual([{}]);
        });

        it("should return base_display as empty arrays if querystep is not defined", function () {
            var fakeQueryStep;
            var template = queryBlocksModel.GetQueryStepTemplate(fakeQueryStep);
            expect(template.query_steps).toEqual([]);
        });
    });

    describe("call GetQueryBlocks", function () {

        it("should return inititated query blocks if filter is not defined with clean flag == 'true'", function () {
            var fakeFilter;
            var queryBlocks = queryBlocksModel.GetQueryBlocks(fakeFilter, true);
            expect(ko.toJS(queryBlocksModel.QueryBlocks)).toEqual(queryBlocks);
        });

        it("should return inititated query blocks if filter is not defined with clean flag == 'false'", function () {
            var fakeFilter;
            var queryBlocks = queryBlocksModel.GetQueryBlocks(fakeFilter, false);
            expect(queryBlocksModel.QueryBlocks).toEqual(queryBlocks);
        });

        it("should return filtered queryblock if filter is specified with clean flag == 'true'", function () {
            var queryBlocks = queryBlocksModel.GetQueryBlocks(testFilter, true);
            expect(ko.toJS(queryBlocksModel.QueryBlocks[0])).toEqual(queryBlocks[0]);
        });

        it("should return filtered queryblock if filter is specified with clean flag == 'false'", function () {
            var queryBlocks = queryBlocksModel.GetQueryBlocks(testFilter, false);
            expect(queryBlocksModel.QueryBlocks[0]).toEqual(queryBlocks[0]);
        });
    });

    describe("call GetQuerySteps", function () {

        it("should return inititated first's query steps if filter is not defined with clean flag == 'true'", function () {
            var fakeFilter;
            var querySteps = queryBlocksModel.GetQuerySteps(fakeFilter, true);
            expect(ko.toJS(testQueryBlock[0].query_steps)).toEqual(querySteps);
        });

        it("should return inititated first's query steps if filter is not defined with clean flag == 'false'", function () {
            var fakeFilter;
            var querySteps = queryBlocksModel.GetQuerySteps(fakeFilter, false);
            expect(testQueryBlock[0].query_steps).toEqual(querySteps);
        });

        it("should return filtered query steps if filter is not defined with clean flag == 'true'", function () {
            var querySteps = queryBlocksModel.GetQuerySteps(testFilter, true);
            expect(ko.toJS(testQueryBlock[0].query_steps)).toEqual(querySteps);
        });

        it("should return filtered query steps if filter is not defined with clean flag == 'false'", function () {
            var querySteps = queryBlocksModel.GetQuerySteps(testFilter, false);
            expect(testQueryBlock[0].query_steps).toEqual(querySteps);
        });

        it("should return empty arrays if cannot find any query steps", function () {
            var specificQueryBlock = [{
                queryblock_type: "fake_query_steps",
                query_steps: []
            }];
            var specificQueryBlocksModel = new QueryBlocksModel(specificQueryBlock, {});

            var querySteps = specificQueryBlocksModel.GetQuerySteps(testFilter, true);
            expect(querySteps).toEqual([]);
        });
    });

    describe("call SetQueryBlocks", function () {

        it("should remove query step if it contains more than 1 query_steps", function () {

            var specificQueryBlock = [{
                    queryblock_type: "query_steps",
                    query_steps: []
                }, {
                    queryblock_type: "query_steps",
                    query_steps: []
                }
            ];
            var specificQueryBlocksModel = new QueryBlocksModel(specificQueryBlock, {});

            expect(specificQueryBlocksModel.QueryBlocks.length).toEqual(1);
        });
    });
});

