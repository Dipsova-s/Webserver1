/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usermodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/privileges.js" />

describe("PrivilegesViewModel", function () {
    var privilegesViewModel;

    beforeEach(function () {
        privilegesViewModel = new PrivilegesViewModel();
    });

    describe(".CanCreateAngle", function () {
        var tests = [
            {
                title: 'can create Angle in this model',
                modelUri: '/models/1',
                data: [{
                    model: '/models/1',
                    privileges: {
                        create_angles: true
                    }
                }],
                expected: true
            },
            {
                title: 'cannot create Angle in this model',
                modelUri: '/models/1',
                data: [
                    {
                        model: '/models/1',
                        privileges: {
                            create_angles: false
                        }
                    },
                    {
                        model: '/models/2',
                        privileges: {
                            create_angles: true
                        }
                    }
                ],
                expected: false
            }
        ];


        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(privilegesViewModel, 'Data').and.returnValue(test.data);

                var result = privilegesViewModel.CanCreateAngle(test.modelUri);
                expect(result).toEqual(test.expected);
            });
        });

    });

    describe(".CanCreateTemplateAngle", function () {
        var tests = [
            {
                title: 'can create_template_angles in this model',
                modelUri: '/models/1',
                data: [{
                    model: '/models/1',
                    privileges: {
                        create_template_angles: true
                    }
                }],
                expected: true
            },
            {
                title: 'cannot create_template_angles in this model',
                modelUri: '/models/1',
                data: [
                    {
                        model: '/models/1',
                        privileges: {
                            create_template_angles: false
                        }
                    },
                    {
                        model: '/models/2',
                        privileges: {
                            create_template_angles: true
                        }
                    }
                ],
                expected: false
            }
        ];


        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(privilegesViewModel, 'Data').and.returnValue(test.data);

                var result = privilegesViewModel.CanCreateTemplateAngle(test.modelUri);
                expect(result).toEqual(test.expected);
            });
        });

    });

});
