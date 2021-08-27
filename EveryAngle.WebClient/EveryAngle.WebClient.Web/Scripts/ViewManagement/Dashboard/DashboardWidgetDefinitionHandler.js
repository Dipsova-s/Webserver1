function DashboardWidgetDefinitionHandler(dashboardModel) {
    "use strict";

    var self = this;
    self.View = new DashboardWidgetDefinitionView();
    self.Model = new DashboardViewModel({});
    self.Widgets = ko.observableArray([]);
    self.DashboardModel = dashboardModel;

    self.Initial = function () {
        self.Model.Initial(self.DashboardModel.GetData());
        self.SetWidgets();
        self.Widget = {};
        self.ClosePopup();
    };
    self.SetWidgets = function () {
        var widgets = [];
        jQuery.each(self.DashboardModel.Data().layout.widgets, function (_index, widgetId) {
            var widget = self.Model.GetWidgetById(widgetId);
            if (!widget)
                return;

            var display = widget.GetDisplay();
            var model = {
                id: widgetId,
                icon_display: '',
                icon_publish: '',
                name: widget.GetWidgetName(),
                has_angle: !!widget.GetAngle()
            };
            if (display) {
                model.icon_display = 'icon-' + display.display_type;
                model.icon_publish = display.is_public ? '' : 'icon-private';
            }
            widgets.push(model);
        });
        self.Widgets(widgets);
    };
    self.ApplyHandler = function (container, viewSelector) {
        container.find(viewSelector).html(self.View.GetWidgetsTemplate());
        WC.HtmlHelper.ApplyKnockout(self, container);
    };

    // popup
    self.Widget = {};
    self.$WidgetContainer = jQuery();
    self.ShowPopup = function (widget, event) {
        if (widget.id === self.Widget.id)
            return;

        self.ClosePopup();
        var btnDefinition = jQuery(event.currentTarget).addClass('active');
        self.Widget = self.CreateWidgetModel(self.Model.GetWidgetById(widget.id));
        self.Widget.selected.subscribe(self.WidgetChange);
        self.Widget.widget_name.subscribe(self.CheckChange);
        var options = self.GetPopupOptions(btnDefinition);
        popup.Show(options);
    };
    self.GetPopupOptions = function (btnDefinition) {
        return {
            title: ' ',
            element: '#PopupDashboardWidget',
            className: 'dashboard-widget-popup',
            html: self.View.GetWidgetTemplate(),
            scrollable: false,
            resizable: false,
            draggable: false,
            center: false,
            position: { left: 0, top: 0 },
            maxHeight: 400,
            width: 400,
            actions: ['Close'],
            buttons: [
                {
                    text: Localization.Apply,
                    isSecondary: true,
                    position: 'right',
                    className: 'btn-small disabled btn-apply',
                    click: self.Apply
                }
            ],
            open: jQuery.proxy(self.ShowPopupCallback, self, btnDefinition),
            close: jQuery.proxy(self.OnPopupClose, self, btnDefinition)
        };
    };
    self.OnPopupClose = function (btnDefinition, e) {
        self.Widget = {};
        btnDefinition.removeClass('active');
        popup.Destroy(e);
    };
    self.ClosePopup = function () {
        popup.Close('#PopupDashboardWidget');
    };
    self.ShowPopupCallback = function (btnDefinition, e) {
        self.$WidgetContainer = e.sender.wrapper;
        self.$WidgetContainer.find('.k-window-title').html(self.Widget.angle_name);
        WC.HtmlHelper.ApplyKnockout(self, e.sender.element);

        // set popup position
        e.sender.setOptions({ position: self.GetPopupPosition(btnDefinition, e) });

        // scroll to selected item
        self.ScrollToSelectedItem();
    };
    self.GetPopupPosition = function (btnDefinition, e) {
        var row = btnDefinition.closest('.item');

        // locate at bottom
        var position = row.offset();
        position.left += row.outerWidth();
        position.top += row.outerHeight();

        // check bottom
        var popupHeight = e.sender.wrapper.outerHeight();
        if (position.top + popupHeight > WC.Window.Height) {
            // move to right
            position.left += 10;
            position.top -= popupHeight / 2;
        }
        else {
            position.left = Math.max(5, position.left - e.sender.wrapper.outerWidth());
            position.top += 40;
        }
        return position;
    };
    self.ScrollToSelectedItem = function () {
        var row = self.$WidgetContainer.find('input[name="display"]:checked').closest('.listview-item');
        var index = row.index();
        if (index > 8)
            self.$WidgetContainer.find('.listview').scrollTop((index - 3) * row.outerHeight());
    };
    self.CreateWidgetModel = function (widget) {
        var angle = widget.GetAngle();
        var displays = jQuery.map(angle.display_definitions, function (display) {
            var hasJump = WC.ModelHelper.HasFollowup(display.query_blocks);
            var hasFilter = WC.ModelHelper.HasFilter(display.query_blocks);
            var link = self.GetLink(angle, display);
            var parameters = self.GetParameterizedInfo(angle, display);
            var validation = validationHandler.GetDisplayValidation(display, angle.model);
            var isError = validation.Level === validationHandler.VALIDATIONLEVEL.ERROR;
            var isWarning = validation.Level === validationHandler.VALIDATIONLEVEL.WARNING;
            var iconDisplay = 'icon-' + display.display_type;
            iconDisplay += display.is_angle_default ? ' default' : '';
            iconDisplay += display.used_in_task ? ' schedule' : '';
            var iconPublish = display.is_public ? 'none' : 'icon-private';
            var iconValid = isError ? 'validError' : isWarning ? 'validWarning' : 'none';
            var iconFilter = hasJump ? 'icon-followup' : hasFilter ? 'icon-filter' : 'none';
            var iconParameters = display.is_parameterized ? 'icon-parameterized' : 'none';
            return {
                uri: display.uri,
                name: display.name,
                default_name: DashboardWidgetViewModel.prototype.GetAngleDisplayName(angle.name, display.name, angle.model),
                icon_display: iconDisplay,
                icon_publish: iconPublish,
                icon_valid: iconValid,
                icon_filter: iconFilter,
                icon_parameters: iconParameters,
                is_public: display.is_public,
                link: link,
                parameters: parameters,
                enable: self.CanSelectDisplay(display)
            };
        });
        displays.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
        var model = {
            id: widget.id,
            angle_name: self.GetAngleName(angle),
            default_name: ko.observable(widget.GetDefaultWidgetName()),
            widget_name: ko.observable(jQuery.trim(widget.GetWidgetName())),
            selected: ko.observable(widget.display),
            displays: displays,
            raw: {
                widget_name: jQuery.trim(widget.name()),
                display: widget.display
            }
        };
        return model;
    };
    self.WidgetChange = function (newValue) {
        var selected = self.Widget.displays.findObject('uri', newValue);
        var widgetName = jQuery.trim(self.Widget.widget_name());
        if (selected && (self.Widget.default_name() === widgetName || !widgetName)) {
            self.Widget.default_name(selected.default_name);
            self.Widget.widget_name(selected.default_name);
        }
        self.CheckChange();
    };
    self.CheckChange = function () {
        if (self.HasChanged())
            self.$WidgetContainer.find('.btn-apply').removeClass('disabled');
        else
            self.$WidgetContainer.find('.btn-apply').addClass('disabled');
    };
    self.CheckWidgetName = function () {
        if (!jQuery.trim(self.Widget.widget_name()))
            self.Widget.widget_name(self.Widget.default_name());
    };
    self.GetAngleName = function (angle) {
        var isValid = validationHandler.GetAngleValidation(angle).Valid;
        var name = modelsHandler.GetModelName(angle.model) + ' - ' + angle.name;
        return [
            '<div class="displayNameContainer small">',
                '<div class="front">',
                    '<i class="icon icon-' + (angle.is_template ? 'template' : 'angle') + '"></i>',
                '</div>',
                '<span class="name">' + name + '</span>',
                '<div class="rear">',
                    !angle.is_published ? '<i class="icon icon-private"></i>' : '',
                    angle.is_parameterized ? '<i class="icon icon-parameterized"></i>' : '',
                    !isValid ? '<i class="icon validError"></i>' : '',
                '</div>',
            '</div>'
        ].join('');
    };
    self.GetLink = function (angle, display) {
        var q = {};
        if (!display.is_public) {
            q[enumHandlers.ANGLEPARAMETER.TARGET] = enumHandlers.ANGLETARGET.PUBLISH;
        }
        q[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;

        return WC.Utility.GetAnglePageUri(angle.uri, display.uri, q);
    };
    self.GetParameterizedInfo = function (angle, display) {
        var info = self.DashboardModel.GetAngleExecutionParametersInfo(angle, display);
        return !jQuery.isEmptyObject(info) ? info : null;
    };
    self.CanUpdateWidget = function () {
        return self.DashboardModel.CanUpdateDashboard('widget_definitions');
    };
    self.CanSelectDisplay = function (display) {
        var canSelectDisplay = !self.Model.Data().is_published() || self.Model.Data().is_published() && display.is_public;
        return self.CanUpdateWidget() && canSelectDisplay;
    };
    self.OpenDisplay = function (model) {
        var watcherKey = enumHandlers.STORAGE.WATCHER_DASHBOARD_PUBLICATIONS.replace('{uri}', model.uri);
        jQuery.storageWatcher(watcherKey, model.is_public);

        // set parameterized before go to Angle page
        if (model.parameters)
            jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION, model.parameters);

        return true;
    };
    self.HasChanged = function () {
        return self.Widget.raw.display !== self.Widget.selected()
            || self.Widget.raw.widget_name !== self.GetWidgetName();
    };
    self.GetWidgetName = function () {
        var widgetName = jQuery.trim(self.Widget.widget_name());
        return widgetName === self.Widget.default_name() ? '' : widgetName;
    };
    self.Apply = function () {
        if (!self.HasChanged())
            return;

        self.ApplyCallback(self.Widget.id, self.GetWidgetName(), self.Widget.selected());
        self.ClosePopup();
    };
    self.ApplyCallback = jQuery.noop;
}