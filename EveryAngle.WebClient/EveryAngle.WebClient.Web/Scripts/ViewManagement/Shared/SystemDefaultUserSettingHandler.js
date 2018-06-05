/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function SystemDefaultUserSettingModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        default_language: 'en',
        default_currency: '',
        client_settings: '{}',
        decimals_numbers: 0,
        decimals_currencies: 0,
        decimals_percentages: 0,
        default_export_lines: 0,
        sap_fields_in_chooser: false,
        sap_fields_in_header: false,
        compressed_list_header: false,
        compressed_bp_bar: false,
        default_business_processes: [],
        auto_execute_items_on_login: false,
        default_enum: '',
        default_date: '',
        default_period: '',
        default_time: '',
        format_locale: 'en'
    }, model);
}

function SystemDefaultUserSettingHandler() {
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
    self.Id = 'default_user_settings';
    self.ResponseKey = null;
    self.Data = {};
    self.DataKey = null;
    self.Model = SystemDefaultUserSettingModel;

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
    self.LoadSystemDefaultUserSettings = function (query) {
        /// <summary locid="M:HandlerHelper.Load"></summary>
        /// <param name="query" type="Object" optional="true">query</param>
        /// <returns type="Deferred"></returns>

        if (!self.HasData()) {
            var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.DEFAULTUSERSETTINGS);
            return self.Load(uri, query);
        }
        else {
            return jQuery.when(self.Data);
        }
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
SystemDefaultUserSettingHandler.extend(WC.HandlerHelper);

var systemDefaultUserSettingModel = new SystemDefaultUserSettingHandler();
