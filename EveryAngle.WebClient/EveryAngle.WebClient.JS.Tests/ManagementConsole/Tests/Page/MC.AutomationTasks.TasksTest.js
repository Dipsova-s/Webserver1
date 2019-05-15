/// <reference path="/../SharedDependencies/FieldsChooser.js" />
/// <reference path="/Dependencies/page/MC.AutomationTasks.Tasks.js" />

describe("MC.AutomationTasks.Tasks => Task get correct argument data for execution parameter.", function () {

    var automationTask;

    beforeEach(function () {
        automationTask = MC.AutomationTasks.Tasks;
    });

    describe("When argument value are ", function () {

        it("argument value undefiened get empty string", function () {
            // prepare
            var expectedValue = '';
            var actualValue = automationTask.GetArgumentValue();

            // assert
            expect(expectedValue).toEqual(actualValue);
        });

        it("normal argument get correct value", function () {
            // prepare
            var expectedValue = 8;
            var data = 8;
            var actualValue = automationTask.GetArgumentValue(data);

            // assert
            expect(expectedValue).toEqual(actualValue);
        });

        it("object argument get correct value", function () {
            // prepare
            var expectedValue = 5;
            var data = { argument_type: 'value', value: 5 };
            var actualValue = automationTask.GetArgumentValue(data);

            // assert
            expect(expectedValue).toEqual(actualValue);
        });

        it("object argument lists get correct value", function () {
            // prepare
            var expectedValue = '5,10';
            var data = [{ argument_type: 'value', value: 5 }, { argument_type: 'value', value: 10 }];
            var actualValue = automationTask.GetArgumentsListValue(data);

            // assert
            expect(expectedValue).toEqual(actualValue);
        });

        it("normal argument lists get correct value", function () {
            // prepare
            var expectedValue = '25,30';
            var data = [25, 30];
            var actualValue = automationTask.GetArgumentsListValue(data);

            // assert
            expect(expectedValue).toEqual(actualValue);
        });
    });

    describe("call GetActionType", function () {

        // tests data
        var testValues = ['schedule', 'event', 'external'];
        var expectValues = ['Schedule', 'Event', 'External'];

        $.each(testValues, function (index, triggerType) {
            it("should get correct value by " + triggerType, function () {

                // begin test
                var result = automationTask.GetActionType(triggerType);

                // assert
                expect(expectValues[index]).toEqual(result);
            });
        });

    });

    describe("call SetValueToEventTypesDropdown", function () {

        // tests data
        var eventTypes = { event: 'event', external: 'external' };
        var triggerType = [{ event: 'xxxxx' }];
        var kendoDropdown = { value: $.noop };
        var testValues = [{
            title: 'cannot set event dropdown and show element',
            taskData: { triggers: [] },
            triggerType: eventTypes.event,
            eventTypesDropdown: kendoDropdown,
            expectValueCall: false
        },
        {
            title: 'can set event dropdown and show element',
            taskData: { triggers: triggerType },
            triggerType: eventTypes.event,
            eventTypesDropdown: kendoDropdown,
            expectValueCall: true
        },
        {
            title: 'cannot set event dropdown and hide element',
            taskData: { triggers: triggerType },
            triggerType: eventTypes.external,
            eventTypesDropdown: kendoDropdown,
            expectValueCall: false
        }];

        $.each(testValues, function (index, testValue) {
            it(testValue.title, function () {

                // initial
                spyOn(testValue.eventTypesDropdown, 'value').and.callFake($.noop);
                spyOn(MC.AutomationTasks.Tasks, 'SetValueToEventModelsDropdown').and.callFake($.noop);

                // begin test
                automationTask.SetValueToEventTypesDropdown(testValue.taskData, testValue.triggerType, testValue.eventTypesDropdown);

                // assert
                if (testValue.expectValueCall) {
                    expect(testValue.eventTypesDropdown.value).toHaveBeenCalled();
                } else {
                    expect(testValue.eventTypesDropdown.value).not.toHaveBeenCalled();
                }

            });
        });

    });

    describe('call SetValueToEventModelsDropdown', function () {

        // tests data
        var tests = [{
            title: 'should set event model to dropdown, when model is no null',
            arguments: {
                triggerData: {
                    arguments: {
                        findObject: $.noop
                    }
                },
                modelsDropdown: { value: $.noop }
            },
            expectedFuncCall: true
        },
        {
            title: 'should not set event model to dropdown, when model is null',
            arguments: {
                triggerData: {
                    arguments: {
                        findObject: $.noop
                    }
                },
                modelsDropdown: { value: $.noop }
            },
            expectedFuncCall: false
        }];

        $.each(tests, function (index, test) {
            it(test.title, function () {

                // initial
                spyOn(test.arguments.modelsDropdown, 'value').and.callFake($.noop);
                if (test.expectedFuncCall) {
                    spyOn(test.arguments.triggerData.arguments, 'findObject').and.callFake(function () {
                        return {
                            name: 'model',
                            value: 'EA4IT'
                        };
                    });
                }

                // begin test
                automationTask.SetValueToEventModelsDropdown(test.arguments.triggerData, test.arguments.modelsDropdown);

                // assert
                if (test.expectedFuncCall) {
                    expect(test.arguments.modelsDropdown.value).toHaveBeenCalled();
                }
                else {
                    expect(test.arguments.modelsDropdown.value).not.toHaveBeenCalled();
                }
            });
        });

    });

    describe("call AdjustLayoutByActionType", function () {

        // tests data
        var kendoDropdown = { wrapper: { show: $.noop, hide: $.noop } };
        var testValues = [{
            title: 'if action type is event',
            actionType: 'Event',
            eventTypesDropdown: kendoDropdown,
            expectShowEventTypeDropdown: true
        },
        {
            title: 'if action type is schedule',
            actionType: 'Schedule',
            eventTypesDropdown: kendoDropdown,
            expectShowEventTypeDropdown: false
        },
        {
            title: 'if action type is external',
            actionType: 'External',
            eventTypesDropdown: kendoDropdown,
            expectShowEventTypeDropdown: false
        }];

        $.each(testValues, function (index, testValue) {
            it(testValue.title, function () {

                // initial
                spyOn(testValue.eventTypesDropdown.wrapper, 'show').and.callFake($.noop);
                spyOn(testValue.eventTypesDropdown.wrapper, 'hide').and.callFake($.noop);

                // begin test
                automationTask.AdjustLayoutByActionType(testValue.actionType, testValue.eventTypesDropdown);

                // assert
                if (testValue.expectShowEventTypeDropdown) {
                    expect(testValue.eventTypesDropdown.wrapper.show).toHaveBeenCalled();
                }
                else {
                    expect(testValue.eventTypesDropdown.wrapper.hide).toHaveBeenCalled();
                }

            });
        });

    });

    describe("call SetAbilityToEditControl", function () {

        // tests data
        var testValues = [{
            title: 'if action type is external',
            data: {
                task: { id: 0, name: 'test', Uri: 'https://app.com/task/1', status: 'running', created: { Uri: 'hero' }, Triggers: [{ trigger_type: 'external' }] },
                manageSystemPrivilege: true,
                canScheduleAngles: true,
                currentUser: 'hero'
            }
        }];

        $.each(testValues, function (index, testValue) {
            it(testValue.title, function () {

                // initial
                spyOn(MC.util.task, 'getTriggerExternalUrl').and.callFake($.noop);

                // begin test
                automationTask.SetAbilityToEditControl(testValue.data.task, testValue.data.manageSystemPrivilege, testValue.data.canScheduleAngles, testValue.data.currentUser);

                // assert
                expect(MC.util.task.getTriggerExternalUrl).toHaveBeenCalled();
            });
        });

    });

    describe("call GetData", function () {

        var uid;
        var dataItems = {
            1: { is_edited: false },
            2: { is_edited: false },
            3: { is_edited: true }
        };

        beforeEach(function () {
            uid = 0;
            automationTask.IsTaskActionsSorted = false;
            spyOn(automationTask, 'GetTaskData').and.returnValue({});
            spyOn(jQuery.fn, 'hasClass').and.returnValue(false);
            spyOn(jQuery.fn, 'data').and.callFake(function (dataId) {
                if (dataId === 'uid') {
                    uid++;
                    return uid;
                }
                else if (dataId === 'kendoGrid') {
                    return {
                        items: function () {
                            var items = [];
                            for (var i = 0; i < Object.keys(dataItems).length; i++) {
                                items.push(i);
                            }
                            return items;
                        },
                        dataSource: {
                            getByUid: function (uid) {
                                return dataItems[uid];
                            }
                        }
                    };
                }
            });
        });

        it("should PUT task action(s) that only contains 'is_edited'", function () {
            var result = automationTask.GetData();
            expect(result.actions.length).toEqual(1);

            // verify sort index as well
            expect(result.actions[0].order).toEqual(2);
        });
        it("should PUT all task actions when task action has the sorting", function () {
            automationTask.IsTaskActionsSorted = true;
            var result = automationTask.GetData();
            expect(result.actions.length).toEqual(3);
        });

    });

});
