/// <chutzpah_reference path="/../../Dependencies/custom/MC.ui.password.js" />

describe("MC.ui.password.js", function () {

    describe("MC.ui.password", function () {

        var input;
        beforeEach(function () {
            window.passwordPlaceHolder = '********';
            input = $('<input />').appendTo('body');
        });
        afterEach(function () {
            input.remove();
        });

        var tests = [
            {
                title: 'should have placeholder if has password',
                has_password: true,
                expected: '********'
            },
            {
                title: 'should not have placeholder if has no password',
                has_password: false,
                expected: ''
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                input.attr('data-has-password', test.has_password);
                MC.ui.password(input);
                var result = input.val();

                expect(result).toEqual(test.expected);
            });
        });
    });

});