using System;
using NUnit.Framework;
using EveryAngle.ManagementConsole.Controllers;
using System.Web.Mvc;
using Moq;
using EveryAngle.WebClient.Service.ApplicationServices;
using System.Web;
using System.Web.Hosting;
using EveryAngle.Core.ViewModels.About;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class SharedComponentControllerTest : UnitTestBase
    {
        #region private variables
        SharedComponentController _testingController;
        private Mock<CopyrightService> _service;
        #endregion

        #region setup/teardown
        [SetUp]
        public override void Setup()
        {
            base.Setup();
            _service = new Mock<CopyrightService>();
        }
        #endregion

        [Test]
        public void Can_ReturnCopyrightView()
        {
            _service.Setup(x => x.GetLicenses(It.IsAny<string>())).Returns(new LicenseCopyrightViewModel());
            _testingController = new SharedComponentController(_service.Object);
            ViewResult ar = _testingController.Copyright() as ViewResult;
            Assert.AreEqual(ar.ViewData.Model.GetType(), typeof(LicenseCopyrightViewModel));
        }
    }
}