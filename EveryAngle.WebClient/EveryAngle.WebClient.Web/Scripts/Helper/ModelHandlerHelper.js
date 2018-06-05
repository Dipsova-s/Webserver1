/// <loc filename="../vsdoc.loc.xml" format="vsdoc" />

// ModelHandlerHelper
(function (window, helper) {
    "use strict";

    function ModelHandlerHelper() {
        // <field name="ResponseKey" type="String">[required] data property in the response</field>
    }
    ModelHandlerHelper.extend(WC.HandlerHelper);

    // override functions
    ModelHandlerHelper.prototype.HasData = function (modelUri) {
        return !jQuery.isEmptyObject(this.Data[modelUri]);
    };

    ModelHandlerHelper.prototype.GetDataBy = function (key, value, modelUri, sensitive) {
        /// <summary locid="M:HandlerHelper.GetDataBy"></summary>
        /// <param name="key" type="String"></param>
        /// <param name="value" type="Object"></param>
        /// <param name="modelUri" type="string">model uri</param>
        /// <param name="sensitive" type="Boolean" optional="true">default: if key is "id" will "false" else "true", case sensitive</param>
        /// <returns type="Object" mayBeNull="true"></returns>

        var self = this;
        var modelData = self.Data[modelUri] || {};
        var result;

        if (key === self.DataKey) {
            result = modelData[(value || '').toLowerCase()] || null;
        }
        else {
            result = null;
            if (typeof sensitive === 'undefined') {
                sensitive = key !== 'id';
            }
            jQuery.each(modelData, function (i, d) {
                if (WC.Utility.Compare(d[key], value, sensitive)) {
                    result = d;
                    return false;
                }
            });
        }
        return result;
    };

    ModelHandlerHelper.prototype.GetData = function (modelUri) {
        /// <summary locid="M:HandlerHelper.GetData"></summary>
        /// <param name="modelUri" type="String">model uri</param>
        /// <returns type="Array"></returns>

        var self = this;
        var data = [];
        jQuery.each(self.Data[modelUri] || {}, function (i, d) {
            data.push(d);
        });
        return data;
    };

    ModelHandlerHelper.prototype.SetData = function (data, storage) {
        /// <summary locid="M:HandlerHelper.SetData"></summary>
        /// <param name="data" type="Array|Object"></param>
        /// <param name="storage" type="Boolean" optional="true"></param>

        var self = this;
        if (data instanceof Array && data.length && self.DataKey) {
            var modelUri = self.GetModelUriFromData(data[0]);
            if (modelUri) {
                if (!self.Data[modelUri]) {
                    self.Data[modelUri] = {};
                }
                var dataModel = self.Data[modelUri];

                jQuery.each(data, function (i, d) {
                    if (self.Model)
                        data[i] = new self.Model(d);
                    dataModel[d[self.DataKey].toLowerCase()] = data[i];
                });

                if (storage !== false) {
                    jQuery.localStorage(self.Id, self.Data);
                }
            }
        }
    };

    ModelHandlerHelper.prototype.Initial = function () {
        /// <summary locid="M:HandlerHelper.Initial"></summary>

        var self = this;
        self.Data = jQuery.localStorage(self.Id) || {};
        jQuery.each(self.Data, function (modelUri) {
            self.SetData(self.GetData(modelUri), false);
        });
    };

    // extend functions
    ModelHandlerHelper.prototype.LoadByIds = function (uri, ids, query, storage) {
        // <summary>
        /// load data from service by ids
        /// </summary>
        /// <param name="uri" type="String">request uri</param>
        /// <param name="ids" type="Array">list of id</param>
        /// <param name="query" type="Object">query</param>
        /// <param name="storage" type="Boolean" optional="true"></param>
        /// <returns type="Deferred"></returns>

        var self = this;
        var resultKey = self.ResponseKey;
        var queryIDS = [];
        var modelUri = WC.HtmlHelper.GetModelUriFromMetadataUri(uri);
        var result = {};
        result[resultKey] = [];

        jQuery.each(ids, function (index, id) {
            var data = self.GetDataBy('id', id, modelUri);
            if (data) {
                result[resultKey].push(data);
            }
            else if (jQuery.inArray(id, queryIDS) === -1) {
                queryIDS.push(id);
            }
        });

        var deferred = [];
        var loadDataByIds = function (ids) {
            var params = {};
            params[enumHandlers.PARAMETERS.OFFSET] = 0;
            params[enumHandlers.PARAMETERS.LIMIT] = ids.length;
            params['ids'] = ids.join(',');
            jQuery.extend(params, query);

            return self.Load(uri, params, storage)
                .done(function (data) {
                    jQuery.merge(result[resultKey], data[resultKey]);
                });
        };
        while (queryIDS.length) {
            deferred.pushDeferred(loadDataByIds, [queryIDS.splice(0, 30)]);
        }
        return jQuery.whenAll.call(self, deferred)
            .then(function () {
                return jQuery.when(result);
            });
    };

    ModelHandlerHelper.prototype.GetModelUriFromData = function (data) {
        /// <summary>
        /// get model uri from data
        /// </summary>
        /// <param name="data" type="Object">data</param>
        /// <returns type="String" mayBeNull="true">Nullable</returns>

        if (data && data.uri) {
            var uri = WC.HtmlHelper.GetModelUriFromMetadataUri(data.uri);
            if (uri.indexOf('/models/') !== -1) {
                return uri;
            }
        }
        return null;
    };

    window.WC.ModelHandlerHelper = helper || ModelHandlerHelper;

})(window, WC.ModelHandlerHelper);
