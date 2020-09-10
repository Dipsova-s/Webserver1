/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ProgressBar.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("DisplayOverviewHandler", function () {

    var displayOverviewHandler;
    beforeEach(function () {
        var angleHandler = new AngleHandler({
            id: '1234',
            multi_lang_name: [
                { lang: 'en', text: 'name-en' },
                { lang: 'nl', text: '' }
            ],
            uri: '/angles/1'
        });
        displayOverviewHandler = new DisplayOverviewHandler(angleHandler);
    });

    describe("constructor", function () {
        it('initial default values', function () {
            // assert
            expect(displayOverviewHandler.Displays().length).toEqual(0);
            expect(displayOverviewHandler.CanSwitchDisplay()).toEqual(false);
            expect(displayOverviewHandler.CanCreateNewDisplay()).toEqual(false);
            expect($.isFunction(displayOverviewHandler.CreateNewDisplay)).toEqual(true);
            expect($.isFunction(displayOverviewHandler.DeleteDisplay)).toEqual(true);
            expect($.isFunction(displayOverviewHandler.SwitchDisplay)).toEqual(true);
            expect(ko.toJS(displayOverviewHandler.Group)).toEqual({
                1: { Header: 'Published ({0})', Visible: false, ForceClose: false, Key: 'display_group_public' },
                2: { Header: 'Private ({0})', Visible: false, ForceClose: false, Key: 'display_group_private' },
                3: { Header: 'Other ({0})', Visible: false, ForceClose: false, Key: 'display_group_other' }
            });
            expect(displayOverviewHandler.ExecutionInfo()).toEqual('');
        });
    });

    describe(".Initial", function () {
        it('should init', function () {
            // prepare
            spyOn(displayOverviewHandler, 'InitialSortable');
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            displayOverviewHandler.Initial();

            // assert
            expect(displayOverviewHandler.Group[1].Visible()).toEqual(true);
            expect(displayOverviewHandler.Group[2].Visible()).toEqual(false);
            expect(displayOverviewHandler.Group[3].Visible()).toEqual(false);
            expect(displayOverviewHandler.InitialSortable).toHaveBeenCalled();
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalledTimes(2);
        });
    });

    describe(".SetData", function () {
        it('should sort and set data', function () {
            // prepare
            var displays = [{}, {}, {}];
            spyOn(Array.prototype, 'sortObject');
            spyOn(displayOverviewHandler, 'GetInfo').and.returnValue({});
            spyOn(displayOverviewHandler, 'UpdateExecutionInfo');
            displayOverviewHandler.SetData(displays, '');

            // assert
            expect(displayOverviewHandler.Displays().length).toEqual(3);
            expect(Array.prototype.sortObject).toHaveBeenCalled();
            expect(displayOverviewHandler.UpdateExecutionInfo).toHaveBeenCalled();
        });
    });

    describe(".GetInfo", function () {
        var tests = [
            {
                title: 'should get Display info #1',
                data: {
                    id: 'id1',
                    uri: '/displays/1',
                    display_type: 'list',
                    is_angle_default: true,
                    used_in_task: true,
                    is_parameterized: true,
                    is_public: true,
                    authorizations: { 'delete': true }
                },
                current_uri: '/displays/1',
                name: 'name1',
                has_changed: true,
                create_or_update: true,
                get_raw_data: {},
                get_filters: [],
                get_jumps: [],
                level: 'error',
                sortable: true,
                expected: {
                    id: 'id1',
                    uri: '/displays/1',
                    name: 'name1',
                    display_type: 'list',
                    display_type_css: 'icon-list',
                    display_type_css_extended: 'default schedule',
                    filter_css: 'none',
                    is_public: true,
                    is_public_css: 'none',
                    can_delete: true,
                    is_error: true,
                    is_warning: false,
                    valid_css: 'validError',
                    is_parameterized: true,
                    is_parameterized_css: 'icon-parameterized',
                    is_selected: true,
                    is_new_adhoc: false,
                    unsaved_css: 'icon-adhoc sign-unsaved',
                    group_id: 1,
                    sorting: '1999_name1',
                    sortable: true
                }
            },
            {
                title: 'should get Display info #2',
                data: {
                    id: 'id2',
                    uri: '/displays/2',
                    display_type: 'chart',
                    is_angle_default: false,
                    used_in_task: false,
                    is_parameterized: false,
                    is_public: false,
                    authorizations: { 'delete': false }
                },
                current_uri: '/displays/1',
                name: 'name2',
                has_changed: false,
                create_or_update: false,
                get_raw_data: null,
                get_filters: [{}],
                get_jumps: [],
                level: 'warning',
                sortable: false,
                expected: {
                    id: 'id2',
                    uri: '/displays/2',
                    name: 'name2',
                    display_type: 'chart',
                    display_type_css: 'icon-chart',
                    display_type_css_extended: '',
                    filter_css: 'icon-filter',
                    is_public: false,
                    is_public_css: 'icon-private',
                    can_delete: false,
                    is_error: false,
                    is_warning: true,
                    valid_css: 'validWarning',
                    is_parameterized: false,
                    is_parameterized_css: 'none',
                    is_selected: false,
                    is_new_adhoc: true,
                    unsaved_css: 'none',
                    group_id: 2,
                    sorting: '2000_name2',
                    sortable: false
                }
            },
            {
                title: 'should get Display info #3',
                data: {
                    id: 'id3',
                    uri: '/displays/3',
                    display_type: 'pivot',
                    is_angle_default: true,
                    used_in_task: false,
                    is_parameterized: false,
                    is_public: false,
                    authorizations: { 'delete': false },
                    created: { user: '/users/2' }
                },
                current_uri: '/displays/1',
                name: 'name3',
                has_changed: false,
                create_or_update: false,
                get_raw_data: null,
                get_filters: [],
                get_jumps: [{}],
                level: '',
                sortable: false,
                expected: {
                    id: 'id3',
                    uri: '/displays/3',
                    name: 'name3',
                    display_type: 'pivot',
                    display_type_css: 'icon-pivot',
                    display_type_css_extended: 'default',
                    filter_css: 'icon-followup',
                    is_public: false,
                    is_public_css: 'icon-private',
                    can_delete: false,
                    is_error: false,
                    is_warning: false,
                    valid_css: 'none',
                    is_parameterized: false,
                    is_parameterized_css: 'none',
                    is_selected: false,
                    is_new_adhoc: true,
                    unsaved_css: 'none',
                    group_id: 3,
                    sorting: '3000_name3',
                    sortable: false
                }
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                userModel.Data({ uri: '/users/1' });
                var display = new DisplayHandler(test.data, displayOverviewHandler.AngleHandler);
                spyOn(display, 'GetName').and.returnValue(test.name);
                spyOn(display, 'HasChanged').and.returnValue(test.has_changed);
                spyOn(display, 'CanCreateOrUpdate').and.returnValue(test.create_or_update);
                spyOn(display, 'GetRawData').and.returnValue(test.get_raw_data);
                spyOn(display, 'GetValidationResult').and.returnValue({ Level: test.level });
                spyOn(display, 'CanUpdateOrder').and.returnValue(test.sortable);
                spyOn(display.QueryDefinitionHandler, 'GetFilters').and.returnValue(test.get_filters);
                spyOn(display.QueryDefinitionHandler, 'GetJumps').and.returnValue(test.get_jumps);
                spyOn(display.QueryDefinitionHandler, 'GetExecutionParameters').and.returnValue(test.data.is_parameterized ? [{}] : []);
                var result = displayOverviewHandler.GetInfo(display, test.current_uri);

                // assert
                expect(result.Id).toEqual(test.expected.id);
                expect(result.Uri).toEqual(test.expected.uri);
                expect(result.Name).toEqual(test.expected.name);
                expect(result.DisplayType).toEqual(test.expected.display_type);
                expect(result.DisplayTypeClassName).toEqual(test.expected.display_type_css);
                expect(result.ExtendDisplayTypeClassName).toEqual(test.expected.display_type_css_extended);
                expect(result.FilterClassName).toEqual(test.expected.filter_css);
                expect(result.IsPublic).toEqual(test.expected.is_public);
                expect(result.PublicClassName).toEqual(test.expected.is_public_css);
                expect(result.CanDelete).toEqual(test.expected.can_delete);
                expect(result.IsError).toEqual(test.expected.is_error);
                expect(result.IsWarning).toEqual(test.expected.is_warning);
                expect(result.ValidClassName).toEqual(test.expected.valid_css);
                expect(result.IsParameterized).toEqual(test.expected.is_parameterized);
                expect(result.ParameterizedClassName).toEqual(test.expected.is_parameterized_css);
                expect(result.IsSelected).toEqual(test.expected.is_selected);
                expect(result.IsNewAdhoc).toEqual(test.expected.is_new_adhoc);
                expect(result.UnSavedClassName).toEqual(test.expected.unsaved_css);
                expect(result.Sorting).toEqual(test.expected.sorting);
                expect(result.Sortable).toEqual(test.expected.sortable);
            });
        });
    });

    describe(".GetGroupOption", function () {
        it('should get option (1)', function () {
            // prepare
            var result = displayOverviewHandler.GetGroupOption(1);

            // assert
            expect(ko.toJS(result)).toEqual({ Header: 'Published ({0})', Visible: false, ForceClose: false, Key: 'display_group_public' });
        });
        it('should get option (any)', function () {
            // prepare
            var result = displayOverviewHandler.GetGroupOption('any');

            // assert
            expect(ko.toJS(result)).toEqual({ Header: '', Visible: false, ForceClose: false });
        });
    });

    describe(".SetInitialTabGroupsWidth", function () {
        beforeEach(function () {
            $('<div id="DisplayTabs"/>')
                .append('<div class="tab-menu-group" id="tab-menu-group-1" style="width:0px;" />')
                .append('<div class="tab-menu-group" id="tab-menu-group-2" style="width:100px;"  />')
                .appendTo('body');
        });
        afterEach(function () {
            $('#DisplayTabs').remove();
        });
        it('should set maxWidth according to group visibilty', function () {
            // prepare
            displayOverviewHandler.Group[1].Visible(false);
            displayOverviewHandler.Group[2].Visible(true);

            // act
            displayOverviewHandler.SetInitialTabGroupsWidth();

            // assert
            expect($('#tab-menu-group-1').css('max-width')).toEqual('0px');
            expect($('#tab-menu-group-2').css('max-width')).toEqual('100px');
        });
    });

    describe(".IsVisible", function () {
        it('should be true', function () {
            // prepare
            displayOverviewHandler.Group[2].Visible(true);
            displayOverviewHandler.Group[2].ForceClose(false);
            var result = displayOverviewHandler.IsVisible(2);

            // assert
            expect(result).toEqual(true);
        });
        it('should be false', function () {
            // prepare
            displayOverviewHandler.Group[2].Visible(true);
            displayOverviewHandler.Group[2].ForceClose(true);
            var result = displayOverviewHandler.IsVisible(2);

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".SetVisibility", function () {
        beforeEach(function () {
            $('<div id="DisplayTabs"/>')
                .append('<div id="tab-menu-group-1" style="max-width:100px;" />')
                .appendTo('body');
        });
        afterEach(function () {
            $('#DisplayTabs').remove();
        });
        it('should trigger animation', function () {
            // prepare
            spyOn($.fn, 'animate');

            // act
            displayOverviewHandler.SetVisibility(1);

            // assert
            expect($.fn.animate).toHaveBeenCalled();
        });
    });

    describe(".TabGroupAnimationCallback", function () {
        it('should set visibility', function () {
            // prepare
            var option = { Header: '', Visible: ko.observable(false), ForceClose: ko.observable(false) };
            spyOn(displayOverviewHandler, 'UpdateScrollButtonState');
            spyOn(userSettingModel, 'SetDisplayGroupSettings');

            // act
            displayOverviewHandler.TabGroupAnimationCallback(option);
            
            // assert
            expect(option.Visible()).toEqual(true);
            expect(displayOverviewHandler.UpdateScrollButtonState).toHaveBeenCalled();
            expect(userSettingModel.SetDisplayGroupSettings).toHaveBeenCalled();

        });
    });

    describe(".GroupHeader", function () {
        it('should get header', function () {
            // prepare
            displayOverviewHandler.Displays([
                { GroupId: 1 },
                { GroupId: 1 },
                { GroupId: 2 }
            ]);
            var result = displayOverviewHandler.GroupHeader(displayOverviewHandler.Displays()[0].GroupId);

            // assert
            expect(result).toEqual('Published (2)');
        });
    });

    describe(".IsGroupActive", function () {
        it('should active', function () {
            // prepare
            displayOverviewHandler.Displays([
                { GroupId: 1, IsSelected: true },
                { GroupId: 1, IsSelected: false },
                { GroupId: 2, IsSelected: false }
            ]);
            var result = displayOverviewHandler.IsGroupActive(displayOverviewHandler.Displays()[1].GroupId);

            // assert
            expect(result).toBeTruthy();
        });
        it('should not active (no selected)', function () {
            // prepare
            displayOverviewHandler.Displays([
                { GroupId: 1, IsSelected: false },
                { GroupId: 1, IsSelected: false },
                { GroupId: 2, IsSelected: false }
            ]);
            var result = displayOverviewHandler.IsGroupActive(displayOverviewHandler.Displays()[1]);

            // assert
            expect(result).toBeFalsy();
        });
        it('should not active (differnce group)', function () {
            // prepare
            displayOverviewHandler.Displays([
                { GroupId: 1, IsSelected: true },
                { GroupId: 1, IsSelected: false },
                { GroupId: 2, IsSelected: false }
            ]);
            var result = displayOverviewHandler.IsGroupActive(displayOverviewHandler.Displays()[2]);

            // assert
            expect(result).toBeFalsy();
        });
    });

    describe(".InitialSortable", function () {
        beforeEach(function () {
            $.fn.kendoSortable = $.noop;
            spyOn($.fn, 'kendoSortable');
        });
        it('should not init', function () {
            // prepare
            spyOn($.fn, 'data').and.returnValue({});
            displayOverviewHandler.InitialSortable();

            // assert
            expect($.fn.kendoSortable).not.toHaveBeenCalled();
        });
        it('should init', function () {
            // prepare
            spyOn($.fn, 'data').and.returnValue(null);
            displayOverviewHandler.InitialSortable();

            // assert
            expect($.fn.kendoSortable).toHaveBeenCalled();
        });
    });

    describe(".Sortable", function () {
        it('should be able to sort', function () {
            // prepare
            var display = {
                CanUpdateOrder: function () { return true; }
            };
            var result = displayOverviewHandler.Sortable(display);

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".CreateSortableHint", function () {
        it('should get hint', function () {
            // prepare
            var result = displayOverviewHandler.CreateSortableHint($('<div/>'));

            // assert
            expect(result.attr('class')).toEqual('tab display-tab display-tab-hint');
            expect(result.children().attr('class')).toEqual('tab-menu-wrapper');
            expect(result.children().children().attr('class')).toEqual('active');
        });
    });

    describe(".CreateSortablePlaceholder", function () {
        it('should get placeholder', function () {
            // prepare
            var result = displayOverviewHandler.CreateSortablePlaceholder($('<div class="tab-menu active"/>'));

            // assert
            expect(result.attr('class')).toEqual('tab-menu tab-menu-placeholder');
        });
    });

    describe(".SortableStart", function () {
        var e;
        beforeEach(function () {
            e = {
                preventDefault: $.noop
            };
            spyOn(e, 'preventDefault');
            spyOn($.fn, 'addClass');
            displayOverviewHandler.Displays([{ Sortable: true }, { Sortable: true }]);
        });
        it('should not start (invalid)', function () {
            // prepare
            spyOn(displayOverviewHandler.AngleHandler, 'Validate').and.returnValue(false);
            displayOverviewHandler.SortableStart(e);

            // assert
            expect(e.preventDefault).toHaveBeenCalled();
            expect($.fn.addClass).not.toHaveBeenCalled();
        });
        it('should not start (1 sortable item)', function () {
            // prepare
            displayOverviewHandler.Displays()[0].Sortable = false;
            spyOn(displayOverviewHandler.AngleHandler, 'Validate').and.returnValue(false);
            displayOverviewHandler.SortableStart(e);

            // assert
            expect(e.preventDefault).toHaveBeenCalled();
            expect($.fn.addClass).not.toHaveBeenCalled();
        });
        it('should start', function () {
            // prepare
            spyOn(displayOverviewHandler.AngleHandler, 'Validate').and.returnValue(true);
            displayOverviewHandler.SortableStart(e);

            // assert
            expect(e.preventDefault).not.toHaveBeenCalled();
            expect($.fn.addClass).toHaveBeenCalledWith('sorting');
            expect(displayOverviewHandler.Group[DisplayOverviewHandler.DisplayGroup.MyPrivate].ForceClose()).toEqual(true);
            expect(displayOverviewHandler.Group[DisplayOverviewHandler.DisplayGroup.OtherPrivate].ForceClose()).toEqual(true);
        });
    });

    describe(".SortableMove", function () {
        it('should update arrow buttons', function () {
            // prepare
            spyOn(displayOverviewHandler, 'UpdateScrollButtonState');
            displayOverviewHandler.SortableMove();

            // assert
            expect(displayOverviewHandler.UpdateScrollButtonState).toHaveBeenCalled();
        });
    });

    describe(".SortableRestore", function () {
        it('should clear UI', function (done) {
            // prepare
            var e = {
                sender: {
                    draggable: {
                        options: {}
                    }
                }
            };
            spyOn($.fn, 'removeClass');
            spyOn(displayOverviewHandler, 'UpdateScrollButtonState');
            displayOverviewHandler.SortableRestore(e);

            // assert
            expect(displayOverviewHandler.Group[DisplayOverviewHandler.DisplayGroup.MyPrivate].ForceClose()).toEqual(false);
            expect(displayOverviewHandler.Group[DisplayOverviewHandler.DisplayGroup.OtherPrivate].ForceClose()).toEqual(false);
            setTimeout(function () {
                expect($.fn.removeClass).toHaveBeenCalledWith('sorting');
                expect(displayOverviewHandler.UpdateScrollButtonState).toHaveBeenCalled();
                done();
            }, 100);
        });
    });

    describe(".SortableChange", function () {
        beforeEach(function () {
            spyOn(displayOverviewHandler.AngleHandler, 'ConfirmSave');
        });
        it('should not save', function () {
            // prepare
            spyOn(displayOverviewHandler, 'GetDisplayOrdersData').and.returnValue([]);
            displayOverviewHandler.SortableChange();

            // assert
            expect(displayOverviewHandler.AngleHandler.ConfirmSave).not.toHaveBeenCalled();
        });
        it('should save', function () {
            // prepare
            spyOn(displayOverviewHandler, 'GetDisplayOrdersData').and.returnValue([{}]);
            displayOverviewHandler.SortableChange();

            // assert
            expect(displayOverviewHandler.AngleHandler.ConfirmSave).toHaveBeenCalled();
        });
    });

    describe(".GetDisplayOrdersData", function () {
        beforeEach(function () {
            $('<div id="DisplayTabs"/>')
                .append('<div class="tab-menu" />')
                .append('<div class="tab-menu" />')
                .append('<div class="tab-menu" />')
                .append('<div class="tab-menu" />')
                .append('<div class="tab-menu" />')
                .append('<div class="tab-menu" />')
                .append('<div class="tab-menu" />')
                .appendTo('body');
        });
        afterEach(function () {
            $('#DisplayTabs').remove();
        });
        it('should get data', function () {
            // prepare
            spyOn(ko, 'dataFor').and.returnValues(
                null,                                       // no: no model data
                { Sortable: false, Uri: '/displays/1' },    // no: cannot sort
                { Sortable: true, Uri: '/displays/2' },     // yes: no Display data, order=1
                { Sortable: true, Uri: '/displays/3' },     // no: no changes
                { Sortable: true, Uri: '/displays/4' },     // yes: has changed, order=3
                { Sortable: true, Uri: '/displays/5' });    // yes: has changed, order=4
            spyOn(displayOverviewHandler.AngleHandler, 'GetRawDisplay').and.callFake(function (uri) {
                var displays = {
                    '/displays/1': {},
                    '/displays/3': { order: 2 },
                    '/displays/4': { order: 0 },
                    '/displays/5': {}
                };
                return displays[uri];
            });
            var results = displayOverviewHandler.GetDisplayOrdersData();

            // assert
            expect(results).toEqual([
                { uri: '/displays/2', order: 1 },
                { uri: '/displays/4', order: 3 },
                { uri: '/displays/5', order: 4 }
            ]);
        });
    });

    describe(".SaveOrders", function () {
        it('should save', function () {
            // prepare
            spyOn(displayOverviewHandler.AngleHandler, 'SaveOrders').and.returnValue($.when());
            spyOn(progressbarModel, 'ShowStartProgressBar');
            spyOn(progressbarModel, 'SetDisableProgressBar');
            spyOn(progressbarModel, 'EndProgressBar');
            spyOn(displayOverviewHandler, 'SaveOrdersDone');
            displayOverviewHandler.SaveOrders();

            // assert
            expect(displayOverviewHandler.AngleHandler.SaveOrders).toHaveBeenCalled();
            expect(progressbarModel.ShowStartProgressBar).toHaveBeenCalled();
            expect(progressbarModel.SetDisableProgressBar).toHaveBeenCalled();
            expect(progressbarModel.EndProgressBar).toHaveBeenCalled();
            expect(displayOverviewHandler.SaveOrdersDone).toHaveBeenCalled();
        });
    });

    describe(".SaveOrdersCancel", function () {
        it('should restore the ordering', function () {
            // prepare
            spyOn(displayOverviewHandler, 'Displays');
            displayOverviewHandler.SaveOrdersCancel();

            // assert
            expect(displayOverviewHandler.Displays).toHaveBeenCalled();
        });
    });

    describe(".SaveOrdersFail", function () {
        it('should restore the ordering', function () {
            // prepare
            spyOn(displayOverviewHandler, 'Displays');
            displayOverviewHandler.SaveOrdersFail();

            // assert
            expect(displayOverviewHandler.Displays).toHaveBeenCalled();
        });
    });

    describe(".SaveOrdersDone", function () {
        it('should show notifiaction and update data', function () {
            // prepare
            displayOverviewHandler.Displays([{ IsSelected: true }]);
            spyOn(toast, 'MakeSuccessTextFormatting');
            spyOn(displayOverviewHandler, 'SetData');
            displayOverviewHandler.SaveOrdersDone();

            // assert);
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
            expect(displayOverviewHandler.SetData).toHaveBeenCalled();
        });
    });

    describe(".Show", function () {
        beforeEach(function () {
            spyOn(jQuery, 'clickOutside');
            spyOn(jQuery.fn, 'off').and.returnValue($());
            spyOn(jQuery.fn, 'on').and.returnValue($());
            spyOn(jQuery.fn, 'offset').and.returnValue($());
            spyOn(jQuery.fn, 'outerHeight').and.returnValues(20, 100);
            spyOn(jQuery.fn, 'scrollTop');
            spyOn(displayOverviewHandler, 'GetHtml').and.returnValue('');
        });
        it('should not scroll if an active item is visible', function () {
            // prepare
            spyOn(jQuery.fn, 'prevAll').and.returnValue([$(), $(), $()]);
            displayOverviewHandler.Show();

            // assert
            expect(jQuery.fn.off).toHaveBeenCalledTimes(2);
            expect(jQuery.fn.on).toHaveBeenCalledTimes(2);
            expect(jQuery.fn.scrollTop).not.toHaveBeenCalled();
            expect(jQuery.clickOutside).toHaveBeenCalled();
        });
        it('should scroll if an active item is not visible', function () {
            // prepare
            spyOn(jQuery.fn, 'prevAll').and.returnValue([$(), $(), $(), $(), $(), $(), $(), $(), $()]);
            displayOverviewHandler.Show();

            // assert
            expect(jQuery.fn.on).toHaveBeenCalledTimes(2);
            expect(jQuery.fn.scrollTop).toHaveBeenCalled();
            expect(jQuery.clickOutside).toHaveBeenCalled();
        });
    });

    describe(".Close", function () {
        it('should close a popup', function () {
            // prepare
            spyOn($.fn, 'hide');
            displayOverviewHandler.Close();

            // assert
            expect($.fn.hide).toHaveBeenCalled();
        });
    });

    describe(".OnSelect", function () {
        it('should switch Display', function () {
            // prepare
            spyOn(displayOverviewHandler, 'SwitchDisplay');
            displayOverviewHandler.OnSelect({ currentTarget: $() });

            // assert
            expect(displayOverviewHandler.SwitchDisplay).toHaveBeenCalled();
        });
    });

    describe(".OnDelete", function () {
        it('should prevent calling from parent then delete Display', function () {
            // prepare
            var e = { currentTarget: $(), stopPropagation: $.noop };
            spyOn(e, 'stopPropagation');
            spyOn(displayOverviewHandler, 'DeleteDisplay');
            spyOn(displayOverviewHandler, 'Close');
            displayOverviewHandler.OnDelete(e);

            // assert
            expect(e.stopPropagation).toHaveBeenCalled();
            expect(displayOverviewHandler.DeleteDisplay).toHaveBeenCalled();
            expect(displayOverviewHandler.Close).toHaveBeenCalled();
        });
    });

    describe(".GetHtml", function () {
        it('should get html', function () {
            // prepare
            spyOn(kendo, 'template').and.returnValue($.noop);
            var result = displayOverviewHandler.GetHtml([{}]);

            // assert
            expect(result).toContain('display-listview');
        });
    });

    describe(".MoveLeft", function () {
        it('should not move', function () {
            // prepare
            var e = { currentTarget: $('<div class="disabled"/>') };
            spyOn(displayOverviewHandler, 'ScrollLeft');
            displayOverviewHandler.MoveLeft(null, e);

            // assert
            expect(displayOverviewHandler.ScrollLeft).not.toHaveBeenCalled();
        });
        it('should move', function () {
            // prepare
            var e = { currentTarget: $('<div/>') };
            spyOn(displayOverviewHandler, 'ScrollLeft');
            displayOverviewHandler.MoveLeft(null, e);

            // assert
            expect(displayOverviewHandler.ScrollLeft).toHaveBeenCalled();
        });
    });

    describe(".MoveRight", function () {
        it('should not move', function () {
            // prepare
            var e = { currentTarget: $('<div class="disabled"/>') };
            spyOn(displayOverviewHandler, 'ScrollRight');
            displayOverviewHandler.MoveRight(null, e);

            // assert
            expect(displayOverviewHandler.ScrollRight).not.toHaveBeenCalled();
        });
        it('should move', function () {
            // prepare
            var e = { currentTarget: $('<div/>') };
            spyOn(displayOverviewHandler, 'ScrollRight');
            displayOverviewHandler.MoveRight(null, e);

            // assert
            expect(displayOverviewHandler.ScrollRight).toHaveBeenCalled();
        });
    });

    describe(".ShowNewDisplay", function () {
        it('should show new display', function () {
            // prepare
            spyOn(jQuery, 'clickOutside');
            spyOn(jQuery.fn, 'off').and.returnValue($());
            spyOn(jQuery.fn, 'on').and.returnValue($());
            spyOn(displayOverviewHandler, 'GetNewDisplayHtml').and.returnValue('');

            displayOverviewHandler.ShowNewDisplay();

            // assert
            expect(jQuery.fn.off).toHaveBeenCalledTimes(1);
            expect(jQuery.fn.on).toHaveBeenCalledTimes(1);
            expect(jQuery.clickOutside).toHaveBeenCalled();
        });
    });

    describe(".CloseNewDisplay", function () {
        it('should close a new display popup', function () {
            // prepare
            spyOn($.fn, 'hide');
            displayOverviewHandler.CloseNewDisplay();

            // assert
            expect($.fn.hide).toHaveBeenCalled();
        });
    });

    describe(".OnSelectNewDisplay", function () {
        it('should setup when selected new display', function () {
            // prepare
            spyOn(jQuery, 'GUID').and.returnValue('1234567890');
            spyOn(displayModel, 'GetAdhocDisplayName');
            spyOn(userSettingModel, 'GetByName').and.returnValue('');
            spyOn(displayOverviewHandler.ItemDescriptionHandler, 'CanEditId');
            spyOn(displayOverviewHandler.ItemDescriptionHandler, 'Initial');
            spyOn(displayOverviewHandler.ItemDescriptionHandler, 'SetReadOnly');
            spyOn(displayOverviewHandler.ItemDescriptionHandler, 'ShowEditPopup');
            spyOn(displayOverviewHandler, 'CloseNewDisplay');

            displayOverviewHandler.OnSelectNewDisplay({ currentTarget: $() });

            // assert
            expect(displayOverviewHandler.ItemDescriptionHandler.CanEditId).toHaveBeenCalled();
            expect(displayOverviewHandler.ItemDescriptionHandler.Initial).toHaveBeenCalled();
            expect(displayOverviewHandler.ItemDescriptionHandler.SetReadOnly).toHaveBeenCalled();
            expect(displayOverviewHandler.ItemDescriptionHandler.ShowEditPopup).toHaveBeenCalled();
            expect(displayOverviewHandler.CloseNewDisplay).toHaveBeenCalled();
        });
    });

    describe(".SaveNewDisplay", function () {
        var displayHandler;
        beforeEach(function () {
            displayHandler = new DisplayHandler({}, displayOverviewHandler.AngleHandler);
            spyOn(displayHandler, 'CreateNew');
            spyOn(displayHandler, 'GetData').and.returnValue({});
            spyOn(displayOverviewHandler.ItemDescriptionHandler, 'ShowProgressbar');
            spyOn(displayOverviewHandler, 'CreateNewDisplayDone');
            spyOn(displayOverviewHandler, 'CreateNewDisplayFail');
        });
        it('should fail', function () {
            // prepare
            spyOn(displayOverviewHandler, 'GetCreateDisplayData').and.returnValue($.Deferred().reject().promise());
            spyOn(displayOverviewHandler.AngleHandler, 'IsAdhoc').and.returnValue(true);
            displayOverviewHandler.SaveNewDisplay('displayType');

            // assert
            expect(displayOverviewHandler.GetCreateDisplayData).toHaveBeenCalled();
            expect(displayOverviewHandler.ItemDescriptionHandler.ShowProgressbar).toHaveBeenCalled();
            expect(displayOverviewHandler.CreateNewDisplayDone).not.toHaveBeenCalled();
            expect(displayOverviewHandler.CreateNewDisplayFail).toHaveBeenCalled();
        });
        it('should save new display as ad-hoc', function () {
            // prepare
            spyOn(displayOverviewHandler, 'GetCreateDisplayData').and.returnValue($.when(displayHandler));
            spyOn(displayOverviewHandler.AngleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(displayOverviewHandler.AngleHandler, 'GetData').and.returnValue({});
            spyOn(displayModel, 'GetDefaultAdhocAuthorization');

            displayOverviewHandler.SaveNewDisplay('displayType');

            // assert
            expect(displayOverviewHandler.GetCreateDisplayData).toHaveBeenCalled();
            expect(displayOverviewHandler.ItemDescriptionHandler.ShowProgressbar).toHaveBeenCalled();
            expect(displayOverviewHandler.CreateNewDisplayDone).toHaveBeenCalled();
            expect(displayOverviewHandler.CreateNewDisplayFail).not.toHaveBeenCalled();
            expect(displayModel.GetDefaultAdhocAuthorization).toHaveBeenCalled();
        });
        it('should save new display', function () {
            // prepare
            spyOn(displayOverviewHandler, 'GetCreateDisplayData').and.returnValue($.when(displayHandler));
            spyOn(displayOverviewHandler.AngleHandler, 'IsAdhoc').and.returnValue(false);
            displayOverviewHandler.SaveNewDisplay('displayType');

            // assert
            expect(displayOverviewHandler.GetCreateDisplayData).toHaveBeenCalled();
            expect(displayOverviewHandler.ItemDescriptionHandler.ShowProgressbar).toHaveBeenCalled();
            expect(displayOverviewHandler.AngleHandler.IsAdhoc).toHaveBeenCalled();
            expect(displayOverviewHandler.CreateNewDisplayDone).not.toHaveBeenCalled();
            expect(displayOverviewHandler.CreateNewDisplayFail).not.toHaveBeenCalled();
        });
    });

    describe(".GetCreateDisplayData", function () {
        var displayHandler;
        beforeEach(function () {
            displayHandler = {
                CreateAdhocResultData: $.noop,
                Data: ko.observable({ fields: 'my-old-fields' })
            };
            spyOn(displayModel, 'GenerateDefaultData');
            spyOn(displayModel, 'GetDefaultListFields').and.returnValue($.when('my-fields'));
            spyOn(displayOverviewHandler.ItemDescriptionHandler, 'GetData');
            spyOn(window, 'DisplayHandler').and.returnValue(displayHandler);
        });
        it('should get data for list', function () {
            // prepare

            displayOverviewHandler.GetCreateDisplayData('list');

            // assert
            expect(displayHandler.Data().fields).toEqual('my-fields');
        });
        it('should get data for others', function () {
            // prepare
            displayOverviewHandler.GetCreateDisplayData('not-list');

            // assert
            expect(displayHandler.Data().fields).toEqual('my-old-fields');
        });
    });

    describe(".CreateNewDisplayFail", function () {
        it('should hide progress bar', function () {
            // prepare
            spyOn(displayOverviewHandler.ItemDescriptionHandler, 'HideProgressbar');
            displayOverviewHandler.CreateNewDisplayFail();

            // assert
            expect(displayOverviewHandler.ItemDescriptionHandler.HideProgressbar).toHaveBeenCalled();
        });
    });

    describe(".CreateNewDisplayDone", function () {
        it('should create new display and redirect to display page when it is not adhoc display', function () {
            // prepare
            spyOn(toast, 'MakeSuccessTextFormatting');
            spyOn(displayOverviewHandler, 'Redirect');
            spyOn(displayOverviewHandler.AngleHandler, 'GetDisplay').and.returnValue(new DisplayHandler({}, displayOverviewHandler.AngleHandler));
            displayOverviewHandler.CreateNewDisplayDone({ id: '123', uri: '', is_adhoc: false });

            // assert
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
            expect(displayOverviewHandler.Redirect).toHaveBeenCalled();
        });

        it('should create new display, store display and redirect to display page when it is adhoc display', function () {
            // prepare
            spyOn(displayModel, 'SetTemporaryDisplay');
            spyOn(displayOverviewHandler, 'Redirect');
            displayOverviewHandler.CreateNewDisplayDone({ id: '123', uri: '', is_adhoc: true });

            // assert
            expect(displayModel.SetTemporaryDisplay).toHaveBeenCalled();
            expect(displayOverviewHandler.Redirect).toHaveBeenCalled();
        });
    });

    describe(".GetNewDisplayHtml", function () {
        it('should get new display html', function () {
            // prepare
            spyOn(kendo, 'template').and.returnValue($.noop);
            var result = displayOverviewHandler.GetNewDisplayHtml();

            // assert
            expect(result).toContain('display-listview');
        });
    });

    describe(".CanKeepFilter", function () {
        it('should return false when angle is in edit mode', function () {
            // prepare
            spyOn(displayOverviewHandler, 'IsEditMode').and.returnValue(true);
            var result = displayOverviewHandler.CanKeepFilter();

            // assert
            expect(result).toEqual(false);
        });

        it('should return true when angle is not in edit mode and display has no jump', function () {
            // prepare
            spyOn(displayOverviewHandler, 'IsEditMode').and.returnValue(false);
            spyOn(displayOverviewHandler, 'Displays').and.returnValue([{ display: 'display1' }]);
            spyOn(displayOverviewHandler.AngleHandler, 'AllowMoreDetails').and.returnValue(true);
            spyOn(displayOverviewHandler.AngleHandler, 'GetCurrentDisplay').and.returnValue({
                IsAdhoc: function () {
                    return true;
                },
                QueryDefinitionHandler: {
                    GetFilters: function () {
                        return [{ filter: 'filter1' }];
                    },
                    GetJumps: function () {
                        return [];
                    }
                }
            });
            var result = displayOverviewHandler.CanKeepFilter();

            // assert
            expect(result).toEqual(true);
        });

        it('should return false when angle is not in edit mode and has allow more details', function () {
            // prepare
            spyOn(displayOverviewHandler, 'IsEditMode').and.returnValue(false);
            spyOn(displayOverviewHandler, 'Displays').and.returnValue([{ display: 'display1' }]);
            spyOn(displayOverviewHandler.AngleHandler, 'AllowMoreDetails').and.returnValue(false);
            spyOn(displayOverviewHandler.AngleHandler, 'GetCurrentDisplay').and.returnValue({
                IsAdhoc: function () {
                    return true;
                },
                QueryDefinitionHandler: {
                    GetFilters: function () {
                        return [{ filter: 'filter1' }];
                    },
                    GetJumps: function () {
                        return [];
                    }
                }
            });
            var result = displayOverviewHandler.CanKeepFilter();

            // assert
            expect(result).toEqual(false);
        });

        it('should return false when angle is not in edit mode and has no display', function () {
            // prepare
            spyOn(displayOverviewHandler, 'IsEditMode').and.returnValue(false);
            spyOn(displayOverviewHandler, 'Displays').and.returnValue([]);
            spyOn(displayOverviewHandler.AngleHandler, 'AllowMoreDetails').and.returnValue(true);
            spyOn(displayOverviewHandler.AngleHandler, 'GetCurrentDisplay').and.returnValue({
                IsAdhoc: function () {
                    return true;
                },
                QueryDefinitionHandler: {
                    GetFilters: function () {
                        return [{ filter: 'filter1' }];
                    },
                    GetJumps: function () {
                        return [];
                    }
                }
            });
            var result = displayOverviewHandler.CanKeepFilter();

            // assert
            expect(!!result).toEqual(false);
        });

        it('should return false when angle is not in edit mode and display has jump', function () {
            // prepare
            spyOn(displayOverviewHandler, 'IsEditMode').and.returnValue(false);
            spyOn(displayOverviewHandler, 'Displays').and.returnValue([{ display: 'display1' }]);
            spyOn(displayOverviewHandler.AngleHandler, 'AllowMoreDetails').and.returnValue(true);
            spyOn(displayOverviewHandler.AngleHandler, 'GetCurrentDisplay').and.returnValue({
                IsAdhoc: function () {
                    return true;
                },
                QueryDefinitionHandler: {
                    GetFilters: function () {
                        return [{ filter: 'filter1' }];
                    },
                    GetJumps: function () {
                        return [{ jump: 'jump1' }];
                    }
                }
            });
            var result = displayOverviewHandler.CanKeepFilter();

            // assert
            expect(result).toEqual(false);
        });

    });

    describe(".IsEditMode", function () {
        var tests = [
            {
                title: 'should return false when uri angle is not in edit mode',
                editMode: false,
                expected: false
            },
            {
                title: 'should return true when uri angle is in edit mode',
                editMode: true,
                expected: true
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                spyOn(WC.Utility, 'UrlParameter').and.returnValue(test.editMode);
                var result = displayOverviewHandler.IsEditMode();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".UpdateExecutionInfo", function () {
        it('should update execution info', function () {
            // prepare
            var display = new DisplayHandler({}, displayOverviewHandler.AngleHandler);
            spyOn(display, 'GetResultExecution').and.returnValue('my-execution-info');
            spyOn(displayOverviewHandler.AngleHandler, 'GetCurrentDisplay').and.returnValue(display);
            displayOverviewHandler.UpdateExecutionInfo();

            // assert
            expect(displayOverviewHandler.ExecutionInfo()).toContain('my-execution-info');
        });
    });
});