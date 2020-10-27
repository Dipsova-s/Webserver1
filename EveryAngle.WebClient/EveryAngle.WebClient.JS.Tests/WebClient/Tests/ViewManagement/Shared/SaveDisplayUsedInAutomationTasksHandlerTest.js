/// <chutzpah_reference path="/../../Dependencies/HtmlTemplate/SaveDisplaysUsedInAutomationTasks/savedisplaysusedinautomationtaskshtmltemplate.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ScheduleAngleHandler.js" />

describe("SaveDisplaysUsedInAutomationTasksHandler", function () {
    var saveDisplaysUsedInAutomationTasksHandler;
    beforeEach(function () {
        saveDisplaysUsedInAutomationTasksHandler = new SaveDisplaysUsedInAutomationTasksHandler();
    });

    describe(".ShowSavePopup", function () {
        it("should open a popup", function () {
            var changedDisplaysUsedInTask = { DispalyTotal: 1, Display: [{}] };
            spyOn(popup, 'Show');

            // call
            saveDisplaysUsedInAutomationTasksHandler.ShowSavePopup(changedDisplaysUsedInTask, $.noop, $.noop);

            // assert
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe(".IsDisplayRequiredToSave", function () {
        it("should return true", function () {
            var displayUri = "display/1";
            spyOn(saveDisplaysUsedInAutomationTasksHandler, "CheckedDisplaysInTask").and.returnValue(['display/1']);

            // call
            var result = saveDisplaysUsedInAutomationTasksHandler.IsDisplayRequiredToSave(displayUri);

            // assert
            expect(result).toBe(true);
        });

        it("should return false", function () {
            var displayUri = "display/2";
            spyOn(saveDisplaysUsedInAutomationTasksHandler, "CheckedDisplaysInTask").and.returnValue(['display/1']);

            // call
            var result = saveDisplaysUsedInAutomationTasksHandler.IsDisplayRequiredToSave(displayUri);

            // assert
            expect(result).toBe(false);
        });
    });

    describe(".LoadTaskDetails", function () {
        it("should load tasks details", function () {
            var tasks = [{task_uri: "task/1"},{task_uri: "task/2"}];
            var displayUri = "display/1";
            spyOn(scheduleAngleHandler, "GetTaskUrlForDisplay");
            saveDisplaysUsedInAutomationTasksHandler.AccessManagementConsoleStatus(true);
            // call
            saveDisplaysUsedInAutomationTasksHandler.LoadTaskDetails(tasks, displayUri);

            // assert
            expect(scheduleAngleHandler.GetTaskUrlForDisplay).toHaveBeenCalledTimes(2);
        });
    });

    describe(".GetDispalyTaskInfo", function () {
        it("should return display's tasks info", function () {
            var displayDetails = { uri: "display/1" };
            spyOn(window, 'GetDataFromWebService').and.callFake(function () { return $.when($.Deferred().resolve({})); });

            // call
            var result = saveDisplaysUsedInAutomationTasksHandler.GetDispalyTaskInfo(displayDetails);

            // assert
            expect(window.GetDataFromWebService).toHaveBeenCalledWith("display/1/tasks");
            expect(result).toBeTruthy();
        });
    });

    describe(".LoadValues", function () {
        it("should load values", function () {
            var changedDisplaysUsedInTask = [{ Details: { uri: "display/1" } }];
            var e = {
                sender: {
                    element: {
                        busyIndicator: function () { }
                    },
                    wrapper: {
                        find: function () {
                            return { trigger: function () { } }
                        }                        
                    }
                }
            };

            spyOn(saveDisplaysUsedInAutomationTasksHandler, "GetDispalyTaskInfo").and.callFake(function () { return $.when($.Deferred().resolve({tasks: []})); });

            // call
            saveDisplaysUsedInAutomationTasksHandler.LoadValues(changedDisplaysUsedInTask, e);

            //assert
            expect(saveDisplaysUsedInAutomationTasksHandler.GetDispalyTaskInfo).toHaveBeenCalledTimes(1);
        })
    });
});
