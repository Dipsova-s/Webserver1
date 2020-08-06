/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/UserModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Session/SessionModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/FieldSettingsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ScheduleAngleHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/User/Authentication.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemInformationHandler.js" />

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
            
            spyOn(displayModel, 'Data').and.returnValue({
                used_in_task: true
            });
            spyOn(scheduleAngleHandler, "IsPrivilegeUser").and.returnValue(true);
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

            spyOn(displayModel, 'Data').and.returnValue({
                uri: '/models/1/angles/1/displays/1'
            });
            var taskUrl = scheduleAngleHandler.GetTaskUrl(taskUri);
            var taskUrlFormat = "{0}admin/home/index#/Angle exports/Automation tasks/Edit task/?parameters={\"tasksUri\":\"{1}{2}\",\"angleUri\":\"{3}\"}";
            var expecxtedUrl = kendo.format(taskUrlFormat, rootWebsitePath, webAPIUrl, taskUri, displayModel.Data().uri);
            expect(taskUrl).toEqual(expecxtedUrl);
        });
    });

    describe("when current display already assigned to task(s)", function () {
        it("should show check mark", function () {
            spyOn(angleInfoModel, 'Data').and.returnValue({
                id: '123'
            });
            spyOn(displayModel, 'Data').and.returnValue({
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
            spyOn(angleInfoModel, 'Data').and.returnValue({
                id: '1234'
            });
            spyOn(displayModel, 'Data').and.returnValue({
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
        it("should return all tasks to the user who has schedule angle privilege or manage system privilege", function () {
            var e = {
                sender: {
                    wrapper: $()
                }
            };
            spyOn(displayModel, 'Data').and.returnValue({
                used_in_task: true
            });

            spyOn(userModel, "Data").and.callFake(function () { return { 'id' : 'Viewer' }; });
            spyOn(popup, "Alert").and.callFake($.noop);
            spyOn(scheduleAngleHandler, "CheckAlreadyAssignedDisplay").and.callFake(function () { return { tasks: [] }; });
            spyOn(scheduleAngleHandler, "BindingFieldDropdownList").and.callFake($.noop);
            spyOn(scheduleAngleHandler, "IsPrivilegeUser").and.returnValue(true);
            var data = {
                tasks: [
                    { name: 'task 4', uri: '/tasks/4', run_as_user: 'Viewer' },
                    { name: 'task 3', uri: '/tasks/3', run_as_user: 'EAAdmin' },
                    { name: 'task 2', uri: '/tasks/2', run_as_user: 'Viewer' },
                    { name: 'task 1', uri: '/tasks/1', run_as_user: 'EAAdmin' }
                ]
            };
            scheduleAngleHandler.PopulateTaskList(e, data);

            expect(data.tasks.length).toEqual(4);
            expect(data.tasks[0].name).toEqual('task 1');
            expect(data.tasks[1].name).toEqual('task 2');
            expect(data.tasks[2].name).toEqual('task 3');
            expect(data.tasks[3].name).toEqual('task 4');

            expect(popup.Alert).not.toHaveBeenCalled();
            expect(scheduleAngleHandler.CheckAlreadyAssignedDisplay).toHaveBeenCalled();
            expect(scheduleAngleHandler.BindingFieldDropdownList).toHaveBeenCalled();
        });
        it("should not return the tasks to the user who does not has schedule angle privilege or manage system privilege", function () {
            var e = {
                sender: {
                    wrapper: $()
                }
            };
            spyOn(displayModel, 'Data').and.returnValue({
                used_in_task: true
            });

            spyOn(userModel, "Data").and.callFake(function () { return { 'id': 'Viewer' }; });
            spyOn(popup, "Alert").and.callFake($.noop);
            spyOn(scheduleAngleHandler, "IsPrivilegeUser").and.returnValue(false);
            var data = {
                tasks: [
                    { name: 'task 4', uri: '/tasks/4', run_as_user: 'Viewer' },
                    { name: 'task 3', uri: '/tasks/3', run_as_user: 'EAAdmin' },
                ]
            };
            scheduleAngleHandler.PopulateTaskList(e, data);

            expect(popup.Alert).toHaveBeenCalled();
        });
    });

    describe("IsPrivilegeUser", function () {
        it("should return true if user has manage system privilege", function () {
            //arrange.
            spyOn(userModel, "IsPossibleToManageSystem").and.returnValue(true); 
            spyOn(userModel, "IsPossibleToScheduleAngles").and.returnValue(false);
            spyOn(systemInformationHandler, "IsSupportAngleAutomation").and.returnValue(true);

            //act.
            var result = scheduleAngleHandler.IsPrivilegeUser();

            //assert.
            expect(result).toEqual(true);
        });
        it("should return true if user has manage schedule angles", function () {
            //arrange.
            spyOn(userModel, "IsPossibleToManageSystem").and.returnValue(false);
            spyOn(userModel, "IsPossibleToScheduleAngles").and.returnValue(true);
            spyOn(systemInformationHandler, "IsSupportAngleAutomation").and.returnValue(true);

            //act.
            var result = scheduleAngleHandler.IsPrivilegeUser();

            //assert.
            expect(result).toEqual(true);
        });
        it("should return false if user does not has manage schedule angles", function () {
            //arrange.
            spyOn(userModel, "IsPossibleToManageSystem").and.returnValue(false);
            spyOn(userModel, "IsPossibleToScheduleAngles").and.returnValue(false);
            spyOn(systemInformationHandler, "IsSupportAngleAutomation").and.returnValue(true);

            //act.
            var result = scheduleAngleHandler.IsPrivilegeUser();

            //assert.
            expect(result).toEqual(false);
        });
        it("should return true if user has both manage system privilege and manage schedule angles", function () {
            //arrange.
            spyOn(userModel, "IsPossibleToManageSystem").and.returnValue(true);
            spyOn(userModel, "IsPossibleToScheduleAngles").and.returnValue(true);
            spyOn(systemInformationHandler, "IsSupportAngleAutomation").and.returnValue(true);

            //act.
            var result = scheduleAngleHandler.IsPrivilegeUser();

            //assert.
            expect(result).toEqual(true);
        });
        it("should return false if manage schedule angles but not support for Angle Automation", function () {
            //arrange.
            spyOn(userModel, "IsPossibleToManageSystem").and.returnValue(false);
            spyOn(userModel, "IsPossibleToScheduleAngles").and.returnValue(true);
            spyOn(systemInformationHandler, "IsSupportAngleAutomation").and.returnValue(false);

            //act.
            var result = scheduleAngleHandler.IsPrivilegeUser();

            //assert.
            expect(result).toEqual(false);
        });
    });

});