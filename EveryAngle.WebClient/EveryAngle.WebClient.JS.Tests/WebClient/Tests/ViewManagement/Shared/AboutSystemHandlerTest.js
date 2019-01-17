/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />

describe("AboutSystemHandler", function () {
    var aboutSystemHandler;

    beforeEach(function () {
        aboutSystemHandler = new AboutSystemHandler();
    });

    describe(".GetModelInfoById(id)", function () {

        it("should not get info if no data", function () {
            spyOn(aboutSystemHandler, 'GetData').and.returnValue({});

            var result = aboutSystemHandler.GetModelInfoById('any');

            expect(null).toEqual(result);
        });

        it("should not get info if no model", function () {
            spyOn(aboutSystemHandler, 'GetData').and.returnValue({
                models: [
                    { model_id: 'EA2_800' }
                ]
            });

            var result = aboutSystemHandler.GetModelInfoById('any');

            expect(null).toEqual(result);
        });

        it("should get info if find model", function () {
            spyOn(aboutSystemHandler, 'GetData').and.returnValue({
                models: [
                    { model_id: 'EA2_800' }
                ]
            });

            var result = aboutSystemHandler.GetModelInfoById('EA2_800');

            expect(null).not.toEqual(result);
        });

    });

    describe(".GetData()", function () {

        var tests = [
            {
                title: 'should get full information if status is not Down',
                modeldata_timestamp: 1073041200,
                status: "any",
                is_real_time: false,
                expectedHasDate: true,
                expectedHasFullInfo: true
            },
            {
                title: 'should get minimal information if status is Down with model timestamp',
                modeldata_timestamp: 1073041200,
                status: "Down",
                is_real_time: false,
                expectedHasDate: false,
                expectedHasFullInfo: false
            },
            {
                title: 'should get minimal information if status is Down without model timestamp',
                modeldata_timestamp: null,
                status: "Down",
                is_real_time: false,
                expectedHasDate: false,
                expectedHasFullInfo: false
            },
            {
                title: 'should get full information if status is Up and is realtime model',
                modeldata_timestamp: 1073041200,
                status: "Up",
                is_real_time: true,
                expectedHasDate: true,
                expectedHasFullInfo: true
            },
            {
                title: 'should get minimal information if status is not Up and is realtime model',
                modeldata_timestamp: 1073041200,
                status: "any",
                is_real_time: true,
                expectedHasDate: false,
                expectedHasFullInfo: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(modelsHandler, 'GetModelNameById').and.returnValue('');
                aboutSystemHandler.SetData({
                    models: [
                        {
                            model_id: 'EA2_800',
                            modeldata_timestamp: test.modeldata_timestamp,
                            status: test.status,
                            is_real_time: test.is_real_time
                        }
                    ]
                });

                var result = aboutSystemHandler.GetData();

                // assert
                expect('').toEqual(result.models[0].name());

                if (test.expectedHasDate)
                    expect('').not.toEqual(result.models[0].date());
                else
                    expect('').toEqual(result.models[0].date());

                if (test.expectedHasFullInfo)
                    expect(test.status).not.toEqual(result.models[0].info());
                else
                    expect(test.status).toEqual(result.models[0].info());
            });
        });

    });

});
