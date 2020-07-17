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
});
