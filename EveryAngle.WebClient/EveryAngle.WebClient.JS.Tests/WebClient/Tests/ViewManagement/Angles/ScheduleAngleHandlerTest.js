/// <reference path="/Dependencies/ViewModels/Models/User/UserModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Session/SessionModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/historymodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/ScheduleAngleHandler.js" />
/// <reference path="/Dependencies/User/Authentication.js" />

describe("ScheduleAngleHandler", function () {

    var scheduleAngleHandler;

    beforeEach(function () {
        scheduleAngleHandler = new ScheduleAngleHandler();
    });

    describe("when no tasks available", function () {
        it("should show alert popup ", function () {
            var e = {
                sender: {
                    wrapper: $()
                }
            };

            spyOn(popup, "Alert").and.callFake($.noop);
            spyOn(scheduleAngleHandler, "BindingFieldDropdownList").and.callFake($.noop);

            var data = { tasks: [] };
            scheduleAngleHandler.PopulateTaskList(e, data);

            expect(popup.Alert).toHaveBeenCalled();
            expect(scheduleAngleHandler.BindingFieldDropdownList).not.toHaveBeenCalled();
        });
    });

    describe("when tasks available", function () {
        it("should show popup with task dropdown list ", function () {
            var e = {
                sender: {
                    wrapper: $()
                }
            };

            displayModel.Data = ko.observable({
                used_in_task: true
            });

            spyOn(popup, "Alert").and.callFake($.noop);
            spyOn(scheduleAngleHandler, "CheckAlreadyAssignedDisplay").and.callFake(function () { return { tasks: [] }; });
            spyOn(scheduleAngleHandler, "BindingFieldDropdownList").and.callFake($.noop);

            var data = { tasks: [{ name: 'new task', uri: '/tasks/1' }] };
            scheduleAngleHandler.PopulateTaskList(e, data);

            expect(popup.Alert).not.toHaveBeenCalled();
            expect(scheduleAngleHandler.CheckAlreadyAssignedDisplay).toHaveBeenCalled();
            expect(scheduleAngleHandler.BindingFieldDropdownList).toHaveBeenCalled();
        });
    });

    describe("get task url", function () {
        it("should be in correct format", function () {

            var taskUri = 'tasks/1';

            displayModel.Data = ko.protectedObservable({
                uri: '/models/1/angles/1/displays/1'
            });

            var taskUrl = scheduleAngleHandler.GetTaskUrl(taskUri);
            var taskUrlFormat = "{0}admin/home/index#/Automation tasks/Tasks/Edit task/?parameters={\"tasksUri\":\"{1}{2}\",\"angleUri\":\"{3}\"}";
            var expecxtedUrl = kendo.format(taskUrlFormat, rootWebsitePath, webAPIUrl, taskUri, displayModel.Data().uri);
            expect(taskUrl).toEqual(expecxtedUrl);
        });
    });

    describe("when current display already assigned to task(s)", function () {
        it("should show check mark", function () {
            angleInfoModel.Data = ko.observable({
                id: '123'
            });

            displayModel.Data = ko.observable({
                id: '123',
                used_in_task: true
            });

            var data = { tasks: [{ name: 'new task', uri: '/tasks/1', actions: [{ arguments: [{ name: 'angle_id', value: '123' }, { name: 'display_id', value: '123' }] }] }] };
            var result = scheduleAngleHandler.CheckAlreadyAssignedDisplay(data.tasks);

            expect(result.selectedTaskId).toEqual('/tasks/1');
            expect(result.tasks[0].name).toContain('&check;');
        });
    });

    describe("when current display NOT assigned to any task(s)", function () {
        it("should pre select 'Select task..'", function () {
            angleInfoModel.Data = ko.observable({
                id: '1234'
            });

            displayModel.Data = ko.observable({
                id: '1234',
                used_in_task: true
            });

            var data = { tasks: [{ name: 'new task', uri: '/tasks/1', actions: [{ arguments: [{ name: 'angle_id', value: '123' }, { name: 'display_id', value: '123' }] }] }] };

            var result = scheduleAngleHandler.CheckAlreadyAssignedDisplay(data.tasks);


            expect(result.selectedTaskId).toEqual('');
            expect(result.tasks).toContain(data.tasks[0]);
        });
    });

    describe("gPopulateTaskList", function () {
        it("should return tasks filtered by run as user when use only user tasks", function () {
            var e = {
                sender: {
                    wrapper: $()
                }
            };

            displayModel.Data = ko.observable({
                used_in_task: true
            });

            spyOn(userModel, "Data").and.callFake(function () { return { 'id' : 'Viewer' }; });
            spyOn(popup, "Alert").and.callFake($.noop);
            spyOn(scheduleAngleHandler, "CheckAlreadyAssignedDisplay").and.callFake(function () { return { tasks: [] }; });
            spyOn(scheduleAngleHandler, "BindingFieldDropdownList").and.callFake($.noop);
            spyOn(scheduleAngleHandler, "UseOnlyUserTasks").and.callFake(function () { return true; });

            var data = {
                tasks: [
                    { name: 'task 4', uri: '/tasks/4', run_as_user: 'Viewer' },
                    { name: 'task 3', uri: '/tasks/3', run_as_user: 'EAAdmin' },
                    { name: 'task 2', uri: '/tasks/2', run_as_user: 'Viewer' },
                    { name: 'task 1', uri: '/tasks/1', run_as_user: 'EAAdmin' }
                ]
            };
            scheduleAngleHandler.PopulateTaskList(e, data);

            expect(data.tasks.length).toEqual(2);
            expect(data.tasks[0].name).toEqual('task 2');
            expect(data.tasks[1].name).toEqual('task 4');

            expect(popup.Alert).not.toHaveBeenCalled();
            expect(scheduleAngleHandler.CheckAlreadyAssignedDisplay).toHaveBeenCalled();
            expect(scheduleAngleHandler.BindingFieldDropdownList).toHaveBeenCalled();
        });
    });

});