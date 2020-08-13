describe("MC.ui.js", function () {

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(MC.ui).toBeDefined();
        });

    });

    describe("MC.ui.btnGroup.getMenuPositionInfo", function () {

        var tests = [
            { height: 200, top: 50, bottom: 210, expectedPostion: 'bottom', expectedClass: '', expectedMarginTop: 2 },
            { height: 200, top: 210, bottom: 50, expectedPostion: 'top', expectedClass: 'revert', expectedMarginTop: 2 },
            { height: 200, top: 150, bottom: 100, expectedPostion: 'left-top', expectedClass: 'left', expectedMarginTop: -170 },
            { height: 200, top: 100, bottom: 150, expectedPostion: 'left-bottom', expectedClass: 'left', expectedMarginTop: -60 }
        ];

        $.each(tests, function (index, test) {
            it("should be placed on " + test.expectedPostion + " of clicking button if menu-height=" + test.height + ", top-space=" + test.top + ", bottom-space=" + test.bottom, function () {

                var result = MC.ui.btnGroup.getMenuPositionInfo(test.height, { top: test.top, bottom: test.bottom });

                expect(test.expectedClass).toEqual(result.className);
                expect(test.expectedMarginTop).toEqual(result.marginTop);
            });
        });
    });

    describe("MC.ui.enumSettingChange", function () {

        it("should show warning if id is result_export_type", function () {
            // prepare
            spyOn(MC.util, 'showPopupAlert').and.callFake($.noop);

            // act
            MC.ui.enumSettingChange({ sender: { element: { attr: function () { return "result_export_type" } } } });

            // assert
            expect(MC.util.showPopupAlert).toHaveBeenCalled();
        });

        it("should show innowera details if id is template_file", function () {
            // prepare
            spyOn(MC.util, 'showInnoweraDetails').and.callFake($.noop);

            // act
            MC.ui.enumSettingChange({ sender: { element: { attr: function () { return "template_file" } } } });

            // assert
            expect(MC.util.showInnoweraDetails).toHaveBeenCalled();
        });

        it("should show exist template info if id is template_file and page is Add/Edit Action", function () {
            // prepare
            var element = $('<div id=\"DatastoreSettings\"><div id=\"template_file\"/></div>').appendTo('body');
            spyOn(MC.util, 'showInnoweraDetails').and.callFake($.noop);
            spyOn(MC.util, 'showExistTemplateInfo').and.callFake($.noop);

            // act
            MC.ui.enumSettingChange({ sender: { element: { attr: function () { return "template_file" } } } });

            // assert
            expect(MC.util.showExistTemplateInfo).toHaveBeenCalled();
            element.remove();
        });

        it("should not show exist template info if id is template_file and page is Create/Edit Datastores", function () {
            // prepare
            var element = $('<div class=\"pageDatastoreEdit\"><div id=\"template_file\"/></div>').appendTo('body');
            spyOn(MC.util, 'showInnoweraDetails').and.callFake($.noop);
            spyOn(MC.util, 'showExistTemplateInfo').and.callFake($.noop);

            // act
            MC.ui.enumSettingChange({ sender: { element: { attr: function () { return "template_file" } } } });

            // assert
            expect(MC.util.showExistTemplateInfo).not.toHaveBeenCalled();
            element.remove();
        });

        it("should not show warning", function () {
            // prepare
            spyOn(MC.util, 'showPopupAlert').and.callFake($.noop);

            // act
            MC.ui.enumSettingChange({ sender: { element: { attr: function () { return "some_other_id" } } } });

            // assert
            expect(MC.util.showPopupAlert).not.toHaveBeenCalled();
        });
    });
});