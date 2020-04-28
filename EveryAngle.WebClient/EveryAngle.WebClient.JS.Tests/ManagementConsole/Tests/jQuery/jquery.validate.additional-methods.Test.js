/// <reference path="/Dependencies/jquery/jquery.validate.min.js" />
/// <reference path="/Dependencies/jquery/jquery.validate.additional-methods.js" />

describe("$.validator.methods", function () {
    
    beforeEach(function () {
        spyOn($.validator.prototype, 'optional').and.callFake(function () { return false; });
    });

    describe(".package_name", function () {

        var tests = [
            // valid
            { value: '_', expected: true },
            { value: 'a', expected: true },
            { value: '0', expected: true },
            { value: 'a_0', expected: true },

            // invalid
            { value: '#', expected: false },
            { value: '-', expected: false },
            { value: ' ', expected: false },
            { value: '(a)', expected: false },
            { value: 'a.1', expected: false },
            { value: '"', expected: false },
            { value: '+', expected: false },
            { value: 'ก', expected: false }
        ];

        $.each(tests, function (index, test) {
            it("should be " + (test.expected ? 'valid' : 'invalid') + " for package name \"" + test.value + "\"", function () {
                var result = $.validator.methods.package_name.call($.validator.prototype, test.value);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe(".package_id", function () {

        var tests = [
            // valid
            { value: '_', expected: true },
            { value: 'a', expected: true },
            { value: 'a_0', expected: true },

            // invalid
            { value: '0a', expected: false },
            { value: '#', expected: false },
            { value: '-', expected: false },
            { value: ' ', expected: false },
            { value: '(a)', expected: false },
            { value: 'a.1', expected: false },
            { value: '"', expected: false },
            { value: '+', expected: false },
            { value: 'ก', expected: false }
        ];

        $.each(tests, function (index, test) {
            it("should be " + (test.expected ? 'valid' : 'invalid') + " for package Id \"" + test.value + "\"", function () {
                var result = $.validator.methods.package_id.call($.validator.prototype, test.value);
                expect(test.expected).toEqual(result);
            });
        });
    });

    describe(".package_version", function () {

        var tests = [
            // valid
            { value: '1.0', expected: true },
            { value: '1', expected: true },
            { value: '0', expected: true },

            // invalid
            { value: '.1', expected: false },
            { value: '1.', expected: false },
            { value: '.', expected: false },
            { value: '..', expected: false },
            { value: 'a', expected: false },
            { value: '+', expected: false },
            { value: '#', expected: false },
            { value: 'ก', expected: false }
        ];

        $.each(tests, function (index, test) {
            it("should be " + (test.expected ? 'valid' : 'invalid') + " for package version \"" + test.value + "\"", function () {
                var result = $.validator.methods.package_version.call($.validator.prototype, test.value);
                expect(test.expected).toEqual(result);
            });
        });
    });
    
    describe(".table_name", function () {

        var tests = [
            // valid
            { value: 'TableName', expected: true },
            { value: 'TableName123', expected: true },
            { value: 'TableName_123', expected: true },
            { value: '{anglename:normalized}', expected: true },
            { value: '{anglename:normalized}{anglename:normalized}', expected: true },
            { value: '{anglename:normalized}123{anglename:normalized}', expected: true },
            { value: '{anglename:normalized}{anglename:normalized}123', expected: true },

            // invalid
            { value: "test'; DROP TABLE EAM4.dbo.EAUSERS--", expected: false },
            { value: '123TableName', expected: false },
            { value: '_tableName', expected: false },
            { value: '@tableName', expected: false },
            { value: '#tableName', expected: false }
        ];

        $.each(tests, function (index, test) {
            it("should be " + (test.expected ? 'valid' : 'invalid') + " for table name \"" + test.value + "\"", function () {
                var result = $.validator.methods.table_name.call($.validator.prototype, test.value);
                expect(test.expected).toEqual(result);
            });
        });
    });

    describe(".exportPackage_url", function () {
        var tests = [
            //valid
            { value: 'https://test.com/searchpage#/?sort=name&dir=asc&fq=facetcat_bp:(PM%20QM)%20AND%20facetcat_itemtype:(facet_angle%20facet_template)', expected: true },
            { value: 'https://test.com/searchpage#/?sort=name&dir=asc&fq=facetcat_bp:(PM%20QM)%20AND%20facetcat_itemtype:(facet_angle%20facet_template)%20AND%20facetcat_models:(EA2_800)', expected: true },
            { value: 'https://test.com/searchpage#/?fq=facetcat_bp:(PM%20QM)%20AND%20facetcat_itemtype:(facet_angle%20facet_template)%20AND%20facetcat_models:(EA2_800)', expected: true },

            //invalid
            { value: 'https://test.com/searchpage#/?sort=name&dir=asc&fq=facetcat_bp:(PM%20QM)%20AND%20facetcat_itemtype:(facet_angle%20facet_template)%20AND%20facetcat_models:(EA2_800%20TestServer)', expected: false },
            { value: 'https://test.com/searchpage#/?sort=name&dir=asc&fq=facetcat_bp:(PM%20QM)%20AND%20facetcat_models:(EA2_800%20TestServer)', expected: false },

        ];

        $.each(tests, function (index, test) {
            it("should be " + (test.expected ? 'valid' : 'invalid') + " for url \"" + test.value + "\"", function () {
                var result = $.validator.methods.exportPackage_url.call($.validator.prototype, test.value);
                expect(test.expected).toEqual(result);
            });
        });
    });

    describe(".valid_modelinUrl", function () {
        var tests = [
            //valid
            { value: 'https://test.com/searchpage#/?fq=facetcat_bp:(PM%20QM)%20AND%20facetcat_itemtype:(facet_angle%20facet_template)%20AND%20facetcat_models:(EA2_800)', expected: true },
            { value: 'https://test.com/searchpage#/?sort=name&dir=asc&fq=facetcat_bp:(PM%20QM)%20AND%20facetcat_itemtype:(facet_angle%20facet_template)', expected: true },


            //invalid
            { value: 'https://test.com/searchpage#/?sort=name&dir=asc&fq=facetcat_bp:(PM%20QM)%20AND%20facetcat_itemtype:(facet_angle%20facet_template)', expected: false },

        ];

        $.each(tests, function (index, test) {
            it("should be " + (test.expected ? 'valid' : 'invalid') + " for url \"" + test.value + "\"", function () {
                var kendoDrpDwn = {
                    dataSource: {
                        data: function () {
                            return { length: 1 };
                        }
                    }
                };
                if (!test.expected) {
                    kendoDrpDwn = {
                        dataSource: {
                            data: function () {
                                return { length: 2 };
                            }
                        }
                    };
                }
                spyOn($.fn, 'data').and.returnValue(kendoDrpDwn)
                var result = $.validator.methods.valid_modelinUrl.call($.validator.prototype, test.value);
                expect(test.expected).toEqual(result);
            });
        });
    });

});