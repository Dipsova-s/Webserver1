/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function SystemSettingModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        min_labelcategories_to_publish: 0,
        max_domainelements_for_search: 100,
        default_pagesize: 30,
        max_pagesize: 100,
        is_mockdata: false
    }, model);
}

function SystemSettingHandler() {
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
    self.Id = 'system_settings';
    self.ResponseKey = null;
    self.Data = {};
    self.DataKey = null;
    self.Model = SystemSettingModel;

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
    self.LoadSystemSettings = function (query) {
        /// <summary locid="M:HandlerHelper.Load"></summary>
        /// <param name="query" type="Object" optional="true">query</param>
        /// <returns type="Deferred"></returns>

        if (!self.HasData() || self.Data.is_mockdata) {
            var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.SYSTEMSETTINGS);
            return self.Load(uri, query);
        }
        else {
            return jQuery.when(self.Data);
        }
    };

    self.GetMinLabelCategoryToPublish = function () {
        return self.Data.min_labelcategories_to_publish;
    };
    self.GetMaxDomainForSearch = function () {
        return self.Data.max_domainelements_for_search;
    };
    self.GetMaxPageSize = function () {
        return window.largePageSize || 1000;
    };
    self.GetApplicationServerMaxPageSize = function () {
        return self.Data.max_pagesize;
    };
    self.GetDefaultPageSize = function () {
        return self.Data.default_pagesize;
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
    if (jQuery.isEmptyObject(self.Data)) {
        self.SetData(new self.Model({ is_mockdata: true }), false);
    }
}
SystemSettingHandler.extend(WC.HandlerHelper);

var systemSettingHandler = new SystemSettingHandler();
