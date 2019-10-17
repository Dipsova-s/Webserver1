/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/ListHandler.js" />

describe("ListHandler", function () {

    var listHandler;

    beforeEach(function () {
        listHandler = new ListHandler();
    });

    describe(".GetGridScrollSettings", function () {
        it("should use default value if no scrollPosition argument", function () {
            var result = listHandler.GetGridScrollSettings();
            expect(result.left).toEqual(0);
            expect(result.top).toEqual(0);
        });

        it("should get scroll position from html element if scrollPosition is true", function () {
            var result = listHandler.GetGridScrollSettings(true);
            expect(result.left).toEqual(null);
            expect(result.top).toEqual(null);
        });

        it("should use scrollPosition if scrollPosition is object", function () {
            var result = listHandler.GetGridScrollSettings({ left: 5, top: 10 });
            expect(result.left).toEqual(5);
            expect(result.top).toEqual(10);
        });
    });

    describe(".GetGridScrollSettingsData", function () {
        it("should get scroll settings from html element", function () {
            $('<div id="AngleGrid" />').hide().data('scrollSettings', { left: 5, top: 5 }).appendTo('body');
            var result = listHandler.GetGridScrollSettingsData();
            expect(result.left).toEqual(5);
            expect(result.top).toEqual(5);
            $('#AngleGrid').remove();
        });
    });

    describe(".SetGridScrollSettingsData", function () {
        it("should set scroll settings from html element", function () {
            $('<div id="AngleGrid" />').hide().appendTo('body');
            listHandler.SetGridScrollSettingsData(true);
            var result = $('#AngleGrid').data('scrollSettings');
            expect(result).toEqual(true);
            $('#AngleGrid').remove();
        });
    });

    describe(".GetGridRowHeight", function () {
        it("should get 26 if no html element", function () {
            var result = listHandler.GetGridRowHeight($());
            expect(result).toEqual(26);
        });

        it("should get height of html element", function () {
            $('<div id="Test"><table class="k-grid-content"><tr><td style="height: 100px">&nbsp;</td></tr></table></div>').appendTo('body');
            var result = listHandler.GetGridRowHeight($('#Test'));
            expect(result).not.toEqual(26);
            $('#Test').remove();
        });
    });

    describe(".ConvertDataRow", function () {
        it("should correctly update data rows", function () {
            var fieldNames = ["ID", "ObjectType", "BottleneckType"];
            var rowData = ["80011670/4", "DeliveryNoteLine", "bt09DelayInProcessing"];
            listHandler.Models = {
                Display: {
                    Data: ko.observable({
                        fields: [{ field: "BottleneckType" }, { field: "ObjectType" }, { field: "ID" }]
                    })
                }
            };

            var actualFields = listHandler.Models.Display.Data().fields;
            var result = listHandler.ConvertDataRow(fieldNames, rowData);
            expect(result[actualFields[0].field.toLowerCase()]).toEqual(rowData[2]);
            expect(result[actualFields[1].field.toLowerCase()]).toEqual(rowData[1]);
            expect(result[actualFields[2].field.toLowerCase()]).toEqual(rowData[0]);
        });
    });

    describe(".GenerateMainContextMenu", function () {

        beforeEach(function () {
            spyOn(resultModel, 'IsSupportSapTransaction').and.callFake(function () {
                return true;
            });
        });

        it("should have Go to SAP menu", function () {
            var result = listHandler.GenerateMainContextMenu([]);

            // assert
            expect(result.gotosap).toBeDefined();
        });

        it("should not have Go to SAP menu", function () {
            resultModel.IsSupportSapTransaction.and.callFake(function () {
                return false;
            });
            var result = listHandler.GenerateMainContextMenu([]);

            // assert
            expect(result.gotosap).not.toBeDefined();
        });
    });
});

