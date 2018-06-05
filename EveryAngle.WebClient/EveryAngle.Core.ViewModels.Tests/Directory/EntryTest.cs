using EveryAngle.Core.ViewModels.Directory;
using Newtonsoft.Json;
using NUnit.Framework;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class EntryTest : UnitTestBase
    {
        [TestCase]
        public void CommentViewModel_TEST()
        {
            //arrange
            Entry viewModel = new Entry
            {
                Name = "name"
            };

            //assert type
            Assert.AreEqual(viewModel.Name.GetType(), typeof(string));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("entry"));
        }
    }
}
