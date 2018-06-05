describe("MC.util.task", function () {

    describe("getTrigger", function () {

        //variables
        var tests = [
            {
                title: 'cannot get task trigger',
                data: {},
                expected: null
            },
            {
                title: 'can get task trigger from "Triggers" property',
                data: { Triggers: [1, 2] },
                expected: 1
            },
            {
                title: 'can get task trigger from "triggers" property',
                data: { triggers: [1, 2] },
                expected: 1
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {

                //begin test
                var actualValue = MC.util.task.getTrigger(test.data);

                //assert
                expect(test.expected).toEqual(actualValue);

            });
        });

    });

    describe("getTriggerType", function () {

        //variables
        var testValues = [{
            title: 'cannot get task action type',
            data: { Triggers: [] },
            expectValue: null
        },
        {
            title: 'can get task action type',
            data: { Triggers: [{ trigger_type: 'external' }] },
            expectValue: 'external'
        }];

        $.each(testValues, function (index, testValue) {
            it(testValue.title, function () {

                //begin test
                var actualValue = MC.util.task.getTriggerType(testValue.data);

                //assert
                expect(testValue.expectValue).toEqual(actualValue);

            });
        });

    });

    describe("isTriggerExternal", function () {

        //variables
        var tests = [
            {
                type: 'external',
                expected: true
            },
            {
                type: 'schedule',
                expected: false
            },
            {
                type: 'event',
                expected: false
            },
            {
                type: null,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it("trigger type '" + test.type + "' should " + (test.expected ? "be" : "not be") + " external", function () {
                var taskData = {
                    triggers: [
                        { trigger_type: test.type }
                    ]
                };

                //begin test
                var actualValue = MC.util.task.isTriggerExternal(taskData);

                //assert
                expect(test.expected).toEqual(actualValue);
            });
        });

    });

    describe("isTriggerSchedule", function () {

        //variables
        var tests = [
            {
                type: 'external',
                expected: false
            },
            {
                type: 'schedule',
                expected: true
            },
            {
                type: 'event',
                expected: false
            },
            {
                type: null,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it("trigger type '" + test.type + "' should " + (test.expected ? "be" : "not be") + " schedule", function () {
                var taskData = {
                    triggers: [
                        { trigger_type: test.type }
                    ]
                };

                //begin test
                var actualValue = MC.util.task.isTriggerSchedule(taskData);

                //assert
                expect(test.expected).toEqual(actualValue);
            });
        });

    });

    describe("isTriggerEvent", function () {

        //variables
        var tests = [
            {
                type: 'external',
                expected: false
            },
            {
                type: 'schedule',
                expected: false
            },
            {
                type: 'event',
                expected: true
            },
            {
                type: null,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it("trigger type '" + test.type + "' should " + (test.expected ? "be" : "not be") + " event", function () {
                var taskData = {
                    triggers: [
                        { trigger_type: test.type }
                    ]
                };

                //begin test
                var actualValue = MC.util.task.isTriggerEvent(taskData);

                //assert
                expect(test.expected).toEqual(actualValue);
            });
        });

    });

    describe("getTriggerDays", function () {

        //variables
        var tests = [
            {
                days: null,
                expected: []
            },
            {
                days: [],
                expected: []
            },
            {
                days: [1,2,3],
                expected: [1, 2, 3]
            }
        ];

        $.each(tests, function (index, test) {
            it("can get trigger days (" + JSON.stringify(test.days) + ")", function () {
                var taskData = {
                    triggers: [
                        { days: test.days }
                    ]
                };

                //begin test
                var actualValue = MC.util.task.getTriggerDays(taskData);

                //assert
                expect(test.expected).toEqual(actualValue);
            });
        });

    });

    describe("getTriggerDayStatus", function () {

        //variables
        var tests = [
            {
                days: [],
                expected: false
            },
            {
                days: [{ active: false }],
                expected: false
            },
            {
                days: [{ active: true }],
                expected: true
            }
        ];

        $.each(tests, function (index, test) {
            it("can get trigger day status (" + JSON.stringify(test.days) + " -> " + test.expected + ")", function () {
                //begin test
                var actualValue = MC.util.task.getTriggerDayStatus(test.days, 0);

                //assert
                expect(test.expected).toEqual(actualValue);
            });
        });

    });

    describe("getDaysCheckbox", function () {

        //variables
        var tests = [
            {
                days: null,
                expected: 0
            },
            {
                days: [],
                expected: 0
            },
            {
                days: [{ active: true }, { active: true }, { active: false }],
                expected: 2
            }
        ];

        $.each(tests, function (index, test) {
            it("can get days html from (" + JSON.stringify(test.days) + ") and " + test.expected + " checkboxes checked", function () {
                var taskData = {
                    id: 'test',
                    triggers: [
                        { days: test.days }
                    ]
                };

                //begin test
                var actualValue = MC.util.task.getDaysCheckbox(taskData);
                var matches = actualValue.match(/checked=\"checked\"/g);
                var countChecked = matches ? matches.length : 0;

                //assert
                expect(test.expected).toEqual(countChecked);
            });
        });

    });

    describe("getTriggerExternalUrl", function () {

        //variables
        var testValues = [{
            title: 'cannot get external task url',
            data: { Triggers: [] },
            expectValue: ''
        },
        {
            title: 'can get external task url',
            data: { Triggers: [{ trigger_type: 'external', TriggerUri: 'https://app.com/task/1', token: 'xxx' }] },
            expectValue: 'https://app.com/task/1?token=xxx'
        }];

        $.each(testValues, function (index, testValue) {
            it(testValue.title, function () {

                //begin test
                var actualValue = MC.util.task.getTriggerExternalUrl(testValue.data);

                //assert
                expect(testValue.expectValue).toEqual(actualValue);
            });
        });

    });

    describe("isContinuous", function () {

        //variables
        var tests = [
            {
                continuous: null,
                expected: false
            },
            {
                continuous: false,
                expected: false
            },
            {
                continuous: true,
                expected: true
            }
        ];

        $.each(tests, function (index, test) {
            it("can get trigger continuous status (" + test.continuous + " -> " + test.expected + ")", function () {
                var taskData = {
                    triggers: [{ continuous: test.continuous }]
                };

                //begin test
                var actualValue = MC.util.task.isContinuous(taskData);

                //assert
                expect(test.expected).toEqual(actualValue);
            });
        });

    });

    describe("getStartTime", function () {

        //variables
        var tests = [
            {
                startTime: null,
                expected: null
            },
            {
                startTime: 0,
                expected: 0
            },
            {
                startTime: 3600,
                expected: 3600
            }
        ];

        $.each(tests, function (index, test) {
            it("can get trigger start time (" + test.startTime + " -> " + test.expected + ")", function () {
                var taskData = {
                    triggers: [{ start_time: test.startTime }]
                };

                //begin test
                var actualValue = MC.util.task.getStartTime(taskData);

                //assert
                expect(test.expected).toEqual(actualValue);
            });
        });

    });

    describe("getEndTime", function () {

        //variables
        var tests = [
            {
                endTime: null,
                expected: null
            },
            {
                endTime: 0,
                expected: 0
            },
            {
                endTime: 3600,
                expected: 3600
            }
        ];

        $.each(tests, function (index, test) {
            it("can get trigger end time (" + test.endTime + " -> " + test.expected + ")", function () {
                var taskData = {
                    triggers: [{ end_time: test.endTime }]
                };

                //begin test
                var actualValue = MC.util.task.getEndTime(taskData);

                //assert
                expect(test.expected).toEqual(actualValue);
            });
        });

    });

    describe("getRestartDelay", function () {

        //variables
        var tests = [
            {
                restartDelay: null,
                expected: null
            },
            {
                restartDelay: 0,
                expected: 0
            },
            {
                restartDelay: 3600,
                expected: 3600
            }
        ];

        $.each(tests, function (index, test) {
            it("can get trigger restart delay (" + test.restartDelay + " -> " + test.expected + ")", function () {
                var taskData = {
                    triggers: [{ restart_delay: test.restartDelay }]
                };

                //begin test
                var actualValue = MC.util.task.getRestartDelay(taskData);

                //assert
                expect(test.expected).toEqual(actualValue);
            });
        });

    });

});