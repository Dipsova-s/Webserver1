/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function DirectoryModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        user: '',
        session: '',
        entries: [],
        system_version: 0,
        uri: '',
        version: '',
        is_latest: false
    }, model);

    // required entries
    if (!$.grep(this.entries, function (index, entry) { return entry.entry === enumHandlers.ENTRIESNAME.SYSTEMSETTINGS; }).length) {
        this.entries.push({
            entry: enumHandlers.ENTRIESNAME.SYSTEMSETTINGS,
            uri: '/system/settings'
        });
    }
    if (!$.grep(this.entries, function (index, entry) { return entry.entry === enumHandlers.ENTRIESNAME.ABOUT; }).length) {
        this.entries.push({
            entry: enumHandlers.ENTRIESNAME.ABOUT,
            uri: '/about'
        });
    }
}

function DirectoryHandler() {
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
    self.Id = 'versions';
    self.ResponseKey = null;
    self.Data = {};
    self.DataKey = null;
    self.Model = DirectoryModel;

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

    self.LoadDirectory = function (query) {
        /// <summary locid="M:HandlerHelper.Load"></summary>
        /// <param name="query" type="Object" optional="true">query</param>
        /// <returns type="Deferred"></returns>

        if (!self.HasData()) {
            return self.Load(webApiVersion, query);
        }
        else {
            return jQuery.when(self.Data);
        }
    };

    self.GetDirectoryByName = function (directoryName) {
        /// <summary locid="M:HandlerHelper.GetDataBy">get entry by entry name</summary>
        /// <param name="directoryName" type="String">compare value</param>
        /// <returns type="Object" mayBeNull="true"></returns>

        if (self.Data.entries) {
            return self.Data.entries.findObject('entry', directoryName);
        }

        return null;
    };

    self.GetDirectoryUri = function (directoryName) {
        /// <summary>get entry uri by entry name</summary>
        /// <param name="directoryName" type="String">compare value</param>
        /// <returns type="String">entry uri or empty string</returns>

        var entry = self.GetDirectoryByName(directoryName);
        if (entry)
            return self.ResolveDirectoryUri(entry.uri);

        return '';
    };

    self.ResolveDirectoryUri = function (uri) {
        /// <summary>clean entry uri</summary>
        /// <param name="uri" type="String">request uri</param>
        /// <returns type="String">thrown error if no uri</returns>

        if (!uri) {
            errorHandlerModel.ShowCustomError('Request uri is not set');
        }
        return uri.charAt(0) === '/' ? uri.substr(1) : uri;
    };

    //EOF: View modle methods

    // call initializing
    self.Initial();
}
DirectoryHandler.extend(WC.HandlerHelper);

var directoryHandler = new DirectoryHandler();
