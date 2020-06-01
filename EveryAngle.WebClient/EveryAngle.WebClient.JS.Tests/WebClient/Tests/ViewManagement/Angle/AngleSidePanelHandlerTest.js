/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelHandler.js" />

describe("AngleSidePanelHandler", function () {
    var angleSidePanelHandler;
    beforeEach(function () {
        angleSidePanelHandler = new AngleSidePanelHandler();
    });

    describe(".InitialAngle", function () {
        it("should initial", function () {
            // prepare
            spyOn(angleSidePanelHandler, 'Initial');
            spyOn(angleSidePanelHandler, 'SetTemplates');
            angleSidePanelHandler.InitialAngle();

            // assert
            expect(angleSidePanelHandler.Initial).toHaveBeenCalled();
            expect(angleSidePanelHandler.SetTemplates).toHaveBeenCalled();
            expect(angleSidePanelHandler.StateManager.AngleAccordions).not.toBeNull();
            expect(angleSidePanelHandler.StateManager.DisplayAccordions).not.toBeNull();
        });
    });

    describe(".TabStateChange", function () {
        it("should update UI", function () {
            // prepare
            spyOn(kendo, 'resize');
            angleSidePanelHandler.TabStateChange();

            // assert
            expect(kendo.resize).toHaveBeenCalled();
        });
    });

    describe(".SetTemplates", function () {
        it("should set templates and accordions", function () {
            // prepare
            spyOn(angleSidePanelHandler, 'InitialAccordion');
            spyOn(angleSidePanelHandler, 'SetDisplayTemplates');
            angleSidePanelHandler.SetTemplates();

            // assert
            expect(angleSidePanelHandler.InitialAccordion).toHaveBeenCalled();
            expect(angleSidePanelHandler.SetDisplayTemplates).toHaveBeenCalled();
        });
    });

    describe(".SetDisplayTemplates", function () {
        it("should set templates and accordions", function () {
            // prepare
            spyOn(angleSidePanelHandler, 'InitialAccordion');
            angleSidePanelHandler.SetDisplayTemplates();

            // assert
            expect(angleSidePanelHandler.InitialAccordion).toHaveBeenCalled();
        });
    });
});