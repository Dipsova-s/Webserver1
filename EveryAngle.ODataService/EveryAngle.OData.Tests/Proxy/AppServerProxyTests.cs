using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using Moq;
using NUnit.Framework;
using RestSharp;
using System.Net;

namespace EveryAngle.OData.Tests.Proxy
{
    [TestFixture(Category = "Proxy")]
    public class AppServerProxyTests : UnitTestBase
    {
        #region private variables

        private IAppServerProxyPrivateAccess _testingProxy;
        private readonly Mock<IEARestClient> _restClient = new Mock<IEARestClient>();

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            _restClient.Setup(x => x.Execute<Session>(It.IsAny<IRestRequest>())).Returns(new RestResponse<Session>());
            _testingProxy = new AppServerProxy(_restClient.Object);
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_Execute_GenericGet_OK()
        {
            IRestResponse<Angles> response = GetTestResponse(new Angles { header = new Header { total = 10000 } }, HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<Angles>(It.IsAny<IRestRequest>())).Returns(response);

            InitRestClientTest();

            Angles angles = _testingProxy.Get<Angles>("models/1/angles", null);

            Assert.IsNotNull(angles.header);
            Assert.IsTrue(angles.header.total.HasValue);
            Assert.AreEqual(response.Data.header.total.Value, angles.header.total.Value);
        }

        [TestCase]
        [Ignore]
        // TODO: should test unauthorisze where re-login fails
        public void Can_Execute_GenericGet_Unauthorized()
        {
            // setup return angles
            IRestResponse<Angles> responseAngles = GetTestResponse(new Angles { header = new Header { total = 10000 } }, HttpStatusCode.Unauthorized);
            _restClient.Setup(x => x.Execute<Angles>(It.IsAny<IRestRequest>())).Returns(responseAngles);

            InitRestClientTest();

            Angles angles = _testingProxy.Get<Angles>("models/1/angles", null);

            Assert.IsNull(angles.header);
        }


        [TestCase]
        [Ignore]
        public void Can_Execute_GenericPost(string securityToken, HttpStatusCode returnStatus)
        {
            // TODO: Implement //NOSONAR
        }

        [TestCase]
        [Ignore]
        public void Can_Execute_GenericPost_Unauthorized()
        {
            // TODO: Implement //NOSONAR
        }

        [TestCase]
        [Ignore]
        public void Can_Execute_NewRestRequest()
        {
            // TODO: Implement //NOSONAR
        }


        #endregion

        #region private functions

        private IRestResponse<T> GetTestResponse<T>(T returnData, HttpStatusCode returnStatus)
        {
            IRestResponse<T> response = new RestResponse<T>();
            response.Data = returnData;
            response.StatusCode = returnStatus;

            return response;
        }
        private void InitRestClientTest()
        {
            _testingProxy = new AppServerProxy(_restClient.Object);
        }

        #endregion
    }
}
