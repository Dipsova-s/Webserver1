using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class AgentModelInfoViewModelTest : UnitTestBase
    {
        [TestCase]
        public void ActionListViewModel_TEST()
        {
            //arrange
            AgentModelInfoViewModel viewModel = new AgentModelInfoViewModel
            {
                id = "id",
                name = "name",
                application_type = "application",
                host_name = "host",
                uris = new List<string>(),
                is_active = true
            };

            //assert type
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.application_type.GetType(), typeof(string));
            Assert.AreEqual(viewModel.host_name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.uris.GetType(), typeof(List<string>));
            Assert.AreEqual(viewModel.is_active.GetType(), typeof(bool));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("id"));
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("application_type"));
            Assert.IsTrue(viewModelSerialize.Contains("host_name"));
            Assert.IsTrue(viewModelSerialize.Contains("uris"));
            Assert.IsTrue(viewModelSerialize.Contains("is_active"));
        }
    }
}
