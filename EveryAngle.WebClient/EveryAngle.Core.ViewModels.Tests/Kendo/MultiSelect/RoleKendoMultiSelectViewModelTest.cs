using EveryAngle.Core.ViewModels.Kendo;
using EveryAngle.Core.ViewModels.Users;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class RoleKendoMultiSelectViewModelTest : UnitTestBase
    {
        [TestCase("EA2_800_ALL", "EA2_800", "EA2_800:EA2_800_ALL")]
        [TestCase("EA2_800_ALL", "", "EA2_800_ALL")]
        public void Should_ReturnCorrectValue_When_BeingUsed(string roleId, string modelId, string expectedResult)
        {
            var result = new RoleKendoMultiSelectViewModel(roleId, modelId);

            Assert.AreEqual(expectedResult, result.Value);
        }

        [TestCase("EA2_800_ALL", "EA2_800", "EA2_800 model role")]
        [TestCase("EA2_800_ALL", "", "System role")]
        public void Should_ReturnCorrectTooltip_When_BeingUsed(string roleId, string modelId, string expectedResult)
        {
            var result = new RoleKendoMultiSelectViewModel(roleId, modelId);

            Assert.AreEqual(expectedResult, result.Tooltip);
        }

        [Test]
        public void Should_ReturnTooltipAsDefaultRole_When_BeingUsed()
        {
            var listView = new List<RoleKendoMultiSelectViewModel>
            {
                new RoleKendoMultiSelectViewModel("EA2_800_ALL", "EA2_800"),
                new RoleKendoMultiSelectViewModel("EA2_800_POWER", "EA2_800"),
                new RoleKendoMultiSelectViewModel("EA2_800_VIEWER", "EA2_800")
            };

            var defaultRoles = new List<AssignedRoleViewModel>
            {
                new AssignedRoleViewModel
                {
                    RoleId = "EA2_800_ALL",
                    ModelId = "EA2_800"
                }
            };

            var result = RoleKendoMultiSelectViewModel.GetDefaultRolesMultiSelectViewModels(listView, defaultRoles);

            Assert.IsTrue(result.Count == 1);
            Assert.AreEqual("Default role", result[0].Tooltip);
        }
    }
}