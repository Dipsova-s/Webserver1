using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Core.ViewModels.Privilege;
using NUnit.Framework;
using System.Collections.Generic;
using System;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class UserProfileViewModelTest : UnitTestBase
    {
        #region private variables

        private UserProfileViewModel _testingModel;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            base.Setup();

            //testing model
            _testingModel = new UserProfileViewModel();

        }

        #endregion

        #region tests
        [TestCase(false, new bool[] { }, new bool[] { }, false)]
        [TestCase(true, new[] { true }, new[] { true }, true)]
        [TestCase(true, new[] { true }, new[] { false }, true)]
        [TestCase(true, new[] { false }, new[] { false }, false)]  //single model
        [TestCase(true, new[] { true, false }, new[] { true, false }, true)]
        [TestCase(true, new[] { true, true }, new[] { true, false }, true)]
        [TestCase(true, new[] { false, false }, new[] { false, false }, false)]  // two models
        [TestCase(true, new[] { false, false, false }, new[] { false, false, false }, false)]
        [TestCase(true, new[] { true, true, false, false }, new[] { false, true, false, false }, true)]  // multiple models
        public void Can_IsValidToManageModelingWorkbenchPrivilege(bool hasModelPrivilege, bool[] inputConfigureContent, bool[] inputEditContent, bool expectedResult)
        {
            //initialize
            _testingModel = new UserProfileViewModel();

            if (hasModelPrivilege)
            {
                _testingModel.ModelPrivileges = new List<ModelPrivilegeViewModel>();

                //arrange
                for (int i = 0; i < inputConfigureContent.Length; i++)
                {
                    ModelPrivilegeViewModel modelPrivilege = new ModelPrivilegeViewModel();
                    PrivilegesForModelViewModel privileges = new PrivilegesForModelViewModel();

                    privileges.configure_content = inputConfigureContent[i];
                    privileges.edit_content = inputEditContent[i];

                    modelPrivilege.Privileges = privileges;

                    _testingModel.ModelPrivileges.Add(modelPrivilege);
                }
            }

            //execute
            bool result = _testingModel.IsValidToManageModelingWorkbenchPrivilege();

            //assert
            Assert.AreEqual(result, expectedResult);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Can_IsValidToAccessWebClient(bool hasModelPrivilage)
        {
            _testingModel.ModelPrivileges = new List<ModelPrivilegeViewModel>
            {
                new ModelPrivilegeViewModel
                {
                    model = new Uri("/models/1", UriKind.Relative),
                    Privileges = new PrivilegesForModelViewModel
                    {
                        access_data_via_webclient=hasModelPrivilage
                    }
                }
            };
            //execute
            bool result = _testingModel.IsValidToAccessWebClient();

            //assert
            Assert.AreEqual(result, hasModelPrivilage);
        }

        [Test]
        public void Can_IsValidToAccessWebClient_When_ModelPrivileges_Null()
        {
            bool result = _testingModel.IsValidToAccessWebClient();

            //assert
            Assert.AreEqual(result, false);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Can_IsValidToManagementAccess(bool hasSystemPrivilage)
        {
            _testingModel.SystemPrivileges = new SystemPrivilegeViewModel
            {
                has_management_access = hasSystemPrivilage
            };
            //execute
            bool result = _testingModel.IsValidToManagementAccess();

            //assert
            Assert.AreEqual(result, hasSystemPrivilage);
        }

        [Test]
        public void Can_IsValidToManageModelPrivilege_When_ModelPrivileges_Null()
        {
            bool result = _testingModel.IsValidToManageModelPrivilege();

            //assert
            Assert.AreEqual(false, result);
        }

        [Test]
        public void Default_Value_Check_For_UserProfileViewModel()
        {
            Assert.AreEqual(null, _testingModel.Uri);
            Assert.AreEqual(string.Empty, _testingModel.ReanableIpAddresses);
            Assert.AreEqual(null, _testingModel.Ip);
            Assert.AreEqual(null, _testingModel.ModelPrivilegesUri);
        }
        #endregion
    }
}