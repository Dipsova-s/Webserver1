using EveryAngle.WebClient.Domain.Enums;
using EveryAngle.WebClient.Service.ApplicationServices;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.ManagementConsole.Test.Services
{
    [TestFixture(Category = "MC")]
    class GlobalSettingsAppServiceTest
    {
        private GlobalSettingsAppService _service;

        [SetUp]
        public void SetUp()
        {
            _service = new GlobalSettingsAppService();
        }

        [Test]
        public void BuildApprovalStateOptions_Should_Return_ApprovalOptions()
        {
            var approvalOptions = _service.BuildApprovalStateOptions();
            Assert.NotNull(approvalOptions);

            foreach (ApprovalState option in Enum.GetValues(typeof(ApprovalState)))
            {
                Assert.True(approvalOptions.Any(o => o.Id.Equals(option.ToString())));
            }
        }

        [Test]
        public void BuildApprovalStateOptions_Should_Return_TimeZoneOptions()
        {
            var timeZoneOptions = _service.BuildTimeZoneOptions();
            Assert.NotNull(timeZoneOptions);

            foreach (var timeZone in TimeZoneInfo.GetSystemTimeZones())
            {
                Assert.True(timeZoneOptions.Any(o => o.Id.Equals(timeZone.Id)));
            }
        }
    }
}
