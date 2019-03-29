(function (win) {

    var topMenu = {
        menuIds: {
            notifications: 'NotificationsFeedMenu',
            help: 'HelpMenu',
            user: 'UserMenu'
        },
        init: function () {
            jQuery('html').on('click', function (event) {
                MC.topMenu.setClickOutsideEvent(event, MC.topMenu.menuIds.user, 'UserMenuControl', 'linkUser');
                MC.topMenu.setClickOutsideEvent(event, MC.topMenu.menuIds.help, 'HelpMenuControl', 'linkHelp');
                MC.topMenu.setClickOutsideEventAndPreventClosedAfterClicked(event, MC.topMenu.menuIds.notifications, 'NotificationsFeed', 'linkNotificationsFeed');
            });

            MC.addPageReadyFunction(MC.topMenu.setWorkbenchUri);
        },
        setClickOutsideEvent: function (event, menuId, menuButtonId, menuButtonClass) {
            var isInMenu = jQuery("#" + menuButtonId).has(event.target).attr('class') === menuButtonClass;
            if (!isInMenu && event.target.id !== menuButtonId) {
                jQuery('#' + menuId).hide();
            }
        },
        setClickOutsideEventAndPreventClosedAfterClicked: function (event, menuId, menuButtonId, menuButtonClass) {
            var isSelf = jQuery(event.target).closest('#' + menuId);
            if (!isSelf.length) {
                MC.topMenu.setClickOutsideEvent(event, menuId, menuButtonId, menuButtonClass);
            }
        },
        click: function (menuId) {
            var menuIds = jQuery.map(MC.topMenu.menuIds, function (id) { return '#' + id; }).join(',');
            var targetMenu = jQuery('#' + menuId);
            var isOpen = !targetMenu.is(':hidden');

            jQuery(menuIds).hide();

            if (isOpen)
                targetMenu.hide();
            else
                targetMenu.show();
        },
        clickUser: function () {
            MC.topMenu.click(MC.topMenu.menuIds.user);
        },
        clickHelp: function () {
            MC.topMenu.click(MC.topMenu.menuIds.help);
        },
        clickNotificationsFeed: function () {
            MC.topMenu.click(MC.topMenu.menuIds.notifications);
        },
        setWorkbenchUri: function () {
            return;
            if (jQuery("#btnWorkbench").length) {
                MC.ajax
                    .request({
                        url: componentUrl,
                        skipAbort: true
                    })
                    .done(function (result) {
                        var workbench = result.Data.findObject('TypeName', 'ModellingWorkbench');
                        if (workbench) {
                            jQuery("#btnWorkbench").attr('href', workbench.Uri);
                        }
                        else {
                            jQuery("#btnWorkbench").hide();
                        }
                    })
                    .fail(function () {
                        jQuery("#btnWorkbench").hide();
                    });
            }
        }
    };
    MC.topMenu = topMenu;
    MC.topMenu.init();

})(window);
