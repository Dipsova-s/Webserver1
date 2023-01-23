var webAPIUrl = '';
var webApiVersion = 'versions/2';
var rootWebsitePath = '';
var showAngleAndDisplayID = true;
var ajaxTimeoutExpirationInSeconds = 1000;
var intervalTime = 500;
var maxNumberOfDashboard = 2;
var homePageUrl = '/en/search/homepage';
var searchPageUrl = '/en/search/searchpage';
var anglePageUrl = '/en/angle/anglepage';
var dashboardPageUrl = '/en/dashboard/dashboardpage';
var domainImageFolders = '';
var domainImageFiles = '';
var progressbarModel = {
    ShowStartProgressBar: function () { }
};
var textDays = 'days';
var isLoginPage = true;

var mockHandlers = {};
var createMockHandler = function (namespace, name, mock) {
    mockHandlers[name] = { namespace: namespace, handler: namespace[name] };
    namespace[name] = mock;
};
var restoreMockHandler = function (name) {
    if (mockHandlers.hasOwnProperty(name)) {
        var mockHandler = mockHandlers[name];
        var namespace = mockHandler.namespace;
        namespace[name] = mockHandler.handler;
    }
};
var restoreMockHandlers = function () {
    for (var name in mockHandlers) {
        restoreMockHandler(name);
    }
};
var ClientVersion = "22.2.0.1";