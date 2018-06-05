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
            //query[enumHandlers.PARAMETERS.VIEWMODE] = enumHandlers.VIEWMODETYPE.BASIC;
            followupUri = model.fields + '?' + jQuery.param(query);
        }
        return directoryHandler.ResolveDirectoryUri(followupUri);
    };
    self.GetFollowupUri = function (resultData, angleData, target) {
        var modelUri = angleData.model;
        var currentInstance = modelCurrentInstanceHandler.GetCurrentModelInstance(modelUri);
        var rootFollowupUri = currentInstance ? currentInstance.followups : self.GetModelByUri(modelUri).followups;

        /* BOF: M4-13243: Fixed incorrect result classes when add filter after added follow-up */
        var followupIndex = -1;
        jQuery.each(followupPageHandler.HandlerFilter.Data(), function (index, queryStep) {
            if (queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP) {
                followupIndex++;
            }
        });
        /* EOF: M4-13243: Fixed incorrect result classes when add filter after added follow-up */

        var followupClass = self.GetLatestFollowupQuery(
                                fieldsChooserHandler.AngleClasses,
                                fieldsChooserHandler.AngleSteps,
                                followupPageHandler.HandlerFilter.Data(), target + ',' + followupIndex,
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
        // M4-12025: WC: Filter will be invalid if select field for "Select value"
        // refactor to make more readable
        var getResultClass = function (followupSteps, index) {
            var followup = null;
            if (followupSteps.length) {
                var lastFollowup = followupSteps[index === -1 ? followupSteps.length - 1 : index];
                followup = modelFollowupsHandler.GetFollowupByQueryStep(lastFollowup, modelUri);
            }
            return followup;
        };

        // config = target,followupIndex
        var metadata = config.split(',');
        var target = metadata[0];
        var followupIndex = parseInt(metadata[1] || -1, 10);
        var followups = [];
        var angleFollowups = angleSteps.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
        if (target === enumHandlers.ANGLEPOPUPTYPE.ANGLE) {
            followups = angleFollowups;
        }
        else if (target === enumHandlers.ANGLEPOPUPTYPE.DISPLAY) {
            /* M4-13217: fixed error 422 when "select field" in "select value" at ask@execution */
            if (followupIndex === -1) {
                followups = [];
            }
            else {
                followups = displaySteps.findObjects('step_type', enumHandlers.FILTERTYPE.FOLLOWUP);
            }
        }

        var followupQueryUri = '';
        var resultingClass = getResultClass(followups, followupIndex);
        if (resultingClass) {
            followupQueryUri = '?classes=' + resultingClass.resulting_classes.join(',');
        }
        else {
            //Added condition to fixed the problem M4-11320 WC: [Chart/Pivot]Send incorrect classes when display didn't have followup but angle had followup
            //Checked if display didn't have followup => check angle had followup or not if had use followup but not use angle base calsses
            if (angleFollowups.length) {
                resultingClass = getResultClass(angleFollowups, -1);
                if (resultingClass) {
                    followupQueryUri = '?classes=' + resultingClass.resulting_classes.join(',');
                }
                else {
                    var lastFollowup = angleFollowups[angleFollowups.length - 1];
                    followupQueryUri = '?classes=' + (lastFollowup.followup || lastFollowup.id);
                }
            }
            else {
                if (baseClasses.length) {
                    followupQueryUri = '?classes=' + baseClasses.join(',');
                }
            }
        }

        return followupQueryUri;
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
