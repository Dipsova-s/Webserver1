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

        jQuery('#SearchSidePanelButton')
            .removeClass('disabled')
            .off('click').on('click', self.Toggle);

        // set panel state
        if (collapsed) {
            element.addClass('full');
            self.AddToolTipToButtonToggleSidePanel(Localization.OpenSidebar);
            self.ChangeIcon('../../Images/show-left-side-bar-fill.svg');
        }
        else {
            element.removeClass('full');
            leftPanel.removeClass('hidden');
            self.AddToolTipToButtonToggleSidePanel(Localization.CloseSidebar);
            self.ChangeIcon('../../Images/hide-left-side-bar-fill.svg');
        }

        jQuery(".content-wrapper").addClass('active');

        // scroll bar
        leftPanel.find('.left-menu-wrapper')
            .addClass('scrollbar-custom')
            .scrollbar();
    };

    self.Toggle = function () {
        if (jQuery('#SearchSidePanelButton').hasClass('disabled'))
            return;

        var element = jQuery('.content-wrapper');
        var isOpen = !element.hasClass('full');
        element.toggleClass('full');

        var leftPanel = jQuery('#LeftMenu');
        if (leftPanel.hasClass('hidden')) {
            leftPanel.removeClass('hidden');
            self.AddToolTipToButtonToggleSidePanel(Localization.CloseSidebar);
            self.ChangeIcon('../../Images/hide-left-side-bar-fill.svg');
        }
        else {
            setTimeout(function () {
                var leftPanel = jQuery('#LeftMenu');
                leftPanel.addClass('hidden');
                self.AddToolTipToButtonToggleSidePanel(Localization.OpenSidebar);
                self.ChangeIcon('../../Images/show-left-side-bar-fill.svg');
            }, 300);
        }

        self.StateManager.Collapsed.Save(isOpen);
    };

    self.AddToolTipToButtonToggleSidePanel = function (toolTipText) {
        return jQuery('#SearchSidePanelButton')
            .attr({
                'data-role': 'tooltip',
                'data-tooltip-position' : 'bottom',
                'data-tooltip-text': toolTipText
            });
    };
    self.ChangeIcon = function (path) {
        return jQuery('#ButtonToggleSidePanel_img').attr({ 'src': path });
    };
}
SearchSidePanelHandler.extend(SidePanelHandler);