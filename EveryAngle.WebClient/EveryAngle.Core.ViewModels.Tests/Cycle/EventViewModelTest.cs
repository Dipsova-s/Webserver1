using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.Users;
using Newtonsoft.Json;
using NUnit.Framework;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class EventViewModelTest : UnitTestBase
    {
        [TestCase]
        public void EventViewModel_TEST()
        {
            //arrange
            EventViewModel viewModel = new EventViewModel
            {
                id = "id",
                CreatedBy = new UserDateViewModel(),
                name = "name",
                description = "description",
                enabled = true,
                is_custom = true,
                model_specific = true,
                ChangedBy = new UserDateViewModel()
            };

            //assert type
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.CreatedBy.GetType(), typeof(UserDateViewModel));
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.description.GetType(), typeof(string));
            Assert.AreEqual(viewModel.enabled.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.is_custom.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.model_specific.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.ChangedBy.GetType(), typeof(UserDateViewModel));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("id"));
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("description"));
            Assert.IsTrue(viewModelSerialize.Contains("enabled"));
            Assert.IsTrue(viewModelSerialize.Contains("is_custom"));
            Assert.IsTrue(viewModelSerialize.Contains("model_specific"));
            Assert.IsTrue(viewModelSerialize.Contains("created"));
            Assert.IsTrue(viewModelSerialize.Contains("changed"));
        }
    }
}
