/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.Tab.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />

describe("SidePanelHandler", function () {
    var sidePanelHandler;
    beforeEach(function () {
        sidePanelHandler = new SidePanelHandler();
    });

    describe(".Initial", function () {
        it("should initial", function () {
            // prepare
            spyOn(userSettingModel, 'InitialSidePanelSettingsData');
            spyOn(sidePanelHandler, 'InitialTab');
            spyOn(sidePanelHandler, 'InitialToggle');
            spyOn(sidePanelHandler, 'CreateSplitter');
            sidePanelHandler.Initial(
                new SidePanelStateManager('state1'),
                new SidePanelStateManager('state2'),
                new SidePanelStateManager('state3'));

            // assert
            expect(sidePanelHandler.StateManager.Size.Name).toEqual('state1');
            expect(sidePanelHandler.StateManager.Collapsed.Name).toEqual('state2');
            expect(sidePanelHandler.StateManager.Tab.Name).toEqual('state3');
            expect(userSettingModel.InitialSidePanelSettingsData).toHaveBeenCalled();
            expect(sidePanelHandler.InitialTab).toHaveBeenCalled();
            expect(sidePanelHandler.InitialToggle).toHaveBeenCalled();
            expect(sidePanelHandler.CreateSplitter).toHaveBeenCalled();
        });
    });

    describe(".SetActive", function () {
        it("should set active", function () {
            // prepare
            spyOn($.fn, 'addClass');
            sidePanelHandler.SetActive();

            // assert
            expect($.fn.addClass).toHaveBeenCalledWith('active');
        });
    });

    describe(".CreateSplitter", function () {
        it("should create a splitter", function () {
            $.fn.kendoSplitter = $.noop;
            sidePanelHandler.StateManager.Size = {};
            sidePanelHandler.StateManager.Collapsed = {};
            spyOn($.fn, 'kendoSplitter').and.returnValue({ data: $.noop });
            spyOn(sidePanelHandler, 'BindSplitterEvents');
            spyOn(sidePanelHandler, 'UpdateSplitter');
            sidePanelHandler.CreateSplitter();

            // assert
            expect($.fn.kendoSplitter).toHaveBeenCalled();
            expect(sidePanelHandler.BindSplitterEvents).toHaveBeenCalled();
            expect(sidePanelHandler.UpdateSplitter).toHaveBeenCalled();
        });
    });

    describe(".GetMaxSplitterSize", function () {
        it("should use a default maximum size", function () {
            // prepare
            userSettingModel.MinSidePanelSize = 100;
            WC.Window.Width = 100;
            var result = sidePanelHandler.GetMaxSplitterSize();

            // assert
            expect(result).toEqual(100);
        });
        it("should use 33% of window size", function () {
            // prepare
            userSettingModel.MinSidePanelSize = 100;
            WC.Window.Width = 1000;
            var result = sidePanelHandler.GetMaxSplitterSize();

            // assert
            expect(result).toEqual(330);
        });
    });

    describe(".SplitterResize", function () {
        it("should update maximum size", function () {
            // prepare
            var e = {
                sender: {
                    options: {
                        panes: [
                            { max: 0 }
                        ]
                    }
                }
            };
            spyOn(sidePanelHandler, 'GetMaxSplitterSize').and.returnValue(100);
            sidePanelHandler.SplitterResize(e);

            // assert
            expect(e.sender.options.panes[0].max).toEqual(100);
        });
    });

    describe(".UpdateSplitter", function () {
        beforeEach(function () {
            spyOn($.fn, 'removeClass');
            spyOn($.fn, 'addClass');
            spyOn($.fn, 'off');
        });
        it("should add class 'large' to side content and remove double click", function () {
            // prepare
            var splitter = {
                element: $()
            };
            spyOn($.fn, 'width').and.returnValue(1000);
            sidePanelHandler.UpdateSplitter(splitter);

            // assert
            expect($.fn.removeClass).toHaveBeenCalledWith('small large');
            expect($.fn.addClass).toHaveBeenCalledWith('large');
            expect($.fn.off).toHaveBeenCalledWith('dblclick');
        });
        it("should add class 'small' to side content and remove double click", function () {
            // prepare
            var splitter = {
                element: $()
            };
            spyOn($.fn, 'width').and.returnValue(100);
            sidePanelHandler.UpdateSplitter(splitter);

            // assert
            expect($.fn.removeClass).toHaveBeenCalledWith('small large');
            expect($.fn.addClass).toHaveBeenCalledWith('small');
            expect($.fn.off).toHaveBeenCalledWith('dblclick');
        });
    });

    describe(".BindSplitterEvents", function () {
        it("should bind and unbind events", function () {
            // prepare
            var splitter = {
                element: $(),
                resizing: {
                    _resizable: {
                        bind: $.noop
                    }
                }
            };

            spyOn(splitter.resizing._resizable, 'bind').and.returnValue(splitter.resizing._resizable);
            sidePanelHandler.BindSplitterEvents(splitter);

            // assert
            expect(splitter.resizing._resizable.bind).toHaveBeenCalledTimes(2);
        });
    });

    describe(".SplitterResizingStart", function () {
        it("should bind and unbind events", function () {
            // prepare
            var splitter = {
                wrapper: $()
            };
            spyOn($.fn, 'addClass');
            sidePanelHandler.SplitterResizingStart(splitter);

            // assert
            expect($.fn.addClass).toHaveBeenCalledWith('resizing');
        });
    });

    describe(".SplitterResizingEnd", function () {
        it("should update size", function () {
            // prepare
            var splitter = {
                wrapper: $(),
                options: {
                    panes: [
                        { size: 320 }
                    ]
                }
            };
            sidePanelHandler.StateManager.Size = { Save: $.noop };
            spyOn($.fn, 'removeClass');
            spyOn(sidePanelHandler.StateManager.Size, 'Save');
            spyOn(sidePanelHandler, 'UpdateSplitter');
            sidePanelHandler.SplitterResizingEnd(splitter);

            // assert
            expect($.fn.removeClass).toHaveBeenCalledWith('resizing');
            expect(sidePanelHandler.StateManager.Size.Save).toHaveBeenCalledWith(320);
            expect(sidePanelHandler.UpdateSplitter).toHaveBeenCalled();
        });
    });

    describe(".InitialToggle", function () {
        beforeEach(function () {
            sidePanelHandler.StateManager.Collapsed = { Name: 'state-1' };
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'on').and.returnValue($());
            spyOn($.fn, 'addClass').and.returnValue($());
            spyOn($.fn, 'removeClass').and.returnValue($());
        });
        it("should add class 'full'", function () {
            // prepare
            userSettingModel.SidePanelSettingsData['state-1'] = true;
            sidePanelHandler.InitialToggle();

            // assert
            expect($.fn.off).toHaveBeenCalledWith('click');
            expect($.fn.on).toHaveBeenCalledWith('click', sidePanelHandler.Toggle);
            expect($.fn.removeClass).toHaveBeenCalledWith('disabled');
            expect($.fn.addClass).toHaveBeenCalledWith('full');
        });
        it("should remove class 'full'", function () {
            // prepare
            userSettingModel.SidePanelSettingsData['state-1'] = false;
            sidePanelHandler.InitialToggle();

            // assert
            expect($.fn.off).toHaveBeenCalledWith('click');
            expect($.fn.on).toHaveBeenCalledWith('click', sidePanelHandler.Toggle);
            expect($.fn.removeClass).toHaveBeenCalledWith('disabled');
            expect($.fn.removeClass).toHaveBeenCalledWith('full');
        });
    });

    describe(".Toggle", function () {
        var splitter;
        beforeEach(function () {
            splitter = {
                expand: $.noop,
                collapse: $.noop
            };
            sidePanelHandler.StateManager.Collapsed = { Save: $.noop };
            spyOn($.fn, 'data').and.returnValue(splitter);
            spyOn($.fn, 'addClass').and.returnValue($());
            spyOn($.fn, 'removeClass');
            spyOn($.fn, 'toggleClass');
            spyOn(splitter, 'expand');
            spyOn(splitter, 'collapse');
            spyOn(sidePanelHandler.StateManager.Collapsed, 'Save');
            spyOn(sidePanelHandler, 'Open');
            spyOn(sidePanelHandler, 'Close');
        });
        it("should not do anything", function () {
            // prepare
            spyOn($.fn, 'hasClass').and.returnValue(true);
            sidePanelHandler.Toggle();

            // assert
            expect($.fn.toggleClass).not.toHaveBeenCalled();
        });
        it("should open side panel", function (done) {
            // prepare
            spyOn($.fn, 'hasClass').and.returnValues(false, true);
            sidePanelHandler.Enable();
            sidePanelHandler.Toggle();

            // assert
            expect($.fn.addClass).toHaveBeenCalledWith('toggling');
            expect($.fn.toggleClass).toHaveBeenCalled();
            expect(splitter.expand).toHaveBeenCalled();
            setTimeout(function () {
                expect($.fn.removeClass).toHaveBeenCalledWith('toggling');
                expect(splitter.collapse).not.toHaveBeenCalled();
                expect(sidePanelHandler.StateManager.Collapsed.Save).toHaveBeenCalled();
                done();
            }, 500);
        });
        it("should close side panel", function (done) {
            // prepare
            spyOn($.fn, 'hasClass').and.returnValues(false, false);
            sidePanelHandler.Disable();
            sidePanelHandler.Toggle();

            // assert
            expect($.fn.addClass).toHaveBeenCalledWith('toggling');
            expect($.fn.toggleClass).toHaveBeenCalled();
            expect(splitter.expand).not.toHaveBeenCalled();
            setTimeout(function () {
                expect($.fn.removeClass).toHaveBeenCalledWith('toggling');
                expect(splitter.collapse).toHaveBeenCalled();
                expect(sidePanelHandler.StateManager.Collapsed.Save).not.toHaveBeenCalled();
                done();
            }, 500);
        });
    });

    describe(".Open", function () {
        it("should open the panel", function () {
            // prepare
            spyOn($.fn, 'hasClass').and.returnValue(true);
            spyOn(sidePanelHandler, 'Toggle');
            spyOn(sidePanelHandler, 'SelectTab');
            sidePanelHandler.Open(3);

            // assert
            expect(sidePanelHandler.Toggle).toHaveBeenCalled();
            expect(sidePanelHandler.SelectTab).toHaveBeenCalledWith(3);
        });
        it("should not open the panel", function () {
            // prepare
            spyOn($.fn, 'hasClass').and.returnValue(false);
            spyOn(sidePanelHandler, 'Toggle');
            spyOn(sidePanelHandler, 'SelectTab');
            sidePanelHandler.Open(3);

            // assert
            expect(sidePanelHandler.Toggle).not.toHaveBeenCalled();
            expect(sidePanelHandler.SelectTab).toHaveBeenCalledWith(3);
        });
    });

    describe(".Close", function () {
        it("should close the panel", function () {
            // prepare
            spyOn($.fn, 'hasClass').and.returnValue(false);
            spyOn(sidePanelHandler, 'Toggle');
            sidePanelHandler.Close();

            // assert
            expect(sidePanelHandler.Toggle).toHaveBeenCalled();
        });
        it("should not close the panel", function () {
            // prepare
            spyOn($.fn, 'hasClass').and.returnValue(true);
            spyOn(sidePanelHandler, 'Toggle');
            sidePanelHandler.Close();

            // assert
            expect(sidePanelHandler.Toggle).not.toHaveBeenCalled();
        });
    });

    describe(".Disable", function () {
        it("should disable the panel", function () {
            // prepare
            spyOn($.fn, 'addClass');
            spyOn(sidePanelHandler, 'Close');
            sidePanelHandler.Disable();

            // assert
            expect($.fn.addClass).toHaveBeenCalledWith('invisible');
            expect(sidePanelHandler.Close).toHaveBeenCalled();
        });
    });

    describe(".Enable", function () {
        it("should enable the panel", function () {
            // prepare
            spyOn($.fn, 'removeClass');
            spyOn(sidePanelHandler, 'Open');
            sidePanelHandler.Enable();

            // assert
            expect($.fn.removeClass).toHaveBeenCalledWith('invisible');
            expect(sidePanelHandler.Open).not.toHaveBeenCalled();
        });
        it("should enable and open the panel", function () {
            // prepare
            spyOn($.fn, 'hasClass').and.returnValue(false);
            spyOn($.fn, 'removeClass');
            spyOn(sidePanelHandler, 'Open');
            spyOn(sidePanelHandler, 'Close');
            sidePanelHandler.Disable();
            sidePanelHandler.Enable();

            // assert
            expect($.fn.removeClass).toHaveBeenCalledWith('invisible');
            expect(sidePanelHandler.Open).toHaveBeenCalled();
        });
    });

    describe(".InitialTab", function () {
        it("should intial tab", function () {
            // prepare
            sidePanelHandler.StateManager.Tab = {};
            spyOn(WC.HtmlHelper, 'Tab');
            sidePanelHandler.InitialTab();

            // assert
            expect(WC.HtmlHelper.Tab).toHaveBeenCalled();
        });
    });

    describe(".SelectTab", function () {
        var tab;
        beforeEach(function () {
            tab = {
                active: $.noop
            };
            spyOn(tab, 'active');
            spyOn($.fn, 'data').and.returnValue(tab);
        });
        it("should select tab (2)", function () {
            // prepare
            sidePanelHandler.SelectTab(2);

            // assert
            expect(tab.active).toHaveBeenCalledWith(2);
        });
        it("should select tab (undefined)", function () {
            // prepare
            sidePanelHandler.SelectTab();

            // assert
            expect(tab.active).not.toHaveBeenCalled();
        });
    });

    describe(".InitialAccordion", function () {
        it("should intial accordion", function () {
            // prepare
            var mappers = {
                state1: $('<div/>'),
                state2: $('<div/>')
            };
            spyOn(sidePanelHandler, 'SetAccordionsToView');
            sidePanelHandler.InitialAccordion({}, mappers);

            // assert
            expect(mappers.state1.data('callback')).toBeDefined();
            expect(mappers.state2.data('callback')).toBeDefined();
            expect(sidePanelHandler.SetAccordionsToView).toHaveBeenCalled();
        });
    });

    describe(".SetAccordionsToView", function () {
        it("should update to view", function () {
            // prepare
            var target1 = $('<div class="close" />');
            var target2 = $('<div class="open" />');
            var target3 = $('<div class="close" />');
            var mappers = {
                accordion1: target1,
                accordion2: target2,
                accordion3: target3
            };
            userSettingModel.SidePanelSettingsData['my-state'] = {
                accordion1: true,
                accordion2: false,
                accordion3: true
            };
            var state = { Name: 'my-state' };
            sidePanelHandler.SetAccordionsToView(state, mappers);

            // assert
            expect(target1.hasClass('open')).toEqual(true);
            expect(target1.hasClass('close')).toEqual(false);
            expect(target2.hasClass('open')).toEqual(false);
            expect(target2.hasClass('close')).toEqual(true);
            expect(target3.hasClass('open')).toEqual(true);
            expect(target3.hasClass('close')).toEqual(false);
        });
    });

    describe(".GetAccordionValues", function () {
        it("should update to view", function () {
            // prepare
            var target1 = $('<div class="close" />');
            var target2 = $('<div class="open" />');
            var target3 = $();
            var mappers = {
                accordion1: target1,
                accordion2: target2,
                accordion3: target3
            };
            userSettingModel.SidePanelSettingsData['my-state'] = {
                accordion1: true,
                accordion2: true,
                accordion3: true
            };
            var state = { Name: 'my-state' };
            var result = sidePanelHandler.GetAccordionValues(state, mappers);

            // assert
            expect(result.accordion1).toEqual(false);
            expect(result.accordion2).toEqual(true);
            expect(result.accordion3).toEqual(true);
        });
    });

    describe(".SaveAccordion", function () {
        it("should save accordion", function () {
            // prepare
            var mappers = {
                state1: $('<div/>'),
                state2: $('<div/>')
            };
            var state = { Save: $.noop };
            spyOn(state, 'Save');
            spyOn(sidePanelHandler, 'GetAccordionValues').and.returnValue('my-values');
            sidePanelHandler.SaveAccordion(state, mappers);

            // assert
            expect(state.Save).toHaveBeenCalledWith('my-values');
        });
    });
    describe(".OpenAccordion", function () {
        it("should call trigger with click parameter", function () {
            //prepare
            var target = '#TabContentAngle .section-definition > .accordion-header';
            spyOn(jQuery.fn, 'trigger').and.returnValue($());
            sidePanelHandler.OpenAccordion(target);

            //assert
            expect(jQuery.fn.trigger).toHaveBeenCalledWith('click');
        });
    });
});

describe("SidePanelStateManager", function () {
    beforeEach(function () {
    });

    describe("constructor", function () {
        it("should initial", function () {
            // prepare
            sidePanelStateManager = new SidePanelStateManager('my-state');

            // assert
            expect(sidePanelStateManager.Name).toEqual('my-state');
            expect(typeof sidePanelStateManager.Save === 'function').toEqual(true);
        });
    });

    describe(".Save", function () {
        it("should save and execute a callback function", function () {
            // prepare
            var my = { callback: $.noop };
            spyOn(my, 'callback');
            spyOn(userSettingModel, 'SetSidePanelSettings');
            sidePanelStateManager = new SidePanelStateManager('my-state', my.callback);
            sidePanelStateManager.Save('my-value');

            // assert
            expect(userSettingModel.SetSidePanelSettings).toHaveBeenCalled();
            expect(my.callback).toHaveBeenCalledWith('my-state', 'my-value');
        });
    });
});