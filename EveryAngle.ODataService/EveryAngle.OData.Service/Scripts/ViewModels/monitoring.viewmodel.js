
angular.module('odataService', ['kendo.directives'])
    .controller('monitoringController', ['$scope', '$http', function ($scope, $http) {

        $scope.syncing = true;
        $scope.chartBinded = false;
        $scope.startImmediately = false;
        $scope.metadataState = 'Content/Images/spinner.gif';
        $scope.syncState = { running: 'Content/Images/spinner.gif', ok: 'Content/Images/ok.png' };

        $scope.angles = {};
        $scope.displays = {};
        $scope.fields = {};
        $scope.memory = [];
        $scope.settings = { status: "OFFLINE", host: "N/A", label: "label-danger" };

        // angles
        $scope.anglesChart = [{
            count: 10,
            availability: 'available',
            explode: true
        }, {
            count: 10,
            availability: 'unavailable'
        }];

        // displays
        $scope.displaysChart = [{
            count: 10,
            availability: 'available',
            explode: true
        }, {
            count: 10,
            availability: 'unavailable'
        }];

        // fields
        $scope.fieldsChart = [{
            count: 10,
            availability: 'available',
            explode: true
        }, {
            count: 10,
            availability: 'unavailable'
        }];

        // Declare a proxy to reference the hub.
        // from Hub => MetadataMonitoringHub : Hub class
        var hub = $.connection.metadataMonitoringHub;

        // Create a function that the hub can call to report progress.
        // from Hub => Clients.Caller.ReportProgress
        hub.client.reportProgress = function (progress) {
            $scope.$apply(function () {

                // angles, displays, fields data
                $scope.angles = progress.angles;
                $scope.displays = progress.displays;
                $scope.fields = progress.fields;
                $scope.settings = progress.settings;

                $scope.settings.status = "ONLINE";
                $scope.settings.label = "label-success";

                if (!progress.is_running && !$scope.startImmediately)
                    $scope.syncing = false;
                else {
                    $scope.syncing = true;
                    $scope.startImmediately = false;
                    $scope.chartBinded = false;
                }

                if (progress.is_running === true)
                    $scope.metadataState = $scope.syncState.running;
                else
                    $scope.metadataState = $scope.syncState.ok;

                if (!$scope.syncing && !$scope.chartBinded) {
                    // angles
                    $scope.anglesChart[0].count = progress.angles.available.toFixed(2);
                    $scope.anglesChart[1].count = progress.angles.unavailable.toFixed(2);

                    // displays
                    $scope.displaysChart[0].count = progress.displays.available.toFixed(2);
                    $scope.displaysChart[1].count = progress.displays.unavailable.toFixed(2);

                    // fields
                    $scope.fieldsChart[0].count = progress.fields.available.toFixed(2);
                    $scope.fieldsChart[1].count = progress.fields.unavailable.toFixed(2);

                    // create general chart
                    $scope.createChart("anglesChart", "Angles", $scope.anglesChart);
                    $scope.createChart("displaysChart", "Displays", $scope.displaysChart);
                    $scope.createChart("fieldsChart", "Fields", $scope.fieldsChart);

                    // create memory chart
                    $scope.createLine();

                    $scope.chartBinded = true;
                }

                $scope.memory.push(progress.memory);

                var memChart = $("#memoryChart").data("kendoChart");
                if (progress.memory > 200)
                    memChart.options.title.color = '#ff0000';
                else
                    memChart.options.title.color = '#57ca5c';

                memChart.options.title.text = "Using Memory (" + progress.memory + "MB)";
                memChart.refresh();

                if ($scope.memory.length > 30) {
                    $scope.memory.shift();
                }
            });
        };

        // Start the connection.
        $.connection.hub.start().done(function () {
            hub.server.start("arg");
        });

        $scope.syncImmediately = function () {
            $scope.syncing = true;
            $scope.startImmediately = true;
            $http.post(api_destination + '/metadata', { "sync": true }).finally(function () {
                $scope.startImmediately = $scope.syncing;
            });
        };

        $scope.createChart = function (elementid, title, data) {
            $('#' + elementid).kendoChart({
                title: {
                    text: title,
                    font: "22px Arial,Helvetica,sans-serif"
                },
                legend: {
                    visible: false,
                    position: "none"
                },
                dataSource: {
                    data: data
                },
                series: [{
                    type: "donut",
                    field: "count",
                    categoryField: "availability",
                    explodeField: "explode",
                    overlay: {
                        gradient: "none"
                    }
                }],
                chartArea: {
                    height: 300,
                    margin: 0,
                    background: "transparent"
                },
                seriesDefaults: {
                    margin: 0,
                    labels: {
                        visible: false,
                        background: "transparent",
                        template: "#= category #: \n #= value#%"
                    }
                },
                seriesColors: ["#5cb85c", "#f0ad4e"],
                tooltip: {
                    visible: true,
                    template: "${ category } (${ value }%)"
                },
                gradient: "none"
            });
        };
        $scope.createLine = function () {
            $("#memoryChart").kendoChart({
                renderAs: "canvas",
                transitions: false,
                title: {
                    text: "Using Memory (MB)",
                    color: '#57ca5c'
                },
                chartArea: {
                    height: 100,
                    background: "transparent"
                },
                legend: {
                    visible: false
                },
                seriesDefaults: {
                    type: "area",
                    area: {
                        line: {
                            style: "smooth"
                        }
                    }
                },
                series: [{
                    name: "Memory Use",
                    data: $scope.memory
                }],
                valueAxis: {
                    line: {
                        visible: false
                    },
                    labels: {
                        visible: false
                    }
                },
                categoryAxis: {
                    majorGridLines: {
                        visible: false
                    }
                },
                tooltip: {
                    visible: true,
                    format: "{0}%",
                    template: "#= series.name #: #= value #"
                }
            });
        }

        $(document).bind("kendo:skinChange", $scope.createAngleChart);
    }]);