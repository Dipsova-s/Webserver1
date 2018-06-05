/// <reference path="/../SharedDependencies/FieldsChooser.js" />
/// <reference path="/Dependencies/page/MC.Models.RefreshCycle.js" />


describe("MC.Models.RefreshCycle", function () {
    var refreshCycle;
    beforeEach(function () {
        refreshCycle = MC.Models.RefreshCycle;
    });

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(refreshCycle).toBeDefined();
        });
    });

    describe(".GetActionList", function () {
        beforeEach(function () {
            refreshCycle.ActionsList = [
                {
                    "id": "CheckTables",
                    "name": "CheckTables"
                }
            ];
        });
        it("should have pre-value", function () {
            var preValue = {
                id: '',
                name: 'please select'
            };
            var expectedResult = refreshCycle.SetPreValueActionList(refreshCycle.GetActionList(), preValue)[0];
            expect(expectedResult.id).toEqual('');
            expect(expectedResult.name).toEqual('please select');
        });
        it("should don't have pre-value", function () {
            var expectedResult = refreshCycle.GetActionList()[0];
            expect(expectedResult.id).toEqual('CheckTables');
            expect(expectedResult.name).toEqual('CheckTables');
        });
    });

    describe(".BindingDataToForm", function () {
        beforeEach(function () {
            spyOn(refreshCycle, 'GetRefreshCycleForm').and.returnValue($());
            spyOn(refreshCycle, 'TriggerTypeChange').and.callFake($.noop);
            spyOn(refreshCycle, 'ContinuousChange').and.callFake($.noop);
            spyOn(refreshCycle, 'BindingSpecifyTablesDataToForm').and.callFake($.noop);
            spyOn(MC.util.task, 'isTriggerExternal').and.returnValue(true);
            spyOn(MC.util.task, 'isContinuous').and.returnValue(true);
            spyOn(MC.util.task, 'getTriggerDays').and.returnValue(true);
            spyOn(MC.util.task, 'getTriggerDayStatus').and.returnValue(true);
            spyOn(MC.util, 'unixtimeToTimePicker').and.returnValue(1);
            spyOn($.fn, 'data').and.returnValue({ value: $.noop, trigger: $.noop });
        });

        it("should run without error", function () {
            var data = {
                RefreshCycleTrigger: {}
            };
            refreshCycle.BindingDataToForm(data);

            expect(refreshCycle.BindingSpecifyTablesDataToForm).toHaveBeenCalled();
        });
    });
});
