/// <loc filename="../vsdoc.loc.xml" format="vsdoc" />

// HandlerHelper
(function (window, helper) {
    "use strict";

    var getModelData = function (model, data) {
        if (model)
            return new model(data);
        else
            return data;
    };
    var saveDataToStorage = function (id, data, storage) {
        if (storage !== false) {
            jQuery.localStorage(id, data);
        }
    };

    function HandlerHelper() {
        /// <field name="Id" type="String">[required] use for key in localstorage</field>
        /// <field name="ResponseKey" type="String">[optional] data property in the response</field>
        /// <field name="Data" type="Object">[required] kept data in local</field>
        /// <field name="DataKey" type="String">[optional] property primary key</field>
        /// <field name="Model" type="Class">[optional] model to handle data</field>
    }

    HandlerHelper.prototype.Id = null;
    HandlerHelper.prototype.ResponseKey = null;
    HandlerHelper.prototype.Data = {};
    HandlerHelper.prototype.DataKey = 'uri';
    HandlerHelper.prototype.Model = null;

    HandlerHelper.prototype.Load = function (uri, params, store) {
        /// <summary locid="M:HandlerHelper.Load"></summary>
        /// <param name="uri" type="String"></param>
        /// <param name="params" type="Object" optional="true"></param>
        /// <param name="store" type="Boolean" optional="true"></param>
        /// <returns type="Deferred"></returns>

        var self = this;
        var resultKey = self.ResponseKey;
        var requestUri = directoryHandler.ResolveDirectoryUri(uri);
        var query = {};
        if (resultKey) {
            query[enumHandlers.PARAMETERS.OFFSET] = 0;
            query[enumHandlers.PARAMETERS.LIMIT] = systemSettingHandler.GetMaxPageSize();
        }
        jQuery.extend(query, params);

        return GetDataFromWebService(requestUri, query)
            .then(function (data, status, xhr) {
                self.SetData(resultKey ? data[resultKey] : data, store);
                return jQuery.when(data, status, xhr);
            });
    };

    HandlerHelper.prototype.LoadAll = function (uri, options) {
        /// <summary locid="M:HandlerHelper.LoadAll"></summary>
        /// <param name="uri" type="String"></param>
        /// <param name="options" type="Object" optional="true"></param>
        /// <returns type="Deferred"></returns>

        var self = this;
        var resultKey = self.ResponseKey;

        var params = {};
        if (resultKey) {
            params[enumHandlers.PARAMETERS.OFFSET] = 0;
            params[enumHandlers.PARAMETERS.LIMIT] = systemSettingHandler.GetMaxPageSize();
        }
        var setting = jQuery.extend(true, { data: params, store: true }, options);

        var deferred = jQuery.Deferred();
        var isLoadAll = setting.data[enumHandlers.PARAMETERS.LIMIT] === params[enumHandlers.PARAMETERS.LIMIT];

        var result = {};
        result[resultKey] = [];
        self.Load(uri, setting.data, setting.store)
            .done(function (data) {
                result.header = data.header;
                jQuery.merge(result[resultKey], data[resultKey]);

                if (isLoadAll && data.header && data.header.total > data.header.limit) {
                    var i, pageSize = Math.ceil(data.header.total / data.header.limit);
                    var requestDeferred = [];
                    for (i = 1; i < pageSize; i++) {
                        var requestParams = {};
                        requestParams[enumHandlers.PARAMETERS.OFFSET] = data.header.limit * i;
                        requestParams[enumHandlers.PARAMETERS.LIMIT] = data.header.limit;
                        requestDeferred.pushDeferred(self.Load, [uri, requestParams, setting.store]);
                    }
                    jQuery.whenAll.call(self, requestDeferred)
                        .done(function () {
                            deferred.resolve(result);
                        });
                }
                else {
                    deferred.resolve(result);
                }
            });

        return deferred.promise();
    };

    HandlerHelper.prototype.HasData = function () {
        return !jQuery.isEmptyObject(this.Data);
    };

    HandlerHelper.prototype.GetDataBy = function (key, value, sensitive) {
        /// <summary locid="M:HandlerHelper.GetDataBy"></summary>
        /// <param name="key" type="String"></param>
        /// <param name="value" type="Object"></param>
        /// <param name="sensitive" type="Boolean" optional="true">default: if key is "id" will "false" else "true", case sensitive</param>
        /// <returns type="Object" mayBeNull="true"></returns>

        var self = this;
        var data = self.Data;

        if (key === self.DataKey) {
            return data[(value || '').toLowerCase()] || null;
        }
        else {
            var result = null;
            if (typeof sensitive === 'undefined') {
                sensitive = key !== 'id';
            }
            jQuery.each(data, function (i, d) {
                if (WC.Utility.Compare(d[key], value, sensitive)) {
                    result = d;
                    return false;
                }
            });
            return result;
        }
    };

    HandlerHelper.prototype.GetData = function () {
        /// <summary locid="M:HandlerHelper.GetData"></summary>
        /// <returns type="Array|Object"></returns>

        var self = this;
        if (self.DataKey) {
            var data = [];
            jQuery.each(self.Data, function (i, d) {
                data.push(d);
            });
            return data;
        }
        else {
            return self.Data;
        }
    };

    HandlerHelper.prototype.SetData = function (data, storage) {
        /// <summary locid="M:HandlerHelper.SetData"></summary>
        /// <param name="data" type="Array|Object"></param>
        /// <param name="storage" type="Boolean" optional="true"></param>

        var self = this;
        if (data instanceof Array && data.length && self.DataKey) {
            jQuery.each(data, function (i, d) {
                data[i] = getModelData(self.Model, d);
                self.Data[d[self.DataKey].toLowerCase()] = data[i];
            });

            saveDataToStorage(self.Id, self.Data, storage);
        }
        else if (typeof data === 'object' && !jQuery.isEmptyObject(data) && !self.DataKey) {
            self.Data = getModelData(self.Model, data);

            saveDataToStorage(self.Id, self.Data, storage);
        }
    };

    HandlerHelper.prototype.Initial = function () {
        /// <summary locid="M:HandlerHelper.Initial"></summary>

        var self = this;
        self.Data = jQuery.localStorage(self.Id) || {};
        self.SetData(self.GetData(), false);
    };

    window.WC.HandlerHelper = helper || HandlerHelper;

})(window, WC.HandlerHelper);
