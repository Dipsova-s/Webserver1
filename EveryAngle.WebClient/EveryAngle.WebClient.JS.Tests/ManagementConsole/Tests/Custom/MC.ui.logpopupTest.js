
describe("MC.ui.logpopup.js", function () {

    describe(".kendoGrid", function () {

        beforeEach(function () {
            $('<div id="SystemLogDetails"><table class="logDetailTable"></table><span class="logDetails"></span></div>').appendTo('body');
        });

        afterEach(function () {
            $('#SystemLogDetails').remove();
        });

        it("should call SetTheLastColumnWidthToBeFitAsTable when columnResize has been triggered", function () {
            spyOn(MC.ui.logpopup, 'SetTheLastColumnWidthToBeFitAsTable');
            spyOn(MC.ui.logpopup, 'GetLogDetail').and.returnValue(jQuery.Deferred().resolve('<div>Hello</div>'));
            spyOn(MC.ui.logpopup, 'UpdateLogDetailsLayout');
            MC.ui.logpopup.ShowLogDetail('url');
            $('#SystemLogDetails .logDetailTable').data('handler').trigger('columnResize');
            expect(MC.ui.logpopup.SetTheLastColumnWidthToBeFitAsTable).toHaveBeenCalled();
        });
       
    });

    describe(".UpdateLogDetailsLayout", function () {

        beforeEach(function () {
            $('<div id="SystemLogDetails"><div class="tabTable"><div class="k-grid"></div></div></div>').appendTo('body');
        });

        afterEach(function () {
            $('#SystemLogDetails').remove();
        });

        it("should call SetTheLastColumnWidthToBeFitAsTable when UpdateLogDetailsLayout has been called", function () {
            spyOn(MC.ui.logpopup, 'SetTheLastColumnWidthToBeFitAsTable');
            MC.ui.logpopup.UpdateLogDetailsLayout();
            expect(MC.ui.logpopup.SetTheLastColumnWidthToBeFitAsTable).toHaveBeenCalled();
        });

    });

});