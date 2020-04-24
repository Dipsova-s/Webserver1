using EveryAngle.Core.ViewModels.About;
using EveryAngle.WebClient.Service.ApplicationServices;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using NUnit.Framework;
using System;

namespace EveryAngle.WebClient.Web.CS.Tests.ServiceTests
{
    [TestFixture]
    class CopyrightServiceTest : UnitTestBase
    {
        private CopyrightService _service;

        [TestFixtureSetUp]
        public void Initialize()
        {
            _service = new CopyrightService();
        }

        [Test]
        public void Can_GetLicenses()
        {
            string filePath = string.Format("{0}TestResources\\{1}.json", AppDomain.CurrentDomain.BaseDirectory, "Copyright");
            LicenseCopyrightViewModel model = _service.GetLicenses(filePath);
            Assert.AreEqual(model.title, "Copyright");
            Assert.AreEqual(model.packages[0].name, "Abbrevia");

        }
    }
}
