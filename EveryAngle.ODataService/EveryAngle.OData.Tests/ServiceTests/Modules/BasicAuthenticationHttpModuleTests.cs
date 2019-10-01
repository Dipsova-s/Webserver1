using EveryAngle.OData.BusinessLogic.Interfaces.Authorizations;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Service.App_Start;
using EveryAngle.OData.Service.Modules;
using EveryAngle.OData.Service.Utils;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Specialized;
using System.IO;
using System.Web;
using System.Web.Http;

namespace EveryAngle.OData.Tests.ServiceTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Service")]
    public class BasicAuthenticationHttpModuleTests : UnitTestBase
    {
        #region private variables
        private Mock<IAppServerProxy> _appServerProxy = new Mock<IAppServerProxy>();
        private Mock<IOdataAuthorizations> _odataAuthorizations = new Mock<IOdataAuthorizations>();
        private Mock<IBasicAuthenticationHeaderParserWrapper> _basicAuthenticationHeaderParserWrapper = new Mock<IBasicAuthenticationHeaderParserWrapper>();
        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            IoCConfig.Register(new HttpConfiguration());

            HttpContext.Current = new HttpContext(
                new HttpRequest("", "http://localhost", ""),
                new HttpResponse(new StringWriter())
                );
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_Init_Dispose()
        {
            Assert.DoesNotThrow(() =>
            {
                BasicAuthenticationHttpModule.SetupBasicAuthenticationHttpModule(null, null, null);
                BasicAuthenticationHttpModule basicAuthenticationHttpModule = new BasicAuthenticationHttpModule();
                basicAuthenticationHttpModule.Init(new HttpApplication());
                basicAuthenticationHttpModule.Dispose();
            });
        }

        [TestCase]
        public void Can_OnApplicationAuthenticateRequest()
        {
            _appServerProxy.Setup(x => x.LoginUser(It.IsAny<User>())).Returns(true);
            _basicAuthenticationHeaderParserWrapper.Setup(x => x.GetBasicAuthenticationBase64EncodedCredentials(It.IsAny<NameValueCollection>())).Returns("ZWFhZG1pbjpQQHNzdzByZA==");
            BasicAuthenticationHttpModule.SetupBasicAuthenticationHttpModule(_appServerProxy.Object, _odataAuthorizations.Object, _basicAuthenticationHeaderParserWrapper.Object);

            BasicAuthenticationHttpModule.OnApplicationAuthenticateRequest(new object(), new EventArgs());

            Assert.AreEqual(200, HttpContext.Current.Response.StatusCode);
        }

        [TestCase]
        [ExpectedException(typeof(HttpException))]
        public void Cannot_OnApplicationAuthenticateRequest_Forbidden()
        {
            _appServerProxy.Setup(x => x.LoginUser(It.IsAny<User>())).Returns(true);
            _basicAuthenticationHeaderParserWrapper.Setup(x => x.GetBasicAuthenticationBase64EncodedCredentials(It.IsAny<NameValueCollection>())).Returns("ZWFhZG1pbjpQQHNzdzByZA==");
            BasicAuthenticationHttpModule.SetupBasicAuthenticationHttpModule(_appServerProxy.Object, _odataAuthorizations.Object, _basicAuthenticationHeaderParserWrapper.Object);

            BasicAuthenticationHttpModule.OnApplicationAuthenticateRequest(new object(), new EventArgs());
        }

        [TestCase]
        public void Cannot_OnApplicationAuthenticateRequest_Unauthorized()
        {
            _appServerProxy.Setup(x => x.LoginUser(It.IsAny<User>())).Returns(false);
            _basicAuthenticationHeaderParserWrapper.Setup(x => x.GetBasicAuthenticationBase64EncodedCredentials(It.IsAny<NameValueCollection>())).Returns("ZWFhZG1pbjpQQHNzdzByZA==");
            BasicAuthenticationHttpModule.SetupBasicAuthenticationHttpModule(_appServerProxy.Object, _odataAuthorizations.Object, _basicAuthenticationHeaderParserWrapper.Object);

            BasicAuthenticationHttpModule.OnApplicationAuthenticateRequest(new object(), new EventArgs());

            Assert.AreEqual(401, HttpContext.Current.Response.StatusCode);
        }

        [TestCase]
        public void Can_AssertMayAccessOdata()
        {
            _odataAuthorizations.Setup(x => x.MayView(It.IsAny<User>())).Returns(true);
            BasicAuthenticationHttpModule.SetupBasicAuthenticationHttpModule(_appServerProxy.Object, _odataAuthorizations.Object, _basicAuthenticationHeaderParserWrapper.Object);

            BasicAuthenticationHttpModule.AssertMayAccessOdata(new User());
        }

        [TestCase]
        [ExpectedException(typeof(HttpException))]
        public void Cannot_AssertMayAccessOdata()
        {
            _odataAuthorizations.Setup(x => x.MayView(It.IsAny<User>())).Returns(false);
            BasicAuthenticationHttpModule.SetupBasicAuthenticationHttpModule(_appServerProxy.Object, _odataAuthorizations.Object, _basicAuthenticationHeaderParserWrapper.Object);

            BasicAuthenticationHttpModule.AssertMayAccessOdata(new User());
        }

        [TestCase]
        public void Can_OnApplicationEndRequest()
        {
            HttpContext.Current.Response.StatusCode = 401;

            BasicAuthenticationHttpModule.OnApplicationEndRequest(new object(), new EventArgs());
        }

        #endregion
    }
}
