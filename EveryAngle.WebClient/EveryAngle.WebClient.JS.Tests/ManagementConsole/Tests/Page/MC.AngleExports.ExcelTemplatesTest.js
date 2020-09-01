/// <chutzpah_reference path="/../../Dependencies/page/MC.AngleExports.ExcelTemplates.js" />

describe("MC.AngleExports.ExcelTemplates", function () {
    var excelTemplates;
    beforeEach(function () {
        excelTemplates = MC.AngleExports.ExcelTemplates;
    });

    describe(".GetAllExcelTemplate", function () {
        it("should call ajax", function () {
            excelTemplates.GetAllExcelTemplateUri = "TestUrl";
            spyOn(MC.ajax, 'request').and.returnValue('');
            excelTemplates.GetAllExcelTemplate();
            // assert
            expect(MC.ajax.request).toHaveBeenCalled();
        });
    });
    describe(".SaveExcelTemplates", function () {
        it("should fail when form is invalid", function () {
            spyOn($.fn, 'valid').and.returnValue(false);
            spyOn($.fn, 'focus').and.returnValue('');
            var returnValue = excelTemplates.SaveExcelTemplates();
            // assert
            expect(returnValue).toBe(false);
        });
        it("should fail when file input is empty", function () {
            spyOn($.fn, 'valid').and.returnValue(true);
            spyOn($.fn, 'val').and.returnValue('');
            var returnValue = excelTemplates.SaveExcelTemplates();
            // assert
            expect(returnValue).toBe(false);
        });
        it("should save excel template", function () {
            var response = {
                Data: []
            };
            spyOn($.fn, 'valid').and.returnValue(true);
            spyOn($.fn, 'val').and.returnValue('TestExcel.xlsx');
            spyOn(excelTemplates, 'UploadExcelFile');
            spyOn(excelTemplates, 'GetAllExcelTemplate').and.returnValue($.when(response));
            excelTemplates.SaveExcelTemplates();
            // assert
            expect(excelTemplates.GetAllExcelTemplate).toHaveBeenCalled();
            expect(excelTemplates.UploadExcelFile).toHaveBeenCalled();
        });
    });
    describe(".DownloadExcelTemplate", function () {
        var e;
        beforeEach(function () {
            e = { preventDefault: $.noop };
            spyOn(e, 'preventDefault');
            spyOn(MC.util, 'download');
        });
        it("should not download", function () {
            excelTemplates.DownloadExcelTemplate(e, $('<a href="test.txt" class="disabled"/>')[0]);

            // assert
            expect(MC.util.download).not.toHaveBeenCalled();
            expect(e.preventDefault).toHaveBeenCalled();
        });
        it("should download", function () {
            excelTemplates.DownloadExcelTemplate(e, $('<a href="test.txt"/>')[0]);

            // assert
            expect(MC.util.download).not.toHaveBeenCalledWith('test.txt');
            expect(e.preventDefault).toHaveBeenCalled();
        });
    });

    describe(".ShowDeletePopup", function () {
        var e;
        beforeEach(function () {
            e = { preventDefault: $.noop };
            spyOn(e, 'preventDefault');
        });
        it("should call GetDatstoreDetails function when template used datastore", function () {
            spyOn(excelTemplates, "GetDatastoreCount").and.returnValue(true);
            spyOn(excelTemplates, "GetDatstoreDetails").and.returnValue($.noop);
            excelTemplates.ShowDeletePopup(e, $('<a href="test.txt"/>')[0]);

            expect(excelTemplates.GetDatastoreCount).toHaveBeenCalled();
            expect(excelTemplates.GetDatstoreDetails).toHaveBeenCalled();
        });
        it("should call GetDisplayPopupMessage function when template used in display and not used any datastore", function () {
            spyOn(excelTemplates, "GetDisplayCount").and.returnValue(true);
            spyOn(excelTemplates, "GetDisplayPopupMessage").and.returnValue($.noop);
            excelTemplates.ShowDeletePopup(e, $('<a href="test.txt"/>')[0]);

            expect(excelTemplates.GetDisplayCount).toHaveBeenCalled();
            expect(excelTemplates.GetDisplayPopupMessage).toHaveBeenCalled();
        });
    });

    describe(".GetDatastorePopupMessage", function () {
        beforeEach(function () {
            MC.util.showPopupOK= function (title, message) {
                    element = $(message).appendTo('body');
                }
        });

        afterEach(function () {
            element.remove();
        });
        it("When template used in datastore then popup should contain the datastore name and link to edit datastore", function () {
            var datastore = [
                {
                    name: 'excel_plugin_for_test',
                    Uri: 'https://Test.local//system/datastores/1'
                },
                {
                    name: 'excel_plugin_for_test2',
                    Uri: 'https://Test.local//system/datastores/2'
                }
            ];
            excelTemplates.EditDatastoreUri = '#/Angle exports/Datastores/Edit datastore/';
            excelTemplates.GetDatastorePopupMessage(datastore);
            var countOfLink = $('.btnOpenWindowPopup').length;
            expect(countOfLink).toBe(2);

            var row = $('.k-auto-scrollable tbody tr td span');
            $.each(datastore, function (index, setting) {
                var datastoreName = row[index].outerText;
                expect(setting.name).toBe(datastoreName);
            });
        });
    });
    describe(".GetDisplayPopupMessage", function () {
        beforeEach(function () {
            MC.util.showPopupConfirmation= function (message) {
                    element = $(message).appendTo('body');
                }
        });

        afterEach(function () {
            element.remove();
        });
        it("Popup message should be there in the body", function () {
            spyOn(excelTemplates, 'DeleteExcelTemplate').and.returnValue($.noop);
            spyOn(excelTemplates, 'GetDisplayCount').and.returnValue(2);
            excelTemplates.GetDisplayPopupMessage($('<a href="test.txt"/>')[0]);
            var messageIndex = $('body')[0].outerText.indexOf('Are you sure you want to delete this Excel template ?');
            expect(messageIndex !== -1).toBeTruthy();
        });
    });
});
