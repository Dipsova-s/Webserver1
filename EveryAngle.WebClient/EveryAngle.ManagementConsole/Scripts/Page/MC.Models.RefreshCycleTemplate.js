; (function (win, models) {

    function RefreshCycleTemplate() {
        var self = this;

        self.GetDaysCheckbox = function (data) {
            return MC.util.task.getDaysCheckbox(data);
        };

        self.SetAbilityToEditControl = function (data, modelID) {
            var currentStatus = data.status;

            var id = data.id;
            var uri = data.Uri;

            var isTestExtractor = id === 'EATest_' + modelID;
            var isExecuting = currentStatus === 'running' || currentStatus === 'queued';
            var isExternal = MC.util.task.isTriggerExternal(data);

            // task uri
            var template = "<input type=\"hidden\" name=\"uri\" value=\"" + uri + "\" />";

            // not show edit and cancel buttons if use test extraction task
            if (!isTestExtractor) {
                template += "<a onclick=\"MC.Models.RefreshCycle.EditTask(this)\" class=\"btn btnEdit\">" + Localization.Edit + "</a>";
                template += "<a onclick=\"MC.Models.RefreshCycle.CancelEditTask(this)\" class=\"btn btnCancel\">" + Captions.Button_Cancel + "</a>";
            }

            // execute task button
            template += "<a onclick=\"MC.Models.RefreshCycle.ExecuteTask(this,'" + uri + "')\" class=\"btn btn btnExecute " + (isExecuting ? "disabled" : "") + "\" data-disabled=\"" + (isExecuting) + "\">" + Localization.MC_ExecuteNow + "</a>";

            // copy command button
            if (isExternal) {
                template += "<a class=\"btn btn btnCopy btnCopyCommand\" data-clipboard-text=\"" + MC.util.task.getTriggerExternalUrl(data) + "\">" + Localization.MC_CopyCommand + "</a>";
            }

            // abort task and delete task buttons
            template += "<a onclick=\"MC.Models.RefreshCycle.AbortTask(this,'" + uri + "')\" class=\"btn btnAbort " + (!isExecuting ? "disabled" : "") + "\"  data-disabled=\"" + (!isExecuting) + "\">" + Localization.MC_Abort + "</a>";
            template += "<a data-parameters='{\"taskUri\":\"" + uri + "\"}' data-delete-template=\"" + Localization.MC_DeleteTaskConfirm + "\" onclick=\"MC.Models.RefreshCycle.DeleteTask(event, this)\" class=\"btn btnDelete" + (isExecuting || isTestExtractor ? ' disabled' : '') + "\"  data-disabled=\"" + (isExecuting || isTestExtractor) + "\">" + Localization.Delete + "</a>";

            // ps: data-disabled means that button exactly disabled, use for re-enabled some buttons when user click cancel edit task
            return template;
        };

        self.SetDisableToEditControl = function (data) {
            var uri = data.Uri;

            var template = "<input type=\"hidden\" name=\"uri\" value=\"" + uri + "\" />";
            template += "<a class=\"btn btnEdit disabled\" data-disabled=\"true\">" + Localization.Edit + "</a>";
            template += "<a class=\"btn btnCancel disabled\" data-disabled=\"true\">" + Captions.Button_Cancel + "</a>";
            template += "<a class=\"btn btnDelete disabled" + "\" data-disabled=\"true\">" + Localization.Delete + "</a>";

            // ps: data-disabled please read comment in self.SetAbilityToEditControl function
            return template;
        };
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        RefreshCycleTemplate: new RefreshCycleTemplate()
    });

})(window, MC.Models);
