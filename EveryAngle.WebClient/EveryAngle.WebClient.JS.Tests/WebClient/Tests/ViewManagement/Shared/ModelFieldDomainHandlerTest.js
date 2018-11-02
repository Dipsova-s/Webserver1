/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldDomainHandler.js" />

describe("ModelFieldDomainHandler", function () {
    var modelFieldDomainHandler;

    beforeEach(function () {
        modelFieldDomainHandler = new ModelFieldDomainHandler();
    });

    describe(".GetDomainElementIconInfo", function () {

        it("should get domain icon info", function () {
            spyOn(window, 'GetImageFolderPath').and.returnValue('test');
            var result = modelFieldDomainHandler.GetDomainElementIconInfo('Folder', 'Id');

            expect(result.id).toEqual('icon-FolderId');
            expect(result.css).toContain('.domainIcon.icon-FolderId');
            expect(result.html).toContain('domainIcon icon-FolderId');
        });

    });

});
