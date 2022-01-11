/// <chutzpah_reference path="/../../Dependencies/page/MC.Models.AngleWarnings.js" />

describe("MC.Models.AngleWarnings", function () {
    var angleWarnings;
    beforeEach(function () {
        angleWarnings = MC.Models.AngleWarnings;
    });
        
    describe(".SaveAngleWarningFile", function () {
        it("save should fail when form is invalid", function () {
            spyOn($.fn, 'valid').and.returnValue(false);
            spyOn($.fn, 'focus').and.returnValue('');
            var returnValue = angleWarnings.SaveAngleWarningFile();
            // assert
            expect(returnValue).toBe(false);
        });
        it("save should fail when file input is empty", function () {
            spyOn($.fn, 'valid').and.returnValue(true);
            spyOn($.fn, 'val').and.returnValue('');
            var returnValue = angleWarnings.SaveAngleWarningFile();
            // assert
            expect(returnValue).toBe(false);
        });
        it("should save angle warnings file", function () {
            spyOn($.fn, 'valid').and.returnValue(true);
            spyOn($.fn, 'val').and.returnValue('TestExcel.xlsx');
            spyOn(angleWarnings, 'UploadAngleWarningFile');
            angleWarnings.SaveAngleWarningFile();
            // assert
            expect(angleWarnings.UploadAngleWarningFile).toHaveBeenCalled();
        });
    });
    describe(".DownloadAngleWarningFile", function () {  
        beforeEach(function () {
            spyOn(MC.util, 'download');
        });
        it("should not download angle warning file", function () {
            spyOn($.fn, 'val').and.returnValue('');
            angleWarnings.DownloadAngleWarningFile();

            // assert
            expect(MC.util.download).not.toHaveBeenCalled();
        });
        it("should download angle warning file", function () {
            spyOn($.fn, 'val').and.returnValue('C:\TestExcel.xlsx');
            angleWarnings.DownloadAngleWarningFile();

            // assert
            expect(MC.util.download).toHaveBeenCalled();
        });
    });
});
