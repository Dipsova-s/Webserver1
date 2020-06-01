/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Search/searchmodel.js" />

describe("SearchViewModel", function () {
    var searchViewModel;

    beforeEach(function () {
        searchViewModel = new SearchViewModel();
    });

    describe(".IsValidClickItemLink(event)", function () {

        var tests = [
            {
                title: 'trigger click event is valid',
                isTrigger: true,
                msie: false,
                version: 999,
                button: 3,
                ctrlKey: false,
                shiftKey: false,
                expected: true
            },
            {
                title: 'IE < 9 left click with button 1 is valid',
                isTrigger: false,
                msie: true,
                version: 8.9,
                button: 1,
                ctrlKey: false,
                shiftKey: false,
                expected: true
            },
            {
                title: 'IE 6 left click with button 0 is not valid',
                isTrigger: false,
                msie: true,
                version: 6,
                button: 0,
                ctrlKey: false,
                shiftKey: false,
                expected: false
            },
            {
                title: 'Other browser left click with button 0 is valid',
                isTrigger: false,
                msie: false,
                version: 999,
                button: 0,
                ctrlKey: false,
                shiftKey: false,
                expected: true
            },
            {
                title: 'Other browser left click with button 1 is not valid',
                isTrigger: false,
                msie: false,
                version: 999,
                button: 1,
                ctrlKey: false,
                shiftKey: false,
                expected: false
            },
            {
                title: 'Valid click with CTRL key is not valid',
                isTrigger: false,
                msie: false,
                version: 999,
                button: 0,
                ctrlKey: true,
                shiftKey: false,
                expected: false
            },
            {
                title: 'Valid click with SHIFT key is not valid',
                isTrigger: false,
                msie: false,
                version: 999,
                button: 0,
                ctrlKey: false,
                shiftKey: true,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                $.browser = {
                    msie: test.msie,
                    version: test.version
                };
                var data = {
                    isTrigger: test.isTrigger,
                    button: test.button,
                    ctrlKey: test.ctrlKey,
                    shiftKey: test.shiftKey
                };
                var result = searchViewModel.IsValidClickItemLink(data);
                expect(result).toEqual(test.expected);
            });
        });

    });

});
