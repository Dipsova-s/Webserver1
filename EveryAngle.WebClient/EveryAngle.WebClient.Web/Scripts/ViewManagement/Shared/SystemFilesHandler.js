/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function SystemFilesHandler() {
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
    self.Id = "system_file_details"
    self.Data = {};
    self.ResponseKey = "files";
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
    self.LoadFileDetails = function (params, store) {
        if (self.HasData()) {
            var response = {};
            response[self.ResponseKey] = self.GetData();
            return jQuery.when(response);
        }
        else {
            var uri = "system/files";
            return self.Load(uri, params, store);
        }
    };

    self.GetDropdownData = function () {
        return self.GetData().map(function (template) {
            return {
                name: template.file,
                id: template.file,
                is_innowera: WC.Utility.ToBoolean(template.has_innowera_process),
                innowera_details: template.innowera_process_details,
                icon_class: WC.Utility.ToBoolean(template.has_innowera_process) ? "icon-innowera" : "none"
            }
        });
    };

    // call initializing
    self.Initial();
}
SystemFilesHandler.extend(WC.HandlerHelper);

// initialize handlers here for new type of files.
var excelTemplateFilesHandler = new SystemFilesHandler();