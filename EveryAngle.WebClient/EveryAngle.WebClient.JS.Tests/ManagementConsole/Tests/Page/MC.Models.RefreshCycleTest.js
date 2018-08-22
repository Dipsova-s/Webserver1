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
            spyOn(refreshCycle, 'DeltaChange').and.callFake($.noop);
            spyOn(refreshCycle, 'ChangedTablesOnlyChange').and.callFake($.noop);
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

    describe("UpdateSpecifyTableLabelVisible", function () {

        var selectedTableListElement;

        beforeEach(function () { 
            selectedTableListElement = $('<div id="SelectedTableList" class="hidden"></div>');
        });

        it("Hide SpecifiTableLabel when input empty", function () {
            var input = '';
            selectedTableListElement.text('TableName');

            refreshCycle.UpdateSpecifyTableLabelVisible(selectedTableListElement, input);
            expect(selectedTableListElement.hasClass('hidden')).toEqual(true);
        });

        it("Hide SpecifiTableLabel when input other than Tables", function () {
            var input = 'Something else';
            selectedTableListElement.text('TableName');
            
            refreshCycle.UpdateSpecifyTableLabelVisible(selectedTableListElement, input);
            expect(selectedTableListElement.hasClass('hidden')).toEqual(true);
        });

        it("Hide SpecifiTableLabel when SpecifiTableLabel is empty", function () {
            var input = 'Tables';
            selectedTableListElement.text('');

            refreshCycle.UpdateSpecifyTableLabelVisible(selectedTableListElement, input);
            expect(selectedTableListElement.hasClass('hidden')).toEqual(true);
        });

        it("Show SpecifiTableLabel when input Tables", function () {
            var input = 'Tables';
            selectedTableListElement.text('TableName');

            refreshCycle.UpdateSpecifyTableLabelVisible(selectedTableListElement, input);
            expect(selectedTableListElement.hasClass('hidden')).toEqual(false);
        });
    });

    describe(".DeltaChange", function () {
        
        var form;

        beforeEach(function () {

            form = $('<form />', { html: '<input type="checkbox" name="ChangedTablesOnly" />' });

            spyOn(refreshCycle, 'GetRefreshCycleForm').and.returnValue(form);
        });

        it("should update ChangedTablesOnly checkbox disabled=true", function () {
            var checkbox = $('<input type="checkbox" name="IsDelta" checked="checked" />');
            refreshCycle.DeltaChange(checkbox);

            var chkDisabled = form.find('input[name="ChangedTablesOnly"]').prop('disabled');
            expect(true).toEqual(chkDisabled);
        });

        it("should update ChangedTablesOnly checkbox disabled=false", function () {
            var checkbox = $('<input type="checkbox" name="IsDelta" />');
            refreshCycle.DeltaChange(checkbox);

            var chkDisabled = form.find('input[name="ChangedTablesOnly"]').prop('disabled');
            expect(false).toEqual(chkDisabled);
        });

    });

    describe(".ChangedTablesOnlyChange", function () {

        var form;

        beforeEach(function () {

            form = $('<form />', { html: '<input type="checkbox" name="IsDelta" />' });

            spyOn(refreshCycle, 'GetRefreshCycleForm').and.returnValue(form);
        });

        it("should update IsDelta checkbox disabled=true", function () {
            var checkbox = $('<input type="checkbox" name="ChangedTablesOnly" checked="checked" />');
            refreshCycle.ChangedTablesOnlyChange(checkbox);

            var chkDisabled = form.find('input[name="IsDelta"]').prop('disabled');
            expect(true).toEqual(chkDisabled);
        });

        it("should update IsDelta checkbox disabled=false", function () {
            var checkbox = $('<input type="checkbox" name="ChangedTablesOnly" />');
            refreshCycle.ChangedTablesOnlyChange(checkbox);

            var chkDisabled = form.find('input[name="IsDelta"]').prop('disabled');
            expect(false).toEqual(chkDisabled);
        });

    });

});
