/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />
function ModelInstanceFieldModel(model) {
    "use strict";

    jQuery.extend(this, new ModelFieldModel(model));
}

function ModelInstanceFieldsHandler() {
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
    self.Id = 'fields_instance';
    self.ResponseKey = 'fields';
    self.Data = {};
    self.DataKey = 'id';
    self.Model = ModelInstanceFieldModel;

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
    self.LoadFieldsByIds = function (uri, ids, params) {
        var key = self.GetModelKey(uri);

        // handle missing field
        for (var i = ids.length - 1; i >= 0; i--) {
            if (self.DataInvalid[key + '&id=' + ids[i].toLowerCase()]) {
                ids.splice(i, 1);
            }
        }

        var query = {};
        query[enumHandlers.PARAMETERS.VIEWMODE] = enumHandlers.VIEWMODETYPE.BASIC;
        jQuery.extend(query, params);
        return self.LoadByIds(uri, ids, query, false)
            .done(function (fields) {
                // clean data
                var modelUri = key.split('?')[0];
                delete self.Data[modelUri];

                // set data
                self.SetFields(fields[self.ResponseKey], uri, true);

                // add missing fields to cache
                jQuery.each(ids, function (index, id) {
                    if (!self.GetFieldById(id, uri)) {
                        self.DataInvalid[key + '&id=' + id.toLowerCase()] = true;
                    }
                });
            });
    };
    self.SetFields = function (fields, queryFieldUri, storage) {
        var key = self.GetModelKey(queryFieldUri);
        if (!self.Data[key]) {
            self.Data[key] = {};
        }
        var dataModel = self.Data[key];
        jQuery.each(fields, function (i, d) {
            if (self.Model) fields[i] = new self.Model(d);
            dataModel[d[self.DataKey].toLowerCase()] = fields[i];
        });
        if (storage !== false) {
            jQuery.localStorage(self.Id, self.Data);
        }
    };
    self.GetFieldById = function (id, queryFieldUri) {
        var key = self.GetModelKey(queryFieldUri);
        return self.GetDataBy('id', id, key);
    };
    self.GetModelKey = function (queryFieldUri) {
        var modelUri = self.GetModelUriFromData({ uri: queryFieldUri });
        return modelUri + queryFieldUri.substr(queryFieldUri.indexOf('?')).toLowerCase();
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
ModelInstanceFieldsHandler.extend(WC.ModelHandlerHelper);

var modelInstanceFieldsHandler = new ModelInstanceFieldsHandler();
