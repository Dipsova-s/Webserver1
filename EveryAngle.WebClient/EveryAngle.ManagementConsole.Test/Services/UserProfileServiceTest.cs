using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Users;
using Moq;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Services.Test
{
    [TestFixture(Category = "MC")]
    public class UserProfileServiceTest
    {
        private Mock<IUserProfileService> service;

        [SetUp]
        public void Initialize()
        {
            service = new Mock<IUserProfileService>();

            service
                .Setup(v => v.GetSession(It.Is<string>(s => s == "TestGetSession")))
                .Returns(new UserProfileViewModel
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
