using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Models;
using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Service.Security;
using Moq;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.SessionState;

namespace EveryAngle.ManagementConsole.Test
{
    [TestFixture(Category = "MC")]
    public abstract class UnitTestBase
    {
        #region private/protected variables

        protected string host;
        protected ModelViewModel testingModel;

        // controller context with request injected
        protected readonly Mock<HttpRequestBase> requestBase = new Mock<HttpRequestBase>();
        protected readonly Mock<HttpResponseBase> responseBase = new Mock<HttpResponseBase>();
        protected readonly Mock<HttpContextBase> contextBase = new Mock<HttpContextBase>();

        protected readonly Mock<SessionHelper> sessionHelper = new Mock<SessionHelper>();
        protected readonly Mock<IGlobalSettingService> globalSettingService = new Mock<IGlobalSettingService>();
        protected readonly Mock<ILabelService> labelService = new Mock<ILabelService>();
        protected readonly Mock<IModelService> modelService = new Mock<IModelService>();
        protected readonly Mock<IUserService> userService = new Mock<IUserService>();
        protected readonly Mock<ISessionService> sessionService = new Mock<ISessionService>();
        protected readonly Mock<IAutomationTaskService> automationTaskService = new Mock<IAutomationTaskService>();
        protected readonly Mock<ITaskService> taskService = new Mock<ITaskService>();
        protected readonly Mock<ICommentService> commentService = new Mock<ICommentService>();
        protected readonly Mock<IDownloadTableService> downloadTableService = new Mock<IDownloadTableService>();
        protected readonly Mock<IPackageService> packageService = new Mock<IPackageService>();
        protected readonly Mock<IFacetService> facetService = new Mock<IFacetService>();
        protected readonly Mock<IItemService> itemService = new Mock<IItemService>();

        #endregion

        #region setup/teardown

        [SetUp]
        public virtual void Setup()
        {
            // prepare
            host = EveryAngle.Shared.Helpers.UrlHelper.GetRequestUrl(URLType.NOA);
            testingModel = new ModelViewModel
            {
                short_name = "EA2_800",
                Agent = new Uri("/uri/2", UriKind.Relative),
                FieldsUri = new Uri("/models/1/fields", UriKind.Relative),
                angle_warnings_summary = new Uri("angles/x/warnings", UriKind.Relative)
            };

            // helper
            sessionHelper.Setup(x => x.GetModel(It.IsAny<string>())).Returns(testingModel);
            sessionHelper.SetupGet(x => x.CurrentUser).Returns(new UserViewModel { Id = "testing_user", Uri = new Uri("/users/1", UriKind.Relative) });
            sessionHelper.SetupGet(x => x.SystemSettings).Returns(new SystemSettingViewModel { default_pagesize = 30, max_pagesize = 300 });
            sessionHelper.SetupGet(x => x.Version).Returns(GetMockViewModel<VersionViewModel>());

            // setup context
            InitiateTestingContext();
        }

        [TearDown]
        public virtual void TearDown()
        {

        }

        #endregion

        #region protected overrride functions

        protected virtual void InitiateTestingViewModel()
        {
            return;
        }

        protected virtual void InitiateTestingJToken()
        {
            return;
        }

        protected virtual void InitiateTestingContext()
        {
            HttpRequest request = new HttpRequest("mock.png", "http://mock.org/mock", "q=mock");
            HttpResponse response = new HttpResponse(new StringWriter());
            HttpContext httpContext = new HttpContext(request, response);            

            ISessionStateItemCollection collection = new SessionStateItemCollection();
            collection["Sitemaps"] = new List<SiteMapModel.SiteMap>();
            collection["MCSession_Version"] = new VersionViewModel { Version = "1" };

            HttpSessionStateContainer sessionContainer = new HttpSessionStateContainer("id", collection,
                                                        new HttpStaticObjectsCollection(), 10, false,
                                                        HttpCookieMode.AutoDetect,
                                                        SessionStateMode.StateServer, false);

            SessionStateUtility.AddHttpSessionStateToContext(httpContext, sessionContainer);

            HttpContext.Current = httpContext;

            // mock Request.Headers["X-Requested-With"] or Request["X-Requested-With"] to use Request.IsAjaxRequest()
            contextBase.SetupGet(x => x.Request).Returns(requestBase.Object);
            contextBase.SetupGet(x => x.Response).Returns(responseBase.Object);
        }

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
