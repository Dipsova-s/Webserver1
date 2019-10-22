/// <loc filename="../../vsdoc.loc.xml" format="vsdoc" />

function FieldCategoryModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        id: '',
        uri: '',
        short_name: model.id,
        long_name: model.id
    }, model);
}

function FieldCategoryHandler() {
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
    self.Id = 'field_categories';
    self.ResponseKey = 'field_categories';
    self.Data = {};
    self.DataKey = 'uri';
    self.Model = FieldCategoryModel;

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
    self.LoadFieldCategories = function (params, store) {
        if (self.HasData()) {
            var response = {};
            response[self.ResponseKey] = self.GetData();
            return jQuery.when(response);
        }
        else {
            var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.FIELDCATEGORIES);
            return self.LoadAll(uri, { data: params, store: store });
        }
    };

    self.GetFieldCategoryByUri = function (uri) {
        return self.GetDataBy('uri', uri);
    };

    self.GetFieldCategoryById = function (id) {
        return self.GetDataBy('id', id);
    };

    self.GetCategoryIconByField = function (field, showSmallIcon) {
        if (typeof showSmallIcon === 'undefined')
            showSmallIcon = true;

        var category = self.GetFieldCategoryByUri(field.category);
        var iconId = category ? category.id : enumHandlers.FIELDCATEGORY.EA;
        var iconSize = showSmallIcon ? 16 : 32;
        var imageDetail = {
            path: kendo.format('{0}{1}_{2}.png', fieldCategoryIconPath, iconId, iconSize).toLowerCase(),
            dimension: {
                width: iconSize,
                height: iconSize
            }
        };

        return imageDetail;
    };

    self.GetCssClassCategoryIconByField = function () {
        return 'SignType1';
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
FieldCategoryHandler.extend(WC.HandlerHelper);

var fieldCategoryHandler = new FieldCategoryHandler();
