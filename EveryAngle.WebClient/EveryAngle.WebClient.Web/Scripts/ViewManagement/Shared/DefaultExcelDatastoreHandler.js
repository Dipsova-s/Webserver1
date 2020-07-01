/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function DefaultExcelDatastoreHandler() {
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
    self.Id = "datastore_settings"
    self.Data = {};
    self.ResponseKey = "data_settings";
    self.DataKey = null;

    /*=============== custom properties ===============*/
    // Initialize custom properties here
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
    self.LoadDatastoreSettings = function (params, store) {
        if (self.HasData()) {
            var response = {};
            response[self.ResponseKey] = self.GetData();
            return jQuery.when(response);
        }
        else {
            var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.SYSTEMDATASTORES);
            params = jQuery.extend({ "default_datastore": true }, params);
            return GetDataFromWebService(uri, params)
                .then(function (data) {
                    if (data && data.datastores && data.datastores.findObject('datastore_plugin', 'msexcel')) {
                        var defaultExcelDatastoreUri = data.datastores.findObject('datastore_plugin', 'msexcel').uri;
                        return self.Load(defaultExcelDatastoreUri, params, store);
                    }
                    return jQuery.when(null);
                });
        }
    };

    self.GetExcelTemplates = function () {
        return self.GetData().setting_list.findObject('id', 'template_file');
    };

    // call initializing
    self.Initial();
}
DefaultExcelDatastoreHandler.extend(WC.HandlerHelper);

var defaultExcelDatastoreHandler = new DefaultExcelDatastoreHandler();