/// <reference path="/Dependencies/custom/mc.form.js" />
/// <reference path="/Dependencies/page/MC.GlobalSettings.WebClientSettings.js" />

describe("MC.GlobalSettings.WebClientSettings", function () {
    var webClientSettings;
    beforeEach(function () {
        webClientSettings = MC.GlobalSettings.WebClientSettings;
    });

    describe(".GetData'", function () {

        var testElement;
        beforeEach(function () {
            testElement = $([
                '<div>',
                '<input id="AjaxTimeoutExpirationInSeconds" value="1000" />',
                '<input id="ShowAngleAndDisplayID" type="checkbox" checked />',
                '<input id="MaxNumberOfMassChangeItems" value="10" />',
                '<input id="MaxNumberOfDashboard" value="5" />',
                '<input id="ShowErrorSourceUri" type="checkbox" />',
                '<input id="EnableOptimizations" type="checkbox" checked />',
                '<input id="MaxLogFileNumber" value="500" />',
                '<input id="MaxLogFileSize" value="10240" />',
                '<input id="DashboardRefreshIntervalTime" value="10000" />',
                '<input id="GoogleAnalyticsId" value="rfsder6" />',
                '<input id="EnableGoToSAP" type="checkbox" checked />',
                '</div>'
            ].join(''));
            testElement.hide().appendTo('body');
        });
        afterEach(function () {
            testElement.remove();
        });

        it("should get data", function () {
            var result = webClientSettings.GetData();
            expect(result.AjaxTimeoutExpirationInSeconds).toEqual('1000');
            expect(result.ShowAngleAndDisplayID).toEqual(true);
            expect(result.MaxNumberOfMassChangeItems).toEqual('10');
            expect(result.MaxNumberOfDashboard).toEqual('5');
            expect(result.ShowErrorSourceUri).toEqual(false);
            expect(result.EnableOptimizations).toEqual(true);
            expect(result.MaxLogFileNumber).toEqual('500');
            expect(result.MaxLogFileSize).toEqual('10240');
            expect(result.DashboardRefreshIntervalTime).toEqual('10000');
            expect(result.GoogleAnalyticsId).toEqual('rfsder6');
            expect(result.EnableGoToSAP).toEqual(true);
        });
    });
});
