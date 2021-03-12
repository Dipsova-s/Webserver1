using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using Moq;
using System;
using System.Collections.Generic;
using System.Web;
using System.IO;
using System.Web.Mvc;
using System.Configuration;
using RestSharp;
using System.Web.Configuration;
using System.Net;
using Newtonsoft.Json;
using System.Data;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Core.ViewModels;
using EveryAngle.WebClient.Service.Aggregation;
using Newtonsoft.Json.Linq;
using System.Web.SessionState;
using System.Reflection;
using EveryAngle.Utilities;

namespace EveryAngle.WebClient.Web.CSTests.TestBase
{
    public class UnitTestBase
    {
        #region variables

        protected const string _testingUri = "http://127.0.0.1";
        protected readonly string _testResourcesPath = $"{AppDomain.CurrentDomain.BaseDirectory}{ConfigurationManager.AppSettings["TestResourcesPath"]}";

        protected IModelService _modelService;
        protected AggregationService _aggregationService;

        private Mock<ControllerContext> _controllerContext;
        private Mock<RestClient> _client;

        #endregion

        public UnitTestBase()
        {
            InitializeServiceMockObject();
        }

        private void InitializeServiceMockObject()
        {
            SetupServiceMockData();
            SetupConfiguration();
            SetupHttpContextMockData();
            SetupViewEngineMockData();
            SetupRequestManagerMockData();
        }


        #region services

        private void SetupServiceMockData()
        {
            // this method should be modified later.
            Mock<IModelService> modelservice = new Mock<IModelService>();
            modelservice.Setup(x => x.GetAvailabelRolesTable(It.IsAny<string>())).Returns(new DataTable());
            modelservice.Setup(x => x.GetEventLog(It.IsAny<string>())).Returns(new List<EventLogViewModel>());
            modelservice.Setup(x => x.GetEventsTable(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>())).Returns(new DataTable());
            modelservice.Setup(x => x.GetModelExtractor(It.IsAny<string>())).Returns(new ExtractorViewModel());

            modelservice.Setup(x => x.GetModelServer(It.IsAny<string>())).Returns(new ModelServerViewModel());
            modelservice.Setup(x => x.GetModelServers(It.IsAny<string>())).Returns(new ListViewModel<ModelServerViewModel>());
            modelservice.Setup(x => x.GetModelSettings(It.IsAny<string>())).Returns(new ModelServerSettings());

            _modelService = modelservice.Object;

            Mock<AggregationService> aggregationService = new Mock<AggregationService>();
            aggregationService.Setup(x => x.GetDomainElementsByUri(It.IsAny<string>())).CallBase();
            JObject domain = new JObject();
            domain["id"] = "EA_ENUM_DELIVERYSTATUS";
            aggregationService.Setup(x => x.Get(It.IsAny<string>())).Returns(domain);

            _aggregationService = aggregationService.Object;
        }

        private void SetupRequestManagerMockData()
        {
            //Default response with empty object
            RestResponse response = new RestResponse();
            response.StatusCode = System.Net.HttpStatusCode.OK;

            SetupRestClient(response);
        }

        protected IRestResponse SetupRestResponse(HttpStatusCode statusCode, object viewmodel)
        {
            // The response verification should be provided/tested by Robot tests, always return 'OK'
            IRestResponse response = new RestResponse();
            response.StatusCode = statusCode;
            response.Content = JsonConvert.SerializeObject(viewmodel);

            return response;
        }

        protected IRestClient SetupRestClient(IRestResponse response)
        {
            string webServerBackendUrl = Shared.Helpers.UrlHelper.GetWebServerBackendUrl();
            string webServiceBackendNOAPort = WebConfigurationManager.AppSettings["WebServiceBackendNOAPort"];
            int restClientTimeout = int.Parse(WebConfigurationManager.AppSettings["RestClientTimeout"]);
            string webServerBackendUrlWithPort = string.Format("{0}:{1}", webServerBackendUrl, webServiceBackendNOAPort);

            _client = new Mock<RestClient>();
            _client.Setup(x => x.Execute(It.IsAny<IRestRequest>())).Returns(response);
            _client.Setup(x => x.BaseUrl).Returns(new Uri(webServerBackendUrlWithPort));
            _client.Object.Timeout = restClientTimeout;

            return _client.Object;
        }

        #endregion

        #region General mocks

        private void SetupHttpContextMockData()
        {
            _controllerContext = new Mock<ControllerContext>();
            HttpContext httpContext = new HttpContext(
                                    new HttpRequest("", "http://wctesting.org", ""),
                                    new System.Web.HttpResponse(new StringWriter()));
            var sessionContainer = new HttpSessionStateContainer(
                                        "id",
                                        new SessionStateItemCollection(),
                                        new HttpStaticObjectsCollection(),
                                        10,
                                        true,
                                        HttpCookieMode.AutoDetect,
                                        SessionStateMode.InProc,
                                        false);
            httpContext.Items["AspSession"] = typeof(HttpSessionState).GetConstructor(
                                                     BindingFlags.NonPublic | BindingFlags.Instance,
                                                     null, CallingConventions.Standard,
                                                     new[] { typeof(HttpSessionStateContainer) },
                                                     null).Invoke(new object[] { sessionContainer });
            HttpContext.Current = httpContext;
        }

        private void SetupViewEngineMockData()
        {
            var view = new Mock<IView>();
            var engine = new Mock<IViewEngine>();
            var viewEngineResult = new ViewEngineResult(view.Object, engine.Object);
            engine.Setup(e => e.FindPartialView(It.IsAny<ControllerContext>(), It.IsAny<string>(), It.IsAny<bool>())).Returns(viewEngineResult);

            ViewEngines.Engines.Clear();
            ViewEngines.Engines.Add(engine.Object);
        }

        private void SetupConfiguration()
        {
            // Just mock
            ConfigurationManager.AppSettings.Set("WebServerBackendUrl", "https://127.0.0.1");
            ConfigurationManager.AppSettings.Set("WebServiceBackendNOAPort", "9080");
            ConfigurationManager.AppSettings.Set("RestClientTimeout", "10000");

        }

        #endregion

        #region protected overrride functions
        /// <summary>
        /// Get mock data from TestResources/XXXX.json file
        /// </summary>
        /// <typeparam name="T">ViewModel class</typeparam>
        /// <returns></returns>
        protected virtual T GetMockViewModel<T>() where T : class
        {
            // get name from T
            // check if has GenericTypeArguments then use its name, for example
            // - VersionViewModel -> VersionViewModel
            // - List<SystemAuthenticationProviderViewModel> -> SystemAuthenticationProviderViewModel
            Type type = typeof(T);
            if (type.GenericTypeArguments.Length != 0)
                type = type.GenericTypeArguments[0];

            return GetMockViewModel<T>(type.Name);
        }
        /// <summary>
        /// Get mock data from TestResources/XXXX.json file by sepcific json file name
        /// </summary>
        /// <typeparam name="T">ViewModel class</typeparam>
        /// <param name="name">name of json file</param>
        /// <returns></returns>
        protected virtual T GetMockViewModel<T>(string name) where T : class
        {
            string filePath = string.Format("{0}TestResources\\{1}.json", AppDomain.CurrentDomain.BaseDirectory, name);
            if (File.Exists(filePath))
            {
                string data = File.ReadAllText(filePath);
                return JsonConvert.DeserializeObject<T>(data, new UnixDateTimeConverter());
            }
            return (T)Activator.CreateInstance(typeof(T));
        }
        #endregion
    }
}
