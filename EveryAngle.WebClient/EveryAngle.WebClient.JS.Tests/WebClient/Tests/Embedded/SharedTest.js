﻿describe("Shared", function () {
    var object;
    var object2;

    beforeEach(function () {
        object = [{
            "id": "d2b5316e829b645e3a742475124054505",
            "uri": "/models/1/angles/410/displays/2204",
            "name": "New Display",
            "type": "list",
            "number": 8
        }, {
            "id": "eacb72868f2ec44e6cb306a4a311df713b",
            "uri": "/models/1/angles/410/displays/2205",
            "name": "New chart display",
            "type": "chart",
            "number": 15
        }, {
            "id": "ea222cde9f38c64e109813c78686d16873",
            "uri": "/models/1/angles/410/displays/2213",
            "name": "Test display",
            "type": "pivot",
            "number": 1
        }, {
            "id": "ea9348858f6aee4acaa34f205e58390a97",
            "uri": "/models/1/angles/410/displays/2214",
            "name": "Chart display",
            "type": "chart",
            "number": 2
        }, {
            "id": "ea71abf3857482497592b15e35a0343638",
            "uri": "/models/1/angles/410/displays/2215",
            "name": "Dutch Display",
            "type": "chart",
            "number": 5
        }, {
            "id": "d2b5316e829b645e3a742475565989545",
            "uri": "/models/1/angles/410/displays/2204",
            "name": "New Display",
            "type": "list",
            "number": 3
        }];

        object2 = [
        {
            "short_name": "1111",
            "long_name": "1111",
            "id": "es0ToBeExecuted",
            "pattern": "/",
            "color": "FF22B900"
        },
        {
            "short_name": "0000",
            "long_name": "0000",
            "id": "es1PartiallyExecuted",
            "pattern": "\\",
            "color": "FF99CCFF"
        },
        {
            "short_name": "<no value>",
            "long_name": "<no value>",
            "id": null,
            "pattern": "/",
            "color": "FF000000"
        },
        {
            "short_name": "<not in set>",
            "long_name": "<not in set>",
            "id": "~NotInSet",
            "pattern": "/",
            "color": "FF000000"
        },
        {
            "short_name": "Closed",
            "long_name": "Closed",
            "id": "es2FullyExecuted",
            "color": "FFEDA100"
        },
        {
            "short_name": "Cancelled",
            "long_name": "Cancelled",
            "id": "es3Cancelled",
            "color": "FFED0000"
        },
        {
            "short_name": "N/a",
            "long_name": "Not applicable",
            "id": "es4None",
            "pattern": "/",
            "color": "FFC2C2C2"
        }];
    });

    describe("Array.sortObject", function () {

        it("sort string when not specify direction, should short name by ascending", function () {
            object.sortObject('name');
            expect(object[0].name).toEqual('Chart display');
        });

        it("sort string should short name by ascending", function () {
            object.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
            expect(object[0].name).toEqual('Chart display');
        });

        it("sort string should short name by decending", function () {
            object.sortObject('name', enumHandlers.SORTDIRECTION.DESC, false);
            expect(object[0].name).toEqual('Test display');
        });

        it("sort number should short name by decending", function () {
            object.sortObject('number', enumHandlers.SORTDIRECTION.DESC, false);
            expect(object[0].number).toEqual(15);
        });

        it("sort string null by descending, first object should be null", function () {
            object.push({
                "id": "1234",
                "uri": "/models/1/angles/410/displays/1520",
                "name": null,
                "type": "list",
                "number": 8
            });
            object.unshift({
                "id": "1234",
                "uri": "/models/1/angles/410/displays/5520",
                "name": null,
                "type": "list",
                "number": 6
            });
            object.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);
            expect(object[0].name).toEqual(null);
        });

        it("sort string begin with special character", function () {
            object2.sortObject('short_name', enumHandlers.SORTDIRECTION.ASC, false);
            expect(object2[0].short_name).toEqual('<no value>');
            expect(object2[1].short_name).toEqual('<not in set>');
        });

    });

    describe('jQuery.highlighter.getWords', function () {
        
        var tests = [
            {
                text: '',
                expected: ''
            },
            {
                text: 'a b a b c',
                expected: 'a,b,c'
            },
            {
                text: '"a b" b c',
                expected: 'a b,b,c'
            },
            {
                text: '0 "1" "a b" "a b"',
                expected: '0,1,a b'
            },
            {
                text: 'a"b "c d" e f',
                expected: 'a"b,c d,e,f'
            },
            {
                text: '"a b" c"',
                expected: 'a b,c"'
            },
            {
                text: '"a b" c" "a b"',
                expected: 'a b,c"'
            }
        ];

        $.each(tests, function (index, test) {
            it('should get words [' + test.text + '] -> [' + test.expected + ']', function () {
                var result = jQuery.highlighter.getWords(test.text);
                expect(result.join(',')).toEqual(test.expected);
            });
        });

    });
});
