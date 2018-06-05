using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Users;
using Moq;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test
{
    [TestFixture(Category = "MC")]
    public class SessionServiceTest
    {
        private Mock<ISessionService> service;

        [SetUp]
        public void Initialize()
        {
            service = new Mock<ISessionService>();

            service
                .Setup(v => v.GetSession(It.Is<string>(s => s == "TestGetSession")))
                .Returns(new SessionViewModel
                {
                    Id = "TestGetSession",
                    SecurityToken = "45d07896-59ce-4aa5-8b4d-dbaffc67a569"
                })
                .Verifiable();
        }

        [Test]
        public void TestGetSession()
        {
            var user = service.Object.GetSession("TestGetSession");
            Assert.IsTrue(user.SecurityToken == "45d07896-59ce-4aa5-8b4d-dbaffc67a569");
        }
    }
}
