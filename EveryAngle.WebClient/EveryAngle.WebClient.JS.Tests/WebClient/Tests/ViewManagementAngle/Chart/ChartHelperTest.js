/// <chutzpah_reference path="/../../../Dependencies/ViewManagement/Angle/Chart/ChartHelper.js" />

describe("ChartHelper", function () {
    describe(".GetType", function () {
        it('should get chart type', function () {
            // prepare
            var result = ChartHelper.GetType({ chart_type: 'my-type' });

            // assert
            expect(result).toEqual('my-type');
        });
    });

    describe(".IsStacked", function () {
        it('should be stack', function () {
            // prepare
            var result = ChartHelper.IsStacked({ stack: true });

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".IsMultiAxis", function () {
        it('should be multiple axis', function () {
            // prepare
            var result = ChartHelper.IsMultiAxis({ multi_axis: true });

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".GetMultiAxisType", function () {
        var tests = [
            { index: 0, type: 'line', expected: 'area' },
            { index: 0, type: 'others', expected: 'others' },
            { index: 1, type: 'area', expected: 'column' },
            { index: 1, type: 'column', expected: 'line' },
            { index: 1, type: 'others', expected: 'others' }
        ];
        $.each(tests, function (index, test) {
            it('should get type for multiple axis (index=' + test.index + ',type=' + test.type + ')', function () {
                // prepare
                var result = ChartHelper.GetMultiAxisType(test.index, test.type);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".GetMultiAxisStack", function () {
        var tests = [
            { type: 'column', expected: true },
            { type: 'area', expected: true },
            { type: 'others', expected: false }
        ];
        $.each(tests, function (index, test) {
            it('should get stack for multiple axis (type=' + test.type + ')', function () {
                // prepare
                var result = ChartHelper.GetMultiAxisStack(test.type);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".IsRadarType", function () {
        var tests = [
            { type: 'radarLine', expected: true },
            { type: 'radarArea', expected: true },
            { type: 'others', expected: false }
        ];
        $.each(tests, function (index, test) {
            it('should ' + (test.expected ? 'be' : 'not be') + ' radar (type=' + test.type + ')', function () {
                // prepare
                var result = ChartHelper.IsRadarType(test.type);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".GetRadar2ndType", function () {
        it('should get 2nd type of radar', function () {
            // prepare
            var result = ChartHelper.GetRadar2ndType();

            // assert
            expect(result).toEqual('radarArea');
        });
    });

    describe(".IsScatterType", function () {
        var tests = [
            { type: 'scatter', expected: true },
            { type: 'scatterLine', expected: true },
            { type: 'others', expected: false }
        ];
        $.each(tests, function (index, test) {
            it('should ' + (test.expected ? 'be' : 'not be') + ' scatter (type=' + test.type + ')', function () {
                // prepare
                var result = ChartHelper.IsScatterType(test.type);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".IsBubbleType", function () {
        var tests = [
            { type: 'bubble', expected: true },
            { type: 'others', expected: false }
        ];
        $.each(tests, function (index, test) {
            it('should ' + (test.expected ? 'be' : 'not be') + ' bubble (type=' + test.type + ')', function () {
                // prepare
                var result = ChartHelper.IsBubbleType(test.type);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".IsScatterOrBubbleType", function () {
        it('should be true (bubble)', function () {
            // prepare
            var result = ChartHelper.IsScatterOrBubbleType('bubble');

            // assert
            expect(result).toEqual(true);
        });
        it('should be true (scatter)', function () {
            // prepare
            var result = ChartHelper.IsScatterOrBubbleType('scatter');

            // assert
            expect(result).toEqual(true);
        });
        it('should be false', function () {
            // prepare
            var result = ChartHelper.IsScatterOrBubbleType('any');

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".GetScatterLineType", function () {
        it('should get line type of scatter', function () {
            // prepare
            var result = ChartHelper.GetScatterLineType();

            // assert
            expect(result).toEqual('scatterLine');
        });
    });

    describe(".IsDonutOrPieType", function () {
        it('should be true (donut)', function () {
            // prepare
            var result = ChartHelper.IsDonutOrPieType('donut');

            // assert
            expect(result).toEqual(true);
        });
        it('should be true (pie)', function () {
            // prepare
            var result = ChartHelper.IsDonutOrPieType('pie');

            // assert
            expect(result).toEqual(true);
        });
        it('should be false', function () {
            // prepare
            var result = ChartHelper.IsDonutOrPieType('any');

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".IsGaugeType", function () {
        it('should be true (gauge)', function () {
            // prepare
            var result = ChartHelper.IsGaugeType('gauge');

            // assert
            expect(result).toEqual(true);
        });
        it('should be false', function () {
            // prepare
            var result = ChartHelper.IsGaugeType('any');

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".GetGaugeDefault", function () {
        it('should get default values', function () {
            // prepare
            var result = ChartHelper.GetGaugeDefault();

            // assert
            expect(result.values).toEqual([0, 20, 40, 60, 80, 100]);
            expect(result.colors).toEqual(['#ed0000', '#eda100', '#4dc632', '#eda100', '#ed0000']);
        });
    });
});
