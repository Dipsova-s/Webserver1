using EveryAngle.OData.DTO;
using EveryAngle.OData.DTO.Model;
using EveryAngle.OData.Proxy;
using Moq;
using NUnit.Framework;
using RestSharp;
using System;
using System.Net;

namespace EveryAngle.OData.Tests.ProxyTests
{
    [TestFixture(Category = "Proxy")]
    public class AppServerProxyPrivateAccessTests : UnitTestBase
    {
        #region private variables

        private IAppServerProxyPrivateAccess _testingProxy;
        private readonly Mock<IEARestClient> _restClient = new Mock<IEARestClient>();
        private User _user;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            _restClient.Setup(x => x.Execute<Session>(It.IsAny<IRestRequest>())).Returns(new RestResponse<Session>());
            _testingProxy = new AppServerProxy(_restClient.Object);
            _user = new User("tester", "tester");
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

            Angles angles = _testingProxy.Get<Angles>("models/1/angles", null);

            Assert.IsNotNull(angles.header);
            Assert.IsTrue(angles.header.total.HasValue);
            Assert.AreEqual(response.Data.header.total.Value, angles.header.total.Value);
        }
        
        [TestCase(401)]
        [TestCase(440)]
        public void Can_Execute_GenericGet_Unauthorized(int statusCode)
        {
            // setup return angles
            IRestResponse<Angles> responseAngles = GetTestResponse(new Angles { header = new Header { total = 10000 } }, (HttpStatusCode)statusCode);
            IRestResponse<Session> responseSession = GetTestResponse(new Session { security_token = "my_token" }, HttpStatusCode.Created);
            IRestResponse<ModelPrivilegeListViewModel> responseModelPrivilege = GetTestResponse(new ModelPrivilegeListViewModel(), HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<Angles>(It.IsAny<IRestRequest>())).Returns(responseAngles);
            _restClient.Setup(x => x.Execute<Session>(It.IsAny<IRestRequest>())).Returns(responseSession);
            _restClient.Setup(x => x.Execute<ModelPrivilegeListViewModel>(It.IsAny<IRestRequest>())).Returns(responseModelPrivilege);

            Angles angles = _testingProxy.Get<Angles>("models/1/angles", _user);

            Assert.IsNotNull(angles.header);
            Assert.IsTrue(angles.header.total.HasValue);
            Assert.AreEqual(responseAngles.Data.header.total.Value, angles.header.total.Value);
        }

        [TestCase]
        [ExpectedException]
        public void Can_Execute_GenericGet_Forbidden()
        {
            // setup return angles
            IRestResponse<Angles> response = GetTestResponse(new Angles(), HttpStatusCode.Forbidden);
            _restClient.Setup(x => x.Execute<Angles>(It.IsAny<IRestRequest>())).Returns(response);

            Angles angles = _testingProxy.Get<Angles>("models/1/angles", null);
        }

        [TestCase(0)]
        [TestCase(422)]
        [TestCase(503)]
        public void Can_Execute_GenericGet_Failure(int statusCode)
        {
            // setup return angles
            IRestResponse<Angles> response = GetTestResponse(new Angles(), (HttpStatusCode)statusCode);
            _restClient.Setup(x => x.Execute<Angles>(It.IsAny<IRestRequest>())).Returns(response);

            Angles angles = _testingProxy.Get<Angles>("models/1/angles", null);

            Assert.IsNull(angles);
        }


        [TestCase]
        public void Can_Execute_GenericPost_OK()
        {
            IRestResponse<Angle> response = GetTestResponse(new Angle { id = "angle1" }, HttpStatusCode.Created);
            _restClient.Setup(x => x.Execute<Angle>(It.IsAny<IRestRequest>())).Returns(response);

            Angle angle = _testingProxy.Post<Angle>("models/1/angles", null, null);

            Assert.AreEqual("angle1", angle.id);
        }

        [TestCase(401)]
        [TestCase(440)]
        public void Can_Execute_GenericPost_Unauthorized(int statusCode)
        {
            IRestResponse<Angle> responseAngle = GetTestResponse(new Angle { id = "angle1" }, (HttpStatusCode)statusCode);
            IRestResponse<Session> responseSession = GetTestResponse(new Session(), HttpStatusCode.Created);
            IRestResponse<ModelPrivilegeListViewModel> responseModelPrivilege = GetTestResponse(new ModelPrivilegeListViewModel(), HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<Angle>(It.IsAny<IRestRequest>())).Returns(responseAngle);
            _restClient.Setup(x => x.Execute<Session>(It.IsAny<IRestRequest>())).Returns(responseSession);
            _restClient.Setup(x => x.Execute<ModelPrivilegeListViewModel>(It.IsAny<IRestRequest>())).Returns(responseModelPrivilege);

            Angle angle = _testingProxy.Post<Angle>("models/1/angles", null, _user);

            Assert.AreEqual("angle1", angle.id);
        }

        [TestCase]
        [ExpectedException]
        public void Can_Execute_GenericPost_Forbidden()
        {
            // setup return angles
            IRestResponse<Angle> response = GetTestResponse(new Angle(), HttpStatusCode.Forbidden);
            _restClient.Setup(x => x.Execute<Angle>(It.IsAny<IRestRequest>())).Returns(response);

            Angle angle = _testingProxy.Post<Angle>("models/1/angles", null, null);
        }

        [TestCase(0)]
        [TestCase(422)]
        [TestCase(503)]
        public void Can_Execute_GenericPost_Failure(int statusCode)
        {
            // setup return angles
            IRestResponse<Angle> response = GetTestResponse(new Angle(), (HttpStatusCode)statusCode);
            _restClient.Setup(x => x.Execute<Angle>(It.IsAny<IRestRequest>())).Returns(response);

            Angle angle = _testingProxy.Post<Angle>("models/1/angles", null, null);

            Assert.IsNull(angle);
        }

        [TestCase(null, 0)]
        [TestCase("test", 1)]
        public void Can_Execute_NewRestRequest(string securityToken, int expected)
        {
            IRestRequest result = _testingProxy.NewRestRequest(It.IsAny<string>(), securityToken, It.IsAny<Method>());
            
            Assert.AreEqual(expected, result.Parameters.Count);
            if (expected > 0)
                Assert.AreEqual(securityToken, result.Parameters[0].Value);
        }


        #endregion

        #region private functions

        private IRestResponse<T> GetTestResponse<T>(T returnData, HttpStatusCode returnStatus)
        {
            IRestResponse<T> response = new RestResponse<T>
            {
                Data = returnData,
                StatusCode = returnStatus,
                Request = new RestRequest(),
                ErrorException = new Exception()
            };

            return response;
        }

        #endregion
    }
}
