/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.MultiSelect.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelLabelCategoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />

describe("ItemStateHandler", function () {

    var itemStateHandler;
    beforeEach(function () {
        itemStateHandler = new ItemStateHandler();
    });

    describe(".ShowPublishSettingsPopup", function () {
        beforeEach(function () {
            itemStateHandler.CheckShowingPublishSettingsPopup = function (callback) {
                callback();
            };
            spyOn(itemStateHandler, 'GetPublishSettingsPopupOptions');
            spyOn(popup, 'Show');
        });
        it('should show poup', function () {
            spyOn(popup, 'CanButtonExecute').and.returnValue(true);
            itemStateHandler.ShowPublishSettingsPopup(null, {});

            // assert
            expect(popup.Show).toHaveBeenCalled();
        });
        
        it('should not show poup', function () {
            spyOn(popup, 'CanButtonExecute').and.returnValue(false);
            itemStateHandler.ShowPublishSettingsPopup(null, {});

            // assert
            expect(popup.Show).not.toHaveBeenCalled();
        });
    });

    describe(".GetPublishSettingsPopupOptions", function () {
        it('should get publishing settings popup options', function () {
            var event = {
                currentTarget: { id: 'test' }
            };
            var result = itemStateHandler.GetPublishSettingsPopupOptions(event);

            // assert
            expect(result.width).toEqual(350);
        });
    });

    describe(".ShowPublishSettingsCallback", function () {
        it('should load data and apply handler', function () {
            var e = {
                sender: { element: $() }
            };
            spyOn($.fn, 'off').and.returnValue($());
            spyOn($.fn, 'on').and.returnValue($());
            spyOn($.fn, 'busyIndicator');
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            spyOn(itemStateHandler, 'ReloadPublishingSettingsData');
            spyOn(itemStateHandler, 'GetPublishSettingsResources').and.returnValue($.when());
            spyOn(itemStateHandler, 'CheckUpdatedPublishSettingsData');
            itemStateHandler.ShowPublishSettingsCallback(e);

            // assert
            expect($.fn.off).toHaveBeenCalledWith('click');
            expect($.fn.on).toHaveBeenCalledWith('click', itemStateHandler.ClosePublishSettingsPopup);
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
            expect($.fn.busyIndicator).toHaveBeenCalledTimes(2);
            expect(itemStateHandler.ReloadPublishingSettingsData).toHaveBeenCalledTimes(2);
            expect(itemStateHandler.GetPublishSettingsResources).toHaveBeenCalled();
            expect(itemStateHandler.CheckUpdatedPublishSettingsData).toHaveBeenCalled();
        });
    });

    describe(".ClosePublishSettingsPopup", function () {
        it("should close popup", function () {
            spyOn(popup, 'Close');
            itemStateHandler.ClosePublishSettingsPopup();
            expect(popup.Close).toHaveBeenCalled();
        });

    });

    describe(".ReloadPublishingSettingsData", function () {
        beforeEach(function () {
            spyOn(itemStateHandler, 'SetPublishSettingsSummary').and.callFake($.noop);
            spyOn(itemStateHandler, 'GetLabelsData').and.returnValue([]);
            spyOn(itemStateHandler, 'GetPublishSettingsData').and.returnValue({});
        });

        it('should not call some functions if no data', function () {
            itemStateHandler.ReloadPublishingSettingsData(false);

            // assert
            expect(itemStateHandler.SetPublishSettingsSummary).toHaveBeenCalled();
            expect(itemStateHandler.GetLabelsData).not.toHaveBeenCalled();
            expect(itemStateHandler.GetPublishSettingsData).not.toHaveBeenCalled();
        });

        it('should call all functions if has data', function () {
            itemStateHandler.ReloadPublishingSettingsData(true);

            // assert
            expect(itemStateHandler.SetPublishSettingsSummary).toHaveBeenCalled();
            expect(itemStateHandler.GetLabelsData).toHaveBeenCalled();
            expect(itemStateHandler.GetPublishSettingsData).toHaveBeenCalled();
        });
    });

    describe(".SetPublishSettingsSummary", function () {
        it('should set publishing summary', function () {
            itemStateHandler.Languages(['English', 'Thai']);
            itemStateHandler.Data.assigned_labels = ['bp1', 'bp2', 'lb1', 'lb2', 'lb3', 'lb4', 'xxx'];
            businessProcessesModel.General.Data([
                { id: 'bp1', abbreviation: 'BP 1' },
                { id: 'bp2' }
            ]);
            spyOn(modelLabelCategoryHandler, 'GetLabelById').and.callFake(function (id) {
                var mock = {
                    'lb1': { id: 'lb1', name: 'Label 1', category: '/categories/1' },
                    'lb2': { id: 'lb2', category: '/categories/1' },
                    'lb3': { id: 'lb3', name: 'Label 3', category: '/categories/1' },
                    'lb4': { id: 'lb4', name: 'Label 4', category: '/categories/2' }
                };
                return mock[id];
            });
            spyOn(modelLabelCategoryHandler, 'GetLabelCategoryByUri').and.callFake(function (category) {
                var mock = {
                    '/categories/1': { used_for_authorization: true },
                    '/categories/2': { used_for_authorization: false }
                };
                return mock[category];
            });
            itemStateHandler.SetPublishSettingsSummary();

            // assert
            expect(itemStateHandler.Summary.language_text()).toEqual('Languages: 2 (English, Thai)');
            expect(itemStateHandler.Summary.bp_text()).toEqual('Business Processes: 2 (BP 1, bp2)');
            expect(itemStateHandler.Summary.privilege_label_text()).toEqual('Privilege labels: 3');
            expect(itemStateHandler.Summary.search_label_text()).toEqual('Search labels: 1');
        });
    });

    describe(".GetLabelsData", function () {
        it('should get labels data', function () {
            spyOn(modelLabelCategoryHandler, 'GetLabelCategoriesByModel').and.returnValue([
                { contains_businessprocesses: true },
                { contains_businessprocesses: false, used_for_authorization: true },
                { contains_businessprocesses: false, used_for_authorization: true },
                { contains_businessprocesses: false, used_for_authorization: false },
                { contains_businessprocesses: false, used_for_authorization: false },
                { contains_businessprocesses: false, used_for_authorization: false }
            ]);
            spyOn(itemStateHandler, 'GetLabelGroupCategoryData').and.returnValue([]);

            // act
            var results = itemStateHandler.GetLabelsData($());

            // assert
            expect(results.length).toEqual(2);
            expect(results[0].categories.length).toEqual(2);
            expect(results[1].categories.length).toEqual(3);
        });
    });

    describe(".GetLabelGroupCategoryData", function () {
        var tests = [
            {
                title: 'should skip if invalid label',
                used_for_authorization: true,
                is_valid: false,
                expected: { count: 0 }
            },
            {
                title: 'should set correct label privilege if used_for_authorization = true',
                used_for_authorization: true,
                is_valid: true,
                expected: { count: 1, privilege: 'for-privilege' }
            },
            {
                title: 'should set correct label privilege if used_for_authorization = false',
                used_for_authorization: false,
                is_valid: false,
                expected: { count: 1, privilege: 'validate' }
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(modelLabelCategoryHandler, 'GetLabelsByCategoryUri').and.returnValue([{}]);
                spyOn(privilegesViewModel, 'IsValidLabelAuthorizeModel').and.returnValue(test.is_valid);
                spyOn(privilegesViewModel, 'GetLabelAuthorization').and.returnValue('for-privilege');
                var category = {
                    used_for_authorization: test.used_for_authorization
                };

                // act
                var results = itemStateHandler.GetLabelGroupCategoryData(category);

                // assert
                expect(results.length).toEqual(test.expected.count);
                if (test.expected.count > 0) {
                    expect(results[0].privilege).toEqual(test.expected.privilege);
                }
            });
        });
    });

    describe(".RenderLabelSelection", function () {
        it("should create UI then update counting", function () {
            spyOn(WC.HtmlHelper, 'MultiSelect');
            spyOn(itemStateHandler, 'UpdateLabelGroupCount');
            itemStateHandler.RenderLabelSelection($(), $(), {});

            expect(WC.HtmlHelper.MultiSelect).toHaveBeenCalled();
            expect(itemStateHandler.UpdateLabelGroupCount).toHaveBeenCalled();
        });
    });

    describe(".LabelSelectionChange", function () {
        it("should update counting and check validation", function () {
            spyOn(itemStateHandler, 'UpdateLabelGroupCount');
            spyOn(itemStateHandler, 'CheckSavePublishSettings');
            spyOn(itemStateHandler, 'LabelChange');
            itemStateHandler.LabelSelectionChange($(), null, {}, $());

            expect(itemStateHandler.UpdateLabelGroupCount).toHaveBeenCalled();
            expect(itemStateHandler.CheckSavePublishSettings).toHaveBeenCalled();
            expect(itemStateHandler.LabelChange).toHaveBeenCalled();
        });
    });

    describe(".UpdateLabelGroupCount", function () {
        it("should update count from UI", function () {
            var groupItem = { count: ko.observable(2) };
            spyOn(ko, 'dataFor').and.returnValue(groupItem);
            spyOn($.fn, 'find').and.returnValue($('<div/><div/><div/>'));
            spyOn($.fn, 'data').and.returnValues(
                null,
                { value: ko.observableArray(['a']) },
                { value: ko.observableArray(['b', 'c']) }
            );
            itemStateHandler.UpdateLabelGroupCount($());

            expect(groupItem.count()).toEqual(3);
        });
    });

    describe(".RenderLabelHtml", function () {
        var element;
        beforeEach(function () {
            element = $('<div><span></span></div>');
        });

        var tests = [
            {
                title: 'should set icon to element',
                has_warning: true,
                expected: 1
            },
            {
                title: 'should not set icon to element',
                has_warning: false,
                expected: 0
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(itemStateHandler, 'IsLabelHaveWarning').and.returnValue(test.has_warning);
                itemStateHandler.RenderLabelHtml(null, {}, element);
                expect(element.children('.btn-warning').length).toEqual(test.expected);
            });
        });
    });

    describe(".IsLabelHaveWarning", function () {
        var tests = [
            {
                title: 'should have a warning',
                privilege: 'view',
                is_published: true,
                expected: true
            },
            {
                title: 'should not have a warning if is_published = false',
                privilege: 'view',
                is_published: false,
                expected: false
            },
            {
                title: 'should not have a warning if privilege != view',
                privilege: 'any',
                is_published: true,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                var result = itemStateHandler.IsLabelHaveWarning(test.privilege, test.is_published);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".GetPublishSettingsResources", function () {
        it("should load data", function () {
            spyOn($, 'whenAll').and.returnValue($.when());
            spyOn(modelsHandler, 'GetModelByUri').and.returnValue({});
            spyOn(modelsHandler, 'LoadModelInfo').and.returnValue($.when({}));
            itemStateHandler.GetPublishSettingsResources();

            expect(modelsHandler.LoadModelInfo).toHaveBeenCalled();
            expect($.whenAll).toHaveBeenCalled();
        });
    });

    describe(".GetAssignedLabels", function () {

        beforeEach(function () {
            itemStateHandler.Data.assigned_labels = ['P2P', 'O2C', 'UNKNOWN'];

            spyOn(businessProcessesModel.General, 'Data').and.callFake(function () {
                return [{ id: 'P2P' }, { id: 'S2D' }, { id: 'O2C' }];
            });

            jQuery('body')
                .append('<div id="popupPublishSettings"><input class="label-selection"></div>');

            spyOn(jQuery.fn, 'data').and.callFake(function (value) {
                if (value === 'MultiSelect') {
                    return {
                        value: function () { return ['HERO']; }
                    };
                }
            });
        });

        afterEach(function () {
            itemStateHandler.Data.assigned_labels = [];
            jQuery('#popupPublishSettings').remove();
        });

        it("should get assigned labels when called", function () {
            var result = itemStateHandler.GetAssignedLabels();
            expect(result.length).toEqual(3);
            expect(result[0]).toEqual('P2P');
            expect(result[1]).toEqual('O2C');
            expect(result[2]).toEqual('HERO');
        });

    });

    describe(".GetPublishSettingsData", function () {

        beforeEach(function () {
            spyOn(itemStateHandler, 'GetAssignedLabels').and.callFake(function () { return ['P2P', 'S2D']; });
        });

        it("should get published settings when called", function () {
            var result = itemStateHandler.GetPublishSettingsData();
            expect(result.assigned_labels.length).toEqual(2);
        });

    });

    describe(".GetUpdatedPublishSettingsData", function () {
        beforeEach(function () {
            itemStateHandler.InitialData = { pokemon: 'pikachu', allow_followups: true };
            spyOn(itemStateHandler, 'GetPublishSettingsData').and.callFake(function () {
                return {
                    assigned_labels: ['P2P', 'O2C'],
                    allow_followups: true,
                    allow_more_details: true,
                    display_definitions: [
                        { state: 'aa/bb', is_public: false },
                        { state: 'xx/yy', is_public: false }
                    ]
                };
            });
        });
        it("should get updated published setting when called", function () {
            var result = itemStateHandler.GetUpdatedPublishSettingsData();
            expect(result.assigned_labels.length).toEqual(2);
            expect(result.allow_followups).not.toBeDefined();
            expect(result.allow_more_details).toEqual(true);
            expect(result.display_definitions.length).toEqual(2);
            expect(result.pokemon).not.toBeDefined();
        });
    });

    describe(".CheckUpdatedPublishSettingsData", function () {
        beforeEach(function () {
            jQuery('body')
                .append('<div id="popupPublishSettings"><span class="save-validate-message"></span></div>');

            spyOn(itemStateHandler, 'GetUpdatedPublishSettingsData').and.callFake(function () {
                return { test: 'test' };
            });
        });
        afterEach(function () {
            jQuery('#popupPublishSettings').remove();
        });

        it("should be ok when item is unvalidated", function () {
            itemStateHandler.Data.is_validated(false);
            itemStateHandler.CheckUpdatedPublishSettingsData();
            expect(jQuery('#popupPublishSettings .save-validate-message').html()).toEqual('');
        });
        it("should show warning message when item is validated", function () {
            spyOn(itemStateHandler, 'GetUpdatedValidatedItemMessage').and.returnValue('warning message');
            itemStateHandler.Data.is_validated(true);
            itemStateHandler.CheckUpdatedPublishSettingsData();
            expect(jQuery('#popupPublishSettings .save-validate-message').html()).toEqual('warning message');
        });
    });

    describe(".GetUpdatedValidatedItemMessage", function () {
        it("should get empty message", function () {
            var result = itemStateHandler.GetUpdatedValidatedItemMessage();
            expect(result).toEqual('');
        });
    });

    describe(".CheckSavePublishSettings", function () {
        beforeEach(function () {
            $('body')
                .append('<div id="popupPublishSettings">'
                    + '<span class="group-message"></span>'
                    + '<input class="label-selection"/>'
                    + '<span class= "label-selection-message"></span>'
                    + '</div> ');
            itemStateHandler.Data.assigned_labels = ['P2P', 'O2C', 'UNKNOWN'];
            spyOn(businessProcessesModel.General, 'Data').and.returnValue([
                { id: 'P2P' },
                { id: 'S2D' },
                { id: 'O2C' }
            ]);
        });
        afterEach(function () {
            itemStateHandler.Data.assigned_labels = [];
            $('#popupPublishSettings').remove();
        });

        it("should be saved when item is private", function () {
            var isPublished = false;
            var result = itemStateHandler.CheckSavePublishSettings($('#popupPublishSettings'), isPublished);
            expect(result).toEqual(true);
            expect($('#popupPublishSettings .label-selection-message').text()).toEqual('');
            expect($('#popupPublishSettings .group-message').text()).toEqual('');
        });
        it("should be saved when no UI", function () {
            spyOn(jQuery.fn, 'data').and.returnValue(null);
            var isPublished = true;
            var result = itemStateHandler.CheckSavePublishSettings($('#popupPublishSettings'), isPublished);
            expect(result).toEqual(true);
            expect($('#popupPublishSettings .label-selection-message').text()).toEqual('');
            expect($('#popupPublishSettings .group-message').text()).toEqual('');
        });
        it("should be saved when label is no mandatory and no warning", function () {
            spyOn(ko, 'dataFor').and.returnValue({ is_required: false, used_for_authorization: false });
            spyOn(jQuery.fn, 'data').and.returnValue({
                items: function () {
                    return [
                        { privilege: {} }
                    ];
                }
            });
            spyOn(itemStateHandler, 'IsLabelHaveWarning').and.returnValue(false);
            spyOn(systemSettingHandler, 'GetMinLabelCategoryToPublish').and.returnValue(0);
            var isPublished = true;
            var result = itemStateHandler.CheckSavePublishSettings($('#popupPublishSettings'), isPublished);
            expect(result).toEqual(true);
            expect($('#popupPublishSettings .label-selection-message').text()).toEqual('');
            expect($('#popupPublishSettings .group-message').text()).toEqual('');
        });
        it("should be not saved when label is mandatory", function () {
            spyOn(ko, 'dataFor').and.returnValue({ is_required: true, name: 'label1' });
            spyOn(jQuery.fn, 'data').and.returnValue({
                items: function () {
                    return [];
                }
            });
            spyOn(jQuery.fn, 'is').and.returnValue(true);
            spyOn(itemStateHandler, 'IsLabelHaveWarning').and.returnValue(true);

            var isPublished = true;
            var result = itemStateHandler.CheckSavePublishSettings($('#popupPublishSettings'), isPublished);
            expect(result).toEqual(false);
            expect($('#popupPublishSettings .label-selection-message').text()).toEqual('Please assign labels');
            expect($('#popupPublishSettings .group-message').text()).toEqual('');
        });
        it("should be not saved when label has warning", function () {
            spyOn(ko, 'dataFor').and.returnValue({ is_required: false });
            spyOn(jQuery.fn, 'data').and.returnValue({
                items: function () {
                    return [
                        { privilege: {} }
                    ];
                }
            });
            spyOn(jQuery.fn, 'is').and.returnValue(true);
            spyOn(itemStateHandler, 'IsLabelHaveWarning').and.returnValue(true);
            
            var isPublished = true;
            var result = itemStateHandler.CheckSavePublishSettings($('#popupPublishSettings'), isPublished);
            expect(result).toEqual(false);
            expect($('#popupPublishSettings .label-selection-message').text()).toEqual('There are invalid labels');
            expect($('#popupPublishSettings .group-message').text()).toEqual('');
        });
        it("should be not saved when label has warning and uses for authorization", function () {
            spyOn(ko, 'dataFor').and.returnValue({ is_required: false, used_for_authorization: true });
            spyOn(jQuery.fn, 'data').and.returnValue({
                items: function () {
                    return [
                        { privilege: {} }
                    ];
                }
            });
            spyOn(itemStateHandler, 'IsLabelHaveWarning').and.returnValue(false);
            spyOn(systemSettingHandler, 'GetMinLabelCategoryToPublish').and.returnValue(99);

            var isPublished = true;
            var result = itemStateHandler.CheckSavePublishSettings($('#popupPublishSettings'), isPublished);
            expect(result).toEqual(false);
            expect($('#popupPublishSettings .label-selection-message').text()).toEqual('');
            expect(jQuery('#popupPublishSettings .group-message').text()).toEqual('You need to assign labels from at least 99 label categories before you can publish');
        });
    });

    describe(".CheckPublishItem", function () {
        it("should be true when publish settings is valid", function () {
            spyOn(itemStateHandler, 'CheckSavePublishSettings').and.returnValue(true);
            var result = itemStateHandler.CheckPublishItem();
            expect(result).toEqual(true);
        });
        it("should be false when publish settings is invalid", function () {
            spyOn(itemStateHandler, 'CheckSavePublishSettings').and.returnValue(false);
            var result = itemStateHandler.CheckPublishItem();
            expect(result).toEqual(false);
        });
    });

    describe(".ShowPublishingProgressbar", function () {
        it("should show progress bar", function () {
            var currentTarget = $('<div/>');
            spyOn($.fn, 'busyIndicator');
            itemStateHandler.ShowPublishingProgressbar(currentTarget);

            expect(currentTarget.hasClass('btn-busy')).toEqual(true);
            expect($.fn.busyIndicator).toHaveBeenCalledWith(true);
        });
    });

    describe(".HidePublishingProgressbar", function () {
        it("should show progress bar", function () {
            var currentTarget = $('<div class="btn-busy"/>');
            spyOn($.fn, 'busyIndicator');
            itemStateHandler.HidePublishingProgressbar(currentTarget);

            expect(currentTarget.hasClass('btn-busy')).toEqual(false);
            expect($.fn.busyIndicator).toHaveBeenCalledWith(false);
        });
    });

    describe(".CanUpdateItem", function () {
        it("should be possile to update item", function () {
            itemStateHandler.Data.authorizations({ update: true });
            var result = itemStateHandler.CanUpdateItem();
            expect(result).toEqual(true);
        });
        it("should not be possile to update item", function () {
            itemStateHandler.Data.authorizations({ update: false });
            var result = itemStateHandler.CanUpdateItem();
            expect(result).toEqual(false);
        });
    });

    describe(".CanPublishItem", function () {

        it("should be possile to publish item", function () {
            itemStateHandler.Data.authorizations({ publish: true });
            var result = itemStateHandler.CanPublishItem();
            expect(result).toEqual(true);
        });

        it("should not be possile to publish item", function () {
            itemStateHandler.Data.authorizations({ publish: false });
            var result = itemStateHandler.CanPublishItem();
            expect(result).toEqual(false);
        });

    });

    describe(".CanUnpublishItem", function () {

        it("should be possile to unpublish item", function () {
            itemStateHandler.Data.authorizations({ unpublish: true });
            var result = itemStateHandler.CanUnpublishItem();
            expect(result).toEqual(true);
        });

        it("should not be possile to unpublish item", function () {
            itemStateHandler.Data.authorizations({ unpublish: false });
            var result = itemStateHandler.CanUnpublishItem();
            expect(result).toEqual(false);
        });

    });

    describe(".CanUserManagePrivateItem", function () {

        it("should be possile to manage item if has a privilege", function () {
            spyOn(privilegesViewModel, 'IsAllowManagePrivateItems').and.returnValue(true);
            spyOn(userModel, 'Data').and.returnValue({ uri: 'any' });
            itemStateHandler.Data.created = { user: 'users/1' };
            var result = itemStateHandler.CanUserManagePrivateItem();
            expect(result).toEqual(true);
        });

        it("should be possile to manage item for owner", function () {
            spyOn(privilegesViewModel, 'IsAllowManagePrivateItems').and.returnValue(false);
            spyOn(userModel, 'Data').and.returnValue({ uri: 'users/1' });
            itemStateHandler.Data.created = { user: 'users/1' };
            var result = itemStateHandler.CanUserManagePrivateItem();
            expect(result).toEqual(true);
        });

        it("should not be possile to manage item", function () {
            spyOn(privilegesViewModel, 'IsAllowManagePrivateItems').and.returnValue(false);
            spyOn(userModel, 'Data').and.returnValue({ uri: 'any' });
            itemStateHandler.Data.created = { user: 'users/1' };
            var result = itemStateHandler.CanUserManagePrivateItem();
            expect(result).toEqual(false);
        });

    });

});