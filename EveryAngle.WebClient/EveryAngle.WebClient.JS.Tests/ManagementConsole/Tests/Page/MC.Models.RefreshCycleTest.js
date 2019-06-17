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

        // arrange
        var tests = [{
            name: 'should call unixtimeToTimePicker 4 times when it has the valid time value',
            expectedResult: 4,
            parameters: {
                RefreshCycleTrigger: {
                    "start_time": 0,
                    "restart_delay": 1,
                    "end_time": 2
                },
                max_run_time: 3
            }
        }, {
            name: 'should not call unixtimeToTimePicker when it has the invalid time value',
            expectedResult: 0,
            parameters: {
                RefreshCycleTrigger: {
                    "start_time": null,
                    "restart_delay": undefined,
                    "end_time": undefined
                },
                max_run_time: null
            }
        }];

        $.each(tests, function (index, test) {
            it(test.name, function () {
                // act
                refreshCycle.BindingDataToForm(test.parameters);

                // assert
                expect(MC.util.unixtimeToTimePicker).toHaveBeenCalledTimes(test.expectedResult);
            });
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

    describe(".SetViewExtractionEvent", function () {

        beforeEach(function () {
            $('<div id="btnViewExtraction" class="disabled" />').appendTo('body');
        });

        afterEach(function () {
            $('#btnViewExtraction').remove();
        });

        it("should set event to view extractor button if there is extractor uri", function () {
            var data = {
                ExtractorUri: 'uri/1'
            };
            refreshCycle.SetViewExtractionEvent(data);

            expect($('#btnViewExtraction').hasClass('disabled')).toEqual(false);
        });

        it("should not set event to view extractor button if there is no extractor uri", function () {
            var data = {};
            refreshCycle.SetViewExtractionEvent(data);

            expect($('#btnViewExtraction').hasClass('disabled')).toEqual(true);
        });
    });
});
