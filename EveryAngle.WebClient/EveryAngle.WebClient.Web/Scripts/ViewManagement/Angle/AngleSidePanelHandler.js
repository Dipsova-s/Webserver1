function AngleSidePanelHandler() {
    "use strict";

    var _self = {};
    _self.$angleAccordions = {};
    _self.$angleAccordions[enumHandlers.ACCORDION.DEFINITION] = '#TabContentAngle .section-definition > .accordion-header';
    _self.$angleAccordions[enumHandlers.ACCORDION.DESCRIPTION] = '#TabContentAngle .section-description > .accordion-header';
    _self.$angleAccordions[enumHandlers.ACCORDION.LABEL] = '#TabContentAngle .section-labels > .accordion-header';
    _self.$displayAccordions = {};
    _self.$displayAccordions[enumHandlers.ACCORDION.DEFINITION] = '#TabContentDisplay .section-definition > .accordion-header';
    _self.$displayAccordions[enumHandlers.ACCORDION.AGGREGATION] = '#TabContentDisplay .section-aggregation > .accordion-header';
    _self.$displayAccordions[enumHandlers.ACCORDION.DESCRIPTION] = '#TabContentDisplay .section-description > .accordion-header';

    var self = this;
    self.InitialAngle = function (callback) {
        self.Initial(
            new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE, callback),
            new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_COLLAPSED, callback),
            new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_TAB, self.TabStateChange)
        );
        self.StateManager.AngleAccordions = new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_ACCORDIONS);
        self.StateManager.DisplayAccordions = new SidePanelStateManager(enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_PANEL_ACCORDIONS);

        // set view
        self.SetTemplates();
    };
    self.TabStateChange = function () {
        kendo.resize(jQuery('#TabDetails .k-grid:visible'));
    };
    self.SetTemplates = function () {
        // info section
        jQuery('#SectionInfo').html(self.View.GetSectionInfoTemplate());

        // angle tab
        jQuery('#TabContentAngle')
            .empty()
            .append(self.View.GetSectionFiltersAndJumpsTemplate())
            .append(self.View.GetSectionDescriptionTemplate())
            .append(self.View.GetSectionLabelsTemplate())
            .append(self.View.GetSectionTagsTemplate())
            .append(self.View.GetSectionPersonalNoteTemplate());

        // angle accordions
        self.InitialAccordion(self.StateManager.AngleAccordions, _self.$angleAccordions);

        // display tab
        self.SetDisplayTemplates();
    };
    self.SetDisplayTemplates = function () {
        jQuery('#TabContentDisplay')
            .empty()
            .append(self.View.GetSectionFiltersAndJumpsTemplate())
            .append(self.View.GetSectionAggregationTemplate())
            .append(self.View.GetSectionDescriptionTemplate())
            .append(self.View.GetSectionDisplayOptionsTemplate())
            .append(self.View.GetSectionDefaultDrilldownTemplate())
            .append(self.View.GetSectionExcelTemplate());

        // display accordions
        self.InitialAccordion(self.StateManager.DisplayAccordions, _self.$displayAccordions);
    };
}
AngleSidePanelHandler.extend(SidePanelHandler);
AngleSidePanelHandler.prototype.View = new AngleSidePanelView();