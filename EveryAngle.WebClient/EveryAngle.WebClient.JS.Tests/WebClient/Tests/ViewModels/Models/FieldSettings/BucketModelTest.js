/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/FieldSettings/bucketmodel.js" />

describe("BucketModel", function () {
    var bucketModel;

    beforeEach(function () {
        bucketModel = new BucketModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(bucketModel).toBeDefined();
        });

    });

    describe("It should have get default data", function () {

        it("should be able to get default bucket field as 'count'", function () {
            expect(bucketModel.field).toEqual("count");
        });

        it("should be able to get default bucket fieldtype as 'int'", function () {
            expect(bucketModel.field_type).toEqual("int");
        });

        it("should be able to get default bucket source field as 'objecttypeea'", function () {
            expect(bucketModel.source_field).toEqual("objecttypeea");
        });

        it("should be able to get default bucket operator as 'count'", function () {
            expect(bucketModel.Operator).toEqual("count");
        });
    });


});
