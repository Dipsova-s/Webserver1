using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemLanguages;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Controllers;
using Kendo.Mvc;
using Kendo.Mvc.UI;
using Moq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Linq;
using System.Collections.Generic;
using System.ComponentModel;
using System.Web.Mvc;
using Newtonsoft.Json;
using EveryAngle.ManagementConsole.Models;
using System.Web;
using EveryAngle.Core.ViewModels.Label;
using EveryAngle.Core.ViewModels.BusinessProcesses;
using EveryAngle.Core.ViewModels.SystemCurrencies;
using EveryAngle.Core.ViewModels.Kendo;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class UserControllerTests : UnitTestBase
    {
        #region private variables

        private UsersController _testingController;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            base.Setup();

            // basic use for this controller
            sessionHelper.SetupGet(x => x.SystemSettings).Returns(GetMockViewModel<SystemSettingViewModel>());
            sessionHelper.SetupGet(x => x.Version).Returns(GetMockViewModel<VersionViewModel>());
            sessionHelper.SetupGet(x => x.CurrentUser).Returns(GetMockViewModel<UserViewModel>());
        }

        #endregion

        #region tests

        [TestCase("/users/1")]
        [TestCase("/users/2")]
        public void Can_GetAllUsers(string userUri)
        {
            // prepare
            sessionHelper.SetupGet(x => x.CurrentUser).Returns(new UserViewModel
            {
                Uri = new Uri(userUri, UriKind.Relative)
            });
            _testingController = GetTestController();

            // execute
            ActionResult result = _testingController.GetAllUsers();

            // assert
            Assert.IsTrue(_testingController.ViewBag.CurrentUser.EndsWith(userUri));
        }

        [TestCase("user1", "/users/1", null)]
        [TestCase("user2", "/users/2", "")]
        [TestCase("user3", "/users/3", "test")]
        public void Can_GetFilterUsers(string userId, string userUri, string query)
        {
            // prepare
            sessionHelper.SetupGet(x => x.CurrentUser).Returns(new UserViewModel
            {
                Id = userId,
                Uri = new Uri(userUri, UriKind.Relative)
            });
            _testingController = GetTestController();

            // execute
            _testingController.GetFilterUsers(query);

            // assert
            Assert.AreEqual(userId, _testingController.ViewBag.CurrentUserID);
            Assert.IsTrue(_testingController.ViewBag.CurrentUserUri.EndsWith(userUri));
            Assert.AreEqual(_testingController.ViewData["DefaultPageSize"], 30);
            Assert.AreEqual(query, _testingController.ViewBag.Query);
        }

        [TestCase(1, 5, "", null, null)]
        [TestCase(1, 5, "test", "Id", ListSortDirection.Ascending)]
        [TestCase(1, 5, "test", "Fullname", ListSortDirection.Descending)]
        [TestCase(1, 5, "test", "xxxx", ListSortDirection.Descending)]
        public void Can_ReadUsers(int page, int pageSize, string query, string sortField, ListSortDirection sortDirection)
        {
            // prepare
            DataSourceRequest request = new DataSourceRequest
            {
                Page = page,
                PageSize = pageSize,
                Sorts = new List<SortDescriptor>()
            };
            if (sortField != null)
            {
                request.Sorts.Add(new SortDescriptor { Member = sortField, SortDirection = sortDirection });
            }

            ListViewModel<UserViewModel> usersData = new ListViewModel<UserViewModel>
            {
                Data = new List<UserViewModel>
                {
                    new UserViewModel { Id = "user1" },
                    new UserViewModel { Id = "user2" }
                },
                Header = new HeaderViewModel { Total = 2 }
            };
            userService.Setup(x => x.GetUsers(It.IsAny<string>())).Returns(usersData);

            _testingController = GetTestController();

            // execute
            JsonResult result = _testingController.ReadUsers(request, query) as JsonResult;
            DataSourceResult dataSourceResult = result.Data as DataSourceResult;
            List<UserViewModel> viewmodels = dataSourceResult.Data as List<UserViewModel>;
            int count = dataSourceResult.Total;

            // assert
            Assert.IsNotNull(result);
            Assert.IsNotNull(dataSourceResult);
            Assert.IsNotNull(viewmodels);
            Assert.AreEqual(count, viewmodels.Count);
        }

        [Test]
        public void Can_GetSystemProvider()
        {
            // prepare
            SetupGetSystemAuthenticationProviders();
            _testingController = GetTestController();

            // execute
            JsonResult result = _testingController.GetSystemProvider() as JsonResult;
            JObject data = JObject.FromObject(result.Data);
            string defaultProvider = data["default_provider"].ToString();
            int providerCount = data["providers"].ToArray().Length;

            // assert
            Assert.AreEqual(sessionHelper.Object.SystemSettings.DefaultAuthenticationProvider, defaultProvider);
            Assert.AreEqual(3, providerCount);
        }

        [TestCase("/system/authenticationproviders/x/users", false, 0, 0)]
        [TestCase("/system/authenticationproviders/1/users", true, 1, 3)]
        public void Can_GetNewUsers(string usersUri, bool canAccessSystemRoles, int expectedDefaultRoles, int expectedSystemRoles)
        {
            // prepare
            string fullUsersUri = new Uri(host + usersUri).ToString();
            if (!canAccessSystemRoles)
            {
                Entry systemRoleEntry = sessionHelper.Object.Version.Entries.First(x => x.Name == "system_roles");
                sessionHelper.Object.Version.Entries.Remove(systemRoleEntry);
            }
            SetupGetSystemAuthenticationProviders();
            SetupGetSystemRoles();
            SetupGetModel();
            _testingController = GetTestController();

            // execute
            ActionResult result = _testingController.GetNewUsers(fullUsersUri);
            var defaultRoles = JsonConvert.DeserializeObject<IList<KendoMultiSelectViewModel>>(_testingController.ViewData["DefaultRoles"] as string);
            var systemRoles = JsonConvert.DeserializeObject<IList<KendoMultiSelectViewModel>>(_testingController.ViewData["SystemRoles"] as string);

            // assert
            Assert.AreEqual(expectedDefaultRoles, defaultRoles.Count);
            Assert.AreEqual(expectedSystemRoles, systemRoles.Count);
            Assert.AreEqual(fullUsersUri, _testingController.ViewData["SystemAuthenticationProviderUri"] as string);
        }

        [TestCase("/system/authenticationproviders/1")]
        [TestCase("/system/authenticationproviders/2")]
        public void Can_RenderImportUserGrid(string providerUri)
        {
            // prepare
            _testingController = GetTestController();

            // execute
            ActionResult result = _testingController.RenderImportUserGrid(providerUri);

            // assert
            Assert.AreEqual(_testingController.ViewBag.SystemAuthenticationProviderUri, providerUri);
        }

        [Test]
        public void Can_ReadAvailableUsers()
        {
            // prepare
            ListViewModel<AuthenticationProviderUserViewModel> userData = new ListViewModel<AuthenticationProviderUserViewModel>
            {
                Header = new HeaderViewModel { Total = 2, Total_is_truncated_by_size_limit = true },
                Data = new List<AuthenticationProviderUserViewModel>
                {
                    new AuthenticationProviderUserViewModel { Id = "user1", Uri = new Uri("1", UriKind.Relative) },
                    new AuthenticationProviderUserViewModel { Id = "user2", Uri = new Uri("2", UriKind.Relative) }
                }
            };
            userService.Setup(x => x.GetUnableUsers(It.IsAny<string>())).Returns(userData);
            _testingController = GetTestController();

            // execute
            JsonResult result = _testingController.ReadAvailableUsers("", "") as JsonResult;
            UsersDataSourceResult dataSourceResult = result.Data as UsersDataSourceResult;
            List<AuthenticationProviderUserViewModel> viewmodels = dataSourceResult.Data as List<AuthenticationProviderUserViewModel>;
            int count = dataSourceResult.Total;
            bool truncated = dataSourceResult.TotalTruncated;

            // assert
            Assert.IsNotNull(result);
            Assert.IsNotNull(dataSourceResult);
            Assert.IsNotNull(viewmodels);
            Assert.AreEqual(count, viewmodels.Count);
            Assert.IsTrue(truncated);
        }

        [TestCase(false)]
        [TestCase(true)]
        public void Can_AddUser(bool isError)
        {
            // prepare
            string rolesData = "[]";
            AuthenticationProviderUserViewModel userData = new AuthenticationProviderUserViewModel { Uri = new Uri("", UriKind.Relative) };
            userService.Setup(x => x.GetUserAuthentication(It.IsAny<string>())).Returns(userData);
            userService.Setup(x => x.UpdateUser(It.IsAny<string>(), It.IsAny<string>())).Returns(JsonConvert.SerializeObject(userData));
            if (isError)
                userService.Setup(x => x.UpdateUserRole(It.IsAny<string>(), It.IsAny<string>())).Throws(new HttpException(400, "400 error"));
            else
                userService.Setup(x => x.UpdateUserRole(It.IsAny<string>(), It.IsAny<string>())).Returns(string.Empty);
            _testingController = GetTestController();

            // execute + assert
            if (isError)
            {
                HttpException ex = Assert.Throws<HttpException>(() => _testingController.AddUser("", rolesData));
                Assert.IsTrue(ex.Message.Contains("User has been created but no the roles were assigned."));
            }
            else
            {
                _testingController.AddUser("", rolesData);
                Assert.Pass();
            }
        }

        [Test]
        public void Can_GetRolesID()
        {
            // prepare
            SetupGetSystemRoles();
            SetupGetModel();
            _testingController = GetTestController();

            // execute
            JsonResult result = _testingController.GetRolesID() as JsonResult;
            var dataSourceResult = result.Data as List<RoleKendoMultiSelectViewModel>;

            // assert
            Assert.AreEqual("SYSTEM_ALL", dataSourceResult[0].Text);
            Assert.AreEqual("EA2_800_ALL", dataSourceResult[1].Text);
            Assert.AreEqual("EA2_800_BASIC", dataSourceResult[2].Text);

            Assert.AreEqual("SYSTEM_ALL", dataSourceResult[0].Value);
            Assert.AreEqual("EA2_800:EA2_800_ALL", dataSourceResult[1].Value);
            Assert.AreEqual("EA2_800:EA2_800_BASIC", dataSourceResult[2].Value);

            Assert.AreEqual("System role", dataSourceResult[0].Tooltip);
            Assert.AreEqual("EA2_800 model role", dataSourceResult[1].Tooltip);
            Assert.AreEqual("EA2_800 model role", dataSourceResult[2].Tooltip);
        }

        [TestCase("")]
        [TestCase("/system/authenticationproviders/1")]
        public void Can_EditUser(string providerUrl)
        {
            // prepare
            string userUri = "/users/1";
            UserViewModel user = GetMockViewModel<UserViewModel>();
            user.Uri = new Uri(userUri, UriKind.Relative);
            user.AuthenticationProvider = new Uri(providerUrl, UriKind.Relative);
            user.AssignedRoles = new List<AssignedRoleViewModel>
            {
                new AssignedRoleViewModel { RoleId = "SYSTEM_ALL" },
                new AssignedRoleViewModel { RoleId = "EA2_800_ALL", ModelId = "EA2_800" }
            };
            userService.Setup(x => x.GetUser(It.IsAny<string>())).Returns(user);

            SetupGetUserSetting();
            SetupGetSystemAuthenticationProviders();
            SetupGetSystemRoles();
            SetupGetModel();
            sessionHelper.SetupGet(x => x.Models).Returns(GetMockViewModel<List<ModelViewModel>>());
            labelService.Setup(x => x.GetLabels(It.IsAny<string>())).Returns(new ListViewModel<LabelViewModel> { Data = new List<LabelViewModel>() });

            _testingController = GetTestController();

            // execute
            ActionResult result = _testingController.EditUser(userUri);
            List<string> assignedRoles = ((List<SystemRoleViewModel>)_testingController.ViewData["AssignedRoles"]).Select(x => x.Id).ToList();
            List<string> availableRoles = ((List<SystemRoleViewModel>)_testingController.ViewData["AvailableRoles"]).Select(x => x.Id).ToList();
            List<string> authenticationProvidersList = (List<string>)_testingController.ViewData["AuthenticationProvidersList"];

            // assert
            Assert.AreEqual(userUri, _testingController.ViewBag.UserUri);
            Assert.AreEqual(new List<string> { "SYSTEM_ALL", "EA2_800_ALL" }, assignedRoles);
            Assert.AreEqual(new List<string> { "EA2_800_BASIC" }, availableRoles);
            Assert.AreEqual(new List<string> { "local", "THEATST", "ADFS", "XXX" }, authenticationProvidersList);
            Assert.AreEqual("[]", _testingController.ViewData["BusinessProcesses"]);
            Assert.AreEqual("All_Users", _testingController.ViewBag.CommentType);
        }

        [Test]
        public void Can_AssignedRolesGrid()
        {
            // prepare
            _testingController = GetTestController();

            // execute
            ActionResult result = _testingController.AssignedRolesGrid("/users/1", null);

            // assert
            Assert.AreEqual("/users/1", _testingController.ViewBag.UserUri);
        }

        [TestCase("", false)]
        [TestCase("role1", true)]
        [TestCase("role1", null)]
        public void Can_SaveEditUser(string roleId, bool? sessionNeedsUpdate)
        {
            // prepare
            userService.Setup(x => x.GetUser(It.IsAny<string>())).Returns(GetMockViewModel<UserViewModel>());
            userService.Setup(x => x.UpdateUserSetting(It.IsAny<string>(), It.IsAny<string>()));

            string updateUserResponse = JsonConvert.SerializeObject(new { session_needs_update = sessionNeedsUpdate });
            userService.Setup(x => x.UpdateUser(It.IsAny<string>(), It.IsAny<string>())).Returns(updateUserResponse);

            string rolesData = roleId == "" ? null : JsonConvert.SerializeObject(new
            {
                assigned_roles = new List<dynamic> { new { role_id = roleId } }
            });

            string userData = JsonConvert.SerializeObject(new
            {
                enabled = true,
                enabled_until = 1234567890,
                default_business_processes = new string[] { "P2P" }
            });

            _testingController = GetTestController();

            // execute
            JsonResult result = _testingController.SaveEditUser(rolesData, userData, "/users/1") as JsonResult;
            JObject data = JObject.FromObject(result.Data);
            bool resultSessionNeedsUpdate = (bool)data["session_needs_update"];
            bool expectSessionNeedsUpdate = sessionNeedsUpdate ?? false;

            // assert
            Assert.IsNotNull(result);
            Assert.AreEqual(expectSessionNeedsUpdate, resultSessionNeedsUpdate);
        }

        [Test]
        public void Gan_GetAllSessions()
        {
            // prepare
            _testingController = GetTestController();

            // execute
            ActionResult result = _testingController.GetAllSessions();

            // assert
            Assert.AreEqual(sessionHelper.Object.CurrentUser.Uri.ToString(), _testingController.ViewBag.CurrentUserUri);
        }

        [Test]
        public void Gan_GetFilterSessions()
        {
            // prepare
            string query = "test";
            _testingController = GetTestController();

            // execute
            ActionResult result = _testingController.GetFilterSessions(query);

            // assert
            Assert.AreEqual(30, _testingController.ViewData["DefaultPageSize"]);
            Assert.AreEqual(query, _testingController.ViewBag.Query);
        }

        [TestCase("UserID")]
        [TestCase("ReanableIpAddresses")]
        [TestCase("IsActive")]
        [TestCase("Created")]
        [TestCase("ExpirationTime")]
        [TestCase("Ip")]
        public void Can_ReadSessions(string sortId)
        {
            // prepare
            DataSourceRequest dataSource = new DataSourceRequest
            {
                Page = 0,
                PageSize = 30,
                Sorts = new List<SortDescriptor> { new SortDescriptor { Member = sortId } }
            };

            SessionViewModel currentSession = new SessionViewModel { Id = "1", UserUri = new Uri("users/1", UriKind.Relative) };
            List<SessionViewModel> sessions = new List<SessionViewModel>
            {
                currentSession,
                new SessionViewModel { Id = "2", UserUri = new Uri("users/2", UriKind.Relative) }
            };
            sessionService.Setup(x => x.GetSessions(It.IsAny<string>())).Returns(new ListViewModel<SessionViewModel>
            {
                Data = sessions,
                Header = new HeaderViewModel { Total = 100 }
            });
            sessionHelper.SetupGet(x => x.Session).Returns(currentSession);
            _testingController = GetTestController();

            // execute
            JsonResult result = _testingController.ReadSessions(dataSource, "") as JsonResult;
            DataSourceResult dataSourceResult = result.Data as DataSourceResult;
            List<SessionViewModel> viewmodels = dataSourceResult.Data as List<SessionViewModel>;

            // assert
            Assert.AreEqual(2, viewmodels.Count);
            Assert.AreEqual(true, viewmodels[0].IsCurrentLogedInSession);
            Assert.AreEqual("local\\EAAdmin", viewmodels[0].UserID);
            Assert.AreEqual(false, viewmodels[1].IsCurrentLogedInSession);
            Assert.AreEqual("...", viewmodels[1].UserID);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Can_GetUserDefaultSetting(bool hasSettings)
        {
            // prepare
            UserSettingsViewModel defaultUserSettings = hasSettings ? GetMockViewModel<UserSettingsViewModel>() : new UserSettingsViewModel
            {
                client_settings = "{}",
            };
            userService.Setup(x => x.GetUserSetting(It.IsAny<string>())).Returns(defaultUserSettings);

            ListViewModel<SystemLanguageViewModel> systemLanguages = new ListViewModel<SystemLanguageViewModel>
            {
                Data = new List<SystemLanguageViewModel>
                {
                    new SystemLanguageViewModel { Id = "en", Name = "English" },
                    new SystemLanguageViewModel { Id = "th", Name = "Thai" }
                }
            };
            globalSettingService.Setup(x => x.GetSystemLanguages(It.IsAny<string>())).Returns(systemLanguages);

            List<BusinessProcessViewModel> businessProcesses = new List<BusinessProcessViewModel>
            {
                 new BusinessProcessViewModel { id = "P2P", abbreviation = "P2P" }
            };
            globalSettingService.Setup(x => x.GetBusinessProcesses(It.IsAny<string>())).Returns(businessProcesses);

            List<CurrenciesViewModel> systemCurrencies = new List<CurrenciesViewModel>
            {
                new CurrenciesViewModel { id = "EUR", enabled = true },
                new CurrenciesViewModel { id = "THB", enabled = false }
            };
            globalSettingService.Setup(x => x.GetSystemCurrencies(It.IsAny<string>())).Returns(systemCurrencies);

            _testingController = GetTestController();

            // execute
            ActionResult result = _testingController.GetUserDefaultSetting();

            // assert
            Assert.AreEqual(2, ((List<SystemLanguageViewModel>)_testingController.ViewData["Languages"]).Count);
            Assert.AreEqual(1, ((List<BusinessProcessViewModel>)_testingController.ViewData["BusinessProcesses"]).Count);
            Assert.AreEqual(1, ((List<CurrenciesViewModel>)_testingController.ViewData["DefaultCurrency"]).Count);
        }

        #endregion

        #region private

        private UsersController GetTestController()
        {
            return new UsersController(userService.Object, modelService.Object, sessionService.Object, globalSettingService.Object, labelService.Object, sessionHelper.Object);
        }

        private void SetupGetSystemAuthenticationProviders()
        {
            IEnumerable<SystemAuthenticationProviderViewModel> authenticationProviders = GetMockViewModel<IEnumerable<SystemAuthenticationProviderViewModel>>();
            userService.Setup(x => x.GetSystemAuthenticationProviders(It.IsAny<string>())).Returns(authenticationProviders);
        }

        private void SetupGetSystemRoles()
        {
            List<SystemRoleViewModel> systemRoles = GetMockViewModel<List<SystemRoleViewModel>>();
            modelService.Setup(x => x.GetSystemRoles(It.IsAny<string>())).Returns(systemRoles);
        }

        private void SetupGetUserSetting()
        {
            UserSettingsViewModel userSetting = GetMockViewModel<UserSettingsViewModel>();
            userService.Setup(x => x.GetUserSetting(It.IsAny<string>())).Returns(userSetting);
        }

        private void SetupGetModel()
        {
            modelService.Setup(x => x.GetModel(It.IsAny<string>())).Returns(new ModelViewModel { id = "EA2_800" });
        }

        #endregion
    }
}
