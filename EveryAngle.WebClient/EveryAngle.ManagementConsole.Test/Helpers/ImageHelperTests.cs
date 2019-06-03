using EveryAngle.ManagementConsole.Helpers;
using NUnit.Framework;
using System;
using System.Drawing;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class ImageHelperTests : UnitTestBase
    {
        #region private variables

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            InitiateTestingContext();
            base.Setup();
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_Execute_RenameFile()
        {
            ImageHelper.RenameFile("mock", "mock_new", 500, "\\");
        }

        [TestCase]
        public void Can_Execute_RenameUploadFile()
        {
            Assert.IsFalse(ImageHelper.RenameUploadFile(null, "mock", "/mock", 0));
        }

        [TestCase]
        public void Can_Execute_RenameUploadLogo()
        {
            Assert.IsFalse(ImageHelper.RenameUploadFile(null, "mock", "/mock", 0));
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Can_Execute_ScaleBySize(bool isLogo)
        {
            string testFilePath = AppDomain.CurrentDomain.BaseDirectory + "TestResources\\test_image.png";
            using (Image image = Image.FromFile(testFilePath))
            {
                ImageHelper.ScaleBySize(image, 100, isLogo);
            }
        }

        [TestCase(".jpg", true)]
        [TestCase(".png", true)]
        [TestCase(".gif", true)]
        [TestCase(".jpeg", true)]
        [TestCase(".xlsx", false)]
        [TestCase(".docx", false)]
        [TestCase("", false)]
        public void Can_ValidateExtension(string extension, bool expectedResult)
        {
            Assert.AreEqual(expectedResult, ImageHelper.ValidateExtension(extension));
        }

        #endregion

        #region private/protected functions

        protected override void InitiateTestingContext()
        {
            base.InitiateTestingContext();
        }

        #endregion
    }
}
