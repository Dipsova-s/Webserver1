using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using Moq;
using NUnit.Framework;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Net;

namespace EveryAngle.OData.Tests.ProxyTests
{
    [TestFixture(Category = "Proxy")]
    public class AppServerProxyTests : UnitTestBase
    {
        #region private variables

        private IAppServerProxy _testingProxy;
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

        [TestCase(null, -1)]
        [TestCase("EA4IT", -1)]
        [TestCase("EA2_800", 1)]
        public void Can_Get_Model(string modelId, int expected)
        {
            Models models = modelId == null ? null : new Models { models = new List<ModelInfo> { new ModelInfo { id = modelId, uri = "/models/1" } } };
            IRestResponse<Models> response = GetTestResponse(models, HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<Models>(It.IsAny<IRestRequest>())).Returns(response);

            int result = _testingProxy.Model;

            Assert.AreEqual(expected, result);
        }

        [TestCase(null)]
        [TestCase("test:1")]
        public void Can_GetAngles(string anglesQuery)
        {
            IRestResponse<Angles> response = GetTestResponse(new Angles(), HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<Angles>(It.IsAny<IRestRequest>())).Returns(response);

            Angles angles = _testingProxy.GetAngles(30, anglesQuery, null);

            Assert.NotNull(angles);
        }

        [TestCase]
        public void Can_GetAngle()
        {
            IRestResponse<Angle> response = GetTestResponse(new Angle(), HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<Angle>(It.IsAny<IRestRequest>())).Returns(response);

            Angle angle = _testingProxy.GetAngle("/models/1/angles/1", null);

            Assert.NotNull(angle);
        }

        [TestCase]
        public void Can_GetDisplay()
        {
            IRestResponse<Display> response = GetTestResponse(new Display(), HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<Display>(It.IsAny<IRestRequest>())).Returns(response);

            Display display = _testingProxy.GetDisplay("/models/1/angles/1/displays/1", null);

            Assert.NotNull(display);
        }

        [TestCase("EA4IT", "", false)]
        [TestCase("EA2_800", "", false)]
        [TestCase("EA2_800", "/models/1/instance/1", true)]
        public void Can_TryGetCurrentInstance(string modelId, string currentInstance, bool expected)
        {
            IRestResponse<ModelInfo> response = GetTestResponse(modelId == "EA4IT" ? null : new ModelInfo { current_instance = currentInstance }, HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<ModelInfo>(It.IsAny<IRestRequest>())).Returns(response);

            IRestResponse<Models> responseModels = GetTestResponse(new Models(), HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<Models>(It.IsAny<IRestRequest>())).Returns(responseModels);

            bool result = _testingProxy.TryGetCurrentInstance(null, out string resultCurrentInstance);

            Assert.AreEqual(result, expected);
            Assert.AreEqual(resultCurrentInstance, currentInstance);
        }

        [TestCase]
        public void Can_GetModelFields()
        {
            IRestResponse<Fields> response = GetTestResponse(new Fields(), HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<Fields>(It.IsAny<IRestRequest>())).Returns(response);

            Fields fields = _testingProxy.GetModelFields("/models/1/instance/1", new string[] { "field1", "field2" }, null);

            Assert.NotNull(fields);
        }
        
        [TestCase(null, "working")]
        [TestCase("/results/1", "finished")]
        public void Can_ExecuteAngleDisplay(string resultUri, string expected)
        {
            Display display = new Display { uri = "/models/1/angles/1/displays/1" };
            IRestResponse<QueryResult> responsePost = GetTestResponse(new QueryResult { uri = resultUri, status = "working" }, HttpStatusCode.Created);
            IRestResponse<QueryResult> responseGet = GetTestResponse(new QueryResult { uri = "/results/1", status = "finished" }, HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<QueryResult>(It.IsAny<IRestRequest>())).Returns((IRestRequest request) =>
            {
                return request.Method == Method.POST ? responsePost : responseGet;
            });

            QueryResult queryResult = _testingProxy.ExecuteAngleDisplay(null, display);

            Assert.AreEqual(expected, queryResult.status);
        }

        [TestCase]
        public void Can_ExecuteAngleDisplay_NoResult()
        {
            Display display = new Display { uri = "/models/1/angles/1/displays/1" };
            IRestResponse<QueryResult> responsePost = GetTestResponse(default(QueryResult), HttpStatusCode.Created);
            _restClient.Setup(x => x.Execute<QueryResult>(It.IsAny<IRestRequest>())).Returns(responsePost);

            QueryResult queryResult = _testingProxy.ExecuteAngleDisplay(null, display);

            Assert.IsNull(queryResult);
        }

        [TestCase(null, null)]
        [TestCase(60, 30)]
        public void Can_GetResultData(int? skip, int? top)
        {
            Display display = new Display { uri = "/models/1/angles/1/displays/1" };
            QueryResult queryResult = new QueryResult { uri = "/results/1", status = "finished" };
            IRestResponse<DataRows> response = GetTestResponse(new DataRows(), HttpStatusCode.OK);
            _restClient.Setup(x => x.Execute<DataRows>(It.IsAny<IRestRequest>())).Returns(response);

            DataRows dataRows = _testingProxy.GetResultData(null, queryResult, display, skip, top);

            Assert.NotNull(dataRows);
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
