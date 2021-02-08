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
    describe(".ShowLogTable", function () {
        beforeEach(function () {
            $('<a id=showLogTable class="btn btnOpenWindow" onclick="MC.ui.logpopup.ShowLogTable(this)">Show Log Table</a>').appendTo('body');
        });

        afterEach(function () {
            $('#showLogTable').remove();
        });
        it("should call ShowLogTable when clicking view button", function () {
            spyOn(MC.ui.logpopup, 'ShowLogTable');
            jQuery('#showLogTable').trigger('click');
            expect(MC.ui.logpopup.ShowLogTable).toHaveBeenCalled();
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
        var docElement;
        beforeEach(function () {
            docElement =$('<div class="logViewNavigationButtons">'+
                            '<div class="logViewActionButtons">'+
                                '<a class="refreshLog" onclick="MC.ui.logpopup.RefreshLog()" title="Refresh Log"></a>'+
                                '<a class="scrollToBottom" onclick="MC.ui.logpopup.ScrollToBottomLog()" title="Scroll To Bottom"></a>'+
                                '<a class="scrollToTop disabled" onclick="MC.ui.logpopup.ScrollToTopLog()" title="Scroll To Top"></a>'+              
                            '</div>'+
                        '</div>'+
                        '<div class="popup k-window-content k-content" id="popupLogTable" style="display: block;" >' +
                            '<div id="LogFileDetails" style="overflow: auto; height: 585px;">' +
                                '<div class="logDetails"></div>'+
                            '</div>' +
                        '</div>');
            docElement.appendTo('body');
        });
        afterEach(function () {
            docElement.remove();
        });
        it("When click on scroll should set scrollToBottom to enable and scrollToTop to disable", function () {
            spyOn(MC.ui.logpopup, 'ScrollToBottomLog');
            MC.ui.logpopup.EnableCslAndLogViewScrollUpAndBottom(true);
            $("#LogFileDetails .logDetails").trigger('scroll');
            expect($('.scrollToBottom').attr('class')).toEqual('scrollToBottom disabled');
            expect($('.scrollToTop').attr('class')).toEqual('scrollToTop disabled');
        });
        it("When click on scroll to Bottom icon MC.ui.logpopup.ScrollToBottomLog should have been called", function () {
            spyOn(MC.ui.logpopup, 'ScrollToBottomLog');
            MC.ui.logpopup.EnableCslAndLogViewScrollUpAndBottom(true);
            $('.scrollToBottom').trigger('click');
            expect(MC.ui.logpopup.ScrollToBottomLog).toHaveBeenCalled();
        });
        it("When click on scroll to Top icon MC.ui.logpopup.ScrollToTopLog should have been called", function () {
            spyOn(MC.ui.logpopup, 'ScrollToTopLog');
            MC.ui.logpopup.EnableCslAndLogViewScrollUpAndBottom(true);
            $('.scrollToTop').trigger('click');
            expect(MC.ui.logpopup.ScrollToTopLog).toHaveBeenCalled();
        });
        it("When click on refreshLog icon MC.ui.logpopup.RefreshLog should have been called", function () {
            spyOn(MC.ui.logpopup, 'RefreshLog');
            MC.ui.logpopup.EnableCslAndLogViewScrollUpAndBottom(true);
            $('.refreshLog').trigger('click');
            expect(MC.ui.logpopup.RefreshLog).toHaveBeenCalled();
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
    describe(".RefreshLog", function () {
        it("Should call Ajac request", function () {
            var handler = {
                fail: function () {
                    return { done: function () { return true; } }
                }
            };
            spyOn(MC.ajax, 'request').and.returnValue(handler);
            MC.ui.logpopup.RefreshLog();
            expect(MC.ajax.request).toHaveBeenCalled();
        });
    });
    describe(".RefreshCsl", function () {
        it("Should call $.fn.data", function () {
            var handler = {
                dataSource: {
                    read: function () { return;}
                }
            }
            spyOn($.fn, 'data').and.returnValue(handler);
            MC.ui.logpopup.RefreshCsl();
            expect($.fn.data).toHaveBeenCalled();
        });
    });
});