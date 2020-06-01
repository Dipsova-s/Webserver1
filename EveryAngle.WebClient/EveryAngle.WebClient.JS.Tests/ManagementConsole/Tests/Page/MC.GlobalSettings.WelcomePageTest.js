/// <chutzpah_reference path="/../../Dependencies/page/MC.GlobalSettings.WelcomePage.js" />

describe("MC.GlobalSettings.WelcomePage", function () {

    var welcomePageTest;

    beforeEach(function () {
        welcomePageTest = MC.GlobalSettings.WelcomePage;
    });

    describe(".GenerateVideoThumbnails'", function () {
        
        beforeEach(function () {
            spyOn(welcomePageTest, 'IsBrowserSupportToGenerateVideoThumbnail').and.returnValue(true);
            spyOn(welcomePageTest, 'GetThumbnailsAndUploadToWebService');
        });

        it("should validate video file(s) before upload thumbnail(s) to the web service", function () {
            welcomePageTest.GenerateVideoThumbnails();
            expect(welcomePageTest.IsBrowserSupportToGenerateVideoThumbnail).toHaveBeenCalled();
            expect(welcomePageTest.GetThumbnailsAndUploadToWebService).toHaveBeenCalled();
        });

    });
});
