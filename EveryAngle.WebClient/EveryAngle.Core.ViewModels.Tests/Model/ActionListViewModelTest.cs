using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class ActionListViewModelTest : UnitTestBase
    {
        [TestCase]
        public void ActionListViewModel_TEST()
        {
            //arrange
            ActionListViewModel viewModel = new ActionListViewModel
            {
                id = "id",
                name = "name",
                description = "description",
                has_parameters = true,
                actions = new List<string>(),

            };

            //assert type
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.description.GetType(), typeof(string));
            Assert.AreEqual(viewModel.has_parameters.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.actions.GetType(), typeof(List<string>));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("id"));
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("description"));
            Assert.IsTrue(viewModelSerialize.Contains("has_parameters"));
            Assert.IsTrue(viewModelSerialize.Contains("actions"));
        }
    }
}
