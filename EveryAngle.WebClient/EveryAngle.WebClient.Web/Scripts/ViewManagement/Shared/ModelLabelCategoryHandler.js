/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function ModelLabelModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        id: '',
        uri: '',
        name: model.id,
        abbreviation: model.id,
        category: '',
        enabled: false
    }, model);
}
function ModelLabelHandler() {
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
    self.Id = 'labels';
    self.ResponseKey = 'labels';
    self.Data = {};
    self.DataKey = 'id';
    self.Model = ModelLabelModel;

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
    self.LoadAllLabels = function (uri, params, store) {
        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        jQuery.extend(query, params);

        return self.LoadAll(uri, { data: query, store: store });
    };
    self.GetLabelById = function (id) {
        return self.GetDataBy('id', id);
    };
    self.GetEnabledLabelsByCategory = function (modelLabelCategory) {
        var enabledLabels = [];
        var labelCategoryUri = self.GetLabelCategoryUri(modelLabelCategory);
        
        jQuery.each(self.GetData(), function (index, label) {
            var isLabelEnabled = !modelLabelCategory.contains_businessprocesses || label.enabled;
           
            if (isLabelEnabled && label.category === labelCategoryUri) {
                enabledLabels.push(label);
            }
        });
        return enabledLabels;
    };
    self.GetLabelCategoryUri = function (modelLabelCategory) {
        var labelCategoryUri;
        var modelLabelCategoryUri = modelLabelCategory.uri;
        
        // clean categoryUri (/models/x/labelcategories/y -> /labelcategories/y)
        if (modelLabelCategoryUri.split('/').length !== 3) {
            var modelUri = WC.HtmlHelper.GetModelUriFromMetadataUri(modelLabelCategoryUri);
            labelCategoryUri = modelLabelCategoryUri.replace(modelUri, '');
        }

        return labelCategoryUri;
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
ModelLabelHandler.extend(WC.HandlerHelper);

function ModelLabelCategoryModel(model) {
    jQuery.extend(true, this, {
        id: '',
        uri: '',
        name: model.id,
        contains_businessprocesses: false,
        used_for_authorization: false,
        is_required: false,
        labels: ''
    }, model);
}
function ModelLabelCategoryHandler() {

    //BOF: Properties
    var self = this;

    /*=========== overridable properties =============
    self.Id = null;             [required] use for key in localstorage
    self.ResponseKey = null;    [required] data property in the response
    self.Data = {};             [required] keep data in local
    self.DataKey = 'uri';       [optional] property primary key
    self.Model = null;          [optional] model to handle data
    ==================================================*/
    self.Id = 'label_categories';
    self.ResponseKey = 'label_categories';
    self.Data = {};
    self.DataKey = 'uri';
    self.Model = ModelLabelCategoryModel;

    /*=============== custom properties ===============*/
    self.LabelHandler = new ModelLabelHandler();
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
    self.__GetModelUriFromData = self.GetModelUriFromData;
    self.GetModelUriFromData = function (data) {
        var uri = self.__GetModelUriFromData(data);
        if (!uri) {
            return '/models/all';
        }
        return uri;
    };

    /*=============== custom functions ===============*/
    self.LoadAllLabelCategories = function (uri, params, store) {
        var query = {};
        query[enumHandlers.PARAMETERS.CACHING] = false;
        jQuery.extend(query, params);

        return self.LoadAll(uri, { data: query, store: store });
    };
    self.GetLabelCategoryByUri = function (uri) {
        var modelUri = self.GetModelUriFromData({ uri: uri });
        return self.GetDataBy('uri', uri, modelUri);
    };
    self.GetLabelCategoriesByModel = function (modelUri) {
        return self.GetData(modelUri);
    };
    self.GetLabelCategoriesByModelAndViewType = function (modelUri, viewType) {
        var isBP = viewType === enumHandlers.MASSCHANGELABELVIEWTYPE.BP;
        var isPrivilege = viewType === enumHandlers.MASSCHANGELABELVIEWTYPE.BP || viewType === enumHandlers.MASSCHANGELABELVIEWTYPE.PRIVILEGE;
        return jQuery.grep(self.GetLabelCategoriesByModel(modelUri), function (labelCategory) {
            return labelCategory.contains_businessprocesses === isBP
                && labelCategory.used_for_authorization === isPrivilege;
        });
    };

    self.LoadAllLabels = function (uri, params, store) {
        return self.LabelHandler.LoadAllLabels(uri, params, store);
    };
    self.GetLabelById = function (id) {
        return self.LabelHandler.GetLabelById(id);
    };
    self.GetLabelsByCategoryUri = function (categoryUri) {
        var modelLabelCategory = self.GetLabelCategoryByUri(categoryUri);
        return self.LabelHandler.GetEnabledLabelsByCategory(modelLabelCategory);
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
ModelLabelCategoryHandler.extend(WC.ModelHandlerHelper);

var modelLabelCategoryHandler = new ModelLabelCategoryHandler();
