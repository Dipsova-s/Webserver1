using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.WebClient.Web.Controllers;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.CS.Tests.ControllerTest
{
    [TestFixture]
    public class ComponentControllerTests : UnitTestBase
    {
        private readonly Mock<IComponentService>  _componentService = new Mock<IComponentService>();
        #region setup/teardown

        [TestFixtureSetUp]
        public void Initialize()
        {

            List<ComponentViewModel> components = GetMockViewModel<List<ComponentViewModel>>();

            _componentService.Setup(x => x.GetItems()).Returns(components);
        }

        #endregion

        #region Testcase
        [TestCase]
        public void GoToModellingWorkbench_Should_ReturnWorkbench_URI_When_Called()
        {
            //Prepare
            ComponentController controller = new ComponentController(_componentService.Object);


            //Action
            ActionResult result = controller.GoToModellingWorkbench();

            //Assert
            Assert.That(result, Is.InstanceOf<RedirectResult>());
            RedirectResult routeResult = result as RedirectResult;
            Assert.AreEqual(routeResult.Url, "http://NL-WEBMB01.everyangle.org:62029/workbench");
        }

        [TestCase]
        [ExpectedException(typeof(HttpException))]
        public void GoToModellingWorkbench_Should_Return_HttpException()
        {
            //Prepare
            ComponentController controller = new ComponentController();


            //Action
            ActionResult result = controller.GoToModellingWorkbench();


        }
        #endregion

    }
}
