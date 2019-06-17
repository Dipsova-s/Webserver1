function ModelFieldSourceModel(model) {
    "use strict";

    jQuery.extend(this, {
        id: '',
        uri: '',
        short_name: model.id,
        long_name: model.id
    }, model);
}

function ModelFieldSourceHandler() {
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
    self.Id = 'field_sources';
    self.ResponseKey = 'field_sources';
    self.Data = {};
    self.Model = ModelFieldSourceModel;

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
    self.LoadFieldSource = function (uri) {
        if (!uri)
            return jQuery.when(null);

        var data = self.GetFieldSourceByUri(uri);
        if (data)
            return jQuery.when(data);

        return jQuery.when(GetDataFromWebService(directoryHandler.ResolveDirectoryUri(uri)))
            .done(function (data) {
                self.SetData([data]);
            });
    };
    self.LoadFieldSourcesByIds = function (uri, ids, query) {
        // handle missing field
        var modelUri = self.GetModelUriFromData({ uri: uri });
        for (var i = ids.length - 1; i >= 0; i--) {
            if (self.DataInvalid[modelUri + ',' + ids[i].toLowerCase()]) {
                ids.splice(i, 1);
            }
        }

        return self.LoadByIds(uri, ids, query)
            .done(function () {
                // add missing fields to cache
                jQuery.each(ids, function (index, id) {
                    if (!self.GetFieldSourceById(id, modelUri)) {
                        self.DataInvalid[modelUri + ',' + id.toLowerCase()] = true;
                    }
                });
            });
    };
    self.GetFieldSourceByUri = function (uri) {
        var modelUri = self.GetModelUriFromData({ uri: uri });
        return self.GetDataBy('uri', uri, modelUri);
    };
    self.GetFieldSourceById = function (id, modelUri) {
        return self.GetDataBy('id', id, modelUri);
    };
    self.GetFieldsSourceByModelUri = function (modelUri) {
        return self.GetData(modelUri);
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
ModelFieldSourceHandler.extend(WC.ModelHandlerHelper);

var modelFieldSourceHandler = new ModelFieldSourceHandler();
