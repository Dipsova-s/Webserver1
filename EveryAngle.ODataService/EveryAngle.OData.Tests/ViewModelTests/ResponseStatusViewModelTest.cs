using EveryAngle.OData.ViewModel;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.ViewModelTests
{
    public class ResponseStatusViewModelTest : UnitTestBase
    {
        #region tests

        [TestCase]
        public void Should_Return_Null_When_Initial_With_Empty_Messages()
        {
            ResponseStatusViewModel responseStatusViewModel = new ResponseStatusViewModel();
            Assert.AreEqual(null, responseStatusViewModel.message);
            Assert.AreEqual(null, responseStatusViewModel.reason);
        }

        [TestCase]
        public void Should_Return_Correct_Value_When_Initial_With_Messages()
        {
            string expectedReason = "this is the reason";
            string expectedMessage = "this is the message";
            ResponseStatusViewModel responseStatusViewModel = new ResponseStatusViewModel(expectedReason, expectedMessage);

            Assert.AreEqual(expectedMessage, responseStatusViewModel.message);
            Assert.AreEqual(expectedReason, responseStatusViewModel.reason);
        }

        #endregion tests
    }
}