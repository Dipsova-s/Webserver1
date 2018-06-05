using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Users;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Test
{
    [TestFixture(Category = "MC")]
    public class UserServiceTest
    {
        private Mock<IUserService> service;

        private ListViewModel<UserViewModel> GetUsersMockData()
        {
            ListViewModel<UserViewModel> model = new ListViewModel<UserViewModel>();

            List<UserViewModel> users = new List<UserViewModel>();
            for (int index = 0; index < 50; index++)
            {
                UserViewModel user = new Core.ViewModels.Users.UserViewModel
                    {
                        Id = "testid" + index.ToString(),
                        Uri = new Uri("http://testuri.com/" + index.ToString()),
                        Fullname = "Fullname" + index.ToString(),
                        Enabled = true,
                        EnabledUntil = 1367393400,
                        RegisteredOn = DateTime.Now
                    };
                users.Add(user);
            }
            model.Data = users;


            return model;
        }

        private List<SystemRoleViewModel> GetSystemRoleMockData()
        {
            List<SystemRoleViewModel> roles = new List<SystemRoleViewModel>();
            for (int index = 0; index < 50; index++)
            {
                SystemRoleViewModel role = new Core.ViewModels.Users.SystemRoleViewModel
                {
                    Id = "testid" + index.ToString(),
                    Uri = new Uri("http://testuri.com/" + index.ToString()),
                    Consolidated_role = new Uri("http://testuri.com/" + index.ToString()),
                    Description = "Description",
                    TotalSubRole = 4,
                    ModelRole = "Model1",
                    Subrole_ids = new List<string> { "Subrole1", "Subrole2", "Subrole3", "Subrole4" }
                };
                roles.Add(role);
            }
            return roles;
        }

        private List<AuthenticatedUserViewModel> GetUserAuthenticatedMockData()
        {
            List<AuthenticatedUserViewModel> users = new List<AuthenticatedUserViewModel>();
            for (int index = 0; index < 50; index++)
            {
                AuthenticatedUserViewModel user = new AuthenticatedUserViewModel
                {
                    Name = "TestUser" + index.ToString(),
                    LastAuthenticated = 1367393400,
                    CreatedOn = DateTime.Now,
                    Uri = new Uri("http://testuri.com/" + index.ToString()),
                    UserUri = new Uri("http://testuri.com/" + index.ToString()),
                    Provider = "Provider"
                };
                users.Add(user);
            }
            return users;
        }

        [SetUp]
        public void Initialize()
        {
            service = new Mock<IUserService>();

            service
                .Setup(v => v.GetUsers(It.Is<string>(s => s == "TestGetUsers")))
                .Returns(GetUsersMockData())
                .Verifiable();

            service
                .Setup(v => v.GetUser(It.Is<string>(s => s == "TestGetUser")))
                .Returns(new UserViewModel
                {
                    Id = "TestGetUser",
                    Uri = new Uri("http://testuri.com/"),
                    Fullname = "Fullname",
                    Enabled = true,
                    EnabledUntil = 1367393400,
                    RegisteredOn = DateTime.Now
                })
                .Verifiable();

            service
                .Setup(v => v.GetUserSetting(It.Is<string>(s => s == "TestGetUserSetting")))
                .Returns(new UserSettingsViewModel
                {
                    compressed_bp_bar = true,
                    compressed_list_header = true,
                    sap_fields_in_chooser = true,
                    sap_fields_in_header = true,
                    default_language = "en"
                })
                .Verifiable();

            service
                .Setup(v => v.GetSystemRoles(It.Is<string>(s => s == "TestGetSystemRoles")))
                .Returns(GetSystemRoleMockData())
                .Verifiable();

            service
                .Setup(v => v.GetRole(It.Is<string>(s => s == "TestGetRole")))
                .Returns(new SystemRoleViewModel
                {
                    Id = "TestGetRole"
                })
                .Verifiable();

            service
                .Setup(v => v.GetUserAuthenticated(It.Is<string>(s => s == "TestGetUserAuthenticated")))
                .Returns(GetUserAuthenticatedMockData())
                .Verifiable();
        }

        [Test]
        public void TestGetUsers()
        {
            var users = service.Object.GetUsers("TestGetUsers");
            Assert.IsTrue(users.Data.Count == 50);
        }

        [Test]
        public void TestGetUser()
        {
            var user = service.Object.GetUser("TestGetUser");
            Assert.IsTrue(user.Id == "TestGetUser");
        }

        [Test]
        public void TestGetUserSetting()
        {
            var user = service.Object.GetUserSetting("TestGetUserSetting");
            Assert.IsTrue(user.default_language == "en");
        }

        [Test]
        public void GetSystemRoles()
        {
            var roles = service.Object.GetSystemRoles("TestGetSystemRoles");
            Assert.IsTrue(roles.Count == 50);
        }

        [Test]
        public void GetRole()
        {
            var role = service.Object.GetRole("TestGetRole");
            Assert.IsTrue(role.Id == "TestGetRole");
        }

        [Test]
        public void GetUserAuthenticated()
        {
            var users = service.Object.GetUserAuthenticated("TestGetUserAuthenticated");
            Assert.IsTrue(users.Count == 50);
        }
    }
}
