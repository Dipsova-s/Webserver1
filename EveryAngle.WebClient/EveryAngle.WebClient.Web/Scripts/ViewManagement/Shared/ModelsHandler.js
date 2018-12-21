/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function ModelsModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        id: '',
        uri: '',
        short_name: model.id,
        long_name: model.id,
        first_day_of_week: 'Monday'
    }, model);
}

function ModelsHandler() {
    "use strict";

    //BOF: Properties
    var self = this;

    /*=========== overridable properties =============
    self.Id = null;             [required] use for key in localstorage
    self.ResponseKey = null;    [optional] data property in the response
    self.Data = {};             [required] kept data in local
    self.DataKey = 'uri';       [optional] property primary key
    self.Model = null;          [optional] model to handle data
    ==================================================*/
    self.Id = 'models';
    self.ResponseKey = 'models';
    self.Data = {};
    self.DataKey = 'uri';
    self.Model = ModelsModel;

    /*=============== custom properties ===============*/
    self.DataModelServer = [];
    /*================================================*/

    //EOF: Properties

    //BOF: Methods
    /*=========== overridable functions ===============
    self.Initial()                              [void] set data from localStorage
    self.Load(uri, params, [storage=true])      [deferred] load data from service
    self.LoadAll(uri, [options])                [deferred] load all data from service
    self.GetDataBy(key, value, modelUri)        [object] get cache data by...
    self.GetData(modelUri)                      [array] get all cache data
    self.SetData(data, [storage=true])          [void] set data to cache
    ==================================================*/

    /*=============== custom functions ===============*/
    self.LoadModels = function (forceLoad) {
        if (!self.HasData() || forceLoad === true) {
            var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.MODELS);

            var query = {};
            query[enumHandlers.PARAMETERS.CACHING] = false;

            self.Data = {};
            return self.Load(uri, query, false)
                .done(function (data, status, xhr) {
                    var models = [];
                    var privileges = WC.Utility.ToArray(privilegesViewModel.Data());
                    jQuery.each(data[self.ResponseKey], function (index, model) {
                        if (privileges.hasObject('model', model.uri)) {
                            models.push(model);
                        }
                    });
                    self.Data = {};
                    self.SetData(models);
                });
        }
        else {
            return jQuery.when(self.Data);
        }
    };
    self.LoadModelInfo = function (modelUri) {
        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;

        return GetDataFromWebService(modelUri, query)
            .done(function (data, status, xhr) {
                self.SetData([data]);
            });
    };
    self.LoadModelsInfo = function () {
        var deferred = [];
        jQuery.each(self.Data, function (key, model) {
            deferred.pushDeferred(self.LoadModelInfo, [model.uri]);
        });
        return jQuery.whenAll(deferred);
    };
    self.LoadModelServer = function (serverUri) {
        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        return GetDataFromWebService(serverUri, query)
            .done(function (data, status, xhr) {
                jQuery.merge(self.DataModelServer, data.model_servers);
            });
    };
    self.GetAvailabelModels = function (checker) {
        if (typeof checker !== 'function')
            checker = function (model) { return true; };

        var list = [];
        jQuery.each(self.Data, function (key, model) {
            if (model.available && checker(model.uri)) {
                list.push(model)
            }
        });
        return list;
    };
    self.GetDefaultModel = function () {
        var defaultModel = null;
        jQuery.each(self.Data, function (key, model) {
            if (model.is_default) {
                defaultModel = model;
                return false;
            }

            if (!defaultModel) {
                defaultModel = model;
            }
        });
        return defaultModel || {};
    };
    self.GetModelByUri = function (uri) {
        return self.GetDataBy('uri', uri);
    };
    self.GetModelById = function (id) {
        return self.GetDataBy('id', id);
    };
    self.GetModelName = function (modelUri) {
        var model = self.GetModelByUri(modelUri);
        return model ? model.short_name || model.id : '';
    };
    self.GetModelNameById = function (modelId) {
        var model = self.GetModelById(modelId);
        return model ? model.short_name || model.id : modelId;
    };

    self.GetQueryFieldsUri = function (resultData, angleData, isMetaData) {
        if (typeof isMetaData === 'undefined')
            isMetaData = false;

        var followupUri;
        if (!isMetaData) {
            var modelUri = angleData ? angleData.model : fieldsChooserHandler.ModelUri;
            var currentInstance = modelCurrentInstanceHandler.GetCurrentModelInstance(modelUri);
            var rootFieldUri = currentInstance ? currentInstance.fields : self.GetModelByUri(modelUri).fields;
            var followupClass = self.GetLatestFollowupQuery(fieldsChooserHandler.AngleClasses, fieldsChooserHandler.AngleSteps,
                                                            fieldsChooserHandler.DisplaySteps, fieldsChooserHandler.PopupConfig, modelUri);
            if (resultData && resultData.query_fields) {
                followupUri = !followupClass ? resultData.query_fields : rootFieldUri + followupClass;
            }
            else {
                if (!followupClass)
                    followupClass = self.FindClasses(resultData, angleData, []);
                followupUri = rootFieldUri + followupClass;
            }
        }
        else {
            var model = self.GetModelByUri(angleData.model);
            var query = {};
            followupUri = model.fields + '?' + jQuery.param(query);
        }
        return directoryHandler.ResolveDirectoryUri(followupUri);
    };
    self.GetFollowupUri = function (resultData, angleData, target) {
        var modelUri = angleData.model;
        var currentInstance = modelCurrentInstanceHandler.GetCurrentModelInstance(modelUri);
        var rootFollowupUri = currentInstance ? currentInstance.followups : self.GetModelByUri(modelUri).followups;

        var followupClass = self.GetLatestFollowupQuery(
                                fieldsChooserHandler.AngleClasses,
                                fieldsChooserHandler.AngleSteps,
                                followupPageHandler.HandlerFilter.Data(), target + ',' + fieldsChooserHandler.FOLLOWUPINDEX.LAST,
                                modelUri);

        var followupUri;
        if (resultData && resultData.followups) {
            followupUri = !followupClass ? resultData.followups : rootFollowupUri + followupClass;
        }
        else {
            if (!followupClass)
                followupClass = self.FindClasses(resultData, angleData, []);

            followupUri = rootFollowupUri + followupClass;
        }

        return directoryHandler.ResolveDirectoryUri(followupUri);
    };
    self.GetLatestFollowupQuery = function (baseClasses, angleSteps, displaySteps, config, modelUri) {
        var followupInfo = self.GetFollowupInfo(angleSteps, displaySteps, config);
        var resultingClasses = self.GetResultClassesFromFollowupInfo(followupInfo, modelUri, baseClasses);
        return '?classes=' + resultingClasses.join(',');
    };
    self.GetFollowupInfo = function (angleSteps, displaySteps, config) {
        // config = target,followupIndex
        // -1 = no followup, display -> check angles' followup then base classes, angles use base classes
        // followupIndex = 'last', means use the last one
        var metadata = config.split(',');
        var target = metadata[0];
        var followupIndex = metadata[1] || fieldsChooserHandler.FOLLOWUPINDEX.LAST;

        // get followups from configs
        var followups = [];
        var angleFollowups = angleSteps.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
        if (target === enumHandlers.ANGLEPOPUPTYPE.ANGLE) {
            followups = angleFollowups;
        }
        else if (target === enumHandlers.ANGLEPOPUPTYPE.DISPLAY) {
            // combine angle with display
            var displayFollowups = displaySteps.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
            jQuery.merge(followups, angleFollowups);
            jQuery.merge(followups, displayFollowups);

            // re-index for display
            if (followupIndex === fieldsChooserHandler.FOLLOWUPINDEX.NO) {
                followupIndex = angleFollowups.length - 1;
            }
            else if (followupIndex !== fieldsChooserHandler.FOLLOWUPINDEX.LAST) {
                followupIndex = angleFollowups.length + parseInt(followupIndex);
            }
        }

        return {
            followups: followups,
            followupIndex: followupIndex.toString()
        };
    };
    self.GetResultClassesFromFollowupInfo = function (followupInfo, modelUri, fallback) {
        var followupData = null;
        var followupSteps = followupInfo.followups;
        var followupIndex = followupInfo.followupIndex;
        if (followupSteps.length && followupIndex !== fieldsChooserHandler.FOLLOWUPINDEX.NO) {
            var followupStep = followupSteps[followupIndex === fieldsChooserHandler.FOLLOWUPINDEX.LAST ? followupSteps.length - 1 : parseInt(followupIndex)];
            followupData = modelFollowupsHandler.GetFollowupByQueryStep(followupStep, modelUri);
        }
        return followupData ? followupData.resulting_classes : fallback;
    };
    self.FindClasses = function (resultData, angleData, classes) {
        if (resultData && resultData.actual_classes) {
            classes = resultData.actual_classes;
        }
        if (!classes.length && angleData && angleData.query_definition) {
            var querySteps = WC.Utility.ToArray((angleData.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS) || {}).query_steps);
            var followups = querySteps.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
            classes = jQuery.map(followups, function (step) { return step.followup; });
            if (!classes.length) {
                classes = WC.Utility.ToArray((angleData.query_definition.findObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES) || {}).base_classes);
            }
        }

        return (classes.length ? '?classes=' + classes[classes.length - 1] : '');
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
ModelsHandler.extend(WC.HandlerHelper);

var modelsHandler = new ModelsHandler();
