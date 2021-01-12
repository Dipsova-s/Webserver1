﻿describe("MC.ui.logpopup.js", function () {

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

    

    describe(".ShowLogHideGrid", function () {
        beforeEach(function () {
            $("<div id='popupLogTable'><div class='contentSectionGrid'></div><div class='contentSectionLog'><div id='LogFileDetails'><div class='logDetails'></div></div></div></div>").appendTo('body');
        });

        afterEach(function () {
            $('#popupLogTable').remove();
        });

        it("should hide the log file section and show grid section", function () {
            MC.ui.logpopup.ShowLogHideGrid(false);
            var isGridVisible = $("#popupLogTable .contentSectionGrid").is(":visible");
            var isLogVisible = $("#popupLogTable .contentSectionLog").is(":visible");
            expect(isGridVisible).toBeTruthy();
            expect(isLogVisible).toBeFalsy();
        });
        it("should hide the grid section and show log file section", function () {
            MC.ui.logpopup.ShowLogHideGrid(true);
            var isGridVisible = $("#popupLogTable .contentSectionGrid").is(":visible");
            var isLogVisible = $("#popupLogTable .contentSectionLog").is(":visible");
            expect(isLogVisible).toBeTruthy();
            expect(isGridVisible).toBeFalsy();
        });
    });
    
    describe(".UpdateLogFileDetailsLayout", function () {
        beforeEach(function () {
            $("<div id='popupLogTable'><div class='popupContent'><div class='contentSectionGrid'></div><div class='contentSectionLog'><div class='logViewNavigationButtons'></div><div id='LogFileDetails'><div class='logDetails'></div></div></div></div>></div>").appendTo('body');
        });

        afterEach(function () {
            $('#popupLogTable').remove();
        });
        it("should update the layout of log file section", function () {
            $('#popupLogTable .popupContent').height(25);
            $('#LogFileDetails').css({ 'padding-top': 15});
            MC.ui.logpopup.UpdateLogFileDetailsLayout(true);
            var newHeight = $('#LogFileDetails .logDetails').height();
            var newOverflow = $('#LogFileDetails .logDetails').css("overflow");
            expect(newHeight).toBe(9);
            expect(newOverflow).toEqual("auto");
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
    describe(".LogFileCheck", function () {
        var testCases = [
            { filePath: "test.log", result: true },
            { filePath: "logtest.log", result: true },
            { filePath: "test.csl", result: false },
            { filePath: "logtest.csl", result: false }
        ];
        testCases.forEach(function (testCase) {
            it("should return " + testCase.result + " if log file", function () {
                var isLogFile = MC.ui.logpopup.LogFileCheck(testCase.filePath);
                expect(!!isLogFile).toBe(testCase.result);
            });
        });
    });
    describe(".EnableCslAndLogViewScrollUpAndBottom", function () {
        it("should call the scroll enabling function", function () {
            spyOn($.fn, 'scroll').and.returnValue($());
            MC.ui.logpopup.EnableCslAndLogViewScrollUpAndBottom();
            expect($.fn.scroll).toHaveBeenCalledTimes(2);
        });
        it("should add class", function () {
            spyOn($.fn, 'addClass');
            MC.ui.logpopup.EnableCslAndLogViewScrollUpAndBottom();
            expect($.fn.addClass).toHaveBeenCalled();
        });
    });
    describe(".ScrollToTopLog", function () {
        it("should scroll to top of logpopup", function () {
            spyOn($.fn, 'animate').and.returnValue($());
            MC.ui.logpopup.ScrollToTopLog();
            expect($.fn.animate).toHaveBeenCalled();
        });
    });
    describe(".ScrollToBottomLog", function () {
        it("should scroll to bottom of logpopup", function () {
            spyOn($.fn, 'prop').and.returnValue(200);
            spyOn($.fn, 'animate').and.returnValue($());
            MC.ui.logpopup.ScrollToBottomLog();
            expect($.fn.animate).toHaveBeenCalled();
        });
    });
    describe(".ScrollToTopCsl", function () {
        it("should scroll to top of cslpopup", function () {
            spyOn($.fn, 'data').and.callFake(function (){
                return {
                    element: $(this)
                }
            });
            spyOn($.fn, 'get').and.returnValue($());
            spyOn($.fn, 'animate').and.returnValue($());
            MC.ui.logpopup.ScrollToTopCsl();
            expect($.fn.get).toHaveBeenCalled();
            expect($.fn.animate).toHaveBeenCalled();
        });
    });
    describe(".ScrollToBottomCsl", function () {
        it("should scroll to bottom of cslpopup", function () {
            spyOn($.fn, 'data').and.callFake(function () {
                return {
                    element: $(this)
                }
            });
            spyOn($.fn, 'get').and.returnValue($());
            spyOn($.fn, 'animate').and.returnValue($());
            MC.ui.logpopup.ScrollToBottomCsl();
            expect($.fn.get).toHaveBeenCalled();
            expect($.fn.animate).toHaveBeenCalled();
        });
    });
});