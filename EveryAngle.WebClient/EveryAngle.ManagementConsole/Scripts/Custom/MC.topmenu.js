(function (win) {

    var topMenu = {
        init: function () {
            jQuery('html').click(function (e) {
                var isInUserMenu = $("#UserMenuControl").has(e.target).attr('class') === 'linkUser';
                if (e.target.id !== 'UserMenuControl' && !isInUserMenu) {
                    jQuery('#UserMenu').hide();
                }

                var isInHelpMenu = $("#HelpMenuControl").has(e.target).attr('class') === 'linkHelp';
                if (e.target.id !== 'HelpMenuControl' && !isInHelpMenu) {
                    jQuery('#HelpMenu').hide();
                }
            });
            MC.addPageReadyFunction(MC.topMenu.setWorkbenchUri);
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
        },
        setWorkbenchUri: function () {
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
                    .fail(function (err) {
                        jQuery("#btnWorkbench").hide();
                    });
            }
        }
    };
    MC.topMenu = topMenu;
    MC.topMenu.init();

})(window);
