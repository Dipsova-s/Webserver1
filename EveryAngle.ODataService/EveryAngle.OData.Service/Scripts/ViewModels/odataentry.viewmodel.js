angular.module('odataService', ['kendo.directives', 'ngClipboard'])
    .controller('odataEntryController', ['$scope', '$http', '$window', 'ngClipboard', '$timeout', function ($scope, $http, $window, ngClipboard, $timeout) {

        // variables
        $scope.metadataState = 'Content/Images/spinner.gif';
        $scope.syncState = { running: 'Content/Images/spinner.gif', ok: 'Content/Images/ok.png' };
        $scope.behaviorState = { needRefresh: false };
        $scope.syncing = true;

        // Declare a proxy to reference the hub.
        // from Hub => MetadataMonitoringHub : Hub class
        var hub = $.connection.metadataMonitoringHub;
        hub.client.reportProgress = function (progress) {
            $scope.$apply(function () {

                // sync progress
                if (!progress.is_running && !$scope.startImmediately) {

                    $scope.syncing = false;
                    $scope.metadataState = $scope.syncState.ok;

                    // refresh grid trigger
                    if ($scope.behaviorState.needRefresh) {

                        // reset behavior state
                        $scope.behaviorState.needRefresh = false;
                        $scope.searchItem();
                    }
                }
                else {
                    $scope.syncing = true;
                    $scope.startImmediately = false;
                    $scope.behaviorState.needRefresh = true;
                    $scope.metadataState = $scope.syncState.running;
                }
            });
        };

        // Start the connection.
        $.connection.hub.start().done(function () {
            hub.server.start("arg");
        });

        // init treelist data source
        $scope.treeListDataSource = new kendo.data.TreeListDataSource({
            transport: {
                read: {
                    url: api_destination + '/entry',
                    dataType: "json"
                },
                parameterMap: function (data, type) {
                    // send request parameters as json
                    return kendo.stringify(data);
                }
            },
            pageSize: 50,
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            schema: {
                model: {
                    id: "entity_id",
                    parentId: "parent_id",
                    hasChildren: "has_children",
                    fields: {
                        entity_id: { type: "number", nullable: false },
                        parent_id: { nullable: true, type: "number" }
                    },
                    expanded: false
                },
                data: function (result) {
                    return result.result || result;
                },
                total: function (result) {
                    return result.page_size || result.length || 0;
                }
            }
        });

        // init treelist grid option
        $scope.treeListOptions = {
            dataSource: $scope.treeListDataSource,
            height: 740,
            sortable: true,
            resizable: true,
            columns: [{
                field: "name",
                expandable: true,
                title: "Name",
                width: "90%",
                template: $("#item-template").html()
            }, {
                field: "web_client_uri",
                title: "Odata Entry",
                width: "10%",
                sortable: false,
                template: $("#odata-column-template").html()
            }
            ]
        };

        // generate paging 
        $scope.pagerOptions = {
            autoBind: false,
            dataSource: $scope.treeListDataSource,
            info: true,
            pageSizes: [30, 50, 100, 'all'],
            refresh: true,
        };

        // generate wc link
        $scope.goToWebClient = function (linkToWebClient) {
            $window.open(linkToWebClient.dataItem.web_client_uri, '_blank');
        };
        $scope.webClientLink = function (linkToWebClient) {
            return linkToWebClient.dataItem.web_client_uri;
        };

        // generate odata entry's link
        $scope.odataEntryLink = function (linkToOdata) {
            return (window.location.origin + odata_destination + linkToOdata.dataItem.entity_uri);
        };
        $scope.copyOdataEntry = function (linkToOdata) {
            ngClipboard.toClipboard($scope.odataEntryLink(linkToOdata));
            $scope.showTooltip(linkToOdata.dataItem.entity_id);
        };

        // generate odata entry button if it's not an angle
        $scope.generateIfDisplay = function (element) {
            return element.dataItem.item_type !== "template" && element.dataItem.item_type !== "angle";
        };

        // tooltip 
        $scope.tooltip;
        $scope.initializeTooltip = function () {
            $scope.tooltip = $(".odata-tooltip-copied").kendoTooltip({
                autoHide: true,
                showOn: "click",
                filter: "div",
                content: "copied.",
                animation: { close: { duration: 100 } }
            }).data("kendoTooltip");
        };
        $scope.showTooltip = function (entityId) {
            $scope.tooltip.show($("#" + entityId));
        };

        // search box binding
        $scope.searchInput = ''
        $scope.filterTextTimeout;
        $scope.$watch('searchInput', function (val) {

            if ($scope.filterTextTimeout)
                $timeout.cancel($scope.filterTextTimeout);

            $scope.filterTextTimeout = $timeout(function () {
                $scope.searchItem();
                // delay 250 ms
            }, 250);
        });
        $scope.searchItem = function () {
            $scope.treeListOptions.dataSource.filter({ field: "name", operator: "contains", value: $scope.searchInput });
        };

        // init tooltip element
        $scope.initializeTooltip();

        // sync button
        $scope.syncImmediately = function () {
            $scope.syncing = true;
            $scope.startImmediately = true;
            $http.post(api_destination + '/metadata', { "sync": true }).finally(function () {
                $scope.startImmediately = $scope.syncing;
            });
        };
    }]);