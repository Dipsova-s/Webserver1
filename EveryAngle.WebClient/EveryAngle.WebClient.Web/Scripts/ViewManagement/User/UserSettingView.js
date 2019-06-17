var userSettingsView = new UserSettingsView();

function UserSettingsView() {
    "use strict";

    var self = this;
    var menus = ['#UserMenu', '#HelpMenu', '#NotificationsFeedMenu'];

    self.UpdateUserMenu = function () {
        var name = userModel.DisplayName();
        jQuery('#UserControlName').attr('title', name).text(name);
        self.CheckLocalUser();
    };
    self.CheckLocalUser = function () {
        if (userModel.Data() && userModel.Data().domain.toLowerCase() === "local")
            self.ShowChangePasswordButton();
        else
            self.HideChangePasswordButton();
    };
    self.ShowChangePasswordButton = function () {
        jQuery('.btnChangePassword').show();

    };
    self.HideChangePasswordButton = function () {
        jQuery('.btnChangePassword').hide();

    };
    self.ToggleMenu = function () {
        self.ToggleMenuByIndex(0);
    };
    self.ToggleMenuHelp = function () {
        self.ToggleMenuByIndex(1);
    };
    self.ToggleMenuNotificationsFeed = function () {
        self.ToggleMenuByIndex(2);
    };
    self.ToggleMenuByIndex = function (index) {
        var targetMenu = jQuery(menus[index]);
        if (targetMenu.is(':hidden')) {
            self.HideAllMenus();
            targetMenu.show();
        }
        else {
            targetMenu.hide();
        }
    };
    self.HideAllMenus = function () {
        jQuery(menus.join(',')).hide();
    };
    self.UserSettingTabClick = function (elementId) {
        var element = jQuery('#' + elementId);
        var parent = element.parents('.hasSubMenu:first');
        var isSelectingTab = element.hasClass('Selected');
        var isSubmenu = parent.length;
        var hasSubmenu = element.hasClass('hasSubMenu');
        var animationTime = 250;
        var mainMenuHeight = jQuery('#SettingTabs li:first').height();

        if (!isSelectingTab && hasSubmenu) {
            // open menu (has sub)
            self.ShowMainMenu(element, mainMenuHeight, animationTime);

            // hide other
            jQuery('#SettingTabs > li').not(element).each(function () {
                self.HideMainMenu(jQuery(this), mainMenuHeight, animationTime);
            });
        }
        else if (isSelectingTab && hasSubmenu) {
            // close menu (has sub)
            self.HideMainMenu(element, mainMenuHeight, animationTime);
        }
        else if (!isSelectingTab) {
            self.ShowMainMenu(element, mainMenuHeight, animationTime);

            jQuery('#SettingArea > div').removeClass('Selected');
            jQuery('#' + elementId + 'Area').addClass('Selected');

            if (isSubmenu) {
                // hide other (main)
                jQuery('#SettingTabs > li').not(parent).each(function () {
                    self.HideMainMenu(jQuery(this), mainMenuHeight, animationTime);
                });

                // hide other (sub)
                parent.find('li').not(element).each(function () {
                    self.HideMainMenu(jQuery(this), mainMenuHeight, animationTime);
                });
            }
            else {
                self.HideMainMenu(jQuery('#SettingTabs li').not(element), mainMenuHeight, animationTime);
            }
        }
    };
    self.ShowMainMenu = function (mainMenuElement, mainMenuHeight, animationTime) {
        if (mainMenuElement.hasClass('hasSubMenu')) {
            var subMenuHeight = mainMenuElement.children('.subMenu').height();
            mainMenuElement
                .height(mainMenuHeight)
                .addClass('Selected')
                .stop(true, true)
                .animate({ height: mainMenuHeight + subMenuHeight }, animationTime);
        }
        else {
            mainMenuElement.addClass('Selected');
        }
    };
    self.HideMainMenu = function (mainMenuElement, mainMenuHeight, animationTime) {
        if (mainMenuElement.hasClass('hasSubMenu')) {
            mainMenuElement
                .stop(true, true)
                .animate({ height: mainMenuHeight }, animationTime, function () {
                    mainMenuElement.removeClass('Selected').css('height', '');
                });
        }
        else {
            mainMenuElement.removeClass('Selected');
        }
    };
    self.ClosePopup = function () {
        popup.Close('#popupUserSetting');
    };
    self.UserFieldSettingTabClick = function (tabname) {
        jQuery('#FieldFormatSettingTabs .tabMenu li, #FieldFormatSettingTabs .tabPanel').removeClass('active');
        switch (tabname) {
            case userSettingsHandler.TABFORMAT.NUMBER:
                jQuery('#NumberSettingTabHeader, #NumberFormatSettingTab').addClass('active');
                break;
            case userSettingsHandler.TABFORMAT.DATE:
                jQuery('#DateSettingTabHeader, #DateFormatSettingTab').addClass('active');
                break;
            case userSettingsHandler.TABFORMAT.OTHER:
                jQuery('#OtherSettingTabHeader, #OtherFormatSettingTab').addClass('active');
                break;
            default:
                break;
        }
    };
    self.SetDisableSaveButton = function (popupSettings) {
        var btnSave = popupSettings.buttons.findObject('text', Localization.Ok);
        if (privilegesViewModel.Data().length === 0 || !modelsHandler.HasData()) {
            btnSave.className = 'disabled';
        }
    };
}
