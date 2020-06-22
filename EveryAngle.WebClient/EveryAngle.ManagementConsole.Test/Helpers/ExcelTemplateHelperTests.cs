using EveryAngle.ManagementConsole.Helpers;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class ExcelTemplateHelperTests : UnitTestBase
    {
        #region tests
        [TestCase("SampleFile.xls", "SampleFile")]
        public void Can_Parse(string filename, string expectedName)
        {
            ExcelTemplateHelper excelTemplate = ExcelTemplateHelper.Parse(filename);
            Assert.AreEqual(expectedName, excelTemplate.Name);
        }

        [TestCase("SampleFile.xls", true)]
        [TestCase("",false)]
        [TestCase("Sample File.xls", false)]
        [TestCase(null,false)]
        public void Can_Check_IsValid(string fileName, bool expectedResult)
        {
            ExcelTemplateHelper excelTemplate = string.IsNullOrEmpty(fileName) ? new ExcelTemplateHelper() : ExcelTemplateHelper.Parse(fileName);
            Assert.AreEqual(expectedResult, excelTemplate.IsValid());
        }
        #endregion
    }
}
