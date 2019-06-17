/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function ComponentServiceModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        registration_id: null,
        type: null,
        uri: null,
        version: null,
        machine_name: null,
        status: {
            available: false,
            timestamp: 0
        },
        registered_on: 0
    }, model);
}

function ComponentServicesHandler() {
    "use strict";

    //BOF: View model properties
    var self = this;

    /*=========== overridable properties =============
   self.Id = null;             [required] use for key in localstorage
   self.ResponseKey = null;    [optional] data property in the response
   self.Data = {};             [required] kept data in local
   self.DataKey = 'uri';       [optional] property primary key
   self.Model = null;          [optional] model to handle data
   ==================================================*/
    self.Id = 'componentservices';
    self.ResponseKey = null;
    self.Data = [];
    self.DataKey = 'registration_id';
    self.Model = ComponentServiceModel;

    /*=============== custom properties ===============*/
    /*================================================*/

    //EOF: View model properties

    //BOF: View model methods
    /*=========== overridable functions ===============
    self.Initial()                              [void] set data from localStorage
    self.Load(uri, params, [storage=true])      [deferred] load data from service
    self.LoadAll(uri, [options])                [deferred] load all data from service
    self.GetDataBy(key, value, modelUri)        [object] get cache data by...
    self.GetData(modelUri)                      [array] get all cache data
    self.SetData(data, [storage=true])          [void] set data to cache
    ==================================================*/

    self.LoadComponentServices = function () {
        /// <summary locid="M:HandlerHelper.Load"></summary>
        /// <returns type="Deferred"></returns>
        return self.Load('/csm/componentservices', {}, false);
    };

    self.GetComponentServiceByType = function (type) {
        return self.GetDataBy('type', type);
    };

    self.GetModellingWorkbenchUrl = function () {
        var component = self.GetComponentServiceByType('ModellingWorkbench');
        return component ? component.uri : '';
    };

    //EOF: View modle methods

    // call initializing
    self.Initial();
}
ComponentServicesHandler.extend(WC.HandlerHelper);

var componentServicesHandler = new ComponentServicesHandler();
