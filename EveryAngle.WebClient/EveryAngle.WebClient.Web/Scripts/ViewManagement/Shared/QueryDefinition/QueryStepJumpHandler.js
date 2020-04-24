(function (handler) {
    "use strict";

    handler.IsJump = function (queryStep) {
        return queryStep && queryStep.step_type === enumHandlers.FILTERTYPE.FOLLOWUP;
    };
    handler.IsErrorJump = function (queryStep) {
        var self = this;
        return self.IsJump(queryStep) && queryStep.valid() === false;
    };
    handler.HasErrorJump = function () {
        var self = this;
        var hasError = false;
        jQuery.each(self.GetJumps(), function (_index, queryStep) {
            if (self.IsErrorJump(queryStep)) {
                hasError = true;
                return false;
            }
        });
        return hasError;
    };
    handler.GetJumps = function () {
        var self = this;
        return self.GetQueryStepsByTypes([enumHandlers.FILTERTYPE.FOLLOWUP]);
    };
    handler.GetLastJump = function () {
        var self = this;
        var jumps = self.Parent() ? self.Parent().GetJumps() : [];
        jQuery.merge(jumps, self.GetJumps());
        return jumps.length ? jumps[jumps.length - 1] : null;
    };
    handler.CanRemoveJump = function (queryStep) {
        // check can click delete jump
        var self = this;
        return queryStep.is_adhoc() || self.Authorizations.CanChangeJump();
    };
    handler.CanAddFilterFromJump = function (queryStep) {
        // check can add filter before this jump
        var self = this;
        return queryStep.valid() && self.CanAdd(queryStep);
    };
    handler.RemoveJump = function (queryStep) {
        // remove itself and the rest after this jump
        var self = this;
        for (var i = self.Data().length - 1; i >= 0; i--) {
            var currentQueryStep = self.Data()[i];
            if (self.IsFilterOrJump(currentQueryStep)) {
                self.Data.remove(currentQueryStep);
            }
            if (queryStep === currentQueryStep)
                break;
        }
    };
    handler.AddJump = function (field) {
        var self = this;
        modelFollowupsHandler.SetFollowups([field]);
        var queryStep = {
            step_type: enumHandlers.FILTERTYPE.FOLLOWUP,
            followup: field.id,
            is_adhoc: true
        };
        self.AddQueryJump(queryStep);
    };
    handler.AddQueryJump = function (queryStep) {
        var self = this;
        
        // open panel
        self.ExpandPanel();

        // add jump
        var index = self.GetAddJumpOrFilterIndex();
        var jump = new QueryStepViewModel(queryStep, self.ModelUri);
        self.Data.splice(index, 0, jump);

        // close filter editors
        self.CloseAllFilterEditors();

        // scroll to the editor
        self.ScrollToItem(jump);

        // update blocker size/position
        self.TriggerUpdateBlockUI();
    };
    handler.ShowInfoJumpPopup = function (queryStep) {
        helpTextHandler.ShowHelpTextPopup(queryStep.followup, helpTextHandler.HELPTYPE.FOLLOWUP, queryStep.model);
    };
    handler.ShowAddJumpPopup = function (options) {
        var self = this;
        if (!self.CanAdd())
            return;

        var sender = {
            FilterFor: self.FilterFor,
            Data: self.Data,
            AddFieldFollowup: jQuery.proxy(self.AddJump, self)
        };
        var parentData = [];
        var childData = [];
        if (!self.Parent()) {
            // for angle
            parentData = self.GetData();
        }
        else {
            // for display
            parentData = self.Parent().GetData();
            childData = self.GetData();
        }
        followupPageHandler.SetHandlerValues(sender, parentData, childData);
        followupPageHandler.ShowPopup(jQuery.extend({}, options), Localization.AddFollowUp);
    };
    handler.ShowAddFilterFromJumpPopup = function (queryStep) {
        // add filter before jump action

        var self = this;
        if (!self.CanAdd(queryStep))
            return;

        var target = self.GetAddFilterTarget();
        var sender = {
            FilterFor: self.FilterFor,
            GetData: self.GetData,
            InsertFieldFilter: jQuery.proxy(self.InsertFilter, self),
            FollowupInfo: {
                Index: self.Data.indexOf(queryStep)
            }
        };
        self.InitialAddFilterOptions();
        fieldsChooserHandler.ShowPopup(fieldsChooserHandler.USETYPE.ADDFILTER, target, sender);
    };
}(QueryDefinitionHandler.prototype));