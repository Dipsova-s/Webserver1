using EveryAngle.Core.ViewModels.BusinessProcesses;
using Newtonsoft.Json;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class BusinessProcessViewModelTest : UnitTestBase
    {
        [TestCase]
        public void BusinessProcessViewModel_TEST()
        {
            //arrange
            BusinessProcessViewModel viewModel = new BusinessProcessViewModel
            {
                id = "P2P",
                name = "P2P",
                abbreviation = "P2P",
                order = 1,
                enabled = true,
                multi_lang_name = new List<MultilingualBusinessProcesses>()
            };

            //assert type
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.abbreviation.GetType(), typeof(string));
            Assert.AreEqual(viewModel.order.GetType(), typeof(int));
            Assert.AreEqual(viewModel.enabled.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.multi_lang_name.GetType(), typeof(List<MultilingualBusinessProcesses>));


            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("id"));
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("abbreviation"));
            Assert.IsTrue(viewModelSerialize.Contains("order"));
            Assert.IsTrue(viewModelSerialize.Contains("multi_lang_name"));
        }
    }
}
