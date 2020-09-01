function DashboardSidePanelHandler() {
    "use strict";
    
    var _self = {};
    _self.$dashboardAccordions = {};
    _self.$dashboardAccordions[enumHandlers.ACCORDION.DEFINITION] = '#TabContentDashboard .section-definition > .accordion-header';
    _self.$dashboardAccordions[enumHandlers.ACCORDION.DESCRIPTION] = '#TabContentDashboard .section-description > .accordion-header';
    _self.$dashboardAccordions[enumHandlers.ACCORDION.LABEL] = '#TabContentDashboard .section-labels > .accordion-header';
    _self.$widgetAccordions = {};
    _self.$widgetAccordions[enumHandlers.ACCORDION.DEFINITION] = '#TabContentWidgets .section-widgets > .accordion-header';

    var self = this;
    self.InitialDashboard = function (callback) {
        self.Initial(
            new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_SIZE, callback),
            new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_COLLAPSED, callback),
            new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_TAB, self.TabStateChange)
        );
        self.StateManager.DashboardAccordions = new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_ACCORDIONS);
        self.StateManager.WidgetAccordions = new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.WIDGET_PANEL_ACCORDIONS);

        // set view
        self.SetTemplates();
    };
    self.TabStateChange = function () {
        kendo.resize(jQuery('#TabDetails .k-grid:visible'));
    };
    self.SetTemplates = function () {
        // info section
        jQuery('#SectionInfo').html(self.View.GetSectionInfoTemplate());

        // dashboard tab
        jQuery('#TabContentDashboard')
            .empty()
            .append(self.View.GetSectionFiltersTemplate())
            .append(self.View.GetSectionDescriptionTemplate())
            .append(self.View.GetSectionLabelsTemplate())
            .append(self.View.GetSectionTagsTemplate())
            .append(self.View.GetSectionPersonalNoteTemplate())
            .append(self.View.GetSectionExecuteAtLogonTemplate());

        // widgets tab
        jQuery('#TabContentWidgets')
            .empty()
            .append(self.View.GetSectionWidgetsTemplate());

        // accordions
        self.InitialAccordion(self.StateManager.DashboardAccordions, _self.$dashboardAccordions);
        self.InitialAccordion(self.StateManager.WidgetAccordions, _self.$widgetAccordions);
    };
}
DashboardSidePanelHandler.extend(SidePanelHandler);
DashboardSidePanelHandler.prototype.View = new DashboardSidePanelView();
