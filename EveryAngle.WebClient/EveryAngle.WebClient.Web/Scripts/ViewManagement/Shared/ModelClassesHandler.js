/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function ClassModel(model) {
    "use strict";

    jQuery.extend(this, {
        id: '',
        uri: '',
        short_name: model.id,
        long_name: model.id,
        main_businessprocess: '',
        helpid: '',
        helptext: ''
    }, model);
}

function ModelClassesHandler() {
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
    self.Id = 'classes';
    self.ResponseKey = 'classes';
    self.Data = {};
    self.DataKey = 'id';
    self.Model = ClassModel;

    /*=============== custom properties ===============*/
    self.InstanceClassesData = {};
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
    self.LoadAllClasses = function (uri, params, store) {
        var query = {};
        query[enumHandlers.PARAMETERS.VIEWMODE] = enumHandlers.VIEWMODETYPE.BASIC;
        jQuery.extend(query, params);

        return self.LoadAll(uri, { data: query, store: store });
    };
    self.LoadAllInstanceClasses = function (uri, options) {
        var instanceKey = uri;
        var queryIndex = uri.indexOf('?');
        if (queryIndex !== -1) {
            instanceKey = instanceKey.substr(queryIndex);
        }

        if (self.InstanceClassesData[instanceKey]) {
            return jQuery.when(self.InstanceClassesData[instanceKey]);
        }

        return self.LoadAllClasses(uri, options)
            .done(function (response) {
                self.InstanceClassesData[instanceKey] = response;
            });
    };
    self.LoadClassesByIds = function (ids, modelUri, params) {
        var model = modelsHandler.GetModelByUri(modelUri);
        var uri;
        if (model) {
            uri = model.classes;
        }
        else {
            uri = modelUri + '/classes';
        }

        var query = {};
        jQuery.extend(query, params);

        return self.LoadByIds(uri, ids, query);
    };
    self.SetClasses = function (classes, storage) {
        self.SetData(classes, storage);
    };
    self.GetClassById = function (id, modelUri) {
        return self.GetDataBy('id', id, modelUri);
    };
    self.GetClassByUri = function (uri) {
        var modelUri = self.GetModelUriFromData({ uri: uri });
        return self.GetDataBy('uri', uri, modelUri);
    };
    self.GetClassName = function (id, modelUri, format) {
        var data = self.GetDataBy('id', id, modelUri)
            || modelFollowupsHandler.GetFollowupById(id, modelUri)
            || { id: id };
        return userFriendlyNameHandler.GetFriendlyName(data, format);
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
ModelClassesHandler.extend(WC.ModelHandlerHelper);

var modelClassesHandler = new ModelClassesHandler();
