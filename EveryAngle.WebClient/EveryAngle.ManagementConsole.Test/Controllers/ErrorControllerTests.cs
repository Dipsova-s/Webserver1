using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.Shared.Globalization;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Net;
using System.Web.Mvc;
using System.Web.Routing;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class ErrorControllerTests : UnitTestBase
    {
        #region private variables

        private ErrorController _testingController;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            _testingController = new ErrorController();
            _testingController.ControllerContext = new ControllerContext(contextBase.Object, new RouteData(), _testingController);
        }

        #endregion

        #region tests

        [TestCase("Internal server error.")]
        public void Can_GetIndex(string error)
        {
            // execute
            _testingController.Index(error);

            // assert
            Assert.AreEqual(error, _testingController.ViewBag.ErrorMessage);
            Assert.AreEqual(Resource.MC_AnErrorOccured, _testingController.ViewBag.ErrorTitle);
            Assert.AreEqual("javascript:history.back();", _testingController.ViewBag.ReturnUrl);
        }

        [TestCase("{ \"message\": \"Internal server error.\", \"reason\": \"Page not found.\" }")]
        public void Can_GetIndex_Json(string error)
        {
            // execute
            _testingController.Index(error);

            // assert
            Assert.AreEqual("Internal server error.", _testingController.ViewBag.ErrorMessage);
            Assert.AreEqual("Page not found.", _testingController.ViewBag.ErrorTitle);
            Assert.AreEqual("/referrer/1", _testingController.ViewBag.ReturnUrl);
        }

        [TestCase("{ \"message\": Internal server error. }")]
        public void Can_GetIndex_JsonMalform(string error)
        {
            // execute
            _testingController.Index(error);

            // assert
            Assert.AreEqual(error, _testingController.ViewBag.ErrorMessage);
            Assert.AreEqual(Resource.MC_AnErrorOccured, _testingController.ViewBag.ErrorTitle);
            Assert.AreEqual("/referrer/1", _testingController.ViewBag.ReturnUrl);
        }

        [TestCase("Internal server error with 404?.")]
        public void Can_GetIndex_404(string error)
        {
            // execute
            responseBase.SetupGet(x => x.StatusCode).Returns(404);
            requestBase.SetupGet(x => x.UrlReferrer).Returns(new Uri("/referrer/1", UriKind.Relative));
            contextBase.SetupGet(x => x.Response).Returns(responseBase.Object);
            contextBase.SetupGet(x => x.Request).Returns(requestBase.Object);

            _testingController.ControllerContext = new ControllerContext(contextBase.Object, new RouteData(), _testingController);
            _testingController.Index(error);

            // assert
            Assert.AreEqual(error, _testingController.ViewBag.ErrorMessage);
            Assert.AreEqual(Resource.MC_PageNotFound, _testingController.ViewBag.ErrorTitle);
            Assert.AreEqual(_testingController.Request.UrlReferrer.ToString(), _testingController.ViewBag.ReturnUrl);
        }

        [TestCase("Internal server error.", "Page not found.")]
        public void Can_GetIndex_AjaxRequest(string title, string description)
        {
            // execute
            requestBase.SetupGet(x => x.Headers).Returns(new WebHeaderCollection { { "X-Requested-With", "XMLHttpRequest" } });
            contextBase.SetupGet(x => x.Request).Returns(requestBase.Object);

            _testingController.ViewBag.Title = title;
            _testingController.ViewBag.Description = description;
            _testingController.ControllerContext = new ControllerContext(contextBase.Object, new RouteData(), _testingController);
            JsonResult jsonResult = _testingController.Index(title) as JsonResult;
            string stringResult = JsonConvert.SerializeObject(jsonResult.Data);
            dynamic dynamicResult = JsonConvert.DeserializeObject<dynamic>(stringResult);

            // assert
            Assert.IsNotNull(jsonResult);
            Assert.IsNotNull(dynamicResult);
            Assert.AreEqual(title, dynamicResult.reason.ToString());
            Assert.AreEqual(description, dynamicResult.message.ToString());
        }

        [TestCase("")]
        [TestCase("Internal server error.")]
        public void Can_HandlingError(string error)
        {
            // execute
            requestBase.SetupGet(x => x.Headers).Returns(new WebHeaderCollection());
            contextBase.SetupGet(x => x.Request).Returns(requestBase.Object);

            _testingController.ControllerContext = new ControllerContext(contextBase.Object, new RouteData(), _testingController);
            _testingController.ErrorHandling(error);

            // assert
            Assert.AreEqual(_testingController.Response.StatusCode, _testingController.ViewBag.ErrorTitle);
            Assert.AreEqual(string.IsNullOrEmpty(error) 
                            ? Resource.MC_AnErrorOccured
                            : error, _testingController.ViewBag.ErrorMessage);
        }

        [TestCase("{ \"message\": \"Internal server error.\", \"reason\": \"Page not found.\" }")]
        public void Can_HandlingError_Json(string error)
        {
            // execute
            ActionResult actionResult = _testingController.ErrorHandling(error);
            ContentResult contentResult = actionResult as ContentResult;

            // assert
            Assert.IsNotNull(contentResult);
            Assert.IsNotNullOrEmpty(contentResult.Content);
            Assert.AreEqual(error, contentResult.Content);
        }

        [TestCase("Internal server error.")]
        public void Can_HandlingError_AjaxRequest(string error)
        {
            // execute
            requestBase.SetupGet(x => x.Headers).Returns(new WebHeaderCollection { { "X-Requested-With", "XMLHttpRequest" } });
            contextBase.SetupGet(x => x.Request).Returns(requestBase.Object);

            _testingController.ControllerContext = new ControllerContext(contextBase.Object, new RouteData(), _testingController);
            JsonResult jsonResult = _testingController.ErrorHandling(error) as JsonResult;
            string stringResult = JsonConvert.SerializeObject(jsonResult.Data);
            dynamic dynamicResult = JsonConvert.DeserializeObject<dynamic>(stringResult);

            // assert
            Assert.IsNotNull(jsonResult);
            Assert.IsNotNull(dynamicResult);
            Assert.AreEqual(Resource.MC_AnErrorOccured, dynamicResult.reason.ToString());
            Assert.AreEqual(error, dynamicResult.message.ToString());
            Assert.AreEqual(JsonRequestBehavior.AllowGet, jsonResult.JsonRequestBehavior);
        }

        #endregion
    }
}
