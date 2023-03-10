var dashboardModel = new DashboardViewModel({});

function DashboardViewModel(model) {
    "use strict";

    //BOF: View model properties
    var self = this;
    self.Name = 'dashboard';
    self.Data = ko.observable(null);
    self.Angles = [];
    // property that use for keep angle/display
    self.KeyName = 'uri';
    self.BusinessProcessNameSeparator = ', ';
    //EOF: View model properties

    //BOF: View model methods

    self.HasData = function () {
        return self.Data().uri;
    };
    self.Initial = function (model) {
        self.SetData(model || {}, false, false);
    };

    // GetInitialData: get initial dashboard data
    self.GetInitialData = function () {
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        var currentUser = userModel.Data();

        return {
            assigned_labels: [],
            assigned_tags: [],
            is_published: false,
            is_validated: false,
            user_specific: {
                is_starred: false,
                private_note: '',
                private_tags: [],
                times_executed: 0
            },
            widget_definitions: [],
            layout: JSON.stringify({
                structure: [
                ]
            }),
            multi_lang_name: [{
                lang: defaultLanguage,
                text: 'Dashboard'
            }],
            multi_lang_description: [{
                lang: defaultLanguage,
                text: ''
            }],
            authorizations: {
                'update_user_specific': true,
                'create_widget': true,
                'delete': true,
                'publish': true,
                'unpublish': true,
                'unvalidate': false,
                'update': true,
                'validate': false
            },
            created: {
                user: currentUser.uri,
                datetime: WC.DateHelper.GetCurrentUnixTime(),
                full_name: currentUser.full_name
            }
        };
    };

    // GetDefaultLayoutConfig: get initial dashboard structure
    self.GetDefaultLayoutConfig = function (widgetCount) {
        var sizes = {
            1: ['100%'],
            2: ['50%', '50%'],
            3: ['33.4%', '33.3%', '33.3%'],
            4: ['25%', '25%', '25%', '25%']
        };
        var structure = [];
        if (widgetCount === 1) {
            structure.push({ items: sizes[1], height: '100%' });
        }
        else if (widgetCount === 2) {
            structure.push({ items: sizes[2], height: '100%' });
        }
        else if (widgetCount === 4) {
            structure.push({ items: sizes[2], height: '50%' });
            structure.push({ items: sizes[2], height: '50%' });
        }
        else if (widgetCount > 0) {
            var mod3 = widgetCount % 3;
            var mod4 = widgetCount % 4;
            var mod = mod4 === 0 ? 4 : mod3 === 0 ? 3 : mod3 > mod4 ? 3 : 4;
            var height = Math.floor(mod / (Math.ceil(widgetCount / mod) * mod) * 100);
            var remainHeight = 100;
            while (widgetCount > 0) {
                structure.push({ items: sizes[Math.min(widgetCount, mod)], height: height + '%' });
                remainHeight -= height;
                widgetCount -= mod;
            }
            structure[structure.length - 1].height = height + remainHeight + '%';
        }
        return { structure: structure };
    };

    // GetDefaultDashboardName: get default dashboard name 'Dashboard {BP} #{NUMBER}'
    self.GetDefaultDashboardName = function () {
        var name = 'Dashboard {BP} #{NUMBER}';
        var businessProcesses = self.GetBusinessProcesses();
        name = name.replace('{BP}', businessProcesses.join(self.BusinessProcessNameSeparator));

        var uri = '/items';
        var uriParams = {};
        uriParams[enumHandlers.PARAMETERS.SORT] = 'name';
        uriParams[enumHandlers.PARAMETERS.SORT_DIR] = 'desc';
        uriParams[enumHandlers.PARAMETERS.FQ] = 'facetcat_itemtype:facet_dashboard';
        uriParams[enumHandlers.PARAMETERS.INCLUDE_FACETS] = false;
        uriParams[enumHandlers.PARAMETERS.Q] = '"' + name.substr(0, name.indexOf('#') - 1) + '"';
        uriParams[enumHandlers.PARAMETERS.OFFSET] = 0;
        uriParams[enumHandlers.PARAMETERS.LIMIT] = systemSettingHandler.GetMaxPageSize();

        var getBusinessProcessesFromName = function (n) {
            n = n.substr(n.indexOf(' ') + 1);
            n = n.substr(0, n.indexOf('#') - 1);

            if (n)
                return n.split(self.BusinessProcessNameSeparator);
            else return [];
        };

        return GetDataFromWebService(directoryHandler.ResolveDirectoryUri(uri), uriParams)
            .then(function (data) {
                var number = 1, numberPosition;
                jQuery.each(data.items, function (key, value) {
                    numberPosition = value.name.indexOf('#');
                    if (numberPosition !== -1 && jQuery.deepCompare(getBusinessProcessesFromName(value.name), businessProcesses, false)) {
                        number = parseInt(value.name.substr(numberPosition + 1), 10) + 1;
                        return false;
                    }
                });

                return jQuery.when(name.replace('{NUMBER}', number));
            });
    };

    // SetData: set data into self.Data & localStorage
    // @param
    // - data: object
    // - storage: optional(false), boolean, save in localStorag or not
    // - watcher: optional(true), boolean, set watcher or not
    self.SetData = function (data, storage, watcher) {
        if (typeof storage === 'undefined')
            storage = false;
        if (typeof watcher === 'undefined')
            watcher = true;

        // make sure that is js not knockout
        data = ko.toJS(data);

        data.angles = data.angles || data.uri + '/angles';
        data.id = ko.observable(data.id);
        data.assigned_labels = WC.Utility.ToArray(data.assigned_labels);
        data.assigned_tags = WC.Utility.ToArray(data.assigned_tags);

        data.multi_lang_name = WC.Utility.ToArray(data.multi_lang_name);
        data.multi_lang_description = WC.Utility.ToArray(data.multi_lang_description);
        if (data.multi_lang_name.length !== data.multi_lang_description.length) {
            var oriDescriptions = data.multi_lang_description.slice();
            data.multi_lang_description = [];

            for (var i = 0; i < data.multi_lang_name.length; i++) {
                var oriDesptionByLang = oriDescriptions.findObject('lang', data.multi_lang_name[i].lang);
                var newDesption = oriDesptionByLang ? oriDesptionByLang.text : '';

                data.multi_lang_description[i] = {
                    lang: data.multi_lang_name[i].lang,
                    text: newDesption
                };
            }
        }
        data.multi_lang_name = ko.observableArray(data.multi_lang_name);
        data.multi_lang_description = ko.observableArray(data.multi_lang_description);

        // name
        data.name = function () {
            return WC.Utility.GetDefaultMultiLangText(self.Data().multi_lang_name());
        };

        // description
        data.description = function () {
            return WC.Utility.GetDefaultMultiLangText(self.Data().multi_lang_description());
        };

        // user_specific
        if (!data.user_specific)
            data.user_specific = {};
        data.user_specific.private_note = ko.observable(data.user_specific.private_note || '');
        data.user_specific.private_tags = ko.observableArray(WC.Utility.ToArray(data.user_specific.private_tags));
        data.user_specific.is_starred = ko.observable(data.user_specific.is_starred || false);
        data.user_specific.times_executed = ko.observable(data.user_specific.times_executed || 0);
        data.user_specific.execute_on_login = ko.observable(data.user_specific && data.user_specific.execute_on_login || false);

        data.is_validated = ko.observable(data.is_validated || false);
        data.is_published = ko.observable(data.is_published || false);

        self.SetDashboardStatistics('created', data, data.created);
        self.SetDashboardStatistics('changed', data, data.changed);
        self.SetDashboardStatistics('executed', data, data.executed);

        // authorizations
        WC.ModelHelper.ExtendAuthorization(data);

        var widgetDefinitions = [];
        jQuery.each(WC.Utility.ToArray(data.widget_definitions), function (key, value) {
            widgetDefinitions.push(new DashboardWidgetViewModel(value));
        });
        data.widget_definitions = [];

        // layout
        if (typeof data.layout === 'string' || typeof data.layout === 'undefined')
            data.layout = WC.Utility.ParseJSON(data.layout);
        if (!data.layout.widgets || data.layout.widgets.length !== widgetDefinitions.length) {
            if (!data.layout.widgets || !data.layout.widgets.length)
                data.layout.widgets = [];

            jQuery.each(widgetDefinitions, function (key, value) {
                if (jQuery.inArray(value.id, data.layout.widgets) === -1)
                    data.layout.widgets.push(value.id);
            });
        }
        if (!data.layout.structure)
            data.layout.structure = self.GetDefaultLayoutConfig(widgetDefinitions.length || 0).structure;

        var widget;
        jQuery.each(data.layout.widgets, function (index, widgetId) {
            widget = widgetDefinitions.findObject('id', widgetId);
            if (widget) {
                data.widget_definitions.push(widgetDefinitions.findObject('id', widgetId));
            }
        });

        // query_definition
        data.filters = WC.Utility.ToArray(data.filters);
        jQuery.each(data.filters, function (index) {
            self.ExtendDashboardFilter(data.filters[index]);
        });

        self.Data(data);

        if (watcher && data.uri)
            jQuery.storageWatcher(enumHandlers.STORAGE.WATCHER_DASHBOARD_WIDGETS_COUNT.replace('{uri}', data.uri), data.widget_definitions.length);

        if (storage) {
            var storageData = jQuery.localStorage(self.Name) || {};
            storageData[data.uri] = ko.toJS(data);
            jQuery.localStorage(self.Name, storageData);
        }
    };

    self.SetDashboardStatistics = function (property, sourceData, info) {
        var statisticInfo = jQuery.extend({}, sourceData[property], info);
        if (statisticInfo) {
            sourceData[property] = {
                user: ko.observable(statisticInfo.user),
                datetime: ko.observable(statisticInfo.datetime),
                full_name: ko.observable(statisticInfo.full_name)
            };
        }
    };

    // GetData: get data which use for save into database
    self.GetData = function () {
        var widgets = [];
        jQuery.each(self.Data().widget_definitions, function (index, widget) {
            if (widget)
                widgets[index] = widget.GetData();
        });

        var data = WC.ModelHelper.CleanData(self.Data());
        data.widget_definitions = widgets;

        // convert objects to string
        data.layout = JSON.stringify(data.layout);

        // remove unused properties
        delete data.name;
        delete data.description;

        return data;
    };

    // CreateDashboard: create dashboard from data
    // @param
    // - data: object
    self.CreateDashboard = function (data) {
        self.DeleteReadOnlyProperties(data);

        if (data.multi_lang_name) {
            jQuery.each(data.multi_lang_name, function (index, name) {
                name.text = name.text.substr(0, 255);
            });
        }

        var query = {};
        query[enumHandlers.PARAMETERS.REDIRECT] = 'no';
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        return CreateDataToWebService(directoryHandler.ResolveDirectoryUri('dashboards?' + jQuery.param(query)), data)
            .then(function (data) {
                self.SetData(data);

                return jQuery.when(data);
            });
    };

    // AddWidget: add widget into dashboard
    // @param
    // - widget: json, data for add into the dashboard object
    // - layout: dashboard layout to be update after add the widget
    self.AddWidget = function (widget, layout) {
        var query = {};
        query[enumHandlers.PARAMETERS.REDIRECT] = 'no';
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        return CreateDataToWebService(self.Data().widgets + '?' + jQuery.param(query), widget)
            .then(function (response) {
                var model = new DashboardWidgetViewModel(response);
                self.Data().widget_definitions[self.Data().widget_definitions.length - 1] = model;

                var deferred = jQuery.Deferred();
                if (typeof layout !== 'undefined') {
                    var data = {
                        layout: typeof layout === 'string' ? layout : JSON.stringify(layout)
                    };
                    self.SaveDashboard(data).done(function () {
                        deferred.resolve(response);
                    });
                }
                else {
                    deferred.resolve(response);
                }
                return deferred.promise();
            });
    };

    self.UpdateWidgetById = function (id, data) {
        var widget = self.GetWidgetById(id);

        if (widget) {
            if (self.IsTemporaryDashboard()) {
                widget.SetData(jQuery.extend({}, widget, data));

                return jQuery.when(widget.GetData());
            }
            else {
                return UpdateDataToWebService(widget.uri + '?multilingual=yes&forced=true', data)
                    .then(function (data) {
                        widget.SetData(data);

                        return jQuery.when(widget.GetData());
                    });
            }
        }
    };

    // DeleteWidgetById: delete widget by widget_id
    // @param
    // - id: widget id
    // - layout: dashboard layout to be update after delete the widget
    self.DeleteWidgetById = function (id, layout) {
        if (self.IsTemporaryDashboard()) {
            // remove widget
            self.Data().widget_definitions.removeObject('id', id);
            self.Data().layout = layout;
            return jQuery.when(true);
        }
        else {
            var widget = self.GetWidgetById(id);
            return DeleteDataToWebService(widget.uri)
                .then(function () {
                    // remove widget
                    self.Data().widget_definitions.removeObject('id', id);

                    var deferred = jQuery.Deferred();
                    var data = { layout: JSON.stringify(layout) };
                    setTimeout(function () {
                        self.SaveDashboard(data)
                            .fail(deferred.reject)
                            .done(deferred.resolve);
                    }, 1000);
                    return deferred.promise();
                });
        }
    };

    // GetWidgetById: get widget by widget_id
    // @param
    // - id: widget id
    self.GetWidgetById = function (id) {
        return self.Data().widget_definitions.findObject('id', id);
    };

    // SaveDashboard: save dashboard from data
    // @param
    // - data: object
    self.SaveDashboard = function (data) {
        self.DeleteReadOnlyProperties(data);
        if (typeof data.is_published !== 'undefined') {
            return self.UpdateState(self.Data().state, { is_published: data.is_published })
                .then(function () {
                    //M4-12831: Fixed error message when angle is uppublished
                    if (data.is_published === false && self.Data().created.user() !== userModel.Data().uri)
                        dashboardPageHandler.BackToSearch();

                    delete data.is_published;
                    return self.UpdateDashboard(self.Data().uri, data);
                });
        }
        else if (typeof data.is_validated !== 'undefined') {
            if (data.is_validated === true) {
                delete data.is_validated;
                return self.UpdateDashboard(self.Data().uri, data)
                    .then(function () {
                        return self.UpdateState(self.Data().state, { is_validated: true });
                    });
            }
            else {
                delete data.is_validated;
                return self.UpdateState(self.Data().state, { is_validated: false })
                    .then(function () {
                        return self.UpdateDashboard(self.Data().uri, data);
                    });
            }
        }
        else {
            return self.UpdateDashboard(self.Data().uri, data);
        }
    };
    self.UpdateDashboard = function (uri, data) {
        if (!jQuery.isEmptyObject(data)) {
            if (data.multi_lang_name) {
                jQuery.each(data.multi_lang_name, function (index, name) {
                    name.text = name.text.substr(0, 255);
                });
            }
            return UpdateDataToWebService(uri + '?multilingual=yes', data)
                .then(function (data) {
                    self.SetData(data);

                    return jQuery.when(data);
                });
        }
        else {
            return jQuery.when(self.GetData());
        }
    };
    self.UpdateState = function (uri, updateState) {
        return UpdateDataToWebService(uri, updateState)
            .then(function () {
                return self.LoadDashboard(self.Data().uri);
            });
    };

    // SaveAsDashboard: set as dashboard
    // @param
    // - data: object
    self.SaveAsDashboard = function (data) {
        delete data.id;
        delete data.uri;
        delete data.user_specific;

        // set to private
        data.is_published = false;
        data.is_validated = false;

        // assigns new widget id
        var layout = JSON.parse(data.layout);
        jQuery.each(layout.widgets, function (index, widgetId) {
            var widget = data.widget_definitions.findObject('id', widgetId);
            if (widget) {
                widget.id = 'w' + jQuery.GUID().replace(/-/g, '');
                layout.widgets[index] = widget.id;
                delete widget.uri;
            }
            else {
                layout.widgets[index] = null;
            }
        });

        // clean bad widgets
        for (var i = layout.widgets.length - 1; i >= 0; i--) {
            if (!layout.widgets[i])
                layout.widgets.split(i, 1);
        }

        // set layout
        data.layout = JSON.stringify(layout);

        return self.CreateDashboard(data);
    };

    // SetAssignedLabels: set assigned labels
    // @param
    // - labels: Array
    self.SetAssignedLabels = function (labels) {
        if (self.IsTemporaryDashboard()) {
            self.Data().assigned_labels = labels;
            return jQuery.when(self.GetData());
        }
        else {
            return self.SaveDashboard({ assigned_labels: labels });
        }
    };

    // SetTags: set tags
    // @param
    // - tags: Array
    self.SetTags = function (tags) {
        if (self.IsTemporaryDashboard()) {
            self.Data().assigned_tags = tags;
            return jQuery.when(self.GetData());
        }
        else {
            return self.SaveDashboard({ assigned_tags: tags });
        }
    };

    // SetFavorite: set is_starred
    // @param
    // - status: true | false
    self.SetFavorite = function (status) {
        if (self.IsTemporaryDashboard()) {
            self.Data().user_specific.is_starred(status);
            return jQuery.when(self.GetData());
        }
        else {
            return self.SaveDashboard({ user_specific: { is_starred: status } });
        }
    };

    // SetPrivateNote: set is_starred
    // @param
    // - status: true | false
    self.SetPrivateNote = function (note) {
        if (self.IsTemporaryDashboard()) {
            self.Data().user_specific.private_note(note);
            return jQuery.when(self.GetData());
        }
        else {
            return self.SaveDashboard({ user_specific: { private_note: note } });
        }
    };

    // SetExecuteOnLogin: set execute_on_login
    // @param
    // - status: true | false
    self.SetExecuteOnLogin = function (executeOnLogin) {
        if (self.IsTemporaryDashboard()) {
            self.Data().user_specific.execute_on_login(executeOnLogin);
            return jQuery.when(self.GetData());
        }
        else {
            return self.SaveDashboard({ user_specific: { execute_on_login: executeOnLogin } });
        }
    };

    // LoadDashboard: load dashboard data
    // @param
    // - uri: dashboard uri
    self.LoadDashboard = function (uri) {
        if (self.IsTemporaryDashboard(uri)) {
            var storage = jQuery.localStorage(self.Name);
            if (storage && storage[uri]) {
                self.SetData(storage[uri]);
                return jQuery.when(storage[uri]);
            }
            else {
                var response = {
                    responseText: 'Dashboard does not exists'
                };
                return jQuery.Deferred().reject(response, null, null).promise();
            }
        }
        else {
            var query = {};
            query[enumHandlers.PARAMETERS.CACHING] = false;
            query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
            return GetDataFromWebService(directoryHandler.ResolveDirectoryUri(uri), query)
                .done(function (data) {
                    self.SetData(data);
                });
        }
    };

    // LoadAngles: load angles by ?
    // @param
    // - by: uri | id, load by whict property
    // - multilingual: true | false, use multilingual
    // - forceLoad: true | false, force load by using an old school method
    self.LoadAngles = function (by, multilingual, forceLoad) {
        var isTemporaryDashboard = self.IsTemporaryDashboard(self.Data().uri);
        if (typeof forceLoad === 'undefined')
            forceLoad = isTemporaryDashboard ? false : true;
        if (typeof by !== 'string')
            by = self.KeyName;
        if (typeof multilingual === 'undefined' || multilingual)
            multilingual = 'yes';
        else
            multilingual = 'no';

        var isLoadAllAngle;
        if (isTemporaryDashboard || forceLoad) {
            if (forceLoad) {
                isLoadAllAngle = false;
            }
            else {
                isLoadAllAngle = true;
                jQuery.each(self.Data().widget_definitions, function (index, widget) {
                    if (!widget.GetAngle()) {
                        isLoadAllAngle = false;
                        return false;
                    }
                });
            }

            if (isLoadAllAngle) {
                return jQuery.when(self.Angles);
            }
            else {
                return by === 'id' ? self.LoadAnglesByIds(multilingual) : self.LoadAnglesByUri(multilingual);
            }
        }
        else {
            isLoadAllAngle = true;
            jQuery.each(self.Data().widget_definitions, function (index, widget) {
                if (!widget.GetAngle()) {
                    isLoadAllAngle = false;
                    return false;
                }
            });

            var deferred = jQuery.Deferred();
            if (isLoadAllAngle) {
                deferred.resolve(self.Angles);
            }
            else {
                var query = {};
                query[enumHandlers.PARAMETERS.CACHING] = false;
                query[enumHandlers.PARAMETERS.MULTILINGUAL] = multilingual;
                GetDataFromWebService(directoryHandler.ResolveDirectoryUri(self.Data().angles), query)
                    .fail(function (xhr, status, error) {
                        // if dashboards/x/angles does not exists then force to use the old school method
                        if (xhr.status === 404) {
                            errorHandlerModel.Enable(false);
                            setTimeout(function () {
                                errorHandlerModel.Enable(true);
                            }, 100);
                            self.LoadAngles(by, multilingual, true)
                                .done(function (data, status, xhr) {
                                    deferred.resolve(data, status, xhr);
                                });
                        }
                        else {
                            deferred.reject(xhr, status, error);
                        }
                    })
                    .done(function (data) {
                        if (data.angles && data.angles.length !== 0) {
                            self.Angles = data.angles;
                            jQuery.each(self.Angles, function (index, angle) {
                                self.MapAngle(angle);
                            });
                        }
                        deferred.resolve(data);
                    });
            }
            return deferred.promise();
        }
    };

    // LoadAnglesByIds: load angles by ids
    self.LoadAnglesByIds = function (multilingual) {
        var requests = {}, deferred = [], displayDeferred = [];

        jQuery.each(self.Data().widget_definitions, function (index, widget) {
            var angle = widget.GetAngle();
            if (!angle)
                return;

            var modelUri = angle.model;
            if (!requests[modelUri])
                requests[modelUri] = [];

            if (jQuery.inArray(widget.angle, requests[modelUri] === -1))
                requests[modelUri].push(widget.angle);
        });

        self.Angles = [];
        jQuery.each(requests, function (model, ids) {
            var query = {};
            query[enumHandlers.PARAMETERS.MULTILINGUAL] = multilingual;
            query[enumHandlers.PARAMETERS.CACHING] = false;
            query[enumHandlers.PARAMETERS.INCLUDE_FACETS] = false;
            query['ids'] = ids.join(',');
            deferred.push(
                GetDataFromWebService(directoryHandler.ResolveDirectoryUri(model) + '/angles', query)
                    .done(function (data) {
                        jQuery.each(data.angles, function (index, angle) {
                            var queryAngle = {};
                            query[enumHandlers.PARAMETERS.MULTILINGUAL] = multilingual;
                            displayDeferred.push(
                                GetDataFromWebService(directoryHandler.ResolveDirectoryUri(angle.uri), queryAngle)
                                    .done(function (data) {
                                        self.MapAngle(data);
                                        self.Angles.push(data);
                                    })
                            );
                        });
                    })
            );
        });

        return jQuery.whenAll(deferred).then(function () {
            return jQuery.whenAll(displayDeferred);
        });
    };

    // LoadAnglesByUri: load angles by uri
    self.LoadAnglesByUri = function (multilingual) {
        var deferred = [];
        var angleUris = jQuery.map(self.Data().widget_definitions, function (widget) {
            if (widget.angle)
                return widget.angle;
        }).distinct();

        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = multilingual;
        self.Angles = [];
        jQuery.each(angleUris, function (index, angleUri) {
            deferred.push(GetDataFromWebService(directoryHandler.ResolveDirectoryUri(angleUri), query).done(function (data) {
                self.MapAngle(data);
                self.Angles.push(data);
            }));
        });

        return jQuery.whenAll(deferred);
    };

    // GetAngle: get angle by angle key
    // @param
    // - by: uri | id
    // - value: angle key
    self.GetAngle = function (by, value) {
        if (typeof by !== 'string')
            by = self.KeyName;

        return by === 'id' ? self.GetAngleById(value) : self.GetAngleByUri(value);
    };

    // GetAngleById: get angle by id
    // @param
    // - value: angle id
    self.GetAngleById = function (value) {
        return self.Angles.findObject('id', value);
    };

    // GetAngleByUri: get angle by uri
    // @param
    // - value: angle uri
    self.GetAngleByUri = function (value) {
        return self.Angles.findObject('uri', value);
    };

    // MapAngle: map angle data from /items or /models/x/angles => /angles/x
    // @param
    // - angle: angle object
    self.MapAngle = function (angle) {
        if (angle.displays && angle.displays instanceof Array)
            angle.display_definitions = angle.displays.slice(0);
        else if (angle.displays_summary)
            angle.display_definitions = angle.displays_summary.slice(0);

        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        jQuery.each(angle.display_definitions || [], function (indexDisplay, display) {
            jQuery.each(display.fields, function (indexField, field) {
                // convert alias to multi_name_alias
                if (field.alias && !field.multi_lang_alias) {
                    field.multi_lang_alias = [{
                        lang: defaultLanguage,
                        text: field.alias
                    }];
                }
            });
        });
        jQuery.extend(angle, WC.ModelHelper.ExtendAngleData(angle));
    };

    // GetBusinessProcesses: get all business process
    self.GetBusinessProcesses = function () {
        var businessProcesses = [];
        jQuery.each(self.Angles, function (angleIndex, angleData) {
            if (angleData.assigned_labels) {
                jQuery.each(angleData.assigned_labels, function (labelIndex, labelData) {
                    if (jQuery.inArray(labelData, businessProcesses) === -1
                        && businessProcessesModel.General.Data().findObject('id', labelData)) {
                        businessProcesses.push(labelData);
                    }
                });
            }
        });
        return businessProcesses;
    };

    // GetModel: get model name
    self.GetModel = function () {
        var model = modelsHandler.GetModelByUri(self.Data().model);
        return model ? model.short_name || model.id : '';
    };

    // GetModels: get name for all models from angle
    self.GetModels = function () {
        var models = [], model;
        jQuery.each(self.Angles, function (angleIndex, angleData) {
            model = modelsHandler.GetModelByUri(angleData.model);
            if (model && jQuery.inArray(model.short_name, models) === -1)
                models.push(model.short_name);
        });
        return models;
    };

    // Get all dashboards
    self.LoadAllDashboards = function () {
        var dashboardUri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.DASHBOARDS);
        var dashboardParams = {};
        dashboardParams[enumHandlers.PARAMETERS.OFFSET] = 0;
        dashboardParams[enumHandlers.PARAMETERS.LIMIT] = systemSettingHandler.GetMaxPageSize();
        dashboardParams[enumHandlers.PARAMETERS.CACHING] = false;
        dashboardParams[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';

        return GetDataFromWebService(dashboardUri, dashboardParams);
    };

    // IsTemporaryDashboard: check is unsaved dashboard or not?
    // @param
    // - uri: optional (undefined), string, dashboard uri
    self.IsTemporaryDashboard = function (uri) {
        var dashboard = uri || WC.Utility.UrlParameter(enumHandlers.DASHBOARDPARAMETER.DASHBOARD);
        return typeof dashboard !== 'undefined' && isNaN(dashboard.substr(dashboard.lastIndexOf('/') + 1));
    };

    // GetInitialTemporaryData: get initial dashboard structure
    self.GetInitialTemporaryData = function () {
        var guid = jQuery.GUID(),
            data = self.GetInitialData();

        data.id = 'db' + guid.replace(/-/g, '');
        data.uri = '/dashboards/' + guid;

        return data;
    };

    // SaveTemporaryDashboard: save unsave dashboard from data
    // @param
    // - data: object
    self.SaveTemporaryDashboard = function (data) {
        self.SetData(data, true);

        return jQuery.when(data);
    };

    // DeleteReadOnlyProperties: delete read only properties in dashboard
    // @param
    // - data: object => post/put data
    self.DeleteReadOnlyProperties = function (data) {
        delete data.uri;
        delete data.created;
        delete data.changed;
        delete data.executed;
        delete data.published;
        delete data.validated;
        delete data.widgets;
        delete data.labels;
        delete data.business_processes;
        delete data.privilege_labels;
        delete data.grouping_labels;
        delete data.authorizations;
        delete data.privileges;
        delete data.state;
        delete data.has_warnings;
        delete data.angles;
        jQuery.each(WC.Utility.ToArray(data.widget_definitions), function (index, widget) {
            delete widget.uri;
        });
    };

    self.GetAngleExecutionParameters = function (angle, display) {
        var dashboardAngleInfo = {};
        dashboardAngleInfo.angle = ko.toJS(angle);
        dashboardAngleInfo.display = ko.toJS(display);
        dashboardAngleInfo.query_steps = [];

        // set query step
        var setExecutionParameter = function (queryStep, isAngle) {
            if (queryStep.is_execution_parameter) {
                queryStep.is_angle = isAngle;
                dashboardAngleInfo.query_steps.push(queryStep);
            }
        };

        if (dashboardAngleInfo.angle && dashboardAngleInfo.angle.is_parameterized) {
            var queryStepBlock = dashboardAngleInfo.angle.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            if (queryStepBlock) {
                jQuery.each(queryStepBlock.query_steps, function (index, queryStep) {
                    setExecutionParameter(queryStep, true);
                });
            }
        }

        if (dashboardAngleInfo.display && dashboardAngleInfo.display.is_parameterized && dashboardAngleInfo.display.query_blocks.length) {
            jQuery.each(dashboardAngleInfo.display.query_blocks[0].query_steps, function (index, queryStep) {
                setExecutionParameter(queryStep, false);
            });
        }

        return dashboardAngleInfo;
    };

    self.GetAngleExecutionParametersInfo = function (angle, display) {
        var executionParametersInfo = {
            angleQuery: { execution_parameters: [] },
            displayQuery: { execution_parameters: [] }
        };
        var executionParameters = self.GetAngleExecutionParameters(angle, display);
        jQuery.each(executionParameters.query_steps, function (index, queryStep) {
            if (queryStep.is_angle)
                executionParametersInfo.angleQuery.execution_parameters.push(queryStep);
            else
                executionParametersInfo.displayQuery.execution_parameters.push(queryStep);
        });
        if (!executionParametersInfo.angleQuery.execution_parameters.length)
            executionParametersInfo.angleQuery = null;
        if (!executionParametersInfo.displayQuery.execution_parameters.length)
            executionParametersInfo.displayQuery = null;
        if (!executionParametersInfo.angleQuery && !executionParametersInfo.displayQuery)
            executionParametersInfo = {};
        return executionParametersInfo;
    };

    self.GetDashboardExecutionParameters = function () {
        var filters = ko.toJS(self.Data().filters.findObjects('is_execution_parameter', true));
        return {
            angle: {
                model: self.Data().model,
                is_parameterized: false,
                query_definition: [{
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES,
                    base_classes: []
                }]
            },
            display: {
                name: self.Data().name(),
                is_parameterized: true,
                query_blocks: [{
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                    query_steps: filters
                }]
            },
            query_steps: filters
        };
    };

    /*
    *  Dashboard Filter functionality
    */
    self.GetDashboardFilters = function () {
        return ko.toJS(self.Data().filters);
    };
    self.SetDashboardFilters = function (filters) {
        // convert to json and remove unused properties before post/put dashboard
        filters = ko.toJS(filters);
        jQuery.each(filters, function (_index, filter) {
            WC.ModelHelper.RemoveReadOnlyQueryStep(filter);
        });
        self.Data().filters = filters;
    };
    self.ExtendDashboardFilter = function (filter) {
        // normalize object before convert to view model
        filter.field = WC.Utility.ToString(filter.field);
        filter.operator = WC.Utility.ToString(filter.operator);
        filter.arguments = WC.Utility.ToArray(filter.arguments);
        jQuery.each(filter.arguments, function (i, argument) {
            if (argument && argument.argument_type === enumHandlers.FILTERARGUMENTTYPE.VALUE && typeof argument.value === 'undefined')
                argument.value = null;
        });
    };
    self.GetAllDashboardFilterFieldIds = function () {
        var filterFieldIds = [];
        var dashboardFilters = self.Data().filters;
        jQuery.each(dashboardFilters, function (i, filter) {
            var argumentFieldIds = jQuery.map(filter.arguments, function (argument) {
                return argument && argument.argument_type === enumHandlers.FILTERARGUMENTTYPE.FIELD ? argument.field : null;
            });
            filterFieldIds.push(filter.field);
            jQuery.merge(filterFieldIds, argumentFieldIds);
        });
        filterFieldIds = filterFieldIds.distinct();
        return filterFieldIds;
    };
    /*
    *  Dashboard Filter functionality
    */

    self.UpdatePublicationsWatcher = function () {
        // update publications watcher
        jQuery.each(self.Angles, function (index, angle) {
            jQuery.each(angle.display_definitions, function (indexDisplay, display) {
                jQuery.storageWatcher(enumHandlers.STORAGE.WATCHER_DASHBOARD_PUBLICATIONS.replace('{uri}', display.uri), display.is_public);
            });
        });
    };

    self.CanUpdateDashboard = function (name) {
        /// <summary>check can update Dashboard</summary>
        /// <param name="name" type="String">Dashboard's property which will be checked in case validated Dashboard</param>
        /// <returns type="Boolean"></returns>

        var canUpdate = self.Data().authorizations.update;
        var isValidated = self.Data().is_validated();
        var disallowedNames = ['assigned_labels', 'widget_definitions'];

        return WC.ModelHelper.CanUpdateItem(name, canUpdate, isValidated, disallowedNames);
    };

    // constructor
    self.Initial(model);
}
DashboardViewModel.KeyName = 'uri';
