using EveryAngle.OData.ViewModel.Metadata;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.ViewModelTests
{
    public class MetadataProcessViewModelTest : UnitTestBase
    {
        #region test

        [TestCase]
        public void Metadata_ProcessView_Should_Return_Correct_Value()
        {
            MetadataProcessViewModel metadatProcessViewModel = new MetadataProcessViewModel();

            Assert.AreEqual(false, metadatProcessViewModel.check);
            Assert.AreEqual(false, metadatProcessViewModel.sync);

            metadatProcessViewModel.check = true;
            metadatProcessViewModel.sync = true;

            Assert.AreEqual(true, metadatProcessViewModel.check);
            Assert.AreEqual(true, metadatProcessViewModel.sync);
        }

        #endregion test
    }
}