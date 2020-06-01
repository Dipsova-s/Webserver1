/// <chutzpah_reference path="/../../Dependencies/ViewManagement/shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Shared/QueryBlock/QueryStepModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Shared/QueryBlock/QueryBlockModel.js" />

describe("QueryBlockModel", function () {

    var queryBlockModel;
    var querySteps;
    var testBlockModel;

    beforeEach(function () {
        querySteps = [
            { step_type: enumHandlers.FILTERTYPE.FILTER },
            { step_type: enumHandlers.FILTERTYPE.SORTING }
        ];
        testBlockModel = {
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES,
            id: "EA2_800",
            short_name: "EA2_800",
            long_name: "EA2_800",
            abbreviation: "EA2_800",
            base_classes: [],
            base_angle: [],
            base_display: []
        };
        queryBlockModel = new QueryBlockModel(testBlockModel);
    });

    describe("When query block model create new instance", function () {
        it("should be defined", function () {
            expect(queryBlockModel).toBeDefined();
        });

        it("should be extend queryblock_type and valid properties properly", function () {
            expect(queryBlockModel.valid).toEqual(false);
            expect(queryBlockModel.queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
        });
    });

    describe("When queryblock_type is not defined", function () {
        it("should return invalid with missing properties and template's details as custom", function () {
            var fakeBlockType;
            testBlockModel.queryblock_type = fakeBlockType;
            queryBlockModel = new QueryBlockModel(testBlockModel);

            expect(queryBlockModel.valid).toEqual(false);
            expect(queryBlockModel.validation_details.template).toEqual(Localization.Error_QueryBlockTypePropertyMissing);
            expect(queryBlockModel.validation_details.warning_type).toEqual(validationHandler.WARNINGTYPE.CUSTOM);
        });
    });

    describe("When queryblock_type is base_class but have no items", function () {
        it("should return invalid with missing base_class and template's details as custom", function () {

            testBlockModel.queryblock_type = enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES;
            queryBlockModel = new QueryBlockModel(testBlockModel);

            expect(queryBlockModel.valid).toEqual(false);
            expect(queryBlockModel.validation_details.template).toEqual(Localization.Error_BaseClassesPropertyMissing);
            expect(queryBlockModel.validation_details.warning_type).toEqual(validationHandler.WARNINGTYPE.CUSTOM);
        });
    });

    describe("When queryblock_type is base_angles but have no items", function () {
        it("should return invalid with missing base_angles and template's details as custom", function () {

            testBlockModel.queryblock_type = enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE;
            testBlockModel.base_angle = null;
            queryBlockModel = new QueryBlockModel(testBlockModel);

            expect(queryBlockModel.valid).toEqual(false);
            expect(queryBlockModel.validation_details.template).toEqual(Localization.Error_BaseAnglePropertyMissing);
            expect(queryBlockModel.validation_details.warning_type).toEqual(validationHandler.WARNINGTYPE.CUSTOM);
        });
    });

    describe("When queryblock_type is base_display but have no items", function () {
        it("should return invalid with missing base_display and template's details as custom", function () {

            testBlockModel.queryblock_type = enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY;
            testBlockModel.base_display = null;
            queryBlockModel = new QueryBlockModel(testBlockModel);

            expect(queryBlockModel.valid).toEqual(false);
            expect(queryBlockModel.validation_details.template).toEqual(Localization.Error_BaseDisplayPropertyMissing);
            expect(queryBlockModel.validation_details.warning_type).toEqual(validationHandler.WARNINGTYPE.CUSTOM);
        });
    });

    describe("When queryblock_type is query_steps but have no items", function () {
        it("should return invalid with missing query_steps and template's details as custom", function () {

            testBlockModel.queryblock_type = enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS;
            testBlockModel.query_steps = [];
            queryBlockModel = new QueryBlockModel(testBlockModel);

            expect(queryBlockModel.valid).toEqual(false);
            expect(queryBlockModel.validation_details.template).toEqual(Localization.Error_QueryStepsPropertyMissing);
            expect(queryBlockModel.validation_details.warning_type).toEqual(validationHandler.WARNINGTYPE.CUSTOM);
        });
    });

    describe("When queryblock_type is query_steps", function () {
        it("should return valid", function () {

            testBlockModel.queryblock_type = enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS;
            testBlockModel.query_steps = querySteps;
            queryBlockModel = new QueryBlockModel(testBlockModel);

            expect(queryBlockModel.valid).toEqual(true);
            expect(queryBlockModel.query_steps.length).toEqual(2);
        });
    });
});