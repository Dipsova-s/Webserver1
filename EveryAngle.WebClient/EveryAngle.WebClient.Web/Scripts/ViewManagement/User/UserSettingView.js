
function UserSettingsView() {
    "use strict";

    var self = this;

    //start menu management
    var menus = ['#UserMenu', '#HelpMenu', '#NotificationsFeedMenu', '#UploadMenu'];
    var menu_classes = ['.UserControl', '.Help', '.NotificationsFeed','#UploadDrpdown']
    self.ToggleMenu = function () {
        self.ToggleMenuByIndex(0);
    };
    self.ToggleMenuUpload = function () {
        var targetMenu = jQuery('#UploadMenu');
        if (targetMenu.is(':hidden')) {
            self.HideAllMenus();
            targetMenu.show();
            jQuery('#UploadDrpdown').css({ "background-color": "#a1d1ef", "width":"36px", "height": "36px" });
        }
        else {
            targetMenu.hide();
            jQuery('#UploadDrpdown').css({ "background-color": "" });
        }
    }
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
            jQuery(menu_classes[index]).css({ "background-color": "rgb(2 77 2)" });
        }
        else {
            targetMenu.hide();
            jQuery(menu_classes[index]).css({ "background-color": "" });
        }
    };
    self.HideAllMenus = function () {
        jQuery(menus.join(',')).hide();
        jQuery(menu_classes.join(',')).css({ "background-color": "" });
    };
    //end menu management

    //start user info
    self.UpdateUserMenu = function () {
        jQuery('#UserFullName').text(userModel.DisplayName());
        const names = userModel.DisplayName().split(' ');
        let name = '';
        for (let i = 0; i < names.length && i < 2; i++) {
            name += names[i].charAt(0);
        }

        jQuery('#UserControlName').text(name);
        jQuery('#UserName').text(name);
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
    //end user info

}

var userSettingsView = new UserSettingsView();
