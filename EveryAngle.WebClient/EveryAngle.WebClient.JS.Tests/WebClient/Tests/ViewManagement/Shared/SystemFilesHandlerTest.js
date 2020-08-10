/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemFilesHandler.js" />

describe("SystemFilesHandler", function () {
    var systemFilesHandler;

    beforeEach(function () {
        systemFilesHandler = new SystemFilesHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(systemFilesHandler).toBeDefined();
        });

    });

    describe(".GetDropdownData", function () {

        it("should return dropdown data", function () {
            systemFilesHandler.Data = [
                {
                    file: "file_1",
                    has_innowera_process: true,
                    innowera_process_details: ["detail_1", "detail_2"]
                },
                {
                    file: "file_2"
                }
            ];
            var result = systemFilesHandler.GetDropdownData();
            expect(result.length).toEqual(2);
            expect(result[0].name).toEqual("file_1");
            expect(result[0].icon_class).toEqual("icon-innowera");
            expect(result[1].name).toEqual("file_2");
            expect(result[1].icon_class).toEqual("none");
        });

    });

});