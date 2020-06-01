/// <chutzpah_reference path="/../../Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/followupPageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayAggregationFormatHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/userfriendlynamehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldSourceHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/FieldChooserHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/HelpTextHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepAggregationSortableHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepAggregationHandler.js" />

describe("QueryStepAggregationHandler", function () {
    var handler;
    beforeEach(function () {
        handler = new QueryDefinitionHandler();
    });

    describe(".IsAggregation", function () {
        it("should be a aggregation step", function () {
            var result = handler.IsAggregation({ step_type: 'aggregation' });
            expect(result).toEqual(true);
        });
        it("should not be a aggregation step", function () {
            var result = handler.IsAggregation({ step_type: 'filter' });
            expect(result).toEqual(false);
        });
    });
    describe(".GetAggregation", function () {
        it("should get a aggregation step", function () {
            handler.Data([
                { step_type: 'aggregation' }
            ]);
            var result = handler.GetAggregation();
            expect(result).not.toBeNull();
            expect(result.step_type).toEqual('aggregation');
        });

        it("should not get a aggregation step", function () {
            handler.Data([
                { step_type: 'filter' }
            ]);
            var result = handler.GetAggregation();
            expect(result).toBeNull();
        });
    });
    describe(".RemoveAggregation", function () {
        it("should remove a aggregation step", function () {
            handler.Data([
                { step_type: 'followup' },
                { step_type: 'filter' },
                { step_type: 'aggregation' }
            ]);
            handler.RemoveAggregation();
            expect(handler.Data().length).toEqual(2);
            expect(handler.Data()[0].step_type).toEqual('followup');
            expect(handler.Data()[1].step_type).toEqual('filter');
        });
    });
    describe(".SetAggregation", function () {
        it("should set a aggregation step", function () {
            handler.Data([
                { step_type: 'filter' },
                { step_type: 'aggregation' }
            ]);
            handler.SetAggregation({ step_type: 'aggregation', new_aggregation: true });
            expect(handler.Data().length).toEqual(2);
            expect(handler.Data()[0].step_type).toEqual('filter');
            expect(handler.Data()[1].step_type).toEqual('aggregation');
            expect(handler.Data()[1].new_aggregation).toEqual(true);
        });
    });

    describe(".CanUseAggregation", function () {
        it("can use aggregation", function () {
            spyOn(handler, 'GetAggregation').and.returnValue({});
            var result = handler.CanUseAggregation();
            expect(result).toEqual(true);
        });
        it("cannot use aggregation", function () {
            spyOn(handler, 'GetAggregation').and.returnValue(null);
            var result = handler.CanUseAggregation();
            expect(result).toEqual(false);
        });
    });

    describe(".InitialAggregation", function () {
        it("should initial aggregation", function () {
            spyOn(handler, 'GetAggregation').and.returnValue({
                grouping_fields: [{}],
                aggregation_fields: [{}, {}]
            });
            spyOn(handler, 'GetAggregationOptions').and.returnValue('my-options');
            spyOn(handler, 'CreateAggregationField').and.returnValues(
                { is_count_field: function () { return false; } },
                { is_count_field: function () { return false; } },
                { is_count_field: function () { return true; } }
            );
            spyOn(handler, 'CreateAdhocCountField').and.returnValue({});
            spyOn(handler, 'GetAggregationCountFieldIndex').and.returnValue(10);
            handler.InitialAggregation();

            // assert
            expect(handler.Aggregation().length).toEqual(3);
            expect(handler.AggregationOptions()).toEqual('my-options');
        });
    });

    describe(".ApplyAggregationHandler", function () {
        it("should apply aggregation handler", function () {
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            spyOn(handler, 'InitialAggregationUI');
            spyOn(handler, 'CreateBlockUI');
            handler.ApplyAggregationHandler($('<div id="my-container"/>'));

            // assert
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
            expect(handler.InitialAggregationUI).toHaveBeenCalled();
            expect(handler.CreateBlockUI).toHaveBeenCalled();
            expect(handler.AggregationContainer.length).toEqual(1);
        });
    });

    describe(".RefreshAggregationUI", function () {
        it("should apply aggregation handler", function () {
            spyOn(handler, 'InitialAggregationUI');
            handler.RefreshAggregationUI();

            // assert
            expect(handler.InitialAggregationUI).toHaveBeenCalled();
        });
    });

    describe(".CreateAggregationField", function () {
        it("should create aggregation field", function () {
            spyOn(handler, 'GetAggregationField').and.returnValue({
                field_details: '{}'
            });
            var result = handler.CreateAggregationField({});

            // assert
            expect(result instanceof AggregationFieldViewModel).toEqual(true);
            expect(result.area()).toEqual('row');
            expect(result.multi_lang_alias().length).toEqual(0);
            expect(result.is_selected()).toEqual(true);
        });
    });

    describe(".CreateAdhocAggregationField", function () {
        it("should create adhoc aggregation field", function () {
            var result = handler.CreateAdhocAggregationField({}, 'data', false);

            // assert
            expect(result instanceof AggregationFieldViewModel).toEqual(true);
            expect(result.area()).toEqual('data');
            expect(result.is_selected()).toEqual(false);
        });
    });

    describe(".CreateAdhocCountField", function () {
        it("should create a count field", function () {
            spyOn(handler, 'GetAggregationField').and.returnValue({});
            var result = handler.CreateAdhocCountField({});

            // assert
            expect(result instanceof AggregationFieldViewModel).toEqual(true);
            expect(result.area()).toEqual('data');
            expect(result.is_selected()).toEqual(false);
        });
    });

    describe(".CreateAggregationFieldFromField", function () {
        it("should create from field", function () {
            var field = { id: 'field' };
            spyOn(handler, 'GetAggregationDefaultOperator').and.returnValue('operator');
            var result = handler.CreateAggregationFieldFromField(field, 'data');

            // assert
            expect(result instanceof AggregationFieldViewModel).toEqual(true);
            expect(result.field()).toEqual('operator_field');
            expect(result.area()).toEqual('data');
            expect(result.is_selected()).toEqual(true);
        });
    });

    describe(".GetAggregationDefaultOperator", function () {
        var tests = [
            {
                area: 'data',
                fieldtype: 'time',
                expected: 'average'
            },
            {
                area: 'data',
                fieldtype: 'any',
                expected: 'sum'
            },
            {
                area: 'row or column',
                fieldtype: 'time',
                expected: 'hour'
            },
            {
                area: 'row or column',
                fieldtype: 'period',
                expected: 'week'
            },
            {
                area: 'row or column',
                fieldtype: 'timespan',
                expected: 'week'
            },
            {
                area: 'row or column',
                fieldtype: 'date',
                expected: 'quarter'
            },
            {
                area: 'row or column',
                fieldtype: 'datetime',
                expected: 'quarter'
            },
            {
                area: 'row or column',
                fieldtype: 'currency',
                expected: 'power10_3'
            },
            {
                area: 'row or column',
                fieldtype: 'number',
                expected: 'power10_3'
            },
            {
                area: 'row or column',
                fieldtype: 'int',
                expected: 'power10_3'
            },
            {
                area: 'row or column',
                fieldtype: 'double',
                expected: 'power10_3'
            },
            {
                area: 'row or column',
                fieldtype: 'percentage',
                expected: 'power10_1'
            },
            {
                area: 'row or column',
                fieldtype: 'any',
                expected: 'individual'
            }
        ];
        $.each(tests, function (index, test) {
            it("should get a default operator for " + test.fieldtype + " field in " + test.area + " area", function () {
                var result = handler.GetAggregationDefaultOperator(test.fieldtype, test.area);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".ToggleCountField", function () {
        it("should toggle a count field", function () {
            spyOn(handler, 'CanChangeCountFieldState').and.returnValue(true);
            var aggregation = {
                is_count_field: ko.observable(true),
                is_selected: ko.observable(false)
            };
            handler.ToggleCountField(aggregation);

            // assert
            expect(aggregation.is_selected()).toEqual(true);
        });
        it("should not toggle if not a count field", function () {
            spyOn(handler, 'CanChangeCountFieldState').and.returnValue(false);
            var aggregation = {
                is_count_field: ko.observable(false),
                is_selected: ko.observable(false)
            };
            handler.ToggleCountField(aggregation);

            // assert
            expect(aggregation.is_selected()).toEqual(false);
        });
    });

    describe(".CanChangeAggregationOptions", function () {
        it("can change aggregation options", function () {
            handler.Authorizations.CanChangeAggregation(true);
            var result = handler.CanChangeAggregationOptions();

            // assert
            expect(result).toEqual(true);
        });
        it("cannot change aggregation options", function () {
            handler.Authorizations.CanChangeAggregation(false);
            var result = handler.CanChangeAggregationOptions();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".GetAggregationOptions", function () {
        it("should get empty option by default", function () {
            var result = handler.GetAggregationOptions();

            // assert
            expect(result).toEqual({});
        });
    });

    describe(".GetAggregationCountFieldIndex", function () {
        it("should get a count index", function () {
            var result = handler.GetAggregationCountFieldIndex();

            // assert
            expect(result).toEqual(0);
        });
    });

    describe(".GetAggregationField", function () {
        it("should get empty field by default", function () {
            var result = handler.GetAggregationField();

            // assert
            expect(result).toEqual({});
        });
    });

    describe(".GetAggregationFieldById", function () {
        it("should not get aggregation field by Id", function () {
            var result = handler.GetAggregationFieldById('my-id');

            // assert
            expect(result).toEqual(null);
        });
    });

    describe(".GetAggregationName", function () {
        it("should get name as count field", function () {
            spyOn(handler, 'GetAggregationCountName').and.returnValue('count');
            spyOn(handler, 'GetAggregationAliasName').and.returnValue('alias');
            spyOn(handler, 'GetAggregationDefaultName').and.returnValue('default');
            var result = handler.GetAggregationName();

            // assert
            expect(result).toEqual('count');
        });
        it("should get name as alias", function () {
            spyOn(handler, 'GetAggregationCountName').and.returnValue('');
            spyOn(handler, 'GetAggregationAliasName').and.returnValue('alias');
            spyOn(handler, 'GetAggregationDefaultName').and.returnValue('default');
            var result = handler.GetAggregationName();

            // assert
            expect(result).toEqual('alias');
        });
        it("should get name as a default", function () {
            spyOn(handler, 'GetAggregationCountName').and.returnValue('');
            spyOn(handler, 'GetAggregationAliasName').and.returnValue('');
            spyOn(handler, 'GetAggregationDefaultName').and.returnValue('default');
            var result = handler.GetAggregationName();

            // assert
            expect(result).toEqual('default');
        });
    });

    describe(".GetAggregationHint", function () {
        it("should not get hint if no alias", function () {
            spyOn(handler, 'GetAggregationCountName').and.returnValue('');
            spyOn(handler, 'GetAggregationAliasName').and.returnValue('');
            spyOn(handler, 'GetAggregationDefaultName').and.returnValue('default');
            var result = handler.GetAggregationHint();

            // assert
            expect(result).toEqual('');
        });
        it("should not get hint if count field", function () {
            spyOn(handler, 'GetAggregationCountName').and.returnValue('count');
            spyOn(handler, 'GetAggregationAliasName').and.returnValue('alias');
            spyOn(handler, 'GetAggregationDefaultName').and.returnValue('default');
            var result = handler.GetAggregationHint();

            // assert
            expect(result).toEqual('');
        });
        it("should get hint", function () {
            spyOn(handler, 'GetAggregationCountName').and.returnValue('');
            spyOn(handler, 'GetAggregationAliasName').and.returnValue('alias');
            spyOn(handler, 'GetAggregationDefaultName').and.returnValue('hint');
            var result = handler.GetAggregationHint();

            // assert
            expect(result).toEqual(' hint');
        });
    });

    describe(".GetAggregationCountName", function () {
        it("should get a count field name", function () {
            var result = handler.GetAggregationCountName({
                is_count_field: ko.observable(true)
            });

            // assert
            expect(result).toEqual('Count');
        });
        it("should not get a count field name", function () {
            var result = handler.GetAggregationCountName({
                is_count_field: ko.observable(false)
            });

            // assert
            expect(result).toEqual('');
        });
    });

    describe(".GetAggregationAliasName", function () {
        it("should get an alias name", function () {
            var aggregation = {
                multi_lang_alias: ko.observableArray([{ text: 'my-name', lang: 'en' }])
            };
            var result = handler.GetAggregationAliasName(aggregation);

            // assert
            expect(result).toEqual('my-name');
        });
    });

    describe(".GetAggregationDefaultName", function () {
        it("should get a default name (source name != field name)", function () {
            spyOn(handler, 'GetAggregationBucketName').and.returnValue('my-operator');
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue({ source: 'source', short_name: 'my-field' });
            spyOn(modelFieldSourceHandler, 'GetFieldSourceByUri').and.returnValue({ short_name: 'my-source' });
            var result = handler.GetAggregationDefaultName({ field: 'my-id' });

            // assert
            expect(result).toEqual('my-source - my-field my-operator');
        });
        it("should get a default name (source name == field name)", function () {
            spyOn(handler, 'GetAggregationBucketName').and.returnValue('my-operator');
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue({ source: 'source', short_name: 'my-xxx' });
            spyOn(modelFieldSourceHandler, 'GetFieldSourceByUri').and.returnValue({ short_name: 'my-xxx' });
            var result = handler.GetAggregationDefaultName({ field: 'my-id' });

            // assert
            expect(result).toEqual('my-xxx my-operator');
        });
        it("should get a default name (no field info.)", function () {
            spyOn(handler, 'GetAggregationBucketName').and.returnValue('my-operator');
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue(null);
            spyOn(modelFieldSourceHandler, 'GetFieldSourceByUri').and.returnValue({ short_name: 'my-source' });
            var result = handler.GetAggregationDefaultName({ field: 'my-id' });

            // assert
            expect(result).toEqual('my-id my-operator');
        });
    });

    describe(".GetAggregationBucketName", function () {
        var tests = [
            { operator: 'left1', expected: ' [First character]' },
            { operator: 'left2', expected: ' [First 2 characters]' },
            { operator: 'left3', expected: ' [First 3 characters]' },
            { operator: 'left4', expected: ' [First 4 characters]' },
            { operator: 'right1', expected: ' [Last character]' },
            { operator: 'right2', expected: ' [Last 2 characters]' },
            { operator: 'right3', expected: ' [Last 3 characters]' },
            { operator: 'right4', expected: ' [Last 4 characters]' },
            { operator: 'power10_min1', expected: ' [0.1]' },
            { operator: 'power10_min2', expected: ' [0.01]' },
            { operator: 'power10_min3', expected: ' [0.001]' },
            { operator: 'power10_min4', expected: ' [0.0001]' },
            { operator: 'power10_1', expected: ' [10]' },
            { operator: 'power10_2', expected: ' [100]' },
            { operator: 'power10_3', expected: ' [1,000]' },
            { operator: 'power10_4', expected: ' [10,000]' },
            { operator: 'none', expected: '' },
            { operator: 'individual', expected: '' },
            { operator: 'hour', expected: ' [Per hour]' },
            { operator: 'day', expected: ' [Per day]' },
            { operator: 'week', expected: ' [Per week]' },
            { operator: 'month', expected: ' [Per month]' },
            { operator: 'quarter', expected: ' [Per quarter]' },
            { operator: 'trimester', expected: ' [Per trimester]' },
            { operator: 'semester', expected: ' [Per semester]' },
            { operator: 'year', expected: ' [Per year]' },
            { operator: 'max', expected: ' [Max]' },
            { operator: 'min', expected: ' [Min]' },
            { operator: 'sum', expected: ' [Sum]' },
            { operator: 'average', expected: ' [Average]' },
            { operator: 'average_valid', expected: ' [Average valid]' },
            { operator: 'count_valid', expected: ' [Count valid]' },
            { operator: 'random', expected: '' }
        ];
        $.each(tests, function (index, test) {
            it("should get operator name (" + test.operator + " -> " + test.expected + ")", function () {
                var result = handler.GetAggregationBucketName(test.operator);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".GetAggregationFieldsByArea", function () {
        it("should get fields by area", function () {
            handler.Aggregation([
                { area: ko.observable('column') },
                { area: ko.observable('data') },
                { area: ko.observable('data') }
            ]);
            var result1 = handler.GetAggregationFieldsByArea('row');
            var result2 = handler.GetAggregationFieldsByArea('column');
            var result3 = handler.GetAggregationFieldsByArea('data');

            // assert
            expect(result1.length).toEqual(0);
            expect(result2.length).toEqual(1);
            expect(result3.length).toEqual(2);
        });
    });

    describe(".GetAggregationRowFields", function () {
        it("should get row fields", function () {
            handler.Aggregation([
                { area: ko.observable('row') },
                { area: ko.observable('column') },
                { area: ko.observable('column') },
                { area: ko.observable('data') },
                { area: ko.observable('data') },
                { area: ko.observable('data') }
            ]);
            var result = handler.GetAggregationRowFields();

            // assert
            expect(result.length).toEqual(1);
        });
    });

    describe(".GetAggregationColumnFields", function () {
        it("should get column fields", function () {
            handler.Aggregation([
                { area: ko.observable('row') },
                { area: ko.observable('column') },
                { area: ko.observable('column') },
                { area: ko.observable('data') },
                { area: ko.observable('data') },
                { area: ko.observable('data') }
            ]);
            var result = handler.GetAggregationColumnFields();

            // assert
            expect(result.length).toEqual(2);
        });
    });

    describe(".GetAggregationDataFields", function () {
        it("should get data fields", function () {
            handler.Aggregation([
                { area: ko.observable('row') },
                { area: ko.observable('column') },
                { area: ko.observable('column') },
                { area: ko.observable('data') },
                { area: ko.observable('data') },
                { area: ko.observable('data') }
            ]);
            var result = handler.GetAggregationDataFields();

            // assert
            expect(result.length).toEqual(3);
        });
    });

    describe(".GetAggregationDataType", function () {
        it("should get a new type", function () {
            var aggregation = { area: ko.observable('data'), operator: ko.observable('') };
            spyOn(dataTypeModel, 'GetCorrectDataType').and.returnValue('new-type');
            var result = handler.GetAggregationDataType(aggregation, 'my-type');

            // assert
            expect(result).toEqual('new-type');
        });
        it("should get an old type", function () {
            var aggregation = { area: ko.observable('column') };
            spyOn(dataTypeModel, 'GetCorrectDataType').and.returnValue('new-type');
            var result = handler.GetAggregationDataType(aggregation, 'my-type');

            // assert
            expect(result).toEqual('my-type');
        });
    });

    describe(".CanAddAggregationField", function () {
        it("can add aggregation field", function () {
            handler.Authorizations.CanChangeAggregation(true);
            var result = handler.CanAddAggregationField();

            // assert
            expect(result).toEqual(true);
        });
        it("cannot add aggregation field", function () {
            handler.Authorizations.CanChangeAggregation(false);
            var result = handler.CanAddAggregationField();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".ShowAddAggregationFieldPopup", function () {
        beforeEach(function () {
            createMockHandler(window, 'fieldsChooserHandler', {
                ShowPopup: $.noop,
                USETYPE: { ADDAGGREGATION: 'aggregation' }
            });
        });
        afterEach(function () {
            restoreMockHandler('fieldsChooserHandler');
        });
        it("should show popup", function () {
            spyOn(handler, 'CanAddAggregationField').and.returnValue(true);
            spyOn(handler, 'InitialAddAggregationOptions');
            spyOn(fieldsChooserHandler, 'ShowPopup');
            handler.ShowAddAggregationFieldPopup();

            // assert
            expect(handler.InitialAddAggregationOptions).toHaveBeenCalled();
            expect(fieldsChooserHandler.ShowPopup).toHaveBeenCalled();
        });
        it("should not show popup", function () {
            spyOn(handler, 'CanAddAggregationField').and.returnValue(false);
            spyOn(handler, 'InitialAddAggregationOptions');
            spyOn(fieldsChooserHandler, 'ShowPopup');
            handler.ShowAddAggregationFieldPopup();

            // assert
            expect(handler.InitialAddAggregationOptions).not.toHaveBeenCalled();
            expect(fieldsChooserHandler.ShowPopup).not.toHaveBeenCalled();
        });
    });

    describe(".InitialAddAggregationOptions", function () {
        beforeEach(function () {
            createMockHandler(window, 'fieldsChooserHandler', {
                ModelUri: null,
                AngleClasses: null,
                AngleSteps: null,
                DisplaySteps: null
            });
        });
        afterEach(function () {
            restoreMockHandler('fieldsChooserHandler');
        });
        it("should initial", function () {
            handler.ModelUri = '/models/1';
            handler.Parent(handler);
            spyOn(handler, 'GetBaseClasses').and.returnValue('base-class');
            spyOn(handler, 'GetData').and.returnValue('data');
            handler.InitialAddAggregationOptions();

            // assert
            expect(fieldsChooserHandler.ModelUri).toEqual('/models/1');
            expect(fieldsChooserHandler.AngleClasses).toEqual('base-class');
            expect(fieldsChooserHandler.AngleSteps).toEqual('data');
            expect(fieldsChooserHandler.DisplaySteps).toEqual('data');
        });
    });

    describe(".SubmitAggregationFields", function () {
        beforeEach(function () {
            spyOn(modelFieldsHandler, 'SetFields');
            spyOn(modelFieldsHandler, 'LoadFieldsMetadata').and.returnValue($.when());
            spyOn(handler, 'GetAggregationFieldLimit').and.returnValue(2);
            spyOn(handler, 'ShowAggregationProgressBar');
            spyOn(handler, 'AddAggregationFields');
            spyOn(handler, 'HideAggregationProgressBar');
        });
        it("should not submit fields", function () {
            var area = 'any';
            var fields = [];
            handler.SubmitAggregationFields(area, fields);

            // assert
            expect(handler.ShowAggregationProgressBar).not.toHaveBeenCalled();
            expect(handler.AddAggregationFields).not.toHaveBeenCalled();
            expect(handler.HideAggregationProgressBar).not.toHaveBeenCalled();
        });
        it("should submit 2 fields if it is not data area", function () {
            var area = 'any';
            var fields = [{}, {}, {}];
            handler.SubmitAggregationFields(area, fields);

            // assert
            expect(fields.length).toEqual(2);
            expect(handler.ShowAggregationProgressBar).toHaveBeenCalled();
            expect(handler.AddAggregationFields).toHaveBeenCalled();
            expect(handler.HideAggregationProgressBar).toHaveBeenCalled();
        });
        it("should submit 1 field if it is data area", function () {
            var area = 'data';
            var fields = [{}, {}, {}];
            handler.SubmitAggregationFields(area, fields);

            // assert
            expect(fields.length).toEqual(1);
            expect(handler.ShowAggregationProgressBar).toHaveBeenCalled();
            expect(handler.AddAggregationFields).toHaveBeenCalled();
            expect(handler.HideAggregationProgressBar).toHaveBeenCalled();
        });
    });

    describe(".AddAggregationFields", function () {
        beforeEach(function () {
            spyOn(handler, 'CleanAggregationFields');
            spyOn(handler, 'CreateAggregationFieldFromField').and.returnValue({});
            spyOn(handler, 'AddAggregationField');
            spyOn(handler, 'UpdateCountField');
            spyOn(handler, 'OpenAggregationAreaPanel');
        });
        it("should add fields to data area", function () {
            var area = 'data';
            var fields = [{}, {}];
            spyOn($.fn, 'hasClass').and.returnValue(true);
            handler.AddAggregationFields(area, fields);

            // assert
            expect(handler.CleanAggregationFields).toHaveBeenCalled();
            expect(handler.AddAggregationField).toHaveBeenCalledTimes(2);
            expect(handler.UpdateCountField).toHaveBeenCalled();
            expect(handler.OpenAggregationAreaPanel).toHaveBeenCalled();
        });
        it("should add fields to another area", function () {
            var area = 'any';
            var fields = [{}, {}];
            spyOn($.fn, 'hasClass').and.returnValue(false);
            handler.AddAggregationFields(area, fields);

            // assert
            expect(handler.CleanAggregationFields).toHaveBeenCalled();
            expect(handler.AddAggregationField).toHaveBeenCalledTimes(2);
            expect(handler.UpdateCountField).not.toHaveBeenCalled();
            expect(handler.OpenAggregationAreaPanel).toHaveBeenCalled();
        });
    });

    describe(".CleanAggregationFields", function () {
        it("should clean fields", function () {
            var area = 'data';
            var fields = [{}, {}];
            spyOn(handler, 'GetAggregationFieldsByArea').and.returnValue([{}, {}, {}]);
            spyOn(handler, 'GetAggregationFieldLimit').and.returnValue(3);
            spyOn(handler, 'UpdateCountField');
            handler.Aggregation([
                { is_count_field: ko.observable(false), area: ko.observable('row') },
                { is_count_field: ko.observable(false), area: ko.observable('data') },
                { is_count_field: ko.observable(true), area: ko.observable('data') },
                { is_count_field: ko.observable(false), area: ko.observable('data') }
            ]);
            handler.CleanAggregationFields(area, fields);

            // assert
            expect(handler.Aggregation().length).toEqual(2);
        });
    });

    describe(".UpdateCountField", function () {
        var dataFields;
        beforeEach(function () {
            dataFields = [
                { is_count_field: ko.observable(false), is_selected: ko.observable(true) },
                { is_count_field: ko.observable(true), is_selected: ko.observable(false) },
                { is_count_field: ko.observable(false), is_selected: ko.observable(true) }
            ];
            spyOn(handler, 'GetAggregationDataFields').and.returnValue(dataFields);
            handler.AggregationOptions({ count_index: 0 });
        });
        it("should not update state", function () {
            dataFields[1].is_count_field(false);
            handler.UpdateCountField();

            // assert
            expect(handler.AggregationOptions().count_index).toEqual(0);
            expect(dataFields[1].is_selected()).toEqual(false);
        });
        it("should update state (limit=3, can_change=false)", function () {
            spyOn(handler, 'GetAggregationFieldLimit').and.returnValue(3);
            spyOn(handler, 'CanChangeCountFieldState').and.returnValue(false);
            handler.UpdateCountField();

            // assert
            expect(handler.AggregationOptions().count_index).toEqual(1);
            expect(dataFields[1].is_selected()).toEqual(true);
        });
        it("should update state (limit=2, can_change=false)", function () {
            spyOn(handler, 'GetAggregationFieldLimit').and.returnValue(2);
            spyOn(handler, 'CanChangeCountFieldState').and.returnValue(false);
            handler.UpdateCountField();

            // assert
            expect(handler.AggregationOptions().count_index).toEqual(1);
            expect(dataFields[1].is_selected()).toEqual(true);
        });
        it("should update state (limit=2, can_change=true)", function () {
            spyOn(handler, 'GetAggregationFieldLimit').and.returnValue(2);
            spyOn(handler, 'CanChangeCountFieldState').and.returnValue(true);
            handler.UpdateCountField();

            // assert
            expect(handler.AggregationOptions().count_index).toEqual(1);
            expect(dataFields[1].is_selected()).toEqual(false);
        });
        it("should update state (limit=Infinity, can_change=true)", function () {
            spyOn(handler, 'GetAggregationFieldLimit').and.returnValue(Infinity);
            spyOn(handler, 'CanChangeCountFieldState').and.returnValue(true);
            handler.UpdateCountField();

            // assert
            expect(handler.AggregationOptions().count_index).toEqual(1);
            expect(dataFields[1].is_selected()).toEqual(false);
        });
    });

    describe(".AddAggregationField", function () {
        it("should add aggregation to index=1)", function () {
            var aggregation = 'my-aggregation';
            spyOn(handler, 'GetAddingAggregationFieldIndex').and.returnValue(1);
            handler.Aggregation([{}, {}, {}]);
            handler.AddAggregationField(aggregation, 'any');

            // assert
            expect(handler.Aggregation().length).toEqual(4);
            expect(handler.Aggregation()[1]).toEqual('my-aggregation');
        });
    });

    describe(".GetAddingAggregationFieldIndex", function () {
        it("should get index", function () {
            spyOn(handler, 'GetAggregationRowFields').and.returnValue([{}]);
            spyOn(handler, 'GetAggregationColumnFields').and.returnValue([{}]);
            spyOn(handler, 'GetAggregationDataFields').and.returnValue([{}, {}]);
            var result1 = handler.GetAddingAggregationFieldIndex('row');
            var result2 = handler.GetAddingAggregationFieldIndex('column');
            var result3 = handler.GetAddingAggregationFieldIndex('data');

            // assert
            expect(result1).toEqual(1);
            expect(result2).toEqual(2);
            expect(result3).toEqual(4);
        });
    });

    describe(".CanRemoveAggregationField", function () {
        it("can remove aggregation field", function () {
            var field = { is_count_field: ko.observable(false) };
            handler.Authorizations.CanChangeAggregation(true);
            var result = handler.CanRemoveAggregationField(field);

            // assert
            expect(result).toEqual(true);
        });
        it("cannot remove aggregation field (no authorization)", function () {
            var field = { is_count_field: ko.observable(false) };
            handler.Authorizations.CanChangeAggregation(false);
            var result = handler.CanRemoveAggregationField(field);

            // assert
            expect(result).toEqual(false);
        });
        it("cannot remove aggregation field (count field)", function () {
            var field = { is_count_field: ko.observable(true) };
            handler.Authorizations.CanChangeAggregation(true);
            var result = handler.CanRemoveAggregationField(field);

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".RemoveAggregationField", function () {
        beforeEach(function () {
            spyOn(handler, 'UpdateCountField');
            handler.Aggregation([
                { id: '1', area: ko.observable('row') },
                { id: '2', area: ko.observable('column') },
                { id: '3', area: ko.observable('data') }
            ]);
        });
        it("should remove row field", function () {
            handler.RemoveAggregationField(handler.Aggregation()[0]);

            // assert
            expect(handler.Aggregation().length).toEqual(2);
            expect(handler.UpdateCountField).toHaveBeenCalledTimes(0);
        });
        it("should remove column field", function () {
            handler.RemoveAggregationField(handler.Aggregation()[1]);

            // assert
            expect(handler.Aggregation().length).toEqual(2);
            expect(handler.UpdateCountField).toHaveBeenCalledTimes(0);
        });
        it("should remove data field", function () {
            handler.RemoveAggregationField(handler.Aggregation()[2]);

            // assert
            expect(handler.Aggregation().length).toEqual(2);
            expect(handler.UpdateCountField).toHaveBeenCalledTimes(1);
        });
    });

    describe(".CanMoveAggregationField", function () {
        it("can move aggregation field", function () {
            handler.Authorizations.CanChangeAggregation(true);
            var result = handler.CanMoveAggregationField();

            // assert
            expect(result).toEqual(true);
        });
        it("cannot move aggregation field (no authorization)", function () {
            handler.Authorizations.CanChangeAggregation(false);
            var result = handler.CanMoveAggregationField();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".CanSortAggregationField", function () {
        it("cannot sort aggregation field by default", function () {
            var result = handler.CanSortAggregationField();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".CanAddFilterFromAggregation", function () {
        it("can add a filter from aggregation field", function () {
            spyOn(handler, 'CanAdd').and.returnValue(true);
            var field = { valid: ko.observable(true), is_count_field: ko.observable(false) };
            var result = handler.CanAddFilterFromAggregation(field);

            // assert
            expect(result).toEqual(true);
        });
        it("cannot add a filter from aggregation field (no authorization)", function () {
            spyOn(handler, 'CanAdd').and.returnValue(false);
            var field = { valid: ko.observable(true), is_count_field: ko.observable(false) };
            var result = handler.CanAddFilterFromAggregation(field);

            // assert
            expect(result).toEqual(false);
        });
        it("cannot add a filter from aggregation field (invalid field)", function () {
            spyOn(handler, 'CanAdd').and.returnValue(true);
            var field = { valid: ko.observable(false), is_count_field: ko.observable(false) };
            var result = handler.CanAddFilterFromAggregation(field);

            // assert
            expect(result).toEqual(false);
        });
        it("cannot add a filter from aggregation field (count field)", function () {
            spyOn(handler, 'CanAdd').and.returnValue(true);
            var field = { valid: ko.observable(true), is_count_field: ko.observable(true) };
            var result = handler.CanAddFilterFromAggregation(field);

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".AddFilterFromAggregation", function () {
        beforeEach(function () {
            spyOn(modelFieldsHandler, 'GetFieldById');
            spyOn(popup, 'Confirm');
            spyOn(handler, 'AddFilter');
        });
        it("should not add a filter", function () {
            spyOn(handler, 'CanAddFilterFromAggregation').and.returnValue(false);
            spyOn(handler, 'HasAggregationChanged').and.returnValue(true);
            handler.AddFilterFromAggregation({});

            // assert
            expect(popup.Confirm).not.toHaveBeenCalled();
            expect(handler.AddFilter).not.toHaveBeenCalled();
        });
        it("should show a confirmation popup", function () {
            spyOn(handler, 'CanAddFilterFromAggregation').and.returnValue(true);
            spyOn(handler, 'HasAggregationChanged').and.returnValue(true);
            handler.AddFilterFromAggregation({});

            // assert
            expect(popup.Confirm).toHaveBeenCalled();
            expect(handler.AddFilter).not.toHaveBeenCalled();
        });
        it("should add a filter", function () {
            spyOn(handler, 'CanAddFilterFromAggregation').and.returnValue(true);
            spyOn(handler, 'HasAggregationChanged').and.returnValue(false);
            handler.AddFilterFromAggregation({});

            // assert
            expect(popup.Confirm).not.toHaveBeenCalled();
            expect(handler.AddFilter).toHaveBeenCalled();
        });
    });

    describe(".AddFilterAndDiscardAggregation", function () {
        it("should add a filter and discard aggregation", function () {
            spyOn(handler, 'CancelAggregation');
            spyOn(handler, 'AddFilter');
            handler.AddFilterAndDiscardAggregation();

            // assert
            expect(handler.CancelAggregation).toHaveBeenCalled();
            expect(handler.AddFilter).toHaveBeenCalled();
        });
    });

    describe(".CanEditAggregationFormat", function () {
        it("can edit a aggregation field format", function () {
            handler.Authorizations.CanChangeAggregation(true);
            var field = { valid: ko.observable(true), is_selected: ko.observable(true) };
            var result = handler.CanEditAggregationFormat(field);

            // assert
            expect(result).toEqual(true);
        });
        it("cannot edit a aggregation field format (no authorization)", function () {
            handler.Authorizations.CanChangeAggregation(false);
            var field = { valid: ko.observable(true), is_selected: ko.observable(true) };
            var result = handler.CanEditAggregationFormat(field);

            // assert
            expect(result).toEqual(false);
        });
        it("cannot edit a aggregation field format (invalid field)", function () {
            handler.Authorizations.CanChangeAggregation(true);
            var field = { valid: ko.observable(false), is_selected: ko.observable(true) };
            var result = handler.CanEditAggregationFormat(field);

            // assert
            expect(result).toEqual(false);
        });
        it("cannot edit a aggregation field format (not a selected field)", function () {
            handler.Authorizations.CanChangeAggregation(true);
            var field = { valid: ko.observable(true), is_selected: ko.observable(false) };
            var result = handler.CanEditAggregationFormat(field);

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".ShowEditAggregationFormatPopup", function () {
        var formatHandler, aggregation;
        beforeEach(function () {
            formatHandler = { ShowPopup: $.noop };
            aggregation = { source_field: 'source_field', field: ko.observable('field') };
            spyOn(handler, 'GetAggregationName').and.returnValue('name');
            spyOn(window, 'DisplayAggregationFormatHandler').and.returnValue(formatHandler);
            spyOn(formatHandler, 'ShowPopup');
        });
        it("should show a popup", function () {
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue({});
            spyOn(handler, 'CanEditAggregationFormat').and.returnValue(true);
            handler.ShowEditAggregationFormatPopup(aggregation);

            // assert
            expect(formatHandler.ShowPopup).toHaveBeenCalled();
        });
        it("should not show a popup (no field)", function () {
            aggregation.source_field = '';
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue(null);
            spyOn(handler, 'CanEditAggregationFormat').and.returnValue(true);
            handler.ShowEditAggregationFormatPopup(aggregation);

            // assert
            expect(formatHandler.ShowPopup).not.toHaveBeenCalled();
        });
        it("should not show a popup (no authorization)", function () {
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue({});
            spyOn(handler, 'CanEditAggregationFormat').and.returnValue(false);
            handler.ShowEditAggregationFormatPopup(aggregation);

            // assert
            expect(formatHandler.ShowPopup).not.toHaveBeenCalled();
        });
    });
    
    describe(".GetAggregationFieldFormatSettings", function () {
        it("should get a aggregation field format settings", function () {
            var aggregation = {
                source_field: 'count',
                field: ko.observable('count'),
                data_field: function () {
                    return {};
                }
            };
            spyOn(handler, 'GetAggregationDataType').and.returnValue('int');
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue(null);
            var result = handler.GetAggregationFieldFormatSettings(aggregation);

            // assert
            expect(result instanceof Formatter).toEqual(true);
            expect(result.type).toEqual('int');
        });
    });

    describe(".HasAggregationFieldInfo", function () {
        it("should have a aggregation field info", function () {
            var field = { is_count_field: ko.observable(false) };
            var result = handler.HasAggregationFieldInfo(field);

            // assert
            expect(result).toEqual(true);
        });
        it("should not have a aggregation field info", function () {
            var field = { is_count_field: ko.observable(true) };
            var result = handler.HasAggregationFieldInfo(field);

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".ShowAggregationInfoPopup", function () {
        it("should not have a aggregation field info", function () {
            spyOn(helpTextHandler, 'ShowHelpTextPopup');
            handler.ShowAggregationInfoPopup({});

            // assert
            expect(helpTextHandler.ShowHelpTextPopup).toHaveBeenCalled();
        });
    });

    describe(".CancelAggregation", function () {
        it("should cancel", function () {
            spyOn(handler, 'InitialAggregation');
            spyOn(handler, 'RefreshAggregationUI');
            handler.CancelAggregation();

            // assert
            expect(handler.InitialAggregation).toHaveBeenCalled();
            expect(handler.RefreshAggregationUI).toHaveBeenCalled();
        });
    });

    describe(".CanApplyAggregation", function () {
        it("can apply", function () {
            handler.Authorizations.CanChangeAggregation(true);
            var result = handler.CanApplyAggregation();

            // assert
            expect(result).toEqual(true);
        });
        it("cannot apply", function () {
            handler.Authorizations.CanChangeAggregation(false);
            var result = handler.CanApplyAggregation();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".HasAggregationChanged", function () {
        it("should be true", function () {
            spyOn(handler, 'AreEqual').and.returnValue(true);
            spyOn(handler, 'CheckAggregationBlockUI');
            var result = handler.HasAggregationChanged(true);

            // assert
            expect(result).toEqual(false);
            expect(handler.CheckAggregationBlockUI).toHaveBeenCalled();
        });
        it("should be false", function () {
            spyOn(handler, 'AreEqual').and.returnValue(false);
            spyOn(handler, 'CheckAggregationBlockUI');
            var result = handler.HasAggregationChanged(false);

            // assert
            expect(result).toEqual(true);
            expect(handler.CheckAggregationBlockUI).not.toHaveBeenCalled();
        });
    });

    describe(".CheckAggregationBlockUI", function () {
        beforeEach(function () {
            spyOn(handler, 'RefreshAggregationUI');
            spyOn(handler, 'UpdateBlockUI');
        });
        it("should refresh UI and update overlay", function () {
            handler.CheckAggregationBlockUI(true, $());

            // assert
            expect(handler.RefreshAggregationUI).toHaveBeenCalled();
            expect(handler.UpdateBlockUI).toHaveBeenCalled();
        });
        it("should only update overlay", function () {
            handler.CheckAggregationBlockUI(false, $());

            // assert
            expect(handler.RefreshAggregationUI).not.toHaveBeenCalled();
            expect(handler.UpdateBlockUI).toHaveBeenCalled();
        });
    });

    describe(".ApplyAggregation", function () {
        beforeEach(function () {
            spyOn(handler, 'EnsureAggregationOptions');
            spyOn(handler, 'SetAggregationOptions');
            spyOn(handler, 'SetAggregationFields');
            spyOn(handler, 'SetAggregation');
            spyOn(handler, 'Execute');
        });
        it("should apply", function () {
            spyOn(handler, 'HasAggregationChanged').and.returnValue(true);
            spyOn(handler, 'ValidateAggregation').and.returnValue(true);
            handler.ApplyAggregation();

            // assert
            expect(handler.EnsureAggregationOptions).toHaveBeenCalled();
            expect(handler.SetAggregationOptions).toHaveBeenCalled();
            expect(handler.SetAggregationFields).toHaveBeenCalled();
            expect(handler.SetAggregation).toHaveBeenCalled();
            expect(handler.Execute).toHaveBeenCalled();
        });
        it("should not apply", function () {
            spyOn(handler, 'HasAggregationChanged').and.returnValue(false);
            spyOn(handler, 'ValidateAggregation').and.returnValue(false);
            handler.ApplyAggregation();

            // assert
            expect(handler.EnsureAggregationOptions).not.toHaveBeenCalled();
            expect(handler.SetAggregationOptions).not.toHaveBeenCalled();
            expect(handler.SetAggregationFields).not.toHaveBeenCalled();
            expect(handler.SetAggregation).not.toHaveBeenCalled();
            expect(handler.Execute).not.toHaveBeenCalled();
        });
    });

    describe(".AggregationToQueryStep", function () {
        it("should get a query step", function () {
            handler.Aggregation([
                {
                    is_selected: ko.observable(false),
                    data: ko.observable({})
                },
                {
                    is_selected: ko.observable(true),
                    data: ko.observable({}),
                    area: ko.observable('row'),
                    valid: ko.observable(true)
                },
                {
                    is_selected: ko.observable(true),
                    data: ko.observable({}),
                    area: ko.observable('column'),
                    valid: ko.observable(true)
                },
                {
                    is_selected: ko.observable(true),
                    data: ko.observable({}),
                    area: ko.observable('data'),
                    valid: ko.observable(true)
                }
            ]);
            var result = handler.AggregationToQueryStep();

            // assert
            expect(result.step_type).toEqual('aggregation');
            expect(result.grouping_fields.length).toEqual(2);
            expect(result.aggregation_fields.length).toEqual(1);
        });
    });

    describe(".AggregationToFields", function () {
        it("should get fields", function () {
            handler.Aggregation([
                { is_selected: ko.observable(false), data_field: ko.observable('field1') },
                { is_selected: ko.observable(true), data_field: ko.observable('field2') },
                { is_selected: ko.observable(true), data_field: ko.observable('field3') }
            ]);
            var result = handler.AggregationToFields();

            // assert
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual('field2');
            expect(result[1]).toEqual('field3');
        });
    });

    describe(".HasErrorAggregationField", function () {
        it("should have an error field", function () {
            handler.Aggregation([
                { valid: false },
                { valid: true }
            ]);
            var result = handler.HasErrorAggregationField();

            // assert
            expect(result).toEqual(true);
        });
        it("should not have an error field", function () {
            handler.Aggregation([
                { valid: true },
                { valid: true }
            ]);
            var result = handler.HasErrorAggregationField();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".HasDuplicatedAggregationDataField", function () {
        it("should have a duplicate field", function () {
            spyOn(handler, 'GetAggregationDataFields').and.returnValue([
                { field: 'field1' },
                { field: 'field2' },
                { field: 'field1' }
            ]);
            var result = handler.HasDuplicatedAggregationDataField();

            // assert
            expect(result).toEqual(true);
        });
        it("should not have a duplicate field", function () {
            spyOn(handler, 'GetAggregationDataFields').and.returnValue([
                { field: 'field1' },
                { field: 'field2' },
                { field: 'field3' }
            ]);
            var result = handler.HasDuplicatedAggregationDataField();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".ShowAggregationProgressBar", function () {
        it("should show a progress bar with a small spinner", function () {
            spyOn($.fn, 'busyIndicator');
            spyOn($.fn, 'hasClass').and.returnValue(true);
            spyOn($.fn, 'addClass');
            handler.ShowAggregationProgressBar();

            // assert
            expect($.fn.busyIndicator).toHaveBeenCalled();
            expect($.fn.addClass).toHaveBeenCalled();
        });
        it("should show a progress bar with a default spinner", function () {
            spyOn($.fn, 'busyIndicator');
            spyOn($.fn, 'hasClass').and.returnValue(false);
            spyOn($.fn, 'addClass');
            handler.ShowAggregationProgressBar();

            // assert
            expect($.fn.busyIndicator).toHaveBeenCalled();
            expect($.fn.addClass).not.toHaveBeenCalled();
        });
    });

    describe(".HideAggregationProgressBar", function () {
        it("should hide a progress bar", function () {
            spyOn($.fn, 'busyIndicator');
            handler.HideAggregationProgressBar();

            // assert
            expect($.fn.busyIndicator).toHaveBeenCalled();
        });
    });

    describe(".OpenAggregationPanel", function () {
        it("should open panel", function () {
            spyOn($.fn, 'hasClass').and.returnValue(true);
            spyOn($.fn, 'trigger');
            handler.OpenAggregationPanel();

            // assert
            expect($.fn.trigger).toHaveBeenCalled();
        });
        it("should not open panel", function () {
            spyOn($.fn, 'hasClass').and.returnValue(false);
            spyOn($.fn, 'trigger');
            handler.OpenAggregationPanel();

            // assert
            expect($.fn.trigger).not.toHaveBeenCalled();
        });
    });

    describe(".OpenAggregationAreaPanel", function () {
        it("should open panel", function () {
            spyOn($.fn, 'hasClass').and.returnValue(true);
            spyOn($.fn, 'trigger');
            handler.OpenAggregationAreaPanel();

            // assert
            expect($.fn.trigger).toHaveBeenCalled();
        });
        it("should not open panel", function () {
            spyOn($.fn, 'hasClass').and.returnValue(false);
            spyOn($.fn, 'trigger');
            handler.OpenAggregationAreaPanel();

            // assert
            expect($.fn.trigger).not.toHaveBeenCalled();
        });
    });

    describe(".GetAggregationData", function () {
        it('should add count field at [count field index] when there is no count field in aggregation fields', function () {
            var raw = {
                grouping_fields: [],
                aggregation_fields: [{}]
            };

            spyOn(handler, 'CreateAdhocCountField').and.returnValue({ id: 'auto-generated count field' });
            spyOn(handler, 'CreateAggregationField').and.returnValue({ id: 'aggregation field', is_count_field: function () { return false; } });
            spyOn(handler, 'GetAggregationCountFieldIndex').and.returnValue(1);

            var result = handler.GetAggregationData(raw);
            expect(result.length).toEqual(2);
            expect(result[0].id).toEqual('aggregation field');
            expect(result[1].id).toEqual('auto-generated count field');
        });
        it('should set index of a count field equal [count field index] when there is a count field in aggregation fields', function () {
            var raw = {
                grouping_fields: [],
                aggregation_fields: [{}, {}]
            };

            spyOn(handler, 'CreateAdhocCountField').and.returnValue({ id: 'auto-generated count field' });
            spyOn(handler, 'CreateAggregationField').and
                .returnValues(
                    { id: 'count field', is_count_field: function () { return true; } },
                    { id: 'aggregation field', is_count_field: function () { return false; } }
                );
            spyOn(handler, 'GetAggregationCountFieldIndex').and.returnValue(1);

            var result = handler.GetAggregationData(raw);
            expect(result.length).toEqual(2);
            expect(result[0].id).toEqual('aggregation field');
            expect(result[1].id).toEqual('count field');
        });
        it('should add count field at the last position when [count field index] is greater than size of item', function () {
            var raw = {
                grouping_fields: [],
                aggregation_fields: [{}, {}]
            };

            spyOn(handler, 'CreateAdhocCountField').and.returnValue({ id: 'auto-generated count field' });
            spyOn(handler, 'CreateAggregationField').and
                .returnValues(
                    { id: 'aggregation field 1', is_count_field: function () { return false; } },
                    { id: 'aggregation field 2', is_count_field: function () { return false; } }
                );
            spyOn(handler, 'GetAggregationCountFieldIndex').and.returnValue(100);

            var result = handler.GetAggregationData(raw);
            expect(result.length).toEqual(3);
            expect(result[0].id).toEqual('aggregation field 1');
            expect(result[1].id).toEqual('aggregation field 2');
            expect(result[2].id).toEqual('auto-generated count field');
        });
        it('should move count field to the last position when [count field index] is greater than size of item', function () {
            var raw = {
                grouping_fields: [],
                aggregation_fields: [{}, {}, {}]
            };

            spyOn(handler, 'CreateAdhocCountField').and.returnValue({ id: 'auto-generated count field' });
            spyOn(handler, 'CreateAggregationField').and
                .returnValues(
                    { id: 'count field', is_count_field: function () { return true; } },
                    { id: 'aggregation field 1', is_count_field: function () { return false; } },
                    { id: 'aggregation field 2', is_count_field: function () { return false; } }
                );
            spyOn(handler, 'GetAggregationCountFieldIndex').and.returnValue(100);

            var result = handler.GetAggregationData(raw);
            expect(result.length).toEqual(3);
            expect(result[0].id).toEqual('aggregation field 1');
            expect(result[1].id).toEqual('aggregation field 2');
            expect(result[2].id).toEqual('count field');
        });
    });
    describe(".CanAddReferenceLine", function () {
        it("should check CanAddReferenceLine is funtion", function () {
            expect(typeof handler.CanAddReferenceLine).toEqual('function');
        });
    });
    describe(".ShowAddReferenceLinePopup", function () {
        it("should check ShowAddReferenceLinePopup is a function", function () {
            expect(typeof handler.ShowAddReferenceLinePopup).toEqual('function');
        });
    });
});