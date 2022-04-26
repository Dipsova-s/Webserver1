using EveryAngle.WebClient.Service.ErrorHandlers;
using NUnit.Framework;
using System;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace EveryAngle.WebClient.Web.CS.Tests.Filters.ActionFilters
{
    public class CustomApiHandleCompactErrorAttributeTests
    {
        [Test]
        public void CustomApiHandleCompactErrorAttributeTests_WhenHttpException()
        {
            // Arrange
            var sdsd = new CustomApiHandleCompactErrorAttribute();
            var httpActionExecutedContext = new HttpActionExecutedContext();
            var actionContext = new HttpActionContext()
            {
                ControllerContext = new HttpControllerContext()
                {
                    Request = new HttpRequestMessage(HttpMethod.Get, string.Empty)
                }
            };
            httpActionExecutedContext.ActionContext = actionContext;
            httpActionExecutedContext.Exception = new HttpException((int)HttpStatusCode.Unauthorized, "ExceptionMessage");

            // Act
            sdsd.OnException(httpActionExecutedContext);

            var response = (HttpError)((ObjectContent<HttpError>)httpActionExecutedContext.Response.Content).Value;
            
            // Assert
            Assert.AreEqual("Unauthorized", response["Reason"]);
            Assert.AreEqual("ExceptionMessage", response["Message"]);
        }

        [Test]
        public void CustomApiHandleCompactErrorAttributeTests_WhenGeneralException()
        {
            // Arrange
            var sdsd = new CustomApiHandleCompactErrorAttribute();
            var httpActionExecutedContext = new HttpActionExecutedContext();
            var actionContext = new HttpActionContext()
            {
                ControllerContext = new HttpControllerContext()
                {
                    Request = new HttpRequestMessage(HttpMethod.Get, string.Empty)
                }
            };
            httpActionExecutedContext.ActionContext = actionContext;
            httpActionExecutedContext.Exception = new Exception("ExceptionMessage");

            // Act
            sdsd.OnException(httpActionExecutedContext);

            var response = (HttpError)((ObjectContent<HttpError>)httpActionExecutedContext.Response.Content).Value;

            // Assert
            Assert.AreEqual("Unknown", response["Reason"]);
            Assert.AreEqual("ExceptionMessage", response["Message"]);
        }
    }
}
