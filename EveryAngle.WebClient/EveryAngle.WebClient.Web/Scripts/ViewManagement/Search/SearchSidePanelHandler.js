function SearchSidePanelHandler() {
    "use strict";

    var self = this;
    self.Initial = function () {
        self.StateManager.Collapsed =
            new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.SEARCH_PANEL_COLLAPSED);

        userSettingModel.InitialSidePanelSettingsData();
        var collapsed = userSettingModel.SidePanelSettingsData[self.StateManager.Collapsed.Name];
        var element = jQuery('.content-wrapper');
        var leftPanel = jQuery('#LeftMenu');

        // toggling
        jQuery('#ButtonToggleSidePanel')
            .removeClass('disabled')
            .off('click').on('click', self.Toggle);

        // set panel state
        if (collapsed) {
            element.addClass('full');
        }
        else {
            element.removeClass('full');
            leftPanel.removeClass('hidden');
        }

        jQuery(".content-wrapper").addClass('active');
    };

    self.Toggle = function () {
        if (jQuery('#ButtonToggleSidePanel').hasClass('disabled'))
            return;

        var element = jQuery('.content-wrapper');
        var isOpen = !element.hasClass('full');
        element.toggleClass('full');

        var leftPanel = jQuery('#LeftMenu');
        if (leftPanel.hasClass('hidden')) {
            leftPanel.removeClass('hidden');
        }
        else {
            setTimeout(function () {
                var leftPanel = jQuery('#LeftMenu');
                leftPanel.addClass('hidden');
            }, 300);
        }

        self.StateManager.Collapsed.Save(isOpen);
    };
}
SearchSidePanelHandler.extend(SidePanelHandler);