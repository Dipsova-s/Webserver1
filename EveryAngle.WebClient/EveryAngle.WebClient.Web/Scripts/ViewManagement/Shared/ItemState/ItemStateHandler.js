function ItemStateHandler() {
    "use strict";

    var self = this;
    self.View = new ItemStateView();
    self.Texts = {};
    self.CanSetState = ko.observable(false);
    self.Data = {
        model: '',
        is_published: ko.observable(false),
        is_validated: ko.observable(false),
        assigned_labels: [],
        uri: '',
        state: '',
        authorizations: ko.observable({
            update: false,
            publish: false,
            unpublish: false,
            validate: false,
            unvalidate: false,
            mark_template: false,
            unmark_template: false
        }),
        created: {}
    };
    self.Languages = ko.observableArray([]);
    self.Labels = ko.observableArray([]);
    
    // shared functions
    self.SetItemData = function (item) {
        self.Data.model = item.model;
        self.Data.is_published(item.is_published);
        self.Data.is_validated(item.is_validated);
        self.Data.assigned_labels = item.assigned_labels;
        self.Data.uri = item.uri;
        self.Data.state = item.state;
        self.Data.created = item.created;
        self.Data.authorizations(item.authorizations);
        self.Languages(self.GetLanguagesData(item.multi_lang_name));
    };
    self.GetLanguagesData = function (names) {
        return jQuery.map(names, function (name) {
            var language = systemLanguageHandler.GetDataBy('id', name.lang);
            return language ? language.name : name.lang;
        });
    };
    self.OnPopupResized = function (e, handle) {
        var offset = self.GetPopupPosition(e, handle);
        e.sender.setOptions({ position: offset });
    };
    self.GetPopupPosition = function (e, handle) {
        handle = jQuery(handle);
        var offset = handle.offset();
        offset.top += handle.outerHeight();
        offset.left -= e.sender.wrapper.outerWidth() - handle.outerWidth();
        return offset;
    };
    self.Update = jQuery.noop;
    self.UpdateState = jQuery.noop;
}