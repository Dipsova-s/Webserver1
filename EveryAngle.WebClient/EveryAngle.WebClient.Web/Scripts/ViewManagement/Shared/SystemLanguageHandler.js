/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function SystemLanguageModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        id: '',
        uri: '',
        name: '',
        iso: model.id,
        enabled: false
    }, model);
}

function SystemLanguageHandler() {
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
    self.Id = 'system_languages';
    self.ResponseKey = 'languages';
    self.Data = {};
    self.DataKey = 'id';
    self.Model = SystemLanguageModel;

    /*=============== custom properties ===============*/
    self.FieldLanguageId = 'id';
    self.FieldLanguageLabel = 'name';
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
    self.LoadLanguages = function (params, store) {
        /// <summary locid="M:HandlerHelper.Load"></summary>
        /// <param name="params" type="Object" optional="true"></param>
        /// <param name="store" type="Boolean" optional="true"></param>
        /// <returns type="Deferred"></returns>

        if (self.HasData()) {
            var response = {};
            response[self.ResponseKey] = self.GetData();
            return jQuery.when(response);
        }
        else {
            var query = jQuery.extend({ enabled: true }, params);
            var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.SYSTEMLANGUAGES);
            return self.LoadAll(uri, { data: query, store: store });
        }
    };

    self.GetEnableLanguages = function (isRegional) {
        if (typeof isRegional === 'undefined')
            isRegional = false;

        var data = self.GetData();
        var langs = ko.toJS(data.findObjects('enabled', true));
        langs.sortObject("name");

        if (isRegional) {
            // convert en -> en-US
            // convert other -> [ID]-[ID-UPPER]
            // add en-GB
            var enLangIndex = -1;
            jQuery.each(langs, function (index, lang) {
                if (lang.id.length === 2) {
                    if (lang.id === 'en') {
                        enLangIndex = index;

                        langs[index].id = 'en-US';
                        langs[index].iso = 'en-US';
                        langs[index].name = 'English (US)';
                    }
                    else {
                        langs[index].id = langs[index].id + '-' + langs[index].id.toUpperCase();
                        langs[index].iso = langs[index].iso + '-' + langs[index].iso.toUpperCase();
                    }
                }
            });

            var enGB = jQuery.extend({}, langs[enLangIndex], {
                id: 'en-GB',
                iso: 'en-GB',
                name: 'English (UK)'
            });
            langs.splice(enLangIndex + 1, 0, enGB);
        }
        return langs;
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
SystemLanguageHandler.extend(WC.HandlerHelper);

var systemLanguageHandler = new SystemLanguageHandler();
