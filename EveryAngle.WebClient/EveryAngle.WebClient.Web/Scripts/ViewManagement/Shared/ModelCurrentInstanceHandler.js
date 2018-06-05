/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function ModelCurrentInstanceModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        id: '',
        uri: '',
        model: ''
    }, model);
}

function ModelCurrentInstanceHandler() {
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
    self.Id = 'model_current_instance';
    self.ResponseKey = null;
    self.Data = {};
    self.DataKey = 'model';
    self.Model = ModelCurrentInstanceModel;

    /*=============== custom properties ===============*/
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
    self.LoadCurrentModelInstance = function (instanceUri, modelUri) {
        var currentInstance = self.GetCurrentModelInstance(modelUri);
        if (!currentInstance || currentInstance.uri !== instanceUri) {
            var query = {};
            query[enumHandlers.PARAMETERS.CACHING] = false;

            return jQuery.when(modelsHandler.LoadModelInfo(modelUri), self.Load(instanceUri, query, false))
                .then(function (xhrModel, xhrInstance) {
                    var data = xhrInstance[0];
                    self.Data[data[self.DataKey]] = new self.Model(data);
                    jQuery.localStorage(self.Id, self.Data);

                    return jQuery.when(self.GetCurrentModelInstance(modelUri));
                });
        }
        else {
            return jQuery.when(currentInstance);
        }
    };
    self.GetCurrentModelInstance = function (modelUri) {
        return self.GetDataBy('model', modelUri);
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
ModelCurrentInstanceHandler.extend(WC.HandlerHelper);

var modelCurrentInstanceHandler = new ModelCurrentInstanceHandler();
