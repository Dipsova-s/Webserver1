function DisplayOverviewHandler(angleHandler) {
    "use strict";

    var self = this;
    self.Displays = ko.observableArray([]);
    self.CanSwitchDisplay = ko.observable(false);
    self.CanCreateNewDisplay = ko.observable(false);
    self.ItemDescriptionHandler = new ItemDescriptionHandler();
    self.AngleHandler = angleHandler;

    self.KeepFilter = ko.observable(false);
    self.IsVisibleKeepFilter = ko.observable(false);

    // interface
    self.CreateNewDisplay = jQuery.noop;
    self.DeleteDisplay = jQuery.noop;
    self.ShowEditDescriptionPopup = jQuery.noop;
    self.SwitchDisplay = jQuery.noop;
    self.Redirect = jQuery.noop;

    // create data
    self.SetData = function (displays, currentDisplay) {
        var data = [];
        jQuery.each(displays, function (index, display) {
            data.push(self.GetInfo(display, currentDisplay));
        });
        data.sortObject('Sorting', enumHandlers.SORTDIRECTION.ASC, false);
        self.Displays(data);
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
            Sorting: kendo.format('{0}_{1}', isNewAdhoc ? '0' : '1', name)
        };
    };

    // overview popup
    self.Show = function () {
        var target = jQuery('#DisplayOverview');
        target.html(self.GetHtml(self.Displays()));
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
        displays.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
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

        self.ScrollLeft(jQuery('#DisplayTabs .tab-menu-wrapper'));
    };
    self.MoveRight = function (_data, e) {
        if (jQuery(e.currentTarget).hasClass('disabled'))
            return;

        self.ScrollRight(jQuery('#DisplayTabs .tab-menu-wrapper'));
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

        var allTabsWidth = container.find('.tab-menu').map(function () {
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
        var activedTab = jQuery('#DisplayTabs .tab-menu.active');
        if (!activedTab.length) {
            return;
        }

        var containerSpace = self.GetDisplayTabsContainerWidth();
        var currentScroll = jQuery('#DisplayTabs .tab-menu-wrapper').scrollLeft();
        var displayTabLeft = activedTab.position().left;
        var displayTabRight = displayTabLeft + activedTab.outerWidth();

        // when the actived tab is on the container
        if (displayTabLeft >= 0 && displayTabRight <= containerSpace) {
            return;
        }

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
    self.ScrollLeft = function (displayBar) {
        var newLeft = self.FindPreviousTabPosition(displayBar);
        displayBar.animate({ scrollLeft: newLeft }, 100, self.UpdateScrollButtonState);
    };
    self.ScrollRight = function (displayBar) {
        var newLeft = self.FindNextTabPosition(displayBar);
        displayBar.animate({ scrollLeft: newLeft }, 100, self.UpdateScrollButtonState);
    };
    self.FindPreviousTabPosition = function (displayBar) {
        var leftMostTabs = jQuery('#DisplayTabs .tab-menu').filter(function () {
            return jQuery(this).position().left < 0;
        });

        if (leftMostTabs.length <= 1) {
            return 0;
        }

        var currentScroll = displayBar.scrollLeft();
        var tab = jQuery(leftMostTabs[leftMostTabs.length - 1]);
        if (tab.position().left < 0) {
            return currentScroll + tab.position().left;
        }
        else {
            return currentScroll - parseInt(tab.outerWidth());
        }
    };
    self.FindNextTabPosition = function (displayBar) {
        var nextTabs = jQuery('#DisplayTabs .tab-menu').filter(function () {
            return jQuery(this).position().left + 1 >= 0;
        });

        if (nextTabs.length === 0) {
            return 0;
        }

        var currentScroll = displayBar.scrollLeft();
        return currentScroll + parseInt(jQuery(nextTabs[0]).outerWidth());
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
}
