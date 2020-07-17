/// <chutzpah_reference path="/../../Dependencies/page/MC.GlobalSettings.Components.js" />

describe("MC.GlobalSettings.Components", function () {
    var page;
    beforeEach(function () {
        page = MC.GlobalSettings.Components;
    });
    describe(".DownloadModelServerMetaData", function () {
        var e;
        beforeEach(function () {
            e = { preventDefault: $.noop };
            spyOn(e, 'preventDefault');
            spyOn(MC.util, 'download');
        });
        it("should download", function () {
            page.DownloadModelServerMetaData(e, $('<a href="http://host/test.txt" data-parameters=\'{\"MetadataName\":\"name\",\"MetadataUri\":\"uri\"}\'/>')[0]);

            // assert
            expect(MC.util.download).toHaveBeenCalledWith('http://host/test.txt?metadataName=name&metadataUri=uri', true);
            expect(e.preventDefault).toHaveBeenCalled();
        });
    });
});
