using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.Shared.Globalization;
using Kendo.Mvc;
using Kendo.Mvc.UI;
using Moq;
using NUnit.Framework;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Web.UI.WebControls;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class SystemRoleControllerTest : UnitTestBase
    {
        #region private variables

        private SystemRoleController testController;
        
        #endregion

        #region setup / teardown

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            // session helper
            authorizationHelper.SetupGet(x => x.Session).Returns(GetMockViewModel<SessionViewModel>());

            // initial controller
            testController = new SystemRoleController(
                modelService.Object, globalSettingService.Object, sessionService.Object, userService.Object, authorizationHelper.Object);
        }

        #endregion

        #region tests

        [Test]
        public void Can_GetRolesDropdown()
        {
            // mock
            List<SystemRoleViewModel> systemRoles = GetMockViewModel<List<SystemRoleViewModel>>();
            modelService.Setup(x => x.GetSystemRoles(It.IsAny<string>())).Returns(systemRoles);
            
            // execute
            JsonResult result = (JsonResult)testController.GetRolesDropdown();
            IList data = (IList)result.Data;

            // assert
            Assert.AreEqual(data.Count, 3);
        }

        [TestCase(4, "http://th-eatst01.everyangle.org:30500//system/roles", 30, true)]
        [TestCase(4, null, null, false)]
        public void Can_GetAllSystemRoles(int providerSize, string systemRoleUri, int? defaultPageSize, bool hasSystemRoles)
        {
            // mock
            IEnumerable<SystemAuthenticationProviderViewModel> systemAuthenticationProviders = GetMockViewModel<IEnumerable<SystemAuthenticationProviderViewModel>>();
            userService.Setup(x => x.GetSystemAuthenticationProviders(It.IsAny<string>())).Returns(systemAuthenticationProviders);

            // remove system_roles for access denied
            if (!hasSystemRoles)
            {
                authorizationHelper.Object.Version.Entries = authorizationHelper.Object.Version.Entries.Where(x => x.Name != "system_roles").ToList();
            }
            
            // execute
            testController.GetAllSystemRoles();
            IList authenticationProviders = (IList)testController.ViewBag.AuthenticationProviders;

            // assert
            Assert.AreEqual(providerSize, authenticationProviders.Count);
            Assert.AreEqual(systemRoleUri, testController.ViewBag.SystemRoleUri);
            Assert.AreEqual(defaultPageSize, testController.ViewData["DefaultPageSize"]);

            // assert for access denied
            if (!hasSystemRoles)
            {
                Assert.AreEqual(403, testController.ViewBag.ErrorCode);
                Assert.AreEqual(Resource.MC_AccessDenied, testController.ViewBag.ErrorMessage);
            }
        }

        [TestCase("http://th-eatst01.everyangle.org:30500//system/roles", "keyword")]
        [TestCase("", "")]
        public void Can_ReadSystemRoles(string systemRoleUri, string q)
        {
            // mock
            DataSourceRequest dataSourceRequest = new DataSourceRequest
            {
                Page = 1,
                PageSize = 10,
                Sorts = new List<SortDescriptor>
                {
                    new SortDescriptor
                    {
                        Member = "test01",
                        SortDirection = System.ComponentModel.ListSortDirection.Descending
                    }
                }
            };
            List<SystemRoleViewModel> systemRolesViewModel = GetMockViewModel<List<SystemRoleViewModel>>();
            ListViewModel<SystemRoleViewModel> systemRoleslistViewModel = new ListViewModel<SystemRoleViewModel>
            {
                Data = systemRolesViewModel,
                Header = new HeaderViewModel
                {
                    Total = 3
                }
            };
            globalSettingService.Setup(x => x.GetSystemRoles(It.IsAny<string>())).Returns(systemRoleslistViewModel);

            // execute
            JsonResult result = (JsonResult)testController.ReadSystemRoles(dataSourceRequest, systemRoleUri, q);
            DataSourceResult dataSourceResult = (DataSourceResult)result.Data;

            // assert
            Assert.IsNotNull(result);
            Assert.IsNotNull(dataSourceResult);
            Assert.AreEqual(3, dataSourceResult.Total);
        }

        [TestCase("http://th-eatst01.everyangle.org:30500//system/roles")]
        [TestCase("")]
        public void Can_EditSystemRole(string systemRoleUri)
        {
            // execute
            PartialViewResult result = (PartialViewResult)testController.EditSystemRole(systemRoleUri);

            // assert
            Assert.AreEqual("Global_Roles", result.ViewBag.CommentType);
        }

        [TestCase("http://th-eatst01.everyangle.org:30500//system/roles")]
        [TestCase("")]
        public void Can_SaveSystemRole(string systemRoleUri)
        {
            // mock
            SystemRoleViewModel systemRoleViewModel = GetMockViewModel<List<SystemRoleViewModel>>().FirstOrDefault();
            modelService.Setup(x => x.CreateRole(It.IsAny<string>(), It.IsAny<string>())).Returns(systemRoleViewModel);

            // execute
            JsonResult result = (JsonResult)testController.SaveSystemRole(systemRoleUri, string.Empty);

            // assert
            Assert.IsNotNull(result);
            Assert.IsNotNull(result.Data);
            
        }

        [TestCase("http://th-eatst01.everyangle.org:30500//system/roles")]
        [TestCase("")]
        public void Can_DeleteSystemRole(string systemRoleUri)
        {
            // mock
            modelService.Setup(x => x.DeleteRole(It.IsAny<string>()));

            // execute
            JsonResult result = (JsonResult)testController.DeleteSystemRole(systemRoleUri);

            // assert
            Assert.IsNotNull(result);
            Assert.IsNotNull(result.Data);
        }
        #endregion

    }
}
