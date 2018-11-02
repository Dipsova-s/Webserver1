function ModelFieldDomainModel(model) {
    "use strict";

    jQuery.extend(this, {
        id: '',
        uri: '',
        short_name: model.id,
        long_name: model.id,
        elements: [],
        may_be_sorted: true,
        element_count: 0
    }, model);

    var elements = this.elements;
    jQuery.each(elements, function (index, element) {
        elements[index] = new ModelFieldDomainElementModel(element);
    });
}
function ModelFieldDomainElementModel(model) {
    "use strict";

    jQuery.extend(this, {
        id: null,
        short_name: model.id,
        long_name: model.id,
        pattern: '',
        color: ''
    }, model);
}

function ModelFieldDomainHandler() {
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
    self.Id = 'field_domains';
    self.ResponseKey = 'domains';
    self.Data = {};
    self.Model = ModelFieldDomainModel;

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
    self.LoadFieldDomain = function (uri) {
        if (!uri) return jQuery.when(null);

        var data = self.GetFieldDomainByUri(uri);
        if (data) {
            return jQuery.when(data);
        }

        return jQuery.when(GetDataFromWebService(directoryHandler.ResolveDirectoryUri(uri)))
            .done(function (data, status, xhr) {
                self.SetData([data]);
            });
    };
    self.GetFieldDomainByUri = function (uri) {
        var modelUri = self.GetModelUriFromData({ uri: uri });
        return self.GetDataBy('uri', uri, modelUri);
    };
    self.GetFieldsDomainByModelUri = function (modelUri) {
        return self.GetData(modelUri);
    };
    self.GetDomainPathByUri = function (domainUri) {
        var result = null;
        var fieldDomain = self.GetFieldDomainByUri(domainUri);
        if (fieldDomain) {
            var domainIds = fieldDomain.id.split('_');
            var domainId = domainIds[domainIds.length - 1].toLowerCase();
            var imageFolderExists = self.GetDomainImageOnServer();
            var folderIndex = jQuery.inArray(domainId, imageFolderExists);
            if (folderIndex !== -1) {
                result = imageFolderExists[folderIndex];
            }
        }
        return result;
    };
    self.GetDomainImageOnServer = function () {
        return domainImageFolders.toLowerCase().split(',');
    };
    self.GetDomainElementIconInfo = function (folder, elementId) {
        var iconName = folder + elementId;
        var className = 'icon-' + iconName;
        var iconPath = kendo.format('{0}domains/{1}/{2}.png', GetImageFolderPath(), folder, iconName).toLowerCase();
        return {
            id: className,
            css: kendo.format('.domainIcon.{0} \{ background-image: url("{1}"); \}', className, iconPath),
            html: kendo.format('<span class="domainIcon {0}"></span>', className)
        };
    };
    self.GetDomainElementById = function (domainUri, elementId) {
        var result = null;
        var domain = self.GetFieldDomainByUri(domainUri);
        if (domain) {
            result = domain.elements.findObject('id', elementId, false);
        }
        return result;
    };
    self.GetDomainElementByShortName = function (domainUri, elementId) {
        var result = null;
        var domain = self.GetFieldDomainByUri(domainUri);
        if (domain) {
            result = domain.elements.findObject('short_name', elementId, false);
        }
        return result;
    };
    self.GetDomainElementByName = function (domainUri, name) {
        var result = null;
        var domain = self.GetFieldDomainByUri(domainUri);
        if (domain && name) {
            name = name.toLowerCase();
            jQuery.each(domain.elements, function (index, element) {
                if (element.long_name) {
                    if (element.long_name.toLowerCase() === name) {
                        result = element;
                        return false;
                    }
                }

                if (element.short_name) {
                    if (element.short_name.toLowerCase() === name) {
                        result = element;
                        return false;
                    }
                }
            });
        }
        return result;
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
ModelFieldDomainHandler.extend(WC.ModelHandlerHelper);

var modelFieldDomainHandler = new ModelFieldDomainHandler();
