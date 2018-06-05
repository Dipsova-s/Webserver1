/// <reference path="/../SharedDependencies/ClassesChooser.js" />

describe("ClassesChooser", function () {

    var settings = {
        createby_object: {
            q: 'Q',
            bp: ['BP1', 'Other']
        },
        model: 'TEST'
    };

    $.fn.kendoGrid = function () {
        var element = $(this);
        element.data('kendoGrid', {
            wrapper: element,
            element: element,
            content: element
        });
        return element;
    };

    var classesChooser;

    beforeEach(function () {

        classesChooser = new ClassesChooser('Test', '<div id="TestElement" />', settings);
        classesChooser.BusinessProcessHandler = {
            GetActive: $.noop,
            Data: function () { return []; },
            CurrentActive: function () { return {}; },
            CanEmpty: $.noop,
            ApplyHandler: $.noop
        };

    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(classesChooser).toBeDefined();
        });

        it("should set this handler in window scope", function () {
            expect(window[classesChooser.Name]).toBeDefined();
        });

        it("should set name as 'ClassesChooserTest'", function () {
            expect(classesChooser.Name).toEqual('ClassesChooserTest');
        });

        it("should set Element with id 'TestElement'", function () {
            expect($(classesChooser.Element).attr('id')).toEqual('TestElement');
        });

        it("should set a correct ClassesChooserSettings", function () {
            var result = JSON.stringify(settings);

            expect(JSON.stringify(classesChooser.ClassesChooserSettings)).toEqual(result);
        });

        it("should set a default ShowHelpBehavior is ALWAYS", function () {

            expect(classesChooser.ShowHelpBehavior).toEqual(classesChooser.HELPBEHAVIOR.ALWAYS);

        });
    });

    describe("call ApplyHandler", function () {

        var classesChooser2;

        beforeEach(function () {

            $('<div id="TestElement2" />').hide().appendTo('body');

            classesChooser2 = new ClassesChooser('Test', '#TestElement2', settings);
            classesChooser2.BusinessProcessHandler = {
                GetActive: $.noop,
                Data: ko.observable([]),
                CurrentActive: ko.observable({ O2C: true }),
                CanEmpty: $.noop,
                ApplyHandler: $.noop
            };

        });

        afterEach(function () {

            $('#TestElement2').remove();

        });

        it("should set html correctly", function () {

            $('#TestElement2').addClass('k-window-content').data('kendoWindow', {
                trigger: $.noop
            });
            classesChooser2.Element.html('');
            classesChooser2.ApplyHandler();

            expect($('#ObjectsGrid').length).toEqual(1);

        });

        it("should set html correctly if has km-scroll-wrapper", function () {

            classesChooser2.Element.addClass('km-scroll-wrapper').html('<div class="km-scroll-container"></div>');
            classesChooser2.ApplyHandler();

            expect($('#ObjectsGrid').length).toEqual(1);

        });

        it("should not have 'skipTemplate' class in element", function () {
            classesChooser2.HasSkipTemplateOption = false;
            classesChooser2.ApplyHandler();
            expect(classesChooser2.Element.find('.skipTemplate').length).toEqual(0);
        });

        it("should have 'skipTemplate' class in element", function () {
            classesChooser2.HasSkipTemplateOption = true;
            classesChooser2.ApplyHandler();
            expect(classesChooser2.Element.find('.skipTemplate').length).toEqual(1);
        });

        it("should fire event correctly", function () {

            classesChooser2.FilterClasses = $.noop;
            classesChooser2.OnClickGridRow = $.noop;
            classesChooser2.OnDblClickGridRow = $.noop;
            classesChooser2.ApplyHandler();

            spyOn(classesChooser2, 'OnDblClickGridRow');

            $('#ObjectsGrid').html('<table><tr></tr></table>').data('kendoGrid', {
                content: $('#ObjectsGrid table')
            });

            jQuery('#txtFitlerObjects').trigger('keyup');
            jQuery('#btnFitlerObjects').trigger('click');
            $('#ObjectsGrid tr:first').trigger('click');
            $('#ObjectsGrid tr:first').trigger('dblclick');

            expect(classesChooser2.OnDblClickGridRow).toHaveBeenCalled();

        });

        it("should create placeholder when the browser does not support", function () {

            Modernizr.input.placeholder = false;
            jQuery.fn.placeholder = function () { $(this).addClass('placeholder'); };
            classesChooser2.ClassesChooserSettings.createby_object.q = 'Q';
            classesChooser2.ApplyHandler();

            expect($('#txtFitlerObjects').hasClass('placeholder')).toEqual(true);

        });

        it("should create placeholder and set empty value when the browser does not support", function (done) {

            Modernizr.input.placeholder = false;
            jQuery.fn.placeholder = function () { $(this).addClass('placeholder'); };
            classesChooser2.ClassesChooserSettings.createby_object.q = '';
            classesChooser2.ApplyHandler();

            setTimeout(function () {
                expect($('#txtFitlerObjects').val()).toEqual('');
                done();
            }, 500);

        });

        it("should not add 'Other' business process when it's exist", function () {

            classesChooser2.BusinessProcessHandler.Data([
                {
                    id: 'Other',
                    name: 'Other',
                    abbreviation: 'Other',
                    order: 100,
                    enable: true,
                    is_allowed: true
                }
            ]);
            classesChooser2.ApplyHandler();

            expect(classesChooser2.BusinessProcessHandler.Data().length).toEqual(1);

        });

        it("should set active to 'Other' business process when no active", function () {

            classesChooser2.BusinessProcessHandler.CurrentActive({ O2C: false });
            classesChooser2.ApplyHandler();

            expect(classesChooser2.BusinessProcessHandler.CurrentActive()['Other']).toEqual(true);

        });

        it("should not set active to 'Other' business process when there is active", function () {

            classesChooser2.BusinessProcessHandler.CurrentActive({ O2C: true });
            classesChooser2.ApplyHandler();

            expect(classesChooser2.BusinessProcessHandler.CurrentActive()['Other']).toBeUndefined();

        });

    });

    describe("call GetGridOptions", function () {

        it("should got an option", function () {
            expect(classesChooser.GetGridOptions()).toBeDefined();
        });

        it("should have columnResize event", function () {
            var options = classesChooser.GetGridOptions();
            options.columnResize({ sender: { resize: $.noop } });

            expect(options.columnResize).toBeDefined();
        });

    });

    describe("call OnClickGridRow", function () {

        var grid;

        beforeEach(function () {

            grid = {
                content: $('<table>'
                    + '<tr class="k-state-selected"><td><input type="checkbox" id="objectId1" checked="checked"></td></tr>'
                    + '<tr class="k-state-selected"><td><input type="checkbox" id="objectId2" checked="checked"></td></tr>'
                    + '<tr><td><input type="checkbox" id="objectId3"></td></tr>'
                    + '</table>'
                )
            };

        });

        it("should remove selecting row for selected checkbox", function () {
            var row = grid.content.find('tr:first');
            classesChooser.OnClickGridRow(grid, row, row.find(':checkbox').prop('checked', false), 'xx');
            expect(grid.content.find('.k-state-selected').length).toEqual(1);
        });

        it("should add selecting row for unselect checkbox", function () {
            var row = grid.content.find('tr:last');
            classesChooser.OnClickGridRow(grid, row, $(), classesChooser.HELPBEHAVIOR.ALWAYS);
            classesChooser.OnClickGridRow(grid, row, row.find(':checkbox'), classesChooser.HELPBEHAVIOR.ALWAYS);
            expect(grid.content.find('.k-state-selected').length).toEqual(3);
        });

    });

    describe("call OnDblClickGridRow", function () {

        var grid;

        beforeEach(function () {

            grid = {
                content: $('<table>'
                    + '<tr class="k-state-selected"><td><input type="checkbox" id="objectId1" checked="checked"></td></tr>'
                    + '<tr class="k-state-selected"><td><input type="checkbox" id="objectId2" checked="checked"></td></tr>'
                    + '<tr><td><input type="checkbox" id="objectId3"></td></tr>'
                    + '</table>'
                )
            };

        });

        it("should select at objectId1", function () {
            var row = grid.content.find('tr:first');
            classesChooser.OnDblClickGridRow(grid, row);
            expect(classesChooser.SelectingClasses[0]).toEqual('1');
        });

    });

    describe("call BindingObjectGrid", function () {

        var _classesChooser;
        beforeEach(function () {
            _classesChooser = new ClassesChooser('Test', '<div id="TestElement3" />', settings);
            _classesChooser.ApplyDataSource = $.noop;
            _classesChooser.BaseLoadAllClasses = function () { return $.when(); };
            _classesChooser.GetGridData = function () { return { classes: [] }; };
        });

        it("should call ApplyDataSource if have grid", function () {
            spyOn(_classesChooser, 'ApplyDataSource');
            $('<div id="ObjectsGrid">').hide().data('kendoGrid', true).appendTo('body');
            _classesChooser.BindingObjectGrid()
                .done(function () {
                    expect(_classesChooser.ApplyDataSource).toHaveBeenCalled();
                    $('#ObjectsGrid').remove();
                });
        });

        it("should not call ApplyDataSource if no grid", function () {
            spyOn(_classesChooser, 'ApplyDataSource');
            $('#ObjectsGrid').remove();
            _classesChooser.BindingObjectGrid()
                .done(function () {
                    expect(_classesChooser.ApplyDataSource).not.toHaveBeenCalled();
                });
        });

    });

    describe("call BaseLoadAllClasses", function () {

        var _classesChooser;
        beforeEach(function () {
            _classesChooser = new ClassesChooser('Test', '<div id="_TestElement" />', settings);
        });


        it("should load new data", function () {

            _classesChooser.LoadAllClasses = function () {
                return $.when({
                    classes: [{ id: 'class1' }]
                });
            };
            _classesChooser.BaseLoadAllClasses('test')
                .done(function (data) {
                    expect(data.classes.length).toEqual(1);
                });

        });

        it("should load from cache", function () {

            _classesChooser.DataClasses['test'] = {
                classes: [{ id: 'class1' }]
            };
            _classesChooser.LoadAllClasses = function () {
                return $.when({
                    classes: [{ id: 'class1' }, { id: 'class2' }]
                });
            };
            _classesChooser.BaseLoadAllClasses('test')
                .done(function (data) {
                    expect(data.classes.length).toEqual(1);
                });

        });

    });

    describe("call GetGridData", function () {

        it("should sort by descending and case insensitive", function () {
            var data = {
                classes: [
                    { name: 'B' },
                    { name: 'a' },
                    { name: 'c' }
                ]
            };

            var gridData = classesChooser.GetGridData(data);
            expect(['a', 'B', 'c']).toEqual([gridData.classes[0].name, gridData.classes[1].name, gridData.classes[2].name]);
        });

        it("should add 'checked' property and set as 'false' to each classes", function () {
            var data = {
                classes: [
                    { name: 'B' },
                    { name: 'a' },
                    { name: 'c' }
                ]
            };

            var gridData = classesChooser.GetGridData(data);
            expect([false, false, false]).toEqual([gridData.classes[0].checked, gridData.classes[1].checked, gridData.classes[2].checked]);
        });

    });

    describe("call GetGridDataSource", function () {

        var _classesChooser;
        var grid;
        beforeEach(function () {
            _classesChooser = new ClassesChooser('Test', '<div id="TestElement4" />', settings);
            _classesChooser.BusinessProcessHandler = {
                GetActive: $.noop
            };
            grid = {
                thead: $('<div />')
            };
        });

        it("should have filter for 'Other' businesss process but no data", function () {

            _classesChooser.HasOtherBusinessProcess = function () { return true; };
            var dataSource = _classesChooser.GetGridDataSource(grid, []);
            var otherFilter = dataSource.filter[0].filters[1];

            expect([otherFilter.field, otherFilter.operator, otherFilter.value]).toEqual(['id', 'neq', 'you_always_find_this']);

        });

        it("should have filter for 'Other' businesss process and have data", function () {

            _classesChooser.HasOtherBusinessProcess = function () { return true; };
            _classesChooser.SetCacheAngleData({
                items: [{ id: 'other1' }]
            }, '');
            var dataSource = _classesChooser.GetGridDataSource(grid, []);
            var otherFilter = dataSource.filter[0].filters[1].filters[0];

            expect([otherFilter.field, otherFilter.operator, otherFilter.value]).toEqual(['id', 'neq', 'other1']);

        });

        it("should not have filter for 'Other' businesss process", function () {

            _classesChooser.HasOtherBusinessProcess = function () { return false; };
            var dataSource = _classesChooser.GetGridDataSource(grid, []);

            expect(dataSource.filter[0].filters.length).toEqual(1);

        });

        it("should not have filter for 'q'", function () {

            _classesChooser.GetSearchQuery = function () { return ''; };
            var dataSource = _classesChooser.GetGridDataSource(grid, []);

            expect(dataSource.filter.length).toEqual(1);

        });

        it("should have filter for 'q'", function () {

            _classesChooser.GetSearchQuery = function () { return 'test'; };
            var dataSource = _classesChooser.GetGridDataSource(grid, []);

            expect(dataSource.filter.length).toEqual(2);

        });

        it("should not have sort", function () {

            var dataSource = _classesChooser.GetGridDataSource(grid, []);

            expect(dataSource.sort).toBeUndefined();

        });

        it("should have sort by asc", function () {

            grid.thead.html('<div class="asc" data-field="test" />');
            var dataSource = _classesChooser.GetGridDataSource(grid, []);

            expect(dataSource.sort.dir).toEqual('asc');

        });

        it("should have sort by desc", function () {

            grid.thead.html('<div class="desc" data-field="test" />');
            var dataSource = _classesChooser.GetGridDataSource(grid, []);

            expect(dataSource.sort.dir).toEqual('desc');

        });

    });

    describe("call ApplyDataSource", function () {

        var classesChooser5;
        var grid;
        beforeEach(function () {

            if (!window.kendo.data.DataSource) {
                window.kendo.data.DataSource = $.noop;
            }

            classesChooser5 = new ClassesChooser('Test', '<div id="TestElement5" />', settings);
            classesChooser5.BusinessProcessHandler = {
                GetActive: $.noop
            };

            grid = {
                thead: $('<div />').html('<div class="k-header" data-field="test"></div>'),
                setDataSource: $.noop,
                dataSource: { total: $.noop }
            };

        });

        it("should do nothing with html", function () {

            classesChooser5.GetGridDataSource = function () { return {}; };
            classesChooser5.ApplyDataSource(grid, []);

            expect(grid.thead.find('[data-field="test"]').attr('class')).toEqual('k-header');

        });

        it("should change sorting icon to 'test' field", function () {

            classesChooser5.GetGridDataSource = function () { return { sort: { field: 'test', dir: 'asc' } }; };
            classesChooser5.ApplyDataSource(grid, []);

            expect(grid.thead.find('[data-field="test"]').hasClass('asc')).toEqual(true);

        });

    });

    describe("call GetFiltersByBusinessProcesses", function () {

        it("should get a correct filter when no bpData", function () {

            var filters = classesChooser.GetFiltersByBusinessProcesses([], null);
            expect([filters[0].field, filters[0].operator, filters[0].value]).toEqual(['id', 'eq', 'you_have_never_found_this']);

        });

        it("should get a correct filter when have bpData", function () {

            var filters = classesChooser.GetFiltersByBusinessProcesses(['test1'], null);
            expect([filters[0].field, filters[0].operator, filters[0].value]).toEqual(['id', 'eq', 'test1']);

        });

        it("should do nothing when otherData is null", function () {

            var filters = classesChooser.GetFiltersByBusinessProcesses(['test1'], null);
            expect(filters.length).toEqual(1);

        });

        it("should get a correct filter when otherData length is 0", function () {

            var filters = classesChooser.GetFiltersByBusinessProcesses(['test1'], []);
            expect([filters[1].field, filters[1].operator, filters[1].value]).toEqual(['id', 'neq', 'you_always_find_this']);

        });

        it("should get a correct filter when have otherData", function () {

            var filters = classesChooser.GetFiltersByBusinessProcesses(['test1'], ['other1']);
            expect([filters[1].filters[0].field, filters[1].filters[0].operator, filters[1].filters[0].value]).toEqual(['id', 'neq', 'other1']);

        });

    });

    describe("call GetFiltersByQuery", function () {

        it("should get a correct filter for 'q'", function () {

            var filters = classesChooser.GetFiltersByQuery('test');
            expect(filters.length).toEqual(3);

        });

    });

    describe("call SetGridResult", function () {

        var classesChooser6;

        beforeEach(function () {

            $('<div id="TestElement6" />').hide().appendTo('body');

            classesChooser6 = new ClassesChooser('Test', '#TestElement6', settings);
            classesChooser6.BusinessProcessHandler = {
                GetActive: $.noop,
                Data: function () { return []; },
                CurrentActive: function () { return {}; },
                CanEmpty: $.noop,
                ApplyHandler: $.noop
            };
            classesChooser6.ApplyHandler();

        });

        afterEach(function () {

            $('#TestElement6').remove();

        });

        it("should not contain 'grid-no-data' element if has a result", function () {

            classesChooser6.SetGridResult(1);
            expect($('#TestElement6 .grid-no-data').length).toEqual(0);

        });

        it("should contain 'grid-no-data' element if no result", function () {

            classesChooser6.SetGridResult(0);
            expect($('#TestElement6 .grid-no-data').length).toEqual(1);

        });

    });

    describe("call SortColumn", function () {

        beforeEach(function () {

            var grid = {
                thead: $(),
                dataSource: {
                    sort: $.noop
                }
            };

            $('<div id="ObjectsGrid" />').data('kendoGrid', grid).hide().appendTo('body');

        });

        afterEach(function () {

            $('#ObjectsGrid').remove();

        });

        it("should sort column success", function () {

            var result = classesChooser.SortColumn($());
            expect(result).toEqual(true);

        });

    });

    describe("call SetSortColumnHtml", function () {

        it("should get a correct sorting css class", function () {

            var grid = {
                thead: $('<div />').html('<div class="k-header asc" data-field="test"></div><div class="k-header desc"></div>')
            };

            var column = classesChooser.SetSortColumnHtml(grid, 'test', 'desc');
            expect(column.hasClass('desc')).toEqual(true);

        });

    });

    describe("call GetSortDirection", function () {

        it("should get sort by desc when element is asc", function () {

            var dir = classesChooser.GetSortDirection($('<div class="asc" />'), 'test');
            expect(dir).toEqual('desc');

        });

        it("should get sort by asc when element is desc or nothing", function () {

            var dir = classesChooser.GetSortDirection($('<div />'), 'test');
            expect(dir).toEqual('asc');

        });

        it("should get sort by desc when is checked field and element is nothing", function () {

            var dir = classesChooser.GetSortDirection($('<div />'), 'checked');
            expect(dir).toEqual('desc');

        });

        it("should get sort by asc when is checked field but element is asc or desc", function () {

            var dir = classesChooser.GetSortDirection($('<div class="desc" />'), 'checked');
            expect(dir).toEqual('asc');

        });

    });

    describe("call GetAllSelectedClasses", function () {

        it("should get a copy of selected classes", function () {

            classesChooser.SelectingClasses = ['class1'];

            var classes = classesChooser.GetAllSelectedClasses();
            classes.push('classes2');

            expect(classesChooser.SelectingClasses.length).toEqual(1);

        });

    });

    describe("call GetAllSelectedClassesName", function () {

        it("should get an empty list when no selected class", function () {

            classesChooser.SelectingClasses = [];

            var names = classesChooser.GetAllSelectedClassesName();

            expect(names).toEqual([]);

        });

        it("should get class name as class id", function () {

            classesChooser.SelectingClasses = ['class1'];
            var names = classesChooser.GetAllSelectedClassesName();

            expect(names).toEqual(['class1']);

        });

        it("should get class name as 'class 1 name'", function () {

            $('<table id="TestGetAllSelectedClassesName"><tr><td><input id="objectIdclass1" /></td><td>class 1 name</td></tr></table>').hide().appendTo('body');

            classesChooser.SelectingClasses = ['class1'];

            var names = classesChooser.GetAllSelectedClassesName();

            expect(names).toEqual(['class 1 name']);

            $('#TestGetAllSelectedClassesName').remove();

        });

    });

    describe("call SetSelectedClasses", function () {

        beforeEach(function () {

            var grid = {
                dataSource: {
                    getByUid: function (uid) { return this.data()[uid.replace('uid', '')]; },
                    data: function () {
                        return [
                            { uid: 'uid0', id: 'class0', checked: true },
                            { uid: 'uid1', id: 'class1', checked: false },
                            { uid: 'uid2', id: 'class2', checked: false }
                        ];
                    }
                },
                tbody: $('tbody')
            };
            $('<div id="ObjectsGrid" />').data('kendoGrid', grid).hide().appendTo('body');

        });

        afterEach(function () {

            $('#ObjectsGrid').remove();

        });

        it("should do nothing when uid does not in the data source", function () {

            classesChooser.SelectingClasses = ['class1'];
            classesChooser.SetSelectedClasses('uid5');

            expect(classesChooser.SelectingClasses.length).toEqual(1);

        });

        it("should select only 1 class when MultipleSelection is 'false'", function () {

            classesChooser.SelectingClasses = ['class0'];
            classesChooser.MultipleSelection = false;
            classesChooser.SetSelectedClasses('uid1');

            expect(['class1']).toEqual(classesChooser.SelectingClasses);

        });

        it("should add class when MultipleSelection is 'true'", function () {

            classesChooser.SelectingClasses = ['class0'];
            classesChooser.MultipleSelection = true;
            classesChooser.SetSelectedClasses('uid1');

            expect(['class0', 'class1']).toEqual(classesChooser.SelectingClasses);

        });

        it("should remove class when it was selected", function () {

            classesChooser.SelectingClasses = ['class0'];
            classesChooser.SetSelectedClasses('uid0');

            expect([]).toEqual(classesChooser.SelectingClasses);

        });

    });

    describe("call SetUnselectObject", function () {

        it("should do nothing when class id does not in the list", function () {

            classesChooser.SelectingClasses = ['class1'];

            classesChooser.SetUnselectObject('class2');

            expect(['class1']).toEqual(classesChooser.SelectingClasses);

        });

    });

    describe("call FilterClasses", function () {

        var classesChooser7;

        beforeEach(function () {

            $('<div id="TestElement7" />').hide().appendTo('body');

            classesChooser7 = new ClassesChooser('Test', '#TestElement7', settings);
            classesChooser7.BusinessProcessHandler = {
                GetActive: function () { return []; },
                Data: ko.observable([]),
                CurrentActive: ko.observable({ O2C: true }),
                CanEmpty: $.noop,
                ApplyHandler: $.noop
            };

        });

        afterEach(function () {

            $('#TestElement7').remove();

        });

        it("should have a warning when no langauge in the model", function () {

            classesChooser7.CurrentModelData = {
                active_languages: ['en'],
                uri: ''
            };
            classesChooser7.DefaultLanguage = 'nl';
            classesChooser7.SetCacheAngleData = $.noop;
            classesChooser7.BindingObjectGrid = $.noop;
            classesChooser7.GetSearchQuery = function () { return 'test'; };
            var result = classesChooser7.FilterClasses();

            expect(false).toEqual(result);

        });

        it("should load new data if nothing", function () {

            classesChooser7.BusinessProcessHandler.GetActive = function () { return ['P2P', 'Other']; };
            classesChooser7.CurrentModelData = {
                active_languages: ['en'],
                uri: ''
            };
            classesChooser7.DefaultLanguage = 'en';
            classesChooser7.BindingObjectGrid = $.noop;
            classesChooser7.GetSearchQuery = function () { return 'test'; };
            classesChooser7.LoadAngleRelateBusinessProcesses = function () { return { items: [] }; };

            $.when(classesChooser7.FilterClasses())
                .done(function (data) {
                    expect(data.items).toEqual([]);
                });

        });

        it("should use cache if loaded", function () {

            classesChooser7.BusinessProcessHandler.GetActive = function () { return ['P2P', 'Other']; };
            classesChooser7.CurrentModelData = {
                active_languages: ['en'],
                uri: ''
            };
            classesChooser7.DefaultLanguage = 'en';
            classesChooser7.BindingObjectGrid = $.noop;
            classesChooser7.GetSearchQuery = function () { return 'test'; };
            classesChooser7.LoadAngleRelateBusinessProcesses = function () { return { items: [] }; };

            classesChooser7.FilterClasses();

            classesChooser7.LoadAngleRelateBusinessProcesses = function () { return { items: [{ id: 'test' }] }; };

            $.when(classesChooser7.FilterClasses())
                .done(function (data) {
                    expect(null).toEqual(data);
                });

        });

    });

    describe("call CheckAndFilterClasses", function () {

        it("should not submit a filter if it is not be ready", function () {

            var result = classesChooser.CheckAndFilterClasses($('<div class="disabled" />'));
            expect(false).toEqual(result);

        });

        it("should submit a filter normally", function () {

            classesChooser.FilterClasses = $.noop;
            var result = classesChooser.CheckAndFilterClasses($('<div />'));
            expect(true).toEqual(result);

        });

    });

    describe("call CheckActiveLanguage", function () {

        var classesChooser8;

        beforeEach(function () {

            $('<div id="TestElement8" />').hide().appendTo('body');

            classesChooser8 = new ClassesChooser('Test', '#TestElement8', settings);
            classesChooser8.BusinessProcessHandler = {
                GetActive: function () { return []; },
                Data: ko.observable([]),
                CurrentActive: ko.observable({ O2C: true }),
                CanEmpty: $.noop,
                ApplyHandler: $.noop
            };

        });

        afterEach(function () {

            $('#TestElement8').remove();

        });

        it("should get false when language is not 'en' and language is not in the active list", function () {

            classesChooser8.DefaultLanguage = 'de';
            var result = classesChooser8.CheckActiveLanguage(['en', 'nl']);
            expect(false).toEqual(result);

        });

        it("should get true when language is not 'en' and language is in the active list", function () {

            classesChooser8.DefaultLanguage = 'de';
            var result = classesChooser8.CheckActiveLanguage(['en', 'nl', 'de']);
            expect(true).toEqual(result);

        });

    });

    describe("call GetAngleParams", function () {

        it("should get 'facetcat_bp' query when have business processes", function () {

            var result = classesChooser.GetAngleParams('EA2_800', ['P2P', 'S2D'], 30);
            expect(result.fq).toContain('facetcat_bp');

        });

        it("should not have 'facetcat_bp' query", function () {

            var result = classesChooser.GetAngleParams('EA2_800', [], 30);
            expect(result.fq).not.toContain('facetcat_bp');

        });

    });

    describe("call GetSearchQuery", function () {

        it("should get 'test' text from search input", function () {

            $('<input id="txtFitlerObjects" value="test" />').hide().appendTo('body');

            var result = classesChooser.GetSearchQuery();
            expect(result).toEqual('test');

            $('#txtFitlerObjects').remove();

        });

        it("should get empty text if no search input", function () {

            var result = classesChooser.GetSearchQuery();
            expect(result).toEqual('');

        });

    });

    describe("call SetCacheAngleData", function () {

        it("should not add a duplicating class", function () {

            classesChooser.SetCacheAngleData({
                items: [
                    { id: 'EA_CLASS_TPL_test1' },
                    { id: 'EA_CLASS_TPL_test1' },
                    { id: 'EA_CLASS_TPL_test2' }
                ]
            }, 'test');
            expect(classesChooser.DataBpAngle['test']).toEqual(['test1', 'test2']);

        });

    });

    describe("call HasOnlyOtherBusinessProcess", function () {

        it("should true", function () {

            var result = classesChooser.HasOnlyOtherBusinessProcess(['Other']);
            expect(result).toEqual(true);

        });

        it("should false", function () {

            var result = classesChooser.HasOnlyOtherBusinessProcess(['S2D']);
            expect(result).toEqual(false);

        });

    });

    describe("call HasOtherBusinessProcessData", function () {

        it("should true if de-select Other bp", function () {

            var cacheKey = 'Other';
            var result = !!classesChooser.HasOtherBusinessProcessData(['S2D'], cacheKey);
            expect(result).toEqual(true);

        });

        it("should true if Other bp is cached", function () {

            var cacheKey = 'Other';
            classesChooser.DataBpAngle[cacheKey] = {};
            var result = !!classesChooser.HasOtherBusinessProcessData(['Other'], cacheKey);
            expect(result).toEqual(true);

        });

        it("should false if select Other bp and no cache", function () {

            var result = !!classesChooser.HasOtherBusinessProcessData(['Other']);
            expect(result).toEqual(false);

        });

    });

});
