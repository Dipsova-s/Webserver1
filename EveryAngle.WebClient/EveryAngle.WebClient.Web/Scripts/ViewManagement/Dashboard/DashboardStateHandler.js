function DashboardStateHandler() {
    "use strict";

    var self = this;
    self.View = new DashboardStateView();
    self.Widgets = ko.observableArray([]);

    // shared functions
    self.SetDashboardData = function (item) {
        self.SetItemData(ko.toJS(item));
        self.Widgets(self.GetWidgetsData(item.widget_definitions));
        self.CanSetState(!dashboardModel.IsTemporaryDashboard(item.uri));
    };
    self.GetWidgetsData = function (widgets) {
        var data = jQuery.map(widgets, function (widget) {
            var angle = widget.GetAngle();
            var display = widget.GetDisplay();
            if (angle && display) {
                return self.GetWidgetData(widget, angle, display);
            }
            else {
                return self.GetEmptyWidgetData(widget);
            }
        });
        data.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
        return data;
    };
    self.GetWidgetData = function (widget, angle, display) {
        return {
            id: widget.id,
            name: widget.GetWidgetName(),
            uri: display.uri,
            display_icon: ('icon-' + display.display_type) + (display.is_angle_default ? ' default' : ''),
            is_public: display.is_public,
            is_validated: angle.is_validated,
            parameterized: self.GetParametersInfo(angle, display),
            link: self.GetWidgetLink(angle, display),
            click: self.ClickWidgetLink
        };
    };
    self.GetEmptyWidgetData = function (widget) {
        return {
            id: widget.id,
            name: widget.GetWidgetName(),
            uri: '',
            display_icon: '',
            is_public: false,
            is_validated: false,
            parameterized: {},
            link: '',
            click: jQuery.noop
        };
    };
    self.GetParametersInfo = function (angle, display) {
        return dashboardModel.GetAngleExecutionParametersInfo(angle, display);
    };
    self.GetWidgetLink = function (angle, display) {
        if (!angle || !display)
            return '';

        var query = {};
        if (!display.is_public) {
            query[enumHandlers.ANGLEPARAMETER.TARGET] = enumHandlers.ANGLETARGET.PUBLISH;
        }
        query[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;

        return WC.Utility.GetAnglePageUri(angle.uri, display.uri, query);
    };
    self.ClickWidgetLink = function (model) {
        var watcherKey = enumHandlers.STORAGE.WATCHER_DASHBOARD_PUBLICATIONS.replace('{uri}', model.uri);
        jQuery.storageWatcher(watcherKey, model.is_public);

        // set parameterized before go to Angle page
        if (!jQuery.isEmptyObject(model.parameterized)) {
            jQuery.localStorage(enumHandlers.ANGLEPARAMETER.ASK_EXECUTION, model.parameterized);
        }
        return true;
    };
    self.Update = function (handler, uri, data) {
        return jQuery.isEmptyObject(data) ? jQuery.whenDelay(300) : handler.call(null, uri, data);
    };
    self.UpdateState = function (uri, data) {
        return self.Update(dashboardModel.UpdateState, uri, data);
    };
}
DashboardStateHandler.extend(ItemStateHandler);