function DisplayOverviewHandler(angleHandler) {
    "use strict";

    var self = this;
    self.Displays = ko.observableArray([]);
    self.CanSwitchDisplay = ko.observable(false);
    self.CanCreateNewDisplay = ko.observable(false);
    self.ItemDescriptionHandler = new ItemDescriptionHandler();
    self.AngleHandler = angleHandler;
    self.Group = {};
    self.Group[DisplayOverviewHandler.DisplayGroup.Public] = {
        Header: Localization.DisplayGroupPublic,
        Visible: ko.observable(false),
        ForceClose: ko.observable(false),
        Key: enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_GROUP_PUBLIC
    };
    self.Group[DisplayOverviewHandler.DisplayGroup.MyPrivate] = {
        Header: Localization.DisplayGroupPrivate,
        Visible: ko.observable(false),
        ForceClose: ko.observable(false),
        Key: enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_GROUP_PRIVATE
    };
    self.Group[DisplayOverviewHandler.DisplayGroup.OtherPrivate] = {
        Header: Localization.DisplayGroupOther,
        Visible: ko.observable(false),
        ForceClose: ko.observable(false),
        Key: enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_GROUP_OTHER
    };
    self.KeepFilter = ko.observable(false);
    self.IsVisibleKeepFilter = ko.observable(false);
    self.ExecutionInfo = ko.observable('');

    // interface
    self.CreateNewDisplay = jQuery.noop;
    self.DeleteDisplay = jQuery.noop;
    self.ShowEditDescriptionPopup = jQuery.noop;
    self.SwitchDisplay = jQuery.noop;
    self.Redirect = jQuery.noop;

    // implement
    self.Initial = function () {
        var initialVisibility = function (setting) {
            setting.Visible(userSettingModel.DisplayGroupSettingsData[setting.Key]);
        };
        userSettingModel.InitialDisplayGroupSettingsData();
        initialVisibility(self.Group[DisplayOverviewHandler.DisplayGroup.Public]);
        initialVisibility(self.Group[DisplayOverviewHandler.DisplayGroup.MyPrivate]);
        initialVisibility(self.Group[DisplayOverviewHandler.DisplayGroup.OtherPrivate]);

        self.InitialSortable();
        WC.HtmlHelper.ApplyKnockout(self, jQuery('#DisplayTabs'));
        WC.HtmlHelper.ApplyKnockout(self, jQuery('#DisplayOption'));
    };
    self.SetData = function (displays, currentDisplay) {
        var data = [];
        jQuery.each(displays, function (index, display) {
            data.push(self.GetInfo(display, currentDisplay));
        });
        data.sortObject('Sorting', enumHandlers.SORTDIRECTION.ASC, false);
        self.Displays(data);
        self.UpdateExecutionInfo();
    };
    self.GetInfo = function (display, currentDisplay) {
        var displayData = display.GetData();
        var name = display.GetName();
        var hasFilter = display.QueryDefinitionHandler.GetFilters().length;
        var hasFollowup = display.QueryDefinitionHandler.GetJumps().length;
        var validation = display.GetValidationResult();
        var isError = validation.Level === validationHandler.VALIDATIONLEVEL.ERROR;
        var isWarning = validation.Level === validationHandler.VALIDATIONLEVEL.WARNING;
        var hasAdhocSign = display.CanCreateOrUpdate() && display.HasChanged();
        var isNewAdhoc = !display.GetRawData();
        var groupInfo = self.GetGroupInfo(display);

        var extendDisplayTypeClasses = [];
        if (displayData.is_angle_default)
            extendDisplayTypeClasses.push('default');
        if (displayData.used_in_task)
            extendDisplayTypeClasses.push('schedule');

        var isParameterized = display.QueryDefinitionHandler.GetExecutionParameters().length > 0;

        return {
            Id: displayData.id,
            Uri: displayData.uri,
            Name: name,
            DisplayType: displayData.display_type,
            DisplayTypeClassName: 'icon-' + displayData.display_type,
            ExtendDisplayTypeClassName: extendDisplayTypeClasses.join(' '),
            FilterClassName: hasFollowup ? 'icon-followup' : hasFilter ? 'icon-filter' : 'none',
            IsPublic: displayData.is_public,
            PublicClassName: displayData.is_public ? 'none' : 'icon-private',
            CanDelete: displayData.authorizations['delete'],
            IsError: isError,
            IsWarning: isWarning,
            ValidClassName: isError ? 'validError' : isWarning ? 'validWarning' : 'none',
            IsParameterized: isParameterized,
            ParameterizedClassName: isParameterized ? 'icon-parameterized' : 'none',
            IsSelected: currentDisplay === displayData.uri,
            IsNewAdhoc: isNewAdhoc,
            UnSavedClassName: hasAdhocSign ? 'icon-adhoc sign-unsaved' : 'none',
            GroupId: groupInfo.id,
            Sorting: groupInfo.sorting,
            Sortable: self.Sortable(display)
        };
    };
    self.GetGroupInfo = function (display) {
        var name = display.GetName();
        var template = '{0}_{1}';
        if (display.Data().is_public()) {
            // public -> display.order -> display.name
            var order = typeof display.Data().order === 'number' ? display.Data().order : 999;
            return {
                id: DisplayOverviewHandler.DisplayGroup.Public,
                sorting: kendo.format(template, DisplayOverviewHandler.DisplayGroup.Public * 1000 + order, name)
            };
        }
        else if (!display.Data().created || display.Data().created.user === userModel.Data().uri) {
            // my private -> display.name
            return {
                id: DisplayOverviewHandler.DisplayGroup.MyPrivate,
                sorting: kendo.format(template, DisplayOverviewHandler.DisplayGroup.MyPrivate * 1000, name)
            };
        }
        else {
            // other private -> display.name
            return {
                id: DisplayOverviewHandler.DisplayGroup.OtherPrivate,
                sorting: kendo.format(template, DisplayOverviewHandler.DisplayGroup.OtherPrivate * 1000, name)
            };
        }
    };
    self.GetGroupOption = function (groupId) {
        return self.Group[groupId] || { Header: '', Visible: ko.observable(false), ForceClose: ko.observable(false) };
    };
    self.IsVisible = function (display) {
        var option = self.GetGroupOption(display.GroupId);
        return option.Visible() && !option.ForceClose();
    };
    self.SetVisibility = function (display) {
        var option = self.GetGroupOption(display.GroupId);
        option.Visible(!option.Visible());
        userSettingModel.SetDisplayGroupSettings(option.Key, option.Visible());
        self.UpdateScrollButtonState();
    };
    self.GroupHeader = function (display) {
        var index = self.Displays.indexOf(display);
        var previousDisplay = self.Displays()[index - 1];

        if (previousDisplay && previousDisplay.GroupId === display.GroupId)
            return '';

        var option = self.GetGroupOption(display.GroupId);
        var count = self.Displays().findObjects('GroupId', display.GroupId).length;
        return kendo.format(option.Header, count);
    };
    self.IsGroupActive = function (display) {
        var selectedDisplay = self.Displays().findObject('IsSelected', true);
        return selectedDisplay && selectedDisplay.GroupId === display.GroupId;
    };

    // sortable
    self.InitialSortable = function () {
        var element = jQuery('#DisplayTabs .tab-menu-wrapper');
        if (element.data('kendoSortable'))
            return;

        element.kendoSortable({
            container: element,
            autoScroll: true,
            cursor: 'move',
            filter: '.sortable',
            axis: 'x',
            hint: self.CreateSortableHint,
            placeholder: self.CreateSortablePlaceholder,
            start: self.SortableStart,
            move: self.SortableMove,
            change: self.SortableChange,
            end: self.SortableRestore,
            cancel: self.SortableRestore
        });
    };
    self.Sortable = function (display) {
        return display.CanUpdateOrder();
    };
    self.CreateSortableHint = function (element) {
        var tab = element.clone();
        tab.addClass('active');
        var hint = jQuery('<div class="tab display-tab display-tab-hint"/>');
        hint.append(jQuery('<div class="tab-menu-wrapper"/>').append(tab));
        return hint;
    };
    self.CreateSortablePlaceholder = function (element) {
        var placeholder = element.clone();
        placeholder.removeClass('active');
        placeholder.addClass('tab-menu-placeholder');
        return placeholder;
    };
    self.SortableStart = function (e) {
        if (!self.AngleHandler.Validate() || self.Displays().findObjects('Sortable', true).length <= 1) {
            e.preventDefault();
            return;
        }

        self.Group[DisplayOverviewHandler.DisplayGroup.MyPrivate].ForceClose(true);
        self.Group[DisplayOverviewHandler.DisplayGroup.OtherPrivate].ForceClose(true);
        jQuery('#DisplayTabs').addClass('sorting');
    };
    self.SortableMove = function () {
        self.UpdateScrollButtonState();
    };
    self.SortableRestore = function () {
        self.Group[DisplayOverviewHandler.DisplayGroup.MyPrivate].ForceClose(false);
        self.Group[DisplayOverviewHandler.DisplayGroup.OtherPrivate].ForceClose(false);
        setTimeout(function () {
            self.UpdateScrollButtonState();
            jQuery('#DisplayTabs').removeClass('sorting');
        }, 1);
    };
    self.SortableChange = function () {
        // get data
        var orders = self.GetDisplayOrdersData();
        if (!orders.length)
            return;

        // save
        var save = jQuery.proxy(self.SaveOrders, self, orders);
        self.AngleHandler.ConfirmSave(null, save, self.SaveOrdersCancel);
    };
    self.GetDisplayOrdersData = function () {
        var orders = [];
        var order = 1;
        jQuery('#DisplayTabs .tab-menu').each(function (_index, element) {
            var model = ko.dataFor(element);
            if (model && model.Sortable) {
                var rawDisplay = self.AngleHandler.GetRawDisplay(model.Uri);
                if (!rawDisplay || rawDisplay.order !== order) {
                    orders.push({
                        uri: model.Uri,
                        order: order
                    });
                }
                order++;
            }
        });
        return orders;
    };
    self.SaveOrders = function (orders) {
        progressbarModel.ShowStartProgressBar();
        progressbarModel.SetDisableProgressBar();
        self.AngleHandler.SaveOrders(orders)
            .fail(self.SaveOrdersFail)
            .done(self.SaveOrdersDone)
            .always(function () {
                progressbarModel.EndProgressBar();
            });
    };
    self.SaveOrdersCancel = function () {
        // restore back
        self.Displays(ko.toJS(self.Displays()));
    };
    self.SaveOrdersDone = function () {
        toast.MakeSuccessTextFormatting(self.AngleHandler.GetName(), Localization.Toast_SaveItem);
        var selectedDisplay = self.Displays().findObject('IsSelected', true);
        self.SetData(self.AngleHandler.Displays, selectedDisplay.Uri);
    };
    self.SaveOrdersFail = function () {
        // restore back
        self.Displays(ko.toJS(self.Displays()));
    };

    // overview popup
    self.Show = function () {
        var target = jQuery('#DisplayOverview');
        target.html(self.GetHtml(ko.toJS(self.Displays())));
        target.off('click', '.listview-item').on('click', '.listview-item', self.OnSelect);
        target.off('click', '.btn-delete').on('click', '.btn-delete', self.OnDelete);
        target.show();

        // set size
        var itemHeight = target.find('.listview-item').outerHeight();
        var itemContainer = target.find('.listview');
        itemContainer.css('max-height', WC.Window.Height - target.offset().top - 20);

        // scroll to the active Display
        var visibleItemCount = Math.floor(target.outerHeight() / itemHeight);
        var position = target.find('.listview-item.active').prevAll().length + 2;
        if (position > visibleItemCount) {
            itemContainer.scrollTop((position - visibleItemCount + 2) * itemHeight);
        }

        // toggle show/hide
        jQuery.clickOutside('#DisplayOverview', '#BtnDisplayOverview');
    };
    self.Close = function () {
        jQuery('#DisplayOverview').hide();
    };
    self.OnSelect = function (e) {
        var uri = jQuery(e.currentTarget).data('url');
        var display = self.Displays().findObject('Uri', uri);
        self.SwitchDisplay(display);
    };
    self.OnDelete = function (e) {
        e.stopPropagation();

        var uri = jQuery(e.currentTarget).closest('.listview-item').data('url');
        var display = self.Displays().findObject('Uri', uri);
        self.DeleteDisplay(display);
        self.Close();
    };
    self.GetHtml = function (displays) {
        displays.sortObject('Name', enumHandlers.SORTDIRECTION.ASC, false);
        var html = ['<ul class="listview listview-popup display-listview">'];
        jQuery.each(displays, function (index, display) {
            var template = [
                '<li class="listview-item #: IsSelected ? \'active\' : \'\' #" data-url="#: Uri #" data-title="#: Name #">',
                    '<div class="displayNameContainer small">',
                        '<div class="front">',
                            '<i class="icon #= DisplayTypeClassName + \' \' + ExtendDisplayTypeClassName #"></i>',
                        '</div>',
                        '<div class="name" data-showwhenneed="true" data-role="tooltip" data-tooltip-text="#: Name #" data-tooltip-position="bottom">#: Name #</div>',
                        '<div class="rear">',
                            '<i class="icon #= PublicClassName #"></i>',
                            '<i class="icon #= ValidClassName #"></i>',
                            '<i class="icon #= FilterClassName #"></i>',
                            '<i class="icon #= ParameterizedClassName #"></i>',
                            '<i class="icon #= UnSavedClassName #"></i>',
                        '</div>',
                        '<i class="icon icon-close btn-delete #= !IsNewAdhoc && !CanDelete ? \'disabled\' : \'\' #" data-role="tooltip" data-tooltip-text="#: Localization.Delete #" data-tooltip-position="bottom"></i>',
                    '</div>',
                '</li>'
            ].join('');
            var templateFunction = kendo.template(template);
            html.push(templateFunction(display));
        });
        html.push('</ul>');
        return html.join('');
    };

    // scrolling
    self.MoveLeft = function (_data, e) {
        if (jQuery(e.currentTarget).hasClass('disabled'))
            return;

        self.ScrollLeft();
    };
    self.MoveRight = function (_data, e) {
        if (jQuery(e.currentTarget).hasClass('disabled'))
            return;

        self.ScrollRight();
    };
    self.GetDisplayTabsContainerWidth = function () {
        var container = jQuery('#DisplayTabs');
        return container.width()
            - container.find('.add-display-wrapper').outerWidth()
            - container.find('.right-btn-wrapper').outerWidth();
    };
    self.UpdateScrollButtonState = function () {
        var container = jQuery('#DisplayTabs');
        var containerSpace = self.GetDisplayTabsContainerWidth();

        jQuery('#BtnScrollLeft').removeClass('disabled invisible');
        jQuery('#BtnScrollRight').removeClass('disabled invisible');

        var allTabsWidth = container.find('.tab-menu-header,.tab-menu').map(function () {
            return Math.floor(this.getBoundingClientRect().width);
        }).get().sum();

        // when the total width of the tabs are smaller than the space
        if (allTabsWidth <= containerSpace) {
            jQuery('#BtnScrollLeft').addClass('invisible');
            jQuery('#BtnScrollRight').addClass('invisible');
            return;
        }

        // check left button
        var currentScroll = container.find('.tab-menu-wrapper').scrollLeft();
        if (currentScroll === 0) {
            jQuery('#BtnScrollLeft').addClass('disabled');
        }

        // check right button
        if (allTabsWidth - currentScroll <= containerSpace) {
            jQuery('#BtnScrollRight').addClass('disabled');
        }
    };
    self.ScrollToFocusedDisplay = function () {
        var target = jQuery('#DisplayTabs .tab-menu.active');
        if (!target.length)
            return;

        if (target.is(':hidden'))
            target = jQuery('#DisplayTabs .tab-menu-header.active');

        var containerSpace = self.GetDisplayTabsContainerWidth();
        var currentScroll = jQuery('#DisplayTabs .tab-menu-wrapper').scrollLeft();
        var displayTabLeft = target.position().left;
        var displayTabRight = displayTabLeft + target.outerWidth();

        // when the actived tab is on the container
        if (displayTabLeft >= 0 && displayTabRight <= containerSpace)
            return;

        var newScrollLeft = 0;
        // when the actived tab is on the rightmost of the container
        if (displayTabLeft < containerSpace && displayTabRight > containerSpace) {
            newScrollLeft = currentScroll + displayTabRight - containerSpace;
        }
        else {
            newScrollLeft = currentScroll + displayTabLeft;
        }
        jQuery('#DisplayTabs .tab-menu-wrapper').scrollLeft(newScrollLeft);

        self.UpdateScrollButtonState();
    };
    self.ScrollLeft = function () {
        var target = jQuery('#DisplayTabs .tab-menu-wrapper');
        var newLeft = self.FindPreviousTabPosition(target);
        target.animate({ scrollLeft: newLeft }, 100, self.UpdateScrollButtonState);
    };
    self.ScrollRight = function () {
        var target = jQuery('#DisplayTabs .tab-menu-wrapper');
        var newLeft = self.FindNextTabPosition(target);
        target.animate({ scrollLeft: newLeft }, 100, self.UpdateScrollButtonState);
    };
    self.FindPreviousTabPosition = function (displayBar) {
        var leftMostTabs = jQuery('#DisplayTabs').find('.tab-menu:visible').filter(function () {
            return jQuery(this).position().left < 0;
        });

        if (leftMostTabs.length <= 1)
            return 0;

        var position = displayBar.scrollLeft();
        var tab = jQuery(leftMostTabs[leftMostTabs.length - 1]);
        if (tab.position().left < 0) {
            var prevTab = tab.prev('.tab-menu-header');
            position += prevTab.length ? prevTab.position().left : tab.position().left;
        }
        else {
            position -= tab.outerWidth();
        }
        return parseInt(position);
    };
    self.FindNextTabPosition = function (displayBar) {
        var nextTabs = jQuery('#DisplayTabs').find('.tab-menu-header,.tab-menu:visible').filter(function () {
            return jQuery(this).position().left + 1 >= 0;
        });

        if (!nextTabs.length)
            return 0;

        var position = displayBar.scrollLeft();
        nextTabs.each(function (_index, tab) {
            tab = jQuery(tab);
            position += tab.outerWidth();
            if (tab.hasClass('tab-menu'))
                return false;
        });
        return parseInt(position);
    };

    // new display popup
    self.ShowNewDisplay = function () {
        var target = jQuery('#NewDisplay');
        target.html(self.GetNewDisplayHtml());
        target.off('click', '.listview-item').on('click', '.listview-item', self.OnSelectNewDisplay);
        target.show();

        // toggle show/hide
        jQuery.clickOutside('#NewDisplay', '#BtnNewDisplay');
    };
    self.CloseNewDisplay = function () {
        jQuery('#NewDisplay').hide();
    };
    self.OnSelectNewDisplay = function (e) {
        var displayType = jQuery(e.currentTarget).data('value');
        var displayName = displayModel.GetAdhocDisplayName(Localization.DefaultDisplayListName);
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        var id = 'd' + jQuery.GUID().replace(/-/g, '');
        var names = [{
            lang: defaultLanguage,
            text: displayName
        }];
        var descriptions = [{
            lang: defaultLanguage,
            text: ''
        }];

        var canEditId = jQuery.localStorage('can_edit_id');
        self.ItemDescriptionHandler.CanEditId(canEditId === null ? window.showAngleAndDisplayID : canEditId);
        self.ItemDescriptionHandler.Initial(id, names, descriptions);
        self.ItemDescriptionHandler.SetReadOnly(false);
        self.ItemDescriptionHandler.Save = jQuery.proxy(self.SaveNewDisplay, self, displayType);
        self.ItemDescriptionHandler.ShowEditPopup(Localization.DefaultDisplayListName);
        self.CloseNewDisplay();
    };
    self.SaveNewDisplay = function (displayType) {
        self.ItemDescriptionHandler.ShowProgressbar();
        self.GetCreateDisplayData(displayType)
            .fail(self.CreateNewDisplayFail)
            .done(function (displayHandler) {
                var display = displayHandler.GetData();
                if (self.AngleHandler.IsAdhoc()) {
                    display.uri = self.AngleHandler.Data().uri + '/displays/' + display.id;
                    display.is_adhoc = true;
                    display.authorizations = displayModel.GetDefaultAdhocAuthorization(self.AngleHandler.GetData());
                    self.CreateNewDisplayDone(display);
                }
                else {
                    display.is_adhoc = false;
                    displayHandler.CreateNew(display, self.CreateNewDisplayDone, self.CreateNewDisplayFail);
                }
            });
    };
    self.GetCreateDisplayData = function (displayType) {
        var display = jQuery.extend(displayModel.GenerateDefaultData(displayType), self.ItemDescriptionHandler.GetData());
        var displayHandler = new DisplayHandler(display, self.AngleHandler);
        if (displayType === enumHandlers.DISPLAYTYPE.LIST) {
            var resultData = displayHandler.CreateAdhocResultData(null);
            return displayModel.GetDefaultListFields(resultData)
                .then(function (fields) {
                    displayHandler.Data().fields = fields;
                    return jQuery.when(displayHandler);
                });
        }
        else {
            return jQuery.when(displayHandler);
        }
    };
    self.CreateNewDisplayFail = function () {
        self.ItemDescriptionHandler.HideProgressbar();
    };
    self.CreateNewDisplayDone = function (display) {
        self.AngleHandler.AddDisplay(display, null, display.is_adhoc);

        // show message
        if (!display.is_adhoc) {
            var displayHandler = self.AngleHandler.GetDisplay(display.uri);
            toast.MakeSuccessTextFormatting(displayHandler.GetName(), Localization.Toast_SaveItem);
        }
        else {
            displayModel.SetTemporaryDisplay(display.uri, display);
        }

        // redirect
        self.Redirect(display.id);
    };
    self.GetNewDisplayHtml = function () {
        var displaytypes = jQuery.map(enumHandlers.DISPLAYTYPE, function (value) {
            return {
                value: value,
                name: WC.Utility.ToString(Localization['NewDisplayType_' + value])
            };
        });

        var html = ['<ul class="listview listview-popup display-listview">'];
        jQuery.each(displaytypes, function (index, type) {
            var template = [
                '<li class="listview-item" data-value="#: value #" data-title="#: name #">#: name #</li>'
            ].join('');
            var templateFunction = kendo.template(template);
            html.push(templateFunction(type));
        });
        html.push('</ul>');
        return html.join('');
    };

    // Display option
    self.CanKeepFilter = function () {
        if (self.IsEditMode())
            return false;

        var currentDisplay = self.AngleHandler.GetCurrentDisplay();
        return !!(self.AngleHandler.AllowMoreDetails()
            && self.Displays().length
            && !currentDisplay.QueryDefinitionHandler.GetJumps().length
            && currentDisplay.QueryDefinitionHandler.GetFilters().length);
    };
    self.IsEditMode = function () {
        return !!WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.EDITMODE);
    };

    // execution info
    self.UpdateExecutionInfo = function () {
        var currentDisplay = self.AngleHandler.GetCurrentDisplay();
        self.ExecutionInfo(currentDisplay ? currentDisplay.GetResultExecution() : '');
    };
}

DisplayOverviewHandler.DisplayGroup = {
    Public: 1,
    MyPrivate: 2,
    OtherPrivate: 3
};