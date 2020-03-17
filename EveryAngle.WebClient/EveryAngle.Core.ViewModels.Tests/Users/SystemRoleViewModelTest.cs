using EveryAngle.Core.ViewModels.Tests;
using EveryAngle.Core.ViewModels.Users;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.User
{
    public class SystemRoleViewModelTest : UnitTestBase
    {
        #region private variables

        private SystemRoleViewModel _testingModel;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            base.Setup();

            //testing model
            _testingModel = new SystemRoleViewModel();

        }

        #endregion

        #region tests
        [TestCase("Configure", true, null)]
        [TestCase("Edit", true, true)]
        [TestCase("Deny", false, false)]
        [TestCase("Undefined", null, null)]
        public void Can_SetWorkbenchContentPrivileges(string privilege, bool? expected_content_configure, bool? expected_content_edit)
        {
            //execute
            _testingModel.SetModelingWorkbenchContentPrivilege(privilege);

            //assert
            Assert.AreEqual(_testingModel.ModelPrivilege.Privileges.configure_content, expected_content_configure);
            Assert.AreEqual(_testingModel.ModelPrivilege.Privileges.edit_content, expected_content_edit);
        }

        #endregion
    }
}