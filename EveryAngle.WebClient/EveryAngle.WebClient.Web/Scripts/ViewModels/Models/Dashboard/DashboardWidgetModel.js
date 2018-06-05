function DashboardWidgetViewModel(model) {
    "use strict";

    //BOF: View model properties
    var self = this;
    //EOF: View model properties

    //BOF: View model methods

    // SetData: set data from widget_definitions[x] to model
    // @param
    // - data: object
    self.SetData = function (data) {
        data = ko.toJS(data);

        jQuery.extend(self, data);

        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        var guid = jQuery.GUID();
        if (!self.id)
            self.id = 'w' + guid.replace(/-/g, '');
        if (!self.uri)
            self.uri = '';

        // observable properties
        if (!data.multi_lang_name && typeof data.name !== 'undefined') {
            data.multi_lang_name = [{
                lang: defaultLanguage,
                text: data.name
            }];
        }
        if (!data.multi_lang_description && typeof data.description !== 'undefined') {
            data.multi_lang_description = [{
                lang: defaultLanguage,
                text: data.description
            }];
        }
        if (data.multi_lang_name && data.multi_lang_name.length !== data.multi_lang_description.length) {
            data.multi_lang_description = [];
            for (var i = 0; i < data.multi_lang_name.length; i++) {
                data.multi_lang_description[i] = {
                    lang: data.multi_lang_name[i].lang,
                    text: ''
                };
            }
        }
        self.multi_lang_name = ko.observableArray(WC.Utility.ToArray(data.multi_lang_name));
        self.multi_lang_description = ko.observableArray(WC.Utility.ToArray(data.multi_lang_description));

        self.name = function () {
            return jQuery.trim(WC.Utility.GetDefaultMultiLangText(self.multi_lang_name()));
        };
        self.description = function () {
            return WC.Utility.GetDefaultMultiLangText(self.multi_lang_description());
        };

        if (!self.angle)
            self.angle = '';
        if (!self.display)
            self.display = '';

        // other custom
        if (typeof data.widget_details === 'string' || typeof data.widget_details === 'undefined') {
            self.widget_details = WC.Utility.ParseJSON(data.widget_details);
        }
        else if (data.widget_details instanceof Object) {
            self.widget_details = jQuery.extend({}, data.widget_details);
        }

        // merge data from old version
        if (self.widget_details.index) {
            delete self.widget_details.index;
        }
        if (self.widget_details.angle) {
            if (!self.angle) self.angle = self.widget_details.angle;
            delete self.widget_details.angle;
            delete self.widget_details.angle_id;
            delete self.widget_details.angle_uri;
        }
        if (self.widget_details.display) {
            if (!self.display) self.display = self.widget_details.display;
            delete self.widget_details.display;
            delete self.widget_details.display_id;
            delete self.widget_details.display_uri;
        }
    };

    // GetData: get data which use for save into database
    self.GetData = function () {
        var data = WC.ModelHelper.CleanData(this);

        // convert objects to string
        data.widget_details = JSON.stringify(data.widget_details);

        return data;
    };

    // GetAngle: get angle from dashboardModel.Angles
    self.GetAngle = function () {
        var by = dashboardModel.KeyName;

        if (dashboardModel.KeyName === 'uri' && self.angle.indexOf('angles/') === -1) {
            // angle is id but key is uri
            by = 'id';
        }
        else if (dashboardModel.KeyName === 'id' && self.angle.indexOf('angles/') !== -1) {
            // angle is uri but key is id
            by = 'uri';
        }
        return dashboardModel.GetAngle(by, self.angle);
    };

    // GetDisplay: get display from dashboardModel.Angles
    self.GetDisplay = function () {
        if (self.display) {
            var angle = self.GetAngle();
            if (angle) {
                return angle.display_definitions.findObject(dashboardModel.KeyName, self.display);
            }
        }

        return null;
    };

    // GetQueryDefinitions: get display definitions
    self.GetQueryDefinitions = function () {
        var display = self.GetDisplay(),
            definitions = [],
            queryStep = { queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS, query_steps: [] },
            angle = self.GetAngle(),
            baseClasses = jQuery.grep(angle.query_definition, function (definition) { return definition.queryblock_type === enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES; }),
            angleQuerySteps = jQuery.grep(angle.query_definition, function (definition) { return definition.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS; }),
            displayQuerySteps = jQuery.grep(display.query_blocks, function (queryBlock) { return queryBlock.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS; });

        definitions.push(baseClasses[0]);
        queryStep.query_steps = queryStep.query_steps.concat(angleQuerySteps.length !== 0 ? angleQuerySteps[0].query_steps : [], displayQuerySteps.length !== 0 ? displayQuerySteps[0].query_steps : []);
        definitions.push(queryStep);

        return definitions;
    };

    // GetDefaultWidgetName: get default widget name
    self.GetDefaultWidgetName = function () {
        var angle = self.GetAngle();
        var display = self.GetDisplay();
        return self.GetAngleDisplayName(angle.name, display.name, angle.model);
    };

    // GetWidgetName: get widget name (fallback to default name)
    self.GetWidgetName = function () {
        return self.name() || self.GetDefaultWidgetName();
    };

    //EOF: View modle methods

    // constructure action
    if (typeof model !== 'undefined') {
        self.SetData(model);
    }
}

// GetAngleDisplayName: get angle display name
DashboardWidgetViewModel.prototype.GetAngleDisplayName = function (angleName, displayName, modelUri) {
    var modelName = modelsHandler.GetModelName(modelUri);
    return modelName + ' - ' + angleName + ' - ' + displayName;
};