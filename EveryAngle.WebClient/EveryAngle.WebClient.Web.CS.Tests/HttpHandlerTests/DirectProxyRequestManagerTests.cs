using EveryAngle.WebClient.Service.HttpHandlers;
using Moq;
using NUnit.Framework;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Net;
using System.Web;

namespace EveryAngle.WebClient.Web.CS.Tests.HttpHandlerTests
{
    public class DirectProxyRequestManagerTests
    {
        [Test]
        public void DirectProxyRequestManagerTests_GetProxyUrl()
        {
            // Arrange
            var mockRequest = new HttpRequest(null, "https://abc.com/api/directproxy/requestUrl", null);
            var mockContext = new HttpContext(mockRequest, new System.Web.HttpResponse(null));
            HttpContext.Current = mockContext;

            // Act
            var result = DirectProxyRequestManager.GetProxyRequestUrl();

            // Assert
            Assert.AreEqual("requestUrl", result);            
        }

        [Test]
        public void DirectProxyRequestManagerTests_Run()
        {
            var expectedResponse = "testResponse";
            var mockRequest = new HttpRequest(null, "https://abc.com/api/directproxy/requestUrl", null);
            var mockContext = new HttpContext(mockRequest, new System.Web.HttpResponse(null));
            HttpContext.Current = mockContext;

            var requestManager = TestProxyRequestManager.Initialize("requestUrl");
            requestManager.SetupMockClient(expectedResponse);

            var result = requestManager.Run();

            Assert.AreEqual(expectedResponse, result);
        }

        public class TestProxyRequestManager : DirectProxyRequestManager
        {
            public TestProxyRequestManager(string uri) : base(uri) { }

            public static new TestProxyRequestManager Initialize(string requestUrl)
            {
                return new TestProxyRequestManager(requestUrl);
            }

            public void SetupMockClient(string responseContent)
            {
                var response = new Mock<IRestResponse>();
                response.SetupGet(r => r.Content).Returns(responseContent);
                response.SetupGet(r => r.StatusCode).Returns(HttpStatusCode.OK);
                response.SetupGet(r => r.Headers).Returns(new List<Parameter>());
                response.SetupGet(r => r.Cookies).Returns(new List<RestResponseCookie>());
                var mockClient = new Mock<RestClient>();
                mockClient.Setup(x => x.Execute(It.IsAny<RestRequest>())).Returns(response.Object);

                client = mockClient.Object;
            }
        }
    }
}
