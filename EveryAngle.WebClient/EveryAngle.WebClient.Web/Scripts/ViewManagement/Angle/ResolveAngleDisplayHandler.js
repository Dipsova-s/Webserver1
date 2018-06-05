var resolveAngleDisplayHandler = new ResolveAngleDisplayHandler();

function ResolveAngleDisplayHandler() {
    "use strict";

    var self = this;

    self.IsConflictAngleDisplay = function (xhr) {
        return xhr.status === 422 && xhr.responseText.indexOf('\\"tasks\\"') !== -1;
    };

    self.ShowResolveAngleDisplayPopup = function (xhr, callback, args) {
        progressbarModel.EndProgressBar();
        var isCancelConflict = true;
        var popupSettings = {
            width: 700,
            minWidth: 600,
            height: 350,
            title: Localization.Confirm_Title,
            html: self.CreateConflictListHtml(xhr.responseText),
            element: '#popupResolveAngleDisplay',
            className: 'popupResolveAngleDisplay',
            buttons: [
                {
                    text: Captions.Button_Cancel,
                    position: 'right',
                    click: 'close'
                },
                {
                    //if confirm deleting angle, send ?force=true to API
                    text: Localization.Ok,
                    isPrimary: true,
                    click: function (e) {
                        isCancelConflict = false;
                        if (jQuery.isFunction(callback))
                            callback.apply(null, args);

                        e.kendoWindow.close();
                    },
                    position: 'right'
                }
            ],
            close: function (e) {
                if (isCancelConflict)
                    progressbarModel.CancelFunction();
                errorHandlerModel.Enable(true);
                e.sender.destroy();
            }
        };

        popup.Show(popupSettings);
    };

    self.CreateConflictListHtml = function (responseText) {
        var isDeleteAction = false;
        var info = WC.Utility.ParseJSON(responseText);
        var conflictData = WC.Utility.ParseJSON(info.message);
        var tasks = WC.Utility.ToArray(conflictData.tasks);
        var html = [];
        var tbody = [];

        tbody.push('<tbody>');
        jQuery.each(tasks, function (index, task) {
            if (typeof task.will_delete_task === 'boolean')
                isDeleteAction = true;

            tbody.push('<tr>');
            tbody.push('<td>' + task.name + '</td>');
            tbody.push('<td>' + task.createdby + '</td>');
            tbody.push('<td>' + task.datastore + '</td>');
            if (isDeleteAction) {
                tbody.push('<td>' + (task.will_delete_task ? Localization.Yes : Localization.No) + '</td>');
            }
            tbody.push('</tr>');
        });
        tbody.push('</tbody>');

        // alert message
        if (isDeleteAction) {
            html.push('<div class="conflictAlert">' + Localization.ResolveAngleDisplay_ConflictAlert_Delete + '</div>');
        }
        else {
            html.push('<div class="conflictAlert">' + Localization.ResolveAngleDisplay_ConflictAlert_Update + '</div>');
        }

        // table
        html.push('<table class="reportTable">');

        // header
        html.push('<thead>');
        html.push('<tr>');
        html.push('<th>' + Captions.ResolveAngleDisplay_TaskName + '</th>');
        html.push('<th>' + Captions.ResolveAngleDisplay_TaskCreator + '</th>');
        html.push('<th>' + Captions.ResolveAngleDisplay_TaskDatastore + '</th>');
        if (isDeleteAction) {
            html.push('<th>' + Captions.ResolveAngleDisplay_WillDeleteTask + '</th>');
        }
        html.push('</tr>');
        html.push('</thead>');

        html.push(tbody.join(''));
        html.push('</table>');

        // confirm message
        if (isDeleteAction) {
            html.push('<div class="conflictQuestion">' + Localization.ResolveAngleDisplay_ConflictQuestion_Delete + '</div>');
        }
        else {
            html.push('<div class="conflictQuestion">' + Localization.ResolveAngleDisplay_ConflictQuestion_Update + '</div>');
        }

        return html.join('');
    };

}