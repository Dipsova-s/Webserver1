(function () {

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
            let lastLoginTimeStamp = $('#last_login');
            if (lastLoginTimeStamp !== null)
                lastLoginTimeStamp.text(MC.util.getDisplayTime(lastLoginTimeStamp.text(), true));
            $('.systemInfoLastLogin').removeClass('hidden');
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
        }
    };
    MC.topMenu = topMenu;
    MC.topMenu.init();

})();
