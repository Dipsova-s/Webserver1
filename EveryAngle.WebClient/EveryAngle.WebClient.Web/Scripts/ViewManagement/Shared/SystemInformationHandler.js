/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function SystemInformationModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        uri: '',
        languages: [],
        currencies: []
    }, model);
}

function SystemInformationHandler() {
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
    self.Id = 'system_information';
    self.ResponseKey = null;
    self.Data = {};
    self.DataKey = null;
    self.Model = SystemInformationModel;

    /*=============== custom properties ===============*/
    self.FieldLanguageId = 'id';
    self.FieldLanguageLabel = 'name';
    self.FieldCurrencyId = 'currency';
    self.FieldCurrencyLabel = 'currency_description';
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
    self.LoadSystemInformation = function (query) {
        /// <summary locid="M:HandlerHelper.Load"></summary>
        /// <param name="query" type="Object" optional="true">query</param>
        /// <returns type="Deferred"></returns>

        if (jQuery.isEmptyObject(self.Data)) {
            var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.SYSTEMINFORMATION);
            return self.Load(uri, query);
        }
        else {
            return jQuery.when(self.Data);
        }
    };

    self.GetLanguages = function () {
        return WC.Utility.ToArray(self.Data.languages);
    };
    self.GetLanguageById = function (id) {
        return self.GetLanguages().findObject('id', id);
    };

    self.GetCurrencies = function () {
        return WC.Utility.ToArray(self.Data.currencies);
    };
    self.GetSystemVersion = function () {
        return self.Data.system_version;
    };
    self.GetWebClientVersion = function () {
        return ClientVersion;
    };
    self.IsSupportAngleAutomation = function () {
        var feature = self.Data ? self.Data.features.findObject('feature', 'AngleAutomation') : {};
        return feature && feature.licensed;
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
SystemInformationHandler.extend(WC.HandlerHelper);

var systemInformationHandler = new SystemInformationHandler();
