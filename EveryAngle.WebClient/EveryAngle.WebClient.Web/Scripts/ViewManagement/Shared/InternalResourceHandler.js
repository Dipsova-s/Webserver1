/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function InternalResourceModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        id: '',
        resource_type: '',
        uri: '',
        short_name: model.id,
        long_name: model.id,
        omit_when_empty: false
    }, model);
}

function InternalResourceHandler() {
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
    self.Id = 'internal_resources';
    self.ResponseKey = 'internal_resources';
    self.Data = {};
    self.DataKey = 'id';
    self.Model = InternalResourceModel;

    /*=============== custom properties ===============*/
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
    self.LoadResources = function (params, store) {
        if (self.HasData()) {
            var response = {};
            response[self.ResponseKey] = self.GetData();
            return jQuery.when(response);
        }
        else {
            var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.INTERNALRESOURCES);
            return self.LoadAll(uri, { data: params, store: store });
        }
    };
    self.GetResourceById = function (id) {
        return self.GetDataBy('id', id);
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
InternalResourceHandler.extend(WC.HandlerHelper);

var internalResourceHandler = new InternalResourceHandler();
