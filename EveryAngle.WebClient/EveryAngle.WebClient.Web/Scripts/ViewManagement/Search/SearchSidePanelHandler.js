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
            self.AddToolTipToButtonToggleSidePanel(Localization.OpenSidebar);
        }
        else {
            element.removeClass('full');
            leftPanel.removeClass('hidden');
            self.AddToolTipToButtonToggleSidePanel(Localization.CloseSidebar);
        }

        jQuery(".content-wrapper").addClass('active');

        // scroll bar
        leftPanel.find('.left-menu-wrapper')
            .addClass('scrollbar-custom')
            .scrollbar();
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
            self.AddToolTipToButtonToggleSidePanel(Localization.CloseSidebar);
        }
        else {
            setTimeout(function () {
                var leftPanel = jQuery('#LeftMenu');
                leftPanel.addClass('hidden');
                self.AddToolTipToButtonToggleSidePanel(Localization.OpenSidebar);
            }, 300);
        }

        self.StateManager.Collapsed.Save(isOpen);
    };

    self.AddToolTipToButtonToggleSidePanel = function (toolTipText) {
        return jQuery('#ButtonToggleSidePanel')
            .attr({
                'data-role': 'tooltip',
                'data-tooltip-text': toolTipText
            });
    };
}
SearchSidePanelHandler.extend(SidePanelHandler);