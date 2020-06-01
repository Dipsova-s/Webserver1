/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelLabelCategoryHandler.js" />

describe("ModelLabelHandler", function () {
    var modelLabelHandler;

    beforeEach(function () {
        modelLabelHandler = new ModelLabelHandler();
    });

    describe("get enables labels per category", function () {

        beforeEach(function () {
            spyOn(modelLabelHandler, "GetData").and.callFake(function () {
                return [{ id: "Label1", enabled: true, category: 'labelcategories/1' },
                { id: "Label2", enabled: true, category: 'labelcategories/1' },
                { id: "Label3", enabled: true, category: 'labelcategories/2' },
                { id: "Label4", enabled: false, category: 'labelcategories/1' },
                { id: "Label5", category: 'labelcategories/1' },
                { id: "Label6", category: 'labelcategories/2' }
                ];
            });
        });

        it("can get enabled labels of Business Process category", function () {
            //mock model label categories
            spyOn(modelLabelHandler, "GetLabelCategoryUri").and.callFake(function () {
                return 'labelcategories/1';
            });
            var modelLabelCategory = {
                id: "CAT_BP",
                contains_businessprocesses: true,
                is_required: true,
                name: "Business Process",
                uri: "/models/1/labelcategories/1"
            };
            var data = modelLabelHandler.GetEnabledLabelsByCategory(modelLabelCategory);

            expect(data.length).toBe(2);
            expect(data[0].id === "Label1");
            expect(data[1].id === "Label2");
        });

        it("can get enabled labels of normal category", function () {
            //mock model label categories
            spyOn(modelLabelHandler, "GetLabelCategoryUri").and.callFake(function () {
                return 'labelcategories/2';
            });
            var modelLabelCategory = {
                id: "Pooy",
                contains_businessprocesses: true,
                is_required: true,
                name: "Normal label category",
                uri: "/models/1/labelcategories/2"
            };
            var data = modelLabelHandler.GetEnabledLabelsByCategory(modelLabelCategory);

            expect(data.length).toBe(1);
            expect(data[0].id === "Label3");
        });

    });

});
