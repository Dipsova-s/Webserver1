/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldDomainHandler.js" />

describe("ModelFieldDomainHandler", function () {
    var modelFieldDomainHandler;

    beforeEach(function () {
        modelFieldDomainHandler = new ModelFieldDomainHandler();
    });

    describe(".GetDomainElementIconInfo", function () {
        beforeEach(function () {
            spyOn(modelFieldDomainHandler, 'GetDomainImageFiles').and.returnValue([
                'folder/folderid.png',
            ]);
            spyOn(window, 'GetImageFolderPath').and.returnValue('test');
            spyOn($, 'proxy').and.returnValue($.noop);
        });
        it("should get a default domain icon info (no folder)", function () {
            var result = modelFieldDomainHandler.GetDomainElementIconInfo('', 'Id');

            // assert
            expect(result.html).toEqual('');
            expect(typeof result.injectCSS).toEqual('function');
            expect($.proxy).not.toHaveBeenCalled();
        });
        it("should get a default domain icon info (id = null)", function () {
            var result = modelFieldDomainHandler.GetDomainElementIconInfo('Folder', null);

            // assert
            expect(result.html).toEqual('');
            expect(typeof result.injectCSS).toEqual('function');
            expect($.proxy).not.toHaveBeenCalled();
        });
        it("should get domain icon info (no icon)", function () {
            var result = modelFieldDomainHandler.GetDomainElementIconInfo('Folder', 'Id2');

            // assert
            expect(result.html).toContain('domainIcon icon-FolderId');
            expect(typeof result.injectCSS).toEqual('function');
            expect($.proxy).not.toHaveBeenCalled();
        });
        it("should get domain icon info (has icon)", function () {
            var result = modelFieldDomainHandler.GetDomainElementIconInfo('Folder', 'Id');

            // assert
            expect(result.html).toContain('domainIcon icon-FolderId');
            expect(typeof result.injectCSS).toEqual('function');
            expect($.proxy).toHaveBeenCalled();
        });
    });

});
