/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/HelpTextHandler.js" />

describe("HelpTextHandler", function () {
    var helpTextHandler;
    beforeEach(function () {
        helpTextHandler = new HelpTextHandler();
    });

    describe(".UpdateHelpTextLink", function () {

        var link;
        beforeEach(function () {
            link = $('<a href="my_id" />');
        });

        it("should not update link if it's not help text", function () {
            window.helptextPageUrl = '/helppage';
            spyOn(WC.Utility, 'IsAbsoluteUrl').and.returnValue(true);
            helpTextHandler.UpdateHelpTextLink(link, '/models/1');

            expect(link.attr('href')).not.toContain(window.helptextPageUrl);
            expect(link.attr('target')).not.toEqual('_blank');
        });

        it("should update link if it's help text", function () {
            window.helptextPageUrl = '/helppage';
            spyOn(WC.Utility, 'IsAbsoluteUrl').and.returnValue(false);
            helpTextHandler.UpdateHelpTextLink(link, '/models/1');

            expect(link.attr('href')).toContain(window.helptextPageUrl);
            expect(link.attr('target')).toEqual('_blank');
        });

    });

});
