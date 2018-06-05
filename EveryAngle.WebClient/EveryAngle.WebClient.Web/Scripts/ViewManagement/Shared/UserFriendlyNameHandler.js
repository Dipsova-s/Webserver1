var userFriendlyNameHandler = new UserFriendlyNameHandler();

function UserFriendlyNameHandler() {
    "use strict";

    var self = this;
    self.GetFieldSourceByFieldObject = function (fieldObject) {
        var fieldSourceFriendlyName = '';
        
        if (fieldObject.source) {
            var fieldSource = modelFieldSourceHandler.GetFieldSourceByUri(fieldObject.source);
            if (fieldSource) {
                fieldSourceFriendlyName += fieldSource.short_name || fieldSource.long_name || fieldSource.id;
                fieldSourceFriendlyName += " - ";
            }
        }
        return fieldSourceFriendlyName;
    };

    self.GetFriendlyName = function (fieldObject, friendNameMode) {
        var friendlyName = '';
        switch (friendNameMode) {
            case enumHandlers.FRIENDLYNAMEMODE.SHORTNAME:
                friendlyName = fieldObject.short_name || fieldObject.long_name || fieldObject.id;
                break;

            case enumHandlers.FRIENDLYNAMEMODE.LONGNAME:
                friendlyName = fieldObject.long_name || fieldObject.short_name || fieldObject.id;
                break;

            case enumHandlers.FRIENDLYNAMEMODE.SHORTNAME_AND_LONGNAME:
                var shortName = self.GetFriendlyName(fieldObject, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
                var longName = self.GetFriendlyName(fieldObject, enumHandlers.FRIENDLYNAMEMODE.LONGNAME);

                if (shortName !== longName) {
                    friendlyName = shortName + ' - ' + longName;
                }
                else {
                    friendlyName = shortName;
                }
                break;

            case enumHandlers.FRIENDLYNAMEMODE.FIELDSOURCE_AND_SHORTNAME:
                friendlyName = self.GetFieldSourceByFieldObject(fieldObject);
                friendlyName += self.GetFriendlyName(fieldObject, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
                break;

            case enumHandlers.FRIENDLYNAMEMODE.FIELDSOURCE_AND_LONGNAME:
                friendlyName = self.GetFieldSourceByFieldObject(fieldObject);
                friendlyName += self.GetFriendlyName(fieldObject, enumHandlers.FRIENDLYNAMEMODE.LONGNAME);
                break;
        }
        return friendlyName;
    };
 
}
