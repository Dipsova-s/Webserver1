/// <reference path="/Dependencies/Helper/EnumHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/ListDrilldownHandler.js" />

describe(".GetPrimaryKeyData", function () {
    it("should set data when row contains id and objecttype", function () {
        var row = {
            id: "\\1",
            objecttype: "UserRole"
        };

        var result = listDrilldownHandler.GetPrimaryKeyData(row);
        expect(result.pkFields.length).toEqual(2);
        expect(result.pkFields[0]).toEqual("ID");
        expect(result.pkFields[1]).toEqual("ObjectType");
        expect(result.isValidPkValue).toEqual(true);
        expect(result.hasPkFields).toEqual(true);

        var json = JSON.stringify(result.pkData);
        var unescapedJson = unescape(json);
        var obj = JSON.parse(unescapedJson);
        expect(obj.ID).toEqual(row.id);
        expect(obj.ObjectType).toEqual(row.objecttype);
    });

    it("should set data when row contains undefined id and/or objecttype", function () {

        var testCases = [
            { id: "\\1" },
            { objecttype: 'UserRole' },
            {}
        ];

        jQuery.each(testCases, function (key, row) {

            var result = listDrilldownHandler.GetPrimaryKeyData(row);
            expect(result.pkFields.length).toEqual(2);
            expect(result.pkFields[0]).toEqual("ID");
            expect(result.pkFields[1]).toEqual("ObjectType");
            expect(result.isValidPkValue).toEqual(true);
            expect(result.hasPkFields).toEqual(false);
        });
    });

    it("should set data when row contains id and/or objecttype with null or empty string", function () {

        var testCases = [
            { id: "\\1", objecttype: '' },
            { id: '', objecttype: 'UserRole' },
            { id: '', objecttype: '' },
            { id: "\\1", objecttype: null },
            { id: null, objecttype: 'UserRole' },
            { id: null, objecttype: null }
        ];

        jQuery.each(testCases, function (key, row) {
            var result = listDrilldownHandler.GetPrimaryKeyData(row);
            expect(result.pkFields.length).toEqual(2);
            expect(result.pkFields[0]).toEqual("ID");
            expect(result.pkFields[1]).toEqual("ObjectType");
            expect(result.isValidPkValue).toEqual(false);
            expect(result.hasPkFields).toEqual(true);
        });
    });
});