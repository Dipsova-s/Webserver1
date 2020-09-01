/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ExecutionParameterHandler.js" />

describe("ExecutionParameterHandler", function () {
    var handler;
    var queryDefinitionHandler;

    beforeEach(function () {
        handler = new ExecutionParameterHandler();
        queryDefinitionHandler = new QueryDefinitionHandler();
    });

    describe(".EditAllFilter", function () {
        it('should call EditFilter for each execution parameter with edit_mode true', function () {
            var executionParameters = [
                { edit_mode: ko.observable(false) },
                { edit_mode: ko.observable(false) }
            ];

            spyOn(queryDefinitionHandler, 'GetExecutionParameters').and.returnValue(executionParameters);
            spyOn(queryDefinitionHandler, 'EditFilter');
            spyOn(queryDefinitionHandler, 'ScrollToItem');
            spyOn(executionParameters[0], 'edit_mode');
            spyOn(executionParameters[1], 'edit_mode');

            handler.EditAllFilters(queryDefinitionHandler);

            // assert
            expect(queryDefinitionHandler.EditFilter).toHaveBeenCalledTimes(2);
            expect(queryDefinitionHandler.EditFilter).toHaveBeenCalledWith(executionParameters[0]);
            expect(queryDefinitionHandler.EditFilter).toHaveBeenCalledWith(executionParameters[1]);

            expect(executionParameters[0].edit_mode).toHaveBeenCalledWith(true);
            expect(executionParameters[1].edit_mode).toHaveBeenCalledWith(true);

            expect(queryDefinitionHandler.ScrollToItem).toHaveBeenCalledWith(executionParameters[0]);
        });
    });

    describe(".InitialAngleWidgets", function () {
        it("should initiate angle widgets", function () {
            var e = { sender: { element: $() } };
            var queryDefinitionHandler = {
                AllowExecutionParameter: $.noop,
                Authorizations: { CanChangeFilter: $.noop },
                SetData: $.noop,
                ApplyHandler: $.noop,
                GetBaseClasses: $.noop
            };

            spyOn(window, 'QueryDefinitionHandler').and.returnValue(queryDefinitionHandler);
            spyOn(queryDefinitionHandler, 'AllowExecutionParameter');
            spyOn(queryDefinitionHandler.Authorizations, 'CanChangeFilter');
            spyOn(queryDefinitionHandler, 'SetData');
            spyOn(queryDefinitionHandler, 'ApplyHandler');

            spyOn(handler, 'WidgetFilterAngle');
            spyOn(handler, 'SetAngleClassesHtml');
            spyOn(handler, 'Angle');

            handler.InitialAngleWidgets(e);

            // assert
            expect(queryDefinitionHandler.AllowExecutionParameter).toHaveBeenCalledWith(false);
            expect(queryDefinitionHandler.Authorizations.CanChangeFilter).toHaveBeenCalledWith(true);

            expect(queryDefinitionHandler.CanEditFilter()).toEqual(false);
            expect(queryDefinitionHandler.CanSortFilter()).toEqual(false);
            expect(queryDefinitionHandler.CanMoveFilter()).toEqual(false);

            expect(queryDefinitionHandler.SetData).toHaveBeenCalled();
            expect(queryDefinitionHandler.ApplyHandler).toHaveBeenCalled();

            expect(handler.WidgetFilterAngle).toBeDefined();
            expect(handler.WidgetFilterAngle).toEqual(queryDefinitionHandler);

            expect(handler.SetAngleClassesHtml).toBeDefined();
            expect(handler.SetAngleClassesHtml).toHaveBeenCalled();
        });
    });

    describe(".InitialDisplayWidgets", function () {
        it("should initiate display widgets", function () {
            var e = { sender: { element: $() } };
            var queryDefinitionHandler = {
                Parent: $.noop,
                AllowExecutionParameter: $.noop,
                Authorizations: { CanChangeFilter: $.noop },
                SetData: $.noop,
                ApplyHandler: $.noop,
                GetBaseClasses: $.noop
            };

            spyOn(window, 'QueryDefinitionHandler').and.returnValue(queryDefinitionHandler);
            spyOn(queryDefinitionHandler, 'AllowExecutionParameter');
            spyOn(queryDefinitionHandler, 'Parent');
            spyOn(queryDefinitionHandler.Authorizations, 'CanChangeFilter');
            spyOn(queryDefinitionHandler, 'SetData');
            spyOn(queryDefinitionHandler, 'ApplyHandler');

            spyOn(handler, 'WidgetFilterAngle');
            spyOn(handler, 'WidgetFilterDisplay'); 
            spyOn(handler, 'Angle');
            spyOn(handler, 'Display');

            handler.InitialDisplayWidgets(e);

            // assert
            expect(queryDefinitionHandler.Parent).toHaveBeenCalledWith(handler.WidgetFilterAngle);
            expect(queryDefinitionHandler.AllowExecutionParameter).toHaveBeenCalledWith(false);
            expect(queryDefinitionHandler.Authorizations.CanChangeFilter).toHaveBeenCalledWith(true);

            expect(queryDefinitionHandler.CanEditFilter()).toEqual(false);
            expect(queryDefinitionHandler.CanSortFilter()).toEqual(false);
            expect(queryDefinitionHandler.CanMoveFilter()).toEqual(false);

            expect(queryDefinitionHandler.SetData).toHaveBeenCalled();
            expect(queryDefinitionHandler.ApplyHandler).toHaveBeenCalled();

            expect(handler.WidgetFilterDisplay).toBeDefined();
            expect(handler.WidgetFilterDisplay).toEqual(queryDefinitionHandler);
        });
    });
});