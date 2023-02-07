function SidePanelHandler() {
    "use strict";

    var _self = {};
    _self.disable_states = {
        is_open: false,
        disabled: false
    };

    var self = this;
    self.View = new SidePanelView();
    self.StateManager = {
        Size: null,
        Collapsed: null,
        Tab: null
    };

    self.Initial = function (sizeManager, collapsedManager, tabManager) {
        // set state manager
        self.StateManager.Size = sizeManager;
        self.StateManager.Collapsed = collapsedManager;
        self.StateManager.Tab = tabManager;

        // data
        userSettingModel.InitialSidePanelSettingsData();

        // create tab
        self.InitialTab();

        // toggling
        self.InitialToggle();

        // create splitter
        self.CreateSplitter();
    };
    self.SetActive = function () {
        jQuery('#ContentWrapper .side-content').addClass('active');
    };

    // panel size
    self.CreateSplitter = function () {
        var size = userSettingModel.SidePanelSettingsData[self.StateManager.Size.Name];
        var collapsed = userSettingModel.SidePanelSettingsData[self.StateManager.Collapsed.Name];
        var minSize = userSettingModel.MinSidePanelSize;
        var splitter = jQuery("#ContentWrapper").kendoSplitter({
            panes: [
                { scrollable: false, collapsible: true, collapsed: collapsed, size: size, min: minSize, max: self.GetMaxSplitterSize() },
                { scrollable: false }
            ],
            resize: self.SplitterResize
        }).data(enumHandlers.KENDOUITYPE.SPLITTER);
        self.BindSplitterEvents(splitter);
        self.UpdateSplitter(splitter);
    };
    self.GetMaxSplitterSize = function () {
        return Math.max(parseInt(WC.Window.Width * 0.33), userSettingModel.MinSidePanelSize);
    };
    self.SplitterResize = function (e) {
        e.sender.options.panes[0].max = self.GetMaxSplitterSize();
    };
    self.UpdateSplitter = function (splitter) {
        var largeWidth = 512;
        var sideContent = splitter.element.find('.side-content');
        var sideContentWidth = sideContent.width();
        sideContent.removeClass('small large');
        if (sideContentWidth > largeWidth)
            sideContent.addClass('large');
        else
            sideContent.addClass('small');
        splitter.element.children('.k-splitbar').off('dblclick');
    };
    self.BindSplitterEvents = function (splitter) {
        splitter.resizing._resizable
            .bind('start', jQuery.proxy(self.SplitterResizingStart, self, splitter))
            .bind('resizeend', jQuery.proxy(self.SplitterResizingEnd, self, splitter));
    };
    self.SplitterResizingStart = function (splitter) {
        splitter.wrapper.addClass('resizing');
    };
    self.SplitterResizingEnd = function (splitter) {
        splitter.wrapper.removeClass('resizing');
        self.StateManager.Size.Save(parseInt(splitter.options.panes[0].size));
        self.UpdateSplitter(splitter);
    };

    // toggle panel
    var fnCheckSidePanel;
    self.InitialToggle = function () {
        jQuery('#AngleSidePanelButton')
            .removeClass('disabled')
            .off('click').on('click', self.Toggle);
        var element = jQuery('#ContentWrapper');
        var collapsed = userSettingModel.SidePanelSettingsData[self.StateManager.Collapsed.Name];
        if (collapsed) {
            element.addClass('full');
            self.AddToolTipToButtonToggleSidePanel(Localization.OpenSidebar);
            self.ChangeIcon('../../Images/show-left-side-bar-fill.svg');
        }
        else {
            element.removeClass('full');
            self.AddToolTipToButtonToggleSidePanel(Localization.CloseSidebar);
            self.ChangeIcon('../../Images/hide-left-side-bar-fill.svg');
        }
    };
    self.Toggle = function () {
        if (jQuery('#AngleSidePanelButton').hasClass('disabled'))
            return;

        var element = jQuery('#ContentWrapper').addClass('toggling');
        var splitter = element.data(enumHandlers.KENDOUITYPE.SPLITTER);
        var isOpen = !element.hasClass('full');
        if (!isOpen) {
            splitter.expand('.side-content');
            self.AddToolTipToButtonToggleSidePanel(Localization.CloseSidebar);
            self.ChangeIcon('../../Images/hide-left-side-bar-fill.svg');
        }
        element.toggleClass('full');
        clearTimeout(fnCheckSidePanel);
        fnCheckSidePanel = setTimeout(function () {
            element.removeClass('toggling');
            if (isOpen) {
                splitter.collapse('.side-content');
                self.AddToolTipToButtonToggleSidePanel(Localization.OpenSidebar);
                self.ChangeIcon('../../Images/show-left-side-bar-fill.svg');
            }
               
            if (!_self.disable_states.disabled)
                self.StateManager.Collapsed.Save(isOpen);
        }, 350);
    };
    self.AddToolTipToButtonToggleSidePanel = function (toolTipText) {
        return jQuery('#AngleSidePanelButton')
            .attr({
                'data-role': 'tooltip',
                'data-tooltip-text': toolTipText
            });
    };

    self.ChangeIcon = function (path) {
        return jQuery('#ButtonToggleSidePanel_img').attr({ 'src': path });
       
    };
    self.Open = function (tabIndex) {
        var isOpen = !jQuery('#ContentWrapper').hasClass('full');
        if (!isOpen)
            self.Toggle();
        self.SelectTab(tabIndex);
    };
    self.Close = function () {
        var isOpen = !jQuery('#ContentWrapper').hasClass('full');
        if (isOpen)
            self.Toggle();
    };
    self.Disable = function () {
        var isOpen = !jQuery('#ContentWrapper').hasClass('full');
        jQuery('#AngleSidePanelButton').addClass('invisible');

        _self.disable_states.disabled = true;
        _self.disable_states.is_open = isOpen;

        // close the panel
        self.Close();
    };
    self.Enable = function () {
        _self.disable_states.disabled = false;
        jQuery('#AngleSidePanelButton').removeClass('invisible');

        // restore if it used to be opened
        if (_self.disable_states.is_open)
            self.Open();
    };

    // tab
    self.InitialTab = function () {
        var tabIndex = userSettingModel.SidePanelSettingsData[self.StateManager.Tab.Name];
        WC.HtmlHelper.Tab('#TabDetails', {
            index: tabIndex,
            change: self.StateManager.Tab.Save
        });
    };
    self.SelectTab = function (tabIndex) {
        if (typeof tabIndex !== 'undefined')
            jQuery('#TabDetails').data('Tab').active(tabIndex);
    };

    // accordions
    self.InitialAccordion = function (state, mappers) {
        jQuery.each(mappers, function (_key, target) {
            jQuery(target).data('callback', jQuery.proxy(self.SaveAccordion, self, state, mappers));
        });
        self.SetAccordionsToView(state, mappers);
    };
    self.SetAccordionsToView = function (state, mappers) {
        var accordions = userSettingModel.SidePanelSettingsData[state.Name];
        jQuery.each(mappers, function (key, target) {
            var open = accordions[key];
            if (open)
                jQuery(target).removeClass('close').addClass('open');
            else
                jQuery(target).removeClass('open').addClass('close');
        });
    };
    self.GetAccordionValues = function (state, mappers) {
        var values = userSettingModel.SidePanelSettingsData[state.Name];
        jQuery.each(mappers, function (key, target) {
            if (jQuery(target).length)
                values[key] = !jQuery(target).hasClass('close');
        });
        return values;
    };
    self.SaveAccordion = function (state, mappers) {
        var values = self.GetAccordionValues(state, mappers);
        state.Save(values);
    };
    self.OpenAccordion = function (target) {
        target = jQuery(target);
        var isOpen = target.hasClass('open');
        if (!isOpen)
            target.trigger('click');
    };
}

function SidePanelStateManager(name, callback) {
    var self = this;
    self.Name = name;
    self.Save = function (value) {
        userSettingModel.SetSidePanelSettings(self.Name, value);
        if (jQuery.isFunction(callback))
            callback(self.Name, value);
    };
}
