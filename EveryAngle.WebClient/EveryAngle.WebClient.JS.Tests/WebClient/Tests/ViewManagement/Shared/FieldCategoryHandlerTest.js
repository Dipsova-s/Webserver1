/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/FieldCategoryHandler.js" />

describe("FieldCategoryHandler", function () {
    var fieldCategoryHandler;

    beforeEach(function () {
        fieldCategoryHandler = new FieldCategoryHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(fieldCategoryHandler).toBeDefined();
        });

    });

    describe(".GetCategoryIconByField", function () {

        beforeEach(function () {
            fieldCategoryIconPath = '/admin/uploadedresources/fieldcategoryicons/';
            fieldCategoryHandler.Data = {};
            fieldCategoryHandler.Data['/fieldcategories/1'] = new FieldCategoryModel({ id: 'EA', uri: '/fieldcategories/1' });
            fieldCategoryHandler.Data['/fieldcategories/2'] = new FieldCategoryModel({ id: 'SAP', uri: '/fieldcategories/2' });
        });

        var testCases = [
            { title: 'should use expected icon when field category has found', categoryUri: '/fieldcategories/2', expectedIcon: 'sap_16.png' },
            { title: 'should fallback to use ea icon when field category has not found', categoryUri: '/fieldcategories/3', expectedIcon: 'ea_16.png' }
        ];

        testCases.forEach(function (testCase) {
            it(testCase.title, function () {
                var field = { category: testCase.categoryUri };
                var result = fieldCategoryHandler.GetCategoryIconByField(field);

                expect(result.path).toEqual(kendo.format('{0}{1}', fieldCategoryIconPath, testCase.expectedIcon));
            });
        });

    });

});
