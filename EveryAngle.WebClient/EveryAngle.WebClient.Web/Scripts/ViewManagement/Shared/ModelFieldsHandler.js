/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function ModelFieldModel(model) {
    "use strict";

    // check invalid domain field
    if (typeof model !== 'undefined') {
        if ((model.domain && model.fieldtype !== enumHandlers.FIELDTYPE.ENUM)
            || (!model.domain && model.fieldtype === enumHandlers.FIELDTYPE.ENUM)
            || model.fieldtype === 'unknown') {
            delete model.domain;
            model.fieldtype = enumHandlers.FIELDTYPE.TEXT;
        }
    }

    jQuery.extend(true, this, {
        id: '',
        uri: '',
        short_name: model ? model.id : '',
        long_name: model ? model.id : '',
        source: '',
        fieldtype: enumHandlers.FIELDTYPE.TEXT,
        domain: '',
        category: '',
        technical_info: '',
        helpid: '',
        helptext: '',
        user_specific: {
        }
    }, model);
}

function ModelFieldsHandler() {
    "use strict";

    //BOF: Properties
    var self = this;

    /*=========== overridable properties =============
    self.Id = null;             [required] use for key in localstorage
    self.ResponseKey = null;    [required] data property in the response
    self.Data = {};             [required] keep data in local
    self.DataKey = 'uri';       [optional] property primary key
    self.Model = null;          [optional] model to handle data
    ==================================================*/
    self.Id = 'fields';
    self.ResponseKey = 'fields';
    self.Data = {};
    self.DataKey = 'id';
    self.Model = ModelFieldModel;

    /*=============== custom properties ===============*/
    self.DataInvalid = {};
    /*================================================*/

    //EOF: Properties

    //BOF: Methods
    /*=========== overridable functions ===============
    self.Initial()                              [void] set data from localStorage
    self.Load(uri, params, [storage=true])      [deferred] load data from service
    self.LoadAll(uri, [options])                [deferred] load all data from service
    self.LoadByIds(uri, ids, query)             [deferred] load data by ids from service
    self.GetDataBy(key, value, modelUri)        [object] get cache data by...
    self.GetData(modelUri)                      [array] get all cache data
    self.SetData(data, [storage=true])          [void] set data to cache
    self.GetModelUriFromData(data)              [string] get model's uri by model data
    ==================================================*/

    /*=============== custom functions ===============*/
    self.LoadFields = function (uri, params, store) {
        var query = {};
        //query[enumHandlers.PARAMETERS.VIEWMODE] = enumHandlers.VIEWMODETYPE.BASIC; /* M4-13164: used viewmode=basic to classes & fields request */
        jQuery.extend(query, params);

        return self.Load(uri, query, store);
    };
    self.LoadFieldsByIds = function (uri, ids, query) {
        // handle missing field
        var modelUri = self.GetModelUriFromData({ uri: uri });
        for (var i = ids.length - 1; i >= 0; i--) {
            if (self.DataInvalid[modelUri + ',' + ids[i].toLowerCase()]) {
                ids.splice(i, 1);
            }
        }

        return self.LoadByIds(uri, ids, query)
            .done(function (fields) {
                // add missing fields to cache
                jQuery.each(ids, function (index, id) {
                    if (!self.GetFieldById(id, modelUri)) {
                        self.DataInvalid[modelUri + ',' + id.toLowerCase()] = true;
                    }
                });
            });
    };
    self.LoadFieldsMetadata = function (fields, loadSource, loadDomain) {
        var deferred = [];
        var requesting = {};
        jQuery.each(fields, function (index, field) {
            if (loadDomain !== false && field.domain && !requesting[field.domain]) {
                requesting[field.domain] = true;
                deferred.pushDeferred(modelFieldDomainHandler.LoadFieldDomain, [field.domain]);
            }
            if (loadSource !== false && field.source && !requesting[field.source]) {
                requesting[field.source] = true;
                deferred.pushDeferred(modelFieldSourceHandler.LoadFieldSource, [field.source]);
            }
        });
        return jQuery.whenAll(deferred);
    };
    self.LoadDefaultFields = function (uri, params) {
        var ids = [];
        jQuery.each(enumHandlers.DEFAULTFIELDS, function (key, fieldId) {
            ids.push(fieldId);
        });

        var query = {};
        query[enumHandlers.PARAMETERS.INCLUDE_FACETS] = false;
        query['ids'] = ids.join(',');
        jQuery.extend(query, params);

        return self.LoadFields(uri, query)
            .then(function (data, status, xhr) {
                var response = {};
                response[self.ResponseKey] = [];
                // re-order fields
                jQuery.each(enumHandlers.DEFAULTFIELDS, function (key, fieldId) {
                    var field = data[self.ResponseKey].findObject('id', fieldId);
                    if (field) {
                        response[self.ResponseKey].push(field);
                    }
                });
                return jQuery.when(response, status, xhr);
            });
    };
    self.LoadSuggestedFields = function (uri, params) {
        var query = {};
        query[enumHandlers.PARAMETERS.FQ] = 'facetcat_characteristics:suggested';
        jQuery.extend(query, params);

        return self.LoadFields(uri, query);
    };
    self.GetFieldsByModel = function (modelUri) {
        return self.GetData(modelUri);
    };
    self.SetFields = function (fields, storage) {
        self.SetData(fields, storage);
    };
    self.GetFieldById = function (id, modelUri) {
        if (id === enumHandlers.AGGREGATION.COUNT.Value) {
            return new ModelFieldModel({
                id: id,
                fieldtype: enumHandlers.FIELDTYPE.INTEGER
            });
        }
        else {
            return self.GetDataBy('id', WC.Utility.RevertFieldName(id || ''), modelUri);
        }
    };
    self.GetFieldByUri = function (uri) {
        var modelUri = self.GetModelUriFromData({ uri: uri });
        return self.GetDataBy('uri', uri, modelUri);
    };
    self.GetModelFieldSettings = function (id, modelUri) {
        var field = self.GetFieldById(id, modelUri);
        return field ? WC.Utility.ParseJSON(field.user_specific.user_settings) : {};
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
ModelFieldsHandler.extend(WC.ModelHandlerHelper);

var modelFieldsHandler = new ModelFieldsHandler();
