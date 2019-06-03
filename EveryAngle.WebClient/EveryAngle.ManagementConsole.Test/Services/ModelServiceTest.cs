using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Utilities;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Services.Test
{
    [TestFixture(Category = "MC")]
    public class ModelServiceTest
    {
        private Mock<IModelService> service;

        private List<ModelViewModel> GetModelsMockData()
        {
            List<ModelViewModel> models = new List<ModelViewModel>();
            for (int index = 0; index < 50; index++)
            {
                ModelViewModel model = new ModelViewModel
                {
                    id = "testid" + index.ToString(),
                    abbreviation = "abbreviation" + index.ToString(),
                    short_name = "short_name" + index.ToString()
                };
                models.Add(model);
            }
            return models;
        }

        private readonly Random rnd = new Random();
        private const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        private string RandomString(int size)
        {
            char[] buffer = new char[size];

            for (int i = 0; i < size; i++)
            {
                buffer[i] = chars[rnd.Next(chars.Length)];
            }
            return new string(buffer);
        }

        private List<string> GetClassesMockData()
        {
            List<string> classes = new List<string>();
            for (int index = 0; index < 50; index++)
            {
                classes.Add(RandomString(8));
            }
            return classes;
        }

        private List<EventLogViewModel> GetEventLogMockData()
        {
            List<EventLogViewModel> models = new List<EventLogViewModel>();
            for (int index = 0; index < 50; index++)
            {
                EventLogViewModel model = new EventLogViewModel
                {
                    Uri = new Uri("http://testuri.com/" + index.ToString()),
                    version = "version" + index.ToString(),
                    error_count = "error_count" + index.ToString(),
                    size = "size" + index.ToString(),
                    status = "up",
                    timestamp = DateTimeUtils.ToUnixTime(DateTime.Now)
                };
                models.Add(model);
            }
            return models;
        }

        private ListViewModel<ModelServerViewModel> GetModelServersMockData()
        {
            ListViewModel<ModelServerViewModel> modelServers = new ListViewModel<ModelServerViewModel>();
            modelServers.Data = new List<ModelServerViewModel>();
            for (int index = 0; index < 50; index++)
            {
                ModelServerViewModel modelServer = new ModelServerViewModel
                {
                    id = "testid" + index.ToString(),
                    Uri = new Uri("http://testuri.com/" + index.ToString()),
                    model = new Uri("http://testuri.com/" + index.ToString()),
                    type = "type" + index.ToString(),
                    status = "up",
                    timestamp = 1379997058,
                    application_version = "version" + index.ToString(),
                    size = "size" + index.ToString(),
                    error_count = "0",
                    warning_count = "0",
                    server_uri = "http://testuri.com/" + index.ToString(),
                    event_log = new Uri("http://testuri.com/" + index.ToString()),
                    instance = new Uri("http://testuri.com/" + index.ToString())
                };
                modelServers.Data.Add(modelServer);
            }
            return modelServers;
        }

        private List<SystemRoleViewModel> GetSystemRolesMockData()
        {
            List<SystemRoleViewModel> SystemRoles = new List<SystemRoleViewModel>();
            for (int index = 0; index < 50; index++)
            {
                SystemRoleViewModel modelServer = new SystemRoleViewModel
                {
                    Id = "SystemRolesId" + index.ToString(),
                    Description = "Description",
                    Uri = new Uri("http://testuri.com/" + index.ToString()),
                    Subrole_ids = new List<string> { "Subrole1", "Subrole2", "Subrole3" },
                    Consolidated_role = new Uri("http://testuri.com/" + index.ToString()),
                    ModelRole = "Model" + index.ToString(),
                    TotalSubRole = index
                };
                SystemRoles.Add(modelServer);
            }
            return SystemRoles;
        }

        private ListViewModel<SystemRoleViewModel> GetRolesMockData()
        {
            List<SystemRoleViewModel> roles = new List<SystemRoleViewModel>();
            for (int index = 0; index < 50; index++)
            {
                SystemRoleViewModel modelServer = new SystemRoleViewModel
                {
                    Id = "SystemRolesId" + index.ToString(),
                    Description = "Description",
                    Uri = new Uri("http://testuri.com/" + index.ToString()),
                    Consolidated_role = new Uri("http://testuri.com/" + index.ToString()),
                    SubRolesUri = new Uri("http://testuri.com/" + index.ToString())
                };
                roles.Add(modelServer);
            }

            ListViewModel<SystemRoleViewModel> result = new ListViewModel<SystemRoleViewModel>();
            result.Data = roles;
            return result;
        }
        
        [SetUp]
        public void Initialize()
        {
            service = new Mock<IModelService>();
            service
                .Setup(v => v.GetModel(It.Is<string>(s => s == "TestGetModel")))
                .Returns(new ModelViewModel
                {
                    id = "TestGetModel",
                    abbreviation = "testabbreviation"
                })
                .Verifiable();

            service
                .Setup(v => v.GetModels(It.Is<string>(s => s == "TestGetModels")))
                .Returns(GetModelsMockData())
                .Verifiable();

            service
                .Setup(v => v.GetClassesId(It.Is<string>(s => s == "TestGetClasses")))
                .Returns(GetClassesMockData())
                .Verifiable();

            service
                .Setup(v => v.GetEventLog(It.Is<string>(s => s == "TestGetEventLog")))
                .Returns(GetEventLogMockData())
                .Verifiable();

            service
                .Setup(v => v.GetModelServers(It.Is<string>(s => s == "TestGetModelServers")))
                .Returns(GetModelServersMockData())
                .Verifiable();

            service
                .Setup(v => v.GetSystemRoles(It.Is<string>(s => s == "TestGetSystemRoles")))
                .Returns(GetSystemRolesMockData())
                .Verifiable();

            service
                .Setup(v => v.GetRoles(It.Is<string>(s => s == "TestGetRoles")))
                .Returns(GetRolesMockData())
                .Verifiable();
        }

        [Test]
        public void TestGetModel()
        {
            var model = service.Object.GetModel("TestGetModel");
            Assert.IsTrue(model.id == "TestGetModel");
        }

        [Test]
        public void TestGetModels()
        {
            var models = service.Object.GetModels("TestGetModels");
            Assert.IsTrue(models.Count == 50);
        }

        [Test]
        public void TestGetClasses()
        {
            var classes = service.Object.GetClassesId("TestGetClasses");
            Assert.IsTrue(classes.Count == 50);
        }

        [Test]
        public void TestGetEventLog()
        {
            var eventlogs = service.Object.GetEventLog("TestGetEventLog");

            Assert.IsTrue(eventlogs.Count == 50);
        }


        [Test]
        public void TestGetModelServers()
        {
            var modelServers = service.Object.GetModelServers("TestGetModelServers");
            Assert.IsTrue(modelServers.Data.Count == 50);
        }

        [Test]
        public void TestGetSystemRoles()
        {
            var systemRoles = service.Object.GetSystemRoles("TestGetSystemRoles");
            Assert.IsTrue(systemRoles.Count == 50);
        }

        [Test]
        public void TestGetRoles()
        {
            var roles = service.Object.GetRoles("TestGetRoles");
            Assert.IsTrue(roles.Data.Count == 50);
        }
    }
}
