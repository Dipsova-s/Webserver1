using EveryAngle.OData.BusinessLogic.Implements.Authorizations;
using EveryAngle.OData.DTO.Model;
using EveryAngle.OData.Proxy;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.OData.Tests.BusinessLogicTests
{
    [TestFixture(Category = "OdataAuthorizations")]
    public class OdataAuthorizationsTest : UnitTestBase
    {
        #region private variables

        private OdataAuthorizations _testingBusinessLogic;
        private User _testingUser;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            InitialMockData();
        }

        private void InitialMockData()
        {
            _testingBusinessLogic = new OdataAuthorizations();
            _testingUser = new User();
            _testingUser.ModelPrivileges = new ModelPrivilegeListViewModel();
            _testingUser.ModelPrivileges.model_privileges = new List<ModelPrivilegeViewModel>();
            ModelPrivilegeViewModel modelPvls = new ModelPrivilegeViewModel();
            modelPvls.privileges = new PrivilegesForModelViewModel();
            modelPvls.privileges.access_data_via_odata = false;

            _testingUser.ModelPrivileges.model_privileges.Add(modelPvls);

            List<AssignedRolesViewModel> roles = new List<AssignedRolesViewModel>();
            AssignedRolesViewModel role = new AssignedRolesViewModel();
            role.model_id = "EA2_800";
            role.role_id = "1";
            roles.Add(role);
            modelPvls.roles = roles;
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_AccessOdataWebsite()
        {
            _testingUser.ModelPrivileges.model_privileges[0].privileges.access_data_via_odata = true;
            Assert.IsTrue(_testingBusinessLogic.MayView(_testingUser));
        }


        [TestCase]
        public void Cannot_AccessOdataWebsite_When_User_HaveTheRight_For_DifferentModel()
        {
            _testingUser.ModelPrivileges.model_privileges[0].privileges.access_data_via_odata = true;
            _testingUser.ModelPrivileges.model_privileges[0].roles[0].model_id = "EA3_800";
            Assert.IsFalse(_testingBusinessLogic.MayView(_testingUser));
        }

        [TestCase]
        public void Cannot_AccessOdataWebsite_When_PrivilegesIsFalse()
        {
            _testingUser.ModelPrivileges.model_privileges[0].privileges.access_data_via_odata = false;
            Assert.IsFalse(_testingBusinessLogic.MayView(_testingUser));
        }

        [TestCase]
        public void Cannot_AccessOdataWebsite_When_PrivilegesIsNull()
        {
            _testingUser.ModelPrivileges.model_privileges[0].privileges.access_data_via_odata = null;
            Assert.IsFalse(_testingBusinessLogic.MayView(_testingUser));
        }

        [TestCase]
        public void Cannot_AccessOdataWebsite_When_NoModelPrivilges()
        {
            _testingUser.ModelPrivileges.model_privileges = null;
            Assert.IsFalse(_testingBusinessLogic.MayView(_testingUser));
        }

        #endregion
    }
}
