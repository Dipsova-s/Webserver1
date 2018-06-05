(function (win) {

    var topMenu = {
        init: function () {
            jQuery('html').click(function (e) {
                if (e.target.id != 'UserMenuControl') {
                    jQuery('#UserMenu').hide();
                }

                if (e.target.id != 'HelpMenuControl') {
                    jQuery('#HelpMenu').hide();
                }
            });
        },
        click: function (showTarget, hideTarget) {
            if (showTarget.is(':hidden')) {
                showTarget.show();
                hideTarget.hide();
            }
            else {
                showTarget.hide();
            }
        },
        clickUser: function () {
            MC.topMenu.click(jQuery('#UserMenu'), jQuery('#HelpMenu'));
        },
        clickHelp: function () {
            MC.topMenu.click(jQuery('#HelpMenu'), jQuery('#UserMenu'));
        }
    };
    MC.topMenu = topMenu;
    MC.topMenu.init();

})(window);
