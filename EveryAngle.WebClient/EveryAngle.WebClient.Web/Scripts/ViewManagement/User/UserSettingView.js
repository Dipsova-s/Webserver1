
function UserSettingsView() {
    "use strict";

    var self = this;

    //start menu management
    var menus = ['#UserMenu', '#HelpMenu', '#NotificationsFeedMenu'];
    self.ToggleMenu = function () {
        self.ToggleMenuByIndex(0);
    };
    self.ToggleMenuHelp = function () {
        self.ToggleMenuByIndex(1);
    };
    self.ToggleMenuNotificationsFeed = function () {
        self.ToggleMenuByIndex(2);
    };
    self.ToggleSettings = function () {
        self.HideAllMenus();
        userSettingsPanelHandler.Init();
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
    //end menu management

    //start user info
    self.UpdateUserMenu = function () {
        var name = userModel.DisplayName();
        jQuery('#UserControlName').text(name);
        self.CheckLocalUser();
    };
    self.CheckLocalUser = function () {
        self.HideChangePasswordButton();
    };
    self.ShowChangePasswordButton = function () {
        jQuery('.btnChangePassword').show();

    };
    self.HideChangePasswordButton = function () {
        jQuery('.btnChangePassword').hide();

    };
    //end user info

}

var userSettingsView = new UserSettingsView();
