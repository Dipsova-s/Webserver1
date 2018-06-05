/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function FollowupModel(model) {
    "use strict";

    jQuery.extend(this, {
        short_name: model.id,
        long_name: model.id,
        id: '',
        uri: '',
        resulting_classes: [],
        category: 'up',
        helpid: ''
    }, model);
}

function ModelFollowupsHandler() {
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
    self.Id = 'followups';
    self.ResponseKey = 'followups';
    self.Data = {};
    self.DataKey = 'id';
    self.Model = FollowupModel;

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
    self.LoadAllFollowups = function (uri, params, store) {
        var query = {};
        jQuery.extend(query, params);

        return self.LoadAll(uri, { data: query, store: store });
    };
    self.LoadFollowupsByIds = function (ids, modelUri, params) {
        var model = modelsHandler.GetModelByUri(modelUri);
        var uri;
        if (model) {
            uri = model.followups;
        }
        else {
            uri = modelUri + '/followups';
        }

        var query = {};
        jQuery.extend(query, params);

        var isLoaded = true;
        var response = {};
        response[self.ResponseKey] = [];
        jQuery.each(ids, function (index, id) {
            var data = self.GetFollowupById(id, modelUri);
            if (data) {
                response[self.ResponseKey].push(data);
            }
            else {
                isLoaded = false;
            }
        });
        if (!isLoaded) {
            return self.LoadAllFollowups(uri, params);
        }
        else {
            return jQuery.when(response);
        }
    };
    self.SetFollowups = function (followups, storage) {
        self.SetData(followups, storage);
    };
    self.GetFollowupById = function (id, modelUri) {
        return self.GetDataBy('id', id, modelUri);
    };
    self.GetFollowupByUri = function (uri) {
        var modelUri = self.GetModelUriFromData({ uri: uri });
        return self.GetDataBy('uri', uri, modelUri);
    };
    self.GetFollowupByQueryStep = function (queryStep, modelUri) {
        if (queryStep.uri) {
            return self.GetFollowupByUri(queryStep.uri);
        }

        return self.GetFollowupById(queryStep.followup, modelUri);
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
ModelFollowupsHandler.extend(WC.ModelHandlerHelper);

var modelFollowupsHandler = new ModelFollowupsHandler();
