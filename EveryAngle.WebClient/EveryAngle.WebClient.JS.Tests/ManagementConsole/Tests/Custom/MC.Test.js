describe("MC.js", function () {

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(window.MC).toBeDefined();
        });

    });

    describe("checkIp4Ip6", function () {

        var tests = [
            // valid
            { ip: null, expected: true },
            { ip: '', expected: true },
            { ip: '192.168.1.0', expected: true },
            { ip: '192.168.1.255', expected: true },
            { ip: '127.0.0.1', expected: true },
            { ip: '192.168.1.*', expected: true },
            { ip: 'fe80::e1ab:68:9044:*', expected: true },
            { ip: 'fe80::e1ab:68:9044:e2d1%7', expected: true },
            { ip: '::1', expected: true },

            // invalid
            { ip: '192.168.1.256', expected: false },
            { ip: '*.168.1.1', expected: false },
            { ip: '192.*.1.1', expected: false },
            { ip: '192.168.*.1', expected: false },
            { ip: '192.168.1.**', expected: false },
            { ip: 'fe80:*:e1ab:68:1:e2d1%7', expected: false },
            { ip: 'fe80::e1ab:68:*:e2d1%7', expected: false },
            { ip: 'fe80::e1ab:68:9044:**', expected: false }
        ];

        $.each(tests, function (index, test) {
            it("should be " + (test.expected ? 'valid' : 'invalid') + " for IP \"" + test.ip + "\"", function () {
                var result = checkIp4Ip6(test.ip);
                expect(test.expected).toEqual(result);
            });
        });
    });

});