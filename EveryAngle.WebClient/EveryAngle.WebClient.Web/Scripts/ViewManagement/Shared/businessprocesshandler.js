var businessProcessHandler = new BusinessProcessHandler();

function BusinessProcessHandler() {
    "use strict";

    var self = this;

    self.ManageBPAuthorization = function (model, modelPrivileges, checkReadonly) {
        if (typeof checkReadonly === 'undefined') {
            checkReadonly = false;
        }

        if (modelPrivileges.length && !!model) {
            var lableAuthorization = modelPrivileges[0].label_authorizations;
            var assignedPrivileges = [];
            var bpData = model.Data();

            jQuery.each(bpData, function (index, bp) {
                bp.is_allowed = true;
                bp.__readonly = false;
            });

            jQuery.each(lableAuthorization, function (label, privilege) {
                var bps = jQuery.grep(bpData, function (data) { return data.id.toLowerCase() === label.toLowerCase(); });
                if (bps.length) {
                    bps[0].is_allowed = privilege.toLowerCase() !== enumHandlers.PRIVILEGES.DENY.toLowerCase();
                    if (checkReadonly)
                        bps[0].__readonly = privilege.toLowerCase() === enumHandlers.PRIVILEGES.VIEW.toLowerCase();
                    assignedPrivileges.push(bps[0].id);
                }
            });

            if (bpData.length !== assignedPrivileges.length) {
                jQuery.each(bpData, function (index, bp) {
                    if (jQuery.inArray(bp.id, assignedPrivileges) === -1)
                        bp.is_allowed = false;
                });
            }

            model.Data(bpData);
           
        }
    };
}
