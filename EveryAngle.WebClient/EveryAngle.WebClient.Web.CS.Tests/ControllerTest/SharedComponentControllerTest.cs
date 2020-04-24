using EveryAngle.Core.ViewModels.About;
using EveryAngle.WebClient.Service.ApplicationServices;
using EveryAngle.WebClient.Web.Controllers;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.CS.Tests.ControllerTest
{
    [TestFixture]
    class SharedComponentControllerTest : UnitTestBase
    {
        #region private variables
        SharedComponentController _testingController;
        private Mock<CopyrightService> _service;
        #endregion

        #region setup/teardown
        [TestFixtureSetUp]
        public void Initialize()
        {
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

        [Test]
        public void Can_CreateController()
        {
            Assert.That(() => new SharedComponentController(), Throws.Nothing);
        }
    }
}
