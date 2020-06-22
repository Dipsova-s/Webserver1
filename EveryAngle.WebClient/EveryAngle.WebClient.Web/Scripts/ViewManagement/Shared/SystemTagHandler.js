function SystemTagModel(model) {
    "use strict";

    jQuery.extend(true, this, {
        id: '',
        uri: '',
        name: ''
    }, model);
}

function SystemTagHandler() {
    "use strict";

    //BOF: Properties
    var self = this;

    self.Id = 'system_tags';
    self.ResponseKey = 'tags';
    self.Data = {};
    self.DataKey = 'name';
    self.Model = SystemTagModel;
    self.Uri = '/tags';
    //EOF: Properties

    //BOF: Methods
    /*=============== custom functions ===============*/
    self.SearchTags = function (q) {
        self.Data = {};
        return self.Load(self.Uri, { q: q }, false)
            .fail(errorHandlerModel.IgnoreAjaxError);
    };
    /*================================================*/
    //EOF: Methods

    // call initializing
    self.Initial();
}
SystemTagHandler.extend(WC.HandlerHelper);

var systemTagHandler = new SystemTagHandler();
